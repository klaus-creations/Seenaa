import { useForm } from "react-hook-form";
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
    formState: { errors },
  } = useForm<CreateCommunityDto>();
  const { mutate, isPending } = useCreateCommunity();

  const onSubmit = (data: CreateCommunityDto) => {
    mutate(
      { ...data, isPrivate: true, requireApproval: true },
      {
        onSuccess: () => {
          onClose();
        },
      }
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md p-0 gap-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-bold">
              Create Community
            </DialogTitle>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="px-6 pb-6">
          <div className="space-y-6 py-6">
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none">
                Community Name
              </label>
              <Input
                {...register("name", { required: true, minLength: 3 })}
                placeholder="e.g. React Developers"
                className="h-11"
              />
              {errors.name && (
                <p className="text-sm text-red-500">Name is required</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium leading-none">
                URL Slug
              </label>
              <Input
                {...register("slug", {
                  required: true,
                  pattern: /^[a-z0-9-]+$/,
                })}
                placeholder="e.g. react-developers"
                className="h-11"
              />
              <p className="text-xs text-muted-foreground">
                Only lowercase letters, numbers, and hyphens
              </p>
            </div>

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

            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox id="private" {...register("isPrivate")} />
                <label
                  htmlFor="private"
                  className="text-sm font-medium leading-none"
                >
                  Private Community
                </label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox id="approval" {...register("requireApproval")} />
                <label
                  htmlFor="approval"
                  className="text-sm font-medium leading-none"
                >
                  Require Approval to Join
                </label>
              </div>
            </div>
          </div>

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
