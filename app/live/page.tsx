"use client";

import type React from "react";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  MessageCircle,
  Gift,
  Heart,
  Share,
  Settings,
  Radio,
  Eye,
  DollarSign,
} from "lucide-react";

export default function LiveStreamPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [isLive, setIsLive] = useState(false);
  const [viewers, setViewers] = useState(0);
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState("");
  const [streamTitle, setStreamTitle] = useState("");
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isAudioOn, setIsAudioOn] = useState(true);
  const [earnings, setEarnings] = useState(0);

  useEffect(() => {
    // Component is protected by middleware, so we can assume user is authenticated
    // No need to check localStorage or redirect
  }, []);

  // Simulate live viewer count and comments
  useEffect(() => {
    if (isLive) {
      const interval = setInterval(() => {
        setViewers((prev) => prev + Math.floor(Math.random() * 5) - 2);

        // Simulate random comments
        if (Math.random() > 0.7) {
          const mockComments = [
            "Great content! 🔥",
            "Love this stream!",
            "Can you explain that again?",
            "Amazing work! 👏",
            "This is so helpful!",
          ];
          const randomComment =
            mockComments[Math.floor(Math.random() * mockComments.length)];
          const randomUser = `User${Math.floor(Math.random() * 1000)}`;

          setComments((prev) => [
            {
              id: Date.now(),
              user: randomUser,
              message: randomComment,
              timestamp: new Date().toISOString(),
            },
            ...prev.slice(0, 49),
          ]); // Keep only last 50 comments
        }
      }, 3000);

      return () => clearInterval(interval);
    }
  }, [isLive]);

  const startStream = () => {
    if (!streamTitle.trim()) {
      alert("Please enter a stream title");
      return;
    }
    setIsLive(true);
    setViewers(Math.floor(Math.random() * 20) + 5);
  };

  const endStream = () => {
    setIsLive(false);
    setViewers(0);
    setComments([]);
  };

  const sendComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    const comment = {
      id: Date.now(),
      user: user.email.split("@")[0],
      message: newComment.trim(),
      timestamp: new Date().toISOString(),
    };

    setComments((prev) => [comment, ...prev]);
    setNewComment("");
  };

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
              <Radio className="h-6 w-6 text-red-500" />
              <h1 className="text-2xl font-bold text-gray-900">Live Studio</h1>
              {isLive && (
                <Badge className="bg-red-500 text-white animate-pulse">
                  LIVE
                </Badge>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-4">
            {isLive && (
              <>
                <div className="flex items-center space-x-2 text-sm">
                  <Eye className="h-4 w-4" />
                  <span>{viewers} viewers</span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <DollarSign className="h-4 w-4 text-green-500" />
                  <span>₹{earnings}</span>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Stream Area */}
          <div className="lg:col-span-2 space-y-6">
            {/* Stream Setup */}
            {!isLive && (
              <Card>
                <CardHeader>
                  <CardTitle>Start Your Live Stream</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Stream Title</label>
                    <Input
                      placeholder="What's your stream about?"
                      value={streamTitle}
                      onChange={(e) => setStreamTitle(e.target.value)}
                    />
                  </div>
                  <Button
                    onClick={startStream}
                    className="w-full bg-red-500 hover:bg-red-600"
                    disabled={!streamTitle.trim()}
                  >
                    <Radio className="h-4 w-4 mr-2" />
                    Go Live
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Live Stream View */}
            <Card>
              <CardContent className="p-0">
                <div className="relative bg-black aspect-video flex items-center justify-center">
                  {isVideoOn ? (
                    <div className="text-center text-white">
                      <Video className="h-16 w-16 mx-auto mb-4" />
                      <p className="text-lg">Live Camera Feed</p>
                      {isLive && (
                        <p className="text-sm opacity-75">{streamTitle}</p>
                      )}
                    </div>
                  ) : (
                    <div className="text-center text-white">
                      <VideoOff className="h-16 w-16 mx-auto mb-4" />
                      <p className="text-lg">Camera Off</p>
                    </div>
                  )}

                  {isLive && (
                    <div className="absolute top-4 left-4">
                      <Badge className="bg-red-500 text-white">● LIVE</Badge>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Stream Controls */}
            {isLive && (
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <Button
                        variant={isVideoOn ? "default" : "destructive"}
                        size="sm"
                        onClick={() => setIsVideoOn(!isVideoOn)}
                      >
                        {isVideoOn ? (
                          <Video className="h-4 w-4" />
                        ) : (
                          <VideoOff className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        variant={isAudioOn ? "default" : "destructive"}
                        size="sm"
                        onClick={() => setIsAudioOn(!isAudioOn)}
                      >
                        {isAudioOn ? (
                          <Mic className="h-4 w-4" />
                        ) : (
                          <MicOff className="h-4 w-4" />
                        )}
                      </Button>
                      <Button variant="outline" size="sm">
                        <Settings className="h-4 w-4" />
                      </Button>
                    </div>
                    <Button variant="destructive" onClick={endStream}>
                      End Stream
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Chat and Interactions */}
          <div className="space-y-6">
            {/* Live Stats */}
            {isLive && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Live Stats</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm">Viewers</span>
                    <Badge>{viewers}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Duration</span>
                    <Badge>12:34</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Gifts Received</span>
                    <Badge>₹{earnings}</Badge>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Live Chat */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MessageCircle className="h-5 w-5 mr-2" />
                  Live Chat
                </CardTitle>
              </CardHeader>
              <CardContent>
                {/* Chat Messages */}
                <div className="h-64 overflow-y-auto space-y-2 mb-4 p-2 bg-gray-50 rounded">
                  {comments.length === 0 ? (
                    <p className="text-center text-gray-500 text-sm">
                      {isLive
                        ? "Chat will appear here..."
                        : "Start streaming to see chat"}
                    </p>
                  ) : (
                    comments.map((comment) => (
                      <div key={comment.id} className="text-sm">
                        <span className="font-semibold text-purple-600">
                          {comment.user}:
                        </span>
                        <span className="ml-2">{comment.message}</span>
                      </div>
                    ))
                  )}
                </div>

                {/* Chat Input */}
                <form onSubmit={sendComment}>
                  <div className="flex space-x-2">
                    <Input
                      placeholder="Type a message..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      disabled={!isLive}
                    />
                    <Button
                      type="submit"
                      size="sm"
                      disabled={!isLive || !newComment.trim()}
                    >
                      Send
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            {isLive && (
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button variant="outline" className="w-full justify-start">
                    <Gift className="h-4 w-4 mr-2" />
                    Send Gift Request
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Share className="h-4 w-4 mr-2" />
                    Share Stream
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Heart className="h-4 w-4 mr-2" />
                    Thank Viewers
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
