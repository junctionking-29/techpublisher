'use client';

import { useState, useEffect, useRef } from 'react';

export default function CodeBox({ id = 'redeem-code-box' }) {
  const [code, setCode] = useState('');
  const [status, setStatus] = useState('idle'); // 'idle' | 'loading' | 'countdown' | 'finishing' | 'error' | 'success'
  const [errorMessage, setErrorMessage] = useState('');
  const [secondsRemaining, setSecondsRemaining] = useState(0);
  const [targetUrl, setTargetUrl] = useState('');
  const [copied, setCopied] = useState(false);
  const [redirectSeconds, setRedirectSeconds] = useState(4);
  const [isRedirectPaused, setIsRedirectPaused] = useState(false);

  const tokenRef = useRef(null);
  const timerRef = useRef(null);
  const redirectTimerRef = useRef(null);

  // Clean up timers on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (redirectTimerRef.current) clearInterval(redirectTimerRef.current);
    };
  }, []);

  const handleInputChange = (e) => {
    setCode(e.target.value.toUpperCase());
    if (status === 'error' || status === 'success') {
      if (redirectTimerRef.current) {
        clearInterval(redirectTimerRef.current);
        redirectTimerRef.current = null;
      }
      setStatus('idle');
      setErrorMessage('');
      setTargetUrl('');
      setIsRedirectPaused(false);
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData?.getData('text') || '';
    setCode(pasted.trim().toUpperCase());
    if (status === 'error' || status === 'success') {
      if (redirectTimerRef.current) {
        clearInterval(redirectTimerRef.current);
        redirectTimerRef.current = null;
      }
      setStatus('idle');
      setErrorMessage('');
      setTargetUrl('');
      setIsRedirectPaused(false);
    }
  };

  const handleCopyLink = async () => {
    if (!targetUrl) return;
    let successful = false;

    if (typeof navigator !== 'undefined' && navigator.clipboard && window.isSecureContext) {
      try {
        await navigator.clipboard.writeText(targetUrl);
        successful = true;
      } catch (err) {
        console.warn('Clipboard writeText failed, using fallback', err);
      }
    }

    if (!successful && typeof document !== 'undefined') {
      try {
        const textArea = document.createElement('textarea');
        textArea.value = targetUrl;
        textArea.style.position = 'fixed';
        textArea.style.left = '-9999px';
        textArea.style.top = '-9999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        successful = document.execCommand('copy');
        document.body.removeChild(textArea);
      } catch (err) {
        console.error('Fallback copy command failed', err);
      }
    }

    if (successful) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleOpenNow = () => {
    if (redirectTimerRef.current) {
      clearInterval(redirectTimerRef.current);
      redirectTimerRef.current = null;
    }
    window.location.href = targetUrl;
  };

  const handleCancelRedirect = () => {
    if (redirectTimerRef.current) {
      clearInterval(redirectTimerRef.current);
      redirectTimerRef.current = null;
    }
    setIsRedirectPaused(true);
  };

  const handleFinishRedeem = async (token) => {
    setStatus('finishing');
    try {
      const res = await fetch('/api/redeem/finish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });

      const data = await res.json();

      if (!res.ok) {
        setStatus('error');
        setErrorMessage(data.error || 'Failed to unlock link. Please try again.');
        return;
      }

      if (data.url) {
        setTargetUrl(data.url);
        setStatus('success');
        setRedirectSeconds(4);
        setIsRedirectPaused(false);

        // Auto-redirect countdown
        let count = 4;
        if (redirectTimerRef.current) clearInterval(redirectTimerRef.current);
        redirectTimerRef.current = setInterval(() => {
          count -= 1;
          setRedirectSeconds(count);
          if (count <= 0) {
            clearInterval(redirectTimerRef.current);
            redirectTimerRef.current = null;
            window.location.href = data.url;
          }
        }, 1000);
      } else {
        setStatus('error');
        setErrorMessage('Invalid destination received.');
      }
    } catch {
      setStatus('error');
      setErrorMessage('Network connection error. Please try again.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmed = code.trim().toUpperCase();
    if (!trimmed) {
      setStatus('error');
      setErrorMessage('Please enter the code shown in the Instagram video.');
      return;
    }

    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (redirectTimerRef.current) {
      clearInterval(redirectTimerRef.current);
      redirectTimerRef.current = null;
    }

    setStatus('loading');
    setErrorMessage('');
    setTargetUrl('');
    setCopied(false);
    setIsRedirectPaused(false);

    try {
      const res = await fetch('/api/redeem/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: trimmed }),
      });

      const data = await res.json();

      if (!res.ok) {
        setStatus('error');
        setErrorMessage(data.error || 'Code not found. Please double-check the Instagram video.');
        return;
      }

      const { token, wait } = data;
      tokenRef.current = token;

      if (!wait || wait <= 0) {
        // Instant unlock
        await handleFinishRedeem(token);
      } else {
        // Honest countdown
        setStatus('countdown');
        setSecondsRemaining(wait);

        let current = wait;
        timerRef.current = setInterval(() => {
          current -= 1;
          setSecondsRemaining(current);

          if (current <= 0) {
            clearInterval(timerRef.current);
            timerRef.current = null;
            handleFinishRedeem(token);
          }
        }, 1000);
      }
    } catch {
      setStatus('error');
      setErrorMessage('Unable to connect to server. Please check your internet connection.');
    }
  };

  return (
    <section
      id={id}
      className="code-box-wrapper red-code-box"
      aria-labelledby={`${id}-label`}
      style={{
        border: '4px solid #dc2626',
        borderRadius: '16px',
        padding: '2.5rem 2.75rem',
        maxWidth: '740px',
        boxShadow: '0 10px 35px rgba(220, 38, 38, 0.2), 0 2px 6px rgba(0, 0, 0, 0.06)',
        backgroundColor: '#ffffff',
        margin: '3rem auto',
        textAlign: 'left',
      }}
    >
      <label
        id={`${id}-label`}
        htmlFor={`${id}-input`}
        className="code-box-label"
        style={{
          display: 'block',
          fontFamily: 'var(--font-sans)',
          fontWeight: 700,
          fontSize: '1.25rem',
          color: '#10151c',
          marginBottom: '1rem',
          letterSpacing: '-0.01em',
        }}
      >
        Enter the Instagram video code to get your link
      </label>

      <form onSubmit={handleSubmit} className="code-box-form" noValidate>
        <input
          id={`${id}-input`}
          type="text"
          value={code}
          onChange={handleInputChange}
          onPaste={handlePaste}
          placeholder="e.g. TECH26"
          maxLength={50}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="characters"
          spellCheck="false"
          className="code-box-input"
          style={{
            flex: 1,
            fontFamily: 'var(--font-sans)',
            fontSize: '1.25rem',
            fontWeight: 700,
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            padding: '0.85rem 1.25rem',
            border: '2.5px solid #dc2626',
            borderRadius: '8px',
            backgroundColor: '#ffffff',
            color: '#10151c',
            outline: 'none',
          }}
          disabled={status === 'loading' || status === 'countdown' || status === 'finishing'}
          required
        />
        <button
          type="submit"
          className="code-box-button"
          style={{
            fontFamily: 'var(--font-sans)',
            fontSize: '1.15rem',
            fontWeight: 700,
            color: '#ffffff',
            backgroundColor: '#dc2626',
            border: 'none',
            borderRadius: '8px',
            padding: '0.85rem 2.25rem',
            cursor: status === 'loading' || status === 'countdown' || status === 'finishing' || !code.trim() ? 'not-allowed' : 'pointer',
            opacity: status === 'loading' || status === 'countdown' || status === 'finishing' || !code.trim() ? 0.65 : 1,
            transition: 'background-color 0.15s ease',
            whiteSpace: 'nowrap',
          }}
          disabled={status === 'loading' || status === 'countdown' || status === 'finishing' || !code.trim()}
        >
          {status === 'loading' ? 'Verifying...' : 'Get link'}
        </button>
      </form>

      {/* Honest countdown display with aria-live polite */}
      {status === 'countdown' && (
        <div
          className="code-box-status countdown"
          role="status"
          aria-live="polite"
          style={{
            marginTop: '1.25rem',
            padding: '0.75rem 1rem',
            borderRadius: '8px',
            backgroundColor: '#fef2f2',
            color: '#dc2626',
            border: '1.5px solid #dc2626',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            fontSize: '1.05rem',
          }}
        >
          <span
            className="countdown-spinner"
            aria-hidden="true"
            style={{
              width: '18px',
              height: '18px',
              border: '2.5px solid #dc2626',
              borderTopColor: 'transparent',
              borderRadius: '50%',
              display: 'inline-block',
            }}
          ></span>
          <span>Your link opens in {secondsRemaining}s</span>
        </div>
      )}

      {status === 'finishing' && (
        <div
          className="code-box-status countdown"
          role="status"
          aria-live="polite"
          style={{
            marginTop: '1.25rem',
            padding: '0.75rem 1rem',
            borderRadius: '8px',
            backgroundColor: '#fef2f2',
            color: '#dc2626',
            border: '1.5px solid #dc2626',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
          }}
        >
          <span
            className="countdown-spinner"
            aria-hidden="true"
            style={{
              width: '18px',
              height: '18px',
              border: '2.5px solid #dc2626',
              borderTopColor: 'transparent',
              borderRadius: '50%',
            }}
          ></span>
          <span>Unlocking destination link...</span>
        </div>
      )}

      {/* Success: Show Link, Copy Button, Open Button, and Auto-Redirect status */}
      {status === 'success' && targetUrl && (
        <div
          className="code-box-status success-box"
          role="region"
          aria-label="Unlocked destination link"
          style={{
            marginTop: '1.5rem',
            padding: '1.25rem 1.5rem',
            borderRadius: '12px',
            backgroundColor: '#f0fdf4',
            border: '2px solid #22c55e',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
            boxShadow: '0 4px 12px rgba(34, 197, 94, 0.12)',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '0.5rem',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                color: '#15803d',
                fontWeight: 700,
                fontSize: '1.05rem',
              }}
            >
              <span aria-hidden="true">🎉</span>
              <span>
                {isRedirectPaused
                  ? 'Link unlocked!'
                  : `Link unlocked! Redirecting in ${redirectSeconds}s...`}
              </span>
            </div>
            {!isRedirectPaused && (
              <button
                type="button"
                onClick={handleCancelRedirect}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#4b5563',
                  fontSize: '0.8125rem',
                  textDecoration: 'underline',
                  cursor: 'pointer',
                  padding: '2px 4px',
                  fontFamily: 'var(--font-sans)',
                }}
              >
                Stay on page
              </button>
            )}
          </div>

          {/* URL Input with Copy Button */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              gap: '0.5rem',
              backgroundColor: '#ffffff',
              border: '1.5px solid #bbf7d0',
              borderRadius: '8px',
              padding: '0.4rem 0.6rem',
              minWidth: 0,
            }}
          >
            <input
              type="text"
              readOnly
              value={targetUrl}
              aria-label="Unlocked destination URL"
              onClick={(e) => e.target.select()}
              style={{
                flex: 1,
                minWidth: 0,
                fontFamily: 'var(--font-sans)',
                fontSize: '0.95rem',
                color: '#1e293b',
                border: 'none',
                outline: 'none',
                backgroundColor: 'transparent',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                cursor: 'text',
              }}
            />
            <button
              type="button"
              onClick={handleCopyLink}
              aria-label={copied ? 'Link copied' : 'Copy link to clipboard'}
              style={{
                flexShrink: 0,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                fontFamily: 'var(--font-sans)',
                fontSize: '0.9rem',
                fontWeight: 700,
                color: copied ? '#ffffff' : '#15803d',
                backgroundColor: copied ? '#16a34a' : '#dcfce7',
                border: '1px solid ' + (copied ? '#16a34a' : '#86efac'),
                borderRadius: '6px',
                padding: '0.5rem 0.9rem',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.15s ease',
              }}
            >
              {copied ? '✓ Copied!' : '📋 Copy Link'}
            </button>
          </div>

          {/* Direct Action: Open Link Button */}
          <button
            type="button"
            onClick={handleOpenNow}
            style={{
              width: '100%',
              fontFamily: 'var(--font-sans)',
              fontSize: '1.05rem',
              fontWeight: 700,
              color: '#ffffff',
              backgroundColor: '#dc2626',
              border: 'none',
              borderRadius: '8px',
              padding: '0.8rem 1.5rem',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              boxShadow: '0 2px 6px rgba(220, 38, 38, 0.25)',
              transition: 'background-color 0.15s ease',
            }}
          >
            <span>Open Link Now</span>
            <span aria-hidden="true">→</span>
          </button>
        </div>
      )}

      {status === 'error' && (
        <div
          className="code-box-status error"
          role="alert"
          aria-live="assertive"
          style={{
            marginTop: '1.25rem',
            padding: '0.75rem 1rem',
            borderRadius: '8px',
            backgroundColor: '#ffebe9',
            color: '#cf222e',
            border: '1.5px solid #ff8182',
            fontWeight: 600,
          }}
        >
          {errorMessage}
        </div>
      )}

      <p
        className="code-box-helper"
        style={{
          marginTop: '0.75rem',
          fontSize: '0.85rem',
          color: '#6b7280',
          fontFamily: 'var(--font-sans)',
        }}
      >
        Codes are case-insensitive and match the exact key shown in our video tutorials and reviews.
      </p>
    </section>
  );
}
