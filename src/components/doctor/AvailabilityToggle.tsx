
import React from "react";
import { Switch } from "@/components/ui/switch";

interface AvailabilityToggleProps {
  isAvailable: boolean;
  onToggle: (checked: boolean) => void;
}

const AvailabilityToggle: React.FC<AvailabilityToggleProps> = ({
  isAvailable,
  onToggle
}) => {
  return (
    <div className="flex items-center justify-between p-4 border rounded-lg">
      <div>
        <h3 className="font-medium">Available for Appointments</h3>
        <p className="text-sm text-gray-500">
          Toggle your availability for new appointments
        </p>
      </div>
      <Switch
        checked={isAvailable}
        onCheckedChange={onToggle}
      />
    </div>
  );
};

export default AvailabilityToggle;
