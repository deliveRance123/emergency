import React from "react";
import { Navbar } from "@/components/ui/navbar";
import { Footer } from "@/components/ui/footer";

export default function PrivacyPage() {
  return (
    <div className="flex flex-col min-h-screen bg-[#F7F9FC]">
      <Navbar />
      <main className="flex-1 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto bg-white rounded-2xl border border-[#E5EAF0] p-8 sm:p-10 space-y-6 shadow-sm">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#10243A]">Privacy Policy</h1>
          <p className="text-sm text-slate-600 leading-relaxed">
            EmergencyConnect collects only the information needed to demonstrate incident reporting, message analysis, and status tracking.
          </p>
          <div className="space-y-4 text-sm text-slate-600 leading-relaxed">
            <div>
              <h2 className="font-bold text-[#10243A] mb-1">1. Account Information</h2>
              <p>Your name, email address, and optional contact number are used solely to associate your submitted reports with your account and deliver status notifications.</p>
            </div>
            <div>
              <h2 className="font-bold text-[#10243A] mb-1">2. Incident Reports</h2>
              <p>Incident descriptions and location details submitted through the reporting form are visible only to you and authorized administrative coordinators.</p>
            </div>
            <div>
              <h2 className="font-bold text-[#10243A] mb-1">3. Academic Use</h2>
              <p>This platform is an academic prototype. Please do not enter sensitive personal medical records or confidential real-world information.</p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
