
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

interface AdminProtectionProps {
  children: React.ReactNode;
}

const AdminProtection: React.FC<AdminProtectionProps> = ({ children }) => {
  const navigate = useNavigate();
  const [isChecking, setIsChecking] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAdminSession = async () => {
      try {
        // Check localStorage admin session
        const isAdminLoggedIn = localStorage.getItem('adminLoggedIn') === 'true';
        const adminUser = localStorage.getItem('adminUser');
        
        if (!isAdminLoggedIn || adminUser !== 'SUBHODEEP PAL') {
          console.log('No valid admin localStorage session');
          navigate('/admin-login');
          return;
        }

        // Check Supabase session
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.error('Error checking Supabase session:', error);
        }

        if (!session) {
          console.log('No Supabase session found, but localStorage admin session exists');
          // For now, trust localStorage session for backward compatibility
        } else {
          console.log('Valid Supabase session found:', session.user.id);
        }
        
        setIsAuthenticated(true);
        setIsChecking(false);
      } catch (error) {
        console.error('Error checking admin session:', error);
        navigate('/admin-login');
      }
    };

    checkAdminSession();
  }, [navigate]);

  // Show loading while checking
  if (isChecking) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Verifying admin access...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
};

export default AdminProtection;
