"use client";

import React, { useState, useEffect, use } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  MapPin,
  Sparkles,
  User,
  Calendar,
} from "lucide-react";
import type { ReportDetail, ReportUpdateItem } from "@/lib/types";

export default function ReportDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [report, setReport] = useState<ReportDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/reports/${id}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        setReport(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  if (loading) {
    return <div className="p-12 text-center text-sm text-slate-400">Loading incident dossier...</div>;
  }

  if (!report) {
    return (
      <div className="p-12 text-center space-y-3">
        <h2 className="text-base font-bold text-slate-800">Report Not Found</h2>
        <Link href="/dashboard/reports" className="text-xs text-[#2563EB] font-bold underline">
          Back to Reports List
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Back button & top bar */}
      <div className="flex items-center justify-between">
        <Link
          href="/dashboard/reports"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-[#2563EB] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Reports</span>
        </Link>
        <span className="text-xs font-mono font-bold text-slate-500 bg-white px-3 py-1 rounded-lg border border-slate-200">
          Ref: {report.referenceNumber}
        </span>
      </div>

      {/* Main Status Header Card */}
      <div className="bg-white rounded-2xl border border-[#E5EAF0] shadow-sm p-6 sm:p-8 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#2563EB]">
                {report.category?.name || "Emergency Incident"}
              </span>
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold uppercase ${
                  report.urgency === "critical"
                    ? "bg-red-50 text-red-700 border border-red-200"
                    : report.urgency === "high"
                    ? "bg-orange-50 text-orange-700 border border-orange-200"
                    : report.urgency === "moderate"
                    ? "bg-amber-50 text-amber-700 border border-amber-200"
                    : "bg-green-50 text-green-700 border border-green-200"
                }`}
              >
                {report.urgency} Urgency
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-[#10243A] mt-1">
              Incident Dossier #{report.referenceNumber}
            </h1>
          </div>

          <div>
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                report.status === "resolved"
                  ? "bg-emerald-100 text-emerald-800"
                  : report.status === "confirmed" || report.status === "assigned"
                  ? "bg-blue-100 text-blue-800"
                  : report.status === "rejected"
                  ? "bg-slate-200 text-slate-700"
                  : "bg-amber-100 text-amber-800"
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-current"></span>
              {report.status.replace("_", " ")}
            </span>
          </div>
        </div>

        {/* Metadata Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-slate-600 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
            <span>Submitted: {new Date(report.createdAt).toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-2 sm:col-span-2">
            <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
            <span className="truncate">{report.locationName || "Location not verified"}</span>
          </div>
        </div>
      </div>

      {/* TWO COLUMN COMPARISON: ORIGINAL MESSAGE VS NLP INTERPRETATION */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left: Original Citizen Message */}
        <div className="bg-white rounded-2xl border border-[#E5EAF0] shadow-sm p-6 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500">
            <User className="w-4 h-4 text-slate-400" />
            <span>Original Distress Description</span>
          </div>
          <p className="text-sm text-slate-800 leading-relaxed bg-[#F7F9FC] p-4 rounded-xl border border-slate-200 italic">
            &ldquo;{report.originalMessage}&rdquo;
          </p>
          {report.userCorrectionNotes && (
            <div className="text-xs text-slate-600 bg-blue-50/60 p-3 rounded-lg border border-blue-100">
              <strong className="text-blue-900 block mb-0.5">Citizen Clarification Notes:</strong>
              {report.userCorrectionNotes}
            </div>
          )}
        </div>

        {/* Right: Automated Interpretation Record */}
        <div className="bg-white rounded-2xl border border-[#E5EAF0] shadow-sm p-6 space-y-3">
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-500">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#2563EB]" />
              <span>Automated Interpretation</span>
            </div>
            {report.nlpAnalysis && (
              <span className="text-blue-600">
                {Math.round(report.nlpAnalysis.confidenceScore * 100)}% Confidence
              </span>
            )}
          </div>

          {report.nlpAnalysis ? (
            <div className="space-y-3 text-xs">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1.5">
                <div>
                  <strong className="text-slate-700">Detected Category:</strong>{" "}
                  <span className="font-semibold text-slate-900">{report.nlpAnalysis.detectedCategoryName}</span>
                </div>
                <div>
                  <strong className="text-slate-700">Temporal Context:</strong>{" "}
                  <span className="capitalize text-slate-800">{report.nlpAnalysis.temporalContext?.replace("_", " ") ?? "active present"}</span>
                </div>
                <div>
                  <strong className="text-slate-700">Urgency Assessment:</strong>{" "}
                  <span className="font-bold uppercase text-red-600">{report.nlpAnalysis.urgencyAssessment}</span>
                </div>
              </div>

              {/* Extracted Entities */}
              {report.nlpAnalysis.extractedEntities && (
                <div className="p-3 rounded-xl bg-blue-50/60 border border-blue-100 space-y-1">
                  <span className="font-bold text-blue-900 block text-[11px] uppercase tracking-wider">
                    Extracted Entities:
                  </span>
                  {report.nlpAnalysis.extractedEntities.incidentType && (
                    <div className="text-slate-700">
                      <strong>Incident:</strong> {report.nlpAnalysis.extractedEntities.incidentType}
                    </div>
                  )}
                  {report.nlpAnalysis.extractedEntities.casualties && (
                    <div className="text-red-700">
                      <strong>Casualties:</strong> {report.nlpAnalysis.extractedEntities.casualties}
                    </div>
                  )}
                  {report.nlpAnalysis.extractedEntities.hazards && (
                    <div className="text-orange-700">
                      <strong>Hazards:</strong> {report.nlpAnalysis.extractedEntities.hazards}
                    </div>
                  )}
                  {report.nlpAnalysis.extractedEntities.actionRecommendation && (
                    <div className="text-slate-600 pt-1 border-t border-blue-100">
                      <strong>Recommended Action:</strong> {report.nlpAnalysis.extractedEntities.actionRecommendation}
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="text-xs text-slate-400 p-4 text-center">No interpretation record found.</div>
          )}
        </div>
      </div>

      {/* DISPATCHER UPDATES & STATUS TIMELINE */}
      <div className="bg-white rounded-2xl border border-[#E5EAF0] shadow-sm p-6 sm:p-8 space-y-4">
        <h3 className="font-bold text-base text-[#10243A]">Status History & Dispatcher Updates</h3>

        {report.updates?.length > 0 ? (
          <div className="space-y-4 relative before:absolute before:left-3.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200">
            {report.updates.map((up: ReportUpdateItem) => (
              <div key={up.id} className="relative pl-8 space-y-1">
                <span className="absolute left-2 top-1.5 w-3 h-3 rounded-full bg-[#2563EB] ring-4 ring-white"></span>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-xs uppercase tracking-wider text-slate-800">
                    Status: {up.newStatus.replace("_", " ")}
                  </span>
                  <span className="text-[11px] text-slate-400">
                    {new Date(up.createdAt).toLocaleString()}
                  </span>
                </div>
                {up.publicNotificationMessage && (
                  <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                    {up.publicNotificationMessage}
                  </p>
                )}
                {up.administrator?.fullName && (
                  <div className="text-[10px] text-slate-400">
                    Action logged by: Chief Dispatcher ({up.administrator.fullName})
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-xs text-slate-400 p-4 text-center">
            No updates recorded yet. Your report is in the queue for operator evaluation.
          </div>
        )}
      </div>
    </div>
  );
}
