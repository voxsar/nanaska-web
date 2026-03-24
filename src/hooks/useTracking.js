/**
 * useTracking
 *
 * Centralises all analytics / tracking:
 *  - Microsoft Clarity (init + events)
 *  - Google Analytics 4  (gtag events)
 *  - Scroll-depth milestones  (25 / 50 / 75 / 90 %)
 *  - SPA page-view tracking (pathname changes)
 *
 * Utility functions exported for use from any component:
 *  trackFormStart / trackFormSubmit / trackFormError
 *  trackButtonClick
 *  trackEnrollment
 *  trackEvent
 */

import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import Clarity from '@microsoft/clarity';

const CLARITY_PROJECT_ID = 'w0ukxy3wwi';
const SCROLL_MILESTONES = [25, 50, 75, 90];

let clarityReady = false;

function initClarity() {
  if (clarityReady) return;
  try {
    Clarity.init(CLARITY_PROJECT_ID);
    clarityReady = true;
  } catch {
    // Clarity may already be initialised via a GTM tag — silently ignore
  }
}

// ─── safe wrappers ────────────────────────────────────────────────────────────

function clarityEvent(name) {
  if (!clarityReady) return;
  try { Clarity.event(name); } catch { /* ignore */ }
}

function clarityTag(key, value) {
  if (!clarityReady) return;
  try { Clarity.setTag(key, value); } catch { /* ignore */ }
}

function clarityUpgrade(reason) {
  if (!clarityReady) return;
  try { Clarity.upgrade(reason); } catch { /* ignore */ }
}

function gtagEvent(eventName, params = {}) {
  if (typeof window.gtag === 'function') {
    window.gtag('event', eventName, params);
  }
}

// ─── exported utility functions ───────────────────────────────────────────────

/** Track a custom named event in both Clarity and GA4. */
export function trackEvent(name, params = {}) {
  clarityEvent(name);
  gtagEvent(name, params);
}

/** Call when a user first interacts with / focuses a form. */
export function trackFormStart(formName) {
  clarityEvent(`form_start_${formName}`);
  gtagEvent('form_start', { form_name: formName });
}

/** Call on successful form submission. */
export function trackFormSubmit(formName, extraParams = {}) {
  clarityEvent(`form_submit_${formName}`);
  clarityUpgrade('form_submission');
  gtagEvent('form_submit', { form_name: formName, ...extraParams });
}

/** Call when a form field has a validation error. */
export function trackFormError(formName, fieldName) {
  clarityEvent(`form_error_${formName}`);
  gtagEvent('form_error', { form_name: formName, form_field: fieldName });
}

/** Track a button / CTA click. */
export function trackButtonClick(label, category = 'engagement') {
  clarityEvent(`click_${label}`);
  gtagEvent('click', { event_category: category, event_label: label });
}

/**
 * Track when a user starts the enrollment flow for a course.
 * Sends a GA4 begin_checkout event and upgrades the Clarity session.
 */
export function trackEnrollment(courseId, courseName, price, currency = 'LKR') {
  clarityEvent('enrollment_started');
  clarityTag('enrolled_course', courseName);
  clarityUpgrade('enrollment_intent');
  gtagEvent('begin_checkout', {
    currency,
    value: price,
    items: [{ item_id: courseId, item_name: courseName }],
  });
}

/** Set an arbitrary Clarity custom tag. */
export function setClarityTag(key, value) {
  clarityTag(key, value);
}

// ─── hook ─────────────────────────────────────────────────────────────────────

export function useTracking() {
  const { pathname } = useLocation();
  const scrollHit = useRef(new Set());

  // Init Clarity once on mount
  useEffect(() => {
    initClarity();
  }, []);

  // SPA page-view + reset scroll markers on every route change
  useEffect(() => {
    // GA4 manual page_view (gtag config had send_page_view: false to avoid double-count with GTM)
    gtagEvent('page_view', {
      page_path: pathname,
      page_location: window.location.href,
    });

    // Tag the current page in Clarity
    clarityTag('page_path', pathname);

    // Reset scroll markers for the new page
    scrollHit.current = new Set();
  }, [pathname]);

  // Scroll-depth tracking
  useEffect(() => {
    const onScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
      const max = scrollHeight - clientHeight;
      if (max <= 0) return;
      const pct = Math.round((scrollTop / max) * 100);

      SCROLL_MILESTONES.forEach((milestone) => {
        if (pct >= milestone && !scrollHit.current.has(milestone)) {
          scrollHit.current.add(milestone);
          clarityEvent(`scroll_${milestone}`);
          gtagEvent('scroll', {
            event_category: 'engagement',
            event_label: `${milestone}%`,
            value: milestone,
            percent_scrolled: milestone,
          });
        }
      });
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [pathname]);
}
