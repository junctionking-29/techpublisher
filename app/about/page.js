const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

export const metadata = {
  title: 'About Our Publication',
  description: 'Learn about TechPublisher’s editorial mission, our technical testing standards, and our commitment to independent consumer reporting.',
  alternates: {
    canonical: `${siteUrl}/about`,
  },
};

export default function AboutPage() {
  return (
    <div className="reading-container static-page-wrapper">
      <header className="static-page-header">
        <h1 className="static-page-title">About TechPublisher</h1>
        <p className="static-page-updated">Established 2024 · Independent Technical Journalism</p>
      </header>

      <section className="static-content">
        <p>
          <strong>TechPublisher</strong> is an independent digital publication committed to forensic, mathematically grounded coverage of consumer technology, semiconductor physics, and foundational artificial intelligence research.
        </p>

        <h2>Our Editorial Charter</h2>
        <p>
          In an era where technology reporting is increasingly diluted by corporate press releases, social media clickbait, and superficial unboxing videos, TechPublisher adheres to a rigorous empirical methodology. Every product we review spends weeks on physical test benches rather than days in staged studio lighting.
        </p>
        <p>
          Our team comprises hardware engineers, former academic researchers, and investigative technology journalists who prioritize technical depth over viral hype. We do not publish sponsor-directed reviews, we do not accept paid product inclusions, and we maintain an absolute firewall between our editorial desk and commercial monetization.
        </p>

        <h2>What We Cover</h2>
        <ul>
          <li>
            <strong>Gadget & Hardware Reviews:</strong> Real-world battery drain tests, display colorimeter calibration, thermal throttling analysis, and tactile input ergonomics.
          </li>
          <li>
            <strong>Silicon & Architecture:</strong> Transistor topologies, lithography transitions (FinFET to Gate-All-Around), packaging innovations, and memory subsystem performance.
          </li>
          <li>
            <strong>Machine Learning & Research Explainers:</strong> Deconstructing preprints from arXiv, dissecting training loss formulations, and explaining algorithmic breakthroughs for working engineers.
          </li>
        </ul>

        <h2>Multimedia & Verification Codes</h2>
        <p>
          Our video dispatches on Instagram and social networks provide quick visual overviews of complex technical subjects. To ensure viewers have direct access to our verified source files, raw benchmarks, and manufacturer documentation without link rot or misleading algorithmic redirects, each video features a unique verification code.
        </p>
        <p>
          Entering that code on our homepage or within any article instantly unlocks the exact, unadulterated primary source destination.
        </p>
      </section>
    </div>
  );
}
