import { useForm, Controller } from "react-hook-form";
import { useCreateCommunity } from "@/lib/hooks/community/useCommunity";
import { CreateCommunityDto } from "@/types/community";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useState } from "react";

interface CreateCommunityModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreateCommunityModal = ({
  isOpen,
  onClose,
}: CreateCommunityModalProps) => {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<CreateCommunityDto>({
    defaultValues: {
      isPrivate: false,
      requireApproval: false,
    },
  });

  const { mutate, isPending } = useCreateCommunity();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const onSubmit = (data: CreateCommunityDto) => {
    setSubmitError(null);
    mutate(data, {
      onSuccess: () => {
        onClose();
      },
      onError: (error) => {
          setSubmitError(error?.response?.data?.message || "Something went wrong");
      }
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md p-0 gap-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <DialogTitle className="text-xl font-bold">
            Create Community
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="px-6 pb-6">
          <div className="space-y-6 py-6">
            {/* Community Name */}
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none">
                Community Name
              </label>
              <Input
                {...register("name", {
                  required: "Name is required",
                  minLength: {
                    value: 3,
                    message: "Name must be at least 3 characters",
                  },
                })}
                placeholder="e.g. React Developers"
                className="h-11"
              />
              {errors.name && (
                <p className="text-sm text-red-500">
                  {errors.name.message}
                </p>
              )}
            </div>

            {/* Slug */}
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none">
                    Community Handle
              </label>
              <Input
                {...register("slug", {
                  required: "Slug is required",
                  pattern: {
                    value: /^[a-z0-9-]+$/,
                    message:
                      "Only lowercase letters, numbers, and hyphens",
                  },
                })}
                placeholder="e.g. react-developers"
                className="h-11"
              />
              {errors.slug && (
                <p className="text-sm text-red-500">
                  {errors.slug.message}
                </p>
              )}
              <p className="text-xs text-muted-foreground">
                Only lowercase letters, numbers, and hyphens
              </p>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none">
                Description
              </label>
              <Textarea
                {...register("description")}
                placeholder="What is this community about?"
                rows={3}
              />
            </div>

            {/* Checkboxes */}
            <div className="space-y-4">
              {/* Private */}
              <Controller
                name="isPrivate"
                control={control}
                render={({ field }) => (
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="private"
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                    <label
                      htmlFor="private"
                      className="text-sm font-medium leading-none"
                    >
                      Private Community
                    </label>
                  </div>
                )}
              />

              <Controller
                name="requireApproval"
                control={control}
                render={({ field }) => (
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="approval"
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                    <label
                      htmlFor="approval"
                      className="text-sm font-medium leading-none"
                    >
                      Require Approval to Join
                    </label>
                  </div>
                )}
              />
            </div>
          </div>


          {submitError && <p className="text-sm text-red-500 mb-6">{submitError}</p>}

          <Button
            type="submit"
            disabled={isPending}
            className="w-full h-11 text-base"
          >
            {isPending ? "Creating..." : "Create Community"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

