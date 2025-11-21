
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useUser } from '@clerk/clerk-react';

interface AuthContextType {
  user: any | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  isAuthenticated: false,
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user: clerkUser, isLoaded } = useUser();
  const [user, setUser] = useState<any | null>(null);

  useEffect(() => {
    if (isLoaded) {
      if (clerkUser) {
        console.log('Full Clerk user object:', clerkUser);
        console.log('Phone numbers array:', clerkUser.phoneNumbers);
        console.log('Primary phone number:', clerkUser.primaryPhoneNumber);
        console.log('Primary phone number phoneNumber:', clerkUser.primaryPhoneNumber?.phoneNumber);
        
        setUser({
          id: clerkUser.id,
          email: clerkUser.primaryEmailAddress?.emailAddress,
          name: clerkUser.fullName || clerkUser.firstName || 'User',
          role: clerkUser.publicMetadata?.role || 'patient',
          phoneNumbers: clerkUser.phoneNumbers,
          primaryPhoneNumber: clerkUser.primaryPhoneNumber,
        });
      } else {
        setUser(null);
      }
    }
  }, [clerkUser, isLoaded]);

  return (
    <AuthContext.Provider value={{
      user,
      isLoading: !isLoaded,
      isAuthenticated: !!user,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
