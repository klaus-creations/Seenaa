"use client";

import { SearchResponseDto } from "@/types/search";
import {
  User,
  Users,
  Sparkles,
  Globe,
  Clock,
  TrendingUp,
  CheckCircle2,
  MoreHorizontal,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import { Skeleton } from "@/components/ui/skeleton";
import FollowButton from "../common/follow-button";
import { useSession } from "@/lib/hooks/auth/useGetSession";
import PostReactionActions from "../common/post-reactions";

interface SearchResultsProps {
  data: SearchResponseDto;
  isLoading: boolean;
  type: string;
}

export const SearchResults = ({
  data,
  isLoading,
  type,
}: SearchResultsProps) => {
  const { data: session } = useSession();
  if (isLoading) {
    return <SearchResultsSkeleton />;
  }

  const hasPeople = data.people && data.people.length > 0;
  const hasPosts = data.posts && data.posts.length > 0;
  const hasCommunities = data.communities && data.communities.length > 0;
  const isEmpty = !hasPeople && !hasPosts && !hasCommunities;

  if (isEmpty) {
    return <EmptyResults />;
  }

  return (
    <div className="space-y-3 size-full overflow-y-auto">
      {hasPeople && (type === "all" || type === "people") && (
        <section className="w-full">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center">
              <h2 className="">People</h2>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="text-xs opacity-0 group-hover:opacity-100 transition-opacity"
            >
              View all
            </Button>
          </div>

          <div className="flex flex-col items-start gap-4 w-full">
            {data.people?.map((person) => {
              return person?.id !== session?.user?.id ? (
                <div
                  key={person.id}
                  className="w-full bg-linear-to-br from-primary/1 to-secdondary/2 border-b rounded-lg"
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10 ring-2 ring-primary/20 group-hover/card:ring-primary/40 transition-all">
                          <AvatarImage
                            src={
                              person.image || "/images/profile-placeholder.svg"
                            }
                          />
                          <AvatarFallback className="bg-primary">
                            {person.name?.charAt(0)}
                          </AvatarFallback>
                        </Avatar>

                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-lg">
                              {person.name}
                            </h3>
                            {person.isVerified && (
                              <CheckCircle2 className="h-4 w-4 text-blue-500 fill-blue-500" />
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {person.username}
                          </p>
                        </div>
                      </div>

                      <FollowButton
                        followingId={person.id}
                        followerId={session?.user?.id}
                      />
                    </div>

                    {person.bio && (
                      <p className="text-sm text-foreground/80 mb-4 line-clamp-2">
                        {person.bio}
                      </p>
                    )}

                    <div className="flex items-center gap-6 text-sm">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">
                          {person.followerCount?.toLocaleString()}
                        </span>
                        <span className="text-muted-foreground">followers</span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : null;
            })}
          </div>
        </section>
      )}

      {hasCommunities && (type === "all" || type === "community") && (
        <section className="group w-full">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div>
                <h2 className="">Communities</h2>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="text-xs opacity-0 group-hover:opacity-100 transition-opacity"
            >
              View all
            </Button>
          </div>

          <div className="flex flex-col gap-4 items-start w-full">
            {data.communities?.map((community) => (
              <div
                key={community.id}
                className="w-full bg-linear-to-br from-primary/1 to-secdondary/2 border-b rounded-lg"
              >
                <div className="p-6">
                  <div className="flex items-start gap-4">
                    <Avatar className="h-16 w-16 ring-2 ring-primary/20 group-hover/card:ring-primary/40 transition-all">
                      <AvatarImage src={community.avatar || ""} />
                      <AvatarFallback className="bg-linear-to-br from-green-500 to-emerald-500 text-white">
                        {community.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-bold text-lg">
                            {community.name}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {community.description}
                          </p>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          className="rounded-full"
                        >
                          Join
                        </Button>
                      </div>

                      <div className="flex items-center gap-4 text-sm mt-4">
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <span className="font-semibold">
                            {community.memberCount?.toLocaleString()}
                          </span>
                          <span className="text-muted-foreground">members</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {hasPosts && (type === "all" || type === "post") && (
        <section className="">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-3">
              <div>
                <h2 className="">Posts</h2>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="text-xs opacity-0 group-hover:opacity-100 transition-opacity"
            >
              View all
            </Button>
          </div>

          <div className="space-y-4">
            {data.posts?.map((post) => (
              <div
                key={post.id}
                className="border-b rounded-lg p-3 bg-linear-to-br from-primary/1 to-secondary/1"
              >
                <div className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage
                          src={
                            post.user.image || "/images/profile-placeholder.svg"
                          }
                        />
                        <AvatarFallback>
                          {post.user.username.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">
                            {post.user.name}
                          </span>
                          {post.user.isVerified && (
                            <CheckCircle2 className="h-4 w-4 text-blue-500 fill-blue-500" />
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span>{post.user.username}</span>
                          <span>·</span>
                          <Clock className="h-3 w-3" />
                          <span>{post.createdAt}</span>
                        </div>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="pb-3">
                  <p className="text-foreground/90 leading-relaxed">
                    {post.content}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-3 border-t">
                  <PostReactionActions
                    postId={post.id}
                    key={post.id}
                    userId={session?.user.id}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

const SearchResultsSkeleton = () => (
  <div className="space-y-3 size-full py-4">
    {[1, 2, 3].map((section) => (
      <section key={section} className="space-y-2">
        <div className="flex items-center gap-3 mb-6">
            <Skeleton className="h-6 w-32 mb-2" />
        </div>

        <div className="w-full space-y-4">
          {[1].map((item) => (
            <div key={item} className="border-border/50">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div>
                      <Skeleton className="h-5 w-24 mb-2" />
                      <Skeleton className="h-4 w-20" />
                    </div>
                  </div>
                  <Skeleton className="h-8 w-20 rounded-full" />
                </div>
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-3/4 mb-4" />
                <Skeleton className="h-8 w-full rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      </section>
    ))}
  </div>
);

// Empty State
const EmptyResults = () => (
  <div className="text-center py-16 px-4">
    <div className="max-w-md mx-auto">
      <div className="relative mb-6">
        <div className="absolute inset-0 bg-linear-to-r from-blue-500 to-purple-500 blur-2xl opacity-20 rounded-full h-32 w-32 mx-auto" />
        <div className="relative h-32 w-32 mx-auto rounded-full bg-linear-to-br from-blue-500/10 to-purple-500/10 dark:from-blue-500/20 dark:to-purple-500/20 flex items-center justify-center">
          <Sparkles className="h-16 w-16 text-muted-foreground" />
        </div>
      </div>

      <h3 className="text-2xl font-bold bg-linear-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent mb-2">
        No results found
      </h3>
      <p className="text-muted-foreground mb-6">
        Try adjusting your search or filters to find what you&apos;re looking
        for.
      </p>

      <div className="flex flex-wrap gap-3 justify-center">
        <Badge
          variant="outline"
          className="gap-1 cursor-pointer hover:bg-secondary"
        >
          <TrendingUp className="h-3 w-3" />
          Try trending topics
        </Badge>
        <Badge
          variant="outline"
          className="gap-1 cursor-pointer hover:bg-secondary"
        >
          <User className="h-3 w-3" />
          Browse people
        </Badge>
        <Badge
          variant="outline"
          className="gap-1 cursor-pointer hover:bg-secondary"
        >
          <Globe className="h-3 w-3" />
          Explore communities
        </Badge>
      </div>
    </div>
  </div>
);
