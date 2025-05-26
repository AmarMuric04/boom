import { type NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Video from "@/models/Video";
import User from "@/models/User";
import Gift from "@/models/Gift";
import { getUserFromRequest } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const userPayload = await getUserFromRequest(request);
    if (!userPayload) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await User.findById(userPayload.userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get user's videos
    const videos = await Video.find({
      creator: userPayload.userId,
      isActive: true,
    });

    // Calculate stats
    const totalVideos = videos.length;
    const totalViews = videos.reduce((sum, video) => sum + video.views, 0);
    const totalLikes = videos.reduce(
      (sum, video) => sum + video.likes.length,
      0
    );
    const totalComments = videos.reduce(
      (sum, video) => sum + video.comments.length,
      0
    );

    // Get recent gifts received
    const recentGifts = await Gift.find({ recipient: userPayload.userId })
      .populate("sender", "username displayName avatar")
      .sort({ createdAt: -1 })
      .limit(10);

    // Get top performing videos
    const topVideos = videos
      .sort((a, b) => b.views - a.views)
      .slice(0, 5)
      .map((video) => ({
        id: video._id,
        title: video.title,
        views: video.views,
        likes: video.likes.length,
        earnings: video.earnings,
        uploadDate: video.uploadDate,
      }));

    const stats = {
      user: {
        username: user.username,
        displayName: user.displayName,
        wallet: user.wallet,
        followers: user.followers.length,
        following: user.following.length,
        totalEarnings: user.totalEarnings,
        joinDate: user.joinDate,
      },
      content: {
        totalVideos,
        totalViews,
        totalLikes,
        totalComments,
      },
      topVideos,
      recentGifts: recentGifts.map((gift) => ({
        id: gift._id,
        amount: gift.amount,
        message: gift.message,
        sender: gift.sender,
        createdAt: gift.createdAt,
      })),
    };

    return NextResponse.json({ stats });
  } catch (error) {
    console.error("Get dashboard stats error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
