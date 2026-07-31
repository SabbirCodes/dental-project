import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import User from "@/models/User";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json({ error: "Invalid user id" }, { status: 400 });
  }

  const { action } = (await req.json()) as { action: "promote" | "demote" };

  await connectDB();
  const user = await User.findById(id);
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  // never touch superadmin accounts through this endpoint
  if (user.role === "superadmin") {
    return NextResponse.json({ error: "Cannot modify a superadmin account" }, { status: 400 });
  }

  user.role = action === "promote" ? "admin" : "user";
  await user.save();

  return NextResponse.json({ user });
}