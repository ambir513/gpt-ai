"use client";

import { SignOutButton, useUser } from "@clerk/nextjs";
import { CheckCircleIcon, LogOutIcon, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function DashboardPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    router.push("/sign-in");
    return null;
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Avatar className="h-12 w-12">
                  <AvatarImage
                    src={user.imageUrl}
                    alt={user.firstName || "User"}
                  />
                  <AvatarFallback>
                    {user.firstName?.[0] ?? user.username?.[0] ?? "?"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-xl">
                    Welcome, {user.firstName || user.username || "User"}!
                  </CardTitle>
                  <CardDescription>
                    You successfully signed in with Clerk
                  </CardDescription>
                </div>
              </div>
              <SignOutButton>
                <Button variant="outline" size="sm" asChild>
                  <span>
                    <LogOutIcon className="w-4 h-4 mr-2" />
                    Sign Out
                  </span>
                </Button>
              </SignOutButton>
            </div>
          </CardHeader>
        </Card>

        {/* Success Message */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-3">
              <CheckCircleIcon className="w-6 h-6 text-green-500" />
              <div>
                <h3 className="font-semibold text-green-700 dark:text-green-400">
                  Authentication Successful
                </h3>
                <p className="text-sm text-muted-foreground">
                  Your Clerk authentication components are working correctly
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* User Info */}
        <Card>
          <CardHeader>
            <CardTitle>User Information</CardTitle>
            <CardDescription>Information retrieved from Clerk</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium text-muted-foreground">Name:</span>
              <p>{user.fullName || "Not provided"}</p>
            </div>
            <div>
              <span className="font-medium text-muted-foreground">
                Username:
              </span>
              <p>{user.username || "Not provided"}</p>
            </div>
            <div>
              <span className="font-medium text-muted-foreground">Email:</span>
              <p>{user.primaryEmailAddress?.emailAddress || "Not provided"}</p>
            </div>
            <div>
              <span className="font-medium text-muted-foreground">Phone:</span>
              <p>{user.primaryPhoneNumber?.phoneNumber || "Not provided"}</p>
            </div>
            <div>
              <span className="font-medium text-muted-foreground">
                User ID:
              </span>
              <p className="font-mono text-xs">{user.id}</p>
            </div>
            <div>
              <span className="font-medium text-muted-foreground">
                Created:
              </span>
              <p>
                {user.createdAt
                  ? new Date(user.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })
                  : "Unknown"}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
