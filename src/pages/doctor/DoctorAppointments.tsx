
import React, { useState, useEffect } from "react";
import Navbar from "@/components/layout/Navbar";
import Sidebar from "@/components/layout/Sidebar";
import { useTitle } from "@/hooks/use-title";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Mail, Phone, Video, Loader2 } from "lucide-react";
import { sendMeetLinkEmail, generateMeetLink } from "@/services/emailService";

const DoctorAppointments = () => {
  useTitle("Appointments - Doctor Dashboard");
  const [appointments, setAppointments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [doctorProfile, setDoctorProfile] = useState(null);
  const [acceptingAppointment, setAcceptingAppointment] = useState<string | null>(null);
  const { toast } = useToast();
  
  const doctorEmail = "psubhodeep52@gmail.com";

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      setIsLoading(true);
      
      // Get doctor profile
      const { data: doctorProfileData, error: doctorError } = await supabase
        .from('doctor_profiles')
        .select('*')
        .eq('email', doctorEmail)
        .single();

      if (doctorError) {
        console.error('Error fetching doctor profile:', doctorError);
        return;
      }

      setDoctorProfile(doctorProfileData);
      
      // Fetch appointments for this doctor
      const { data: appointmentsData, error } = await supabase
        .from('appointments')
        .select('*')
        .eq('doctor_id', doctorProfileData.id)
        .order('appointment_date', { ascending: true });

      if (error) {
        console.error('Error fetching appointments:', error);
        throw error;
      }

      setAppointments(appointmentsData || []);

    } catch (error) {
      console.error('Error fetching appointments:', error);
      toast({
        title: "Error",
        description: "Failed to load appointments",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAcceptAppointment = async (appointmentId: string) => {
    try {
      setAcceptingAppointment(appointmentId);
      
      // Find the appointment
      const appointment = appointments.find(apt => apt.id === appointmentId);
      if (!appointment) {
        throw new Error('Appointment not found');
      }

      // Generate Google Meet link
      const meetLink = generateMeetLink();
      
      // Update appointment status and add meet link
      const { error } = await supabase
        .from('appointments')
        .update({ 
          status: 'completed',
          meeting_link: meetLink
        })
        .eq('id', appointmentId);

      if (error) {
        throw error;
      }

      // Send email with meet link using EmailJS
      if (appointment.patient_email) {
        const emailResult = await sendMeetLinkEmail({
          patientName: appointment.patient_name || 'Patient',
          patientEmail: appointment.patient_email,
          doctorName: doctorProfile?.doctor_name || doctorProfile?.email || 'Doctor',
          meetLink: meetLink,
          appointmentDate: new Date(appointment.appointment_date).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })
        });

        if (emailResult.success) {
          toast({
            title: "✅ Appointment Accepted!",
            description: `Google Meet link has been sent to ${appointment.patient_email}`,
          });
        } else {
          toast({
            title: "⚠️ Appointment Accepted",
            description: `Appointment accepted but email failed: ${emailResult.message}`,
            variant: "destructive"
          });
        }
      } else {
        toast({
          title: "✅ Appointment Accepted!",
          description: appointment.meeting_type === 'offline' 
            ? "Offline appointment confirmed" 
            : "Appointment accepted successfully",
        });
      }

      // Update local state
      setAppointments(prev => 
        prev.map(apt => 
          apt.id === appointmentId 
            ? { ...apt, status: 'completed', meeting_link: meetLink } 
            : apt
        )
      );

    } catch (error: any) {
      console.error('Error accepting appointment:', error);
      toast({
        title: "❌ Error",
        description: error.message || "Failed to accept appointment",
        variant: "destructive"
      });
    } finally {
      setAcceptingAppointment(null);
    }
  };

  const updateAppointmentStatus = async (appointmentId: string, newStatus: string) => {
    if (newStatus === 'completed') {
      await handleAcceptAppointment(appointmentId);
    } else {
      try {
        const { error } = await supabase
          .from('appointments')
          .update({ status: newStatus })
          .eq('id', appointmentId);

        if (error) {
          throw error;
        }

        setAppointments(prev => 
          prev.map(apt => 
            apt.id === appointmentId ? { ...apt, status: newStatus } : apt
          )
        );

        toast({
          title: "Success",
          description: `Appointment ${newStatus === 'cancelled' ? 'rejected' : newStatus} successfully`,
        });

      } catch (error) {
        console.error('Error updating appointment:', error);
        toast({
          title: "Error",
          description: "Failed to update appointment",
          variant: "destructive"
        });
      }
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

  const pendingAppointments = appointments.filter(apt => apt.status === 'pending');

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar userRole="doctor" />
      
      <div className="flex-1 flex">
        <Sidebar userRole="doctor" className="hidden lg:block" />
        
        <main className="flex-1 p-6 my-[50px]">
          <div className="flex flex-col space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold">Appointments Management</h1>
              <Button onClick={fetchAppointments} variant="outline">
                Refresh
              </Button>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Pending Appointments ({pendingAppointments.length})</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500">Loading appointments...</p>
                  </div>
                ) : pendingAppointments.length > 0 ? (
                  <div className="space-y-4">
                    {pendingAppointments.map(appointment => (
                      <div key={appointment.id} className="flex justify-between items-start p-4 rounded-lg border border-gray-100 bg-white">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="font-medium text-lg">{appointment.patient_name || 'Unknown Patient'}</div>
                            {appointment.meeting_type === 'online' && (
                              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                                <Video className="h-3 w-3 mr-1" />
                                Online
                              </Badge>
                            )}
                            {appointment.meeting_type === 'offline' && (
                              <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                                Offline
                              </Badge>
                            )}
                          </div>
                          <div className="text-sm text-gray-600 mt-1">
                            <strong>Age:</strong> {appointment.patient_age || 'N/A'} • <strong>Reason:</strong> {appointment.reason}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            <strong>Date:</strong> {formatAppointmentDate(appointment.appointment_date)}
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2 text-xs text-gray-500">
                            {appointment.patient_email && (
                              <div className="flex items-center gap-1">
                                <Mail className="h-3 w-3" />
                                {appointment.patient_email}
                              </div>
                            )}
                            {appointment.patient_phone && (
                              <div className="flex items-center gap-1">
                                <Phone className="h-3 w-3" />
                                {appointment.patient_phone}
                              </div>
                            )}
                          </div>
                          {appointment.meeting_type === 'offline' && appointment.meeting_address && (
                            <div className="text-xs text-gray-500 mt-1">
                              <strong>Address:</strong> {appointment.meeting_address}
                            </div>
                          )}
                          {appointment.notes && (
                            <div className="text-xs text-gray-500 mt-1">
                              <strong>Notes:</strong> {appointment.notes}
                            </div>
                          )}
                        </div>
                        <div className="text-right ml-4">
                          <Badge variant="secondary" className="mb-3">
                            {appointment.status}
                          </Badge>
                          <div className="flex flex-col gap-2">
                            <Button 
                              size="sm" 
                              className="bg-green-600 hover:bg-green-700"
                              onClick={() => updateAppointmentStatus(appointment.id, 'completed')}
                              disabled={acceptingAppointment === appointment.id}
                            >
                              {acceptingAppointment === appointment.id ? (
                                <>
                                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                  Sending Email...
                                </>
                              ) : (
                                <>
                                  {appointment.meeting_type === 'online' && <Video className="h-4 w-4 mr-2" />}
                                  Accept & Send Link
                                </>
                              )}
                            </Button>
                            <Button 
                              size="sm" 
                              variant="destructive"
                              onClick={() => updateAppointmentStatus(appointment.id, 'cancelled')}
                              disabled={acceptingAppointment === appointment.id}
                            >
                              Reject
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No pending appointments</p>
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

export default DoctorAppointments;
