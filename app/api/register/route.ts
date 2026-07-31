import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import Org from "@/models/Org";
import PlatformConfig from "@/models/PlatformConfig";
import { registerSchema } from "@/lib/validators";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = registerSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { name, email, password, role } = parsed.data;

  await connectDB();

  const existing = await User.findOne({ email });
  if (existing) {
    return NextResponse.json({ error: "Email already in use" }, { status: 409 });
  }

  const hashed = await bcrypt.hash(password, 10);

  const user = await User.create({
    name,
    email,
    password: hashed,
    role,
    status: role === "org" ? "pending" : "active",
  });

  // org accounts also need an Org profile shell.
  // Its initial status depends on the platform's requireOrgApproval setting.
  if (role === "org") {
    const config = await PlatformConfig.findOneAndUpdate(
      {},
      {},
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    const slug = name.toLowerCase().trim().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
    const autoApprove = !config.requireOrgApproval;

    const org = await Org.create({
      ownerId: user._id,
      name,
      slug: `${slug}-${user._id.toString().slice(-5)}`,
      status: autoApprove ? "approved" : "pending",
      verified: autoApprove,
    });
    user.orgId = org._id;
    if (autoApprove) user.status = "active";
    await user.save();
  }

  return NextResponse.json({ message: "Account created" }, { status: 201 });
}
