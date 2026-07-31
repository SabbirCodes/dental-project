import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/models/User";

// Admin/superadmin only — path is under /api/admin, so middleware.ts
// already confirmed the caller's role before this handler runs.
export async function GET() {
  await connectDB();
  const users = await User.find().select("name email role status").sort({ createdAt: -1 }).lean();
  return NextResponse.json({ users });
}
