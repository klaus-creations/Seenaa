import { Users, Lock, Globe } from "lucide-react";
import { Community } from "@/types/community";
import Image from "next/image";
import { useRouter } from "next/navigation";

interface CommunityCardProps {
  community: Community;
}

export const CommunityCard = ({ community }: CommunityCardProps) => {
  const router = useRouter();
  return (
    <div
      onClick={() => router.push(`/home/community/${community?.slug}`)}
      className="bg-linear-to-r from-primary/10 to-secondary/20 p-[3px] rounded-lg cursor-pointer hover:scale-101 transition-all duration-150"
    >
      <div className="size-full bg-background/70 hover:bg-background/60  flex flex-col overflow-hidden rounded-lg p-2">
        <div className="relative mb-4 flex items-start justify-between">
          <div className="flex items-center gap-4">
            {/* Avatar */}
            <div className="relative flex h-14 w-14 items-center justify-center rounded-full border-2 shadow-sm">
              {community.avatar ? (
                <Image
                  src={community.avatar}
                  alt={community.name}
                  fill
                  className="rounded-full object-cover"
                />
              ) : (
                <span className="text-xl font-bold">
                  {community.name.substring(0, 2).toUpperCase()}
                </span>
              )}
            </div>
            <div>
              <h3 className="text-lg font-bold transition-colors text-foreground">
                {community.name}
              </h3>
              <span className="text-sm text-foreground-tertiary">
                c/{community.slug}
              </span>
            </div>
          </div>

          <div
            className={`p-2 rounded-full ${
              community.isPrivate ? " text-red-500" : " text-blue-500"
            }`}
          >
            {community.isPrivate ? <Lock size={18} /> : <Globe size={18} />}
          </div>
        </div>

        <p className="relative mb-6 line-clamp-2 flex-1 text-gray-600 leading-relaxed">
          {community.description || "No description provided."}
        </p>

        <div className="relative flex items-center justify-between border-t border-gray-100/50 pt-5">
          <div className="flex items-center gap-2 text-gray-600">
            <Users size={18} className="text-blue-500" />
            <span className="font-medium">{community.memberCount} members</span>
          </div>
        </div>
      </div>
    </div>
  );
};
