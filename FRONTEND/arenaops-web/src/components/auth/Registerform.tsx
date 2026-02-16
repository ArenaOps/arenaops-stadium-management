"use client";

import {
  useRef,
  useLayoutEffect,
  useActionState,
  useState,
  useEffect,
} from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/app/store/store";
import {
  loginStart,
  loginSuccess,
  loginFailure,
} from "@/app/store/authSlice";
import gsap from "gsap";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";

interface FormState {
  errors: {
    name?: string;
    email?: string;
    password?: string;
  };
}

const initialState: FormState = {
  errors: {},
};

export default function RegisterForm() {
  const containerRef = useRef<HTMLDivElement>(null);
  const dispatch = useDispatch();
  const { loading } = useSelector((state: RootState) => state.auth);

  const [showPassword, setShowPassword] = useState(false);

  // ✅ Controlled Input States
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // ✅ Load saved data on mount
  useEffect(() => {
    const savedName = localStorage.getItem("reg_name");
    const savedEmail = localStorage.getItem("reg_email");

    if (savedName) setName(savedName);
    if (savedEmail) setEmail(savedEmail);
  }, []);

  // ✅ Save to localStorage whenever value changes
  useEffect(() => {
    localStorage.setItem("reg_name", name);
  }, [name]);

  useEffect(() => {
    localStorage.setItem("reg_email", email);
  }, [email]);

  // GSAP Animation
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".form-panel", {
        x: -150,
        opacity: 0,
        duration: 1,
        ease: "power3.out",
      });

      gsap.from(".blue-panel", {
        x: 150,
        opacity: 0,
        duration: 1,
        ease: "power3.out",
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  const [state, formAction] = useActionState(
    async (prevState: FormState) => {
      const errors: FormState["errors"] = {};

      if (!name) errors.name = "Name is required";
      if (!email) errors.email = "Email is required";
      if (!password || password.length < 6)
        errors.password = "Password must be at least 6 characters";

      if (Object.keys(errors).length > 0) {
        return { errors };
      }

      dispatch(loginStart());
      await new Promise((res) => setTimeout(res, 1000));

      dispatch(loginSuccess(name));

      // Optional: Clear storage after success
      localStorage.removeItem("reg_name");
      localStorage.removeItem("reg_email");

      return { errors: {} };
    },
    initialState
  );

  return (
    <div
      ref={containerRef}
      className="w-[70vw] max-w-[1500px] h-[520px] bg-[#f3f3f3] rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.15)] overflow-hidden grid grid-cols-1 lg:grid-cols-2"
    >
      {/* LEFT SIDE — FORM */}
      <div className="form-panel flex flex-col justify-center px-20 order-2 lg:order-1">
        <h2 className="text-4xl font-bold text-gray-800 mb-8">
          Register
        </h2>

        <form action={formAction} className="space-y-5">
          {/* Name */}
          <div>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Full Name"
              className={`w-full px-5 py-3 rounded-xl bg-[#e9e9e9] shadow-inner outline-none ${
                state.errors.name ? "ring-2 ring-red-400" : ""
              }`}
            />
            {state.errors.name && (
              <p className="text-red-500 text-sm mt-1">
                {state.errors.name}
              </p>
            )}
          </div>

          {/* Email */}
          <div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              className={`w-full px-5 py-3 rounded-xl bg-[#e9e9e9] shadow-inner outline-none ${
                state.errors.email ? "ring-2 ring-red-400" : ""
              }`}
            />
            {state.errors.email && (
              <p className="text-red-500 text-sm mt-1">
                {state.errors.email}
              </p>
            )}
          </div>

          {/* Password */}
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className={`w-full px-5 py-3 rounded-xl bg-[#e9e9e9] shadow-inner outline-none pr-12 ${
                state.errors.password ? "ring-2 ring-red-400" : ""
              }`}
            />

            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-3 text-gray-500 hover:text-blue-600 transition"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>

            {state.errors.password && (
              <p className="text-red-500 text-sm mt-1">
                {state.errors.password}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-400 to-indigo-600 text-white font-semibold shadow-md hover:scale-[1.02] transition disabled:opacity-50"
          >
            {loading ? "Registering..." : "Register"}
          </button>
        </form>
      </div>

      {/* RIGHT SIDE — BLUE PANEL */}
      <div className="blue-panel hidden lg:flex flex-col justify-center items-center bg-gradient-to-br from-blue-400 to-indigo-600 text-white rounded-l-[280px] order-1 lg:order-2">
        <div className="text-center px-16">
          <h2 className="text-5xl font-bold mb-4">
            Join Us!
          </h2>
          <p className="mb-6 text-lg opacity-90">
            Already have an account?
          </p>

          <Link
            href="/login"
            className="px-8 py-3 border border-white rounded-lg hover:bg-white hover:text-blue-600 transition"
          >
            Login
          </Link>
        </div>
      </div>
    </div>
  );
}
