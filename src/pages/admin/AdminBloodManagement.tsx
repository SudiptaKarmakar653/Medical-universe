import React, { useState, useEffect } from "react";
import { useTitle } from "@/hooks/use-title";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Heart, ShoppingCart, Users, Phone, MapPin } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import AdminProtection from "@/components/AdminProtection";
import Navbar from "@/components/layout/Navbar";

interface BloodRequest {
  id: string;
  full_name: string;
  phone_number: string;
  address: string;
  aadhar_number: string;
  blood_group: string;
  emergency_level: string;
  status: string;
  delivery_instructions?: string;
  created_at: string;
  admin_response?: string;
  clerk_user_id?: string;
}

interface BloodDonor {
  id: string;
  name: string;
  age: number;
  blood_group: string;
  mobile_number: string;
  aadhar_number: string;
  address: string;
  status: string;
  is_approved: boolean;
  created_at: string;
  admin_response?: string;
  clerk_user_id?: string;
}

const AdminBloodManagement = () => {
  useTitle("Blood Management - Admin Dashboard");
  const [bloodRequests, setBloodRequests] = useState<BloodRequest[]>([]);
  const [bloodDonors, setBloodDonors] = useState<BloodDonor[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingRequests, setProcessingRequests] = useState<Set<string>>(new Set());
  const [processingDonors, setProcessingDonors] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchBloodRequests();
    fetchBloodDonors();
  }, []);

  const fetchBloodRequests = async () => {
    try {
      const { data, error } = await supabase
        .from('blood_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Error fetching blood requests:", error);
        throw error;
      }
      
      console.log("Fetched blood requests:", data);
      setBloodRequests(data || []);
    } catch (error) {
      console.error("Error fetching blood requests:", error);
      toast.error("Failed to fetch blood requests");
    }
  };

  const fetchBloodDonors = async () => {
    try {
      const { data, error } = await supabase
        .from('blood_donors')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Error fetching blood donors:", error);
        throw error;
      }
      
      setBloodDonors(data || []);
    } catch (error) {
      console.error("Error fetching blood donors:", error);
      toast.error("Failed to fetch blood donors");
    } finally {
      setLoading(false);
    }
  };

  const handleRequestAction = async (requestId: string, action: 'approved' | 'rejected', adminResponse?: string) => {
    if (processingRequests.has(requestId)) {
      return;
    }

    setProcessingRequests(prev => new Set(prev).add(requestId));
    
    try {
      console.log(`Processing blood request ${requestId} with action: ${action}`);
      
      // Use the database function with admin_response parameter
      const { error } = await supabase.rpc('admin_update_blood_request_status', {
        request_id: requestId,
        new_status: action,
        admin_response: adminResponse || `Request ${action} by admin`
      });

      if (error) {
        console.error('Database error:', error);
        throw new Error(`Failed to update request: ${error.message}`);
      }

      console.log('Update successful');
      
      // Update local state immediately
      setBloodRequests(prev => 
        prev.map(request => 
          request.id === requestId 
            ? { ...request, status: action, admin_response: adminResponse || `Request ${action} by admin` }
            : request
        )
      );

      toast.success(`Blood request ${action} successfully`);
      
    } catch (error) {
      console.error("Error updating blood request:", error);
      toast.error(`Failed to ${action} blood request: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setProcessingRequests(prev => {
        const newSet = new Set(prev);
        newSet.delete(requestId);
        return newSet;
      });
    }
  };

  const handleDonorAction = async (donorId: string, action: 'approved' | 'rejected') => {
    if (processingDonors.has(donorId)) {
      return;
    }

    setProcessingDonors(prev => new Set(prev).add(donorId));
    
    try {
      console.log(`Processing blood donor ${donorId} with action: ${action}`);
      
      // Create a database function to update donor status
      const { error } = await supabase.rpc('admin_update_blood_donor_status', {
        donor_id: donorId,
        new_status: action,
        admin_response: `Application ${action} by admin`
      });

      if (error) {
        console.error('RPC function error, trying direct update:', error);
        
        // Fallback to direct update if RPC function doesn't exist
        const updateData = {
          status: action,
          is_approved: action === 'approved',
          admin_response: `Application ${action} by admin`,
          updated_at: new Date().toISOString()
        };

        console.log('Updating donor with data:', updateData);

        const { data: updateResult, error: updateError } = await supabase
          .from('blood_donors')
          .update(updateData)
          .eq('id', donorId)
          .select();

        if (updateError) {
          console.error('Direct update error:', updateError);
          throw updateError;
        }

        console.log('Direct update result:', updateResult);

        if (!updateResult || updateResult.length === 0) {
          throw new Error('Update completed but no data returned');
        }

        // Update local state with the actual returned data
        setBloodDonors(prev => 
          prev.map(donor => 
            donor.id === donorId 
              ? { ...donor, ...updateResult[0] }
              : donor
          )
        );
      } else {
        console.log('RPC function executed successfully');
        
        // Update local state for RPC success
        setBloodDonors(prev => 
          prev.map(donor => 
            donor.id === donorId 
              ? { 
                  ...donor, 
                  status: action, 
                  is_approved: action === 'approved',
                  admin_response: `Application ${action} by admin`,
                  updated_at: new Date().toISOString()
                }
              : donor
          )
        );
      }

      console.log('Donor update successful');
      toast.success(`Donor application ${action} successfully`);
      
    } catch (error) {
      console.error("Error updating blood donor:", error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      
      toast.error(`Failed to ${action} donor application: ${errorMessage}`);
    } finally {
      setProcessingDonors(prev => {
        const newSet = new Set(prev);
        newSet.delete(donorId);
        return newSet;
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getEmergencyColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'critical': return 'bg-red-500 text-white';
      case 'high': return 'bg-orange-500 text-white';
      case 'medium': return 'bg-yellow-500 text-white';
      default: return 'bg-blue-500 text-white';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
      </div>
    );
  }

  return (
    <AdminProtection>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="pt-20 pb-10">
          <div className="container mx-auto px-4">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900">Blood Management</h1>
              <p className="text-gray-600 mt-2">Manage blood requests and donor applications</p>
            </div>

            <Tabs defaultValue="requests" className="space-y-6">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="requests" className="flex items-center gap-2">
                  <ShoppingCart className="h-4 w-4" />
                  Blood Requests ({bloodRequests.filter(r => r.status === 'pending').length})
                </TabsTrigger>
                <TabsTrigger value="donors" className="flex items-center gap-2">
                  <Heart className="h-4 w-4" />
                  Donor Applications ({bloodDonors.filter(d => d.status === 'pending').length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="requests">
                <div className="grid gap-4">
                  {bloodRequests.map((request) => (
                    <Card key={request.id} className="border-l-4 border-l-red-500">
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="flex items-center gap-2">
                              {request.full_name}
                              <Badge className={getEmergencyColor(request.emergency_level)}>
                                {request.emergency_level}
                              </Badge>
                              <Badge className="bg-red-100 text-red-800">
                                {request.blood_group}
                              </Badge>
                            </CardTitle>
                            <p className="text-sm text-gray-500">
                              Submitted on {new Date(request.created_at).toLocaleDateString()}
                            </p>
                          </div>
                          <Badge className={getStatusColor(request.status)}>
                            {request.status}
                          </Badge>
                        </div>
                      </CardHeader>
                      
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4 text-gray-500" />
                            <span>{request.phone_number}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">Aadhar:</span>
                            <span>{request.aadhar_number}</span>
                          </div>
                        </div>
                        
                        <div className="flex items-start gap-2">
                          <MapPin className="h-4 w-4 text-gray-500 mt-1" />
                          <span>{request.address}</span>
                        </div>

                        {request.delivery_instructions && (
                          <div>
                            <span className="font-medium">Delivery Instructions:</span>
                            <p className="text-gray-600 mt-1">{request.delivery_instructions}</p>
                          </div>
                        )}

                        {request.admin_response && (
                          <div>
                            <span className="font-medium">Admin Response:</span>
                            <p className="text-gray-600 mt-1">{request.admin_response}</p>
                          </div>
                        )}

                        {request.status === 'pending' && (
                          <div className="flex gap-2 pt-4">
                            <Button
                              onClick={() => handleRequestAction(request.id, 'approved', 'Request approved. Blood will be delivered within 24 hours.')}
                              className="bg-green-500 hover:bg-green-600 text-white"
                              disabled={processingRequests.has(request.id)}
                            >
                              {processingRequests.has(request.id) ? 'Processing...' : 'Accept'}
                            </Button>
                            <Button
                              variant="outline"
                              onClick={() => handleRequestAction(request.id, 'rejected', 'Request rejected due to unavailability.')}
                              className="border-red-500 text-red-500 hover:bg-red-50"
                              disabled={processingRequests.has(request.id)}
                            >
                              {processingRequests.has(request.id) ? 'Processing...' : 'Reject'}
                            </Button>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}

                  {bloodRequests.length === 0 && (
                    <Card className="text-center py-12">
                      <CardContent>
                        <ShoppingCart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500">No blood requests found</p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="donors">
                <div className="grid gap-4">
                  {bloodDonors.map((donor) => (
                    <Card key={donor.id} className="border-l-4 border-l-green-500">
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="flex items-center gap-2">
                              {donor.name}
                              <Badge className="bg-red-100 text-red-800">
                                {donor.blood_group}
                              </Badge>
                              <span className="text-sm text-gray-500">Age: {donor.age}</span>
                            </CardTitle>
                            <p className="text-sm text-gray-500">
                              Applied on {new Date(donor.created_at).toLocaleDateString()}
                            </p>
                          </div>
                          <Badge className={getStatusColor(donor.status)}>
                            {donor.status}
                          </Badge>
                        </div>
                      </CardHeader>
                      
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4 text-gray-500" />
                            <span>{donor.mobile_number}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">Aadhar:</span>
                            <span>{donor.aadhar_number}</span>
                          </div>
                        </div>
                        
                        <div className="flex items-start gap-2">
                          <MapPin className="h-4 w-4 text-gray-500 mt-1" />
                          <span>{donor.address}</span>
                        </div>

                        {donor.admin_response && (
                          <div>
                            <span className="font-medium">Admin Response:</span>
                            <p className="text-gray-600 mt-1">{donor.admin_response}</p>
                          </div>
                        )}

                        {donor.status === 'pending' && (
                          <div className="flex gap-2 pt-4">
                            <Button
                              onClick={() => handleDonorAction(donor.id, 'approved')}
                              className="bg-green-500 hover:bg-green-600 text-white"
                              disabled={processingDonors.has(donor.id)}
                            >
                              {processingDonors.has(donor.id) ? 'Processing...' : 'Approve'}
                            </Button>
                            <Button
                              variant="outline"
                              onClick={() => handleDonorAction(donor.id, 'rejected')}
                              className="border-red-500 text-red-500 hover:bg-red-50"
                              disabled={processingDonors.has(donor.id)}
                            >
                              {processingDonors.has(donor.id) ? 'Processing...' : 'Reject'}
                            </Button>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}

                  {bloodDonors.length === 0 && (
                    <Card className="text-center py-12">
                      <CardContent>
                        <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500">No donor applications found</p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </AdminProtection>
  );
};

export default AdminBloodManagement;
