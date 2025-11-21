
import React from "react";
import Navbar from "@/components/layout/Navbar";
import Sidebar from "@/components/layout/Sidebar";
import { useTitle } from "@/hooks/use-title";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Calendar as CalendarIcon, FilePen, ShoppingCart, Bell, Video, Heart, Activity } from "lucide-react";
import { useAuth } from "@/context/auth-provider";
import { useRecovery } from "@/hooks/use-recovery";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useNavigate } from "react-router-dom";

const PatientDashboard = () => {
  useTitle("Patient Dashboard - Medical Universe");
  const [date, setDate] = React.useState<Date | undefined>(new Date());
  const { user } = useAuth();
  const { userProgress, getTodayCompletionStats, loading } = useRecovery(user?.id);
  const navigate = useNavigate();

  // Mock data for other sections
  const upcomingAppointments = [{
    id: 1,
    doctor: "Dr. Sarah Johnson",
    specialty: "Cardiologist",
    date: "May 25, 2025",
    time: "10:30 AM"
  }, {
    id: 2,
    doctor: "Dr. Michael Chen",
    specialty: "Dermatologist",
    date: "June 3, 2025",
    time: "2:15 PM"
  }];

  const recentPrescriptions = [{
    id: 1,
    doctor: "Dr. Sarah Johnson",
    date: "April 15, 2025",
    medications: 3
  }, {
    id: 2,
    doctor: "Dr. Robert Williams",
    date: "March 28, 2025",
    medications: 2
  }];

  const yogaProgress = 65; // Percentage
  const recoveryStats = getTodayCompletionStats();

  const getSurgeryTypeDisplay = (programId: string) => {
    const types: Record<string, string> = {
      'heart': '💗 Heart Surgery',
      'knee': '🦵 Knee Surgery', 
      'cesarean': '👶 Cesarean Section',
      'others': '🏥 General Surgery'
    };
    return types[programId] || '🏥 Recovery Program';
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar userRole="patient" />
      
      <div className="flex-1 flex">
        <Sidebar userRole="patient" className="hidden lg:block" />
        
        <main className="flex-1 p-6">
          <div className="flex flex-col space-y-6 bg-zinc-200 my-[70px] p-6 rounded-lg">
            {/* Hero Section with Medical Image */}
            <div className="relative h-64 rounded-lg overflow-hidden mb-6">
              <img 
                src="/lovable-uploads/283e6d37-f0a6-44eb-86ea-c1d18b486de9.png"
                alt="Medical professionals providing healthcare services"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-blue-900 bg-opacity-50 flex items-center justify-center">
                <div className="text-center text-white">
                  <h1 className="text-3xl font-bold mb-2">Welcome to Medical Universe</h1>
                  <p className="text-lg">Your comprehensive healthcare companion</p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Patient Dashboard</h2>
              <Button variant="destructive" className="flex items-center gap-2">
                <Bell className="h-4 w-4" />
                SOS Emergency
              </Button>
            </div>

            {/* Recovery Journey Section */}
            {!loading && (
              <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-xl">
                    <Heart className="h-6 w-6 text-blue-600" />
                    Recovery Journey
                    {userProgress && (
                      <Badge variant="outline" className="bg-blue-100 text-blue-700 border-blue-300">
                        Day {userProgress.current_day}
                      </Badge>
                    )}
                  </CardTitle>
                  <CardDescription>
                    {userProgress 
                      ? "Continue your AI-guided recovery program" 
                      : "Start your personalized recovery program with AI guidance"
                    }
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {userProgress ? (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-semibold text-lg text-blue-800">
                            {getSurgeryTypeDisplay(userProgress.program_id)}
                          </h4>
                          <p className="text-blue-600">
                            Surgery Date: {new Date(userProgress.surgery_date).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-blue-700">
                            {recoveryStats.percentage}%
                          </div>
                          <p className="text-sm text-blue-600">Today's Progress</p>
                        </div>
                      </div>
                      
                      <Progress value={recoveryStats.percentage} className="h-3" />
                      
                      <div className="flex items-center justify-between pt-2">
                        <span className="text-sm text-blue-600">
                          {recoveryStats.completed} of {recoveryStats.total} tasks completed today
                        </span>
                        <Button 
                          onClick={() => navigate('/patient-dashboard/recovery-journey')}
                          className="bg-blue-600 hover:bg-blue-700 text-white"
                        >
                          <Activity className="h-4 w-4 mr-2" />
                          Continue Recovery
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <div className="mb-4">
                        <Heart className="h-12 w-12 mx-auto text-blue-500 mb-2" />
                        <h3 className="text-lg font-semibold text-blue-800 mb-2">
                          Start Your Recovery Journey
                        </h3>
                        <p className="text-blue-600 mb-4">
                          Get personalized recovery guidance with AI assistance, daily tasks, and progress tracking.
                        </p>
                      </div>
                      <Button 
                        onClick={() => navigate('/patient-dashboard/recovery-journey')}
                        className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                      >
                        <Heart className="h-4 w-4 mr-2" />
                        Begin Recovery Program
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Upcoming Appointments</CardTitle>
                  <CardDescription>
                    Your scheduled doctor appointments
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {upcomingAppointments.length > 0 ? (
                    <div className="space-y-4">
                      {upcomingAppointments.map(appointment => (
                        <div key={appointment.id} className="bg-white p-3 rounded-lg border border-gray-100">
                          <div className="font-medium">{appointment.doctor}</div>
                          <div className="text-sm text-gray-500">{appointment.specialty}</div>
                          <div className="text-sm text-gray-500 mt-1">
                            {appointment.date} at {appointment.time}
                          </div>
                        </div>
                      ))}
                      <Button variant="outline" className="w-full" size="sm">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        View All Appointments
                      </Button>
                    </div>
                  ) : (
                    <div className="py-8 text-center text-gray-500">
                      <p>No upcoming appointments</p>
                      <Button variant="outline" size="sm" className="mt-2">
                        Book an Appointment
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Recent Prescriptions</CardTitle>
                  <CardDescription>
                    Access your medical prescriptions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {recentPrescriptions.length > 0 ? (
                    <div className="space-y-4">
                      {recentPrescriptions.map(prescription => (
                        <div key={prescription.id} className="bg-white p-3 rounded-lg border border-gray-100">
                          <div className="font-medium">{prescription.doctor}</div>
                          <div className="text-sm text-gray-500">{prescription.date}</div>
                          <div className="text-sm text-gray-500 mt-1">
                            {prescription.medications} medications
                          </div>
                        </div>
                      ))}
                      <Button variant="outline" className="w-full" size="sm">
                        <FilePen className="mr-2 h-4 w-4" />
                        View All Prescriptions
                      </Button>
                    </div>
                  ) : (
                    <div className="py-8 text-center text-gray-500">
                      <p>No recent prescriptions</p>
                      <Button variant="outline" size="sm" className="mt-2">
                        Upload a Prescription
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Book Appointment</CardTitle>
                  <CardDescription>Select a date for your next visit</CardDescription>
                </CardHeader>
                <CardContent>
                  <Calendar mode="single" selected={date} onSelect={setDate} className="rounded-md border" />
                  <Button className="w-full mt-4">Check Available Slots</Button>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Yoga Progress</CardTitle>
                  <CardDescription>Track your daily yoga activities</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div className="bg-blue-600 h-2.5 rounded-full" style={{
                        width: `${yogaProgress}%`
                      }} />
                    </div>
                    <div className="flex justify-between text-sm text-gray-500">
                      <span>Week progress: {yogaProgress}%</span>
                      <span>18 days streak</span>
                    </div>
                    <Button className="w-full flex items-center justify-center">
                      <Video className="mr-2 h-4 w-4" />
                      Continue Yoga Program
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Medicine Orders</CardTitle>
                  <CardDescription>Order your prescribed medicines</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-center py-6">
                      <p className="text-gray-500 mb-4">
                        Get your prescribed medicines delivered to your doorstep
                      </p>
                      <Button>
                        <ShoppingCart className="mr-2 h-4 w-4" />
                        Order Medicines
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default PatientDashboard;
