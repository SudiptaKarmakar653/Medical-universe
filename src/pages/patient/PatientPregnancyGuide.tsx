
import React from "react";
import Navbar from "@/components/layout/Navbar";
import Sidebar from "@/components/layout/Sidebar";
import { useTitle } from "@/hooks/use-title";
import AIPregnancyCompanion from "@/components/pregnancy/AIPregnancyCompanion";

const PatientPregnancyGuide = () => {
  useTitle("AI Pregnancy Guide - Medical Universe");

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar userRole="patient" />
      
      <div className="flex-1 flex">
        <Sidebar userRole="patient" className="hidden lg:block" />
        
        <main className="flex-1 p-6">
          <div className="my-[70px] max-w-7xl mx-auto">
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-900">🤰 AI Pregnancy Guide</h1>
              <p className="text-gray-600 mt-2">
                Your personalized pregnancy journey with AI guidance, yoga, and 24/7 support
              </p>
            </div>
            
            <AIPregnancyCompanion />
          </div>
        </main>
      </div>
    </div>
  );
};

export default PatientPregnancyGuide;
