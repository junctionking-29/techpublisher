import { NextResponse } from 'next/server';
import { checkRateLimit } from '@/lib/rateLimit';
import { generateRedeemToken } from '@/lib/cryptoUtils';
import { getServiceSupabase } from '@/lib/supabaseServer';

// Known fallback codes for local evaluation / testing if live database is initializing
const MOCK_CODES = {
  TECH26: { target_url: 'https://github.com/vercel/next.js', active: true, wait_seconds: null },
  SMARTPAD: { target_url: 'https://supabase.com/docs', active: true, wait_seconds: 5 },
  QUANTUM: { target_url: 'https://arxiv.org', active: true, wait_seconds: 10 },
};

export async function POST(request) {
  // 1. Rate limiting (8 requests per minute per IP)
  const rateLimit = checkRateLimit(request, 8, 60 * 1000);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: 'Rate limit exceeded. Please wait a moment before trying again.' },
      {
        status: 429,
        headers: {
          'Retry-After': Math.ceil((rateLimit.resetTime - Date.now()) / 1000).toString(),
        },
      }
    );
  }

  // 2. Parse and validate request body
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON request payload' }, { status: 400 });
  }

  const rawCode = body?.code;
  if (!rawCode || typeof rawCode !== 'string') {
    return NextResponse.json({ error: 'Please enter a valid code' }, { status: 400 });
  }

  // Normalize: trim, uppercase, length constraint (max 50 chars)
  const normalizedCode = rawCode.trim().toUpperCase();
  if (normalizedCode.length === 0 || normalizedCode.length > 50) {
    return NextResponse.json({ error: 'Code must be between 1 and 50 characters' }, { status: 400 });
  }

  // Basic alphanumeric check with optional hyphens/underscores
  if (!/^[A-Z0-9_-]+$/.test(normalizedCode)) {
    return NextResponse.json({ error: 'Code contains invalid characters' }, { status: 400 });
  }

  // 3. Database lookup using Supabase SERVICE ROLE key
  let codeRecord = null;
  let defaultWaitSeconds = 8;

  try {
    const supabase = getServiceSupabase();

    // Query active code
    const { data: codeData, error: codeError } = await supabase
      .from('codes')
      .select('code, active, wait_seconds')
      .eq('code', normalizedCode)
      .eq('active', true)
      .maybeSingle();

    if (!codeError && codeData) {
      codeRecord = codeData;
    }

    // Query site settings for default wait seconds
    const { data: settingsData } = await supabase
      .from('settings')
      .select('default_wait_seconds')
      .eq('id', 1)
      .maybeSingle();

    if (settingsData && typeof settingsData.default_wait_seconds === 'number') {
      defaultWaitSeconds = settingsData.default_wait_seconds;
    }
  } catch (dbErr) {
    console.warn('Database lookup failed or unconfigured, checking fallback records:', dbErr.message);
    if (MOCK_CODES[normalizedCode] && MOCK_CODES[normalizedCode].active) {
      codeRecord = {
        code: normalizedCode,
        active: true,
        wait_seconds: MOCK_CODES[normalizedCode].wait_seconds,
      };
    }
  }

  // If still not found or not active: return 404 "Code not found"
  if (!codeRecord) {
    return NextResponse.json({ error: 'Code not found' }, { status: 404 });
  }

  // Compute wait duration
  const wait = (codeRecord.wait_seconds !== null && codeRecord.wait_seconds !== undefined)
    ? codeRecord.wait_seconds
    : defaultWaitSeconds;

  const finalWait = Math.min(30, Math.max(0, parseInt(wait, 10) || 0));

  // Generate signed HMAC-SHA256 token (URL is NOT returned)
  const { token } = generateRedeemToken(normalizedCode, finalWait);

  return NextResponse.json({
    token,
    wait: finalWait,
  });
}
