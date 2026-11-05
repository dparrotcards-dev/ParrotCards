import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, MessageSquare, HelpCircle, CheckCircle2 } from 'lucide-react';

export const SupportPage: React.FC = () => {
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [message, setMessage] = useState<string>('');

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    setSubmitted(true);
    setMessage('');
  };

  const faqs = [
    {
      q: 'How does Parrot Cards calculate my deck?',
      a: 'We use verified astronomical ephemeris calculations (matching Jagannatha Hora) to determine your exact rising sign (Lagna), planetary degrees, 27 nakshatras, special lagnas, sensitive sphutas, and upagrahas based on your birthplace coordinates and UTC birth time.',
    },
    {
      q: 'Why are the first three cards free?',
      a: 'Lagna (Ascendant), Sun (Atma), and Moon (Manas) form the three foundational pillars of Indian astrology. Everyone receives full, permanent free access to these three core pillars.',
    },
    {
      q: 'How does the 30-day Deck Pass work?',
      a: 'The ₹25 Deck Pass grants 30 days of full, unrestricted access to all 55 cards, the 3 Master Keys, and Gemini AI deep interpretations across all devices when signed in.',
    },
    {
      q: 'What is the Sovereign Avatar Phrase?',
      a: 'Your Sovereign Avatar is derived from your Atma Karaka—the planet holding the highest degree in your chart, representing your soul’s primary lessons and royalty in this lifetime.',
    },
  ];

  return (
    <div className="flex-1 max-w-4xl mx-auto w-full px-4 py-8 space-y-12">
      <Link
        to="/"
        className="inline-flex items-center gap-1.5 text-xs text-[#8C6D3B] hover:text-[#1A1817] font-medium transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Return to Home</span>
      </Link>

      <div className="text-center space-y-2">
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#1A1817]">Support & Knowledge</h1>
        <p className="text-xs text-[#8C6D3B] max-w-md mx-auto font-medium">
          Common questions about your astronomical sky calculation and customer assistance.
        </p>
      </div>

      {/* FAQ Accordion */}
      <div className="space-y-4">
        <h2 className="font-serif text-xl font-bold text-[#1A1817] flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-[#8C6D3B]" />
          <span>Frequently Asked Questions</span>
        </h2>
        <div className="space-y-3">
          {faqs.map((f, i) => (
            <div
              key={i}
              className="p-5 rounded-2xl bg-[#FFFDF9] border border-[#8C6D3B]/25 shadow-sm space-y-2"
            >
              <h3 className="font-serif text-base font-bold text-[#1A1817]">{f.q}</h3>
              <p className="text-xs text-[#1A1817]/70 leading-relaxed">{f.a}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Contact Form */}
      <div className="bg-[#FFFDF9] border border-[#8C6D3B]/25 rounded-3xl p-6 sm:p-8 space-y-4 shadow-xl">
        <h2 className="font-serif text-xl font-bold text-[#1A1817] flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-[#8C6D3B]" />
          <span>Need Assistance?</span>
        </h2>
        <p className="text-xs text-[#1A1817]/70">
          Have an inquiry about a payment, location lookup, or ephemeris calculation? Send us a message:
        </p>

        {submitted ? (
          <div className="p-4 rounded-2xl bg-emerald-100 border border-emerald-400 text-xs text-emerald-900 flex items-center gap-2 font-medium">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            <span>Thank you for your message. Our assistance team will respond promptly.</span>
          </div>
        ) : (
          <form onSubmit={handleSend} className="space-y-3">
            <textarea
              required
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Describe your inquiry or question here…"
              className="w-full px-4 py-3 rounded-2xl bg-[#F2ECE1]/50 border border-[#8C6D3B]/30 text-[#1A1817] placeholder-[#8C6D3B]/50 focus:outline-none focus:border-[#8C6D3B] focus:bg-[#FFFDF9] text-xs leading-relaxed"
            />
            <button
              type="submit"
              className="py-3 px-6 rounded-xl bg-gradient-to-r from-[#8C6D3B] to-[#71562B] text-[#FFFDF9] font-bold text-xs uppercase tracking-wider hover:brightness-105 shadow-md transition-all"
            >
              Send Inquiry
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
