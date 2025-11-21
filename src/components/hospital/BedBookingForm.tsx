
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Upload, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface BedBookingFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  availableBeds: Array<{
    id: string;
    bed_type: string;
    total_beds: number;
    available_beds: number;
  }>;
}

const BedBookingForm: React.FC<BedBookingFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  availableBeds
}) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    age: "",
    gender: "",
    disease: "",
    bedType: "",
    isEmergency: false,
    medicalReport: null as File | null
  });
  const [uploading, setUploading] = useState(false);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Invalid File Type",
        description: "Please upload a PDF or image file (JPEG, PNG)",
        variant: "destructive"
      });
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "Please upload a file smaller than 5MB",
        variant: "destructive"
      });
      return;
    }

    setFormData(prev => ({ ...prev, medicalReport: file }));
    toast({
      title: "File Uploaded",
      description: `${file.name} has been selected`,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.name || !formData.age || !formData.gender || !formData.disease || !formData.bedType) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    // Check if selected bed type is available
    const selectedBed = availableBeds.find(bed => bed.bed_type === formData.bedType);
    if (!selectedBed || selectedBed.available_beds === 0) {
      toast({
        title: "Bed Not Available",
        description: "The selected bed type is currently not available",
        variant: "destructive"
      });
      return;
    }

    setUploading(true);
    
    try {
      let medicalReportUrl = null;
      
      // Handle file upload (simulated for demo)
      if (formData.medicalReport) {
        // In a real app, you would upload to Supabase Storage
        medicalReportUrl = `medical-reports/${Date.now()}-${formData.medicalReport.name}`;
      }

      const bookingData = {
        ...formData,
        age: parseInt(formData.age),
        medicalReportUrl
      };

      onSubmit(bookingData);
    } catch (error) {
      console.error('Error processing form:', error);
      toast({
        title: "Error",
        description: "Failed to process booking form",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[95vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="text-2xl text-center text-medical-aqua">
            Book Hospital Bed
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-1">
          <form onSubmit={handleSubmit} className="space-y-6 pb-4">
            {/* Personal Information */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Enter your full name"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="age">Age *</Label>
                <Input
                  id="age"
                  type="number"
                  value={formData.age}
                  onChange={(e) => handleInputChange('age', e.target.value)}
                  placeholder="Enter your age"
                  min="1"
                  max="120"
                  required
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="gender">Gender *</Label>
                <Select value={formData.gender} onValueChange={(value) => handleInputChange('gender', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Male">Male</SelectItem>
                    <SelectItem value="Female">Female</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="bedType">Preferred Bed Type *</Label>
                <Select value={formData.bedType} onValueChange={(value) => handleInputChange('bedType', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select bed type" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableBeds.map((bed) => (
                      <SelectItem 
                        key={bed.id} 
                        value={bed.bed_type}
                        disabled={bed.available_beds === 0}
                      >
                        {bed.bed_type} ({bed.available_beds} available)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Medical Information */}
            <div className="space-y-2">
              <Label htmlFor="disease">Disease/Condition *</Label>
              <Textarea
                id="disease"
                value={formData.disease}
                onChange={(e) => handleInputChange('disease', e.target.value)}
                placeholder="Describe your medical condition or reason for admission"
                rows={3}
                required
              />
            </div>

            {/* Emergency Status */}
            <div className="flex items-center space-x-3 p-4 bg-red-50 rounded-lg">
              <Switch
                checked={formData.isEmergency}
                onCheckedChange={(checked) => handleInputChange('isEmergency', checked)}
              />
              <div>
                <Label className="text-red-700 font-medium">Emergency Case</Label>
                <p className="text-sm text-red-600">
                  Check this if you need immediate medical attention
                </p>
              </div>
            </div>

            {/* Medical Report Upload */}
            <div className="space-y-2">
              <Label htmlFor="medicalReport">Medical Report (Optional)</Label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                <div className="text-center">
                  <Upload className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="mt-4">
                    <label htmlFor="file-upload" className="cursor-pointer">
                      <span className="mt-2 block text-sm font-medium text-gray-900">
                        {formData.medicalReport ? formData.medicalReport.name : "Upload medical report"}
                      </span>
                      <span className="mt-1 block text-xs text-gray-500">
                        PDF, JPEG, PNG up to 5MB
                      </span>
                    </label>
                    <input 
                      id="file-upload" 
                      name="file-upload" 
                      type="file" 
                      className="sr-only"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={handleFileUpload}
                    />
                  </div>
                </div>
                {formData.medicalReport && (
                  <div className="mt-4 flex items-center justify-center text-green-600">
                    <FileText className="h-4 w-4 mr-2" />
                    <span className="text-sm">File selected: {formData.medicalReport.name}</span>
                  </div>
                )}
              </div>
            </div>
          </form>
        </div>

        {/* Submit Buttons - Fixed at bottom */}
        <div className="flex-shrink-0 flex gap-4 pt-4 border-t">
          <Button type="button" variant="outline" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit}
            className="flex-1 bg-gradient-med hover:shadow-lg"
            disabled={uploading}
          >
            {uploading ? "Processing..." : "Proceed to Payment"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BedBookingForm;
