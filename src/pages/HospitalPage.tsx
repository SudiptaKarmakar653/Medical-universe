import React, { useState, useEffect } from "react";
import { useUser } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bed, Activity, Building2, Calendar, CheckCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import BedBookingForm from "@/components/hospital/BedBookingForm";
import PaymentDemo from "@/components/hospital/PaymentDemo";
import BookingConfirmation from "@/components/hospital/BookingConfirmation";
import Navbar from "@/components/layout/Navbar";

interface HospitalData {
  beds: Array<{
    id: string;
    bed_type: string;
    total_beds: number;
    available_beds: number;
    updated_at: string;
  }>;
  operationTheater: Array<{
    id: string;
    name: string;
    is_available: boolean;
    updated_at: string;
  }>;
}

const HospitalPage = () => {
  const {
    user
  } = useUser();
  const navigate = useNavigate();
  const {
    toast
  } = useToast();
  const [hospitalData, setHospitalData] = useState<HospitalData>({
    beds: [],
    operationTheater: []
  });
  const [loading, setLoading] = useState(true);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [bookingData, setBookingData] = useState<any>(null);
  const [bookingId, setBookingId] = useState<string>("");

  const getHospitalImage = (type: string) => {
    switch (type.toLowerCase()) {
      case 'general':
        return "/lovable-uploads/e00011b8-c384-4873-86bf-32390f3193a3.png";
      case 'icu':
        return "/lovable-uploads/fb78d247-528c-4d4b-b5c3-6690c15af8ed.png";
      case 'emergency':
        return "https://images.unsplash.com/photo-1584432810601-6c7f27d2362b?auto=format&fit=crop&w=800&h=600&q=80";
      case 'pediatric':
        return "https://images.unsplash.com/photo-1581056771107-24ca5f033842?auto=format&fit=crop&w=800&h=600&q=80";
      case 'maternity':
        return "https://images.unsplash.com/photo-1582750433449-648ed127bb54?auto=format&fit=crop&w=800&h=600&q=80";
      case 'private':
        return "https://images.unsplash.com/photo-1586773860418-d37222d8fce3?auto=format&fit=crop&w=800&h=600&q=80";
      default:
        return "https://images.unsplash.com/photo-1538108149393-fbbd81895907?auto=format&fit=crop&w=800&h=600&q=80";
    }
  };
  
  const getOperationTheaterImage = (otName: string) => {
    switch (otName.toLowerCase()) {
      case 'ot 1':
        return "/lovable-uploads/015d0079-88f0-482a-bdc9-acbdda86e5fb.png";
      case 'ot 2':
        return "/lovable-uploads/84ca753a-f816-4060-8720-91973e8e3e96.png";
      case 'ot 3':
        return "/lovable-uploads/7ff5e703-e85a-4805-b782-1694bfc7ea30.png";
      default:
        return "/lovable-uploads/015d0079-88f0-482a-bdc9-acbdda86e5fb.png";
    }
  };

  const deduplicateBeds = (bedsData: any[]): any[] => {
    const bedMap = new Map<string, any>();
    bedsData.forEach(bed => {
      const existingBed = bedMap.get(bed.bed_type);
      if (!existingBed || new Date(bed.updated_at) > new Date(existingBed.updated_at)) {
        bedMap.set(bed.bed_type, bed);
      }
    });
    return Array.from(bedMap.values());
  };

  const deduplicateOperationTheaters = (otData: any[]): any[] => {
    const otMap = new Map<string, any>();
    otData.forEach(ot => {
      const existingOt = otMap.get(ot.name);
      if (!existingOt || new Date(ot.updated_at) > new Date(existingOt.updated_at)) {
        otMap.set(ot.name, ot);
      }
    });
    return Array.from(otMap.values());
  };

  const handleSignInRedirect = () => {
    navigate('/auth');
  };
  
  const fetchHospitalData = async () => {
    try {
      console.log('HospitalPage: Fetching hospital data...');
      setLoading(true);

      const {
        data: bedsData,
        error: bedsError
      } = await supabase.from('hospital_beds').select('*').order('bed_type');
      if (bedsError) throw bedsError;

      const {
        data: otData,
        error: otError
      } = await supabase.from('operation_theater').select('*').order('name');
      if (otError) throw otError;
      console.log('HospitalPage: Raw beds data:', bedsData);
      console.log('HospitalPage: Raw OT data:', otData);

      const uniqueBeds = deduplicateBeds(bedsData || []);
      const uniqueOTs = deduplicateOperationTheaters(otData || []);
      console.log('HospitalPage: Deduplicated beds:', uniqueBeds);
      console.log('HospitalPage: Deduplicated OTs:', uniqueOTs);
      setHospitalData({
        beds: uniqueBeds,
        operationTheater: uniqueOTs
      });
      console.log('HospitalPage: Data updated successfully');
    } catch (error) {
      console.error('HospitalPage: Error fetching hospital data:', error);
      toast({
        title: "Error",
        description: "Failed to load hospital data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    console.log('HospitalPage: Component mounted, fetching data...');
    fetchHospitalData();

    const bedsSubscription = supabase.channel('hospital_beds_changes').on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'hospital_beds'
    }, payload => {
      console.log('HospitalPage: Real-time bed update received:', payload);
      fetchHospitalData();
    }).subscribe();

    const otSubscription = supabase.channel('operation_theater_changes').on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'operation_theater'
    }, payload => {
      console.log('HospitalPage: Real-time OT update received:', payload);
      fetchHospitalData();
    }).subscribe();
    return () => {
      console.log('HospitalPage: Cleaning up subscriptions...');
      supabase.removeChannel(bedsSubscription);
      supabase.removeChannel(otSubscription);
    };
  }, []);
  
  const handleBookingSubmit = (data: any) => {
    setBookingData(data);
    setShowBookingForm(false);
    setShowPayment(true);
  };
  
  const handlePaymentSuccess = async () => {
    try {
      if (!user) return;
      const {
        data,
        error
      } = await supabase.from('bed_bookings').insert({
        patient_name: bookingData.name,
        patient_age: bookingData.age,
        patient_gender: bookingData.gender,
        disease: bookingData.disease,
        preferred_bed_type: bookingData.bedType,
        is_emergency: bookingData.isEmergency,
        medical_report_url: bookingData.medicalReportUrl,
        patient_user_id: user.id,
        payment_status: 'completed',
        admission_status: 'confirmed',
        booking_id: ''
      }).select().single();
      if (error) throw error;
      setBookingId(data.booking_id);
      setShowPayment(false);
      setShowConfirmation(true);
      toast({
        title: "Booking Confirmed!",
        description: `Your bed booking has been confirmed. Booking ID: ${data.booking_id}`
      });
    } catch (error) {
      console.error('HospitalPage: Error creating booking:', error);
      toast({
        title: "Error",
        description: "Failed to create booking. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  const resetBookingFlow = () => {
    setShowBookingForm(false);
    setShowPayment(false);
    setShowConfirmation(false);
    setBookingData(null);
    setBookingId("");
  };

  if (loading) {
    return <div className="min-h-screen bg-gradient-to-b from-slate-50 to-blue-50/30">
        <Navbar />
        <div className="pt-20 flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-slate-600 font-medium">Loading hospital information...</p>
          </div>
        </div>
      </div>;
  }

  return <div className="min-h-screen bg-gradient-to-b from-slate-50 to-blue-50/30">
      <Navbar />
      
      <div className="pt-20 pb-16">
        <div className="container mx-auto px-4 max-w-7xl">
          {/* Professional Medical Header */}
          <div className="text-center mb-12 bg-white rounded-2xl shadow-sm border border-slate-200 p-12 mx-auto max-w-4xl">
            <div className="flex items-center justify-center mb-6">
              <div className="w-16 h-16 rounded-full bg-blue-600 flex items-center justify-center shadow-lg">
                <Building2 className="h-8 w-8 text-white" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
              Hospital Services
            </h1>
            <div className="w-24 h-1 bg-blue-600 mx-auto mb-6 rounded-full"></div>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
              Advanced medical facilities with real-time availability tracking and seamless online booking system
            </p>
          </div>

          {/* Professional Availability Grid */}
          <div className="mb-12">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-slate-900">Current Availability</h2>
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                Real-time updates
              </div>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {hospitalData.beds.map(bed => 
                <Card key={bed.id} className="group hover:shadow-lg transition-all duration-300 border-slate-200 bg-white overflow-hidden">
                  <div className="relative h-40 overflow-hidden">
                    <img 
                      src={getHospitalImage(bed.bed_type)} 
                      alt={`${bed.bed_type} bed`} 
                      className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500" 
                      loading="lazy" 
                    />
                    <div className="absolute top-3 right-3">
                      <Badge 
                        variant={bed.available_beds > 0 ? "default" : "destructive"} 
                        className={`${bed.available_beds > 0 ? 'bg-green-100 text-green-800 border-green-200' : 'bg-red-100 text-red-800 border-red-200'} font-semibold shadow-sm`}
                      >
                        {bed.available_beds > 0 ? "Available" : "Full"}
                      </Badge>
                    </div>
                  </div>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xl text-slate-900 flex items-center gap-2">
                      <Bed className="h-5 w-5 text-blue-600" />
                      {bed.bed_type} Ward
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold text-blue-600">{bed.available_beds}</span>
                      <span className="text-slate-500">of {bed.total_beds} beds</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-500" 
                        style={{width: `${(bed.available_beds / bed.total_beds) * 100}%`}} 
                      />
                    </div>
                    <div className="text-xs text-slate-500 text-center pt-1">
                      Updated: {new Date(bed.updated_at).toLocaleString()}
                    </div>
                  </CardContent>
                </Card>
              )}

              {hospitalData.operationTheater.map(ot => 
                <Card key={ot.id} className="group hover:shadow-lg transition-all duration-300 border-slate-200 bg-white overflow-hidden">
                  <div className="relative h-40 overflow-hidden">
                    <img 
                      src={getOperationTheaterImage(ot.name)} 
                      alt={`${ot.name} Operation Theater`} 
                      className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500" 
                      loading="lazy" 
                    />
                    <div className="absolute top-3 right-3">
                      <Badge 
                        variant={ot.is_available ? "default" : "destructive"} 
                        className={`${ot.is_available ? 'bg-green-100 text-green-800 border-green-200' : 'bg-red-100 text-red-800 border-red-200'} font-semibold shadow-sm`}
                      >
                        {ot.is_available ? "Available" : "Occupied"}
                      </Badge>
                    </div>
                  </div>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xl text-slate-900 flex items-center gap-2">
                      <Activity className="h-5 w-5 text-blue-600" />
                      {ot.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="text-center">
                      <div className={`text-2xl font-bold mb-1 ${ot.is_available ? 'text-green-600' : 'text-red-600'}`}>
                        {ot.is_available ? 'Ready' : 'In Use'}
                      </div>
                      <div className="text-slate-500 text-sm">
                        {ot.is_available ? "Available for Surgery" : "Currently Operating"}
                      </div>
                    </div>
                    <div className="text-xs text-slate-500 text-center pt-1">
                      Updated: {new Date(ot.updated_at).toLocaleString()}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          {/* Professional Booking Section */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 max-w-3xl mx-auto">
            <div className="text-center">
              <div className="flex items-center justify-center mb-6">
                <div className="w-14 h-14 rounded-full bg-blue-600 flex items-center justify-center">
                  <Calendar className="h-7 w-7 text-white" />
                </div>
              </div>
              <h2 className="text-3xl font-bold text-slate-900 mb-4">
                Book Hospital Bed
              </h2>
              <div className="w-16 h-1 bg-blue-600 mx-auto mb-6 rounded-full"></div>
              <p className="text-slate-600 mb-8 max-w-2xl mx-auto">
                Secure your hospital bed with our streamlined booking system featuring instant confirmation and integrated payment processing
              </p>
              
              {!user ? (
                <div className="space-y-6 bg-slate-50 rounded-xl p-8">
                  <div className="flex items-center justify-center mb-4">
                    <div className="w-12 h-12 rounded-full bg-slate-200 flex items-center justify-center">
                      <CheckCircle className="h-6 w-6 text-slate-400" />
                    </div>
                  </div>
                  <p className="text-slate-600 font-medium">Please sign in to access our booking system</p>
                  <Button 
                    onClick={handleSignInRedirect} 
                    size="lg" 
                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg shadow-md hover:shadow-lg transition-all duration-300"
                  >
                    Sign In to Book
                  </Button>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="grid md:grid-cols-3 gap-4 mb-6">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <CheckCircle className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                      <p className="text-sm font-medium text-slate-700">Instant Confirmation</p>
                    </div>
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <CheckCircle className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                      <p className="text-sm font-medium text-slate-700">Secure Payment</p>
                    </div>
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <CheckCircle className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                      <p className="text-sm font-medium text-slate-700">24/7 Support</p>
                    </div>
                  </div>
                  <Button 
                    onClick={() => setShowBookingForm(true)} 
                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg shadow-md hover:shadow-lg hover:scale-105 transition-all duration-300" 
                    size="lg"
                  >
                    <Calendar className="h-5 w-5 mr-2" />
                    Book Bed Now
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {showBookingForm && <BedBookingForm isOpen={showBookingForm} onClose={() => setShowBookingForm(false)} onSubmit={handleBookingSubmit} availableBeds={hospitalData.beds} />}

      {showPayment && <PaymentDemo isOpen={showPayment} onClose={() => setShowPayment(false)} onSuccess={handlePaymentSuccess} bookingData={bookingData} />}

      {showConfirmation && <BookingConfirmation isOpen={showConfirmation} onClose={resetBookingFlow} bookingId={bookingId} bookingData={bookingData} />}
    </div>;
};

export default HospitalPage;
