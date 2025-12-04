import { useState, useEffect, useMemo } from 'react';
import { Loader2 } from 'lucide-react';
import { Review, ReviewStats } from '../types';
import CompactRatingDisplay from './CompactRatingDisplay';
import RatingDistributionChart from './RatingDistributionChart';
import StarRating from './StarRating';
import ReviewCard from './ReviewCard';

interface FullReviewDisplayProps {
  reviews: Review[];
  productId: string;
}

function FullReviewDisplay({ reviews, productId }: FullReviewDisplayProps) {
  const [stats, setStats] = useState<ReviewStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [visibleCount, setVisibleCount] = useState(3);
  const [sortBy, setSortBy] = useState('Most Recent');
  const [filterRating, setFilterRating] = useState<number | null>(null);
  const [filterPhotos, setFilterPhotos] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      await new Promise(resolve => setTimeout(resolve, 500));

      const calculateStats = (): ReviewStats => {
        const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
        let totalRating = 0;

        reviews.forEach(review => {
          distribution[review.rating] = (distribution[review.rating] || 0) + 1;
          totalRating += review.rating;
        });

        return {
          averageRating: reviews.length > 0 ? totalRating / reviews.length : 0,
          totalReviews: reviews.length,
          distribution,
        };
      };

      setStats(calculateStats());
      setIsLoading(false);
    };

    loadData();
  }, [reviews]);

  const filteredAndSortedReviews = useMemo(() => {
    let result = [...reviews];

    if (filterRating !== null) {
      result = result.filter(r => r.rating === filterRating);
    }

    if (filterPhotos) {
      result = result.filter(r => r.images && r.images.length > 0);
    }

    switch (sortBy) {
      case 'Highest Rated':
        result.sort((a, b) => b.rating - a.rating);
        break;
      case 'Lowest Rated':
        result.sort((a, b) => a.rating - b.rating);
        break;
      case 'Most Recent':
      default:
        result.sort((a, b) => {
          const idA = parseInt(a.id.split('-')[1] || '0');
          const idB = parseInt(b.id.split('-')[1] || '0');
          return idB - idA;
        });
        break;
    }

    return result;
  }, [reviews, filterRating, filterPhotos, sortBy]);

  const hasActiveFilters = filterRating !== null || filterPhotos;
  const visibleReviews = filteredAndSortedReviews.slice(0, visibleCount);
  const hasMoreReviews = visibleCount < filteredAndSortedReviews.length;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-brand-orange animate-spin" />
      </div>
    );
  }

  if (!stats) return null;

  if (reviews.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-12 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">No Reviews Yet</h2>
        <p className="text-gray-600">Be the first to review this product!</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="border border-gray-200 rounded-lg shadow-sm p-6 bg-gray-50">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Review Summary</h3>
        <p className="text-sm text-gray-600 mb-4">
          Overall rating and review count for this product.
        </p>
        <CompactRatingDisplay averageRating={stats.averageRating} totalReviews={stats.totalReviews} />
      </div>

      <div id="reviews-section" className="bg-white rounded-lg shadow-lg p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-900">Customer Reviews</h2>
            <div className="flex flex-col items-start space-y-2">
              <div className="text-5xl font-bold text-gray-900">
                {stats.averageRating.toFixed(1)}
              </div>
              <StarRating rating={stats.averageRating} setRating={() => {}} size="lg" />
              <p className="text-sm text-gray-600">
                based on {stats.totalReviews} {stats.totalReviews === 1 ? 'review' : 'reviews'}
              </p>
            </div>

          </div>

          <div className="lg:col-span-2">
            <RatingDistributionChart stats={stats} />
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-gray-200">
            <h3 className="text-xl font-semibold text-gray-900">
              {filteredAndSortedReviews.length} {filteredAndSortedReviews.length === 1 ? 'Review' : 'Reviews'}
            </h3>

            <div className="flex items-center gap-2">
              <label htmlFor="sort" className="text-sm text-gray-600">
                Sort by:
              </label>
              <select
                id="sort"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-orange focus:border-transparent"
              >
                <option>Most Recent</option>
                <option>Highest Rated</option>
                <option>Lowest Rated</option>
              </select>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <span className="text-sm font-medium text-gray-700">Filter by:</span>

            <div className="flex flex-wrap gap-2">
              {[5, 4, 3, 2, 1].map((rating) => (
                <button
                  key={rating}
                  onClick={() => setFilterRating(filterRating === rating ? null : rating)}
                  className={`px-3 py-1 text-sm rounded-lg border transition-colors ${
                    filterRating === rating
                      ? 'bg-orange-50 border-brand-orange text-brand-orange'
                      : 'bg-white border-gray-300 text-gray-700 hover:border-brand-orange'
                  }`}
                >
                  {rating} {rating === 1 ? 'star' : 'stars'}
                </button>
              ))}

              <button
                onClick={() => setFilterPhotos(!filterPhotos)}
                className={`px-3 py-1 text-sm rounded-lg border transition-colors ${
                  filterPhotos
                    ? 'bg-orange-50 border-brand-orange text-brand-orange'
                    : 'bg-white border-gray-300 text-gray-700 hover:border-brand-orange'
                }`}
              >
                With Photos
              </button>
            </div>

            {hasActiveFilters && (
              <button
                onClick={() => {
                  setFilterRating(null);
                  setFilterPhotos(false);
                }}
                className="text-sm text-brand-orange hover:text-orange-600 font-medium"
              >
                Clear Filters
              </button>
            )}
          </div>

          <div className="space-y-4 mt-6">
            {visibleReviews.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500">No reviews match your filters.</p>
              </div>
            ) : (
              visibleReviews.map((review) => (
                <ReviewCard key={review.id} review={review} />
              ))
            )}
          </div>

          {hasMoreReviews && (
            <div className="flex justify-center mt-6">
              <button
                onClick={() => setVisibleCount(prev => prev + 3)}
                className="px-6 py-2 border-2 border-brand-orange text-brand-orange rounded-lg font-medium hover:bg-orange-50 transition-colors"
              >
                More Reviews
              </button>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}

export default FullReviewDisplay;
