
import React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface StatusSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

const StatusSelector: React.FC<StatusSelectorProps> = ({ value, onChange }) => {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">Availability Status</label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger>
          <SelectValue placeholder="Select status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="Available">Available</SelectItem>
          <SelectItem value="Busy">Busy</SelectItem>
          <SelectItem value="On Break">On Break</SelectItem>
          <SelectItem value="In Surgery">In Surgery</SelectItem>
          <SelectItem value="Emergency">Emergency</SelectItem>
          <SelectItem value="Off Duty">Off Duty</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};

export default StatusSelector;
