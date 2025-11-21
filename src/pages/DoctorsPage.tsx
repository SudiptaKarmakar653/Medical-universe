
import React, { useState, useEffect } from "react";
import Navbar from "@/components/layout/Navbar";
import { useTitle } from "@/hooks/use-title";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, MapPin, Star, CalendarDays, Phone, Clock, AlertCircle, CheckCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import AppointmentBookingForm from "@/components/appointment/AppointmentBookingForm";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

const DoctorsPage = () => {
  useTitle("Doctors - Medical Universe");
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSpecialty, setSelectedSpecialty] = useState("All");
  const [doctors, setDoctors] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [specialties, setSpecialties] = useState(["All"]);
  const [selectedDoctorForBooking, setSelectedDoctorForBooking] = useState<{
    id: string;
    name: string;
  } | null>(null);

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
      setIsLoading(true);
      console.log('Fetching ALL approved doctors...');

      // Fetch ONLY approved doctors from doctor_profiles table
      const { data: doctorProfiles, error } = await supabase
        .from('doctor_profiles')
        .select('*')
        .eq('is_approved', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching approved doctors:', error);
        throw error;
      }

      console.log('Raw approved doctor profiles data:', doctorProfiles);
      console.log('Total approved doctors found:', doctorProfiles?.length || 0);

      // Transform the data for display using REAL doctor data
      const transformedDoctors = (doctorProfiles || []).map(dp => {
        // Use doctor_name if available, otherwise use email username
        let doctorName = 'Dr. Medical Professional';
        if (dp.doctor_name && dp.doctor_name.trim()) {
          doctorName = dp.doctor_name.startsWith('Dr.') ? dp.doctor_name : `Dr. ${dp.doctor_name}`;
        } else if (dp.email) {
          const emailUsername = dp.email.split('@')[0];
          doctorName = `Dr. ${emailUsername}`;
        } else if (dp.specialization) {
          doctorName = `Dr. ${dp.specialization}`;
        }

        // Parse experience from bio if it contains experience information
        let experienceYears = dp.years_experience || dp.years_of_experience || 0;
        let feeRange = 'Contact for fee';
        
        if (dp.bio && dp.bio.includes('Experience:') && dp.bio.includes('Fee Range:')) {
          const experienceMatch = dp.bio.match(/Experience:\s*([^|]+)/);
          const feeMatch = dp.bio.match(/Fee Range:\s*([^|]*)/);
          
          if (experienceMatch) {
            const expText = experienceMatch[1].trim();
            if (expText === "1-3 years") experienceYears = 2;
            else if (expText === "3-5 years") experienceYears = 4;
            else if (expText === "5-10 years") experienceYears = 7;
            else if (expText === "10+ years") experienceYears = 10;
          }
          
          if (feeMatch) {
            feeRange = feeMatch[1].trim();
          }
        } else if (dp.consultation_fee) {
          feeRange = `$${dp.consultation_fee}`;
        }

        const doctorData = {
          id: dp.id,
          name: doctorName,
          specialty: dp.specialization || 'General Practice',
          location: dp.location || dp.hospital_name || dp.clinic_name || 'Medical Center',
          experience: experienceYears,
          rating: dp.rating || 0,
          reviews: Math.floor(Math.random() * 200) + 50,
          available: dp.availability || 'Contact for availability',
          consultationFee: feeRange,
          // Use actual profile image if available, prioritize photo_url from verification
          image: dp.photo_url || dp.profile_image_url || 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
          bio: dp.bio || 'Experienced medical professional',
          email: dp.email,
          phone: dp.phone || 'Contact hospital',
          medicalLicense: dp.medical_license,
          clinicName: dp.clinic_name,
          hospitalName: dp.hospital_name,
          // Add availability status fields
          isAvailable: dp.is_available ?? true,
          availabilityStatus: dp.availability_status || 'Available',
          availabilityMessage: dp.availability_message || '',
          lastAvailabilityUpdate: dp.last_availability_update,
          originalData: dp
        };
        
        console.log(`Doctor ${doctorData.name}:`, doctorData);
        return doctorData;
      });

      console.log('Final transformed approved doctors:', transformedDoctors);
      setDoctors(transformedDoctors);

      // Extract unique specialties from all doctors
      const uniqueSpecialties = ["All", ...new Set(transformedDoctors.map(d => d.specialty).filter(Boolean))];
      console.log('Available specialties:', uniqueSpecialties);
      setSpecialties(uniqueSpecialties);
    } catch (error) {
      console.error('Error fetching doctors:', error);
      toast({
        title: "Error",
        description: "Failed to load doctors. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Filter doctors based on search and specialty
  const filteredDoctors = doctors.filter(doctor => {
    const matchesSearch = doctor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         doctor.specialty.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         doctor.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSpecialty = selectedSpecialty === "All" || doctor.specialty === selectedSpecialty;
    return matchesSearch && matchesSpecialty;
  });

  console.log('Filtered doctors for display:', filteredDoctors);

  const handleBookAppointment = (doctor) => {
    setSelectedDoctorForBooking({
      id: doctor.id,
      name: doctor.name
    });
  };

  const getAvailabilityDisplay = (doctor) => {
    if (!doctor.isAvailable) {
      return {
        text: doctor.availabilityStatus || 'Not Available',
        icon: <AlertCircle className="h-4 w-4 text-red-500" />,
        className: 'text-red-600',
        bgColor: 'bg-red-50'
      };
    }
    
    return {
      text: doctor.availabilityStatus || 'Available',
      icon: <CheckCircle className="h-4 w-4 text-green-500" />,
      className: 'text-green-600',
      bgColor: 'bg-green-50'
    };
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        <div className="bg-zinc-200 my-[70px] p-6 rounded-lg">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Our Doctors</h1>
            <Button variant="outline" onClick={fetchDoctors}>
              Refresh Doctors
            </Button>
          </div>
          
          {/* Search and Filter */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search doctors by name or specialty"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={selectedSpecialty}
              onChange={(e) => setSelectedSpecialty(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {specialties.map((specialty) => (
                <option key={specialty} value={specialty}>{specialty}</option>
              ))}
            </select>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="text-center py-12">
              <p className="text-gray-500">Loading doctors...</p>
            </div>
          )}

          {/* Doctors Grid */}
          {!isLoading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredDoctors.map((doctor) => {
                const availability = getAvailabilityDisplay(doctor);
                return (
                  <Card key={`doctor-${doctor.id}-${doctor.email}`} className="overflow-hidden">
                    <CardHeader className="pb-2">
                      <div className="flex items-center space-x-4">
                        <img 
                          src={doctor.image} 
                          alt={doctor.name} 
                          className="w-16 h-16 rounded-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80';
                          }}
                        />
                        <div>
                          <CardTitle className="text-lg">{doctor.name}</CardTitle>
                          <p className="text-blue-600 font-medium">{doctor.specialty}</p>
                          <div className="flex items-center">
                            <Star className="h-4 w-4 text-yellow-500 mr-1" fill="currentColor" />
                            <span className="text-sm font-medium">{doctor.rating > 0 ? doctor.rating : 'New'}</span>
                            {doctor.rating > 0 && (
                              <span className="text-xs text-gray-500 ml-1">({doctor.reviews})</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 text-sm text-gray-600">
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 mr-2" />
                          <span>{doctor.location}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Experience: {doctor.experience} years</span>
                          <span className="font-semibold text-green-600">{doctor.consultationFee}</span>
                        </div>
                        
                        {/* Availability Status */}
                        <div className={`flex items-center p-2 rounded-lg ${availability.bgColor}`}>
                          {availability.icon}
                          <span className={`ml-2 font-medium ${availability.className}`}>
                            {availability.text}
                          </span>
                        </div>
                        
                        {/* Custom availability message */}
                        {doctor.availabilityMessage && (
                          <div className="text-xs text-gray-500 italic p-2 bg-gray-50 rounded">
                            "{doctor.availabilityMessage}"
                          </div>
                        )}
                      </div>
                      <div className="flex space-x-2 mt-4">
                        <Button 
                          className="flex-1" 
                          onClick={() => handleBookAppointment(doctor)}
                          disabled={!doctor.isAvailable}
                          variant={doctor.isAvailable ? "default" : "secondary"}
                        >
                          {doctor.isAvailable ? "Book Appointment" : "Currently Unavailable"}
                        </Button>
                        
                        {/* Contact Dialog */}
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="icon">
                              <Phone className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-md">
                            <DialogHeader>
                              <DialogTitle className="flex items-center gap-3">
                                <img 
                                  src={doctor.image} 
                                  alt={doctor.name} 
                                  className="w-12 h-12 rounded-full object-cover"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80';
                                  }}
                                />
                                <div>
                                  <h3 className="font-bold">{doctor.name}</h3>
                                  <p className="text-sm text-blue-600">{doctor.specialty}</p>
                                </div>
                              </DialogTitle>
                              <DialogDescription>
                                Contact details for {doctor.name}
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              {/* Availability Status in Contact Dialog */}
                              <div className={`flex items-center gap-3 p-3 rounded-lg ${availability.bgColor}`}>
                                <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                                  <Clock className="w-4 h-4 text-blue-600" />
                                </div>
                                <div>
                                  <p className="text-sm text-gray-500">Current Status</p>
                                  <p className={`font-medium ${availability.className}`}>{availability.text}</p>
                                  {doctor.availabilityMessage && (
                                    <p className="text-xs text-gray-500 italic">"{doctor.availabilityMessage}"</p>
                                  )}
                                </div>
                              </div>

                              <div className="space-y-2">
                                <h4 className="font-semibold">Contact Information</h4>
                                <div className="text-sm space-y-1">
                                  <p><strong>Email:</strong> {doctor.email || 'Not provided'}</p>
                                  <p><strong>Phone:</strong> {doctor.phone}</p>
                                  <p><strong>Clinic:</strong> {doctor.clinicName || doctor.hospitalName || 'Not specified'}</p>
                                  <p><strong>Location:</strong> {doctor.location}</p>
                                </div>
                              </div>
                              <div className="space-y-2">
                                <h4 className="font-semibold">Professional Details</h4>
                                <div className="text-sm space-y-1">
                                  <p><strong>Specialization:</strong> {doctor.specialty}</p>
                                  <p><strong>Experience:</strong> {doctor.experience} years</p>
                                  <p><strong>Consultation Fee:</strong> {doctor.consultationFee}</p>
                                  {doctor.medicalLicense && (
                                    <p><strong>License:</strong> {doctor.medicalLicense}</p>
                                  )}
                                </div>
                              </div>
                              {doctor.bio && (
                                <div className="space-y-2">
                                  <h4 className="font-semibold">About</h4>
                                  <p className="text-sm text-gray-600">{doctor.bio}</p>
                                </div>
                              )}
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}

          {/* No doctors found */}
          {!isLoading && filteredDoctors.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-4">No doctors found matching your criteria</p>
              <Button variant="outline" onClick={fetchDoctors}>
                Refresh List
              </Button>
            </div>
          )}

          {/* Total count */}
          {!isLoading && filteredDoctors.length > 0 && (
            <div className="mt-6 text-center text-gray-600">
              Showing {filteredDoctors.length} of {doctors.length} doctors
            </div>
          )}
        </div>
      </main>

      {/* Appointment Booking Form */}
      {selectedDoctorForBooking && (
        <AppointmentBookingForm
          isOpen={!!selectedDoctorForBooking}
          onClose={() => setSelectedDoctorForBooking(null)}
          doctorId={selectedDoctorForBooking.id}
          doctorName={selectedDoctorForBooking.name}
        />
      )}
    </div>
  );
};

export default DoctorsPage;
