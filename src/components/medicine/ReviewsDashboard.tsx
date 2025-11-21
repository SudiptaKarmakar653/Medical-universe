
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, MessageSquare, TrendingUp, Clock } from 'lucide-react';
import { useReviews } from '@/hooks/use-reviews';

interface ReviewWithMedicine {
  id: string;
  order_id: string;
  medicine_id: string;
  user_phone: string;
  rating: number;
  review_text?: string;
  created_at: string;
  medicine_name?: string;
}

const ReviewsDashboard = () => {
  const { reviews, loading } = useReviews();
  const [reviewsWithMedicines, setReviewsWithMedicines] = useState<ReviewWithMedicine[]>([]);

  useEffect(() => {
    const fetchMedicineNames = async () => {
      if (reviews.length === 0) return;
      
      // For now, we'll use placeholder medicine names
      // In a real implementation, you'd fetch medicine names from the medicines table
      const reviewsWithNames = reviews.map(review => ({
        ...review,
        medicine_name: `Medicine ${review.medicine_id.substring(0, 8)}`
      }));
      
      setReviewsWithMedicines(reviewsWithNames);
    };

    fetchMedicineNames();
  }, [reviews]);

  const getStarDisplay = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
        }`}
      />
    ));
  };

  const getRatingBadgeColor = (rating: number) => {
    if (rating >= 4) return 'bg-green-100 text-green-800';
    if (rating >= 3) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  const averageRating = reviewsWithMedicines.length > 0 
    ? (reviewsWithMedicines.reduce((sum, review) => sum + review.rating, 0) / reviewsWithMedicines.length).toFixed(1)
    : '0.0';

  const recentReviews = reviewsWithMedicines
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 10);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/4"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-100 p-3 rounded-full">
                <MessageSquare className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Total Reviews</p>
                <p className="text-2xl font-bold text-gray-900">{reviewsWithMedicines.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="bg-yellow-100 p-3 rounded-full">
                <Star className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Average Rating</p>
                <div className="flex items-center space-x-2">
                  <p className="text-2xl font-bold text-gray-900">{averageRating}</p>
                  <div className="flex">
                    {getStarDisplay(Math.round(parseFloat(averageRating)))}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="bg-green-100 p-3 rounded-full">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">5-Star Reviews</p>
                <p className="text-2xl font-bold text-gray-900">
                  {reviewsWithMedicines.filter(r => r.rating === 5).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Reviews */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Clock className="h-5 w-5" />
            <span>Recent Reviews</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recentReviews.length === 0 ? (
            <div className="text-center py-8">
              <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No reviews yet</p>
              <p className="text-sm text-gray-400">Reviews will appear here in real-time when customers rate products</p>
            </div>
          ) : (
            <div className="space-y-4">
              {recentReviews.map((review) => (
                <div key={review.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-medium text-gray-900">{review.medicine_name}</h4>
                      <p className="text-sm text-gray-500">
                        Order #{review.order_id.substring(0, 8).toUpperCase()}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={getRatingBadgeColor(review.rating)}>
                        {review.rating}/5
                      </Badge>
                      <div className="flex">
                        {getStarDisplay(review.rating)}
                      </div>
                    </div>
                  </div>
                  
                  {review.review_text && (
                    <p className="text-gray-700 mb-3 bg-gray-50 p-3 rounded">
                      "{review.review_text}"
                    </p>
                  )}
                  
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span>Customer: {review.user_phone.replace(/(\+91)(\d{4})(\d{6})/, '$1 $2 ******')}</span>
                    <span>{new Date(review.created_at).toLocaleDateString('en-IN')}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ReviewsDashboard;
