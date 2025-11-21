
import React, { useState } from "react";
import { SignIn, SignUp } from "@clerk/clerk-react";
import Navbar from "@/components/layout/Navbar";
import { useTitle } from "@/hooks/use-title";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User, Stethoscope } from "lucide-react";

const AuthPage = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [userRole, setUserRole] = useState<"patient" | "doctor">("patient");
  
  useTitle(isSignUp ? "Create an Account - Medical Universe" : "Log in to your Account - Medical Universe");

  return (
    <div className="min-h-screen bg-[#f5f9ff]">
      <Navbar />
      <div className="container mx-auto px-4 py-32">
        <Card className="max-w-4xl mx-auto bg-white shadow-lg rounded-xl overflow-hidden">
          <CardContent className="p-0">
            <div className="grid md:grid-cols-2">
              <div className="p-8">
                {/* Role Selection */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-4">Select Your Role</h3>
                  <div className="flex space-x-4">
                    <Button
                      variant={userRole === "patient" ? "default" : "outline"}
                      onClick={() => setUserRole("patient")}
                      className="flex-1"
                    >
                      <User className="h-4 w-4 mr-2" />
                      Patient
                    </Button>
                    <Button
                      variant={userRole === "doctor" ? "default" : "outline"}
                      onClick={() => setUserRole("doctor")}
                      className="flex-1"
                    >
                      <Stethoscope className="h-4 w-4 mr-2" />
                      Doctor
                    </Button>
                  </div>
                </div>

                {/* Auth Toggle */}
                <div className="flex space-x-2 mb-6">
                  <Button
                    variant={!isSignUp ? "default" : "outline"}
                    onClick={() => setIsSignUp(false)}
                    className="flex-1"
                  >
                    Sign In
                  </Button>
                  <Button
                    variant={isSignUp ? "default" : "outline"}
                    onClick={() => setIsSignUp(true)}
                    className="flex-1"
                  >
                    Sign Up
                  </Button>
                </div>

                {/* Clerk Components */}
                <div className="flex justify-center">
                  {isSignUp ? (
                    <SignUp 
                      afterSignUpUrl={userRole === "doctor" ? "/doctor-dashboard" : "/patient-dashboard"}
                      unsafeMetadata={{ role: userRole }}
                      redirectUrl={userRole === "doctor" ? "/doctor-dashboard" : "/patient-dashboard"}
                    />
                  ) : (
                    <SignIn 
                      afterSignInUrl="/"
                      redirectUrl="/"
                    />
                  )}
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-blue-500 to-blue-700 p-8 text-white flex flex-col justify-center md:block hidden">
                <h2 className="text-2xl font-bold mb-6">Welcome to Medical Universe</h2>
                <p className="mb-6">Your comprehensive healthcare solution that connects patients with doctors and provides AI-powered health assistance.</p>
                
                <div className="space-y-4 mt-8">
                  <div className="flex items-start">
                    <User className="h-6 w-6 mr-3 mt-1" />
                    <div>
                      <h3 className="font-semibold mb-1">For Patients</h3>
                      <p className="text-sm text-blue-100">Find doctors, book appointments, and access your medical records.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <Stethoscope className="h-6 w-6 mr-3 mt-1" />
                    <div>
                      <h3 className="font-semibold mb-1">For Doctors</h3>
                      <p className="text-sm text-blue-100">Manage appointments, patient records, and grow your practice.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AuthPage;
