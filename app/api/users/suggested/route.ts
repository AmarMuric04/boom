import { type NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import Follow from "@/models/Follow";
import { getUserFromRequest } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const userPayload = await getUserFromRequest(request);
    if (!userPayload) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get users that the current user is already following
    const following = await Follow.find({
      follower: userPayload.userId,
    }).select("following");
    const followingIds = following.map((f) => f.following.toString());

    // Get suggested users (exclude current user and already following)
    const suggestedUsers = await User.find({
      _id: {
        $nin: [...followingIds, userPayload.userId],
      },
      isActive: true,
    })
      .select(
        "username displayName bio avatar isVerified followers totalVideos totalViews"
      )
      .sort({ followers: -1, totalViews: -1 })
      .limit(20);

    // Format the response
    const formattedUsers = suggestedUsers.map((user) => ({
      _id: user._id,
      username: user.username,
      displayName: user.displayName,
      bio: user.bio || "",
      avatar: user.avatar || "",
      isVerified: user.isVerified,
      followersCount: user.followers.length,
      totalVideos: user.totalVideos,
      totalViews: user.totalViews,
    }));

    return NextResponse.json({ users: formattedUsers });
  } catch (error) {
    console.error("Suggested users error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
