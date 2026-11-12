import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, Crown, ScrollText, Shield } from 'lucide-react';

export const AboutPage: React.FC = () => {
  const [privacyOpen, setPrivacyOpen] = React.useState(false);
  const [termsOpen, setTermsOpen] = React.useState(false);

  return (
    <div className="flex-1 max-w-4xl mx-auto w-full px-4 py-6 sm:py-8 space-y-6 sm:space-y-8 select-none">
      {/* Header */}
      <div className="text-center space-y-1 sm:space-y-1.5">
        <div className="text-[#8C6D3B] text-xs sm:text-sm select-none">✦</div>
        <h1 className="font-cinzel text-xl sm:text-2xl font-bold tracking-[0.08em] text-[#1A1817] uppercase">
          About Parrot Cards
        </h1>
        <p className="text-[11px] sm:text-xs text-[#8C6D3B] font-medium tracking-wide max-w-xl mx-auto leading-relaxed">
          Sovereign Identity Reclamation System (52 Purushartha Cards + 3 Transcendent Master Keys)
        </p>
      </div>

      {/* Main Philosophy */}
      <div className="bg-[#FFFDF9]/95 backdrop-blur-sm border border-[#8C6D3B]/25 rounded-2xl p-4 sm:p-6 shadow-md space-y-3 text-[#1A1817]/85 leading-relaxed text-xs sm:text-[13px]">
        <p>
          At the exact moment of inception, the subtle human vessel carries a unique structural geometry of stars, grahas, and mathematical intersections. In ancient Indian Vedic tradition, Shuka (the sacred parrot)—son of Sage Vyasa—represents the ultimate ideal of conscious perception: an unblemished mirror reflecting the seeker's authentic cosmic signature with absolute clarity.
        </p>
        <p>
          <strong className="text-[#1A1817]">Parrot Cards</strong> translates this timeless wisdom into an architectural deck of exactly <strong>55 cards</strong> built upon the sacred Fibonacci sequence (1, 1, 2, 3, 5, 8, 13, 21, 34, 55): 52 actionable Purushartha cards across the four cardinal aims of life, plus the <strong className="text-[#1A1817]">Three Transcendent Master Keys (Tattva-Trimurti)</strong>.
        </p>
      </div>

      {/* The 4 Purusharthas Grid */}
      <div className="space-y-3">
        <h2 className="font-cinzel text-sm sm:text-base font-bold uppercase tracking-wider text-[#1A1817] text-center">
          The Four Suits &amp; Cardinal Aims of Life
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Dharma */}
          <div className="p-4 rounded-xl bg-[#FFFDF9] border border-[#2B2927]/25 shadow-sm space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="text-lg text-[#2B2927]">♠</span>
              <h3 className="font-cinzel text-xs sm:text-[13px] font-bold uppercase tracking-wider text-[#2B2927]">
                Dharma · Spades
              </h3>
            </div>
            <p className="text-[11px] sm:text-xs text-[#1A1817]/70 leading-relaxed">
              <strong className="text-[#1A1817]/90">Core Focus:</strong> Soul Purpose, Moral Authority, Right Action, Core Duty. 13 cards mapped to Janma Lagna, Varnada Lagnas, Sphutas, and Sovereign Grahas (Surya, Guru, Mangala).
            </p>
          </div>

          {/* Artha */}
          <div className="p-4 rounded-xl bg-[#FFFDF9] border border-[#7A1C1C]/25 shadow-sm space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="text-lg text-[#7A1C1C]">♦</span>
              <h3 className="font-cinzel text-xs sm:text-[13px] font-bold uppercase tracking-wider text-[#7A1C1C]">
                Artha · Diamonds
              </h3>
            </div>
            <p className="text-[11px] sm:text-xs text-[#1A1817]/70 leading-relaxed">
              <strong className="text-[#1A1817]/90">Core Focus:</strong> Sustenance, Physical Form, Material Stewardship, Compounding Enterprise. 13 cards mapped to Indu Lagna (The Vault), Hora Lagna, Sree Lagna, and Sovereign Grahas (Shani, Budha).
            </p>
          </div>

          {/* Kama */}
          <div className="p-4 rounded-xl bg-[#FFFDF9] border border-[#7A1C1C]/25 shadow-sm space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="text-lg text-[#7A1C1C]">♥</span>
              <h3 className="font-cinzel text-xs sm:text-[13px] font-bold uppercase tracking-wider text-[#7A1C1C]">
                Kama · Hearts
              </h3>
            </div>
            <p className="text-[11px] sm:text-xs text-[#1A1817]/70 leading-relaxed">
              <strong className="text-[#1A1817]/90">Core Focus:</strong> Desire, Deep Kinship, Aesthetic Refinement, Relational Mirroring. 13 cards mapped to Tithi Sphuta (The Lunar Tide), Kaala, and Sovereign Grahas (Chandra, Shukra, Rahu).
            </p>
          </div>

          {/* Moksha */}
          <div className="p-4 rounded-xl bg-[#FFFDF9] border border-[#2B2927]/25 shadow-sm space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="text-lg text-[#2B2927]">♣</span>
              <h3 className="font-cinzel text-xs sm:text-[13px] font-bold uppercase tracking-wider text-[#2B2927]">
                Moksha · Clubs
              </h3>
            </div>
            <p className="text-[11px] sm:text-xs text-[#1A1817]/70 leading-relaxed">
              <strong className="text-[#1A1817]/90">Core Focus:</strong> Karmic Resolution, Ego Dissolution, Shadow Purification, Ultimate Liberation. 13 cards mapped to Sacred Surrender, Gulika, Mandi, and Sovereign Grahas (Ketu, Kunda Sphuta).
            </p>
          </div>
        </div>
      </div>

      {/* The 3 Transcendent Master Keys */}
      <div className="p-4 sm:p-6 rounded-2xl bg-[#FFFDF9] border border-[#8C6D3B]/35 shadow-md space-y-3">
        <div className="flex items-center gap-2 text-[#8C6D3B]">
          <Crown className="w-4 h-4 sm:w-5 sm:h-5" />
          <h2 className="font-cinzel text-sm sm:text-base font-bold uppercase tracking-wider text-[#1A1817]">
            The Three Transcendent Master Keys (Tattva-Trimurti)
          </h2>
        </div>
        <p className="text-[11px] sm:text-xs text-[#1A1817]/75 leading-relaxed">
          Outside the four standard suits sit three master archetypes representing fundamental structural axes of consciousness:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs pt-1">
          <div className="p-3.5 rounded-xl bg-[#F8F4EC] border border-[#8C6D3B]/25 space-y-1">
            <span className="text-[#8C6D3B] font-bold font-cinzel text-xs uppercase tracking-wide">
              Key 0: Arudha Lagna (AL)
            </span>
            <p className="text-[#1A1817]/75 text-[11px] leading-relaxed">
              The Mirror of Maya · Field of Perception. Controls how consciousness reflects into the material world and visible reputation.
            </p>
          </div>
          <div className="p-3.5 rounded-xl bg-[#F8F4EC] border border-[#8C6D3B]/25 space-y-1">
            <span className="text-[#8C6D3B] font-bold font-cinzel text-xs uppercase tracking-wide">
              Key I: Bija Sphuta
            </span>
            <p className="text-[#1A1817]/75 text-[11px] leading-relaxed">
              The Solar Generative Fire · The Masculine Principle of Origin. The creative seed and active generative potency required to initiate form.
            </p>
          </div>
          <div className="p-3.5 rounded-xl bg-[#F8F4EC] border border-[#8C6D3B]/25 space-y-1">
            <span className="text-[#8C6D3B] font-bold font-cinzel text-xs uppercase tracking-wide">
              Key II: Kshetra Sphuta
            </span>
            <p className="text-[#1A1817]/75 text-[11px] leading-relaxed">
              The Lunar Receptive Soil · The Feminine Matrix of Gestation. Fertile grounding, receptivity, and the essential matrix of embodiment.
            </p>
          </div>
        </div>
      </div>

      {/* Privacy Policy */}
      <section className="overflow-hidden rounded-2xl border border-[#8C6D3B]/30 bg-[#FFFDF9] shadow-md">
        <h2>
          <button
            type="button"
            aria-expanded={privacyOpen}
            aria-controls="about-privacy-content"
            onClick={() => setPrivacyOpen((open) => !open)}
            className="flex min-h-14 w-full items-center justify-between gap-3 px-4 py-3 text-left sm:px-6"
          >
            <span className="flex min-w-0 items-center gap-2.5">
              <Shield aria-hidden="true" className="h-5 w-5 shrink-0 text-[#8C6D3B]" />
              <span className="font-cinzel text-sm font-bold uppercase tracking-wider text-[#1A1817] sm:text-base">
                Privacy Policy
              </span>
            </span>
            <ChevronDown
              aria-hidden="true"
              className={`h-5 w-5 shrink-0 text-[#8C6D3B] transition-transform duration-300 ${privacyOpen ? 'rotate-180' : ''}`}
            />
          </button>
        </h2>
        <div
          id="about-privacy-content"
          aria-hidden={!privacyOpen}
          className={`grid transition-[grid-template-rows] duration-300 ease-in-out ${privacyOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}
        >
          <div className="min-h-0 overflow-hidden">
            <div className="select-text space-y-4 border-t border-[#8C6D3B]/15 px-4 py-4 text-sm leading-relaxed text-[#1A1817]/80 sm:px-6 sm:py-5">
              <p>
                Parrot Cards uses information you provide to create and operate your account, calculate a personalized birth chart, and provide the related card experience. Please share only information you are comfortable submitting.
              </p>
              <div className="space-y-3">
                <div>
                  <h3 className="font-serif font-bold text-[#73582D]">Information collected and why</h3>
                  <p>
                    A birth profile may include your name, gender, date and time of birth, birthplace, and the location coordinates and timezone resolved for that place. These details are used to calculate astronomical placements and personalize the deck and interpretations. Account registration collects your name, email and password; passwords are stored as a hash. The site also uses browser storage for items such as authentication/guest-session identifiers and store preferences.
                  </p>
                </div>
                <div>
                  <h3 className="font-serif font-bold text-[#73582D]">Storage, use and service providers</h3>
                  <p>
                    Account, birth-profile, calculation, entitlement and transaction records are handled by the backend and stored in its configured MongoDB database. Place search uses OpenStreetMap Nominatim. Astronomy calculations may use the configured Jagannatha Hora service; personalized interpretations may be sent to Google Gemini when configured. Razorpay processes checkout and payment details. Those providers process information under their own terms and privacy notices. The website code does not store raw card numbers or banking passwords.
                  </p>
                </div>
                <div>
                  <h3 className="font-serif font-bold text-[#73582D]">Security and your choices</h3>
                  <p>
                    The implementation uses password hashing and authenticated API requests, but no online service can promise absolute security. You may request access to or correction of your account/profile information, or request account deletion through the account deletion API or by contacting us. Deletion may be subject to transaction, legal or operational retention requirements. The current profile screen does not provide a self-service data export.
                  </p>
                </div>
                <div className="rounded-xl border border-[#8C6D3B]/20 bg-[#F8F4EC] p-3">
                  <h3 className="font-serif font-bold text-[#73582D]">Privacy questions and requests</h3>
                  <p>
                    Contact us through the <Link to="/support" tabIndex={privacyOpen ? 0 : -1} className="font-semibold text-[#8C6D3B] underline underline-offset-2">Contact Us page</Link>. Its current form is not connected to a message service, so do not include sensitive information. Before launch, replace this notice with a monitored privacy contact: <strong>[Add monitored privacy email or contact method]</strong>.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Terms & Conditions */}
      <section className="overflow-hidden rounded-2xl border border-[#8C6D3B]/30 bg-[#FFFDF9] shadow-md">
        <h2>
          <button
            type="button"
            aria-expanded={termsOpen}
            aria-controls="about-terms-content"
            onClick={() => setTermsOpen((open) => !open)}
            className="flex min-h-14 w-full items-center justify-between gap-3 px-4 py-3 text-left sm:px-6"
          >
            <span className="flex min-w-0 items-center gap-2.5">
              <ScrollText aria-hidden="true" className="h-5 w-5 shrink-0 text-[#8C6D3B]" />
              <span className="font-cinzel text-sm font-bold uppercase tracking-wider text-[#1A1817] sm:text-base">
                Terms &amp; Conditions
              </span>
            </span>
            <ChevronDown
              aria-hidden="true"
              className={`h-5 w-5 shrink-0 text-[#8C6D3B] transition-transform duration-300 ${termsOpen ? 'rotate-180' : ''}`}
            />
          </button>
        </h2>
        <div
          id="about-terms-content"
          aria-hidden={!termsOpen}
          className={`grid transition-[grid-template-rows] duration-300 ease-in-out ${termsOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}
        >
          <div className="min-h-0 overflow-hidden">
            <div className="select-text space-y-4 border-t border-[#8C6D3B]/15 px-4 py-4 text-sm leading-relaxed text-[#1A1817]/80 sm:px-6 sm:py-5">
              <div>
                <h3 className="font-serif font-bold text-[#73582D]">Using the website and your account</h3>
                <p>
                  Use Parrot Cards lawfully and do not disrupt the service, attempt unauthorized access, or copy content in a way that infringes rights. Keep your sign-in details secure, provide accurate information when creating a profile, and use only information you have permission to submit.
                </p>
              </div>
              <div>
                <h3 className="font-serif font-bold text-[#73582D]">Nature and limits of the content</h3>
                <p>
                  Card readings and astrological or spiritual material are offered for reflection and informational purposes only. They are not medical, mental-health, legal, financial or other professional advice, and no outcome or accuracy is guaranteed. Make your own decisions and consult a qualified professional where appropriate.
                </p>
              </div>
              <div>
                <h3 className="font-serif font-bold text-[#73582D]">Prices, payments and digital access</h3>
                <p>
                  Prices shown in the store/checkout apply at the time of purchase. The current listed offers are ₹2 for an individual card unlock and ₹25 for a 30-day deck pass; confirm the displayed checkout price before paying. Payments are processed through Razorpay. An individual unlock grants access to that card, while a deck pass grants access for the stated 30-day period after payment verification. No published refund policy was found in the current site; do not assume a refund is guaranteed. For a payment issue, contact support with your transaction reference. <strong>[Publish a reviewed refund/cancellation policy and monitored contact before launch.]</strong>
                </p>
              </div>
              <div>
                <h3 className="font-serif font-bold text-[#73582D]">Content ownership and service availability</h3>
                <p>
                  Website design, card artwork, text and other original materials are owned by Parrot Cards or their respective rights holders. You may use the service for personal, non-commercial purposes; copying, redistributing or selling the materials commercially requires permission from the applicable rights holder. The service and content are provided as available, without a promise of uninterrupted operation. To the extent allowed by applicable law, Parrot Cards is not responsible for indirect losses arising from use of the service; this does not limit rights or liability that cannot lawfully be excluded.
                </p>
              </div>
              <div>
                <h3 className="font-serif font-bold text-[#73582D]">Changes and contact</h3>
                <p>
                  These terms may be updated as the service changes. Updated terms will be posted here with a revised date; continued use after an update takes effect constitutes acceptance where permitted by law.                   Questions can be raised through the <Link to="/support" tabIndex={termsOpen ? 0 : -1} className="font-semibold text-[#8C6D3B] underline underline-offset-2">Contact Us page</Link>, but its form is not currently connected to a message service. <strong>[Add a monitored legal contact and effective date before launch.]</strong>
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Enter Deck Action */}
      <div className="text-center pt-2">
        <Link
          to="/"
          className="inline-block py-2.5 px-7 rounded-xl bg-gradient-to-r from-[#9C7536] via-[#8C6D3B] to-[#7A5B2B] text-white font-cinzel font-bold text-xs uppercase tracking-wider shadow-md hover:brightness-105 active:scale-[0.99] transition-all cursor-pointer"
        >
          Enter Your Birth Sky
        </Link>
      </div>
    </div>
  );
};
