
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Heart } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useUser } from "@clerk/clerk-react";
import { toast } from "sonner";

interface BloodDonorFormProps {
  onClose: () => void;
}

const BloodDonorForm: React.FC<BloodDonorFormProps> = ({ onClose }) => {
  const { user } = useUser();
  const [formData, setFormData] = useState({
    name: "",
    age: "",
    bloodGroup: "",
    mobileNumber: "",
    aadharNumber: "",
    address: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error("Please log in to become a donor");
      return;
    }

    setIsSubmitting(true);
    
    try {
      console.log("Submitting blood donor application for user:", user.id);
      
      const { error } = await supabase
        .from('blood_donors')
        .insert({
          user_id: null, // Set to null since we're using clerk_user_id
          clerk_user_id: user.id, // Add Clerk user ID
          name: formData.name,
          age: parseInt(formData.age),
          blood_group: formData.bloodGroup,
          mobile_number: formData.mobileNumber,
          aadhar_number: formData.aadharNumber,
          address: formData.address,
          status: 'pending',
          is_approved: false
        });

      if (error) {
        console.error("Supabase error:", error);
        throw error;
      }

      console.log("Blood donor application submitted successfully");
      toast.success("Donor application submitted successfully! Admin will review your application.");
      onClose();
    } catch (error) {
      console.error("Error submitting donor application:", error);
      toast.error("Failed to submit application. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="max-w-2xl mx-auto shadow-xl">
      <CardHeader className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-t-lg">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onClose}
            className="text-white hover:bg-white/20"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-3">
            <Heart className="h-6 w-6" />
            <CardTitle className="text-2xl">Become a Donor</CardTitle>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                required
                className="focus:ring-green-500"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="age">Age *</Label>
              <Input
                id="age"
                type="number"
                min="18"
                max="65"
                value={formData.age}
                onChange={(e) => handleInputChange("age", e.target.value)}
                required
                className="focus:ring-green-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Blood Group *</Label>
              <Select value={formData.bloodGroup} onValueChange={(value) => handleInputChange("bloodGroup", value)}>
                <SelectTrigger className="focus:ring-green-500">
                  <SelectValue placeholder="Select your blood group" />
                </SelectTrigger>
                <SelectContent>
                  {bloodGroups.map((group) => (
                    <SelectItem key={group} value={group}>{group}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="mobileNumber">Mobile Number *</Label>
              <Input
                id="mobileNumber"
                type="tel"
                value={formData.mobileNumber}
                onChange={(e) => handleInputChange("mobileNumber", e.target.value)}
                required
                className="focus:ring-green-500"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="aadharNumber">Aadhar Number *</Label>
            <Input
              id="aadharNumber"
              value={formData.aadharNumber}
              onChange={(e) => handleInputChange("aadharNumber", e.target.value)}
              required
              className="focus:ring-green-500"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Address *</Label>
            <Textarea
              id="address"
              value={formData.address}
              onChange={(e) => handleInputChange("address", e.target.value)}
              required
              className="focus:ring-green-500"
            />
          </div>

          <Button 
            type="submit" 
            className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Submitting..." : "Submit Application"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default BloodDonorForm;
