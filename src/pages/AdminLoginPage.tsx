import React from "react";
import Navbar from "@/components/layout/Navbar";
import AdminLoginForm from "@/components/AdminLoginForm";
import { useTitle } from "@/hooks/use-title";
import { ShieldAlert } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
const AdminLoginPage = () => {
  useTitle("Admin Login - Medical Universe");
  return <div className="min-h-screen bg-[#f5f9ff]">
      <Navbar />
      <div className="container mx-auto px-4 py-12">
        <Card className="max-w-xl mx-auto bg-white shadow-lg rounded-xl overflow-hidden">
          <CardContent className="p-0">
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-6 text-white text-center my-[50px]">
              <div className="inline-flex mx-auto mb-4 p-3 rounded-full bg-gray-700/50">
                <ShieldAlert className="h-10 w-10 text-white" />
              </div>
              <h1 className="text-2xl font-bold">Admin Access</h1>
              <p className="mt-2 text-gray-300">
                Secure login portal for Medical Universe administrators
              </p>
            </div>

            <div className="p-6">
              <AdminLoginForm />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>;
};
export default AdminLoginPage;