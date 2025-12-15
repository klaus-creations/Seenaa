"use client";
import { PostResponseDto } from "@/types/posts";
import { MessageCircle, Repeat2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import PostReactionActions from "../common/post-reactions";

interface SinglePostProps {
  postData: PostResponseDto;
}

export default function SinglePost({ postData }: SinglePostProps) {
  const router = useRouter();
  console.log("these are the home post datas ", postData);

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

  return (
    <article
      className="p-4 border-b duration-200 cursor-pointer w-full hover:bg-primary/5"
      onClick={() => router.push(`/home/posts/${postData.id}`)}
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

          {/* Post Content */}
          <div className="mb-3">
            <p className="whitespace-pre-wrap wrap-break-word text-foreground-secondary inline">
              {contentToDisplay}
            </p>

            {isLarge && <span className="text-secondary">See more</span>}

            {/* Hashtags & Mentions */}
            {postData.hashtags?.length || postData.mentions?.length ? (
              <div className="mt-2 flex flex-wrap gap-2">
                {postData.hashtags?.map((tag) => (
                  <span
                    key={tag}
                    className="text-blue-400 hover:underline cursor-pointer text-sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      // Add hashtag routing logic here later
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
                      // Add mention routing logic here later
                    }}
                  >
                    @{mention}
                  </span>
                ))}
              </div>
            ) : null}
          </div>

          {/* Images */}
          {postData.images && postData.images.length > 0 && (
            <div
              className={cn(
                "mb-3 rounded-xl overflow-hidden border border-gray-800",
                postData.images.length > 1 ? "grid grid-cols-2 gap-0.5" : ""
              )}
            >
              {postData.images.slice(0, 4).map((image, index) => (
                <div key={index} className="relative aspect-video bg-gray-900">
                  <Image
                    src={image}
                    alt={`Post image ${index + 1}`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                  {postData.images &&
                    index === 3 &&
                    postData.images.length > 4 && (
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                        <span className="font-semibold">
                          +{postData.images.length - 4}
                        </span>
                      </div>
                    )}
                </div>
              ))}
            </div>
          )}

          <div className="flex items-center gap-4 text-sm mb-3">
            {postData.viewCount > 0 && (
              <div className="flex items-center gap-1">
                <span>{postData.viewCount.toLocaleString()}</span>
                <span>Views</span>
              </div>
            )}
            <div className="flex items-center gap-1">
              <MessageCircle size={14} />
              <span>{postData.commentCount.toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-1">
              <Repeat2 size={14} />
              <span>{postData.shareCount.toLocaleString()}</span>
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
