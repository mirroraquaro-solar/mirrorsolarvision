import React from 'react';
import Header from './Header';
import Footer from './Footer';

export default function Layout({ children, onNavigate }) {
  return (
    <div className="flex flex-col min-h-screen">
      <Header onNavigate={onNavigate} />
      <main id="main-content" className="flex-1 mt-[72px]" role="main">
        {children}
      </main>
      <Footer onNavigate={onNavigate} />
    </div>
  );
}
