
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAdmin } from "@/hooks/use-admin";
import { CheckCircle, XCircle, Clock, User, Mail, Phone, MapPin, GraduationCap, RefreshCw, Users, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

const AdminDoctorRequests = () => {
  const { toast } = useToast();
  const { approveDoctorProfile } = useAdmin();
  const [requests, setRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingIds, setProcessingIds] = useState(new Set());

  useEffect(() => {
    fetchDoctorRequests();
  }, []);

  const fetchDoctorRequests = async () => {
    try {
      setIsLoading(true);
      console.log('Fetching pending doctor requests...');

      const { data: verificationRequests, error: verError } = await supabase
        .from('doctor_verification_requests')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (verError) {
        console.error('Error fetching verification requests:', verError);
        throw verError;
      }

      const { data: pendingProfiles, error: profileError } = await supabase
        .from('doctor_profiles')
        .select('*')
        .eq('is_approved', false)
        .order('created_at', { ascending: false });

      if (profileError) {
        console.error('Error fetching pending profiles:', profileError);
        throw profileError;
      }

      const allRequests = [
        ...(verificationRequests || []).map(req => ({
          id: req.id,
          type: 'verification',
          display_name: req.full_name,
          full_name: req.full_name,
          email: req.email,
          specialization: req.specialization,
          years_experience: req.years_experience,
          hospital_name: req.hospital_affiliation,
          hospital_affiliation: req.hospital_affiliation,
          phone: req.phone,
          medical_license: req.medical_license,
          notes: req.notes,
          photo_url: req.photo_url,
          status: req.status,
          created_at: req.created_at,
          consultation_fee: 150
        })),
        ...(pendingProfiles || []).map(profile => ({
          id: profile.id,
          type: 'profile',
          display_name: profile.email ? profile.email.split('@')[0] : `Dr. ${profile.specialization}`,
          full_name: profile.email ? profile.email.split('@')[0] : `Dr. ${profile.specialization}`,
          email: profile.email,
          specialization: profile.specialization,
          years_experience: profile.years_experience || profile.years_of_experience,
          hospital_name: profile.hospital_name || profile.clinic_name,
          hospital_affiliation: profile.hospital_name || profile.clinic_name,
          phone: profile.phone,
          medical_license: profile.medical_license,
          notes: profile.bio,
          photo_url: profile.profile_image_url,
          status: 'pending',
          created_at: profile.created_at,
          consultation_fee: profile.consultation_fee || 150
        }))
      ];

      console.log('Combined pending requests:', allRequests);
      setRequests(allRequests);
    } catch (error) {
      console.error('Error fetching doctor requests:', error);
      toast({
        title: "Error",
        description: "Failed to load doctor requests",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (request: any) => {
    setProcessingIds(prev => new Set(prev).add(request.id));
    try {
      console.log('Approving doctor request:', request);
      await approveDoctorProfile(request);

      setRequests(prev => prev.filter(req => req.id !== request.id));
      toast({
        title: "Success",
        description: `${request.display_name} has been approved as a doctor`
      });
    } catch (error) {
      console.error('Error approving doctor:', error);
      toast({
        title: "Error",
        description: "Failed to approve doctor",
        variant: "destructive"
      });
    } finally {
      setProcessingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(request.id);
        return newSet;
      });
    }
  };

  const handleReject = async (requestId: string, type: string) => {
    setProcessingIds(prev => new Set(prev).add(requestId));
    try {
      if (type === 'verification') {
        const { error } = await supabase
          .from('doctor_verification_requests')
          .update({
            status: 'rejected',
            reviewed_at: new Date().toISOString(),
            reviewed_by: 'SUBHODEEP PAL'
          })
          .eq('id', requestId);
        if (error) throw error;
      } else if (type === 'profile') {
        const { error } = await supabase
          .from('doctor_profiles')
          .delete()
          .eq('id', requestId);
        if (error) throw error;
      }

      setRequests(prev => prev.filter(req => req.id !== requestId));
      toast({
        title: "Request Rejected",
        description: "The doctor request has been rejected"
      });
    } catch (error) {
      console.error('Error rejecting request:', error);
      toast({
        title: "Error",
        description: "Failed to reject request",
        variant: "destructive"
      });
    } finally {
      setProcessingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(requestId);
        return newSet;
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl">
                <Clock className="h-8 w-8 text-white" />
              </div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Doctor Requests
              </h2>
            </div>
          </div>
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600 text-lg">Loading doctor requests...</p>
              <p className="text-gray-400">Please wait while we fetch the data</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl shadow-lg">
              <Clock className="h-8 w-8 text-white" />
            </div>
            <div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Doctor Requests
              </h2>
              <p className="text-gray-600 mt-1">Manage pending doctor verification requests</p>
            </div>
          </div>
          
          <div className="flex gap-3">
            <Button 
              variant="outline" 
              onClick={fetchDoctorRequests}
              className="border-blue-200 hover:border-blue-300 hover:bg-blue-50 transition-all duration-200"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh Requests
            </Button>
            <Link to="/admin-dashboard/approved-doctors">
              <Button 
                className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
              >
                <Users className="h-4 w-4 mr-2" />
                Manage Approved Doctors
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100">Total Requests</p>
                  <p className="text-3xl font-bold">{requests.length}</p>
                </div>
                <Clock className="h-12 w-12 text-blue-200" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100">Verification</p>
                  <p className="text-3xl font-bold">
                    {requests.filter(r => r.type === 'verification').length}
                  </p>
                </div>
                <Sparkles className="h-12 w-12 text-purple-200" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-emerald-100">Profiles</p>
                  <p className="text-3xl font-bold">
                    {requests.filter(r => r.type === 'profile').length}
                  </p>
                </div>
                <User className="h-12 w-12 text-emerald-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Requests Grid */}
        {requests.length === 0 ? (
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
            <CardContent className="text-center py-20">
              <div className="mb-6">
                <div className="w-24 h-24 mx-auto bg-gradient-to-r from-blue-100 to-purple-100 rounded-full flex items-center justify-center mb-4">
                  <Clock className="h-12 w-12 text-gray-400" />
                </div>
                <h3 className="text-2xl font-bold text-gray-700 mb-2">No pending doctor requests</h3>
                <p className="text-gray-500 text-lg">All doctor requests have been processed</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {requests.map(request => (
              <Card key={`${request.type}-${request.id}`} className="bg-white/80 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02]">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                        <User className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-xl text-gray-800">{request.display_name}</CardTitle>
                        <CardDescription className="text-gray-600">{request.specialization}</CardDescription>
                      </div>
                    </div>
                    <Badge 
                      variant="outline" 
                      className={`${
                        request.type === 'verification' 
                          ? 'bg-purple-50 text-purple-700 border-purple-200' 
                          : 'bg-blue-50 text-blue-700 border-blue-200'
                      } font-medium`}
                    >
                      {request.type === 'verification' ? 'Verification' : 'Profile'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 gap-3 text-sm">
                    <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                      <Mail className="h-4 w-4 mr-3 text-blue-500" />
                      <span className="font-medium">{request.email}</span>
                    </div>
                    {request.phone && (
                      <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                        <Phone className="h-4 w-4 mr-3 text-green-500" />
                        <span className="font-medium">{request.phone}</span>
                      </div>
                    )}
                    {request.hospital_affiliation && (
                      <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                        <MapPin className="h-4 w-4 mr-3 text-red-500" />
                        <span className="font-medium">{request.hospital_affiliation}</span>
                      </div>
                    )}
                    <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                      <GraduationCap className="h-4 w-4 mr-3 text-purple-500" />
                      <span className="font-medium">{request.years_experience} years experience</span>
                    </div>
                    {request.medical_license && (
                      <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                        <User className="h-4 w-4 mr-3 text-orange-500" />
                        <span className="font-medium">License: {request.medical_license}</span>
                      </div>
                    )}
                  </div>

                  {request.notes && (
                    <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-100">
                      <p className="text-sm text-gray-700 italic">"{request.notes}"</p>
                    </div>
                  )}

                  <div className="flex space-x-3 pt-4">
                    <Button 
                      onClick={() => handleApprove(request)} 
                      disabled={processingIds.has(request.id)} 
                      className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      {processingIds.has(request.id) ? 'Approving...' : 'Approve'}
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => handleReject(request.id, request.type)} 
                      disabled={processingIds.has(request.id)}
                      className="border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 transition-all duration-200"
                    >
                      <XCircle className="h-4 w-4 mr-1" />
                      Reject
                    </Button>
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

export default AdminDoctorRequests;
