import React, { useState, useEffect } from "react";
import Navbar from "@/components/layout/Navbar";
import Sidebar from "@/components/layout/Sidebar";
import { useTitle } from "@/hooks/use-title";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { User, Mail, Phone, Users, Video, ExternalLink, PhoneOff, Loader2 } from "lucide-react";
import { sendMeetLinkEmail, generateMeetLink } from "@/services/emailService";
import MeetingDetailsDisplay from "@/components/doctor/MeetingDetailsDisplay";
import ManualMeetLinkForm from "@/components/doctor/ManualMeetLinkForm";

const DoctorPatients = () => {
  useTitle("Patients - Doctor Dashboard");
  const [acceptedPatients, setAcceptedPatients] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [doctorProfile, setDoctorProfile] = useState(null);
  const [sendingMeetLink, setSendingMeetLink] = useState<string | null>(null);
  const [endingMeet, setEndingMeet] = useState<string | null>(null);
  const [markingPatient, setMarkingPatient] = useState<string | null>(null);
  const { toast } = useToast();
  
  const doctorEmail = "psubhodeep52@gmail.com";

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
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
      
      // Fetch accepted patients (appointments with status 'completed' and not marked as past)
      const { data: patientsData, error } = await supabase
        .from('appointments')
        .select('*')
        .eq('doctor_id', doctorProfileData.id)
        .eq('status', 'completed')
        .not('notes', 'like', '%PAST_PATIENT%')
        .order('appointment_date', { ascending: false });

      if (error) {
        console.error('Error fetching patients:', error);
        throw error;
      }

      setAcceptedPatients(patientsData || []);

    } catch (error) {
      console.error('Error fetching patients:', error);
      toast({
        title: "Error",
        description: "Failed to load patients",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkAsPastPatient = async (patient: any, isChecked: boolean) => {
    if (!isChecked) return;

    try {
      setMarkingPatient(patient.id);

      // Get current date and time for the past patient marking
      const currentDateTime = new Date().toLocaleString();

      // Update the appointment notes to mark as past patient
      const updatedNotes = patient.notes 
        ? `${patient.notes} | PAST_PATIENT - Marked on ${currentDateTime}` 
        : `PAST_PATIENT - Marked on ${currentDateTime}`;

      const { error: updateError } = await supabase
        .from('appointments')
        .update({ 
          notes: updatedNotes
        })
        .eq('id', patient.id);

      if (updateError) {
        console.error('Error marking patient as past:', updateError);
        throw updateError;
      }

      toast({
        title: "✅ Patient marked as seen",
        description: "Patient has been moved to past patients",
      });

      // Remove patient from current list
      setAcceptedPatients(prev => prev.filter(p => p.id !== patient.id));

    } catch (error: any) {
      console.error('Error marking patient as past:', error);
      toast({
        title: "❌ Error",
        description: error.message || "Failed to mark patient as past",
        variant: "destructive"
      });
    } finally {
      setMarkingPatient(null);
    }
  };

  const handleSendMeetLink = async (patient: any) => {
    if (patient.meeting_type !== 'online') {
      toast({
        title: "Not an online appointment",
        description: "This appointment is scheduled for offline consultation",
        variant: "destructive"
      });
      return;
    }

    if (!patient.patient_email) {
      toast({
        title: "No email found",
        description: "Patient email is required to send the meet link",
        variant: "destructive"
      });
      return;
    }

    try {
      setSendingMeetLink(patient.id);

      // Generate Google Meet link
      const meetLink = generateMeetLink();

      // Update appointment with the meet link
      const { error: updateError } = await supabase
        .from('appointments')
        .update({ meeting_link: meetLink })
        .eq('id', patient.id);

      if (updateError) {
        console.error('Error updating appointment:', updateError);
        throw updateError;
      }

      // Send email with meet link using EmailJS
      const emailResult = await sendMeetLinkEmail({
        patientName: patient.patient_name || 'Patient',
        patientEmail: patient.patient_email,
        doctorName: doctorProfile?.doctor_name || doctorProfile?.email || 'Doctor',
        meetLink: meetLink,
        appointmentDate: new Date(patient.appointment_date).toLocaleDateString('en-US', {
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
          title: "✅ Meet link sent!",
          description: `Google Meet link has been sent to ${patient.patient_email}`,
        });
      } else {
        toast({
          title: "⚠️ Meet link created",
          description: `Meeting link created but email failed to send: ${emailResult.message}`,
          variant: "destructive"
        });
      }

      // Refresh the patients list to get the updated meeting link
      fetchPatients();

    } catch (error: any) {
      console.error('Error sending meet link:', error);
      toast({
        title: "❌ Error",
        description: error.message || "Failed to send meet link",
        variant: "destructive"
      });
    } finally {
      setSendingMeetLink(null);
    }
  };

  const handleEndMeeting = async (patient: any) => {
    if (!patient.meeting_link) {
      toast({
        title: "No active meeting",
        description: "There is no active meeting to end",
        variant: "destructive"
      });
      return;
    }

    try {
      setEndingMeet(patient.id);

      // Update the appointment to remove the meeting link
      const { error: updateError } = await supabase
        .from('appointments')
        .update({ 
          meeting_link: null,
          status: 'completed',
          notes: patient.notes ? `${patient.notes} | Meeting ended at ${new Date().toLocaleString()}` : `Meeting ended at ${new Date().toLocaleString()}`
        })
        .eq('id', patient.id);

      if (updateError) {
        console.error('Error ending meeting:', updateError);
        throw updateError;
      }

      toast({
        title: "✅ Meeting ended",
        description: "The meeting has been successfully ended",
      });

      // Refresh the patients list
      fetchPatients();

    } catch (error: any) {
      console.error('Error ending meeting:', error);
      toast({
        title: "❌ Error",
        description: error.message || "Failed to end meeting",
        variant: "destructive"
      });
    } finally {
      setEndingMeet(null);
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

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar userRole="doctor" />
      
      <div className="flex-1 flex">
        <Sidebar userRole="doctor" className="hidden lg:block" />
        
        <main className="flex-1 p-6 my-[50px]">
          <div className="flex flex-col space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold">My Patients</h1>
              <Button onClick={fetchPatients} variant="outline">
                Refresh
              </Button>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Accepted Patients ({acceptedPatients.length})</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500">Loading patients...</p>
                  </div>
                ) : acceptedPatients.length > 0 ? (
                  <div className="space-y-4">
                    {acceptedPatients.map(patient => (
                      <div key={patient.id} className="p-4 rounded-lg border border-green-200 bg-green-50">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <div className="flex items-center gap-2">
                                <Checkbox
                                  id={`mark-${patient.id}`}
                                  disabled={markingPatient === patient.id}
                                  onCheckedChange={(checked) => handleMarkAsPastPatient(patient, checked as boolean)}
                                />
                                <label htmlFor={`mark-${patient.id}`} className="text-sm text-gray-600 cursor-pointer">
                                  {markingPatient === patient.id ? (
                                    <span className="flex items-center gap-1">
                                      <Loader2 className="h-3 w-3 animate-spin" />
                                      Marking as seen...
                                    </span>
                                  ) : (
                                    "Mark as seen"
                                  )}
                                </label>
                              </div>
                              <User className="h-5 w-5 text-green-600" />
                              <div className="font-medium text-lg">{patient.patient_name || 'Unknown Patient'}</div>
                              <Badge variant="default" className="bg-green-600">
                                Accepted Patient
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
                                {patient.meeting_link && (
                                  <div className="flex items-center gap-2">
                                    <Video className="h-4 w-4 text-blue-500" />
                                    <a 
                                      href={patient.meeting_link} 
                                      target="_blank" 
                                      rel="noopener noreferrer"
                                      className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
                                    >
                                      Join Meeting <ExternalLink className="h-3 w-3" />
                                    </a>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Display organized meeting history */}
                            <MeetingDetailsDisplay notes={patient.notes} />

                            {/* Meeting Control Buttons */}
                            {patient.meeting_type === 'online' && (
                              <div className="mt-3 pt-3 border-t border-green-200">
                                {!patient.meeting_link ? (
                                  <div className="space-y-3">
                                    <div className="flex gap-2">
                                      <Button
                                        onClick={() => handleSendMeetLink(patient)}
                                        disabled={sendingMeetLink === patient.id || !patient.patient_email}
                                        className="bg-blue-600 hover:bg-blue-700 text-white"
                                        size="sm"
                                      >
                                        {sendingMeetLink === patient.id ? (
                                          <>
                                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                            Sending...
                                          </>
                                        ) : (
                                          <>
                                            <Video className="h-4 w-4 mr-2" />
                                            Send Auto Meet Link
                                          </>
                                        )}
                                      </Button>
                                    </div>
                                    
                                    <ManualMeetLinkForm 
                                      patient={patient}
                                      doctorProfile={doctorProfile}
                                      onSuccess={fetchPatients}
                                    />
                                  </div>
                                ) : (
                                  <>
                                    <div className="flex gap-2 items-center">
                                      <Button
                                        onClick={() => handleEndMeeting(patient)}
                                        disabled={endingMeet === patient.id}
                                        className="bg-red-600 hover:bg-red-700 text-white"
                                        size="sm"
                                      >
                                        {endingMeet === patient.id ? (
                                          <>
                                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                            Ending...
                                          </>
                                        ) : (
                                          <>
                                            <PhoneOff className="h-4 w-4 mr-2" />
                                            End Meeting
                                          </>
                                        )}
                                      </Button>
                                      <Badge variant="outline" className="text-green-600">
                                        Meeting Active
                                      </Badge>
                                    </div>
                                  </>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Users className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                    <p className="text-gray-500 text-lg">No accepted patients yet</p>
                    <p className="text-gray-400 text-sm mt-2">Accept appointment requests to see patient details here</p>
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

export default DoctorPatients;
