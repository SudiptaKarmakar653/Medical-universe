import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, Plus, Trash2, Send } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Reminder {
  id: string;
  reminder_title: string;
  reminder_description: string;
  reminder_date: string;
  is_sent: boolean;
}

interface ReminderSystemProps {
  userId?: string;
  week?: number;
  language?: string;
}

const ReminderSystem: React.FC<ReminderSystemProps> = ({ 
  userId, 
  week, 
  language 
}) => {
  const { toast } = useToast();
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [pregnancyProfile, setPregnancyProfile] = useState<any>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    time: ''
  });

  useEffect(() => {
    if (userId) {
      fetchReminders();
      fetchPregnancyProfile();
    }
  }, [userId]);

  const fetchPregnancyProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('pregnancy_profiles')
        .select('*')
        .eq('patient_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching pregnancy profile:', error);
      } else {
        setPregnancyProfile(data);
      }
    } catch (error) {
      console.error('Error fetching pregnancy profile:', error);
    }
  };

  const fetchReminders = async () => {
    try {
      const { data, error } = await supabase
        .from('pregnancy_reminders')
        .select('*')
        .eq('patient_id', userId)
        .order('reminder_date', { ascending: true });

      if (error) throw error;

      setReminders(data || []);
    } catch (error) {
      console.error('Error fetching reminders:', error);
    } finally {
      setLoading(false);
    }
  };

  const createReminder = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const reminderDateTime = new Date(`${formData.date}T${formData.time}`);
      
      const { error } = await supabase
        .from('pregnancy_reminders')
        .insert({
          patient_id: userId,
          reminder_title: formData.title,
          reminder_description: formData.description,
          reminder_date: reminderDateTime.toISOString()
        });

      if (error) throw error;

      setFormData({ title: '', description: '', date: '', time: '' });
      setShowForm(false);
      fetchReminders();

      toast({
        title: language === 'bengali' ? 'রিমাইন্ডার পাঠানো হয়েছে' : 'Reminder Created',
        description: language === 'bengali' 
          ? "রিমাইন্ডার পাঠানো হয়েছে"
          : "Your reminder has been set successfully!",
      });
    } catch (error) {
      console.error('Error creating reminder:', error);
      toast({
        title: language === 'bengali' ? 'ত্রুটি' : 'Error',
        description: language === 'bengali' ? 'রিমাইন্ডার পাঠাতে ব্যর্থ' : 'Failed to create reminder',
        variant: "destructive"
      });
    }
  };

  const deleteReminder = async (reminderId: string) => {
    try {
      const { error } = await supabase
        .from('pregnancy_reminders')
        .delete()
        .eq('id', reminderId);

      if (error) throw error;

      setReminders(reminders.filter(r => r.id !== reminderId));
      
      toast({
        title: language === 'bengali' ? 'রিমাইন্ডার পাঠানো হয়েছে' : "Reminder Deleted",
        description: language === 'bengali' 
          ? "Reminder has been removed successfully"
          : "Reminder has been removed successfully",
      });
    } catch (error) {
      console.error('Error deleting reminder:', error);
      toast({
        title: language === 'bengali' ? 'ত্রুটি' : 'Error',
        description: language === 'bengali' ? 'রিমাইন্ডার পাঠাতে ব্যর্থ' : 'Failed to delete reminder',
        variant: "destructive"
      });
    }
  };

  const sendReminderToPartner = async (reminder: Reminder) => {
    // Simulate sending SMS/Email to partner
    if (pregnancyProfile?.partner_phone || pregnancyProfile?.partner_email) {
      try {
        // In a real implementation, you would integrate with SMS/Email service
        console.log('Sending reminder to partner:', {
          partnerName: pregnancyProfile?.partner_name,
          partnerPhone: pregnancyProfile?.partner_phone,
          partnerEmail: pregnancyProfile?.partner_email,
          reminder
        });

        // Update reminder as sent
        const { error } = await supabase
          .from('pregnancy_reminders')
          .update({ is_sent: true })
          .eq('id', reminder.id);

        if (error) throw error;

        setReminders(reminders.map(r => 
          r.id === reminder.id ? { ...r, is_sent: true } : r
        ));

        toast({
          title: language === 'bengali' ? 'রিমাইন্ডার পাঠানো হয়েছে' : "Reminder Sent",
          description: language === 'bengali' 
            ? `রিমাইন্ডার পাঠানো হয়েছে ${pregnancyProfile?.partner_name || 'সঙ্গীর কাছে'}`
            : `Reminder sent to ${pregnancyProfile?.partner_name || 'partner'}`,
        });
      } catch (error) {
        toast({
          title: language === 'bengali' ? 'ত্রুটি' : 'Error',
          description: language === 'bengali' ? 'রিমাইন্ডার পাঠাতে ব্যর্থ' : 'Failed to send reminder',
          variant: "destructive"
        });
      }
    } else {
      toast({
        title: language === 'bengali' ? 'কোন সঙ্গীর যোগাযোগ নেই' : 'No Partner Contact',
        description: language === 'bengali' 
          ? 'অনুগ্রহ করে সেটিংসে সঙ্গীর যোগাযোগের তথ্য যোগ করুন'
          : 'Please add partner contact information in settings',
        variant: "destructive"
      });
    }
  };

  const upcomingReminders = reminders.filter(r => 
    new Date(r.reminder_date) > new Date() && !r.is_sent
  );

  const pastReminders = reminders.filter(r => 
    new Date(r.reminder_date) <= new Date() || r.is_sent
  );

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Partner Info */}
      {pregnancyProfile && (pregnancyProfile.partner_name || pregnancyProfile.partner_phone || pregnancyProfile.partner_email) && (
        <Card className="bg-blue-50">
          <CardContent className="p-4">
            <h3 className="font-semibold text-blue-800 mb-2">
              {language === 'bengali' ? 'সঙ্গীর তথ্য' : 'Partner Information'}
            </h3>
            <div className="space-y-1 text-sm text-blue-700">
              {pregnancyProfile.partner_name && (
                <p>{language === 'bengali' ? 'নাম:' : 'Name:'} {pregnancyProfile.partner_name}</p>
              )}
              {pregnancyProfile.partner_phone && (
                <p>{language === 'bengali' ? 'ফোন:' : 'Phone:'} {pregnancyProfile.partner_phone}</p>
              )}
              {pregnancyProfile.partner_email && (
                <p>{language === 'bengali' ? 'ইমেইল:' : 'Email:'} {pregnancyProfile.partner_email}</p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Add Reminder Button */}
      <Button
        onClick={() => setShowForm(!showForm)}
        className="w-full"
      >
        <Plus className="h-4 w-4 mr-2" />
        {language === 'bengali' ? 'নতুন রিমাইন্ডার তৈরি করুন' : 'Create New Reminder'}
      </Button>

      {/* Add Reminder Form */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>
              {language === 'bengali' ? 'রিমাইন্ডার তৈরি করুন' : 'Create Reminder'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={createReminder} className="space-y-4">
              <div>
                <Label htmlFor="title">
                  {language === 'bengali' ? 'রিমাইন্ডার শিরোনাম' : 'Reminder Title'}
                </Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  placeholder={language === 'bengali' 
                    ? 'ডাক্তারের অ্যাপয়েন্টমেন্ট, ভিটামিন গ্রহণ ইত্যাদি'
                    : 'Doctor appointment, Take vitamins, etc.'
                  }
                  required
                />
              </div>

              <div>
                <Label htmlFor="description">
                  {language === 'bengali' ? 'বিবরণ' : 'Description'}
                </Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder={language === 'bengali' 
                    ? 'রিমাইন্ডার সম্পর্কে অতিরিক্ত বিবরণ'
                    : 'Additional details about the reminder'
                  }
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="date">
                    {language === 'bengali' ? 'তারিখ' : 'Date'}
                  </Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({...formData, date: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="time">
                    {language === 'bengali' ? 'সময়' : 'Time'}
                  </Label>
                  <Input
                    id="time"
                    type="time"
                    value={formData.time}
                    onChange={(e) => setFormData({...formData, time: e.target.value})}
                    required
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Button type="submit">
                  {language === 'bengali' ? 'রিমাইন্ডার তৈরি করুন' : 'Create Reminder'}
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  {language === 'bengali' ? 'বাতিল' : 'Cancel'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Upcoming Reminders */}
      {upcomingReminders.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              {language === 'bengali' ? 'আসন্ন রিমাইন্ডার' : 'Upcoming Reminders'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {upcomingReminders.map((reminder) => (
              <div key={reminder.id} className="border rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-semibold">{reminder.reminder_title}</h4>
                    {reminder.reminder_description && (
                      <p className="text-sm text-gray-600 mt-1">{reminder.reminder_description}</p>
                    )}
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(reminder.reminder_date).toLocaleDateString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {new Date(reminder.reminder_date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => sendReminderToPartner(reminder)}
                    >
                      <Send className="h-3 w-3 mr-1" />
                      {language === 'bengali' ? 'সঙ্গীর কাছে পাঠান' : 'Send to Partner'}
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => deleteReminder(reminder.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Past Reminders */}
      {pastReminders.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>
              {language === 'bengali' ? 'পূর্ববর্তী রিমাইন্ডার' : 'Past Reminders'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {pastReminders.slice(0, 5).map((reminder) => (
              <div key={reminder.id} className="border rounded-lg p-4 opacity-70">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-semibold">{reminder.reminder_title}</h4>
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                      <span>{new Date(reminder.reminder_date).toLocaleDateString()}</span>
                      {reminder.is_sent && (
                        <Badge variant="secondary" className="text-xs">
                          {language === 'bengali' ? 'সঙ্গীর কাছে পাঠানো হয়েছে' : 'Sent to Partner'}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => deleteReminder(reminder.id)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {reminders.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-500">
              {language === 'bengali' 
                ? 'এখনো কোন রিমাইন্ডার নেই। আপনার প্রথম রিমাইন্ডার তৈরি করুন!'
                : 'No reminders yet. Create your first reminder!'
              }
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ReminderSystem;
