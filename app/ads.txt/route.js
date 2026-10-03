export const dynamic = 'force-static';

export async function GET() {
  const adsenseClient = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID || '';
  // Convert ca-pub-XXXX to pub-XXXX for ads.txt format
  const pubId = adsenseClient.replace(/^ca-/, '');

  let content = `# ==============================================================================
# TechPublisher ads.txt
# Authorized Digital Sellers File (IAB Tech Lab standard)
# ==============================================================================
`;

  if (pubId) {
    content += `google.com, ${pubId}, DIRECT, f08c47fec0942fa0\n`;
  } else {
    content += `# To connect Google AdSense, configure NEXT_PUBLIC_ADSENSE_CLIENT_ID (e.g. ca-pub-1234567890)
# google.com, pub-XXXXXXXXXXXXXXXX, DIRECT, f08c47fec0942fa0
`;
  }

  return new Response(content, {
    status: 200,
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=86400, stale-while-revalidate=604800',
    },
  });
}
