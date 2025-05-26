import { type NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import { getUserFromRequest } from "@/lib/auth";

// Cloudinary configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

export const maxSize = 50 * 1024 * 1024; // 50MB limit
export const config = {
  api: {
    bodyParser: false, // ❌ This is invalid in App Router, but it's the idea — App Router parses formData correctly
  },
};

// Route handler
export async function POST(request: NextRequest) {
  try {
    // ✅ Authentication check
    const userPayload = await getUserFromRequest(request);
    if (!userPayload) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // ✅ Get file from formData
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof Blob)) {
      return NextResponse.json(
        { error: "No valid file provided" },
        { status: 400 }
      );
    }

    // ✅ Validate video file type
    if (!file.type.startsWith("video/")) {
      return NextResponse.json(
        { error: "File must be a video" },
        { status: 400 }
      );
    }

    // ✅ Validate size
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "Video must be under 50MB" },
        { status: 400 }
      );
    }

    // ✅ Convert to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // ✅ Upload to Cloudinary
    const uploadResult = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          resource_type: "video",
          folder: "videohub/uploads",
          public_id: `${userPayload.userId}_${Date.now()}`,
          transformation: [{ quality: "auto" }, { format: "mp4" }],
        },
        (error, result) => {
          if (error) return reject(error);
          return resolve(result);
        }
      );

      uploadStream.end(buffer);
    });

    const result = uploadResult as any;

    return NextResponse.json({
      success: true,
      videoUrl: result.secure_url,
      publicId: result.public_id,
      duration: result.duration,
      format: result.format,
      bytes: result.bytes,
      thumbnail: result.secure_url.replace(/\.[^/.]+$/, ".jpg"),
    });
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
