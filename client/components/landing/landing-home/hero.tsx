
"use client";

import React, { useState, useEffect } from "react";
import { HERO_SLIDES } from "@/constants/hero-slides";
import { Button } from "@/components/ui/button";
import { ArrowRight, Download } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function HeroCarousel() {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const slide = HERO_SLIDES[currentSlide];

  return (
    <section className="relative container mx-auto h-[80vh] overflow-hidden mt-30 rounded-lg 2xl:rounded-xl">
      <div className="absolute inset-0">
        {HERO_SLIDES.map((s, i) => (
          <div
            key={s.id}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              i === currentSlide ? "opacity-100" : "opacity-0"
            }`}
          >
            <Image
              src={s.image}
              alt={s.title}
              fill
              priority={i === 0}
              className="object-cover"
              sizes="100vw"
            />
            <div className="absolute inset-0 bg-linear-to-r from-black/20 to-secondary/20" />
          </div>
        ))}
      </div>

      <div className="relative z-10 h-full flex items-center justify-start container mx-auto px-5">
        <div className="max-w-xl text-left text-white">

          <h1 className="text-3xl lg:text-4xl xl:text-5xl font-bold leading-tight">
            {slide.title}
          </h1>

          <p className="mt-6 text-xl lg:text-2xl font-light">{slide.subtitle}</p>
          <p className="mt-8 text-lg lg:text-xl font-medium text-orange-200">
            {slide.highlight}
          </p>

          <div className="mt-10 flex justify-start gap-4">
            <Link href="/signup">
              <Button
                size="lg"
                className=""
              >
                Join Now
              </Button>
            </Link>

            <Link href="/explore">
              <Button
                size="lg"
                variant="outline"
                className="border-white text-white hover:bg-white/20 text-lg"
              >
                <Download className="mr-2 h-5 w-5" />
                Download App
              </Button>
            </Link>
          </div>
        </div>
      </div>

    </section>
  );
}

