import React, { useState, useEffect, useRef } from 'react';
import {
  MessageCircle,
  X,
  ChevronLeft,
  AlertTriangle,
  Send,
  CheckCircle2,
  ArrowRight,
  Check
} from 'lucide-react';
import './WhatsAppBotButton.css';

const ADMIN_WHATSAPP = import.meta.env.VITE_WHATSAPP_BUSINESS_NUMBER || '919182612420';

// Pre-defined Issue Categories
const ISSUE_CATEGORIES = [
  { id: 'delivery', label: '🚚 Delivery / Order Delay', text: 'Order delivery or courier tracking delay' },
  { id: 'damaged', label: '📦 Damaged or Missing Item', text: 'Received damaged, defective, or missing item' },
  { id: 'drain_clip', label: '☀️ Solar Clip / Hardware Issue', text: 'Drain clip fitment, frame size, or hardware issue' },
  { id: 'filter', label: '💧 Mirror Aqua PP Filter Issue', text: 'Spun filter compatibility or water leakage issue' },
  { id: 'subsidy', label: '⚡ Subsidy / Net Metering Help', text: 'PM Surya Ghar subsidy / Discom net metering inquiry' },
  { id: 'install', label: '🛠️ Installation / Site Support', text: 'Rooftop solar installation or technical guidance' },
  { id: 'other_issue', label: '✍️ Other Issue / Complaint', text: 'Other service or support issue' },
];

// Pre-defined Query Categories
const QUERY_CATEGORIES = [
  { id: 'solar_quote', label: '☀️ Rooftop Solar & Subsidy Quote', text: 'Free PM Surya Ghar rooftop solar quotation & savings' },
  { id: 'drain_clips_price', label: '🛒 MSV Drain Clips & Combos Pricing', text: 'Pricing, pack sizes, and commercial wholesale rates' },
  { id: 'aqua_filter_bulk', label: '💧 10" PP Filter (120g) Wholesale', text: 'Carton quantity supply and wholesale trade pricing' },
  { id: 'dealer_partner', label: '🤝 Dealership / Partner Registration', text: 'Becoming an authorized Mirror dealer / installer partner' },
  { id: 'delivery_area', label: '🚚 Delivery & Dispatch Timelines', text: 'Fast delivery coverage across all 26 AP districts' },
  { id: 'general_query', label: '❓ General Product / Store Query', text: 'General inquiry about products and specifications' },
];

