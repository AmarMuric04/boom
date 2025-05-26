import { NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"
import User from "@/models/User"
import Video from "@/models/Video"

export async function GET() {
  try {
    await dbConnect()

    // Test database connection
    const userCount = await User.countDocuments()
    const videoCount = await Video.countDocuments()

    // Get sample data
    const sampleUsers = await User.find().limit(3).select("-password")
    const sampleVideos = await Video.find().limit(3).populate("creator", "username displayName")

    return NextResponse.json({
      success: true,
      message: "Database connection successful",
      stats: {
        totalUsers: userCount,
        totalVideos: videoCount,
      },
      samples: {
        users: sampleUsers,
        videos: sampleVideos,
      },
    })
  } catch (error) {
    console.error("Database test error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 },
    )
  }
}
