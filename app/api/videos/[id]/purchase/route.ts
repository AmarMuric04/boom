import { type NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Video from "@/models/Video";
import User from "@/models/User";
import Purchase from "@/models/Purchase";
import { getUserFromRequest } from "@/lib/auth";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();

    const userPayload = await getUserFromRequest(request);
    if (!userPayload) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const video = await Video.findById(id).populate("creator");
    if (!video) {
      return NextResponse.json({ error: "Video not found" }, { status: 404 });
    }

    const user = await User.findById(userPayload.userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if video is free
    if (video.price === 0) {
      return NextResponse.json(
        { error: "This video is free" },
        { status: 400 }
      );
    }

    // Check if already purchased
    const existingPurchase = await Purchase.findOne({
      user: user._id,
      video: video._id,
    });

    console.log("Existing purchase:", existingPurchase);

    if (existingPurchase) {
      return NextResponse.json(
        { error: "Video already purchased" },
        { status: 400 }
      );
    }

    // Check wallet balance
    if (user.wallet < video.price) {
      return NextResponse.json(
        {
          error: `Insufficient balance. Required: ₹${video.price}, Available: ₹${user.wallet}`,
        },
        { status: 400 }
      );
    }

    try {
      // Deduct from buyer's wallet
      user.wallet -= video.price;
      await user.save();

      // Add to creator's wallet and earnings
      const creator = video.creator as any;
      creator.wallet += video.price;
      creator.totalEarnings += video.price;
      await creator.save();

      // Create purchase record
      const purchase = new Purchase({
        user: user._id,
        video: video._id,
        amount: video.price,
      });
      await purchase.save();

      // Update video stats
      video.purchases.push(user._id as string);
      video.earnings += video.price;
      await video.save();

      return NextResponse.json({
        message: "Video purchased successfully",
        newBalance: user.wallet,
        video: {
          id: video._id,
          title: video.title,
          isPurchased: true,
        },
      });
    } catch (error) {
      console.log(error);
      throw error;
    }
  } catch (error) {
    console.error("Purchase video error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Check if user has purchased a video
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();

    const userPayload = await getUserFromRequest(request);
    if (!userPayload) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;

    const purchase = await Purchase.findOne({
      user: userPayload.userId,
      video: id,
    });

    return NextResponse.json({
      isPurchased: !!purchase,
      purchaseDate: purchase?.createdAt || null,
    });
  } catch (error) {
    console.error("Check purchase error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
