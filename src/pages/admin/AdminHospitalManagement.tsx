import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Bed, Activity, Users, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import PageLayout from "@/components/layout/PageLayout";

interface BedData {
  id: string;
  bed_type: string;
  total_beds: number;
  available_beds: number;
  created_at: string;
  updated_at: string;
}

interface OperationTheaterData {
  id: string;
  name: string;
  is_available: boolean;
  created_at: string;
  updated_at: string;
}

interface BookingData {
  id: string;
  booking_id: string;
  patient_name: string;
  patient_age: number;
  patient_gender: string;
  disease: string;
  preferred_bed_type: string;
  is_emergency: boolean;
  payment_status: string;
  admission_status: string;
  created_at: string;
}

const AdminHospitalManagement = () => {
  const { toast } = useToast();
  const [beds, setBeds] = useState<BedData[]>([]);
  const [operationTheaters, setOperationTheaters] = useState<OperationTheaterData[]>([]);
  const [bookings, setBookings] = useState<BookingData[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  // Deduplication function for beds - keep the most recently updated record for each bed_type
  const deduplicateBeds = (bedsData: BedData[]): BedData[] => {
    const bedMap = new Map<string, BedData>();
    
    bedsData.forEach(bed => {
      const existingBed = bedMap.get(bed.bed_type);
      if (!existingBed || new Date(bed.updated_at) > new Date(existingBed.updated_at)) {
        bedMap.set(bed.bed_type, bed);
      }
    });
    
    return Array.from(bedMap.values());
  };

  // Deduplication function for operation theaters - keep the most recently updated record for each name
  const deduplicateOperationTheaters = (otData: OperationTheaterData[]): OperationTheaterData[] => {
    const otMap = new Map<string, OperationTheaterData>();
    
    otData.forEach(ot => {
      const existingOt = otMap.get(ot.name);
      if (!existingOt || new Date(ot.updated_at) > new Date(existingOt.updated_at)) {
        otMap.set(ot.name, ot);
      }
    });
    
    return Array.from(otMap.values());
  };

  const fetchHospitalData = async () => {
    try {
      console.log('AdminHospitalManagement: Fetching hospital data...');
      setLoading(true);
      
      // Fetch beds data with explicit ordering
      const { data: bedsData, error: bedsError } = await supabase
        .from('hospital_beds')
        .select('*')
        .order('bed_type');

      if (bedsError) {
        console.error('AdminHospitalManagement: Error fetching beds:', bedsError);
        throw bedsError;
      }

      console.log('AdminHospitalManagement: Raw beds data from DB:', bedsData);

      // Fetch operation theaters data
      const { data: otData, error: otError } = await supabase
        .from('operation_theater')
        .select('*')
        .order('name');

      if (otError) {
        console.error('AdminHospitalManagement: Error fetching OTs:', otError);
        throw otError;
      }

      console.log('AdminHospitalManagement: Raw OT data:', otData);

      // Fetch bookings data
      const { data: bookingsData, error: bookingsError } = await supabase
        .from('bed_bookings')
        .select('*')
        .order('created_at', { ascending: false });

      if (bookingsError) {
        console.error('AdminHospitalManagement: Error fetching bookings:', bookingsError);
        throw bookingsError;
      }

      console.log('AdminHospitalManagement: Bookings data:', bookingsData);

      // Apply deduplication logic
      const uniqueBeds = deduplicateBeds(bedsData || []);
      const uniqueOTs = deduplicateOperationTheaters(otData || []);

      console.log('AdminHospitalManagement: Deduplicated beds:', uniqueBeds);
      console.log('AdminHospitalManagement: Deduplicated OTs:', uniqueOTs);

      // Update state with deduplicated data
      setBeds(uniqueBeds);
      setOperationTheaters(uniqueOTs);
      setBookings(bookingsData || []);

      console.log('AdminHospitalManagement: Data set successfully');
    } catch (error) {
      console.error('AdminHospitalManagement: Error in fetchHospitalData:', error);
      toast({
        title: "Error",
        description: "Failed to load hospital data. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log('AdminHospitalManagement: Component mounted');
    fetchHospitalData();
  }, []);

  const updateBedCount = async (bedId: string, field: 'total_beds' | 'available_beds', value: number) => {
    try {
      console.log(`AdminHospitalManagement: Updating bed ${bedId} ${field} to ${value}`);
      setUpdating(`${bedId}-${field}`);
      
      // Validate the update
      if (field === 'available_beds') {
        const bed = beds.find(b => b.id === bedId);
        if (bed && value > bed.total_beds) {
          toast({
            title: "Invalid Value",
            description: "Available beds cannot exceed total beds.",
            variant: "destructive"
          });
          return;
        }
      }

      // Update directly in Supabase using the admin function
      const { error: functionError } = await supabase.rpc('admin_update_bed_count', {
        bed_id: bedId,
        field_name: field,
        new_value: value
      });

      if (functionError) {
        console.error('AdminHospitalManagement: Function error:', functionError);
        // Fallback to direct update if function fails
        const { error: directError } = await supabase
          .from('hospital_beds')
          .update({ 
            [field]: value,
            updated_at: new Date().toISOString()
          })
          .eq('id', bedId);

        if (directError) {
          console.error('AdminHospitalManagement: Direct update error:', directError);
          throw directError;
        }
      }

      console.log('AdminHospitalManagement: Update successful');

      // Show success message
      toast({
        title: "Success",
        description: `${field === 'total_beds' ? 'Total' : 'Available'} beds updated successfully`,
      });

      // Force refresh data from database to ensure consistency
      await fetchHospitalData();

    } catch (error) {
      console.error('AdminHospitalManagement: Error updating bed count:', error);
      toast({
        title: "Error",
        description: "Failed to update bed count. Please try again.",
        variant: "destructive"
      });
      
      // Refresh data to show current state
      await fetchHospitalData();
    } finally {
      setUpdating(null);
    }
  };

  const updateOperationTheaterStatus = async (otId: string, isAvailable: boolean) => {
    try {
      console.log(`AdminHospitalManagement: Updating OT ${otId} availability to ${isAvailable}`);
      setUpdating(`${otId}-status`);
      
      // Update using admin function first
      const { error: functionError } = await supabase.rpc('admin_update_ot_status', {
        ot_id: otId,
        new_status: isAvailable
      });

      if (functionError) {
        console.error('AdminHospitalManagement: OT function error:', functionError);
        // Fallback to direct update
        const { error: directError } = await supabase
          .from('operation_theater')
          .update({ 
            is_available: isAvailable,
            updated_at: new Date().toISOString()
          })
          .eq('id', otId);

        if (directError) {
          console.error('AdminHospitalManagement: OT direct update error:', directError);
          throw directError;
        }
      }

      console.log('AdminHospitalManagement: OT update successful');

      toast({
        title: "Success",
        description: "Operation theater status updated successfully",
      });

      // Force refresh data from database
      await fetchHospitalData();

    } catch (error) {
      console.error('AdminHospitalManagement: Error updating OT status:', error);
      toast({
        title: "Error",
        description: "Failed to update operation theater status. Please try again.",
        variant: "destructive"
      });
      
      // Refresh data to show current state
      await fetchHospitalData();
    } finally {
      setUpdating(null);
    }
  };

  const updateBookingStatus = async (bookingId: string, status: string) => {
    try {
      console.log(`AdminHospitalManagement: Updating booking ${bookingId} status to ${status}`);
      
      const { data, error } = await supabase
        .from('bed_bookings')
        .update({ 
          admission_status: status,
          updated_at: new Date().toISOString()
        })
        .eq('id', bookingId)
        .select();

      if (error) {
        console.error('AdminHospitalManagement: Error updating booking status:', error);
        throw error;
      }

      console.log('AdminHospitalManagement: Booking status update successful:', data);

      // Update local state
      setBookings(prev => prev.map(booking => 
        booking.id === bookingId ? { ...booking, admission_status: status } : booking
      ));

      toast({
        title: "Success",
        description: "Booking status updated successfully",
      });
    } catch (error) {
      console.error('AdminHospitalManagement: Error updating booking status:', error);
      toast({
        title: "Error",
        description: "Failed to update booking status. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleInputBlur = (bedId: string, field: 'total_beds' | 'available_beds', value: string) => {
    const numValue = parseInt(value) || 0;
    const currentBed = beds.find(b => b.id === bedId);
    
    if (currentBed && currentBed[field] !== numValue) {
      updateBedCount(bedId, field, numValue);
    }
  };

  if (loading) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-medical-aqua mx-auto mb-4"></div>
            <p className="text-gray-600">Loading hospital management...</p>
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Hospital Management</h1>
            <p className="text-gray-600">Manage bed availability and operation theater status</p>
          </div>
          <Button onClick={fetchHospitalData} variant="outline" className="flex items-center gap-2" disabled={loading}>
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh Data
          </Button>
        </div>

        {/* Bed Management */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bed className="h-5 w-5 text-medical-aqua" />
              Bed Management
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              {beds.map((bed) => (
                <div key={bed.id} className="p-4 border rounded-lg space-y-4">
                  <h3 className="font-semibold text-lg">{bed.bed_type} Beds</h3>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor={`total-${bed.id}`}>Total Beds</Label>
                      <Input
                        id={`total-${bed.id}`}
                        type="number"
                        defaultValue={bed.total_beds}
                        onBlur={(e) => handleInputBlur(bed.id, 'total_beds', e.target.value)}
                        disabled={updating === `${bed.id}-total_beds`}
                        min="0"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`available-${bed.id}`}>Available Beds</Label>
                      <Input
                        id={`available-${bed.id}`}
                        type="number"
                        defaultValue={bed.available_beds}
                        onBlur={(e) => handleInputBlur(bed.id, 'available_beds', e.target.value)}
                        disabled={updating === `${bed.id}-available_beds`}
                        min="0"
                        max={bed.total_beds}
                      />
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center pt-2">
                    <span className="text-sm text-gray-600">
                      Occupancy: {bed.total_beds - bed.available_beds}/{bed.total_beds}
                    </span>
                    <Badge variant={bed.available_beds > 0 ? "default" : "destructive"}>
                      {bed.available_beds > 0 ? "Available" : "Full"}
                    </Badge>
                  </div>
                  <div className="text-xs text-gray-500">
                    Last updated: {new Date(bed.updated_at).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Operation Theater Management */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-medical-aqua" />
              Operation Theater Management
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {operationTheaters.map((ot) => (
                <div key={ot.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h3 className="font-semibold">{ot.name}</h3>
                    <p className="text-sm text-gray-600">
                      Status: {ot.is_available ? "Available" : "Occupied"}
                    </p>
                    <div className="text-xs text-gray-500">
                      Last updated: {new Date(ot.updated_at).toLocaleString()}
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <Badge variant={ot.is_available ? "default" : "destructive"}>
                      {ot.is_available ? "Available" : "Occupied"}
                    </Badge>
                    <div className="flex items-center gap-2">
                      <Label htmlFor={`ot-${ot.id}`}>Available</Label>
                      <Switch
                        id={`ot-${ot.id}`}
                        checked={ot.is_available}
                        onCheckedChange={(checked) => updateOperationTheaterStatus(ot.id, checked)}
                        disabled={updating === `${ot.id}-status`}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Booking Requests */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-medical-aqua" />
              Recent Booking Requests
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Booking ID</TableHead>
                    <TableHead>Patient Name</TableHead>
                    <TableHead>Age/Gender</TableHead>
                    <TableHead>Bed Type</TableHead>
                    <TableHead>Emergency</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bookings.slice(0, 10).map((booking) => (
                    <TableRow key={booking.id}>
                      <TableCell className="font-medium">{booking.booking_id}</TableCell>
                      <TableCell>{booking.patient_name}</TableCell>
                      <TableCell>{booking.patient_age}/{booking.patient_gender}</TableCell>
                      <TableCell>{booking.preferred_bed_type}</TableCell>
                      <TableCell>
                        <Badge variant={booking.is_emergency ? "destructive" : "secondary"}>
                          {booking.is_emergency ? "Emergency" : "Regular"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={
                            booking.admission_status === 'confirmed' ? "default" :
                            booking.admission_status === 'pending' ? "secondary" : "destructive"
                          }
                        >
                          {booking.admission_status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(booking.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          {booking.admission_status === 'pending' && (
                            <>
                              <Button
                                size="sm"
                                onClick={() => updateBookingStatus(booking.id, 'confirmed')}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => updateBookingStatus(booking.id, 'rejected')}
                              >
                                Reject
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            {bookings.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No booking requests found
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
};

export default AdminHospitalManagement;
