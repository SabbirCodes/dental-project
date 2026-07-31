import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Dentist from "@/models/Dentist";
import Org from "@/models/Org";
import { dentistSchema } from "@/lib/validators";

// Public: single dentist profile.
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  await connectDB();

  const dentist = await Dentist.findById(id).populate("orgId", "name slug");

  if (!dentist) {
    return NextResponse.json({ error: "Dentist not found" }, { status: 404 });
  }

  return NextResponse.json({ dentist });
}

// Org-only: edit a dentist that belongs to the caller's org.
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const parsed = dentistSchema.partial().safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  await connectDB();
  const dentist = await Dentist.findById(id);
  if (!dentist) return NextResponse.json({ error: "Dentist not found" }, { status: 404 });

  const org = await Org.findOne({ ownerId: session.user.id });
  if (!org || dentist.orgId.toString() !== org._id.toString()) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  Object.assign(dentist, parsed.data);
  await dentist.save();
  return NextResponse.json({ dentist });
}

// Org-only: deactivate (soft-delete) a dentist under the caller's org.
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  await connectDB();
  const dentist = await Dentist.findById(id);
  if (!dentist) return NextResponse.json({ error: "Dentist not found" }, { status: 404 });

  const org = await Org.findOne({ ownerId: session.user.id });
  if (!org || dentist.orgId.toString() !== org._id.toString()) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  dentist.active = false;
  await dentist.save();
  return NextResponse.json({ message: "Dentist deactivated" });
}