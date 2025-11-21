import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Star } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

interface DoctorRatingModalProps {
  isOpen: boolean;
  onClose: () => void;
  doctorId: string;
  doctorName: string;
  patientId: string;
  appointmentId: string;
}

const DoctorRatingModal: React.FC<DoctorRatingModalProps> = ({
  isOpen,
  onClose,
  doctorId,
  doctorName,
  patientId,
  appointmentId,
}) => {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setIsAuthenticated(!!user);
  };

  const handleSubmitRating = async () => {
    // Check authentication first
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please log in to submit a rating",
        variant: "destructive",
      });
      onClose();
      navigate("/auth");
      return;
    }

    if (rating === 0) {
      toast({
        title: "Rating Required",
        description: "Please select a rating before submitting",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);

      // Call secure RPC function to submit/update review
      const { data, error } = await supabase.rpc("submit_doctor_review", {
        _doctor_id: doctorId,
        _rating: rating,
        _comment: comment || null,
      });

      if (error) {
        if (error.message.includes("Not authenticated")) {
          toast({
            title: "Authentication Required",
            description: "Please log in to submit a rating",
            variant: "destructive",
          });
          onClose();
          navigate("/auth");
          return;
        }
        
        if (error.message.includes("No eligible appointment")) {
          toast({
            title: "Cannot Rate Doctor",
            description: "You can only rate doctors after a completed appointment",
            variant: "destructive",
          });
          onClose();
          return;
        }
        
        throw error;
      }

      const action = data?.[0]?.action || "submitted";
      toast({
        title: action === "updated" ? "Rating Updated" : "Rating Submitted",
        description: action === "updated" 
          ? "Your rating has been updated successfully!" 
          : "Thank you for rating the doctor!",
      });

      onClose();
      setRating(0);
      setComment("");
    } catch (error: any) {
      console.error("Error submitting rating:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to submit rating. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Rate Doctor</DialogTitle>
          <DialogDescription>
            How was your experience with {doctorName}?
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Star Rating */}
          <div className="flex flex-col items-center space-y-2">
            <div className="flex space-x-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="transition-transform hover:scale-110"
                >
                  <Star
                    className={`h-10 w-10 ${
                      star <= (hoveredRating || rating)
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-gray-300"
                    }`}
                  />
                </button>
              ))}
            </div>
            {rating > 0 && (
              <p className="text-sm text-gray-600">
                {rating === 1 && "Poor"}
                {rating === 2 && "Fair"}
                {rating === 3 && "Good"}
                {rating === 4 && "Very Good"}
                {rating === 5 && "Excellent"}
              </p>
            )}
          </div>

          {/* Comment */}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Additional Comments (Optional)
            </label>
            <Textarea
              placeholder="Share your experience..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              className="resize-none"
            />
          </div>
        </div>

        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmitRating} disabled={isSubmitting}>
            {isSubmitting ? "Submitting..." : "Submit Rating"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DoctorRatingModal;
