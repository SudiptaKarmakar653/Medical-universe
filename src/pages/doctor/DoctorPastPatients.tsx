
import React, { useState, useEffect } from "react";
import Navbar from "@/components/layout/Navbar";
import Sidebar from "@/components/layout/Sidebar";
import { useTitle } from "@/hooks/use-title";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { User, Mail, Phone, Users, Video, UserX } from "lucide-react";
import MeetingDetailsDisplay from "@/components/doctor/MeetingDetailsDisplay";
import PrescriptionModal from "@/components/doctor/PrescriptionModal";
import { useUser } from "@clerk/clerk-react";

const DoctorPastPatients = () => {
  useTitle("Past Patients - Doctor Dashboard");
  const { user } = useUser();
  const [pastPatients, setPastPatients] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [doctorProfile, setDoctorProfile] = useState(null);
  const { toast } = useToast();

  useEffect(() => {
    if (user?.id) {
      fetchPastPatients();
    }
  }, [user]);

  const fetchPastPatients = async () => {
    try {
      setIsLoading(true);
      const clerkUserId = user?.id;
      
      console.log('Fetching doctor profile for Clerk user ID:', clerkUserId);
      
      // Get doctor profile using Clerk user ID
      const { data: doctorProfileData, error: doctorError } = await supabase
        .from('doctor_profiles')
        .select('*')
        .eq('clerk_user_id', clerkUserId)
        .single();

      if (doctorError) {
        console.error('Error fetching doctor profile:', doctorError);
        
        // If no profile found with clerk_user_id, try to find by email as fallback
        if (doctorError.code === 'PGRST116') {
          console.log('No profile found with clerk_user_id, trying email fallback...');
          const email = user?.emailAddresses?.[0]?.emailAddress;
          
          if (email) {
            const { data: emailData, error: emailError } = await supabase
              .from('doctor_profiles')
              .select('*')
              .eq('email', email)
              .single();

            if (emailError) {
              console.error('No profile found with email either:', emailError);
              toast({
                title: "Profile Not Found",
                description: "Please complete your doctor profile setup first.",
                variant: "destructive"
              });
              return;
            }

            // Update the profile with clerk_user_id for future use
            await supabase
              .from('doctor_profiles')
              .update({ clerk_user_id: clerkUserId })
              .eq('id', emailData.id);

            console.log('Updated profile with clerk_user_id and loaded data:', emailData);
            setDoctorProfile(emailData);
            await fetchPastPatientsForDoctor(emailData.id);
          }
        }
        return;
      }

      if (doctorProfileData) {
        console.log('Doctor profile found:', doctorProfileData);
        setDoctorProfile(doctorProfileData);
        await fetchPastPatientsForDoctor(doctorProfileData.id);
      }

    } catch (error) {
      console.error('Error fetching past patients:', error);
      toast({
        title: "Error",
        description: "Failed to load past patients",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPastPatientsForDoctor = async (doctorId: string) => {
    try {
      console.log('Fetching past patients for doctor ID:', doctorId);
      
      // Fetch past patients (appointments marked as PAST_PATIENT) for this specific doctor
      const { data: patientsData, error } = await supabase
        .from('appointments')
        .select('*')
        .eq('doctor_id', doctorId)
        .like('notes', '%PAST_PATIENT%')
        .order('appointment_date', { ascending: false });

      if (error) {
        console.error('Error fetching past patients:', error);
        throw error;
      }

      console.log('Fetched past patients:', patientsData);
      setPastPatients(patientsData || []);

    } catch (error) {
      console.error('Error fetching past patients for doctor:', error);
      toast({
        title: "Error",
        description: "Failed to load past patients for this doctor",
        variant: "destructive"
      });
    }
  };

  const formatAppointmentDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Navbar userRole="doctor" />
        <div className="flex-1 flex">
          <Sidebar userRole="doctor" className="hidden lg:block" />
          <main className="flex-1 p-6 my-[50px]">
            <div className="text-center py-8">
              <p className="text-gray-500">Please log in to view your past patients</p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar userRole="doctor" />
      
      <div className="flex-1 flex">
        <Sidebar userRole="doctor" className="hidden lg:block" />
        
        <main className="flex-1 p-6 my-[50px]">
          <div className="flex flex-col space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <h1 className="text-2xl font-bold">Past Patients</h1>
                {doctorProfile && (
                  <div className="text-sm text-gray-500 mt-1">
                    Dr. {doctorProfile.doctor_name || doctorProfile.email} | ID: {doctorProfile.id}
                  </div>
                )}
              </div>
              <Button onClick={fetchPastPatients} variant="outline">
                Refresh
              </Button>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Past Patients ({pastPatients.length})</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500">Loading past patients...</p>
                  </div>
                ) : pastPatients.length > 0 ? (
                  <div className="space-y-4">
                    {pastPatients.map(patient => (
                      <div key={patient.id} className="p-4 rounded-lg border border-gray-300 bg-gray-50">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <UserX className="h-5 w-5 text-gray-600" />
                              <div className="font-medium text-lg">{patient.patient_name || 'Unknown Patient'}</div>
                              <Badge variant="secondary" className="bg-gray-600 text-white">
                                Past Patient
                              </Badge>
                              {patient.meeting_type === 'online' && (
                                <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                                  <Video className="h-3 w-3 mr-1" />
                                  Online
                                </Badge>
                              )}
                              {patient.meeting_type === 'offline' && (
                                <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                                  Offline
                                </Badge>
                              )}
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                              <div className="space-y-1">
                                <div><strong>Age:</strong> {patient.patient_age || 'N/A'}</div>
                                <div><strong>Reason:</strong> {patient.reason}</div>
                                <div><strong>Appointment Date:</strong> {formatAppointmentDate(patient.appointment_date)}</div>
                                {patient.meeting_type === 'offline' && patient.meeting_address && (
                                  <div><strong>Address:</strong> {patient.meeting_address}</div>
                                )}
                              </div>
                              
                              <div className="space-y-1">
                                {patient.patient_email && (
                                  <div className="flex items-center gap-2">
                                    <Mail className="h-4 w-4 text-gray-500" />
                                    <span>{patient.patient_email}</span>
                                  </div>
                                )}
                                {patient.patient_phone && (
                                  <div className="flex items-center gap-2">
                                    <Phone className="h-4 w-4 text-gray-500" />
                                    <span>{patient.patient_phone}</span>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Display organized meeting history */}
                            <MeetingDetailsDisplay notes={patient.notes} />

                            {/* Prescription Button */}
                            <div className="mt-3 pt-3 border-t border-gray-200">
                              <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600">Send handwritten prescription via email</span>
                                <PrescriptionModal 
                                  patient={patient}
                                  doctorProfile={doctorProfile}
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <UserX className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                    <p className="text-gray-500 text-lg">No past patients yet</p>
                    <p className="text-gray-400 text-sm mt-2">Patients marked as "seen" will appear here</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
};

export default DoctorPastPatients;
