# Review Widget Integration Guide

This guide explains how to embed the Review Widget into any website.

## Quick Start

### Option 1: Using Script Tag (Recommended)

Add this script tag to your HTML:

```html
<script 
  src="https://your-vercel-url.vercel.app/widget/review-widget.iife.js"
  data-review-widget
  data-product-id="your-product-id"
  data-supabase-url="your-supabase-url"
  data-supabase-key="your-supabase-anon-key"
  data-button-text="Write a Review"
  data-container-id="review-widget-container"
></script>

<!-- Place this where you want the button to appear -->
<div id="review-widget-container"></div>
```

### Option 2: Using JavaScript API

```html
<script src="https://your-vercel-url.vercel.app/widget/review-widget.iife.js"></script>
<script>
  window.ReviewWidget.init({
    productId: 'your-product-id',
    supabaseUrl: 'your-supabase-url',
    supabaseAnonKey: 'your-supabase-anon-key',
    buttonText: 'Write a Review',
    buttonStyle: {
      backgroundColor: '#FE4D03',
      padding: '10px 20px',
      borderRadius: '8px'
    },
    containerId: 'review-widget-container',
    onReviewSubmit: (review) => {
      console.log('Review submitted:', review);
      // Handle review submission
    }
  });
</script>

<div id="review-widget-container"></div>
```

## Configuration Options

| Option | Type | Required | Default | Description |
|--------|------|----------|---------|-------------|
| `productId` | string | Yes | - | Unique identifier for the product |
| `supabaseUrl` | string | No | - | Your Supabase project URL |
| `supabaseAnonKey` | string | No | - | Your Supabase anon/public key |
| `buttonText` | string | No | "Write a Review" | Text displayed on the button |
| `buttonStyle` | object | No | {} | Custom CSS styles for the button |
| `containerId` | string | No | "review-widget-container" | ID of the container element |
| `onReviewSubmit` | function | No | - | Callback when review is submitted |

## API Methods

### `ReviewWidget.init(config)`
Initializes the widget with the provided configuration.

### `ReviewWidget.open()`
Programmatically opens the review modal.

```javascript
window.ReviewWidget.open();
```

### `ReviewWidget.close()`
Programmatically closes the review modal.

```javascript
window.ReviewWidget.close();
```

### `ReviewWidget.destroy()`
Removes the widget from the page.

```javascript
window.ReviewWidget.destroy();
```

## Examples

### React Example

```jsx
import { useEffect } from 'react';

function MyComponent() {
  useEffect(() => {
    // Load the widget script
    const script = document.createElement('script');
    script.src = 'https://your-vercel-url.vercel.app/widget/review-widget.iife.js';
    script.async = true;
    document.body.appendChild(script);

    script.onload = () => {
      window.ReviewWidget.init({
        productId: 'product-123',
        supabaseUrl: process.env.REACT_APP_SUPABASE_URL,
        supabaseAnonKey: process.env.REACT_APP_SUPABASE_ANON_KEY,
        buttonText: 'Add Review',
        onReviewSubmit: (review) => {
          console.log('New review:', review);
        }
      });
    };

    return () => {
      window.ReviewWidget?.destroy();
      document.body.removeChild(script);
    };
  }, []);

  return <div id="review-widget-container" />;
}
```

### Vue Example

```vue
<template>
  <div id="review-widget-container"></div>
</template>

<script>
export default {
  mounted() {
    const script = document.createElement('script');
    script.src = 'https://your-vercel-url.vercel.app/widget/review-widget.iife.js';
    script.async = true;
    document.body.appendChild(script);

    script.onload = () => {
      window.ReviewWidget.init({
        productId: 'product-123',
        supabaseUrl: import.meta.env.VITE_SUPABASE_URL,
        supabaseAnonKey: import.meta.env.VITE_SUPABASE_ANON_KEY,
      });
    };
  },
  beforeUnmount() {
    window.ReviewWidget?.destroy();
  }
};
</script>
```

### Vanilla JavaScript Example

```html
<!DOCTYPE html>
<html>
<head>
  <title>My Product Page</title>
</head>
<body>
  <h1>My Product</h1>
  <div id="review-widget-container"></div>

  <script src="https://your-vercel-url.vercel.app/widget/review-widget.iife.js"></script>
  <script>
    window.ReviewWidget.init({
      productId: 'product-123',
      supabaseUrl: 'https://your-project.supabase.co',
      supabaseAnonKey: 'your-anon-key',
      buttonText: 'Write a Review',
      onReviewSubmit: function(review) {
        alert('Thank you for your review!');
      }
    });
  </script>
</body>
</html>
```

## Styling

The widget uses Tailwind CSS classes. If your project already uses Tailwind, the styles will integrate seamlessly. Otherwise, the widget includes its own styles.

You can customize the button appearance using the `buttonStyle` option:

```javascript
window.ReviewWidget.init({
  // ... other options
  buttonStyle: {
    backgroundColor: '#your-color',
    color: '#ffffff',
    padding: '12px 24px',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: '600'
  }
});
```

## Troubleshooting

### Widget not appearing
- Check browser console for errors
- Ensure the script is loaded before calling `init()`
- Verify the container element exists

### Modal not opening
- Check if there are CSS conflicts (z-index issues)
- Ensure no other modals are blocking the widget modal

### Supabase errors
- Verify your Supabase credentials are correct
- Check that the database tables are created (run `supabase/setup.sql`)
- Ensure RLS policies allow the operations you need

