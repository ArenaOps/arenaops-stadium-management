'use client';

import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';

const SimpleUniqueFooter = () => {
  const footerRef = useRef<HTMLElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const moveGlow = (e: MouseEvent) => {
      if (!footerRef.current || !glowRef.current) return;
      const rect = footerRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      gsap.to(glowRef.current, {
        x,
        y,
        duration: 0.6,
        ease: 'power2.out',
      });
    };

    window.addEventListener('mousemove', moveGlow);
    return () => window.removeEventListener('mousemove', moveGlow);
  }, []);

  return (
    <footer 
      ref={footerRef}
      className="relative bg-black py-12 px-8 overflow-hidden border-t border-white/5"
    >
      <div 
        ref={glowRef}
        className="pointer-events-none absolute top-0 left-0 w-100 h-100 -translate-x-1/2 -translate-y-1/2 bg-emerald-500/20 blur-[100px] rounded-full z-0"
      />

      <div className="relative z-10 max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
        
        <div className="flex items-center gap-4">
          <span className="text-2xl font-black italic tracking-tighter text-white">
            Arena<span className="text-emerald-500">Ops</span>
          </span>
          <div className="h-8 w-px bg-white/20 rotate-12 hidden md:block" />
          <p className="text-[10px] uppercase tracking-[0.3em] text-gray-500">
            Secure your spot <br /> in the spotlight.
          </p>
        </div>

        <nav className="flex gap-10">
          {['Venues', 'Events', 'Support'].map((item) => (
            <a 
              key={item} 
              href={`#${item.toLowerCase()}`}
              className="group relative text-xs uppercase tracking-widest text-gray-400 hover:text-white transition-colors"
            >
              {item}
              <span className="absolute -bottom-1 left-0 w-0 h-px bg-emerald-500 transition-all group-hover:w-full" />
            </a>
          ))}
        </nav>

        <button className="px-6 py-2 border border-white/10 rounded-full text-[10px] uppercase tracking-widest hover:bg-white hover:text-black transition-all duration-300">
          Book Stadium ↗
        </button>
      </div>

      <div className="absolute bottom-0 left-0 w-full h-0.5 bg-linear-to-r from-transparent via-emerald-500/50 to-transparent" />
      
      <div className="mt-12 text-center text-[10px] text-gray-700 uppercase tracking-[0.5em]">
        © 2026 Stadium Booking Platform
      </div>
    </footer>
  );
};

export default SimpleUniqueFooter;