"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import Link from "next/link";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "Events", href: "/events" },
  { label: "My Bookings", href: "/bookings" },
  { label: "Profile", href: "/profile" },
];

const quickLinks = [
  { label: "Sign In", href: "/login" },
  { label: "Register", href: "/register" },
  { label: "Forgot Password", href: "/forgot-password" },
];

const Footer = () => {
  const footerRef = useRef<HTMLElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const moveGlow = (event: MouseEvent) => {
      if (!footerRef.current || !glowRef.current) {
        return;
      }

      const rect = footerRef.current.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;

      gsap.to(glowRef.current, {
        x,
        y,
        duration: 0.6,
        ease: "power2.out",
      });
    };

    window.addEventListener("mousemove", moveGlow);
    return () => window.removeEventListener("mousemove", moveGlow);
  }, []);

  return (
    <footer ref={footerRef} className="relative bg-black py-16 px-8 overflow-hidden border-t border-white/5">
      <div
        ref={glowRef}
        className="pointer-events-none absolute top-0 left-0 w-100 h-100 -translate-x-1/2 -translate-y-1/2 bg-emerald-500/20 blur-[100px] rounded-full z-0"
      />

      <div className="relative z-10 max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row justify-between items-start gap-10 mb-12">
          <div className="flex flex-col gap-3">
            <Link href="/" className="flex items-center gap-3 group">
              <span className="text-2xl font-black italic tracking-tighter text-white">
                Arena<span className="text-emerald-500">Ops</span>
              </span>
            </Link>
            <p className="text-[10px] uppercase tracking-[0.3em] text-gray-500 max-w-xs">
              Discover live events, reserve seats, and manage your tickets in one place.
            </p>
          </div>

          <div className="flex flex-wrap gap-12 lg:gap-16">
            <div>
              <h4 className="text-[10px] font-bold uppercase tracking-[0.3em] text-gray-400 mb-4">Explore</h4>
              <nav className="flex flex-col gap-2.5">
                {navLinks.map((link) => (
                  <Link
                    key={link.label}
                    href={link.href}
                    className="group relative text-xs uppercase tracking-widest text-gray-500 hover:text-white transition-colors w-fit"
                  >
                    {link.label}
                    <span className="absolute -bottom-0.5 left-0 w-0 h-px bg-emerald-500 transition-all group-hover:w-full" />
                  </Link>
                ))}
              </nav>
            </div>

            <div>
              <h4 className="text-[10px] font-bold uppercase tracking-[0.3em] text-gray-400 mb-4">Account</h4>
              <nav className="flex flex-col gap-2.5">
                {quickLinks.map((link) => (
                  <Link
                    key={link.label}
                    href={link.href}
                    className="group relative text-xs uppercase tracking-widest text-gray-500 hover:text-white transition-colors w-fit"
                  >
                    {link.label}
                    <span className="absolute -bottom-0.5 left-0 w-0 h-px bg-emerald-500 transition-all group-hover:w-full" />
                  </Link>
                ))}
              </nav>
            </div>
          </div>

          <div className="flex flex-col items-start gap-3">
            <p className="text-[10px] uppercase tracking-[0.2em] text-gray-500">Ready to explore?</p>
            <Link
              href="/events"
              className="px-6 py-3 bg-linear-to-r from-indigo-600 to-blue-600 rounded-full text-[10px] font-bold uppercase tracking-widest text-white hover:shadow-lg hover:shadow-indigo-500/20 transition-all"
            >
              Browse Events
            </Link>
            <Link
              href="/bookings"
              className="px-6 py-2.5 border border-white/10 rounded-full text-[10px] uppercase tracking-widest text-gray-400 hover:bg-white hover:text-black transition-all duration-300"
            >
              View My Bookings
            </Link>
          </div>
        </div>

        <div className="h-px bg-linear-to-r from-transparent via-white/10 to-transparent mb-6" />

        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-[10px] text-gray-700 uppercase tracking-[0.3em]">(c) 2026 ArenaOps</p>
          <div className="flex items-center gap-6">
            <span className="text-[10px] text-gray-700 uppercase tracking-[0.2em]">Privacy</span>
            <span className="text-[10px] text-gray-700 uppercase tracking-[0.2em]">Terms</span>
            <span className="text-[10px] text-gray-700 uppercase tracking-[0.2em]">Support</span>
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 w-full h-0.5 bg-linear-to-r from-transparent via-emerald-500/50 to-transparent" />
    </footer>
  );
};

export default Footer;
