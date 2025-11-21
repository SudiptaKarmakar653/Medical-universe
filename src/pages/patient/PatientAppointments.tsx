
import React, { useState, useEffect } from "react";
import Navbar from "@/components/layout/Navbar";
import Sidebar from "@/components/layout/Sidebar";
import { useTitle } from "@/hooks/use-title";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, MapPin, User, Phone, Mail, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import DoctorRatingModal from "@/components/doctor/DoctorRatingModal";

const PatientAppointments = () => {
  useTitle("My Appointments - Medical Universe");
  const [appointments, setAppointments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [ratingModal, setRatingModal] = useState<{
    isOpen: boolean;
    doctorId: string;
    doctorName: string;
    patientId: string;
    appointmentId: string;
  } | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      setIsLoading(true);
      console.log('Fetching all appointments...');

      // For demo purposes, fetch all appointments
      // In a real app, you'd filter by patient_id or patient_email
      const { data: appointmentsData, error } = await supabase
        .from('appointments')
        .select(`
          *,
          doctor_profiles (
            doctor_name,
            specialization,
            email,
            phone,
            location
          )
        `)
        .order('appointment_date', { ascending: false });

      if (error) {
        console.error('Error fetching appointments:', error);
        throw error;
      }

      console.log('Fetched appointments:', appointmentsData);
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

  const formatAppointmentDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'default';
      case 'pending':
        return 'secondary';
      case 'cancelled':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  const upcomingAppointments = appointments.filter(apt => 
    new Date(apt.appointment_date) >= new Date()
  );

  const pastAppointments = appointments.filter(apt => 
    new Date(apt.appointment_date) < new Date()
  );

  const handleRateDoctor = (appointment: any) => {
    setRatingModal({
      isOpen: true,
      doctorId: appointment.doctor_id,
      doctorName: appointment.doctor_profiles?.doctor_name || "Doctor",
      patientId: appointment.patient_id || "",
      appointmentId: appointment.id,
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar userRole="patient" />
      
      <div className="flex-1 flex">
        <Sidebar userRole="patient" className="hidden lg:block" />
        
        <main className="flex-1 p-6">
          <div className="bg-zinc-200 my-[70px] p-6 rounded-lg">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold">My Appointments</h1>
              <Button onClick={fetchAppointments} variant="outline">
                Refresh
              </Button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">Total Appointments</p>
                      <p className="text-2xl font-bold">{appointments.length}</p>
                    </div>
                    <Calendar className="h-8 w-8 text-blue-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">Upcoming</p>
                      <p className="text-2xl font-bold">{upcomingAppointments.length}</p>
                    </div>
                    <Clock className="h-8 w-8 text-green-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">Past Appointments</p>
                      <p className="text-2xl font-bold">{pastAppointments.length}</p>
                    </div>
                    <User className="h-8 w-8 text-gray-500" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {isLoading ? (
              <div className="text-center py-12">
                <p className="text-gray-500">Loading appointments...</p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Upcoming Appointments */}
                {upcomingAppointments.length > 0 && (
                  <div>
                    <h2 className="text-xl font-semibold mb-4">Upcoming Appointments</h2>
                    <div className="space-y-4">
                      {upcomingAppointments.map(appointment => (
                        <Card key={appointment.id} className="border-l-4 border-l-green-500">
                          <CardContent className="p-6">
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                  <h3 className="text-lg font-semibold">
                                    {appointment.doctor_profiles?.doctor_name || 'Doctor'}
                                  </h3>
                                  <Badge variant={getStatusColor(appointment.status)}>
                                    {appointment.status}
                                  </Badge>
                                </div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                                  <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                      <User className="h-4 w-4" />
                                      <span>{appointment.doctor_profiles?.specialization || 'Medical Professional'}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <Calendar className="h-4 w-4" />
                                      <span>{formatAppointmentDate(appointment.appointment_date)}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <MapPin className="h-4 w-4" />
                                      <span>{appointment.doctor_profiles?.location || 'Clinic'}</span>
                                    </div>
                                  </div>
                                  
                                  <div className="space-y-2">
                                    <div>
                                      <strong>Reason:</strong> {appointment.reason}
                                    </div>
                                    {appointment.patient_name && (
                                      <div>
                                        <strong>Patient:</strong> {appointment.patient_name}
                                      </div>
                                    )}
                                    {appointment.notes && (
                                      <div>
                                        <strong>Notes:</strong> {appointment.notes}
                                      </div>
                                    )}
                                   </div>
                                 </div>
                               </div>
                             </div>
                           </CardContent>
                         </Card>
                       ))}
                     </div>
                   </div>
                 )}

                 {/* Past Appointments */}
                 {pastAppointments.length > 0 && (
                   <div>
                     <h2 className="text-xl font-semibold mb-4">Past Appointments</h2>
                     <div className="space-y-4">
                       {pastAppointments.map(appointment => (
                         <Card key={appointment.id} className="border-l-4 border-l-gray-300">
                           <CardContent className="p-6">
                             <div className="flex justify-between items-start">
                               <div className="flex-1">
                                 <div className="flex items-center gap-3 mb-2">
                                   <h3 className="text-lg font-semibold">
                                     {appointment.doctor_profiles?.doctor_name || 'Doctor'}
                                   </h3>
                                   <Badge variant={getStatusColor(appointment.status)}>
                                     {appointment.status}
                                   </Badge>
                                 </div>
                                 
                                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                                   <div className="space-y-2">
                                     <div className="flex items-center gap-2">
                                       <User className="h-4 w-4" />
                                       <span>{appointment.doctor_profiles?.specialization || 'Medical Professional'}</span>
                                     </div>
                                     <div className="flex items-center gap-2">
                                       <Calendar className="h-4 w-4" />
                                       <span>{formatAppointmentDate(appointment.appointment_date)}</span>
                                     </div>
                                   </div>
                                   
                                   <div className="space-y-2">
                                     <div>
                                       <strong>Reason:</strong> {appointment.reason}
                                     </div>
                                     {appointment.patient_name && (
                                       <div>
                                         <strong>Patient:</strong> {appointment.patient_name}
                                       </div>
                                     )}
                                   </div>
                                 </div>
                                 
                                 {/* Rate Doctor Button - Only show for completed appointments */}
                                 {appointment.status === 'completed' && (
                                   <div className="mt-4">
                                     <Button
                                       variant="outline"
                                       size="sm"
                                       onClick={() => handleRateDoctor(appointment)}
                                       className="flex items-center gap-2"
                                     >
                                       <Star className="h-4 w-4" />
                                       Rate Doctor
                                     </Button>
                                   </div>
                                 )}
                               </div>
                             </div>
                           </CardContent>
                         </Card>
                       ))}
                     </div>
                   </div>
                 )}

                {appointments.length === 0 && (
                  <div className="text-center py-12">
                    <Calendar className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                    <p className="text-gray-500 text-xl mb-4">No appointments found</p>
                    <p className="text-gray-400">Your booked appointments will appear here</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Rating Modal */}
      {ratingModal && (
        <DoctorRatingModal
          isOpen={ratingModal.isOpen}
          onClose={() => setRatingModal(null)}
          doctorId={ratingModal.doctorId}
          doctorName={ratingModal.doctorName}
          patientId={ratingModal.patientId}
          appointmentId={ratingModal.appointmentId}
        />
      )}
    </div>
  );
};

export default PatientAppointments;
