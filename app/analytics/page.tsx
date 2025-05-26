"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from "recharts"
import { TrendingUp, Eye, Heart, DollarSign, Users, Play, Target, Zap, Crown, Award } from "lucide-react"

// Mock analytics data - in real app, fetch from your analytics service
const mockAnalytics = {
  overview: {
    totalViews: 45678,
    totalEarnings: 12450,
    totalVideos: 23,
    totalFollowers: 1234,
    avgEngagement: 8.5,
    conversionRate: 3.2,
  },
  viewsData: [
    { date: "2024-01-15", views: 1200, earnings: 340 },
    { date: "2024-01-16", views: 1450, earnings: 420 },
    { date: "2024-01-17", views: 1100, earnings: 280 },
    { date: "2024-01-18", views: 1800, earnings: 560 },
    { date: "2024-01-19", views: 2100, earnings: 680 },
    { date: "2024-01-20", views: 1900, earnings: 590 },
    { date: "2024-01-21", views: 2300, earnings: 750 },
  ],
  topVideos: [
    { id: 1, title: "React Hooks Masterclass", views: 8900, earnings: 2340, engagement: 12.5 },
    { id: 2, title: "Sunset Photography Tips", views: 6700, earnings: 890, engagement: 9.8 },
    { id: 3, title: "Quick Pasta Recipe", views: 5400, earnings: 0, engagement: 15.2 },
    { id: 4, title: "JavaScript Async/Await", views: 4200, earnings: 1560, engagement: 8.9 },
  ],
  audienceData: [
    { age: "18-24", percentage: 35, color: "#8b5cf6" },
    { age: "25-34", percentage: 40, color: "#ec4899" },
    { age: "35-44", percentage: 20, color: "#3b82f6" },
    { age: "45+", percentage: 5, color: "#10b981" },
  ],
  revenueStreams: [
    { source: "Video Sales", amount: 8900, percentage: 71.5 },
    { source: "Gifts", amount: 2800, percentage: 22.5 },
    { source: "Tips", amount: 750, percentage: 6.0 },
  ],
}

