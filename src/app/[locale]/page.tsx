"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Volume2, VolumeX, Menu, X } from "lucide-react";
import {
  IconBrandGithub,
  IconBrandLinkedin,
  IconBrandX,
  IconBrandThreads,
} from "@tabler/icons-react";
import * as Tone from "tone";
import {
  translations,
  locales,
  isValidLocale,
  type Locale,
  type Translation,
} from "@/lib/i18n";

// ---------------------------------------------------------------------------
// Immersive Video Background
// ---------------------------------------------------------------------------
function ImmersiveBackground({
  isMuted,
  toggleMute,
  t,
}: {
  isMuted: boolean;
  toggleMute: () => void;
  t: Translation;
}) {
  const shouldReduceMotion = useReducedMotion();
  const audioRef = useRef<HTMLAudioElement>(null);

  // Smooth fade-in on first play
  useEffect(() => {
    let interactionListener: () => void;
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

    interactionListener = () => {
      if (!isMuted && audio?.paused) {
        audio.play().then(fadeIn).catch(() => {});
      }
      document.removeEventListener("click", interactionListener);
      document.removeEventListener("scroll", interactionListener);
      document.removeEventListener("keydown", interactionListener);
    };

    document.addEventListener("click", interactionListener);
    document.addEventListener("scroll", interactionListener, { once: true });
    document.addEventListener("keydown", interactionListener, { once: true });

    return () => {
      if (interactionListener) {
        document.removeEventListener("click", interactionListener);
        document.removeEventListener("scroll", interactionListener);
        document.removeEventListener("keydown", interactionListener);
      }
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
            poster="/poster.jpg"
            className="absolute inset-0 w-full h-full object-cover opacity-60 mix-blend-screen"
          >
            <source src="/background.mp4" type="video/mp4" />
          </video>
        )}
        <div className="absolute inset-0 bg-[#121214]/60 mix-blend-multiply pointer-events-none" />
        <div className="absolute inset-0 bg-[#47618c]/10 mix-blend-overlay pointer-events-none" />
      </div>

      <audio ref={audioRef} loop className="hidden" muted={isMuted}>
        <source src="/audio/ambient.mp3" type="audio/mpeg" />
      </audio>

      <button
        onClick={toggleMute}
        className="fixed bottom-8 left-8 z-50 p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full backdrop-blur-md transition-all duration-300 text-white/50 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
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
    <div className="flex gap-1">
      {locales.map((l) => (
        <Link
          key={l}
          href={`/${l}`}
          className={`px-2 py-1 text-xs font-mono uppercase rounded transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white ${
            l === locale
              ? "bg-white/15 text-white"
              : "text-slate-400 hover:text-white hover:bg-white/5"
          }`}
        >
          {l}
        </Link>
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

  const shouldReduceMotion = useReducedMotion();
  const [isMuted, setIsMuted] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Tone.js synths
  const synthsRef = useRef<{
    pingSynth: Tone.PolySynth;
    hoverSynth: Tone.FMSynth;
  } | null>(null);

  useEffect(() => {
    if (shouldReduceMotion) return; // skip Tone.js setup if reduced motion

    const pingSynth = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: "sine" },
      envelope: { attack: 0.01, decay: 0.2, sustain: 0, release: 0.1 },
    }).toDestination();

    const hoverSynth = new Tone.FMSynth({
      harmonicity: 2,
      modulationIndex: 1,
      oscillator: { type: "sine" },
      envelope: { attack: 0.05, decay: 0.3, sustain: 0.1, release: 1 },
      modulation: { type: "square" },
      modulationEnvelope: {
        attack: 0.1,
        decay: 0.2,
        sustain: 0.2,
        release: 0.1,
      },
    }).toDestination();

    const reverb = new Tone.Reverb({ decay: 2.5, wet: 0.4 }).toDestination();
    const delay = new Tone.FeedbackDelay("8n", 0.3).connect(reverb);

    pingSynth.connect(reverb);
    hoverSynth.connect(delay);
    pingSynth.volume.value = -15;
    hoverSynth.volume.value = -12;

    synthsRef.current = { pingSynth, hoverSynth };

    return () => {
      pingSynth.dispose();
      hoverSynth.dispose();
      reverb.dispose();
      delay.dispose();
    };
  }, [shouldReduceMotion]);

  const playMenuHover = useCallback(() => {
    if (isMuted || !synthsRef.current) return;
    if (Tone.getContext().state !== "running") Tone.start();
    synthsRef.current.pingSynth.triggerAttackRelease("C6", "16n");
  }, [isMuted]);

  const playProteinHover = useCallback(
    (index: number) => {
      if (isMuted || !synthsRef.current) return;
      if (Tone.getContext().state !== "running") Tone.start();
      const notes = ["C3", "D3", "E3", "F3", "G3", "A3"];
      synthsRef.current.hoverSynth.triggerAttackRelease(
        notes[index % notes.length],
        "4n"
      );
    },
    [isMuted]
  );

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

  const toggleMute = () => {
    if (!isMuted && Tone.getContext().state !== "running") Tone.start();
    setIsMuted(!isMuted);
  };

  const navItems = [
    { label: t.nav.works, href: "#works" },
    { label: t.nav.about, href: "#about" },
    { label: t.nav.writing, href: "#writing" },
    { label: t.nav.contact, href: "#contact" },
  ];

  return (
    <>
      <ImmersiveBackground isMuted={isMuted} toggleMute={toggleMute} t={t} />

      <div className="min-h-screen text-[#e9ecf1] selection:bg-[#47618c]/40 selection:text-[#e9ecf1] overflow-x-hidden font-sans relative z-10 bg-transparent">
        {/* ── Navigation ── */}
        <header className="fixed top-0 left-0 right-0 z-50 flex justify-between items-center p-6 md:p-10 mix-blend-difference">
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
                
                className="text-sm font-medium tracking-wide text-slate-300 hover:text-white transition-colors uppercase focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
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
            className="md:hidden p-2 text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={
              mobileMenuOpen ? t.mobileMenu.close : t.mobileMenu.open
            }
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </header>

        {/* Mobile menu overlay */}
        {mobileMenuOpen && (
          <motion.div
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
                className="text-2xl font-medium text-white uppercase tracking-wide focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                {item.label}
              </a>
            ))}
            <div className="mt-4">
              <LanguageSwitcher locale={locale} />
            </div>
          </motion.div>
        )}

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

                <motion.div variants={fadeUp} className="flex flex-wrap gap-4">
                  <a
                    href="#works"
                    className="px-8 py-4 bg-white text-black font-semibold rounded-full hover:bg-slate-200 transition-colors inline-flex items-center gap-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
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
                    className="px-8 py-4 border border-white/20 text-white font-semibold rounded-full hover:bg-white/5 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                  >
                    {t.hero.ctaSecondary}
                  </a>
                </motion.div>
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.5, duration: 1 }}
              className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-slate-500 text-sm"
            >
              <span>{t.hero.scroll}</span>
              <div className="w-[1px] h-12 bg-gradient-to-b from-slate-500 to-transparent" />
            </motion.div>
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
              <h2 className="text-sm font-bold tracking-widest text-[#47618c] uppercase mb-4">
                {t.sections.works}
              </h2>
              <div className="h-[1px] w-full bg-white/10" />
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {t.works.map((work, i) => (
                <motion.article
                  key={work.id}
                  onMouseEnter={() => playProteinHover(i)}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.6, delay: i * 0.1 }}
                  className="group cursor-pointer border border-white/5 bg-white/5 hover:bg-white/10 p-8 rounded-sm transition-colors duration-500 flex flex-col h-full"
                >
                  <div className="flex justify-between items-start mb-6">
                    <span className="text-xs font-mono text-[#427872] border border-[#427872]/30 px-2 py-1 rounded-sm">
                      {work.year}
                    </span>
                  </div>

                  <h3 className="text-xl font-semibold text-[#e9ecf1] tracking-tight leading-snug mb-4 group-hover:text-[#64728a] transition-colors duration-300">
                    {work.title}
                  </h3>

                  <p className="text-sm text-slate-400 font-light mb-8 flex-grow">
                    {work.blurb}
                  </p>

                  <div className="flex flex-wrap gap-2 mt-auto">
                    {work.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-[10px] uppercase tracking-wider px-2 py-1 bg-black/40 text-slate-300 rounded-sm"
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
              <h2 className="text-sm font-bold tracking-widest text-[#47618c] uppercase mb-4">
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
                <div className="space-y-6 text-slate-400 font-light leading-relaxed">
                  {t.about.bio.map((paragraph, i) => (
                    <p key={i}>{paragraph}</p>
                  ))}
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
                    <div
                      key={i}
                      className="relative pl-8"
                      onMouseEnter={() => playProteinHover(i)}
                    >
                      <div className="absolute left-[-4px] top-1.5 w-2 h-2 rounded-full bg-[#427872] shadow-[0_0_10px_rgba(66,120,114,0.8)]" />
                      <span className="text-xs font-mono text-[#427872] mb-1 block">
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
                className="text-xl md:text-2xl font-semibold border-b-2 border-[#47618c] pb-1 hover:text-[#e9ecf1] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                {t.contact.emailLabel}
              </motion.a>

              <motion.div
                variants={fadeUp}
                className="mt-32 w-full flex flex-col md:flex-row justify-between items-center gap-8 text-xs text-slate-600 font-mono"
              >
                <p>
                  &copy; {new Date().getFullYear()} Ramon Roca Pinilla.{" "}
                  {t.contact.footer}
                </p>
                <div className="flex gap-8">
                  <a
                    href="https://github.com/RRocaP"
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-3 hover:text-slate-300 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                  >
                    <IconBrandGithub size={28} stroke={1.75} />
                    <span className="text-sm">GitHub</span>
                  </a>
                  <a
                    href="https://www.linkedin.com/in/ramonrocapinilla/"
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-3 hover:text-slate-300 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                  >
                    <IconBrandLinkedin size={28} stroke={1.75} />
                    <span className="text-sm">LinkedIn</span>
                  </a>
                  <a
                    href="https://x.com/RRocapinilla"
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-3 hover:text-slate-300 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                  >
                    <IconBrandX size={28} stroke={1.75} />
                    <span className="text-sm">X</span>
                  </a>
                  <a
                    href="https://www.threads.net/@rroca15"
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-3 hover:text-slate-300 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                  >
                    <IconBrandThreads size={28} stroke={1.75} />
                    <span className="text-sm">Threads</span>
                  </a>
                </div>
              </motion.div>
            </motion.div>
          </section>
        </main>
      </div>
    </>
  );
}
