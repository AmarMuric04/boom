"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Play,
  Upload,
  LogOut,
  BarChart3,
  Radio,
  Sparkles,
  Users,
  TrendingUp,
  Gift,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { UserAvatar } from "@/components/UserAvatar";

interface DashboardStats {
  user: {
    username: string;
    displayName: string;
    wallet: number;
    followers: number;
    following: number;
    totalEarnings: number;
    joinDate: string;
  };
  content: {
    totalVideos: number;
    totalViews: number;
    totalLikes: number;
    totalComments: number;
  };
  topVideos: Array<{
    id: string;
    title: string;
    views: number;
    likes: number;
    earnings: number;
    uploadDate: string;
  }>;
  recentGifts: Array<{
    id: string;
    amount: number;
    message: string;
    sender: {
      username: string;
      displayName: string;
      avatar?: string;
    };
    createdAt: string;
  }>;
}

export default function DashboardPage() {
  const router = useRouter();
  const { user, logout, loading } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      // This shouldn&apos;t happen due to middleware, but just in case
      router.push("/login");
    } else if (user) {
      fetchDashboardStats();
    }
  }, [user, loading, router]);

  const fetchDashboardStats = async () => {
    try {
      const response = await fetch("/api/dashboard/stats", {
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data.stats);
      }
    } catch (error) {
      console.error("Failed to fetch dashboard stats:", error);
    } finally {
      setStatsLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  if (loading || statsLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (!user || !stats) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Play className="h-8 w-8 text-purple-600" />
            <h1 className="text-2xl font-bold text-gray-900">VideoHub</h1>
          </div>
          <div className="flex items-center space-x-4">
            <Badge variant="outline" className="bg-green-100 text-green-800">
              Wallet: ₹{stats.user.wallet.toLocaleString()}
            </Badge>
            <span className="text-sm text-gray-600">
              Welcome, {stats.user.displayName}!
            </span>
            <UserAvatar />
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Creator Dashboard
          </h2>
          <p className="text-gray-600">
            Welcome back, @{stats.user.username}! Here&apos;s your performance
            overview.
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">
                Total Videos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.content.totalVideos}
              </div>
              <p className="text-xs text-gray-500">Content uploaded</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">
                Total Views
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatNumber(stats.content.totalViews)}
              </div>
              <p className="text-xs text-gray-500">Across all videos</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">
                Total Earnings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ₹{stats.user.totalEarnings.toLocaleString()}
              </div>
              <p className="text-xs text-gray-500">Lifetime earnings</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">
                Followers
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatNumber(stats.user.followers)}
              </div>
              <p className="text-xs text-gray-500">People following you</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader>
              <Play className="h-12 w-12 text-green-600 mb-4" />
              <CardTitle>Boom Feed</CardTitle>
              <CardDescription>
                Discover and watch videos from creators
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/feed">
                <Button className="w-full bg-green-600 hover:bg-green-700">
                  <Play className="h-4 w-4 mr-2" />
                  Open Feed
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Upload className="h-12 w-12 text-purple-600 mb-4" />
              <CardTitle>Upload New Video</CardTitle>
              <CardDescription>
                Share your latest content with your audience
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/upload">
                <Button className="w-full bg-purple-600 hover:bg-purple-700">
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Video
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Users className="h-12 w-12 text-blue-600 mb-4" />
              <CardTitle>Social Hub</CardTitle>
              <CardDescription>
                Follow creators and discover new content
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/following">
                <Button className="w-full bg-blue-600 hover:bg-blue-700">
                  <Users className="h-4 w-4 mr-2" />
                  Explore Creators
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Content Performance & Recent Activity */}
        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          {/* Top Videos */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="h-5 w-5 mr-2" />
                Top Performing Videos
              </CardTitle>
            </CardHeader>
            <CardContent>
              {stats.topVideos.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Upload className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No videos uploaded yet</p>
                  <Link href="/upload">
                    <Button className="mt-4" size="sm">
                      Upload Your First Video
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {stats.topVideos.map((video, index) => (
                    <div
                      key={video.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center justify-center w-8 h-8 bg-purple-100 rounded-full">
                          <span className="text-sm font-bold text-purple-600">
                            #{index + 1}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-sm line-clamp-1">
                            {video.title}
                          </p>
                          <p className="text-xs text-gray-500">
                            {formatDate(video.uploadDate)}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold">
                          {formatNumber(video.views)} views
                        </p>
                        <p className="text-xs text-gray-500">
                          ₹{video.earnings}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Gifts */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Gift className="h-5 w-5 mr-2" />
                Recent Gifts Received
              </CardTitle>
            </CardHeader>
            <CardContent>
              {stats.recentGifts.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Gift className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No gifts received yet</p>
                  <p className="text-sm">
                    Create engaging content to receive gifts from fans!
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {stats.recentGifts.map((gift) => (
                    <div
                      key={gift.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-pink-500 to-purple-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs font-bold">
                            {gift.sender.displayName.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-sm">
                            @{gift.sender.username}
                          </p>
                          <p className="text-xs text-gray-500">
                            {formatDate(gift.createdAt)}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-green-600">
                          +₹{gift.amount}
                        </p>
                        {gift.message && (
                          <p className="text-xs text-gray-500 max-w-20 truncate">
                            {gift.message}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Advanced Features */}
        <div className="mb-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">
            Advanced Creator Tools
          </h3>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-purple-100">
            <CardHeader>
              <BarChart3 className="h-12 w-12 text-purple-600 mb-4" />
              <CardTitle className="flex items-center">
                Analytics Studio
                <Badge className="ml-2 bg-purple-600 text-white text-xs">
                  Pro
                </Badge>
              </CardTitle>
              <CardDescription>
                Advanced analytics with AI insights and predictions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/analytics">
                <Button className="w-full bg-purple-600 hover:bg-purple-700">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  View Analytics
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="border-2 border-red-200 bg-gradient-to-br from-red-50 to-red-100">
            <CardHeader>
              <Radio className="h-12 w-12 text-red-600 mb-4" />
              <CardTitle className="flex items-center">
                Live Studio
                <Badge className="ml-2 bg-red-600 text-white text-xs">
                  Beta
                </Badge>
              </CardTitle>
              <CardDescription>
                Stream live to your audience with real-time chat
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/live">
                <Button className="w-full bg-red-600 hover:bg-red-700">
                  <Radio className="h-4 w-4 mr-2" />
                  Go Live
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="border-2 border-pink-200 bg-gradient-to-br from-pink-50 to-pink-100">
            <CardHeader>
              <Sparkles className="h-12 w-12 text-pink-600 mb-4" />
              <CardTitle className="flex items-center">
                AI Studio
                <Badge className="ml-2 bg-pink-600 text-white text-xs">
                  New
                </Badge>
              </CardTitle>
              <CardDescription>
                AI-powered content generation and optimization
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/ai-studio">
                <Button className="w-full bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700">
                  <Sparkles className="h-4 w-4 mr-2" />
                  Try AI Studio
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
