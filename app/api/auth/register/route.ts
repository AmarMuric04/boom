import { type NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import { generateToken } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const { username, email, password, displayName } = await request.json();

    if (!username || !email || !password || !displayName) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }],
    });

    if (existingUser) {
      return NextResponse.json(
        {
          error:
            existingUser.email === email
              ? "Email already exists"
              : "Username already exists",
        },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const user = new User({
      username,
      email,
      password: hashedPassword,
      displayName,
      joinDate: new Date(),
      lastActive: new Date(),
    });

    await user.save();

    // Generate JWT token
    const token = generateToken({
      userId: user._id.toString(),
      email: user.email,
      username: user.username,
    });

    // Prepare user data (exclude password)
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
    };

    // Create response
    const response = NextResponse.json({
      message: "Registration successful",
      user: userData,
    });

    // Set HTTP-only cookie with proper options
    response.cookies.set("auth-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
  