import AdminDashboard from '../components/AdminDashboard';
import { Review } from '../types';

interface AdminPageProps {
  reviews: Review[];
  setReviews: React.Dispatch<React.SetStateAction<Review[]>>;
}

function AdminPage({ reviews, setReviews }: AdminPageProps) {
  const handleApprove = (reviewId: string) => {
    setReviews(prevReviews =>
      prevReviews.map(review =>
        review.id === reviewId ? { ...review, status: 'approved' as const } : review
      )
    );
  };

  const handleReject = (reviewId: string) => {
    setReviews(prevReviews =>
      prevReviews.map(review =>
        review.id === reviewId ? { ...review, status: 'rejected' as const } : review
      )
    );
  };

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
