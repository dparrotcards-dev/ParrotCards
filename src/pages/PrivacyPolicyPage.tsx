import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Shield } from 'lucide-react';

export const PrivacyPolicyPage: React.FC = () => {
  return (
    <div className="flex-1 max-w-4xl mx-auto w-full px-4 py-8 space-y-8">
      <Link
        to="/"
        className="inline-flex items-center gap-1.5 text-xs text-[#8C6D3B] hover:text-[#1A1817] font-medium transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Return to Home</span>
      </Link>

      <div className="space-y-2">
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#1A1817]">Privacy Policy</h1>
        <p className="text-xs text-[#8C6D3B] font-mono">Last updated: October 2026</p>
      </div>

      <div className="bg-[#FFFDF9] border border-[#8C6D3B]/25 rounded-3xl p-6 sm:p-8 space-y-6 text-sm text-[#1A1817]/80 leading-relaxed shadow-xl">
        <section className="space-y-2">
          <h2 className="font-serif text-lg font-bold text-[#8C6D3B]">1. Sacred Birth Data Privacy</h2>
          <p>
            Parrot Cards respects the sanctity of your birth information. Your name, date of birth, time of birth, and birthplace are collected exclusively to calculate your astronomical planetary coordinates and generate your personalized 55-card deck. We do not sell, rent, or trade your personal data to any third-party advertisers.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-serif text-lg font-bold text-[#8C6D3B]">2. Astronomical Calculation Services</h2>
          <p>
            Birth coordinates and times are processed through verified calculation engines (such as Jagannatha Hora) solely for ephemeris mapping. Geocoding autocomplete queries use OpenStreetMap Nominatim under their public attribution policy.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-serif text-lg font-bold text-[#8C6D3B]">3. Payment Information</h2>
          <p>
            Payment transactions are processed directly by Razorpay using 256-bit encrypted channels. Parrot Cards never stores or accesses your raw debit/credit card numbers or banking passwords.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-serif text-lg font-bold text-[#8C6D3B]">4. Data Deletion</h2>
          <p>
            You may request complete deletion of your account and birth profiles at any time via your account settings page or by contacting support.
          </p>
        </section>
      </div>
    </div>
  );
};
