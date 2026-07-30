import React from 'react';

export default function AboutGroup() {
  return (
    <section className="section py-16 bg-gray-50 border-t border-gray-100 scroll-mt-20" id="about" aria-label="About Mirror Group and Mirror Aqua legacy behind Mirror Solar Vision">
      <div className="container-custom">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Text */}
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-primary-500 bg-primary-50 px-3 py-1.5 rounded-full">The Heritage Behind Our Solar Expertise</span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mt-4 mb-4">Powered by Mirror Aqua — Nearly 20 Years of Service Excellence in AP</h2>
            <p className="text-[15px] text-gray-600 leading-relaxed mb-4">
              Mirror Solar Vision is not a startup. We are the solar energy division of the <strong className="text-gray-950">Mirror Group</strong> — the same organization behind <strong className="text-gray-950">Mirror Aqua</strong>, Andhra Pradesh's trusted name in water purification for nearly two decades.
            </p>
            <p className="text-[15px] text-gray-600 leading-relaxed mb-4">
              Since its founding, Mirror Aqua has served lakhs of families across AP with premium water purifiers, RO membranes, sediment filters, and reliable after-sales service. Our customers trust us because we show up. We service. We stand behind what we sell — not for months, but for years.
            </p>
            <p className="text-[15px] text-gray-600 leading-relaxed mb-6">
              We brought that identical DNA — technical expertise, zero-compromise components, responsive customer support, and long-term accountability — to the solar energy sector under <strong className="text-gray-950">Mirror Solar Vision</strong>. When you invest in a solar plant from us, you're not buying from an unknown entity. You're investing in a relationship backed by decades of proven service heritage across your state.
            </p>
            <div className="flex gap-4">
              <div className="bg-white p-4 rounded-xl border border-gray-100 flex-1 text-center shadow-sm">
                <h4 className="text-xl font-bold text-primary-500 mb-1">~20 Years</h4>
                <p className="text-[10px] text-gray-500 uppercase font-semibold">Water Purification Legacy</p>
              </div>
              <div className="bg-white p-4 rounded-xl border border-gray-100 flex-1 text-center shadow-sm">
                <h4 className="text-xl font-bold text-accent-500 mb-1">Lakhs+</h4>
                <p className="text-[10px] text-gray-500 uppercase font-semibold">Families Served in AP</p>
              </div>
              <div className="bg-white p-4 rounded-xl border border-gray-100 flex-1 text-center shadow-sm">
                <h4 className="text-xl font-bold text-primary-500 mb-1">26</h4>
                <p className="text-[10px] text-gray-500 uppercase font-semibold">AP Districts Covered</p>
              </div>
            </div>
          </div>

          {/* Graphic representing legacy - Hidden on mobile view */}
          <div className="hidden lg:block">
            <div className="bg-gradient-to-br from-primary-600 to-primary-800 rounded-3xl p-8 text-white relative overflow-hidden shadow-xl">
              <div className="absolute -top-5 -right-5 w-24 h-24 bg-white/5 rounded-full"></div>
              <h3 className="text-xl md:text-2xl font-bold text-white mb-4">From Water to Solar — The Mirror Group Journey</h3>
              <p className="text-sm text-white/80 leading-relaxed mb-4">
                Mirror Aqua built its reputation on zero-compromise spare parts, reliable RO membranes, and high-quality sediment filters. That exact engineering discipline and quality assurance philosophy now drives every solar installation we deliver.
              </p>
              <p className="text-sm text-white/80 leading-relaxed mb-6">
                Our solar panels, inverters, and mounting structures undergo the same rigorous vendor qualification and quality inspection process that made Mirror Aqua the preferred water purification brand in AP.
              </p>
              <div className="border-t border-white/10 pt-4 flex justify-between items-center">
                <span className="text-[10px] font-bold tracking-widest text-accent-500 uppercase">ISO 9001:2015 QUALITY MANAGEMENT</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
