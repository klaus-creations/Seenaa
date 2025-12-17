"use client";

import { PostResponseDto } from "@/types/posts";
import { MessageCircle, Repeat2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import PostReactionActions from "../common/post-reactions";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

interface SinglePostProps {
  postData: PostResponseDto;
}

export default function SinglePost({ postData }: SinglePostProps) {
  const router = useRouter();

  const formattedTime = formatDistanceToNow(new Date(postData.createdAt), {
    addSuffix: true,
  }).replace(/^about\s/, "");

  const fullText = postData.content;
  const isLarge = fullText.length > 200;
  const truncateLength = Math.ceil(fullText.length * 0.2);
  const contentToDisplay = isLarge
    ? fullText.slice(0, truncateLength) + "..."
    : fullText;

  const handleProfileClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    router.push(`/home/peoples/${postData.author.username}`);
  };

  const handlePostClick = () => {
    router.push(`/home/posts/${postData.id}`);
  };

  return (
    <article
      className="p-4 border-b duration-200 cursor-pointer w-full hover:bg-primary/3 dark:hover:bg-primary/1"
      onClick={handlePostClick}
    >
      <div className="flex gap-3">
        {/* Avatar */}
        <div className="shrink-0">
          <div
            className="w-10 h-10 rounded-full bg-linear-to-br bg-primary overflow-hidden cursor-pointer hover:opacity-80 transition-opacity"
            onClick={handleProfileClick}
          >
            {postData.author.image ? (
              <Image
                src={postData.author.image}
                alt={postData.author.name}
                width={80}
                height={80}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center font-semibold text-white">
                {postData.author.name.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-1">
              <h3
                className="font-bold hover:underline cursor-pointer text-foreground"
                onClick={handleProfileClick}
              >
                {postData.author.name}
              </h3>
              <span className="text-gray-500">·</span>
              <span className="text-sm text-foreground-secondary">
                {formattedTime}
              </span>
              {postData.editedAt && (
                <>
                  <span className="text-gray-500">·</span>
                  <span className="text-gray-500 text-sm">Edited</span>
                </>
              )}
              {postData.communityId && (
                <span className="ml-2 px-2 py-0.5 bg-blue-900/30 text-blue-400 text-xs rounded-full">
                  Community
                </span>
              )}
            </div>
          </div>

          {/* Post Content Text */}
          <div className="mb-3">
            <p className="whitespace-pre-wrap wrap-break-word text-foreground-secondary inline">
              {contentToDisplay}
            </p>

            {isLarge && <span className="text-secondary ml-1 hover:underline">See more</span>}

            {/* Hashtags & Mentions */}
            {(postData.hashtags?.length > 0 || postData.mentions?.length > 0) && (
              <div className="mt-2 flex flex-wrap gap-2">
                {postData.hashtags?.map((tag) => (
                  <span
                    key={tag}
                    className="text-blue-400 hover:underline cursor-pointer text-sm"
                    onClick={(e) => {
                      e.stopPropagation();
                    }}
                  >
                    #{tag}
                  </span>
                ))}
                {postData.mentions?.map((mention) => (
                  <span
                    key={mention}
                    className="text-blue-400 hover:underline cursor-pointer text-sm"
                    onClick={(e) => {
                      e.stopPropagation();
                    }}
                  >
                    @{mention}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* CAROUSEL IMPLEMENTATION */}
          {postData.images && postData.images.length > 0 && (
            <div className="mb-3 rounded-xl overflow-hidden border border-border bg-black/5 dark:bg-black/40">
              <Carousel
                className="w-full"
                opts={{
                  align: "start",
                  loop: true,
                }}
              >
                <CarouselContent>
                  {postData.images.map((image, index) => (
                    <CarouselItem key={index}>
                      {/*
                         We use a fixed height container here.
                         h-[300px] on mobile, h-[400px] on larger screens.
                         object-cover ensures it fills the box beautifully.
                      */}
                      <div className="relative w-full h-[300px] sm:h-[400px]">
                        <Image
                          src={image}
                          alt={`Post content ${index + 1}`}
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 75vw, 50vw"
                          priority={index === 0} // Load first image faster
                        />
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>

                {/* Only show navigation arrows if there is more than 1 image */}
                {postData.images.length > 1 && (
                  <>
                    <CarouselPrevious
                      className="left-2 bg-black/50 border-none text-white hover:bg-black/70 hover:text-white h-8 w-8"
                      onClick={(e) => e.stopPropagation()}
                    />
                    <CarouselNext
                      className="right-2 bg-black/50 border-none text-white hover:bg-black/70 hover:text-white h-8 w-8"
                      onClick={(e) => e.stopPropagation()}
                    />

                    {/* Optional: Image Counter Bubble (e.g., 1/3) */}
                    <div className="absolute top-3 right-3 bg-black/60 text-white text-xs px-2 py-1 rounded-full font-medium pointer-events-none">
                      {postData.images.length} photos
                    </div>
                  </>
                )}
              </Carousel>
            </div>
          )}

          <div className="flex items-center gap-4 text-sm mb-3 text-muted-foreground">
            {postData.viewCount > 0 && (
              <div className="flex items-center gap-1">
                <span className="font-medium text-foreground">{postData.viewCount.toLocaleString()}</span>
                <span>Views</span>
              </div>
            )}
            <div className="flex items-center gap-1">
              <MessageCircle size={16} />
              <span className="font-medium text-foreground">{postData.commentCount.toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-1">
              <Repeat2 size={16} />
              <span className="font-medium text-foreground">{postData.shareCount.toLocaleString()}</span>
            </div>
          </div>

          <PostReactionActions
            postId={postData.id}
            userId={postData.author.id}
            thumbsUpCount={postData.thumbsUpCount}
            thumbsDownCount={postData.thumbsDownCount}
            userReaction={postData.userReaction || null}
          />
        </div>
      </div>
    </article>
  );
}
