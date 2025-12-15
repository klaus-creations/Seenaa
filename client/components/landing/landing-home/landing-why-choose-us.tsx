
import React from "react"
import Image from "next/image"

export default function LandingWhyChooseUs() {
    return (
        <section className="w-full h-[70vh] bg-linear-to-br from-primary/4 to-secondary/10 ">
            <div className="container mx-auto h-full flex items-center justify-center">

            <div className="w-1/2 flex flex-col gap-6">
                <h2 className="text-5xl font-bold leading-tight">
                    Why Choose <span className="text-primary">VibeTrab</span>?
                </h2>

                <p className="text-lg text-muted-foreground max-w-md">
                    VibeTrab gives you a space to connect with people, share your moments,
                    react genuinely, and build meaningful digital relationships.
                    It's fast, modern, and designed for the new era of social interaction.
                </p>

                <ul className="space-y-3 text-lg">
                    <li className="flex items-start gap-3">
                        <span className="text-primary text-2xl">•</span>
                        Real-time engagement with the community
                    </li>
                    <li className="flex items-start gap-3">
                        <span className="text-primary text-2xl">•</span>
                        Smooth posting, reacting, and discovering content
                    </li>
                    <li className="flex items-start gap-3">
                        <span className="text-primary text-2xl">•</span>
                        Clean UI built for creators and everyday users
                    </li>
                    <li className="flex items-start gap-3">
                        <span className="text-primary text-2xl">•</span>
                        Stay connected with what matters most
                    </li>
                </ul>
            </div>

            <div className="w-[55%] flex justify-center">
                <Image
                    src="/images/choose-us.jpg"
                    alt="Why choose us"
                    width={500}
                    height={500}
                    className="rounded-2xl w-full shadow-xl object-cover"
                />
            </div>

            </div>
        </section>
    )
}

