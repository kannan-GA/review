import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import AdminDashboard from '../components/AdminDashboard';
import { Review } from '../types';
import { Loader2 } from 'lucide-react';

interface AdminPageProps {
  reviews: Review[];
  setReviews: React.Dispatch<React.SetStateAction<Review[]>>;
}

// Helper function to check if user is admin
function isAdmin(): boolean {
  const adminFlag = localStorage.getItem('isAdmin');
  if (adminFlag === 'true') {
    return true;
  }
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('admin') === 'true') {
    localStorage.setItem('isAdmin', 'true');
    return true;
  }
  return false;
}

function AdminPage({ reviews, setReviews }: AdminPageProps) {
  const navigate = useNavigate();
  const [supabase, setSupabase] = useState<SupabaseClient | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    // Check if user is admin
    if (!isAdmin()) {
      navigate('/reviews');
      return;
    }

    // Initialize Supabase
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
        const { data, error: fetchError } = await client
          .from('reviews')
          .select('*')
          .order('created_at', { ascending: false });

        if (fetchError) {
          console.error('Error fetching reviews:', fetchError);
          setError('Failed to load reviews. Please try again.');
          // Fallback to mock reviews if Supabase fails
          return;
        }

        if (data) {
          // Transform Supabase data to Review format
          const transformedReviews: Review[] = data.map((item: any) => ({
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
  }, [navigate, setReviews]);

  const handleApprove = async (reviewId: string) => {
    if (!supabase) {
      // Fallback to local state update
      setReviews(prevReviews =>
        prevReviews.map(review =>
          review.id === reviewId ? { ...review, status: 'approved' as const } : review
        )
      );
      return;
    }

    try {
      const { error: updateError } = await supabase
        .from('reviews')
        .update({ status: 'approved' })
        .eq('id', reviewId);

      if (updateError) {
        console.error('Error approving review:', updateError);
        alert('Failed to approve review. Please try again.');
        return;
      }

      // Update local state
      setReviews(prevReviews =>
        prevReviews.map(review =>
          review.id === reviewId ? { ...review, status: 'approved' as const } : review
        )
      );
    } catch (err) {
      console.error('Error approving review:', err);
      alert('An unexpected error occurred.');
    }
  };

  const handleReject = async (reviewId: string) => {
    if (!supabase) {
      // Fallback to local state update
      setReviews(prevReviews =>
        prevReviews.map(review =>
          review.id === reviewId ? { ...review, status: 'rejected' as const } : review
        )
      );
      return;
    }

    try {
      const { error: updateError } = await supabase
        .from('reviews')
        .update({ status: 'rejected' })
        .eq('id', reviewId);

      if (updateError) {
        console.error('Error rejecting review:', updateError);
        alert('Failed to reject review. Please try again.');
        return;
      }

      // Update local state
      setReviews(prevReviews =>
        prevReviews.map(review =>
          review.id === reviewId ? { ...review, status: 'rejected' as const } : review
        )
      );
    } catch (err) {
      console.error('Error rejecting review:', err);
      alert('An unexpected error occurred.');
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

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Error</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-brand-orange text-white rounded-lg hover:bg-orange-600 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <AdminDashboard
        reviews={reviews}
        onApprove={handleApprove}
        onReject={handleReject}
      />
    </div>
  );
}

export default AdminPage;
