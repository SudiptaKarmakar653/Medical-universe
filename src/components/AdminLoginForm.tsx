
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Lock, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import FaceLockVerification from "@/components/admin/FaceLockVerification";

interface AdminLoginFormState {
  username: string;
  password: string;
}

const AdminLoginForm = () => {
  const [formData, setFormData] = useState<AdminLoginFormState>({
    username: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showFaceVerification, setShowFaceVerification] = useState(false);
  const [storedFaceDescriptors, setStoredFaceDescriptors] = useState<number[][]>([]);
  const [faceLockEnabled, setFaceLockEnabled] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    checkFaceLockStatus();
  }, []);

  const checkFaceLockStatus = async () => {
    try {
      const { data } = await supabase
        .from('admin_security_settings')
        .select('face_detection_enabled')
        .eq('admin_username', 'SUBHODEEP PAL')
        .single();

      if (data) {
        setFaceLockEnabled(data.face_detection_enabled);
      }
    } catch (error) {
      console.error('Error checking FaceLock status:', error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Check credentials first
      if (formData.username === "SUBHODEEP PAL" && formData.password === "Pal@2005") {
        
        // If FaceLock is enabled, proceed to face verification
        if (faceLockEnabled) {
          const { data: faceData } = await supabase
            .from('admin_face_descriptors')
            .select('face_descriptors')
            .eq('admin_username', 'SUBHODEEP PAL')
            .eq('is_active', true)
            .single();

          if (faceData && faceData.face_descriptors) {
            // Properly type the face descriptors data
            const descriptors = faceData.face_descriptors as number[][];
            setStoredFaceDescriptors(descriptors);
            setShowFaceVerification(true);
            setIsLoading(false);
            return;
          } else {
            toast({
              title: "FaceLock Error",
              description: "Face recognition data not found. Please contact administrator.",
              variant: "destructive"
            });
            setIsLoading(false);
            return;
          }
        }

        // If FaceLock is disabled, proceed with normal login
        await completeLogin();
      } else {
        toast({
          title: "Login failed",
          description: "Invalid admin credentials. Please use: SUBHODEEP PAL / Pal@2005",
          variant: "destructive"
        });
      }
    } catch (error: any) {
      console.error("Admin login error:", error);
      toast({
        title: "Login failed",
        description: "Authentication error occurred",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const completeLogin = async () => {
    try {
      // Clear any existing admin session first
      localStorage.removeItem('adminLoggedIn');
      localStorage.removeItem('adminUser');
      
      // Wait a moment for cleanup
      await new Promise(resolve => setTimeout(resolve, 100));

      // Set new admin session
      localStorage.setItem('adminLoggedIn', 'true');
      localStorage.setItem('adminUser', formData.username);
      
      toast({
        title: "Login successful",
        description: "Welcome to the admin dashboard, SUBHODEEP PAL."
      });
      
      navigate("/admin-dashboard");
    } catch (error) {
      console.error("Error completing login:", error);
      toast({
        title: "Login error",
        description: "Failed to complete login process",
        variant: "destructive"
      });
    }
  };

  const handleFaceVerificationSuccess = () => {
    setShowFaceVerification(false);
    completeLogin();
  };

  const handleFaceVerificationFailure = () => {
    setShowFaceVerification(false);
    toast({
      title: "Access Denied",
      description: "Face not recognized. Access denied.",
      variant: "destructive"
    });
  };

  const handleFaceVerificationCancel = () => {
    setShowFaceVerification(false);
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="username">Username</Label>
          <div className="relative">
            <User className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
            <Input 
              id="username" 
              placeholder="Enter admin username" 
              value={formData.username} 
              onChange={handleChange} 
              className="pl-10" 
              required 
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
            <Input 
              id="password" 
              type="password" 
              placeholder="Enter admin password" 
              value={formData.password} 
              onChange={handleChange} 
              className="pl-10" 
              required 
            />
          </div>
        </div>
        
        <div className="pt-2">
          <Button type="submit" disabled={isLoading} className="w-full rounded-full my-[50px]">
            {isLoading ? "Verifying..." : "Login to Admin Panel"}
          </Button>
        </div>
        
        <div className="text-center text-sm text-gray-500">
          <p>Admin credentials:</p>
          <p className="font-mono bg-gray-100 p-1 mt-1 rounded text-xs">Username: SUBHODEEP PAL</p>
          <p className="font-mono bg-gray-100 p-1 mt-1 rounded text-xs">Password: Pal@2005</p>
          {faceLockEnabled && (
            <p className="text-xs text-blue-600 mt-2">🔒 FaceLock enabled - Face verification required</p>
          )}
        </div>
      </form>

      {showFaceVerification && (
        <FaceLockVerification
          storedDescriptors={storedFaceDescriptors}
          onSuccess={handleFaceVerificationSuccess}
          onFailure={handleFaceVerificationFailure}
          onCancel={handleFaceVerificationCancel}
        />
      )}
    </>
  );
};

export default AdminLoginForm;
