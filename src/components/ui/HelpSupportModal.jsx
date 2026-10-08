import React, { useState, useEffect, useRef } from 'react';
import {
  MessageCircle,
  X,
  ChevronLeft,
  AlertTriangle,
  Send,
  CheckCircle2,
  ArrowRight,
  Check,
  HelpCircle,
  PhoneCall
} from 'lucide-react';
import './HelpSupportModal.css';

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

export function HelpSupportModal({ isOpen, onClose, initialMode = 'select' }) {
  const [mode, setMode] = useState(initialMode); // 'select' | 'issue' | 'query'
  const [name, setName] = useState('');
  const [phoneOrRef, setPhoneOrRef] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [customNotes, setCustomNotes] = useState('');
  const [isForwarded, setIsForwarded] = useState(false);

  const modalRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setMode(initialMode || 'select');
      setIsForwarded(false);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen, initialMode]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

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
      messageText = `Hello Mirror Solar Vision & Mirror Aqua Team! 👋
I would like to inquire about your Solar & Water Purifier products and services.
Page: ${currentUrl}`;
    }

    const waUrl = `https://wa.me/${ADMIN_WHATSAPP}?text=${encodeURIComponent(messageText)}`;
    
    setIsForwarded(true);

    setTimeout(() => {
      window.open(waUrl, '_blank', 'noopener,noreferrer');
      setTimeout(() => {
        setIsForwarded(false);
        onClose();
      }, 600);
    }, 250);
  };

  const handleDirectWhatsAppChat = () => {
    const text = encodeURIComponent('Hello Mirror Solar & Aqua team! I would like to chat with customer support.');
    const url = `https://wa.me/${ADMIN_WHATSAPP}?text=${text}`;
    window.open(url, '_blank', 'noopener,noreferrer');
    onClose();
  };

  return (
    <div className="help-modal-backdrop" onClick={onClose} role="dialog" aria-modal="true" aria-label="Help and WhatsApp Support">
      <div 
        className="help-modal-container"
        ref={modalRef}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="help-modal-header">
          <div className="help-header-left">
            {mode !== 'select' && (
              <button 
                type="button" 
                className="help-back-btn" 
                onClick={() => setMode('select')}
                aria-label="Back to selection"
              >
                <ChevronLeft size={18} />
              </button>
            )}
            <div className="help-header-avatar">
              <span className="help-avatar-icon">⚡</span>
              <span className="help-status-dot" />
            </div>
            <div className="help-header-meta">
              <h3 className="help-header-title">Mirror Help Desk</h3>
              <span className="help-header-subtitle">
                <span className="help-live-dot" /> Solar & Aqua Support • Online
              </span>
            </div>
          </div>
          <button 
            type="button" 
            className="help-close-btn" 
            onClick={onClose}
            aria-label="Close help modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="help-modal-body">
          
          {/* STEP 1: Two Main Options (Issue vs Query) */}
          {mode === 'select' && (
            <div className="help-step-select">
              <div className="help-welcome-banner">
                <p className="help-welcome-heading">How can we help you today?</p>
                <p className="help-welcome-sub">
                  Select an option below to forward your message directly to our WhatsApp support team:
                </p>
              </div>

              <div className="help-options-grid">
                
                {/* Option 1: Issue / Complaint */}
                <button
                  type="button"
                  className="help-option-card help-option-issue group"
                  onClick={() => handleSelectMode('issue')}
                >
                  <div className="help-option-badge-wrap">
                    <div className="help-option-icon help-icon-issue">
                      <AlertTriangle size={22} />
                    </div>
                    <span className="help-option-tag help-tag-issue">Support Desk</span>
                  </div>
                  <div className="help-option-text-wrap">
                    <div className="help-option-title-row">
                      <strong className="help-option-title">1. Report an Issue</strong>
                      <span className="help-option-telugu">సమస్య / ఫిర్యాదు</span>
                    </div>
                    <p className="help-option-desc">
                      Delivery delays, damaged item, clip fitment, water filter issue or warranty support.
                    </p>
                  </div>
                  <div className="help-option-action">
                    <span>Select Issue</span>
                    <ArrowRight size={14} className="help-action-arrow" />
                  </div>
                </button>

                {/* Option 2: General Query / Inquiry */}
                <button
                  type="button"
                  className="help-option-card help-option-query group"
                  onClick={() => handleSelectMode('query')}
                >
                  <div className="help-option-badge-wrap">
                    <div className="help-option-icon help-icon-query">
                      <MessageCircle size={22} />
                    </div>
                    <span className="help-option-tag help-tag-query">Sales & Info</span>
                  </div>
                  <div className="help-option-text-wrap">
                    <div className="help-option-title-row">
                      <strong className="help-option-title">2. General Query</strong>
                      <span className="help-option-telugu">విచారణ / కొటేషన్</span>
                    </div>
                    <p className="help-option-desc">
                      Solar subsidy quotes, Drain Clips pricing, PP filter cartons, trade dealership.
                    </p>
                  </div>
                  <div className="help-option-action">
                    <span>Select Query</span>
                    <ArrowRight size={14} className="help-action-arrow" />
                  </div>
                </button>

              </div>

              {/* Direct Chat Fallback */}
              <div className="help-direct-chat-row">
                <button
                  type="button"
                  className="help-direct-chat-link"
                  onClick={handleDirectWhatsAppChat}
                >
                  <span>Or start direct chat on WhatsApp (+91 {ADMIN_WHATSAPP})</span>
                  <ArrowRight size={13} />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2A: Issue Form & Forwarding */}
          {mode === 'issue' && (
            <form onSubmit={handleForwardMessage} className="help-form-view">
              <div className="help-form-heading-bar help-heading-issue">
                <div className="help-form-heading-icon">
                  <AlertTriangle size={18} />
                </div>
                <div>
                  <h4 className="help-form-heading-title">Report an Issue (సమస్య)</h4>
                  <p className="help-form-heading-sub">Our support team will review and resolve this on WhatsApp.</p>
                </div>
              </div>

              {/* Quick Category Chips */}
              <div className="help-field-group">
                <label className="help-field-label">
                  Select Issue Category <span className="help-req">*</span>
                </label>
                <div className="help-chips-grid">
                  {ISSUE_CATEGORIES.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      className={`help-chip-btn ${selectedCategory === cat.label ? 'active' : ''}`}
                      onClick={() => handleSelectCategory(cat)}
                    >
                      {selectedCategory === cat.label && <Check size={12} className="help-chip-check" />}
                      <span>{cat.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Input Fields */}
              <div className="help-form-inputs-row">
                <div className="help-field-group">
                  <label htmlFor="help-issue-name" className="help-field-label">Your Name</label>
                  <input
                    id="help-issue-name"
                    name="name"
                    autoComplete="name"
                    type="text"
                    className="help-text-input"
                    placeholder="e.g. Ramesh Reddy"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                <div className="help-field-group">
                  <label htmlFor="help-issue-ref" className="help-field-label">Order ID / Phone</label>
                  <input
                    id="help-issue-ref"
                    name="orderRef"
                    type="text"
                    className="help-text-input"
                    placeholder="e.g. MSV-1049 or 9876543210"
                    value={phoneOrRef}
                    onChange={(e) => setPhoneOrRef(e.target.value)}
                  />
                </div>
              </div>

              <div className="help-field-group">
                <label htmlFor="help-issue-notes" className="help-field-label">Issue Details / Message</label>
                <textarea
                  id="help-issue-notes"
                  name="issueNotes"
                  rows={2}
                  className="help-textarea-input"
                  placeholder="Briefly describe the issue (e.g. Clip size 35mm needed, order delayed)..."
                  value={customNotes}
                  onChange={(e) => setCustomNotes(e.target.value)}
                />
              </div>

              {/* Forward Action Button */}
              <button
                type="submit"
                className={`help-submit-forward-btn help-submit-issue ${isForwarded ? 'forwarded' : ''}`}
                disabled={isForwarded}
              >
                <span className="help-submit-icon">
                  {isForwarded ? <CheckCircle2 size={18} /> : <Send size={18} />}
                </span>
                <span>{isForwarded ? 'Forwarding to WhatsApp...' : 'Forward Issue to WhatsApp 💬'}</span>
              </button>

              <p className="help-privacy-note">
                🔒 Opens official WhatsApp chat (+91 {ADMIN_WHATSAPP}) with your message formatted.
              </p>
            </form>
          )}

          {/* STEP 2B: Query Form & Forwarding */}
          {mode === 'query' && (
            <form onSubmit={handleForwardMessage} className="help-form-view">
              <div className="help-form-heading-bar help-heading-query">
                <div className="help-form-heading-icon">
                  <MessageCircle size={18} />
                </div>
                <div>
                  <h4 className="help-form-heading-title">General Query & Quotes (విచారణ)</h4>
                  <p className="help-form-heading-sub">Ask for quotes, wholesale pricing, or technical details.</p>
                </div>
              </div>

              {/* Quick Query Category Chips */}
              <div className="help-field-group">
                <span className="help-field-label block mb-2">
                  Select Query Topic <span className="help-req">*</span>
                </span>
                <div className="help-chips-grid">
                  {QUERY_CATEGORIES.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      className={`help-chip-btn ${selectedCategory === cat.label ? 'active' : ''}`}
                      onClick={() => handleSelectCategory(cat)}
                    >
                      {selectedCategory === cat.label && <Check size={12} className="help-chip-check" />}
                      <span>{cat.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Input Fields */}
              <div className="help-form-inputs-row">
                <div className="help-field-group">
                  <label htmlFor="help-query-name" className="help-field-label">Your Name</label>
                  <input
                    id="help-query-name"
                    name="name"
                    autoComplete="name"
                    type="text"
                    className="help-text-input"
                    placeholder="e.g. Durgarao"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                <div className="help-field-group">
                  <label htmlFor="help-query-location" className="help-field-label">City / District</label>
                  <input
                    id="help-query-location"
                    name="location"
                    type="text"
                    className="help-text-input"
                    placeholder="e.g. Vijayawada, Vizag, Guntur"
                    value={phoneOrRef}
                    onChange={(e) => setPhoneOrRef(e.target.value)}
                  />
                </div>
              </div>

              <div className="help-field-group">
                <label htmlFor="help-query-notes" className="help-field-label">What would you like to inquire about?</label>
                <textarea
                  id="help-query-notes"
                  name="queryNotes"
                  rows={2}
                  className="help-textarea-input"
                  placeholder="Specify package, quantity required, or rooftop solar query..."
                  value={customNotes}
                  onChange={(e) => setCustomNotes(e.target.value)}
                />
              </div>

              {/* Forward Action Button */}
              <button
                type="submit"
                className={`help-submit-forward-btn help-submit-query ${isForwarded ? 'forwarded' : ''}`}
                disabled={isForwarded}
              >
                <span className="help-submit-icon">
                  {isForwarded ? <CheckCircle2 size={18} /> : <Send size={18} />}
                </span>
                <span>{isForwarded ? 'Forwarding to WhatsApp...' : 'Forward Query to WhatsApp 💬'}</span>
              </button>

              <p className="help-privacy-note">
                🔒 Opens official WhatsApp chat (+91 {ADMIN_WHATSAPP}) with your inquiry pre-filled.
              </p>
            </form>
          )}

        </div>

        {/* Modal Footer Info */}
        <div className="help-modal-footer">
          <span className="help-footer-text">
            Mirror Solar Vision & Mirror Aqua • Official Help Desk (+91 {ADMIN_WHATSAPP})
          </span>
        </div>

      </div>
    </div>
  );
}

export default HelpSupportModal;
