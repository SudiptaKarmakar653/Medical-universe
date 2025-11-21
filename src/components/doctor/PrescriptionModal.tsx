
import React, { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import emailjs from '@emailjs/browser';
import { FileText, Send, Loader2, Plus, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useUser } from '@clerk/clerk-react';

interface PrescriptionModalProps {
  patient: any;
  doctorProfile: any;
}

interface Medication {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
}

const PrescriptionModal: React.FC<PrescriptionModalProps> = ({ patient, doctorProfile }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [medications, setMedications] = useState<Medication[]>([
    { name: '', dosage: '', frequency: '', duration: '' }
  ]);
  const [doctorNotes, setDoctorNotes] = useState<string>('');
  const [isSending, setIsSending] = useState(false);
  const { toast } = useToast();
  const { user } = useUser();
  const formRef = useRef<HTMLFormElement>(null);

  // EmailJS configuration
  const EMAILJS_SERVICE_ID = 'service_ad01b75';
  const EMAILJS_PRESCRIPTION_TEMPLATE_ID = 'template_dfc8ekv';
  const EMAILJS_PUBLIC_KEY = 'W7uhT4WXnf5A_-3Sc';

  const addMedication = () => {
    setMedications([...medications, { name: '', dosage: '', frequency: '', duration: '' }]);
  };

  const removeMedication = (index: number) => {
    if (medications.length > 1) {
      setMedications(medications.filter((_, i) => i !== index));
    }
  };

  const updateMedication = (index: number, field: keyof Medication, value: string) => {
    const updatedMedications = medications.map((med, i) =>
      i === index ? { ...med, [field]: value } : med
    );
    setMedications(updatedMedications);
  };

  const formatPrescriptionContent = () => {
    const medicationsList = medications
      .filter(med => med.name.trim())
      .map((med, index) => `
        ${index + 1}. ${med.name}
           - Dosage: ${med.dosage}
           - Frequency: ${med.frequency}
           - Duration: ${med.duration}
      `).join('\n');

    return `
DIGITAL PRESCRIPTION

Doctor: ${doctorName}
Patient: ${patientName}
Date: ${appointmentDate}

MEDICATIONS:
${medicationsList || 'No medications prescribed'}

DOCTOR'S NOTES:
${doctorNotes || 'No additional notes'}

---
This is an official digital prescription from Medical Universe.
For any queries, please contact your doctor.
    `.trim();
  };

  const savePrescriptionToDatabase = async () => {
    try {
      console.log('Saving prescription to database...');
      console.log('Doctor profile:', doctorProfile);
      
      if (!doctorProfile?.id) {
        throw new Error('Doctor profile ID not found');
      }

      const medicationsText = medications
        .filter(med => med.name.trim())
        .map(med => `${med.name} - ${med.dosage} - ${med.frequency} - ${med.duration}`)
        .join('; ');

      // Generate a new UUID for patient_id since we don't have actual patient UUIDs
      const patientId = crypto.randomUUID();

      const prescriptionData = {
        doctor_id: doctorProfile.id, // Use the actual doctor profile UUID
        patient_id: patientId, // Use generated UUID for patient
        patient_name: patient.patient_name,
        patient_email: patient.patient_email,
        prescription_file_name: null, // No file for online prescription
        prescription_notes: doctorNotes.trim() || null,
        sent_via_email: true,
        medications: medicationsText || 'Digital prescription sent'
      };

      console.log('Prescription data to save:', prescriptionData);

      const { data, error } = await supabase
        .from('prescriptions')
        .insert(prescriptionData)
        .select();

      if (error) {
        console.error('Database error:', error);
        throw error;
      }

      console.log('Prescription saved successfully:', data);
      return data;
    } catch (error) {
      console.error('Error saving prescription to database:', error);
      throw error;
    }
  };

  const handleSendPrescription = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const hasValidMedications = medications.some(med => med.name.trim());
    
    if (!hasValidMedications && !doctorNotes.trim()) {
      toast({
        title: "Prescription Required",
        description: "Please add at least one medication or doctor's notes",
        variant: "destructive"
      });
      return;
    }

    if (!patient.patient_email) {
      toast({
        title: "No Email Found",
        description: "Patient email is required to send prescription",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsSending(true);

      const prescriptionContent = formatPrescriptionContent();

      console.log('Sending online prescription email...');
      console.log('Patient email:', patient.patient_email);

      // Send email with formatted prescription
      const result = await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_PRESCRIPTION_TEMPLATE_ID,
        {
          to_name: patientName,
          to_email: patient.patient_email,
          doctor_name: doctorName,
          prescription_text: prescriptionContent,
          appointment_date: appointmentDate,
          from_name: 'Medical Universe Team'
        },
        EMAILJS_PUBLIC_KEY
      );

      console.log('Online prescription email sent successfully:', result);

      // Save to database after successful email
      await savePrescriptionToDatabase();

      toast({
        title: "✅ Digital Prescription Sent!",
        description: `Digital prescription has been sent to ${patient.patient_email} and saved to your records`,
      });
      
      resetModal();

    } catch (error: any) {
      console.error('Error sending prescription:', error);
      
      let errorMessage = "Failed to send prescription";
      if (error.message?.includes('Database')) {
        errorMessage = "Email sent but failed to save to records";
      } else if (error.text || error.message) {
        errorMessage = error.text || error.message;
      }
      
      toast({
        title: "❌ Error",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsSending(false);
    }
  };

  const resetModal = () => {
    setMedications([{ name: '', dosage: '', frequency: '', duration: '' }]);
    setDoctorNotes('');
    setIsOpen(false);
  };

  // Prepare form field values
  const patientName = patient.patient_name || 'Patient';
  const patientEmail = patient.patient_email;
  const doctorName = doctorProfile?.doctor_name || doctorProfile?.email || 'Doctor';
  const appointmentDate = new Date(patient.appointment_date).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) resetModal();
      else setIsOpen(true);
    }}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          size="sm"
          className="bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
        >
          <FileText className="h-4 w-4 mr-2" />
          Send Prescription
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Send Digital Prescription to {patientName}</DialogTitle>
        </DialogHeader>
        
        <form ref={formRef} onSubmit={handleSendPrescription} className="space-y-6">
          {/* Medications Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-lg font-semibold">Medications</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addMedication}
                className="text-blue-600 border-blue-200 hover:bg-blue-50"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Medication
              </Button>
            </div>
            
            {medications.map((medication, index) => (
              <div key={index} className="p-4 border rounded-lg bg-gray-50 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-sm">Medication {index + 1}</span>
                  {medications.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeMedication(index)}
                      className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor={`med-name-${index}`} className="text-sm">Medicine Name</Label>
                    <Input
                      id={`med-name-${index}`}
                      placeholder="e.g., Paracetamol"
                      value={medication.name}
                      onChange={(e) => updateMedication(index, 'name', e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor={`med-dosage-${index}`} className="text-sm">Dosage</Label>
                    <Input
                      id={`med-dosage-${index}`}
                      placeholder="e.g., 500mg"
                      value={medication.dosage}
                      onChange={(e) => updateMedication(index, 'dosage', e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor={`med-frequency-${index}`} className="text-sm">Frequency</Label>
                    <Input
                      id={`med-frequency-${index}`}
                      placeholder="e.g., 3 times a day"
                      value={medication.frequency}
                      onChange={(e) => updateMedication(index, 'frequency', e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor={`med-duration-${index}`} className="text-sm">Duration</Label>
                    <Input
                      id={`med-duration-${index}`}
                      placeholder="e.g., 5 days"
                      value={medication.duration}
                      onChange={(e) => updateMedication(index, 'duration', e.target.value)}
                      className="mt-1"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Doctor Notes Section */}
          <div className="space-y-2">
            <Label htmlFor="doctor-notes">Doctor's Notes & Instructions</Label>
            <Textarea
              id="doctor-notes"
              placeholder="Add any additional notes, instructions, or special recommendations for the patient..."
              value={doctorNotes}
              onChange={(e) => setDoctorNotes(e.target.value)}
              className="min-h-[100px] resize-none"
              maxLength={1000}
            />
            <p className="text-xs text-gray-500">
              {doctorNotes.length}/1000 characters
            </p>
          </div>
          
          <div className="flex justify-between items-center pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={resetModal}
              disabled={isSending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSending}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isSending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Send Digital Prescription
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default PrescriptionModal;
