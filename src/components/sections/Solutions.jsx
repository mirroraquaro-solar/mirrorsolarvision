import React from 'react';

export default function Solutions() {
  const packages = [
    {
      category: 'Residential — Standard',
      title: '3kW On-Grid Solar System',
      desc: 'Ideal for 2BHK–3BHK households in AP running lights, fans, a refrigerator, a washing machine, and a single 1.5-ton inverter AC. Generates approximately 12–14 units per day, offsetting ₹2,500–₹4,000 of your monthly electricity bill. Eligible for the maximum PM Surya Ghar subsidy of ₹78,000.',
      specs: [
        { label: 'Structure', val: 'Hot Dip GI Structure' },
        { label: 'Hardware', val: 'Only SS Bolts & Nuts' },
        { label: 'Conduit', val: 'Heavy-Duty Blue PVC Water Pipe' },
      ],
      capacity: '3 kW',
      subsidy: '₹78,000',
      price: '₹2,10,000*',
      originalPrice: '₹2,35,000',
      cta: 'Get Custom Quote'
    },
    {
      category: 'Residential — Medium',
      title: '4kW On-Grid Solar System',
      desc: 'Ideal for 3BHK-4BHK homes. Power standard appliances like lights, fans, refrigerator, washing machine, and up to two 1.5-ton inverter ACs. Generates approximately 16–18 units per day. Eligible for the maximum PM Surya Ghar subsidy of ₹78,000.',
      specs: [
        { label: 'Structure', val: 'Hot Dip GI Structure' },
        { label: 'Hardware', val: 'Only SS Bolts & Nuts' },
        { label: 'Conduit', val: 'Heavy-Duty Blue PVC Water Pipe' },
      ],
      capacity: '4 kW',
      subsidy: '₹78,000',
      price: '₹2,70,000*',
      originalPrice: '₹2,95,000',
      cta: 'Get Custom Quote'
    },
    {
      category: 'Residential Plus — Best Value',
      title: '5kW On-Grid Solar System',
      desc: 'Designed for modern 3BHK–4BHK homes with multiple ACs, water heaters, water pumps, and heavy kitchen appliances. Generates approximately 20–24 units per day, potentially covering your entire monthly electricity consumption. Ideal for homes with monthly bills exceeding ₹5,000.',
      specs: [
        { label: 'Structure', val: 'Hot Dip GI Structure' },
        { label: 'Hardware', val: 'Only SS Bolts & Nuts' },
        { label: 'Conduit', val: 'Heavy-Duty Blue PVC Water Pipe' },
      ],
      capacity: '5 kW',
      subsidy: '₹78,000',
      price: '₹3,30,000*',
      originalPrice: '₹3,65,000',
      cta: 'Get Custom Quote'
    },
    {
      category: 'Commercial & Industrial',
      title: '10kW Commercial Solar System',
      desc: 'Engineered for offices, schools, clinics, hospitals, showrooms, and small warehouses across AP. Includes 3-phase high-efficiency string inverters, advanced monitoring systems, and structural engineering for flat concrete or metal sheet rooftops. Eligible for accelerated depreciation tax benefits.',
      specs: [
        { label: 'Structure', val: 'Hot Dip GI Structure' },
        { label: 'Hardware', val: 'Only SS Bolts & Nuts' },
        { label: 'Conduit', val: 'Heavy-Duty Blue PVC Water Pipe' },
      ],
      capacity: '10 kW',
      subsidy: '40% AD',
      price: '₹4,99,000*',
      originalPrice: '₹5,50,000',
      cta: 'Get Custom Layout'
    }
  ];

  return (
    <section className="section py-16 bg-white" id="solutions" aria-label="Rooftop solar installation packages for Andhra Pradesh homes and businesses">
      <div className="container-custom">
        <div className="text-center max-w-[800px] mx-auto mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-accent-500 bg-accent-500/10 px-3 py-1.5 rounded-full">Residential & Commercial Solar Packages</span>
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mt-4 mb-4">Rooftop Solar Solutions — Customized for Every Home & Business in AP</h2>
          <p className="text-base text-gray-600 leading-relaxed">Choose from our pre-engineered system capacities or request a custom design. Every package includes Tier-1 panels, high-efficiency inverters, galvanized mounting structures, complete wiring, DISCOM documentation, and PM Surya Ghar subsidy processing.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {packages.map((pkg, idx) => (
            <div key={idx} className="bg-white border border-gray-100 rounded-3xl p-6 shadow-md hover:shadow-xl transition-shadow duration-300 flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-bold text-accent-500 uppercase tracking-wider bg-accent-500/10 px-2.5 py-1 rounded-full">{pkg.category}</span>
                <h3 className="text-xl font-bold text-gray-900 mt-4 mb-3">{pkg.title}</h3>
                <p className="text-xs text-gray-500 leading-relaxed mb-4">{pkg.desc}</p>
                <ul className="text-xs text-gray-600 space-y-2 border-t border-gray-50 pt-4 mb-6 list-disc list-inside">
                  {pkg.specs.map((spec, sidx) => (
                    <li key={sidx}>
                      <strong className="text-gray-900">{spec.label}:</strong> {spec.val}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <div className="grid grid-cols-2 gap-4 border-t border-gray-50 pt-4 mb-4">
                  <div className="text-left">
                    <span className="text-[9px] font-bold text-gray-400 block uppercase tracking-wider">Capacity</span>
                    <strong className="text-gray-900 text-sm font-extrabold block">{pkg.capacity}</strong>
                  </div>
                  <div className="text-left">
                    <span className="text-[9px] font-bold text-gray-400 block uppercase tracking-wider">{pkg.subsidy.includes('%') ? 'Benefit' : 'Govt Subsidy'}</span>
                    <strong className="text-primary-500 text-sm font-extrabold block">{pkg.subsidy}</strong>
                  </div>
                </div>

                <div className="mb-4">
                  <span className="text-2xl font-black text-gray-900 mr-2">{pkg.price}</span>
                  <span className="text-xs text-gray-400 line-through">{pkg.originalPrice}</span>
                </div>

                <a href="#quote-form" className="w-full text-center block bg-primary-500 hover:bg-primary-600 text-white font-bold text-sm py-3 rounded-xl transition-colors">
                  {pkg.cta}
                </a>
                <p className="text-[10px] text-gray-400 text-center mt-2">*Price indicative. Varies by roof type and structure.</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
