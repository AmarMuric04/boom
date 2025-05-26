"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import crypto from "crypto";
import {
  Calendar,
  MapPin,
  LinkIcon,
  Play,
  Heart,
  MessageCircle,
  Settings,
  UserPlus,
  UserCheck,
  Gift,
  Eye,
  TrendingUp,
  Loader2,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

interface ProfileUser {
  id: string;
  username: string;
  displayName: string;
  email: string;
  bio?: string;
  avatar?: string;
  coverImage?: string;
  location?: string;
  website?: string;
  isVerified: boolean;
  followers: string[];
  following: string[];
  totalVideos: number;
  totalViews: number;
  totalEarnings: number;
  joinDate: string;
  isFollowedByCurrentUser?: boolean;
}

interface Video {
  id: string;
  title: string;
  description: string;
  thumbnail?: string;
  views: number;
  likes: number;
  duration: string;
  uploadDate: string;
  type: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const params = useParams();
  const username = params.username as string;
  const { user: currentUser } = useAuth();

  const [profileUser, setProfileUser] = useState<ProfileUser | null>(null);
  const [videos, setVideos] = useState<Video[]>([]);
  const [isFollowing, setIsFollowing] = useState<null | boolean>(null);
  const [followersCount, setFollowersCount] = useState(0);
  const [isOwnProfile, setIsOwnProfile] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!username) return;

    fetchUserProfile();
  }, [username]);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      setError("");

      // Fetch user profile
      const userResponse = await fetch(`/api/users/${username}`, {
        credentials: "include",
      });

      if (!userResponse.ok) {
        if (userResponse.status === 404) {
          setError("User not found");
        } else {
          setError("Failed to load profile");
        }
        return;
      }

      const userData = await userResponse.json();
      setProfileUser(userData.user);
      setIsFollowing(userData.user.isFollowedByCurrentUser);

      setFollowersCount(userData.user.followers.length);

      // Check if this is the current user's profile
      if (currentUser) {
        setIsOwnProfile(currentUser.username === username);
      }

      // Fetch user's videos
      const videosResponse = await fetch(
        `/api/videos?creator=${userData.user._id}`,
        {
          credentials: "include",
        }
      );

      if (videosResponse.ok) {
        const videosData = await videosResponse.json();
        setVideos(videosData.videos || []);
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
      setError("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const handleFollow = async () => {
    if (!currentUser || !profileUser) return;

    try {
      const method = isFollowing ? "DELETE" : "POST";
      let url = "/api/follow";

      const options: RequestInit = {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      };

      if (method === "POST") {
        options.body = JSON.stringify({ targetUserId: profileUser.id });
      } else if (method === "DELETE") {
        // For DELETE, you cannot reliably send body in fetch; better pass as query param:
        url += `?targetUserId=${profileUser.id}`;
      }

      const response = await fetch(url, options);

      if (response.ok) {
        setIsFollowing(!isFollowing);
        setFollowersCount((prev) => (isFollowing ? prev - 1 : prev + 1));
      } else {
        const data = await response.json();
        console.error("Follow/unfollow error:", data.error);
      }
    } catch (error) {
      console.error("Error following/unfollowing:", error);
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
    });
  };

  const getGravatarUrl = (email: string, size = 120) => {
    const hash = crypto
      .createHash("md5")
      .update(email.toLowerCase().trim())
      .digest("hex");
    return `https://www.gravatar.com/avatar/${hash}?s=${size}&d=identicon`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-purple-600" />
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error || !profileUser) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Profile Not Found
          </h1>
          <p className="text-gray-600 mb-4">
            {error || "The user you're looking for doesn't exist."}
          </p>
          <Button onClick={() => router.push("/feed")}>Go to Feed</Button>
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
            ← Back
          </Button>
          <div className="flex items-center space-x-4">
            {isOwnProfile && (
              <Button
                variant="outline"
                onClick={() => router.push("/settings")}
              >
                <Settings className="h-4 w-4 mr-2" />
                Edit Profile
              </Button>
            )}
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 max-w-6xl">
        {/* Cover Image */}
        <div className="relative mb-6">
          <div className="h-64 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl overflow-hidden">
            {profileUser.coverImage && (
              <img
                src={profileUser.coverImage || "/placeholder.svg"}
                alt="Cover"
                className="w-full h-full object-cover mix-blend-overlay"
              />
            )}
          </div>

          {/* Profile Avatar */}
          <div className="absolute -bottom-16 left-8">
            <div className="relative">
              <img
                src={profileUser.avatar || getGravatarUrl(profileUser.email)}
                alt={profileUser.displayName}
                className="w-32 h-32 rounded-full border-4 border-white bg-white"
              />
              {profileUser.isVerified && (
                <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs">✓</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Profile Info */}
        <div className="mt-20 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <h1 className="text-3xl font-bold text-gray-900">
                  {profileUser.displayName}
                </h1>
                {profileUser.isVerified && (
                  <Badge className="bg-blue-500">Verified</Badge>
                )}
              </div>
              <p className="text-gray-600 text-lg mb-4">
                @{profileUser.username}
              </p>
              {profileUser.bio && (
                <p className="text-gray-700 text-base mb-4 max-w-2xl leading-relaxed">
                  {profileUser.bio}
                </p>
              )}

              {/* Profile Details */}
              <div className="flex flex-wrap items-center gap-6 text-sm text-gray-600 mb-6">
                <div className="flex items-center space-x-1">
                  <Calendar className="h-4 w-4" />
                  <span>Joined {formatDate(profileUser.joinDate)}</span>
                </div>
                {profileUser.location && (
                  <div className="flex items-center space-x-1">
                    <MapPin className="h-4 w-4" />
                    <span>{profileUser.location}</span>
                  </div>
                )}
                {profileUser.website && (
                  <div className="flex items-center space-x-1">
                    <LinkIcon className="h-4 w-4" />
                    <a
                      href={profileUser.website}
                      className="text-purple-600 hover:underline"
                    >
                      Website
                    </a>
                  </div>
                )}
              </div>

              {/* Stats */}
              <div className="flex items-center space-x-8 mb-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">
                    {formatNumber(followersCount)}
                  </div>
                  <div className="text-sm text-gray-600">Followers</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">
                    {formatNumber(profileUser.following.length)}
                  </div>
                  <div className="text-sm text-gray-600">Following</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">
                    {formatNumber(profileUser.totalVideos)}
                  </div>
                  <div className="text-sm text-gray-600">Videos</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">
                    {formatNumber(profileUser.totalViews)}
                  </div>
                  <div className="text-sm text-gray-600">Total Views</div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-4 mt-6 lg:mt-0">
              {!isOwnProfile && currentUser && (
                <>
                  <Button
                    onClick={handleFollow}
                    className={
                      isFollowing
                        ? "bg-gray-200 text-gray-800 hover:bg-gray-300"
                        : "bg-purple-600 hover:bg-purple-700"
                    }
                  >
                    {isFollowing ? (
                      <>
                        <UserCheck className="h-4 w-4 mr-2" />
                        Following
                      </>
                    ) : isFollowing === null ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <>
                        <UserPlus className="h-4 w-4 mr-2" />
                        Follow
                      </>
                    )}
                  </Button>
                  <Button variant="outline">
                    <Gift className="h-4 w-4 mr-2" />
                    Send Gift
                  </Button>
                  <Button variant="outline">
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Message
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Content Tabs */}
        <Tabs defaultValue="videos" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="videos">Videos</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="followers">Followers</TabsTrigger>
            <TabsTrigger value="following">Following</TabsTrigger>
          </TabsList>

          <TabsContent value="videos" className="space-y-6">
            {videos.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {videos.map((video) => (
                  <Card
                    key={video.id}
                    className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                    onClick={() => router.push(`/player/${video.id}`)}
                  >
                    <div className="relative">
                      <img
                        src={
                          video.thumbnail ||
                          "/placeholder.svg?height=200&width=300"
                        }
                        alt={video.title}
                        className="w-full h-48 object-cover"
                      />
                      <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                        <Play className="h-12 w-12 text-white" />
                      </div>
                      <Badge className="absolute bottom-2 right-2 bg-black/80 text-white text-xs">
                        {video.duration}
                      </Badge>
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-semibold text-sm mb-2 line-clamp-2">
                        {video.title}
                      </h3>
                      <div className="flex items-center justify-between text-xs text-gray-600">
                        <div className="flex items-center space-x-3">
                          <div className="flex items-center space-x-1">
                            <Eye className="h-3 w-3" />
                            <span>{formatNumber(video.views)}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Heart className="h-3 w-3" />
                            <span>{formatNumber(video.likes)}</span>
                          </div>
                        </div>
                        <span>
                          {new Date(video.uploadDate).toLocaleDateString()}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Play className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No videos uploaded yet</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            {isOwnProfile ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-gray-600">
                      Total Earnings
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      ₹{formatNumber(profileUser.totalEarnings)}
                    </div>
                    <p className="text-xs text-gray-500">+12% this month</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-gray-600">
                      Avg. Views
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {profileUser.totalVideos > 0
                        ? formatNumber(
                            Math.floor(
                              profileUser.totalViews / profileUser.totalVideos
                            )
                          )
                        : "0"}
                    </div>
                    <p className="text-xs text-gray-500">per video</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-gray-600">
                      Engagement Rate
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">8.5%</div>
                    <p className="text-xs text-gray-500">Above average</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-gray-600">
                      Growth Rate
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">+15%</div>
                    <p className="text-xs text-gray-500">followers/month</p>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <div className="text-center py-12">
                <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Analytics are private</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="followers" className="space-y-6">
            <div className="text-center py-12">
              <p className="text-gray-600">Followers list coming soon</p>
            </div>
          </TabsContent>

          <TabsContent value="following" className="space-y-6">
            <div className="text-center py-12">
              <p className="text-gray-600">Following list coming soon</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
