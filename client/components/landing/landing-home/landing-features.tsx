import { Globe, HeartHandshake, ShieldCheck } from "lucide-react";

const features = [
  {
    icon: ShieldCheck,
    title: "Zero toxicity. By design.",
    desc: "Politics, hate, and negativity are permanently banned. AI + human eyes keep the space clean 24/7.",
  },
  {
    icon: Globe,
    title: "Connect across 190+ countries",
    desc: "Auto-translation, cultural tags, and smart matching help you make real friends worldwide — instantly.",
  },
  {
    icon: HeartHandshake,
    title: "Feed that actually feels good",
    desc: "Travel stories, gratitude posts, music shares, and daily joy. Algorithm built to uplift, never to outrage.",
  },
];

export default function FeaturesSection() {
  return (
    <section id="features" className="py-24 md:py-32">
      <div className="container mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-4xl md:text-5xl xl:text-6xl 2xl:text-7xl tracking-tight mb-6">
            Finally, social media that{" "}
            <span className="text-primary">feels good</span>
          </h2>
          <p className="text-lg md:text-xl xl:text-2xl">
            No doomscrolling. No arguments. Just real people sharing real joy.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 w-full mx-auto">
          {features.map((feature, index) => (
            <div
              key={feature.title || index}
              className="group relative p-8 rounded-2xl bg-card border border-border hover:border-primary/30 transition-all duration-300 hover:shadow-lg"
            >
              <div className="mb-6">
                <div className="inline-flex p-3 rounded-xl bg-primary/10 text-primary group-hover:bg-primary/20 transition-colors">
                  <feature.icon className="h-7 w-7" />
                </div>
              </div>

              <div>
                <h3 className="text-xl font-bold mb-4 text-foreground">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {feature.desc}
                </p>
              </div>

              <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary/0 group-hover:bg-primary transition-all duration-300 rounded-b-2xl" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
