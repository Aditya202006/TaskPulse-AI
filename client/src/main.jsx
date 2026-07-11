import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { ClerkProvider } from '@clerk/clerk-react';

// Read publishable key from environment, with a valid fallback format to prevent crashes in mock/local dev
const clerkPublishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY || 'pk_test_bGl0ZS1zaGFyay04MS5jbGVyay5hY2NvdW50cy5kZXYk';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ClerkProvider publishableKey={clerkPublishableKey} afterSignOutUrl="/">
      <App />
    </ClerkProvider>
  </React.StrictMode>,
);