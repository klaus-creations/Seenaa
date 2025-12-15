"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface CommentFormProps {
  onSubmit: (content: string) => void;
  isLoading: boolean;
  placeholder?: string;
  autoFocus?: boolean;
  onCancel?: () => void;
}

// Zod schema for validation
const commentSchema = z.object({
  content: z.string().min(1, "Comment cannot be empty"),
});

type CommentFormValues = z.infer<typeof commentSchema>;

export default function CommentForm({
  onSubmit,
  isLoading,
  placeholder = "Write a comment...",
  autoFocus = false,
  onCancel,
}: CommentFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CommentFormValues>({
    resolver: zodResolver(commentSchema),
    defaultValues: { content: "" },
  });

  const internalSubmit = (data: CommentFormValues) => {
    onSubmit(data.content);
    reset();
  };

  return (
    <form
      onSubmit={handleSubmit(internalSubmit)}
      className="flex flex-col gap-2 w-full"
    >
      <Textarea
        {...register("content")}
        placeholder={placeholder}
        autoFocus={autoFocus}
        disabled={isLoading}
        className="resize-none text-sm"
        rows={3}
      />
      {errors.content && (
        <p className="text-red-500 text-sm">{errors.content.message}</p>
      )}
      <div className="flex justify-end gap-2">
        {onCancel && (
          <Button
            variant="ghost"
            type="button"
            onClick={onCancel}
            disabled={isLoading}
          >
            Cancel
          </Button>
        )}
        <Button
          type="submit"
          disabled={isLoading || isSubmitting}
          className="flex items-center gap-2 text-white"
        >
          {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
          {onCancel ? "Reply" : "Comment"}
        </Button>
      </div>
    </form>
  );
}
