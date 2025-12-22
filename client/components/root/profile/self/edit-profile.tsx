"use client";

import React, { useState, useEffect } from "react";
import { useGetMe, useUpdateProfile } from "@/lib/hooks/users/useUsers";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Loader2, Camera } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner"; // Assuming you use sonner or similar for notifications

export default function EditProfile() {
  const { data: user } = useGetMe();
  const updateProfile = useUpdateProfile();

  const [formData, setFormData] = useState({
    displayUsername: "",
    bio: "",
    city: "",
    country: "",
  });

  useEffect(() => {
    if (user) {
      setFormData({
        displayUsername: user.displayUsername || "",
        bio: user.bio || "",
        city: user.city || "",
        country: user.country || "",
      });
    }
  }, [user]);

  const handleSave = () => {
    updateProfile.mutate(formData, {
      onSuccess: () => toast.success("Profile updated successfully"),
      onError: () => toast.error("Failed to update profile"),
    });
  };

  if (!user) return null;

  return (
    <div className="w-full  max-w-4xl space-y-8 py-6 px-4">
      <div className="flex flex-col items-start gap-4">
        <div className="relative group">
          <Avatar className="h-24 w-24 border">
            <AvatarImage src={user.image} />
            <AvatarFallback className="text-xl">
              {user.name.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
            <Camera className="text-white w-6 h-6" />
          </div>
        </div>
        <p className="text-sm text-muted-foreground">Change profile photo</p>
      </div>

      <div className="space-y-6">
        {/* Display Name */}
        <div className="space-y-2">
          <Label htmlFor="displayUsername" className="text-[15px] font-semibold">Display Name</Label>
          <Input
            id="displayUsername"
            placeholder="Your display name"
            value={formData.displayUsername}
            onChange={(e) => setFormData({ ...formData, displayUsername: e.target.value })}
            className="rounded-xl focus-visible:ring-1"
          />
        </div>

        {/* Bio */}
        <div className="space-y-2">
          <Label htmlFor="bio" className="text-[15px] font-semibold">Bio</Label>
          <Textarea
            id="bio"
            placeholder="Write a short bio..."
            value={formData.bio}
            onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
            className="resize-none min-h-[100px] rounded-xl focus-visible:ring-1"
          />
        </div>

        {/* Location Row */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="city" className="text-[15px] font-semibold">City</Label>
            <Input
              id="city"
              placeholder="e.g. New York"
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              className="rounded-xl"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="country" className="text-[15px] font-semibold">Country</Label>
            <Input
              id="country"
              placeholder="e.g. USA"
              value={formData.country}
              onChange={(e) => setFormData({ ...formData, country: e.target.value })}
              className="rounded-xl"
            />
          </div>
        </div>
      </div>

      <div className="pt-4">
        <Button
          onClick={handleSave}
          disabled={updateProfile.isPending}
          className="w-full md:w-auto px-8 rounded-full font-bold"
        >
          {updateProfile.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save Changes
        </Button>
      </div>
    </div>
  );
}
