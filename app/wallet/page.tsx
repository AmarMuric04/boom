"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  ArrowLeft,
  Wallet,
  TrendingUp,
  ShoppingBag,
  Gift,
  Plus,
  Play,
  Calendar,
  User,
} from "lucide-react";

interface WalletData {
  wallet: {
    balance: number;
    totalEarnings: number;
  };
  purchases: Array<{
    _id: string;
    amount: number;
    createdAt: string;
    video: {
      _id: string;
      title: string;
      thumbnail?: string;
      price: number;
    };
  }>;
  giftsSent: Array<{
    _id: string;
    amount: number;
    message: string;
    createdAt: string;
    recipient: {
      username: string;
      displayName: string;
      avatar?: string;
    };
    video?: {
      title: string;
      thumbnail?: string;
    };
  }>;
  giftsReceived: Array<{
    _id: string;
    amount: number;
    message: string;
    createdAt: string;
    sender: {
      username: string;
      displayName: string;
      avatar?: string;
    };
    video?: {
      title: string;
      thumbnail?: string;
    };
  }>;
}

export default function WalletPage() {
  const router = useRouter();
  const [walletData, setWalletData] = useState<WalletData | null>(null);
  const [loading, setLoading] = useState(true);
  const [topUpAmount, setTopUpAmount] = useState("");
  const [topUpLoading, setTopUpLoading] = useState(false);
  const [isTopUpOpen, setIsTopUpOpen] = useState(false);

  useEffect(() => {
    loadWalletData();
  }, []);

  const loadWalletData = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/wallet");
      if (response.ok) {
        const data = await response.json();
        const balance = Number(localStorage.getItem("userWallet"));

        data.wallet.balance = balance;

        setWalletData(data);
      } else {
        console.error("Failed to load wallet data");
      }
    } catch (error) {
      console.error("Error loading wallet data:", error);
    } finally {
      setLoading(false);
    }
  };

  console.log(walletData);

  const handleTopUp = async () => {
    const amount = Number.parseInt(topUpAmount);
    if (!amount || amount <= 0 || amount > 10000) {
      alert("Please enter a valid amount between ₹1 and ₹10,000");
      return;
    }

    try {
      setTopUpLoading(true);
      const response = await fetch("/api/wallet", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ amount }),
      });

      if (response.ok) {
        const data = await response.json();
        alert(data.message);
        setTopUpAmount("");
        setIsTopUpOpen(false);
        loadWalletData(); // Refresh data
        const currentBalance = Number(localStorage.getItem("userWallet"));

        localStorage.setItem("userWallet", currentBalance + Number(amount));
      } else {
        const errorData = await response.json();
        alert(errorData.error || "Top up failed");
      }
    } catch (error) {
      console.error("Top up error:", error);
      alert("Top up failed. Please try again.");
    } finally {
      setTopUpLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-400"></div>
      </div>
    );
  }

  if (!walletData) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">
            Failed to load wallet
          </h2>
          <Button onClick={() => router.push("/feed")}>Go Back</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <header className="bg-black/90 backdrop-blur-sm border-b border-gray-800 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.back()}
              className="text-gray-300 hover:text-white"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back
            </Button>
            <div className="flex items-center space-x-2">
              <Wallet className="h-7 w-7 text-purple-400" />
              <h1 className="text-xl font-bold text-white">My Wallet</h1>
            </div>
          </div>
          <Dialog open={isTopUpOpen} onOpenChange={setIsTopUpOpen}>
            <DialogTrigger asChild>
              <Button className="bg-purple-600 hover:bg-purple-700">
                <Plus className="h-4 w-4 mr-2" />
                Top Up
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-gray-900 border-gray-700">
              <DialogHeader>
                <DialogTitle className="text-white">Top Up Wallet</DialogTitle>
                <DialogDescription className="text-gray-400">
                  Add money to your wallet to purchase videos and send gifts.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="amount" className="text-white">
                    Amount (₹)
                  </Label>
                  <Input
                    id="amount"
                    type="number"
                    placeholder="Enter amount"
                    value={topUpAmount}
                    onChange={(e) => setTopUpAmount(e.target.value)}
                    min="1"
                    max="10000"
                    className="bg-gray-800 border-gray-600 text-white"
                  />
                  <p className="text-sm text-gray-400 mt-1">
                    Minimum: ₹1, Maximum: ₹10,000
                  </p>
                </div>
                <div className="flex space-x-2">
                  <Button
                    onClick={() => setTopUpAmount("100")}
                    className="border-gray-600 text-gray-300 hover:bg-gray-800"
                  >
                    ₹100
                  </Button>
                  <Button
                    onClick={() => setTopUpAmount("500")}
                    className="border-gray-600 text-gray-300 hover:bg-gray-800"
                  >
                    ₹500
                  </Button>
                  <Button
                    onClick={() => setTopUpAmount("1000")}
                    className="border-gray-600 text-gray-300 hover:bg-gray-800"
                  >
                    ₹1000
                  </Button>
                </div>
                <Button
                  onClick={handleTopUp}
                  disabled={topUpLoading}
                  className="w-full bg-purple-600 hover:bg-purple-700"
                >
                  {topUpLoading ? "Processing..." : "Add Money"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </header>

      {/* Content */}
      <div className="container mx-auto px-4 py-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Wallet Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-gradient-to-br from-purple-900 to-purple-800 border-purple-600">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Wallet className="h-5 w-5 mr-2" />
                  Current Balance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-white">
                  ₹{walletData.wallet.balance}
                </div>
                <p className="text-purple-200 text-sm mt-1">
                  Available to spend
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-900 to-green-800 border-green-600">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2" />
                  Total Earnings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-white">
                  ₹{walletData.wallet.totalEarnings}
                </div>
                <p className="text-green-200 text-sm mt-1">
                  From videos and gifts
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Activity Tabs */}
          <Tabs defaultValue="purchases" className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-gray-800">
              <TabsTrigger
                value="purchases"
                className="text-gray-300 data-[state=active]:text-black"
              >
                <ShoppingBag className="h-4 w-4 mr-2" />
                Purchases
              </TabsTrigger>
              <TabsTrigger
                value="gifts-received"
                className="text-gray-300 data-[state=active]:text-black"
              >
                <Gift className="h-4 w-4 mr-2" />
                Gifts Received
              </TabsTrigger>
              <TabsTrigger
                value="gifts-sent"
                className="text-gray-300 data-[state=active]:text-black"
              >
                <Gift className="h-4 w-4 mr-2" />
                Gifts Sent
              </TabsTrigger>
            </TabsList>

            <TabsContent value="purchases" className="space-y-4">
              <Card className="bg-gray-900 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">Recent Purchases</CardTitle>
                  <CardDescription className="text-gray-400">
                    Videos you've bought
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {walletData.purchases.length === 0 ? (
                    <div className="text-center py-8">
                      <ShoppingBag className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                      <p className="text-gray-400">No purchases yet</p>
                      <Button
                        onClick={() => router.push("/feed")}
                        className="mt-4 border-gray-600 text-gray-300 hover:bg-gray-800"
                      >
                        Browse Videos
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {walletData.purchases.map((purchase) => (
                        <div
                          key={purchase._id}
                          className="flex items-center space-x-4 p-4 bg-gray-800 rounded-lg hover:bg-gray-750 transition-colors cursor-pointer"
                          onClick={() =>
                            router.push(`/player/${purchase.video._id}`)
                          }
                        >
                          <div className="w-16 h-12 bg-gray-700 rounded overflow-hidden flex-shrink-0">
                            {purchase.video.thumbnail ? (
                              <img
                                src={
                                  purchase.video.thumbnail || "/placeholder.svg"
                                }
                                alt={purchase.video.title}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Play className="h-6 w-6 text-gray-500" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1">
                            <h4 className="text-white font-medium">
                              {purchase.video.title}
                            </h4>
                            <div className="flex items-center space-x-2 mt-1">
                              <Calendar className="h-4 w-4 text-gray-400" />
                              <span className="text-gray-400 text-sm">
                                {formatDate(purchase.createdAt)}
                              </span>
                            </div>
                          </div>
                          <Badge
                            variant="outline"
                            className="bg-red-900/50 text-red-400 border-red-600"
                          >
                            -₹{purchase.amount}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="gifts-received" className="space-y-4">
              <Card className="bg-gray-900 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">Gifts Received</CardTitle>
                  <CardDescription className="text-gray-400">
                    Money received from other users
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {walletData.giftsReceived.length === 0 ? (
                    <div className="text-center py-8">
                      <Gift className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                      <p className="text-gray-400">No gifts received yet</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {walletData.giftsReceived.map((gift) => (
                        <div
                          key={gift._id}
                          className="flex items-center space-x-4 p-4 bg-gray-800 rounded-lg"
                        >
                          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden">
                            {gift.sender.avatar ? (
                              <img
                                src={gift.sender.avatar || "/placeholder.svg"}
                                alt={gift.sender.displayName}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <User className="h-5 w-5 text-white" />
                            )}
                          </div>
                          <div className="flex-1">
                            <h4 className="text-white font-medium">
                              Gift from @{gift.sender.username}
                            </h4>
                            {gift.message && (
                              <p className="text-gray-300 text-sm mt-1">
                                "{gift.message}"
                              </p>
                            )}
                            <div className="flex items-center space-x-2 mt-1">
                              <Calendar className="h-4 w-4 text-gray-400" />
                              <span className="text-gray-400 text-sm">
                                {formatDate(gift.createdAt)}
                              </span>
                            </div>
                          </div>
                          <Badge
                            variant="outline"
                            className="bg-green-900/50 text-green-400 border-green-600"
                          >
                            +₹{gift.amount}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="gifts-sent" className="space-y-4">
              <Card className="bg-gray-900 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">Gifts Sent</CardTitle>
                  <CardDescription className="text-gray-400">
                    Money sent to other users
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {walletData.giftsSent.length === 0 ? (
                    <div className="text-center py-8">
                      <Gift className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                      <p className="text-gray-400">No gifts sent yet</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {walletData.giftsSent.map((gift) => (
                        <div
                          key={gift._id}
                          className="flex items-center space-x-4 p-4 bg-gray-800 rounded-lg"
                        >
                          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden">
                            {gift.recipient.avatar ? (
                              <img
                                src={
                                  gift.recipient.avatar || "/placeholder.svg"
                                }
                                alt={gift.recipient.displayName}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <User className="h-5 w-5 text-white" />
                            )}
                          </div>
                          <div className="flex-1">
                            <h4 className="text-white font-medium">
                              Gift to @{gift.recipient.username}
                            </h4>
                            {gift.message && (
                              <p className="text-gray-300 text-sm mt-1">
                                "{gift.message}"
                              </p>
                            )}
                            <div className="flex items-center space-x-2 mt-1">
                              <Calendar className="h-4 w-4 text-gray-400" />
                              <span className="text-gray-400 text-sm">
                                {formatDate(gift.createdAt)}
                              </span>
                            </div>
                          </div>
                          <Badge
                            variant="outline"
                            className="bg-red-900/50 text-red-400 border-red-600"
                          >
                            -₹{gift.amount}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
