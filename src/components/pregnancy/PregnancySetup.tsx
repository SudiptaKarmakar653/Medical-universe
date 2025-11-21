
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Baby, Calendar, Globe, Users } from 'lucide-react';
import { useAuth } from '@/context/auth-provider';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface PregnancySetupProps {
  onProfileCreated: (profile: any) => void;
}

const PregnancySetup: React.FC<PregnancySetupProps> = ({ onProfileCreated }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    dueDate: '',
    currentWeek: 1,
    language: 'english',
    partnerName: '',
    partnerPhone: '',
    partnerEmail: '',
    emergencyContactName: '',
    emergencyContactPhone: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user?.id) {
      toast({
        title: "Error",
        description: "You must be signed in to create a pregnancy profile",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      console.log('Creating pregnancy profile for user:', user.id);
      console.log('Form data:', formData);

      const { data, error } = await supabase
        .from('pregnancy_profiles')
        .insert({
          patient_id: user.id,
          due_date: formData.dueDate,
          current_week: formData.currentWeek,
          language_preference: formData.language,
          partner_name: formData.partnerName || null,
          partner_phone: formData.partnerPhone || null,
          partner_email: formData.partnerEmail || null,
          emergency_contact_name: formData.emergencyContactName || null,
          emergency_contact_phone: formData.emergencyContactPhone || null
        })
        .select()
        .single();

      console.log('Insert result:', { data, error });

      if (error) {
        console.error('Error creating pregnancy profile:', error);
        throw error;
      }

      // Try to generate initial tasks (optional, don't fail if this doesn't work)
      try {
        await supabase.functions.invoke('generate-pregnancy-tasks', {
          body: {
            userId: user.id,
            week: formData.currentWeek,
            language: formData.language
          }
        });
      } catch (taskError) {
        console.log('Note: Could not generate initial tasks:', taskError);
        // Don't fail the whole process if task generation fails
      }

      onProfileCreated(data);
      
      toast({
        title: "Success!",
        description: "Your pregnancy profile has been created successfully!",
      });
    } catch (error) {
      console.error('Error creating pregnancy profile:', error);
      toast({
        title: "Error",
        description: "Failed to create pregnancy profile. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader className="text-center">
        <div className="mx-auto w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mb-4">
          <Baby className="h-8 w-8 text-pink-600" />
        </div>
        <CardTitle className="text-2xl text-pink-800">Welcome to Your AI Pregnancy Companion</CardTitle>
        <p className="text-gray-600">Let's set up your personalized pregnancy journey</p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="dueDate">Due Date *</Label>
              <Input
                id="dueDate"
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData({...formData, dueDate: e.target.value})}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="currentWeek">Current Week *</Label>
              <Select 
                value={formData.currentWeek.toString()} 
                onValueChange={(value) => setFormData({...formData, currentWeek: parseInt(value)})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({length: 40}, (_, i) => i + 1).map(week => (
                    <SelectItem key={week} value={week.toString()}>
                      Week {week}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="language">Preferred Language</Label>
            <Select 
              value={formData.language} 
              onValueChange={(value) => setFormData({...formData, language: value})}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="english">English</SelectItem>
                <SelectItem value="bengali">Bengali (বাংলা)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Users className="h-5 w-5" />
              Partner Information (Optional)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="partnerName">Partner Name</Label>
                <Input
                  id="partnerName"
                  value={formData.partnerName}
                  onChange={(e) => setFormData({...formData, partnerName: e.target.value})}
                  placeholder="Partner's name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="partnerPhone">Partner Phone</Label>
                <Input
                  id="partnerPhone"
                  value={formData.partnerPhone}
                  onChange={(e) => setFormData({...formData, partnerPhone: e.target.value})}
                  placeholder="+1234567890"
                />
              </div>
            </div>
            <div className="space-y-2 mt-4">
              <Label htmlFor="partnerEmail">Partner Email</Label>
              <Input
                id="partnerEmail"
                type="email"
                value={formData.partnerEmail}
                onChange={(e) => setFormData({...formData, partnerEmail: e.target.value})}
                placeholder="partner@example.com"
              />
            </div>
          </div>

          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold mb-4">Emergency Contact</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="emergencyContactName">Emergency Contact Name</Label>
                <Input
                  id="emergencyContactName"
                  value={formData.emergencyContactName}
                  onChange={(e) => setFormData({...formData, emergencyContactName: e.target.value})}
                  placeholder="Emergency contact name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="emergencyContactPhone">Emergency Contact Phone</Label>
                <Input
                  id="emergencyContactPhone"
                  value={formData.emergencyContactPhone}
                  onChange={(e) => setFormData({...formData, emergencyContactPhone: e.target.value})}
                  placeholder="+1234567890"
                />
              </div>
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Setting up...' : 'Start Your Pregnancy Journey'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default PregnancySetup;
