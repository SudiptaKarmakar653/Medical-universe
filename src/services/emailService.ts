
import emailjs from '@emailjs/browser';

// EmailJS configuration - Updated with new credentials
const EMAILJS_SERVICE_ID = 'service_ad01b75';
const EMAILJS_TEMPLATE_ID = 'template_3oypt0c';
const EMAILJS_PRESCRIPTION_TEMPLATE_ID = 'template_dfc8ekv';
const EMAILJS_PUBLIC_KEY = 'W7uhT4WXnf5A_-3Sc';

// Initialize EmailJS
emailjs.init(EMAILJS_PUBLIC_KEY);

interface EmailParams {
  patientName: string;
  patientEmail: string;
  doctorName: string;
  meetLink: string;
  appointmentDate: string;
}

interface PrescriptionEmailParams {
  patientName: string;
  patientEmail: string;
  doctorName: string;
  prescriptionText: string;
  appointmentDate: string;
  prescriptionImage?: string;
  prescriptionFileName?: string;
}

export const sendMeetLinkEmail = async (params: EmailParams): Promise<{ success: boolean; message: string }> => {
  try {
    console.log('Sending meet link email with params:', params);
    
    const templateParams = {
      to_name: params.patientName,
      to_email: params.patientEmail,
      doctor_name: params.doctorName,
      meet_link: params.meetLink,
      appointment_date: params.appointmentDate,
      from_name: 'Medical Universe Team'
    };

    const response = await emailjs.send(
      EMAILJS_SERVICE_ID,
      EMAILJS_TEMPLATE_ID,
      templateParams,
      EMAILJS_PUBLIC_KEY
    );

    console.log('Email sent successfully:', response);
    
    return {
      success: true,
      message: 'Google Meet link sent successfully to patient\'s email'
    };
  } catch (error: any) {
    console.error('Failed to send email:', error);
    
    return {
      success: false,
      message: `Failed to send email: ${error.text || error.message || 'Unknown error'}`
    };
  }
};

export const sendPrescriptionEmail = async (params: PrescriptionEmailParams): Promise<{ success: boolean; message: string }> => {
  try {
    console.log('Sending prescription email with params:', params);
    
    const templateParams = {
      to_name: params.patientName,
      to_email: params.patientEmail,
      doctor_name: params.doctorName,
      prescription_text: params.prescriptionText,
      appointment_date: params.appointmentDate,
      from_name: 'Medical Universe Team'
    };

    // If there's a prescription image, add it as an attachment
    if (params.prescriptionImage && params.prescriptionFileName) {
      (templateParams as any).prescription_attachment = {
        name: params.prescriptionFileName,
        content: params.prescriptionImage,
        contentType: 'image/jpeg'
      };
    }

    const response = await emailjs.send(
      EMAILJS_SERVICE_ID,
      EMAILJS_PRESCRIPTION_TEMPLATE_ID,
      templateParams,
      EMAILJS_PUBLIC_KEY
    );

    console.log('Prescription email sent successfully:', response);
    
    return {
      success: true,
      message: 'Prescription sent successfully to patient\'s email'
    };
  } catch (error: any) {
    console.error('Failed to send prescription email:', error);
    
    return {
      success: false,
      message: `Failed to send prescription email: ${error.text || error.message || 'Unknown error'}`
    };
  }
};

// Generate a Google Meet link (simplified version)
export const generateMeetLink = (): string => {
  const meetingId = `${Math.random().toString(36).substr(2, 3)}-${Math.random().toString(36).substr(2, 4)}-${Math.random().toString(36).substr(2, 3)}`;
  return `https://meet.google.com/${meetingId}`;
};
