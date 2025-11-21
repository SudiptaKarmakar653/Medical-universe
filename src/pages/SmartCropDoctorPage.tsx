import React from 'react';
import { useTitle } from "@/hooks/use-title";
import PageLayout from '@/components/layout/PageLayout';
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import CropHealthSystem from '@/components/lifecircle/CropHealthSystem';

const SmartCropDoctorPage = () => {
  useTitle("Smart Crop Doctor - Life Circle Connect");
  const navigate = useNavigate();

  return (
    <PageLayout>
      <div className="min-h-screen bg-gradient-to-br from-lime-50 via-green-50 to-emerald-50 py-8">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="mb-6">
            <Button
              variant="ghost"
              onClick={() => navigate('/life-circle-connect')}
              className="mb-4 hover:bg-lime-100"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Life Circle Connect
            </Button>
            <div className="bg-gradient-to-r from-lime-600 to-green-600 rounded-2xl p-8 text-white shadow-xl">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                🌾 Smart Crop Doctor
              </h1>
              <p className="text-lg opacity-90 max-w-3xl">
                Advanced AI diagnostics for your crops. Detect diseases instantly, 
                get treatment recommendations, and monitor weather conditions for optimal farming.
              </p>
            </div>
          </div>

          {/* Main Content */}
          <CropHealthSystem />
        </div>
      </div>
    </PageLayout>
  );
};

export default SmartCropDoctorPage;
