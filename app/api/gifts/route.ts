import { type NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Gift from "@/models/Gift";
import User from "@/models/User";
import { getUserFromRequest } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const userPayload = await getUserFromRequest(request);
    if (!userPayload) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { recipientId, videoId, amount, message } = await request.json();

    if (!recipientId || !amount || amount <= 0) {
      return NextResponse.json(
        { error: "Recipient and valid amount are required" },
        { status: 400 }
      );
    }

    const sender = await User.findById(userPayload.userId);
    const recipient = await User.findById(recipientId);

    if (!sender || !recipient) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (sender._id.toString() === recipient._id.toString()) {
      return NextResponse.json(
        { error: "Cannot send gift to yourself" },
        { status: 400 }
      );
    }

    // Check wallet balance
    if (sender.wallet < amount) {
      return NextResponse.json(
        {
          error: `Insufficient balance. Required: ₹${amount}, Available: ₹${sender.wallet}`,
        },
        { status: 400 }
      );
    }

    try {
      // Deduct from sender's wallet
      sender.wallet -= amount;
      await sender.save();

      // Add to recipient's wallet and earnings
      recipient.wallet += amount;
      recipient.totalEarnings += amount;
      await recipient.save();

      // Create gift record
      const gift = new Gift({
        sender: sender._id,
        recipient: recipient._id,
        video: videoId || undefined,
        amount,
        message: message || "",
      });
      await gift.save();

      return NextResponse.json({
        message: "Gift sent successfully",
        newBalance: sender.wallet,
        gift: {
          id: gift._id,
          amount: gift.amount,
          recipient: {
            username: recipient.username,
            displayName: recipient.displayName,
          },
        },
      });
    } catch (error) {
      throw error;
    }
  } catch (error) {
    console.error("Send gift error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Get gifts received by user
export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const userPayload = await getUserFromRequest(request);
    if (!userPayload) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(request.url);
    const page = Number.parseInt(url.searchParams.get("page") || "1");
    const limit = Number.parseInt(url.searchParams.get("limit") || "10");
    const type = url.searchParams.get("type") || "received"; // received or sent

    const query =
      type === "received"
        ? { recipient: userPayload.userId }
        : { sender: userPayload.userId };

    const gifts = await Gift.find(query)
      .populate("sender", "username displayName avatar")
      .populate("recipient", "username displayName avatar")
      .populate("video", "title thumbnail")
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip((page - 1) * limit);

    const total = await Gift.countDocuments(query);

    return NextResponse.json({
      gifts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Get gifts error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
