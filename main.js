(function () {
  const routeNames = new Set(['adminpanel','aivideos','blog','dash','metaads','privacy','quotation','services','socialmedia','terms','userlogin','webdevelopment'])
  const pathParts = decodeURIComponent(location.pathname).split('/').filter(Boolean)
  let route = pathParts[0] || 'home'
  if (route === 'index.html') route = 'home'
  let baseHref = '/'
  if (location.protocol === 'file:') {
    const parent = pathParts.at(-2)
    route = routeNames.has(parent) ? parent : 'home'
    const currentDirectory = new URL('.', location.href)
    baseHref = route === 'home' ? currentDirectory.href : new URL('../', currentDirectory).href
  }
  const base = document.createElement('base')
  base.href = baseHref
  document.head.prepend(base)
  document.body.dataset.page = route

  const links = `
    <a href="webdevelopment/">Websites</a>
    <a href="aivideos/">AI Videos</a>
    <a href="metaads/">Meta Ads</a>
    <a href="socialmedia/">Social Media</a>
    <a href="quotation/">Quotation</a>
    <a class="fresh-nav-cta" href="userlogin/">Client Login ↗</a>`

  const freshNav = () => `
    <header class="fresh-nav">
      <a class="fresh-brand" href="./"><img src="logo1.jpeg" alt="Inpixel Network"><span>Inpixel Network</span></a>
      <button class="fresh-menu" aria-label="Toggle menu"><span></span><span></span></button>
      <nav>${links}</nav>
    </header>`

  const footer = `
    <footer class="fresh-footer">
      <div><a class="fresh-brand" href="./"><img src="logo1.jpeg" alt="Inpixel Network"><span>Inpixel Network</span></a><p>We turn ambitious businesses into memorable digital brands.</p></div>
      <div><small>Explore</small><a href="services/">Services</a><a href="quotation/">Quotation Software</a><a href="blog/">Blog</a></div>
      <div><small>Company</small><a href="terms/">Terms & Conditions</a><a href="privacy/">Privacy Policy</a><a href="userlogin/">Client Portal</a></div>
      <div><small>Connect</small><a href="mailto:supportinpixelnetwork@gmail.com">Email</a><a href="https://instagram.com/inpixel_network" target="_blank" rel="noopener">Instagram</a><a href="https://wa.me/919697993131" target="_blank" rel="noopener">WhatsApp</a></div>
      <p class="fresh-copy">© 2026 Inpixel Network · Pune, India · <a href="terms/">Terms</a> · <a href="privacy/">Privacy</a></p>
    </footer>`

  const activate = (shell) => {
    document.body.classList.add('fresh-build')
    document.body.prepend(shell)
    const menu = shell.querySelector('.fresh-menu')
    menu?.addEventListener('click', () => shell.querySelector('.fresh-nav nav')?.classList.toggle('open'))
    if (window.INPIXEL_PRICES && typeof window.applyLivePrices === 'function') {
      window.applyLivePrices(window.INPIXEL_PRICES)
    }
  }

  function buildHome() {
    const form = document.getElementById('mainForm')
    const success = document.getElementById('mainSuccess')
    const shell = document.createElement('div')
    shell.className = 'fresh-shell'
    shell.innerHTML = `${freshNav()}
      <main>
        <section class="fresh-hero">
          <div class="fresh-hero-copy">
            <p class="fresh-kicker"><span></span> Strategy · Design · Momentum</p>
            <h1>Make your<br>brand <em>matter.</em></h1>
            <p class="fresh-lede">A compact digital studio building high-converting websites, social systems, AI video and performance campaigns for growing Indian businesses.</p>
            <div class="fresh-actions"><a class="fresh-button dark" href="https://api.whatsapp.com/send/?phone=919697993131">Build with us <b>↗</b></a><a href="#fresh-work">See our services ↓</a></div>
          </div>
          <div class="fresh-hero-visual">
            <div class="fresh-orbit"></div><div class="fresh-orbit second"></div>
            <div class="fresh-pixels">${'<i></i>'.repeat(9)}</div>
            <div class="fresh-float one"><small>Average growth</small><strong>+300%</strong></div>
            <div class="fresh-float two"><span></span> 12 campaigns live</div>
            <p>ONE PIXEL AT A TIME</p>
          </div>
        </section>
        <section class="fresh-proof">
          <p>Trusted by growing businesses across India</p>
          <div><strong>150+</strong><span>brands partnered</span></div><div><strong>5M+</strong><span>people reached</span></div><div><strong>24/7</strong><span>partner support</span></div>
        </section>
        <section class="fresh-work" id="fresh-work">
          <header><p class="fresh-kicker">What we build</p><h2>Four ways to move<br><em>your business forward.</em></h2></header>
          <div class="fresh-service-list">
            <a href="webdevelopment/"><span>01</span><div><small>Design + Development</small><h3>Web experiences</h3><p>Fast, mobile-first websites engineered to convert attention into action.</p></div><b>From ₹2,999 ↗</b></a>
            <a href="socialmedia/"><span>02</span><div><small>Content + Community</small><h3>Social systems</h3><p>Strategy, design, calendars and reporting—handled from end to end.</p></div><b>₹999 / month ↗</b></a>
            <a href="aivideos/"><span>03</span><div><small>Concept + Production</small><h3>AI video studio</h3><p>Scroll-stopping vertical stories produced at the speed of culture.</p></div><b>2 videos for ₹999 ↗</b></a>
            <a href="metaads/"><span>04</span><div><small>Targeting + Scale</small><h3>Performance ads</h3><p>Campaigns built around accountable growth, not vanity metrics.</p></div><b>₹2,999 / month ↗</b></a>
          </div>
        </section>
        <section class="fresh-method">
          <div><p class="fresh-kicker">Our operating system</p><h2>Less theatre.<br>More traction.</h2><p>Senior thinking, clear communication and fast execution from a team that treats your business like its own.</p></div>
          <ol><li><span>01</span><h3>Find the signal</h3><p>We audit your brand, audience and market.</p></li><li><span>02</span><h3>Build the system</h3><p>A focused plan connects creative to outcomes.</p></li><li><span>03</span><h3>Ship and learn</h3><p>We launch, measure and improve continuously.</p></li></ol>
        </section>
        <section class="fresh-contact" id="fresh-contact">
          <div><p class="fresh-kicker">Ready when you are</p><h2>Tell us what<br>you’re building.</h2><p>Share the ambition. We’ll reply with the clearest next step.</p></div>
          <div class="fresh-form-slot"></div>
        </section>
      </main>${footer}`
    shell.querySelector('.fresh-form-slot')?.append(form, success)
    activate(shell)
  }

  const serviceData = {
    webdevelopment: {
      eyebrow: 'Digital flagship', title: 'Websites that turn<br><em>visits into value.</em>',
      intro: 'Strategy, UX, design and development in one focused sprint. Built fast, responsive everywhere, and ready to sell.',
      image: 'assets/images/website-mockup.png', metric: ['7 days','starter delivery'],
      features: [['Mobile-first','Designed around the screen your customers use most.'],['Conversion-led','Every page gives visitors a clear next action.'],['Search-ready','Technical foundations built for discoverability.'],['Easy to scale','A clean system that grows with your business.']],
      plans: [['Starter','₹2,999','Single landing page · Mobile-first · Contact form',"openPaymentModal('webdevelopment-starter','Starter Plan — ₹2,999',299900)"],['Professional','₹5,999','Up to 5 pages · Custom UI · Analytics + Pixel',"openPaymentModal('webdevelopment-pro','Professional Plan — ₹5,999',599900)"]]
    },
    socialmedia: {
      eyebrow: 'Always-on brand', title: 'A social presence<br><em>worth following.</em>',
      intro: 'Consistent creative, sharp captions and an intentional calendar that keeps your brand relevant without taking over your week.',
      image: 'assets/images/social-media-showcase.png', metric: ['15','posts every month'],
      features: [['Content strategy','A monthly direction rooted in your audience.'],['Designed posts','Ten static posts and five considered carousels.'],['Brand voice','Captions that sound recognisably like you.'],['Useful reporting','Clear learning on reach and engagement.']],
      plans: [['Monthly system','₹999','15 posts · Captions · Hashtags · Monthly report',"openPaymentModal('socialmedia','Social Media Package — ₹999/month',99900)"]]
    },
    aivideos: {
      eyebrow: 'AI production studio', title: 'More motion.<br><em>Less production drag.</em>',
      intro: 'High-retention vertical video made for Reels, Shorts and TikTok—without the timelines or cost of a traditional shoot.',
      image: 'assets/images/ai-video-showcase.png', metric: ['48 hrs','from script lock'],
      features: [['Script shaping','We turn your message into a tight narrative.'],['AI talent','Choose a model that fits your brand.'],['Native format','Built in 9:16 for vertical platforms.'],['Dynamic edit','Voice, music, subtitles and pacing included.']],
      plans: [['Video package','₹999','2 vertical AI videos · Voiceover · Subtitles',"openPaymentModal('aivideos','AI Videos Package — ₹999',99900)"]]
    },
    metaads: {
      eyebrow: 'Paid growth', title: 'Every rupee<br><em>has a job.</em>',
      intro: 'Backed by over 2 years of hands-on experience and ₹50 lakh+ in managed ad spend, we build structured Meta campaigns that turn budget into measurable business.',
      image: 'assets/images/meta-ads-dashboard.png', metric: ['₹50L+','ad spend managed · 2+ years'],
      features: [['Full setup','Campaign architecture, Pixel and CAPI.'],['Smart audiences','Interest, demographic and intent targeting.'],['Active optimisation','Continuous budget and bid refinement.'],['Weekly clarity','CPA and ROAS reporting without jargon.']],
      plans: [['Monthly management','₹2,999','Campaign setup · Optimisation · Weekly reporting',"openPaymentModal('metaads','Meta Ads Management — ₹2,999/month',299900)"]]
    },
    quotation: {
      eyebrow: 'Business utility', title: 'Professional quotes.<br><em>Made in minutes.</em>',
      intro: 'A focused quotation tool that helps your business look credible, move quickly and close work without subscription fatigue.',
      image: 'assets/images/digital-creation-workspace.png', metric: ['Lifetime','one-time access'],
      features: [['Branded output','Your logo, business identity and details.'],['Instant PDF','Download polished quotations in one click.'],['Tax ready','GST, discounts and totals calculated cleanly.'],['Always yours','Future updates with no recurring fee.']],
      plans: [['Lifetime access','₹2,999','One payment · Unlimited quotations · Future updates',"openPaymentModal('quotation','Inpixel Quotation Software — ₹2,999 Lifetime',299900)"]]
    }
  }

  const featureCards = (data) => data.features.map((f,i)=>`<article><span>0${i+1}</span><h3>${f[0]}</h3><p>${f[1]}</p></article>`).join('')
  const planCards = (data) => data.plans.map((p,i)=>`<article class="${i===data.plans.length-1?'featured':''}"><small>${p[0]}</small><strong>${p[1]}</strong><p class="plan-includes-label">What’s included</p><ul>${p[2].split(' · ').map(item=>`<li>${item}</li>`).join('')}</ul><button class="fresh-button ${i===data.plans.length-1?'light':'dark'}" onclick="${p[3]}">Choose plan ↗</button></article>`).join('')

  function uniqueServiceBody(data, route) {
    if (route === 'webdevelopment') return `
      <section class="web-browser-stage"><div class="browser-chrome"><i></i><i></i><i></i><span>yourbrand.in</span></div><img src="${data.image}" alt="Website design showcase"></section>
      <section class="web-system"><header><p class="fresh-kicker">Built from the customer backwards</p><h2>Strategy first.<br>Then every pixel.</h2></header><div class="web-system-grid">${featureCards(data)}</div></section>`
    if (route === 'socialmedia') return `
      <section class="social-collage"><header><p class="fresh-kicker">A month of momentum</p><h2>Not “more content.”<br><em>A recognisable brand.</em></h2></header><div class="social-wall"><figure><img src="assets/images/social-media-showcase.png" alt="Social media feed"><b>01 / Feed system</b></figure><figure><img src="assets/images/social-media-content.png" alt="Content creation"><b>02 / Content engine</b></figure><figure><img src="assets/images/social-media-strategy.png" alt="Social strategy"><b>03 / Growth plan</b></figure></div><div class="social-features">${featureCards(data)}</div></section>`
    if (route === 'aivideos') return `
      <section class="video-reel"><div class="video-reel-copy"><p class="fresh-kicker">Made for the scroll</p><h2>Three seconds<br>to earn attention.</h2><p>AI production lets your brand test more ideas, speak more often and stay visually fresh.</p></div><div class="phone-reels"><video src="assets/videos/Demo1.mp4" muted autoplay loop playsinline></video><video src="assets/videos/Demo2.mp4" muted autoplay loop playsinline></video><video src="assets/videos/Demo3.mp4" muted autoplay loop playsinline></video></div></section><section class="video-process">${featureCards(data)}</section>`
    if (route === 'metaads') return `
      <section class="ads-console"><div class="ads-console-head"><p class="fresh-kicker">Proven performance experience</p><h2>₹50 lakh+<br>managed.</h2><p>Over 2 years of hands-on Meta Ads campaign experience.</p></div><div class="ads-chart"><div class="ads-bars">${[28,42,37,61,55,78,93].map(v=>`<i style="height:${v}%"></i>`).join('')}</div><div class="ads-metrics"><span><small>Ad spend managed</small><strong>₹50L+</strong></span><span><small>Experience</small><strong>2+ yrs</strong></span><span><small>Reporting</small><strong>Weekly</strong></span></div></div></section><section class="ads-flow">${featureCards(data)}</section>`
    return `
      <section class="quote-product"><div><video src="assets/demo-quotation.mp4" muted autoplay loop playsinline></video></div><aside><p class="fresh-kicker">From blank to sent</p><h2>Look established.<br>Move faster.</h2>${featureCards(data)}</aside></section>`
  }

  function buildService(data, route) {
    const shell = document.createElement('div')
    shell.className = `fresh-shell fresh-service-page service-${route}`
    shell.innerHTML = `${freshNav()}<main>
      <section class="fresh-detail-hero"><div><p class="fresh-kicker">${data.eyebrow}</p><h1>${data.title}</h1><p>${data.intro}</p><a class="fresh-button dark" href="#fresh-plans">See plans ↓</a></div><figure><img src="${data.image}" alt=""><figcaption><strong>${data.metric[0]}</strong><span>${data.metric[1]}</span></figcaption></figure></section>
      ${uniqueServiceBody(data, route)}
      <section class="fresh-plans" id="fresh-plans"><header><p class="fresh-kicker">Simple pricing</p><h2>Choose your<br><em>starting point.</em></h2></header><div>${planCards(data)}</div></section>
      <section class="fresh-service-cta"><p class="fresh-kicker">Have questions?</p><h2>Let’s find the right<br>way forward.</h2><a class="fresh-button dark" href="https://api.whatsapp.com/send/?phone=919697993131">Talk to the studio ↗</a></section>
    </main>${footer}`
    activate(shell)
  }

  function buildServices() {
    const shell = document.createElement('div')
    shell.className = 'fresh-shell'
    shell.innerHTML = `${freshNav()}<main><section class="fresh-index-hero"><p class="fresh-kicker">Capabilities</p><h1>Built to make<br><em>brands move.</em></h1><p>Pick one focused service or connect them into a complete growth system.</p></section><section class="fresh-service-index">${Object.entries(serviceData).filter(([key])=>key!=='quotation').map(([key,d],i)=>`<a href="${key}/"><span>0${i+1}</span><div><small>${d.eyebrow}</small><h2>${d.title.replace('<br>',' ')}</h2><p>${d.intro}</p></div><b>Explore ↗</b></a>`).join('')}</section></main>${footer}`
    activate(shell)
  }

  function rebuildBlog() {
    const grid = document.getElementById('blogGrid')
    const more = document.getElementById('loadMoreContainer')
    const shell = document.createElement('div')
    shell.className = 'fresh-shell'
    shell.innerHTML = `${freshNav()}<main><section class="fresh-index-hero blog"><p class="fresh-kicker">Inpixel Blog</p><h1>Ideas for<br><em>digital growth.</em></h1><p>Practical insights on digital marketing, websites, content and building a stronger online business.</p></section><section class="fresh-journal"><div class="fresh-journal-grid"></div><div class="fresh-more"></div></section></main>${footer}`
    shell.querySelector('.fresh-journal-grid')?.append(grid)
    shell.querySelector('.fresh-more')?.append(more)
    activate(shell)
  }

  function rebuildLegal() {
    const body = document.querySelector('.legal-body .legal-max')
    const title = document.querySelector('.page-hero-h1')?.textContent || 'Legal'
    const meta = document.querySelector('.legal-meta')?.textContent || ''
    const shell = document.createElement('div')
    shell.className = 'fresh-shell'
    shell.innerHTML = `${freshNav()}<main><section class="fresh-legal-hero"><p class="fresh-kicker">The fine print</p><h1>${title}</h1><p>${meta}</p></section><section class="fresh-legal"><aside><span>INPIXEL NETWORK</span><p>Clear terms, written for humans.</p><a href="mailto:supportinpixelnetwork@gmail.com">Questions? Email us ↗</a></aside><article class="fresh-legal-copy"></article></section></main>${footer}`
    shell.querySelector('.fresh-legal-copy')?.append(...Array.from(body?.children || []))
    activate(shell)
  }

  function rebuildPortal() {
    const portal = document.querySelector('.page-split')
    if (!portal) return
    const shell = document.createElement('div')
    shell.className = 'fresh-shell fresh-portal'
    shell.innerHTML = `${freshNav()}<main class="fresh-portal-main"></main>`
    shell.querySelector('.fresh-portal-main')?.append(portal)
    activate(shell)
  }

  try {
    if (route === 'home') buildHome()
    else if (serviceData[route]) buildService(serviceData[route], route)
    else if (route === 'services') buildServices()
    else if (route === 'blog') rebuildBlog()
    else if (route === 'privacy' || route === 'terms') rebuildLegal()
    else if (route === 'userlogin') rebuildPortal()
    else {
      document.body.classList.add('fresh-app')
    }
  } catch (err) {
    console.error('Redesign shell error:', err)
    document.body.classList.add('fresh-build')
  }
})()
