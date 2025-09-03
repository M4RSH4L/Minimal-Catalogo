import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Example usage with different background options:
// <App backgroundUrl="https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg" />
// <App backgroundUrl="linear-gradient(135deg, #667eea 0%, #764ba2 100%)" />
// <App backgroundUrl="radial-gradient(circle, #ff6b6b, #4ecdc4)" />

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
