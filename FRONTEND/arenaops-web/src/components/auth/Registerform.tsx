"use client";

import {
  useRef,
  useLayoutEffect,
  useState,
  useEffect,
} from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/app/store/store";
import { registerUser } from "@/app/store/authSlice";
import { useRouter } from "next/navigation";
import gsap from "gsap";
import Link from "next/link";
import { Eye, EyeOff, UserCircle, Mail, Lock, ShieldCheck } from "lucide-react";
import { GoogleIcon } from "@/components/icons/GoogleIcon";

interface FormState {
  errors: {
    name?: string;
    email?: string;
    password?: string;
  };
}

export default function RegisterForm() {
  const containerRef = useRef<HTMLDivElement>(null);
  const dispatch = useDispatch<any>();
  const router = useRouter();
  const { loading, isAuthenticated, error } = useSelector((state: RootState) => state.auth);

  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [formErrors, setFormErrors] = useState<FormState["errors"]>({});

  // Redirect if authenticated
  if (isAuthenticated) {
    router.push("/");
  }

  useEffect(() => {
    const savedName = localStorage.getItem("reg_name");
    const savedEmail = localStorage.getItem("reg_email");
    if (savedName) setName(savedName);
    if (savedEmail) setEmail(savedEmail);
  }, []);

  useEffect(() => {
    localStorage.setItem("reg_name", name);
  }, [name]);

  useEffect(() => {
    localStorage.setItem("reg_email", email);
  }, [email]);

  // GSAP Entrance Animation
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".form-panel", {
        x: -80,
        opacity: 0,
        duration: 0.8,
        ease: "expo.out",
      });

      gsap.from(".emerald-panel", {
        x: 80,
        opacity: 0,
        duration: 0.8,
        ease: "expo.out",
      });

      gsap.from(".input-group", {
        y: 20,
        opacity: 0,
        stagger: 0.1,
        duration: 0.4,
        delay: 0.3,
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  const handleGoogleLogin = () => {
    const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "YOUR_GOOGLE_CLIENT_ID";
    const redirectUri = window.location.origin + "/auth/callback";
    const scope = "openid email profile";
    const responseType = "code";
    const accessType = "offline";
    const prompt = "consent";

    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${GOOGLE_CLIENT_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=${responseType}&scope=${encodeURIComponent(scope)}&access_type=${accessType}&prompt=${prompt}`;

    window.location.href = authUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors: FormState["errors"] = {};

    if (!name) errors.name = "Full name required for roster";
    if (!email) errors.email = "Active email required for verification";
    if (!password || password.length < 6)
      errors.password = "Clearance password too weak (min 6 chars)";

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    setFormErrors({});

    const result = await dispatch(registerUser({ email, password, fullName: name }));

    if (registerUser.fulfilled.match(result)) {
      localStorage.removeItem("reg_name");
      localStorage.removeItem("reg_email");
      router.push("/");
    }
  };

  return (
    <div
      ref={containerRef}
      className="w-[85vw] max-w-250 min-h-125 bg-[#050505] rounded-[2.5rem] shadow-[0_0_80px_rgba(16,185,129,0.1)] overflow-hidden grid grid-cols-1 lg:grid-cols-2 border border-white/5"
    >
      <div className="form-panel flex flex-col justify-center px-12 lg:px-20  order-2 lg:order-1 bg-[#0a0a0a]">
        <div className="mb-8">
          <h2 className="text-4xl font-black text-white italic tracking-tighter uppercase mb-2">
            Register<span className="text-[#10b981]">.</span>
          </h2>
          <p className="text-gray-500 text-xs font-bold uppercase tracking-[0.2em] flex items-center gap-2">
            <ShieldCheck size={14} className="text-[#10b981]" />
            Join the ArenaOps
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="input-group">
            <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">
              Full Name
            </label>
            <div className="relative">
              <UserCircle className="absolute left-4 top-4 text-gray-600" size={18} />
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="FULL NAME"
                className={`w-full pl-12 pr-5 py-4 rounded-xl bg-[#111827] text-white border border-white/5 outline-none focus:border-[#10b981] transition-all text-xs font-bold tracking-widest placeholder:text-gray-600 ${formErrors.name ? "border-red-500/50 ring-1 ring-red-500/20" : ""
                  }`}
              />
              {formErrors.name && (
                <p className="text-red-500 text-[10px] mt-2 font-bold uppercase tracking-tighter italic">
                  {formErrors.name}
                </p>
              )}
            </div>
          </div>

          <div className="input-group">
            <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-4 text-gray-600" size={18} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="EMAIL ADDRESS"
                className={`w-full pl-12 pr-5 py-4 rounded-xl bg-[#111827] text-white border border-white/5 outline-none focus:border-[#10b981] transition-all text-xs font-bold tracking-widest placeholder:text-gray-600 ${formErrors.email ? "border-red-500/50 ring-1 ring-red-500/20" : ""
                  }`}
              />
              {formErrors.email && (
                <p className="text-red-500 text-[10px] mt-2 font-bold uppercase tracking-tighter italic">
                  {formErrors.email}
                </p>
              )}
            </div>
          </div>

          <div className="input-group">
            <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-4 text-gray-600" size={18} />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="CLEARANCE PASSWORD"
                className={`w-full pl-12 pr-14 py-4 rounded-xl bg-[#111827] text-white border border-white/5 outline-none focus:border-[#10b981] transition-all text-xs font-bold tracking-widest placeholder:text-gray-600 ${formErrors.password ? "border-red-500/50 ring-1 ring-red-500/20" : ""
                  }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-4 text-gray-500 hover:text-[#10b981] transition"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
              {formErrors.password && (
                <p className="text-red-500 text-[10px] mt-2 font-bold uppercase tracking-tighter italic">
                  {formErrors.password}
                </p>
              )}
            </div>
          </div>

          {error && (
            <p className="bg-red-500/10 border border-red-500/50 text-red-500 p-3 rounded-lg text-[10px] font-bold uppercase text-center">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className=" w-full py-4 mt-4 rounded-xl bg-white text-black font-black uppercase tracking-widest shadow-[0_0_30px_rgba(255,255,255,0.1)] hover:bg-[#10b981] hover:shadow-[0_0_30px_rgba(16,185,129,0.3)] transition-all disabled:opacity-50"
          >
            {loading ? "Registering Scout..." : "Complete Registration"}
          </button>
        </form>

        <div className="text-center mt-10 text-gray-600 text-[10px] font-bold uppercase tracking-[0.3em] mb-4">
          Or Continue With
        </div>

        <div className="flex justify-center">
          <button
            type="button"
            onClick={handleGoogleLogin}
            className="w-12 h-12 flex items-center justify-center bg-[#111827] border border-white/5 rounded-full text-white hover:text-[#10b981] hover:border-[#10b981]/50 transition-all cursor-pointer shadow-lg hover:scale-110 active:scale-95"
          >
            <GoogleIcon size={20} />
          </button>
        </div>
      </div>

      <div className="emerald-panel hidden lg:flex flex-col justify-center items-center bg-[#10b981] text-black rounded-l-[150px] relative overflow-hidden order-1 lg:order-2">
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />

        <div className="text-center px-16 relative z-10">
          <h2 className="text-6xl font-black italic tracking-tighter mb-4 uppercase leading-none">
            Join The <br /> League.
          </h2>
          <p className="mb-8 text-sm font-bold uppercase tracking-[0.2em] opacity-80">
            Already have a Scout ID?
          </p>

          <Link
            href="/login"
            className="px-12 py-4 bg-black text-white font-black rounded-full hover:scale-105 transition-transform inline-block uppercase text-xs tracking-[0.2em]"
          >
            Login Here
          </Link>
        </div>

      </div>
    </div>
  );
}