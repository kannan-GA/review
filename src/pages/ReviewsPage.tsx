import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import FullReviewDisplay from '../components/FullReviewDisplay';
import ReviewForm from '../components/ReviewForm';
import { Review } from '../types';
import { Loader2 } from 'lucide-react';

function ReviewsPage() {
  const [showForm, setShowForm] = useState(false);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [supabase, setSupabase] = useState<SupabaseClient | null>(null);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const productId = searchParams.get('productId') || 'product-1';

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

    // Fetch reviews from Supabase
    const fetchReviews = async () => {
      try {
        const { data: reviewsData, error: reviewsError } = await client
          .from('reviews')
          .select('*')
          .eq('product_id', productId)
          .eq('status', 'approved')
          .order('created_at', { ascending: false });

        if (reviewsError) {
          console.error('Error fetching reviews:', reviewsError);
          setError('Failed to load reviews. Please try again.');
          setLoading(false);
          return;
        }

        if (reviewsData) {
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
          setReviews(transformedReviews);
        }
      } catch (err) {
        console.error('Error fetching reviews:', err);
        setError('An unexpected error occurred while loading reviews.');
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, [productId]);

  const handleSubmitReview = async (newReview: Omit<Review, 'id' | 'author' | 'avatarUrl' | 'date' | 'verifiedPurchase' | 'status'>) => {
    if (!supabase) {
      setError('Unable to submit review. Please try again.');
      return;
    }

    setError('');

    try {
      // Upload images to Supabase Storage if any
      let imageUrls: string[] = [];
      if (newReview.images && newReview.images.length > 0) {
        imageUrls = newReview.images;
      }

      // Save review with product_id
      const { data, error: insertError } = await supabase
        .from('reviews')
        .insert({
          product_id: productId,
          rating: newReview.rating,
          text: newReview.text,
          images: imageUrls,
          author: 'Customer',
          verified_purchase: false,
          status: newReview.rating === 5 ? 'approved' : 'pending',
        })
        .select()
        .single();

      if (insertError) {
        console.error('Error submitting review:', insertError);
        setError('Failed to submit review. Please try again.');
        return;
      }

      if (data) {
        const review: Review = {
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

        // Add the new review to existing reviews if approved
        if (data.status === 'approved') {
          setReviews(prev => [review, ...prev]);
        }
        setShowForm(false);

        if (newReview.rating === 5) {
          navigate('/incentive');
        }
      }
    } catch (err) {
      console.error('Error submitting review:', err);
      setError('An unexpected error occurred. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-brand-orange" />
          <p className="text-gray-600">Loading reviews...</p>
        </div>
      </div>
    );
  }

  const approvedReviews = reviews.filter(r => r.status === 'approved');

  return (
    <div>
      {error && (
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-600">{error}</p>
          </div>
        </div>
      )}
      {showForm ? (
        <div className="max-w-3xl mx-auto px-4 py-8">
          <button
            onClick={() => setShowForm(false)}
            className="mb-4 text-gray-600 hover:text-gray-900 transition-colors"
          >
            ← Back to Reviews
          </button>
          <ReviewForm onSubmit={handleSubmitReview} onCancel={() => setShowForm(false)} />
        </div>
      ) : (
        <div>
          <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-3xl font-bold text-gray-900">Customer Reviews</h1>
              <button
                onClick={() => setShowForm(true)}
                className="bg-brand-orange hover:bg-orange-600 text-white font-semibold px-6 py-2 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-brand-orange focus:ring-offset-2"
              >
                Write a Review
              </button>
            </div>
          </div>
          <FullReviewDisplay reviews={approvedReviews} productId={productId} />
        </div>
      )}
    </div>
  );
}

export default ReviewsPage;
