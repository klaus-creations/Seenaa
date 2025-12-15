/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useRef, useEffect } from "react";
import { Image as ImageIcon, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import { useCreatePost } from "@/lib/hooks/posts/useCreatePost";
import { useRouter } from "next/navigation";
import Image from "next/image";

const mockUser = {
  name: "John Doe",
  username: "johndoe",
  avatar: "/images/profile-placeholder.svg",
};

export default function CreateNewPost() {
  const { mutate: createPost, isPending, isError, error } = useCreatePost();
  const router = useRouter();

  const [content, setContent] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Create URLs
    const newPreviews = files.map((file) => URL.createObjectURL(file));
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPreviews(newPreviews);

    return () => {
      newPreviews.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [files]);

  const canSubmit =
    (content.trim().length > 0 || files.length > 0) &&
    !isPending &&
    content.length <= 4000;

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      setFiles((prev) => {
        const combined = [...prev, ...selectedFiles];
        return combined.slice(0, 4);
      });
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const removeFile = (indexToRemove: number) => {
    setFiles((prev) => prev.filter((_, index) => index !== indexToRemove));
  };

  const handleSubmit = () => {
    if (!canSubmit) return;

    const formData = new FormData();
    formData.append("content", content.trim());

    files.forEach((file) => {
      formData.append("files", file);
    });

    console.log(formData);

    createPost(formData as any, {
      onSuccess: () => {
        setContent("");
        setFiles([]);
        router.push("/home");
      },
    });
  };

  return (
    <div className="size-full mx-auto rounded-none border-x-0 border-t-0 shadow-none overflow-y-auto">
      <div className="flex p-4 gap-3">
        <Avatar className="h-10 w-10 sm:h-12 sm:w-12">
          <AvatarImage src={mockUser.avatar} alt={mockUser.name} />
          <AvatarFallback>{mockUser.name.charAt(0)}</AvatarFallback>
        </Avatar>

        <div className="flex-1 space-y-4">
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="What's happening?!"
            className="w-full min-h-20 sm:min-h-[120px] max-h-[350px] resize-none border-0 text-lg focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-muted-foreground p-2"
            disabled={isPending}
            rows={3}
          />

          {/* PREVIEW GRID */}
          {previews.length > 0 && (
            <div
              className={`grid gap-2 mb-3 ${
                previews.length === 1 ? "grid-cols-1" : "grid-cols-4"
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

          <div className="flex flex-wrap items-center justify-between pt-3 border-t gap-3">
            <div className="flex gap-1 flex-wrap">
              <input
                type="file"
                multiple
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                ref={fileInputRef}
                onChange={handleFileSelect}
                disabled={files.length >= 4 || isPending}
              />

              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 rounded-full text-primary hover:bg-primary/10"
                disabled={isPending || files.length >= 4}
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
              {isPending ? "Posting..." : "Post"}
            </Button>
          </div>
        </div>
      </div>

      {isError && (
        <div className="px-4 pb-4">
          <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-lg w-full font-medium">
            {error?.response?.data?.message ??
              "Failed to create post. Please try again."}
          </div>
        </div>
      )}

      <div className="border-b" />
    </div>
  );
}
