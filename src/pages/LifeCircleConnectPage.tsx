import React from 'react';
import { useTitle } from "@/hooks/use-title";
import PageLayout from '@/components/layout/PageLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dog, Bird, Sprout, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

const LifeCircleConnectPage = () => {
  useTitle("Life Circle Connect - Smart Health for Pets, Livestock & Crops");
  const navigate = useNavigate();

  const dashboards = [
    {
      id: 'pet',
      title: 'Smart Pet Health',
      description: 'AI-powered health diagnostics and care recommendations for your beloved pets',
      icon: Dog,
      color: 'from-cyan-500 to-blue-600',
      bgColor: 'bg-gradient-to-br from-cyan-50 to-blue-100',
      hoverColor: 'hover:from-cyan-600 hover:to-blue-700',
      route: '/smart-pet-health',
      emoji: '🐾'
    },
    {
      id: 'livestock',
      title: 'Livestock Monitor',
      description: 'Smart monitoring for farming animals with disease prediction and feed optimization',
      icon: Bird,
      color: 'from-green-500 to-emerald-600',
      bgColor: 'bg-gradient-to-br from-green-50 to-emerald-100',
      hoverColor: 'hover:from-green-600 hover:to-emerald-700',
      route: '/livestock-monitor',
      emoji: '🐄'
    },
    {
      id: 'crop',
      title: 'Smart Crop Doctor',
      description: 'Advanced crop disease detection with treatment recommendations and weather insights',
      icon: Sprout,
      color: 'from-lime-500 to-green-600',
      bgColor: 'bg-gradient-to-br from-lime-50 to-green-100',
      hoverColor: 'hover:from-lime-600 hover:to-green-700',
      route: '/smart-crop-doctor',
      emoji: '🌾'
    }
  ];

  return (
    <PageLayout>
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 py-12">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-green-600 via-teal-600 to-blue-600 bg-clip-text text-transparent">
              Life Circle Connect
            </h1>
            <p className="text-xl text-gray-700 max-w-3xl mx-auto leading-relaxed">
              AI-powered health monitoring for your pets, livestock, and crops. 
              Get instant diagnoses, treatment advice, and smart care recommendations.
            </p>
          </div>

          {/* Dashboard Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {dashboards.map((dashboard) => {
              const Icon = dashboard.icon;
              return (
                <Card
                  key={dashboard.id}
                  className={`${dashboard.bgColor} border-0 shadow-xl hover:shadow-2xl transition-all duration-300 cursor-pointer transform hover:-translate-y-2`}
                  onClick={() => navigate(dashboard.route)}
                >
                  <CardHeader className="text-center pb-4">
                    <div className="flex justify-center mb-4">
                      <div className={`w-20 h-20 rounded-full bg-gradient-to-br ${dashboard.color} flex items-center justify-center shadow-lg`}>
                        <Icon className="h-10 w-10 text-white" />
                      </div>
                    </div>
                    <CardTitle className="text-2xl mb-2 flex items-center justify-center gap-2">
                      <span>{dashboard.emoji}</span>
                      {dashboard.title}
                    </CardTitle>
                    <CardDescription className="text-base text-gray-700">
                      {dashboard.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="text-center pb-6">
                    <button
                      className={`inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r ${dashboard.color} ${dashboard.hoverColor} text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-300`}
                    >
                      Open Dashboard
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Features Section */}
          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <Card className="bg-white/80 backdrop-blur border-2 border-cyan-200">
              <CardContent className="p-6 text-center">
                <div className="text-4xl mb-3">🔬</div>
                <h3 className="font-bold text-lg mb-2">AI-Powered Analysis</h3>
                <p className="text-sm text-gray-600">Advanced machine learning for accurate health diagnostics</p>
              </CardContent>
            </Card>
            <Card className="bg-white/80 backdrop-blur border-2 border-green-200">
              <CardContent className="p-6 text-center">
                <div className="text-4xl mb-3">⚡</div>
                <h3 className="font-bold text-lg mb-2">Instant Results</h3>
                <p className="text-sm text-gray-600">Get immediate diagnoses and treatment recommendations</p>
              </CardContent>
            </Card>
            <Card className="bg-white/80 backdrop-blur border-2 border-lime-200">
              <CardContent className="p-6 text-center">
                <div className="text-4xl mb-3">📊</div>
                <h3 className="font-bold text-lg mb-2">Smart Insights</h3>
                <p className="text-sm text-gray-600">Data-driven recommendations for optimal care</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default LifeCircleConnectPage;
