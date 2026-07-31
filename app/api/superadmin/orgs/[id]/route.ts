import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import Org from "@/models/Org";
import Dentist from "@/models/Dentist";
import Appointment from "@/models/Appointment";
import User from "@/models/User";

// Superadmin only — path is under /api/superadmin, so middleware.ts already
// confirmed the caller's role before this handler runs.
//
// Deleting an org cascades: its dentists and appointments are removed too
// (an org with no dentists left behind is more confusing than a clean cut),
// and the owning user is demoted back to a plain "user" with no orgId
// rather than being left stuck with role "org" and nothing to manage.
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json({ error: "Invalid org id" }, { status: 400 });
  }

  await connectDB();

  const org = await Org.findById(id);
  if (!org) return NextResponse.json({ error: "Org not found" }, { status: 404 });

  const [{ deletedCount: dentistsDeleted }, { deletedCount: appointmentsDeleted }] =
    await Promise.all([
      Dentist.deleteMany({ orgId: org._id }),
      Appointment.deleteMany({ orgId: org._id }),
    ]);

  await User.findOneAndUpdate(
    { _id: org.ownerId },
    { role: "user", status: "active", $unset: { orgId: "" } }
  );

  await org.deleteOne();

  return NextResponse.json({
    message: "Org deleted",
    cascaded: { dentistsDeleted, appointmentsDeleted },
  });
}
