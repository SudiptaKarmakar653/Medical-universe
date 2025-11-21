
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
import BloodPaymentDemo from "./BloodPaymentDemo";

interface BloodRequestFormProps {
  onClose: () => void;
}

const BloodRequestForm: React.FC<BloodRequestFormProps> = ({ onClose }) => {
  const { user } = useUser();
  const [formData, setFormData] = useState({
    fullName: "",
    phoneNumber: "",
    address: "",
    aadharNumber: "",
    bloodGroup: "",
    emergencyLevel: "",
    deliveryInstructions: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPayment, setShowPayment] = useState(false);

  const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
  const emergencyLevels = ["Low", "Medium", "High", "Critical"];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    if (!formData.fullName || !formData.phoneNumber || !formData.address || 
        !formData.aadharNumber || !formData.bloodGroup || !formData.emergencyLevel) {
      toast.error("Please fill in all required fields");
      return false;
    }
    return true;
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error("Please log in to submit a blood request");
      return;
    }

    if (!validateForm()) {
      return;
    }

    // Show payment modal instead of directly submitting
    setShowPayment(true);
  };

  const handlePaymentSuccess = async () => {
    setShowPayment(false);
    setIsSubmitting(true);
    
    try {
      // Submit the request after successful payment
      const { error } = await supabase
        .from('blood_requests')
        .insert({
          user_id: null,
          clerk_user_id: user.id,
          full_name: formData.fullName,
          phone_number: formData.phoneNumber,
          address: formData.address,
          aadhar_number: formData.aadharNumber,
          blood_group: formData.bloodGroup,
          emergency_level: formData.emergencyLevel,
          delivery_instructions: formData.deliveryInstructions,
          status: 'pending'
        });

      if (error) {
        console.error("Supabase error:", error);
        throw error;
      }

      toast.success("Blood request submitted successfully! Admin will review your request.");
      onClose();
    } catch (error) {
      console.error("Error submitting blood request:", error);
      toast.error("Failed to submit request. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Card className="max-w-2xl mx-auto shadow-xl">
        <CardHeader className="bg-gradient-to-r from-red-500 to-red-600 text-white rounded-t-lg">
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
              <CardTitle className="text-2xl">Request Blood</CardTitle>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="p-6">
          <form onSubmit={handleFormSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name *</Label>
                <Input
                  id="fullName"
                  value={formData.fullName}
                  onChange={(e) => handleInputChange("fullName", e.target.value)}
                  required
                  className="focus:ring-red-500"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phoneNumber">Phone Number *</Label>
                <Input
                  id="phoneNumber"
                  type="tel"
                  value={formData.phoneNumber}
                  onChange={(e) => handleInputChange("phoneNumber", e.target.value)}
                  required
                  className="focus:ring-red-500"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Address *</Label>
              <Textarea
                id="address"
                value={formData.address}
                onChange={(e) => handleInputChange("address", e.target.value)}
                required
                className="focus:ring-red-500"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="aadharNumber">Aadhar Number *</Label>
                <Input
                  id="aadharNumber"
                  value={formData.aadharNumber}
                  onChange={(e) => handleInputChange("aadharNumber", e.target.value)}
                  required
                  className="focus:ring-red-500"
                />
              </div>

              <div className="space-y-2">
                <Label>Required Blood Group *</Label>
                <Select value={formData.bloodGroup} onValueChange={(value) => handleInputChange("bloodGroup", value)}>
                  <SelectTrigger className="focus:ring-red-500">
                    <SelectValue placeholder="Select blood group" />
                  </SelectTrigger>
                  <SelectContent>
                    {bloodGroups.map((group) => (
                      <SelectItem key={group} value={group}>{group}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Emergency Level *</Label>
              <Select value={formData.emergencyLevel} onValueChange={(value) => handleInputChange("emergencyLevel", value)}>
                <SelectTrigger className="focus:ring-red-500">
                  <SelectValue placeholder="Select emergency level" />
                </SelectTrigger>
                <SelectContent>
                  {emergencyLevels.map((level) => (
                    <SelectItem key={level} value={level}>{level}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="deliveryInstructions">Delivery Instructions (Optional)</Label>
              <Textarea
                id="deliveryInstructions"
                value={formData.deliveryInstructions}
                onChange={(e) => handleInputChange("deliveryInstructions", e.target.value)}
                placeholder="Any special instructions for delivery..."
                className="focus:ring-red-500"
              />
            </div>

            {/* Payment Notice */}
            <div className="bg-red-50 p-4 rounded-lg border border-red-200">
              <h3 className="font-medium text-red-800 mb-2">Payment Information</h3>
              <p className="text-sm text-red-600">
                Blood request processing fee: <span className="font-bold">₹500</span> (Fixed rate for any blood group)
              </p>
              <p className="text-xs text-red-500 mt-1">
                Payment is required to process your blood request
              </p>
            </div>

            <Button 
              type="submit" 
              className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Submitting..." : "Proceed to Payment"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Payment Modal */}
      <BloodPaymentDemo 
        isOpen={showPayment}
        onClose={() => setShowPayment(false)}
        onSuccess={handlePaymentSuccess}
        requestData={formData}
      />
    </>
  );
};

export default BloodRequestForm;
