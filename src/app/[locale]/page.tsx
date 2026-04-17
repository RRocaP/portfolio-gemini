"use client";

import { Fragment, useEffect, useRef, useState } from "react";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from "framer-motion";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowUpRight,
  Brain,
  Code2,
  Dna,
  FlaskConical,
  GraduationCap,
  Menu,
  Microscope,
  Shield,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";
import * as Tooltip from "@radix-ui/react-tooltip";
import dynamic from "next/dynamic";
import { useCursorGlow } from "@/hooks/use-cursor-glow";
import { useIsMobile } from "@/hooks/use-mobile";
import { useMagneticEffect } from "@/hooks/use-magnetic-effect";
import { useRefraction } from "@/hooks/use-refraction";
import KineticText from "@/components/kinetic-text";
import { IconBrandGithub, IconBrandLinkedin } from "@tabler/icons-react";
import {
  translations,
  locales,
  isValidLocale,
  type Locale,
  type Translation,
} from "@/lib/i18n";

const WebGLBackground = dynamic(
  () => import("@/components/WebGLBackground"),
  { ssr: false },
);
const WebGLBackgroundFallback = dynamic(
  () =>
    import("@/components/WebGLBackground").then((m) => ({
      default: m.WebGLBackgroundFallback,
    })),
  { ssr: false },
);

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";
const backgroundAudioUrl =
  process.env.NEXT_PUBLIC_BACKGROUND_AUDIO_URL ||
  `${basePath}/audio/ambient-mastered.mp3`;
const backgroundAudioTargetVolume = 0.72;
const backgroundAudioDurationFallback = 180;

function getLoopTime(time: number, duration: number) {
  if (!Number.isFinite(duration) || duration <= 0) return 0;
  const normalized = ((time % duration) + duration) % duration;
  return Math.min(normalized, Math.max(duration - 0.01, 0));
}

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

const aboutStoryLabels = [
  "Barcelona / Irvine (CA, US) / Barcelona (UAB)",
  "Sydney (CMRI, Aus)",
] as const;

function renderInlineEmphasis(text: string) {
  return text.split(/<em>(.*?)<\/em>/g).map((part, index) =>
    index % 2 === 1 ? (
      <em key={`${part}-${index}`} className="italic">
        {part}
      </em>
    ) : (
      <Fragment key={`${part}-${index}`}>{part}</Fragment>
    )
  );
}

const competencyIcons = [Brain, FlaskConical, Code2, Shield, Microscope, Dna];

function GlowCard({
  children,
  className = "",
  disabled = false,
}: {
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
}) {
  const glowRef = useCursorGlow({ disabled });
  return (
    <div ref={glowRef} className={`glow-card ${className}`}>
      {children}
    </div>
  );
}

function MagneticLink({
  href,
  children,
  className = "",
  disabled = false,
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
}) {
  const { ref, x, y } = useMagneticEffect({ strength: 6, radius: 100, disabled });
  return (
    <motion.a
      ref={ref}
      href={href}
      style={{ x, y }}
      className={className}
    >
      {children}
    </motion.a>
  );
}

