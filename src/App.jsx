import React, { useState, useEffect } from 'react';
import Layout from './components/layout/Layout';
import Hero from './components/sections/Hero';
import AboutGroup from './components/sections/AboutGroup';
import WhyChooseUs from './components/sections/WhyChooseUs';
import StoreTeaser from './components/sections/StoreTeaser';
import MirrorSolarStore from './components/sections/MirrorSolarStore';
import SubsidyGuide from './components/sections/SubsidyGuide';
import Gallery from './components/sections/Gallery';
import Reviews from './components/sections/Reviews';
import QuoteForm from './components/sections/QuoteForm';

function App() {
  const [currentView, setCurrentView] = useState('home'); // 'home' | 'store'
  const [storeSubView, setStoreSubView] = useState('catalog'); // 'catalog' | 'drain-clips'

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
      } else {
        // Return to home if hash is empty or points to another section
        if (currentView === 'store' && (hash === '#home' || hash === '' || hash === '#about' || hash === '#why-choose-us' || hash === '#contact')) {
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

  const handleNavigate = (view, subView = 'catalog') => {
    if (view === 'store') {
      setCurrentView('store');
      setStoreSubView(subView);
      window.location.hash = subView === 'drain-clips' ? '#drain-clips' : '#store';
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
          <StoreTeaser onNavigateToStore={(subView) => handleNavigate('store', subView)} />
          <AboutGroup />
          <Gallery />
          <Reviews />
          <QuoteForm />
          <WhyChooseUs />
          <SubsidyGuide />
        </>
      ) : (
        <MirrorSolarStore 
          initialSubView={storeSubView} 
          onBackToHome={() => handleNavigate('home')} 
        />
      )}
    </Layout>
  );
}

export default App;
