import { useSearchParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import ReviewForm from '../components/ReviewForm';
import ReviewCard from '../components/ReviewCard';
import { Review, ReviewSubmissionStatus } from '../types';
import { Loader2, X } from 'lucide-react';

interface OrderData {
  id: string;
  order_id: string;
  customer_email: string;
  customer_name?: string;
  product_id: string;
  product_name?: string;
  order_date?: string;
  purchase_date?: string;
}

function OrderReviewPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const orderId = searchParams.get('orderId');
  const [productId, setProductId] = useState<string>('');
  const [orderData, setOrderData] = useState<OrderData | null>(null);
  const [existingReviews, setExistingReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [supabase, setSupabase] = useState<SupabaseClient | null>(null);
  const [submissionStatus, setSubmissionStatus] = useState<ReviewSubmissionStatus>(ReviewSubmissionStatus.IDLE);
  const [showReviewForm, setShowReviewForm] = useState(false);

  useEffect(() => {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      setError('Supabase configuration is missing. Please check your environment variables.');
      setLoading(false);
      return;
    }

    const client = createClient(supabaseUrl, supabaseKey);
    setSupabase(client);

    // Fetch order details and reviews
    const fetchData = async () => {
      if (!orderId) {
        setError('Order ID is missing from URL');
        setLoading(false);
        return;
      }

      try {
        // First, try to find order by order_id
        const { data: orderData, error: orderError } = await client
          .from('orders')
          .select('*')
          .eq('order_id', orderId)
          .single();

        let finalProductId = orderId; // Default to orderId as product_id
        let finalOrderData: OrderData | null = null;

        if (orderData && !orderError) {
          finalOrderData = {
            id: orderData.id,
            order_id: orderData.order_id,
            customer_email: orderData.customer_email,
            customer_name: orderData.customer_name,
            product_id: orderData.product_id,
            product_name: orderData.product_name,
            order_date: orderData.order_date || orderData.purchase_date,
            purchase_date: orderData.purchase_date || orderData.order_date,
          };
          finalProductId = orderData.product_id;
        } else {
          // If order not found, use orderId as product_id directly
          finalProductId = orderId;
          finalOrderData = {
            id: '',
            order_id: orderId,
            customer_email: '',
            customer_name: '',
            product_id: orderId,
            product_name: '',
          };
        }

        setProductId(finalProductId);
        setOrderData(finalOrderData);

        // Fetch existing reviews for this product
        const { data: reviewsData, error: reviewsError } = await client
          .from('reviews')
          .select('*')
          .eq('product_id', finalProductId)
          .eq('status', 'approved')
          .order('created_at', { ascending: false });

        if (!reviewsError && reviewsData) {
          const transformedReviews: Review[] = reviewsData.map((item: any) => ({
            id: item.id,
            productId: item.product_id,
            author: item.author || 'Anonymous',
            avatarUrl: item.avatar_url || `https://picsum.photos/seed/${item.id}/100/100`,
            date: new Date(item.created_at).toISOString().split('T')[0],
            rating: item.rating,
            text: item.text,
            images: item.images || [],
            verifiedPurchase: item.verified_purchase || false,
            status: item.status,
            orderId: item.order_id,
          }));
          setExistingReviews(transformedReviews);
        }

        // If no reviews exist, show the form
        if (!reviewsData || reviewsData.length === 0) {
          setShowReviewForm(true);
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load information.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [orderId]);

  const handleSubmit = async (review: Omit<Review, 'id' | 'author' | 'avatarUrl' | 'date' | 'verifiedPurchase' | 'status'>) => {
    if (!supabase || !productId) {
      setError('Unable to submit review. Please try again.');
      return;
    }

    setSubmissionStatus(ReviewSubmissionStatus.SUBMITTING);
    setError('');

    try {
      // Upload images to Supabase Storage if any
      let imageUrls: string[] = [];
      if (review.images && review.images.length > 0) {
        // For now, we'll use the preview URLs directly
        // In production, you should upload to Supabase Storage
        imageUrls = review.images;
      }

      // Save review with product_id
      const { data, error: insertError } = await supabase
        .from('reviews')
        .insert({
          product_id: productId,
          rating: review.rating,
          text: review.text,
          images: imageUrls,
          order_id: orderData?.id || null, // Link to order if available
          author: orderData?.customer_name || orderData?.customer_email?.split('@')[0] || 'Customer',
          verified_purchase: !!orderData?.id, // Verified if order exists
          status: review.rating === 5 ? 'approved' : 'pending',
        })
        .select()
        .single();

      if (insertError) {
        console.error('Error submitting review:', insertError);
        setError('Failed to submit review. Please try again.');
        setSubmissionStatus(ReviewSubmissionStatus.ERROR);
        return;
      }

      // Add the new review to existing reviews if approved
      if (data && review.rating === 5) {
        const newReview: Review = {
          id: data.id,
          productId: data.product_id,
          author: data.author || 'Customer',
          avatarUrl: data.avatar_url || `https://picsum.photos/seed/${data.id}/100/100`,
          date: new Date(data.created_at).toISOString().split('T')[0],
          rating: data.rating,
          text: data.text,
          images: data.images || [],
          verifiedPurchase: data.verified_purchase || false,
          status: data.status,
          orderId: data.order_id,
        };
        setExistingReviews([newReview, ...existingReviews]);
        setShowReviewForm(false);
      }

      // Set success status based on rating
      if (review.rating === 5) {
        setSubmissionStatus(ReviewSubmissionStatus.SUCCESS_5_STAR);
        // Redirect to incentive page after a short delay
        setTimeout(() => {
          navigate('/incentive');
        }, 2000);
      } else if (review.rating === 4) {
        setSubmissionStatus(ReviewSubmissionStatus.SUCCESS_4_STAR);
        setShowReviewForm(false);
      } else {
        setSubmissionStatus(ReviewSubmissionStatus.SUCCESS_LOW_STAR);
        setShowReviewForm(false);
      }
    } catch (err) {
      console.error('Error submitting review:', err);
      setError('An unexpected error occurred. Please try again.');
      setSubmissionStatus(ReviewSubmissionStatus.ERROR);
    }
  };

  const handleCancel = () => {
    setShowReviewForm(false);
  };

  const handleCloseModal = () => {
    // Close modal and go back or close window
    if (window.history.length > 1) {
      window.history.back();
    } else {
      window.close();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 bg-opacity-50 flex items-center justify-center fixed inset-0 z-50">
        <div className="bg-white rounded-lg shadow-xl p-8 text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-brand-orange" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 bg-opacity-50 flex items-center justify-center fixed inset-0 z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto relative">
        {/* Close button */}
        <button
          onClick={handleCloseModal}
          className="absolute top-4 right-4 z-10 p-2 text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Close"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="p-6">
          {error && submissionStatus === ReviewSubmissionStatus.ERROR && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600">{error}</p>
            </div>
          )}

          {showReviewForm ? (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Write a Review</h2>
              <ReviewForm 
                onSubmit={handleSubmit} 
                onCancel={handleCancel}
                disableAutoNavigate={true}
              />
            </div>
          ) : (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Product Reviews</h2>
              
              {existingReviews.length > 0 ? (
                <div className="space-y-4">
                  {existingReviews.map((review) => (
                    <ReviewCard key={review.id} review={review} />
                  ))}
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <button
                      onClick={() => setShowReviewForm(true)}
                      className="w-full px-6 py-3 bg-brand-orange text-white rounded-lg font-medium hover:bg-orange-600 transition-colors"
                    >
                      Write a Review
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-600 text-lg mb-6">No reviews yet for this product.</p>
                  <button
                    onClick={() => setShowReviewForm(true)}
                    className="px-6 py-3 bg-brand-orange text-white rounded-lg font-medium hover:bg-orange-600 transition-colors"
                  >
                    Be the first to review
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default OrderReviewPage;

