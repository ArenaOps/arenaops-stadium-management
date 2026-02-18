"use client";

import { useState } from "react";
import { motion, useScroll, useMotionValueEvent, AnimatePresence } from "framer-motion";
import {
    Home,
    Building2,
    Trophy,
    Ticket,
    User,
    LogIn,
    UserPlus,
    Menu,
    X,
    LogOut,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/app/store/store";
import { logoutUser } from "@/app/store/authSlice";

const navItems = [
    { icon: Home, label: "Home", href: "/" },
    { icon: Building2, label: "Stadiums", href: "/stadiums" },
    { icon: Trophy, label: "Matches", href: "/matches" },
    { icon: Ticket, label: "Bookings", href: "/bookings" },
    { icon: User, label: "Profile", href: "/profile" },
];

export default function Navbar() {
    const pathname = usePathname();
    const router = useRouter();
    const dispatch = useDispatch<any>();
    const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileOpen, setIsMobileOpen] = useState(false);

    const { scrollY } = useScroll();

    useMotionValueEvent(scrollY, "change", (latest) => {
        setIsScrolled(latest > 50);
    });

    const authMode = pathname === "/register" ? "signup" : "login";

    const handleLogout = () => {
        dispatch(logoutUser());
        router.push("/");
        setIsMobileOpen(false);
    };

    return (
        <header
            className={`fixed top-0 w-full z-50 transition-all duration-500 ${isScrolled
                ? "py-3 bg-[#050505]/80 backdrop-blur-xl border-b border-white/5 shadow-2xl"
                : "py-6 bg-transparent"
                }`}
        >
            <div className="flex items-center justify-between max-w-7xl mx-auto px-6 md:px-8">

                {/* Logo */}
                <Link href="/" className="flex items-center gap-2 group">
                    <div className="w-9 h-9 md:w-10 md:h-10 rounded-lg bg-emerald-500 flex items-center justify-center">
                        <span className="text-black font-black text-lg italic">A</span>
                    </div>
                    <span className="text-[#F8FAFC] text-xl md:text-2xl font-black italic uppercase">
                        Arena<span className="text-emerald-500">Ops</span>
                    </span>
                </Link>

                {/* Desktop Nav */}
                <nav className="hidden md:flex items-center bg-[#111827]/40 backdrop-blur-md rounded-2xl px-2 border border-white/5">
                    {navItems.map((item, index) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href;

                        if (item.label === "Profile" && !isAuthenticated) return null;

                        return (
                            <Link
                                key={index}
                                href={item.href}
                                className={`flex items-center justify-center w-14 h-12 transition ${isActive
                                    ? "text-emerald-400"
                                    : "text-gray-400 hover:text-white"
                                    }`}
                            >
                                <Icon size={22} />
                            </Link>
                        );
                    })}
                </nav>

                {/* Desktop Auth/User Buttons */}
                {isAuthenticated && user ? (
                    <div className="hidden md:flex items-center gap-4">
                        <div className="flex items-center gap-3 bg-[#111827]/40 backdrop-blur-md rounded-full px-4 py-2 border border-white/5">
                            <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                                <User size={18} />
                            </div>
                            <span className="text-sm font-medium text-gray-200">
                                {user.fullName || "User"}
                            </span>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="bg-[#111827]/40 backdrop-blur-md rounded-full p-2.5 border border-white/5 text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                            title="Logout"
                        >
                            <LogOut size={20} />
                        </button>
                    </div>
                ) : (
                    <div className="hidden md:flex relative items-center bg-[#0a0a0a] rounded-full p-1 border border-white/10 overflow-hidden">
                        <motion.div
                            className="absolute h-[calc(100%-8px)] w-22 bg-emerald-500 rounded-full"
                            animate={{ x: authMode === "login" ? 4 : 92 }}
                            transition={{ type: "spring", stiffness: 400, damping: 35 }}
                        />

                        <Link
                            href="/login"
                            className={`relative z-10 w-23 py-2 text-xs font-bold flex items-center justify-center gap-2 ${authMode === "login" ? "text-black" : "text-gray-400"
                                }`}
                        >
                            <LogIn size={14} />
                            Login
                        </Link>

                        <Link
                            href="/register"
                            className={`relative z-10 w-23 py-2 text-xs font-bold flex items-center justify-center gap-2 ${authMode === "signup" ? "text-black" : "text-gray-400"
                                }`}
                        >
                            <UserPlus size={14} />
                            Join
                        </Link>
                    </div>
                )}

                {/* Mobile Menu Button */}
                <button
                    onClick={() => setIsMobileOpen(!isMobileOpen)}
                    className="md:hidden text-white"
                >
                    {isMobileOpen ? <X size={26} /> : <Menu size={26} />}
                </button>
            </div>

            {/* Mobile Drawer */}
            <AnimatePresence>
                {isMobileOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                        className="md:hidden bg-[#0b0b0b] border-t border-white/10 px-6 py-6 space-y-6"
                    >
                        {navItems.map((item, index) => {
                            const Icon = item.icon;
                            let isActive = pathname === item.href;

                            // Special handling for Profile link in navItems if we want to show it differently or not
                            if (item.label === "Profile" && !isAuthenticated) return null;

                            return (
                                <Link
                                    key={index}
                                    href={item.href}
                                    onClick={() => setIsMobileOpen(false)}
                                    className={`flex items-center gap-3 text-sm font-semibold ${isActive
                                        ? "text-emerald-400"
                                        : "text-gray-400 hover:text-white"
                                        }`}
                                >
                                    <Icon size={18} />
                                    {item.label}
                                </Link>
                            );
                        })}

                        <div className="border-t border-white/10 pt-4 flex flex-col gap-4">
                            {isAuthenticated && user ? (
                                <>
                                    <div className="flex items-center gap-3 text-gray-300">
                                        <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                                            <User size={18} />
                                        </div>
                                        <span className="font-medium">{user.fullName || "User"}</span>
                                    </div>
                                    <button
                                        onClick={handleLogout}
                                        className="text-red-400 hover:text-red-300 flex items-center gap-2"
                                    >
                                        <LogOut size={16} />
                                        Logout
                                    </button>
                                </>
                            ) : (
                                <>
                                    <Link
                                        href="/login"
                                        className="text-gray-400 hover:text-white flex items-center gap-2"
                                    >
                                        <LogIn size={16} />
                                        Login
                                    </Link>

                                    <Link
                                        href="/register"
                                        className="text-emerald-400 flex items-center gap-2"
                                    >
                                        <UserPlus size={16} />
                                        Join
                                    </Link>
                                </>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </header>
    );
}
