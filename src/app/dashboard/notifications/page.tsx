"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Bell, ExternalLink } from "lucide-react";
import type { NotificationItem } from "@/lib/types";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = () => {
    fetch("/api/notifications")
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        setNotifications(data || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetch("/api/notifications")
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        setNotifications(data || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const markAllAsRead = async () => {
    await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ markAllRead: true }),
    });
    fetchNotifications();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#2563EB]">Communication Alerts</span>
          <h1 className="text-2xl font-extrabold text-[#10243A] mt-1">Notifications Center</h1>
          <p className="text-xs text-slate-500">Live operational updates from emergency response personnel</p>
        </div>
        {notifications.some((n) => !n.isRead) && (
          <button
            onClick={markAllAsRead}
            className="text-xs font-bold text-[#2563EB] hover:underline"
          >
            Mark all as read
          </button>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-[#E5EAF0] shadow-sm divide-y divide-[#E5EAF0]">
        {loading ? (
          <div className="p-12 text-center text-sm text-slate-400">Loading alerts...</div>
        ) : notifications.length === 0 ? (
          <div className="p-12 text-center text-sm text-slate-400 space-y-2">
            <Bell className="w-8 h-8 text-slate-300 mx-auto" />
            <p>You have no new notifications.</p>
          </div>
        ) : (
          notifications.map((n) => (
            <div
              key={n.id}
              className={`p-5 flex items-start justify-between gap-4 transition-colors ${
                n.isRead ? "bg-white" : "bg-blue-50/40"
              }`}
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  {!n.isRead && <span className="w-2 h-2 rounded-full bg-[#2563EB]"></span>}
                  <h3 className="font-bold text-sm text-[#10243A]">{n.title}</h3>
                </div>
                <p className="text-xs text-slate-600">{n.message}</p>
                <span className="text-[10px] text-slate-400 block">
                  {new Date(n.createdAt).toLocaleString()}
                </span>
              </div>

              {n.reportId && (
                <Link
                  href={`/dashboard/reports/${n.reportId}`}
                  className="text-xs font-bold text-[#2563EB] hover:underline shrink-0 inline-flex items-center gap-1"
                >
                  <span>View Dossier</span>
                  <ExternalLink className="w-3 h-3" />
                </Link>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
