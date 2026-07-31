import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/models/User";

// Superadmin only — path is under /api/superadmin, so middleware.ts
// already confirmed the caller's role before this handler runs.
// Returns everyone who is currently an admin, plus regular users who
// are eligible to be promoted.
export async function GET() {
  await connectDB();
  const users = await User.find({ role: { $in: ["user", "admin"] } })
    .select("name email role status")
    .sort({ role: -1, createdAt: -1 })
    .lean();

  return NextResponse.json({ users });
}