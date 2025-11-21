
import { useEffect, useState } from 'react';
import { useUser } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useAuthRedirect = () => {
  const { user, isLoaded } = useUser();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isApproved, setIsApproved] = useState<boolean>(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUserRoleAndRedirect = async () => {
      if (!isLoaded) return;
      
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        // Check user profile in Supabase
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('role, is_approved')
          .eq('id', user.id)
          .single();

        if (error) {
          console.error('Error fetching user profile:', error);
          // If profile doesn't exist, create it based on Clerk metadata
          const role = user.unsafeMetadata?.role as string || 'patient';
          
          const { error: insertError } = await supabase
            .from('profiles')
            .insert({
              id: user.id,
              name: user.fullName || user.firstName || 'User',
              email: user.primaryEmailAddress?.emailAddress,
              role: role as 'patient' | 'doctor' | 'admin',
              full_name: user.fullName
            });

          if (insertError) {
            console.error('Error creating profile:', insertError);
            toast({
              title: "Error",
              description: "Failed to create user profile",
              variant: "destructive"
            });
          }

          setUserRole(role);
          setIsApproved(role !== 'doctor'); // Doctors need approval
        } else {
          setUserRole(profile.role);
          setIsApproved(profile.is_approved ?? true);
        }

        setLoading(false);
      } catch (error) {
        console.error('Error in auth redirect:', error);
        setLoading(false);
      }
    };

    checkUserRoleAndRedirect();
  }, [user, isLoaded, toast]);

  const redirectToDashboard = () => {
    if (!userRole) return;

    if (userRole === 'doctor' && !isApproved) {
      toast({
        title: "Account Pending Approval",
        description: "Your doctor account is pending admin approval. You'll be redirected to the patient dashboard.",
        variant: "default"
      });
      navigate('/patient-dashboard');
      return;
    }

    switch (userRole) {
      case 'admin':
        navigate('/admin-dashboard');
        break;
      case 'doctor':
        navigate('/doctor-dashboard');
        break;
      case 'patient':
        navigate('/patient-dashboard');
        break;
      default:
        navigate('/patient-dashboard');
    }
  };

  return {
    userRole,
    isApproved,
    loading,
    redirectToDashboard
  };
};
