import React from 'react';
import Header from './Header';
import Footer from './Footer';
import CartDrawer from '../checkout/CartDrawer';
import { WhatsAppBotButton } from '../../aqua/components/ui/WhatsAppBotButton.jsx';

export default function Layout({ children, onNavigate }) {
  return (
    <div className="flex flex-col min-h-screen">
      <Header onNavigate={onNavigate} />
      <main id="main-content" className="flex-1 pt-[80px] sm:pt-[90px]" role="main">
        {children}
      </main>
      <Footer onNavigate={onNavigate} />
      <CartDrawer 
        onNavigate={onNavigate}
        onProceedToCheckout={() => onNavigate('store', 'checkout')}
      />
      <WhatsAppBotButton />
    </div>
  );
}
