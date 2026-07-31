import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Review from "@/models/Review";
import Appointment from "@/models/Appointment";
import Dentist from "@/models/Dentist";
import { createReviewSchema } from "@/lib/validators";


// Recompute and persist a dentist's average rating from all their reviews.
// Simple and always-consistent, at the cost of an extra query per submission —
// fine at this scale; switch to an incremental running average if review
// volume ever gets large enough for it to matter.
async function recalculateDentistRating(dentistId: string) {
  const reviews = await Review.find({ dentistId }).select("rating");
  const avg = reviews.length
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 0;
  await Dentist.findByIdAndUpdate(dentistId, { rating: avg });
}

// Any logged-in patient: rate a dentist, but only for their own
// appointment, and only once it's marked completed.
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = createReviewSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const { appointmentId, rating, comment } = parsed.data;

  await connectDB();

  const appointment = await Appointment.findById(appointmentId);
  if (!appointment) {
    return NextResponse.json({ error: "Appointment not found" }, { status: 404 });
  }
  if (appointment.userId.toString() !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  if (appointment.status !== "completed") {
    return NextResponse.json(
      { error: "You can only rate a dentist after a completed appointment" },
      { status: 400 }
    );
  }

  try {
    const review = await Review.create({
      userId: session.user.id,
      dentistId: appointment.dentistId,
      orgId: appointment.orgId,
      appointmentId: appointment._id,
      rating,
      comment,
    });

    await recalculateDentistRating(appointment.dentistId.toString());
    appointment.reviewed = true;
    await appointment.save();

    return NextResponse.json({ review }, { status: 201 });
  } catch (err: any) {
    if (err?.code === 11000) {
      return NextResponse.json(
        { error: "You've already reviewed this appointment" },
        { status: 409 }
      );
    }
    return NextResponse.json({ error: "Failed to submit review" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const dentistId = req.nextUrl.searchParams.get("dentistId");
  if (!dentistId) {
    return NextResponse.json({ error: "dentistId query param required" }, { status: 400 });
  }

  await connectDB();
  const reviews = await Review.find({ dentistId })
    .populate("userId", "name")
    .sort({ createdAt: -1 })
    .lean();

  return NextResponse.json({ reviews });
}
