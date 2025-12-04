import { HashRouter, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Star } from 'lucide-react';
import ReviewsPage from './pages/ReviewsPage';
import AdminPage from './pages/AdminPage';
import IncentivePage from './pages/IncentivePage';
import OrderReviewPage from './pages/OrderReviewPage';
import { Review } from './types';
import { mockReviews } from './data';

// Helper function to check if user is admin
function isAdmin(): boolean {
  // Check localStorage for admin flag
  const adminFlag = localStorage.getItem('isAdmin');
  if (adminFlag === 'true') {
    return true;
  }

  // Check URL params for admin access (for direct links)
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('admin') === 'true') {
    localStorage.setItem('isAdmin', 'true');
    return true;
  }

  return false;
}

function Navigation() {
  const location = useLocation();
  const [isAdminUser, setIsAdminUser] = useState(false);

  useEffect(() => {
    setIsAdminUser(isAdmin());
  }, [location]);

  const isActive = (path: string) => location.pathname === path;

  const linkClass = (path: string) =>
    `px-4 py-2 rounded-md text-sm font-medium transition-colors ${
      isActive(path)
        ? 'bg-brand-orange text-white'
        : 'text-gray-300 hover:bg-gray-700 hover:text-white'
    }`;

  return (
    <nav className="sticky top-0 z-50 bg-brand-dark shadow-lg">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-3 sm:py-0 sm:h-16">
          <div className="flex items-center space-x-2 mb-2 sm:mb-0">
            <Star className="w-6 h-6 text-brand-orange fill-brand-orange" />
            <span className="text-white font-bold text-lg">ReviewHub</span>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link to="/reviews" className={linkClass('/reviews')}>
              Reviews
            </Link>
            {/* Only show Admin link if user is admin */}
            {isAdminUser && (
              <Link to="/admin" className={linkClass('/admin')}>
                Admin
              </Link>
            )}
            <Link to="/incentive" className={linkClass('/incentive')}>
              Incentive
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}

function App() {
  const [reviews, setReviews] = useState<Review[]>(mockReviews);

  return (
    <HashRouter>
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <Routes>
          <Route path="/" element={<Navigate to="/reviews" replace />} />
          <Route path="/reviews" element={<ReviewsPage reviews={reviews} setReviews={setReviews} />} />
          <Route path="/review" element={<OrderReviewPage />} />
          <Route path="/admin" element={<AdminPage reviews={reviews} setReviews={setReviews} />} />
          <Route path="/incentive" element={<IncentivePage />} />
        </Routes>
      </div>
    </HashRouter>
  );
}

export default App;
