
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.9';
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

const resend = new Resend(Deno.env.get('RESEND_API_KEY'));

interface MeetLinkRequest {
  appointmentId: string;
  patientEmail: string;
  patientName: string;
  doctorName: string;
  appointmentDate: string;
  meetingEnded?: boolean;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405, headers: corsHeaders });
  }

  try {
    const { appointmentId, patientEmail, patientName, doctorName, appointmentDate, meetingEnded }: MeetLinkRequest = await req.json();

    if (meetingEnded) {
      console.log('Sending meeting ended notification for appointment:', appointmentId);
      
      // Format the appointment date
      const formattedDate = new Date(appointmentDate).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });

      let emailSent = false;
      let emailError = null;

      try {
        // Send meeting ended notification email
        const emailResponse = await resend.emails.send({
          from: "Medical Universe <onboarding@resend.dev>",
          to: [patientEmail],
          subject: `Consultation Completed - Thank you for meeting with ${doctorName}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <h2 style="color: #2563eb;">Consultation Completed Successfully!</h2>
              
              <p>Dear ${patientName},</p>
              
              <p>Your online consultation with <strong>${doctorName}</strong> has been completed.</p>
              
              <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <p><strong>📅 Consultation Date:</strong> ${formattedDate}</p>
                <p><strong>👨‍⚕️ Doctor:</strong> ${doctorName}</p>
                <p><strong>✅ Status:</strong> Completed</p>
              </div>
              
              <div style="background-color: #dbeafe; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="color: #1d4ed8; margin-top: 0;">What's Next?</h3>
                <ul style="color: #1e40af; margin: 10px 0; padding-left: 20px;">
                  <li>Check your patient dashboard for any prescriptions or follow-up instructions</li>
                  <li>Follow the treatment plan discussed during the consultation</li>
                  <li>Schedule a follow-up appointment if recommended</li>
                  <li>Contact us if you have any questions about your consultation</li>
                </ul>
              </div>
              
              <div style="background-color: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <h4 style="color: #d97706; margin-top: 0;">📝 Important Reminders:</h4>
                <ul style="color: #92400e; margin: 10px 0; padding-left: 20px;">
                  <li>Take medications as prescribed</li>
                  <li>Follow dietary and lifestyle recommendations</li>
                  <li>Attend follow-up appointments as scheduled</li>
                  <li>Contact your doctor if symptoms worsen</li>
                </ul>
              </div>
              
              <p>Thank you for choosing Medical Universe for your healthcare needs. We hope you had a positive experience with our platform.</p>
              
              <p style="margin-top: 30px;">
                Best regards,<br>
                <strong>Medical Universe Team</strong>
              </p>
              
              <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
              <p style="font-size: 12px; color: #6b7280; text-align: center;">
                This is an automated message. Please do not reply to this email.
              </p>
            </div>
          `,
        });

        console.log('Meeting ended email response:', emailResponse);

        if (emailResponse.error) {
          emailError = emailResponse.error.message;
          console.error('Meeting ended email failed:', emailResponse.error);
        } else {
          emailSent = true;
          console.log('Meeting ended email sent successfully');
        }

      } catch (error: any) {
        emailError = error.message;
        console.error('Meeting ended email error:', error);
      }

      return new Response(JSON.stringify({ 
        success: true, 
        emailSent,
        emailError,
        message: emailSent 
          ? 'Meeting ended notification sent successfully'
          : `Meeting ended but email notification failed: ${emailError}`
      }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      });
    }

    console.log('Creating Google Meet link for appointment:', appointmentId);

    // For now, we'll create a simple Google Meet link
    // In a full implementation, you'd use Google Calendar API to create an actual meeting
    const meetingId = `meet-${appointmentId.slice(0, 8)}-${Date.now()}`;
    const meetLink = `https://meet.google.com/${meetingId}`;

    // Update the appointment with the meet link
    const { error: updateError } = await supabase
      .from('appointments')
      .update({ meeting_link: meetLink })
      .eq('id', appointmentId);

    if (updateError) {
      console.error('Error updating appointment:', updateError);
      throw updateError;
    }

    // Format the appointment date
    const formattedDate = new Date(appointmentDate).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    let emailSent = false;
    let emailError = null;

    try {
      // Send email to patient
      const emailResponse = await resend.emails.send({
        from: "Medical Universe <onboarding@resend.dev>",
        to: [patientEmail],
        subject: `Google Meet Link for Your Appointment with ${doctorName}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #2563eb;">Your Online Consultation is Ready!</h2>
            
            <p>Dear ${patientName},</p>
            
            <p>Your online consultation with <strong>${doctorName}</strong> is scheduled for:</p>
            <p style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <strong>📅 Date & Time:</strong> ${formattedDate}
            </p>
            
            <div style="background-color: #dbeafe; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
              <h3 style="color: #1d4ed8; margin-top: 0;">Join Your Meeting</h3>
              <a href="${meetLink}" 
                 style="display: inline-block; background-color: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 10px 0;">
                Join Google Meet
              </a>
              <p style="margin-top: 15px; font-size: 14px; color: #6b7280;">
                Meeting Link: <a href="${meetLink}" style="color: #2563eb;">${meetLink}</a>
              </p>
            </div>
            
            <div style="background-color: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <h4 style="color: #d97706; margin-top: 0;">📝 Important Notes:</h4>
              <ul style="color: #92400e; margin: 10px 0; padding-left: 20px;">
                <li>Please join the meeting 5 minutes before the scheduled time</li>
                <li>Ensure you have a stable internet connection</li>
                <li>Have your medical reports and questions ready</li>
                <li>Test your camera and microphone beforehand</li>
              </ul>
            </div>
            
            <p>If you have any technical issues or need to reschedule, please contact us immediately.</p>
            
            <p style="margin-top: 30px;">
              Best regards,<br>
              <strong>Medical Universe Team</strong>
            </p>
            
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
            <p style="font-size: 12px; color: #6b7280; text-align: center;">
              This is an automated message. Please do not reply to this email.
            </p>
          </div>
        `,
      });

      console.log('Email response:', emailResponse);

      if (emailResponse.error) {
        emailError = emailResponse.error.message;
        console.error('Email sending failed:', emailResponse.error);
      } else {
        emailSent = true;
        console.log('Email sent successfully');
      }

    } catch (error: any) {
      emailError = error.message;
      console.error('Email sending error:', error);
    }

    return new Response(JSON.stringify({ 
      success: true, 
      meetLink,
      emailSent,
      emailError,
      message: emailSent 
        ? 'Google Meet link created and sent successfully'
        : `Google Meet link created but email failed: ${emailError}`
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
      },
    });

  } catch (error: any) {
    console.error('Error in send-meet-link function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false 
      }),
      {
        status: 500,
        headers: { 
          'Content-Type': 'application/json', 
          ...corsHeaders 
        },
      }
    );
  }
};

serve(handler);
