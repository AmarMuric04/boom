import { type NextRequest, NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"
import User from "@/models/User"
import { getUserFromRequest } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    await dbConnect()

    const userPayload = await getUserFromRequest(request)

    if (!userPayload) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await User.findById(userPayload.userId).select("-password")

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const userData = {
      id: user._id,
      username: user.username,
      email: user.email,
      displayName: user.displayName,
      bio: user.bio,
      avatar: user.avatar,
      coverImage: user.coverImage,
      location: user.location,
      website: user.website,
      isVerified: user.isVerified,
      wallet: user.wallet,
      followers: user.followers.length,
      following: user.following.length,
      totalVideos: user.totalVideos,
      totalViews: user.totalViews,
      totalEarnings: user.totalEarnings,
      joinDate: user.joinDate,
      lastActive: user.lastActive,
    }

    return NextResponse.json({ user: userData })
  } catch (error) {
    console.error("Get user error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
