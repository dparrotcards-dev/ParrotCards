import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  CheckCircle2,
  ChevronDown,
  List,
  Mail,
  PenLine,
  Phone,
  Send,
  User,
} from 'lucide-react';

export const SupportPage: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !phone.trim() || !subject || !message.trim()) return;

    setLoading(true);
    // Simulate brief network submission
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
      setName('');
      setEmail('');
      setPhone('');
      setSubject('');
      setMessage('');
    }, 600);
  };

  return (
    <div className="relative flex-1 flex flex-col items-center justify-center px-3 sm:px-4 py-1 sm:py-2 min-h-0 w-full my-auto select-none">
      <div className="relative z-10 w-full max-w-[700px] xl:max-w-[740px] my-auto">
        {/* Top: Return to Home */}
        <div className="mb-1 sm:mb-1.5 flex items-center justify-between">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs text-[#7A6242] hover:text-[#1A1817] font-medium transition-colors select-none"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Home</span>
          </Link>
        </div>

        {/* Heading & Subtitle */}
        <div className="text-center mb-1.5 sm:mb-2 space-y-0.5">
          <h1 className="font-cinzel text-xl sm:text-2xl font-bold tracking-[0.08em] text-[#1A1817] uppercase">
            Contact Us
          </h1>
          <p className="text-[11px] sm:text-xs text-[#6E6354] max-w-md mx-auto leading-tight">
            We&apos;re here to support your Parrot Cards journey. Reach out for questions, guidance, or technical assistance.
          </p>
        </div>

        {/* Contact Form Card */}
        <div className="relative rounded-2xl border border-[#D5C29D]/70 bg-[#FFFDF9]/95 backdrop-blur-md p-3.5 sm:p-4 md:p-5 shadow-[0_6px_24px_rgba(82,60,25,0.08)]">
          {/* Inner Hairline Framing */}
          <div className="absolute inset-1 rounded-xl border border-[#8C6D3B]/15 pointer-events-none" />

          {/* Card Header */}
          <div className="relative flex items-center gap-2 mb-2">
            <div className="flex items-center justify-center w-7 h-7 rounded-lg border border-[#D5C29D] bg-[#FBF7EE] text-[#8C6D3B] shrink-0">
              <Mail className="w-3.5 h-3.5 stroke-[1.8]" />
            </div>
            <div className="flex flex-col">
              <h2 className="font-cinzel text-xs sm:text-[13px] font-bold uppercase tracking-wider text-[#1A1817] leading-none">
                Send Us a Message
              </h2>
              <p className="text-[10.5px] sm:text-[11px] text-[#827565] leading-tight mt-0.5">
                Tell us how we can help you.
              </p>
            </div>
          </div>

          {/* Submission Feedback */}
          {submitted ? (
            <div className="relative p-4 sm:p-5 rounded-xl bg-[#F6FAF4] border border-[#A7D19B] text-center space-y-2">
              <div className="flex items-center justify-center w-10 h-10 mx-auto rounded-full bg-[#E5F3DF] text-[#3D7A2C]">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <h3 className="font-cinzel text-sm sm:text-base font-bold text-[#2A571E]">
                Message Sent Successfully
              </h3>
              <p className="text-xs text-[#52684B] max-w-md mx-auto leading-relaxed">
                Thank you for reaching out. Our support team will review your message and reply via email within 24 hours.
              </p>
              <button
                type="button"
                onClick={() => setSubmitted(false)}
                className="mt-1 inline-flex items-center gap-1.5 text-xs font-semibold text-[#8C6D3B] hover:text-[#5A4421] underline underline-offset-4 cursor-pointer"
              >
                Send another message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="relative space-y-2 sm:space-y-2.5">
              {/* Row 1: Full Name & Email Address */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                {/* Full Name */}
                <div>
                  <label className="block text-[11px] font-semibold text-[#1A1817] mb-0.5">
                    Full Name <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#A89A88] pointer-events-none" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Enter your name"
                      className="w-full h-8 sm:h-9 pl-9 pr-3 rounded-lg border border-[#DCD3C5] bg-[#FFFDF9] text-xs text-[#1A1817] placeholder:text-[#AAA092] outline-none transition-colors focus:border-[#8C6D3B] focus:ring-1 focus:ring-[#8C6D3B]/25"
                    />
                  </div>
                </div>

                {/* Email Address */}
                <div>
                  <label className="block text-[11px] font-semibold text-[#1A1817] mb-0.5">
                    Email Address <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#A89A88] pointer-events-none" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email"
                      className="w-full h-8 sm:h-9 pl-9 pr-3 rounded-lg border border-[#DCD3C5] bg-[#FFFDF9] text-xs text-[#1A1817] placeholder:text-[#AAA092] outline-none transition-colors focus:border-[#8C6D3B] focus:ring-1 focus:ring-[#8C6D3B]/25"
                    />
                  </div>
                </div>
              </div>

              {/* Row 2: Mobile Number & Subject */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                {/* Mobile Number */}
                <div>
                  <label className="block text-[11px] font-semibold text-[#1A1817] mb-0.5">
                    Mobile Number <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#A89A88] pointer-events-none" />
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="Enter mobile number"
                      className="w-full h-8 sm:h-9 pl-9 pr-3 rounded-lg border border-[#DCD3C5] bg-[#FFFDF9] text-xs text-[#1A1817] placeholder:text-[#AAA092] outline-none transition-colors focus:border-[#8C6D3B] focus:ring-1 focus:ring-[#8C6D3B]/25"
                    />
                  </div>
                </div>

                {/* Subject */}
                <div>
                  <label className="block text-[11px] font-semibold text-[#1A1817] mb-0.5">
                    Subject <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <List className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#A89A88] pointer-events-none" />
                    <select
                      required
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      className="w-full h-8 sm:h-9 pl-9 pr-8 rounded-lg border border-[#DCD3C5] bg-[#FFFDF9] text-xs text-[#1A1817] outline-none transition-colors focus:border-[#8C6D3B] focus:ring-1 focus:ring-[#8C6D3B]/25 appearance-none cursor-pointer"
                    >
                      <option value="" disabled>Select a subject</option>
                      <option value="general">General Inquiry</option>
                      <option value="astronomy">Astronomical Sky Calculations &amp; Lagna</option>
                      <option value="deck">Deck &amp; Card Interpretations</option>
                      <option value="store">Cosmic Store Order &amp; Products</option>
                      <option value="payments">30-Day Deck Pass &amp; Payments</option>
                      <option value="technical">Technical Support</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#A89A88] pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* Row 3: Message */}
              <div>
                <label className="block text-[11px] font-semibold text-[#1A1817] mb-0.5">
                  Message <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <PenLine className="absolute left-3 top-2.5 w-3.5 h-3.5 text-[#A89A88] pointer-events-none" />
                  <textarea
                    required
                    rows={3}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Write your message here..."
                    className="w-full pl-9 pr-3 py-2 rounded-lg border border-[#DCD3C5] bg-[#FFFDF9] text-xs text-[#1A1817] placeholder:text-[#AAA092] outline-none transition-colors focus:border-[#8C6D3B] focus:ring-1 focus:ring-[#8C6D3B]/25 resize-none leading-relaxed h-[62px] sm:h-[68px]"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full h-9 sm:h-9.5 mt-1 flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-[#9C7536] via-[#8C6D3B] to-[#7A5B2B] hover:brightness-105 active:scale-[0.99] text-white font-cinzel text-xs font-bold uppercase tracking-wider shadow-[0_3px_12px_rgba(140,109,59,0.22)] transition-all disabled:opacity-60 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{loading ? 'Sending Message...' : 'Send Message'}</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
