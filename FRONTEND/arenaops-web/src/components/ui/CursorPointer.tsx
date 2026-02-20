"use client";

import { useEffect } from "react";
import gsap from "gsap";
import Image from "next/image";

export default function CustomCursor() {
  useEffect(() => {
  const cursor = document.querySelector(".cursor-dot");
  const follower = document.querySelector(".cursor-follower");

  if (!cursor || !follower) return;

  const moveCursor = (e: MouseEvent) => {
    gsap.to(cursor, {
      x: e.clientX,
      y: e.clientY,
      duration: 0.1,
      ease: "power2.out",
    });

    gsap.to(follower, {
      x: e.clientX,
      y: e.clientY,
      duration: 0.4,
      ease: "power3.out",
    });
  };

  window.addEventListener("mousemove", moveCursor);

  const hoverTargets = document.querySelectorAll("a, button");

  const enterHandler = () =>
    gsap.to(follower, { scale: 1.6, duration: 0.3 });

  const leaveHandler = () =>
    gsap.to(follower, { scale: 1, duration: 0.3 });

  hoverTargets.forEach((el) => {
    el.addEventListener("mouseenter", enterHandler);
    el.addEventListener("mouseleave", leaveHandler);
  });

  return () => {
    window.removeEventListener("mousemove", moveCursor);
    hoverTargets.forEach((el) => {
      el.removeEventListener("mouseenter", enterHandler);
      el.removeEventListener("mouseleave", leaveHandler);
    });
  };
}, []);

  return (
    <>
      <div className="cursor-dot" />
      <div className="cursor-follower">
  <Image src="/football.svg" alt="cursor" fill/>
</div>
    </>
  );
}
