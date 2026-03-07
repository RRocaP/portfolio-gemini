"use client";

import { Fragment, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Volume2, VolumeX, Menu, X } from "lucide-react";
import {
  IconBrandGithub,
  IconBrandLinkedin,
  IconBrandX,
  IconBrandThreads,
} from "@tabler/icons-react";
import {
  translations,
  locales,
  isValidLocale,
  type Locale,
  type Translation,
} from "@/lib/i18n";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";
const backgroundVideoUrl =
  process.env.NEXT_PUBLIC_BACKGROUND_VIDEO_URL || `${basePath}/background.mp4`;

const socialLinks = [
  { label: "GitHub", href: "https://github.com/RRocaP", Icon: IconBrandGithub },
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/in/ramonrocapinilla/",
    Icon: IconBrandLinkedin,
  },
  { label: "X", href: "https://x.com/RRocapinilla", Icon: IconBrandX },
  { label: "Threads", href: "https://www.threads.net/@rroca15", Icon: IconBrandThreads },
] as const;

// ---------------------------------------------------------------------------
// Reduced motion hook (static-export safe — defaults to false so video renders)
// ---------------------------------------------------------------------------
function useReducedMotionSafe(): boolean {
  const shouldReduceMotion = useReducedMotion();
  return shouldReduceMotion ?? false;
}

// ---------------------------------------------------------------------------
// Immersive Video Background
// ---------------------------------------------------------------------------
function ImmersiveBackground({
  isMuted,
  toggleMute,
  shouldReduceMotion,
  t,
}: {
  isMuted: boolean;
  toggleMute: () => void;
  shouldReduceMotion: boolean;
  t: Translation;
}) {
  const audioRef = useRef<HTMLAudioElement>(null);

  // Smooth fade-in on first play
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.volume = 0; // start silent, fade in

    const fadeIn = () => {
      let vol = 0;
      const step = () => {
        vol = Math.min(vol + 0.02, 0.5);
        if (audio) audio.volume = vol;
        if (vol < 0.5) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    };

    const attemptPlay = () => {
      if (audio && audio.paused && !isMuted) {
        audio.play().then(fadeIn).catch(() => {});
      }
    };

    attemptPlay();

    const interactionListener = () => {
      if (!isMuted && audio?.paused) {
        audio.play().then(fadeIn).catch(() => {});
      }
      document.removeEventListener("click", interactionListener);
      document.removeEventListener("scroll", interactionListener);
      document.removeEventListener("keydown", interactionListener);
    };

    document.addEventListener("click", interactionListener);
    document.addEventListener("scroll", interactionListener);
    document.addEventListener("keydown", interactionListener);

    return () => {
      document.removeEventListener("click", interactionListener);
      document.removeEventListener("scroll", interactionListener);
      document.removeEventListener("keydown", interactionListener);
    };
  }, [isMuted]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.muted = isMuted;
    if (!isMuted && audio.paused) {
      audio.play().catch(() => {});
    }
  }, [isMuted]);

  return (
    <>
      <div className="fixed inset-0 z-0 bg-[#0a0a0a]">
        {!shouldReduceMotion && (
          <video
            autoPlay
            loop
            muted
            playsInline
            preload="metadata"
            poster={`${basePath}/poster.jpg`}
            className="absolute inset-0 w-full h-full object-cover opacity-60 mix-blend-screen"
          >
            <source src={backgroundVideoUrl} type="video/mp4" />
          </video>
        )}
        <div className="absolute inset-0 bg-[#121214]/60 mix-blend-multiply pointer-events-none" />
        <div className="absolute inset-0 bg-[#47618c]/10 mix-blend-overlay pointer-events-none" />
      </div>

      <audio ref={audioRef} loop className="hidden" muted={isMuted}>
        <source src={`${basePath}/audio/ambient.mp3`} type="audio/mpeg" />
      </audio>

      <button
        onClick={toggleMute}
        className="fixed bottom-4 left-4 sm:bottom-8 sm:left-8 z-50 min-w-[44px] min-h-[44px] p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full backdrop-blur-md transition-all duration-300 text-white/50 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
        aria-label={isMuted ? t.audio.unmute : t.audio.mute}
      >
        {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
      </button>
    </>
  );
}

