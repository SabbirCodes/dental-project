import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import PlatformConfig from "@/models/PlatformConfig";
import { platformConfigSchema } from "@/lib/validators";

// Superadmin only — path is under /api/superadmin, so middleware.ts
// already confirmed the caller's role before either handler runs.

// GET: fetch the singleton config, creating it with defaults on first read.
export async function GET() {
  await connectDB();

  const config = await PlatformConfig.findOneAndUpdate(
    {},
    {},
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  return NextResponse.json({ config });
}

// PATCH: update any subset of fields on the singleton config.
export async function PATCH(req: NextRequest) {
  const parsed = platformConfigSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  await connectDB();

  const config = await PlatformConfig.findOneAndUpdate(
    {},
    { $set: parsed.data },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  return NextResponse.json({ config });
}
