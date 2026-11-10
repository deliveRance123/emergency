"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Search,
  Filter,
  ChevronRight,
  AlertCircle,
} from "lucide-react";
import type { ReportItem } from "@/lib/types";

export default function MyReportsPage() {
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [urgencyFilter, setUrgencyFilter] = useState("all");

  useEffect(() => {
    fetch("/api/reports")
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        setReports(data || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const filteredReports = reports.filter((r) => {
    const matchesSearch =
      r.referenceNumber.toLowerCase().includes(search.toLowerCase()) ||
      r.originalMessage.toLowerCase().includes(search.toLowerCase()) ||
      (r.locationName && r.locationName.toLowerCase().includes(search.toLowerCase()));

    const matchesStatus = statusFilter === "all" || r.status === statusFilter;
    const matchesUrgency = urgencyFilter === "all" || r.urgency === urgencyFilter;

    return matchesSearch && matchesStatus && matchesUrgency;
  });

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#2563EB]">Incident Tracking</span>
          <h1 className="text-2xl font-extrabold text-[#10243A] mt-1">My Incident Reports</h1>
          <p className="text-xs text-slate-500">History and status timeline of all your submitted emergency reports</p>
        </div>
        <Link
          href="/dashboard/report"
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#DC2626] hover:bg-[#b91c1c] text-white text-xs font-bold rounded-xl shadow-xs"
        >
          <AlertCircle className="w-3.5 h-3.5" />
          <span>Report New Incident</span>
        </Link>
      </div>

      {/* FILTER & SEARCH BAR */}
      <div className="bg-white p-4 rounded-2xl border border-[#E5EAF0] shadow-2xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by reference ID, description, or location..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <Filter className="w-4 h-4 text-slate-400 hidden sm:block" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 font-medium"
          >
            <option value="all">All Statuses</option>
            <option value="submitted">Submitted</option>
            <option value="under_review">Under Review</option>
            <option value="confirmed">Confirmed</option>
            <option value="assigned">Assigned</option>
            <option value="resolved">Resolved</option>
            <option value="rejected">Rejected</option>
          </select>

          <select
            value={urgencyFilter}
            onChange={(e) => setUrgencyFilter(e.target.value)}
            className="text-xs px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 font-medium"
          >
            <option value="all">All Urgencies</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="moderate">Moderate</option>
            <option value="low">Low</option>
          </select>
        </div>
      </div>

      {/* DATA TABLE */}
      <div className="bg-white rounded-2xl border border-[#E5EAF0] shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-sm text-slate-400">Loading incident records...</div>
        ) : filteredReports.length === 0 ? (
          <div className="p-12 text-center text-sm text-slate-400">
            No incident reports found matching the selected filters.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#F7F9FC] text-[11px] uppercase tracking-wider text-slate-500 font-bold border-b border-[#E5EAF0]">
                <tr>
                  <th className="px-6 py-3.5">Reference ID</th>
                  <th className="px-6 py-3.5">Category</th>
                  <th className="px-6 py-3.5">Urgency</th>
                  <th className="px-6 py-3.5">Reported Message</th>
                  <th className="px-6 py-3.5">Location</th>
                  <th className="px-6 py-3.5">Date</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5EAF0]">
                {filteredReports.map((r) => (
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
                    <td className="px-6 py-4 text-xs text-slate-600 max-w-xs truncate">
                      {r.originalMessage}
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-600 truncate max-w-[180px]">
                      {r.locationName || "Pending"}
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-400 whitespace-nowrap">
                      {new Date(r.createdAt).toLocaleDateString()}
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
                        <span>View</span>
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
    </div>
  );
}
