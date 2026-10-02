import { execSync } from 'child_process';
import crypto from 'crypto';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const DB_URL = 'postgresql://postgres:postgres@127.0.0.1:54322/postgres';

function runPsql(sql) {
  return execSync(`psql "${DB_URL}" -c "${sql.replace(/"/g, '\\"')}"`, {
    encoding: 'utf8',
  });
}

async function runTests() {
  console.log('=== Starting Redeem Flow Integration Tests ===');
  console.log(`Target Base URL: ${BASE_URL}`);

  const testCode = 'VALID123';
  const targetUrl = 'https://example.com/target';
  const badSchemeCode = 'BADSCHEME';
  const badSchemeUrl = 'javascript:alert(1)';

  try {
    // 0. Setup test codes in local database
    console.log('\n[Setup] Inserting temporary test codes into local database...');
    runPsql(`
      DELETE FROM codes WHERE code IN ('${testCode}', '${badSchemeCode}');
      INSERT INTO codes (code, target_url, active, wait_seconds) VALUES ('${testCode}', '${targetUrl}', true, 2);
      INSERT INTO codes (code, target_url, active, wait_seconds) VALUES ('${badSchemeCode}', '${badSchemeUrl}', true, 0);
    `);

    // 1. Wrong code returns 404
    console.log('\n[Test 1] Testing wrong code returns 404...');
    const wrongRes = await fetch(`${BASE_URL}/api/redeem/start`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: 'NONEXISTENT99' }),
    });
    const wrongData = await wrongRes.json();
    if (wrongRes.status === 404 && wrongData.error === 'Code not found') {
      console.log('PASS: Wrong code correctly returned HTTP 404.');
    } else {
      throw new Error(`FAIL: Expected 404, got ${wrongRes.status}: ${JSON.stringify(wrongData)}`);
    }

    // 2. Valid code returns token and wait but NO url
    console.log('\n[Test 2] Testing valid code returns token and wait but NO url...');
    const startRes = await fetch(`${BASE_URL}/api/redeem/start`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: testCode }),
    });
    const startData = await startRes.json();
    if (
      startRes.status === 200 &&
      typeof startData.token === 'string' &&
      startData.wait === 2 &&
      startData.url === undefined
    ) {
      console.log(`PASS: Valid code returned token and wait (${startData.wait}s) with NO url exposed.`);
    } else {
      throw new Error(`FAIL: Invalid start response: ${JSON.stringify(startData)}`);
    }

    const validToken = startData.token;

    // 3. Calling /api/redeem/finish immediately returns 425 (Too Early)
    console.log('\n[Test 3] Calling /api/redeem/finish immediately (should return 425 Too Early)...');
    const earlyRes = await fetch(`${BASE_URL}/api/redeem/finish`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: validToken }),
    });
    const earlyData = await earlyRes.json();
    if (earlyRes.status === 425) {
      console.log(`PASS: Premature call rejected with HTTP 425: "${earlyData.error}".`);
    } else {
      throw new Error(`FAIL: Expected HTTP 425, got ${earlyRes.status}: ${JSON.stringify(earlyData)}`);
    }

    // 4. After wait duration, /api/redeem/finish returns the URL
    console.log('\n[Test 4] Waiting 2.2 seconds for countdown unlock...');
    await new Promise((resolve) => setTimeout(resolve, 2200));

    const finishRes = await fetch(`${BASE_URL}/api/redeem/finish`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: validToken }),
    });
    const finishData = await finishRes.json();
    if (finishRes.status === 200 && finishData.url === targetUrl) {
      console.log(`PASS: After wait expired, /api/redeem/finish unlocked correct URL: ${finishData.url}`);
    } else {
      throw new Error(`FAIL: Expected URL ${targetUrl}, got status ${finishRes.status}: ${JSON.stringify(finishData)}`);
    }

    // 5. Tampered token returns 401
    console.log('\n[Test 5] Calling /api/redeem/finish with tampered token...');
    const tamperedToken = validToken.slice(0, -6) + 'abcdef';
    const tamperedRes = await fetch(`${BASE_URL}/api/redeem/finish`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: tamperedToken }),
    });
    const tamperedData = await tamperedRes.json();
    if (tamperedRes.status === 401) {
      console.log(`PASS: Tampered token was rejected with HTTP 401: "${tamperedData.error}".`);
    } else {
      throw new Error(`FAIL: Expected 401, got ${tamperedRes.status}: ${JSON.stringify(tamperedData)}`);
    }

    // 6. Expired token is rejected
    console.log('\n[Test 6] Calling /api/redeem/finish with expired token...');
    const secret = process.env.REDEEM_SECRET || 'local-development-secret-key-32-chars-long-at-least';
    const expiredUnlock = Math.floor(Date.now() / 1000) - 1000;
    const expiredExpiry = Math.floor(Date.now() / 1000) - 100;
    const expiredPayload = `${testCode}:${expiredUnlock}:${expiredExpiry}`;
    const expiredSig = crypto.createHmac('sha256', secret).update(expiredPayload).digest('hex');
    const expiredToken = `${expiredPayload}:${expiredSig}`;

    const expiredRes = await fetch(`${BASE_URL}/api/redeem/finish`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: expiredToken }),
    });
    const expiredData = await expiredRes.json();
    if (expiredRes.status === 410) {
      console.log(`PASS: Expired token was rejected with HTTP 410: "${expiredData.error}".`);
    } else {
      throw new Error(`FAIL: Expected 410, got ${expiredRes.status}: ${JSON.stringify(expiredData)}`);
    }

    // 7. Non-http(s) target_url is rejected
    console.log('\n[Test 7] Testing non-http(s) target_url rejection...');
    const badStartRes = await fetch(`${BASE_URL}/api/redeem/start`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: badSchemeCode }),
    });
    const badStartData = await badStartRes.json();
    const badFinishRes = await fetch(`${BASE_URL}/api/redeem/finish`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: badStartData.token }),
    });
    const badFinishData = await badFinishRes.json();
    if (badFinishRes.status === 400 && badFinishData.error.includes('scheme')) {
      console.log(`PASS: Non-http(s) URL was properly rejected with HTTP 400: "${badFinishData.error}".`);
    } else {
      throw new Error(`FAIL: Expected 400 bad scheme rejection, got ${badFinishRes.status}: ${JSON.stringify(badFinishData)}`);
    }

    // 8. Rate limiting: 9th request within a minute from one IP returns 429
    console.log('\n[Test 8] Testing rate limiting (9th request within 1 min returns 429)...');
    const testIp = `198.51.100.${Math.floor(Math.random() * 200) + 10}`;
    let hitRateLimit = false;

    for (let i = 1; i <= 9; i++) {
      const rlRes = await fetch(`${BASE_URL}/api/redeem/start`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Forwarded-For': testIp,
        },
        body: JSON.stringify({ code: testCode }),
      });

      if (i <= 8) {
        if (rlRes.status === 429) {
          throw new Error(`FAIL: Premature rate limit on request #${i}`);
        }
      } else {
        // 9th request
        if (rlRes.status === 429) {
          const rlData = await rlRes.json();
          console.log(`PASS: Request #9 from IP ${testIp} returned HTTP 429: "${rlData.error}".`);
          hitRateLimit = true;
        } else {
          throw new Error(`FAIL: Expected 429 on request #9, but got ${rlRes.status}`);
        }
      }
    }

    if (!hitRateLimit) {
      throw new Error('FAIL: Rate limit did not trigger on 9th request.');
    }

    console.log('\nALL 8 REDEEM FLOW TESTS PASSED!');
  } finally {
    // Cleanup test codes
    console.log('\n[Cleanup] Removing temporary test codes from local database...');
    runPsql(`DELETE FROM codes WHERE code IN ('${testCode}', '${badSchemeCode}');`);
    console.log('Cleanup complete.');
  }
}

runTests().catch((err) => {
  console.error('\nTEST SUITE FAILED:', err);
  process.exit(1);
});
