import React from 'react';
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ClerkProvider } from "@clerk/clerk-react";
import { AuthProvider } from "@/context/auth-provider";
import FloatingChatbot from "@/components/chatbot/FloatingChatbot";
import Index from "./pages/Index";
import AuthPage from "./pages/AuthPage";
import AdminLoginPage from "./pages/AdminLoginPage";
import AdminDashboard from "./pages/AdminDashboard";
import MedicineAdminLoginPage from "./pages/MedicineAdminLoginPage";
import MedicineAdminDashboard from "./pages/MedicineAdminDashboard";
import MedicineStorePage from "./pages/MedicineStorePage";
import CartPage from "./pages/CartPage";
import CheckoutPage from "./pages/CheckoutPage";
import OrdersPage from "./pages/OrdersPage";
import OrderConfirmationPage from "./pages/OrderConfirmationPage";
import PatientDashboard from "./pages/PatientDashboard";
import DoctorDashboard from "./pages/DoctorDashboard";
import DoctorsPage from "./pages/DoctorsPage";
import ServicesPage from "./pages/ServicesPage";
import ContactPage from "./pages/ContactPage";
import HelpPage from "./pages/HelpPage";
import HealthAssistantPage from "./pages/HealthAssistantPage";
import HospitalPage from "./pages/HospitalPage";
import PlantIdentifierPage from "./pages/PlantIdentifierPage";
import AdminProtection from "./components/AdminProtection";
import AdminDoctorRequests from "./pages/admin/AdminDoctorRequests";
import AdminDoctorVerificationRequests from "./pages/admin/AdminDoctorVerificationRequests";
import PatientAppointments from "./pages/patient/PatientAppointments";
import PatientPrescriptions from "./pages/patient/PatientPrescriptions";
import PatientFindDoctors from "./pages/patient/PatientFindDoctors";
import PatientOrders from "./pages/patient/PatientOrders";
import PatientYoga from "./pages/patient/PatientYoga";
import PatientArticles from "./pages/patient/PatientArticles";
import PatientPregnancyGuide from "./pages/patient/PatientPregnancyGuide";
import PatientRecoveryJourney from "./pages/patient/PatientRecoveryJourney";
import PatientHospitalBookings from "./pages/patient/PatientHospitalBookings";
import PatientSkinAnalyzer from "./pages/patient/PatientSkinAnalyzer";
import AdminMedicineManagement from "./pages/AdminMedicineManagement";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminSettings from "./pages/admin/AdminSettings";
import AdminContentManagement from "./pages/admin/AdminContentManagement";
import AdminAlerts from "./pages/admin/AdminAlerts";
import AdminSupport from "./pages/admin/AdminSupport";
import AdminApprovedDoctors from "./pages/admin/AdminApprovedDoctors";
import DoctorAppointments from "./pages/doctor/DoctorAppointments";
import DoctorPatients from "./pages/doctor/DoctorPatients";
import DoctorPastPatients from "./pages/doctor/DoctorPastPatients";
import DoctorPrescriptions from "./pages/doctor/DoctorPrescriptions";
import DoctorSchedule from "./pages/doctor/DoctorSchedule";
import AdminHospitalManagement from "./pages/admin/AdminHospitalManagement";
import LungSoundAnalyzer from "@/components/doctor/LungSoundAnalyzer";
import BloodSupportPage from "./pages/BloodSupportPage";
import AdminBloodManagement from "./pages/admin/AdminBloodManagement";
import LifeCircleConnectPage from "./pages/LifeCircleConnectPage";
import SmartPetHealthPage from "./pages/SmartPetHealthPage";
import LivestockMonitorPage from "./pages/LivestockMonitorPage";
import SmartCropDoctorPage from "./pages/SmartCropDoctorPage";

const queryClient = new QueryClient();

const PUBLISHABLE_KEY = "pk_test_Zml0LXR1cnRsZS00Mi5jbGVyay5hY2NvdW50cy5kZXYk";

if (!PUBLISHABLE_KEY) {
  throw new Error("Missing Publishable Key");
}

