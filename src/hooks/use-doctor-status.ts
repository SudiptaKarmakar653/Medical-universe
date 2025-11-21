
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useDoctorStatus = (doctorEmail: string) => {
  const [approvalStatus, setApprovalStatus] = useState<'pending' | 'approved' | 'rejected' | 'not_found'>('not_found');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!doctorEmail) {
      setIsLoading(false);
      return;
    }

    const checkApprovalStatus = async () => {
      try {
        setIsLoading(true);
        console.log('Checking approval status for:', doctorEmail);

        // First check doctor profiles for approval status
        const { data: profileData, error: profileError } = await supabase
          .from('doctor_profiles')
          .select('is_approved, email, id')
          .eq('email', doctorEmail)
          .maybeSingle();

        if (profileError) {
          console.error('Error checking doctor profiles:', profileError);
        }

        // Then check verification requests
        const { data: verificationData, error: verificationError } = await supabase
          .from('doctor_verification_requests')
          .select('status, email')
          .eq('email', doctorEmail)
          .order('created_at', { ascending: false })
          .limit(1);

        if (verificationError) {
          console.error('Error checking verification requests:', verificationError);
        }

        console.log('Profile data:', profileData);
        console.log('Verification data:', verificationData);

        // Determine status based on data
        if (profileData && profileData.is_approved === true) {
          // Doctor profile exists and is approved
          console.log('Doctor is approved in doctor_profiles');
          setApprovalStatus('approved');
        } else if (profileData && profileData.is_approved === false) {
          // Doctor profile exists but not approved (shouldn't happen in normal flow)
          console.log('Doctor profile exists but not approved');
          setApprovalStatus('not_found');
        } else if (!profileData && verificationData && verificationData.length > 0) {
          // No doctor profile but has verification request
          const status = verificationData[0].status;
          console.log('No doctor profile found, checking verification request status:', status);
          if (status === 'approved') {
            // This case should not happen normally - verification approved but no doctor profile
            setApprovalStatus('not_found');
          } else if (status === 'rejected') {
            setApprovalStatus('rejected');
          } else {
            setApprovalStatus('pending');
          }
        } else {
          // No doctor profile and no verification request - doctor was likely removed or never existed
          console.log('No doctor profile or verification request found - doctor may have been removed');
          setApprovalStatus('not_found');
        }

      } catch (error) {
        console.error('Error checking doctor approval status:', error);
        setApprovalStatus('not_found');
      } finally {
        setIsLoading(false);
      }
    };

    checkApprovalStatus();

    // Set up real-time subscription to listen for approval status changes
    const channel = supabase
      .channel('doctor-approval-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'doctor_profiles',
          filter: `email=eq.${doctorEmail}`
        },
        (payload) => {
          console.log('Doctor profile changed:', payload);
          checkApprovalStatus(); // Re-check status when profile changes
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'doctor_verification_requests',
          filter: `email=eq.${doctorEmail}`
        },
        (payload) => {
          console.log('Verification request changed:', payload);
          checkApprovalStatus(); // Re-check status when verification request changes
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [doctorEmail]);

  return { approvalStatus, isLoading };
};
