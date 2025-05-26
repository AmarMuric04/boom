"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Users,
  Search,
  UserPlus,
  UserCheck,
  TrendingUp,
  Star,
  Loader2,
} from "lucide-react";

interface User {
  _id: string;
  username: string;
  displayName: string;
  bio: string;
  avatar: string;
  isVerified: boolean;
  followersCount: number;
  totalVideos: number;
  totalViews?: number;
  lastActive?: string;
  followedAt?: string;
}

export default function FollowingPage() {
  const router = useRouter();
  const [suggestedUsers, setSuggestedUsers] = useState<User[]>([]);
  const [followingUsers, setFollowingUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [followingLoading, setFollowingLoading] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch suggested users and following users in parallel
      const [suggestedResponse, followingResponse] = await Promise.all([
        fetch("/api/users/suggested"),
        fetch("/api/users/following"),
      ]);

      if (suggestedResponse.ok) {
        const suggestedData = await suggestedResponse.json();
        setSuggestedUsers(suggestedData.users || []);
      }

      if (followingResponse.ok) {
        const followingData = await followingResponse.json();
        setFollowingUsers(followingData.users || []);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFollow = async (userId: string) => {
    try {
      setFollowingLoading(userId);

      const response = await fetch("/api/follow", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ targetUserId: userId }),
      });

      if (response.ok) {
        // Move user from suggested to following
        const userToFollow = suggestedUsers.find((u) => u._id === userId);
        if (userToFollow) {
          setSuggestedUsers((prev) => prev.filter((u) => u._id !== userId));
          setFollowingUsers((prev) => [
            ...prev,
            { ...userToFollow, followedAt: new Date().toISOString() },
          ]);
        }
      } else {
        const error = await response.json();
        alert(error.error || "Failed to follow user");
      }
    } catch (error) {
      console.error("Follow error:", error);
      alert("Failed to follow user");
    } finally {
      setFollowingLoading(null);
    }
  };

  const handleUnfollow = async (userId: string) => {
    try {
      setFollowingLoading(userId);

      const response = await fetch("/api/follow", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ targetUserId: userId }),
      });

      if (response.ok) {
        // Move user from following to suggested
        const userToUnfollow = followingUsers.find((u) => u._id === userId);
        if (userToUnfollow) {
          setFollowingUsers((prev) => prev.filter((u) => u._id !== userId));
          setSuggestedUsers((prev) => [...prev, userToUnfollow]);
        }
      } else {
        const error = await response.json();
        alert(error.error || "Failed to unfollow user");
      }
    } catch (error) {
      console.error("Unfollow error:", error);
      alert("Failed to unfollow user");
    } finally {
      setFollowingLoading(null);
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const getGravatarUrl = (email: string, size = 60) => {
    const hash = email
      ? require("crypto")
          .createHash("md5")
          .update(email.toLowerCase())
          .digest("hex")
      : "";
    return `https://www.gravatar.com/avatar/${hash}?s=${size}&d=identicon`;
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    );

    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;
    return `${Math.floor(diffInHours / 168)}w ago`;
  };

  const filteredSuggestions = suggestedUsers.filter(
    (user) =>
      user.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.bio.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredFollowing = followingUsers.filter(
    (user) =>
      user.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.bio.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading social hub...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" onClick={() => router.push("/dashboard")}>
              ← Back to Dashboard
            </Button>
            <div className="flex items-center space-x-2">
              <Users className="h-6 w-6 text-purple-600" />
              <h1 className="text-2xl font-bold text-gray-900">Social Hub</h1>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <Input
              placeholder="Search creators by name, username, or bio..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 py-3 text-lg"
            />
          </div>
        </div>

        <Tabs defaultValue="discover" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="discover">Discover</TabsTrigger>
            <TabsTrigger value="following">
              Following ({followingUsers.length})
            </TabsTrigger>
            <TabsTrigger value="trending">Trending</TabsTrigger>
          </TabsList>

          <TabsContent value="discover" className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-gray-900">
                Suggested for you
              </h3>
              {filteredSuggestions.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-4">No suggestions available</p>
                  <p className="text-gray-500 text-sm">
                    Try following some creators to get better suggestions
                  </p>
                </div>
              ) : (
                filteredSuggestions.map((user) => (
                  <Card
                    key={user._id}
                    className="hover:shadow-md transition-shadow"
                  >
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="relative">
                            {user.avatar ? (
                              <img
                                src={user.avatar || "/placeholder.svg"}
                                alt={user.displayName}
                                className="w-16 h-16 rounded-full object-cover"
                              />
                            ) : (
                              <div className="w-16 h-16 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 flex items-center justify-center text-white font-semibold text-lg">
                                {getInitials(user.displayName)}
                              </div>
                            )}
                            {user.isVerified && (
                              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                                <span className="text-white text-xs">✓</span>
                              </div>
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <h4 className="font-semibold text-lg">
                                {user.displayName}
                              </h4>
                              {user.totalVideos > 10 && (
                                <Badge variant="outline" className="text-xs">
                                  Creator
                                </Badge>
                              )}
                            </div>
                            <p className="text-gray-600 text-sm mb-1">
                              @{user.username}
                            </p>
                            <p className="text-gray-700 text-sm mb-2">
                              {user.bio}
                            </p>
                            <div className="flex items-center space-x-4 text-xs text-gray-500">
                              <span>
                                {formatNumber(user.followersCount)} followers
                              </span>
                              <span>•</span>
                              <span>{user.totalVideos} videos</span>
                              {user.totalViews && (
                                <>
                                  <span>•</span>
                                  <span>
                                    {formatNumber(user.totalViews)} views
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              router.push(`/profile/${user.username}`)
                            }
                          >
                            View Profile
                          </Button>
                          <Button
                            onClick={() => handleFollow(user._id)}
                            disabled={followingLoading === user._id}
                            className="bg-purple-600 hover:bg-purple-700"
                          >
                            {followingLoading === user._id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <>
                                <UserPlus className="h-4 w-4 mr-2" />
                                Follow
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="following" className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-gray-900">
                People you follow
              </h3>
              {filteredFollowing.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-4">
                    You're not following anyone yet
                  </p>
                  <Button onClick={() => router.push("/feed")}>
                    Discover Creators
                  </Button>
                </div>
              ) : (
                filteredFollowing.map((user) => (
                  <Card
                    key={user._id}
                    className="hover:shadow-md transition-shadow"
                  >
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="relative">
                            {user.avatar ? (
                              <img
                                src={user.avatar || "/placeholder.svg"}
                                alt={user.displayName}
                                className="w-16 h-16 rounded-full object-cover"
                              />
                            ) : (
                              <div className="w-16 h-16 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 flex items-center justify-center text-white font-semibold text-lg">
                                {getInitials(user.displayName)}
                              </div>
                            )}
                            {user.isVerified && (
                              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                                <span className="text-white text-xs">✓</span>
                              </div>
                            )}
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-lg mb-1">
                              {user.displayName}
                            </h4>
                            <p className="text-gray-600 text-sm mb-1">
                              @{user.username}
                            </p>
                            <p className="text-gray-700 text-sm mb-2">
                              {user.bio}
                            </p>
                            <div className="flex items-center space-x-4 text-xs text-gray-500">
                              <span>
                                {formatNumber(user.followersCount)} followers
                              </span>
                              <span>•</span>
                              <span>{user.totalVideos} videos</span>
                              {user.lastActive && (
                                <>
                                  <span>•</span>
                                  <span>
                                    Active {formatTimeAgo(user.lastActive)}
                                  </span>
                                </>
                              )}
                              {user.followedAt && (
                                <>
                                  <span>•</span>
                                  <span>
                                    Followed {formatTimeAgo(user.followedAt)}
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              router.push(`/profile/${user.username}`)
                            }
                          >
                            View Profile
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => handleUnfollow(user._id)}
                            disabled={followingLoading === user._id}
                            className="text-gray-600 hover:text-red-600 hover:border-red-300"
                          >
                            {followingLoading === user._id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <>
                                <UserCheck className="h-4 w-4 mr-2" />
                                Following
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="trending" className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-gray-900">
                Trending Creators
              </h3>
              {suggestedUsers
                .sort((a, b) => b.followersCount - a.followersCount)
                .slice(0, 10)
                .map((user, index) => (
                  <Card
                    key={user._id}
                    className="hover:shadow-md transition-shadow"
                  >
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-3">
                            <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full">
                              <span className="text-white font-bold text-sm">
                                #{index + 1}
                              </span>
                            </div>
                            <TrendingUp className="h-5 w-5 text-green-500" />
                          </div>
                          <div className="relative">
                            {user.avatar ? (
                              <img
                                src={user.avatar || "/placeholder.svg"}
                                alt={user.displayName}
                                className="w-16 h-16 rounded-full object-cover"
                              />
                            ) : (
                              <div className="w-16 h-16 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 flex items-center justify-center text-white font-semibold text-lg">
                                {getInitials(user.displayName)}
                              </div>
                            )}
                            {user.isVerified && (
                              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                                <span className="text-white text-xs">✓</span>
                              </div>
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <h4 className="font-semibold text-lg">
                                {user.displayName}
                              </h4>
                              {user.totalVideos > 10 && (
                                <Badge variant="outline" className="text-xs">
                                  Creator
                                </Badge>
                              )}
                              {index < 3 && (
                                <Star className="h-4 w-4 text-yellow-500" />
                              )}
                            </div>
                            <p className="text-gray-600 text-sm mb-1">
                              @{user.username}
                            </p>
                            <p className="text-gray-700 text-sm mb-2">
                              {user.bio}
                            </p>
                            <div className="flex items-center space-x-4 text-xs text-gray-500">
                              <span>
                                {formatNumber(user.followersCount)} followers
                              </span>
                              <span>•</span>
                              <span>{user.totalVideos} videos</span>
                              {user.totalViews && (
                                <>
                                  <span>•</span>
                                  <span>
                                    {formatNumber(user.totalViews)} views
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              router.push(`/profile/${user.username}`)
                            }
                          >
                            View Profile
                          </Button>
                          <Button
                            onClick={() => handleFollow(user._id)}
                            disabled={followingLoading === user._id}
                            className="bg-purple-600 hover:bg-purple-700"
                          >
                            {followingLoading === user._id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <>
                                <UserPlus className="h-4 w-4 mr-2" />
                                Follow
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
