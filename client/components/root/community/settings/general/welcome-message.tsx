"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { Info } from "lucide-react";
import { useUpdateSettings } from "@/lib/hooks/community/useCommunity";
import { Community } from "@/types/community";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface Props {
  community: Community;
}

export default function GeneralWelcomeMessageSettings({ community }: Props) {
  const { mutate: updateSettings, isPending } = useUpdateSettings();

  const {
    register,
    handleSubmit,
    reset,
    formState: { isDirty },
  } = useForm({
    defaultValues: {
      welcomeMessage: community.welcomeMessage || "",
    },
  });

  const onSubmit = (data: { welcomeMessage: string }) => {
    updateSettings({
      communityId: community.id,
      slug: community.slug,
      data: data as any,
    });
  };

  return (
    <div className="size-full">
      <div className="h-[10%]">
        <h3 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
          Welcome Message
        </h3>
        <p className="text-sm text-foreground-secondary mt-1">
          Greet new members automatically when they join your community.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="max-w-2xl space-y-4">
        <div className="space-y-1">
          <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">
            Pro Insight
          </h4>
          <p className="text-sm text-foreground-secondary leading-relaxed">
            Warm greetings increase retention. Encourage new members to
            introduce themselves or point them toward your community rules.
          </p>
        </div>

        <div className="space-y-3">
          <label className="text-[10px] font-bold uppercase tracking-widest text-foreground-secondary">
            The Welcome Message
          </label>
          <Textarea
            {...register("welcomeMessage")}
            rows={8}
            className="w-full bg-transparent border-none text-base font-medium focus:ring-0 placeholder:text-foreground-tertiary/40 resize-none leading-relaxed min-h-[120px] max-h-[300px] p-2"
            placeholder="Hi there! We are thrilled to have you here. To get started, please check out..."
          />
          <div className="h-px w-full bg-foreground/10" />

          <div className="flex items-center gap-2 pt-2 text-foreground-tertiary">
            <Info size={14} />
            <p className="text-[11px] font-medium tracking-tight">
              Sent via notification or email immediately upon joining.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 pt-4">
          <Button
            variant={"btn"}
            type="submit"
            disabled={!isDirty || isPending}
            className=""
          >
            {isPending ? "Updating..." : "Save Message"}
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
