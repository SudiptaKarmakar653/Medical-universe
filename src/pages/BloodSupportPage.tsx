
import React, { useState } from "react";
import { useTitle } from "@/hooks/use-title";
import Navbar from "@/components/layout/Navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, ShoppingCart, Users, FileText } from "lucide-react";
import BloodRequestForm from "@/components/blood/BloodRequestForm";
import BloodDonorForm from "@/components/blood/BloodDonorForm";
import AvailableDonors from "@/components/blood/AvailableDonors";
import ApprovedBloodReceipts from "@/components/blood/ApprovedBloodReceipts";

const BloodSupportPage = () => {
  useTitle("Blood Support - Medical Universe");
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [showDonorForm, setShowDonorForm] = useState(false);
  const [showReceipts, setShowReceipts] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <Navbar />
      
      <div className="pt-28 pb-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Blood <span className="bg-gradient-to-r from-red-500 to-red-600 bg-clip-text text-transparent">Support</span>
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Connect blood donors with those in need. Save lives through our secure blood support system.
            </p>
          </div>

          {!showRequestForm && !showDonorForm && !showReceipts && (
            <>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto mb-16">
                {/* Buy Blood Card */}
                <Card className="border-0 shadow-xl hover:shadow-2xl transition-all hover:-translate-y-2 bg-gradient-to-br from-red-50 to-red-100">
                  <CardHeader className="text-center pb-4">
                    <div className="mx-auto w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center mb-4">
                      <ShoppingCart className="h-8 w-8 text-white" />
                    </div>
                    <CardTitle className="text-2xl font-bold text-gray-900">Request Blood</CardTitle>
                    <CardDescription className="text-gray-600">
                      Request blood for emergency medical needs. Get connected with verified donors.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="text-center">
                    <Button 
                      onClick={() => setShowRequestForm(true)}
                      className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold py-3 rounded-full"
                    >
                      Request Blood
                    </Button>
                  </CardContent>
                </Card>

                {/* Donate Blood Card */}
                <Card className="border-0 shadow-xl hover:shadow-2xl transition-all hover:-translate-y-2 bg-gradient-to-br from-green-50 to-green-100">
                  <CardHeader className="text-center pb-4">
                    <div className="mx-auto w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mb-4">
                      <Heart className="h-8 w-8 text-white" />
                    </div>
                    <CardTitle className="text-2xl font-bold text-gray-900">Donate Blood</CardTitle>
                    <CardDescription className="text-gray-600">
                      Become a life saver by donating blood. Join our community of verified donors.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="text-center">
                    <Button 
                      onClick={() => setShowDonorForm(true)}
                      className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold py-3 rounded-full"
                    >
                      Become a Donor
                    </Button>
                  </CardContent>
                </Card>

                {/* View Receipts Card */}
                <Card className="border-0 shadow-xl hover:shadow-2xl transition-all hover:-translate-y-2 bg-gradient-to-br from-blue-50 to-blue-100">
                  <CardHeader className="text-center pb-4">
                    <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mb-4">
                      <FileText className="h-8 w-8 text-white" />
                    </div>
                    <CardTitle className="text-2xl font-bold text-gray-900">View Receipts</CardTitle>
                    <CardDescription className="text-gray-600">
                      Check approved blood request receipts and delivery confirmations.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="text-center">
                    <Button 
                      onClick={() => setShowReceipts(true)}
                      className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-3 rounded-full"
                    >
                      View Receipts
                    </Button>
                  </CardContent>
                </Card>
              </div>

              {/* Available Donors Section */}
              <AvailableDonors />
            </>
          )}

          {/* Forms and Receipts */}
          {showRequestForm && (
            <BloodRequestForm onClose={() => setShowRequestForm(false)} />
          )}

          {showDonorForm && (
            <BloodDonorForm onClose={() => setShowDonorForm(false)} />
          )}

          {showReceipts && (
            <div>
              <Button 
                onClick={() => setShowReceipts(false)}
                className="mb-6 bg-gray-500 hover:bg-gray-600 text-white"
              >
                ← Back to Blood Support
              </Button>
              <ApprovedBloodReceipts />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BloodSupportPage;
