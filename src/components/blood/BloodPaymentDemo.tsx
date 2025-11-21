
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CreditCard, Shield, CheckCircle, Smartphone } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface BloodPaymentDemoProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  requestData: any;
}

const BloodPaymentDemo: React.FC<BloodPaymentDemoProps> = ({
  isOpen,
  onClose,
  onSuccess,
  requestData
}) => {
  const { toast } = useToast();
  const [cardData, setCardData] = useState({
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    cardHolder: ""
  });
  const [upiId, setUpiId] = useState("");
  const [processing, setProcessing] = useState(false);

  const fixedAmount = 500;

  const handleCardInputChange = (field: string, value: string) => {
    setCardData(prev => ({ ...prev, [field]: value }));
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

  const handleCardPayment = async () => {
    if (!cardData.cardNumber || !cardData.expiryDate || !cardData.cvv || !cardData.cardHolder) {
      toast({
        title: "Missing Information",
        description: "Please fill in all card details",
        variant: "destructive"
      });
      return;
    }
    processPayment();
  };

  const handleUpiPayment = async () => {
    if (!upiId) {
      toast({
        title: "Missing Information",
        description: "Please enter your UPI ID",
        variant: "destructive"
      });
      return;
    }
    processPayment();
  };

  const processPayment = () => {
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
          <DialogTitle className="text-2xl text-center text-red-600 flex items-center justify-center gap-2">
            <CreditCard className="h-6 w-6" />
            Payment for Blood Request
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-1">
          <div className="space-y-6 pb-4">
            {/* Request Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Request Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Patient Name:</span>
                  <span className="font-medium">{requestData?.fullName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Blood Group:</span>
                  <span className="font-medium">{requestData?.bloodGroup}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Emergency Level:</span>
                  <span className="font-medium">{requestData?.emergencyLevel}</span>
                </div>
                <hr className="my-3" />
                <div className="flex justify-between text-lg font-bold">
                  <span>Total Amount:</span>
                  <span className="text-red-600">₹{fixedAmount}</span>
                </div>
              </CardContent>
            </Card>

            {/* Payment Options */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Shield className="h-5 w-5 text-green-600" />
                  Payment Options
                </CardTitle>
                <p className="text-sm text-gray-600">
                  This is a demo payment system. No real charges will be made.
                </p>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="card" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="card" className="flex items-center gap-2">
                      <CreditCard className="h-4 w-4" />
                      Card Payment
                    </TabsTrigger>
                    <TabsTrigger value="upi" className="flex items-center gap-2">
                      <Smartphone className="h-4 w-4" />
                      UPI Payment
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="card" className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="cardHolder">Cardholder Name</Label>
                      <Input
                        id="cardHolder"
                        value={cardData.cardHolder}
                        onChange={(e) => handleCardInputChange('cardHolder', e.target.value)}
                        placeholder="John Doe"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="cardNumber">Card Number</Label>
                      <Input
                        id="cardNumber"
                        value={cardData.cardNumber}
                        onChange={(e) => handleCardInputChange('cardNumber', formatCardNumber(e.target.value))}
                        placeholder="1234 5678 9012 3456"
                        maxLength={19}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="expiryDate">Expiry Date</Label>
                        <Input
                          id="expiryDate"
                          value={cardData.expiryDate}
                          onChange={(e) => handleCardInputChange('expiryDate', formatExpiryDate(e.target.value))}
                          placeholder="MM/YY"
                          maxLength={5}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="cvv">CVV</Label>
                        <Input
                          id="cvv"
                          value={cardData.cvv}
                          onChange={(e) => handleCardInputChange('cvv', e.target.value.replace(/\D/g, ''))}
                          placeholder="123"
                          maxLength={3}
                        />
                      </div>
                    </div>

                    <Button 
                      onClick={handleCardPayment}
                      className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700"
                      disabled={processing}
                    >
                      {processing ? (
                        <div className="flex items-center gap-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          Processing Payment...
                        </div>
                      ) : (
                        `Pay ₹${fixedAmount} via Card`
                      )}
                    </Button>
                  </TabsContent>

                  <TabsContent value="upi" className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="upiId">UPI ID</Label>
                      <Input
                        id="upiId"
                        value={upiId}
                        onChange={(e) => setUpiId(e.target.value)}
                        placeholder="yourname@paytm"
                      />
                    </div>

                    <div className="bg-blue-50 p-4 rounded-lg">
                      <div className="flex items-center gap-2 text-blue-700">
                        <CheckCircle className="h-5 w-5" />
                        <p className="font-medium">UPI Payment</p>
                      </div>
                      <p className="text-sm text-blue-600 mt-1">
                        Enter your UPI ID to proceed with the payment. This is a demo system.
                      </p>
                    </div>

                    <Button 
                      onClick={handleUpiPayment}
                      className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
                      disabled={processing}
                    >
                      {processing ? (
                        <div className="flex items-center gap-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          Processing Payment...
                        </div>
                      ) : (
                        `Pay ₹${fixedAmount} via UPI`
                      )}
                    </Button>
                  </TabsContent>
                </Tabs>

                {/* Demo Notice */}
                <div className="bg-green-50 p-4 rounded-lg mt-4">
                  <div className="flex items-center gap-2 text-green-700">
                    <CheckCircle className="h-5 w-5" />
                    <p className="font-medium">Demo Payment System</p>
                  </div>
                  <p className="text-sm text-green-600 mt-1">
                    This is a demonstration. No actual payment will be processed.
                    Use any test details to proceed.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Cancel Button */}
        <div className="flex-shrink-0 pt-4 border-t">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onClose} 
            className="w-full"
            disabled={processing}
          >
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BloodPaymentDemo;
