"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ShieldAlert, ArrowLeft, CheckCircle2, Mail } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSent(true);
  };

  return (
    <div className="min-h-screen flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 bg-[#F7F9FC]">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link href="/" className="inline-flex items-center gap-2.5 mb-5 group">
          <div className="w-10 h-10 rounded-xl bg-[#10243A] flex items-center justify-center text-white shadow-sm group-hover:bg-[#2563EB] transition-colors">
            <ShieldAlert className="w-5 h-5 text-blue-400" />
          </div>
          <span className="font-extrabold text-2xl tracking-tight text-[#10243A]">
            EmergencyConnect
          </span>
        </Link>
        <h1 className="text-xl font-bold tracking-tight text-[#10243A]">Reset Password</h1>
        <p className="mt-1 text-xs text-slate-500">
          Enter your email to receive password recovery instructions.
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-md rounded-2xl border border-[#E5EAF0] sm:px-8">
          {sent ? (
            <div className="text-center space-y-3 py-4">
              <div className="w-11 h-11 rounded-full bg-emerald-50 text-emerald-600 mx-auto flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h2 className="font-bold text-base text-[#10243A]">Check Your Email</h2>
              <p className="text-xs text-slate-600 leading-relaxed">
                If an account exists for <strong>{email}</strong>, password reset instructions have been dispatched.
              </p>
              <Link
                href="/auth/login"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#2563EB] hover:underline pt-2"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Return to Sign In</span>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full pl-10 pr-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 px-4 rounded-xl text-sm font-bold text-white bg-[#10243A] hover:bg-[#1E3A5F] shadow-sm transition-all"
              >
                Send Reset Link
              </button>

              <div className="text-center pt-2">
                <Link
                  href="/auth/login"
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-[#2563EB]"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to Sign In</span>
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
