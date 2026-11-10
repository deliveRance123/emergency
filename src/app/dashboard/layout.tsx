"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  ShieldAlert,
  LayoutDashboard,
  AlertCircle,
  FileText,
  Bell,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import type { UserSummary } from "@/lib/types";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<UserSummary | null>(null);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.authenticated) {
          setCurrentUser(data.user);
        } else {
          router.push("/auth/login");
        }
      })
      .catch(() => router.push("/auth/login"));
  }, [router]);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
  };

  const navLinks = [
    { label: "Overview", href: "/dashboard", icon: LayoutDashboard },
    { label: "Report Emergency", href: "/dashboard/report", icon: AlertCircle, urgent: true },
    { label: "My Reports", href: "/dashboard/reports", icon: FileText },
    { label: "Notifications", href: "/dashboard/notifications", icon: Bell },
  ];

  return (
    <div className="min-h-screen lg:h-screen lg:overflow-hidden flex bg-[#F7F9FC]">
      {/* STICKY DESKTOP SIDEBAR */}
      <aside className="hidden lg:flex flex-col w-64 h-screen sticky top-0 shrink-0 bg-white border-r border-[#E5EAF0]">
        {/* Brand header */}
        <Link href="/" className="h-16 px-6 flex items-center gap-2.5 border-b border-[#E5EAF0] shrink-0">
          <div className="w-8 h-8 rounded-lg bg-[#10243A] flex items-center justify-center text-white">
            <ShieldAlert className="w-4 h-4 text-blue-400" />
          </div>
          <span className="font-bold text-base text-[#10243A]">EmergencyConnect</span>
        </Link>

        {/* Navigation Links */}
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          {navLinks.map((item) => {
            const active = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  item.urgent
                    ? active
                      ? "bg-[#DC2626] text-white shadow-sm"
                      : "bg-red-50 text-[#DC2626] hover:bg-red-100"
                    : active
                    ? "bg-[#10243A] text-white shadow-sm"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* User Profile & Logout */}
        <div className="p-4 border-t border-[#E5EAF0] space-y-3 shrink-0 bg-white">
          {currentUser && (
            <div className="flex items-center gap-2.5 px-2">
              <div className="w-8 h-8 rounded-full bg-blue-100 text-[#2563EB] flex items-center justify-center text-xs font-bold shrink-0">
                {currentUser.fullName?.[0] || "U"}
              </div>
              <div className="truncate">
                <div className="text-xs font-bold text-[#10243A] truncate">{currentUser.fullName}</div>
                <div className="text-[11px] text-slate-400 truncate">{currentUser.email}</div>
              </div>
            </div>
          )}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* SCROLLABLE RIGHT-HAND CONTENT COLUMN */}
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
            <div className="text-sm font-semibold text-slate-600 hidden sm:block">
              Citizen Dashboard
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/dashboard/report"
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold text-white bg-[#DC2626] hover:bg-[#b91c1c] shadow-xs transition-colors"
            >
              <AlertCircle className="w-3.5 h-3.5" />
              <span>Report Emergency</span>
            </Link>
          </div>
        </header>

        {/* Mobile Nav Drawer */}
        {mobileNavOpen && (
          <div className="lg:hidden bg-white border-b border-[#E5EAF0] px-4 py-3 space-y-1 shrink-0">
            {navLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileNavOpen(false)}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-semibold ${
                  pathname === item.href ? "bg-[#10243A] text-white" : "text-slate-700 hover:bg-slate-50"
                }`}
              >
                <item.icon className="w-4 h-4" />
                <span>{item.label}</span>
              </Link>
            ))}
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg text-left"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        )}

        {/* Independent Scrolling Main Body */}
        <main className="flex-1 p-4 sm:p-8 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
