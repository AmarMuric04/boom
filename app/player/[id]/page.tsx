"use client";

import type React from "react";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  ArrowLeft,
  Heart,
  Share,
  MessageCircle,
  Send,
  Gift,
  User,
  Edit,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import VideoPlayer from "@/components/VideoPlayer";

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
  comments: Comment[];
  uploadDate: string;
}

interface Comment {
  _id: string;
  author: {
    username: string;
    displayName: string;
    avatar?: string;
  };
  content: string;
  createdAt: string;
}

export default function PlayerPage() {
  const router = useRouter();
  const params = useParams();
  const videoId = params.id as string;

  const [video, setVideo] = useState<any | null>(null);
  const [currentUser, setCurrentUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newComment, setNewComment] = useState("");
  const [userWallet, setUserWallet] = useState(null);
  const [isLiked, setIsLiked] = useState(false);
  const [isGiftDialogOpen, setIsGiftDialogOpen] = useState(false);
  const [giftAmount, setGiftAmount] = useState("");
  const [customGiftAmount, setCustomGiftAmount] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);

  useEffect(() => {
    getCurrentUser();
    fetchVideo();
  }, [videoId]);

  const getCurrentUser = async () => {
    try {
      const response = await fetch("/api/auth/me");
      if (response.ok) {
        const data = await response.json();
        setCurrentUser(data.user);
        setUserWallet(data.user.wallet || 0);
      }
    } catch (error) {
      console.error("Error fetching current user:", error);
    }
  };

  const fetchVideo = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/videos/${videoId}`);

      if (!response.ok) {
        if (response.status === 404) {
          setError("Video not found");
        } else {
          setError("Failed to load video");
        }
        return;
      }

      const data = await response.json();
      setVideo(data.video);
    } catch (error) {
      console.error("Error fetching video:", error);
      setError("Failed to load video");
    } finally {
      setLoading(false);
    }
  };

  // Helper function to check if current user owns the video
  const isOwnVideo = () => {
    return currentUser && video && video.creator._id === currentUser.id;
  };

  // Helper function to check if user can access paid content
  const canWatch = () => {
    if (!video) return false;

    // If it's the user's own video, they can always access it
    if (isOwnVideo()) return true;

    // If it's free, anyone can access it
    if (video.price === 0) return true;

    // Check if user has purchased it
    const purchases = JSON.parse(localStorage.getItem("purchases") || "[]");
    return purchases.includes(videoId);
  };

  const handlePurchase = async () => {
    if (!video || userWallet < video.price) {
      alert(
        `Insufficient balance! You need ₹${video.price} but only have ₹${userWallet}`
      );
      return;
    }

    try {
      const response = await fetch(`/api/videos/${videoId}/purchase`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ amount: video.price }),
      });

      if (response.ok) {
        // Update local state
        const newBalance = userWallet - video.price;
        setUserWallet(newBalance);
        localStorage.setItem("userWallet", newBalance.toString());

        // Store purchase locally
        const purchases = JSON.parse(localStorage.getItem("purchases") || "[]");
        purchases.push(videoId);
        localStorage.setItem("purchases", JSON.stringify(purchases));

        alert(`Successfully purchased "${video.title}" for ₹${video.price}!`);

        // Refresh the page to show the video
        window.location.reload();
      } else {
        alert("Purchase failed. Please try again.");
      }
    } catch (error) {
      console.error("Purchase error:", error);
      alert("Purchase failed. Please try again.");
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newComment.trim() || submittingComment) return;

    try {
      setSubmittingComment(true);
      const response = await fetch(`/api/videos/${videoId}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content: newComment.trim() }),
      });

      if (response.ok) {
        const data = await response.json();
        // Refresh video data to get updated comments
        await fetchVideo();
        setNewComment("");
      } else {
        alert("Failed to add comment. Please try again.");
      }
    } catch (error) {
      console.error("Comment error:", error);
      alert("Failed to add comment. Please try again.");
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleLike = async () => {
    try {
      const response = await fetch(`/api/videos/${videoId}/like`, {
        method: "POST",
      });

      if (response.ok) {
        const data = await response.json();
        setIsLiked(data.liked);
        // Refresh video data to get updated like count
        await fetchVideo();
      }
    } catch (error) {
      console.error("Like error:", error);
    }
  };

  const handleGiftCreator = async () => {
    const amount =
      giftAmount === "custom"
        ? Number.parseFloat(customGiftAmount)
        : Number.parseFloat(giftAmount);

    if (!amount || amount <= 0) {
      alert("Please select a valid gift amount");
      return;
    }

    if (userWallet < amount) {
      alert(
        `Insufficient balance! You need ₹${amount} but only have ₹${userWallet}`
      );
      return;
    }

    try {
      const response = await fetch("/api/gifts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          recipientId: video?.creator._id,
          videoId: videoId,
          amount: amount,
        }),
      });

      if (response.ok) {
        // Update wallet balance
        const newBalance = userWallet - amount;
        setUserWallet(newBalance);
        localStorage.setItem("userWallet", newBalance.toString());

        // Reset form and close dialog
        setGiftAmount("");
        setCustomGiftAmount("");
        setIsGiftDialogOpen(false);

        alert(
          `Successfully gifted ₹${amount} to ${video?.creator.displayName}! Your new balance: ₹${newBalance}`
        );
      } else {
        alert("Failed to send gift. Please try again.");
      }
    } catch (error) {
      console.error("Gift error:", error);
      alert("Failed to send gift. Please try again.");
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60)
    );

    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (error || !video) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {error || "Video not found"}
          </h1>
          <Button onClick={() => router.push("/feed")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Feed
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div className="flex items-center space-x-4">
            <Badge variant="outline" className="bg-green-100 text-green-800">
              Wallet: ₹{userWallet}
            </Badge>
            {isOwnVideo() && (
              <Button
                onClick={() => router.push("/dashboard")}
                variant="outline"
                size="sm"
                className="border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white"
              >
                <Edit className="h-4 w-4 mr-2" />
                Manage Video
              </Button>
            )}
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Video Player Section */}
          <div className="lg:col-span-2">
            <Card className="overflow-hidden">
              <CardContent className="p-0">
                <VideoPlayer
                  videoUrl={video.videoUrl}
                  thumbnail={video.thumbnail}
                  title={video.title}
                  type={video.type}
                  canWatch={canWatch()}
                  onPurchaseClick={handlePurchase}
                  price={video.price}
                />
              </CardContent>
            </Card>

            {/* Video Info */}
            <Card className="mt-4">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h1 className="text-2xl font-bold mb-2">{video.title}</h1>
                    <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                      <div className="flex items-center space-x-2">
                        {video.creator.avatar ? (
                          <img
                            src={video.creator.avatar || "/placeholder.svg"}
                            alt={video.creator.displayName}
                            className="w-6 h-6 rounded-full"
                          />
                        ) : (
                          <div className="w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center">
                            <User className="h-3 w-3 text-white" />
                          </div>
                        )}
                        <span className="font-medium">
                          @{video.creator.username}
                        </span>
                        {video.creator.isVerified && (
                          <Badge variant="secondary" className="text-xs">
                            Verified
                          </Badge>
                        )}
                      </div>
                      <span>•</span>
                      <span>{formatDate(video.uploadDate)}</span>
                      {video.duration && (
                        <>
                          <span>•</span>
                          <span>{video.duration}</span>
                        </>
                      )}
                      <span>•</span>
                      <span>{formatNumber(video.views)} views</span>
                    </div>
                    <div className="flex items-center space-x-2 mb-3">
                      {video.price > 0 ? (
                        <Badge className="bg-purple-100 text-purple-800">
                          ₹{video.price}
                        </Badge>
                      ) : (
                        <Badge className="bg-green-100 text-green-800">
                          Free
                        </Badge>
                      )}
                      {isOwnVideo() && (
                        <Badge className="bg-blue-100 text-blue-800">
                          Your Video
                        </Badge>
                      )}
                      {canWatch() && video.price > 0 && !isOwnVideo() && (
                        <Badge className="bg-green-100 text-green-800">
                          Purchased
                        </Badge>
                      )}
                      <Badge variant="outline">{video.type}</Badge>
                    </div>
                  </div>
                </div>

                <p className="text-gray-700 mb-4">{video.description}</p>

                {/* Gift Creator Button - Only show if not own video */}
                {!isOwnVideo() && (
                  <div className="mb-4">
                    <Dialog
                      open={isGiftDialogOpen}
                      onOpenChange={setIsGiftDialogOpen}
                    >
                      <DialogTrigger asChild>
                        <Button
                          className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white"
                          onClick={() => setIsGiftDialogOpen(true)}
                        >
                          <Gift className="h-4 w-4 mr-2" />
                          Gift the Creator
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                          <DialogTitle className="flex items-center">
                            <Gift className="h-5 w-5 mr-2 text-pink-500" />
                            Gift {video.creator.displayName}
                          </DialogTitle>
                          <DialogDescription>
                            Show your appreciation by sending a gift to the
                            creator
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="text-center p-4 bg-green-50 rounded-lg">
                            <p className="text-sm text-gray-600">
                              Your wallet balance
                            </p>
                            <p className="text-2xl font-bold text-green-600">
                              ₹{userWallet}
                            </p>
                          </div>

                          <div className="space-y-2">
                            <label className="text-sm font-medium">
                              Select gift amount
                            </label>
                            <Select
                              value={giftAmount}
                              onValueChange={setGiftAmount}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Choose an amount" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="10">
                                  ₹10 - Small appreciation
                                </SelectItem>
                                <SelectItem value="50">
                                  ₹50 - Great content!
                                </SelectItem>
                                <SelectItem value="100">
                                  ₹100 - Amazing work!
                                </SelectItem>
                                <SelectItem value="250">
                                  ₹250 - Outstanding!
                                </SelectItem>
                                <SelectItem value="custom">
                                  Custom amount
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          {giftAmount === "custom" && (
                            <div className="space-y-2">
                              <label className="text-sm font-medium">
                                Enter custom amount
                              </label>
                              <Input
                                type="number"
                                placeholder="Enter amount (₹)"
                                value={customGiftAmount}
                                onChange={(e) =>
                                  setCustomGiftAmount(e.target.value)
                                }
                                min="1"
                                max={userWallet}
                              />
                            </div>
                          )}

                          <div className="flex space-x-2">
                            <Button
                              variant="outline"
                              className="flex-1"
                              onClick={() => setIsGiftDialogOpen(false)}
                            >
                              Cancel
                            </Button>
                            <Button
                              className="flex-1 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700"
                              onClick={handleGiftCreator}
                              disabled={
                                !giftAmount ||
                                (giftAmount === "custom" && !customGiftAmount)
                              }
                            >
                              Send Gift
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex items-center space-x-4">
                  <Button
                    variant={isLiked ? "default" : "outline"}
                    onClick={handleLike}
                    className={isLiked ? "bg-red-500 hover:bg-red-600" : ""}
                  >
                    <Heart
                      className={`h-4 w-4 mr-2 ${
                        isLiked ? "fill-current" : ""
                      }`}
                    />
                    {formatNumber(video.likes)}
                  </Button>
                  <Button variant="outline">
                    <Share className="h-4 w-4 mr-2" />
                    Share
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Comments Section */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MessageCircle className="h-5 w-5 mr-2" />
                  Comments ({video.comments.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {/* Add Comment Form */}
                <form onSubmit={handleAddComment} className="mb-6">
                  <Textarea
                    placeholder="Add a comment..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    className="mb-3"
                    rows={3}
                  />
                  <Button
                    type="submit"
                    size="sm"
                    disabled={!newComment.trim() || submittingComment}
                  >
                    <Send className="h-4 w-4 mr-2" />
                    {submittingComment ? "Posting..." : "Post Comment"}
                  </Button>
                </form>

                {/* Comments List */}
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {video.comments.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">
                      No comments yet. Be the first to comment!
                    </p>
                  ) : (
                    video.comments.map((comment) => (
                      <div
                        key={comment._id}
                        className="border-b border-gray-100 pb-3 last:border-b-0"
                      >
                        <div className="flex items-start space-x-3">
                          {comment.author.avatar ? (
                            <img
                              src={comment.author.avatar || "/placeholder.svg"}
                              alt={comment.author.displayName}
                              className="w-8 h-8 rounded-full"
                            />
                          ) : (
                            <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                              <span className="text-sm font-semibold text-purple-600">
                                {comment.author.username
                                  .charAt(0)
                                  .toUpperCase()}
                              </span>
                            </div>
                          )}
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <span className="font-semibold text-sm">
                                {comment.author.username}
                              </span>
                              <span className="text-xs text-gray-500">
                                {formatDate(comment.createdAt)}
                              </span>
                            </div>
                            <p className="text-sm text-gray-700">
                              {comment.content}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
