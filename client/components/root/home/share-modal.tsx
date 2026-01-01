"use client";

import React, { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Check, Copy, Share, Share2 } from "lucide-react";
import { toast } from "sonner";
import { PostResponseDto } from "@/types/posts";

interface ShareModalProps {
    post: PostResponseDto;
    children?: React.ReactNode;
}

export default function ShareModal({ post, children }: ShareModalProps) {
    const [copied, setCopied] = useState(false);
    const shareUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/home/posts/${post.id}`;

    const handleCopy = async (e: React.MouseEvent) => {
        e.stopPropagation();
        try {
            await navigator.clipboard.writeText(shareUrl);
            setCopied(true);
            toast.success("Link copied to clipboard!");
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            toast.error("Failed to copy link");
        }
    };

    return (
        <Dialog>
            <DialogTrigger asChild onClick={(e) => e.stopPropagation()}>
                {children || (
                    <Button variant="ghost" size="icon" className="rounded-full flex items-center gap-1">
                        <span className="sr-only">Share</span>
                        <Share className="size-5" />
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-md" onClick={(e) => e.stopPropagation()}>
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold">Share this post</DialogTitle>
                </DialogHeader>
                <div className="flex items-center gap-2 pt-4">
                    <div className="grid flex-1 gap-2">
                        <Input
                            readOnly
                            value={shareUrl}
                            className="bg-muted/50 border-none font-medium h-11"
                        />
                    </div>
                    <Button
                        type="button"
                        size="icon"
                        onClick={handleCopy}
                        className={`size-11 rounded-xl transition-all duration-300 `}
                    >
                        {copied ? <Check className="size-5" /> : <Copy className="size-5" />}
                    </Button>
                </div>

                {/* Social Buttons (Space for future integration) */}
                <div className="flex items-center justify-between gap-4 py-4">
                    <p className="text-sm text-muted-foreground font-medium">Share via social media coming soon</p>
                </div>
            </DialogContent>
        </Dialog>
    );
}
