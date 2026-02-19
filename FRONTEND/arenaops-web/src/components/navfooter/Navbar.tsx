"use client";

import { useState, useEffect } from "react";
import { motion, useScroll, useMotionValueEvent } from "framer-motion";
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
    const [isScrolled, setIsScrolled] = useState(false);

    const { scrollY } = useScroll();

    useMotionValueEvent(scrollY, "change", (latest) => {
        if (latest > 50) {
            setIsScrolled(true);
        } else {
            setIsScrolled(false);
        }
    });

    const authMode = pathname === "/register" ? "signup" : "login";

    return (
        <header
            className={`fixed top-0 w-full z-50 transition-all duration-500 ${isScrolled
                    ? "py-3 bg-[#050505]/80 backdrop-blur-xl border-b border-white/5 shadow-2xl"
                    : "py-6 bg-transparent"
                }`}
        >
            <div className="flex items-center justify-between max-w-7xl mx-auto px-8">
                <Link href="/" className="flex items-center gap-2 group">
                    <div className="w-10 h-10 rounded-lg bg-emerald-500 flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.4)] group-hover:rotate-6 transition-transform">
                        <span className="text-black font-black text-xl italic">A</span>
                    </div>

                    <span className="text-[#F8FAFC] text-2xl font-black italic tracking-tighter uppercase">
                        Arena
                        <span className="text-emerald-500 ml-0.5">Ops</span>
                    </span>
                </Link>

                <nav className="hidden md:flex items-center bg-[#111827]/40 backdrop-blur-md rounded-2xl px-2 border border-white/5">
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
                                    className="relative flex items-center justify-center w-14 h-12 group transition-colors"
                                >
                                    {isActive && (
                                        <motion.div
                                            layoutId="nav-glow"
                                            className="absolute inset-0 bg-emerald-500/10 blur-md rounded-xl"
                                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                        />
                                    )}

                                    <Icon
                                        size={22}
                                        className={`relative z-10 transition-all duration-300 ${isActive
                                                ? "text-emerald-400 scale-110"
                                                : "text-gray-400 group-hover:text-white"
                                            }`}
                                    />

                                    {isActive && (
                                        <motion.div
                                            layoutId="active-bar"
                                            className="absolute bottom-1 w-5 h-0.5 bg-emerald-500 rounded-full"
                                        />
                                    )}
                                </Link>

                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{
                                        opacity: isHovered ? 1 : 0,
                                        y: isHovered ? 0 : 10,
                                    }}
                                    className="absolute -bottom-10 text-[10px] font-bold tracking-widest uppercase text-emerald-400 bg-black/90 px-3 py-1.5 rounded border border-emerald-500/20 pointer-events-none whitespace-nowrap"
                                >
                                    {item.label}
                                </motion.div>
                            </div>
                        );
                    })}
                </nav>

                <div className="relative flex items-center bg-[#0a0a0a] rounded-full p-1 border border-white/10 overflow-hidden">
                    <motion.div
                        className="absolute h-[calc(100%-8px)] w-22 bg-emerald-500 rounded-full"
                        animate={{
                            x: authMode === "login" ? 4 : 92,
                        }}
                        transition={{ type: "spring", stiffness: 400, damping: 35 }}
                    />

                    <Link
                        href="/login"
                        className={`relative z-10 w-23 py-2 text-xs font-bold uppercase tracking-tighter flex items-center justify-center gap-2 transition-colors duration-300 ${authMode === "login" ? "text-black" : "text-gray-400 hover:text-white"
                            }`}
                    >
                        <LogIn size={14} />
                        Login
                    </Link>

                    <Link
                        href="/register"
                        className={`relative z-10 w-23 py-2 text-xs font-bold uppercase tracking-tighter flex items-center justify-center gap-2 transition-colors duration-300 ${authMode === "signup" ? "text-black" : "text-gray-400 hover:text-white"
                            }`}
                    >
                        <UserPlus size={14} />
                        Join
                    </Link>
                </div>
            </div>
        </header>
    );
}