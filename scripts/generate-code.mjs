#!/usr/bin/env node

import crypto from 'crypto';

/**
 * Generates an unambiguous 8-character uppercase alphanumeric code.
 * Excludes characters that are easily confused: 0, O, 1, I.
 */
const CHARSET = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
const CODE_LENGTH = 8;

export function generateCode(length = CODE_LENGTH) {
  let result = '';
  for (let i = 0; i < length; i++) {
    const randomIndex = crypto.randomInt(0, CHARSET.length);
    result += CHARSET[randomIndex];
  }
  return result;
}

if (process.argv[1]?.endsWith('generate-code.mjs')) {
  const code = generateCode();
  console.log(code);
}
