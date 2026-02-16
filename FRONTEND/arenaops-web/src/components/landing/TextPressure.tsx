
"use client";

import React, { useRef, useState, useEffect } from "react";
import { motion, useSpring, useTransform, useMotionValue } from "framer-motion";

interface TextPressureProps {
    text: string;
    className?: string;
    minWeight?: number;
    maxWeight?: number;
}

export function TextPressure({
    text,
    className = "",
    minWeight = 100,
    maxWeight = 900
}: TextPressureProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    // Smooth mouse tracking
    const springConfig = { damping: 20, stiffness: 150 };
    const smoothX = useSpring(mouseX, springConfig);
    const smoothY = useSpring(mouseY, springConfig);

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        mouseX.set(e.clientX - rect.left);
        mouseY.set(e.clientY - rect.top);
    };

    const handleMouseLeave = () => {
        mouseX.set(-1000); // Move away
        mouseY.set(-1000);
    };

    return (
        <div
            ref={containerRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            className={`relative inline-flex flex-wrap justify-center cursor-default ${className}`}
            style={{ perspective: "1000px" }}
        >
            {text.split("").map((char, i) => (
                <Char
                    key={`${char}-${i}`}
                    char={char}
                    index={i}
                    mouseX={smoothX}
                    mouseY={smoothY}
                    minWeight={minWeight}
                    maxWeight={maxWeight}
                    containerRef={containerRef}
                />
            ))}
        </div>
    );
}

function Char({
    char,
    index,
    mouseX,
    mouseY,
    minWeight,
    maxWeight,
    containerRef
}: {
    char: string;
    index: number;
    mouseX: any;
    mouseY: any;
    minWeight: number;
    maxWeight: number;
    containerRef: React.RefObject<HTMLDivElement | null>;
}) {
    const charRef = useRef<HTMLSpanElement>(null);

    // Create local motion values for performance
    const weight = useMotionValue(minWeight);
    const scale = useMotionValue(1);

    useEffect(() => {
        const update = () => {
            if (!charRef.current || !containerRef.current) return;

            const rect = charRef.current.getBoundingClientRect();
            const containerRect = containerRef.current.getBoundingClientRect();

            const charCenterX = rect.left - containerRect.left + rect.width / 2;
            const charCenterY = rect.top - containerRect.top + rect.height / 2;

            const dx = mouseX.get() - charCenterX;
            const dy = mouseY.get() - charCenterY;
            const distance = Math.sqrt(dx * dx + dy * dy);

            // Influence radius
            const radius = 150;
            const force = Math.max(0, 1 - distance / radius);

            // Map force to font weight and scale
            weight.set(minWeight + (maxWeight - minWeight) * force);
            scale.set(1 + force * 0.15); // Slight "bulge"
        };

        const unsubscribeX = mouseX.on("change", update);
        const unsubscribeY = mouseY.on("change", update);

        return () => {
            unsubscribeX();
            unsubscribeY();
        };
    }, [mouseX, mouseY, minWeight, maxWeight]);

    if (char === " ") return <span className="w-[0.3em]" />;

    return (
        <motion.span
            ref={charRef}
            style={{
                display: "inline-block",
                fontWeight: weight as any,
                scale: scale,
                fontVariationSettings: `"wght" ${weight.get()}`,
                transition: "font-variation-settings 0.1s ease"
            }}
            className="select-none transition-colors"
        >
            {char}
        </motion.span>
    );
}
