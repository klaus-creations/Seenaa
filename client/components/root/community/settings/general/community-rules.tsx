import React from "react";
import { useForm } from "react-hook-form";
import { useUpdateSettings } from "@/lib/hooks/community/useCommunity";
import { Community } from "@/types/community";

interface Props {
  community: Community & { rules?: string }; // Extended type assumption
}

export default function GeneralCommunityRulesSettings({ community }: Props) {
  const { mutate: updateSettings, isPending } = useUpdateSettings();

  const { register, handleSubmit, formState: { isDirty } } = useForm({
    defaultValues: {
      rules: community.rules || "",
    },
  });

  const onSubmit = (data: { rules: string }) => {
    // Cast to any because 'rules' isn't in your official DTO yet
    updateSettings({
      communityId: community.id,
      slug: community.slug,
      data: data as any,
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900">Community Rules</h3>
        <p className="text-sm text-gray-500">
          Set clear guidelines for behavior within your community.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="max-w-3xl space-y-6">
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Rules & Guidelines</label>
          <div className="relative">
            <textarea
              {...register("rules")}
              rows={12}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-3 font-mono text-sm"
              placeholder={`1. Be respectful to others.\n2. No spam or self-promotion.\n3. Keep content on topic.`}
            />
          </div>
          <p className="text-xs text-gray-500">
            Supports Markdown formatting.
          </p>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={!isDirty || isPending}
            className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 disabled:opacity-50"
          >
            {isPending ? "Saving..." : "Save Rules"}
          </button>
        </div>
      </form>
    </div>
  );
}
