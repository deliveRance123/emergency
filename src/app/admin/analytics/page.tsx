"use client";

import React, { useState, useEffect } from "react";
import type { ReportItem } from "@/lib/types";

export default function AdminAnalyticsPage() {
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/reports")
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        setReports(data || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const total = reports.length;
  const critical = reports.filter((r) => r.urgency === "critical").length;
  const high = reports.filter((r) => r.urgency === "high").length;
  const moderate = reports.filter((r) => r.urgency === "moderate").length;
  const low = reports.filter((r) => r.urgency === "low").length;

  const resolvedCount = reports.filter((r) => r.status === "resolved").length;
  const activeCount = reports.filter((r) => r.status !== "resolved" && r.status !== "rejected").length;

  const confidenceScores = reports
    .map((r) => r.nlpAnalysis?.confidenceScore)
    .filter((s): s is number => typeof s === "number");
  const avgConfidence =
    confidenceScores.length > 0
      ? `${Math.round((confidenceScores.reduce((a, b) => a + b, 0) / confidenceScores.length) * 100)}%`
      : "—";

  const categoriesCount: Record<string, number> = {};
  reports.forEach((r) => {
    const cat = r.category?.name || "Other";
    categoriesCount[cat] = (categoriesCount[cat] || 0) + 1;
  });

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-blue-600">System Overview</span>
        <h1 className="text-2xl font-extrabold text-[#10243A] mt-1">Incident Analytics & Insights</h1>
        <p className="text-xs text-slate-500">
          Live category distributions and urgency breakdowns across submitted reports
        </p>
      </div>

      {/* TOP KPI CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-[#E5EAF0] shadow-2xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
            Average Confidence Score
          </span>
          <div className="text-3xl font-black text-[#10243A]">{loading ? "..." : avgConfidence}</div>
          <span className="text-xs text-emerald-600 font-semibold mt-1 block">
            Across {confidenceScores.length} analyzed reports
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#E5EAF0] shadow-2xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
            Open Active Incidents
          </span>
          <div className="text-3xl font-black text-[#2563EB]">{loading ? "..." : activeCount}</div>
          <span className="text-xs text-slate-500 mt-1 block">Reports currently open or in review</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#E5EAF0] shadow-2xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
            Resolved Incidents
          </span>
          <div className="text-3xl font-black text-emerald-600">{loading ? "..." : resolvedCount}</div>
          <span className="text-xs text-slate-500 mt-1 block">Completed out of {total} total reports</span>
        </div>
      </div>

      {/* VISUAL DISTRIBUTION PANELS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Urgency Severity Distribution */}
        <div className="bg-white p-6 rounded-2xl border border-[#E5EAF0] shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-bold text-sm text-[#10243A]">Urgency Severity Distribution</h3>
            <span className="text-xs text-slate-400 font-mono">Total: {total}</span>
          </div>

          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-red-700">Critical Priority</span>
                <span>{critical} ({total > 0 ? Math.round((critical / total) * 100) : 0}%)</span>
              </div>
              <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-red-600 rounded-full transition-all"
                  style={{ width: `${total > 0 ? (critical / total) * 100 : 0}%` }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-orange-700">High Priority</span>
                <span>{high} ({total > 0 ? Math.round((high / total) * 100) : 0}%)</span>
              </div>
              <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-orange-500 rounded-full transition-all"
                  style={{ width: `${total > 0 ? (high / total) * 100 : 0}%` }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-amber-700">Moderate Priority</span>
                <span>{moderate} ({total > 0 ? Math.round((moderate / total) * 100) : 0}%)</span>
              </div>
              <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-500 rounded-full transition-all"
                  style={{ width: `${total > 0 ? (moderate / total) * 100 : 0}%` }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-green-700">Low Priority</span>
                <span>{low} ({total > 0 ? Math.round((low / total) * 100) : 0}%)</span>
              </div>
              <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-green-500 rounded-full transition-all"
                  style={{ width: `${total > 0 ? (low / total) * 100 : 0}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="bg-white p-6 rounded-2xl border border-[#E5EAF0] shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-bold text-sm text-[#10243A]">Incidents by Category</h3>
            <span className="text-xs text-slate-400 font-mono">Active Domains</span>
          </div>

          <div className="space-y-2.5">
            {Object.entries(categoriesCount).length === 0 ? (
              <div className="p-4 text-center text-xs text-slate-400">No category data yet.</div>
            ) : (
              Object.entries(categoriesCount).map(([name, count]) => (
                <div key={name} className="flex items-center justify-between p-2.5 bg-[#F7F9FC] rounded-xl text-xs">
                  <span className="font-semibold text-slate-800">{name}</span>
                  <span className="font-mono font-bold text-blue-700 bg-white px-2 py-0.5 rounded border border-slate-200">
                    {count} {count === 1 ? "report" : "reports"}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