export function WhatsAppBotButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState('select'); // 'select' | 'issue' | 'query'
  const [showGreeting, setShowGreeting] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [phoneOrRef, setPhoneOrRef] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [customNotes, setCustomNotes] = useState('');
  const [isForwarded, setIsForwarded] = useState(false);

  const containerRef = useRef(null);

  // Show greeting bubble after 3 seconds on page load
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowGreeting(true);
    }, 2800);
    return () => clearTimeout(timer);
  }, []);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target) && isOpen) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleToggleOpen = () => {
    if (!isOpen) {
      setIsOpen(true);
      setShowGreeting(false);
      setMode('select');
      setIsForwarded(false);
    } else {
      setIsOpen(false);
    }
  };

  const handleSelectMode = (newMode) => {
    setMode(newMode);
    setSelectedCategory('');
    setCustomNotes('');
    setIsForwarded(false);
  };

  const handleSelectCategory = (cat) => {
    setSelectedCategory(cat.label);
    if (!customNotes) {
      setCustomNotes(cat.text);
    }
  };

  const handleForwardMessage = (e) => {
    if (e) e.preventDefault();

    let messageText = '';
    const currentUrl = typeof window !== 'undefined' ? window.location.href : 'Mirror Solar Vision';

    if (mode === 'issue') {
      messageText = `🚨 *MIRROR SUPPORT — ISSUE REPORT*
━━━━━━━━━━━━━━━━━━━━━━━━━━
👤 *Customer Name:* ${name.trim() || 'Customer'}
📞 *Phone / Order Ref:* ${phoneOrRef.trim() || 'Not specified'}
⚠️ *Issue Category:* ${selectedCategory || 'General Support Issue'}
📝 *Issue Details:*
${customNotes.trim() || 'I am facing an issue and require immediate support.'}

🌐 *Source Page:* ${currentUrl}
━━━━━━━━━━━━━━━━━━━━━━━━━━
_Kindly assign a support executive to assist me._`;
    } else if (mode === 'query') {
      messageText = `💬 *MIRROR VISION & AQUA — ENQUIRY*
━━━━━━━━━━━━━━━━━━━━━━━━━━
👤 *Customer Name:* ${name.trim() || 'Interested Customer'}
📍 *Location / District:* ${phoneOrRef.trim() || 'Andhra Pradesh'}
📋 *Inquiry Category:* ${selectedCategory || 'General Product Query'}
❓ *Query Details:*
${customNotes.trim() || 'I would like more information and commercial pricing.'}

🌐 *Source Page:* ${currentUrl}
━━━━━━━━━━━━━━━━━━━━━━━━━━
_Looking forward to your quick response._`;
    } else {
      // Direct Quick chat
      messageText = `Hello Mirror Solar Vision & Mirror Aqua Team! 👋
I would like to inquire about your Solar & Water Purifier products and services.
Page: ${currentUrl}`;
    }

    const waUrl = `https://wa.me/${ADMIN_WHATSAPP}?text=${encodeURIComponent(messageText)}`;
    
    setIsForwarded(true);

    // Open WhatsApp
    setTimeout(() => {
      window.open(waUrl, '_blank', 'noopener,noreferrer');
      // Reset & close after short delay
      setTimeout(() => {
        setIsOpen(false);
        setIsForwarded(false);
        setMode('select');
      }, 800);
    }, 300);
  };

  const handleDirectWhatsAppChat = () => {
    const text = encodeURIComponent('Hello Mirror Solar & Aqua team! I would like to chat with customer support.');
    const url = `https://wa.me/${ADMIN_WHATSAPP}?text=${text}`;
    window.open(url, '_blank', 'noopener,noreferrer');
    setIsOpen(false);
  };

  return (
    <div className="wa-bot-floating-container" ref={containerRef}>
      
      {/* 1. Greeting Bubble (When Popover is closed) */}
      {!isOpen && (
        <div 
          className={`wa-bot-bubble ${showGreeting ? 'visible' : ''}`}
          onClick={handleToggleOpen}
          role="button"
          tabIndex={0}
          aria-label="Open WhatsApp Support Options"
        >
          <div className="wa-bot-bubble-content">
            <div className="wa-bot-bubble-header">
              <span className="wa-bot-title">Mirror WhatsApp Help</span>
              <span className="wa-bot-status-tag">
                <span className="wa-status-dot" /> Online
              </span>
            </div>
            <p className="wa-bot-bubble-msg">
              Have an <strong>Issue</strong> or <strong>Query</strong>? Tap here to forward to our WhatsApp desk!
            </p>
          </div>
          <button 
            type="button" 
            className="wa-bot-bubble-close"
            onClick={(e) => {
              e.stopPropagation();
              setShowGreeting(false);
            }}
            aria-label="Dismiss greeting"
          >
            <X size={12} />
          </button>
        </div>
      )}

      {/* 2. Interactive Support Card Popover */}
      {isOpen && (
        <div className="wa-card-modal animate-in fade-in slide-in-from-bottom-4 duration-200" role="dialog" aria-modal="true" aria-label="WhatsApp Support">
          
          {/* Card Header */}
          <div className="wa-card-header">
            <div className="wa-card-header-left">
              {mode !== 'select' && (
                <button 
                  type="button" 
                  className="wa-card-back-btn" 
                  onClick={() => setMode('select')}
                  aria-label="Back to selection"
                >
                  <ChevronLeft size={18} />
                </button>
              )}
              <div className="wa-header-avatar">
                <span className="wa-header-avatar-icon">⚡</span>
                <span className="wa-header-status-indicator" />
              </div>
              <div className="wa-header-meta">
                <h3 className="wa-header-title">Mirror Support Desk</h3>
                <span className="wa-header-subtitle">
                  <span className="wa-status-dot" /> Solar & Aqua • Replies Instantly
                </span>
              </div>
            </div>
            <button 
              type="button" 
              className="wa-card-close-btn" 
              onClick={() => setIsOpen(false)}
              aria-label="Close WhatsApp card"
            >
              <X size={18} />
            </button>
          </div>

          {/* Card Body */}
          <div className="wa-card-body">
            
            {/* STEP 1: Two Main Options (Issue vs Query) */}
            {mode === 'select' && (
              <div className="wa-step-select">
                <div className="wa-welcome-banner">
                  <p className="wa-welcome-heading">How can we assist you today?</p>
                  <p className="wa-welcome-sub">
                    Select an option below to forward your message directly to our WhatsApp support team:
                  </p>
                </div>

                <div className="wa-options-grid">
                  
                  {/* Option 1: Issue / Complaint */}
                  <button
                    type="button"
                    className="wa-option-card wa-option-issue group"
                    onClick={() => handleSelectMode('issue')}
                  >
                    <div className="wa-option-badge-wrap">
                      <div className="wa-option-icon wa-icon-issue">
                        <AlertTriangle size={22} />
                      </div>
                      <span className="wa-option-tag wa-tag-issue">Support Desk</span>
                    </div>
                    <div className="wa-option-text-wrap">
                      <div className="wa-option-title-row">
                        <strong className="wa-option-title">1. Report an Issue</strong>
                        <span className="wa-option-telugu">సమస్య / ఫిర్యాదు</span>
                      </div>
                      <p className="wa-option-desc">
                        Delivery delays, damaged item, clip fitment, water filter issue or warranty support.
                      </p>
                    </div>
                    <div className="wa-option-action">
                      <span>Select Issue</span>
                      <ArrowRight size={14} className="wa-action-arrow" />
                    </div>
                  </button>

                  {/* Option 2: General Query / Inquiry */}
                  <button
                    type="button"
                    className="wa-option-card wa-option-query group"
                    onClick={() => handleSelectMode('query')}
                  >
                    <div className="wa-option-badge-wrap">
                      <div className="wa-option-icon wa-icon-query">
                        <MessageCircle size={22} />
                      </div>
                      <span className="wa-option-tag wa-tag-query">Sales & Info</span>
                    </div>
                    <div className="wa-option-text-wrap">
                      <div className="wa-option-title-row">
                        <strong className="wa-option-title">2. General Query</strong>
                        <span className="wa-option-telugu">విచారణ / కొటేషన్</span>
                      </div>
                      <p className="wa-option-desc">
                        Solar subsidy quotes, Drain Clips pricing, PP filter cartons, trade dealership.
                      </p>
                    </div>
                    <div className="wa-option-action">
                      <span>Select Query</span>
                      <ArrowRight size={14} className="wa-action-arrow" />
                    </div>
                  </button>

                </div>

                {/* Direct Chat Fallback */}
                <div className="wa-direct-chat-row">
                  <button
                    type="button"
                    className="wa-direct-chat-link"
                    onClick={handleDirectWhatsAppChat}
                  >
                    <span>Or start direct chat without selecting</span>
                    <ArrowRight size={13} />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2A: Issue Form & Forwarding */}
            {mode === 'issue' && (
              <form onSubmit={handleForwardMessage} className="wa-form-view">
                <div className="wa-form-heading-bar wa-heading-issue">
                  <div className="wa-form-heading-icon">
                    <AlertTriangle size={18} />
                  </div>
                  <div>
                    <h4 className="wa-form-heading-title">Report an Issue (సమస్య)</h4>
                    <p className="wa-form-heading-sub">Our support team will review and resolve this on WhatsApp.</p>
                  </div>
                </div>

                {/* Quick Category Chips */}
                <div className="wa-field-group">
                  <label className="wa-field-label">
                    Select Issue Category <span className="wa-req">*</span>
                  </label>
                  <div className="wa-chips-grid">
                    {ISSUE_CATEGORIES.map((cat) => (
                      <button
                        key={cat.id}
                        type="button"
                        className={`wa-chip-btn ${selectedCategory === cat.label ? 'active' : ''}`}
                        onClick={() => handleSelectCategory(cat)}
                      >
                        {selectedCategory === cat.label && <Check size={12} className="wa-chip-check" />}
                        <span>{cat.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Input Fields */}
                <div className="wa-form-inputs-row">
                  <div className="wa-field-group">
                    <label htmlFor="wa-issue-name" className="wa-field-label">Your Name</label>
                    <input
                      id="wa-issue-name"
                      type="text"
                      className="wa-text-input"
                      placeholder="e.g. Ramesh Reddy"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>
                  <div className="wa-field-group">
                    <label htmlFor="wa-issue-ref" className="wa-field-label">Order ID / Phone</label>
                    <input
                      id="wa-issue-ref"
                      type="text"
                      className="wa-text-input"
                      placeholder="e.g. MSV-1049 or 9876543210"
                      value={phoneOrRef}
                      onChange={(e) => setPhoneOrRef(e.target.value)}
                    />
                  </div>
                </div>

                <div className="wa-field-group">
                  <label htmlFor="wa-issue-notes" className="wa-field-label">Issue Details / Message</label>
                  <textarea
                    id="wa-issue-notes"
                    rows={2}
                    className="wa-textarea-input"
                    placeholder="Briefly describe the issue (e.g. Clip size 35mm needed, order delayed)..."
                    value={customNotes}
                    onChange={(e) => setCustomNotes(e.target.value)}
                  />
                </div>

                {/* Forward Action Button */}
                <button
                  type="submit"
                  className={`wa-submit-forward-btn wa-submit-issue ${isForwarded ? 'forwarded' : ''}`}
                  disabled={isForwarded}
                >
                  <span className="wa-submit-icon">
                    {isForwarded ? <CheckCircle2 size={18} /> : <Send size={18} />}
                  </span>
                  <span>{isForwarded ? 'Forwarding to WhatsApp...' : 'Forward Issue to WhatsApp 💬'}</span>
                </button>

                <p className="wa-privacy-note">
                  🔒 Opens official WhatsApp chat (+91 {ADMIN_WHATSAPP}) with your message formatted.
                </p>
              </form>
            )}

            {/* STEP 2B: Query Form & Forwarding */}
            {mode === 'query' && (
              <form onSubmit={handleForwardMessage} className="wa-form-view">
                <div className="wa-form-heading-bar wa-heading-query">
                  <div className="wa-form-heading-icon">
                    <MessageCircle size={18} />
                  </div>
                  <div>
                    <h4 className="wa-form-heading-title">General Query & Quotes (విచారణ)</h4>
                    <p className="wa-form-heading-sub">Ask for quotes, wholesale pricing, or technical details.</p>
                  </div>
                </div>

                {/* Quick Query Category Chips */}
                <div className="wa-field-group">
                  <label className="wa-field-label">
                    Select Query Topic <span className="wa-req">*</span>
                  </label>
                  <div className="wa-chips-grid">
                    {QUERY_CATEGORIES.map((cat) => (
                      <button
                        key={cat.id}
                        type="button"
                        className={`wa-chip-btn ${selectedCategory === cat.label ? 'active' : ''}`}
                        onClick={() => handleSelectCategory(cat)}
                      >
                        {selectedCategory === cat.label && <Check size={12} className="wa-chip-check" />}
                        <span>{cat.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Input Fields */}
                <div className="wa-form-inputs-row">
                  <div className="wa-field-group">
                    <label htmlFor="wa-query-name" className="wa-field-label">Your Name</label>
                    <input
                      id="wa-query-name"
                      type="text"
                      className="wa-text-input"
                      placeholder="e.g. Durgarao"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>
                  <div className="wa-field-group">
                    <label htmlFor="wa-query-location" className="wa-field-label">City / District</label>
                    <input
                      id="wa-query-location"
                      type="text"
                      className="wa-text-input"
                      placeholder="e.g. Vijayawada, Vizag, Guntur"
                      value={phoneOrRef}
                      onChange={(e) => setPhoneOrRef(e.target.value)}
                    />
                  </div>
                </div>

                <div className="wa-field-group">
                  <label htmlFor="wa-query-notes" className="wa-field-label">What would you like to inquire about?</label>
                  <textarea
                    id="wa-query-notes"
                    rows={2}
                    className="wa-textarea-input"
                    placeholder="Specify package, quantity required, or rooftop solar query..."
                    value={customNotes}
                    onChange={(e) => setCustomNotes(e.target.value)}
                  />
                </div>

                {/* Forward Action Button */}
                <button
                  type="submit"
                  className={`wa-submit-forward-btn wa-submit-query ${isForwarded ? 'forwarded' : ''}`}
                  disabled={isForwarded}
                >
                  <span className="wa-submit-icon">
                    {isForwarded ? <CheckCircle2 size={18} /> : <Send size={18} />}
                  </span>
                  <span>{isForwarded ? 'Forwarding to WhatsApp...' : 'Forward Query to WhatsApp 💬'}</span>
                </button>

                <p className="wa-privacy-note">
                  🔒 Opens official WhatsApp chat (+91 {ADMIN_WHATSAPP}) with your inquiry pre-filled.
                </p>
              </form>
            )}

          </div>

          {/* Card Footer Info */}
          <div className="wa-card-footer">
            <span className="wa-footer-text">
              Mirror Solar Vision & Mirror Aqua • Official WhatsApp Desk
            </span>
          </div>

        </div>
      )}

      {/* 3. Main WhatsApp Round Floating Trigger Button */}
      <button
        type="button"
        id="whatsapp-bot-button"
        className={`wa-bot-button ${isOpen ? 'active' : ''}`}
        onClick={handleToggleOpen}
        aria-label="Chat with Mirror Solar & Aqua on WhatsApp"
        title="Chat on WhatsApp (+91 9182612420)"
      >
        {/* Pulsing beacon ring */}
        {!isOpen && <span className="wa-bot-ping-ring" aria-hidden="true" />}
        
        {/* Icon (Switches between WhatsApp SVG and X when open) */}
        <span className="wa-bot-icon-wrap">
          {isOpen ? (
            <X size={28} className="wa-close-svg" />
          ) : (
            <svg
              className="wa-svg-icon"
              viewBox="0 0 24 24"
              width="32"
              height="32"
              fill="currentColor"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
          )}
        </span>

        {/* Live Online Dot Badge */}
        {!isOpen && <span className="wa-bot-online-badge" />}
      </button>

    </div>
  );
}
