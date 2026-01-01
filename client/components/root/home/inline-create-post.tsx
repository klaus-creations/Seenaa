"use client";

import React, { useState, useRef, useEffect } from "react";
import { Image as ImageIcon, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useCreatePost } from "@/lib/hooks/posts/useCreatePost";
import { useSession } from "@/lib/hooks/auth/useGetSession";
import Image from "next/image";
import { toast } from "sonner";

export default function InlineCreatePost() {
    const { data: session } = useSession();
    const { mutate: createPost, isPending } = useCreatePost();

    const [content, setContent] = useState("");
    const [files, setFiles] = useState<File[]>([]);
    const [previews, setPreviews] = useState<string[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const newPreviews = files.map((file) => URL.createObjectURL(file));
        setPreviews(newPreviews);
        return () => newPreviews.forEach((url) => URL.revokeObjectURL(url));
    }, [files]);

    const user = session?.user || session;
    const canSubmit = (content.trim().length > 0 || files.length > 0) && !isPending;

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const selectedFiles = Array.from(e.target.files);
            setFiles((prev) => [...prev, ...selectedFiles].slice(0, 4));
        }
    };

    const removeFile = (indexToRemove: number) => {
        setFiles((prev) => prev.filter((_, index) => index !== indexToRemove));
    };

    const handleSubmit = () => {
        if (!canSubmit) return;

        const formData = new FormData();
        formData.append("content", content.trim());
        files.forEach((file) => formData.append("files", file));

        createPost(formData as any, {
            onSuccess: () => {
                setContent("");
                setFiles([]);
                toast.success("Post shared successfully!");
            },
            onError: (err: any) => {
                toast.error(err?.response?.data?.message || "Failed to share post");
            }
        });
    };

    if (!session) return null;

    return (
        <div className="w-full  mb-4 lg:mb-8 2xl:mb-12 transition-all bg-background/50 hover:bg-background">
            <div className="flex gap-4">
                <Avatar className="size-7 lg:size-8 2xl:size-9 ring-2 ring-primary/10">
                    <AvatarImage src={user?.image || "/images/profile-placeholder.svg"} alt={user?.name} className="object-cover" />
                    <AvatarFallback className="bg-primary/5 text-primary text-lg font-bold">
                        {user?.name?.[0].toUpperCase() || "U"}
                    </AvatarFallback>
                </Avatar>

                <div className="flex-1 flex flex-col gap-3">
                    <Textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="Share what's on your mind..."
                        className="w-full min-h-[80px] max-h-[300px] resize-none border-none text-lg focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-muted-foreground bg-transparent p-2"
                        rows={1}
                        onInput={(e) => {
                            const target = e.target as HTMLTextAreaElement;
                            target.style.height = "auto";
                            target.style.height = `${target.scrollHeight}px`;
                        }}
                    />

                    {previews.length > 0 && (
                        <div className={`grid gap-2 ${previews.length === 1 ? "grid-cols-1" : "grid-cols-2"}`}>
                            {previews.map((src, index) => (
                                <div key={src} className="relative group aspect-video rounded-xl overflow-hidden border">
                                    <Image fill src={src} alt="Preview" className="object-cover" />
                                    <button
                                        onClick={() => removeFile(index)}
                                        className="absolute top-2 right-2 bg-black/60 hover:bg-black/80 text-white rounded-full p-1.5 transition-all opacity-100 sm:opacity-0 group-hover:opacity-100 backdrop-blur-md"
                                    >
                                        <X className="size-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="flex items-center justify-between pt-2">
                        <div className="flex items-center gap-1">
                            <input
                                type="file"
                                multiple
                                accept="image/*"
                                className="hidden"
                                ref={fileInputRef}
                                onChange={handleFileSelect}
                                disabled={files.length >= 4}
                            />
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-9 w-9 rounded-full text-foreground-secondary hover:bg-primary/1 transition-colors"
                                onClick={() => fileInputRef.current?.click()}
                                disabled={files.length >= 4 || isPending}
                            >
                                <ImageIcon className="size-5" />
                            </Button>
                        </div>

                        <Button
                            variant={"btn"}
                            onClick={handleSubmit}
                            disabled={!canSubmit}
                            className=""
                            size="sm"
                        >
                            {isPending ? "Posting..." : "Post"}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
