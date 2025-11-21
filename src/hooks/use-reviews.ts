
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ProductReview {
  id: string;
  order_id: string;
  medicine_id: string;
  user_phone: string;
  rating: number;
  review_text?: string;
  created_at: string;
  updated_at: string;
}

export function useReviews() {
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('product_reviews')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setReviews(data || []);
    } catch (error) {
      console.error('Error fetching reviews:', error);
      toast({
        title: "Error",
        description: "Failed to load reviews",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const submitReview = async (
    orderId: string,
    medicineId: string,
    userPhone: string,
    rating: number,
    reviewText?: string
  ): Promise<boolean> => {
    try {
      setLoading(true);
      
      // Check if review already exists
      const { data: existingReview } = await supabase
        .from('product_reviews')
        .select('id')
        .eq('order_id', orderId)
        .eq('medicine_id', medicineId)
        .eq('user_phone', userPhone)
        .single();

      if (existingReview) {
        // Update existing review
        const { error } = await supabase
          .from('product_reviews')
          .update({ 
            rating, 
            review_text: reviewText,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingReview.id);
        
        if (error) throw error;
        
        toast({
          title: "Review Updated",
          description: "Your review has been updated successfully"
        });
      } else {
        // Create new review
        const { error } = await supabase
          .from('product_reviews')
          .insert([{
            order_id: orderId,
            medicine_id: medicineId,
            user_phone: userPhone,
            rating,
            review_text: reviewText
          }]);
        
        if (error) throw error;
        
        toast({
          title: "Review Submitted",
          description: "Thank you for your review!"
        });
      }
      
      await fetchReviews();
      return true;
    } catch (error) {
      console.error('Error submitting review:', error);
      toast({
        title: "Error",
        description: "Failed to submit review. Please try again.",
        variant: "destructive"
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const getReviewForProduct = (orderId: string, medicineId: string, userPhone: string) => {
    return reviews.find(r => 
      r.order_id === orderId && 
      r.medicine_id === medicineId && 
      r.user_phone === userPhone
    );
  };

  useEffect(() => {
    fetchReviews();
    
    // Set up real-time subscription
    const channel = supabase
      .channel('product_reviews_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'product_reviews'
        },
        () => {
          fetchReviews();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return {
    reviews,
    loading,
    submitReview,
    getReviewForProduct,
    refreshReviews: fetchReviews
  };
}
