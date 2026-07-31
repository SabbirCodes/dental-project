import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import Org from "@/models/Org";
import Dentist from "@/models/Dentist";
import Appointment from "@/models/Appointment";

// Superadmin only — path is under /api/superadmin, so middleware.ts already
// confirmed the caller's role before this handler runs.
//
// Deleting an "org"-role user cascades to their Org (and that Org's
// dentists/appointments) via the same logic as the direct org-delete route,
// so an org never gets orphaned from its owner being removed.
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json({ error: "Invalid user id" }, { status: 400 });
  }

  await connectDB();

  const user = await User.findById(id);
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  if (user.role === "superadmin") {
    return NextResponse.json({ error: "Cannot delete a superadmin account" }, { status: 400 });
  }

  let cascaded: { dentistsDeleted: number; appointmentsDeleted: number; orgDeleted: boolean } = {
    dentistsDeleted: 0,
    appointmentsDeleted: 0,
    orgDeleted: false,
  };

  if (user.role === "org") {
    const org = await Org.findOne({ ownerId: user._id });
    if (org) {
      const [{ deletedCount: dentistsDeleted }, { deletedCount: appointmentsDeleted }] =
        await Promise.all([
          Dentist.deleteMany({ orgId: org._id }),
          Appointment.deleteMany({ orgId: org._id }),
        ]);
      await org.deleteOne();
      cascaded = { dentistsDeleted, appointmentsDeleted, orgDeleted: true };
    }
  }

  // patients (role "user") may have appointments; leave those records intact
  // for the org's history, appointment.userId will just no longer resolve.
  await user.deleteOne();

  return NextResponse.json({ message: "User deleted", cascaded });
}
