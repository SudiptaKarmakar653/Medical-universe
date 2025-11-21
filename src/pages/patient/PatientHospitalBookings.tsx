
import React, { useState, useEffect } from "react";
import { useTitle } from "@/hooks/use-title";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Building, Calendar, FileText, AlertCircle, Download, Clock, MapPin } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/auth-provider";
import Navbar from "@/components/layout/Navbar";
import Sidebar from "@/components/layout/Sidebar";

interface HospitalBooking {
  id: string;
  booking_id: string;
  patient_name: string;
  patient_age: number;
  patient_gender: string;
  disease: string;
  preferred_bed_type: string;
  is_emergency: boolean;
  payment_status: string;
  admission_status: string;
  created_at: string;
  updated_at: string;
}

const PatientHospitalBookings = () => {
  useTitle("My Hospital Bookings - Medical Universe");
  const { user } = useAuth();
  const [bookings, setBookings] = useState<HospitalBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState<HospitalBooking | null>(null);

  useEffect(() => {
    if (user?.id) {
      fetchBookings();
    }
  }, [user?.id]);

  const fetchBookings = async () => {
    try {
      const { data, error } = await supabase
        .from('bed_bookings')
        .select('*')
        .eq('patient_user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching bookings:', error);
      } else {
        setBookings(data || []);
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { variant: "secondary" as const, label: "Pending" },
      confirmed: { variant: "default" as const, label: "Active" },
      cancelled: { variant: "destructive" as const, label: "Cancelled" },
      expired: { variant: "outline" as const, label: "Expired" }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    return (
      <Badge variant={config.variant}>
        {config.label}
      </Badge>
    );
  };

  const getBedTypeIcon = (bedType: string) => {
    switch (bedType.toLowerCase()) {
      case 'icu':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      case 'general':
        return <Building className="h-5 w-5 text-blue-500" />;
      default:
        return <Building className="h-5 w-5 text-gray-500" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getExpiryTime = (createdAt: string) => {
    const expiryDate = new Date(createdAt);
    expiryDate.setDate(expiryDate.getDate() + 7); // Assuming 7 days validity
    return formatDate(expiryDate.toISOString());
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Navbar userRole="patient" />
        <div className="flex-1 flex">
          <Sidebar userRole="patient" className="hidden lg:block" />
          <main className="flex-1 p-6">
            <div className="flex justify-center items-center h-64">
              <div className="text-lg">Loading your hospital bookings...</div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar userRole="patient" />
      
      <div className="flex-1 flex">
        <Sidebar userRole="patient" className="hidden lg:block" />
        
        <main className="flex-1 p-6">
          <div className="bg-zinc-200 my-[70px] p-6 rounded-lg">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-bold flex items-center gap-2">
                  <Building className="h-6 w-6" />
                  My Hospital Bookings
                </h1>
                <p className="text-gray-600 mt-1">Manage and track your hospital bed bookings</p>
              </div>
            </div>

            {bookings.length === 0 ? (
              <div className="text-center py-12">
                <Building className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No hospital bookings found</h3>
                <p className="text-gray-500 mb-4">
                  Book a bed now from the Our Hospital section.
                </p>
                <Button onClick={() => window.location.href = '/hospital'}>
                  Book Hospital Bed
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {bookings.map((booking) => (
                  <Card key={booking.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg flex items-center gap-2">
                          {getBedTypeIcon(booking.preferred_bed_type)}
                          {booking.preferred_bed_type} Bed
                        </CardTitle>
                        {getStatusBadge(booking.admission_status)}
                      </div>
                      <CardDescription className="font-medium text-blue-600">
                        Booking ID: {booking.booking_id}
                      </CardDescription>
                    </CardHeader>
                    
                    <CardContent className="space-y-3">
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-4 w-4 text-gray-500" />
                        <span>Booked: {formatDate(booking.created_at)}</span>
                      </div>
                      
                      <div className="flex items-center gap-2 text-sm">
                        <FileText className="h-4 w-4 text-gray-500" />
                        <span>Condition: {booking.disease}</span>
                      </div>
                      
                      <div className="flex items-center gap-2 text-sm">
                        <AlertCircle className="h-4 w-4 text-gray-500" />
                        <span>Emergency: {booking.is_emergency ? "Yes" : "No"}</span>
                      </div>
                      
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="h-4 w-4 text-gray-500" />
                        <span className="text-xs">Valid till: {getExpiryTime(booking.created_at)}</span>
                      </div>
                      
                      <div className="pt-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="w-full"
                              onClick={() => setSelectedBooking(booking)}
                            >
                              <Download className="h-4 w-4 mr-2" />
                              Download Receipt
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-md">
                            <DialogHeader>
                              <DialogTitle>Booking Receipt</DialogTitle>
                            </DialogHeader>
                            {selectedBooking && (
                              <div className="space-y-4">
                                <div className="text-center border-b pb-4">
                                  <h3 className="font-bold text-lg">Medical Universe Hospital</h3>
                                  <p className="text-sm text-gray-600">Bed Booking Confirmation</p>
                                </div>
                                
                                <div className="space-y-3">
                                  <div className="flex justify-between">
                                    <span className="font-medium">Booking ID:</span>
                                    <span>{selectedBooking.booking_id}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="font-medium">Patient Name:</span>
                                    <span>{selectedBooking.patient_name}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="font-medium">Age:</span>
                                    <span>{selectedBooking.patient_age} years</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="font-medium">Gender:</span>
                                    <span>{selectedBooking.patient_gender}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="font-medium">Bed Type:</span>
                                    <span>{selectedBooking.preferred_bed_type}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="font-medium">Medical Condition:</span>
                                    <span>{selectedBooking.disease}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="font-medium">Emergency Case:</span>
                                    <span>{selectedBooking.is_emergency ? "Yes" : "No"}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="font-medium">Status:</span>
                                    <span>{selectedBooking.admission_status}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="font-medium">Booking Date:</span>
                                    <span>{formatDate(selectedBooking.created_at)}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="font-medium">Valid Until:</span>
                                    <span>{getExpiryTime(selectedBooking.created_at)}</span>
                                  </div>
                                </div>
                                
                                <div className="text-center text-sm text-gray-500 border-t pt-4">
                                  Please bring this receipt and a valid ID for admission.
                                </div>
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default PatientHospitalBookings;
