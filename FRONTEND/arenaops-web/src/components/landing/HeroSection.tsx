"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import styles from "./HeroSection.module.scss";
import { Button } from "@/components/ui/Button";
import { PlayCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

type Theme = "morning" | "evening" | "night";

export function HeroSection() {
  
  const getCurrentTheme = (): Theme => {
    const hour = new Date().getHours();
    if (hour >= 6 && hour < 16) return "morning";
    if (hour >= 17 && hour < 19) return "evening";
    return "night";
  };

  const [theme] = useState<Theme>(() => getCurrentTheme());

  const imageMap = {
    morning: "/stadium-morning.jpg",
    evening: "/stadium-evening.jpg",
    night: "/stadium-night.jpg",
  };
const [time, setTime] = useState<string>("");

useEffect(() => {
  const updateTime = () => {
    const now = new Date();
    setTime(
      now.toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      })
    );
  };

  updateTime();
  const interval = setInterval(updateTime, 1000);

  return () => clearInterval(interval);
}, []);
  return (
    <section className={styles.heroContainer} data-theme={theme}>
      <Image
        src={imageMap[theme]}
        alt="stadium background"
        fill
        className="object-cover"
      />
      <div className={styles.centerSpotlight} />
      <div className="fixed right-0 -translate-y-1/2 z-50 flex items-center -rotate-90">
  <div className="bg-black/50 backdrop-blur-md text-white px-6 py-3 rounded-full text-xl font-semibold shadow-lg">
    {time}
  </div>
</div>

      {/* Content Layer */}
      <div className={styles.contentLayer}>
        {/* Event Badge */}
        <div
          className={cn(
            "inline-flex items-center rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary-foreground mb-8 backdrop-blur-sm shadow-[0_0_15px_rgba(var(--primary),0.3)]",
            styles.liveBadge, // Apply pulse animation from SCSS
          )}
        >
          <span className="relative flex h-2 w-2 mr-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
          </span>
          NEXT MATCH: RED DRAGONS vs BLUE KNIGHTS
        </div>

        {/* Headline with Text Pressure Effect */}
        <div className="flex flex-col items-center mb-8 animate-fade-in-up delay-100">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-heading tracking-tighter text-transparent bg-clip-text bg-linear-to-b from-white to-white/70 uppercase leading-none">
            EXPERIENCE THE
          </h1>

          <h1 className="text-6xl md:text-8xl lg:text-9xl font-heading tracking-tighter text-transparent bg-clip-text bg-linear-to-r from-primary via-green-600 to-green-500 mt-2 uppercase leading-none">
            IMPOSSIBLE
          </h1>
        </div>

        {/* Subheadline */}
        <p className="max-w-2xl text-lg md:text-xl text-slate-300 font-bold mb-10 leading-relaxed tracking-wide animate-fade-in-up delay-200">
          The future of stadium management is here. Book seats, explore venues,
          and immerse yourself in the game like never before.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-6 justify-center items-center w-full sm:w-auto mb-16 animate-fade-in-up delay-200 z-50">
          <Link href={"/events"}>
          <Button
  variant="outline"
  size="lg"
  className="
  h-14 px-10 text-lg font-medium
  border
  border-(--btn-outline)
  text-(--btn-bg)
  hover:bg-(--btn-bg)
  hover:text-(--btn-text)
  transition-all duration-300
  rounded-full group cursor-pointer
  "
>
            Explore Events
            <PlayCircle className="ml-2 h-5 w-5 transition-colors group-hover:text-current" />
          </Button>
          </Link>
        </div>
      </div>
      <div className={styles.footerFade} />
    </section>
  );
}
