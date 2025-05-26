import { type NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import Video from "@/models/Video";
import Comment from "@/models/Comment";
import Follow from "@/models/Follow";
import Gift from "@/models/Gift";
import { getUserFromRequest } from "@/lib/auth";

export async function DELETE(request: NextRequest) {
  try {
    await dbConnect();

    // Verify authentication
    const currentUser = await getUserFromRequest(request);
    const userId = currentUser?.userId;

    // Delete user's data in order
    await Promise.all([
      // Delete user's videos
      Video.deleteMany({ creator: userId }),
      // Delete user's comments
      Comment.deleteMany({ user: userId }),
      // Delete follow relationships
      Follow.deleteMany({ $or: [{ follower: userId }, { following: userId }] }),
      // Delete gifts sent/received
      Gift.deleteMany({ $or: [{ sender: userId }, { recipient: userId }] }),
    ]);

    // Finally delete the user
    await User.findByIdAndDelete(userId);

    // Clear the auth cookie
    const response = NextResponse.json({
      success: true,
      message: "Account deleted successfully",
    });

    response.cookies.set("auth-token", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      expires: new Date(0),
    });

    return response;
  } catch (error) {
    console.error("Delete account error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
