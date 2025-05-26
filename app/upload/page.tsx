"use client";

import type React from "react";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Play,
  Upload,
  ArrowLeft,
  Loader2,
  Video,
  X,
  ImageIcon,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { getYouTubeVideoInfo, isYouTubeUrl, isVimeoUrl } from "@/lib/youtube";

export default function UploadPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const thumbnailInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedThumbnail, setSelectedThumbnail] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [thumbnailPreview, setThumbnailPreview] = useState<string>("");
  const [autoThumbnail, setAutoThumbnail] = useState<string>("");
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    videoType: "",
    videoUrl: "",
    price: 0,
    tags: "",
  });

  // Auto-fetch YouTube thumbnail when URL changes
  useEffect(() => {
    if (
      formData.videoType === "long-form" &&
      formData.videoUrl &&
      isYouTubeUrl(formData.videoUrl)
    ) {
      const youtubeInfo = getYouTubeVideoInfo(formData.videoUrl);
      if (youtubeInfo) {
        setAutoThumbnail(youtubeInfo.thumbnail);
        // Auto-fill title if empty
        if (!formData.title && youtubeInfo.title) {
          setFormData((prev) => ({ ...prev, title: youtubeInfo.title! }));
        }
      }
    } else {
      setAutoThumbnail("");
    }
  }, [formData.videoUrl, formData.videoType, formData.title]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("video/")) {
      setError("Please select a valid video file");
      return;
    }

    // Validate file size (50MB limit)
    const maxSize = 50 * 1024 * 1024; // 50MB
    if (file.size > maxSize) {
      setError("Video file must be less than 50MB");
      return;
    }

    setSelectedFile(file);
    setError("");

    // Create preview URL
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);

    // Auto-fill title from filename
    if (!formData.title) {
      const filename = file.name.replace(/\.[^/.]+$/, "");
      setFormData((prev) => ({ ...prev, title: filename }));
    }
  };

  const handleThumbnailSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file for thumbnail");
      return;
    }

    // Validate file size (5MB limit)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      setError("Thumbnail image must be less than 5MB");
      return;
    }

    setSelectedThumbnail(file);
    setError("");

    // Create preview URL
    const url = URL.createObjectURL(file);
    setThumbnailPreview(url);
  };

  const removeFile = () => {
    setSelectedFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl("");
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const removeThumbnail = () => {
    setSelectedThumbnail(null);
    if (thumbnailPreview) {
      URL.revokeObjectURL(thumbnailPreview);
      setThumbnailPreview("");
    }
    if (thumbnailInputRef.current) {
      thumbnailInputRef.current.value = "";
    }
  };

  const uploadToCloudinary = async (
    file: File,
    resourceType: "video" | "image" = "video"
  ): Promise<string> => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("resourceType", resourceType);

    const endpoint =
      resourceType === "video" ? "/api/upload/video" : "/api/upload/image";
    const response = await fetch(endpoint, {
      method: "POST",
      body: formData,
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error(`Failed to upload ${resourceType}`);
    }

    const data = await response.json();
    return data.videoUrl || data.imageUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);
    setError("");
    setUploadProgress(0);

    // Validation
    if (!formData.title || !formData.description || !formData.videoType) {
      setError("Please fill in all required fields");
      setUploading(false);
      return;
    }

    if (formData.videoType === "short-form" && !selectedFile) {
      setError("Please select a video file for short-form content");
      setUploading(false);
      return;
    }

    if (formData.videoType === "long-form" && !formData.videoUrl) {
      setError("Please provide a video URL for long-form content");
      setUploading(false);
      return;
    }

    try {
      let videoUrl = formData.videoUrl;
      let thumbnailUrl = "";

      // Upload video file if it's short-form content
      if (formData.videoType === "short-form" && selectedFile) {
        setUploadProgress(25);
        videoUrl = await uploadToCloudinary(selectedFile, "video");
        setUploadProgress(50);
      }

      // Upload custom thumbnail if provided
      if (selectedThumbnail) {
        setUploadProgress(formData.videoType === "short-form" ? 75 : 50);
        thumbnailUrl = await uploadToCloudinary(selectedThumbnail, "image");
      } else if (autoThumbnail) {
        // Use auto-generated YouTube thumbnail
        thumbnailUrl = autoThumbnail;
      }

      setUploadProgress(90);

      // Create video record
      const response = await fetch("/api/videos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          type: formData.videoType,
          videoUrl: videoUrl,
          thumbnail: thumbnailUrl,
          price: formData.price,
          tags: formData.tags
            .split(",")
            .map((tag) => tag.trim())
            .filter(Boolean),
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setUploadProgress(100);
        router.push("/dashboard");
      } else {
        setError(data.error || "Upload failed");
      }
    } catch (error) {
      console.error("Upload error:", error);
      setError("Upload failed. Please try again.");
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "price" ? Number.parseFloat(value) || 0 : value,
    }));
  };

  const handleVideoTypeChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      videoType: value,
      videoUrl: "",
      price: 0,
    }));
    // Clear file selection when switching to long-form
    if (value === "long-form") {
      removeFile();
    }
    // Clear thumbnails when switching types
    removeThumbnail();
    setAutoThumbnail("");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
            <div className="flex items-center space-x-2">
              <Play className="h-8 w-8 text-purple-600" />
              <h1 className="text-2xl font-bold text-gray-900">VideoHub</h1>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <Upload className="h-12 w-12 text-purple-600 mb-4" />
              <CardTitle className="text-2xl">Upload New Video</CardTitle>
              <CardDescription>
                Share your content with your audience. Upload short videos or
                link to external content.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
                    {error}
                  </div>
                )}

                {/* Upload Progress */}
                {uploading && uploadProgress > 0 && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Uploading...</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      ></div>
                    </div>
                  </div>
                )}

                {/* Video Type */}
                <div className="space-y-2">
                  <Label htmlFor="videoType">Video Type *</Label>
                  <Select
                    onValueChange={handleVideoTypeChange}
                    required
                    disabled={uploading}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select video type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="short-form">
                        Short-Form (Upload Video File)
                      </SelectItem>
                      <SelectItem value="long-form">
                        Long-Form (External URL)
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* File Upload for short-form */}
                {formData.videoType === "short-form" && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Video File *</Label>
                      {!selectedFile ? (
                        <div
                          className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-purple-400 transition-colors cursor-pointer"
                          onClick={() => fileInputRef.current?.click()}
                        >
                          <Video className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                          <p className="text-gray-600 mb-2">
                            Click to upload a video file
                          </p>
                          <p className="text-sm text-gray-500">
                            MP4, MOV, AVI up to 50MB
                          </p>
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept="video/*"
                            onChange={handleFileSelect}
                            className="hidden"
                            disabled={uploading}
                          />
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                            <div className="flex items-center space-x-3">
                              <Video className="h-8 w-8 text-purple-600" />
                              <div>
                                <p className="font-medium">
                                  {selectedFile.name}
                                </p>
                                <p className="text-sm text-gray-500">
                                  {(selectedFile.size / (1024 * 1024)).toFixed(
                                    2
                                  )}{" "}
                                  MB
                                </p>
                              </div>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={removeFile}
                              disabled={uploading}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                          {previewUrl && (
                            <video
                              src={previewUrl}
                              controls
                              className="w-full max-h-64 rounded-lg"
                              preload="metadata"
                            />
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Video URL for long-form */}
                {formData.videoType === "long-form" && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="videoUrl">Video URL *</Label>
                      <Input
                        id="videoUrl"
                        name="videoUrl"
                        type="url"
                        placeholder="https://youtube.com/watch?v=... or https://vimeo.com/..."
                        value={formData.videoUrl}
                        onChange={handleChange}
                        required
                        disabled={uploading}
                      />
                      {formData.videoUrl && (
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <ExternalLink className="h-4 w-4" />
                          <span>
                            {isYouTubeUrl(formData.videoUrl)
                              ? "YouTube video detected"
                              : isVimeoUrl(formData.videoUrl)
                              ? "Vimeo video detected"
                              : "External video URL"}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Thumbnail Section for Long-form */}
                    <div className="space-y-4">
                      <Label>Video Thumbnail</Label>

                      {/* Auto-generated thumbnail preview */}
                      {autoThumbnail && !selectedThumbnail && (
                        <div className="space-y-2">
                          <p className="text-sm text-gray-600">
                            Auto-generated thumbnail from YouTube:
                          </p>
                          <img
                            src={autoThumbnail || "/placeholder.svg"}
                            alt="Auto-generated thumbnail"
                            className="w-full max-w-sm h-32 object-cover rounded-lg border"
                          />
                        </div>
                      )}

                      {/* Custom thumbnail upload */}
                      <div className="space-y-2">
                        <Label className="text-sm">
                          Upload Custom Thumbnail (Optional)
                        </Label>
                        {!selectedThumbnail ? (
                          <div
                            className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-purple-400 transition-colors cursor-pointer"
                            onClick={() => thumbnailInputRef.current?.click()}
                          >
                            <ImageIcon className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                            <p className="text-sm text-gray-600 mb-1">
                              Click to upload custom thumbnail
                            </p>
                            <p className="text-xs text-gray-500">
                              JPG, PNG up to 5MB
                            </p>
                            <input
                              ref={thumbnailInputRef}
                              type="file"
                              accept="image/*"
                              onChange={handleThumbnailSelect}
                              className="hidden"
                              disabled={uploading}
                            />
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                              <div className="flex items-center space-x-3">
                                <ImageIcon className="h-6 w-6 text-purple-600" />
                                <div>
                                  <p className="text-sm font-medium">
                                    {selectedThumbnail.name}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    {(
                                      selectedThumbnail.size /
                                      (1024 * 1024)
                                    ).toFixed(2)}{" "}
                                    MB
                                  </p>
                                </div>
                              </div>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={removeThumbnail}
                                disabled={uploading}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                            {thumbnailPreview && (
                              <img
                                src={thumbnailPreview || "/placeholder.svg"}
                                alt="Custom thumbnail preview"
                                className="w-full max-w-sm h-32 object-cover rounded-lg border"
                              />
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="price">Price (₹)</Label>
                      <Input
                        id="price"
                        name="price"
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="0 for free, or set a price like 29"
                        value={formData.price}
                        onChange={handleChange}
                        disabled={uploading}
                      />
                      <p className="text-sm text-gray-500">
                        Set to 0 for free content, or enter a price for premium
                        content
                      </p>
                    </div>
                  </>
                )}

                {/* Title */}
                <div className="space-y-2">
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    name="title"
                    placeholder="Enter video title"
                    value={formData.title}
                    onChange={handleChange}
                    required
                    disabled={uploading}
                  />
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    name="description"
                    placeholder="Describe your video content"
                    className="min-h-[100px]"
                    value={formData.description}
                    onChange={handleChange}
                    required
                    disabled={uploading}
                  />
                </div>

                {/* Tags */}
                <div className="space-y-2">
                  <Label htmlFor="tags">Tags (Optional)</Label>
                  <Input
                    id="tags"
                    name="tags"
                    placeholder="react, tutorial, programming (comma separated)"
                    value={formData.tags}
                    onChange={handleChange}
                    disabled={uploading}
                  />
                  <p className="text-sm text-gray-500">
                    Add tags to help people discover your content
                  </p>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-purple-600 hover:bg-purple-700"
                  disabled={!formData.videoType || uploading}
                >
                  {uploading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      {uploadProgress > 0
                        ? `Uploading... ${uploadProgress}%`
                        : "Processing..."}
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Video
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