function RefractionGlowCard({
  children,
  className = "",
  disabled = false,
}: {
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
}) {
  const glowRef = useCursorGlow({ disabled });
  const refractionRef = useRefraction({ disabled });
  const combinedRef = (node: HTMLElement | null) => {
    glowRef(node);
    refractionRef(node);
  };
  return (
    <div ref={combinedRef} className={`glow-card refraction-card ${className}`}>
      {children}
    </div>
  );
}

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
  isMobile,
  t,
}: {
  isMuted: boolean;
  toggleMute: () => void;
  shouldReduceMotion: boolean;
  isMobile: boolean;
  t: Translation;
}) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const fadeFrameRef = useRef<number | null>(null);
  const mountedAtRef = useRef<number | null>(null);

  // Smooth fade-in on first play
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (mountedAtRef.current === null) {
      mountedAtRef.current = performance.now();
    }

    const stopFade = () => {
      if (fadeFrameRef.current !== null) {
        cancelAnimationFrame(fadeFrameRef.current);
        fadeFrameRef.current = null;
      }
    };

    const fadeIn = () => {
      stopFade();
      audio.volume = 0;
      let vol = 0;
      const step = () => {
        vol = Math.min(vol + 0.03, backgroundAudioTargetVolume);
        if (audio) audio.volume = vol;
        if (vol < backgroundAudioTargetVolume) {
          fadeFrameRef.current = requestAnimationFrame(step);
        } else {
          fadeFrameRef.current = null;
        }
      };
      fadeFrameRef.current = requestAnimationFrame(step);
    };

    const startPlayback = (shouldFade: boolean) => {
      audio.muted = isMuted;

      if (!audio.paused) {
        if (!isMuted && shouldFade) {
          fadeIn();
        }
        return;
      }

      const elapsedSeconds = (performance.now() - (mountedAtRef.current ?? performance.now())) / 1000;
      const duration =
        Number.isFinite(audio.duration) && audio.duration > 0
          ? audio.duration
          : backgroundAudioDurationFallback;

      audio.currentTime = getLoopTime(elapsedSeconds, duration);
      audio.play().then(() => {
        if (!isMuted && shouldFade) {
          fadeIn();
        }
      }).catch(() => { });
    };

    startPlayback(!isMuted);

    const interactionListener = () => {
      startPlayback(!isMuted);
      document.removeEventListener("click", interactionListener);
      document.removeEventListener("scroll", interactionListener);
      document.removeEventListener("keydown", interactionListener);
    };

    const metadataListener = () => {
      if (audio.paused) {
        startPlayback(false);
      }
    };

    document.addEventListener("click", interactionListener);
    document.addEventListener("scroll", interactionListener);
    document.addEventListener("keydown", interactionListener);
    audio.addEventListener("loadedmetadata", metadataListener);

    return () => {
      stopFade();
      document.removeEventListener("click", interactionListener);
      document.removeEventListener("scroll", interactionListener);
      document.removeEventListener("keydown", interactionListener);
      audio.removeEventListener("loadedmetadata", metadataListener);
    };
  }, [isMuted]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.muted = isMuted;
  }, [isMuted]);

  return (
    <>
      {isMobile ? (
        <WebGLBackgroundFallback />
      ) : (
        <WebGLBackground prefersReducedMotion={shouldReduceMotion} />
      )}

      <audio ref={audioRef} loop className="hidden" muted={isMuted} preload="auto">
        <source src={backgroundAudioUrl} type="audio/mpeg" />
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
            className={`rounded px-3 py-2 text-xs font-mono uppercase transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white ${l === locale
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
  const isMobile = useIsMobile();
  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const heroOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const heroY = useTransform(scrollYProgress, [0, 0.5], [0, -60]);

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
        isMobile={isMobile}
        t={t}
      />

      <div className="noise-overlay relative z-10 min-h-screen overflow-x-hidden bg-transparent font-sans text-[--accent-ink] selection:bg-[--accent-blue-2]/40 selection:text-[--accent-ink]">
        <a
          href="#works"
          className="sr-only focus:not-sr-only focus:fixed focus:left-1/2 focus:top-4 focus:z-[60] focus:-translate-x-1/2 focus:rounded-full focus:bg-white focus:px-6 focus:py-3 focus:text-sm focus:font-semibold focus:text-black"
        >
          Skip to main content
        </a>

        <header className={`fixed left-0 right-0 top-0 z-50 flex items-center justify-between p-4 transition-all duration-500 sm:p-6 md:p-10 ${scrolled ? "backdrop-blur-lg bg-black/50 border-b border-[--rule-soft]" : ""}`}>
          <Link
            href={`/${locale}`}
            className="text-xl font-bold tracking-[-0.04em] text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
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
              <MagneticLink
                key={item.href}
                href={item.href}
                disabled={shouldReduceMotion}
                className="px-1 py-2 text-sm font-medium tracking-wide text-slate-300 transition-colors hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                <motion.span
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + i * 0.1 }}
                >
                  {item.label}
                </motion.span>
              </MagneticLink>
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
            ref={heroRef}
            id="top"
            className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden"
          >
            <motion.div
              className="relative z-10 mx-auto grid w-full max-w-7xl grid-cols-1 gap-10 px-6 md:px-12 lg:grid-cols-12 lg:gap-12"
              style={shouldReduceMotion ? {} : { opacity: heroOpacity, y: heroY }}
            >
              <motion.div
                initial="hidden"
                animate="visible"
                variants={staggerContainer}
                className="lg:col-span-8"
              >
                <motion.p
                  variants={fadeUp}
                  className="eyebrow mb-6"
                >
                  {t.hero.eyebrow}
                </motion.p>

                <motion.h1
                  variants={fadeUp}
                  className="mb-7 max-w-4xl text-balance font-display text-[clamp(3.5rem,8vw,7rem)] font-medium leading-[0.92] tracking-[-0.035em] text-slate-100 drop-shadow-lg"
                >
                  <KineticText text={t.hero.title} />
                </motion.h1>

                <motion.p
                  variants={fadeUp}
                  className="mb-5 max-w-xl text-pretty text-lg font-light leading-relaxed text-slate-300 md:text-xl"
                >
                  {t.hero.subtitle}
                </motion.p>

                <motion.p
                  variants={fadeUp}
                  className="mb-10 font-display italic text-lg leading-snug text-[--accent-teal] md:text-xl"
                >
                  {t.hero.supportingLine}
                </motion.p>

                <motion.div
                  variants={fadeUp}
                  className="flex w-full flex-col gap-4 min-[480px]:w-auto min-[480px]:flex-row min-[480px]:flex-wrap"
                >
                  <MagneticLink
                    href="#works"
                    disabled={shouldReduceMotion}
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
                  </MagneticLink>
                  <MagneticLink
                    href="#about"
                    disabled={shouldReduceMotion}
                    className="inline-flex items-center justify-center rounded-full border border-white/20 px-8 py-4 text-center font-semibold text-white transition-all duration-300 hover:bg-white/5 hover:border-white/40 hover:shadow-[0_0_20px_rgba(255,255,255,0.08)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                  >
                    {t.hero.ctaSecondary}
                  </MagneticLink>
                </motion.div>
              </motion.div>

              <motion.dl
                initial="hidden"
                animate="visible"
                variants={staggerContainer}
                className="flex flex-row flex-wrap gap-x-8 gap-y-4 border-t border-[--rule-soft] pt-6 lg:col-span-4 lg:col-start-9 lg:flex-col lg:gap-6 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-6"
              >
                {t.hero.proof.map((item, i) => (
                  <motion.div key={item} variants={fadeUp} className="flex min-w-0 flex-col gap-1">
                    <dt className="eyebrow text-[10px]">{String(i + 1).padStart(2, "0")}</dt>
                    <dd className="text-sm font-medium tracking-tight text-slate-100 md:text-base">
                      {item}
                    </dd>
                  </motion.div>
                ))}
              </motion.dl>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 2, duration: 1 }}
              className="absolute bottom-8 left-1/2 flex -translate-x-1/2 flex-col items-center gap-3"
            >
              <span className="text-[10px] font-mono uppercase tracking-[0.32em] text-slate-500">
                Scroll
              </span>
              <motion.span
                aria-hidden="true"
                initial={{ scaleY: 0 }}
                animate={shouldReduceMotion ? { scaleY: 1 } : { scaleY: [0, 1, 1, 0] }}
                transition={{
                  duration: 3.2,
                  repeat: shouldReduceMotion ? 0 : Infinity,
                  ease: "easeInOut",
                  times: [0, 0.35, 0.75, 1],
                }}
                className="block h-8 w-px origin-top bg-slate-500"
              />
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
              <h2 className="eyebrow mb-4 text-xs">
                {t.sections.works}
              </h2>
              <div className="section-rule" />
            </motion.div>

            <div className="grid grid-cols-1 auto-rows-[minmax(300px,_1fr)] gap-6 md:grid-cols-6 lg:grid-cols-12">
              {[1, 3, 4, 2, 5, 6].map((id, i) => {
                const work = t.works.find((w) => w.id === id)!;
                // Create an asymmetrical layout pattern for 6 items
                const bentoSpan =
                  i === 0 ? "md:col-span-6 lg:col-span-8" :    // Big feature
                    i === 1 ? "md:col-span-6 lg:col-span-4" :    // Side feature
                      i === 2 ? "md:col-span-4 lg:col-span-4" :    // Standard
                        i === 3 ? "md:col-span-4 lg:col-span-4" :    // Standard
                          i === 4 ? "md:col-span-4 lg:col-span-4" :    // Standard
                            "md:col-span-6 lg:col-span-12";              // Full width bottom
                const isFeature =
                  bentoSpan.includes("lg:col-span-8") ||
                  bentoSpan.includes("lg:col-span-12");
                const indexLabel = `${String(i + 1).padStart(2, "0")} / 06`;

                return (
                  <RefractionGlowCard
                    key={work.id}
                    disabled={shouldReduceMotion}
                    className={`card-chrome ${bentoSpan}`}
                  >
                    <motion.a
                      href={work.href}
                      target="_blank"
                      rel="noreferrer"
                      initial={{ opacity: 0, scale: shouldReduceMotion ? 1 : 0.97 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true, margin: "-50px" }}
                      transition={{ duration: 0.6, delay: i * 0.1 }}
                      className="group relative z-[2] flex h-full cursor-pointer flex-col rounded-[--radius-card] p-8 transition-all duration-500 hover:border-[--accent-blue]/35 hover:bg-white/[0.07] hover:shadow-[0_0_30px_-5px_rgba(122,158,197,0.18)] motion-safe:hover:scale-[1.02] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                      aria-label={`${t.workLinkLabel}: ${work.title}`}
                    >
                      <div className="mb-6 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <span className="font-mono text-[10.5px] tabular-nums tracking-[0.18em] text-[--accent-blue]">
                            {indexLabel}
                          </span>
                          <span className="tag-pill" style={{ color: "var(--accent-teal)" }}>
                            {work.year}
                          </span>
                        </div>
                        <ArrowUpRight className="h-4 w-4 text-slate-400 transition-colors duration-300 group-hover:text-[--accent-ink]" />
                      </div>

                      <h3
                        className={`mb-2 font-display font-medium tracking-[-0.02em] text-[--accent-ink] transition-colors duration-300 group-hover:text-white ${isFeature ? "text-4xl leading-[1.02]" : "text-2xl leading-[1.08]"}`}
                      >
                        {work.title}
                      </h3>

                      <p className="mb-5 font-mono text-[10.5px] uppercase tracking-[0.2em] text-slate-500">
                        {work.venue}
                      </p>

                      <p className="mb-8 flex-grow text-pretty text-sm font-light leading-relaxed text-slate-300">
                        {work.blurb}
                      </p>

                      <div className="mt-auto flex flex-wrap items-end justify-between gap-4">
                        <div className="flex flex-wrap gap-2">
                          {work.tags.map((tag) => (
                            <span key={tag} className="tag-pill">
                              {tag}
                            </span>
                          ))}
                        </div>
                        <span className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-[0.18em] text-[--accent-blue]">
                          {t.workLinkLabel}
                          <ArrowUpRight className="h-4 w-4" />
                        </span>
                      </div>
                    </motion.a>
                  </RefractionGlowCard>
                );
              })}
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
              <h2 className="eyebrow mb-4 text-xs">
                {t.sections.about}
              </h2>
              <div className="section-rule" />
            </motion.div>

            <div className="grid grid-cols-1 gap-16 lg:grid-cols-2">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
              >
                <h3 className="mb-8 text-balance font-display text-3xl font-normal leading-[1.05] tracking-[-0.015em] text-white md:text-4xl">
                  {t.about.heading}
                </h3>
                <div className="flex flex-col gap-6 text-base font-light leading-relaxed text-slate-300">
                  <RefractionGlowCard disabled={shouldReduceMotion} className="relative mr-0 rounded-[--radius-feature] md:mr-6">
                    <div className="absolute -inset-3 rounded-[2rem] bg-[radial-gradient(circle_at_top_left,rgba(122,158,197,0.16),transparent_72%)]" />
                    <div className="relative z-[2] rounded-[--radius-feature] border border-[--rule-soft] bg-black/15 p-6 shadow-[0_24px_80px_rgba(0,0,0,0.18)] backdrop-blur-sm md:p-8">
                      <span className="tag-pill mb-4" style={{ color: "var(--accent-blue)" }}>
                        {aboutStoryLabels[0]}
                      </span>
                      <p lang={locale} className="text-left text-pretty">
                        {renderInlineEmphasis(t.about.bio[0])}
                      </p>
                    </div>
                  </RefractionGlowCard>

                  <RefractionGlowCard disabled={shouldReduceMotion} className="relative ml-0 rounded-[--radius-feature] md:ml-10">
                    <div className="absolute -inset-3 rounded-[2rem] bg-[radial-gradient(circle_at_bottom_right,rgba(107,181,171,0.18),transparent_72%)]" />
                    <div className="relative z-[2] rounded-[--radius-feature] border border-[--rule-soft] bg-[#0d1721]/65 p-6 shadow-[0_24px_80px_rgba(0,0,0,0.22)] backdrop-blur-md md:p-8">
                      <span className="tag-pill mb-4" style={{ color: "var(--accent-teal)" }}>
                        {aboutStoryLabels[1]}
                      </span>
                      <p lang={locale} className="text-left text-pretty">
                        {renderInlineEmphasis(t.about.bio[1])}
                      </p>
                    </div>
                  </RefractionGlowCard>
                </div>

                <motion.dl
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: "-50px" }}
                  variants={staggerContainer}
                  className="mt-12 grid grid-cols-2 border-t border-[--rule-strong] border-b border-b-[--rule-soft] sm:grid-cols-4"
                >
                  {t.about.stats.map((stat, i) => (
                    <motion.div
                      key={stat.label}
                      variants={fadeUp}
                      className={`flex flex-col gap-1 py-5 ${i > 0 ? "sm:border-l sm:border-[--rule-soft] sm:pl-5" : ""}`}
                    >
                      <dt className="eyebrow text-[10px]">{stat.label}</dt>
                      <dd className="font-display text-3xl font-normal tabular-nums tracking-tight text-white md:text-4xl">
                        {stat.value}
                      </dd>
                    </motion.div>
                  ))}
                </motion.dl>

                <Tooltip.Provider delayDuration={300}>
                  <GlowCard disabled={shouldReduceMotion} className="card-chrome mt-10">
                    <div className="relative z-[2] p-6 md:p-7">
                      <h4 className="eyebrow mb-5 text-[11px]">
                        {t.about.competenciesTitle}
                      </h4>
                      <ul className="grid grid-cols-1 gap-0 text-sm text-slate-200 sm:grid-cols-2 sm:gap-x-6">
                        {t.about.competencies.map((c, ci) => {
                          const Icon = competencyIcons[ci];
                          const description = t.about.competencyDescriptions[ci];
                          return (
                            <li
                              key={c}
                              className="border-b border-[--rule-soft] py-3 last:border-0 sm:[&:nth-last-child(2)]:border-0"
                            >
                              <Tooltip.Root>
                                <Tooltip.Trigger asChild>
                                  <button
                                    type="button"
                                    className="group flex w-full items-center gap-3 text-left transition-colors hover:text-white"
                                  >
                                    {Icon ? (
                                      <Icon className="h-4 w-4 shrink-0 text-[--accent-blue] transition-colors group-hover:text-[--accent-teal]" />
                                    ) : (
                                      <span className="h-1.5 w-1.5 rounded-full bg-[--accent-blue-2]" />
                                    )}
                                    <span className="font-medium tracking-tight">{c}</span>
                                  </button>
                                </Tooltip.Trigger>
                                {description && (
                                  <Tooltip.Portal>
                                    <Tooltip.Content
                                      side="top"
                                      sideOffset={6}
                                      className="z-50 max-w-xs rounded-md border border-[--rule-soft] bg-[#1a1a1e] px-3 py-2 text-xs text-slate-200 shadow-lg animate-in fade-in-0 zoom-in-95"
                                    >
                                      {description}
                                      <Tooltip.Arrow className="fill-[#1a1a1e]" />
                                    </Tooltip.Content>
                                  </Tooltip.Portal>
                                )}
                              </Tooltip.Root>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  </GlowCard>
                </Tooltip.Provider>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className="relative"
              >
                <div className="absolute bottom-2 left-0 top-2 w-px bg-[--rule-strong]" />
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
                      <div className="absolute left-[-5px] top-[0.35rem] h-[10px] w-[10px] rounded-full bg-[--accent-teal] ring-4 ring-[--accent-teal]/15" />
                      <span className="eyebrow mb-2 block tabular-nums text-[--accent-teal]">
                        {item.year}
                      </span>
                      <h4 className="font-display text-xl font-medium tracking-tight text-white">
                        {item.role}
                      </h4>
                      <span className="mb-3 block text-sm font-medium text-slate-300">
                        {item.company}
                      </span>
                      <p className="text-pretty text-sm font-light leading-relaxed text-slate-400">
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
            className="mx-auto max-w-7xl border-t border-[--rule-soft] px-6 py-32 md:px-12"
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
                className="mb-8 text-balance font-display italic text-5xl font-normal leading-[1.02] tracking-[-0.02em] text-white md:text-7xl"
              >
                {t.contact.heading}
              </motion.h2>
              <motion.p
                variants={fadeUp}
                className="mb-10 max-w-xl font-light leading-relaxed text-slate-400"
              >
                {t.contact.subtitle}
              </motion.p>

              <motion.div variants={fadeUp}>
                <ProfileLinks
                  className="mb-12 flex flex-wrap items-center justify-center gap-3"
                  iconClassName="h-4.5 w-4.5"
                />
              </motion.div>

              <motion.div variants={fadeUp}>
                <MagneticLink
                  href={`mailto:${t.contact.emailLabel}`}
                  disabled={shouldReduceMotion}
                  className="link-editorial inline-flex items-center gap-3 pb-1 font-display text-2xl italic text-[--accent-ink] transition-colors hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white md:text-3xl"
                >
                  {t.contact.emailLabel}
                  <ArrowUpRight className="h-5 w-5 text-[--accent-blue]" />
                </MagneticLink>
              </motion.div>

              <motion.div
                variants={fadeUp}
                className="mt-32 flex w-full flex-col items-center justify-between gap-6 border-t border-[--rule-soft] pt-8 text-xs font-mono text-slate-500 md:flex-row"
              >
                <p className="tabular-nums">
                  &copy; {new Date().getFullYear()} Ramon Roca Pinilla.{" "}
                  {t.contact.footer}
                </p>
                <LanguageSwitcher locale={locale} />
              </motion.div>
            </motion.div>
          </section>
        </main>
      </div>
    </>
  );
}
