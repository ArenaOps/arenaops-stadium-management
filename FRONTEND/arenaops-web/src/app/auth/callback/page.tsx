"use client";

import { useEffect, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { googleLogin } from "@/app/store/authSlice";
import { RootState } from "@/app/store/store";
import gsap from "gsap";

function CallbackContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const dispatch = useDispatch<any>();
    const processedRef = useRef(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const { loading, error, user } = useSelector((state: RootState) => state.auth);

    // GSAP Animation
    useEffect(() => {
        if (containerRef.current) {
            const ctx = gsap.context(() => {
                gsap.from(".auth-card", {
                    scale: 0.9,
                    opacity: 0,
                    duration: 0.6,
                    ease: "expo.out",
                });

                gsap.from(".spinner", {
                    rotate: 0,
                    duration: 1,
                    ease: "none",
                    repeat: -1,
                });

                gsap.from(".auth-text", {
                    y: 20,
                    opacity: 0,
                    duration: 0.5,
                    delay: 0.3,
                });
            }, containerRef);

            return () => ctx.revert();
        }
    }, []);

    useEffect(() => {
        if (processedRef.current) return;

        const code = searchParams.get("code");
        const errorParam = searchParams.get("error");

        if (errorParam) {
            console.error("Google Auth Error:", errorParam);
            setTimeout(() => {
                router.push("/login");
            }, 2000);
            return;
        }

        if (code) {
            processedRef.current = true;
            const redirectUri = window.location.origin + "/auth/callback";

            dispatch(googleLogin({ code, redirectUri }));
        } else {
            router.push("/login");
        }
    }, [searchParams, router, dispatch]);

    // Handle successful authentication
    useEffect(() => {
        if (user && !loading) {
            // Check if user is new for potential onboarding
            if (user.isNewUser) {
                // Optional: Redirect to onboarding
                setTimeout(() => {
                    router.push("/dashboard");
                }, 1000);
            } else {
                setTimeout(() => {
                    router.push("/dashboard");
                }, 1000);
            }
        }
    }, [user, loading, router]);

    // Handle errors
    useEffect(() => {
        if (error) {
            setTimeout(() => {
                router.push("/login");
            }, 2000);
        }
    }, [error, router]);

    return (
        <div
            ref={containerRef}
            className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-gray-900 to-black relative overflow-hidden"
        >
            {/* Animated Background Elements */}
            <div className="absolute inset-0 opacity-20">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-600/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
            </div>

            {/* Main Card */}
            <div className="auth-card relative z-10 bg-black/40 backdrop-blur-xl border border-white/10 rounded-3xl p-12 shadow-[0_0_80px_rgba(16,185,129,0.15)] max-w-md w-full mx-4">
                <div className="text-center">
                    {/* Spinner */}
                    <div className="spinner relative w-20 h-20 mx-auto mb-8">
                        <div className="absolute inset-0 border-4 border-emerald-500/20 rounded-full"></div>
                        <div className="absolute inset-0 border-4 border-transparent border-t-emerald-500 rounded-full animate-spin"></div>
                        <div className="absolute inset-2 border-4 border-transparent border-t-emerald-400 rounded-full animate-spin" style={{ animationDuration: '0.8s' }}></div>
                    </div>

                    {/* Status Text */}
                    <div className="auth-text space-y-4">
                        {error ? (
                            <>
                                <h2 className="text-2xl font-black text-red-500 uppercase tracking-tight">
                                    Authentication Failed
                                </h2>
                                <p className="text-sm text-red-400/80 font-medium">
                                    {error}
                                </p>
                                <p className="text-xs text-gray-500 uppercase tracking-widest">
                                    Redirecting to login...
                                </p>
                            </>
                        ) : user ? (
                            <>
                                <h2 className="text-2xl font-black text-emerald-500 uppercase tracking-tight">
                                    Welcome {user.isNewUser ? "Aboard" : "Back"}!
                                </h2>
                                <p className="text-sm text-gray-400 font-medium">
                                    Authentication successful
                                </p>
                                <p className="text-xs text-gray-500 uppercase tracking-widest">
                                    Entering ArenaOps...
                                </p>
                            </>
                        ) : (
                            <>
                                <h2 className="text-2xl font-black text-white uppercase tracking-tight">
                                    Authenticating
                                    <span className="text-emerald-500">.</span>
                                </h2>
                                <p className="text-sm text-gray-400 font-medium">
                                    Verifying your Google credentials
                                </p>
                                <p className="text-xs text-gray-500 uppercase tracking-widest animate-pulse">
                                    Please wait...
                                </p>
                            </>
                        )}
                    </div>

                    {/* Progress Indicator */}
                    <div className="mt-8 w-full bg-gray-800/50 rounded-full h-1 overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 animate-pulse" style={{ width: error ? '100%' : user ? '100%' : '60%' }}></div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function AuthCallbackPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-black">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
            </div>
        }>
            <CallbackContent />
        </Suspense>
    );
}
