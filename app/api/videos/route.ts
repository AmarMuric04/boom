import { type NextRequest, NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"
import Video from "@/models/Video"
import { getUserFromRequest } from "@/lib/auth"

// Get videos for feed
export async function GET(request: NextRequest) {
  try {
    await dbConnect()

    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const type = searchParams.get("type") // 'short-form' or 'long-form'

    const skip = (page - 1) * limit

    // Build query
    const query: any = { isActive: true }
    if (type) {
      query.type = type
    }

    const videos = await Video.find(query)
      .populate("creator", "username displayName avatar isVerified")
      .sort({ uploadDate: -1 })
      .skip(skip)
      .limit(limit)
      .lean()

    const formattedVideos = videos.map((video) => ({
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
      comments: video.comments.length,
      uploadDate: video.uploadDate,
    }))

    return NextResponse.json({ videos: formattedVideos })
  } catch (error) {
    console.error("Get videos error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// Create new video
export async function POST(request: NextRequest) {
  try {
    await dbConnect()

    const userPayload = await getUserFromRequest(request)
    if (!userPayload) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { title, description, type, videoUrl, videoFile, thumbnail, duration, price, tags } = await request.json()

    // Validation
    if (!title || !description || !type) {
      return NextResponse.json({ error: "Title, description, and type are required" }, { status: 400 })
    }

    if (type === "short-form" && !videoFile && !videoUrl) {
      return NextResponse.json({ error: "Video file or URL is required for short-form content" }, { status: 400 })
    }

    if (type === "long-form" && !videoUrl) {
      return NextResponse.json({ error: "Video URL is required for long-form content" }, { status: 400 })
    }

    // Create video
    const video = new Video({
      title,
      description,
      creator: userPayload.userId,
      type,
      videoUrl: videoUrl || "",
      videoFile: videoFile || "",
      thumbnail: thumbnail || "",
      duration: duration || "",
      price: price || 0,
      isPremium: (price || 0) > 0,
      tags: tags || [],
    })

    await video.save()

    // Populate creator info for response
    await video.populate("creator", "username displayName avatar isVerified")

    return NextResponse.json(
      {
        message: "Video uploaded successfully",
        video: {
          id: video._id,
          title: video.title,
          description: video.description,
          creator: video.creator,
          type: video.type,
          videoUrl: video.videoUrl,
          thumbnail: video.thumbnail,
          duration: video.duration,
          price: video.price,
          uploadDate: video.uploadDate,
        },
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Create video error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
