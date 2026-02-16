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
  const { loading, error } = useSelector(
    (state: RootState) => state.auth
  );

  // GSAP Animation
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".left-panel", {
        x: -150,
        opacity: 0,
        duration: 1,
        ease: "power3.out",
      });

      gsap.from(".right-panel", {
        x: 150,
        opacity: 0,
        duration: 1,
        ease: "power3.out",
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  const [state, formAction] = useActionState(
    async (prevState: FormState, formData: FormData) => {
      const username = formData.get("username") as string;
      const password = formData.get("password") as string;

      const errors: FormState["errors"] = {};

      if (!username) errors.username = "Username is required";
      if (!password) errors.password = "Password is required";

      if (Object.keys(errors).length > 0) {
        return { errors };
      }

      dispatch(loginStart());
      await new Promise((res) => setTimeout(res, 1000));

      if (username === "admin" && password === "123456") {
        dispatch(loginSuccess(username));
      } else {
        dispatch(loginFailure("Invalid credentials"));
      }

      return { errors: {} };
    },
    initialState
  );

  return (
    <div
      ref={containerRef}
      className="w-[70vw] max-w-375 h-130 bg-[#f3f3f3] rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.15)] overflow-hidden grid grid-cols-1 lg:grid-cols-2"
    >
      <div className="left-panel hidden lg:flex flex-col justify-center items-center bg-gradient-to-br from-blue-400 to-indigo-600 text-white rounded-r-[280px]">
        <div className="text-center px-16">
          <h2 className="text-5xl font-bold mb-4">
            Welcome Back!
          </h2>
          <p className="mb-6 text-lg opacity-90">
            Don’t have an account?
          </p>

          <Link
            href="/register"
            className="px-8 py-3 border border-white rounded-lg hover:bg-white hover:text-blue-600 transition"
          >
            Register
          </Link>
        </div>
      </div>

      {/* RIGHT PANEL — Exact Same Style as Register */}
      <div className="right-panel flex flex-col justify-center px-20">
        <h2 className="text-4xl font-bold text-gray-800 mb-8">
          Login
        </h2>

        <form action={formAction} className="space-y-5">

          {/* Username */}
          <div>
            <input
              name="username"
              placeholder="Username"
              className={`w-full px-5 py-3 rounded-xl bg-[#e9e9e9] shadow-inner outline-none ${
                state.errors.username ? "ring-2 ring-red-400" : ""
              }`}
            />
            {state.errors.username && (
              <p className="text-red-500 text-sm mt-1">
                {state.errors.username}
              </p>
            )}
          </div>

          {/* Password */}
          <div>
            <input
              name="password"
              type="password"
              placeholder="Password"
              className={`w-full px-5 py-3 rounded-xl bg-[#e9e9e9] shadow-inner outline-none ${
                state.errors.password ? "ring-2 ring-red-400" : ""
              }`}
            />
            {state.errors.password && (
              <p className="text-red-500 text-sm mt-1">
                {state.errors.password}
              </p>
            )}
          </div>

          <div className="text-right text-sm text-gray-600 hover:underline cursor-pointer">
            Forgot Password?
          </div>

          {error && (
            <p className="text-red-600 text-sm font-medium">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-400 to-indigo-600 text-white font-semibold shadow-md hover:scale-[1.02] transition disabled:opacity-50"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <div className="text-center mt-6 text-gray-600 text-sm">
          or login with social platforms
        </div>

        <div className="flex justify-center gap-4 mt-4">
          {["G", "f", "Q", "in"].map((item, i) => (
            <div
              key={i}
              className="w-10 h-10 flex items-center justify-center bg-white rounded-lg shadow-md cursor-pointer hover:scale-110 transition font-semibold text-gray-700"
            >
              {item}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
