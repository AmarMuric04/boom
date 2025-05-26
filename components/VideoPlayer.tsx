"use client";

import { useState, useEffect } from "react";
import { Play, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  getYouTubeVideoInfo,
  getVimeoVideoId,
  getVimeoEmbedUrl,
  isYouTubeUrl,
  isVimeoUrl,
} from "@/lib/youtube";

interface VideoPlayerProps {
  videoUrl: string;
  thumbnail?: string;
  title: string;
  type: "short-form" | "long-form";
  canWatch: boolean;
  onPurchaseClick?: () => void;
  price?: number;
}

export default function VideoPlayer({
  videoUrl,
  thumbnail,
  title,
  type,
  canWatch,
  onPurchaseClick,
  price,
}: VideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [embedUrl, setEmbedUrl] = useState<string>("");
  const [videoThumbnail, setVideoThumbnail] = useState<string>(thumbnail || "");

  useEffect(() => {
    if (type === "long-form" && videoUrl) {
      if (isYouTubeUrl(videoUrl)) {
        const youtubeInfo = getYouTubeVideoInfo(videoUrl);
        if (youtubeInfo) {
          setEmbedUrl(youtubeInfo.embedUrl);
          if (!thumbnail) {
            setVideoThumbnail(youtubeInfo.thumbnail);
          }
        }
      } else if (isVimeoUrl(videoUrl)) {
        const vimeoId = getVimeoVideoId(videoUrl);
        if (vimeoId) {
          setEmbedUrl(getVimeoEmbedUrl(vimeoId));
        }
      } else {
        // For other video URLs, try to use them directly
        setEmbedUrl(videoUrl);
      }
    }
  }, [videoUrl, type, thumbnail]);

  if (!canWatch) {
    return (
      <div className="bg-gray-900 aspect-video flex items-center justify-center relative">
        <div className="absolute inset-0">
          <img
            src={videoThumbnail || "/placeholder.svg"}
            alt={title}
            className="w-full h-full object-cover opacity-30"
          />
        </div>
        <div className="relative text-center text-white p-8 z-10">
          <div className="mb-6">
            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Play className="h-8 w-8 text-white" />
            </div>
          </div>
          <h3 className="text-xl font-semibold mb-2">Premium Content</h3>
          <p className="text-gray-300 mb-6">Purchase this video to watch</p>
          <Button
            className="bg-purple-600 hover:bg-purple-700"
            onClick={onPurchaseClick}
          >
            Buy for ₹{price}
          </Button>
        </div>
      </div>
    );
  }

  if (type === "short-form") {
    return (
      <div className="bg-black aspect-[9/16] max-w-md mx-auto flex items-center justify-center">
        <video
          src={videoUrl}
          controls
          className="w-full h-full object-cover"
          poster={videoThumbnail}
          preload="metadata"
        />
      </div>
    );
  }

  // Long-form video player
  return (
    <div className="bg-black aspect-video relative">
      {!isPlaying && videoThumbnail ? (
        <div
          className="relative w-full h-full cursor-pointer"
          onClick={() => setIsPlaying(true)}
        >
          <img
            src={videoThumbnail || "/placeholder.svg"}
            alt={title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 flex items-center justify-center bg-black/30">
            <div className="w-20 h-20 bg-red-600 rounded-full flex items-center justify-center hover:bg-red-700 transition-colors">
              <Play className="h-8 w-8 text-white ml-1" />
            </div>
          </div>
          <div className="absolute bottom-4 right-4">
            <Button
              variant="secondary"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                window.open(videoUrl, "_blank");
              }}
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Watch on{" "}
              {isYouTubeUrl(videoUrl)
                ? "YouTube"
                : isVimeoUrl(videoUrl)
                ? "Vimeo"
                : "External Site"}
            </Button>
          </div>
        </div>
      ) : embedUrl ? (
        <iframe
          src={embedUrl}
          title={title}
          className="w-full h-full"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-white">
          <div className="text-center">
            <Play className="h-16 w-16 mx-auto mb-4" />
            <p className="text-lg mb-4">External Video</p>
            <Button
              onClick={() => window.open(videoUrl, "_blank")}
              className="bg-purple-600 hover:bg-purple-700"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Watch Video
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
