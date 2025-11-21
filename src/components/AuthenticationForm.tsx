
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MailIcon, LockIcon, UserIcon, ArrowRight, Briefcase, BookOpen, Building, DollarSign } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

// Local utility functions
const generateOTP = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const sendOTPEmail = async (email: string, otp: string, expiryTime: string): Promise<void> => {
  console.log(`Sending OTP ${otp} to ${email}, expires at ${expiryTime}`);
  return Promise.resolve();
};

type UserRole = "patient" | "doctor" | "admin";

interface AuthenticationFormProps {
  initialTab?: "login" | "register";
  initialRole?: "patient" | "doctor";
}

const specialties = [
  "Cardiology", 
  "Dermatology", 
  "Endocrinology", 
  "Gastroenterology", 
  "Neurology", 
  "Obstetrics", 
  "Ophthalmology", 
  "Orthopedics", 
  "Pediatrics", 
  "Psychiatry", 
  "Radiology", 
  "Urology"
];

const experienceLevels = ["1-3 years", "3-5 years", "5-10 years", "10+ years"];
const degrees = ["MBBS", "MD", "MS", "DNB", "DM", "MCh", "PhD", "MDS", "BDS"];
const feeRanges = ["₹200-₹500", "₹500-₹1000", "₹1000-₹2000", "₹2000-₹5000", "₹5000+"];

