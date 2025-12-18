
"use client";

import React from "react";
import { Community } from "@/types/community";
import { format } from "date-fns";


const DEFAULT_WELCOME_MESSAGE = `
Welcome to this community 🚀

This is a space built for curious minds, respectful conversations, and meaningful contributions.
Whether you're here to learn, share ideas, or connect with like-minded people — you're in the right place.

Introduce yourself, explore discussions, and don’t be afraid to jump in.
Great communities aren’t built by rules alone — they’re built by people like you.
`;

const DEFAULT_RULES: string[] = [
  "Be respectful at all times. Personal attacks, hate speech, or harassment are not tolerated.",
  "Stay on topic. Keep discussions relevant to the purpose of this community.",
  "No spam or self-promotion without permission. This includes links, ads, and referral codes.",
  "Use clear and descriptive titles when creating posts.",
  "Constructive criticism is welcome — disrespect is not.",
  "Do not share personal, private, or sensitive information (yours or others’).",
  "Follow the platform’s terms of service and local laws.",
  "Report rule-breaking content instead of engaging in arguments.",
  "Admins and moderators have final say in moderation decisions.",
  "Low-effort, duplicate, or misleading content may be removed.",
  "Help newcomers feel welcome and guide them when possible.",
  "Have fun, learn something new, and contribute positively 🌱",
];

export default function CommunityAbout({
  community,
}: {
  community: Community;
}) {
  const description =
    community.welcomeMessage?.trim() || DEFAULT_WELCOME_MESSAGE;

  const rules =
    community.rules && community.rules.length > 0
      ? community.rules
      : DEFAULT_RULES;

  return (
    <div className="flex flex-col gap-3 size-full overflow-y-auto">
      {/* ABOUT */}
      <div>
        <h2 className="font-black text-sm uppercase tracking-widest text-foreground">
          About Community
        </h2>

        <p className="text-sm leading-relaxed text-foreground-secondary whitespace-pre-line">
          {description}
        </p>

        <div className="flex items-center gap-2 text-sm pt-4 border-t text-foreground-tertiary">
          <span className="font-bold">Created:</span>
          <span className="text-foreground-tertiary">
            {format(new Date(community.createdAt), "MMMM d, yyyy")}
          </span>
        </div>
      </div>

      {/* RULES */}
      <div className="bg-primary/2 ">
        <h2 className="font-black text-sm uppercase tracking-widest mb-4 text-foreground">
          Community Rules
        </h2>

        <div className="space-y-4">
          {rules.map((rule, i) => (
            <div
              key={i}
              className="text-sm border-b pb-3 last:border-0 last:pb-0 text-foreground-secondary"
            >
              <span className="font-bold mr-2">{i + 1}.</span>
              {rule}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

