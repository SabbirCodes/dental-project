import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Org from "@/models/Org";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const { action } = (await req.json()) as { action: "approve" | "reject" | "suspend" };
  const statusMap = { approve: "approved", reject: "rejected", suspend: "suspended" } as const;

  await connectDB();
  const org = await Org.findByIdAndUpdate(
    id,
    { status: statusMap[action], verified: action === "approve" },
    { new: true }
  );

  if (!org) return NextResponse.json({ error: "Org not found" }, { status: 404 });

  return NextResponse.json({ org });
}