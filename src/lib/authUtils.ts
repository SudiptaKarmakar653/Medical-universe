
export const generateOTP = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export const sendOTPEmail = async (email: string, otp: string, expiryTime: string): Promise<void> => {
  // Mock implementation for OTP sending
  console.log(`Sending OTP ${otp} to ${email}, expires at ${expiryTime}`);
  // In a real implementation, you would use an email service like EmailJS
  return Promise.resolve();
};
