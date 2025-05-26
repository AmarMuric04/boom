import { type NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import Purchase from "@/models/Purchase";
import Gift from "@/models/Gift";
import { getUserFromRequest } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const userPayload = await getUserFromRequest(request);
    if (!userPayload) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await User.findById(userPayload.userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get recent purchases
    const purchases = await Purchase.find({ user: user._id })
      .populate("video", "title thumbnail price")
      .sort({ createdAt: -1 })
      .limit(10);

    // Get recent gifts sent
    const giftsSent = await Gift.find({ sender: user._id })
      .populate("recipient", "username displayName avatar")
      .populate("video", "title thumbnail")
      .sort({ createdAt: -1 })
      .limit(5);

    // Get recent gifts received
    const giftsReceived = await Gift.find({ recipient: user._id })
      .populate("sender", "username displayName avatar")
      .populate("video", "title thumbnail")
      .sort({ createdAt: -1 })
      .limit(5);

    return NextResponse.json({
      wallet: {
        balance: user.wallet,
        totalEarnings: user.totalEarnings,
      },
      purchases,
      giftsSent,
      giftsReceived,
    });
  } catch (error) {
    console.error("Get wallet error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Top up wallet (simulated)
export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const userPayload = await getUserFromRequest(request);
    if (!userPayload) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { amount } = await request.json();

    if (!amount || amount <= 0 || amount > 10000) {
      return NextResponse.json(
        { error: "Invalid amount. Must be between ₹1 and ₹10,000" },
        { status: 400 }
      );
    }

    const user = await User.findById(userPayload.userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Add to wallet
    user.wallet += amount;
    await user.save();

    return NextResponse.json({
      message: `Successfully added ₹${amount} to your wallet`,
      newBalance: user.wallet,
    });
  } catch (error) {
    console.error("Top up wallet error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
