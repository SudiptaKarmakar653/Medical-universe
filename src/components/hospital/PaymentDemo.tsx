
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CreditCard, Shield, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface PaymentDemoProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  bookingData: any;
}

const PaymentDemo: React.FC<PaymentDemoProps> = ({
  isOpen,
  onClose,
  onSuccess,
  bookingData
}) => {
  const { toast } = useToast();
  const [paymentData, setPaymentData] = useState({
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    cardHolder: ""
  });
  const [processing, setProcessing] = useState(false);

  // Calculate demo pricing
  const basePrice = bookingData?.bedType === 'ICU' ? 5000 : 2000;
  const emergencyFee = bookingData?.isEmergency ? 1000 : 0;
  const totalAmount = basePrice + emergencyFee;

  const handleInputChange = (field: string, value: string) => {
    setPaymentData(prev => ({ ...prev, [field]: value }));
  };

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  const formatExpiryDate = (value: string) => {
    const v = value.replace(/\D/g, '');
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2, 4);
    }
    return v;
  };

  const handlePayment = async () => {
    // Validate payment fields
    if (!paymentData.cardNumber || !paymentData.expiryDate || !paymentData.cvv || !paymentData.cardHolder) {
      toast({
        title: "Missing Information",
        description: "Please fill in all payment details",
        variant: "destructive"
      });
      return;
    }

    setProcessing(true);

    // Simulate payment processing
    setTimeout(() => {
      setProcessing(false);
      toast({
        title: "Payment Successful!",
        description: "Your payment has been processed successfully",
      });
      onSuccess();
    }, 3000);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[95vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="text-2xl text-center text-medical-aqua flex items-center justify-center gap-2">
            <CreditCard className="h-6 w-6" />
            Secure Payment
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-1">
          <div className="space-y-6 pb-4">
            {/* Booking Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Booking Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Patient Name:</span>
                  <span className="font-medium">{bookingData?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Bed Type:</span>
                  <span className="font-medium">{bookingData?.bedType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Emergency Case:</span>
                  <span className="font-medium">{bookingData?.isEmergency ? "Yes" : "No"}</span>
                </div>
                <hr className="my-3" />
                <div className="flex justify-between">
                  <span className="text-gray-600">Bed Charges:</span>
                  <span>₹{basePrice.toLocaleString()}</span>
                </div>
                {emergencyFee > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Emergency Fee:</span>
                    <span>₹{emergencyFee.toLocaleString()}</span>
                  </div>
                )}
                <hr className="my-3" />
                <div className="flex justify-between text-lg font-bold">
                  <span>Total Amount:</span>
                  <span className="text-medical-aqua">₹{totalAmount.toLocaleString()}</span>
                </div>
              </CardContent>
            </Card>

            {/* Payment Form */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Shield className="h-5 w-5 text-green-600" />
                  Payment Details
                </CardTitle>
                <p className="text-sm text-gray-600">
                  This is a demo payment system. No real charges will be made.
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="cardHolder">Cardholder Name</Label>
                  <Input
                    id="cardHolder"
                    value={paymentData.cardHolder}
                    onChange={(e) => handleInputChange('cardHolder', e.target.value)}
                    placeholder="John Doe"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cardNumber">Card Number</Label>
                  <Input
                    id="cardNumber"
                    value={paymentData.cardNumber}
                    onChange={(e) => handleInputChange('cardNumber', formatCardNumber(e.target.value))}
                    placeholder="1234 5678 9012 3456"
                    maxLength={19}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="expiryDate">Expiry Date</Label>
                    <Input
                      id="expiryDate"
                      value={paymentData.expiryDate}
                      onChange={(e) => handleInputChange('expiryDate', formatExpiryDate(e.target.value))}
                      placeholder="MM/YY"
                      maxLength={5}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cvv">CVV</Label>
                    <Input
                      id="cvv"
                      value={paymentData.cvv}
                      onChange={(e) => handleInputChange('cvv', e.target.value.replace(/\D/g, ''))}
                      placeholder="123"
                      maxLength={3}
                    />
                  </div>
                </div>

                {/* Demo Payment Notice */}
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 text-blue-700">
                    <CheckCircle className="h-5 w-5" />
                    <p className="font-medium">Demo Payment System</p>
                  </div>
                  <p className="text-sm text-blue-600 mt-1">
                    This is a demonstration. No actual payment will be processed.
                    Use any test card details to proceed.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Action Buttons - Fixed at bottom */}
        <div className="flex-shrink-0 flex gap-4 pt-4 border-t">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onClose} 
            className="flex-1"
            disabled={processing}
          >
            Cancel
          </Button>
          <Button 
            onClick={handlePayment}
            className="flex-1 bg-gradient-med hover:shadow-lg"
            disabled={processing}
          >
            {processing ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Processing Payment...
              </div>
            ) : (
              `Pay ₹${totalAmount.toLocaleString()}`
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentDemo;
