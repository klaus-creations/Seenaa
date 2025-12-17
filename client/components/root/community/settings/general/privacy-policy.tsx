import React from "react";
import { useForm } from "react-hook-form";
import { useUpdateSettings } from "@/lib/hooks/community/useCommunity";
import { Community, UpdateSettingsDto } from "@/types/community";

interface Props {
  community: Community;
}

export default function GeneralPrivacyPolicySettings({ community }: Props) {
  const { mutate: updateSettings, isPending } = useUpdateSettings();

  const { register, handleSubmit, formState: { isDirty } } = useForm<UpdateSettingsDto>({
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
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900">Privacy & Permissions</h3>
        <p className="text-sm text-gray-500">
          Control who can see, join, and post in your community.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-2xl">
        <div className="bg-white rounded-lg border border-gray-200 divide-y divide-gray-200">

          {/* Private Community Toggle */}
          <div className="flex items-start p-4">
            <div className="flex h-5 items-center">
              <input
                {...register("isPrivate")}
                id="isPrivate"
                type="checkbox"
                className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
            </div>
            <div className="ml-3 text-sm">
              <label htmlFor="isPrivate" className="font-medium text-gray-700">
                Private Community
              </label>
              <p className="text-gray-500">
                Only members can see posts. Content is hidden from search engines.
              </p>
            </div>
          </div>

          {/* Join Approval Toggle */}
          <div className="flex items-start p-4">
            <div className="flex h-5 items-center">
              <input
                {...register("requireApproval")}
                id="requireApproval"
                type="checkbox"
                className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
            </div>
            <div className="ml-3 text-sm">
              <label htmlFor="requireApproval" className="font-medium text-gray-700">
                Require Join Approval
              </label>
              <p className="text-gray-500">
                New members must be approved by an admin before they can join.
              </p>
            </div>
          </div>

          {/* Post Approval Toggle */}
          <div className="flex items-start p-4">
            <div className="flex h-5 items-center">
              <input
                {...register("requirePostApproval")}
                id="requirePostApproval"
                type="checkbox"
                className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
            </div>
            <div className="ml-3 text-sm">
              <label htmlFor="requirePostApproval" className="font-medium text-gray-700">
                Require Post Approval
              </label>
              <p className="text-gray-500">
                Posts by members must be approved by a moderator before appearing.
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={!isDirty || isPending}
            className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
          >
            {isPending ? "Updating..." : "Update Privacy Settings"}
          </button>
        </div>
      </form>
    </div>
  );
}
