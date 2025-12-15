import React from "react"

import { Sparkles } from "lucide-react";

const communities = [
  "Travel", "Music", "Food", "Languages",
  "Daily Joy", "Art", "Nature", "Wellness"
];

export default function LandingCommunities() {
  return (
    <section id="communities" className="py-24">
      <div className="container mx-auto px-6 text-center">
        <h2 className="text-4xl font-bold mb-4">Join vibrant communities</h2>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-12">
          From Travel Diaries to Music Hub — find your people.
        </p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
          {communities.map((name) => (
            <div
              key={name}
              className="bg-muted/50 rounded-xl p-8 hover:bg-muted transition-all duration-300 group"
            >
              <Sparkles className="h-8 w-8 text-secondary mx-auto mb-3 group-hover:scale-110 transition" />
              <p className="font-medium text-primary">{name}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
