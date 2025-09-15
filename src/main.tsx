import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import emailjs from '@emailjs/browser';
emailjs.init(import.meta.env.VITE_EMAILJS_PUBLIC_KEY);

// Initialize EmailJS - this should be called once at app startup
if (import.meta.env.VITE_EMAILJS_PUBLIC_KEY) {
  emailjs.init(import.meta.env.VITE_EMAILJS_PUBLIC_KEY);
  console.log('EmailJS initialized successfully'); // Add this for debugging
} else {
  console.error('EmailJS public key not found in environment variables');
}


createRoot(document.getElementById("root")!).render(<App />);

