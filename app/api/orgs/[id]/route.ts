import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import mongoose from "mongoose";

import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Org from "@/models/Org";
import Dentist from "@/models/Dentist";
import { orgSchema } from "@/lib/validators";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const { id } = await params;

    console.log("GET Org ID:", id);

    let org = null;

    // Try by MongoDB ObjectId first
    if (mongoose.Types.ObjectId.isValid(id)) {
      org = await Org.findById(id);
    }

    // If not found, try by slug
    if (!org) {
      org = await Org.findOne({ slug: id });
    }

    if (!org) {
      return NextResponse.json(
        { error: "Org not found" },
        { status: 404 }
      );
    }

    const dentists = await Dentist.find({
      orgId: org._id,
      active: true,
    }).lean();

    return NextResponse.json({
      org,
      dentists,
    });
  } catch (error) {
    console.error("GET ORG ERROR:", error);

    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    await connectDB();

    const { id } = await params;

    const parsed = orgSchema.partial().safeParse(await req.json());

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const org = await Org.findById(id);

    if (!org) {
      return NextResponse.json(
        { error: "Org not found" },
        { status: 404 }
      );
    }

    console.log("Session User:", session.user.id);
    console.log("Owner:", org.ownerId.toString());

    if (org.ownerId.toString() !== session.user.id) {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }

    Object.assign(org, parsed.data);

    await org.save();

    return NextResponse.json({
      message: "Organization updated successfully",
      org,
    });
  } catch (error) {
    console.error("PATCH ORG ERROR:", error);

    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}