import { type NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import Video from "@/models/Video";
import { getUserFromRequest } from "@/lib/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: { username: string } }
) {
  try {
    await dbConnect();

    const currentUser = await getUserFromRequest(request);
    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { username } = params;

    const user = await User.findOne({ username: username.toLowerCase() })
      .select("-password")
      .populate("followers", "username displayName avatar")
      .populate("following", "username displayName avatar");

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get user's videos
    const videos = await Video.find({ creator: user._id, isActive: true })
      .sort({ uploadDate: -1 })
      .limit(20)
      .select("title thumbnail views likes duration uploadDate type");

    console.log("User profile data:", user);
    const userData = {
      id: user._id,
      username: user.username,
      email: user.email,
      totalEarnings: user.totalEarnings,
      displayName: user.displayName,
      isFollowedByCurrentUser: user.followers.some((follower) => {
        return follower._id.toString() === currentUser.userId;
      }),
      bio: user.bio,
      avatar: user.avatar,
      coverImage: user.coverImage,
      location: user.location,
      website: user.website,
      isVerified: user.isVerified,
      followers: user.followers,
      following: user.following,
      totalVideos: user.totalVideos,
      totalViews: user.totalViews,
      joinDate: user.joinDate,
      videos: videos.map((video) => ({
        id: video._id,
        title: video.title,
        thumbnail: video.thumbnail,
        views: video.views,
        likes: video.likes.length,
        duration: video.duration,
        uploadDate: video.uploadDate,
        type: video.type,
      })),
    };

    return NextResponse.json({ user: userData });
  } catch (error) {
    console.error("Get user profile error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
