export interface Review {
  id: string;
  productId: string;
  author: string;
  avatarUrl: string;
  date: string;
  rating: number;
  text: string;
  images: string[];
  verifiedPurchase: boolean;
  status: 'pending' | 'approved' | 'rejected';
  orderId?: string; // Optional: links review to order
}

export interface ReviewStats {
  averageRating: number;
  totalReviews: number;
  distribution: {
    '5': number;
    '4': number;
    '3': number;
    '2': number;
    '1': number;
  };
}

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  isAuthenticated: boolean;
  hasPurchasedProduct: boolean;
}

export enum ReviewSubmissionStatus {
  IDLE,
  SUBMITTING,
  SUCCESS_5_STAR,
  SUCCESS_4_STAR,
  SUCCESS_LOW_STAR,
  ERROR
}
