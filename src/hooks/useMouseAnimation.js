import { useEffect, useRef, useCallback } from 'react';

/**
 * useTilt – applies a subtle 3D tilt effect to cards based on mouse position.
 * Attach the returned ref to any container whose children have className="tilt-card".
 *
 * @param {number} maxTilt - maximum tilt angle in degrees (default: 8)
 * @param {number} scale   - scale on hover (default: 1.02)
 */
export function useTilt(maxTilt = 8, scale = 1.02) {
  const containerRef = useRef(null);

  const handleMouseMove = useCallback((e) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = (e.clientX - cx) / (rect.width / 2);
    const dy = (e.clientY - cy) / (rect.height / 2);
    const rotX = -dy * maxTilt;
    const rotY = dx * maxTilt;
    card.style.transform = `perspective(600px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale(${scale})`;
    card.style.transition = 'transform 0.1s ease';
  }, [maxTilt, scale]);

  const handleMouseLeave = useCallback((e) => {
    const card = e.currentTarget;
    card.style.transform = '';
    card.style.transition = 'transform 0.4s ease';
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    /* Only apply on non-touch devices */
    const isTouch = window.matchMedia('(hover: none)').matches;
    if (isTouch) return;

    const cards = container.querySelectorAll('.tilt-card');
    cards.forEach((card) => {
      card.addEventListener('mousemove', handleMouseMove);
      card.addEventListener('mouseleave', handleMouseLeave);
    });

    return () => {
      cards.forEach((card) => {
        card.removeEventListener('mousemove', handleMouseMove);
        card.removeEventListener('mouseleave', handleMouseLeave);
      });
    };
  }, [handleMouseMove, handleMouseLeave]);

  return containerRef;
}

/**
 * useParallaxMouse – applies a subtle parallax shift to a single element
 * based on mouse position relative to the viewport.
 *
 * @param {number} strength - movement strength in pixels (default: 20)
 */
export function useParallaxMouse(strength = 20) {
  const elRef = useRef(null);

  useEffect(() => {
    const el = elRef.current;
    if (!el) return;

    const isTouch = window.matchMedia('(hover: none)').matches;
    if (isTouch) return;

    const onMove = (e) => {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const dx = (e.clientX / vw - 0.5) * strength;
      const dy = (e.clientY / vh - 0.5) * strength;
      el.style.transform = `translate(${dx}px, ${dy}px)`;
      el.style.transition = 'transform 0.3s ease';
    };

    const onLeave = () => {
      el.style.transform = '';
      el.style.transition = 'transform 0.6s ease';
    };

    window.addEventListener('mousemove', onMove, { passive: true });
    document.addEventListener('mouseleave', onLeave);

    return () => {
      window.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseleave', onLeave);
    };
  }, [strength]);

  return elRef;
}
