import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Sidebar from "@/components/layout/Sidebar";
import { useTitle } from "@/hooks/use-title";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogFooter,
  DialogTitle
} from "@/components/ui/dialog";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from "@/components/ui/alert-dialog";
import { Search, Check, X, Eye } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAdmin } from "@/hooks/use-admin";

interface VerificationRequest {
  id: string;
  clerk_user_id: string;
  full_name: string;
  medical_license: string;
  phone: string;
  email: string;
  specialization: string;
  years_experience: number;
  hospital_affiliation: string;
  notes: string;
  photo_url: string;
  status: string;
  submitted_at: string;
  reviewed_at: string;
  reviewed_by: string;
}

const AdminDoctorVerificationRequests = () => {
  useTitle("Doctor Verification Requests - Admin Dashboard");
  const navigate = useNavigate();
  const { toast } = useToast();
  const { approveDoctorProfile } = useAdmin();
  
  const [requests, setRequests] = useState<VerificationRequest[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<VerificationRequest[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<VerificationRequest | null>(null);
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [requestToReject, setRequestToReject] = useState<VerificationRequest | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAdminAccess = () => {
      const adminLoggedIn = localStorage.getItem('adminLoggedIn');
      const adminUser = localStorage.getItem('adminUser');
      
      if (adminLoggedIn !== 'true' || adminUser !== 'SUBHODEEP PAL') {
        navigate('/admin-login');
        return false;
      }
      return true;
    };
    
    if (checkAdminAccess()) {
      fetchVerificationRequests();
    }
  }, [navigate]);

  useEffect(() => {
    if (searchQuery) {
      const filtered = requests.filter(request => 
        request.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        request.specialization?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        request.email?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredRequests(filtered);
    } else {
      setFilteredRequests(requests);
    }
  }, [searchQuery, requests]);

  const fetchVerificationRequests = async () => {
    try {
      setIsLoading(true);
      
      console.log('Fetching doctor verification requests...');
      
      // Fetch only pending requests
      const { data, error } = await supabase
        .from('doctor_verification_requests')
        .select('*')
        .eq('status', 'pending')
        .order('submitted_at', { ascending: false });
        
      if (error) {
        console.error('Error fetching verification requests:', error);
        throw error;
      }
      
      console.log('Pending requests:', data);
      console.log('Number of pending requests:', data?.length || 0);
      
      setRequests(data || []);
      setFilteredRequests(data || []);
    } catch (error) {
      console.error('Error fetching verification requests:', error);
      toast({
        title: "Error",
        description: "Failed to load verification requests",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewRequestDetails = (request: VerificationRequest) => {
    setSelectedRequest(request);
    setIsRequestModalOpen(true);
  };

  const handleApproveRequest = async (request: VerificationRequest) => {
    try {
      // Convert request to doctor format for the approval function
      const doctorData = {
        id: request.id,
        type: 'verification',
        display_name: request.full_name,
        full_name: request.full_name,
        email: request.email,
        phone: request.phone,
        specialization: request.specialization,
        hospital_name: request.hospital_affiliation,
        hospital_affiliation: request.hospital_affiliation,
        years_experience: request.years_experience,
        consultation_fee: 150,
        notes: request.notes,
        medical_license: request.medical_license
      };
      
      // Use the approval function from useAdmin hook
      await approveDoctorProfile(doctorData);
      
      // Remove from local state
      const updatedRequests = requests.filter(r => r.id !== request.id);
      setRequests(updatedRequests);
      setFilteredRequests(updatedRequests);
      
      if (selectedRequest?.id === request.id) {
        setIsRequestModalOpen(false);
      }
    } catch (error) {
      console.error('Error approving request:', error);
      // Error handling is done in the approveDoctorProfile function
    }
  };

  const handleRejectRequest = (request: VerificationRequest) => {
    setRequestToReject(request);
    setIsRejectDialogOpen(true);
  };

  const confirmRejectRequest = async () => {
    if (!requestToReject) return;
    
    try {
      const { error } = await supabase
        .from('doctor_verification_requests')
        .update({ status: 'rejected', reviewed_at: new Date().toISOString() })
        .eq('id', requestToReject.id);
      
      if (error) throw error;
      
      const updatedRequests = requests.filter(r => r.id !== requestToReject.id);
      setRequests(updatedRequests);
      setFilteredRequests(updatedRequests);
      
      toast({
        title: "Request Rejected",
        description: `${requestToReject.full_name}'s verification request has been rejected.`
      });
      
      setIsRejectDialogOpen(false);
      setRequestToReject(null);
    } catch (error) {
      console.error('Error rejecting request:', error);
      toast({
        title: "Error",
        description: "Failed to reject verification request",
        variant: "destructive"
      });
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminLoggedIn');
    localStorage.removeItem('adminUser');
    navigate('/admin-login');
    toast({
      title: "Logged out",
      description: "You have been logged out successfully."
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar userRole="admin" />
      
      <div className="flex-1 flex">
        <Sidebar userRole="admin" onLogout={handleLogout} />
        
        <main className="flex-1 p-6 my-[50px] overflow-y-auto">
          <div className="flex flex-col space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold">Doctor Verification Requests</h1>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => navigate('/admin-dashboard')}>
                  Back to Dashboard
                </Button>
                <Button variant="outline" onClick={fetchVerificationRequests}>
                  Refresh
                </Button>
              </div>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Pending Verification Requests</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative mb-6">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                  <Input 
                    type="search" 
                    placeholder="Search by name, specialty, or email..." 
                    className="pl-9"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                
                {isLoading ? (
                  <div className="text-center py-8 text-gray-500">Loading verification requests...</div>
                ) : filteredRequests.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    {searchQuery ? "No verification requests found matching your search" : "No pending verification requests found"}
                    <div className="mt-2 text-sm text-gray-400">
                      Click "Refresh" button to check for new requests
                    </div>
                  </div>
                ) : (
                  <div className="border rounded-lg overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Specialty</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Submitted</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredRequests.map(request => (
                          <TableRow key={request.id}>
                            <TableCell className="font-medium">{request.full_name}</TableCell>
                            <TableCell>{request.specialization}</TableCell>
                            <TableCell>{request.email}</TableCell>
                            <TableCell>{new Date(request.submitted_at).toLocaleDateString()}</TableCell>
                            <TableCell className="text-right space-x-2">
                              <Button size="sm" variant="outline" onClick={() => handleViewRequestDetails(request)}>
                                <Eye className="h-4 w-4 mr-1" />
                                View
                              </Button>
                              <Button size="sm" variant="default" className="bg-green-600 hover:bg-green-700" onClick={() => handleApproveRequest(request)}>
                                <Check className="h-4 w-4 mr-1" />
                                Approve
                              </Button>
                              <Button size="sm" variant="outline" className="text-red-500 hover:text-red-700" onClick={() => handleRejectRequest(request)}>
                                <X className="h-4 w-4 mr-1" />
                                Reject
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>

      {/* Request Details Modal */}
      <Dialog open={isRequestModalOpen} onOpenChange={setIsRequestModalOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Doctor Verification Request Details</DialogTitle>
            <DialogDescription>
              Review the complete information for this verification request
            </DialogDescription>
          </DialogHeader>
          {selectedRequest && (
            <div className="mt-4 space-y-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-medium">{selectedRequest.full_name}</h3>
                  <Badge variant="outline">Pending Review</Badge>
                </div>
                {selectedRequest.photo_url && (
                  <img 
                    src={selectedRequest.photo_url} 
                    alt={selectedRequest.full_name}
                    className="w-20 h-20 rounded-full object-cover"
                  />
                )}
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Medical License</label>
                  <p className="text-sm">{selectedRequest.medical_license}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Specialty</label>
                  <p className="text-sm">{selectedRequest.specialization}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Phone</label>
                  <p className="text-sm">{selectedRequest.phone}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Email</label>
                  <p className="text-sm">{selectedRequest.email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Experience</label>
                  <p className="text-sm">{selectedRequest.years_experience} years</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Hospital Affiliation</label>
                  <p className="text-sm">{selectedRequest.hospital_affiliation || 'Not specified'}</p>
                </div>
              </div>

              {selectedRequest.notes && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Biography</label>
                  <p className="text-sm mt-1">{selectedRequest.notes}</p>
                </div>
              )}

              <div className="flex justify-end space-x-4">
                <Button 
                  variant="outline" 
                  onClick={() => setIsRequestModalOpen(false)}
                >
                  Close
                </Button>
                <Button 
                  variant="default" 
                  className="bg-green-600 hover:bg-green-700"
                  onClick={() => handleApproveRequest(selectedRequest)}
                >
                  <Check className="mr-2 h-4 w-4" />
                  Approve Request
                </Button>
                <Button 
                  variant="outline" 
                  className="text-red-500 hover:text-red-700 border-red-200"
                  onClick={() => {
                    setIsRequestModalOpen(false);
                    handleRejectRequest(selectedRequest);
                  }}
                >
                  <X className="mr-2 h-4 w-4" />
                  Reject
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Reject Request Confirmation */}
      <AlertDialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Rejection</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to reject {requestToReject?.full_name}'s verification request? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmRejectRequest} className="bg-red-600 hover:bg-red-700">
              Yes, reject request
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminDoctorVerificationRequests;
