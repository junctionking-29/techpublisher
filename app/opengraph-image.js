import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'TechPublisher - Consumer Tech Reviews, Hardware & AI Research';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '80px',
          backgroundColor: '#f5f7fa',
          fontFamily: 'sans-serif',
        }}
      >
        {/* Top Header / Branding */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              backgroundColor: '#1b4dff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              fontSize: '28px',
              fontWeight: 'bold',
            }}
          >
            T
          </div>
          <span style={{ fontSize: '36px', fontWeight: 800, color: '#10151c', letterSpacing: '-0.02em' }}>
            TechPublisher
          </span>
          <div
            style={{
              marginLeft: '24px',
              padding: '6px 16px',
              borderRadius: '999px',
              backgroundColor: '#e6edff',
              color: '#1b4dff',
              fontSize: '18px',
              fontWeight: 700,
            }}
          >
            Verified Technical Journalism
          </div>
        </div>

        {/* Center Main Headline */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <h1
            style={{
              fontSize: '56px',
              fontWeight: 800,
              color: '#10151c',
              lineHeight: 1.15,
              letterSpacing: '-0.03em',
              margin: 0,
            }}
          >
            Deep Technical Analysis on Silicon, Consumer Hardware & AI
          </h1>
          <p
            style={{
              fontSize: '24px',
              color: '#57606a',
              lineHeight: 1.4,
              margin: 0,
              maxWidth: '900px',
            }}
          >
            Independent consumer hardware reviews, semiconductor fabrication insights, and research explainers.
          </p>
        </div>

        {/* Footer info */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderTop: '2px solid #e1e4e8',
            paddingTop: '30px',
          }}
        >
          <span style={{ fontSize: '20px', color: '#57606a', fontWeight: 600 }}>
            techpublisher.vercel.app
          </span>
          <span style={{ fontSize: '20px', color: '#1b4dff', fontWeight: 700 }}>
            Read Reviews & Enter Instagram Codes →
          </span>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
