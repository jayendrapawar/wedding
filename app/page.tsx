'use client'

import { useEffect, useState } from 'react'
import { AnimatePresence, motion, useScroll, useSpring, useTransform, type Variants } from 'framer-motion'
import WeddingScene from '@/components/wedding-scene'
import { saveRSVP, uid } from '@/lib/store'

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

const easeOut = [0.22, 1, 0.36, 1] as const

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 34 },
  show: { opacity: 1, y: 0, transition: { duration: 0.9, ease: easeOut } },
}

const stagger: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.14, delayChildren: 0.08 } },
}

const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.94 },
  show: { opacity: 1, scale: 1, transition: { duration: 0.9, ease: easeOut } },
}

export default function Page() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [opened, setOpened] = useState(false)
  const [opening, setOpening] = useState(false)
  const [soundOn, setSoundOn] = useState(false)
  const [language, setLanguage] = useState<'en' | 'hi'>('en')
  const [galleryPaused, setGalleryPaused] = useState(false)
  const [galleryHovered, setGalleryHovered] = useState(false)

  useEffect(() => {}, [])

  const { scrollYProgress } = useScroll()
  const progressScale = useSpring(scrollYProgress, { stiffness: 90, damping: 24, mass: 0.3 })
  const heroY = useTransform(scrollYProgress, [0, 0.25], [0, -60])
  const heroRotate = useTransform(scrollYProgress, [0, 0.25], [0, -3])

  const openInvitation = () => {
    if (opening || opened) return
    setOpening(true)
    window.setTimeout(() => setOpened(true), 1150)
  }
  const goTo = (id: string) => { document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' }); setMenuOpen(false) }
  const copy = language === 'hi' ? { invite: 'हमारे साथ उत्सव मनाइए', rsvp: 'उत्तर दें', programme: 'शुभ दिन' } : { invite: 'Together with their families', rsvp: 'Explore the celebration', programme: 'The day' }
  const galleryLoop = [...gallery, ...gallery, ...gallery, ...gallery]

  return (
    <>
      <motion.div
        aria-hidden
        style={{
          position: 'fixed', top: 0, left: 0, right: 0, height: 3, transformOrigin: '0% 50%',
          scaleX: progressScale, background: 'linear-gradient(90deg, var(--clay), var(--burgundy))', zIndex: 200,
        }}
      />

      <AnimatePresence>
        {!opened && (
          <motion.div
            className={`envelope-screen ${opening ? 'is-opening' : ''}`}
            aria-hidden={opened}
            exit={{ opacity: 0, transition: { duration: 0.6, ease: easeOut } }}
          >
            <div className="opening-stars" aria-hidden="true"><i /><i /><i /></div>
            <motion.div className="env-title" initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, ease: easeOut }}>
              <p className="eyebrow">You&apos;re invited</p>
              <p className="env-script">Sonalika &amp; Jayendra</p>
              <p className="env-date">14 · 03 · 27 <span>—</span> Jaipur</p>
            </motion.div>
            <motion.button
              className="envelope"
              onClick={openInvitation}
              onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); openInvitation() } }}
              aria-label="Open wedding invitation"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.35, duration: 0.8, ease: easeOut }}
              whileHover={{ y: -8, rotateX: 3 }}
              whileTap={{ scale: 0.97 }}
            >
              <span className="env-body" /><span className="env-flap" /><span className="env-letter">Our wedding story awaits</span><span className="env-seal">S<span>&amp;</span>J</span>
            </motion.button>
            <div className="opening-progress" aria-hidden="true"><span /></div>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="site-shell">
        <div className="story-progress" aria-label="Story chapters"><span className="progress-dot active" /><span /><span /><span /><span /></div>
        <header className="topbar">
          <motion.button className="monogram" onClick={() => goTo('home')} aria-label="Back to top" whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.95 }}>S<span>&amp;</span>J</motion.button>
          <nav className={`nav-links ${menuOpen ? 'is-open' : ''}`} aria-label="Main navigation"><button onClick={() => goTo('story')}>Our story</button><button onClick={() => goTo('details')}>{copy.programme}</button><button onClick={() => goTo('gallery')}>Gallery</button><button onClick={() => goTo('rsvp')}>{copy.rsvp}</button></nav>
          <div className="top-actions"><div className="language-toggle" aria-label="Language"><button className={language === 'en' ? 'active' : ''} onClick={() => setLanguage('en')}>EN</button><button className={language === 'hi' ? 'active' : ''} onClick={() => setLanguage('hi')}>HI</button></div><button className="sound-toggle" onClick={() => setSoundOn(!soundOn)} aria-label="Toggle music">{soundOn ? 'Sound on' : 'Sound'}</button><button className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)} aria-expanded={menuOpen} aria-label="Toggle menu">{menuOpen ? 'Close' : 'Menu'}</button></div>
        </header>

        <section id="home" className="hero section-pad chapter">
          <div className="chapter-index">Chapter 01 / Welcome</div>
          <motion.div className="hero-copy" variants={stagger} initial="hidden" animate="show">
            <motion.p className="eyebrow" variants={fadeUp}>{copy.invite}</motion.p>
            <motion.h1 variants={fadeUp}>Sonalika <em>&amp;</em><br />Jayendra</motion.h1>
            <motion.p className="hero-date" variants={fadeUp}>Saturday, 14 March 2027 <span>·</span> Jaipur, India</motion.p>
            <motion.button className="text-link" onClick={() => goTo('details')} variants={fadeUp} whileHover={{ x: 6 }} whileTap={{ scale: 0.97 }}>{copy.rsvp} <span>↓</span></motion.button>
          </motion.div>
          <motion.div className="hero-art hero-art-3d" style={{ y: heroY, rotate: heroRotate }} initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1.1, ease: easeOut, delay: 0.2 }}>
            <WeddingScene />
            <motion.div className="scene-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8, duration: 0.8 }}><span>an invitation in motion</span><strong>14 · 03 · 27</strong></motion.div>
            <p className="image-caption">A new chapter<br /><span>begins here</span></p>
            <motion.div className="seal" aria-hidden="true" animate={{ rotate: [12, 18, 12] }} transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}>14<br /><small>MAR</small><br />27</motion.div>
          </motion.div>
        </section>
        <div className="marquee" aria-hidden="true"><span>THE BEGINNING OF FOREVER</span><span>THE BEGINNING OF FOREVER</span><span>THE BEGINNING OF FOREVER</span></div>

        <motion.section id="story" className="story section-pad chapter" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.3 }}>
          <div className="chapter-index">Chapter 02 / Our story</div>
          <motion.div className="section-label" variants={fadeUp}>II · Our story</motion.div>
          <div className="story-grid">
            <motion.h2 variants={fadeUp}>Two hearts,<br /><em>one beautiful</em><br />adventure.</motion.h2>
            <motion.div className="story-copy" variants={fadeUp}>
              <p>What began as a chance meeting became a thousand little moments we never want to forget. From quiet mornings to wildly joyful evenings, every day has been better with you by our side.</p>
              <p>Now, surrounded by the people who made us who we are, we invite you to celebrate the start of our forever.</p>
              <motion.span className="signature" initial={{ opacity: 0, scale: 0.85 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: 0.3, duration: 0.7, ease: easeOut }}>With love, S &amp; J</motion.span>
            </motion.div>
          </div>
        </motion.section>

        <motion.section id="details" className="details section-pad chapter" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.15 }}>
          <div className="chapter-index">Chapter 03 / The day</div>
          <motion.div className="section-label" variants={fadeUp}>III · The day</motion.div>
          <motion.div className="details-heading" variants={fadeUp}><h2>A day to <em>remember.</em></h2><p>Come as you are, stay for the magic.<br />We cannot wait to celebrate with you.</p></motion.div>
          <div className="event-list">
            {events.map((event) => (
              <motion.article className="event-row" key={event.icon} variants={fadeUp} whileHover={{ x: 10, backgroundColor: 'rgba(185,120,98,0.06)' }} transition={{ duration: 0.3 }}>
                <span className="event-number">{event.icon}</span>
                <div><p className="event-time">{event.time}</p><h3>{event.title}</h3></div>
                <p className="event-detail">{event.detail}</p>
                <motion.span className="event-arrow" whileHover={{ x: 4, y: -4 }}>↗</motion.span>
              </motion.article>
            ))}
          </div>
          <motion.div className="venue-card" variants={scaleIn}>
            <div><p className="eyebrow">The venue</p><h3>Rambagh Palace</h3><p>Bhawan Singh Road, Jaipur<br />Rajasthan 302005, India</p><motion.button className="text-link" whileHover={{ x: 6 }}>View on map ↗</motion.button></div>
            <div className="venue-image"><motion.img src="https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=900&q=85" alt="Historic palace architecture in India" initial={{ scale: 1.15 }} whileInView={{ scale: 1 }} viewport={{ once: true }} transition={{ duration: 1.4, ease: easeOut }} /></div>
          </motion.div>
        </motion.section>

        <motion.section id="gallery" className="gallery section-pad chapter" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.2 }}>
          <div className="chapter-index">Chapter 04 / In pictures</div>
          <motion.div className="section-label" variants={fadeUp}>IV · In pictures</motion.div>
          <motion.h2 variants={fadeUp}>A little <em>love story.</em></motion.h2>
          <motion.div className="gallery-stage" variants={fadeUp} onMouseEnter={() => setGalleryHovered(true)} onMouseLeave={() => setGalleryHovered(false)} onFocus={() => setGalleryHovered(true)} onBlur={() => setGalleryHovered(false)}>
            <div className="gallery-track" style={{ animationPlayState: galleryPaused || galleryHovered ? 'paused' : 'running' }}>
              {galleryLoop.map((image, index) => (
                <motion.figure className={`gallery-card gallery-card-${(index % 4) + 1}`} key={index} whileHover={{ scale: 1.04, zIndex: 2 }} transition={{ duration: 0.35, ease: easeOut }}>
                  <img src={image.src} alt={image.alt} /><figcaption>{image.caption}</figcaption>
                </motion.figure>
              ))}
            </div>
          </motion.div>
          <motion.div className="gallery-meta" variants={fadeUp}><button onClick={() => setGalleryPaused(!galleryPaused)} aria-label={galleryPaused ? 'Play photo slideshow' : 'Pause photo slideshow'}>{galleryPaused ? 'Play slideshow' : 'Pause slideshow'}</button></motion.div>
        </motion.section>

        <motion.section id="rsvp" className="rsvp section-pad chapter" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.25 }}>
          <div className="chapter-index">Chapter 05 / Kindly reply</div>
          <motion.div className="section-label" variants={fadeUp}>V · Kindly reply</motion.div>
          <div className="rsvp-inner">
            <motion.h2 variants={fadeUp}>Will you join<br /><em>our celebration?</em></motion.h2>
            <AnimatePresence mode="wait">
              {submitted ? (
                <motion.div key="success" className="success-message" initial={{ opacity: 0, scale: 0.85, y: 16 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ type: 'spring', stiffness: 220, damping: 18 }}>
                  <span>Thank you.</span>
                  <p>Your response has been received. We cannot wait to see you there.</p>
                </motion.div>
              ) : (
                <motion.form key="form" variants={stagger} initial="hidden" animate="show" onSubmit={(e) => { e.preventDefault(); const fd = new FormData(e.currentTarget); saveRSVP({ guestId: uid(), guestName: fd.get('name') as string, attendance: fd.get('attendance') as 'yes' | 'no', message: '', submittedAt: new Date().toISOString() }); setSubmitted(true) }}>
                  <motion.label variants={fadeUp}>Your name<input required name="name" placeholder="Your name" /></motion.label>
                  <motion.label variants={fadeUp}>Will you be joining us?<select name="attendance" defaultValue="yes"><option value="yes">Joyfully accepts</option><option value="no">Regretfully declines</option></select></motion.label>
                  <motion.button className="submit-button" type="submit" variants={fadeUp} whileHover={{ x: 4 }} whileTap={{ scale: 0.97 }}>Send my RSVP <span>↗</span></motion.button>
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        </motion.section>

        <motion.footer initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.8 }}>
          <div className="footer-monogram">S <span>&amp;</span> J</div>
          <p>14 · 03 · 27 <span>—</span> Jaipur, India</p>
          <p className="footer-note">Made with love for our favourite people.</p>
        </motion.footer>
      </main>
    </>
  )
}
