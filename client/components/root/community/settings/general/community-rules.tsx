"use client";

import React from "react";
import { useForm, useFieldArray } from "react-hook-form";
import {
  ShieldCheck,
  Plus,
  Trash2,
  GripVertical,
  Info,
  ListFilter,
} from "lucide-react";
import { useUpdateSettings } from "@/lib/hooks/community/useCommunity";
import { Community } from "@/types/community";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Props {
  community: Community;
}

interface RulesFormValues {
  rules: { value: string }[];
}

export default function GeneralCommunityRulesSettings({ community }: Props) {
  const { mutate: updateSettings, isPending } = useUpdateSettings();

  // Convert string[] from DB to { value: string }[] for React Hook Form
  const defaultRules = community.rules?.map((rule) => ({ value: rule })) || [
    { value: "" },
  ];

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { isDirty },
  } = useForm<RulesFormValues>({
    defaultValues: {
      rules: defaultRules,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "rules",
  });

  const onSubmit = (data: RulesFormValues) => {
    // Convert back to string[] before sending to API
    const rulesArray = data.rules
      .map((r) => r.value)
      .filter((v) => v.trim() !== "");

    updateSettings({
      communityId: community.id,
      slug: community.slug,
      data: { rules: rulesArray } as any,
    });
  };

  return (
    <div className="size-full">
      {/* Header */}
      <div className="h-[10%]">
        <h3 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
          Community Rules
        </h3>
        <p className="text-sm text-foreground-secondary mt-1">
          Set clear guidelines to maintain a healthy and safe environment.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="max-w-3xl space-y-8">
        {/* Rules List Container */}
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-4">
            <label className="text-[10px] font-bold uppercase tracking-widest text-foreground-tertiary">
              Guidelines Stack
            </label>
            <span className="text-[10px] font-bold text-primary px-2 py-0.5 bg-primary/10 rounded-full">
              {fields.length} Rules
            </span>
          </div>

          <div className="space-y-6">
            {fields.map((field, index) => (
              <div key={field.id} className="group flex items-start gap-4">
                <div className="flex flex-col items-center gap-2 pt-1">
                  <div className="h-8 w-8 rounded-xl bg-accent/50 flex items-center justify-center text-xs font-bold text-foreground-tertiary">
                    {index + 1}
                  </div>
                  <div className="w-0.5 flex-1 bg-foreground/5 min-h-2" />
                </div>

                {/* Input Area */}
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-4">
                    <Input
                      {...register(`rules.${index}.value` as const, {
                        required: true,
                      })}
                      placeholder="e.g. Be respectful and kind..."
                      className="flex-1 bg-transparent border-none text-base font-medium p-2 focus:ring-0 placeholder:text-foreground-tertiary/30"
                    />

                    <button
                      type="button"
                      onClick={() => remove(index)}
                      className="opacity-0 group-hover:opacity-100 p-2 text-foreground-tertiary hover:text-destructive transition-all"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                  <div className="h-px w-full bg-foreground/10 group-focus-within:bg-primary/50 transition-colors" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Add Rule Button */}
        <button
          type="button"
          onClick={() => append({ value: "" })}
          className="flex items-center gap-2 text-xs font-bold text-primary hover:text-primary/80 transition-colors uppercase tracking-widest py-2"
        >
          <Plus size={16} />
          Add New Rule
        </button>

        {/* Info Insight */}
        <div className="space-y-1">
          <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">
            Clarity is Key
          </h4>
          <p className="text-sm text-foreground-tertiary leading-relaxed">
            Rules are displayed on your community sidebar. Keep them short,
            numbered, and easy to understand for new members.
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-4">
          <Button
            variant="btn"
            type="submit"
            disabled={!isDirty || isPending}
            className=""
          >
            {isPending ? "Updating..." : "Save Guidelines"}
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
