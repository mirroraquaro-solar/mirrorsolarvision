/**
 * Dynamically loads the Razorpay checkout script on-demand.
 * Prevents loading ~806 KiB of unused third-party JS during initial page render.
 */
let razorpayPromise = null;

export const loadRazorpay = () => {
  if (typeof window === 'undefined') return Promise.resolve(null);
  
  if (window.Razorpay) {
    return Promise.resolve(window.Razorpay);
  }

  if (razorpayPromise) {
    return razorpayPromise;
  }

  razorpayPromise = new Promise((resolve, reject) => {
    const existingScript = document.querySelector('script[src*="checkout.razorpay.com"]');
    if (existingScript) {
      existingScript.addEventListener('load', () => resolve(window.Razorpay));
      existingScript.addEventListener('error', () => reject(new Error('Failed to load Razorpay SDK')));
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(window.Razorpay);
    script.onerror = () => {
      razorpayPromise = null;
      reject(new Error('Failed to load Razorpay SDK. Please check your internet connection.'));
    };
    document.body.appendChild(script);
  });

  return razorpayPromise;
};
