
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAdmin } from "@/hooks/use-admin";
import { Trash2, User, Mail, Phone, MapPin, GraduationCap, Star, AlertTriangle, RefreshCw, Users, ArrowLeft, CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const AdminApprovedDoctors = () => {
  const { toast } = useToast();
  const { removeDoctorProfile } = useAdmin();
  const [doctors, setDoctors] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingIds, setProcessingIds] = useState(new Set());

  useEffect(() => {
    fetchApprovedDoctors();
  }, []);

  const fetchApprovedDoctors = async () => {
    try {
      setIsLoading(true);
      console.log('Fetching approved doctors...');

      const { data: approvedDoctors, error } = await supabase
        .from('doctor_profiles')
        .select('*')
        .eq('is_approved', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching approved doctors:', error);
        throw error;
      }

      const transformedDoctors = (approvedDoctors || []).map(doctor => {
        let doctorName = 'Dr. Medical Professional';
        
        if (doctor.doctor_name && doctor.doctor_name.trim()) {
          doctorName = doctor.doctor_name.startsWith('Dr.') ? doctor.doctor_name : `Dr. ${doctor.doctor_name}`;
        } else if (doctor.email) {
          const emailUsername = doctor.email.split('@')[0];
          doctorName = `Dr. ${emailUsername}`;
        } else if (doctor.specialization) {
          doctorName = `Dr. ${doctor.specialization}`;
        }

        return {
          ...doctor,
          display_name: doctorName,
          hospital_affiliation: doctor.location || doctor.hospital_name || doctor.clinic_name || 'Medical Center'
        };
      });

      console.log('Fetched approved doctors:', transformedDoctors);
      setDoctors(transformedDoctors);
    } catch (error) {
      console.error('Error fetching approved doctors:', error);
      toast({
        title: "Error",
        description: "Failed to load approved doctors",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveDoctor = async (doctorId: string, doctorName: string) => {
    setProcessingIds(prev => new Set(prev).add(doctorId));
    try {
      await removeDoctorProfile(doctorId);
      
      setDoctors(prev => prev.filter(doctor => doctor.id !== doctorId));
      
      toast({
        title: "Success",
        description: `${doctorName} has been removed from the doctors list`
      });
    } catch (error) {
      console.error('Error removing doctor:', error);
      toast({
        title: "Error",
        description: "Failed to remove doctor",
        variant: "destructive"
      });
    } finally {
      setProcessingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(doctorId);
        return newSet;
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-gradient-to-r from-emerald-500 to-blue-600 rounded-xl">
                <Users className="h-8 w-8 text-white" />
              </div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">
                Approved Doctors
              </h2>
            </div>
          </div>
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-emerald-200 border-t-emerald-600 mx-auto mb-4"></div>
              <p className="text-gray-600 text-lg">Loading approved doctors...</p>
              <p className="text-gray-400">Please wait while we fetch the data</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-gradient-to-r from-emerald-500 to-blue-600 rounded-xl shadow-lg">
              <Users className="h-8 w-8 text-white" />
            </div>
            <div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">
                Approved Doctors
              </h2>
              <p className="text-gray-600 mt-1">Manage and remove approved doctors from the platform</p>
            </div>
          </div>
          
          <div className="flex gap-3">
            <Link to="/admin-dashboard/requests">
              <Button 
                variant="outline"
                className="border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all duration-200"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Requests
              </Button>
            </Link>
            <Button 
              variant="outline" 
              onClick={fetchApprovedDoctors}
              className="border-emerald-200 hover:border-emerald-300 hover:bg-emerald-50 transition-all duration-200"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh List
            </Button>
          </div>
        </div>

        {/* Stats Card */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-emerald-100">Total Approved</p>
                  <p className="text-3xl font-bold">{doctors.length}</p>
                </div>
                <CheckCircle className="h-12 w-12 text-emerald-200" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100">Active Doctors</p>
                  <p className="text-3xl font-bold">{doctors.filter(d => d.availability === 'Available').length}</p>
                </div>
                <Users className="h-12 w-12 text-blue-200" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100">Avg Rating</p>
                  <p className="text-3xl font-bold">
                    {doctors.length > 0 ? (doctors.reduce((acc, d) => acc + (d.rating || 4.5), 0) / doctors.length).toFixed(1) : '0.0'}
                  </p>
                </div>
                <Star className="h-12 w-12 text-purple-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Doctors Grid */}
        {doctors.length === 0 ? (
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
            <CardContent className="text-center py-20">
              <div className="mb-6">
                <div className="w-24 h-24 mx-auto bg-gradient-to-r from-emerald-100 to-blue-100 rounded-full flex items-center justify-center mb-4">
                  <User className="h-12 w-12 text-gray-400" />
                </div>
                <h3 className="text-2xl font-bold text-gray-700 mb-2">No approved doctors found</h3>
                <p className="text-gray-500 text-lg">Approved doctors will appear here</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {doctors.map(doctor => (
              <Card key={doctor.id} className="bg-white/80 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02]">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-blue-600 rounded-full flex items-center justify-center">
                        <User className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-xl text-gray-800">{doctor.display_name}</CardTitle>
                        <CardDescription className="text-gray-600">{doctor.specialization}</CardDescription>
                      </div>
                    </div>
                    <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 font-medium">
                      Approved
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 gap-3 text-sm">
                    {doctor.email && (
                      <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                        <Mail className="h-4 w-4 mr-3 text-blue-500" />
                        <span className="font-medium">{doctor.email}</span>
                      </div>
                    )}
                    {doctor.phone && (
                      <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                        <Phone className="h-4 w-4 mr-3 text-green-500" />
                        <span className="font-medium">{doctor.phone}</span>
                      </div>
                    )}
                    {doctor.hospital_affiliation && (
                      <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                        <MapPin className="h-4 w-4 mr-3 text-red-500" />
                        <span className="font-medium">{doctor.hospital_affiliation}</span>
                      </div>
                    )}
                    <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                      <GraduationCap className="h-4 w-4 mr-3 text-purple-500" />
                      <span className="font-medium">{doctor.years_experience || doctor.years_of_experience || 0} years experience</span>
                    </div>
                    {doctor.rating && (
                      <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                        <Star className="h-4 w-4 mr-3 text-yellow-500" />
                        <span className="font-medium">Rating: {doctor.rating}/5</span>
                      </div>
                    )}
                  </div>

                  {doctor.bio && (
                    <div className="p-4 bg-gradient-to-r from-emerald-50 to-blue-50 rounded-lg border border-emerald-100">
                      <p className="text-sm text-gray-700 italic">"{doctor.bio}"</p>
                    </div>
                  )}

                  <div className="flex justify-end pt-4">
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button 
                          variant="outline" 
                          size="sm"
                          disabled={processingIds.has(doctor.id)}
                          className="border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 transition-all duration-200"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          {processingIds.has(doctor.id) ? 'Removing...' : 'Remove Doctor'}
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="bg-white">
                        <AlertDialogHeader>
                          <AlertDialogTitle className="flex items-center text-gray-800">
                            <AlertTriangle className="h-5 w-5 mr-2 text-red-500" />
                            Remove Doctor
                          </AlertDialogTitle>
                          <AlertDialogDescription className="text-gray-600">
                            Are you sure you want to remove <strong>{doctor.display_name}</strong> from the doctors list? 
                            This will remove them from the "Find Doctors" section and they will no longer be visible to patients.
                            This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel className="hover:bg-gray-50">Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleRemoveDoctor(doctor.id, doctor.display_name)}
                            className="bg-red-600 hover:bg-red-700 text-white"
                          >
                            Remove Doctor
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminApprovedDoctors;
