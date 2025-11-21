
import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Phone, MapPin, FileText, CheckCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

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
}

const ApprovedBloodReceipts = () => {
  const [approvedRequests, setApprovedRequests] = useState<BloodRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApprovedRequests();
  }, []);

  const fetchApprovedRequests = async () => {
    try {
      const { data, error } = await supabase
        .from('blood_requests')
        .select('*')
        .eq('status', 'approved')
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Error fetching approved requests:", error);
        throw error;
      }
      
      setApprovedRequests(data || []);
    } catch (error) {
      console.error("Error fetching approved requests:", error);
    } finally {
      setLoading(false);
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
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading approved requests...</p>
      </div>
    );
  }

  if (approvedRequests.length === 0) {
    return (
      <Card className="text-center py-12">
        <CardContent>
          <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-600 mb-2">No Approved Requests</h3>
          <p className="text-gray-500">No blood requests have been approved yet.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-3 mb-4">
          <CheckCircle className="h-8 w-8 text-green-500" />
          <h2 className="text-3xl font-bold">Approved Blood Request Receipts</h2>
        </div>
        <p className="text-gray-600">View confirmed blood delivery receipts</p>
      </div>

      <div className="grid gap-6">
        {approvedRequests.map((request) => (
          <Card key={request.id} className="border-l-4 border-l-green-500 bg-gradient-to-r from-green-50 to-white">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    {request.full_name}
                    <Badge className={getEmergencyColor(request.emergency_level)}>
                      {request.emergency_level}
                    </Badge>
                    <Badge className="bg-red-100 text-red-800">
                      {request.blood_group}
                    </Badge>
                  </CardTitle>
                  <p className="text-sm text-gray-500">
                    Approved on {new Date(request.created_at).toLocaleDateString()}
                  </p>
                </div>
                <Badge className="bg-green-100 text-green-800 font-semibold">
                  <CheckCircle className="h-4 w-4 mr-1" />
                  APPROVED
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
                <div className="bg-blue-50 p-3 rounded-lg">
                  <span className="font-medium text-blue-800">Delivery Instructions:</span>
                  <p className="text-blue-700 mt-1">{request.delivery_instructions}</p>
                </div>
              )}

              {request.admin_response && (
                <div className="bg-green-50 p-3 rounded-lg">
                  <span className="font-medium text-green-800">Confirmation Message:</span>
                  <p className="text-green-700 mt-1">{request.admin_response}</p>
                </div>
              )}

              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-sm text-gray-600">
                  <strong>Receipt ID:</strong> {request.id.slice(0, 8).toUpperCase()}
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  <strong>Status:</strong> Blood request has been approved and will be processed according to the admin response above.
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ApprovedBloodReceipts;
