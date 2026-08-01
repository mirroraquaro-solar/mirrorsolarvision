import React, { useState, useEffect } from 'react';
import Layout from './components/layout/Layout';
import Hero from './components/sections/Hero';
import AuthorizedDealers from './components/sections/AuthorizedDealers';
import AboutGroup from './components/sections/AboutGroup';
import WhyChooseUs from './components/sections/WhyChooseUs';
import StoreTeaser from './components/sections/StoreTeaser';
import MirrorSolarStore from './components/sections/MirrorSolarStore';
import SubsidyGuide from './components/sections/SubsidyGuide';
import Gallery from './components/sections/Gallery';
import Reviews from './components/sections/Reviews';
import QuoteForm from './components/sections/QuoteForm';
import CheckoutPage from './components/checkout/CheckoutPage';
import OrderSuccess from './components/checkout/OrderSuccess';
import MyOrders from './components/checkout/MyOrders';

function App() {
  const [currentView, setCurrentView] = useState('home'); // 'home' | 'store' | 'checkout' | 'order-success'
  const [storeSubView, setStoreSubView] = useState('catalog'); // 'catalog' | 'drain-clips'
  const [lastOrderId, setLastOrderId] = useState(() => {
    const saved = localStorage.getItem('lastOrderId');
    return saved ? JSON.parse(saved) : null;
  });
  const [checkoutData, setCheckoutData] = useState(() => {
    const saved = localStorage.getItem('checkoutData');
    return saved ? JSON.parse(saved) : null;
  });

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash === '#store') {
        setCurrentView('store');
        setStoreSubView('catalog');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else if (hash === '#drain-clips') {
        setCurrentView('store');
        setStoreSubView('drain-clips');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else if (hash === '#checkout') {
        setCurrentView('checkout');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else if (hash === '#order-success') {
        setCurrentView('order-success');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else if (hash === '#orders') {
        setCurrentView('orders');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        // Return to home if hash is empty or points to another section
        if (currentView !== 'home' && (hash === '#home' || hash === '' || hash === '#about' || hash === '#why-choose-us' || hash === '#contact')) {
          setCurrentView('home');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      }
    };

    // Initial check
    handleHashChange();

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const handleNavigate = (view, subView = 'catalog', additionalData = null) => {
    if (view === 'store') {
      setCurrentView('store');
      setStoreSubView(subView);
      window.location.hash = subView === 'drain-clips' ? '#drain-clips' : '#store';
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (view === 'checkout') {
      setCurrentView('checkout');
      setCheckoutData(additionalData);
      if (additionalData) localStorage.setItem('checkoutData', JSON.stringify(additionalData));
      else localStorage.removeItem('checkoutData');
      window.location.hash = '#checkout';
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (view === 'order-success') {
      setCurrentView('order-success');
      setLastOrderId(additionalData);
      if (additionalData) localStorage.setItem('lastOrderId', JSON.stringify(additionalData));
      else localStorage.removeItem('lastOrderId');
      window.location.hash = '#order-success';
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (view === 'orders') {
      setCurrentView('orders');
      window.location.hash = '#orders';
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      setCurrentView('home');
      window.location.hash = '#home';
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <Layout onNavigate={handleNavigate}>
      {currentView === 'home' ? (
        <>
          <Hero />
          <AuthorizedDealers />
          <StoreTeaser onNavigateToStore={(subView) => handleNavigate('store', subView)} />
          <AboutGroup />
          <Gallery />
          <Reviews />
          <QuoteForm />
          <WhyChooseUs />
          <SubsidyGuide />
        </>
      ) : currentView === 'store' ? (
        <MirrorSolarStore 
          initialSubView={storeSubView} 
          onBackToHome={() => handleNavigate('home')}
          onCheckout={(data) => handleNavigate('checkout', null, data)}
        />
      ) : currentView === 'checkout' ? (
        <CheckoutPage 
          onBack={() => handleNavigate('store')} 
          onPaymentSuccess={(orderId) => handleNavigate('order-success', null, orderId)} 
          checkoutData={checkoutData}
        />
      ) : currentView === 'order-success' ? (
        <OrderSuccess 
          orderData={lastOrderId} 
          onContinueShopping={() => handleNavigate('store')} 
          onViewOrders={() => handleNavigate('orders')}
        />
      ) : currentView === 'orders' ? (
        <MyOrders onBackToStore={() => handleNavigate('store')} />
      ) : null}
    </Layout>
  );
}

export default App;
