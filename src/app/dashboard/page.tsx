"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import type { ReportItem } from "@/lib/types";

export default function CitizenDashboardPage() {
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

  const totalReports = reports.length;
  const underReview = reports.filter((r) => r.status === "submitted" || r.status === "under_review").length;
  const confirmedActive = reports.filter((r) => r.status === "confirmed" || r.status === "assigned").length;
  const resolved = reports.filter((r) => r.status === "resolved").length;

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Welcome Banner */}
      <div className="bg-white rounded-2xl border border-[#E5EAF0] p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-sm">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#2563EB]">Incident Communication Hub</span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#10243A] mt-1">
            Citizen Emergency Dashboard
          </h1>
          <p className="text-slate-500 text-sm mt-1 max-w-xl">
            Submit emergencies in your own natural words. Review model extractions and monitor response coordinator updates in real time.
          </p>
        </div>
        <Link
          href="/dashboard/report"
          className="inline-flex items-center gap-2.5 px-6 py-3 rounded-xl font-bold text-white bg-[#DC2626] hover:bg-[#b91c1c] shadow-sm hover:shadow transition-all shrink-0 text-sm"
        >
          <AlertCircle className="w-4 h-4" />
          <span>Report New Emergency</span>
        </Link>
      </div>

      {/* METRICS STRIP */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total */}
        <div className="bg-white p-5 rounded-2xl border border-[#E5EAF0] shadow-2xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Total Submitted</span>
            <FileText className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-[#10243A]">{loading ? "..." : totalReports}</div>
          <span className="text-[11px] text-slate-400 mt-1 block">Lifetime incident reports</span>
        </div>

        {/* Under Review */}
        <div className="bg-white p-5 rounded-2xl border border-[#E5EAF0] shadow-2xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-600">Under Review</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-amber-600">{loading ? "..." : underReview}</div>
          <span className="text-[11px] text-slate-400 mt-1 block">Awaiting dispatcher action</span>
        </div>

        {/* Active / Assigned */}
        <div className="bg-white p-5 rounded-2xl border border-[#E5EAF0] shadow-2xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600">Being Handled</span>
            <AlertCircle className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-blue-600">{loading ? "..." : confirmedActive}</div>
          <span className="text-[11px] text-slate-400 mt-1 block">Active responder dispatched</span>
        </div>

        {/* Resolved */}
        <div className="bg-white p-5 rounded-2xl border border-[#E5EAF0] shadow-2xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">Resolved</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-600">{loading ? "..." : resolved}</div>
          <span className="text-[11px] text-slate-400 mt-1 block">Completed incidents</span>
        </div>
      </div>

      {/* RECENT REPORTS TABLE */}
      <div className="bg-white rounded-2xl border border-[#E5EAF0] shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-[#E5EAF0] flex items-center justify-between">
          <div>
            <h2 className="font-bold text-base text-[#10243A]">Your Incident Reports</h2>
            <p className="text-xs text-slate-500">Live status of your submitted emergency communications</p>
          </div>
          <Link
            href="/dashboard/reports"
            className="text-xs font-semibold text-[#2563EB] hover:underline inline-flex items-center gap-1"
          >
            <span>View All</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="p-8 text-center text-sm text-slate-400">Loading incident history...</div>
        ) : reports.length === 0 ? (
          <div className="p-10 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
              <FileText className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-sm text-[#10243A]">No Emergency Reports Yet</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              You haven&apos;t filed any incident reports. If you are experiencing an incident, use the reporting button below.
            </p>
            <Link
              href="/dashboard/report"
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#10243A] text-white text-xs font-bold rounded-lg"
            >
              <AlertCircle className="w-3.5 h-3.5" />
              <span>Report Incident</span>
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#F7F9FC] text-[11px] uppercase tracking-wider text-slate-500 font-bold border-b border-[#E5EAF0]">
                <tr>
                  <th className="px-6 py-3">Reference</th>
                  <th className="px-6 py-3">Category</th>
                  <th className="px-6 py-3">Urgency</th>
                  <th className="px-6 py-3">Location</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5EAF0]">
                {reports.slice(0, 5).map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-6 py-4 font-mono font-bold text-xs text-[#10243A]">
                      {r.referenceNumber}
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-semibold text-xs text-slate-800">
                        {r.category?.name || "Uncategorized"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-bold capitalize ${
                          r.urgency === "critical"
                            ? "bg-red-50 text-red-700 border border-red-200"
                            : r.urgency === "high"
                            ? "bg-orange-50 text-orange-700 border border-orange-200"
                            : r.urgency === "moderate"
                            ? "bg-amber-50 text-amber-700 border border-amber-200"
                            : "bg-green-50 text-green-700 border border-green-200"
                        }`}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                        {r.urgency}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-600 truncate max-w-xs">
                      {r.locationName || "Pending confirmation"}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                          r.status === "resolved"
                            ? "bg-emerald-100 text-emerald-800"
                            : r.status === "confirmed" || r.status === "assigned"
                            ? "bg-blue-100 text-blue-800"
                            : r.status === "rejected"
                            ? "bg-slate-200 text-slate-700"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {r.status.replace("_", " ")}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        href={`/dashboard/reports/${r.id}`}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-[#2563EB] hover:underline"
                      >
                        <span>Details</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* INSTRUCTIONS CARD */}
      <div className="bg-blue-50/70 border border-blue-200 rounded-2xl p-6">
        <div className="flex items-start gap-3">
          <Sparkles className="w-5 h-5 text-[#2563EB] shrink-0 mt-0.5" />
          <div>
            <h3 className="font-bold text-sm text-[#10243A]">Effective Reporting Tips</h3>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              When describing an emergency, mention: <strong>what is happening</strong> (e.g. fire, crash, collapse), <strong>any injuries or trapped victims</strong>, and <strong>nearby landmarks</strong> (e.g. &ldquo;near Market Square&rdquo;). The system will automatically organize key details for the response team.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
