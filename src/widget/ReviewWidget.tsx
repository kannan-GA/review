import { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import ReviewForm from '../components/ReviewForm';
import { Review } from '../types';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

interface ReviewWidgetProps {
  productId: string;
  supabaseUrl?: string;
  supabaseAnonKey?: string;
  buttonText: string;
  buttonStyle?: React.CSSProperties;
  onReviewSubmit?: (review: any) => void;
  modalContainer: HTMLElement;
}

function ReviewWidget({
  productId,
  supabaseUrl,
  supabaseAnonKey,
  buttonText,
  buttonStyle,
  onReviewSubmit,
  modalContainer
}: ReviewWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [supabase, setSupabase] = useState<SupabaseClient | null>(null);

  useEffect(() => {
    if (supabaseUrl && supabaseAnonKey) {
      const client = createClient(supabaseUrl, supabaseAnonKey);
      setSupabase(client);
    }
  }, [supabaseUrl, supabaseAnonKey]);

  useEffect(() => {
    const handleOpen = () => setIsOpen(true);
    const handleClose = () => setIsOpen(false);

    document.addEventListener('review-widget:open', handleOpen);
    document.addEventListener('review-widget:close', handleClose);

    return () => {
      document.removeEventListener('review-widget:open', handleOpen);
      document.removeEventListener('review-widget:close', handleClose);
    };
  }, []);

  const handleSubmit = async (review: Omit<Review, 'id' | 'author' | 'avatarUrl' | 'date' | 'verifiedPurchase' | 'status'>) => {
    try {
      if (supabase) {
        // Save to Supabase
        const { data, error } = await supabase
          .from('reviews')
          .insert([
            {
              product_id: productId,
              rating: review.rating,
              text: review.text,
              images: review.images,
              status: review.rating === 5 ? 'approved' : 'pending',
              created_at: new Date().toISOString()
            }
          ])
          .select()
          .single();

        if (error) throw error;

        if (onReviewSubmit) {
          onReviewSubmit(data);
        }
      } else {
        // Fallback if no Supabase
        if (onReviewSubmit) {
          onReviewSubmit({
            ...review,
            productId,
            id: `review-${Date.now()}`,
            date: new Date().toISOString()
          });
        }
      }
    } catch (error) {
      console.error('Error submitting review:', error);
    }
  };

  const handleCancel = () => {
    setIsOpen(false);
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        style={{
          backgroundColor: '#FE4D03',
          color: 'white',
          padding: '0.5rem 1.5rem',
          borderRadius: '0.5rem',
          fontWeight: 600,
          border: 'none',
          cursor: 'pointer',
          transition: 'background-color 0.2s',
          ...buttonStyle
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = '#e64400';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = '#FE4D03';
        }}
      >
        {buttonText}
      </button>

      {isOpen && (
        <ReviewModal
          container={modalContainer}
          onClose={handleCancel}
          onSubmit={handleSubmit}
        />
      )}
    </>
  );
}

interface ReviewModalProps {
  container: HTMLElement;
  onClose: () => void;
  onSubmit: (review: Omit<Review, 'id' | 'author' | 'avatarUrl' | 'date' | 'verifiedPurchase' | 'status'>) => void;
}

function ReviewModal({ container, onClose, onSubmit }: ReviewModalProps) {
  useEffect(() => {
    const modalOverlay = document.createElement('div');
    modalOverlay.id = 'review-widget-overlay';
    modalOverlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: rgba(0, 0, 0, 0.5);
      z-index: 9998;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1rem;
    `;

    const modalContent = document.createElement('div');
    modalContent.id = 'review-widget-content';
    modalContent.style.cssText = `
      position: relative;
      z-index: 9999;
      max-width: 100%;
      max-height: 100%;
      overflow-y: auto;
    `;

    modalOverlay.appendChild(modalContent);
    container.appendChild(modalOverlay);

    const handleClickOutside = (e: MouseEvent) => {
      if (e.target === modalOverlay) {
        onClose();
      }
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    modalOverlay.addEventListener('click', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    // Render form
    const root = createRoot(modalContent);
    root.render(
      <ReviewForm onSubmit={onSubmit} onCancel={onClose} />
    );

    return () => {
      modalOverlay.removeEventListener('click', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
      try {
        root.unmount();
      } catch (e) {
        // Already unmounted
      }
      if (modalOverlay.parentNode) {
        modalOverlay.remove();
      }
    };
  }, [container, onClose, onSubmit]);

  return null;
}

export default ReviewWidget;

