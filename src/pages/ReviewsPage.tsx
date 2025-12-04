import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import FullReviewDisplay from '../components/FullReviewDisplay';
import ReviewForm from '../components/ReviewForm';
import { Review } from '../types';
import { mockUser } from '../data';

interface ReviewsPageProps {
  reviews: Review[];
  setReviews: React.Dispatch<React.SetStateAction<Review[]>>;
}

function ReviewsPage({ reviews, setReviews }: ReviewsPageProps) {
  const [showForm, setShowForm] = useState(false);
  const navigate = useNavigate();

  const approvedReviews = reviews.filter(r => r.status === 'approved');

  const handleSubmitReview = (newReview: Omit<Review, 'id' | 'author' | 'avatarUrl' | 'date' | 'verifiedPurchase' | 'status'>) => {
    const review: Review = {
      ...newReview,
      id: `review-${Date.now()}`,
      author: `${mockUser.firstName} ${mockUser.lastName}`,
      avatarUrl: `https://picsum.photos/seed/user${Date.now()}/100/100`,
      date: new Date().toISOString().split('T')[0],
      verifiedPurchase: mockUser.hasPurchasedProduct,
      status: newReview.rating === 5 ? 'approved' : 'pending',
    };

    setReviews(prev => [review, ...prev]);
    setShowForm(false);

    if (newReview.rating === 5) {
      navigate('/incentive');
    }
  };

  return (
    <div>
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
              {mockUser.isAuthenticated && mockUser.hasPurchasedProduct && (
                <button
                  onClick={() => setShowForm(true)}
                  className="bg-brand-orange hover:bg-orange-600 text-white font-semibold px-6 py-2 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-brand-orange focus:ring-offset-2"
                >
                  Write a Review
                </button>
              )}
            </div>
          </div>
          <FullReviewDisplay reviews={approvedReviews} productId="product-1" />
        </div>
      )}
    </div>
  );
}

export default ReviewsPage;
