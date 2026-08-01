import React from 'react';
import { MapPin } from 'lucide-react';

const dealers = [
  { name: 'Venkata Rama Reddy', area: 'Chintalapudi' },
  { name: 'Vijay Kumar', area: 'Kakinada' },
  { name: 'Ramesh', area: 'Narsapuram' },
  { name: 'Kishore', area: 'Hanuman Junction' },
  { name: 'Sharfie', area: 'Vijayawada' },
  { name: 'Prathap', area: 'Tadepalligudem' },
  { name: 'Sudharashan', area: 'Jangareddygudem' },
  { name: 'Durga Rao', area: 'Nidamarru' },
  { name: 'Hemasundhar', area: 'Dwaraka Tirumala' },
  { name: 'Sai Kumar', area: 'Eluru' },
  { name: 'Prasad', area: 'Dobicharla' },
  { name: 'Varun', area: 'Visakhapatnam' },
  { name: 'Kondalarao', area: 'Vangaiagudem' },
  { name: 'Sankar', area: 'Amalapuram' },
  { name: 'Valli', area: 'Nallacharla' },
  { name: 'Vijay', area: 'Hanuman Junction' },
  { name: 'Srinivas', area: 'Polavaram' },
  { name: 'Mahesh', area: 'Anakapalli' },
  { name: 'Siva', area: 'Rajahmundry' },
];

export default function AuthorizedDealers() {
  return (
    <section className="py-10 bg-[#FFF8ED] border-b border-orange-100 overflow-hidden" aria-label="Authorized Dealers">
      <div className="container-custom mb-6 text-center">
        <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 font-heading">
          Authorized Dealers <span className="text-accent-500">all over AP</span>
        </h2>
        <p className="text-sm text-slate-500 mt-2">
          We partner with ambitious teams to deliver exceptional solar solutions.
        </p>
      </div>

      <div className="relative w-full flex overflow-hidden">
        {/* Fading Edges */}
        <div className="absolute inset-y-0 left-0 w-16 md:w-32 bg-gradient-to-r from-[#FFF8ED] to-transparent z-10"></div>
        <div className="absolute inset-y-0 right-0 w-16 md:w-32 bg-gradient-to-l from-[#FFF8ED] to-transparent z-10"></div>

        {/* Marquee Track */}
        <div className="flex animate-marquee hover:[animation-play-state:paused] gap-4 w-max px-4">
          {/* Duplicate list to create infinite loop effect */}
          {[...dealers, ...dealers].map((dealer, idx) => (
            <div 
              key={idx} 
              className="bg-white border border-slate-100 shadow-sm rounded-2xl p-4 min-w-[220px] flex flex-col items-center justify-center text-center transition-transform hover:-translate-y-1 hover:shadow-md cursor-default"
            >
              <h3 className="font-bold text-slate-800 text-sm md:text-base mb-1">{dealer.name}</h3>
              <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500 bg-slate-50 px-3 py-1 rounded-full">
                <MapPin size={12} className="text-accent-500" />
                <span>{dealer.area}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
