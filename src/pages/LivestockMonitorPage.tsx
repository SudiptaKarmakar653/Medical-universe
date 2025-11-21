import React from 'react';
import { useTitle } from "@/hooks/use-title";
import PageLayout from '@/components/layout/PageLayout';
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import LivestockHealthSystem from '@/components/lifecircle/LivestockHealthSystem';

const LivestockMonitorPage = () => {
  useTitle("Livestock Monitor - Life Circle Connect");
  const navigate = useNavigate();

  return (
    <PageLayout>
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 py-8">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="mb-6">
            <Button
              variant="ghost"
              onClick={() => navigate('/life-circle-connect')}
              className="mb-4 hover:bg-green-100"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Life Circle Connect
            </Button>
            <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl p-8 text-white shadow-xl">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                🐄 Livestock Monitor
              </h1>
              <p className="text-lg opacity-90 max-w-3xl">
                Smart health monitoring for your farming animals. Predict diseases early, 
                optimize feed schedules, and manage vaccinations with AI-powered insights.
              </p>
            </div>
          </div>

          {/* Main Content */}
          <LivestockHealthSystem />
        </div>
      </div>
    </PageLayout>
  );
};

export default LivestockMonitorPage;
