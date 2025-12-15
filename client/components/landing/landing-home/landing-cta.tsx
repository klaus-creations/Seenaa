import React from "react"
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function LandingCta() {
  return (
    <section className="py-24 bg-secondary text-white">
      <div className="container mx-auto px-6 text-center">
        <h2 className="text-4xl font-bold mb-6">Ready to feel good online again?</h2>
        <p className="text-xl mb-10 opacity-90">
          Join thousands who already left the noise behind.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild size="lg" className="bg-white text-secondary hover:bg-gray-100">
            <Link href="/signup" className="flex items-center gap-2 text-lg">
              Join Free Now <ArrowRight className="h-5 w-5" />
            </Link>
          </Button>

          <Button asChild size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
            <Link href="/about">Learn more</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
