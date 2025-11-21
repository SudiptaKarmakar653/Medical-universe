
import React, { useState, useEffect } from "react";
import Navbar from "@/components/layout/Navbar";
import Sidebar from "@/components/layout/Sidebar";
import { useTitle } from "@/hooks/use-title";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Download, Eye, Calendar, Pill, ShoppingCart } from "lucide-react";
import { useAuth } from "@/context/auth-provider";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Prescription {
  id: string;
  doctor_id: string;
  patient_name: string;
  patient_email: string;
  medications: string;
  instructions: string;
  prescription_date: string;
  sent_via_email: boolean;
  doctor_profiles?: {
    doctor_name: string;
    specialization: string;
  };
}

const PatientPrescriptions = () => {
  useTitle("My Prescriptions - Medical Universe");
  const { user } = useAuth();
  const { toast } = useToast();
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPrescriptions();
  }, [user]);

  const fetchPrescriptions = async () => {
    if (!user?.primaryEmailAddress?.emailAddress) {
      setLoading(false);
      return;
    }

    try {
      console.log('Fetching prescriptions for user email:', user.primaryEmailAddress.emailAddress);
      
      const { data, error } = await supabase
        .from('prescriptions')
        .select(`
          *,
          doctor_profiles (
            doctor_name,
            specialization
          )
        `)
        .eq('patient_email', user.primaryEmailAddress.emailAddress)
        .order('prescription_date', { ascending: false });

      if (error) {
        console.error('Error fetching prescriptions:', error);
        toast({
          title: "Error",
          description: "Failed to load prescriptions. Please try again.",
          variant: "destructive"
        });
        return;
      }

      console.log('Fetched prescriptions:', data);
      setPrescriptions(data || []);
    } catch (error) {
      console.error('Error fetching prescriptions:', error);
      toast({
        title: "Error", 
        description: "Failed to load prescriptions. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const parseMedications = (medicationsString: string) => {
    try {
      const medications = JSON.parse(medicationsString);
      return Array.isArray(medications) ? medications : [];
    } catch {
      // If not JSON, treat as simple string and create a single medication
      return [{
        name: medicationsString,
        dosage: "As prescribed",
        duration: "As prescribed"
      }];
    }
  };

  const getStatusColor = (prescription: Prescription) => {
    const prescriptionDate = new Date(prescription.prescription_date);
    const daysSinceIssued = Math.floor((Date.now() - prescriptionDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysSinceIssued <= 30) {
      return "bg-green-100 text-green-800";
    } else if (daysSinceIssued <= 60) {
      return "bg-yellow-100 text-yellow-800";
    } else {
      return "bg-red-100 text-red-800";
    }
  };

  const getStatus = (prescription: Prescription) => {
    const prescriptionDate = new Date(prescription.prescription_date);
    const daysSinceIssued = Math.floor((Date.now() - prescriptionDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysSinceIssued <= 30) {
      return "Active";
    } else if (daysSinceIssued <= 60) {
      return "Expiring";
    } else {
      return "Expired";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Navbar userRole="patient" />
        
        <div className="flex-1 flex">
          <Sidebar userRole="patient" className="hidden lg:block" />
          
          <main className="flex-1 p-6">
            <div className="bg-zinc-200 my-[70px] p-6 rounded-lg">
              <div className="flex justify-center items-center py-12">
                <div className="text-gray-500">Loading prescriptions...</div>
              </div>
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
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold">My Prescriptions</h1>
              <Button variant="outline" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Upload Prescription
              </Button>
            </div>

            {/* Prescriptions List */}
            <div className="space-y-6">
              {prescriptions.map((prescription) => {
                const medications = parseMedications(prescription.medications);
                const doctorName = prescription.doctor_profiles?.doctor_name || "Unknown Doctor";
                const specialty = prescription.doctor_profiles?.specialization || "General Medicine";
                
                return (
                  <Card key={prescription.id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">{doctorName}</CardTitle>
                          <CardDescription>{specialty}</CardDescription>
                          <div className="flex items-center mt-2 text-gray-600">
                            <Calendar className="h-4 w-4 mr-2" />
                            <span>{new Date(prescription.prescription_date).toLocaleDateString()}</span>
                          </div>
                          {prescription.sent_via_email && (
                            <Badge variant="outline" className="mt-2 bg-green-50 text-green-700 border-green-200">
                              Email Sent
                            </Badge>
                          )}
                        </div>
                        <Badge className={getStatusColor(prescription)}>
                          {getStatus(prescription)}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {/* Medications */}
                        <div>
                          <h4 className="font-semibold mb-3 flex items-center">
                            <Pill className="h-4 w-4 mr-2" />
                            Medications ({medications.length})
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {medications.map((med, index) => (
                              <div key={index} className="bg-white p-3 rounded-lg border">
                                <p className="font-medium">{med.name}</p>
                                <p className="text-sm text-gray-600">Dosage: {med.dosage}</p>
                                <p className="text-sm text-gray-600">Duration: {med.duration}</p>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Instructions */}
                        {prescription.instructions && (
                          <div>
                            <h4 className="font-semibold mb-2">Instructions</h4>
                            <p className="text-gray-700 bg-blue-50 p-3 rounded-lg">
                              {prescription.instructions}
                            </p>
                          </div>
                        )}

                        {/* Actions */}
                        <div className="flex flex-wrap gap-2">
                          <Button variant="outline" className="flex items-center gap-2">
                            <Eye className="h-4 w-4" />
                            View Full Prescription
                          </Button>
                          <Button variant="outline" className="flex items-center gap-2">
                            <Download className="h-4 w-4" />
                            Download PDF
                          </Button>
                          <Button className="flex items-center gap-2">
                            <ShoppingCart className="h-4 w-4" />
                            Order Medicines
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {prescriptions.length === 0 && (
              <div className="text-center py-12">
                <FileText className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500 mb-4">No prescriptions found.</p>
                <Button>Upload Your First Prescription</Button>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default PatientPrescriptions;
