
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Star } from 'lucide-react';
import { useReviews } from '@/hooks/use-reviews';

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string;
  medicineId: string;
  medicineName: string;
  userPhone: string;
}

const ReviewModal = ({ isOpen, onClose, orderId, medicineId, medicineName, userPhone }: ReviewModalProps) => {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const { submitReview, loading, getReviewForProduct } = useReviews();

  useEffect(() => {
    if (isOpen) {
      const existingReview = getReviewForProduct(orderId, medicineId, userPhone);
      if (existingReview) {
        setRating(existingReview.rating);
        setReviewText(existingReview.review_text || '');
      } else {
        setRating(0);
        setReviewText('');
      }
    }
  }, [isOpen, orderId, medicineId, userPhone]);

  const handleSubmit = async () => {
    if (rating === 0) {
      return;
    }
    
    const success = await submitReview(orderId, medicineId, userPhone, rating, reviewText);
    if (success) {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Rate & Review</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <div>
            <h4 className="font-medium text-gray-900 mb-2">{medicineName}</h4>
            <p className="text-sm text-gray-600">How would you rate this product?</p>
          </div>
          
          {/* Rating Stars */}
          <div className="flex items-center space-x-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                className="p-1"
                onMouseEnter={() => setHoveredRating(star)}
                onMouseLeave={() => setHoveredRating(0)}
                onClick={() => setRating(star)}
              >
                <Star
                  className={`h-8 w-8 ${
                    star <= (hoveredRating || rating)
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'text-gray-300 hover:text-yellow-400'
                  } transition-colors`}
                />
              </button>
            ))}
          </div>
          
          {rating > 0 && (
            <div className="text-sm text-gray-600">
              {rating === 1 && "Poor"}
              {rating === 2 && "Fair"}
              {rating === 3 && "Good"}
              {rating === 4 && "Very Good"}
              {rating === 5 && "Excellent"}
            </div>
          )}
          
          {/* Review Text */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Write a review (optional)
            </label>
            <Textarea
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              placeholder="Share your experience with this product..."
              rows={4}
              className="w-full"
            />
          </div>
          
          {/* Action Buttons */}
          <div className="flex space-x-3">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={rating === 0 || loading}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              {loading ? 'Submitting...' : 'Submit Review'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ReviewModal;
