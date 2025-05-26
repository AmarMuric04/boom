import { type NextRequest, NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"
import Video from "@/models/Video"
import Comment from "@/models/Comment"
import { getUserFromRequest } from "@/lib/auth"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await dbConnect()

    const userPayload = await getUserFromRequest(request)
    if (!userPayload) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = params
    const { content } = await request.json()

    if (!content || content.trim().length === 0) {
      return NextResponse.json({ error: "Comment content is required" }, { status: 400 })
    }

    const video = await Video.findById(id)
    if (!video) {
      return NextResponse.json({ error: "Video not found" }, { status: 404 })
    }

    // Create comment
    const comment = new Comment({
      content: content.trim(),
      author: userPayload.userId,
      video: id,
    })

    await comment.save()

    // Add comment to video
    video.comments.push(comment._id as any)
    await video.save()

    // Populate author info
    await comment.populate("author", "username displayName avatar")

    return NextResponse.json(
      {
        message: "Comment added successfully",
        comment: {
          id: comment._id,
          content: comment.content,
          author: comment.author,
          createdAt: comment.createdAt,
        },
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Add comment error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
