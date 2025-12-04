import { HashRouter, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { Star } from 'lucide-react';
import IncentivePage from './pages/IncentivePage';
import OrderReviewPage from './pages/OrderReviewPage';

function Navigation() {
  const location = useLocation();

  // Hide navigation on review page
  if (location.pathname === '/review') {
    return null;
  }

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
  return (
    <HashRouter>
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <Routes>
          <Route path="/" element={<Navigate to="/incentive" replace />} />
          <Route path="/review" element={<OrderReviewPage />} />
          <Route path="/incentive" element={<IncentivePage />} />
        </Routes>
      </div>
    </HashRouter>
  );
}

export default App;
