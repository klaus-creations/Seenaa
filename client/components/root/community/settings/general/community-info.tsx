"use client";

import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Camera, Info } from "lucide-react";
import { useUpdateSettings } from "@/lib/hooks/community/useCommunity";
import { Community, UpdateSettingsDto } from "@/types/community";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface Props {
  community: Community;
}

export default function GeneralCommunityInfoSettings({ community }: Props) {
  const { mutate: updateSettings, isPending } = useUpdateSettings();

  const {
    register,
    handleSubmit,
    reset,
    formState: { isDirty, errors },
  } = useForm<UpdateSettingsDto>({
    defaultValues: {
      name: community?.name || "",
      description: community?.description || "",
      avatar: community?.avatar || "",
    },
  });

  useEffect(() => {
    reset({
      name: community.name,
      description: community.description || "",
      avatar: community.avatar || "",
    });
  }, [community, reset]);

  const onSubmit = (data: UpdateSettingsDto) => {
    updateSettings({
      communityId: community.id,
      slug: community.slug,
      data,
    });
  };

  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-10">
        <h3 className="text-xl font-bold tracking-tight text-foreground">
          Community Info
        </h3>
        <p className="text-sm text-foreground-secondary mt-1">
          Customize how your community looks to the public.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="max-w-2xl space-y-10">
        <div className="flex flex-col sm:flex-row sm:items-center gap-6">
          <div className="relative group shrink-0">
            <Avatar className="h-24 w-24 border-2 border-background ring-4 ring-primary/5 shadow-xl transition-transform group-hover:scale-105">
              <AvatarImage src={community.avatar || ""} alt={community.name} />
              <AvatarFallback className="text-2xl font-bold bg-primary/10 text-primary">
                {community.name?.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
              <Camera className="text-white h-6 w-6" />
            </div>
          </div>

          <div className="flex-1 space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-widest text-foreground-tertiary">
              Avatar Image URL
            </label>
            <Input
              {...register("avatar")}
              type="text"
              placeholder="Enter image link..."
              className="w-full bg-transparent border-none p-2 text-sm font-medium focus:ring-0 placeholder:text-foreground-tertiary/50"
            />
            <div className="h-px w-full bg-foreground/10" />
            <p className="text-[11px] text-foreground-tertiary">
              Recommended size: 400x400px.
            </p>
          </div>
        </div>

        {/* Display Name */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold uppercase tracking-widest text-foreground-tertiary">
            Display Name
          </label>
          <Input
            {...register("name", { required: "A name is required" })}
            type="text"
            className="w-full bg-transparent border-none text-xl font-bold focus:ring-0 placeholder:text-foreground-tertiary/50 p-2"
            placeholder="Name your community"
          />
          <div className="h-px w-full bg-foreground/10" />
          {errors.name ? (
            <p className="text-xs font-medium text-destructive mt-1">
              {errors.name.message}
            </p>
          ) : (
            <p className="text-[11px] text-foreground-tertiary">
              This is how the community will appear in search results.
            </p>
          )}
        </div>

        {/* Description */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-[10px] font-bold uppercase tracking-widest text-foreground-tertiary">
              About & Description
            </label>
          </div>
          <Textarea
            {...register("description")}
            rows={3}
            className="w-full bg-transparent border-none p-2 text-base font-medium focus:ring-0 placeholder:text-foreground-tertiary/50 resize-none min-h-20 max-h-[200px] leading-relaxed"
            placeholder="Tell us what makes this community special..."
          />
          <div className="h-px w-full bg-foreground/10" />
          <div className="flex items-center gap-1.5 mt-2">
            <Info className="h-3 w-3 text-foreground-tertiary" />
            <p className="text-[11px] text-foreground-tertiary">
              Supports plain text description.
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="pt-6 flex items-center gap-4">
          <Button
            variant={"btn"}
            type="submit"
            disabled={!isDirty || isPending}
            className=""
          >
            {isPending ? (
              "Saving..."
            ) : (
              <span className="flex items-center gap-2">Save Changes</span>
            )}
          </Button>

          {isDirty && !isPending && (
            <button
              type="button"
              onClick={() => reset()}
              className="text-xs font-bold text-foreground-tertiary hover:text-foreground transition-colors uppercase tracking-widest"
            >
              Discard
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
