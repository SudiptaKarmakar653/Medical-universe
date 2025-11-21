
import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, Phone, MapPin } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Donor {
  id: string;
  name: string;
  blood_group: string;
  mobile_number: string;
  address: string;
  age: number;
}

const AvailableDonors = () => {
  const [donors, setDonors] = useState<Donor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDonors();
  }, []);

  const fetchDonors = async () => {
    try {
      const { data, error } = await supabase
        .from('blood_donors')
        .select('*')
        .eq('is_approved', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDonors(data || []);
    } catch (error) {
      console.error("Error fetching donors:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading available donors...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-3 mb-4">
          <Users className="h-8 w-8 text-red-500" />
          <h2 className="text-3xl font-bold">Available Blood Donors</h2>
        </div>
        <p className="text-gray-600">Connect with verified blood donors in your area</p>
      </div>

      {donors.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No Donors Available</h3>
            <p className="text-gray-500">Be the first to register as a blood donor!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {donors.map((donor) => (
            <Card key={donor.id} className="hover:shadow-lg transition-shadow border-l-4 border-l-red-500">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-semibold">{donor.name}</CardTitle>
                  <Badge variant="secondary" className="bg-red-100 text-red-800 font-bold text-sm">
                    {donor.blood_group}
                  </Badge>
                </div>
                <p className="text-sm text-gray-500">Age: {donor.age}</p>
              </CardHeader>
              
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Phone className="h-4 w-4 text-red-500" />
                  <span>{donor.mobile_number}</span>
                </div>
                
                <div className="flex items-start gap-2 text-sm text-gray-600">
                  <MapPin className="h-4 w-4 text-red-500 mt-0.5" />
                  <span className="flex-1">{donor.address}</span>
                </div>
                
                <Button 
                  className="w-full mt-4 bg-red-500 hover:bg-red-600"
                  onClick={() => window.open(`tel:${donor.mobile_number}`, '_self')}
                >
                  Contact Donor
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default AvailableDonors;
