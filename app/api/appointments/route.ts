import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Appointment from "@/models/Appointment";
import mongoose from "mongoose";
import User from "@/models/User";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { dentistId, orgId, date, time } = body as {
    dentistId: string;
    orgId: string;
    date: string;
    time: string;
  };

  await connectDB();

  try {
    const bookingDate = new Date(date);
    bookingDate.setUTCHours(0, 0, 0, 0);

    const appointment = await Appointment.create({
      userId: session.user.id,
      orgId,
      dentistId,
      date: bookingDate,
      time,
      status: "pending",
    });
    return NextResponse.json({ appointment }, { status: 201 });
  } catch (err: any) {
    if (err.code === 11000) {
      return NextResponse.json(
        { error: "That slot was just booked. Pick another." },
        { status: 409 },
      );
    }
    return NextResponse.json({ error: "Booking failed" }, { status: 500 });
  }
}


export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const userId = new mongoose.Types.ObjectId(session.user.id);
    const currentUser = await User.findById(userId).lean();

    let query: Record<string, unknown> = {};

    // 2. Check if user is an Organization Admin or Staff
    if (currentUser?.orgId) {
      // Organization view: return all appointments for this clinic
      query = { orgId: currentUser.orgId };
    } else {
      // Patient view: return appointments booked by this user
      query = { userId };
    }

    // 3. Perform populates
    const appointments = await Appointment.find(query)
      .populate("userId", "name email")
      .populate("dentistId", "name")
      .populate("orgId", "name slug")
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ appointments });
  } catch (error) {
    console.error("Error fetching appointments:", error);
    return NextResponse.json(
      { error: "Failed to fetch appointments" },
      { status: 500 }
    );
  }
}