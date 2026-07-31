import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Dentist from "@/models/Dentist";
import Appointment from "@/models/Appointment";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(req.url);
    const dateStr = searchParams.get("date"); // e.g., "2026-08-02"

    if (!dateStr) {
      return NextResponse.json({ error: "Date parameter is required" }, { status: 400 });
    }

    await connectDB();

    const dentist = await Dentist.findById(id).lean();
    if (!dentist || !dentist.active) {
      return NextResponse.json({ error: "Dentist not found or inactive" }, { status: 404 });
    }

    // Parse YYYY-MM-DD explicitly in UTC to prevent timezone rollback
    const [year, month, day] = dateStr.split("-").map(Number);
    const utcDate = new Date(Date.UTC(year, month - 1, day));

    // Get day name (e.g. "sunday")
    const dayName = utcDate
      .toLocaleDateString("en-US", { weekday: "long", timeZone: "UTC" })
      .toLowerCase()
      .trim();

    const cleanDateStr = dateStr.toLowerCase().trim();

    // Match against DB availability
    const match = (dentist.availability ?? []).find((a: { day: string; slots: string[] }) => {
      const dbDay = (a.day || "").toString().toLowerCase().trim();
      return dbDay === dayName || dbDay === cleanDateStr;
    });

    const configuredSlots: string[] = match?.slots ?? [];

    if (configuredSlots.length === 0) {
      return NextResponse.json({ slots: [] });
    }

    // Check booked appointments on that specific UTC date
    const startOfDay = new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0));
    const endOfDay = new Date(Date.UTC(year, month - 1, day, 23, 59, 59, 999));

    const bookedAppointments = await Appointment.find({
      dentistId: id,
      date: { $gte: startOfDay, $lte: endOfDay },
      status: { $in: ["pending", "confirmed"] },
    }).select("time");

    const bookedTimeSlots = new Set(bookedAppointments.map((app) => app.time));

    // Exclude already booked slots
    const availableSlots = configuredSlots.filter((slot) => !bookedTimeSlots.has(slot));

    return NextResponse.json({ slots: availableSlots });
  } catch (error) {
    console.error("Error fetching slots:", error);
    return NextResponse.json({ error: "Failed to fetch slots" }, { status: 500 });
  }
}