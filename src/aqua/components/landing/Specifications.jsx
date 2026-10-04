import React from 'react';
import { Table, ShieldCheck, CheckCircle2, Gift } from 'lucide-react';
import './ProductLanding.css';

export function Specifications({ specifications = {} }) {
  const specList = [
    specifications.brand && { label: 'Brand', value: specifications.brand },
    specifications.filterSize && { label: 'Filter Size', value: specifications.filterSize },
    specifications.micronRating && { label: 'Micron Rating', value: specifications.micronRating },
    specifications.weight && { label: 'Weight', value: specifications.weight },
    specifications.material && { label: 'Material', value: specifications.material },
    specifications.offer && { label: 'Offer', value: specifications.offer, highlight: true },
    specifications.freeGift && { label: 'Included Free Tool', value: specifications.freeGift, highlight: true },
    specifications.filtrationReduction && { label: 'Filtration Target', value: specifications.filtrationReduction },
    specifications.suitability && { label: 'Suitability', value: specifications.suitability },
    specifications.compatibility && { label: 'Housing Compatibility', value: specifications.compatibility },
    specifications.filterType && !specifications.filterSize && { label: 'Filter Type', value: specifications.filterType },
    specifications.nominalLength && !specifications.filterSize && { label: 'Nominal Length', value: specifications.nominalLength },
    specifications.outerDiameter && { label: 'Outer Diameter', value: specifications.outerDiameter },
    specifications.innerCoreDiameter && { label: 'Inner Core Diameter', value: specifications.innerCoreDiameter },
    specifications.countryOfOrigin && { label: 'Country of Origin', value: specifications.countryOfOrigin }
  ].filter(Boolean);

  return (
    <section className="specifications-section" id="specifications">
      <div className="container">
        <div className="section-header text-center">
          <span className="section-eyebrow">TECHNICAL DATA</span>
          <h2 className="section-title">
            Product Specifications
          </h2>
          <p className="section-subtitle">
            Engineered to standard industrial dimensions for universal compatibility across Indian water purifiers.
          </p>
        </div>

        <div className="spec-table-container">
          <table className="technical-spec-table">
            <thead>
              <tr>
                <th scope="col">Specification Parameter</th>
                <th scope="col">Technical Value</th>
              </tr>
            </thead>
            <tbody>
              {specList.map((spec, idx) => (
                <tr key={idx} className={spec.highlight ? 'bg-cyan-950/20' : ''}>
                  <td className="spec-label-col font-bold">
                    <div className="flex items-center gap-1.5">
                      {spec.highlight && <Gift size={14} className="text-amber-500 shrink-0" />}
                      <span>{spec.label}</span>
                    </div>
                  </td>
                  <td className={`spec-value-col ${spec.highlight ? 'text-cyan-700 font-extrabold' : ''}`}>
                    {spec.value}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

