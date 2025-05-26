"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  User,
  Settings,
  Upload,
  BarChart3,
  Wallet,
  LogOut,
  Shield,
} from "lucide-react";

// Generate Gravatar URL from email
function getGravatarUrl(email: string, size = 40): string {
  const crypto = require("crypto");
  const hash = crypto
    .createHash("md5")
    .update(email.toLowerCase().trim())
    .digest("hex");
  return `https://www.gravatar.com/avatar/${hash}?s=${size}&d=identicon`;
}

export function UserAvatar() {
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  if (!user) return null;

  const avatarUrl = user.avatar || getGravatarUrl(user.email);
  const initials = user.displayName
    .split(" ")
    .map((name) => name[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const handleLogout = async () => {
    await logout();
    setIsOpen(false);
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full p-0">
          <Avatar className="h-10 w-10 border-2 border-purple-200 hover:border-purple-400 transition-colors">
            <AvatarImage
              src={avatarUrl || "/placeholder.svg"}
              alt={user.displayName}
            />
            <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>
          {user.isVerified && (
            <div className="absolute -bottom-1 -right-1 bg-blue-500 rounded-full p-1">
              <Shield className="h-3 w-3 text-white" />
            </div>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-2">
            <div className="flex items-center space-x-3">
              <Avatar className="h-12 w-12">
                <AvatarImage
                  src={avatarUrl || "/placeholder.svg"}
                  alt={user.displayName}
                />
                <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {user.displayName}
                  </p>
                  {user.isVerified && (
                    <Badge
                      variant="secondary"
                      className="bg-blue-100 text-blue-800 text-xs"
                    >
                      <Shield className="h-3 w-3 mr-1" />
                      Verified
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-gray-500 truncate">
                  @{user.username}
                </p>
                <p className="text-xs text-gray-500 truncate">{user.email}</p>
              </div>
            </div>
            <div className="flex items-center justify-between pt-2 border-t">
              <div className="text-center">
                <p className="text-sm font-semibold text-gray-900">
                  {user.followers}
                </p>
                <p className="text-xs text-gray-500">Followers</p>
              </div>
              <div className="text-center">
                <p className="text-sm font-semibold text-gray-900">
                  {user.following}
                </p>
                <p className="text-xs text-gray-500">Following</p>
              </div>
              <div className="text-center">
                <p className="text-sm font-semibold text-purple-600">
                  ₹{user.wallet}
                </p>
                <p className="text-xs text-gray-500">Wallet</p>
              </div>
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        <DropdownMenuItem asChild>
          <Link
            href={`/profile/${user.username}`}
            className="flex items-center"
          >
            <User className="mr-2 h-4 w-4" />
            <span>My Profile</span>
          </Link>
        </DropdownMenuItem>

        <DropdownMenuItem asChild>
          <Link href="/dashboard" className="flex items-center">
            <BarChart3 className="mr-2 h-4 w-4" />
            <span>Creator Dashboard</span>
          </Link>
        </DropdownMenuItem>

        <DropdownMenuItem asChild>
          <Link href="/upload" className="flex items-center">
            <Upload className="mr-2 h-4 w-4" />
            <span>Upload Video</span>
          </Link>
        </DropdownMenuItem>

        <DropdownMenuItem asChild>
          <Link href="/wallet" className="flex items-center">
            <Wallet className="mr-2 h-4 w-4" />
            <span>Wallet & Earnings</span>
            <Badge variant="outline" className="ml-auto">
              ₹{user.wallet}
            </Badge>
          </Link>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem asChild>
          <Link href="/settings" className="flex items-center">
            <Settings className="mr-2 h-4 w-4" />
            <span>Settings</span>
          </Link>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          className="text-red-600 focus:text-red-600 focus:bg-red-50"
          onClick={handleLogout}
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
