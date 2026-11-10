"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShieldAlert, AlertCircle, ArrowRight, UserCheck, ShieldCheck } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e?: React.FormEvent, customEmail?: string, customPass?: string) => {
    if (e) e.preventDefault();
    setError(null);
    setLoading(true);

    const submitEmail = customEmail || email;
    const submitPassword = customPass || password;

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: submitEmail, password: submitPassword }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Invalid email or password.");
        setLoading(false);
        return;
      }

      router.push(data.redirectTo || "/dashboard");
    } catch {
      setError("Unable to connect. Please try again.");
      setLoading(false);
    }
  };

  const fillDemoCitizen = () => {
    setEmail("citizen@emergencyconnect.org");
    setPassword("Emergency123!");
    handleLogin(undefined, "citizen@emergencyconnect.org", "Emergency123!");
  };

  const fillDemoAdmin = () => {
    setEmail("admin@emergencyconnect.org");
    setPassword("AdminCommand2026!");
    handleLogin(undefined, "admin@emergencyconnect.org", "AdminCommand2026!");
  };

  return (
    <div className="min-h-screen flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 bg-[#F7F9FC]">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link href="/" className="inline-flex items-center gap-2.5 mb-5 group">
          <div className="w-10 h-10 rounded-xl bg-[#10243A] flex items-center justify-center text-white shadow-sm group-hover:bg-[#2563EB] transition-colors">
            <ShieldAlert className="w-5 h-5 text-blue-400 group-hover:text-white transition-colors" />
          </div>
          <span className="font-extrabold text-2xl tracking-tight text-[#10243A]">
            EmergencyConnect
          </span>
        </Link>
        <h1 className="text-xl font-bold tracking-tight text-[#10243A]">
          Sign In to Your Account
        </h1>
        <p className="mt-1 text-xs text-slate-500">
          Access your incident reports or coordinator workspace.
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md space-y-5">
        {/* Login Card */}
        <div className="bg-white py-8 px-6 shadow-md rounded-2xl border border-[#E5EAF0] sm:px-8">
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={(e) => handleLogin(e)} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent transition-all"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Password
                </label>
                <Link
                  href="/auth/forgot-password"
                  className="text-xs font-medium text-[#2563EB] hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent transition-all"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-bold text-white bg-[#10243A] hover:bg-[#1E3A5F] shadow-sm disabled:opacity-50 transition-all"
              >
                <span>{loading ? "Signing in..." : "Sign In"}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>

          <div className="mt-6 text-center text-xs text-slate-500">
            Don&apos;t have an account?{" "}
            <Link href="/auth/register" className="font-semibold text-[#2563EB] hover:underline">
              Create an account
            </Link>
          </div>
        </div>

        {/* Demo Quick Access Placed UNDER Login Form */}
        <div className="bg-white border border-[#E5EAF0] rounded-2xl p-4 shadow-xs space-y-2.5">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block text-center">
            Quick Demo Access
          </span>
          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={fillDemoCitizen}
              disabled={loading}
              className="flex items-center justify-center gap-1.5 py-2 px-3 bg-[#F7F9FC] hover:bg-blue-50 text-slate-800 text-xs font-semibold rounded-xl border border-slate-200 transition-colors"
            >
              <UserCheck className="w-3.5 h-3.5 text-[#2563EB]" />
              <span>Demo Citizen</span>
            </button>
            <button
              type="button"
              onClick={fillDemoAdmin}
              disabled={loading}
              className="flex items-center justify-center gap-1.5 py-2 px-3 bg-[#F7F9FC] hover:bg-blue-50 text-slate-800 text-xs font-semibold rounded-xl border border-slate-200 transition-colors"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-[#10243A]" />
              <span>Demo Admin</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
