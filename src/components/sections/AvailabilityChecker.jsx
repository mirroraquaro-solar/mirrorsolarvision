import React, { useState } from 'react';

export default function AvailabilityChecker() {
  const districts = [
    { name: "Alluri Sitharama Raju" },
    { name: "Anakapalli" },
    { name: "Anantapur" },
    { name: "Annamayya" },
    { name: "Bapatla" },
    { name: "Chittoor" },
    { name: "Dr. B.R. Ambedkar Konaseema (Amalapuram)", value: "Dr. B.R. Ambedkar Konaseema" },
    { name: "Eluru" },
    { name: "Guntur" },
    { name: "Kakinada" },
    { name: "Kurnool" },
    { name: "NTR" },
    { name: "Nandyal" },
    { name: "Parvathipuram Manyam" },
    { name: "Prakasam" },
    { name: "Sri Potti Sriramulu Nellore" },
    { name: "Sri Sathya Sai" },
    { name: "Srikakulam" },
    { name: "Tirupati" },
    { name: "Visakhapatnam" },
    { name: "Vizianagaram" },
    { name: "West Godavari" },
    { name: "Y.S.R. Kadapa" },
    { name: "East Godavari (Rajahmundry)", value: "East Godavari" },
    { name: "Krishna" },
    { name: "Palnadu" }
  ];

  const [selectedDistrict, setSelectedDistrict] = useState('');

  return (
    <section className="section py-16 bg-white" id="availability-checker" aria-label="Check if Mirror Solar Vision serves your district in Andhra Pradesh">
      <div className="container-custom">
        <div className="text-center max-w-[800px] mx-auto mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-accent-500 bg-accent-500/10 px-3 py-1.5 rounded-full">All 26 Districts of AP Covered</span>
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mt-4 mb-4">Check Solar Installation Availability in Your District</h2>
          <p className="text-base text-gray-600 leading-relaxed">Mirror Solar Vision provides rooftop solar installation, PM Surya Ghar subsidy processing, and net metering services across every district in Andhra Pradesh. Select your district below to confirm service availability and estimated timeline.</p>
        </div>

        <div className="bg-gray-50 border border-gray-100 shadow-xl rounded-3xl p-8 max-w-[600px] mx-auto text-center">
          <div className="mb-6">
            <label htmlFor="district-selector" className="block text-sm font-bold text-gray-700 mb-2">Select Your District:</label>
            <select 
              id="district-selector" 
              className="w-full max-w-[400px] mx-auto bg-white border border-gray-200 text-gray-800 px-4 py-3 rounded-xl focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
            >
              <option value="">-- Select Andhra Pradesh District --</option>
              {districts.map((dist, idx) => (
                <option key={idx} value={dist.value || dist.name}>
                  {dist.name}
                </option>
              ))}
            </select>
          </div>

          {/* Feedback result card */}
          {selectedDistrict && (
            <div className="mt-6 p-4 rounded-xl bg-green-50 border border-green-200 text-green-800 text-sm font-semibold max-w-[450px] mx-auto animate-fade-in-up">
              <span>✅ Mirror Solar Vision serves {selectedDistrict}. Estimated site survey schedule: Within 24-48 hours. Government PM Surya Ghar subsidy registration is active.</span>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
