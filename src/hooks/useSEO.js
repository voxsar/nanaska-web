import { useEffect } from 'react';

/**
 * useSEO – dynamically updates document <title> and meta tags.
 * Works for both real visitors and crawlers (via prerendering / SSG pipeline).
 */
export function useSEO({ title, description, keywords, ogImage, canonical }) {
  useEffect(() => {
    // Title
    if (title) document.title = title;

    const setMeta = (nameOrProp, content, isProp = false) => {
      const attr = isProp ? 'property' : 'name';
      let el = document.querySelector(`meta[${attr}="${nameOrProp}"]`);
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute(attr, nameOrProp);
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
    };

    if (description) {
      setMeta('description', description);
      setMeta('og:description', description, true);
    }
    if (keywords) setMeta('keywords', keywords);
    if (title) {
      setMeta('og:title', title, true);
      setMeta('twitter:title', title);
    }
    if (ogImage) {
      setMeta('og:image', ogImage, true);
      setMeta('twitter:image', ogImage);
    }
    setMeta('og:type', 'website', true);
    setMeta('twitter:card', 'summary_large_image');

    if (canonical) {
      let link = document.querySelector('link[rel="canonical"]');
      if (!link) {
        link = document.createElement('link');
        link.setAttribute('rel', 'canonical');
        document.head.appendChild(link);
      }
      link.setAttribute('href', canonical);
    }

    return () => {
      document.title = 'Nanaska';
    };
  }, [title, description, keywords, ogImage, canonical]);
}
