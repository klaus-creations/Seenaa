
import { Button } from "@/components/ui/button";
import Image from "next/image"
import Link from "next/link";
import React from "react"

export default function LandingSome () {
    return (
        <section className="container mx-auto h-screen flex items-center justify-between px-6">
            <LandingSomeLeft />
            <LandingSomeRight />
        </section>
    );
}


const LandingSomeLeft = function () {
    return (
        <div className="w-[25%]">
            <Image
                src={'/images/some.jpg'}
                alt="some image"
                width={400}
                height={400}
                className="w-full rounded-2xl shadow-md object-cover"
            />
        </div>
    );
};


const LandingSomeRight = function () {
    return (
        <div className="w-[60%] flex flex-col gap-3">
            <h1 className="text-4xl md:text-5xl xl:text-6xl 2xl:text-7xl leading-tight">
                Join Community of People With
                <span className="text-primary"> Good Vibes.</span>
            </h1>

            <p className="text-lg text-foreground-secondary max-w-xl">
                Join a vibrant community where you can post pictures, react to friends,
                explore trending moments, and express yourself freely.
                Built for creators, dreamers, and everyone in between.
            </p>

            <div className="flex gap-4 mt-4">
                <Button variant={'outline'}>
                    <Link href={'/auth/sign-up'}> Get Started </Link>
                </Button>
            </div>
        </div>
    );
};

