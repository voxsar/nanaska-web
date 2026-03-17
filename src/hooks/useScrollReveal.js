import { useEffect, useRef } from 'react';

/**
 * useScrollReveal – attaches an IntersectionObserver to the container ref,
 * adding the `revealed` CSS class to every child carrying [data-reveal]
 * or [data-reveal-stagger]. Call this once per page/section component.
 */
export function useScrollReveal(containerRef) {
  useEffect(() => {
    const root = containerRef?.current ?? document;
    const els = root.querySelectorAll('[data-reveal], [data-reveal-stagger]');

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -60px 0px' }
    );

    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [containerRef]);
}

export function useRef_() {
  return useRef(null);
}
