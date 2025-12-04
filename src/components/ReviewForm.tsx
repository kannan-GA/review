import { useState, useRef, ChangeEvent, DragEvent, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Review, ReviewSubmissionStatus } from '../types';
import StarRating from './StarRating';
import { CameraIcon, XCircleIcon, CheckCircleIcon } from './icons';
import { Loader2 } from 'lucide-react';

interface ReviewFormProps {
  onSubmit: (review: Omit<Review, 'id' | 'author' | 'avatarUrl' | 'date' | 'verifiedPurchase' | 'status'>) => void;
  onCancel: () => void;
  disableAutoNavigate?: boolean; // If true, don't auto-navigate to incentive page
}

const MAX_IMAGES = 3;
const MAX_FILE_SIZE_MB = 5;
const MAX_TEXT_LENGTH = 1000;

function ReviewForm({ onSubmit, onCancel, disableAutoNavigate = false }: ReviewFormProps) {
  const navigate = useNavigate();
  const [rating, setRating] = useState(0);
  const [text, setText] = useState('');
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [error, setError] = useState('');
  const [submissionStatus, setSubmissionStatus] = useState(ReviewSubmissionStatus.IDLE);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleTextChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    if (value.length <= MAX_TEXT_LENGTH) {
      setText(value);
      setError('');
    }
  };

  const handleImageSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newFiles = Array.from(files);

    if (images.length + newFiles.length > MAX_IMAGES) {
      setError(`You can only upload up to ${MAX_IMAGES} images`);
      return;
    }

    const validFiles: File[] = [];
    const newPreviews: string[] = [];

    for (const file of newFiles) {
      if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
        setError(`Image "${file.name}" exceeds ${MAX_FILE_SIZE_MB}MB limit`);
        continue;
      }

      if (!file.type.startsWith('image/')) {
        setError(`"${file.name}" is not a valid image file`);
        continue;
      }

      validFiles.push(file);
      newPreviews.push(URL.createObjectURL(file));
    }

    setImages([...images, ...validFiles]);
    setImagePreviews([...imagePreviews, ...newPreviews]);
    setError('');

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveImage = (index: number) => {
    URL.revokeObjectURL(imagePreviews[index]);
    setImages(images.filter((_, i) => i !== index));
    setImagePreviews(imagePreviews.filter((_, i) => i !== index));
  };

  const handleDragOver = (e: DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const dt = new DataTransfer();
      Array.from(files).forEach(file => dt.items.add(file));

      if (fileInputRef.current) {
        fileInputRef.current.files = dt.files;
        handleImageSelect({ target: fileInputRef.current } as ChangeEvent<HTMLInputElement>);
      }
    }
  };

  const handleSubmit = async () => {
    if (rating === 0) {
      setError('Please select a rating');
      return;
    }

    if (text.trim().length < 10) {
      setError('Review must be at least 10 characters long');
      return;
    }

    setSubmissionStatus(ReviewSubmissionStatus.SUBMITTING);
    setError('');

    try {
      await new Promise(resolve => setTimeout(resolve, 1500));

      const reviewData = {
        productId: 'product-1',
        rating,
        text: text.trim(),
        images: imagePreviews,
      };

      onSubmit(reviewData);

      if (rating === 5) {
        setSubmissionStatus(ReviewSubmissionStatus.SUCCESS_5_STAR);
      } else if (rating === 4) {
        setSubmissionStatus(ReviewSubmissionStatus.SUCCESS_4_STAR);
      } else {
        setSubmissionStatus(ReviewSubmissionStatus.SUCCESS_LOW_STAR);
      }
    } catch (err) {
      setSubmissionStatus(ReviewSubmissionStatus.ERROR);
      setError('Failed to submit review. Please try again.');
    }
  };

  useEffect(() => {
    if (submissionStatus === ReviewSubmissionStatus.SUCCESS_5_STAR && !disableAutoNavigate) {
      const timer = setTimeout(() => {
        navigate('/incentive');
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [submissionStatus, navigate, disableAutoNavigate]);

  const isSubmitting = submissionStatus === ReviewSubmissionStatus.SUBMITTING;
  const canAddMoreImages = images.length < MAX_IMAGES;
  const isSuccessState = submissionStatus === ReviewSubmissionStatus.SUCCESS_5_STAR ||
                         submissionStatus === ReviewSubmissionStatus.SUCCESS_4_STAR ||
                         submissionStatus === ReviewSubmissionStatus.SUCCESS_LOW_STAR;

  if (isSuccessState) {
    return (
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-8">
        <div className="flex flex-col items-center text-center space-y-4">
          <CheckCircleIcon className="w-16 h-16 text-green-500" />

          {submissionStatus === ReviewSubmissionStatus.SUCCESS_5_STAR && (
            <>
              <h2 className="text-2xl font-bold text-gray-900">
                Thank you for your 5-star review!
              </h2>
              <p className="text-gray-600">
                Your review is now live! You'll be redirected to our rewards page shortly.
              </p>
            </>
          )}

          {submissionStatus === ReviewSubmissionStatus.SUCCESS_4_STAR && (
            <>
              <h2 className="text-2xl font-bold text-gray-900">
                Thank you for your review!
              </h2>
              <p className="text-gray-600">
                Your feedback has been submitted for approval. Once approved, you'll receive an email with a link to our public review incentive program.
              </p>
            </>
          )}

          {submissionStatus === ReviewSubmissionStatus.SUCCESS_LOW_STAR && (
            <>
              <h2 className="text-2xl font-bold text-gray-900">
                Thank you for your feedback!
              </h2>
              <p className="text-gray-600">
                We appreciate you taking the time to share your experience. Your review has been submitted for our team to look at.
              </p>
            </>
          )}

          <button
            onClick={onCancel}
            className="mt-4 px-6 py-2 bg-brand-orange rounded-lg text-white font-medium hover:bg-orange-600 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto mx-4">
      <div className="p-4 sm:p-6">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 text-center mb-4 sm:mb-6">Write a review</h2>

        <div className="space-y-4 sm:space-y-6">
          <div className="flex flex-col items-center space-y-3">
            <label className="text-sm font-medium text-gray-700">Your overall rating</label>
            <StarRating rating={rating} setRating={setRating} size="xl" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Your review
            </label>
            <textarea
              value={text}
              onChange={handleTextChange}
              rows={5}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-orange focus:border-transparent resize-none"
              placeholder="Tell us about your experience..."
            />
            <div className="flex justify-end mt-1">
              <span className="text-xs text-gray-500">
                {text.length}/{MAX_TEXT_LENGTH}
              </span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Add photos ({images.length}/{MAX_IMAGES})
            </label>

            {imagePreviews.length > 0 && (
              <div className="grid grid-cols-3 gap-3 mb-3">
                {imagePreviews.map((preview, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={preview}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-24 object-cover rounded-lg border border-gray-300"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(index)}
                      className="absolute top-1 right-1 bg-black bg-opacity-50 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <XCircleIcon className="w-5 h-5 text-white" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {canAddMoreImages && (
              <label
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`w-full border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer transition-colors ${
                  isDragging
                    ? 'border-brand-orange bg-orange-50'
                    : 'border-gray-300 hover:border-brand-orange hover:bg-gray-50'
                }`}
              >
                <CameraIcon className="w-10 h-10 text-gray-400 mb-2" />
                <p className="text-sm text-gray-600 font-medium mb-1">
                  Upload a file or drag and drop
                </p>
                <p className="text-xs text-gray-500">
                  PNG, JPG, WEBP up to {MAX_FILE_SIZE_MB}MB
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/jpg,image/webp"
                  multiple
                  onChange={handleImageSelect}
                  className="hidden"
                />
              </label>
            )}
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}
        </div>

        <div className="mt-6">
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || rating === 0}
            className="w-full px-4 py-3 bg-brand-orange rounded-lg text-white font-medium hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            {isSubmitting && <Loader2 className="w-5 h-5 animate-spin" />}
            {isSubmitting ? 'Submitting...' : 'Submit Review'}
          </button>
          <button
            onClick={onCancel}
            disabled={isSubmitting}
            className="w-full mt-3 px-4 py-2 text-gray-700 font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors rounded-lg"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

export default ReviewForm;
