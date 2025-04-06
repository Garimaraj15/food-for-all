// app/leaderboard/page.tsx
"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import React, { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { Star } from "lucide-react";
import dynamic from "next/dynamic";


const LeaderboardPage = () => {
  const userId = typeof window !== 'undefined' ? localStorage.getItem("user_id") : null;

  const [data, setData] = useState<any>(null);

  useEffect(() => {
    fetch(`http://127.0.0.1:5000/api/leaderboard/${userId}`)
      .then(res => res.json())
      .then(setData);
  }, [userId]);

  if (!data) return <div>Loading...</div>;

  const { top_donors, user_stats, user_ranking } = data;

  const getBadgeColor = (level: string) => {
    if (level === "Gold") return "bg-yellow-400 text-black";
    if (level === "Silver") return "bg-gray-400 text-black";
    if (level === "Bronze") return "bg-orange-400 text-white";
    return "bg-muted";
  };

  const getTopDonorIcon = (index: number) => {
    if (index === 0) return <Star className="text-yellow-500" />;
    if (index === 1) return <Star className="text-slate-400" />;
    if (index === 2) return <Star className="text-amber-700" />;
    return null;
  };

  return (
    <div className="container py-8">
      <div className="grid md:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="md:col-span-2 space-y-6">
          <Tabs defaultValue="donors" className="w-full">
            <TabsList className="w-full justify-between">
              <TabsTrigger value="donors">Donors</TabsTrigger>
              <TabsTrigger value="communities">Communities</TabsTrigger>
              <TabsTrigger value="organizations">Organizations</TabsTrigger>
            </TabsList>

            <TabsContent value="donors" className="space-y-4 pt-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {top_donors.slice(0, 3).map((donor: any, index: number) => (
                  <Card key={donor.id} className={cn(
                    "relative overflow-hidden border shadow-md rounded-2xl transition-all duration-300 hover:scale-[1.02]",
                    index === 0 && "border-amber-500 dark:border-amber-500/50 shadow-lg"
                  )}>
                    <div className={cn("h-2",
                      index === 0 ? "bg-amber-500" :
                      index === 1 ? "bg-slate-400" : "bg-amber-700"
                    )} />
                    <CardHeader className="text-center pb-2">
                      <div className="flex justify-center mb-2">{getTopDonorIcon(index)}</div>
                      <div className="relative mx-auto w-fit">
                        <Avatar className="h-16 w-16 ring-2 ring-offset-2 ring-white dark:ring-offset-slate-900">
                          <AvatarImage src={donor.avatar} alt={donor.name} />
                          <AvatarFallback>{donor.name?.split(" ").map((n: string) => n[0]).join("")}</AvatarFallback>
                        </Avatar>
                      </div>
                      <CardTitle className="mt-2 text-lg font-semibold">{donor.name}</CardTitle>
                      <CardDescription>
                        <Badge className={cn("mt-1", getBadgeColor(donor.level))}>
                          {donor.level} Donor
                        </Badge>
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="text-center">
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                          <p className="text-2xl font-bold">{donor.donations}</p>
                          <p className="text-xs text-muted-foreground">Donations</p>
                        </div>
                        <div>
                          <p className="text-2xl font-bold">{donor.impact}</p>
                          <p className="text-xs text-muted-foreground">Impact Score</p>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>Next Level</span>
                          <span>{donor.progress ? Math.round(donor.progress) : 0}%</span>
                        </div>
                        <Progress value={donor.progress || 0} className="h-2 rounded-full" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="communities" className="pt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Top Communities</CardTitle>
                  <CardDescription>Coming soon...</CardDescription>
                </CardHeader>
              </Card>
            </TabsContent>

            <TabsContent value="organizations" className="pt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Top Organizations</CardTitle>
                  <CardDescription>Coming soon...</CardDescription>
                </CardHeader>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Right Column - User Stats */}
        <div className="md:col-span-1 space-y-6">
          <Card>
            <CardHeader className="text-center">
              <Avatar className="h-16 w-16 mx-auto">
                <AvatarImage src={user_stats.profile_pic} alt={user_stats.name} />
                <AvatarFallback>{user_stats.name?.split(" ").map((n: string) => n[0]).join("")}</AvatarFallback>
              </Avatar>
              <CardTitle className="mt-2 text-xl">{user_stats.name}</CardTitle>
              <CardDescription>{user_stats.donor_level} Donor</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-2">
                <div className="p-3 rounded-lg border text-center">
                  <p className="text-2xl font-bold">{user_stats.total_donations}</p>
                  <p className="text-xs text-muted-foreground">Donations</p>
                </div>
                <div className="p-3 rounded-lg border text-center">
                  <p className="text-2xl font-bold">{user_stats.impact_score}</p>
                  <p className="text-xs text-muted-foreground">Impact Score</p>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium">Next Badge: {user_stats.next_badge}</p>
                <Progress value={user_stats.next_badge_progress} className="h-2 rounded-full" />
                <p className="text-xs text-muted-foreground">
                  {user_stats.donations_needed} more donations to reach {user_stats.next_badge} status
                </p>
              </div>

              <div className="mt-4 text-center">
              <p className="text-2xl font-bold">{user_stats.total_donations}</p>
<p className="text-xs text-muted-foreground">Donations</p>

<p className="text-2xl font-bold">{user_stats.impact_score}</p>
<p className="text-xs text-muted-foreground">Impact Score</p>

<p className="text-sm text-muted-foreground">Next Badge: {user_stats.next_badge}</p>
<p className="text-sm text-muted-foreground">{user_stats.donations_needed} more donations to reach {user_stats.next_badge} status</p>

<p>Your Position: #{user_ranking.position}</p>
<p>Top {user_ranking.percentile}% of all donors</p>
              </div>

              <Button className="w-full mt-4">Donate to Improve Rank</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default LeaderboardPage;
