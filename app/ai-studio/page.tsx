"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Sparkles,
  Wand2,
  ImageIcon,
  Type,
  Palette,
  Zap,
  Download,
  Copy,
  RefreshCw,
  Star,
  TrendingUp,
} from "lucide-react"

export default function AIStudioPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [prompt, setPrompt] = useState("")
  const [generatedContent, setGeneratedContent] = useState("")

  useEffect(() => {
    const userData = localStorage.getItem("user")
    if (!userData) {
      router.push("/login")
    } else {
      setUser(JSON.parse(userData))
    }
  }, [router])

  const generateContent = async (type: string) => {
    setIsGenerating(true)

    // Simulate AI generation
    await new Promise((resolve) => setTimeout(resolve, 2000))

    const mockContent = {
      title: "10 Amazing React Hooks You Need to Know in 2024",
      description:
        "Discover the most powerful React hooks that will revolutionize your development workflow. From custom hooks to advanced patterns, this comprehensive guide covers everything you need to build better React applications.",
      tags: "#React #JavaScript #WebDev #Programming #Tutorial",
      thumbnail: "A modern, clean thumbnail with React logo and code snippets in the background",
    }

    setGeneratedContent(JSON.stringify(mockContent, null, 2))
    setIsGenerating(false)
  }

  const trendingTopics = [
    { topic: "React 18 Features", popularity: 95 },
    { topic: "AI in Web Development", popularity: 88 },
    { topic: "Next.js 14", popularity: 82 },
    { topic: "TypeScript Tips", popularity: 79 },
    { topic: "CSS Grid Layouts", popularity: 75 },
  ]

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
            <div className="flex items-center space-x-2">
              <Sparkles className="h-6 w-6 text-purple-500" />
              <h1 className="text-2xl font-bold text-gray-900">AI Studio</h1>
              <Badge className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">Beta</Badge>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main AI Tools */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Wand2 className="h-5 w-5 mr-2 text-purple-500" />
                  AI Content Generator
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="content" className="space-y-4">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="content">Content</TabsTrigger>
                    <TabsTrigger value="thumbnail">Thumbnail</TabsTrigger>
                    <TabsTrigger value="title">Title</TabsTrigger>
                    <TabsTrigger value="tags">Tags</TabsTrigger>
                  </TabsList>

                  <TabsContent value="content" className="space-y-4">
                    <div>
                      <label className="text-sm font-medium">Describe your video content</label>
                      <Textarea
                        placeholder="e.g., A tutorial about React hooks for beginners..."
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        className="mt-2"
                        rows={3}
                      />
                    </div>
                    <Button
                      onClick={() => generateContent("content")}
                      disabled={isGenerating || !prompt.trim()}
                      className="w-full bg-gradient-to-r from-purple-600 to-pink-600"
                    >
                      {isGenerating ? (
                        <>
                          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-4 w-4 mr-2" />
                          Generate Content
                        </>
                      )}
                    </Button>
                  </TabsContent>

                  <TabsContent value="thumbnail" className="space-y-4">
                    <div>
                      <label className="text-sm font-medium">Thumbnail Style</label>
                      <div className="grid grid-cols-2 gap-3 mt-2">
                        <Button variant="outline" className="h-20 flex-col">
                          <ImageIcon className="h-6 w-6 mb-1" />
                          <span className="text-xs">Modern</span>
                        </Button>
                        <Button variant="outline" className="h-20 flex-col">
                          <Palette className="h-6 w-6 mb-1" />
                          <span className="text-xs">Colorful</span>
                        </Button>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="title" className="space-y-4">
                    <div>
                      <label className="text-sm font-medium">Video Topic</label>
                      <Input placeholder="e.g., React hooks tutorial" className="mt-2" />
                    </div>
                    <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600">
                      <Type className="h-4 w-4 mr-2" />
                      Generate Catchy Titles
                    </Button>
                  </TabsContent>

                  <TabsContent value="tags" className="space-y-4">
                    <div>
                      <label className="text-sm font-medium">Content Category</label>
                      <Input placeholder="e.g., Programming, Tutorial, React" className="mt-2" />
                    </div>
                    <Button className="w-full bg-gradient-to-r from-green-600 to-blue-600">
                      <Zap className="h-4 w-4 mr-2" />
                      Generate Trending Tags
                    </Button>
                  </TabsContent>
                </Tabs>

                {/* Generated Content Display */}
                {generatedContent && (
                  <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium">Generated Content</h4>
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline">
                          <Copy className="h-3 w-3 mr-1" />
                          Copy
                        </Button>
                        <Button size="sm" variant="outline">
                          <Download className="h-3 w-3 mr-1" />
                          Export
                        </Button>
                      </div>
                    </div>
                    <pre className="text-sm text-gray-700 whitespace-pre-wrap">{generatedContent}</pre>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* AI Insights */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2 text-green-500" />
                  Content Performance Predictor
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-green-50 rounded-lg border-l-4 border-green-500">
                    <h4 className="font-medium text-green-800">High Potential Content</h4>
                    <p className="text-sm text-green-600 mt-1">
                      React tutorials have 85% higher engagement in your audience
                    </p>
                  </div>
                  <div className="p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                    <h4 className="font-medium text-blue-800">Optimal Length</h4>
                    <p className="text-sm text-blue-600 mt-1">5-7 minute videos perform best for your content type</p>
                  </div>
                  <div className="p-4 bg-purple-50 rounded-lg border-l-4 border-purple-500">
                    <h4 className="font-medium text-purple-800">Best Upload Time</h4>
                    <p className="text-sm text-purple-600 mt-1">Tuesday 7-8 PM shows highest engagement rates</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Trending Topics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Star className="h-5 w-5 mr-2 text-yellow-500" />
                  Trending Topics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {trendingTopics.map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm font-medium">{item.topic}</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-12 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-purple-600 to-pink-600 h-2 rounded-full"
                            style={{ width: `${item.popularity}%` }}
                          ></div>
                        </div>
                        <span className="text-xs text-gray-500">{item.popularity}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quick Templates */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Templates</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Button variant="outline" className="w-full justify-start text-sm">
                    📚 Tutorial Template
                  </Button>
                  <Button variant="outline" className="w-full justify-start text-sm">
                    🎯 Tips & Tricks
                  </Button>
                  <Button variant="outline" className="w-full justify-start text-sm">
                    🔥 Trending Topic
                  </Button>
                  <Button variant="outline" className="w-full justify-start text-sm">
                    💡 Problem Solver
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* AI Credits */}
            <Card>
              <CardHeader>
                <CardTitle>AI Credits</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center space-y-3">
                  <div className="text-3xl font-bold text-purple-600">47</div>
                  <p className="text-sm text-gray-600">Credits remaining</p>
                  <Button size="sm" className="w-full">
                    Buy More Credits
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
