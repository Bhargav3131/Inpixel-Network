import Link from 'next/link';
import ContactForm from '../components/ContactForm';

export default function HomePage() {
  return (
    <main>
      <section className="fresh-hero">
        <div className="fresh-hero-copy">
          <p className="fresh-kicker">
            <span></span> Strategy · Design · Momentum
          </p>
          <h1>
            Make your<br />brand <em>matter.</em>
          </h1>
          <p className="fresh-lede">
            A compact digital studio building high-converting websites, social systems, AI video and performance campaigns for growing Indian businesses.
          </p>
          <div className="fresh-actions">
            <a className="fresh-button dark" href="https://api.whatsapp.com/send/?phone=919697993131&text=Hello,+I+want+to+get+started+with+Inpixel+network" target="_blank" rel="noopener noreferrer">
              Build with us <b>↗</b>
            </a>
            <a href="#fresh-work">See our services ↓</a>
          </div>
        </div>
        <div className="fresh-hero-visual">
          <div className="fresh-orbit"></div>
          <div className="fresh-orbit second"></div>
          <div className="fresh-pixels">
            {Array.from({ length: 9 }).map((_, i) => (
              <i key={i}></i>
            ))}
          </div>
          <div className="fresh-float one">
            <small>Average growth</small>
            <strong>+300%</strong>
          </div>
          <div className="fresh-float two">
            <span></span> 12 campaigns live
          </div>
          <p>ONE PIXEL AT A TIME</p>
        </div>
      </section>

      <section className="fresh-proof">
        <p>Trusted by growing businesses across India</p>
        <div>
          <strong>150+</strong>
          <span>brands partnered</span>
        </div>
        <div>
          <strong>5M+</strong>
          <span>people reached</span>
        </div>
        <div>
          <strong>24/7</strong>
          <span>partner support</span>
        </div>
      </section>

      <section className="fresh-work" id="fresh-work">
        <header>
          <p className="fresh-kicker">What we build</p>
          <h2>
            Four ways to move<br /><em>your business forward.</em>
          </h2>
        </header>
        <div className="fresh-service-list">
          <Link href="/webdevelopment">
            <span>01</span>
            <div>
              <small>Design + Development</small>
              <h3>Web experiences</h3>
              <p>Fast, mobile-first websites engineered to convert attention into action.</p>
            </div>
            <b>From ₹2,999 ↗</b>
          </Link>
          <Link href="/socialmedia">
            <span>02</span>
            <div>
              <small>Content + Community</small>
              <h3>Social systems</h3>
              <p>Strategy, design, calendars and reporting—handled from end to end.</p>
            </div>
            <b>₹999 / month ↗</b>
          </Link>
          <Link href="/aivideos">
            <span>03</span>
            <div>
              <small>Concept + Production</small>
              <h3>AI video studio</h3>
              <p>Scroll-stopping vertical stories produced at the speed of culture.</p>
            </div>
            <b>2 videos for ₹999 ↗</b>
          </Link>
          <Link href="/metaads">
            <span>04</span>
            <div>
              <small>Targeting + Scale</small>
              <h3>Performance ads</h3>
              <p>Campaigns built around accountable growth, not vanity metrics.</p>
            </div>
            <b>₹2,999 / month ↗</b>
          </Link>
        </div>
      </section>

      <section className="fresh-method">
        <div>
          <p className="fresh-kicker">Our operating system</p>
          <h2>Less theatre.<br />More traction.</h2>
          <p>Senior thinking, clear communication and fast execution from a team that treats your business like its own.</p>
        </div>
        <ol>
          <li>
            <span>01</span>
            <h3>Find the signal</h3>
            <p>We audit your brand, audience and market.</p>
          </li>
          <li>
            <span>02</span>
            <h3>Build the system</h3>
            <p>A focused plan connects creative to outcomes.</p>
          </li>
          <li>
            <span>03</span>
            <h3>Ship and learn</h3>
            <p>We launch, measure and improve continuously.</p>
          </li>
        </ol>
      </section>

      <section className="fresh-contact" id="fresh-contact">
        <div>
          <p className="fresh-kicker">Ready when you are</p>
          <h2>Tell us what<br />you’re building.</h2>
          <p>Share the ambition. We’ll reply with the clearest next step.</p>
        </div>
        <div className="fresh-form-slot">
          <ContactForm />
        </div>
      </section>
    </main>
  );
}
