"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Activity,
  AlertCircle,
  Clock,
  CheckCircle2,
  Search,
  Sparkles,
  X,
  Send,
  ChevronRight,
  ExternalLink,
} from "lucide-react";
import type { ReportItem } from "@/lib/types";

export default function AdminTriagePage() {
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [urgencyFilter, setUrgencyFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");

  // Inspection & Action Modal State
  const [selectedReport, setSelectedReport] = useState<ReportItem | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [actionStatus, setActionStatus] = useState("");
  const [actionCategory, setActionCategory] = useState("");
  const [actionUrgency, setActionUrgency] = useState("");
  const [actionResponder, setActionResponder] = useState("");
  const [internalNote, setInternalNote] = useState("");
  const [publicMessage, setPublicMessage] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");
  const [savingAction, setSavingAction] = useState(false);

  const fetchReports = async () => {
    try {
      const res = await fetch("/api/reports");
      if (res.ok) {
        const data = await res.json();
        setReports(data || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetch("/api/reports")
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        setReports(data || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const openTriageModal = (report: ReportItem) => {
    setSelectedReport(report);
    setActionStatus(report.status);
    setActionCategory(report.category?.code || "other");
    setActionUrgency(report.urgency);
    setActionResponder(report.assignedResponder || "");
    setRejectionReason(report.rejectionReason || "");
    setInternalNote("");
    setPublicMessage("");
    setModalOpen(true);
  };

  const handleSaveAction = async () => {
    if (!selectedReport) return;
    setSavingAction(true);

    try {
      const payload: {
        status: string;
        categoryCode: string;
        urgency: string;
        assignedResponder: string;
        internalComment: string;
        publicNotificationMessage: string;
        rejectionReason?: string;
      } = {
        status: actionStatus,
        categoryCode: actionCategory,
        urgency: actionUrgency,
        assignedResponder: actionResponder,
        internalComment: internalNote,
        publicNotificationMessage: publicMessage,
      };

      if (actionStatus === "rejected") {
        if (!rejectionReason.trim()) {
          alert("Please provide a documented reason for rejecting this report.");
          setSavingAction(false);
          return;
        }
        payload.rejectionReason = rejectionReason;
      }

      const res = await fetch(`/api/admin/reports/${selectedReport.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setModalOpen(false);
        fetchReports();
      } else {
        const err = await res.json();
        alert(err.error || "Failed to update report.");
      }
    } catch {
      alert("Error saving triage action.");
    } finally {
      setSavingAction(false);
    }
  };

  // Metrics calculation
  const total = reports.length;
  const criticalCount = reports.filter((r) => r.urgency === "critical" && r.status !== "resolved").length;
  const underReviewCount = reports.filter((r) => r.status === "submitted" || r.status === "under_review").length;
  const resolvedCount = reports.filter((r) => r.status === "resolved").length;

  // Filter application
  const filteredReports = reports.filter((r) => {
    const matchesSearch =
      r.referenceNumber.toLowerCase().includes(search.toLowerCase()) ||
      r.originalMessage.toLowerCase().includes(search.toLowerCase()) ||
      (r.locationName && r.locationName.toLowerCase().includes(search.toLowerCase())) ||
      (r.user?.fullName && r.user.fullName.toLowerCase().includes(search.toLowerCase()));

    const matchesStatus = statusFilter === "all" || r.status === statusFilter;
    const matchesUrgency = urgencyFilter === "all" || r.urgency === urgencyFilter;
    const matchesCategory = categoryFilter === "all" || r.category?.code === categoryFilter;

    return matchesSearch && matchesStatus && matchesUrgency && matchesCategory;
  });

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600">Incident Command Operations</span>
          <h1 className="text-2xl font-extrabold text-[#10243A] mt-1">Live Emergency Triage Queue</h1>
          <p className="text-xs text-slate-500">
            Incoming reports automatically categorized and prioritized for operator review
          </p>
        </div>
        <button
          onClick={fetchReports}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl text-xs font-bold text-slate-700 shadow-2xs self-start sm:self-auto"
        >
          <Activity className="w-3.5 h-3.5 text-blue-600" />
          <span>Refresh Queue</span>
        </button>
      </div>

      {/* METRICS CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-[#E5EAF0] shadow-2xs">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Total Incidents</span>
            <Activity className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-3xl font-black text-[#10243A]">{loading ? "..." : total}</div>
          <span className="text-[11px] text-slate-400">All registered reports</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-red-200 bg-red-50/20 shadow-2xs">
          <div className="flex items-center justify-between text-red-500 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-red-700">Critical Priority (P1)</span>
            <AlertCircle className="w-4 h-4 text-red-600" />
          </div>
          <div className="text-3xl font-black text-red-600">{loading ? "..." : criticalCount}</div>
          <span className="text-[11px] text-red-600/80">Active life-safety threats</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-amber-200 bg-amber-50/20 shadow-2xs">
          <div className="flex items-center justify-between text-amber-500 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700">Under Review</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-3xl font-black text-amber-600">{loading ? "..." : underReviewCount}</div>
          <span className="text-[11px] text-amber-600/80">Awaiting dispatcher action</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-emerald-200 bg-emerald-50/20 shadow-2xs">
          <div className="flex items-center justify-between text-emerald-500 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">Resolved Today</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-3xl font-black text-emerald-600">{loading ? "..." : resolvedCount}</div>
          <span className="text-[11px] text-emerald-600/80">Completed operations</span>
        </div>
      </div>

      {/* FILTER & SEARCH MATRIX */}
      <div className="bg-white p-4 rounded-2xl border border-[#E5EAF0] shadow-2xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search reference ID, citizen, description..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="text-xs px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 font-medium"
          >
            <option value="all">All Domains</option>
            <option value="medical">Medical</option>
            <option value="fire">Fire & Rescue</option>
            <option value="accident">Road Accident</option>
            <option value="security">Security</option>
            <option value="flood">Flood</option>
            <option value="other">Other</option>
          </select>

          <select
            value={urgencyFilter}
            onChange={(e) => setUrgencyFilter(e.target.value)}
            className="text-xs px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 font-medium"
          >
            <option value="all">All Urgencies</option>
            <option value="critical">Critical (P1)</option>
            <option value="high">High (P2)</option>
            <option value="moderate">Moderate (P3)</option>
            <option value="low">Low (P4)</option>
          </select>

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
        </div>
      </div>

      {/* INCIDENT TRIAGE TABLE */}
      <div className="bg-white rounded-2xl border border-[#E5EAF0] shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-sm text-slate-400">Loading live triage stream...</div>
        ) : filteredReports.length === 0 ? (
          <div className="p-12 text-center text-sm text-slate-400">No emergency reports found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#10243A] text-white text-[11px] uppercase tracking-wider font-bold">
                <tr>
                  <th className="px-5 py-3.5">Ref ID</th>
                  <th className="px-5 py-3.5">Urgency</th>
                  <th className="px-5 py-3.5">Category</th>
                  <th className="px-5 py-3.5">Incident Description & Key Details</th>
                  <th className="px-5 py-3.5">Location</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Triage Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5EAF0]">
                {filteredReports.map((r) => (
                  <tr
                    key={r.id}
                    className={`hover:bg-slate-50 transition-colors ${
                      r.urgency === "critical" && r.status !== "resolved" ? "bg-red-50/30" : ""
                    }`}
                  >
                    <td className="px-5 py-4 font-mono font-bold text-xs text-[#10243A] whitespace-nowrap">
                      {r.referenceNumber}
                      <span className="block text-[10px] text-slate-400 font-normal">
                        {new Date(r.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-black uppercase ${
                          r.urgency === "critical"
                            ? "bg-red-600 text-white animate-pulse"
                            : r.urgency === "high"
                            ? "bg-orange-500 text-white"
                            : r.urgency === "moderate"
                            ? "bg-amber-100 text-amber-800"
                            : "bg-green-100 text-green-800"
                        }`}
                      >
                        {r.urgency}
                      </span>
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap">
                      <span className="font-bold text-xs text-[#10243A]">
                        {r.category?.name || "Incident"}
                      </span>
                      {r.nlpAnalysis?.confidenceScore && (
                        <span className="block text-[10px] text-slate-400">
                          Confidence: {Math.round(r.nlpAnalysis.confidenceScore * 100)}%
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-4 max-w-sm">
                      <p className="text-xs text-slate-800 line-clamp-2 italic mb-1.5">
                        &ldquo;{r.originalMessage}&rdquo;
                      </p>
                      {/* Entity Chips */}
                      {r.nlpAnalysis?.extractedEntities && (
                        <div className="flex flex-wrap gap-1">
                          {r.nlpAnalysis.extractedEntities.casualties && (
                            <span className="text-[10px] bg-red-100 text-red-800 px-1.5 py-0.5 rounded font-semibold">
                              Casualty: {r.nlpAnalysis.extractedEntities.casualties}
                            </span>
                          )}
                          {r.nlpAnalysis.extractedEntities.hazards && (
                            <span className="text-[10px] bg-orange-100 text-orange-800 px-1.5 py-0.5 rounded font-semibold">
                              Hazard: {r.nlpAnalysis.extractedEntities.hazards}
                            </span>
                          )}
                        </div>
                      )}
                    </td>
                    <td className="px-5 py-4 text-xs text-slate-600 truncate max-w-[160px]">
                      {r.locationName || "Pending"}
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap">
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
                    <td className="px-5 py-4 text-right whitespace-nowrap">
                      <button
                        onClick={() => openTriageModal(r)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#10243A] hover:bg-[#2563EB] text-white text-xs font-bold rounded-lg shadow-2xs transition-colors"
                      >
                        <span>Triage & Action</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* TRIAGE ACTION MODAL / DRAWER */}
      {modalOpen && selectedReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in-50">
            {/* Modal Header */}
            <div className="bg-[#10243A] text-white px-6 py-4 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-mono text-blue-400">DISPATCHER TRIAGE CONSOLE</span>
                <h3 className="font-bold text-base">Incident #{selectedReport.referenceNumber}</h3>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5 overflow-y-auto flex-1">
              {/* Original User Message */}
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-1">
                  Citizen Distress Description:
                </span>
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-800 italic">
                  &ldquo;{selectedReport.originalMessage}&rdquo;
                </div>
                <div className="mt-1.5 flex items-center gap-3 text-xs text-slate-500">
                  <span>Location: <strong>{selectedReport.locationName}</strong></span>
                  <span>Citizen: <strong>{selectedReport.user?.fullName || "Anonymous"}</strong></span>
                </div>
              </div>

              {/* Automated Assessment */}
              <div className="bg-blue-50/60 border border-blue-200 rounded-xl p-4 text-xs space-y-1.5">
                <div className="flex items-center justify-between text-blue-900 font-bold mb-1">
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                    <span>Automated Incident Assessment</span>
                  </div>
                  <span>Confidence: {Math.round((selectedReport.nlpAnalysis?.confidenceScore || 0.9) * 100)}%</span>
                </div>
                <div>
                  <strong>Extracted Category:</strong> {selectedReport.nlpAnalysis?.detectedCategoryName || selectedReport.category?.name}
                </div>
                {selectedReport.nlpAnalysis?.extractedEntities?.casualties && (
                  <div className="text-red-700 font-semibold">
                    <strong>Casualties:</strong> {selectedReport.nlpAnalysis.extractedEntities.casualties}
                  </div>
                )}
                {selectedReport.nlpAnalysis?.extractedEntities?.hazards && (
                  <div className="text-orange-700 font-semibold">
                    <strong>Active Hazards:</strong> {selectedReport.nlpAnalysis.extractedEntities.hazards}
                  </div>
                )}
                {selectedReport.nlpAnalysis?.extractedEntities?.actionRecommendation && (
                  <div className="text-slate-600">
                    <strong>Recommended Action:</strong> {selectedReport.nlpAnalysis.extractedEntities.actionRecommendation}
                  </div>
                )}
              </div>

              {/* Triage Decision Controls */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-200">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Update Incident Status:
                  </label>
                  <select
                    value={actionStatus}
                    onChange={(e) => setActionStatus(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-lg border border-slate-300 font-bold text-slate-800 bg-white"
                  >
                    <option value="submitted">Submitted (New)</option>
                    <option value="under_review">Under Review</option>
                    <option value="confirmed">Confirmed (Verified)</option>
                    <option value="assigned">Assigned (Unit En Route)</option>
                    <option value="resolved">Resolved (Completed)</option>
                    <option value="rejected">Rejected (False Alarm / Duplicate)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Override Category:
                  </label>
                  <select
                    value={actionCategory}
                    onChange={(e) => setActionCategory(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-lg border border-slate-300 font-semibold text-slate-800 bg-white"
                  >
                    <option value="medical">Medical Emergency</option>
                    <option value="fire">Fire & Rescue</option>
                    <option value="accident">Road Traffic Accident</option>
                    <option value="security">Public Safety & Security</option>
                    <option value="flood">Natural Hazard & Flood</option>
                    <option value="other">Other Urgent Incident</option>
                    <option value="inquiry">General Inquiry</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Urgency Triage:
                  </label>
                  <select
                    value={actionUrgency}
                    onChange={(e) => setActionUrgency(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-lg border border-slate-300 font-semibold text-slate-800 bg-white"
                  >
                    <option value="critical">Critical (P1)</option>
                    <option value="high">High (P2)</option>
                    <option value="moderate">Moderate (P3)</option>
                    <option value="low">Low (P4)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Assign Emergency Unit:
                  </label>
                  <input
                    type="text"
                    value={actionResponder}
                    onChange={(e) => setActionResponder(e.target.value)}
                    placeholder="e.g. Station 4 Ladder Truck, ALS Medic 2"
                    className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-[#2563EB]"
                  />
                </div>
              </div>

              {/* Rejection Reason if Rejected */}
              {actionStatus === "rejected" && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl space-y-1">
                  <label className="block text-xs font-bold text-red-800 uppercase tracking-wider">
                    Documented Reason for Rejection (Required):
                  </label>
                  <input
                    type="text"
                    required
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="e.g. Verified duplicate report of incident #EC-2026-1042"
                    className="w-full text-xs p-2.5 rounded-lg border border-red-300 bg-white text-slate-800"
                  />
                  <span className="text-[10px] text-red-600 block">
                    AI classification alone cannot reject a report. Human documentation required.
                  </span>
                </div>
              )}

              {/* Dispatcher Notes & Citizen Notification */}
              <div className="space-y-3 pt-2 border-t border-slate-200">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Message to Reporting Citizen:
                  </label>
                  <input
                    type="text"
                    value={publicMessage}
                    onChange={(e) => setPublicMessage(e.target.value)}
                    placeholder="e.g. 'Paramedic unit has arrived on site. Stay clear of the roadway.'"
                    className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-[#2563EB]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Internal Dispatcher Log Note:
                  </label>
                  <input
                    type="text"
                    value={internalNote}
                    onChange={(e) => setInternalNote(e.target.value)}
                    placeholder="e.g. 'Coordinating with municipal traffic gridlock control.'"
                    className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-[#2563EB]"
                  />
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
              <Link
                href={`/dashboard/reports/${selectedReport.id}`}
                target="_blank"
                className="text-xs font-bold text-blue-600 hover:underline inline-flex items-center gap-1"
              >
                <span>View Full Public Dossier</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-200 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveAction}
                  disabled={savingAction}
                  className="inline-flex items-center gap-1.5 px-5 py-2 bg-[#10243A] hover:bg-[#2563EB] disabled:opacity-50 text-white text-xs font-bold rounded-lg shadow-sm transition-all"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{savingAction ? "Saving..." : "Commit Dispatch Action"}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
