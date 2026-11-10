"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Navbar } from "@/components/ui/navbar";
import { Footer } from "@/components/ui/footer";
import type { NlpAnalysisResult } from "@/lib/types";
import {
  AlertCircle,
  Sparkles,
  ArrowRight,
  Flame,
  HeartPulse,
  Car,
  Shield,
  Waves,
  HelpCircle,
  CheckCircle2,
  AlertTriangle,
  MessageSquareText,
} from "lucide-react";

export default function HomePage() {
  const [demoInput, setDemoInput] = useState(
    "There is a fire in a shop near the main market. Two people are trapped inside by the back door."
  );
  const [analyzing, setAnalyzing] = useState(false);
  const [demoResult, setDemoResult] = useState<NlpAnalysisResult | null>(null);

  const runDemoAnalysis = async (textToAnalyze?: string) => {
    const text = textToAnalyze || demoInput;
    if (!text.trim()) return;
    setAnalyzing(true);
    try {
      const res = await fetch("/api/nlp/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      });
      if (res.ok) {
        const data = await res.json();
        setDemoResult(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setAnalyzing(false);
    }
  };

  const sampleChips = [
    "Fire in a shop near the main market, people trapped",
    "Car accident on highway off-ramp, driver unconscious",
    "There was a small kitchen fire yesterday",
    "Elderly man collapsed at subway station with chest pain",
  ];

  return (
    <div className="flex flex-col min-h-screen bg-[#F7F9FC]">
      <Navbar />

      <main className="flex-1">
        {/* HERO SECTION */}
        <section className="pt-14 pb-20 lg:pt-20 lg:pb-24 bg-gradient-to-b from-white to-[#F7F9FC] border-b border-[#E5EAF0]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-12">
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-[#10243A] leading-tight">
                Communicate Emergencies in <span className="text-[#2563EB]">Your Own Words</span>
              </h1>
              <p className="mt-5 text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto">
                During a crisis, you should not have to search through complicated menus. Simply describe what is happening, and EmergencyConnect organizes the details for rapid responder review.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link
                  href="/dashboard/report"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-bold text-white bg-[#DC2626] hover:bg-[#b91c1c] shadow-sm transition-all"
                >
                  <AlertCircle className="w-5 h-5" />
                  <span>Report an Emergency</span>
                </Link>
                <Link
                  href="/how-it-works"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-semibold text-[#10243A] bg-white hover:bg-slate-50 border border-[#E5EAF0] shadow-sm transition-all"
                >
                  <span>Learn How It Works</span>
                  <ArrowRight className="w-4 h-4 text-slate-400" />
                </Link>
              </div>
            </div>

            {/* LIVE MESSAGE ANALYZER SANDBOX */}
            <div className="max-w-4xl mx-auto bg-white rounded-2xl border border-[#E5EAF0] shadow-md overflow-hidden">
              <div className="bg-[#10243A] text-white px-5 py-3.5 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <MessageSquareText className="w-4 h-4 text-blue-400" />
                  <span className="text-xs sm:text-sm font-semibold tracking-wide">
                    Live Incident Message Analyzer
                  </span>
                </div>
                <span className="text-xs text-slate-300">Try a sample message</span>
              </div>

              <div className="p-5 sm:p-7 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                    Describe a situation or select an example below:
                  </label>
                  <textarea
                    rows={3}
                    value={demoInput}
                    onChange={(e) => setDemoInput(e.target.value)}
                    placeholder="Describe what is happening in plain language..."
                    className="w-full rounded-xl border border-slate-200 p-3.5 text-sm sm:text-base text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent transition-all resize-none"
                  />
                </div>

                {/* Sample Prompt Chips */}
                <div className="flex flex-wrap gap-2 items-center">
                  <span className="text-xs text-slate-400 font-medium">Examples:</span>
                  {sampleChips.map((chip, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setDemoInput(chip);
                        runDemoAnalysis(chip);
                      }}
                      className="text-xs bg-slate-100 hover:bg-blue-50 hover:text-[#2563EB] text-slate-600 px-2.5 py-1 rounded-lg border border-slate-200 transition-colors"
                    >
                      &ldquo;{chip.slice(0, 32)}...&rdquo;
                    </button>
                  ))}
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    onClick={() => runDemoAnalysis()}
                    disabled={analyzing}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#2563EB] hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-semibold rounded-xl shadow-sm transition-all"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>{analyzing ? "Analyzing..." : "Analyze Message"}</span>
                  </button>
                </div>

                {/* Interpretation Output */}
                {demoResult && (
                  <div className="mt-5 pt-5 border-t border-slate-100 bg-slate-50/70 p-4 rounded-xl border border-slate-200">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                        System Interpretation
                      </span>
                      <span className="text-xs font-medium text-slate-500">
                        Confidence: <strong className="text-slate-800">{Math.round(demoResult.detectedCategory.confidence * 100)}%</strong>
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="bg-white p-3 rounded-lg border border-slate-200">
                        <span className="text-[11px] text-slate-400 font-medium block">Emergency Category</span>
                        <span className="font-bold text-sm text-[#10243A]">
                          {demoResult.detectedCategory.name}
                        </span>
                      </div>
                      <div className="bg-white p-3 rounded-lg border border-slate-200">
                        <span className="text-[11px] text-slate-400 font-medium block">Urgency Assessment</span>
                        <span
                          className={`font-bold text-sm inline-flex items-center gap-1.5 ${
                            demoResult.urgency.level === "critical"
                              ? "text-red-600"
                              : demoResult.urgency.level === "high"
                              ? "text-orange-600"
                              : demoResult.urgency.level === "moderate"
                              ? "text-amber-600"
                              : "text-green-600"
                          }`}
                        >
                          <span className="w-2 h-2 rounded-full bg-current"></span>
                          {demoResult.urgency.level.toUpperCase()}
                        </span>
                      </div>
                      <div className="bg-white p-3 rounded-lg border border-slate-200">
                        <span className="text-[11px] text-slate-400 font-medium block">Time Context</span>
                        <span className="font-bold text-sm text-slate-700 capitalize">
                          {demoResult.temporalContext.type.replace("_", " ")}
                        </span>
                      </div>
                    </div>

                    <div className="mt-3 text-xs bg-white p-3 rounded-lg border border-slate-200 space-y-1.5">
                      <div>
                        <strong className="text-slate-700">Assessment Note:</strong>{" "}
                        <span className="text-slate-600">{demoResult.urgency.rationale}</span>
                      </div>
                      {demoResult.extractedEntities.hazards && (
                        <div>
                          <strong className="text-slate-700">Identified Hazards:</strong>{" "}
                          <span className="text-red-700 font-medium">{demoResult.extractedEntities.hazards}</span>
                        </div>
                      )}
                      {demoResult.extractedEntities.casualties && (
                        <div>
                          <strong className="text-slate-700">Injuries / People Involved:</strong>{" "}
                          <span className="text-red-700 font-medium">{demoResult.extractedEntities.casualties}</span>
                        </div>
                      )}
                      {demoResult.extractedEntities.locationMentions?.length > 0 && (
                        <div>
                          <strong className="text-slate-700">Mentioned Locations:</strong>{" "}
                          <span className="text-blue-700 font-medium">
                            {demoResult.extractedEntities.locationMentions.join(", ")}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section className="py-16 sm:py-20 bg-white border-b border-[#E5EAF0]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-14">
              <span className="text-xs font-bold uppercase tracking-wider text-[#2563EB]">Simple Workflow</span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#10243A] mt-1">
                From Everyday Words to Organized Action
              </h2>
              <p className="text-sm sm:text-base text-slate-500 mt-2">
                Four clear steps from reporting an incident to receiving coordinator updates.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-[#F7F9FC] p-6 rounded-2xl border border-slate-200">
                <div className="w-10 h-10 rounded-xl bg-blue-100 text-[#2563EB] flex items-center justify-center font-bold text-sm mb-4">
                  01
                </div>
                <h3 className="font-bold text-base text-[#10243A] mb-2">Describe in Plain Words</h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Type what is happening naturally without needing technical emergency terminology.
                </p>
              </div>

              <div className="bg-[#F7F9FC] p-6 rounded-2xl border border-slate-200">
                <div className="w-10 h-10 rounded-xl bg-blue-100 text-[#2563EB] flex items-center justify-center font-bold text-sm mb-4">
                  02
                </div>
                <h3 className="font-bold text-base text-[#10243A] mb-2">Smart Interpretation</h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  The platform extracts incident type, people affected, urgency level, and landmarks.
                </p>
              </div>

              <div className="bg-[#F7F9FC] p-6 rounded-2xl border border-slate-200">
                <div className="w-10 h-10 rounded-xl bg-blue-100 text-[#2563EB] flex items-center justify-center font-bold text-sm mb-4">
                  03
                </div>
                <h3 className="font-bold text-base text-[#10243A] mb-2">Confirm Details</h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Review the suggested summary and edit any detail before submitting your report.
                </p>
              </div>

              <div className="bg-[#F7F9FC] p-6 rounded-2xl border border-slate-200">
                <div className="w-10 h-10 rounded-xl bg-blue-100 text-[#2563EB] flex items-center justify-center font-bold text-sm mb-4">
                  04
                </div>
                <h3 className="font-bold text-base text-[#10243A] mb-2">Coordinator Review</h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Response personnel review prioritized reports and send status updates directly to you.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* EMERGENCY CATEGORIES */}
        <section className="py-16 sm:py-20 bg-[#F7F9FC] border-b border-[#E5EAF0]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <span className="text-xs font-bold uppercase tracking-wider text-[#2563EB]">Categories</span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#10243A] mt-1">
                Emergency Categories Supported
              </h2>
              <p className="text-sm sm:text-base text-slate-500 mt-2">
                Incidents are automatically grouped into clear response categories for faster review.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
                <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center mb-4">
                  <HeartPulse className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-base text-[#10243A] mb-1.5">Medical Emergency</h3>
                <p className="text-sm text-slate-600">
                  Chest pain, breathing difficulties, severe injuries, bleeding, or unconscious individuals.
                </p>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
                <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center mb-4">
                  <Flame className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-base text-[#10243A] mb-1.5">Fire & Rescue</h3>
                <p className="text-sm text-slate-600">
                  Building fires, heavy smoke, gas leaks, explosions, or people trapped inside structures.
                </p>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-4">
                  <Car className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-base text-[#10243A] mb-1.5">Road Traffic Accident</h3>
                <p className="text-sm text-slate-600">
                  Vehicle collisions, overturned vehicles, pedestrian injuries, or blocked roadways.
                </p>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
                <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-4">
                  <Shield className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-base text-[#10243A] mb-1.5">Public Safety & Security</h3>
                <p className="text-sm text-slate-600">
                  Assaults, robberies, armed threats, break-ins, and urgent public safety disturbances.
                </p>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
                <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center mb-4">
                  <Waves className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-base text-[#10243A] mb-1.5">Natural Hazard & Flood</h3>
                <p className="text-sm text-slate-600">
                  Flash flooding, rising water levels, landslides, fallen power lines, and storm damage.
                </p>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
                  <HelpCircle className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-base text-[#10243A] mb-1.5">General Inquiry</h3>
                <p className="text-sm text-slate-600">
                  Non-urgent questions, past event reports, and general safety information requests.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CORE INTELLIGENCE WITH IMAGE */}
        <section className="py-16 sm:py-20 bg-white border-b border-[#E5EAF0]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#2563EB]">
                  Context-Aware Intelligence
                </span>
                <h2 className="text-2xl sm:text-4xl font-extrabold text-[#10243A] mt-1 mb-4 leading-tight">
                  Understanding Meaning, Not Just Keywords
                </h2>
                <p className="text-slate-600 text-sm sm:text-base leading-relaxed mb-6">
                  Simple word matching often misunderstands urgent messages. EmergencyConnect reads full context—distinguishing an active crisis happening right now from a past incident or a general question.
                </p>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-bold text-sm text-[#10243A]">Time & Context Awareness</h4>
                      <p className="text-sm text-slate-500">
                        Separates ongoing emergencies from events that happened yesterday or informational questions.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-bold text-sm text-[#10243A]">Key Detail Extraction</h4>
                      <p className="text-sm text-slate-500">
                        Highlights injuries, active hazards, and mentioned locations so coordinators see what matters immediately.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-bold text-sm text-[#10243A]">Verified Human Oversight</h4>
                      <p className="text-sm text-slate-500">
                        Every report is confirmed by the user and reviewed by human administrators before final action.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Clean Image Replacement */}
              <div className="relative rounded-2xl overflow-hidden border border-[#E5EAF0] shadow-lg bg-slate-100">
                <Image
                  src="/images/emergency-response.jpg"
                  alt="Emergency response personnel reviewing structured incident details"
                  width={1200}
                  height={900}
                  className="w-full h-auto object-cover aspect-[4/3]"
                  priority
                />
              </div>
            </div>
          </div>
        </section>

        {/* ACADEMIC SAFETY BOUNDARY */}
        <section className="py-16 bg-[#F7F9FC]">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="inline-flex p-3 rounded-2xl bg-amber-100 text-amber-800 mb-4">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#10243A]">
              Academic Prototype Notice
            </h2>
            <p className="mt-3 text-sm sm:text-base text-slate-600 leading-relaxed">
              EmergencyConnect is an academic prototype demonstrating how natural language understanding can support emergency communication. It does not replace or dispatch official real-world emergency services.
            </p>

            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Link
                href="/auth/login"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-white bg-[#10243A] hover:bg-[#1E3A5F] shadow-sm transition-all text-sm"
              >
                <span>Sign In to Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/dashboard/report"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-[#DC2626] bg-red-50 hover:bg-red-100 border border-red-200 transition-all text-sm"
              >
                <span>Try Emergency Reporting</span>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
