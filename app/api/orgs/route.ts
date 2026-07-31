import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Org from "@/models/Org";

// Public: list approved orgs, with optional search.
// ?all=true additionally returns every status, but only for admin/superadmin —
// this route sits outside the /api/admin prefix so middleware won't gate it,
// hence the explicit session check here.
export async function GET(req: NextRequest) {
  await connectDB();
  const q = req.nextUrl.searchParams.get("q");
  const wantsAll = req.nextUrl.searchParams.get("all") === "true";

  const filter: Record<string, unknown> = {};

  if (wantsAll) {
    const session = await getServerSession(authOptions);
    if (!session || !["admin", "superadmin"].includes(session.user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  } else {
    filter.status = "approved";
  }

  if (q) {
    filter.name = { $regex: q, $options: "i" };
  }

  const orgs = await Org.find(filter).sort({ createdAt: -1 }).lean();
  return NextResponse.json({ orgs });
}