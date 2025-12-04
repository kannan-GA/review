import StarRating from './StarRating';

interface CompactRatingDisplayProps {
  averageRating: number;
  totalReviews: number;
}

function CompactRatingDisplay({ averageRating, totalReviews }: CompactRatingDisplayProps) {
  const handleScrollToReviews = () => {
    const reviewsSection = document.getElementById('reviews-section');
    if (reviewsSection) {
      reviewsSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const formatNumber = (num: number): string => {
    return num.toLocaleString('en-US');
  };

  return (
    <div className="flex items-center space-x-2">
      <StarRating rating={averageRating} size="sm" setRating={undefined} />
      <span className="text-sm font-semibold text-gray-900">
        {averageRating.toFixed(1)}
      </span>
      <button
        onClick={handleScrollToReviews}
        className="text-sm text-gray-600 hover:text-brand-orange hover:underline transition-colors cursor-pointer"
      >
        ({formatNumber(totalReviews)} reviews)
      </button>
    </div>
  );
}

export default CompactRatingDisplay;
