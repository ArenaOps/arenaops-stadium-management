"use client";

import { useState } from "react";
import { motion, useMotionValueEvent, useScroll, AnimatePresence } from "framer-motion";
import { Home, CalendarDays, Ticket, User, LogIn, UserPlus, Menu, X, LogOut } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { logoutUser } from "@/store/authSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";

const navItems = [
  { icon: Home, label: "Home", href: "/", requiresAuth: false },
  { icon: CalendarDays, label: "Events", href: "/events", requiresAuth: false },
  { icon: Ticket, label: "Bookings", href: "/bookings", requiresAuth: true },
  { icon: User, label: "Profile", href: "/profile", requiresAuth: true },
];

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);

  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (latest) => {
    setIsScrolled(latest > 50);
  });

  const authMode = pathname === "/register" ? "signup" : "login";

  const handleLogout = async () => {
    await dispatch(logoutUser());
    router.push("/");
    setIsMobileOpen(false);
  };

  const visibleNavItems = navItems.filter((item) => !item.requiresAuth || isAuthenticated);

  return (
    <header
      className={`fixed top-0 w-full z-50 transition-all duration-500 ${
        isScrolled ? "py-3 bg-[#050505]/80 backdrop-blur-xl" : "py-6 bg-transparent"
      }`}
    >
      <div className="flex items-center justify-between max-w-7xl mx-auto px-6 md:px-8">
        <Link href="/" className="flex items-center gap-2 group" aria-label="ArenaOps home">
          <div className="w-9 h-9 md:w-10 md:h-10 rounded-lg bg-emerald-500 flex items-center justify-center">
            <span className="text-black font-black text-lg italic">A</span>
          </div>
          <span className="text-[#F8FAFC] text-xl md:text-2xl font-black italic uppercase">
            Arena<span className="text-emerald-500">Ops</span>
          </span>
        </Link>

        <nav className="hidden md:flex items-center bg-[#111827]/40 backdrop-blur-md rounded-2xl px-2 border border-white/5">
          {visibleNavItems.map((item, index) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            const isHovered = hoveredIndex === index;

            return (
              <div
                key={item.href}
                className="relative flex flex-col items-center"
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                <Link href={item.href} className="relative flex items-center justify-center w-14 h-12 group transition-colors">
                  {isActive && (
                    <motion.div
                      layoutId="nav-glow"
                      className="absolute inset-0 bg-emerald-500/10 blur-md rounded-xl"
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}

                  <Icon
                    size={22}
                    className={`relative z-10 transition-all duration-300 ${
                      isActive ? "text-emerald-400 scale-110" : "text-gray-400 group-hover:text-white"
                    }`}
                  />

                  {isActive && <motion.div layoutId="active-bar" className="absolute bottom-1 w-5 h-0.5 bg-emerald-500 rounded-full" />}
                </Link>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: isHovered ? 1 : 0, y: isHovered ? 0 : 10 }}
                  className="absolute -bottom-10 text-[10px] font-bold tracking-widest uppercase text-emerald-400 bg-black/90 px-3 py-1.5 rounded border border-emerald-500/20 pointer-events-none whitespace-nowrap"
                >
                  {item.label}
                </motion.div>
              </div>
            );
          })}
        </nav>

        {isAuthenticated && user ? (
          <div className="hidden md:flex items-center gap-4">
            <Link
              href="/profile"
              className="flex items-center gap-3 bg-[#111827]/40 backdrop-blur-md rounded-full px-4 py-2 border border-white/5 hover:border-emerald-500/30 transition-all group"
            >
              <div className="relative w-8 h-8 rounded-full overflow-hidden bg-emerald-500/20 flex items-center justify-center text-emerald-400 border border-emerald-500/30">
                {user.profilePictureUrl ? (
                  <Image src={user.profilePictureUrl} alt={user.fullName || "User"} fill sizes="40px" className="object-cover" />
                ) : (
                  <User size={18} />
                )}
              </div>
              <span className="text-sm font-medium text-gray-200 group-hover:text-white transition-colors">{user.fullName || "User"}</span>
            </Link>
            <button
              onClick={() => void handleLogout()}
              className="bg-[#111827]/40 backdrop-blur-md rounded-full p-2.5 border border-white/5 text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
              title="Logout"
              aria-label="Logout"
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
              className={`relative z-10 w-23 py-2 text-xs font-bold uppercase tracking-tighter flex items-center justify-center gap-2 transition-colors duration-300 ${
                authMode === "login" ? "text-black" : "text-gray-400 hover:text-white"
              }`}
            >
              <LogIn size={14} />
              Login
            </Link>

            <Link
              href="/register"
              className={`relative z-10 w-23 py-2 text-xs font-bold uppercase tracking-tighter flex items-center justify-center gap-2 transition-colors duration-300 ${
                authMode === "signup" ? "text-black" : "text-gray-400 hover:text-white"
              }`}
            >
              <UserPlus size={14} />
              Join
            </Link>
          </div>
        )}

        <button
          className="md:hidden p-2 text-gray-400 hover:text-white transition-colors"
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          aria-label="Toggle menu"
        >
          {isMobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="md:hidden bg-[#0b0b0b] border-t border-white/10 px-6 py-6 space-y-6"
          >
            {visibleNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMobileOpen(false)}
                  className={`flex items-center gap-3 text-sm font-semibold ${
                    isActive ? "text-emerald-400" : "text-gray-400 hover:text-white"
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
                  <Link
                    href="/profile"
                    onClick={() => setIsMobileOpen(false)}
                    className="flex items-center gap-3 text-gray-300 hover:text-white transition-colors"
                  >
                    <div className="relative w-10 h-10 rounded-full overflow-hidden bg-emerald-500/20 flex items-center justify-center text-emerald-400 border border-emerald-500/30">
                      {user.profilePictureUrl ? (
                        <Image src={user.profilePictureUrl} alt={user.fullName || "User"} fill className="w-full h-full object-cover" />
                      ) : (
                        <User size={20} />
                      )}
                    </div>
                    <div className="flex flex-col">
                      <span className="font-medium">{user.fullName || "User"}</span>
                      <span className="text-xs text-gray-500">View Profile</span>
                    </div>
                  </Link>
                  <button onClick={() => void handleLogout()} className="text-red-400 hover:text-red-300 flex items-center gap-2">
                    <LogOut size={16} />
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link href="/login" className="text-gray-400 hover:text-white flex items-center gap-2" onClick={() => setIsMobileOpen(false)}>
                    <LogIn size={16} />
                    Login
                  </Link>

                  <Link href="/register" className="text-emerald-400 flex items-center gap-2" onClick={() => setIsMobileOpen(false)}>
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
