import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Dentist from "@/models/Dentist";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await connectDB();

    const dentist = await Dentist.findById(id).lean();
    if (!dentist || !dentist.active) {
      return NextResponse.json({ error: "Dentist not found" }, { status: 404 });
    }

    const availableDays = (dentist.availability ?? []).map((a: { day: string }) =>
      a.day.toLowerCase().trim()
    );

    const upcomingDates = [];
    const today = new Date();

    // Look ahead 30 days
    for (let i = 0; i < 30; i++) {
      const target = new Date();
      target.setDate(today.getDate() + i);

      const dayName = target
        .toLocaleDateString("en-US", { weekday: "long" })
        .toLowerCase();

      if (availableDays.includes(dayName)) {
        const yyyy = target.getFullYear();
        const mm = String(target.getMonth() + 1).padStart(2, "0");
        const dd = String(target.getDate()).padStart(2, "0");
        const isoDate = `${yyyy}-${mm}-${dd}`;

        const label = target.toLocaleDateString("en-US", {
          weekday: "short",
          month: "short",
          day: "numeric",
        });

        upcomingDates.push({ isoDate, label });
      }
    }

    return NextResponse.json({ upcomingDates });
  } catch (error) {
    console.error("Error generating schedule:", error);
    return NextResponse.json({ error: "Failed to load schedule" }, { status: 500 });
  }
}