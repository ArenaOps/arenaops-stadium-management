"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Ticket, PlayCircle } from "lucide-react";
import styles from "./HeroSection.module.scss";
import { cn } from "@/lib/utils";
import { TextPressure } from "./TextPressure";

const Countdown = () => {
    // Mock target date (2 days from now)
    const [timeLeft, setTimeLeft] = useState({ days: 2, hours: 4, minutes: 15, seconds: 0 });

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft(prev => {
                let { days, hours, minutes, seconds } = prev;
                if (seconds > 0) seconds--;
                else {
                    seconds = 59;
                    if (minutes > 0) minutes--;
                    else {
                        minutes = 59;
                        if (hours > 0) hours--;
                        else {
                            hours = 23;
                            if (days > 0) days--;
                        }
                    }
                }
                return { days, hours, minutes, seconds };
            });
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    return (
        <div className="flex items-center space-x-4 bg-background/10 backdrop-blur-md rounded-xl p-4 border border-white/10 shadow-2xl animate-fade-in-up delay-300">
            <div className="flex flex-col items-center">
                <span className="text-2xl font-bold font-mono text-primary">{String(timeLeft.days).padStart(2, '0')}</span>
                <span className="text-xs text-muted-foreground uppercase tracking-widest">Days</span>
            </div>
            <div className="h-8 w-px bg-white/20" />
            <div className="flex flex-col items-center">
                <span className="text-2xl font-bold font-mono text-primary">{String(timeLeft.hours).padStart(2, '0')}</span>
                <span className="text-xs text-muted-foreground uppercase tracking-widest">Hrs</span>
            </div>
            <div className="h-8 w-px bg-white/20" />
            <div className="flex flex-col items-center">
                <span className="text-2xl font-bold font-mono text-primary">{String(timeLeft.minutes).padStart(2, '0')}</span>
                <span className="text-xs text-muted-foreground uppercase tracking-widest">Mins</span>
            </div>
            <div className="h-8 w-px bg-white/20" />
            <div className="flex flex-col items-center">
                <span className="text-2xl font-bold font-mono text-primary">{String(timeLeft.seconds).padStart(2, '0')}</span>
                <span className="text-xs text-muted-foreground uppercase tracking-widest">Secs</span>
            </div>
        </div>
    );
}

export function HeroSection() {
    return (
        <section className={styles.heroContainer}>
            {/* Visual Effects Layer */}
            <div className={styles.lightsContainer}>
                <div className={styles.leftLight} /> {/* Top-Left Light */}
                <div className={styles.rightLight} /> {/* Top-Right Light */}
            </div>

            <div className={styles.centerSpotlight} /> {/* Central Glow */}

            {/* Stadium Ground Perspective */}
            <div className={styles.fieldContainer} />

            {/* Dynamic Action Overlay (Standing over the field) */}
            <div className={styles.actionWrapper}>
                {/* Left Player */}
                <div className={cn(styles.player, styles.leftPlayer)}>
                    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12.5,2A2.5,2.5,0,1,0,10,4.5,2.5,2.5,0,0,0,12.5,2ZM8.5,8,4.65,11.85a1,1,0,0,0,0,1.41L6,14.6l3-3V20a1,1,0,0,0,2,0V14.5l2-2.3,1.5,4.8a1,1,0,0,0,1,.7h2a1,1,0,0,0,0-2H16l-1.8-5.8L13,7.5,10,7Z" />
                    </svg>
                </div>

                {/* The Ball */}
                <div className={styles.football}>⚽</div>


                {/* Right Player */}
                <div className={cn(styles.player, styles.rightPlayer)}>
                    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12.5,2A2.5,2.5,0,1,0,10,4.5,2.5,2.5,0,0,0,12.5,2ZM8.5,8,4.65,11.85a1,1,0,0,0,0,1.41L6,14.6l3-3V20a1,1,0,0,0,2,0V14.5l2-2.3,1.5,4.8a1,1,0,0,0,1,.7h2a1,1,0,0,0,0-2H16l-1.8-5.8L13,7.5,10,7Z" />
                    </svg>
                </div>
            </div>

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
                    <TextPressure
                        text="EXPERIENCE THE"
                        className="text-4xl md:text-6xl lg:text-7xl font-heading font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-white/70 uppercase leading-none"
                        minWeight={400}
                        maxWeight={900}
                    />
                    <TextPressure
                        text="IMPOSSIBLE"
                        className="text-6xl md:text-8xl lg:text-9xl font-heading font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-primary via-blue-400 to-purple-500 mt-2 uppercase leading-none"
                        minWeight={400}
                        maxWeight={900}
                    />
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

                {/* Floating Interactive Element: Countdown / Scoreboard */}
                <Countdown />

            </div>

            {/* Bottom Gradient Fade for seamless transition to Event Discovery */}
            <div className="absolute bottom-0 left-0 w-full h-40 bg-gradient-to-t from-[#020617] via-[#020617]/50 to-transparent pointer-events-none z-20" />
        </section>

    )
}
