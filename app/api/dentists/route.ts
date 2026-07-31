import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Dentist from "@/models/Dentist";
import Org from "@/models/Org";
import { dentistSchema } from "@/lib/validators";

// Org-only: create a dentist under the caller's own org.
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = dentistSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  await connectDB();
  const org = await Org.findOne({ ownerId: session.user.id });
  if (!org) return NextResponse.json({ error: "Org not found for this account" }, { status: 404 });

  const dentist = await Dentist.create({ ...parsed.data, orgId: org._id });
  return NextResponse.json({ dentist }, { status: 201 });
}

// Org-only: list dentists belonging to the caller's org (for the org dashboard).
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  const org = await Org.findOne({ ownerId: session.user.id });
  if (!org) return NextResponse.json({ dentists: [] });

  const dentists = await Dentist.find({ orgId: org._id }).sort({ createdAt: -1 }).lean();
  return NextResponse.json({ dentists });
}
