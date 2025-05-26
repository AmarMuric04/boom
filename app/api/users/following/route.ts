import { type NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Follow from "@/models/Follow";
import { getUserFromRequest } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const userPayload = await getUserFromRequest(request);
    if (!userPayload) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get users that the current user is following
    const followingRelations = await Follow.find({
      follower: userPayload.userId,
    }).populate({
      path: "following",
      select:
        "username displayName bio avatar isVerified followers totalVideos lastActive",
    });

    // Format the response
    const followingUsers = followingRelations.map((relation) => {
      const user = relation.following as any;
      return {
        _id: user._id,
        username: user.username,
        displayName: user.displayName,
        bio: user.bio || "",
        avatar: user.avatar || "",
        isVerified: user.isVerified,
        followersCount: user.followers.length,
        totalVideos: user.totalVideos,
        lastActive: user.lastActive,
        followedAt: relation.createdAt,
      };
    });

    return NextResponse.json({ users: followingUsers });
  } catch (error) {
    console.error("Following users error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
