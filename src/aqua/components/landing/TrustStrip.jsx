import React from 'react';
import { Filter, Layers, CheckCircle2, ShieldCheck } from 'lucide-react';
import './ProductLanding.css';

export function TrustStrip() {
  const pillars = [
    {
      icon: <Filter size={24} className="pillar-icon" />,
      title: '5 MICRON RATING',
      desc: 'Fine depth particulate filtration'
    },
    {
      icon: <Layers size={24} className="pillar-icon" />,
      title: '120g VIRGIN PP',
      desc: 'Melt-blown heavy density fiber'
    },
    {
      icon: <CheckCircle2 size={24} className="pillar-icon" />,
      title: '10 INCH SIZE',
      desc: 'Universal standard bowl fit'
    },
    {
      icon: <ShieldCheck size={24} className="pillar-icon" />,
      title: 'MADE IN INDIA',
      desc: 'Mirror Aqua quality assurance'
    }
  ];

  return (
    <section className="trust-strip-section" aria-label="Product Features">
      <div className="container">
        <div className="trust-strip-grid">
          {pillars.map((pillar, idx) => (
            <div key={idx} className="trust-pillar-card">
              <div className="pillar-icon-box">{pillar.icon}</div>
              <div className="pillar-text">
                <strong className="pillar-title">{pillar.title}</strong>
                <span className="pillar-desc">{pillar.desc}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
