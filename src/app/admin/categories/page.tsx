"use client";

import React, { useState, useEffect } from "react";
import { CheckCircle2 } from "lucide-react";
import type { CategoryItem } from "@/lib/types";

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/categories")
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        setCategories(data || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-blue-600">Domain Configuration</span>
        <h1 className="text-2xl font-extrabold text-[#10243A] mt-1">Emergency Categories Registry</h1>
        <p className="text-xs text-slate-500">
          Standard operational categories used to organize incoming emergency reports
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="p-8 text-center text-sm text-slate-400 col-span-3">Loading categories...</div>
        ) : (
          categories.map((cat) => (
            <div key={cat.id} className="bg-white p-5 rounded-2xl border border-[#E5EAF0] shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <span
                  className="w-3.5 h-3.5 rounded-full"
                  style={{ backgroundColor: cat.badgeColorHex }}
                ></span>
                <span className="text-[11px] font-mono text-slate-400 bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
                  Code: {cat.code}
                </span>
              </div>
              <div>
                <h3 className="font-bold text-sm text-[#10243A]">{cat.name}</h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">{cat.description}</p>
              </div>
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                <span>Default Priority: Level {cat.priorityLevel}</span>
                <span className="text-emerald-600 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  Active Category
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
