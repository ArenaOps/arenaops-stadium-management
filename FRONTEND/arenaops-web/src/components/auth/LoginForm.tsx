"use client";

import { useRef, useLayoutEffect, useActionState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/app/store/store";
import {
  loginStart,
  loginSuccess,
  loginFailure,
} from "@/app/store/authSlice";
import gsap from "gsap";
import Link from "next/link";
import { Github, Chrome, Twitter, Linkedin } from "lucide-react";

interface FormState {
  errors: {
    username?: string;
    password?: string;
  };
}

const initialState: FormState = {
  errors: {},
};

export default function LoginForm() {
  const containerRef = useRef<HTMLDivElement>(null);
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state: RootState) => state.auth);

  // Stadium-Entrance Animation
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".left-panel", {
        x: -100,
        opacity: 0,
        duration: 0.8,
        ease: "expo.out",
      });

      gsap.from(".right-panel", {
        x: 100,
        opacity: 0,
        duration: 0.8,
        ease: "expo.out",
      });

      gsap.from(".input-field", {
        y: 20,
        opacity: 0,
        stagger: 0.1,
        duration: 0.5,
        delay: 0.4,
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  const [state, formAction] = useActionState(
    async (prevState: FormState, formData: FormData) => {
      const username = formData.get("username") as string;
      const password = formData.get("password") as string;
      const errors: FormState["errors"] = {};

      if (!username) errors.username = "Enter your scout ID / Username";
      if (!password) errors.password = "Password required to enter pitch";

      if (Object.keys(errors).length > 0) return { errors };

      dispatch(loginStart());
      await new Promise((res) => setTimeout(res, 1000));

      if (username === "admin" && password === "123456") {
        dispatch(loginSuccess(username));
      } else {
        dispatch(loginFailure("Invalid credentials. Check your clearance."));
      }

      return { errors: {} };
    },
    initialState
  );

  return (
    <div
      ref={containerRef}
      className="w-[85vw] max-w-250 min-h-125 bg-[#0a0a0a] rounded-3xl shadow-[0_0_80px_rgba(16,185,129,0.1)] overflow-hidden grid grid-cols-1 lg:grid-cols-2 border border-white/5"
    >
      <div className="left-panel hidden lg:flex flex-col justify-center items-center bg-[#10b981] text-black rounded-r-[150px] relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
        
        <div className="text-center px-16 relative z-10">
          <h2 className="text-6xl font-black italic tracking-tighter mb-4 uppercase">
            Own The <br /> Pitch.
          </h2>
          <p className="mb-8 text-sm font-bold uppercase tracking-widest opacity-80">
            Secure clearance for ArenaOps
          </p>

          <Link
            href="/register"
            className="px-10 py-3 bg-black text-white font-bold rounded-full hover:scale-105 transition-transform inline-block uppercase text-xs tracking-[0.2em]"
          >
            Create Scout ID
          </Link>
        </div>
      </div>

      {/* Right Panel - Login Auth */}
      <div className="right-panel flex flex-col justify-center px-12 lg:px-20 bg-[#050505]">
        <div className="mb-8">
          <h2 className="text-4xl font-black text-white italic tracking-tighter uppercase mb-1">
            Login<span className="text-[#10b981]">.</span>
          </h2>
          <p className="text-gray-500 text-xs font-bold uppercase tracking-[0.2em]">
            Authentication Required
          </p>
        </div>

        <form action={formAction} className="space-y-4">
          <div className="input-field">
            <input
              name="username"
              placeholder="SCOUT ID / USERNAME"
              className={`w-full px-5 py-4 rounded-xl bg-[#111827] text-white border border-white/5 outline-none focus:border-[#10b981] transition-all text-xs font-bold tracking-widest placeholder:text-gray-600 ${
                state.errors.username ? "border-red-500/50 ring-1 ring-red-500/20" : ""
              }`}
            />
            {state.errors.username && (
              <p className="text-red-500 text-[10px] mt-2 font-bold uppercase tracking-tighter">
                {state.errors.username}
              </p>
            )}
          </div>

          <div className="input-field">
            <input
              name="password"
              type="password"
              placeholder="CLEARANCE PASSWORD"
              className={`w-full px-5 py-4 rounded-xl bg-[#111827] text-white border border-white/5 outline-none focus:border-[#10b981] transition-all text-xs font-bold tracking-widest placeholder:text-gray-600 ${
                state.errors.password ? "border-red-500/50 ring-1 ring-red-500/20" : ""
              }`}
            />
            {state.errors.password && (
              <p className="text-red-500 text-[10px] mt-2 font-bold uppercase tracking-tighter">
                {state.errors.password}
              </p>
            )}
          </div>

          <div className="text-right text-[10px] font-bold uppercase tracking-widest text-gray-500 hover:text-[#10b981] cursor-pointer transition-colors">
            Reset Credentials?
          </div>

          {error && (
            <p className="bg-red-500/10 border border-red-500/50 text-red-500 p-3 rounded-lg text-[10px] font-bold uppercase text-center">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="input-field w-full py-4 rounded-xl bg-white text-black font-black uppercase tracking-widest shadow-[0_0_30px_rgba(255,255,255,0.1)] hover:bg-[#10b981] hover:shadow-[0_0_30px_rgba(16,185,129,0.3)] transition-all disabled:opacity-50"
          >
            {loading ? "Verifying clearance..." : "Enter Arena →"}
          </button>
        </form>

        <div className="text-center mt-10 text-gray-600 text-[10px] font-bold uppercase tracking-[0.3em] mb-4">
          External Networks
        </div>

        <div className="flex justify-center gap-4">
          {[
            { icon: <Chrome size={18} />, label: "G" },
            { icon: <Github size={18} />, label: "Git" },
            { icon: <Twitter size={18} />, label: "X" },
          ].map((item, i) => (
            <div
              key={i}
              className="w-12 h-12 flex items-center justify-center bg-[#111827] border border-white/5 rounded-full text-white hover:text-[#10b981] hover:border-[#10b981]/50 transition-all cursor-pointer shadow-lg"
            >
              {item.icon}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}