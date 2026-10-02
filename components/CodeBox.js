'use client';

import { useState, useEffect, useRef } from 'react';

export default function CodeBox({ id = 'redeem-code-box' }) {
  const [code, setCode] = useState('');
  const [status, setStatus] = useState('idle'); // 'idle' | 'loading' | 'countdown' | 'finishing' | 'error' | 'success'
  const [errorMessage, setErrorMessage] = useState('');
  const [secondsRemaining, setSecondsRemaining] = useState(0);
  const tokenRef = useRef(null);
  const timerRef = useRef(null);

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const handleInputChange = (e) => {
    // Auto-uppercase input value
    setCode(e.target.value.toUpperCase());
    if (status === 'error') {
      setStatus('idle');
      setErrorMessage('');
    }
  };

  const handlePaste = (e) => {
    // Auto-uppercase pasted input
    e.preventDefault();
    const pasted = e.clipboardData?.getData('text') || '';
    setCode(pasted.trim().toUpperCase());
    if (status === 'error') {
      setStatus('idle');
      setErrorMessage('');
    }
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
        setStatus('success');
        // Redirect to target URL
        window.location.href = data.url;
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

    setStatus('loading');
    setErrorMessage('');

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

      {status === 'success' && (
        <div
          className="code-box-status"
          style={{
            marginTop: '1.25rem',
            padding: '0.75rem 1rem',
            borderRadius: '8px',
            backgroundColor: '#dafbe1',
            color: '#1a7f37',
            fontWeight: 600,
          }}
        >
          Redirecting you to target link...
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
