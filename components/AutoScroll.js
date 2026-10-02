'use client';

import { useEffect, useRef } from 'react';

/**
 * Smoothly auto-scrolls down to the article's code box over `scrollSeconds` seconds.
 * Stops permanently on any user interaction (wheel, touchstart, keydown, mousedown).
 * Respects prefers-reduced-motion.
 */
export default function AutoScroll({ scrollSeconds = 40, targetId = 'article-code-box' }) {
  const stoppedRef = useRef(false);
  const rafIdRef = useRef(null);
  const timeoutIdRef = useRef(null);

  useEffect(() => {
    // 1. If scroll_seconds is 0, disable auto-scroll
    if (!scrollSeconds || scrollSeconds <= 0) {
      return;
    }

    // 2. Skip entirely if user prefers reduced motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      return;
    }

    // Stop handler: terminates auto-scroll permanently for this page view
    const stopScroll = () => {
      stoppedRef.current = true;
      if (timeoutIdRef.current) clearTimeout(timeoutIdRef.current);
      if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
      detachListeners();
    };

    const userEvents = ['wheel', 'touchstart', 'keydown', 'mousedown'];

    let isScrollingStarted = false;

    const attachListeners = () => {
      userEvents.forEach((event) => {
        window.addEventListener(event, stopScroll, { passive: true });
      });
    };

    const detachListeners = () => {
      userEvents.forEach((event) => {
        window.removeEventListener(event, stopScroll);
      });
    };

    // 3. Start after 1 second delay
    timeoutIdRef.current = setTimeout(() => {
      if (stoppedRef.current) return;

      const targetEl = document.getElementById(targetId);
      if (!targetEl) return;

      const startY = window.scrollY;
      const targetRect = targetEl.getBoundingClientRect();
      // Target position: centering the box nicely with header room
      const targetY = startY + targetRect.top - 80;
      const totalDistance = targetY - startY;

      if (totalDistance <= 0) return;

      // Attach user abort listeners once the auto-scroll movement actually begins
      attachListeners();
      isScrollingStarted = true;

      // Convert scrollSeconds to milliseconds (e.g. 40s = 40,000ms)
      const durationMs = (Number(scrollSeconds) || 40) * 1000;
      let startTime = null;

      const step = (timestamp) => {
        if (stoppedRef.current) return;

        if (!startTime) startTime = timestamp;
        const elapsed = timestamp - startTime;
        const progress = Math.min(elapsed / durationMs, 1); // Linear easing

        window.scrollTo(0, startY + (totalDistance * progress));

        if (progress < 1) {
          rafIdRef.current = requestAnimationFrame(step);
        } else {
          detachListeners();
        }
      };

      rafIdRef.current = requestAnimationFrame(step);
    }, 1000);

    return () => {
      stopScroll();
    };
  }, [scrollSeconds, targetId]);

  return null;
}
