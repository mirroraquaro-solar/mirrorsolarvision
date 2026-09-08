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
import NotificationPopup from './components/ui/NotificationPopup';
import PartnerRegistration from './pages/PartnerRegistration';

function App() {
  const [currentView, setCurrentView] = useState('home'); // 'home' | 'store' | 'orders' | 'partner-registration'

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash === '#orders' || hash === '#my-orders' || hash === '#track') {
        setCurrentView('orders');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else if (hash === '#store' || hash === '#bulk-combos' || hash === '#bulk-combo' || hash === '#drain-clips') {
        setCurrentView('store');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else if (hash === '#partner-registration') {
        setCurrentView('partner-registration');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        if (currentView !== 'home') {
          setCurrentView('home');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      }
    };

    // Initial check
    handleHashChange();

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [currentView]);

  const handleNavigate = (view) => {
    if (view === 'orders' || view === 'my-orders' || view === 'track') {
      setCurrentView('orders');
      window.location.hash = '#orders';
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (view === 'store' || view === 'bulk-combos') {
      setCurrentView('store');
      window.location.hash = '#store';
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (view === 'partner-registration') {
      setCurrentView('partner-registration');
      window.location.hash = '#partner-registration';
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
            <NotificationPopup />
            <Hero onNavigate={handleNavigate} />
            <AuthorizedDealers />
            <StoreTeaser onNavigateToStore={() => handleNavigate('store')} />
            <AboutGroup />
            <WhyChooseUs />
            <Gallery />
            <Reviews />
            <SubsidyGuide />
            <QuoteForm />
          </>
        ) : currentView === 'store' ? (
          <MirrorSolarStore 
            initialView="store"
            onBackToHome={() => handleNavigate('home')}
          />
        ) : currentView === 'orders' ? (
          <MirrorSolarStore 
            initialView="orders"
            onBackToHome={() => handleNavigate('home')}
          />
        ) : currentView === 'partner-registration' ? (
          <PartnerRegistration onBack={() => handleNavigate('home')} />
        ) : null}
      </Layout>
  );
}

export default App;
