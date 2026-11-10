import React from "react";
import Link from "next/link";
import { Navbar } from "@/components/ui/navbar";
import { Footer } from "@/components/ui/footer";
import { ShieldCheck, Users, AlertTriangle, ArrowRight } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="flex flex-col min-h-screen bg-[#F7F9FC]">
      <Navbar />

      <main className="flex-1 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto space-y-10">
          <div className="space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-[#2563EB]">
              About EmergencyConnect
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-[#10243A]">
              Making Emergency Reporting Clear and Accessible
            </h1>
            <p className="text-base text-slate-600 leading-relaxed">
              EmergencyConnect is an academic prototype built to explore how everyday human language can be interpreted and organized to support faster emergency response coordination.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-[#E5EAF0] shadow-sm space-y-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#2563EB] flex items-center justify-center">
                <Users className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-bold text-[#10243A]">Built for Real People</h2>
              <p className="text-sm text-slate-600 leading-relaxed">
                During urgent situations, people rarely know technical classifications. Allowing citizens to write naturally lowers stress and improves the quality of incoming incident details.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-[#E5EAF0] shadow-sm space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-bold text-[#10243A]">Human-First Verification</h2>
              <p className="text-sm text-slate-600 leading-relaxed">
                Automated interpretation only assists the process. Reporters confirm extracted details before submitting, and trained coordinators review every report directly.
              </p>
            </div>
          </div>

          <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-6 flex items-start gap-4">
            <AlertTriangle className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h3 className="font-bold text-sm text-[#10243A]">Academic Prototype Notice</h3>
              <p className="text-sm text-slate-700 leading-relaxed">
                EmergencyConnect is strictly an academic demonstration platform and does not connect to or dispatch official emergency services. In any real-life emergency, please call your local emergency number directly.
              </p>
            </div>
          </div>

          <div className="pt-2">
            <Link
              href="/dashboard/report"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-white bg-[#10243A] hover:bg-[#1E3A5F] transition-colors text-sm"
            >
              <span>Try Reporting a Sample Incident</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
