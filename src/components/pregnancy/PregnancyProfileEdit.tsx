
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Edit, Save, X, User, Heart, Users } from 'lucide-react';
import { useAuth } from '@/context/auth-provider';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface PregnancyProfileEditProps {
  pregnancyProfile: any;
  patientProfile: any;
  onProfileUpdated: (updatedProfile: any) => void;
}

const PregnancyProfileEdit: React.FC<PregnancyProfileEditProps> = ({
  pregnancyProfile,
  patientProfile,
  onProfileUpdated
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    // Pregnancy profile data
    dueDate: '',
    currentWeek: 1,
    language: 'english',
    partnerName: '',
    partnerPhone: '',
    partnerEmail: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    // Patient profile data
    medicalHistory: '',
    allergies: '',
    bloodGroup: '',
    emergencyContact: '',
    dateOfBirth: ''
  });

  // Initialize form data when props change
  useEffect(() => {
    setFormData({
      dueDate: pregnancyProfile?.due_date || '',
      currentWeek: pregnancyProfile?.current_week || 1,
      language: pregnancyProfile?.language_preference || 'english',
      partnerName: pregnancyProfile?.partner_name || '',
      partnerPhone: pregnancyProfile?.partner_phone || '',
      partnerEmail: pregnancyProfile?.partner_email || '',
      emergencyContactName: pregnancyProfile?.emergency_contact_name || '',
      emergencyContactPhone: pregnancyProfile?.emergency_contact_phone || '',
      medicalHistory: patientProfile?.medical_history || '',
      allergies: patientProfile?.allergies || '',
      bloodGroup: patientProfile?.blood_group || '',
      emergencyContact: patientProfile?.emergency_contact || '',
      dateOfBirth: patientProfile?.date_of_birth || ''
    });
  }, [pregnancyProfile, patientProfile]);

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    if (!user?.id) {
      toast({
        title: "Error",
        description: "User not authenticated",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      // Update pregnancy profile
      const { error: pregnancyError } = await supabase
        .from('pregnancy_profiles')
        .update({
          due_date: formData.dueDate || null,
          current_week: formData.currentWeek,
          language_preference: formData.language,
          partner_name: formData.partnerName || null,
          partner_phone: formData.partnerPhone || null,
          partner_email: formData.partnerEmail || null,
          emergency_contact_name: formData.emergencyContactName || null,
          emergency_contact_phone: formData.emergencyContactPhone || null,
          updated_at: new Date().toISOString()
        })
        .eq('patient_id', user.id);

      if (pregnancyError) {
        console.error('Pregnancy profile update error:', pregnancyError);
        throw pregnancyError;
      }

      // Update or create patient profile
      const { error: patientError } = await supabase
        .from('patient_profiles')
        .upsert({
          id: user.id,
          medical_history: formData.medicalHistory || null,
          allergies: formData.allergies || null,
          blood_group: formData.bloodGroup || null,
          emergency_contact: formData.emergencyContact || null,
          date_of_birth: formData.dateOfBirth || null,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'id'
        });

      if (patientError) {
        console.error('Patient profile update error:', patientError);
        throw patientError;
      }

      toast({
        title: "Success!",
        description: "Your profile has been updated successfully!"
      });

      setIsEditing(false);
      onProfileUpdated(formData);
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    // Reset form data to original values
    setFormData({
      dueDate: pregnancyProfile?.due_date || '',
      currentWeek: pregnancyProfile?.current_week || 1,
      language: pregnancyProfile?.language_preference || 'english',
      partnerName: pregnancyProfile?.partner_name || '',
      partnerPhone: pregnancyProfile?.partner_phone || '',
      partnerEmail: pregnancyProfile?.partner_email || '',
      emergencyContactName: pregnancyProfile?.emergency_contact_name || '',
      emergencyContactPhone: pregnancyProfile?.emergency_contact_phone || '',
      medicalHistory: patientProfile?.medical_history || '',
      allergies: patientProfile?.allergies || '',
      bloodGroup: patientProfile?.blood_group || '',
      emergencyContact: patientProfile?.emergency_contact || '',
      dateOfBirth: patientProfile?.date_of_birth || ''
    });
    setIsEditing(false);
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            My Pregnancy Profile
          </CardTitle>
          <div className="flex gap-2">
            {isEditing ? (
              <>
                <Button 
                  onClick={handleSave} 
                  disabled={loading} 
                  size="sm" 
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Save className="h-4 w-4 mr-1" />
                  {loading ? 'Saving...' : 'Save'}
                </Button>
                <Button onClick={handleCancel} variant="outline" size="sm" disabled={loading}>
                  <X className="h-4 w-4 mr-1" />
                  Cancel
                </Button>
              </>
            ) : (
              <Button onClick={() => setIsEditing(true)} variant="outline" size="sm">
                <Edit className="h-4 w-4 mr-1" />
                Edit Profile
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Pregnancy Information */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <Heart className="h-5 w-5 text-pink-600" />
            <h3 className="font-semibold text-lg">Pregnancy Information</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="dueDate">Due Date</Label>
              <Input
                id="dueDate"
                type="date"
                value={formData.dueDate}
                onChange={(e) => handleInputChange('dueDate', e.target.value)}
                disabled={!isEditing}
              />
            </div>
            
            <div>
              <Label htmlFor="currentWeek">Current Week</Label>
              <Input
                id="currentWeek"
                type="number"
                min="1"
                max="42"
                value={formData.currentWeek}
                onChange={(e) => handleInputChange('currentWeek', parseInt(e.target.value) || 1)}
                disabled={!isEditing}
              />
            </div>
            
            <div>
              <Label htmlFor="language">Language Preference</Label>
              <Select 
                value={formData.language} 
                onValueChange={(value) => handleInputChange('language', value)}
                disabled={!isEditing}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="english">English</SelectItem>
                  <SelectItem value="bengali">Bengali</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="dateOfBirth">Date of Birth</Label>
              <Input
                id="dateOfBirth"
                type="date"
                value={formData.dateOfBirth}
                onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                disabled={!isEditing}
              />
            </div>
          </div>
        </div>

        {/* Partner Information */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <Users className="h-5 w-5 text-blue-600" />
            <h3 className="font-semibold text-lg">Partner Information</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="partnerName">Partner Name</Label>
              <Input
                id="partnerName"
                value={formData.partnerName}
                onChange={(e) => handleInputChange('partnerName', e.target.value)}
                disabled={!isEditing}
                placeholder="Enter partner's name"
              />
            </div>
            
            <div>
              <Label htmlFor="partnerPhone">Partner Phone</Label>
              <Input
                id="partnerPhone"
                value={formData.partnerPhone}
                onChange={(e) => handleInputChange('partnerPhone', e.target.value)}
                disabled={!isEditing}
                placeholder="Enter partner's phone number"
              />
            </div>
            
            <div className="md:col-span-2">
              <Label htmlFor="partnerEmail">Partner Email</Label>
              <Input
                id="partnerEmail"
                type="email"
                value={formData.partnerEmail}
                onChange={(e) => handleInputChange('partnerEmail', e.target.value)}
                disabled={!isEditing}
                placeholder="Enter partner's email"
              />
            </div>
          </div>
        </div>

        {/* Medical Information */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <Heart className="h-5 w-5 text-red-600" />
            <h3 className="font-semibold text-lg">Medical Information</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="bloodGroup">Blood Group</Label>
              <Select 
                value={formData.bloodGroup} 
                onValueChange={(value) => handleInputChange('bloodGroup', value)}
                disabled={!isEditing}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select blood group" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="A+">A+</SelectItem>
                  <SelectItem value="A-">A-</SelectItem>
                  <SelectItem value="B+">B+</SelectItem>
                  <SelectItem value="B-">B-</SelectItem>
                  <SelectItem value="AB+">AB+</SelectItem>
                  <SelectItem value="AB-">AB-</SelectItem>
                  <SelectItem value="O+">O+</SelectItem>
                  <SelectItem value="O-">O-</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="emergencyContact">Emergency Contact</Label>
              <Input
                id="emergencyContact"
                value={formData.emergencyContact}
                onChange={(e) => handleInputChange('emergencyContact', e.target.value)}
                disabled={!isEditing}
                placeholder="Emergency contact number"
              />
            </div>
            
            <div className="md:col-span-2">
              <Label htmlFor="allergies">Allergies</Label>
              <Textarea
                id="allergies"
                value={formData.allergies}
                onChange={(e) => handleInputChange('allergies', e.target.value)}
                disabled={!isEditing}
                placeholder="List any known allergies"
                rows={3}
              />
            </div>
            
            <div className="md:col-span-2">
              <Label htmlFor="medicalHistory">Medical History</Label>
              <Textarea
                id="medicalHistory"
                value={formData.medicalHistory}
                onChange={(e) => handleInputChange('medicalHistory', e.target.value)}
                disabled={!isEditing}
                placeholder="Describe your medical history"
                rows={4}
              />
            </div>
          </div>
        </div>

        {/* Emergency Contact */}
        <div className="space-y-4">
          <h3 className="font-semibold text-lg">Emergency Contact</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="emergencyContactName">Emergency Contact Name</Label>
              <Input
                id="emergencyContactName"
                value={formData.emergencyContactName}
                onChange={(e) => handleInputChange('emergencyContactName', e.target.value)}
                disabled={!isEditing}
                placeholder="Emergency contact name"
              />
            </div>
            
            <div>
              <Label htmlFor="emergencyContactPhone">Emergency Contact Phone</Label>
              <Input
                id="emergencyContactPhone"
                value={formData.emergencyContactPhone}
                onChange={(e) => handleInputChange('emergencyContactPhone', e.target.value)}
                disabled={!isEditing}
                placeholder="Emergency contact phone"
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PregnancyProfileEdit;
