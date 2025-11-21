
import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Brain, Heart, Utensils, MessageCircle, Dumbbell, Bell, User } from 'lucide-react';
import { useAuth } from '@/context/auth-provider';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import PregnancySetup from './PregnancySetup';
import PregnancyProfileEdit from './PregnancyProfileEdit';
import WeeklyGuide from './WeeklyGuide';
import FoodGuide from './FoodGuide';
import PregnancyChat from './PregnancyChat';
import YogaRoutine from './YogaRoutine';
import ReminderSystem from './ReminderSystem';

const AIPregnancyCompanion = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [pregnancyProfile, setPregnancyProfile] = useState<any>(null);
  const [patientProfile, setPatientProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      fetchProfiles();
    }
  }, [user?.id]);

  const fetchProfiles = async () => {
    if (!user?.id) return;

    try {
      // Fetch pregnancy profile
      const { data: pregnancyData, error: pregnancyError } = await supabase
        .from('pregnancy_profiles')
        .select('*')
        .eq('patient_id', user.id)
        .single();

      if (pregnancyError && pregnancyError.code !== 'PGRST116') {
        console.error('Error fetching pregnancy profile:', pregnancyError);
      } else {
        setPregnancyProfile(pregnancyData);
      }

      // Fetch patient profile
      const { data: patientData, error: patientError } = await supabase
        .from('patient_profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (patientError && patientError.code !== 'PGRST116') {
        console.error('Error fetching patient profile:', patientError);
      } else {
        setPatientProfile(patientData);
      }
    } catch (error) {
      console.error('Error fetching profiles:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleProfileCreated = (profile: any) => {
    setPregnancyProfile(profile);
    fetchProfiles(); // Refresh all profiles
  };

  const handleProfileUpdated = (updatedData: any) => {
    // Refresh profiles after update
    fetchProfiles();
    toast({
      title: "Profile Updated",
      description: "Your changes have been saved successfully!",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your pregnancy profile...</p>
        </div>
      </div>
    );
  }

  if (!pregnancyProfile) {
    return <PregnancySetup onProfileCreated={handleProfileCreated} />;
  }

  const currentWeek = pregnancyProfile.current_week;
  const language = pregnancyProfile.language_preference || 'english';

  return (
    <div className="space-y-6">
      {/* Profile Header - Simple display without edit form */}
      <div className="bg-gradient-to-r from-pink-100 to-purple-100 rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-pink-800">
              {language === 'bengali' ? 'আপনার গর্ভাবস্থার যাত্রা' : 'Your Pregnancy Journey'}
            </h2>
            <p className="text-pink-600">
              {language === 'bengali' 
                ? `সপ্তাহ ${currentWeek} • ${pregnancyProfile.due_date ? new Date(pregnancyProfile.due_date).toLocaleDateString() : 'Due date not set'}`
                : `Week ${currentWeek} • Due: ${pregnancyProfile.due_date ? new Date(pregnancyProfile.due_date).toLocaleDateString() : 'Not set'}`
              }
            </p>
          </div>
          <Badge variant="outline" className="bg-white">
            <Brain className="h-4 w-4 mr-1" />
            {language === 'bengali' ? 'AI চালিত' : 'AI Powered'}
          </Badge>
        </div>
      </div>

      {/* Main Tabs */}
      <Tabs defaultValue="weekly" className="w-full">
        <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6">
          <TabsTrigger value="weekly" className="flex items-center gap-1">
            <Heart className="h-4 w-4" />
            <span className="hidden sm:inline">
              {language === 'bengali' ? 'সাপ্তাহিক' : 'Weekly'}
            </span>
          </TabsTrigger>
          <TabsTrigger value="nutrition" className="flex items-center gap-1">
            <Utensils className="h-4 w-4" />
            <span className="hidden sm:inline">
              {language === 'bengali' ? 'পুষ্টি' : 'Nutrition'}
            </span>
          </TabsTrigger>
          <TabsTrigger value="chat" className="flex items-center gap-1">
            <MessageCircle className="h-4 w-4" />
            <span className="hidden sm:inline">
              {language === 'bengali' ? 'চ্যাট' : 'Chat'}
            </span>
          </TabsTrigger>
          <TabsTrigger value="yoga" className="flex items-center gap-1">
            <Dumbbell className="h-4 w-4" />
            <span className="hidden sm:inline">
              {language === 'bengali' ? 'যোগা' : 'Yoga'}
            </span>
          </TabsTrigger>
          <TabsTrigger value="reminders" className="flex items-center gap-1">
            <Bell className="h-4 w-4" />
            <span className="hidden sm:inline">
              {language === 'bengali' ? 'রিমাইন্ডার' : 'Reminders'}
            </span>
          </TabsTrigger>
          <TabsTrigger value="profile" className="flex items-center gap-1">
            <User className="h-4 w-4" />
            <span className="hidden sm:inline">
              {language === 'bengali' ? 'প্রোফাইল' : 'Profile'}
            </span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="weekly" className="space-y-4">
          <WeeklyGuide week={currentWeek} language={language} />
        </TabsContent>

        <TabsContent value="nutrition" className="space-y-4">
          <FoodGuide week={currentWeek} language={language} />
        </TabsContent>

        <TabsContent value="chat" className="space-y-4">
          <PregnancyChat 
            week={currentWeek} 
            language={language} 
            userId={user?.id}
            partnerPhone={pregnancyProfile.partner_phone}
          />
        </TabsContent>

        <TabsContent value="yoga" className="space-y-4">
          <YogaRoutine week={currentWeek} language={language} userId={user?.id} />
        </TabsContent>

        <TabsContent value="reminders" className="space-y-4">
          <ReminderSystem 
            week={currentWeek} 
            language={language} 
            userId={user?.id}
          />
        </TabsContent>

        <TabsContent value="profile" className="space-y-4">
          <PregnancyProfileEdit 
            pregnancyProfile={pregnancyProfile}
            patientProfile={patientProfile}
            onProfileUpdated={handleProfileUpdated}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AIPregnancyCompanion;
