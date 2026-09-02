import React from 'react';
import { MapPin } from 'lucide-react';

const dealers = [
  { name: 'Venkata Rama Reddy', area: 'Chintalapudi' },
  { name: 'Vijay Kumar', area: 'Kakinada' },
  { name: 'Varun', area: 'Visakhapatnam' },
  { name: 'Sharfie', area: 'Vijayawada' },
  { name: 'Phani Kumar', area: 'Guntur' },
  { name: 'Siva', area: 'Rajahmundry' },
  { name: 'Ramesh', area: 'Narsapuram' },
  { name: 'Hemasundhar', area: 'Tirupati' },
  { name: 'Sudhakar', area: 'Nellore' },
  { name: 'Raghava Reddy', area: 'Kurnool' },
  { name: 'Obul Reddy', area: 'Kadapa (YSR)' },
  { name: 'Narasimha Rao', area: 'Anantapur' },
  { name: 'Sai Kumar', area: 'Eluru' },
  { name: 'Srinivasa Rao', area: 'Ongole (Prakasam)' },
  { name: 'Jagannadha Rao', area: 'Srikakulam' },
  { name: 'Satyanarayana', area: 'Vizianagaram' },
  { name: 'Murali Krishna', area: 'Machilipatnam' },
  { name: 'Ramakrishna', area: 'Bhimavaram' },
  { name: 'Prathap', area: 'Tadepalligudem' },
  { name: 'Venkateswara Rao', area: 'Tenali' },
  { name: 'Chenna Reddy', area: 'Proddatur' },
  { name: 'Gangadhar', area: 'Hindupur' },
  { name: 'Sambasiva Rao', area: 'Narasaraopet (Palnadu)' },
  { name: 'Subba Reddy', area: 'Nandyal' },
  { name: 'Purushotham', area: 'Chittoor' },
  { name: 'Sankar', area: 'Amalapuram (Konaseema)' },
  { name: 'Mahesh', area: 'Anakapalli' },
  { name: 'Bhaskar Naidu', area: 'Madanapalle' },
  { name: 'Venkat', area: 'Dharmavaram' },
  { name: 'Nageswara Rao', area: 'Gudivada' },
  { name: 'Koteswara Rao', area: 'Chirala (Bapatla)' },
  { name: 'Suryanarayana', area: 'Kovvur' },
  { name: 'Sudharashan', area: 'Jangareddygudem' },
  { name: 'Srinivas', area: 'Polavaram' },
  { name: 'Kishore', area: 'Hanuman Junction' },
  { name: 'Valli', area: 'Nallajarla' },
  { name: 'Kondalarao', area: 'Vangaiagudem' },
  { name: 'Durga Rao', area: 'Nidamarru' },
  { name: 'Prasad', area: 'Dobicharla' },
  { name: 'Satish Kumar', area: 'Palakollu' },
  { name: 'Radhakrishna', area: 'Tanuku' },
  { name: 'Brahmaiah', area: 'Markapur' },
  { name: 'Anjaneyulu', area: 'Sattenapalle' },
  { name: 'Chaitanya', area: 'Mangalagiri' },
  { name: 'Apparao', area: 'Tuni' },
  { name: 'Trinadh', area: 'Parvathipuram' },
  { name: 'Jayaram Reddy', area: 'Rayachoti (Annamayya)' },
  { name: 'Mallikarjuna', area: 'Adoni' },
  { name: 'Anand Kumar', area: 'Puttaparthi (Sri Sathya Sai)' }
];

export default function AuthorizedDealers() {
  return (
    <section className="py-10 bg-[#FFF8ED] border-b border-orange-100 overflow-hidden" aria-label="Authorized Dealers across Andhra Pradesh">
      <div className="container-custom mb-6 text-center">
        <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 font-heading">
          Authorized Dealers <span className="text-accent-500">all over AP</span>
        </h2>
        <p className="text-sm text-slate-500 mt-2">
          Strong network of certified solar installation & dealership partners across all 26 districts of Andhra Pradesh.
        </p>
      </div>

      <div className="relative w-full flex overflow-hidden">
        {/* Fading Edges */}
        <div className="absolute inset-y-0 left-0 w-16 md:w-32 bg-gradient-to-r from-[#FFF8ED] to-transparent z-10 pointer-events-none"></div>
        <div className="absolute inset-y-0 right-0 w-16 md:w-32 bg-gradient-to-l from-[#FFF8ED] to-transparent z-10 pointer-events-none"></div>

        {/* Marquee Track */}
        <div className="flex animate-marquee hover:[animation-play-state:paused] gap-4 w-max px-4">
          {/* Duplicate list to create infinite seamless loop effect */}
          {[...dealers, ...dealers].map((dealer, idx) => (
            <div 
              key={idx} 
              className="bg-white border border-slate-100 shadow-sm rounded-2xl p-4 min-w-[220px] flex flex-col items-center justify-center text-center transition-transform hover:-translate-y-1 hover:shadow-md cursor-default"
            >
              <h3 className="font-bold text-slate-800 text-sm md:text-base mb-1">{dealer.name}</h3>
              <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500 bg-slate-50 px-3 py-1 rounded-full">
                <MapPin size={12} className="text-accent-500 shrink-0" />
                <span className="truncate">{dealer.area}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
