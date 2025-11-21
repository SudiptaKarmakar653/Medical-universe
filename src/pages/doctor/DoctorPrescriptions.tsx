import React, { useState, useEffect } from "react";
import Navbar from "@/components/layout/Navbar";
import Sidebar from "@/components/layout/Sidebar";
import { useTitle } from "@/hooks/use-title";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FilePen, Mail, Calendar, User, Pill, Search, Eye } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useUser } from "@clerk/clerk-react";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
interface Prescription {
  id: string;
  patient_name: string;
  patient_email: string;
  medications: string;
  prescription_notes: string;
  prescription_date: string;
  sent_via_email: boolean;
  created_at: string;
}
const DoctorPrescriptions = () => {
  useTitle("Prescriptions - Doctor Dashboard");
  const {
    user
  } = useUser();
  const {
    toast
  } = useToast();
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [filteredPrescriptions, setFilteredPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [doctorProfile, setDoctorProfile] = useState(null);
  useEffect(() => {
    if (user?.id) {
      fetchDoctorProfile();
    }
  }, [user]);
  useEffect(() => {
    if (doctorProfile?.id) {
      fetchPrescriptions();
    }
  }, [doctorProfile]);
  useEffect(() => {
    filterPrescriptions();
  }, [prescriptions, searchTerm]);
  const fetchDoctorProfile = async () => {
    try {
      const clerkUserId = user?.id;
      const email = user?.emailAddresses?.[0]?.emailAddress;

      // First try with clerk_user_id
      let {
        data: profileByClerkId,
        error: clerkError
      } = await supabase.from('doctor_profiles').select('*').eq('clerk_user_id', clerkUserId).single();
      if (clerkError && clerkError.code === 'PGRST116' && email) {
        // Fallback to email if clerk_user_id not found
        const {
          data: profileByEmail,
          error: emailError
        } = await supabase.from('doctor_profiles').select('*').eq('email', email).single();
        if (!emailError && profileByEmail) {
          // Update profile with clerk_user_id for future use
          await supabase.from('doctor_profiles').update({
            clerk_user_id: clerkUserId
          }).eq('id', profileByEmail.id);
          setDoctorProfile(profileByEmail);
        }
      } else if (!clerkError && profileByClerkId) {
        setDoctorProfile(profileByClerkId);
      }
    } catch (error) {
      console.error('Error fetching doctor profile:', error);
    }
  };
  const fetchPrescriptions = async () => {
    try {
      setLoading(true);
      const {
        data,
        error
      } = await supabase.from('prescriptions').select('*').eq('doctor_id', doctorProfile.id).order('created_at', {
        ascending: false
      });
      if (error) {
        console.error('Error fetching prescriptions:', error);
        toast({
          title: "Error",
          description: "Failed to load prescriptions",
          variant: "destructive"
        });
        return;
      }
      setPrescriptions(data || []);
    } catch (error) {
      console.error('Error fetching prescriptions:', error);
      toast({
        title: "Error",
        description: "Failed to load prescriptions",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  const filterPrescriptions = () => {
    if (!searchTerm.trim()) {
      setFilteredPrescriptions(prescriptions);
      return;
    }
    const filtered = prescriptions.filter(prescription => prescription.patient_name?.toLowerCase().includes(searchTerm.toLowerCase()) || prescription.patient_email?.toLowerCase().includes(searchTerm.toLowerCase()) || prescription.medications?.toLowerCase().includes(searchTerm.toLowerCase()));
    setFilteredPrescriptions(filtered);
  };
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  return <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar userRole="doctor" />
      
      <div className="flex-1 flex">
        <Sidebar userRole="doctor" className="hidden lg:block" />
        
        <main className="flex-1 p-6 my-[50px]">
          <div className="flex flex-col space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold">Prescriptions Management</h1>
              <Badge variant="outline" className="text-sm">
                Total: {prescriptions.length}
              </Badge>
            </div>

            {/* Search Bar */}
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input placeholder="Search by patient name, email, or medication..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-10" />
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FilePen className="h-5 w-5" />
                  Sent Prescriptions ({filteredPrescriptions.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? <div className="text-center py-8">
                    <p className="text-gray-500">Loading prescriptions...</p>
                  </div> : filteredPrescriptions.length > 0 ? <div className="space-y-4">
                    {filteredPrescriptions.map(prescription => <div key={prescription.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <User className="h-4 w-4 text-blue-600" />
                              <span className="font-medium">{prescription.patient_name || 'Unknown Patient'}</span>
                              {prescription.sent_via_email && <Badge variant="secondary" className="bg-green-100 text-green-800">
                                  <Mail className="h-3 w-3 mr-1" />
                                  Email Sent
                                </Badge>}
                            </div>
                            
                            {prescription.patient_email && <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                                <Mail className="h-3 w-3" />
                                {prescription.patient_email}
                              </div>}
                            
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                              <Calendar className="h-3 w-3" />
                              {formatDate(prescription.created_at)}
                            </div>
                          </div>
                          
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="outline" size="sm">
                                <Eye className="h-4 w-4 mr-2" />
                                View Details
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                              <DialogHeader>
                                <DialogTitle>Prescription Details</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div>
                                  <h4 className="font-medium mb-2 flex items-center gap-2">
                                    <User className="h-4 w-4" />
                                    Patient Information
                                  </h4>
                                  <div className="bg-gray-50 p-3 rounded-lg">
                                    <p><strong>Name:</strong> {prescription.patient_name}</p>
                                    <p><strong>Email:</strong> {prescription.patient_email}</p>
                                    <p><strong>Date:</strong> {formatDate(prescription.created_at)}</p>
                                  </div>
                                </div>
                                
                                <div>
                                  <h4 className="font-medium mb-2 flex items-center gap-2">
                                    <Pill className="h-4 w-4" />
                                    Medications
                                  </h4>
                                  <div className="bg-gray-50 p-3 rounded-lg">
                                    <p className="whitespace-pre-wrap">{prescription.medications || 'No medications listed'}</p>
                                  </div>
                                </div>
                                
                                {prescription.prescription_notes && <div>
                                    <h4 className="font-medium mb-2">Doctor's Notes</h4>
                                    <div className="bg-gray-50 p-3 rounded-lg">
                                      <p className="whitespace-pre-wrap">{prescription.prescription_notes}</p>
                                    </div>
                                  </div>}
                              </div>
                            </DialogContent>
                          </Dialog>
                        </div>
                        
                        <div className="border-t pt-3">
                          <div className="flex items-start gap-2">
                            <Pill className="h-4 w-4 text-green-600 mt-0.5" />
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-700 mb-1">Medications:</p>
                              <p className="text-sm text-gray-600 line-clamp-2">
                                {prescription.medications || 'Digital prescription sent'}
                              </p>
                            </div>
                          </div>
                          
                          {prescription.prescription_notes && <div className="flex items-start gap-2 mt-2">
                              <FilePen className="h-4 w-4 text-blue-600 mt-0.5" />
                              <div className="flex-1">
                                <p className="text-sm font-medium text-gray-700 mb-1">Notes:</p>
                                <p className="text-sm text-gray-600 line-clamp-2">
                                  {prescription.prescription_notes}
                                </p>
                              </div>
                            </div>}
                        </div>
                      </div>)}
                  </div> : <div className="text-center py-8">
                    <FilePen className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                    <p className="text-gray-500 text-lg">
                      {searchTerm ? 'No prescriptions match your search' : 'No prescriptions sent yet'}
                    </p>
                    <p className="text-gray-400 text-sm mt-2">
                      {searchTerm ? 'Try adjusting your search terms' : 'Prescriptions you send to patients will appear here'}
                    </p>
                    {searchTerm && <Button variant="outline" className="mt-3" onClick={() => setSearchTerm('')}>
                        Clear Search
                      </Button>}
                  </div>}
              </CardContent>
            </Card>

            {/* Debug Information */}
            {doctorProfile && <Card className="bg-blue-50 border-blue-200">
                
                
              </Card>}
          </div>
        </main>
      </div>
    </div>;
};
export default DoctorPrescriptions;