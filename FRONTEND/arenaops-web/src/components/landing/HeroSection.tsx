"use client";

import { Button } from "@/components/ui/Button";
import { Ticket, PlayCircle } from "lucide-react";
import styles from "./HeroSection.module.scss";
import { cn } from "@/lib/utils";

export function HeroSection() {
    return (
        <section className={styles.heroContainer}>
            <div className={styles.lightsContainer}>
                {/* Left Assembly */}
                <div className={cn(styles.lightAssembly, styles.rightAssembly)}>
                    <div className={styles.post} />
                    <div className={styles.lightFrame}>
                        {[...Array(30)].map((_, i) => (
                            <div key={i} className={styles.lightPoint} />
                        ))}
                        <div className={styles.frameGlow} />
                    </div>
                    <div className={styles.mainBeam} />
                </div>

                {/* Right Assembly */}
                <div className={cn(styles.lightAssembly, styles.leftAssembly)}>
                    <div className={styles.post} />
                    <div className={styles.lightFrame}>
                        {[...Array(30)].map((_, i) => (
                            <div key={i} className={styles.lightPoint} />
                        ))}
                        <div className={styles.frameGlow} />
                    </div>
                    <div className={styles.mainBeam} />
                </div>
            </div>

            <div className={styles.centerSpotlight} />

            {/* Content Layer */}
            <div className={styles.contentLayer}>

                {/* Event Badge */}
                <div className={cn(
                    "inline-flex items-center rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary-foreground mb-8 backdrop-blur-sm shadow-[0_0_15px_rgba(var(--primary),0.3)]",
                    styles.liveBadge // Apply pulse animation from SCSS
                )}>
                    <span className="relative flex h-2 w-2 mr-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                    </span>
                    NEXT MATCH: RED DRAGONS vs BLUE KNIGHTS
                </div>

                {/* Headline with Text Pressure Effect */}
                <div className="flex flex-col items-center mb-8 animate-fade-in-up delay-100">
                    <h1 className="text-4xl md:text-6xl lg:text-7xl font-heading font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-white/70 uppercase leading-none">
                        EXPERIENCE THE
                    </h1>


                    <h1 className="text-6xl md:text-8xl lg:text-9xl font-heading font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-primary via-green-400 to-green-500 mt-2 uppercase leading-none">
                        IMPOSSIBLE
                    </h1>
                </div>


                {/* Subheadline */}
                <p className="max-w-2xl text-lg md:text-xl text-slate-300/90 mb-10 leading-relaxed font-light tracking-wide animate-fade-in-up delay-200">
                    The future of stadium management is here. Book seats, explore venues, and immerse yourself in the game like never before.
                </p>

                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row gap-6 justify-center items-center w-full sm:w-auto mb-16 animate-fade-in-up delay-200 z-50">
                    <Button size="lg" className="h-14 px-10 text-lg font-semibold bg-primary hover:bg-primary/90 text-white shadow-[0_0_30px_-5px_var(--color-primary)] hover:shadow-[0_0_50px_-10px_var(--color-primary)] transition-all duration-300 border-none rounded-full cursor-pointer">
                        Book Tickets <Ticket className="ml-2 h-5 w-5" />
                    </Button>
                    <Button variant="outline" size="lg" className="h-14 px-10 text-lg font-medium bg-white/5 border-white/10 hover:bg-white/10 hover:border-primary/50 text-white backdrop-blur-md transition-all duration-300 rounded-full group cursor-pointer">
                        Explore Events <PlayCircle className="ml-2 h-5 w-5 group-hover:text-primary transition-colors" />
                    </Button>
                </div>
            </div>

            {/* Bottom Gradient Fade for seamless transition to Event Discovery */}
            <div className="absolute bottom-0 left-0 w-full h-40 bg-gradient-to-t from-[#020617] via-[#020617]/50 to-transparent pointer-events-none z-20" />
        </section>

    )
}
