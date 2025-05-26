import { type NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);

    if (!user) {
      return NextResponse.json({ valid: false }, { status: 401 });
    }

    return NextResponse.json({
      valid: true,
      user: {
        id: user.userId,
        email: user.email,
        username: user.username,
      },
    });
  } catch (error) {
    console.error("Session validation error:", error);
    return NextResponse.json({ valid: false }, { status: 500 });
  }
}
