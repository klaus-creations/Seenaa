"use client";

import React from "react";
import { useForm, Controller } from "react-hook-form";
import { Lock, UserPlus, FileCheck, ShieldAlert } from "lucide-react";
import { useUpdateSettings } from "@/lib/hooks/community/useCommunity";
import { Community, UpdateSettingsDto } from "@/types/community";

// Shadcn Components
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";

interface Props {
  community: Community;
}

export default function GeneralPrivacyPolicySettings({ community }: Props) {
  const { mutate: updateSettings, isPending } = useUpdateSettings();

  const {
    control,
    handleSubmit,
    reset,
    formState: { isDirty },
  } = useForm<UpdateSettingsDto>({
    defaultValues: {
      isPrivate: community.isPrivate,
      requireApproval: community.requireApproval,
      requirePostApproval: community.requirePostApproval,
    },
  });

  const onSubmit = (data: UpdateSettingsDto) => {
    updateSettings({
      communityId: community.id,
      slug: community.slug,
      data,
    });
  };

  return (
    <div className="size-full">
      <div className="h-[10%]">
        <h3 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
          Privacy & Visibility
        </h3>
        <p className="text-sm text-foreground-secondary">
          Control access, member approval, and content moderation policies.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="max-w-2xl space-y-10">
        {/* Settings List */}
        <div className="space-y-8">
          {/* Private Community Toggle */}
          <div className="flex items-center justify-between gap-6 group">
            <div className="flex gap-4">
              <div className="h-10 w-10 shrink-0 rounded-2xl bg-primary/5 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Lock size={20} />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-foreground tracking-tight">
                  Private Community
                </h4>
                <p className="text-xs text-foreground-tertiary leading-relaxed">
                  Only approved members can see content. Your community will be
                  hidden from search engines and non-members.
                </p>
              </div>
            </div>
            <Controller
              control={control}
              name="isPrivate"
              render={({ field }) => (
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              )}
            />
          </div>

          {/* Join Approval Toggle */}
          <div className="flex items-center justify-between gap-6 group">
            <div className="flex gap-4">
              <div className="h-10 w-10 shrink-0 rounded-2xl bg-primary/5 flex items-center justify-center  group-hover:scale-110 transition-transform">
                <UserPlus size={20} />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-foreground tracking-tight">
                  Require Join Approval
                </h4>
                <p className="text-xs text-foreground-tertiary leading-relaxed">
                  Automatically move all new join requests to a pending list for
                  admin review.
                </p>
              </div>
            </div>
            <Controller
              control={control}
              name="requireApproval"
              render={({ field }) => (
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              )}
            />
          </div>

          {/* Post Approval Toggle */}
          <div className="flex items-center justify-between gap-6 group">
            <div className="flex gap-4">
              <div className="h-10 w-10 shrink-0 rounded-2xl bg-primary/5 flex items-center justify-center group-hover:scale-110 transition-transform">
                <FileCheck size={20} />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-foreground tracking-tight">
                  Moderate All Posts
                </h4>
                <p className="text-xs text-foreground-tertiary leading-relaxed">
                  New posts must be approved by a moderator before they go live
                  on the feed.
                </p>
              </div>
            </div>
            <Controller
              control={control}
              name="requirePostApproval"
              render={({ field }) => (
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              )}
            />
          </div>
        </div>

        {/* Action Insight Block */}
        <div className="flex gap-4 items-start py-6 border-t border-foreground/5 mt-6">
          <div className="h-10 w-10 shrink-0 rounded-2xl bg-amber-500/5 flex items-center justify-center text-amber-500">
            <ShieldAlert size={20} />
          </div>
          <div className="space-y-1">
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-foreground">
              Security Notice
            </h4>
            <p className="text-[11px] text-foreground-tertiary leading-relaxed">
              Updating these settings affects current and future members
              immediately. Post moderation may increase moderator workload.
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-4">
          <Button
            variant={"btn"}
            type="submit"
            disabled={!isDirty || isPending}
            className=""
          >
            {isPending ? "Updating..." : "Apply Permissions"}
          </Button>

          {isDirty && !isPending && (
            <button
              type="button"
              onClick={() => reset()}
              className="text-xs font-bold text-foreground-tertiary hover:text-foreground transition-colors uppercase tracking-widest"
            >
              Discard Changes
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
