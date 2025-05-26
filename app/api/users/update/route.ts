import { type NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import { getUserFromRequest } from "@/lib/auth";

export async function PUT(request: NextRequest) {
  try {
    await dbConnect();

    // Verify authentication
    const currentUser = await getUserFromRequest(request);
    const body = await request.json();
    const {
      displayName,
      bio,
      location,
      website,
      avatar,
      coverImage,
      isPrivate,
      emailNotifications,
      pushNotifications,
      marketingEmails,
    } = body;

    // Update user
    const user = await User.findByIdAndUpdate(
      currentUser?.userId,
      {
        displayName,
        bio,
        location,
        website,
        avatar,
        coverImage,
        isPrivate,
        emailNotifications,
        pushNotifications,
        marketingEmails,
        updatedAt: new Date(),
      },
      { new: true }
    ).select("-password");

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      user,
    });
  } catch (error) {
    console.error("Update user error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
