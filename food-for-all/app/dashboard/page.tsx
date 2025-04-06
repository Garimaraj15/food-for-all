'use client'; 

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowUpRight, Award, Calendar, Clock, Gift, TrendingUp, Utensils } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { useEffect, useState } from 'react';



interface Donation {
  id: number;
  food_name: string;
  quantity: number;
  status: string;
}

interface DashboardData {
  total_donations: number;
  impact_score: number;
  meals_shared: number;
  next_badge_progress: number;
  food_waste_reduced: number;
  people_helped: number;
  co2_emissions_saved: number;
  active_donations: Donation[];
  upcoming_donations: Donation[];
  past_donations: Donation[];
  nearby_food: Donation[];
}

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    const fetchData = async () => {
      const userId = localStorage.getItem("user_id");

      if (!userId) {
        console.warn("No user ID found in localStorage.");
        return;
      }

      try {
        const res = await fetch(`http://127.0.0.1:5000/api/dashboard/${userId}`);
        const json = await res.json();
        setData(json);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      }
    };

    fetchData();
  }, []);

  if (!mounted || !data) return <p>Loading dashboard...</p>;


  return (
    <div className="flex flex-col gap-8 p-4 md:p-8">
  <div className="flex flex-col gap-2">
    <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
    <p className="text-muted-foreground">Welcome back! Here's an overview of your food sharing activity.</p>
  </div>

  {/* Stats Cards */}
  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
    {/* Total Donations */}
    <Card className="animate-fade-in-up">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">Total Donations</CardTitle>
        <Gift className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{data.total_donations}</div>
        <p className="text-xs text-muted-foreground">
          +{data.donations_increase || 4} from last month
        </p>
      </CardContent>
    </Card>

    {/* Impact Score */}
    <Card className="animate-fade-in-up animation-delay-100">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">Impact Score</CardTitle>
        <TrendingUp className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{data.impact_score}</div>
        <p className="text-xs text-muted-foreground">
          +{data.score_increase || 120} points this week
        </p>
      </CardContent>
    </Card>

    {/* Meals Shared */}
    <Card className="animate-fade-in-up animation-delay-200">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">Meals Shared</CardTitle>
        <Utensils className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{data.meals_shared}</div>
        <p className="text-xs text-muted-foreground">
          Approximately {data.meals_shared} meals provided
        </p>
      </CardContent>
    </Card>

    {/* Next Badge */}
    <Card className="animate-fade-in-up animation-delay-300">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">Next Badge</CardTitle>
        <Award className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{data.next_badge_name || "Silver"}</div>
        <div className="mt-2">
          <Progress value={data.badge_progress_percentage || 68} className="h-2" />
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          {data.badge_progress_percentage || 68}% complete - {data.donations_to_next_badge || 8} more donations needed
        </p>
      </CardContent>
    </Card>
  </div>



      {/* Main Content */}
      <div className="grid gap-4 md:grid-cols-7">
  <div className="col-span-4">
    <Tabs defaultValue="active" className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="active">Active Donations</TabsTrigger>
        <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
        <TabsTrigger value="past">Past Donations</TabsTrigger>
      </TabsList>

      {/* Active Donations */}
      <TabsContent value="active" className="space-y-4 pt-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Your Active Donations</CardTitle>
            <CardDescription>Food items you've listed that are currently available</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {data.active_donations?.length > 0 ? (
              data.active_donations.map((donation: any, index: number) => (
                <div key={index} className="flex items-start space-x-4 rounded-lg border p-3">
                  <div className="relative h-16 w-16 overflow-hidden rounded bg-muted">
                    <Image
                      src={donation.image_url || "/placeholder.svg?height=64&width=64&text=Food"}
                      alt={donation.food_name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold">{donation.food_name}</h4>
                      <Badge variant="outline" className="text-xs">Active</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{donation.description}</p>
                    <div className="flex items-center text-xs text-muted-foreground">
                      <Clock className="mr-1 h-3 w-3" />
                      <span>Expires in {donation.expiry_days} days</span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No active donations</p>
            )}
          </CardContent>
          <CardFooter>
            <Button variant="ghost" size="sm" className="w-full" asChild>
              <Link href="/donate">Add New Donation</Link>
            </Button>
          </CardFooter>
        </Card>
      </TabsContent>

      {/* Upcoming Donations */}
      <TabsContent value="upcoming" className="pt-4">
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Donations</CardTitle>
            <CardDescription>Donations you've scheduled for the future</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {data.upcoming_donations?.length > 0 ? (
              data.upcoming_donations.map((donation: any, index: number) => (
                <div key={index} className="flex items-start space-x-4 rounded-lg border p-3">
                  <div className="relative h-16 w-16 overflow-hidden rounded bg-muted">
                    <Image
                      src={donation.image_url || "/placeholder.svg?height=64&width=64&text=Upcoming"}
                      alt={donation.food_name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1 space-y-1">
                    <h4 className="font-semibold">{donation.food_name}</h4>
                    <p className="text-sm text-muted-foreground">{donation.description}</p>
                    <div className="flex items-center text-xs text-muted-foreground">
                      <Calendar className="mr-1 h-3 w-3" />
                      <span>Scheduled for {donation.pickup_date}</span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex items-center justify-center py-8 text-muted-foreground">
                <Calendar className="mr-2 h-5 w-5" />
                <span>No upcoming donations scheduled</span>
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Button variant="ghost" size="sm" className="w-full" asChild>
              <Link href="/donate">Schedule a Donation</Link>
            </Button>
          </CardFooter>
        </Card>
      </TabsContent>

      {/* Past Donations */}
      <TabsContent value="past" className="pt-4">
        <Card>
          <CardHeader>
            <CardTitle>Past Donations</CardTitle>
            <CardDescription>Your donation history</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {data.past_donations?.length > 0 ? (
              data.past_donations.map((donation: any, index: number) => (
                <div key={index} className="flex items-start space-x-4 rounded-lg border p-3">
                  <div className="relative h-16 w-16 overflow-hidden rounded bg-muted">
                    <Image
                      src={donation.image_url || "/placeholder.svg?height=64&width=64&text=Past"}
                      alt={donation.food_name}
                      fill
                      className="object-cover opacity-70"
                    />
                  </div>
                  <div className="flex-1 space-y-1">
                    <h4 className="font-semibold">{donation.food_name}</h4>
                    <p className="text-sm text-muted-foreground">{donation.description}</p>
                    <div className="flex items-center text-xs text-muted-foreground">
                      <Calendar className="mr-1 h-3 w-3" />
                      <span>Donated on {donation.donated_on}</span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No past donations found</p>
            )}
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  </div>



        <div className="col-span-3 space-y-4">
  <Card className="animate-fade-in-up animation-delay-200">
    <CardHeader>
      <CardTitle>Your Impact</CardTitle>
      <CardDescription>See the difference you're making</CardDescription>
    </CardHeader>
    <CardContent className="space-y-8">
      {/* Food Waste Reduced */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">{data.food_waste_reduced} kg</span>
        </div>
        <Progress value={Math.min(data.food_waste_reduced, 100)} className="h-2" />
        <p className="text-xs text-muted-foreground">
          You've helped reduce food waste by {data.food_waste_reduced} kg this year
        </p>
      </div>

      {/* People Helped */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">{data.people_helped}</span>
        </div>
        <Progress value={Math.min(data.people_helped / 2, 100)} className="h-2" />
        <p className="text-xs text-muted-foreground">
          Your donations have helped approximately {data.people_helped} people
        </p>
      </div>

      {/* CO₂ Emissions Saved */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">{data.co2_emissions_saved} kg</span>
        </div>
        <Progress value={Math.min(data.co2_emissions_saved, 100)} className="h-2" />
        <p className="text-xs text-muted-foreground">
          By reducing food waste, you've prevented {data.co2_emissions_saved} kg of CO₂ emissions
        </p>
      </div>
    </CardContent>
    <CardFooter>
      <Button variant="outline" size="sm" className="w-full" asChild>
        <Link href="/impact">
          View Detailed Impact <ArrowUpRight className="ml-1 h-3 w-3" />
        </Link>
      </Button>
    </CardFooter>
  </Card>



          <Card className="animate-fade-in-up animation-delay-300">
  <CardHeader>
    <CardTitle>Nearby Food Available</CardTitle>
    <CardDescription>Food donations in your area</CardDescription>
  </CardHeader>

  <CardContent className="space-y-4">
    {data.nearby_food?.length > 0 ? (
      data.nearby_food.map((item: any, index: number) => (
        <div key={index} className="flex items-start space-x-4 rounded-lg border p-3">
          <div className="relative h-16 w-16 overflow-hidden rounded bg-muted">
            <Image
              src={item.image_url || `/placeholder.svg?height=64&width=64&text=Food`}
              alt={item.food_name}
              fill
              className="object-cover"
            />
          </div>
          <div className="flex-1 space-y-1">
            <h4 className="font-semibold">{item.food_name}</h4>
            <p className="text-sm text-muted-foreground">{item.description}</p>
            <div className="flex items-center text-xs text-muted-foreground">
              <Clock className="mr-1 h-3 w-3" />
              <span>{item.distance} miles away • Available now</span>
            </div>
          </div>
        </div>
      ))
    ) : (
      <div className="text-sm text-muted-foreground">No nearby donations at the moment</div>
    )}
  </CardContent>

  <CardFooter>
    <Button variant="outline" size="sm" className="w-full" asChild>
      <Link href="/explore">View All Nearby Food</Link>
    </Button>
  </CardFooter>
</Card>
</div>
      </div>
    </div>
  )

}

