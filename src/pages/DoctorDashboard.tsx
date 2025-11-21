import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Sidebar from "@/components/layout/Sidebar";
import { useTitle } from "@/hooks/use-title";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Calendar as CalendarIcon, Users, FilePen, UserPlus, CheckCircle, Clock, XCircle, User, Phone, Mail, AlertCircle } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import DoctorVerificationModal from "@/components/doctor/DoctorVerificationModal";
import LungSoundAnalyzer from "@/components/doctor/LungSoundAnalyzer";
import { useDoctorStatus } from "@/hooks/use-doctor-status";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useUser } from "@clerk/clerk-react";

const DoctorDashboard = () => {
  useTitle("Doctor Dashboard - Medical Universe");
  const location = useLocation();
  const { user } = useUser();
  const [date, setDate] = React.useState<Date | undefined>(new Date());
  const [isVerificationModalOpen, setIsVerificationModalOpen] = useState(false);
  const [appointments, setAppointments] = useState([]);
  const [acceptedPatients, setAcceptedPatients] = useState([]);
  const [isLoadingAppointments, setIsLoadingAppointments] = useState(true);
  const [doctorProfile, setDoctorProfile] = useState(null);
  const { toast } = useToast();

  // Get doctor email from Clerk user
  const doctorEmail = user?.emailAddresses?.[0]?.emailAddress;
  const { approvalStatus, isLoading } = useDoctorStatus(doctorEmail);

  // Determine which tab to show based on the current route
  const getActiveTab = () => {
    const path = location.pathname;
    if (path.includes('/appointments')) return 'appointments';
    if (path.includes('/patients')) return 'patients';
    if (path.includes('/prescriptions')) return 'prescriptions';
    if (path.includes('/schedule')) return 'schedule';
    if (path.includes('/lung-analyzer')) return 'lung-analyzer';
    return 'appointments'; // default
  };
  const [activeTab, setActiveTab] = useState(getActiveTab());

  // Update active tab when location changes
  useEffect(() => {
    setActiveTab(getActiveTab());
  }, [location.pathname]);

  // Fetch doctor profile and appointments
  useEffect(() => {
    if (user?.id) {
      fetchDoctorData();
    }
  }, [user]);

  const fetchDoctorData = async () => {
    try {
      setIsLoadingAppointments(true);
      const clerkUserId = user?.id;
      console.log('Fetching doctor profile for Clerk user ID:', clerkUserId);

      // First get the doctor's profile using clerk_user_id
      let doctorProfileData = null;
      
      const { data: profileByClerkId, error: clerkError } = await supabase
        .from('doctor_profiles')
        .select('*')
        .eq('clerk_user_id', clerkUserId)
        .single();

      if (clerkError && clerkError.code === 'PGRST116') {
        // If no profile found with clerk_user_id, try email fallback
        console.log('No profile found with clerk_user_id, trying email fallback...');
        const email = user?.emailAddresses?.[0]?.emailAddress;
        
        if (email) {
          const { data: profileByEmail, error: emailError } = await supabase
            .from('doctor_profiles')
            .select('*')
            .eq('email', email)
            .single();

          if (emailError) {
            console.error('No profile found with email either:', emailError);
            setAppointments([]);
            return;
          }

          // Update the profile with clerk_user_id for future use
          await supabase
            .from('doctor_profiles')
            .update({ clerk_user_id: clerkUserId })
            .eq('id', profileByEmail.id);

          doctorProfileData = profileByEmail;
        }
      } else if (clerkError) {
        console.error('Error fetching doctor profile:', clerkError);
        setAppointments([]);
        return;
      } else {
        doctorProfileData = profileByClerkId;
      }

      if (!doctorProfileData) {
        console.log('No doctor profile found');
        setAppointments([]);
        return;
      }

      console.log('Found doctor profile:', doctorProfileData);
      setDoctorProfile(doctorProfileData);
      await fetchAppointmentsForDoctor(doctorProfileData.id);
    } catch (error) {
      console.error('Error fetching doctor data:', error);
      toast({
        title: "Error",
        description: "Failed to load doctor data",
        variant: "destructive"
      });
    } finally {
      setIsLoadingAppointments(false);
    }
  };

  const fetchAppointmentsForDoctor = async (doctorId: string) => {
    try {
      console.log('Fetching appointments for doctor ID:', doctorId);

      // Fetch appointments for this doctor
      const {
        data: appointmentsData,
        error
      } = await supabase.from('appointments').select('*').eq('doctor_id', doctorId).order('appointment_date', {
        ascending: true
      });
      if (error) {
        console.error('Error fetching appointments:', error);
        throw error;
      }
      console.log('Fetched appointments:', appointmentsData);
      setAppointments(appointmentsData || []);

      // Filter accepted patients (appointments with status 'completed')
      const acceptedPatientsData = (appointmentsData || []).filter(apt => apt.status === 'completed');
      setAcceptedPatients(acceptedPatientsData);
    } catch (error) {
      console.error('Error fetching appointments:', error);
      toast({
        title: "Error",
        description: "Failed to load appointments",
        variant: "destructive"
      });
    }
  };

  const updateAppointmentStatus = async (appointmentId: string, newStatus: string) => {
    try {
      console.log('Updating appointment status:', appointmentId, newStatus);
      const {
        error
      } = await supabase.from('appointments').update({
        status: newStatus
      }).eq('id', appointmentId);
      if (error) {
        console.error('Error updating appointment status:', error);
        throw error;
      }

      // Update local state
      setAppointments(prev => prev.map(apt => apt.id === appointmentId ? {
        ...apt,
        status: newStatus
      } : apt));

      // If appointment is accepted (completed), add to accepted patients
      if (newStatus === 'completed') {
        const acceptedAppointment = appointments.find(apt => apt.id === appointmentId);
        if (acceptedAppointment) {
          setAcceptedPatients(prev => [...prev, {
            ...acceptedAppointment,
            status: newStatus
          }]);
        }
      } else if (newStatus === 'cancelled') {
        // Remove from accepted patients if cancelled
        setAcceptedPatients(prev => prev.filter(patient => patient.id !== appointmentId));
      }
      toast({
        title: "Success",
        description: `Appointment ${newStatus === 'completed' ? 'accepted' : newStatus} successfully`
      });
    } catch (error) {
      console.error('Error updating appointment:', error);
      toast({
        title: "Error",
        description: "Failed to update appointment",
        variant: "destructive"
      });
    }
  };

  // Process appointments data
  const upcomingAppointments = appointments.filter(apt => apt.status === 'pending' && new Date(apt.appointment_date) >= new Date());
  const todaysStats = {
    appointments: appointments.filter(apt => {
      const today = new Date();
      const aptDate = new Date(apt.appointment_date);
      return aptDate.toDateString() === today.toDateString();
    }).length,
    completed: appointments.filter(apt => apt.status === 'completed').length,
    upcoming: upcomingAppointments.length,
    cancelledBy: {
      doctor: appointments.filter(apt => apt.status === 'cancelled').length,
      patient: 0
    }
  };
  const monthlyAppointments = [60, 48, 55, 53, 48, 65, 32, 40, 45, 62, 54, 48];
  const currentMonth = new Date().getMonth();
  const formatAppointmentDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Render different content based on active tab
  const renderTabContent = () => {
    switch (activeTab) {
      case 'appointments':
        return <div className="space-y-4">
            {isLoadingAppointments ? <div className="text-center py-8">
                <p className="text-gray-500">Loading appointments...</p>
              </div> : upcomingAppointments.length > 0 ? upcomingAppointments.map(appointment => {
            return <div key={appointment.id} className="flex justify-between items-start p-4 rounded-lg border border-gray-100 bg-white">
                    <div className="flex-1">
                      <div className="font-medium text-lg">{appointment.patient_name || 'Unknown Patient'}</div>
                      <div className="text-sm text-gray-600 mt-1">
                        <strong>Age:</strong> {appointment.patient_age || 'N/A'} • <strong>Reason:</strong> {appointment.reason}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        <strong>Date:</strong> {formatAppointmentDate(appointment.appointment_date)}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2 text-xs text-gray-500">
                        {appointment.patient_email && <div className="flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {appointment.patient_email}
                          </div>}
                        {appointment.patient_phone && <div className="flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {appointment.patient_phone}
                          </div>}
                      </div>
                      {appointment.notes && <div className="text-xs text-gray-500 mt-1">
                          <strong>Notes:</strong> {appointment.notes}
                        </div>}
                    </div>
                    <div className="text-right ml-4">
                      <Badge variant="secondary" className="mb-3">
                        {appointment.status}
                      </Badge>
                      <div className="flex flex-col gap-2">
                        <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => updateAppointmentStatus(appointment.id, 'completed')}>
                          Accept
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => updateAppointmentStatus(appointment.id, 'cancelled')}>
                          Reject
                        </Button>
                      </div>
                    </div>
                  </div>;
          }) : <div className="text-center py-8">
                <p className="text-gray-500">No pending appointments</p>
                <p className="text-xs text-gray-400 mt-2">
                  Doctor ID: {doctorProfile?.id || 'Not found'}
                </p>
              </div>}
          </div>;
      case 'patients':
        return <div className="space-y-4">
            {acceptedPatients.length > 0 ? acceptedPatients.map(patient => {
            return <div key={patient.id} className="p-4 rounded-lg border border-green-200 bg-green-50">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <User className="h-5 w-5 text-green-600" />
                          <div className="font-medium text-lg">{patient.patient_name || 'Unknown Patient'}</div>
                          <Badge variant="default" className="bg-green-600">
                            Accepted Patient
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div className="space-y-1">
                            <div><strong>Age:</strong> {patient.patient_age || 'N/A'}</div>
                            <div><strong>Reason:</strong> {patient.reason}</div>
                            <div><strong>Appointment Date:</strong> {formatAppointmentDate(patient.appointment_date)}</div>
                          </div>
                          
                          <div className="space-y-1">
                            {patient.patient_email && <div className="flex items-center gap-2">
                                <Mail className="h-4 w-4 text-gray-500" />
                                <span>{patient.patient_email}</span>
                              </div>}
                            {patient.patient_phone && <div className="flex items-center gap-2">
                                <Phone className="h-4 w-4 text-gray-500" />
                                <span>{patient.patient_phone}</span>
                              </div>}
                          </div>
                        </div>
                        
                        {patient.notes && <div className="mt-2 text-sm">
                            <strong>Notes:</strong> {patient.notes}
                          </div>}
                      </div>
                    </div>
                  </div>;
          }) : <div className="text-center py-8">
                <Users className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500 text-lg">No accepted patients yet</p>
                <p className="text-gray-400 text-sm mt-2">Accept appointment requests to see patient details here</p>
              </div>}
          </div>;
      case 'prescriptions':
        return <div className="text-center py-8">
            <FilePen className="h-16 w-16 mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500 text-lg">Prescriptions</p>
            <p className="text-gray-400 text-sm mt-2">Prescription management coming soon</p>
          </div>;
      case 'schedule':
        return <div className="text-center py-8">
            <Clock className="h-16 w-16 mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500 text-lg">Schedule Management</p>
            <p className="text-gray-400 text-sm mt-2">Schedule management coming soon</p>
          </div>;
      case 'lung-analyzer':
        return <LungSoundAnalyzer />;
      default:
        return null;
    }
  };

  const renderVerificationStatus = () => {
    if (isLoading) {
      return <Alert>
          <Clock className="h-4 w-4" />
          <AlertTitle>Checking Status</AlertTitle>
          <AlertDescription>Loading verification status...</AlertDescription>
        </Alert>;
    }
    switch (approvalStatus) {
      case 'pending':
        return <Alert className="border-yellow-200 bg-yellow-50">
            <Clock className="h-4 w-4 text-yellow-600" />
            <AlertTitle className="text-yellow-800">Verification Pending</AlertTitle>
            <AlertDescription className="text-yellow-700">
              Your doctor verification request is currently under review by our admin team. 
              You'll be notified once it's approved.
            </AlertDescription>
          </Alert>;
      case 'approved':
        return <Alert className="border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertTitle className="text-green-800">Verification Approved</AlertTitle>
            <AlertDescription className="text-green-700">
              Congratulations! Your doctor profile has been verified and approved. 
              You can now receive appointment requests from patients.
            </AlertDescription>
          </Alert>;
      case 'rejected':
        return <Alert className="border-red-200 bg-red-50">
            <XCircle className="h-4 w-4 text-red-600" />
            <AlertTitle className="text-red-800">Verification Rejected</AlertTitle>
            <AlertDescription className="text-red-700">
              Your verification request was not approved. Please contact support for more information 
              or submit a new request with updated documentation.
            </AlertDescription>
          </Alert>;
      case 'not_found':
      default:
        return <Alert className="border-blue-200 bg-blue-50">
            <AlertCircle className="h-4 w-4 text-blue-600" />
            <AlertTitle className="text-blue-800">Join Our Doctor Community</AlertTitle>
            <AlertDescription className="text-blue-700">
              Complete your doctor verification to start receiving appointment requests from patients. 
              Click the button below to submit your verification request.
            </AlertDescription>
          </Alert>;
    }
  };

  return <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar userRole="doctor" />
      
      <div className="flex-1 flex">
        <Sidebar userRole="doctor" className="hidden lg:block" />
        
        <main className="flex-1 p-6 my-[50px]">
          <div className="flex flex-col space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <h1 className="text-2xl font-bold">Doctor Dashboard</h1>
                {doctorProfile && <div className="text-sm text-gray-500 mt-1">
                    Profile: {doctorProfile.doctor_name || doctorProfile.email} (ID: {doctorProfile.id})
                  </div>}
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-sm text-gray-500">
                  {new Date().toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
                </div>
                {approvalStatus !== 'approved' && <Button onClick={() => setIsVerificationModalOpen(true)} className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2">
                    <UserPlus className="h-4 w-4" />
                    {approvalStatus === 'pending' ? 'Update Request' : 'Join Our Doctor Community'}
                  </Button>}
                <Button onClick={fetchDoctorData} variant="outline">
                  Refresh Data
                </Button>
              </div>
            </div>

            {/* Verification Status Alert */}
            {renderVerificationStatus()}

            {/* Debug Information */}
            <Card className="bg-blue-50 border-blue-200">
              <CardHeader>
                <CardTitle className="text-lg text-blue-800">Your Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div>Doctor Email: {doctorEmail}</div>
                  <div>Verification Status: {approvalStatus}</div>
                  <div>Doctor Profile Found: {doctorProfile ? 'Yes' : 'No'}</div>
                  {doctorProfile && <div>Doctor Profile ID: {doctorProfile.id}</div>}
                  <div>Total Appointments: {appointments.length}</div>
                  <div>Pending Appointments: {upcomingAppointments.length}</div>
                  <div>Accepted Patients: {acceptedPatients.length}</div>
                  
                  
                </div>
              </CardContent>
            </Card>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Today's Overview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <p className="text-sm text-gray-500">Total</p>
                      <p className="text-2xl font-bold">{todaysStats.appointments}</p>
                    </div>
                    <div className="bg-green-50 p-3 rounded-lg">
                      <p className="text-sm text-gray-500">Completed</p>
                      <p className="text-2xl font-bold">{todaysStats.completed}</p>
                    </div>
                    <div className="bg-amber-50 p-3 rounded-lg">
                      <p className="text-sm text-gray-500">Upcoming</p>
                      <p className="text-2xl font-bold">{todaysStats.upcoming}</p>
                    </div>
                    <div className="bg-red-50 p-3 rounded-lg">
                      <p className="text-sm text-gray-500">Cancelled</p>
                      <p className="text-2xl font-bold">{todaysStats.cancelledBy.doctor + todaysStats.cancelledBy.patient}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="col-span-2">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Monthly Appointments</CardTitle>
                  <CardDescription>
                    Number of appointments per month
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[150px] flex items-end space-x-2">
                    {monthlyAppointments.map((count, idx) => <div key={idx} className="flex flex-col items-center flex-1">
                        <div className={`w-full rounded-t-sm ${idx === currentMonth ? 'bg-blue-600' : 'bg-blue-200'}`} style={{
                      height: `${count / 70 * 100}%`
                    }}></div>
                        <span className="text-xs mt-1">
                          {new Date(0, idx).toLocaleString('default', {
                        month: 'short'
                      })}
                        </span>
                      </div>)}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="text-lg">
                    {activeTab === 'appointments' && `Appointments (${upcomingAppointments.length})`}
                    {activeTab === 'patients' && `Patients (${acceptedPatients.length})`}
                    {activeTab === 'prescriptions' && 'Prescriptions'}
                    {activeTab === 'schedule' && 'Schedule'}
                    {activeTab === 'lung-analyzer' && '🩹 Lung Sound Analyzer (Beta)'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {renderTabContent()}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Schedule</CardTitle>
                  <CardDescription>Manage your availability</CardDescription>
                </CardHeader>
                <CardContent>
                  <Calendar mode="single" selected={date} onSelect={setDate} className="rounded-md border" />
                  <div className="mt-4 space-y-2">
                    <Button className="w-full flex items-center">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      Manage Schedule
                    </Button>
                    <Button variant="outline" className="w-full flex items-center">
                      <FilePen className="mr-2 h-4 w-4" />
                      Write Prescription
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full flex items-center"
                      onClick={() => setActiveTab('lung-analyzer')}
                    >
                      🩹 Lung Sound Analyzer
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>

      <DoctorVerificationModal isOpen={isVerificationModalOpen} onClose={() => setIsVerificationModalOpen(false)} />
    </div>;
};

export default DoctorDashboard;
