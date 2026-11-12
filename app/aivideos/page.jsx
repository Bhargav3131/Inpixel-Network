import PaymentButton from '../../components/PaymentButton';

export const metadata = {
  title: 'AI Video Studio — 2 Videos for ₹999',
  description: 'High-retention vertical videos for Instagram Reels, Shorts and TikTok without production drag.',
};

export default function AIVideosPage() {
  return (
    <main className="fresh-service-page service-aivideos">
      <section className="fresh-detail-hero">
        <div>
          <p className="fresh-kicker">AI production studio</p>
          <h1>More motion.<br /><em>Less production drag.</em></h1>
          <p>High-retention vertical video made for Reels, Shorts and TikTok—without the timelines or cost of a traditional shoot.</p>
          <a className="fresh-button dark" href="#fresh-plans">See plans ↓</a>
        </div>
      </section>

      <section className="video-reel">
        <div className="video-reel-copy">
          <p className="fresh-kicker">Made for the scroll</p>
          <h2>Three seconds<br />to earn attention.</h2>
          <p>AI production lets your brand test more ideas, speak more often and stay visually fresh.</p>
        </div>
        <div className="phone-reels">
          <video src="/assets/videos/Demo1.mp4" muted autoPlay loop playsInline></video>
          <video src="/assets/videos/Demo2.mp4" muted autoPlay loop playsInline></video>
          <video src="/assets/videos/Demo3.mp4" muted autoPlay loop playsInline></video>
        </div>
      </section>

      <section className="video-process">
        <article>
          <span>01</span>
          <h3>Script shaping</h3>
          <p>We turn your message into a tight narrative.</p>
        </article>
        <article>
          <span>02</span>
          <h3>AI talent</h3>
          <p>Choose a model that fits your brand.</p>
        </article>
        <article>
          <span>03</span>
          <h3>Native format</h3>
          <p>Built in 9:16 for vertical platforms.</p>
        </article>
        <article>
          <span>04</span>
          <h3>Dynamic edit</h3>
          <p>Voice, music, subtitles and pacing included.</p>
        </article>
      </section>

      <section className="fresh-plans" id="fresh-plans">
        <header>
          <p className="fresh-kicker">Simple pricing</p>
          <h2>Choose your<br /><em>starting point.</em></h2>
        </header>
        <div>
          <article className="featured">
            <small>Video package</small>
            <strong>₹999</strong>
            <p className="plan-includes-label">What’s included</p>
            <ul>
              <li>2 vertical AI videos</li>
              <li>Voiceover included</li>
              <li>Auto-captions &amp; subtitles</li>
            </ul>
            <PaymentButton
              serviceId="aivideos"
              planName="AI Videos Package — ₹999"
              amount={99900}
              className="fresh-button light"
            >
              Choose plan ↗
            </PaymentButton>
          </article>
        </div>
      </section>

      <section className="fresh-service-cta">
        <p className="fresh-kicker">Have questions?</p>
        <h2>Let’s find the right<br />way forward.</h2>
        <a className="fresh-button dark" href="https://api.whatsapp.com/send/?phone=919697993131&text=Hello,+I+want+to+get+started+with+Inpixel+network" target="_blank" rel="noopener noreferrer">
          Talk to the studio ↗
        </a>
      </section>
    </main>
  );
}
