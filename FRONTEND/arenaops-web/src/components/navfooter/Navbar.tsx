"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
    Home,
    Building2,
    Trophy,
    Ticket,
    User,
    LogIn,
    UserPlus,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
    { icon: Home, label: "Home", href: "/" },
    { icon: Building2, label: "Stadiums", href: "/stadiums" },
    { icon: Trophy, label: "Matches", href: "/matches" },
    { icon: Ticket, label: "Bookings", href: "/bookings" },
    { icon: User, label: "Profile", href: "/profile" },
];

export default function Navbar() {
    const pathname = usePathname();
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

    const authMode = pathname === "/register" ? "signup" : "login";

    return (
        <header className="w-full sticky top-0 z-50">
            <div className="flex items-center justify-between max-w-7xl mx-auto px-8 py-5">

                {/* 🔹 LOGO */}
                <Link href="/" className="flex items-center gap-2 group">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#7C3AED] to-[#06B6D4] flex items-center justify-center shadow-md">
                        <span className="text-white font-bold text-sm">A</span>
                    </div>

                    <span className="text-[#F8FAFC] text-xl font-semibold tracking-wide">
                        Arena
                        <span className="bg-gradient-to-r from-[#7C3AED] to-[#06B6D4] bg-clip-text text-transparent">
                            Ops
                        </span>
                    </span>
                </Link>

                {/* 🔹 CENTER NAV */}
                <div className="relative flex items-center gap-5">
                    {navItems.map((item, index) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href;
                        const isHovered = hoveredIndex === index;

                        return (
                            <div
                                key={index}
                                className="relative flex flex-col items-center"
                                onMouseEnter={() => setHoveredIndex(index)}
                                onMouseLeave={() => setHoveredIndex(null)}
                            >
                                <Link
                                    href={item.href}
                                    className="relative flex items-center justify-center w-12 h-12 group"
                                >
                                    {/* Active Glow */}
                                    {isActive && (
                                        <>
                                            <motion.div
                                                layoutId="spotlight"
                                                className="absolute -top-6 w-14 h-16 bg-[#7C3AED]/25 blur-xl rounded-2xl"
                                                transition={{
                                                    type: "spring",
                                                    stiffness: 400,
                                                    damping: 30,
                                                }}
                                            />

                                            <motion.div
                                                layoutId="indicator"
                                                className="absolute -top-4 w-10 h-1 bg-gradient-to-r from-[#7C3AED] to-[#06B6D4] rounded-full"
                                                transition={{
                                                    type: "spring",
                                                    stiffness: 400,
                                                    damping: 30,
                                                }}
                                            />
                                        </>
                                    )}

                                    <Icon
                                        size={26}
                                        className={`transition-all duration-300 ${
                                            isActive
                                                ? "text-[#06B6D4] scale-110"
                                                : "text-[#9CA3AF] group-hover:text-[#F8FAFC]"
                                        }`}
                                    />
                                </Link>

                                {/* Tooltip */}
                                <motion.div
                                    initial={{ opacity: 0, y: 6 }}
                                    animate={{
                                        opacity: isHovered ? 1 : 0,
                                        y: isHovered ? 0 : 6,
                                    }}
                                    transition={{ duration: 0.2 }}
                                    className="absolute -bottom-7 text-xs font-medium text-[#F8FAFC] bg-[#111827] px-3 py-1 rounded-md pointer-events-none whitespace-nowrap"
                                >
                                    {item.label}
                                </motion.div>
                            </div>
                        );
                    })}
                </div>

                {/* 🔹 AUTH TOGGLE */}
                <div className="relative flex items-center bg-[#111827] rounded-full p-1 border border-[#1F2937]">

                    <motion.div
                        layout
                        className="absolute top-1 bottom-1 w-24 bg-gradient-to-r from-[#7C3AED] to-[#06B6D4] rounded-full"
                        animate={{
                            x: authMode === "login" ? 0 : 96,
                        }}
                        transition={{
                            type: "spring",
                            stiffness: 400,
                            damping: 30,
                        }}
                    />

                    <Link
                        href="/login"
                        className={`relative z-10 w-24 py-2 text-sm font-medium flex items-center justify-center gap-2 transition ${
                            authMode === "login"
                                ? "text-white"
                                : "text-[#9CA3AF] hover:text-[#F8FAFC]"
                        }`}
                    >
                        <LogIn size={16} />
                        Login
                    </Link>

                    <Link
                        href="/register"
                        className={`relative z-10 w-24 py-2 text-sm font-medium flex items-center justify-center gap-2 transition ${
                            authMode === "signup"
                                ? "text-white"
                                : "text-[#9CA3AF] hover:text-[#F8FAFC]"
                        }`}
                    >
                        <UserPlus size={16} />
                        Sign Up
                    </Link>
                </div>
            </div>
        </header>
    );
}