import { createRoot } from 'react-dom/client';
import { StrictMode } from 'react';
import ReviewWidget from './ReviewWidget';

interface WidgetConfig {
  productId?: string;
  supabaseUrl?: string;
  supabaseAnonKey?: string;
  buttonText?: string;
  buttonStyle?: React.CSSProperties;
  containerId?: string;
  onReviewSubmit?: (review: any) => void;
}

declare global {
  interface Window {
    ReviewWidget: {
      init: (config: WidgetConfig) => void;
      open: () => void;
      close: () => void;
      destroy: () => void;
    };
  }
}

let widgetInstance: {
  root: any;
  container: HTMLElement | null;
  modalContainer: HTMLElement | null;
} | null = null;

window.ReviewWidget = {
  init: (config: WidgetConfig) => {
    const {
      productId = 'default-product',
      supabaseUrl,
      supabaseAnonKey,
      buttonText = 'Write a Review',
      buttonStyle = {},
      containerId = 'review-widget-container',
      onReviewSubmit
    } = config;

    // Create button container if it doesn't exist
    let container = document.getElementById(containerId);
    if (!container) {
      container = document.createElement('div');
      container.id = containerId;
      document.body.appendChild(container);
    }

    // Create modal container
    let modalContainer = document.getElementById('review-widget-modal');
    if (!modalContainer) {
      modalContainer = document.createElement('div');
      modalContainer.id = 'review-widget-modal';
      document.body.appendChild(modalContainer);
    }

    // Inject styles if not already present
    if (!document.getElementById('review-widget-styles')) {
      const styleLink = document.createElement('link');
      styleLink.id = 'review-widget-styles';
      styleLink.rel = 'stylesheet';
      styleLink.href = 'https://cdn.jsdelivr.net/npm/tailwindcss@3.4.1/dist/tailwind.min.css';
      document.head.appendChild(styleLink);
    }

    const root = createRoot(container);
    root.render(
      <StrictMode>
        <ReviewWidget
          productId={productId}
          supabaseUrl={supabaseUrl}
          supabaseAnonKey={supabaseAnonKey}
          buttonText={buttonText}
          buttonStyle={buttonStyle}
          onReviewSubmit={onReviewSubmit}
          modalContainer={modalContainer}
        />
      </StrictMode>
    );

    widgetInstance = {
      root,
      container,
      modalContainer
    };
  },

  open: () => {
    if (widgetInstance?.modalContainer) {
      const event = new CustomEvent('review-widget:open');
      document.dispatchEvent(event);
    }
  },

  close: () => {
    if (widgetInstance?.modalContainer) {
      const event = new CustomEvent('review-widget:close');
      document.dispatchEvent(event);
    }
  },

  destroy: () => {
    if (widgetInstance) {
      if (widgetInstance.root) {
        widgetInstance.root.unmount();
      }
      if (widgetInstance.container) {
        widgetInstance.container.remove();
      }
      if (widgetInstance.modalContainer) {
        widgetInstance.modalContainer.remove();
      }
      widgetInstance = null;
    }
  }
};

// Auto-initialize if data attributes are present
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    const script = document.querySelector('script[data-review-widget]');
    if (script) {
      const config: WidgetConfig = {
        productId: script.getAttribute('data-product-id') || undefined,
        supabaseUrl: script.getAttribute('data-supabase-url') || undefined,
        supabaseAnonKey: script.getAttribute('data-supabase-key') || undefined,
        buttonText: script.getAttribute('data-button-text') || undefined,
        containerId: script.getAttribute('data-container-id') || undefined,
      };
      window.ReviewWidget.init(config);
    }
  });
} else {
  const script = document.querySelector('script[data-review-widget]');
  if (script) {
    const config: WidgetConfig = {
      productId: script.getAttribute('data-product-id') || undefined,
      supabaseUrl: script.getAttribute('data-supabase-url') || undefined,
      supabaseAnonKey: script.getAttribute('data-supabase-key') || undefined,
      buttonText: script.getAttribute('data-button-text') || undefined,
      containerId: script.getAttribute('data-container-id') || undefined,
    };
    window.ReviewWidget.init(config);
  }
}

