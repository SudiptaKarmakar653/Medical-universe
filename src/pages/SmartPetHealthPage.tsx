import React from 'react';
import { useTitle } from "@/hooks/use-title";
import PageLayout from '@/components/layout/PageLayout';
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import PetHealthSystem from '@/components/lifecircle/PetHealthSystem';

const SmartPetHealthPage = () => {
  useTitle("Smart Pet Health - Life Circle Connect");
  const navigate = useNavigate();

  return (
    <PageLayout>
      <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-blue-50 to-indigo-50 py-8">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="mb-6">
            <Button
              variant="ghost"
              onClick={() => navigate('/life-circle-connect')}
              className="mb-4 hover:bg-cyan-100"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Life Circle Connect
            </Button>
            <div className="bg-gradient-to-r from-cyan-600 to-blue-600 rounded-2xl p-8 text-white shadow-xl">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                🐾 Smart Pet Health
              </h1>
              <p className="text-lg opacity-90 max-w-3xl">
                AI-powered health monitoring for your beloved pets. Get instant diagnoses, 
                treatment advice, and personalized care recommendations using advanced vision AI.
              </p>
            </div>
          </div>

          {/* Main Content */}
          <PetHealthSystem />
        </div>
      </div>
    </PageLayout>
  );
};

export default SmartPetHealthPage;
