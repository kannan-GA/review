import { useState, useMemo } from 'react';
import { Review } from '../types';
import StarRating from './StarRating';
import { CheckCircleIcon } from './icons';
import { X } from 'lucide-react';

interface TabButtonProps {
  tab: 'pending' | 'approved' | 'rejected';
  label: string;
  count: number;
  isActive: boolean;
  onClick: () => void;
}

function TabButton({ tab, label, count, isActive, onClick }: TabButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
        isActive
          ? 'bg-brand-orange text-white'
          : 'text-gray-600 hover:bg-gray-200'
      }`}
    >
      {label}
      <span
        className={`text-xs px-2 py-1 rounded-full ${
          isActive
            ? 'bg-white text-brand-orange'
            : 'bg-gray-200 text-gray-700'
        }`}
      >
        {count}
      </span>
    </button>
  );
}

interface AdminDashboardProps {
  reviews: Review[];
  onApprove: (reviewId: string) => void;
  onReject: (reviewId: string) => void;
}

function AdminDashboard({ reviews, onApprove, onReject }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<'pending' | 'approved' | 'rejected'>('pending');
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const counts = useMemo(() => {
    return {
      pending: reviews.filter(r => r.status === 'pending').length,
      approved: reviews.filter(r => r.status === 'approved').length,
      rejected: reviews.filter(r => r.status === 'rejected').length,
    };
  }, [reviews]);

  const filteredReviews = useMemo(() => {
    const filtered = reviews.filter(r => r.status === activeTab);

    return filtered.sort((a, b) => {
      const idA = parseInt(a.id.split('-')[1] || '0');
      const idB = parseInt(b.id.split('-')[1] || '0');
      return idB - idA;
    });
  }, [reviews, activeTab]);

  const handleApprove = (reviewId: string) => {
    onApprove(reviewId);
  };

  const handleReject = (reviewId: string) => {
    onReject(reviewId);
  };

  const openModal = (review: Review) => {
    setSelectedReview(review);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedReview(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Review Management Dashboard
        </h1>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex gap-2 mb-6 border-b border-gray-200 pb-4">
            <TabButton
              tab="pending"
              label="Pending"
              count={counts.pending}
              isActive={activeTab === 'pending'}
              onClick={() => setActiveTab('pending')}
            />
            <TabButton
              tab="approved"
              label="Approved"
              count={counts.approved}
              isActive={activeTab === 'approved'}
              onClick={() => setActiveTab('approved')}
            />
            <TabButton
              tab="rejected"
              label="Rejected"
              count={counts.rejected}
              isActive={activeTab === 'rejected'}
              onClick={() => setActiveTab('rejected')}
            />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Author
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rating
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Review
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Submitted
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredReviews.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                      No reviews in this category.
                    </td>
                  </tr>
                ) : (
                  filteredReviews.map((review) => (
                    <tr key={review.id} className="hover:bg-gray-50">
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <img
                            src={review.avatarUrl}
                            alt={review.author}
                            className="h-10 w-10 rounded-full object-cover"
                          />
                          <span className="font-medium text-gray-900">
                            {review.author}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className="text-gray-500">{review.productId}</span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <StarRating rating={review.rating} setRating={() => {}} />
                      </td>
                      <td className="px-4 py-4">
                        <div className="max-w-xs text-gray-600 truncate">
                          {review.text}
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className="text-gray-500">{review.date}</span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => openModal(review)}
                            className="text-indigo-600 hover:text-indigo-900 font-medium text-sm"
                          >
                            View
                          </button>
                          {activeTab === 'pending' && (
                            <>
                              <button
                                onClick={() => handleApprove(review.id)}
                                className="text-green-600 hover:text-green-900 font-medium text-sm"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => handleReject(review.id)}
                                className="text-red-600 hover:text-red-900 font-medium text-sm"
                              >
                                Reject
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {isModalOpen && selectedReview && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40 flex items-center justify-center p-4"
            onClick={closeModal}
          >
            <div
              className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-2xl font-bold text-gray-900">Review Details</h2>
                  <button
                    onClick={closeModal}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="border-t border-gray-200 pt-4">
                  <div className="flex items-start gap-4 mb-4">
                    <img
                      src={selectedReview.avatarUrl}
                      alt={selectedReview.author}
                      className="h-12 w-12 rounded-full object-cover"
                    />
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">
                        {selectedReview.author}
                      </h3>
                      <p className="text-sm text-gray-500">{selectedReview.date}</p>
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <StarRating
                        rating={selectedReview.rating}
                        setRating={() => {}}
                        size="lg"
                      />
                      <span className="text-gray-600">({selectedReview.rating} stars)</span>
                    </div>
                    {selectedReview.verifiedPurchase && (
                      <div className="flex items-center gap-1 text-sm text-green-600">
                        <CheckCircleIcon className="w-4 h-4" />
                        <span>Verified Purchase</span>
                      </div>
                    )}
                  </div>

                  <div className="mb-4">
                    <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                      {selectedReview.text}
                    </p>
                  </div>

                  {selectedReview.images && selectedReview.images.length > 0 && (
                    <div className="mb-4">
                      <h4 className="text-sm font-semibold text-gray-900 mb-3">Submitted Photos</h4>
                      <div className="grid grid-cols-3 gap-3">
                        {selectedReview.images.map((image, index) => (
                          <a
                            key={index}
                            href={image}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block"
                          >
                            <img
                              src={image}
                              alt={`Review photo ${index + 1}`}
                              className="h-28 w-28 object-cover rounded-lg border border-gray-200 hover:opacity-80 transition-opacity cursor-pointer"
                            />
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="bg-gray-50 p-4 rounded-lg flex justify-end gap-2">
                  {selectedReview.status === 'pending' && (
                    <>
                      <button
                        onClick={() => {
                          handleReject(selectedReview.id);
                          closeModal();
                        }}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium transition-colors"
                      >
                        Reject
                      </button>
                      <button
                        onClick={() => {
                          handleApprove(selectedReview.id);
                          closeModal();
                        }}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium transition-colors"
                      >
                        Approve
                      </button>
                    </>
                  )}
                  <button
                    onClick={closeModal}
                    className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminDashboard;
