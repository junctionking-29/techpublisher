// Script to test data fallback policy under NODE_ENV === 'production'
process.env.NODE_ENV = 'production';
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://wrong-nonexistent-project.supabase.co';
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'invalid-anon-key';
process.env.ALLOW_FALLBACK_DATA = 'false';

console.log('Testing fallback policy with NODE_ENV=production and invalid Supabase URL...');

try {
  const { fetchPublishedArticles } = await import('../lib/supabaseServer.js');
  const articles = await fetchPublishedArticles();
  console.error('FAIL: Expected fetchPublishedArticles to throw in production, but got:', articles);
  process.exit(1);
} catch (err) {
  console.log('PASS: Correctly threw error in production instead of serving fake articles:');
  console.log('Error message:', err.message);
}
