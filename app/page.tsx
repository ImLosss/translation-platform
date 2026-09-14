import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import "./home.css";

// 1. OPTIMASI SEO (Metadata) & ICONS LENGKAP
export const metadata: Metadata = {
  metadataBase: new URL(process.env.APP_URL || "https://subnova.xyz"),
  title: "SubNova | AI-Powered Subtitle Translation",
  description:
    "Translate your subtitles with unmatched precision using state-of-the-art LLMs. Support .SRT files and Google Drive video extraction.",
  keywords: [
    "subtitle translation",
    "AI translator",
    "SRT translator",
    "LLM translation",
    "video subtitle generator",
  ],
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-48x48.png", sizes: "48x48", type: "image/png" },
      { url: "/favicon-64x64.png", sizes: "64x64", type: "image/png" },
      { url: "/favicon-128x128.png", sizes: "128x128", type: "image/png" },
      { url: "/favicon-256x256.png", sizes: "256x256", type: "image/png" },
      { url: "/favicon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
      { url: "/apple-touch-icon-120x120.png", sizes: "120x120", type: "image/png" },
      { url: "/apple-touch-icon-114x114.png", sizes: "114x114", type: "image/png" },
      { url: "/apple-touch-icon-57x57.png", sizes: "57x57", type: "image/png" },
    ],
  },
  openGraph: {
    title: "SubNova | AI-Powered Subtitle Translation",
    description: "Automate your subtitle workflow with high accuracy and smart glossaries.",
    url: process.env.APP_URL,
    siteName: "SubNova",
    images: [
      {
        url: "/favicon-512x512.png",
        width: 512,
        height: 512,
        alt: "SubNova Logo",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "SubNova | AI-Powered Subtitle Translation",
    description: "Translate your subtitles with unmatched precision using state-of-the-art LLMs.",
    images: ["/favicon-512x512.png"],
  },
};

// 2. INTERFACE
export interface ProviderPricing {
  id: number;
  model: string;
  status: string;
}

// Ambil URL API dari Environment Variable
const API_URL = process.env.API_URL || "";

// 3. ASYNC SERVER COMPONENT
export default async function HomePage() {
  // Fetch data provider dari API
  let providers: ProviderPricing[] = [];
  try {
    const response = await fetch(`${API_URL}/provider/landing`, {
      next: { revalidate: 86400 }, 
    });

    if (response.ok) {
      providers = await response.json();
    } else {
      console.error("Gagal mengambil data provider. Status HTTP:", response.status);
    }
  } catch (error) {
    console.error("Terjadi kesalahan saat fetch provider:", error);
  }

  return (
    <main className="landing-page">
      {/* ===== NAVBAR ===== */}
      <header className="landing-nav">
        <div className="landing-nav-inner">
          <Link href="/" className="landing-logo">
            <div className="logo-icon">
              <Image
                src="/favicon-512x512.png"
                alt="Subnova Logo"
                width={36}
                height={36}
              />
            </div>
            <span className="logo-text">
              Sub<span className="accent">Nova</span>
            </span>
          </Link>

          <nav className="landing-nav-links">
            <Link href="#features">Features</Link>
            <Link href="#models">Models</Link>
            <Link href="#how-it-works">How It Works</Link>
            <Link href="#glossary">Glossary</Link>
          </nav>

          <a
            href="https://app.subnova.xyz"
            className="btn btn-primary landing-login-btn"
          >
            <i className="fab fa-google"></i> Login with Google
          </a>
        </div>
      </header>

      {/* ===== HERO ===== */}
      <section className="landing-hero">
        <div className="landing-hero-content">
          <span className="hero-badge">
            <i className="fas fa-bolt"></i> AI-Powered Subtitle Translation
          </span>
          <h1>
            Translate Subtitles with{" "}
            <span className="gradient-text">Unmatched Precision</span>
          </h1>
          <p>
            Upload your .srt file or drop a public Google Drive video link.
            SubNova extracts the audio, transcribes it, and delivers accurate,
            context‑aware translations in multiple languages.
          </p>
          <div className="hero-actions">
            <a
              href="https://app.subnova.xyz"
              className="btn btn-primary btn-lg"
            >
              <i className="fab fa-google"></i> Get Started with Google
            </a>
            <a href="#how-it-works" className="btn btn-outline btn-lg">
              <i className="fas fa-play"></i> See How It Works
            </a>
          </div>
          <div className="hero-note">
            <i className="fas fa-shield-alt"></i> No credit card required · Cancel anytime
          </div>
        </div>

        <div className="landing-hero-art">
          <div className="hero-card floating">
            <i className="fas fa-file-alt"></i>
            <span>.SRT Files</span>
          </div>
          <div className="hero-card floating delay-1">
            <i className="fas fa-robot"></i>
            <span>LLM Translation</span>
          </div>
          <div className="hero-card floating delay-2">
            <i className="fas fa-globe"></i>
            <span>Multiple Languages</span>
          </div>
          <div className="hero-card floating delay-3">
            <i className="fas fa-file-audio"></i>
            <span>Audio Extraction</span>
          </div>
        </div>
      </section>

      {/* ===== FEATURES ===== */}
      <section id="features" className="landing-section">
        <div className="section-header">
          <h2>Built for Modern Subtitle Workflows</h2>
          <p>Everything you need to deliver flawless subtitles, faster.</p>
        </div>

        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon purple">
              <i className="fas fa-microchip"></i>
            </div>
            <h3>LLM‑Powered Translation</h3>
            <p>
              State‑of‑the‑art language models understand context, idioms, and
              cultural nuances to produce natural subtitle translations.
            </p>
          </div>
          <div className="feature-card">
            <div className="feature-icon green">
              <i className="fas fa-bullseye"></i>
            </div>
            <h3>High Accuracy</h3>
            <p>
              Context‑aware translation ensures terminology stays consistent
              across episodes, movies, and series.
            </p>
          </div>
          <div className="feature-card">
            <div className="feature-icon yellow">
              <i className="fas fa-book"></i>
            </div>
            <h3>Smart Glossary</h3>
            <p>
              Build and manage glossaries from your translation history. The
              model becomes smarter with every job, learning your preferred terms.
            </p>
          </div>
          <div className="feature-card">
            <div className="feature-icon blue">
              <i className="fas fa-cogs"></i>
            </div>
            <h3>100% Automation</h3>
            <p>
              Upload your file or video link, let the AI work, and download the
              result. No manual editing required — unless you want to.
            </p>
          </div>
          <div className="feature-card">
            <div className="feature-icon red">
              <i className="fas fa-globe-asia"></i>
            </div>
            <h3>Multiple Languages</h3>
            <p>
              Translate between languages including English, Indonesian,
              Japanese, Chinese, and more.
            </p>
          </div>
          <div className="feature-card">
            <div className="feature-icon cyan">
              <i className="fas fa-file-audio"></i>
            </div>
            <h3>Audio Extraction</h3>
            <p>
              Provide a public Google Drive video link and SubNova will extract
              the audio, transcribe it, and prepare it for translation.
            </p>
          </div>
        </div>
      </section>

      {/* ===== SUPPORTED MODELS (INFINITE MARQUEE - NO NAME) ===== */}
      <section id="models" className="landing-section section-alt" style={{ overflow: "hidden" }}>
        <div className="section-header">
          <h2>Supported AI Models</h2>
          <p>We leverage industry-leading LLMs to deliver accurate translations.</p>
        </div>

        <div className="models-marquee-wrapper">
          <div className="models-marquee-track">
            {[1, 2].map((loopIndex) => (
              <div key={loopIndex} style={{ display: "flex", gap: "24px" }}>
                {providers && providers.length > 0 ? (
                  providers.map((provider) => (
                    <div key={`${loopIndex}-${provider.id}`} className="model-chip">
                      <div className="chip-left">
                        <span 
                          className={`chip-dot ${
                            provider.status.toLowerCase() === "active" ? "active" : "inactive"
                          }`}
                        ></span>
                        <span className="chip-id">{provider.model}</span>
                      </div>
                      {/* <span className="chip-status-text">
                        {provider.status}
                      </span> */}
                    </div>
                  ))
                ) : (
                  <div className="model-card empty-card">
                    <p className="text-muted">Loading models...</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== HOW IT WORKS ===== */}
      <section id="how-it-works" className="landing-section">
        <div className="section-header">
          <h2>How SubNova Works</h2>
          <p>Three simple steps from input to translated subtitle.</p>
        </div>

        <div className="steps-grid">
          <div className="step-card">
            <div className="step-number">1</div>
            <h3>Upload .SRT or Video Link</h3>
            <p>Drag & drop your .srt file, or paste a public Google Drive video URL.</p>
          </div>
          <div className="step-card">
            <div className="step-number">2</div>
            <h3>AI Transcribes & Translates</h3>
            <p>Audio is extracted, transcription is generated, and LLM translates the content.</p>
          </div>
          <div className="step-card">
            <div className="step-number">3</div>
            <h3>Preview & Download</h3>
            <p>Review the translated subtitles in the preview pane, then download the final .srt file.</p>
          </div>
        </div>
      </section>

      {/* ===== GLOSSARY HIGHLIGHT ===== */}
      <section id="glossary" className="landing-section section-alt">
        <div className="glossary-wrapper">
          <div className="glossary-content">
            <h2>Your Private Glossary, Always Learning</h2>
            <p>
              SubNova remembers your translation history. Create, edit, and
              manage glossaries to maintain consistency across all your projects.
              The more you use it, the smarter it gets.
            </p>
            <ul className="glossary-list">
              <li><i className="fas fa-check-circle"></i> Automatic term extraction</li>
              <li><i className="fas fa-check-circle"></i> Manual glossary management</li>
              <li><i className="fas fa-check-circle"></i> Context‑aware suggestions</li>
              <li><i className="fas fa-check-circle"></i> Project‑specific glossaries</li>
            </ul>
          </div>
          <div className="glossary-visual">
            <div className="glossary-card">
              <div className="glossary-card-header">
                <i className="fas fa-book"></i> Subtitle Glossary
              </div>
              <div className="glossary-term">
                <span className="term-source">Hello, welcome</span>
                <span className="term-arrow">→</span>
                <span className="term-target">Halo, selamat datang</span>
              </div>
              <div className="glossary-term">
                <span className="term-source">Translation platform</span>
                <span className="term-arrow">→</span>
                <span className="term-target">Platform terjemahan</span>
              </div>
              <div className="glossary-term">
                <span className="term-source">Powered by LLM</span>
                <span className="term-arrow">→</span>
                <span className="term-target">Didukung oleh LLM</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== CTA ===== */}
      <section className="landing-cta">
        <h2>Ready to Transform Your Subtitle Workflow?</h2>
        <p>Join production teams using SubNova for high‑accuracy translations.</p>
        <a
          href="https://app.subnova.xyz"
          className="btn btn-primary btn-lg"
        >
          <i className="fab fa-google"></i> Login with Google
        </a>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="landing-footer">
        <div className="footer-inner">
          <div className="footer-logo">
            <Image
              src="/favicon-512x512.png"
              alt="SubNova"
              width={20}
              height={20}
            />
            <span>SubNova</span>
          </div>
          <div className="footer-links">
            <Link href="#features">Features</Link>
            <Link href="#models">Models</Link>
            <Link href="#how-it-works">How It Works</Link>
            <Link href="#glossary">Glossary</Link>
            <a href="https://app.subnova.xyz">Login</a>
          </div>
          <div className="footer-copy">
            &copy; {new Date().getFullYear()} SubNova. All rights reserved.
          </div>
        </div>
      </footer>
    </main>
  );
}