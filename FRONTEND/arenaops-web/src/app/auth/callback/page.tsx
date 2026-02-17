"use client";

import { useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { authService } from "@/services/authService"; // You might need to export this or use the slice thunk
import { useDispatch } from "react-redux";
import { loginSuccess, loginFailure } from "@/app/store/authSlice";

export default function AuthCallbackPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const dispatch = useDispatch();
    const processedRef = useRef(false);

    useEffect(() => {
        if (processedRef.current) return;
        processedRef.current = true;

        const code = searchParams.get("code");
        const error = searchParams.get("error");

        if (error) {
            console.error("Google Auth Error:", error);
            dispatch(loginFailure("Google authentication failed"));
            router.push("/login");
            return;
        }

        if (code) {
            // Exchange code for token
            const redirectUri = window.location.origin + "/auth/callback";

            authService.googleLogin(code, redirectUri)
                .then((data) => {
                    if (data.success) {
                        // Manually storing in localStorage as per authSlice pattern
                        localStorage.setItem("accessToken", data.data.accessToken);
                        localStorage.setItem("refreshToken", data.data.refreshToken);
                        localStorage.setItem("user", JSON.stringify(data.data));

                        dispatch(loginSuccess(data.data)); // You might need to adjust payload to match your slice
                        router.push("/");
                    } else {
                        dispatch(loginFailure(data.message || "Google login failed"));
                        router.push("/login");
                    }
                })
                .catch((err) => {
                    console.error("Google Auth Exception:", err);
                    dispatch(loginFailure("Google login failed"));
                    router.push("/login");
                });
        } else {
            router.push("/login");
        }
    }, [searchParams, router, dispatch]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-black text-white">
            <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500 mx-auto mb-4"></div>
                <p className="font-bold tracking-widest uppercase text-sm animate-pulse">Authenticating with Google...</p>
            </div>
        </div>
    );
}
