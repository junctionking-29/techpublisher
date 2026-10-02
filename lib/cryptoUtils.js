import crypto from 'crypto';

/**
 * Validates and retrieves the REDEEM_SECRET from server environment variables.
 * Enforces minimum length of 32 characters and throws at startup if missing or invalid.
 */
export function getRedeemSecret() {
  const secret = process.env.REDEEM_SECRET;
  if (!secret || typeof secret !== 'string' || secret.length < 32) {
    throw new Error(
      'CRITICAL SECURITY CONFIGURATION ERROR: REDEEM_SECRET must be defined in environment variables and must be at least 32 characters long.'
    );
  }
  return secret;
}

// Startup validation in server environment: throws immediately if missing or too short
if (typeof window === 'undefined') {
  getRedeemSecret();
}

/**
 * Generates an HMAC-SHA256 signed redeem token.
 * Token format: code:unlockAt:expiry:signature
 * 
 * @param {string} code - Normalized uppercase code
 * @param {number} waitSeconds - Wait duration in seconds
 * @returns {{ token: string, unlockAt: number, expiry: number }}
 */
export function generateRedeemToken(code, waitSeconds) {
  const secret = getRedeemSecret();
  const now = Math.floor(Date.now() / 1000);
  const unlockAt = now + Math.max(0, parseInt(waitSeconds, 10) || 0);
  const expiry = now + (10 * 60); // 10 minutes expiry window

  const payload = `${code}:${unlockAt}:${expiry}`;
  const signature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');

  const token = `${payload}:${signature}`;

  return { token, unlockAt, expiry };
}

/**
 * Verifies an HMAC-SHA256 signed redeem token.
 * 
 * @param {string} token - The signed token string
 * @returns {{ valid: boolean, status: number, error?: string, code?: string, unlockAt?: number }}
 */
export function verifyRedeemToken(token) {
  if (!token || typeof token !== 'string') {
    return { valid: false, status: 400, error: 'Invalid or missing redeem token' };
  }

  const parts = token.split(':');
  if (parts.length !== 4) {
    return { valid: false, status: 400, error: 'Malformed redeem token structure' };
  }

  const [code, unlockAtStr, expiryStr, receivedSignature] = parts;
  const unlockAt = parseInt(unlockAtStr, 10);
  const expiry = parseInt(expiryStr, 10);

  if (isNaN(unlockAt) || isNaN(expiry)) {
    return { valid: false, status: 400, error: 'Malformed timestamp in token' };
  }

  const secret = getRedeemSecret();
  const payload = `${code}:${unlockAtStr}:${expiryStr}`;
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');

  const receivedSigBuf = Buffer.from(receivedSignature, 'hex');
  const expectedSigBuf = Buffer.from(expectedSignature, 'hex');

  if (receivedSigBuf.length !== expectedSigBuf.length) {
    return { valid: false, status: 401, error: 'Invalid token signature length' };
  }

  const signaturesMatch = crypto.timingSafeEqual(receivedSigBuf, expectedSigBuf);
  if (!signaturesMatch) {
    return { valid: false, status: 401, error: 'Tampered or invalid token signature' };
  }

  const now = Math.floor(Date.now() / 1000);

  // Check if token has expired
  if (now > expiry) {
    return { valid: false, status: 410, error: 'Redeem token has expired. Please request a new code.' };
  }

  // Check if unlock time has been reached (425 Too Early)
  if (now < unlockAt) {
    const remaining = unlockAt - now;
    return {
      valid: false,
      status: 425,
      error: `Too early. Link unlocks in ${remaining} second${remaining === 1 ? '' : 's'}.`,
    };
  }

  return { valid: true, status: 200, code, unlockAt };
}
