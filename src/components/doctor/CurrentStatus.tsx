
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, CheckCircle, AlertCircle } from "lucide-react";

interface CurrentStatusProps {
  isAvailable: boolean;
  availabilityStatus: string;
  availabilityMessage: string;
}

const CurrentStatus: React.FC<CurrentStatusProps> = ({
  isAvailable,
  availabilityStatus,
  availabilityMessage
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Current Availability Status
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
          {isAvailable ? (
            <CheckCircle className="h-6 w-6 text-green-500" />
          ) : (
            <AlertCircle className="h-6 w-6 text-red-500" />
          )}
          <div>
            <p className={`font-semibold ${isAvailable ? 'text-green-700' : 'text-red-700'}`}>
              {isAvailable ? 'Available' : 'Not Available'}
            </p>
            <p className="text-sm text-gray-600">{availabilityStatus}</p>
            {availabilityMessage && (
              <p className="text-sm text-gray-500 mt-1">{availabilityMessage}</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CurrentStatus;
