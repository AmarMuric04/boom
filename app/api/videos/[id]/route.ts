import { type NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Video from "@/models/Video";
import "@/models/Comment";

// Get single video
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();

    const { id } = await params;

    const video = await Video.findById(id)
      .populate("creator", "username displayName avatar isVerified")
      .populate({
        path: "comments",
        populate: {
          path: "author",
          select: "username displayName avatar",
        },
        options: { sort: { createdAt: -1 }, limit: 50 },
      });

    console.log(video);

    if (!video) {
      return NextResponse.json({ error: "Video not found" }, { status: 404 });
    }

    // Increment view count
    video.views += 1;
    await video.save();

    // Update creator's total views
    await video.populate("creator");
    const creator = video.creator as any;
    creator.totalViews += 1;
    await creator.save();

    const videoData = {
      id: video._id,
      title: video.title,
      description: video.description,
      creator: video.creator,
      type: video.type,
      videoUrl: video.videoUrl,
      thumbnail: video.thumbnail,
      duration: video.duration,
      price: video.price,
      isPremium: video.isPremium,
      views: video.views,
      likes: video.likes.length,
      comments: video.comments,
      uploadDate: video.uploadDate,
    };

    return NextResponse.json({ video: videoData });
  } catch (error) {
    console.error("Get video error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
