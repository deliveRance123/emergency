import React from "react";
import { AlertTriangle, PhoneCall } from "lucide-react";

export function DisclaimerBanner() {
  return (
    <div className="bg-[#10243A] text-white border-b border-[#1E3A5F] px-4 py-2.5 text-xs sm:text-sm">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-slate-200 text-center sm:text-left">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
          <span>
            <strong className="text-white font-medium">Academic Research Prototype:</strong> EmergencyConnect is a demonstration platform for NLP emergency communications. It does <strong className="text-amber-300">not</strong> dispatch real emergency services.
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-amber-300 font-semibold shrink-0">
          <PhoneCall className="w-3.5 h-3.5" />
          <span>In active emergencies, dial 911 / 112 / 999</span>
        </div>
      </div>
    </div>
  );
}
