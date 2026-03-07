"use client";

import { Fragment, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowUpRight,
  GraduationCap,
  Menu,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";
import { IconBrandGithub, IconBrandLinkedin } from "@tabler/icons-react";
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

function OrcidIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" />
      <text
        x="12"
        y="15"
        fill="currentColor"
        fontFamily="ui-sans-serif, system-ui, sans-serif"
        fontSize="8.25"
        fontWeight="700"
        textAnchor="middle"
      >
        iD
      </text>
    </svg>
  );
}

const profileLinks = [
  {
    label: "Google Scholar",
    href: "https://scholar.google.com/citations?user=jYIZGT0AAAAJ&hl=en",
    Icon: GraduationCap,
  },
  {
    label: "ORCID",
    href: "https://orcid.org/0000-0002-7393-6200",
    Icon: OrcidIcon,
  },
  {
    label: "GitHub",
    href: "https://github.com/RRocaP",
    Icon: IconBrandGithub,
  },
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/in/ramonrocapinilla/",
    Icon: IconBrandLinkedin,
  },
] as const;

const aboutStoryLabels = ["Barcelona / Irvine / UAB", "Sydney / CMRI"] as const;

function ProfileLinks({
  className,
  linkClassName,
  iconClassName = "h-4 w-4",
}: {
  className?: string;
  linkClassName?: string;
  iconClassName?: string;
}) {
  return (
    <div className={className}>
      {profileLinks.map(({ label, href, Icon }) => (
        <a
          key={label}
          href={href}
          target="_blank"
          rel="noreferrer"
          aria-label={label}
          title={label}
          className={`inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-slate-300 transition-all hover:border-white/25 hover:bg-white/10 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white ${linkClassName ?? ""}`}
        >
          <Icon className={iconClassName} />
          <span className="sr-only">{label}</span>
        </a>
      ))}
    </div>
  );
}

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

    audio.volume = 0;

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
            className="absolute inset-0 h-full w-full object-cover opacity-60 mix-blend-screen"
          >
            <source src={backgroundVideoUrl} type="video/mp4" />
          </video>
        )}
        <div className="pointer-events-none absolute inset-0 bg-[#121214]/60 mix-blend-multiply" />
        <div className="pointer-events-none absolute inset-0 bg-[#47618c]/10 mix-blend-overlay" />
      </div>

      <audio ref={audioRef} loop className="hidden" muted={isMuted}>
        <source src={`${basePath}/audio/ambient.mp3`} type="audio/mpeg" />
      </audio>

      <button
        onClick={toggleMute}
        className="fixed bottom-4 left-4 z-50 min-h-[44px] min-w-[44px] rounded-full border border-white/10 bg-white/5 p-3 text-white/50 backdrop-blur-md transition-all duration-300 hover:bg-white/10 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:bottom-8 sm:left-8"
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
          {i > 0 && <span className="select-none text-xs text-slate-600">|</span>}
          <Link
            href={`/${l}`}
            className={`rounded px-3 py-2 text-xs font-mono uppercase transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white ${
              l === locale
                ? "bg-white/15 text-white"
                : "text-slate-400 hover:bg-white/5 hover:text-white"
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
  const [scrolled, setScrolled] = useState(false);
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

  const fadeScale = {
    hidden: { opacity: 0, scale: shouldReduceMotion ? 1 : 0.95 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.8, ease: "easeOut" as const },
    },
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

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <ImmersiveBackground
        isMuted={isMuted}
        toggleMute={toggleMute}
        shouldReduceMotion={shouldReduceMotion}
        t={t}
      />

      <div className="noise-overlay relative z-10 min-h-screen overflow-x-hidden bg-transparent font-sans text-[#e9ecf1] selection:bg-[#47618c]/40 selection:text-[#e9ecf1]">
        <a
          href="#works"
          className="sr-only focus:not-sr-only focus:fixed focus:left-1/2 focus:top-4 focus:z-[60] focus:-translate-x-1/2 focus:rounded-full focus:bg-white focus:px-6 focus:py-3 focus:text-sm focus:font-semibold focus:text-black"
        >
          Skip to main content
        </a>

        <header className={`fixed left-0 right-0 top-0 z-50 flex items-center justify-between p-4 transition-all duration-500 sm:p-6 md:p-10 ${scrolled ? "backdrop-blur-lg bg-black/50 border-b border-white/5" : ""}`}>
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

          <nav className="hidden items-center gap-6 md:flex">
            {navItems.map((item, i) => (
              <motion.a
                key={item.href}
                href={item.href}
                className="px-1 py-2 text-sm font-medium tracking-wide text-slate-300 transition-colors hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + i * 0.1 }}
              >
                {item.label}
              </motion.a>
            ))}
            <ProfileLinks
              className="flex items-center gap-3"
              linkClassName="h-9 w-9 border-white/0 bg-transparent text-slate-300 hover:border-white/20 hover:bg-white/10"
            />
            <LanguageSwitcher locale={locale} />
          </nav>

          <button
            className="min-h-[44px] min-w-[44px] p-2 text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white md:hidden"
            onClick={() => setMobileMenuOpen((open) => !open)}
            aria-label={
              mobileMenuOpen ? t.mobileMenu.close : t.mobileMenu.open
            }
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </header>

        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.nav
              aria-label="Mobile navigation"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 flex flex-col items-center justify-center gap-8 bg-black/95 backdrop-blur-lg"
            >
              {navItems.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-2xl font-medium tracking-wide text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                >
                  {item.label}
                </a>
              ))}
              <ProfileLinks className="flex items-center gap-3" />
              <div className="mt-2">
                <LanguageSwitcher locale={locale} />
              </div>
            </motion.nav>
          )}
        </AnimatePresence>

        <main>
          <section
            id="top"
            className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden"
          >
            <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-col items-start px-6 md:px-12">
              <motion.div
                initial="hidden"
                animate="visible"
                variants={staggerContainer}
                className="max-w-4xl"
              >
                <motion.p
                  variants={fadeUp}
                  className="mb-5 max-w-3xl text-[11px] font-mono uppercase tracking-[0.28em] text-[#7a9ec5] md:text-xs"
                >
                  {t.hero.eyebrow}
                </motion.p>

                <motion.h1
                  variants={fadeUp}
                  className="mb-6 font-display bg-gradient-to-r from-slate-100 to-slate-400 bg-clip-text text-4xl font-black leading-[1.05] tracking-tighter text-transparent md:text-6xl lg:text-7xl"
                >
                  {t.hero.title}
                </motion.h1>

                <motion.p
                  variants={fadeUp}
                  className="mb-4 max-w-3xl text-lg font-light leading-relaxed tracking-wide text-slate-300 md:text-xl"
                >
                  {t.hero.subtitle}
                </motion.p>

                <motion.p
                  variants={fadeUp}
                  className="mb-6 text-sm font-medium uppercase tracking-[0.22em] text-[#6bb5ab] md:text-base"
                >
                  {t.hero.supportingLine}
                </motion.p>

                <motion.ul
                  variants={fadeUp}
                  className="mb-6 flex flex-wrap gap-3"
                >
                  {t.hero.proof.map((item) => (
                    <li
                      key={item}
                      className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-mono uppercase tracking-[0.18em] text-slate-200 backdrop-blur-sm"
                    >
                      {item}
                    </li>
                  ))}
                </motion.ul>

                <motion.div variants={fadeUp}>
                  <ProfileLinks
                    className="mb-10 flex items-center gap-3"
                    iconClassName="h-4.5 w-4.5"
                  />
                </motion.div>

                <motion.div
                  variants={fadeUp}
                  className="flex w-full flex-col gap-4 min-[480px]:w-auto min-[480px]:flex-row min-[480px]:flex-wrap"
                >
                  <a
                    href="#works"
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-8 py-4 font-semibold text-black transition-all duration-300 hover:bg-slate-200 hover:shadow-[0_0_25px_rgba(255,255,255,0.3)] motion-safe:hover:scale-[1.03] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                  >
                    {t.hero.ctaPrimary}
                    <svg
                      className="h-4 w-4"
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
                    className="rounded-full border border-white/20 px-6 py-3 text-center font-semibold text-white transition-all duration-300 hover:bg-white/5 hover:border-white/40 hover:shadow-[0_0_20px_rgba(255,255,255,0.08)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                  >
                    {t.hero.ctaSecondary}
                  </a>
                </motion.div>
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 2, duration: 1 }}
              className="absolute bottom-8 left-1/2 flex -translate-x-1/2 flex-col items-center gap-2"
            >
              <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-slate-500">
                Scroll
              </span>
              <motion.svg
                animate={shouldReduceMotion ? {} : { y: [0, 8, 0] }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="h-5 w-5 text-slate-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M19 9l-7 7-7-7"
                />
              </motion.svg>
            </motion.div>
          </section>

          <section id="works" className="mx-auto max-w-7xl px-6 py-32 md:px-12">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={fadeUp}
              className="mb-16"
            >
              <h2 className="mb-4 text-sm font-bold uppercase tracking-widest text-[#7a9ec5]">
                {t.sections.works}
              </h2>
              <motion.div
                className="h-[1px] w-full origin-left bg-white/10"
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 1.2, ease: "easeOut" }}
              />
            </motion.div>

            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
              {t.works.map((work, i) => (
                <motion.a
                  key={work.id}
                  href={work.href}
                  target="_blank"
                  rel="noreferrer"
                  initial={{ opacity: 0, scale: shouldReduceMotion ? 1 : 0.97 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.6, delay: i * 0.1 }}
                  className="group flex h-full cursor-pointer flex-col rounded-sm border border-white/5 bg-white/5 p-8 transition-all duration-500 hover:bg-white/10 hover:border-[#7a9ec5]/30 hover:shadow-[0_0_30px_-5px_rgba(122,158,197,0.15)] motion-safe:hover:scale-[1.02] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                  aria-label={`${t.workLinkLabel}: ${work.title}`}
                >
                  <div className="mb-6 flex items-start justify-between gap-4">
                    <span className="rounded-sm border border-[#6bb5ab]/30 px-2 py-1 text-xs font-mono text-[#6bb5ab]">
                      {work.year}
                    </span>
                    <span className="max-w-[11rem] text-right text-[11px] font-mono uppercase tracking-[0.2em] text-slate-500">
                      {work.venue}
                    </span>
                  </div>

                  <h3 className="mb-4 text-xl font-semibold leading-snug tracking-tight text-[#e9ecf1] transition-colors duration-300 group-hover:text-[#c4d6ee]">
                    {work.title}
                  </h3>

                  <p className="mb-8 flex-grow text-sm font-light leading-relaxed text-slate-300">
                    {work.blurb}
                  </p>

                  <div className="mt-auto flex items-end justify-between gap-4">
                    <div className="flex flex-wrap gap-2">
                      {work.tags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-sm border border-white/10 bg-white/[0.06] px-2 py-1 text-[11px] tracking-wider text-slate-300"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                    <span className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-[0.18em] text-[#7a9ec5]">
                      {t.workLinkLabel}
                      <ArrowUpRight className="h-4 w-4" />
                    </span>
                  </div>
                </motion.a>
              ))}
            </div>
          </section>

          <section id="about" className="mx-auto max-w-7xl px-6 py-32 md:px-12">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={fadeUp}
              className="mb-16"
            >
              <h2 className="mb-4 text-sm font-bold uppercase tracking-widest text-[#7a9ec5]">
                {t.sections.about}
              </h2>
              <motion.div
                className="h-[1px] w-full origin-left bg-white/10"
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 1.2, ease: "easeOut" }}
              />
            </motion.div>

            <div className="grid grid-cols-1 gap-16 lg:grid-cols-2">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
              >
                <h3 className="mb-6 font-display text-3xl font-bold tracking-tight text-white">
                  {t.about.heading}
                </h3>
                <div className="flex flex-col gap-6 text-base font-light leading-relaxed text-slate-300">
                  <div className="relative mr-0 md:mr-16">
                    <div className="absolute -inset-3 rounded-[2rem] bg-[radial-gradient(circle_at_top_left,rgba(122,158,197,0.16),transparent_72%)]" />
                    <div className="relative rounded-[1.75rem] border border-white/10 bg-black/15 p-6 shadow-[0_24px_80px_rgba(0,0,0,0.18)] backdrop-blur-sm md:p-8">
                      <span className="mb-4 inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-mono uppercase tracking-[0.22em] text-[#7a9ec5]">
                        {aboutStoryLabels[0]}
                      </span>
                      <p lang={locale} className="text-pretty">
                        {t.about.bio[0]}
                      </p>
                    </div>
                  </div>

                  <div className="relative ml-0 md:ml-20">
                    <div className="absolute -inset-3 rounded-[2rem] bg-[radial-gradient(circle_at_bottom_right,rgba(107,181,171,0.18),transparent_72%)]" />
                    <div className="relative rounded-[1.75rem] border border-[#7a9ec5]/20 bg-[#0d1721]/65 p-6 shadow-[0_24px_80px_rgba(0,0,0,0.22)] backdrop-blur-md md:p-8">
                      <span className="mb-4 inline-flex items-center rounded-full border border-[#6bb5ab]/20 bg-[#6bb5ab]/8 px-3 py-1 text-[10px] font-mono uppercase tracking-[0.22em] text-[#6bb5ab]">
                        {aboutStoryLabels[1]}
                      </span>
                      <p lang={locale} className="text-pretty">
                        {t.about.bio[1]}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-12 rounded-sm border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
                  <h4 className="mb-4 text-sm font-bold uppercase tracking-widest text-white">
                    {t.about.competenciesTitle}
                  </h4>
                  <ul className="grid grid-cols-2 gap-y-3 text-sm text-slate-300">
                    {t.about.competencies.map((c) => (
                      <li key={c} className="flex items-center gap-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-[#47618c]" />
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
                <div className="absolute bottom-2 left-0 top-2 w-px bg-white/10" />
                <div className="space-y-12">
                  {t.timeline.map((item, i) => (
                    <motion.div
                      key={i}
                      className="relative pl-8"
                      initial={{ opacity: 0, x: shouldReduceMotion ? 0 : -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{
                        duration: 0.6,
                        delay: i * 0.1,
                        ease: "easeOut",
                      }}
                    >
                      <div className="absolute left-[-4px] top-1.5 h-2 w-2 rounded-full bg-[#6bb5ab] shadow-[0_0_10px_rgba(66,120,114,0.8)]" />
                      <span className="mb-1 block text-xs font-mono text-[#6bb5ab]">
                        {item.year}
                      </span>
                      <h4 className="text-lg font-semibold text-white">
                        {item.role}
                      </h4>
                      <span className="mb-3 block text-sm font-medium text-slate-300">
                        {item.company}
                      </span>
                      <p className="text-sm font-light text-slate-500">
                        {item.desc}
                      </p>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </div>
          </section>

          <section
            id="contact"
            className="mx-auto max-w-7xl border-t border-white/5 px-6 py-32 md:px-12"
          >
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={staggerContainer}
              className="flex flex-col items-center text-center"
            >
              <motion.h2
                variants={fadeScale}
                className="mb-6 font-display text-4xl font-bold tracking-tighter text-white md:text-6xl"
              >
                {t.contact.heading}
              </motion.h2>
              <motion.p
                variants={fadeUp}
                className="mb-8 max-w-xl font-light text-slate-400"
              >
                {t.contact.subtitle}
              </motion.p>

              <motion.div variants={fadeUp}>
                <ProfileLinks
                  className="mb-8 flex flex-wrap items-center justify-center gap-3"
                  iconClassName="h-4.5 w-4.5"
                />
              </motion.div>

              <motion.a
                variants={fadeUp}
                href={`mailto:${t.contact.emailLabel}`}
                className="border-b-2 border-[#7a9ec5] pb-1 text-xl font-semibold transition-colors hover:text-[#e9ecf1] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white md:text-2xl"
              >
                {t.contact.emailLabel}
              </motion.a>

              <motion.div
                variants={fadeUp}
                className="mt-32 flex w-full flex-col items-center justify-between gap-8 text-xs font-mono text-slate-400 md:flex-row"
              >
                <p>
                  &copy; {new Date().getFullYear()} Ramon Roca Pinilla.{" "}
                  {t.contact.footer}
                </p>
                <ProfileLinks
                  className="flex flex-wrap items-center justify-center gap-3"
                  linkClassName="h-11 w-11"
                  iconClassName="h-5 w-5"
                />
              </motion.div>
            </motion.div>
          </section>
        </main>
      </div>
    </>
  );
}