const AuthenticationForm: React.FC<AuthenticationFormProps> = ({ initialTab = "login", initialRole }) => {
  const [activeTab, setActiveTab] = useState<"login" | "register">(initialTab);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState<UserRole>(initialRole === "doctor" ? "doctor" : "patient");
  
  // Doctor specific fields
  const [specialty, setSpecialty] = useState("");
  const [experience, setExperience] = useState("");
  const [degree, setDegree] = useState("");
  const [hospital, setHospital] = useState("");
  const [feeRange, setFeeRange] = useState("");
  
  const [showOTP, setShowOTP] = useState(false);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [submitting, setSubmitting] = useState(false);
  const [generatedOTP, setGeneratedOTP] = useState("");
  const [otpExpiryTime, setOtpExpiryTime] = useState<Date | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Update role when initialRole prop changes
    if (initialRole) {
      setRole(initialRole);
    }
  }, [initialRole]);

  useEffect(() => {
    // Update active tab when initialTab prop changes
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) {
      value = value[0];
    }
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    
    // Auto-focus next input
    if (value !== "" && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      if (nextInput) {
        nextInput.focus();
      }
    }
  };

  const handleBackspace = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && otp[index] === "" && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      if (prevInput) {
        prevInput.focus();
      }
    }
  };

  const validateDoctorFields = () => {
    if (role === "doctor") {
      if (!specialty) {
        toast({
          title: "Missing Information",
          description: "Please select your medical specialty",
          variant: "destructive",
        });
        return false;
      }
      if (!experience) {
        toast({
          title: "Missing Information",
          description: "Please select your experience level",
          variant: "destructive",
        });
        return false;
      }
      if (!degree) {
        toast({
          title: "Missing Information",
          description: "Please select your medical degree",
          variant: "destructive",
        });
        return false;
      }
      if (!hospital) {
        toast({
          title: "Missing Information",
          description: "Please enter your hospital or clinic name",
          variant: "destructive",
        });
        return false;
      }
      if (!feeRange) {
        toast({
          title: "Missing Information",
          description: "Please select your consultation fee range",
          variant: "destructive",
        });
        return false;
      }
    }
    return true;
  };

  const createUserProfile = async (userId: string) => {
    try {
      // Create user profile
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: userId,
          name: name,
          email: email,
          role: role,
          full_name: name,
          is_approved: role !== 'doctor' // Doctors need approval
        });

      if (profileError) throw profileError;

      // If doctor, create doctor profile
      if (role === 'doctor') {
        const experienceYears = experience === "1-3 years" ? 2 : 
                               experience === "3-5 years" ? 4 :
                               experience === "5-10 years" ? 7 : 10;

        const { error: doctorError } = await supabase
          .from('doctor_profiles')
          .insert({
            id: userId,
            specialization: specialty,
            years_of_experience: experienceYears,
            years_experience: experienceYears,
            clinic_name: hospital,
            hospital_name: hospital,
            degree: degree,
            fee_range: feeRange,
            is_approved: false
          });

        if (doctorError) throw doctorError;

        // Create notification for admin
        const { error: notificationError } = await supabase
          .from('notifications')
          .insert({
            title: 'New Doctor Registration',
            message: `A new doctor ${name} has registered and needs approval.`,
            type: 'info'
          });

        if (notificationError) console.error('Error creating notification:', notificationError);
      }

      // If patient, create patient profile
      if (role === 'patient') {
        const { error: patientError } = await supabase
          .from('patient_profiles')
          .insert({
            id: userId
          });

        if (patientError) throw patientError;
      }

    } catch (error) {
      console.error('Error creating user profile:', error);
      throw error;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate common fields
    if (!email || !password || (activeTab === "register" && !name)) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }
    
    // Validate doctor specific fields
    if (activeTab === "register" && role === "doctor") {
      if (!validateDoctorFields()) {
        return;
      }
    }
    
    setSubmitting(true);

    if (showOTP) {
      // Verify OTP
      const enteredOTP = otp.join("");
      const now = new Date();
      
      if (enteredOTP !== generatedOTP) {
        toast({
          title: "Invalid OTP",
          description: "The verification code you entered is incorrect. Please try again.",
          variant: "destructive",
        });
        setSubmitting(false);
        return;
      }
      
      if (otpExpiryTime && now > otpExpiryTime) {
        toast({
          title: "OTP Expired",
          description: "The verification code has expired. Please request a new one.",
          variant: "destructive",
        });
        setSubmitting(false);
        return;
      }

      // OTP is valid, complete authentication
      if (activeTab === "register") {
        // For demo purposes, generate a mock user ID and create profile
        const mockUserId = `user_${Date.now()}`;
        try {
          await createUserProfile(mockUserId);
          
          if (role === "doctor") {
            toast({
              title: "Registration Successful",
              description: "Your doctor account has been created and is pending admin approval. You can access patient features while waiting.",
            });
          } else {
            toast({
              title: "Registration Successful",
              description: "Your account has been created successfully.",
            });
          }
        } catch (error) {
          toast({
            title: "Registration Failed",
            description: "Failed to create user profile. Please try again.",
            variant: "destructive",
          });
          setSubmitting(false);
          return;
        }
      } else {
        toast({
          title: "Login Successful",
          description: "You have been logged in successfully.",
        });
      }

      // Redirect based on user role
      const dashboardPath = role === "doctor" 
        ? "/doctor-dashboard" 
        : "/patient-dashboard";
          
      navigate(dashboardPath);
    } else {
      // Initial login/register attempt - send OTP
      try {
        const generatedOtp = generateOTP();
        setGeneratedOTP(generatedOtp);
        
        // Set expiry time to 5 minutes from now
        const expiryTime = new Date();
        expiryTime.setMinutes(expiryTime.getMinutes() + 5);
        setOtpExpiryTime(expiryTime);
        
        // Format expiry time for display
        const expiryTimeString = `${expiryTime.getHours().toString().padStart(2, '0')}:${expiryTime.getMinutes().toString().padStart(2, '0')}`;
        
        await sendOTPEmail(email, generatedOtp, expiryTimeString);
        
        toast({
          title: "Verification code sent",
          description: "Please check your email for a 6-digit verification code.",
        });
        
        setShowOTP(true);
      } catch (error) {
        console.error("Error sending OTP:", error);
        toast({
          title: "Failed to send verification code",
          description: "Please check your email address and try again.",
          variant: "destructive",
        });
      }
    }
    
    setSubmitting(false);
  };

  const resendOTP = async () => {
    try {
      setSubmitting(true);
      const generatedOtp = generateOTP();
      setGeneratedOTP(generatedOtp);
      
      // Set expiry time to 5 minutes from now
      const expiryTime = new Date();
      expiryTime.setMinutes(expiryTime.getMinutes() + 5);
      setOtpExpiryTime(expiryTime);
      
      // Format expiry time for display
      const expiryTimeString = `${expiryTime.getHours().toString().padStart(2, '0')}:${expiryTime.getMinutes().toString().padStart(2, '0')}`;
      
      await sendOTPEmail(email, generatedOtp, expiryTimeString);
      
      toast({
        title: "Verification code resent",
        description: "Please check your email for a new 6-digit verification code.",
      });
    } catch (error) {
      console.error("Error resending OTP:", error);
      toast({
        title: "Failed to send verification code",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full mx-auto">
      {!showOTP ? (
        <Card className="border-0 shadow-sm">
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "login" | "register")} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="register">Register</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login">
              <form onSubmit={handleSubmit}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="text-center mb-4">
                      <p className="text-gray-500">Please choose your account type:</p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div 
                        className={`border rounded-lg p-4 text-center cursor-pointer transition-all ${
                          role === "patient" ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:border-blue-300"
                        }`}
                        onClick={() => setRole("patient")}
                      >
                        <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-2">
                          <UserIcon className="h-8 w-8 text-blue-600" />
                        </div>
                        <span className={`font-medium ${role === "patient" ? "text-blue-600" : "text-gray-700"}`}>Patient Login</span>
                      </div>
                      
                      <div 
                        className={`border rounded-lg p-4 text-center cursor-pointer transition-all ${
                          role === "doctor" ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:border-blue-300"
                        }`}
                        onClick={() => setRole("doctor")}
                      >
                        <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-2">
                          <Briefcase className="h-8 w-8 text-blue-600" />
                        </div>
                        <span className={`font-medium ${role === "doctor" ? "text-blue-600" : "text-gray-700"}`}>Doctor Login</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2 pt-4">
                    <div className="relative">
                      <MailIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="login-email"
                        placeholder="Email"
                        type="email"
                        className="pl-10"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="relative">
                      <LockIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="login-password"
                        placeholder="Password"
                        type="password"
                        className="pl-10"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button
                    type="submit"
                    className="w-full rounded-full"
                    disabled={submitting}
                  >
                    {submitting ? "Sending verification..." : "Login"}
                    {!submitting && <ArrowRight className="ml-2 h-4 w-4" />}
                  </Button>
                </CardFooter>
              </form>
            </TabsContent>
            
            <TabsContent value="register">
              <form onSubmit={handleSubmit}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="text-center mb-4">
                      <p className="text-gray-500">I want to register as a:</p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div 
                        className={`border rounded-lg p-4 text-center cursor-pointer transition-all ${
                          role === "patient" ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:border-blue-300"
                        }`}
                        onClick={() => setRole("patient")}
                      >
                        <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-2">
                          <UserIcon className="h-8 w-8 text-blue-600" />
                        </div>
                        <span className={`font-medium ${role === "patient" ? "text-blue-600" : "text-gray-700"}`}>Patient</span>
                      </div>
                      
                      <div 
                        className={`border rounded-lg p-4 text-center cursor-pointer transition-all ${
                          role === "doctor" ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:border-blue-300"
                        }`}
                        onClick={() => setRole("doctor")}
                      >
                        <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-2">
                          <Briefcase className="h-8 w-8 text-blue-600" />
                        </div>
                        <span className={`font-medium ${role === "doctor" ? "text-blue-600" : "text-gray-700"}`}>Doctor</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="relative">
                      <UserIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="name"
                        placeholder="Full Name"
                        className="pl-10"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="relative">
                      <MailIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="email"
                        placeholder="Email"
                        type="email"
                        className="pl-10"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="relative">
                      <LockIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="password"
                        placeholder="Password"
                        type="password"
                        className="pl-10"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  
                  {role === "doctor" && (
                    <div className="space-y-4 pt-2 border-t border-gray-200">
                      <h3 className="text-md font-medium text-gray-700">Professional Information</h3>
                      
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Specialty</label>
                        <Select value={specialty} onValueChange={setSpecialty}>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select your specialty" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectGroup>
                              {specialties.map((spec) => (
                                <SelectItem key={spec} value={spec}>{spec}</SelectItem>
                              ))}
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Experience</label>
                          <Select value={experience} onValueChange={setExperience}>
                            <SelectTrigger>
                              <SelectValue placeholder="Years of practice" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectGroup>
                                {experienceLevels.map((exp) => (
                                  <SelectItem key={exp} value={exp}>{exp}</SelectItem>
                                ))}
                              </SelectGroup>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Degree</label>
                          <Select value={degree} onValueChange={setDegree}>
                            <SelectTrigger>
                              <SelectValue placeholder="Medical degree" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectGroup>
                                {degrees.map((deg) => (
                                  <SelectItem key={deg} value={deg}>{deg}</SelectItem>
                                ))}
                              </SelectGroup>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Hospital/Clinic</label>
                        <div className="relative">
                          <Building className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            placeholder="Hospital or clinic name"
                            className="pl-10"
                            value={hospital}
                            onChange={(e) => setHospital(e.target.value)}
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Consultation Fee Range</label>
                        <Select value={feeRange} onValueChange={setFeeRange}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select fee range" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectGroup>
                              {feeRanges.map((fee) => (
                                <SelectItem key={fee} value={fee}>{fee}</SelectItem>
                              ))}
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  )}
                </CardContent>
                <CardFooter>
                  <Button
                    type="submit"
                    className="w-full rounded-full"
                    disabled={submitting}
                  >
                    {submitting ? "Sending verification..." : "Register"}
                    {!submitting && <ArrowRight className="ml-2 h-4 w-4" />}
                  </Button>
                </CardFooter>
              </form>
            </TabsContent>
          </Tabs>
        </Card>
      ) : (
        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="text-center mb-6">
              <h3 className="text-xl font-bold">Verify your email</h3>
              <p className="text-sm text-gray-500 mt-1">We've sent a 6-digit verification code to {email}</p>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="flex flex-col space-y-4">
                <div className="flex justify-center space-x-2">
                  {[0, 1, 2, 3, 4, 5].map((index) => (
                    <Input
                      key={index}
                      id={`otp-${index}`}
                      type="text"
                      value={otp[index]}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleBackspace(index, e)}
                      className="w-10 h-12 text-center text-lg p-0"
                      maxLength={1}
                      pattern="[0-9]"
                      inputMode="numeric"
                      autoComplete="one-time-code"
                    />
                  ))}
                </div>
                <div className="text-center text-sm mt-4">
                  <span>Didn't receive the code? </span>
                  <button
                    type="button"
                    onClick={resendOTP}
                    className="text-primary underline font-medium"
                    disabled={submitting}
                  >
                    Resend
                  </button>
                </div>
                <Button type="submit" className="w-full mt-4 rounded-full" disabled={submitting}>
                  {submitting ? "Verifying..." : "Verify"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AuthenticationForm;
