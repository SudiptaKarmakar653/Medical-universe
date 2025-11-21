
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { CheckCircle, Calendar, User, Bed, FileText, Copy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface BookingConfirmationProps {
  isOpen: boolean;
  onClose: () => void;
  bookingId: string;
  bookingData: any;
}

const BookingConfirmation: React.FC<BookingConfirmationProps> = ({
  isOpen,
  onClose,
  bookingId,
  bookingData
}) => {
  const { toast } = useToast();

  const copyBookingId = () => {
    navigator.clipboard.writeText(bookingId);
    toast({
      title: "Copied!",
      description: "Booking ID copied to clipboard",
    });
  };

  const currentDate = new Date().toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[95vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="text-2xl text-center text-green-600 flex items-center justify-center gap-2">
            <CheckCircle className="h-8 w-8" />
            Admission Confirmed!
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-1">
          <div className="space-y-6 pb-4">
            {/* Success Message */}
            <div className="text-center bg-green-50 p-6 rounded-lg">
              <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-green-800 mb-2">
                Your hospital bed has been successfully booked!
              </h3>
              <p className="text-green-700">
                Please arrive at the hospital with this confirmation and your medical documents.
              </p>
            </div>

            {/* Booking ID Card */}
            <Card className="border-2 border-medical-aqua">
              <CardHeader className="bg-gradient-to-r from-medical-aqua to-medical-cyan text-white">
                <CardTitle className="text-center text-xl">
                  Booking Confirmation
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="text-center mb-4">
                  <Label className="text-sm text-gray-600 uppercase tracking-wide">
                    Booking ID
                  </Label>
                  <div className="flex items-center justify-center gap-2 mt-2">
                    <span className="text-2xl font-bold text-medical-aqua">
                      {bookingId}
                    </span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={copyBookingId}
                      className="h-8 w-8 p-0"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Keep this ID for future reference
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Booking Details */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Booking Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <User className="h-5 w-5 text-medical-aqua" />
                    <div>
                      <p className="text-sm text-gray-600">Patient Name</p>
                      <p className="font-medium">{bookingData?.name}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-medical-aqua" />
                    <div>
                      <p className="text-sm text-gray-600">Booking Date</p>
                      <p className="font-medium">{currentDate}</p>
                    </div>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <Bed className="h-5 w-5 text-medical-aqua" />
                    <div>
                      <p className="text-sm text-gray-600">Bed Type</p>
                      <p className="font-medium">{bookingData?.bedType}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-medical-aqua" />
                    <div>
                      <p className="text-sm text-gray-600">Emergency Case</p>
                      <p className="font-medium">{bookingData?.isEmergency ? "Yes" : "No"}</p>
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <p className="text-sm text-gray-600 mb-2">Medical Condition</p>
                  <p className="font-medium bg-gray-50 p-3 rounded-md">
                    {bookingData?.disease}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Important Instructions */}
            <Card className="border-l-4 border-l-amber-500">
              <CardHeader>
                <CardTitle className="text-lg text-amber-700">
                  Important Instructions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-start gap-2">
                    <span className="text-amber-500 mt-1">•</span>
                    Please arrive at the hospital reception with this booking confirmation
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-amber-500 mt-1">•</span>
                    Bring all your medical documents and ID proof
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-amber-500 mt-1">•</span>
                    Contact hospital reception: +91-9876543210 for any queries
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-amber-500 mt-1">•</span>
                    Your booking is valid for 24 hours from the booking time
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Action Button - Fixed at bottom */}
        <div className="flex-shrink-0 text-center pt-4 border-t">
          <Button 
            onClick={onClose}
            className="bg-gradient-med hover:shadow-lg px-8"
            size="lg"
          >
            Continue to Dashboard
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BookingConfirmation;
