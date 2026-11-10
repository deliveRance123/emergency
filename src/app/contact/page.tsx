"use client";

import React, { useState } from "react";
import { Navbar } from "@/components/ui/navbar";
import { Footer } from "@/components/ui/footer";
import { Mail, MapPin, CheckCircle2, Send } from "lucide-react";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) return;
    setSubmitted(true);
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#F7F9FC]">
      <Navbar />

      <main className="flex-1 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-5 gap-8">
          <div className="md:col-span-2 space-y-5">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#2563EB]">
                Get in Touch
              </span>
              <h1 className="text-3xl font-extrabold text-[#10243A] mt-1">
                Contact Us
              </h1>
              <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                Have questions about the EmergencyConnect academic project or feedback on the platform? Send us a message.
              </p>
            </div>

            <div className="space-y-3 text-sm text-slate-600 pt-2">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-white border border-[#E5EAF0] flex items-center justify-center text-[#2563EB]">
                  <Mail className="w-4 h-4" />
                </div>
                <span>support@emergencyconnect.org</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-white border border-[#E5EAF0] flex items-center justify-center text-[#2563EB]">
                  <MapPin className="w-4 h-4" />
                </div>
                <span>Academic Research Lab</span>
              </div>
            </div>
          </div>

          <div className="md:col-span-3 bg-white p-6 sm:p-8 rounded-2xl border border-[#E5EAF0] shadow-sm">
            {submitted ? (
              <div className="py-10 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 mx-auto flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h2 className="text-lg font-bold text-[#10243A]">Message Received</h2>
                <p className="text-sm text-slate-600 max-w-sm mx-auto">
                  Thank you for reaching out. Your inquiry has been logged for review.
                </p>
                <button
                  onClick={() => {
                    setSubmitted(false);
                    setName("");
                    setEmail("");
                    setMessage("");
                  }}
                  className="text-xs font-semibold text-[#2563EB] hover:underline pt-2"
                >
                  Send another message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Your Name
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Jane Doe"
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="jane@example.com"
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Message
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Write your question or feedback..."
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#2563EB] resize-none"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-5 bg-[#10243A] hover:bg-[#2563EB] text-white text-sm font-bold rounded-xl transition-colors"
                >
                  <Send className="w-4 h-4" />
                  <span>Send Message</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
