
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Send, Loader2, Link as LinkIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { sendMeetLinkEmail } from "@/services/emailService";

interface ManualMeetLinkFormProps {
  patient: any;
  doctorProfile: any;
  onSuccess: () => void;
}

const ManualMeetLinkForm: React.FC<ManualMeetLinkFormProps> = ({ 
  patient, 
  doctorProfile, 
  onSuccess 
}) => {
  const [meetLink, setMeetLink] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const { toast } = useToast();

  const validateGoogleMeetLink = (url: string) => {
    const googleMeetPattern = /^https:\/\/meet\.google\.com\/[a-z0-9-]+$/;
    return googleMeetPattern.test(url);
  };

  const handleSubmitManualLink = async () => {
    if (!meetLink.trim()) {
      toast({
        title: "Missing link",
        description: "Please enter a Google Meet link",
        variant: "destructive"
      });
      return;
    }

    if (!validateGoogleMeetLink(meetLink)) {
      toast({
        title: "Invalid link format",
        description: "Please enter a valid Google Meet link (e.g., https://meet.google.com/xxx-xxxx-xxx)",
        variant: "destructive"
      });
      return;
    }

    if (!patient.patient_email) {
      toast({
        title: "No email found",
        description: "Patient email is required to send the meet link",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsSubmitting(true);

      // Update appointment with the manual meet link
      const { error: updateError } = await supabase
        .from('appointments')
        .update({ meeting_link: meetLink })
        .eq('id', patient.id);

      if (updateError) {
        console.error('Error updating appointment:', updateError);
        throw updateError;
      }

      // Send email with meet link using EmailJS
      const emailResult = await sendMeetLinkEmail({
        patientName: patient.patient_name || 'Patient',
        patientEmail: patient.patient_email,
        doctorName: doctorProfile?.doctor_name || doctorProfile?.email || 'Doctor',
        meetLink: meetLink,
        appointmentDate: new Date(patient.appointment_date).toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })
      });

      if (emailResult.success) {
        toast({
          title: "✅ Manual meet link sent!",
          description: `Google Meet link has been sent to ${patient.patient_email}`,
        });
      } else {
        toast({
          title: "⚠️ Meet link created",
          description: `Meeting link created but email failed to send: ${emailResult.message}`,
          variant: "destructive"
        });
      }

      setMeetLink('');
      setShowForm(false);
      onSuccess();

    } catch (error: any) {
      console.error('Error sending manual meet link:', error);
      toast({
        title: "❌ Error",
        description: error.message || "Failed to send meet link",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!showForm) {
    return (
      <Button
        onClick={() => setShowForm(true)}
        variant="outline"
        size="sm"
        className="border-blue-500 text-blue-600 hover:bg-blue-50"
      >
        <LinkIcon className="h-4 w-4 mr-2" />
        Add Custom Meet Link
      </Button>
    );
  }

  return (
    <div className="mt-3 p-4 border border-blue-200 rounded-lg bg-blue-50">
      <div className="space-y-3">
        <div>
          <Label htmlFor="meetLink" className="text-sm font-medium text-blue-800">
            Google Meet Link
          </Label>
          <Input
            id="meetLink"
            type="url"
            placeholder="https://meet.google.com/xxx-xxxx-xxx"
            value={meetLink}
            onChange={(e) => setMeetLink(e.target.value)}
            className="mt-1"
          />
        </div>
        
        <Alert>
          <AlertDescription className="text-xs text-blue-700">
            Enter your custom Google Meet link. The link will be sent to the patient via email.
          </AlertDescription>
        </Alert>

        <div className="flex gap-2">
          <Button
            onClick={handleSubmitManualLink}
            disabled={isSubmitting || !meetLink.trim()}
            size="sm"
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Send to Patient
              </>
            )}
          </Button>
          
          <Button
            onClick={() => {
              setShowForm(false);
              setMeetLink('');
            }}
            variant="outline"
            size="sm"
          >
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ManualMeetLinkForm;
