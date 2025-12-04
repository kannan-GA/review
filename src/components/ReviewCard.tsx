import { useState, useEffect } from 'react';
import { Review } from '../types';
import StarRating from './StarRating';
import { CheckCircleIcon, ChevronLeftIcon, ChevronRightIcon } from './icons';

interface ReviewCardProps {
  review: Review;
}

function ReviewCard({ review }: ReviewCardProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  const minSwipeDistance = 50;

  const goToPrevious = () => {
    if (lightboxIndex !== null && review.images && lightboxIndex > 0) {
      setLightboxIndex(lightboxIndex - 1);
    }
  };

  const goToNext = () => {
    if (lightboxIndex !== null && review.images && lightboxIndex < review.images.length - 1) {
      setLightboxIndex(lightboxIndex + 1);
    }
  };

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      goToNext();
    }
    if (isRightSwipe) {
      goToPrevious();
    }
  };

  useEffect(() => {
    if (lightboxIndex === null) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        goToPrevious();
      } else if (e.key === 'ArrowRight') {
        goToNext();
      } else if (e.key === 'Escape') {
        setLightboxIndex(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxIndex, review.images]);
  return (
    <div className="border border-gray-200 rounded-lg p-6 bg-white">
      <div className="flex items-start gap-4">
        <img
          src={review.avatarUrl}
          alt={review.author}
          className="w-12 h-12 rounded-full object-cover"
        />

        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-semibold text-gray-900">{review.author}</h4>
                {review.verifiedPurchase && (
                  <div className="flex items-center gap-1 text-xs text-green-600">
                    <CheckCircleIcon className="w-4 h-4" />
                    <span>Verified Purchase</span>
                  </div>
                )}
              </div>
              <p className="text-sm text-gray-500">{review.date}</p>
            </div>
          </div>

          <StarRating rating={review.rating} setRating={() => {}} size="sm" />

          <p className="mt-3 text-gray-700 leading-relaxed">{review.text}</p>

          {review.images && review.images.length > 0 && (
            <div className="flex gap-3 mt-4">
              {review.images.map((image, index) => (
                <img
                  key={index}
                  src={image}
                  alt={`Review image ${index + 1}`}
                  className="w-24 h-24 object-cover rounded-lg border border-gray-200 cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={() => setLightboxIndex(index)}
                />
              ))}
            </div>
          )}

          {lightboxIndex !== null && review.images && (
            <div
              className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4"
              onClick={() => setLightboxIndex(null)}
              onTouchStart={onTouchStart}
              onTouchMove={onTouchMove}
              onTouchEnd={onTouchEnd}
            >
              <button
                className="absolute top-4 right-4 text-white text-4xl font-light hover:text-gray-300 transition-colors z-10"
                onClick={() => setLightboxIndex(null)}
              >
                ×
              </button>

              {lightboxIndex > 0 && (
                <button
                  className="absolute left-4 text-white hover:text-gray-300 transition-colors z-10"
                  onClick={(e) => {
                    e.stopPropagation();
                    goToPrevious();
                  }}
                >
                  <ChevronLeftIcon className="w-10 h-10" />
                </button>
              )}

              {lightboxIndex < review.images.length - 1 && (
                <button
                  className="absolute right-4 text-white hover:text-gray-300 transition-colors z-10"
                  onClick={(e) => {
                    e.stopPropagation();
                    goToNext();
                  }}
                >
                  <ChevronRightIcon className="w-10 h-10" />
                </button>
              )}

              <img
                src={review.images[lightboxIndex]}
                alt="Full size review image"
                className="max-w-full max-h-full object-contain"
                onClick={(e) => e.stopPropagation()}
              />

              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white text-sm">
                {lightboxIndex + 1} / {review.images.length}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ReviewCard;
