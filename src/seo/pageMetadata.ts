export interface PageSeo {
  title: string;
  description: string;
  indexable: boolean;
}

export const SITE_URL = 'https://kp52.in';
export const SOCIAL_IMAGE = `${SITE_URL}/store_hero_parrot.jpg`;

export const PAGE_SEO: Record<string, PageSeo> = {
  '/': {
    title: 'Parrot Cards | Discover Your Birth-Sky Card Deck',
    description:
      'Discover Parrot Cards: a personal 55-card journey inspired by your birth sky, Vedic astrology and the four Purusharthas. Begin your reflective card experience.',
    indexable: true,
  },
  '/birth-details': {
    title: 'Create Your Birth-Sky Deck | Parrot Cards',
    description: 'Enter your birth details to create a personalized Parrot Cards deck.',
    indexable: false,
  },
  '/about': {
    title: 'About Parrot Cards | The 55-Card Cosmic Deck',
    description:
      'Learn how Parrot Cards turns Vedic astronomical placements into a personalized 55-card deck for reflection, self-inquiry and exploring the four Purusharthas.',
    indexable: true,
  },
  '/daily-rituals': {
    title: 'Resonance Daily Session | Parrot Cards',
    description:
      'Listen to the daily Resonance session and follow a calming Shadow Discharge visual synchronized to the recording.',
    indexable: true,
  },
  '/admin/daily-recordings': {
    title: 'Daily Recordings Admin | Parrot Cards',
    description: 'Upload and publish the daily Resonance recordings.',
    indexable: false,
  },
  '/cosmic-store': {
    title: 'Astrology & Spiritual Products | Parrot Cards Store',
    description:
      'Browse astrology and spiritual products in the Parrot Cards Cosmic Store, including available accessories, books and other listed items.',
    indexable: true,
  },
  '/pricing': {
    title: 'Parrot Cards Pricing | Free Cards and Deck Access',
    description:
      'Compare Parrot Cards access options: explore three free cards, individual card unlocks and the 30-day personalized deck pass.',
    indexable: true,
  },
  '/support': {
    title: 'Contact Parrot Cards | Customer Support',
    description:
      'Contact Parrot Cards for help with your personalized astrology card deck, account, store orders, payments or technical questions.',
    indexable: true,
  },
  '/privacy': {
    title: 'Privacy Policy | Parrot Cards',
    description:
      'Read how Parrot Cards handles account details, birth profile information, astronomical calculations and payment processing.',
    indexable: true,
  },
  '/terms': {
    title: 'Terms of Service | Parrot Cards',
    description:
      'Review the terms for using Parrot Cards, including digital deck access, paid features, permitted use and the reflective nature of its content.',
    indexable: true,
  },
  '/deck': {
    title: 'Your Personalized Cosmic Card Deck | Parrot Cards',
    description: 'View your personalized card deck based on the birth details you provided to Parrot Cards.',
    indexable: false,
  },
  '/avatar': {
    title: 'Your Sovereign Avatar | Parrot Cards',
    description: 'Explore your personalized Sovereign Avatar experience from Parrot Cards.',
    indexable: false,
  },
  '/profile/astronomy': {
    title: 'Your Astronomical Profile | Parrot Cards',
    description: 'View the astronomical profile generated for your Parrot Cards birth chart.',
    indexable: false,
  },
  '/cart': {
    title: 'Shopping Cart | Parrot Cards',
    description: 'Review items in your Parrot Cards shopping cart.',
    indexable: false,
  },
  '/payment/result': {
    title: 'Payment Status | Parrot Cards',
    description: 'View the result of your Parrot Cards payment.',
    indexable: false,
  },
  '/account': {
    title: 'Your Account | Parrot Cards',
    description: 'Manage your Parrot Cards account and profile.',
    indexable: false,
  },
  '/my-daily-rituals': {
    title: 'My Daily Resonance | Parrot Cards',
    description: 'Review your Daily Resonance listening history and session progress.',
    indexable: false,
  },
  '/my-orders': {
    title: 'Your Orders | Parrot Cards',
    description: 'Review your Parrot Cards store orders.',
    indexable: false,
  },
  '/orders': {
    title: 'Your Orders | Parrot Cards',
    description: 'Review your Parrot Cards store orders.',
    indexable: false,
  },
  '/saved-deck': {
    title: 'Your Saved Decks | Parrot Cards',
    description: 'Access birth sky decks saved to your Parrot Cards account.',
    indexable: false,
  },
  '/purchased-cards': {
    title: 'Your Purchased Cards | Parrot Cards',
    description: 'View your purchased Parrot Cards and deck pass status.',
    indexable: false,
  },
  '/payments/history': {
    title: 'Payment History | Parrot Cards',
    description: 'Review payments and receipts associated with your Parrot Cards account.',
    indexable: false,
  },
  '/login': {
    title: 'Sign In | Parrot Cards',
    description: 'Sign in to your Parrot Cards account.',
    indexable: false,
  },
  '/register': {
    title: 'Create an Account | Parrot Cards',
    description: 'Create an account to save and access your Parrot Cards experience.',
    indexable: false,
  },
  '/reset-password': {
    title: 'Reset Password | Parrot Cards',
    description: 'Reset the password for your Parrot Cards account.',
    indexable: false,
  },
  '/admin': {
    title: 'Administration | Parrot Cards',
    description: 'Parrot Cards administration.',
    indexable: false,
  },
  '/admin/login': {
    title: 'Administrator Sign In | Parrot Cards',
    description: 'Sign in to the Parrot Cards administration area.',
    indexable: false,
  },
  '/admin/reset-password': {
    title: 'Reset Administrator Password | Parrot Cards',
    description: 'Reset an administrator password for Parrot Cards.',
    indexable: false,
  },
};

export const BREADCRUMB_LABELS: Record<string, string> = {
  '/birth-details': 'Birth Details',
  '/about': 'About',
  '/daily-rituals': 'Daily Resonance',
  '/cosmic-store': 'Cosmic Store',
  '/pricing': 'Pricing',
  '/support': 'Contact',
  '/privacy': 'Privacy Policy',
  '/terms': 'Terms of Service',
};

export function createStructuredData(path: string, page: PageSeo) {
  const pageUrl = `${SITE_URL}${path === '/' ? '/' : path}`;
  const graph: Record<string, unknown>[] = [
    {
      '@type': 'Organization',
      '@id': `${SITE_URL}/#organization`,
      name: 'Parrot Cards',
      url: `${SITE_URL}/`,
      logo: `${SITE_URL}/parrot-cards-logo.jpg`,
    },
    {
      '@type': 'WebSite',
      '@id': `${SITE_URL}/#website`,
      name: 'Parrot Cards',
      url: `${SITE_URL}/`,
      publisher: { '@id': `${SITE_URL}/#organization` },
      inLanguage: 'en-IN',
    },
    {
      '@type': 'WebPage',
      '@id': `${pageUrl}#webpage`,
      name: page.title,
      description: page.description,
      url: pageUrl,
      isPartOf: { '@id': `${SITE_URL}/#website` },
      inLanguage: 'en-IN',
    },
  ];

  const breadcrumbLabel = BREADCRUMB_LABELS[path];
  if (breadcrumbLabel) {
    graph.push({
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE_URL}/` },
        { '@type': 'ListItem', position: 2, name: breadcrumbLabel, item: pageUrl },
      ],
    });
  }

  return { '@context': 'https://schema.org', '@graph': graph };
}
