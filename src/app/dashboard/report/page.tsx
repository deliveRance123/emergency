"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  Sparkles,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  Navigation,
} from "lucide-react";
import type { NlpAnalysisResult } from "@/lib/types";

export default function ReportEmergencyPage() {
  const router = useRouter();

  // Form State
  const [description, setDescription] = useState("");
  const [manualLocation, setManualLocation] = useState("");
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [locating, setLocating] = useState(false);

  // Analysis State
  const [analyzing, setAnalyzing] = useState(false);
  const [nlpResult, setNlpResult] = useState<NlpAnalysisResult | null>(null);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  // User Confirmation Overrides
  const [confirmedCategory, setConfirmedCategory] = useState<string>("");
  const [confirmedUrgency, setConfirmedUrgency] = useState<string>("moderate");
  const [userNotes, setUserNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);

  // Geolocation trigger
  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        if (!manualLocation) {
          setManualLocation(`GPS: ${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}`);
        }
        setLocating(false);
      },
      () => {
        alert("Unable to retrieve your location. Please enter your address or landmark manually.");
        setLocating(false);
      }
    );
  };

  // Run NLP Analysis
  const handleAnalyze = async () => {
    if (description.trim().length < 5) {
      setAnalysisError("Please provide at least a few words describing what is happening.");
      return;
    }
    setAnalysisError(null);
    setAnalyzing(true);

    try {
      const res = await fetch("/api/nlp/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: description }),
      });

      const data = await res.json();
      if (!res.ok) {
        setAnalysisError(data.error || "Unable to analyze message.");
        setAnalyzing(false);
        return;
      }

      setNlpResult(data);
      setConfirmedCategory(data.detectedCategory.code);
      setConfirmedUrgency(data.urgency.level);

      // Pre-populate location if extracted and none was entered
      if (!manualLocation && data.extractedEntities.locationMentions?.length > 0) {
        setManualLocation(data.extractedEntities.locationMentions.join(", "));
      }
    } catch {
      setAnalysisError("Network error while analyzing your message.");
    } finally {
      setAnalyzing(false);
    }
  };

  // Submit Final Report
  const handleSubmitReport = async () => {
    if (!nlpResult) return;
    setSubmitting(true);

    try {
      const payload = {
        originalMessage: description,
        categoryCode: confirmedCategory,
        urgency: confirmedUrgency,
        locationName: manualLocation || "Incident site location unverified",
        latitude: coords?.lat,
        longitude: coords?.lng,
        userCorrectionNotes: userNotes,
        nlpAnalysis: {
          detectedCategoryCode: nlpResult.detectedCategory.code,
          detectedCategoryName: nlpResult.detectedCategory.name,
          urgencyAssessment: nlpResult.urgency.level,
          confidenceScore: nlpResult.detectedCategory.confidence,
          temporalContext: nlpResult.temporalContext.type,
          extractedEntities: nlpResult.extractedEntities,
          detectedKeywords: nlpResult.detectedKeywords,
          modelVersion: nlpResult.modelVersion,
        },
      };

      const res = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Failed to submit report.");
        setSubmitting(false);
        return;
      }

      setSubmitSuccess(data.referenceNumber);
      setTimeout(() => {
        router.push(`/dashboard/reports/${data.reportId}`);
      }, 1500);
    } catch {
      alert("Error submitting emergency report.");
      setSubmitting(false);
    }
  };

  const samplePrompts = [
    "Two cars collided near the central market. One driver is bleeding from the head and unconscious.",
    "Dense black smoke is rising from the roof of the warehouse on 5th Avenue. We can hear shouting inside.",
    "A person collapsed on the subway platform and stopped breathing. A bystander is starting CPR.",
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-[#DC2626]">Incident Reporting</span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#10243A] mt-1">
          Report an Emergency Incident
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Describe what is happening in ordinary words. The system analyzes your message, extracts key details, and lets you confirm everything before submitting.
        </p>
      </div>

      {submitSuccess && (
        <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 space-y-2">
          <div className="flex items-center gap-2 font-bold text-base">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <span>Emergency Report #{submitSuccess} Submitted Successfully!</span>
          </div>
          <p className="text-xs text-emerald-700">
            Your report is queued for dispatcher review. Redirecting to your live tracking dossier...
          </p>
        </div>
      )}

      {/* STEP 1: NATURAL LANGUAGE INPUT FORM */}
      <div className="bg-white rounded-2xl border border-[#E5EAF0] shadow-sm p-6 sm:p-8 space-y-6">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
            1. Describe what is happening in your own words:
          </label>
          <textarea
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Type or paste what you see. Mention what happened, any injuries, visible hazards, or landmarks..."
            className="w-full p-4 rounded-xl border border-slate-200 text-sm sm:text-base text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent transition-all"
          />

          {/* Prompt chips */}
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="text-xs text-slate-400 font-medium">Quick examples:</span>
            {samplePrompts.map((p, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setDescription(p)}
                className="text-xs bg-slate-50 hover:bg-blue-50 text-slate-600 hover:text-[#2563EB] px-2.5 py-1 rounded-lg border border-slate-200 transition-colors"
              >
                &ldquo;{p.slice(0, 36)}...&rdquo;
              </button>
            ))}
          </div>
        </div>

        {/* Location Section */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="sm:col-span-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              2. Incident Location / Landmark:
            </label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={manualLocation}
                onChange={(e) => setManualLocation(e.target.value)}
                placeholder="e.g. Corner of 5th Ave and Main St, near Central Market"
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              GPS Auto-Detect:
            </label>
            <button
              type="button"
              onClick={handleGetLocation}
              disabled={locating}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-700 transition-colors"
            >
              <Navigation className="w-3.5 h-3.5 text-[#2563EB]" />
              <span>{locating ? "Locating..." : coords ? "GPS Locked" : "Use My Location"}</span>
            </button>
          </div>
        </div>

        {analysisError && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{analysisError}</span>
          </div>
        )}

        {/* Analysis Trigger Button */}
        <div className="pt-2 flex justify-end">
          <button
            type="button"
            onClick={handleAnalyze}
            disabled={analyzing || !description.trim()}
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#2563EB] hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-sm rounded-xl shadow-sm transition-all"
          >
            <Sparkles className="w-4 h-4" />
            <span>{analyzing ? "Analyzing..." : "Analyze Message"}</span>
          </button>
        </div>
      </div>

      {/* STEP 2: INTERPRETATION & HUMAN CONFIRMATION PANEL */}
      {nlpResult && (
        <div className="bg-white rounded-2xl border-2 border-blue-200 shadow-md p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#2563EB]">Step 2: Confirm Details</span>
              <h2 className="text-lg font-bold text-[#10243A]">Review & Confirm Interpretation</h2>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
              Confidence: {Math.round(nlpResult.detectedCategory.confidence * 100)}%
            </span>
          </div>

          {/* Uncertainty Notice if flagged */}
          {nlpResult.uncertaintyWarning && (
            <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>{nlpResult.uncertaintyWarning}</span>
            </div>
          )}

          {/* Extracted Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Category selection */}
            <div className="bg-[#F7F9FC] p-4 rounded-xl border border-slate-200">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Emergency Category:
              </label>
              <select
                value={confirmedCategory}
                onChange={(e) => setConfirmedCategory(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-slate-200 bg-white text-sm font-semibold text-[#10243A] focus:ring-2 focus:ring-[#2563EB]"
              >
                <option value="medical">Medical Emergency</option>
                <option value="fire">Fire & Rescue</option>
                <option value="accident">Road Traffic Accident</option>
                <option value="security">Public Safety & Security</option>
                <option value="flood">Natural Hazard & Flood</option>
                <option value="other">Other Urgent Incident</option>
                <option value="inquiry">General Inquiry / Non-Emergency</option>
              </select>
              <span className="text-[11px] text-slate-400 mt-1.5 block">
                Suggested Category: <strong>{nlpResult.detectedCategory.name}</strong>
              </span>
            </div>

            {/* Urgency selection */}
            <div className="bg-[#F7F9FC] p-4 rounded-xl border border-slate-200">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Urgency Level Assessment:
              </label>
              <select
                value={confirmedUrgency}
                onChange={(e) => setConfirmedUrgency(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-slate-200 bg-white text-sm font-semibold text-[#10243A] focus:ring-2 focus:ring-[#2563EB]"
              >
                <option value="critical">Critical (Immediate life hazard)</option>
                <option value="high">High (Active danger / urgent)</option>
                <option value="moderate">Moderate (Standard triage)</option>
                <option value="low">Low (Non-life threatening)</option>
              </select>
              <span className="text-[11px] text-slate-400 mt-1.5 block">
                Suggested Urgency: <strong className="uppercase">{nlpResult.urgency.level}</strong>
              </span>
            </div>
          </div>

          {/* Extracted Entities Summary */}
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-2 text-xs">
            <span className="font-bold text-slate-700 block uppercase tracking-wider text-[11px]">
              Extracted Incident Details:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-600">
              <div>
                <strong className="text-slate-800">Incident Type:</strong> {nlpResult.extractedEntities.incidentType}
              </div>
              <div>
                <strong className="text-slate-800">Time Context:</strong> {nlpResult.temporalContext.type.replace("_", " ")}
              </div>
              {nlpResult.extractedEntities.casualties && (
                <div className="text-red-700">
                  <strong>Casualties / Injuries:</strong> {nlpResult.extractedEntities.casualties}
                </div>
              )}
              {nlpResult.extractedEntities.hazards && (
                <div className="text-orange-700">
                  <strong>Active Hazards:</strong> {nlpResult.extractedEntities.hazards}
                </div>
              )}
            </div>
            <div className="pt-2 border-t border-slate-200 text-slate-500">
              <strong>Assessment Note:</strong> {nlpResult.urgency.rationale}
            </div>
          </div>

          {/* Optional citizen notes */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Additional Details or Corrections for Dispatcher (Optional):
            </label>
            <input
              type="text"
              value={userNotes}
              onChange={(e) => setUserNotes(e.target.value)}
              placeholder="e.g. 'I am standing across the street in a blue jacket'"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
            />
          </div>

          {/* SUBMIT BUTTON */}
          <div className="pt-4 border-t border-slate-100 space-y-4">
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                This is an academic prototype and does not dispatch real emergency services. For real-life emergencies, please dial your local emergency number.
              </span>
            </div>
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <span className="text-xs text-slate-500">
                By submitting, you confirm the extracted details accurately reflect the situation.
              </span>
              <button
                type="button"
                onClick={handleSubmitReport}
                disabled={submitting}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-[#DC2626] hover:bg-[#b91c1c] disabled:opacity-50 text-white font-extrabold text-sm rounded-xl shadow-md transition-all"
              >
                <CheckCircle2 className="w-5 h-5" />
                <span>{submitting ? "Submitting..." : "Confirm & Submit Emergency Report"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
