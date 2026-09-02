import React from 'react';
import { ExternalLink, Briefcase, Zap, ShieldCheck, ArrowRight } from 'lucide-react';

export default function PartnerRegistration({ onBack }) {
  return (
    <div className="min-h-screen bg-gray-50 pt-[125px] pb-20 px-4 sm:px-8">
      <div className="max-w-4xl mx-auto">
        
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-6 tracking-tight">
            Partner with <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-primary-800">Mirror Solar</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            A wonderful opportunity for Dealers and Technicians to join the clean energy revolution. Partner with us and grow your business with industry-leading solar solutions.
          </p>
        </div>

        {/* CTA Section (Moved to top) */}
        <div className="bg-gradient-to-br from-primary-900 to-gray-900 rounded-[2.5rem] p-10 md:p-16 text-center shadow-xl relative overflow-hidden mb-16">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500 opacity-20 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/3"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent-500 opacity-20 rounded-full blur-[80px] translate-y-1/3 -translate-x-1/3"></div>
          
          <div className="relative z-10">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Ready to get started?</h2>
            <p className="text-primary-100 mb-8 max-w-xl mx-auto text-lg">
              Please fill out our official registration form. Our team will review your application and get back to you within 24-48 hours.
            </p>
            
            <a 
              href="https://forms.gle/GHovHk3EcTrrfM7r6" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 bg-white hover:bg-gray-50 text-primary-900 font-extrabold text-lg px-8 py-4 rounded-full shadow-lg transition-all duration-300 transform hover:-translate-y-1"
            >
              Continue to Google Form
              <ExternalLink size={20} className="text-primary-500" />
            </a>
          </div>
        </div>

        {/* Benefits Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="w-14 h-14 bg-primary-50 rounded-2xl flex items-center justify-center mb-6">
              <Briefcase className="text-primary-600 w-7 h-7" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Grow Your Business</h3>
            <p className="text-gray-600 leading-relaxed">
              Access new customer leads and expand your service offerings with our high-quality solar products.
            </p>
          </div>

          <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="w-14 h-14 bg-accent-50 rounded-2xl flex items-center justify-center mb-6">
              <Zap className="text-accent-500 w-7 h-7" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Premium Products</h3>
            <p className="text-gray-600 leading-relaxed">
              Work with top-tier solar panels, inverters, and mounting structures that guarantee long-lasting performance.
            </p>
          </div>

          <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="w-14 h-14 bg-green-50 rounded-2xl flex items-center justify-center mb-6">
              <ShieldCheck className="text-green-600 w-7 h-7" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Dedicated Support</h3>
            <p className="text-gray-600 leading-relaxed">
              Get priority technical support, training materials, and direct assistance from our expert engineering team.
            </p>
          </div>
        </div>



        {/* Back Button */}
        <div className="mt-12 text-center">
          <button 
            onClick={onBack}
            className="inline-flex items-center gap-2 text-gray-500 hover:text-primary-600 font-semibold transition-colors"
          >
            <ArrowRight size={18} className="rotate-180" />
            Back to Home
          </button>
        </div>

      </div>
    </div>
  );
}
