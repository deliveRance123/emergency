import React from "react";
import Link from "next/link";
import { Navbar } from "@/components/ui/navbar";
import { Footer } from "@/components/ui/footer";
import { AlertCircle, CheckCircle2, MessageSquare, ShieldCheck, ArrowRight } from "lucide-react";

export default function HowItWorksPage() {
  const steps = [
    {
      num: "01",
      title: "Describe What Is Happening",
      description:
        "Type what you see in everyday language. You do not need to know technical emergency codes or navigate complicated forms.",
      icon: MessageSquare,
    },
    {
      num: "02",
      title: "Automated Message Analysis",
      description:
        "The system reads your message, identifies the type of emergency, detects key details like injuries or hazards, and estimates urgency.",
      icon: CheckCircle2,
    },
    {
      num: "03",
      title: "Review & Confirm Details",
      description:
        "Before sending, you see the system's interpretation. You can confirm or adjust the category, urgency, or location so nothing is misunderstood.",
      icon: ShieldCheck,
    },
    {
      num: "04",
      title: "Responder Triage & Updates",
      description:
        "Coordinators receive an organized incident summary, prioritize urgent cases, assign response units, and send status updates back to you.",
      icon: AlertCircle,
    },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-[#F7F9FC]">
      <Navbar />

      <main className="flex-1 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-[#2563EB]">
              Step-by-Step Process
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-[#10243A]">
              How EmergencyConnect Works
            </h1>
            <p className="text-slate-600 text-base leading-relaxed">
              Designed to keep communication simple during stressful situations while giving responders clear, organized information.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {steps.map((step) => {
              const Icon = step.icon;
              return (
                <div
                  key={step.num}
                  className="bg-white p-7 rounded-2xl border border-[#E5EAF0] shadow-sm space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <div className="w-11 h-11 rounded-xl bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-sm font-bold text-slate-300 font-mono">
                      STEP {step.num}
                    </span>
                  </div>
                  <h2 className="text-lg font-bold text-[#10243A]">{step.title}</h2>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    {step.description}
                  </p>
                </div>
              );
            })}
          </div>

          <div className="bg-white rounded-2xl border border-[#E5EAF0] p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-sm">
            <div>
              <h3 className="text-lg font-bold text-[#10243A]">Ready to test the reporting flow?</h3>
              <p className="text-sm text-slate-600 mt-1">
                Try submitting an incident using ordinary language and inspect how details are structured.
              </p>
            </div>
            <Link
              href="/dashboard/report"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-white bg-[#2563EB] hover:bg-blue-700 transition-colors shrink-0 text-sm"
            >
              <span>Open Reporting Tool</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