// ---------------------------------------------------------------------------
// Language Switcher
// ---------------------------------------------------------------------------
function LanguageSwitcher({ locale }: { locale: Locale }) {
  return (
    <div className="flex items-center gap-2">
      {locales.map((l, i) => (
        <Fragment key={l}>
          {i > 0 && <span className="text-slate-600 text-xs select-none">|</span>}
          <Link
            href={`/${l}`}
            className={`px-3 py-2 text-xs font-mono uppercase rounded transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white ${
              l === locale
                ? "bg-white/15 text-white"
                : "text-slate-400 hover:text-white hover:bg-white/5"
            }`}
          >
            {l}
          </Link>
        </Fragment>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Portfolio Component
// ---------------------------------------------------------------------------
export default function PortfolioPage() {
  const params = useParams<{ locale: string }>();
  const locale: Locale = isValidLocale(params.locale) ? params.locale : "en";
  const t = translations[locale];

  const shouldReduceMotion = useReducedMotionSafe();
  const [isMuted, setIsMuted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navItems = [
    { label: t.nav.works, href: "#works" },
    { label: t.nav.about, href: "#about" },
    { label: t.nav.contact, href: "#contact" },
  ];

  const fadeUp = {
    hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: "easeOut" as const },
    },
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.15 } },
  };

  const toggleMute = () => setIsMuted((prev) => !prev);

  useEffect(() => {
    if (!mobileMenuOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [mobileMenuOpen]);

  return (
    <>
      <ImmersiveBackground
        isMuted={isMuted}
        toggleMute={toggleMute}
        shouldReduceMotion={shouldReduceMotion}
        t={t}
      />

      <div className="min-h-screen text-[#e9ecf1] selection:bg-[#47618c]/40 selection:text-[#e9ecf1] overflow-x-hidden font-sans relative z-10 bg-transparent">
        {/* Skip to main content — WCAG 2.4.1 */}
        <a
          href="#works"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-1/2 focus:-translate-x-1/2 focus:z-[60] focus:px-6 focus:py-3 focus:bg-white focus:text-black focus:rounded-full focus:font-semibold focus:text-sm"
        >
          Skip to main content
        </a>

        {/* ── Navigation ── */}
        <header className="fixed top-0 left-0 right-0 z-50 flex justify-between items-center p-4 sm:p-6 md:p-10 mix-blend-difference">
          <Link
            href={`/${locale}`}
            className="text-xl font-bold tracking-tighter text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1 }}
            >
              RAMON ROCA PINILLA
            </motion.span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-8">
            {navItems.map((item, i) => (
              <motion.a
                key={item.href}
                href={item.href}
                className="text-sm font-medium tracking-wide text-slate-300 hover:text-white transition-colors py-2 px-1 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + i * 0.1 }}
              >
                {item.label}
              </motion.a>
            ))}
            <LanguageSwitcher locale={locale} />
          </nav>

          {/* Mobile hamburger */}
          <button
            className="md:hidden min-w-[44px] min-h-[44px] p-2 text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            onClick={() => setMobileMenuOpen((open) => !open)}
            aria-label={
              mobileMenuOpen ? t.mobileMenu.close : t.mobileMenu.open
            }
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </header>

        {/* Mobile menu overlay */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.nav
              aria-label="Mobile navigation"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/95 backdrop-blur-lg flex flex-col items-center justify-center gap-8"
            >
              {navItems.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-2xl font-medium text-white tracking-wide focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                >
                  {item.label}
                </a>
              ))}
              <div className="mt-4">
                <LanguageSwitcher locale={locale} />
              </div>
            </motion.nav>
          )}
        </AnimatePresence>

        <main>
          {/* ── Hero ── */}
          <section
            id="top"
            className="relative h-screen flex flex-col items-center justify-center overflow-hidden"
          >
            <div className="relative z-10 w-full max-w-7xl mx-auto px-6 md:px-12 flex flex-col items-start">
              <motion.div
                initial="hidden"
                animate="visible"
                variants={staggerContainer}
                className="max-w-4xl"
              >
                <motion.h1
                  variants={fadeUp}
                  className="text-4xl md:text-6xl lg:text-7xl font-black tracking-tighter leading-[1.1] text-transparent bg-clip-text bg-gradient-to-r from-slate-100 to-slate-400 mb-8 whitespace-pre-line"
                >
                  {t.hero.title}
                </motion.h1>

                <motion.p
                  variants={fadeUp}
                  className="text-lg md:text-xl text-slate-400 max-w-2xl font-light tracking-wide mb-10 leading-relaxed"
                >
                  {t.hero.subtitle}
                </motion.p>

                <motion.div variants={fadeUp} className="flex flex-col min-[480px]:flex-row flex-wrap gap-4 w-full min-[480px]:w-auto">
                  <a
                    href="#works"
                    className="px-8 py-4 bg-white text-black font-semibold rounded-full hover:bg-slate-200 transition-colors inline-flex items-center justify-center gap-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                  >
                    {t.hero.ctaPrimary}
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 8l4 4m0 0l-4 4m4-4H3"
                      />
                    </svg>
                  </a>
                  <a
                    href="#about"
                    className="px-6 py-3 border border-white/20 text-white font-semibold rounded-full hover:bg-white/5 transition-colors text-center focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                  >
                    {t.hero.ctaSecondary}
                  </a>
                </motion.div>
              </motion.div>
            </div>

          </section>

          {/* ── Works ── */}
          <section
            id="works"
            className="py-32 px-6 md:px-12 max-w-7xl mx-auto"
          >
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={fadeUp}
              className="mb-16"
            >
              <h2 className="text-sm font-bold tracking-widest text-[#7a9ec5] uppercase mb-4">
                {t.sections.works}
              </h2>
              <div className="h-[1px] w-full bg-white/10" />
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {t.works.map((work, i) => (
                <motion.article
                  key={work.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.6, delay: i * 0.1 }}
                  className="group cursor-pointer border border-white/5 bg-white/5 hover:bg-white/10 p-8 rounded-sm transition-colors duration-500 flex flex-col h-full"
                >
                  <div className="flex justify-between items-start mb-6">
                    <span className="text-xs font-mono text-[#6bb5ab] border border-[#6bb5ab]/30 px-2 py-1 rounded-sm">
                      {work.year}
                    </span>
                  </div>

                  <h3 className="text-xl font-semibold text-[#e9ecf1] tracking-tight leading-snug mb-4 group-hover:text-[#64728a] transition-colors duration-300">
                    {work.title}
                  </h3>

                  <p className="text-sm text-slate-400 font-light mb-8 flex-grow line-clamp-2 group-hover:line-clamp-none transition-all duration-300">
                    {work.blurb}
                  </p>

                  <div className="flex flex-wrap gap-2 mt-auto">
                    {work.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-[11px] tracking-wider px-2 py-1 bg-black/40 text-slate-300 rounded-sm"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </motion.article>
              ))}
            </div>
          </section>

          {/* ── About ── */}
          <section
            id="about"
            className="py-32 px-6 md:px-12 max-w-7xl mx-auto"
          >
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={fadeUp}
              className="mb-16"
            >
              <h2 className="text-sm font-bold tracking-widest text-[#7a9ec5] uppercase mb-4">
                {t.sections.about}
              </h2>
              <div className="h-[1px] w-full bg-white/10" />
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
              >
                <h3 className="text-3xl font-bold mb-6 text-white tracking-tight">
                  {t.about.heading}
                </h3>
                <div className="flex flex-col gap-8 text-base text-slate-400 font-light leading-relaxed">
                  <p lang={locale} className="mr-4 md:mr-16">
                    {t.about.bio[0]}
                  </p>
                  <p
                    lang={locale}
                    className="ml-4 md:ml-16 pl-6 border-l border-[#7a9ec5]/40"
                  >
                    {t.about.bio[1]}
                  </p>
                </div>

                <div className="mt-12 p-6 border border-white/10 bg-white/5 rounded-sm backdrop-blur-sm">
                  <h4 className="text-sm font-bold tracking-widest text-white uppercase mb-4">
                    {t.about.competenciesTitle}
                  </h4>
                  <ul className="grid grid-cols-2 gap-y-3 text-sm text-slate-300">
                    {t.about.competencies.map((c) => (
                      <li key={c} className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#47618c]" />
                        {c}
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className="relative"
              >
                <div className="absolute left-0 top-2 bottom-2 w-px bg-white/10" />
                <div className="space-y-12">
                  {t.timeline.map((item, i) => (
                    <div key={i} className="relative pl-8">
                      <div className="absolute left-[-4px] top-1.5 w-2 h-2 rounded-full bg-[#6bb5ab] shadow-[0_0_10px_rgba(66,120,114,0.8)]" />
                      <span className="text-xs font-mono text-[#6bb5ab] mb-1 block">
                        {item.year}
                      </span>
                      <h4 className="text-lg font-semibold text-white">
                        {item.role}
                      </h4>
                      <span className="text-sm font-medium text-slate-300 mb-3 block">
                        {item.company}
                      </span>
                      <p className="text-sm text-slate-500 font-light">
                        {item.desc}
                      </p>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>
          </section>

          {/* ── Contact ── */}
          <section
            id="contact"
            className="py-32 px-6 md:px-12 max-w-7xl mx-auto border-t border-white/5"
          >
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={staggerContainer}
              className="flex flex-col items-center text-center"
            >
              <motion.h2
                variants={fadeUp}
                className="text-4xl md:text-6xl font-bold tracking-tighter text-white mb-6"
              >
                {t.contact.heading}
              </motion.h2>
              <motion.p
                variants={fadeUp}
                className="text-slate-400 max-w-xl font-light mb-12"
              >
                {t.contact.subtitle}
              </motion.p>

              <motion.a
                variants={fadeUp}
                href={`mailto:${t.contact.emailLabel}`}
                className="text-xl md:text-2xl font-semibold border-b-2 border-[#7a9ec5] pb-1 hover:text-[#e9ecf1] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                {t.contact.emailLabel}
              </motion.a>

              <motion.div
                variants={fadeUp}
                className="mt-32 w-full flex flex-col md:flex-row justify-between items-center gap-8 text-xs text-slate-400 font-mono"
              >
                <p>
                  &copy; {new Date().getFullYear()} Ramon Roca Pinilla.{" "}
                  {t.contact.footer}
                </p>
                <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-8">
                  {socialLinks.map(({ label, href, Icon }) => (
                    <a
                      key={label}
                      href={href}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-2 sm:gap-3 p-2 hover:text-slate-300 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                    >
                      <Icon size={28} stroke={1.75} />
                      <span className="text-sm">{label}</span>
                    </a>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          </section>
        </main>
      </div>
    </>
  );
}
