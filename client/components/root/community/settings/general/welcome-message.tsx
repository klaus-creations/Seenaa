import React from "react";
import { useForm } from "react-hook-form";
import { useUpdateSettings } from "@/lib/hooks/community/useCommunity";
import { Community } from "@/types/community";

interface Props {
  community: Community & { welcomeMessage?: string }; // Extended type assumption
}

export default function GeneralWelcomeMessageSettings({ community }: Props) {
  const { mutate: updateSettings, isPending } = useUpdateSettings();

  const { register, handleSubmit, formState: { isDirty } } = useForm({
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
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900">Welcome Message</h3>
        <p className="text-sm text-gray-500">
          This message will be emailed to users or shown immediately after they join.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="max-w-2xl space-y-6">
        <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">Pro Tip</h3>
              <div className="mt-2 text-sm text-blue-700">
                <p>
                  A warm welcome message increases retention. Mention how to introduce themselves
                  and where to find the rules.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Message Content</label>
          <textarea
            {...register("welcomeMessage")}
            rows={6}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-3"
            placeholder="Welcome to the community! We are glad to have you..."
          />
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={!isDirty || isPending}
            className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 disabled:opacity-50"
          >
            {isPending ? "Saving..." : "Save Message"}
          </button>
        </div>
      </form>
    </div>
  );
}
