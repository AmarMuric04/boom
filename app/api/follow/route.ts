import { type NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Follow from "@/models/Follow";
import { getUserFromRequest } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const userPayload = await getUserFromRequest(request);
    if (!userPayload) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { targetUserId } = await request.json();

    console.log(targetUserId);

    if (!targetUserId) {
      return NextResponse.json(
        { error: "Target user ID is required" },
        { status: 400 }
      );
    }

    if (userPayload.userId === targetUserId) {
      return NextResponse.json(
        { error: "Cannot follow yourself" },
        { status: 400 }
      );
    }

    // Check if already following
    const existingFollow = await Follow.findOne({
      follower: userPayload.userId,
      following: targetUserId,
    });

    if (existingFollow) {
      return NextResponse.json(
        { error: "Already following this user" },
        { status: 400 }
      );
    }

    // Create follow relationship
    const follow = new Follow({
      follower: userPayload.userId,
      following: targetUserId,
    });

    await follow.save();

    return NextResponse.json({ message: "Successfully followed user" });
  } catch (error) {
    console.error("Follow error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await dbConnect();

    const userPayload = await getUserFromRequest(request);
    if (!userPayload) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const targetUserId = request.nextUrl.searchParams.get("targetUserId");

    if (!targetUserId) {
      return NextResponse.json(
        { error: "Target user ID is required" },
        { status: 400 }
      );
    }

    const follow = await Follow.findOne({
      follower: userPayload.userId,
      following: targetUserId,
    });

    if (!follow) {
      return NextResponse.json(
        { error: "Not following this user" },
        { status: 400 }
      );
    }

    await follow.deleteOne();

    return NextResponse.json({ message: "Successfully unfollowed user" });
  } catch (error) {
    console.error("Unfollow error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
