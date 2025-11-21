
import React, { useState, useEffect } from "react";
import Navbar from "@/components/layout/Navbar";
import Sidebar from "@/components/layout/Sidebar";
import { useTitle } from "@/hooks/use-title";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useUser } from "@clerk/clerk-react";
import CurrentStatus from "@/components/doctor/CurrentStatus";
import AvailabilityToggle from "@/components/doctor/AvailabilityToggle";
import StatusSelector from "@/components/doctor/StatusSelector";
import CustomMessage from "@/components/doctor/CustomMessage";

const DoctorSchedule = () => {
  useTitle("Schedule - Doctor Dashboard");
  const { user } = useUser();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  // Schedule state
  const [isAvailable, setIsAvailable] = useState(true);
  const [availabilityStatus, setAvailabilityStatus] = useState("Available");
  const [availabilityMessage, setAvailabilityMessage] = useState("");

  useEffect(() => {
    if (user?.id) {
      fetchDoctorProfile();
    }
  }, [user]);

  const fetchDoctorProfile = async () => {
    try {
      setIsLoading(true);
      const clerkUserId = user?.id;
      
      console.log('Fetching doctor profile for Clerk user ID:', clerkUserId);
      
      const { data, error } = await supabase
        .from('doctor_profiles')
        .select('*')
        .eq('clerk_user_id', clerkUserId)
        .single();

      if (error) {
        console.error('Error fetching doctor profile:', error);
        
        // If no profile found with clerk_user_id, try to find by email as fallback
        if (error.code === 'PGRST116') {
          console.log('No profile found with clerk_user_id, trying email fallback...');
          const email = user?.emailAddresses?.[0]?.emailAddress;
          
          if (email) {
            const { data: emailData, error: emailError } = await supabase
              .from('doctor_profiles')
              .select('*')
              .eq('email', email)
              .single();

            if (emailError) {
              console.error('No profile found with email either:', emailError);
              toast({
                title: "Profile Not Found",
                description: "Please complete your doctor profile setup first.",
                variant: "destructive"
              });
              return;
            }

            // Update the profile with clerk_user_id for future use
            await supabase
              .from('doctor_profiles')
              .update({ clerk_user_id: clerkUserId })
              .eq('id', emailData.id);

            console.log('Updated profile with clerk_user_id and loaded data:', emailData);
            setIsAvailable(emailData.is_available ?? true);
            setAvailabilityStatus(emailData.availability_status || "Available");
            setAvailabilityMessage(emailData.availability_message || "");
          }
        }
        return;
      }

      if (data) {
        console.log('Profile data loaded:', data);
        setIsAvailable(data.is_available ?? true);
        setAvailabilityStatus(data.availability_status || "Available");
        setAvailabilityMessage(data.availability_message || "");
      }
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "Failed to load your profile. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveSchedule = async () => {
    try {
      setIsSaving(true);
      const clerkUserId = user?.id;
      
      console.log('Updating schedule for Clerk user ID:', clerkUserId);
      console.log('Data to update:', {
        is_available: isAvailable,
        availability_status: availabilityStatus,
        availability_message: availabilityMessage
      });
      
      const { error } = await supabase
        .from('doctor_profiles')
        .update({
          is_available: isAvailable,
          availability_status: availabilityStatus,
          availability_message: availabilityMessage,
          last_availability_update: new Date().toISOString()
        })
        .eq('clerk_user_id', clerkUserId);

      if (error) {
        console.error('Update error:', error);
        throw error;
      }

      console.log('Schedule updated successfully');
      
      toast({
        title: "Success",
        description: "Your schedule has been updated successfully.",
        variant: "default"
      });

      // Refresh the profile data
      fetchDoctorProfile();
    } catch (error) {
      console.error('Error updating schedule:', error);
      toast({
        title: "Error",
        description: "Failed to update schedule. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Navbar userRole="doctor" />
        <div className="flex-1 flex">
          <Sidebar userRole="doctor" className="hidden lg:block" />
          <main className="flex-1 p-6 my-[50px]">
            <div className="text-center py-8">
              <p className="text-gray-500">Loading schedule...</p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar userRole="doctor" />
      
      <div className="flex-1 flex">
        <Sidebar userRole="doctor" className="hidden lg:block" />
        
        <main className="flex-1 p-6 my-[50px]">
          <div className="flex flex-col space-y-6">
            <h1 className="text-2xl font-bold">Schedule Management</h1>

            {/* Current Status Card */}
            <CurrentStatus
              isAvailable={isAvailable}
              availabilityStatus={availabilityStatus}
              availabilityMessage={availabilityMessage}
            />

            {/* Schedule Settings Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Manage Your Availability
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Availability Toggle */}
                <AvailabilityToggle
                  isAvailable={isAvailable}
                  onToggle={setIsAvailable}
                />

                {/* Status Selection */}
                <StatusSelector
                  value={availabilityStatus}
                  onChange={setAvailabilityStatus}
                />

                {/* Custom Message */}
                <CustomMessage
                  value={availabilityMessage}
                  onChange={setAvailabilityMessage}
                />

                {/* Save Button */}
                <Button 
                  onClick={handleSaveSchedule} 
                  disabled={isSaving}
                  className="w-full"
                >
                  {isSaving ? "Saving..." : "Update Schedule"}
                </Button>
              </CardContent>
            </Card>

            {/* Info Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">How it works</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm text-gray-600">
                  <p>• Your availability status is displayed to patients in the "Find Doctors" section</p>
                  <p>• When you're not available, patients will see your status and custom message</p>
                  <p>• You can update your status anytime based on your current situation</p>
                  <p>• Emergency status allows patients to contact you for urgent matters</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
};

export default DoctorSchedule;