const App = () => (
  <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
    <AuthProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<AuthPage />} />
              <Route path="/admin-login" element={<AdminLoginPage />} />
              
              {/* Blood Support Route */}
              <Route path="/blood-support" element={<BloodSupportPage />} />
              
              {/* Hospital Route */}
              <Route path="/hospital" element={<HospitalPage />} />
              
              {/* Plant Identifier Route */}
              <Route path="/plant-identifier" element={<PlantIdentifierPage />} />
              
              {/* Life Circle Connect Routes */}
              <Route path="/life-circle-connect" element={<LifeCircleConnectPage />} />
              <Route path="/smart-pet-health" element={<SmartPetHealthPage />} />
              <Route path="/livestock-monitor" element={<LivestockMonitorPage />} />
              <Route path="/smart-crop-doctor" element={<SmartCropDoctorPage />} />
              
              {/* Admin Dashboard Routes - All protected */}
              <Route path="/admin-dashboard" element={
                <AdminProtection>
                  <AdminDashboard />
                </AdminProtection>
              } />

              <Route path="/admin/blood-management" element={
                <AdminProtection>
                  <AdminBloodManagement />
                </AdminProtection>
              } />
              
              <Route path="/admin/hospital-management" element={
                <AdminProtection>
                  <AdminHospitalManagement />
                </AdminProtection>
              } />
              
              <Route path="/admin-dashboard/users" element={
                <AdminProtection>
                  <AdminUsers />
                </AdminProtection>
              } />
              
              <Route path="/admin-dashboard/settings" element={
                <AdminProtection>
                  <AdminSettings />
                </AdminProtection>
              } />
              
              <Route path="/admin-dashboard/content" element={
                <AdminProtection>
                  <AdminContentManagement />
                </AdminProtection>
              } />
              
              <Route path="/admin-dashboard/alerts" element={
                <AdminProtection>
                  <AdminAlerts />
                </AdminProtection>
              } />
              
              <Route path="/admin-dashboard/support" element={
                <AdminProtection>
                  <AdminSupport />
                </AdminProtection>
              } />
              
              <Route path="/admin-dashboard/requests" element={
                <AdminProtection>
                  <AdminDoctorRequests />
                </AdminProtection>
              } />
              <Route path="/admin-dashboard/doctor-verification" element={
                <AdminProtection>
                  <AdminDoctorVerificationRequests />
                </AdminProtection>
              } />
              
              <Route path="/admin-dashboard/approved-doctors" element={
                <AdminProtection>
                  <AdminApprovedDoctors />
                </AdminProtection>
              } />
              
              {/* Medicine Management Routes */}
              <Route path="/admin/medicines" element={
                <AdminProtection>
                  <AdminMedicineManagement />
                </AdminProtection>
              } />
              <Route path="/medicine-admin-login" element={<MedicineAdminLoginPage />} />
              <Route path="/admin/dashboard" element={
                <AdminProtection>
                  <MedicineAdminDashboard />
                </AdminProtection>
              } />
              
              {/* Store Routes */}
              <Route path="/medicine-store" element={<MedicineStorePage />} />
              <Route path="/store" element={<MedicineStorePage />} />
              <Route path="/cart" element={<CartPage />} />
              <Route path="/checkout" element={<CheckoutPage />} />
              <Route path="/orders" element={<OrdersPage />} />
              <Route path="/order-confirmation" element={<OrderConfirmationPage />} />
              
              {/* Patient Dashboard Routes */}
              <Route path="/patient-dashboard" element={<PatientDashboard />} />
              <Route path="/patient-dashboard/find-doctors" element={<PatientFindDoctors />} />
              <Route path="/patient-dashboard/appointments" element={<PatientAppointments />} />
              <Route path="/patient-dashboard/hospital-bookings" element={<PatientHospitalBookings />} />
              <Route path="/patient-dashboard/prescriptions" element={<PatientPrescriptions />} />
              <Route path="/patient-dashboard/orders" element={<PatientOrders />} />
              <Route path="/patient-dashboard/yoga" element={<PatientYoga />} />
              <Route path="/patient-dashboard/pregnancy-guide" element={<PatientPregnancyGuide />} />
              <Route path="/patient-dashboard/recovery-journey" element={<PatientRecoveryJourney />} />
              <Route path="/patient-dashboard/skin-analyzer" element={<PatientSkinAnalyzer />} />
              <Route path="/patient-dashboard/articles" element={<PatientArticles />} />
              
              {/* Doctor Dashboard Routes */}
              <Route path="/doctor-dashboard" element={<DoctorDashboard />} />
              <Route path="/doctor-dashboard/appointments" element={<DoctorAppointments />} />
              <Route path="/doctor-dashboard/patients" element={<DoctorPatients />} />
              <Route path="/doctor-dashboard/past-patients" element={<DoctorPastPatients />} />
              <Route path="/doctor-dashboard/prescriptions" element={<DoctorPrescriptions />} />
              <Route path="/doctor-dashboard/schedule" element={<DoctorSchedule />} />
              <Route path="/doctor-dashboard/lung-analyzer" element={
                <div className="min-h-screen bg-gray-50 flex flex-col">
                  <main className="flex-1 p-6">
                    <LungSoundAnalyzer />
                  </main>
                </div>
              } />
              
              {/* Other Routes */}
              <Route path="/doctors" element={<DoctorsPage />} />
              <Route path="/services" element={<ServicesPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/help" element={<HelpPage />} />
              <Route path="/health-assistant" element={<HealthAssistantPage />} />
              
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
            <FloatingChatbot />
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </AuthProvider>
  </ClerkProvider>
);

export default App;
