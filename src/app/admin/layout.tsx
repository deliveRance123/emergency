"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  ShieldAlert,
  Activity,
  BarChart3,
  Sliders,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import type { UserSummary } from "@/lib/types";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<UserSummary | null>(null);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!data?.authenticated || data.user.role !== "admin") {
          router.push("/auth/login");
        } else {
          setCurrentUser(data.user);
        }
      })
      .catch(() => router.push("/auth/login"));
  }, [router]);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
  };

  const navLinks = [
    { label: "Triage Center", href: "/admin", icon: Activity },
    { label: "Category Registry", href: "/admin/categories", icon: Sliders },
    { label: "Incident Analytics", href: "/admin/analytics", icon: BarChart3 },
  ];

  return (
    <div className="min-h-screen lg:h-screen lg:overflow-hidden flex bg-[#F7F9FC]">
      {/* STICKY OPERATIONAL SIDEBAR */}
      <aside className="hidden lg:flex flex-col w-64 h-screen sticky top-0 shrink-0 bg-[#10243A] text-white border-r border-slate-800">
        {/* Brand header */}
        <Link href="/" className="h-16 px-6 flex items-center gap-2.5 border-b border-slate-800 shrink-0">
          <div className="w-8 h-8 rounded-lg bg-[#2563EB] flex items-center justify-center text-white">
            <ShieldAlert className="w-4 h-4" />
          </div>
          <span className="font-bold text-base tracking-tight">EmergencyConnect</span>
        </Link>

        {/* Navigation Links */}
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          <div className="px-3 pb-2 text-[10px] uppercase font-bold tracking-wider text-slate-400">
            Command Operations
          </div>
          {navLinks.map((item) => {
            const active = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  active
                    ? "bg-[#2563EB] text-white shadow-sm"
                    : "text-slate-300 hover:bg-slate-800 hover:text-white"
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Administrator Profile & Logout */}
        <div className="p-4 border-t border-slate-800 space-y-3 shrink-0 bg-[#10243A]">
          {currentUser && (
            <div className="flex items-center gap-2.5 px-2">
              <div className="w-8 h-8 rounded-full bg-blue-600/30 text-blue-400 border border-blue-500/30 flex items-center justify-center text-xs font-bold shrink-0">
                {currentUser.fullName?.[0] || "A"}
              </div>
              <div className="truncate">
                <div className="text-xs font-bold text-white truncate">{currentUser.fullName}</div>
                <div className="text-[10px] text-slate-400 truncate uppercase">{currentUser.role}</div>
              </div>
            </div>
          )}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* SCROLLABLE RIGHT-HAND ADMIN CONTENT */}
      <div className="flex-1 flex flex-col min-w-0 lg:h-screen lg:overflow-hidden">
        {/* Top Bar */}
        <header className="h-16 bg-white border-b border-[#E5EAF0] px-4 sm:px-8 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileNavOpen(!mobileNavOpen)}
              className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100"
              aria-label="Toggle navigation"
            >
              {mobileNavOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-700">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Administrator Triage Console</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="text-xs font-bold text-[#2563EB] hover:underline"
            >
              Citizen View
            </Link>
          </div>
        </header>

        {/* Mobile Nav Drawer */}
        {mobileNavOpen && (
          <div className="lg:hidden bg-[#10243A] text-white border-b border-slate-800 px-4 py-3 space-y-1 shrink-0">
            {navLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileNavOpen(false)}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-semibold ${
                  pathname === item.href ? "bg-[#2563EB] text-white" : "text-slate-300 hover:bg-slate-800"
                }`}
              >
                <item.icon className="w-4 h-4" />
                <span>{item.label}</span>
              </Link>
            ))}
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-400 hover:bg-slate-800 rounded-lg text-left"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        )}

        {/* Independent Scrolling Body */}
        <main className="flex-1 p-4 sm:p-8 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
