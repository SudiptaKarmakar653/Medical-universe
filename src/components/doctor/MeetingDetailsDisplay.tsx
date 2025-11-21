
import React, { useState } from 'react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, Calendar, ChevronDown, ChevronUp } from "lucide-react";

interface MeetingDetailsDisplayProps {
  notes: string;
}

const MeetingDetailsDisplay: React.FC<MeetingDetailsDisplayProps> = ({ notes }) => {
  const [showHistory, setShowHistory] = useState(false);

  // Parse meeting ended entries from notes
  const parseMeetingDetails = (notes: string) => {
    if (!notes) return [];
    
    const meetingRegex = /Meeting ended at (\d{1,2}\/\d{1,2}\/\d{4}),?\s*(\d{1,2}:\d{2}:\d{2}\s*[AP]M)/g;
    const meetings = [];
    let match;
    
    while ((match = meetingRegex.exec(notes)) !== null) {
      meetings.push({
        date: match[1],
        time: match[2]
      });
    }
    
    return meetings.reverse(); // Show most recent first
  };

  const meetingHistory = parseMeetingDetails(notes);
  
  if (meetingHistory.length === 0) return null;

  return (
    <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
      <div className="flex items-center justify-between">
        <h4 className="font-medium text-blue-800 flex items-center gap-2">
          <Clock className="h-4 w-4" />
          Meeting History ({meetingHistory.length} sessions)
        </h4>
        
        <Button
          onClick={() => setShowHistory(!showHistory)}
          variant="outline"
          size="sm"
          className="text-blue-600 border-blue-300 hover:bg-blue-100"
        >
          {showHistory ? (
            <>
              Hide History <ChevronUp className="h-4 w-4 ml-1" />
            </>
          ) : (
            <>
              View History <ChevronDown className="h-4 w-4 ml-1" />
            </>
          )}
        </Button>
      </div>
      
      {showHistory && (
        <div className="mt-3 space-y-2 max-h-32 overflow-y-auto">
          {meetingHistory.map((meeting, index) => (
            <div key={index} className="flex items-center gap-2 text-sm">
              <Badge variant="outline" className="text-blue-600 border-blue-300">
                Session {meetingHistory.length - index}
              </Badge>
              <Calendar className="h-3 w-3 text-blue-500" />
              <span className="text-blue-700">{meeting.date}</span>
              <Clock className="h-3 w-3 text-blue-500" />
              <span className="text-blue-700">{meeting.time}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MeetingDetailsDisplay;
