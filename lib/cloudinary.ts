import { v2 as cloudinary } from "cloudinary";

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export interface CloudinaryUploadResult {
  public_id: string;
  secure_url: string;
  duration?: number;
  format: string;
  bytes: number;
  width?: number;
  height?: number;
}

export const uploadVideo = async (
  buffer: Buffer,
  options: {
    folder?: string;
    public_id?: string;
    transformation?: any[];
  } = {}
): Promise<CloudinaryUploadResult> => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(
        {
          resource_type: "video",
          folder: options.folder || "videohub/uploads",
          public_id: options.public_id,
          transformation: options.transformation || [
            { quality: "auto" },
            { format: "mp4" },
          ],
        },
        (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve(result as CloudinaryUploadResult);
          }
        }
      )
      .end(buffer);
  });
};

export const deleteVideo = async (publicId: string): Promise<void> => {
  try {
    await cloudinary.uploader.destroy(publicId, { resource_type: "video" });
  } catch (error) {
    console.error("Error deleting video from Cloudinary:", error);
    throw error;
  }
};

export const generateThumbnail = (
  videoUrl: string,
  options: {
    width?: number;
    height?: number;
    quality?: string;
  } = {}
): string => {
  const { width = 300, height = 200, quality = "auto" } = options;

  // Extract public ID from Cloudinary URL
  const publicId = videoUrl.split("/").pop()?.split(".")[0];

  if (!publicId) return videoUrl;

  return cloudinary.url(publicId, {
    resource_type: "video",
    format: "jpg",
    transformation: [{ width, height, crop: "fill" }, { quality }],
  });
};

export default cloudinary;
