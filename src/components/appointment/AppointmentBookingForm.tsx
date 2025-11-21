
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { CalendarIcon, Video, MapPin } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AppointmentBookingFormProps {
  isOpen: boolean;
  onClose: () => void;
  doctorId: string;
  doctorName: string;
}

const AppointmentBookingForm = ({ isOpen, onClose, doctorId, doctorName }: AppointmentBookingFormProps) => {
  const [formData, setFormData] = useState({
    patientName: '',
    age: '',
    phone: '',
    email: '',
    symptoms: '',
    reason: '',
    meetingType: 'offline', // online or offline
    offlineAddress: '',
  });
  const [appointmentDate, setAppointmentDate] = useState<Date>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleMeetingTypeChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      meetingType: value
    }));
  };

  const createGoogleMeetLink = async () => {
    try {
      // This is a simplified approach - in production, you'd want to use the Google Calendar API
      // to create a proper meeting with authentication
      const meetingTitle = `Medical Consultation with ${doctorName}`;
      const meetingDate = appointmentDate?.toISOString();
      
      // Generate a simple Google Meet link
      // In production, you'd integrate with Google Calendar API properly
      const googleMeetUrl = `https://meet.google.com/new`;
      
      return googleMeetUrl;
    } catch (error) {
      console.error('Error creating Google Meet link:', error);
      return null;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!appointmentDate) {
      toast({
        title: "Error",
        description: "Please select an appointment date",
        variant: "destructive"
      });
      return;
    }

    if (formData.meetingType === 'offline' && !formData.offlineAddress.trim()) {
      toast({
        title: "Error",
        description: "Please provide an address for offline consultation",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      let meetingLink = null;
      
      // If online meeting, create Google Meet link
      if (formData.meetingType === 'online') {
        meetingLink = await createGoogleMeetLink();
      }

      console.log('Attempting to create appointment with data:', {
        doctor_id: doctorId,
        appointment_date: appointmentDate.toISOString(),
        reason: formData.reason || formData.symptoms,
        status: 'pending',
        patient_name: formData.patientName,
        patient_email: formData.email,
        patient_phone: formData.phone,
        patient_age: parseInt(formData.age) || null,
        meeting_type: formData.meetingType,
        meeting_link: meetingLink,
        meeting_address: formData.meetingType === 'offline' ? formData.offlineAddress : null,
        notes: `Symptoms: ${formData.symptoms}${formData.meetingType === 'online' ? ' | Online consultation via Google Meet' : ' | Offline consultation'}`
      });

      // Insert appointment with meeting information
      const { data, error } = await supabase
        .from('appointments')
        .insert({
          doctor_id: doctorId,
          appointment_date: appointmentDate.toISOString(),
          reason: formData.reason || formData.symptoms,
          status: 'pending',
          patient_name: formData.patientName,
          patient_email: formData.email,
          patient_phone: formData.phone,
          patient_age: parseInt(formData.age) || null,
          meeting_type: formData.meetingType,
          meeting_link: meetingLink,
          meeting_address: formData.meetingType === 'offline' ? formData.offlineAddress : null,
          notes: `Symptoms: ${formData.symptoms}${formData.meetingType === 'online' ? ' | Online consultation via Google Meet' : ' | Offline consultation'}`,
          patient_id: null
        })
        .select();

      if (error) {
        console.error('Error booking appointment:', error);
        throw error;
      }

      console.log('Appointment created successfully:', data);

      const meetingInfo = formData.meetingType === 'online' 
        ? 'Google Meet link will be shared via email' 
        : `at ${formData.offlineAddress}`;

      toast({
        title: "Success",
        description: `${formData.meetingType === 'online' ? 'Online' : 'Offline'} appointment booked with ${doctorName} for ${format(appointmentDate, 'PPP')} ${meetingInfo}`,
      });

      // Reset form
      setFormData({
        patientName: '',
        age: '',
        phone: '',
        email: '',
        symptoms: '',
        reason: '',
        meetingType: 'offline',
        offlineAddress: '',
      });
      setAppointmentDate(undefined);
      onClose();

    } catch (error) {
      console.error('Error booking appointment:', error);
      toast({
        title: "Error",
        description: "Failed to book appointment. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Book Appointment</DialogTitle>
          <DialogDescription>
            Book an appointment with {doctorName}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="patientName">Full Name</Label>
            <Input
              id="patientName"
              name="patientName"
              value={formData.patientName}
              onChange={handleInputChange}
              required
              placeholder="Enter your full name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="age">Age</Label>
            <Input
              id="age"
              name="age"
              type="number"
              value={formData.age}
              onChange={handleInputChange}
              required
              placeholder="Enter your age"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              required
              placeholder="Enter your phone number"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              required
              placeholder="Enter your email"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="reason">Reason for Visit</Label>
            <Input
              id="reason"
              name="reason"
              value={formData.reason}
              onChange={handleInputChange}
              required
              placeholder="e.g., Consultation, Follow-up"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="symptoms">Symptoms/Description</Label>
            <Textarea
              id="symptoms"
              name="symptoms"
              value={formData.symptoms}
              onChange={handleInputChange}
              placeholder="Describe your symptoms or concerns"
              rows={3}
            />
          </div>

          <div className="space-y-3">
            <Label>Meeting Type</Label>
            <RadioGroup value={formData.meetingType} onValueChange={handleMeetingTypeChange}>
              <div className="flex items-center space-x-2 p-3 border rounded-lg">
                <RadioGroupItem value="online" id="online" />
                <Video className="h-4 w-4 text-blue-600" />
                <Label htmlFor="online" className="flex-1 cursor-pointer">
                  Online Consultation (Google Meet)
                </Label>
              </div>
              <div className="flex items-center space-x-2 p-3 border rounded-lg">
                <RadioGroupItem value="offline" id="offline" />
                <MapPin className="h-4 w-4 text-green-600" />
                <Label htmlFor="offline" className="flex-1 cursor-pointer">
                  Offline Consultation (In-person)
                </Label>
              </div>
            </RadioGroup>
          </div>

          {formData.meetingType === 'offline' && (
            <div className="space-y-2">
              <Label htmlFor="offlineAddress">Consultation Address</Label>
              <Textarea
                id="offlineAddress"
                name="offlineAddress"
                value={formData.offlineAddress}
                onChange={handleInputChange}
                required
                placeholder="Enter the address where you'd like to meet the doctor"
                rows={3}
              />
            </div>
          )}

          {formData.meetingType === 'online' && (
            <div className="p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                <Video className="h-4 w-4 inline mr-1" />
                A Google Meet link will be generated and shared with you via email once the appointment is confirmed.
              </p>
            </div>
          )}

          <div className="space-y-2">
            <Label>Preferred Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {appointmentDate ? format(appointmentDate, "PPP") : "Select date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={appointmentDate}
                  onSelect={setAppointmentDate}
                  disabled={(date) => date < new Date()}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1"
            >
              {isSubmitting ? 'Booking...' : 'Book Appointment'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AppointmentBookingForm;
