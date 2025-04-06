"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { Edit, User, MapPin, Calendar, Camera, Settings } from "lucide-react";
import ProfilePictureUpload from "@/components/profilepictureupload";

interface User {
  user_id: number;
  full_name: string;
  email: string;
  role: string;
  phone_number: string;
  address: string;
  created_at: string;
  profile_picture: string | null;
}

export default function Profile() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [editMode, setEditMode] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchUserProfile = async () => {
      const userId = localStorage.getItem("user_id");
      if (!userId) {
        router.push("/login");
        return;
      }
      try {
        const res = await fetch(`http://127.0.0.1:5000/user/profile/${userId}`);
        const data = await res.json();
        if (res.ok) setUser(data);
        else setMessage("User not found");
      } catch {
        setMessage("Failed to load profile");
      } finally {
        setLoading(false);
      }
    };
    fetchUserProfile();
  }, []);

  const profileImage = user?.profile_picture
    ? user.profile_picture.startsWith("http")
      ? user.profile_picture
      : `http://127.0.0.1:5000/uploads/profile_pictures/${user.profile_picture}`
    : "/default-profile.png";

  const userName = user?.full_name;

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch(
        `http://127.0.0.1:5000/user/upload-profile-picture/${user.user_id}`,
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await res.json();

      if (res.ok) {
        const newProfilePicture = data.profile_picture + "?t=" + Date.now();
        setUser((prev) =>
          prev ? { ...prev, profile_picture: newProfilePicture } : prev
        );
      } else {
        alert(data.error || "Upload failed");
      }
    } catch (error) {
      console.error("Upload error:", error);
      alert("Error uploading profile picture");
    }
  };

  if (loading)
    return (
      <p className="text-center text-gray-500 animate-pulse">
        Loading profile...
      </p>
    );
  if (!user)
    return (
      <p className="text-center text-red-500">
        {message || "User data not available."}
      </p>
    );

  return (
    <div className="container py-8 px-5 md:px-6 animate-fade-in">
      <div className="flex flex-col space-y-2 mb-8 text-center md:text-left">
        <h1 className="text-3xl font-extrabold tracking-tight text-emerald-700">
          Welcome, {userName}!
        </h1>
        <p className="text-muted-foreground text-base">
          Manage your account and track your impact
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-5">
        {/* Profile Section */}
        <div className="md:col-span-2 space-y-6">
          <Card className="transition-shadow duration-300 shadow-md hover:shadow-xl border border-emerald-100 bg-gradient-to-b from-white to-emerald-50 rounded-2xl">
            <CardHeader className="relative pb-2">
              <div className="absolute right-4 top-4">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setEditMode(!editMode)}
                  className="hover:bg-emerald-100"
                >
                  <Edit className="h-4 w-4 text-emerald-600" />
                </Button>
              </div>
              <div className="flex flex-col items-center">
                <div className="relative">
                  <Avatar className="h-24 w-24 transition-transform hover:scale-105 hover:ring-4 hover:ring-emerald-300">
                    <AvatarImage src={profileImage} alt="Profile" />
                    <AvatarFallback>
                      {userName?.split(" ").map((n) => n[0]).join("") || "JD"}
                    </AvatarFallback>
                  </Avatar>
                  {editMode && (
                    <>
                      <Badge className="absolute top-2 left-2 bg-blue-600 text-white animate-pulse">
                        Editing
                      </Badge>
                      <label
                        htmlFor="profile-upload"
                        className="absolute bottom-0 right-0 bg-emerald-600 p-2 rounded-full cursor-pointer shadow-md"
                      >
                        <input
                          id="profile-upload"
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleImageUpload}
                        />
                        <Camera className="h-4 w-4 text-white" />
                      </label>
                    </>
                  )}
                </div>
                <CardTitle className="mt-4 text-xl font-semibold text-gray-800">
                  {userName}
                </CardTitle>
                <CardDescription>
                  <Badge className="mt-1 bg-amber-700 text-white">
                    Bronze Donor
                  </Badge>
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 px-6 pb-6">
              {editMode ? (
                <div className="space-y-4">
                  {["name", "email", "phone", "location"].map((field, i) => (
                    <div key={i} className="space-y-1">
                      <Label htmlFor={field} className="text-gray-700">
                        {field[0].toUpperCase() + field.slice(1)}
                      </Label>
                      <Input
                        id={field}
                        defaultValue={{
                          name: user.full_name,
                          email: user.email,
                          phone: user.phone_number,
                          location: user.address,
                        }[field]}
                        className="border rounded-md"
                      />
                    </div>
                  ))}
                  <div className="space-y-1">
                    <Label htmlFor="bio" className="text-gray-700">
                      Bio
                    </Label>
                    <Textarea
                      id="bio"
                      defaultValue="I'm passionate about reducing food waste and helping my community."
                      rows={3}
                      className="border rounded-md"
                    />
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setEditMode(false)}>
                      Cancel
                    </Button>
                    <Button onClick={() => setEditMode(false)}>Save Changes</Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4 text-sm text-gray-700">
                  <div className="flex items-start space-x-3">
                    <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="font-medium">About</p>
                      <p className="text-muted-foreground">
                        I'm passionate about reducing food waste and helping my community.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="font-medium">Location</p>
                      <p className="text-muted-foreground">{user.address}</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="font-medium">Member Since</p>
                      <p className="text-muted-foreground">
                        {new Date(user.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="font-medium">Next Level: Silver</p>
                      <span className="text-xs text-muted-foreground">72%</span>
                    </div>
                    <Progress value={72} className="h-2 transition-all duration-700" />
                    <p className="text-xs text-muted-foreground">
                      5 more donations to reach Silver status
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Preferences */}
        <div className="md:col-span-3">
          <Card className="transition-shadow duration-300 shadow hover:shadow-lg bg-white border rounded-2xl animate-fade-in-up">
            <CardHeader>
              <CardTitle className="flex items-center text-emerald-700">
                <Settings className="h-5 w-5 mr-2" /> Preferences
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {["notifications", "privacy", "leaderboard"].map((item, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor={item} className="capitalize text-gray-700">
                      {item}
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      {item === "notifications"
                        ? "Receive updates about your donations"
                        : item === "privacy"
                        ? "Make your profile visible to others"
                        : "Display your ranking on the leaderboard"}
                    </p>
                  </div>
                  <Switch id={item} defaultChecked />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}