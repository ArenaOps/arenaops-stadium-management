import LoginForm from "@/components/auth/LoginForm";
import { Metadata } from "next";

export const metadata:Metadata = {
  title: "Login | ArenaOps",
  description: "Login to your ArenaOps account."
};

export default function LoginPage() {
  return (
    <div className="w-screen min-h-screen flex items-center justify-center ">
      <LoginForm />
    </div>
  );
}