import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useUpdateSettings } from "@/lib/hooks/community/useCommunity"; // Adjust path
import { Community, UpdateSettingsDto } from "@/types/community"; // Adjust path

interface Props {
  community: Community;
}

export default function GeneralCommunityInfoSettings({ community }: Props) {
  const { mutate: updateSettings, isPending } = useUpdateSettings();
  console.log("this is the community from settings", community)

  const {
    register,
    handleSubmit,
    reset,
    formState: { isDirty, errors },
  } = useForm<UpdateSettingsDto>({
    defaultValues: {
      name: community?.name || "Unknown",
      description: community?.description || "",
      avatar: community?.avatar || "",
    },
  });

  // Reset form when community data refreshes
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
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900">Community Information</h3>
        <p className="text-sm text-gray-500">
          Update your community's public profile and details.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-2xl">
        {/* Avatar Input (URL for now, could be file upload) */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Avatar URL</label>
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-gray-100 overflow-hidden border border-gray-200">
              {community.avatar ? (
                <img
                  src={community.avatar}
                  alt={community.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="h-full w-full flex items-center justify-center text-gray-400">
                  Img
                </div>
              )}
            </div>
            <input
              {...register("avatar")}
              type="text"
              placeholder="https://..."
              className="flex-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
            />
          </div>
        </div>

        {/* Name */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Display Name</label>
          <input
            {...register("name", { required: "Name is required" })}
            type="text"
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
          />
          {errors.name && (
            <p className="text-xs text-red-500">{errors.name.message}</p>
          )}
        </div>

        {/* Description */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Description</label>
          <textarea
            {...register("description")}
            rows={4}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
            placeholder="What is this community about?"
          />
          <p className="text-xs text-gray-500">
            Brief description for your community members.
          </p>
        </div>

        <div className="flex justify-end pt-4 border-t">
          <button
            type="submit"
            disabled={!isDirty || isPending}
            className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPending ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}
