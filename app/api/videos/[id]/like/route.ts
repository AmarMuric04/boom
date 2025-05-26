import { type NextRequest, NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"
import Video from "@/models/Video"
import { getUserFromRequest } from "@/lib/auth"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await dbConnect()

    const userPayload = await getUserFromRequest(request)
    if (!userPayload) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = params

    const video = await Video.findById(id)
    if (!video) {
      return NextResponse.json({ error: "Video not found" }, { status: 404 })
    }

    const userId = userPayload.userId
    const isLiked = video.likes.includes(userId as any)

    if (isLiked) {
      // Unlike
      video.likes = video.likes.filter((like) => like.toString() !== userId)
    } else {
      // Like
      video.likes.push(userId as any)
    }

    await video.save()

    return NextResponse.json({
      message: isLiked ? "Video unliked" : "Video liked",
      isLiked: !isLiked,
      likesCount: video.likes.length,
    })
  } catch (error) {
    console.error("Like video error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
