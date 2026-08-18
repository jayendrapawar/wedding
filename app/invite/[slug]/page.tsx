'use client'

import { useEffect, useState } from 'react'
import WeddingScene from '@/components/wedding-scene'
import { getGuestBySlug, saveRSVP, getRSVPs } from '@/lib/store'

const events = [
  { time: '4:30 PM', title: 'The Ceremony', detail: 'A sacred beginning beneath the old banyan tree', icon: '01' },
  { time: '6:30 PM', title: 'Cocktails & Canapés', detail: 'An evening of music, laughter, and golden light', icon: '02' },
  { time: '8:00 PM', title: 'Dinner & Dancing', detail: 'A feast to remember, followed by a night of celebration', icon: '03' },
]

const gallery = [
  { src: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1000&q=85', alt: 'Couple walking together outdoors', caption: 'The first chapter' },
  { src: 'https://images.unsplash.com/photo-1606800052052-a08af7148866?auto=format&fit=crop&w=1000&q=85', alt: 'Wedding flowers in warm sunlight', caption: 'Little details' },
  { src: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1000&q=85', alt: 'Wedding celebration with friends', caption: 'A room full of joy' },
  { src: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=1000&q=85', alt: 'Wedding rings and flowers', caption: 'Forever begins' },
  { src: 'https://images.unsplash.com/photo-1507504031003-b417219a0fde?auto=format&fit=crop&w=1000&q=85', alt: 'Wedding couple in golden light', caption: 'Golden hour' },
]

export default function InvitePage({ params }: { params: Promise<{ slug: string }> }) {
  const [slug, setSlug] = useState('')
  const [guestName, setGuestName] = useState('')
  const [menuOpen, setMenuOpen] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [opened, setOpened] = useState(false)
  const [opening, setOpening] = useState(false)
  const [language, setLanguage] = useState<'en' | 'hi'>('en')
  const [galleryPaused, setGalleryPaused] = useState(false)
  const [galleryHovered, setGalleryHovered] = useState(false)

  useEffect(() => {
    params.then(p => {
      setSlug(p.slug)
      const guest = getGuestBySlug(p.slug)
      if (guest) {
        setGuestName(guest.name)
        const existing = getRSVPs().find(r => r.guestId === guest.id)
        if (existing) setSubmitted(true)
      }
    })
  }, [params])

  useEffect(() => {
    const reveal = () => document.querySelectorAll<HTMLElement>('.reveal').forEach(el => {
      if (el.getBoundingClientRect().top < window.innerHeight * 0.88) el.classList.add('in')
    })
    reveal()
    window.addEventListener('scroll', reveal)
    window.addEventListener('resize', reveal)
    return () => { window.removeEventListener('scroll', reveal); window.removeEventListener('resize', reveal) }
  }, [opened])

  const openInvitation = () => {
    if (opening || opened) return
    setOpening(true)
    window.setTimeout(() => setOpened(true), 1150)
  }

  const handleRSVP = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    const data = new FormData(form)
    const guest = getGuestBySlug(slug)
    saveRSVP({
      guestId: guest?.id ?? slug,
      guestName: guest?.name ?? guestName,
      attendance: data.get('attendance') as 'yes' | 'no',
      message: data.get('message') as string ?? '',
      submittedAt: new Date().toISOString(),
    })
    setSubmitted(true)
  }

  const goTo = (id: string) => { document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' }); setMenuOpen(false) }
  const copy = language === 'hi'
    ? { invite: 'हमारे साथ उत्सव मनाइए', rsvp: 'उत्तर दें', programme: 'शुभ दिन' }
    : { invite: 'Together with their families', rsvp: 'Explore the celebration', programme: 'The day' }
  const galleryLoop = [...gallery, ...gallery, ...gallery, ...gallery]
  const displayName = guestName || decodeURIComponent(slug.replace(/-/g, ' '))

  return (
    <>
      <div className={`envelope-screen ${opening ? 'is-opening' : ''} ${opened ? 'is-hidden' : ''}`} aria-hidden={opened}>
        <div className="opening-stars" aria-hidden="true"><i /><i /><i /></div>
        <div className="env-title">
          <p className="eyebrow">You&apos;re invited</p>
          {displayName && (
            <p className="invite-guest-name">Dear {displayName},</p>
          )}
          <p className="env-script">Sonalika &amp; Jayendra</p>
          <p className="env-date">14 · 03 · 27 <span>—</span> Jaipur</p>
        </div>
        <button className="envelope" onClick={openInvitation} onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openInvitation() } }} aria-label="Open wedding invitation">
          <span className="env-body" /><span className="env-flap" /><span className="env-letter">Our wedding story awaits</span><span className="env-seal">S<span>&amp;</span>J</span>
        </button>
        <p className="env-hint">Tap the seal to open</p>
        <div className="opening-progress" aria-hidden="true"><span /></div>
      </div>

      <main className="site-shell">
        <div className="story-progress" aria-label="Story chapters"><span className="progress-dot active" /><span /><span /><span /><span /></div>
        <header className="topbar">
          <button className="monogram" onClick={() => goTo('home')} aria-label="Back to top">S<span>&amp;</span>J</button>
          <nav className={`nav-links ${menuOpen ? 'is-open' : ''}`} aria-label="Main navigation">
            <button onClick={() => goTo('story')}>Our story</button>
            <button onClick={() => goTo('details')}>{copy.programme}</button>
            <button onClick={() => goTo('gallery')}>Gallery</button>
            <button onClick={() => goTo('rsvp')}>{copy.rsvp}</button>
          </nav>
          <div className="top-actions">
            <div className="language-toggle" aria-label="Language">
              <button className={language === 'en' ? 'active' : ''} onClick={() => setLanguage('en')}>EN</button>
              <button className={language === 'hi' ? 'active' : ''} onClick={() => setLanguage('hi')}>HI</button>
            </div>
            <button className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)} aria-expanded={menuOpen} aria-label="Toggle menu">{menuOpen ? 'Close' : 'Menu'}</button>
          </div>
        </header>

        <section id="home" className="hero section-pad chapter">
          <div className="chapter-index">Chapter 01 / Welcome</div>
          <div className="hero-copy">
            <p className="eyebrow">{copy.invite}</p>
            <h1>Sonalika <em>&amp;</em><br />Jayendra</h1>
            <p className="hero-date">Saturday, 14 March 2027 <span>·</span> Jaipur, India</p>
            {displayName && <p className="invite-personal">We joyfully invite<br /><strong>{displayName}</strong></p>}
            <button className="text-link" onClick={() => goTo('details')}>{copy.rsvp} <span>↓</span></button>
          </div>
          <div className="hero-art hero-art-3d">
            <WeddingScene />
            <div className="scene-overlay"><span>an invitation in motion</span><strong>14 · 03 · 27</strong></div>
            <p className="image-caption">A new chapter<br /><span>begins here</span></p>
            <div className="seal" aria-hidden="true">14<br /><small>MAR</small><br />27</div>
          </div>
        </section>

        <div className="marquee" aria-hidden="true"><span>THE BEGINNING OF FOREVER</span><span>THE BEGINNING OF FOREVER</span><span>THE BEGINNING OF FOREVER</span></div>

        <section id="story" className="story section-pad chapter reveal">
          <div className="chapter-index">Chapter 02 / Our story</div>
          <div className="section-label">II · Our story</div>
          <div className="story-grid">
            <h2>Two hearts,<br /><em>one beautiful</em><br />adventure.</h2>
            <div className="story-copy">
              <p>What began as a chance meeting became a thousand little moments we never want to forget.</p>
              <p>Now, surrounded by the people who made us who we are, we invite you to celebrate the start of our forever.</p>
              <span className="signature">With love, S &amp; J</span>
            </div>
          </div>
        </section>

        <section id="details" className="details section-pad chapter reveal">
          <div className="chapter-index">Chapter 03 / The day</div>
          <div className="section-label">III · The day</div>
          <div className="details-heading"><h2>A day to <em>remember.</em></h2><p>Come as you are, stay for the magic.</p></div>
          <div className="event-list">{events.map(ev => (
            <article className="event-row" key={ev.icon}>
              <span className="event-number">{ev.icon}</span>
              <div><p className="event-time">{ev.time}</p><h3>{ev.title}</h3></div>
              <p className="event-detail">{ev.detail}</p>
              <span className="event-arrow">↗</span>
            </article>
          ))}</div>
          <div className="venue-card">
            <div>
              <p className="eyebrow">The venue</p>
              <h3>Rambagh Palace</h3>
              <p>Bhawan Singh Road, Jaipur<br />Rajasthan 302005, India</p>
              <button className="text-link">View on map ↗</button>
            </div>
            <div className="venue-image"><img src="https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=900&q=85" alt="Historic palace architecture in India" /></div>
          </div>
        </section>

        <section id="gallery" className="gallery section-pad chapter reveal">
          <div className="chapter-index">Chapter 04 / In pictures</div>
          <div className="section-label">IV · In pictures</div>
          <h2>A little <em>love story.</em></h2>
          <div className="gallery-stage" onMouseEnter={() => setGalleryHovered(true)} onMouseLeave={() => setGalleryHovered(false)}>
            <div className="gallery-track" style={{ animationPlayState: galleryPaused || galleryHovered ? 'paused' : 'running' }}>
              {galleryLoop.map((img, i) => (
                <figure className={`gallery-card gallery-card-${(i % 4) + 1}`} key={i}>
                  <img src={img.src} alt={img.alt} /><figcaption>{img.caption}</figcaption>
                </figure>
              ))}
            </div>
          </div>
          <div className="gallery-meta">
            <button onClick={() => setGalleryPaused(!galleryPaused)}>{galleryPaused ? 'Play slideshow' : 'Pause slideshow'}</button>
          </div>
        </section>

        <section id="rsvp" className="rsvp section-pad chapter reveal">
          <div className="chapter-index">Chapter 05 / Kindly reply</div>
          <div className="section-label">V · Kindly reply</div>
          <div className="rsvp-inner">
            <h2>Will you join<br /><em>our celebration?</em></h2>
            {submitted ? (
              <div className="success-message">
                <span>Thank you{displayName ? `, ${displayName.split(' ')[0]}` : ''}.</span>
                <p>Your response has been received. We cannot wait to see you there.</p>
              </div>
            ) : (
              <form onSubmit={handleRSVP}>
                <label>Your name<input required name="name" defaultValue={displayName} placeholder="Your name" /></label>
                <label>Will you be joining us?
                  <select name="attendance" defaultValue="yes">
                    <option value="yes">Joyfully accepts</option>
                    <option value="no">Regretfully declines</option>
                  </select>
                </label>
                <label>A message for us (optional)<input name="message" placeholder="Your wishes…" /></label>
                <button className="submit-button" type="submit">Send my RSVP <span>↗</span></button>
              </form>
            )}
          </div>
        </section>

        <footer>
          <div className="footer-monogram">S <span>&amp;</span> J</div>
          <p>14 · 03 · 27 <span>—</span> Jaipur, India</p>
          <p className="footer-note">Made with love for our favourite people.</p>
        </footer>
      </main>
    </>
  )
}
