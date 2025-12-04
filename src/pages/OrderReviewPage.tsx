import { useSearchParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import ReviewForm from '../components/ReviewForm';
import { Review, ReviewSubmissionStatus } from '../types';
import { Loader2 } from 'lucide-react';

interface OrderData {
  id: string;
  order_id: string;
  customer_email: string;
  customer_name?: string;
  product_id: string;
  product_name?: string;
  order_date: string;
}

function OrderReviewPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const orderId = searchParams.get('orderId');
  const [orderData, setOrderData] = useState<OrderData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [supabase, setSupabase] = useState<SupabaseClient | null>(null);
  const [submissionStatus, setSubmissionStatus] = useState<ReviewSubmissionStatus>(ReviewSubmissionStatus.IDLE);

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

    // Fetch order details from Supabase
    const fetchOrder = async () => {
      if (!orderId) {
        setError('Order ID is missing from URL');
        setLoading(false);
        return;
      }

      try {
        const { data, error: fetchError } = await client
          .from('orders')
          .select('*')
          .eq('order_id', orderId)
          .single();

        if (fetchError) {
          console.error('Order not found:', fetchError);
          setError('Order not found. Please check your order ID.');
        } else {
          setOrderData(data);
        }
      } catch (err) {
        console.error('Error fetching order:', err);
        setError('Failed to load order information.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

  const handleSubmit = async (review: Omit<Review, 'id' | 'author' | 'avatarUrl' | 'date' | 'verifiedPurchase' | 'status'>) => {
    if (!supabase || !orderData) {
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

      // Save review with order_id
      const { data, error: insertError } = await supabase
        .from('reviews')
        .insert({
          product_id: orderData.product_id,
          rating: review.rating,
          text: review.text,
          images: imageUrls,
          order_id: orderData.id, // Link to order
          author: orderData.customer_name || orderData.customer_email.split('@')[0],
          verified_purchase: true, // Since it's from an order
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

      // Set success status based on rating
      if (review.rating === 5) {
        setSubmissionStatus(ReviewSubmissionStatus.SUCCESS_5_STAR);
        // Redirect to incentive page after a short delay
        setTimeout(() => {
          navigate('/incentive');
        }, 2000);
      } else if (review.rating === 4) {
        setSubmissionStatus(ReviewSubmissionStatus.SUCCESS_4_STAR);
      } else {
        setSubmissionStatus(ReviewSubmissionStatus.SUCCESS_LOW_STAR);
      }
    } catch (err) {
      console.error('Error submitting review:', err);
      setError('An unexpected error occurred. Please try again.');
      setSubmissionStatus(ReviewSubmissionStatus.ERROR);
    }
  };

  const handleCancel = () => {
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-brand-orange" />
          <p className="text-gray-600">Loading order information...</p>
        </div>
      </div>
    );
  }

  if (error && !orderData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Error</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-2 bg-brand-orange text-white rounded-lg hover:bg-orange-600 transition-colors"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  if (!orderData) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Review Your Order</h1>
          <div className="text-gray-600 space-y-1">
            <p><strong>Order ID:</strong> {orderData.order_id}</p>
            {orderData.product_name && (
              <p><strong>Product:</strong> {orderData.product_name}</p>
            )}
            <p><strong>Order Date:</strong> {new Date(orderData.order_date).toLocaleDateString()}</p>
          </div>
        </div>

        {error && submissionStatus === ReviewSubmissionStatus.ERROR && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        <ReviewForm 
          onSubmit={handleSubmit} 
          onCancel={handleCancel}
          disableAutoNavigate={true}
        />
      </div>
    </div>
  );
}

export default OrderReviewPage;

