'use client';

import { useEffect, useRef } from 'react';

/**
 * Smoothly auto-scrolls down to the article's code box over `scrollSeconds` seconds.
 * Starts after 1 second delay.
 * Stops permanently on explicit user scrolling:
 *   - 'wheel' (mouse wheel / trackpad scroll)
 *   - 'touchmove' (finger dragging / swiping)
 *   - 'keydown' (arrow keys, page up/down, spacebar)
 * Respects prefers-reduced-motion.
 */
export default function AutoScroll({ scrollSeconds = 40, targetId = 'article-code-box' }) {
  const stoppedRef = useRef(false);
  const rafIdRef = useRef(null);
  const timeoutIdRef = useRef(null);
  const listenersAttachedRef = useRef(false);

  useEffect(() => {
    // 1. Duration check
    const durationSec = Number(scrollSeconds);
    if (!durationSec || durationSec <= 0) {
      return;
    }

    // 2. Skip if user prefers reduced motion
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }

    // Explicit user scroll events that indicate intentional takeover
    const userScrollEvents = ['wheel', 'touchmove', 'keydown'];

    const stopScroll = () => {
      if (stoppedRef.current) return;
      stoppedRef.current = true;
      if (timeoutIdRef.current) clearTimeout(timeoutIdRef.current);
      if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
      detachListeners();
    };

    const attachListeners = () => {
      if (listenersAttachedRef.current) return;
      listenersAttachedRef.current = true;
      userScrollEvents.forEach((event) => {
        window.addEventListener(event, stopScroll, { passive: true });
      });
    };

    const detachListeners = () => {
      if (!listenersAttachedRef.current) return;
      listenersAttachedRef.current = false;
      userScrollEvents.forEach((event) => {
        window.removeEventListener(event, stopScroll);
      });
    };

    // 3. Start auto-scroll after 1 second delay
    timeoutIdRef.current = setTimeout(() => {
      if (stoppedRef.current) return;

      const targetEl = document.getElementById(targetId);
      if (!targetEl) return;

      // Attach scroll-abort listeners once auto-scroll actually starts
      attachListeners();

      const startY = window.pageYOffset || document.documentElement.scrollTop || window.scrollY || 0;
      const targetRect = targetEl.getBoundingClientRect();
      
      // Calculate target scroll position to center the code box on the screen
      const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
      const offsetToCenter = Math.max(30, (viewportHeight - targetRect.height) / 2);
      const targetY = Math.max(0, startY + targetRect.top - offsetToCenter);
      const totalDistance = targetY - startY;

      if (totalDistance <= 15) return;

      const durationMs = durationSec * 1000;
      let startTime = null;

      const step = (timestamp) => {
        if (stoppedRef.current) return;

        if (!startTime) startTime = timestamp;
        const elapsed = timestamp - startTime;
        const progress = Math.min(elapsed / durationMs, 1); // Linear easing

        const currentScrollY = startY + (totalDistance * progress);
        window.scrollTo(0, currentScrollY);

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
