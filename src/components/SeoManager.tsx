import React, { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  BREADCRUMB_LABELS,
  createStructuredData,
  PAGE_SEO,
  SITE_URL,
  SOCIAL_IMAGE,
  type PageSeo,
} from '../seo/pageMetadata';

function getOrCreateMeta(selector: string, attributes: Record<string, string>) {
  let element = document.head.querySelector<HTMLMetaElement>(selector);
  if (!element) {
    element = document.createElement('meta');
    document.head.appendChild(element);
  }
  Object.entries(attributes).forEach(([name, value]) => element!.setAttribute(name, value));
}

function getOrCreateLink(rel: string) {
  let element = document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
  if (!element) {
    element = document.createElement('link');
    element.rel = rel;
    document.head.appendChild(element);
  }
  return element;
}

export const SeoManager: React.FC = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    const path = pathname.replace(/\/+$/, '') || '/';
    const page =
      PAGE_SEO[path] ??
      ({
        title: 'Page Not Found | Parrot Cards',
        description: 'The page you are looking for could not be found.',
        indexable: false,
      } satisfies PageSeo);
    const canonicalUrl = `${SITE_URL}${path === '/' ? '/' : path}`;

    document.title = page.title;
    getOrCreateMeta('meta[name="description"]', {
      name: 'description',
      content: page.description,
    });
    getOrCreateMeta('meta[name="robots"]', {
      name: 'robots',
      content: page.indexable ? 'index, follow, max-image-preview:large' : 'noindex, nofollow',
    });
    getOrCreateMeta('meta[property="og:type"]', { property: 'og:type', content: 'website' });
    getOrCreateMeta('meta[property="og:site_name"]', {
      property: 'og:site_name',
      content: 'Parrot Cards',
    });
    getOrCreateMeta('meta[property="og:title"]', { property: 'og:title', content: page.title });
    getOrCreateMeta('meta[property="og:description"]', {
      property: 'og:description',
      content: page.description,
    });
    getOrCreateMeta('meta[property="og:url"]', { property: 'og:url', content: canonicalUrl });
    getOrCreateMeta('meta[property="og:image"]', { property: 'og:image', content: SOCIAL_IMAGE });
    getOrCreateMeta('meta[property="og:image:alt"]', {
      property: 'og:image:alt',
      content: 'Parrot Cards personalized cosmic card experience',
    });
    getOrCreateMeta('meta[name="twitter:card"]', {
      name: 'twitter:card',
      content: 'summary_large_image',
    });
    getOrCreateMeta('meta[name="twitter:title"]', { name: 'twitter:title', content: page.title });
    getOrCreateMeta('meta[name="twitter:description"]', {
      name: 'twitter:description',
      content: page.description,
    });
    getOrCreateMeta('meta[name="twitter:image"]', {
      name: 'twitter:image',
      content: SOCIAL_IMAGE,
    });

    const canonical = getOrCreateLink('canonical');
    canonical.href = canonicalUrl;

    let structuredData = document.head.querySelector<HTMLScriptElement>(
      'script[data-parrot-seo="structured-data"]',
    );
    if (!structuredData) {
      structuredData = document.createElement('script');
      structuredData.type = 'application/ld+json';
      structuredData.dataset.parrotSeo = 'structured-data';
      document.head.appendChild(structuredData);
    }
    structuredData.textContent = JSON.stringify(createStructuredData(path, page));
  }, [pathname]);

  return null;
};

export const BreadcrumbTrail: React.FC = () => {
  const { pathname } = useLocation();
  const path = pathname.replace(/\/+$/, '') || '/';
  const label = BREADCRUMB_LABELS[path];

  if (!label) return null;

  return (
    <nav aria-label="Breadcrumb" className="mx-auto w-full max-w-7xl px-4 pt-2 text-xs">
      <ol className="flex items-center gap-2 text-[#6B635B]">
        <li>
          <Link to="/" className="hover:text-[#8C6D3B] underline-offset-2 hover:underline">
            Home
          </Link>
        </li>
        <li aria-hidden="true">/</li>
        <li aria-current="page" className="text-[#8C6D3B]">
          {label}
        </li>
      </ol>
    </nav>
  );
};
