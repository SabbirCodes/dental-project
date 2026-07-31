import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Appointment from "@/models/Appointment";
import Org from "@/models/Org";
import PlatformConfig from "@/models/PlatformConfig";

type RouteParams = {
  params: Promise<{ id: string }>;
};

// GET a single appointment (owner user or the owning org can view)
export async function GET(req: NextRequest, { params }: RouteParams) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 1. Await params for Next.js 15 compatibility
  const { id } = await params;

  await connectDB();
  const appointment = await Appointment.findById(id)
    .populate("dentistId", "name photo")
    .populate("orgId", "name slug");

  if (!appointment) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const isOwner = appointment.userId.toString() === session.user.id;
  const org =
    session.user.role === "org"
      ? await Org.findOne({ ownerId: session.user.id })
      : null;

  // Extract raw ID string whether orgId is populated object or raw ObjectId
  const appointmentOrgId =
    typeof appointment.orgId === "object" && appointment.orgId !== null
      ? (appointment.orgId as { _id?: { toString(): string } })._id?.toString() ??
        appointment.orgId.toString()
      : String(appointment.orgId);

  const isOrgOwner = org && appointmentOrgId === org._id.toString();

  if (!isOwner && !isOrgOwner) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return NextResponse.json({ appointment });
}

// PATCH: user cancels their own booking, or org confirms/rejects/completes one
export async function PATCH(req: NextRequest, { params }: RouteParams) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 1. Await params for Next.js 15 compatibility
  const { id } = await params;

  const { status, cancelReason } = (await req.json()) as {
    status: "confirmed" | "cancelled" | "completed" | "no-show";
    cancelReason?: string;
  };

  await connectDB();
  const appointment = await Appointment.findById(id);
  if (!appointment) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const isOwner = appointment.userId.toString() === session.user.id;

  // Check if current user owns the organization associated with this appointment
  const org =
    session.user.role === "org"
      ? await Org.findOne({ ownerId: session.user.id })
      : null;

  const isOrgOwner =
    org && appointment.orgId.toString() === org._id.toString();

  if (isOwner && status === "cancelled") {
    const config = await PlatformConfig.findOneAndUpdate(
      {},
      {},
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    const appointmentDateTime = new Date(appointment.date);
    const [hours, minutes] = (appointment.time ?? "00:00").split(":").map(Number);
    appointmentDateTime.setHours(hours, minutes, 0, 0);

    const cancellationWindow = config?.cancellationWindowHours ?? 24;
    const hoursUntilAppointment =
      (appointmentDateTime.getTime() - Date.now()) / (1000 * 60 * 60);

    if (hoursUntilAppointment < cancellationWindow) {
      return NextResponse.json(
        {
          error: `Appointments can only be cancelled at least ${cancellationWindow} hour(s) in advance.`,
        },
        { status: 400 }
      );
    }

    appointment.status = "cancelled";
    appointment.cancelReason = cancelReason;
  } else if (isOrgOwner) {
    appointment.status = status;
    if (status === "cancelled") appointment.cancelReason = cancelReason;
  } else {
    return NextResponse.json(
      { error: "Forbidden: You do not have permission to update this appointment" },
      { status: 403 }
    );
  }

  await appointment.save();
  return NextResponse.json({ appointment });
}