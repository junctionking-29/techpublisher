import { NextResponse } from 'next/server';
import { checkRateLimit } from '@/lib/rateLimit';
import { verifyRedeemToken } from '@/lib/cryptoUtils';
import { getServiceSupabase } from '@/lib/supabaseServer';

const MOCK_CODES = {
  TECH26: { target_url: 'https://github.com/vercel/next.js', active: true },
  SMARTPAD: { target_url: 'https://supabase.com/docs', active: true },
  QUANTUM: { target_url: 'https://arxiv.org', active: true },
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

  // 2. Parse request body
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON request payload' }, { status: 400 });
  }

  const token = body?.token;
  if (!token || typeof token !== 'string') {
    return NextResponse.json({ error: 'Redeem token is required' }, { status: 400 });
  }

  // 3. Verify HMAC signature, expiry, and unlock timestamp (rejects with 425 if now < unlockAt)
  const verification = verifyRedeemToken(token);
  if (!verification.valid) {
    return NextResponse.json(
      { error: verification.error },
      { status: verification.status || 400 }
    );
  }

  const { code } = verification;

  // 4. Look up target URL using Supabase SERVICE ROLE key
  let targetUrl = null;

  try {
    const supabase = getServiceSupabase();

    const { data: codeData, error: codeError } = await supabase
      .from('codes')
      .select('target_url, active')
      .eq('code', code)
      .eq('active', true)
      .maybeSingle();

    if (!codeError && codeData) {
      targetUrl = codeData.target_url;

      // Atomically increment click_count in background/asynchronously
      supabase
        .rpc('increment_code_clicks', { code_input: code })
        .then(() => {})
        .catch(() => {
          // Fallback direct update if RPC is missing
          supabase
            .from('codes')
            .update({ click_count: (codeData.click_count || 0) + 1 })
            .eq('code', code)
            .then(() => {});
        });
    }
  } catch (dbErr) {
    console.warn('Database lookup failed or unconfigured, using fallback record:', dbErr.message);
    if (MOCK_CODES[code] && MOCK_CODES[code].active) {
      targetUrl = MOCK_CODES[code].target_url;
    }
  }

  if (!targetUrl) {
    return NextResponse.json({ error: 'Code not found or no longer active' }, { status: 404 });
  }

  // 5. Strict URL validation: only allow http:// or https://
  try {
    const parsedUrl = new URL(targetUrl);
    if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
      return NextResponse.json(
        { error: 'Forbidden destination URL scheme' },
        { status: 400 }
      );
    }
  } catch {
    return NextResponse.json(
      { error: 'Invalid destination URL format' },
      { status: 400 }
    );
  }

  // 6. Return verified target URL
  return NextResponse.json({ url: targetUrl });
}
