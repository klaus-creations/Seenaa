"use client";

import { useParams, useRouter } from "next/navigation";
import { useGetPost } from "@/lib/hooks/posts/useGetPost";
import Image from "next/image";
import { Calendar } from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import CommentList from "./comment-list";
import FollowButton from "../common/follow-button";
import { useSession } from "@/lib/hooks/auth/useGetSession";
import PostReactionActions from "../common/post-reactions";

export default function PostDetail() {
  const params = useParams();
  const router = useRouter();
  const postId = params?.id as string;

  const { data: post, isLoading, isError, error } = useGetPost(postId);

  const {
    data: session,
    isLoading: sessionLoading,
    error: sessionError,
  } = useSession();

  if (sessionLoading) {
    return <div> Loading </div>;
  }

  if (sessionError || !session) {
    return (
      <div className="flex h-40 w-full items-center justify-center rounded-lg border border-dashed text-muted-foreground">
        <p>Failed to load profile data.</p>
      </div>
    );
  }

  const user = session.user || session;

  /* ------------------ Loading ------------------ */
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin h-8 w-8 rounded-full border-b-2 border-foreground" />
      </div>
    );
  }

  /* ------------------ Error ------------------ */
  if (isError || !post) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-center">
        <h2 className="text-xl font-semibold">Post not found</h2>
        <p className="text-sm mt-2">
          {error?.message || "Something went wrong"}
        </p>
        <button
          onClick={() => router.back()}
          className="mt-4 text-sm underline"
        >
          Go back
        </button>
      </div>
    );
  }

  return (
    <div className="size-full overflow-y-auto overflow-x-hidden flex flex-col xl:flex-row">
      <article className="w-full space-y-2 mb-3 xl:w-[60%]">
        <div
          className="flex items-center gap-3 cursor-pointer"
          onClick={() => router.push(`/home/people/${post.author.id}`)}
        >
          <div className="size-10 rounded-full overflow-hidden bg-primary flex items-center justify-center">
            <Image
              src={post.author.image || "/images/profile-placeholder.svg"}
              alt={post.author.name}
              width={80}
              height={80}
              className="w-full h-full object-cover"
            />
          </div>

          <div>
            <div className="font-medium leading-tight text-foreground">
              {post.author.name}
            </div>
            <div className="text-sm text-foreground-tertiary">
              @{post.author.name.replace(/\s+/g, "").toLowerCase()}
            </div>
          </div>

          <FollowButton
            followerId={user?.id || ""}
            followingId={post?.author.id}
          />
        </div>

        {/* ---------------- Content ---------------- */}
        <div className="text-[17px] text-foreground-secondary">
          {post.content}
        </div>

        {/* ---------------- Images ---------------- */}
        {post?.images && post.images.length > 0 && (
          <Carousel className="w-full h-[60vh] rounded-xl relative overflow-hidden bg-primary/3">
            <CarouselContent className="h-[60vh]">
              {post.images.map((img, index) => (
                <CarouselItem key={index} className="h-[60vh] ">
                  <div className="relative w-full h-full flex items-center justify-center ">
                    <div className="relative w-full h-[90%] max-w-5xl py-4">
                      <Image
                        src={img}
                        alt={`Post image ${index + 1}`}
                        fill
                        className="object-contain"
                        sizes="(max-width: 768px) 100vw, 80vw, 90vh"
                        priority={index === 0}
                      />
                    </div>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>

            {post.images.length > 1 && (
              <>
                <CarouselPrevious />
                <CarouselNext />
              </>
            )}
          </Carousel>
        )}

        {/* ---------------- Meta ---------------- */}
        <div className="flex flex-col gap-1 text-sm text-foreground-tertiary">
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            {formatDateDetailed(post.createdAt)}
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              {formatNumber(post.commentCount)} Comments
            </div>

            <div className="flex items-center gap-1">
              {formatNumber(post.viewCount)} views
            </div>
          </div>
        </div>

        <PostReactionActions
          postId={post.id}
          userId={post.author.id}
          thumbsUpCount={post.thumbsUpCount}
          thumbsDownCount={post.thumbsDownCount}
          userReaction={post.userReaction || null}
        />
      </article>

      <CommentList postId={post?.id} />
    </div>
  );
}

const formatDateDetailed = (dateString: string) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
};

const formatNumber = (num: number) => {
  if (num >= 1_000_000) return (num / 1_000_000).toFixed(1) + "M";
  if (num >= 1_000) return (num / 1_000).toFixed(1) + "k";
  return num.toString();
};
