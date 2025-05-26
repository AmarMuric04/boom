"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Play,
  LogOut,
  Heart,
  Share,
  MessageCircle,
  Volume2,
  VolumeX,
  MoreHorizontal,
  UserPlus,
  UserCheck,
  Edit,
} from "lucide-react";
import { UserAvatar } from "@/components/UserAvatar";

interface Video {
  id: string;
  title: string;
  description: string;
  creator: {
    _id: string;
    username: string;
    displayName: string;
    avatar?: string;
    isVerified: boolean;
  };
  type: "short-form" | "long-form";
  videoUrl: string;
  thumbnail?: string;
  duration?: string;
  price: number;
  isPremium: boolean;
  views: number;
  likes: number;
  comments: number;
  uploadDate: string;
  isPurchased?: boolean;
}

interface User {
  _id: string;
  username: string;
  displayName: string;
  email: string;
  avatar?: string;
  isVerified: boolean;
  wallet: number;
}

export default function FeedPage() {
  const router = useRouter();
  const [videos, setVideos] = useState<Video[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [mutedVideos, setMutedVideos] = useState<Set<string>>(new Set());
  const [followingList, setFollowingList] = useState<string[]>([]);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Get current user info
    getCurrentUser();
    loadVideos(1);
    loadFollowingList();
  }, []);

  // Load more videos when scrolling
  useEffect(() => {
    if (loadMoreRef.current && hasMore) {
      observerRef.current = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting && !loading) {
            loadVideos(page + 1);
          }
        },
        { threshold: 0.1 }
      );
      observerRef.current.observe(loadMoreRef.current);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [page, loading, hasMore]);

  const getCurrentUser = async () => {
    try {
      const response = await fetch("/api/auth/me");
      if (response.ok) {
        const data = await response.json();
        setCurrentUser(data.user);
      }
    } catch (error) {
      console.error("Error fetching current user:", error);
    }
  };

  const loadFollowingList = async () => {
    try {
      const response = await fetch("/api/users/following");
      if (response.ok) {
        const data = await response.json();
        const usernames = data?.following?.map(
          (f: any) => f.following.username
        );
        setFollowingList(usernames);
      }
    } catch (error) {
      console.error("Error loading following list:", error);
    }
  };

  console.log(currentUser);

  const loadVideos = async (pageNum: number) => {
    try {
      setLoading(true);

      const response = await fetch(`/api/videos?page=${pageNum}&limit=6`);
      if (!response.ok) {
        throw new Error("Failed to fetch videos");
      }

      const data = await response.json();
      const newVideos = data.videos || [];

      // Check purchase status for each video
      const videosWithPurchaseStatus = await Promise.all(
        newVideos.map(async (video: Video) => {
          if (video.price > 0 && !isOwnVideo(video)) {
            try {
              const purchaseResponse = await fetch(
                `/api/videos/${video.id}/purchase`
              );
              if (purchaseResponse.ok) {
                const purchaseData = await purchaseResponse.json();
                video.isPurchased = purchaseData.isPurchased;
              }
            } catch (error) {
              console.error("Error checking purchase status:", error);
            }
          }
          return video;
        })
      );

      if (pageNum === 1) {
        setVideos(videosWithPurchaseStatus);
      } else {
        setVideos((prev) => [...prev, ...videosWithPurchaseStatus]);
      }

      setPage(pageNum);
      setHasMore(newVideos.length === 6);
    } catch (error) {
      console.error("Error loading videos:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async (videoId: string, price: number) => {
    if (!currentUser || currentUser.wallet < price) {
      alert(
        `Insufficient balance! You need ₹${price} but only have ₹${
          currentUser?.wallet || 0
        }`
      );
      return;
    }

    try {
      const response = await fetch(`/api/videos/${videoId}/purchase`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();

        // Update current user wallet
        setCurrentUser((prev) =>
          prev ? { ...prev, wallet: data.newBalance } : null
        );

        // Update video as purchased
        setVideos((prev) =>
          prev.map((video) =>
            video.id === videoId ? { ...video, isPurchased: true } : video
          )
        );
        const alreadyPurchased = JSON.parse(
          localStorage.getItem("purchases") || "[]"
        );

        localStorage.setItem(
          "purchases",
          JSON.stringify([...alreadyPurchased, videoId])
        );

        alert(
          `Successfully purchased video for ₹${price}! New balance: ₹${data.newBalance}`
        );
      } else {
        const errorData = await response.json();
        alert(errorData.error || "Purchase failed. Please try again.");
      }
    } catch (error) {
      console.error("Purchase error:", error);
      alert("Purchase failed. Please try again.");
    }
  };

  const handleFollow = async (username: string) => {
    try {
      const response = await fetch("/api/follow", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username }),
      });

      if (response.ok) {
        setFollowingList((prev) => [...prev, username]);
      }
    } catch (error) {
      console.error("Follow error:", error);
    }
  };

  const handleUnfollow = async (username: string) => {
    try {
      const response = await fetch("/api/follow", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username }),
      });

      if (response.ok) {
        setFollowingList((prev) => prev.filter((u) => u !== username));
      }
    } catch (error) {
      console.error("Unfollow error:", error);
    }
  };

  const toggleMute = (videoId: string) => {
    setMutedVideos((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(videoId)) {
        newSet.delete(videoId);
      } else {
        newSet.add(videoId);
      }
      return newSet;
    });
  };

  // Helper function to check if current user owns the video
  const isOwnVideo = (video: Video) => {
    return currentUser && video.creator._id === currentUser.id;
  };

  // Helper function to check if user can access paid content
  const canAccessPaidContent = (video: Video) => {
    // If it's the user's own video, they can always access it
    if (isOwnVideo(video)) return true;

    // If it's free, anyone can access it
    if (video.price === 0) return true;

    // Check if user has purchased it
    return video.isPurchased || false;
  };

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <header className="bg-black/90 backdrop-blur-sm border-b border-gray-800 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <Play className="h-7 w-7 text-purple-400" />
              <h1 className="text-xl font-bold text-white">Boom Feed</h1>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Badge
              variant="outline"
              className="bg-green-900/50 text-green-400 border-green-600 cursor-pointer"
              onClick={() => router.push("/wallet")}
            >
              ₹{currentUser?.wallet || 0}
            </Badge>
            <Button
              size="sm"
              onClick={() => router.push("/following")}
              className="text-gray-300 hover:text-white"
            >
              Following
            </Button>
            <Button
              size="sm"
              onClick={() => router.push("/dashboard")}
              className="text-gray-300 hover:text-white"
            >
              Dashboard
            </Button>
            <Button
              size="sm"
              onClick={() => router.push("/upload")}
              className="text-gray-300 hover:text-white"
            >
              Upload
            </Button>
            <UserAvatar />
          </div>
        </div>
      </header>

      {/* Feed */}
      <div className="container mx-auto px-4 py-6">
        <div className="max-w-4xl mx-auto space-y-8">
          {videos.length === 0 && !loading ? (
            <div className="text-center py-12">
              <h2 className="text-2xl font-bold text-white mb-4">
                No videos yet
              </h2>
              <p className="text-gray-400 mb-6">
                Be the first to upload content!
              </p>
              <Button onClick={() => router.push("/upload")}>
                Upload Video
              </Button>
            </div>
          ) : (
            videos.map((video) => (
              <VideoCard
                key={video.id}
                video={video}
                currentUser={currentUser}
                onPurchase={handlePurchase}
                isMuted={mutedVideos.has(video.id)}
                onToggleMute={() => toggleMute(video.id)}
                isFollowing={followingList?.includes(video.creator.username)}
                onFollow={() => handleFollow(video.creator.username)}
                onUnfollow={() => handleUnfollow(video.creator.username)}
                isOwnVideo={isOwnVideo(video)}
                canAccessPaidContent={canAccessPaidContent(video)}
              />
            ))
          )}

          {loading && (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-400"></div>
            </div>
          )}

          {hasMore && <div ref={loadMoreRef} className="h-4" />}

          {!hasMore && videos.length > 0 && (
            <div className="text-center py-8 text-gray-400">
              {"You've reached the end of the feed!"}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

interface VideoCardProps {
  video: Video;
  currentUser: User | null;
  onPurchase: (videoId: string, price: number) => void;
  isMuted: boolean;
  onToggleMute: () => void;
  isFollowing: boolean;
  onFollow: () => void;
  onUnfollow: () => void;
  isOwnVideo: boolean;
  canAccessPaidContent: boolean;
}

function VideoCard({
  video,
  currentUser,
  onPurchase,
  isMuted,
  onToggleMute,
  isFollowing,
  onFollow,
  onUnfollow,
  isOwnVideo,
  canAccessPaidContent,
}: VideoCardProps) {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLiked, setIsLiked] = useState(false);

  useEffect(() => {
    if (video.type === "short-form" && videoRef.current && cardRef.current) {
      const observer = new IntersectionObserver(
        async (entries) => {
          const entry = entries[0];
          if (entry.isIntersecting && videoRef.current) {
            try {
              await videoRef.current.play();
              setIsPlaying(true);
            } catch (error) {
              console.log("Autoplay prevented:", error);
            }
          } else if (videoRef.current) {
            try {
              videoRef.current.pause();
              setIsPlaying(false);
            } catch (error) {
              console.log("Pause error:", error);
            }
          }
        },
        { threshold: 0.7 }
      );

      observer.observe(cardRef.current);

      return () => {
        observer.disconnect();
      };
    }
  }, [video.type]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    );

    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    return date.toLocaleDateString();
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  if (video.type === "short-form") {
    return (
      <div ref={cardRef} className="flex gap-6 w-full">
        {/* Video Player - Left Side */}
        <div className="relative bg-black rounded-2xl overflow-hidden aspect-[9/16] w-80 flex-shrink-0">
          {/* Video Background */}
          <div className="absolute inset-0">
            <video
              ref={videoRef}
              src={video.videoUrl}
              className="w-full h-full object-cover"
              muted={isMuted}
              loop
              playsInline
              preload="metadata"
              poster={video.thumbnail}
            />
          </div>

          {/* Minimal overlay for sound control only */}
          <div className="absolute top-4 right-4">
            <Button
              variant="ghost"
              size="sm"
              className="text-white hover:bg-black/50 rounded-full p-2 backdrop-blur-sm"
              onClick={onToggleMute}
            >
              {isMuted ? (
                <VolumeX className="h-5 w-5" />
              ) : (
                <Volume2 className="h-5 w-5" />
              )}
            </Button>
          </div>

          {/* Center Play Button (when paused) */}
          {!isPlaying && (
            <div className="absolute inset-0 flex items-center justify-center">
              <Button
                variant="ghost"
                size="lg"
                className="bg-black/50 text-white hover:bg-black/70 rounded-full p-6 backdrop-blur-sm"
                onClick={() => router.push(`/player/${video.id}`)}
              >
                <Play className="h-12 w-12" />
              </Button>
            </div>
          )}

          {/* Tap to view overlay */}
          <div
            className="absolute inset-0 cursor-pointer"
            onClick={() => router.push(`/player/${video.id}`)}
          />
        </div>

        {/* Content Info - Right Side */}
        <div className="flex-1 py-2">
          {/* Creator Info */}
          <div className="flex items-center space-x-3 mb-4">
            <div
              className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center cursor-pointer overflow-hidden"
              onClick={() => router.push(`/profile/${video.creator.username}`)}
            >
              {video.creator.avatar ? (
                <img
                  src={video.creator.avatar || "/placeholder.svg"}
                  alt={video.creator.displayName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-white text-lg font-bold">
                  {video.creator.username.charAt(0)}
                </span>
              )}
            </div>
            <div className="flex-1">
              <h4
                className="text-white font-semibold text-lg cursor-pointer hover:text-purple-400"
                onClick={() =>
                  router.push(`/profile/${video.creator.username}`)
                }
              >
                @{video.creator.username}
                {video.creator.isVerified && (
                  <Badge variant="secondary" className="ml-2 text-xs">
                    ✓
                  </Badge>
                )}
              </h4>
              <p className="text-gray-400 text-sm">
                {formatDate(video.uploadDate)}
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="text-gray-400 hover:text-white ml-auto"
            >
              <MoreHorizontal className="h-5 w-5" />
            </Button>
          </div>

          {/* Video Title & Description */}
          <div className="mb-6">
            <h3 className="text-white font-bold text-xl mb-3 leading-tight">
              {video.title}
            </h3>
            <p className="text-gray-300 text-base leading-relaxed">
              {video.description}
            </p>

            {/* Show pricing info */}
            <div className="flex items-center space-x-2 mt-3">
              {video.price > 0 ? (
                <Badge className="bg-purple-100 text-purple-800">
                  ₹{video.price}
                </Badge>
              ) : (
                <Badge className="bg-green-100 text-green-800">Free</Badge>
              )}
              {isOwnVideo && (
                <Badge className="bg-blue-100 text-blue-800">Your Video</Badge>
              )}
              {canAccessPaidContent && video.price > 0 && !isOwnVideo && (
                <Badge className="bg-green-100 text-green-800">Purchased</Badge>
              )}
            </div>
          </div>

          {/* Engagement Actions */}
          <div className="flex items-center space-x-8 mb-6">
            {/* Like Button */}
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                className={`rounded-full p-3 transition-all ${
                  isLiked
                    ? "text-red-500 hover:bg-red-500/20 scale-110"
                    : "text-gray-400 hover:text-white hover:bg-white/10"
                }`}
                onClick={() => setIsLiked(!isLiked)}
              >
                <Heart className={`h-6 w-6 ${isLiked ? "fill-current" : ""}`} />
              </Button>
              <span className="text-gray-300 font-medium">
                {formatNumber(video.likes + (isLiked ? 1 : 0))}
              </span>
            </div>

            {/* Comment Button */}
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                className="text-gray-400 hover:text-white hover:bg-white/10 rounded-full p-3"
                onClick={() => router.push(`/player/${video.id}`)}
              >
                <MessageCircle className="h-6 w-6" />
              </Button>
              <span className="text-gray-300 font-medium">
                {formatNumber(video.comments)}
              </span>
            </div>

            {/* Share Button */}
            <Button
              variant="ghost"
              size="sm"
              className="text-gray-400 hover:text-white hover:bg-white/10 rounded-full p-3"
            >
              <Share className="h-6 w-6" />
            </Button>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-4">
            <Button
              onClick={() => router.push(`/player/${video.id}`)}
              className="bg-white text-black hover:bg-gray-200 font-semibold px-6 py-2 rounded-full"
            >
              Watch Full Video
            </Button>

            {/* Show different buttons based on ownership */}
            {isOwnVideo ? (
              <Button
                onClick={() => router.push(`/dashboard`)}
                className="border-blue-600 text-blue-400 hover:bg-blue-600 hover:text-white px-6 py-2 rounded-full font-semibold"
              >
                <Edit className="h-4 w-4 mr-2" />
                Manage Video
              </Button>
            ) : (
              <Button
                onClick={isFollowing ? onUnfollow : onFollow}
                className={`px-6 py-2 rounded-full font-semibold ${
                  isFollowing
                    ? "border-gray-600 text-gray-300 hover:bg-gray-800 hover:text-white"
                    : "border-purple-600 text-purple-400 hover:bg-purple-600 hover:text-white"
                }`}
              >
                {isFollowing ? (
                  <>
                    <UserCheck className="h-4 w-4 mr-2" />
                    Following
                  </>
                ) : (
                  <>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Follow @{video.creator.username}
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Long-form video card (horizontal layout)
  return (
    <Card className="overflow-hidden bg-gray-900 border-gray-700">
      <CardContent className="p-0">
        <div className="flex">
          {/* Thumbnail */}
          <div className="relative w-64 h-36 flex-shrink-0">
            <img
              src={video.thumbnail || "/placeholder.svg"}
              alt={video.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
              <Play className="h-10 w-10 text-white" />
            </div>
            {video.duration && (
              <Badge className="absolute bottom-2 right-2 bg-black/80 text-white text-xs">
                {video.duration}
              </Badge>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 p-6">
            <div className="flex flex-col h-full">
              <div className="flex-1">
                <h3 className="font-semibold text-xl mb-3 line-clamp-2 text-white">
                  {video.title}
                </h3>
                <div className="flex items-center space-x-3 mb-3">
                  <div
                    className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center cursor-pointer overflow-hidden"
                    onClick={() =>
                      router.push(`/profile/${video.creator.username}`)
                    }
                  >
                    {video.creator.avatar ? (
                      <img
                        src={video.creator.avatar || "/placeholder.svg"}
                        alt={video.creator.displayName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-white text-sm font-bold">
                        {video.creator.username.charAt(0)}
                      </span>
                    )}
                  </div>
                  <p
                    className="text-gray-400 text-base cursor-pointer hover:text-purple-400"
                    onClick={() =>
                      router.push(`/profile/${video.creator.username}`)
                    }
                  >
                    @{video.creator.username}
                    {video.creator.isVerified && " ✓"}
                  </p>
                  <span className="text-gray-500 text-sm">•</span>
                  <span className="text-gray-500 text-sm">
                    {formatDate(video.uploadDate)}
                  </span>
                  <span className="text-gray-500 text-sm">•</span>
                  <span className="text-gray-500 text-sm">
                    {formatNumber(video.views)} views
                  </span>
                </div>

                <p className="text-gray-300 text-base mb-4 leading-relaxed">
                  {video.description}
                </p>

                <div className="flex items-center space-x-2 mb-4">
                  {video.price > 0 ? (
                    <Badge
                      variant="secondary"
                      className="bg-purple-900/50 text-purple-400 border-purple-600"
                    >
                      ₹{video.price}
                    </Badge>
                  ) : (
                    <Badge className="bg-green-900/50 text-green-400 border-green-600">
                      Free
                    </Badge>
                  )}
                  {isOwnVideo && (
                    <Badge className="bg-blue-900/50 text-blue-400 border-blue-600">
                      Your Video
                    </Badge>
                  )}
                  {canAccessPaidContent && video.price > 0 && !isOwnVideo && (
                    <Badge className="bg-green-900/50 text-green-400 border-green-600">
                      Purchased
                    </Badge>
                  )}
                </div>
              </div>

              {/* Action Button */}
              <div className="mt-auto flex items-center space-x-3">
                {video.price > 0 && !canAccessPaidContent ? (
                  <Button
                    className="bg-purple-600 hover:bg-purple-700 px-6 py-2 rounded-full font-semibold"
                    onClick={() => onPurchase(video.id, video.price)}
                  >
                    Buy for ₹{video.price}
                  </Button>
                ) : (
                  <Button
                    className="border-gray-600 text-gray-300 hover:bg-gray-800 px-6 py-2 rounded-full"
                    onClick={() => router.push(`/player/${video.id}`)}
                  >
                    <Play className="h-4 w-4 mr-2" />
                    Watch Now
                  </Button>
                )}

                {/* Show different buttons based on ownership */}
                {isOwnVideo ? (
                  <Button
                    onClick={() => router.push(`/dashboard`)}
                    variant="outline"
                    size="sm"
                    className="border-blue-600 text-blue-400 hover:bg-blue-600 hover:text-white px-4 py-2 rounded-full"
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Manage
                  </Button>
                ) : (
                  <Button
                    onClick={isFollowing ? onUnfollow : onFollow}
                    variant="outline"
                    size="sm"
                    className={`px-4 py-2 rounded-full ${
                      isFollowing
                        ? "border-gray-600 text-gray-300 hover:bg-gray-800"
                        : "border-purple-600 text-purple-400 hover:bg-purple-600 hover:text-white"
                    }`}
                  >
                    {isFollowing ? (
                      <>
                        <UserCheck className="h-4 w-4 mr-1" />
                        Following
                      </>
                    ) : (
                      <>
                        <UserPlus className="h-4 w-4 mr-1" />
                        Follow
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
