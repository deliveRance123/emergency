import React from "react";
import Link from "next/link";
import { ShieldAlert } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-[#10243A] text-slate-300 border-t border-[#1E3A5F]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-8 border-b border-[#1E3A5F]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#2563EB] flex items-center justify-center text-white">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-base text-white tracking-tight block">
                EmergencyConnect
              </span>
              <span className="text-xs text-slate-400">
                Clear emergency communication for faster public response.
              </span>
            </div>
          </div>

          <nav className="flex flex-wrap items-center gap-6 text-sm text-slate-300">
            <Link href="/how-it-works" className="hover:text-white transition-colors">
              How It Works
            </Link>
            <Link href="/about" className="hover:text-white transition-colors">
              About
            </Link>
            <Link href="/contact" className="hover:text-white transition-colors">
              Contact
            </Link>
            <Link href="/privacy" className="hover:text-white transition-colors">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-white transition-colors">
              Terms
            </Link>
          </nav>
        </div>

        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-3">
          <p>© 2026 EmergencyConnect. All rights reserved.</p>
          <p>
            Academic prototype only — for real-life emergencies, please call local emergency services immediately.
          </p>
        </div>
      </div>
    </footer>
  );
}