export default function AnalyticsPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [timeRange, setTimeRange] = useState("7d")

  useEffect(() => {
    const userData = localStorage.getItem("user")
    if (!userData) {
      router.push("/login")
    } else {
      setUser(JSON.parse(userData))
    }
  }, [router])

  if (!user) {
    return <div>Loading...</div>
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
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Creator Analytics</h1>
              <p className="text-sm text-gray-600">Advanced insights for {user.email}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Badge className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
              <Crown className="h-3 w-3 mr-1" />
              Pro Analytics
            </Badge>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        {/* Overview Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Views</p>
                  <p className="text-2xl font-bold">{mockAnalytics.overview.totalViews.toLocaleString()}</p>
                  <div className="flex items-center text-green-600 text-xs">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    +12.5%
                  </div>
                </div>
                <Eye className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Earnings</p>
                  <p className="text-2xl font-bold">₹{mockAnalytics.overview.totalEarnings.toLocaleString()}</p>
                  <div className="flex items-center text-green-600 text-xs">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    +8.3%
                  </div>
                </div>
                <DollarSign className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Videos</p>
                  <p className="text-2xl font-bold">{mockAnalytics.overview.totalVideos}</p>
                  <div className="flex items-center text-blue-600 text-xs">
                    <Play className="h-3 w-3 mr-1" />
                    +3 this week
                  </div>
                </div>
                <Play className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Followers</p>
                  <p className="text-2xl font-bold">{mockAnalytics.overview.totalFollowers.toLocaleString()}</p>
                  <div className="flex items-center text-green-600 text-xs">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    +15.2%
                  </div>
                </div>
                <Users className="h-8 w-8 text-pink-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Engagement</p>
                  <p className="text-2xl font-bold">{mockAnalytics.overview.avgEngagement}%</p>
                  <div className="flex items-center text-green-600 text-xs">
                    <Heart className="h-3 w-3 mr-1" />
                    Above avg
                  </div>
                </div>
                <Heart className="h-8 w-8 text-red-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Conversion</p>
                  <p className="text-2xl font-bold">{mockAnalytics.overview.conversionRate}%</p>
                  <div className="flex items-center text-orange-600 text-xs">
                    <Target className="h-3 w-3 mr-1" />
                    Industry avg
                  </div>
                </div>
                <Target className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="performance" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="audience">Audience</TabsTrigger>
            <TabsTrigger value="revenue">Revenue</TabsTrigger>
            <TabsTrigger value="predictions">AI Insights</TabsTrigger>
          </TabsList>

          <TabsContent value="performance" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Views & Earnings Trend</CardTitle>
                  <CardDescription>Last 7 days performance</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={mockAnalytics.viewsData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Area
                        type="monotone"
                        dataKey="views"
                        stackId="1"
                        stroke="#8b5cf6"
                        fill="#8b5cf6"
                        fillOpacity={0.6}
                      />
                      <Area
                        type="monotone"
                        dataKey="earnings"
                        stackId="2"
                        stroke="#ec4899"
                        fill="#ec4899"
                        fillOpacity={0.6}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Top Performing Videos</CardTitle>
                  <CardDescription>Your best content this month</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {mockAnalytics.topVideos.map((video, index) => (
                      <div key={video.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="flex items-center justify-center w-8 h-8 bg-purple-100 rounded-full">
                            <span className="text-sm font-bold text-purple-600">#{index + 1}</span>
                          </div>
                          <div>
                            <p className="font-medium text-sm">{video.title}</p>
                            <p className="text-xs text-gray-500">{video.views.toLocaleString()} views</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-green-600">₹{video.earnings}</p>
                          <p className="text-xs text-gray-500">{video.engagement}% engagement</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="audience" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Audience Demographics</CardTitle>
                  <CardDescription>Age distribution of your viewers</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={mockAnalytics.audienceData}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="percentage"
                        label={({ age, percentage }) => `${age}: ${percentage}%`}
                      >
                        {mockAnalytics.audienceData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Engagement Patterns</CardTitle>
                  <CardDescription>When your audience is most active</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Peak Hours</span>
                      <Badge>7-9 PM</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Best Days</span>
                      <Badge>Tue, Thu, Sat</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Avg. Watch Time</span>
                      <Badge>2m 34s</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Return Viewers</span>
                      <Badge>68%</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="revenue" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Revenue Streams</CardTitle>
                  <CardDescription>Breakdown of your earnings</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {mockAnalytics.revenueStreams.map((stream, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm font-medium">{stream.source}</span>
                          <span className="text-sm">₹{stream.amount.toLocaleString()}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-purple-600 to-pink-600 h-2 rounded-full"
                            style={{ width: `${stream.percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Revenue Forecast</CardTitle>
                  <CardDescription>Projected earnings for next month</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center space-y-4">
                    <div className="text-4xl font-bold text-green-600">₹18,500</div>
                    <p className="text-sm text-gray-600">Projected monthly earnings</p>
                    <div className="flex items-center justify-center text-green-600">
                      <TrendingUp className="h-4 w-4 mr-1" />
                      <span className="text-sm">+48% growth potential</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="predictions" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Zap className="h-5 w-5 mr-2 text-yellow-500" />
                    AI Recommendations
                  </CardTitle>
                  <CardDescription>Personalized insights to boost your performance</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-3 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                      <p className="text-sm font-medium text-blue-800">Optimal Upload Time</p>
                      <p className="text-xs text-blue-600">Post between 7-8 PM for 23% more engagement</p>
                    </div>
                    <div className="p-3 bg-green-50 rounded-lg border-l-4 border-green-500">
                      <p className="text-sm font-medium text-green-800">Content Suggestion</p>
                      <p className="text-xs text-green-600">Tutorial videos perform 40% better for your audience</p>
                    </div>
                    <div className="p-3 bg-purple-50 rounded-lg border-l-4 border-purple-500">
                      <p className="text-sm font-medium text-purple-800">Pricing Optimization</p>
                      <p className="text-xs text-purple-600">Consider ₹199 price point for premium content</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Award className="h-5 w-5 mr-2 text-gold-500" />
                    Achievement Unlocked
                  </CardTitle>
                  <CardDescription>Your recent milestones</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                        <Award className="h-4 w-4 text-yellow-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">Rising Star</p>
                        <p className="text-xs text-gray-500">Reached 1K followers</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <DollarSign className="h-4 w-4 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">First Earnings</p>
                        <p className="text-xs text-gray-500">Made ₹10K+ this month</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                        <Heart className="h-4 w-4 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">Engagement Master</p>
                        <p className="text-xs text-gray-500">8%+ average engagement</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
