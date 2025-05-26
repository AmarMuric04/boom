"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { UserAvatar } from "@/components/UserAvatar";
import { useAuth } from "@/hooks/useAuth";
import {
  Play,
  Upload,
  Users,
  Star,
  TrendingUp,
  Shield,
  Zap,
  Gift,
  DollarSign,
  Eye,
  Heart,
} from "lucide-react";

export default function HomePage() {
  const { user, loading } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="relative">
              <Play className="h-8 w-8 text-purple-600" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-pink-500 rounded-full animate-pulse"></div>
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              VideoHub
            </h1>
          </div>

          <div className="flex items-center space-x-4">
            {!loading && (
              <>
                {user ? (
                  // Show user avatar and quick actions when logged in
                  <div className="flex items-center space-x-3">
                    <Link href="/feed">
                      <Button variant="ghost" className="hover:bg-purple-50">
                        Explore
                      </Button>
                    </Link>
                    <Link href="/upload">
                      <Button variant="ghost" className="hover:bg-purple-50">
                        <Upload className="h-4 w-4 mr-2" />
                        Upload
                      </Button>
                    </Link>
                    <UserAvatar />
                  </div>
                ) : (
                  // Show auth buttons when not logged in
                  <>
                    <Link href="/login">
                      <Button variant="ghost" className="hover:bg-purple-50">
                        Login
                      </Button>
                    </Link>
                    <Link href="/register">
                      <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                        Sign Up Free
                      </Button>
                    </Link>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center relative overflow-hidden">
        {/* Background decorations */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
          <div className="absolute top-40 left-1/2 w-80 h-80 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
        </div>

        <div className="relative z-10">
          <Badge className="mb-6 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800 border-purple-200">
            🚀 Join 10,000+ Creators Already Earning
          </Badge>

          <h2 className="text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Create, Share &
            <br />
            <span className="bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent">
              Monetize Your Videos
            </span>
          </h2>

          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
            The ultimate platform for creators to upload short-form videos,
            share premium long-form content, and earn money through purchases
            and gifts from your audience.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6 mb-12">
            {user ? (
              // Show different CTAs for logged in users
              <>
                <Link href="/upload">
                  <Button
                    size="lg"
                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-lg px-8 py-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    Upload Your First Video
                    <Upload className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link href="/feed">
                  <Button
                    size="lg"
                    variant="outline"
                    className="text-lg px-8 py-4 rounded-full border-2 hover:bg-purple-50"
                  >
                    Explore Videos
                    <Play className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              </>
            ) : (
              // Show signup CTAs for non-logged in users
              <>
                <Link href="/register">
                  <Button
                    size="lg"
                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-lg px-8 py-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    Start Creating Today
                    <Zap className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link href="/login">
                  <Button
                    size="lg"
                    variant="outline"
                    className="text-lg px-8 py-4 rounded-full border-2 hover:bg-purple-50"
                  >
                    I'm Already a Creator
                    <Play className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-2xl mx-auto">
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">10K+</div>
              <div className="text-sm text-gray-600">Active Creators</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-pink-600">50K+</div>
              <div className="text-sm text-gray-600">Videos Uploaded</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">₹2M+</div>
              <div className="text-sm text-gray-600">Creator Earnings</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">100K+</div>
              <div className="text-sm text-gray-600">Happy Viewers</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h3 className="text-4xl font-bold text-gray-900 mb-4">
            Everything You Need to
            <span className="text-purple-600"> Succeed</span>
          </h3>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Powerful tools and features designed to help creators build their
            audience and maximize their earnings
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-200">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 p-3 bg-purple-600 rounded-full w-fit group-hover:scale-110 transition-transform duration-300">
                <Upload className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-xl">Easy Upload</CardTitle>
              <CardDescription className="text-gray-600">
                Upload short-form videos directly or share long-form content via
                URLs. Support for MP4 files up to 10MB.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-pink-50 to-pink-100 hover:from-pink-100 hover:to-pink-200">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 p-3 bg-pink-600 rounded-full w-fit group-hover:scale-110 transition-transform duration-300">
                <DollarSign className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-xl">Monetize Content</CardTitle>
              <CardDescription className="text-gray-600">
                Set prices for premium long-form content and earn from your
                work. Multiple revenue streams available.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 p-3 bg-blue-600 rounded-full w-fit group-hover:scale-110 transition-transform duration-300">
                <Gift className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-xl">Receive Gifts</CardTitle>
              <CardDescription className="text-gray-600">
                Fans can send you gifts directly while watching your content.
                Build stronger connections with your audience.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-green-50 to-green-100 hover:from-green-100 hover:to-green-200">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 p-3 bg-green-600 rounded-full w-fit group-hover:scale-110 transition-transform duration-300">
                <Eye className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-xl">Unified Feed</CardTitle>
              <CardDescription className="text-gray-600">
                Your content appears in our TikTok-style feed with auto-play
                features and maximum discoverability.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-indigo-50 to-indigo-100 hover:from-indigo-100 hover:to-indigo-200">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 p-3 bg-indigo-600 rounded-full w-fit group-hover:scale-110 transition-transform duration-300">
                <TrendingUp className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-xl">Analytics Dashboard</CardTitle>
              <CardDescription className="text-gray-600">
                Track your performance with detailed analytics on views,
                earnings, and audience engagement.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-orange-50 to-orange-100 hover:from-orange-100 hover:to-orange-200">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 p-3 bg-orange-600 rounded-full w-fit group-hover:scale-110 transition-transform duration-300">
                <Shield className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-xl">Secure Platform</CardTitle>
              <CardDescription className="text-gray-600">
                Your content and earnings are protected with enterprise-grade
                security and reliable payment processing.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="bg-white py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h3 className="text-4xl font-bold text-gray-900 mb-4">
              Start Earning in
              <span className="text-purple-600"> 3 Simple Steps</span>
            </h3>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Join thousands of creators who are already building their audience
              and earning money
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-12 max-w-5xl mx-auto">
            <div className="text-center relative">
              <div className="mx-auto mb-6 p-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full w-fit">
                <Users className="h-10 w-10 text-white" />
              </div>
              <div className="absolute -top-2 -right-2 bg-purple-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold">
                1
              </div>
              <h4 className="text-xl font-semibold mb-3">Create Account</h4>
              <p className="text-gray-600">
                Sign up for free and get ₹500 in your wallet to start exploring
                the platform immediately.
              </p>
            </div>

            <div className="text-center relative">
              <div className="mx-auto mb-6 p-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full w-fit">
                <Upload className="h-10 w-10 text-white" />
              </div>
              <div className="absolute -top-2 -right-2 bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold">
                2
              </div>
              <h4 className="text-xl font-semibold mb-3">Upload Content</h4>
              <p className="text-gray-600">
                Share your short-form videos or premium long-form content. Set
                your own prices and descriptions.
              </p>
            </div>

            <div className="text-center relative">
              <div className="mx-auto mb-6 p-4 bg-gradient-to-r from-green-600 to-blue-600 rounded-full w-fit">
                <TrendingUp className="h-10 w-10 text-white" />
              </div>
              <div className="absolute -top-2 -right-2 bg-green-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold">
                3
              </div>
              <h4 className="text-xl font-semibold mb-3">Start Earning</h4>
              <p className="text-gray-600">
                Earn money from video purchases, gifts from fans, and build a
                sustainable income from your creativity.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h3 className="text-4xl font-bold text-gray-900 mb-4">
            Loved by
            <span className="text-purple-600"> Creators Worldwide</span>
          </h3>
          <p className="text-xl text-gray-600">
            See what our community has to say about VideoHub
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <span className="font-bold text-purple-600">SM</span>
                </div>
                <div>
                  <div className="font-semibold">Sarah Martinez</div>
                  <div className="text-sm text-gray-500">Lifestyle Creator</div>
                </div>
              </div>
              <div className="flex space-x-1 mb-3">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className="h-4 w-4 fill-yellow-400 text-yellow-400"
                  />
                ))}
              </div>
              <CardDescription className="text-gray-700">
                "VideoHub changed my life! I've earned over ₹50,000 in just 3
                months. The gifting feature is amazing - my fans love supporting
                me directly."
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardHeader>
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="font-bold text-blue-600">RK</span>
                </div>
                <div>
                  <div className="font-semibold">Raj Kumar</div>
                  <div className="text-sm text-gray-500">Tech Educator</div>
                </div>
              </div>
              <div className="flex space-x-1 mb-3">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className="h-4 w-4 fill-yellow-400 text-yellow-400"
                  />
                ))}
              </div>
              <CardDescription className="text-gray-700">
                "Perfect platform for educational content. I sell my coding
                tutorials and the audience engagement is incredible. Easy to use
                and great support!"
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardHeader>
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center">
                  <span className="font-bold text-pink-600">AP</span>
                </div>
                <div>
                  <div className="font-semibold">Anita Patel</div>
                  <div className="text-sm text-gray-500">Dance Instructor</div>
                </div>
              </div>
              <div className="flex space-x-1 mb-3">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className="h-4 w-4 fill-yellow-400 text-yellow-400"
                  />
                ))}
              </div>
              <CardDescription className="text-gray-700">
                "The auto-play feature in the feed gets my dance videos so much
                visibility! I've built a community of 5000+ followers in just 2
                months."
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 py-20">
        <div className="container mx-auto px-4 text-center">
          <h3 className="text-4xl font-bold text-white mb-6">
            Ready to Turn Your Passion into Profit?
          </h3>
          <p className="text-xl text-purple-100 mb-8 max-w-2xl mx-auto">
            Join VideoHub today and start building your creator empire. Get ₹500
            free in your wallet when you sign up!
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
            {user ? (
              <>
                <Link href="/upload">
                  <Button
                    size="lg"
                    className="bg-white text-purple-600 hover:bg-gray-100 text-lg px-8 py-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    Upload Your First Video
                    <Upload className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link href="/dashboard">
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-white text-white hover:bg-white hover:text-purple-600 text-lg px-8 py-4 rounded-full"
                  >
                    View Dashboard
                    <TrendingUp className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              </>
            ) : (
              <>
                <Link href="/register">
                  <Button
                    size="lg"
                    className="bg-white text-purple-600 hover:bg-gray-100 text-lg px-8 py-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    Start Creating Now
                    <Heart className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link href="/feed">
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-white text-white hover:bg-white hover:text-purple-600 text-lg px-8 py-4 rounded-full"
                  >
                    Explore Videos
                    <Play className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Play className="h-6 w-6 text-purple-400" />
                <span className="text-xl font-bold">VideoHub</span>
              </div>
              <p className="text-gray-400">
                The ultimate platform for creators to monetize their video
                content and build lasting relationships with their audience.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Platform</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="/feed" className="hover:text-white">
                    Explore Videos
                  </Link>
                </li>
                <li>
                  <Link href="/upload" className="hover:text-white">
                    Upload Content
                  </Link>
                </li>
                <li>
                  <Link href="/dashboard" className="hover:text-white">
                    Creator Dashboard
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="#" className="hover:text-white">
                    Help Center
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Community Guidelines
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Contact Us
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="#" className="hover:text-white">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Terms of Service
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Cookie Policy
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>
              &copy; 2024 VideoHub. All rights reserved. Made with ❤️ for
              creators worldwide.
            </p>
          </div>
        </div>
      </footer>

      <style jsx>{`
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
}
