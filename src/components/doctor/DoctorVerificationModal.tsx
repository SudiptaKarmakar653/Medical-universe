
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useUser } from "@clerk/clerk-react";
import { Upload, X } from "lucide-react";

interface DoctorVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const DoctorVerificationModal: React.FC<DoctorVerificationModalProps> = ({ isOpen, onClose }) => {
  const { user } = useUser();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    fullName: user?.fullName || "",
    medicalDegree: "",
    mobileNumber: "",
    email: user?.primaryEmailAddress?.emailAddress || "",
    category: "",
    doctorId: "",
    biography: "",
    hospitalName: "",
    experience: "",
    feeRange: ""
  });

  const categories = [
    "Cardiologist",
    "Dermatologist", 
    "Pediatrician",
    "Orthopedic Surgeon",
    "Neurologist",
    "Ophthalmologist",
    "Endocrinologist",
    "Psychiatrist",
    "Gynecologist",
    "General Practitioner",
    "Surgeon",
    "Anesthesiologist"
  ];

  const experienceLevels = ["1-3 years", "3-5 years", "5-10 years", "10+ years"];
  const feeRanges = ["₹200-₹500", "₹500-₹1000", "₹1000-₹2000", "₹2000-₹5000", "₹5000+"];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setPhotoPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removePhoto = () => {
    setPhotoFile(null);
    setPhotoPreview(null);
  };

  const uploadPhotoToStorage = async (file: File): Promise<string | null> => {
    try {
      const fileName = `doctor-photos/${user?.id}-${Date.now()}.${file.name.split('.').pop()}`;
      
      console.log('Uploading photo to storage with filename:', fileName);

      const { data, error } = await supabase.storage
        .from('doctor-photos')
        .upload(fileName, file);

      if (error) {
        console.error('Photo upload error:', error);
        return null;
      }

      console.log('Photo uploaded successfully:', data);

      const { data: { publicUrl } } = supabase.storage
        .from('doctor-photos')
        .getPublicUrl(fileName);

      console.log('Public URL generated:', publicUrl);
      return publicUrl;
    } catch (error) {
      console.error('Photo upload error:', error);
      return null;
    }
  };

  const handleSubmit = async () => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to submit a verification request.",
        variant: "destructive"
      });
      return;
    }

    // Validate required fields
    if (!formData.fullName || !formData.medicalDegree || !formData.mobileNumber || 
        !formData.email || !formData.category || !formData.doctorId || 
        !formData.hospitalName || !formData.experience || !formData.feeRange) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      let photoUrl = null;
      
      // Upload photo if provided
      if (photoFile) {
        console.log('Uploading photo...');
        photoUrl = await uploadPhotoToStorage(photoFile);
        if (!photoUrl) {
          toast({
            title: "Upload Error",
            description: "Failed to upload photo. Please try again.",
            variant: "destructive"
          });
          setIsSubmitting(false);
          return;
        }
        console.log('Photo uploaded successfully with URL:', photoUrl);
      }

      // Convert experience to number for years_experience field
      const experienceYears = formData.experience === "1-3 years" ? 2 : 
                             formData.experience === "3-5 years" ? 4 :
                             formData.experience === "5-10 years" ? 7 : 10;

      console.log('Submitting doctor verification request with data:', {
        clerk_user_id: user.id,
        full_name: formData.fullName,
        medical_license: formData.doctorId,
        phone: formData.mobileNumber,
        email: formData.email,
        specialization: formData.category,
        years_experience: experienceYears,
        hospital_affiliation: formData.hospitalName,
        notes: `${formData.biography || "Medical professional seeking verification"} | Experience: ${formData.experience} | Fee Range: ${formData.feeRange}`,
        photo_url: photoUrl,
        status: 'pending'
      });

      // Insert verification request with all required fields properly mapped
      const { data, error } = await supabase
        .from('doctor_verification_requests')
        .insert({
          clerk_user_id: user.id,
          full_name: formData.fullName,
          medical_license: formData.doctorId,
          phone: formData.mobileNumber,
          email: formData.email,
          specialization: formData.category,
          years_experience: experienceYears,
          hospital_affiliation: formData.hospitalName,
          notes: `${formData.biography || "Medical professional seeking verification"} | Experience: ${formData.experience} | Fee Range: ${formData.feeRange}`,
          photo_url: photoUrl,
          status: 'pending'
        })
        .select();

      if (error) {
        console.error('Database error:', error);
        toast({
          title: "Submission Error",
          description: "Failed to submit verification request. Please try again.",
          variant: "destructive"
        });
      } else {
        console.log('Successfully inserted verification request:', data);
        toast({
          title: "Request Submitted",
          description: "Your doctor verification request has been submitted successfully. You will be notified once it's reviewed.",
          variant: "default"
        });
        onClose();
        // Reset form
        setFormData({
          fullName: user?.fullName || "",
          medicalDegree: "",
          mobileNumber: "",
          email: user?.primaryEmailAddress?.emailAddress || "",
          category: "",
          doctorId: "",
          biography: "",
          hospitalName: "",
          experience: "",
          feeRange: ""
        });
        setPhotoFile(null);
        setPhotoPreview(null);
      }
    } catch (error) {
      console.error('Submission error:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Join Our Doctor Community</DialogTitle>
          <DialogDescription>
            Submit your verification request to become a verified doctor on our platform.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="fullName">Full Name *</Label>
            <Input
              id="fullName"
              value={formData.fullName}
              onChange={(e) => handleInputChange('fullName', e.target.value)}
              placeholder="Dr. John Smith"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="medicalDegree">Medical Degree *</Label>
            <Input
              id="medicalDegree"
              value={formData.medicalDegree}
              onChange={(e) => handleInputChange('medicalDegree', e.target.value)}
              placeholder="MD, MBBS, DO, etc."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="mobileNumber">Mobile Number *</Label>
            <Input
              id="mobileNumber"
              value={formData.mobileNumber}
              onChange={(e) => handleInputChange('mobileNumber', e.target.value)}
              placeholder="+1 (555) 123-4567"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              placeholder="doctor@example.com"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Medical Specialty *</Label>
            <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select your specialty" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="experience">Years of Experience *</Label>
            <Select value={formData.experience} onValueChange={(value) => handleInputChange('experience', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select your experience level" />
              </SelectTrigger>
              <SelectContent>
                {experienceLevels.map((level) => (
                  <SelectItem key={level} value={level}>
                    {level}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="hospitalName">Hospital/Clinic Name *</Label>
            <Input
              id="hospitalName"
              value={formData.hospitalName}
              onChange={(e) => handleInputChange('hospitalName', e.target.value)}
              placeholder="Enter hospital or clinic name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="feeRange">Consultation Fee Range *</Label>
            <Select value={formData.feeRange} onValueChange={(value) => handleInputChange('feeRange', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select your fee range" />
              </SelectTrigger>
              <SelectContent>
                {feeRanges.map((range) => (
                  <SelectItem key={range} value={range}>
                    {range}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="doctorId">Medical License Number *</Label>
            <Input
              id="doctorId"
              value={formData.doctorId}
              onChange={(e) => handleInputChange('doctorId', e.target.value)}
              placeholder="Your medical license number"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="photo">Profile Photo</Label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
              {photoPreview ? (
                <div className="relative">
                  <img 
                    src={photoPreview} 
                    alt="Preview" 
                    className="w-full h-32 object-cover rounded-lg"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={removePhoto}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="text-center">
                  <Upload className="mx-auto h-8 w-8 text-gray-400" />
                  <div className="mt-2">
                    <label htmlFor="photo" className="cursor-pointer">
                      <span className="text-sm text-blue-600 hover:text-blue-500">
                        Upload a photo
                      </span>
                      <input
                        id="photo"
                        type="file"
                        className="sr-only"
                        accept="image/*"
                        onChange={handlePhotoUpload}
                      />
                    </label>
                  </div>
                  <p className="text-xs text-gray-500">PNG, JPG up to 10MB</p>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="biography">Biography (Optional)</Label>
            <Textarea
              id="biography"
              value={formData.biography}
              onChange={(e) => handleInputChange('biography', e.target.value)}
              placeholder="Tell us about your experience, achievements, and specialties..."
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "Submitting..." : "Submit Request"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DoctorVerificationModal;
