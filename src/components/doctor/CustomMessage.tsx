
import React from "react";
import { Textarea } from "@/components/ui/textarea";

interface CustomMessageProps {
  value: string;
  onChange: (value: string) => void;
}

const CustomMessage: React.FC<CustomMessageProps> = ({ value, onChange }) => {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">Custom Message (Optional)</label>
      <Textarea
        placeholder="Add a custom message for patients (e.g., 'Will be back at 3 PM', 'Available for emergencies only')"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={3}
      />
    </div>
  );
};

export default CustomMessage;
