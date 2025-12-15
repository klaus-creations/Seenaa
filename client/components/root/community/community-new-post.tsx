/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useRef, useEffect } from "react";
import { Image as ImageIcon, X, Loader2, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

import { useCreatePost } from "@/lib/hooks/posts/useCreatePost";
import { useGetCommunity } from "@/lib/hooks/community/useCommunity"; // Assumed path based on your context
import { useRouter } from "next/navigation";
import Image from "next/image";

const mockUser = {
  name: "John Doe",
  username: "johndoe",
  avatar: "/images/profile-placeholder.svg",
};

interface CommunityNewPostProps {
  slug: string;
}

export default function CommunityNewPost({ slug }: CommunityNewPostProps) {
  const router = useRouter();

  const {
    data: community,
    isLoading: isCommunityLoading,
    isError: isCommunityError,
  } = useGetCommunity(slug);

  const {
    mutate: createPost,
    isPending: isPostPending,
    isError: isPostError,
    error: postError,
  } = useCreatePost();

  const [content, setContent] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const newPreviews = files.map((file) => URL.createObjectURL(file));
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPreviews(newPreviews);

    return () => {
      newPreviews.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [files]);

  // Validation
  const canSubmit =
    (content.trim().length > 0 || files.length > 0) &&
    !isPostPending &&
    !isCommunityLoading &&
    !!community && // Ensure we have the community data
    content.length <= 4000;

  // File Handlers
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      setFiles((prev) => {
        const combined = [...prev, ...selectedFiles];
        return combined.slice(0, 4); // Max 4 images
      });
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const removeFile = (indexToRemove: number) => {
    setFiles((prev) => prev.filter((_, index) => index !== indexToRemove));
  };

  // Submission Handler
  const handleSubmit = () => {
    if (!canSubmit || !community) return;

    const formData = new FormData();
    formData.append("content", content.trim());

    // Append Community ID so the backend knows where this post belongs
    formData.append("communityId", community.id);

    files.forEach((file) => {
      formData.append("files", file);
    });

    createPost(formData as any, {
      onSuccess: () => {
        setContent("");
        setFiles([]);
        // Optional: Refresh the feed or redirect to the post
        router.refresh();
      },
    });
  };

  // Loading State for Community Data
  if (isCommunityLoading) {
    return (
      <div className="flex items-center justify-center p-8 border-b">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Error State if Slug is invalid
  if (isCommunityError || !community) {
    return (
      <div className="p-4 text-center text-sm text-muted-foreground border-b">
        Unable to load community details to create a post.
      </div>
    );
  }

  return (
    <div className="w-full mx-auto rounded-none border-x-0 border-t-0 shadow-none overflow-y-auto">
      <div className="flex p-4 gap-3">
        {/* User Avatar */}
        <Avatar className="h-10 w-10 sm:h-12 sm:w-12">
          <AvatarImage src={mockUser.avatar} alt={mockUser.name} />
          <AvatarFallback>{mockUser.name.charAt(0)}</AvatarFallback>
        </Avatar>

        <div className="flex-1 space-y-4">
          {/* Community Context Indicator */}
          <div className="flex items-center gap-2">
            <Badge
              variant="secondary"
              className="text-xs font-normal bg-primary/10 text-primary hover:bg-primary/20 gap-1 pl-2"
            >
              <Users className="h-3 w-3" />
              Posting to <span className="font-semibold">{community.name}</span>
            </Badge>
          </div>

          {/* Text Input */}
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={`What's happening in ${community.name}?`}
            className="w-full min-h-20 sm:min-h-[100px] p-4  max-h-[350px] resize-none border-0 text-lg focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-muted-foreground"
            disabled={isPostPending}
            rows={3}
          />

          {/* Image Previews */}
          {previews.length > 0 && (
            <div
              className={`grid gap-2 mb-3 ${
                previews.length === 1 ? "grid-cols-1" : "grid-cols-2"
              }`}
            >
              {previews.map((src, index) => (
                <div key={src} className="relative group aspect-video">
                  <Image
                    width={400}
                    height={400}
                    src={src}
                    alt="Preview"
                    className="w-full h-full object-cover rounded-xl border"
                  />
                  <button
                    onClick={() => removeFile(index)}
                    className="absolute top-2 right-2 bg-black/60 hover:bg-black/80 text-white rounded-full p-1 transition-all opacity-100 sm:opacity-0 group-hover:opacity-100 backdrop-blur-sm"
                    type="button"
                  >
                    <X className="size-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Character Counter */}
          {content.length > 0 && (
            <div className="flex justify-end">
              <span
                className={`text-xs font-medium ${
                  content.length > 3900
                    ? "text-red-500"
                    : "text-muted-foreground"
                }`}
              >
                {content.length}/4000
              </span>
            </div>
          )}

          {/* Controls Bar */}
          <div className="flex flex-wrap items-center justify-between pt-3 border-t gap-3">
            <div className="flex gap-1 flex-wrap">
              <input
                type="file"
                multiple
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                ref={fileInputRef}
                onChange={handleFileSelect}
                disabled={files.length >= 4 || isPostPending}
              />

              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 rounded-full text-primary hover:bg-primary/10"
                disabled={isPostPending || files.length >= 4}
                onClick={() => fileInputRef.current?.click()}
                type="button"
              >
                <ImageIcon className="size-5" />
              </Button>
            </div>

            <Button
              onClick={handleSubmit}
              disabled={!canSubmit}
              className="rounded-full px-6 font-bold shrink-0 transition-all"
              size="sm"
            >
              {isPostPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Posting...
                </>
              ) : (
                "Post"
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* API Error Display */}
      {isPostError && (
        <div className="px-4 pb-4">
          <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-lg w-full font-medium">
            {postError?.response?.data?.message ??
              "Failed to create post. Please try again."}
          </div>
        </div>
      )}

      <div className="border-b" />
    </div>
  );
}
