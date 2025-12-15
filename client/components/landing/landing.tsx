import React from "react";
import HeroCarousel from "./landing-home/hero";
import LandingFeatures from "./landing-home/landing-features";
import LandingCommunities from "./landing-home/landing-communities";
import LandingCta from "./landing-home/landing-cta";
import LandingSome from "./landing-home/landing-some";
import LandingWhyChooseUs from "./landing-home/landing-why-choose-us";

export default function Landing() {
  return (
    <div className="size-full space-y-3">
      <HeroCarousel />
      <LandingSome />
      <LandingWhyChooseUs />
      <LandingFeatures />
      <LandingCommunities />
      <LandingCta />

    </div>
  );
}
