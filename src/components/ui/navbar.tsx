"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShieldAlert, AlertCircle, Menu, X, User } from "lucide-react";
import type { UserSummary } from "@/lib/types";

export function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserSummary | null>(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.authenticated) {
          setCurrentUser(data.user);
        }
      })
      .catch(() => {});
  }, []);

  const navLinks = [
    { label: "Home", href: "/" },
    { label: "How It Works", href: "/how-it-works" },
    { label: "About", href: "/about" },
    { label: "Contact", href: "/contact" },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-[#E5EAF0]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brandmark */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-[#10243A] flex items-center justify-center text-white shadow-sm group-hover:bg-[#2563EB] transition-colors">
            <ShieldAlert className="w-5 h-5 text-blue-400 group-hover:text-white transition-colors" />
          </div>
          <span className="font-bold text-lg tracking-tight text-[#10243A]">
            EmergencyConnect
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
          {navLinks.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`transition-colors ${
                  active
                    ? "text-[#2563EB] font-semibold"
                    : "hover:text-[#2563EB]"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Action Buttons */}
        <div className="hidden sm:flex items-center gap-3">
          {currentUser ? (
            <Link
              href={currentUser.role === "admin" ? "/admin" : "/dashboard"}
              className="inline-flex items-center gap-2 px-3.5 py-2 text-sm font-medium rounded-lg text-[#10243A] bg-slate-100 hover:bg-slate-200 transition-colors"
            >
              <User className="w-4 h-4 text-[#2563EB]" />
              <span>{currentUser.fullName.split(" ")[0]}</span>
            </Link>
          ) : (
            <Link
              href="/auth/login"
              className="px-4 py-2 text-sm font-medium text-[#10243A] hover:text-[#2563EB] transition-colors"
            >
              Sign In
            </Link>
          )}

          <Link
            href="/dashboard/report"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white bg-[#DC2626] hover:bg-[#b91c1c] shadow-sm transition-all"
          >
            <AlertCircle className="w-4 h-4" />
            <span>Report Emergency</span>
          </Link>
        </div>

        {/* Mobile menu trigger */}
        <div className="flex sm:hidden">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="sm:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-2">
          {navLinks.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileMenuOpen(false)}
              className={`block py-2 text-sm font-medium ${
                pathname === item.href ? "text-[#2563EB] font-semibold" : "text-slate-700"
              }`}
            >
              {item.label}
            </Link>
          ))}
          <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
            {currentUser ? (
              <Link
                href={currentUser.role === "admin" ? "/admin" : "/dashboard"}
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2 text-sm font-medium rounded-lg bg-slate-100 text-slate-800"
              >
                Go to Dashboard
              </Link>
            ) : (
              <Link
                href="/auth/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2 text-sm font-medium rounded-lg border border-slate-200 text-slate-700"
              >
                Sign In
              </Link>
            )}
            <Link
              href="/dashboard/report"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full flex items-center justify-center gap-2 py-2.5 text-sm font-semibold rounded-lg bg-[#DC2626] text-white"
            >
              <AlertCircle className="w-4 h-4" />
              <span>Report Emergency</span>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
