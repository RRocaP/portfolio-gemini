"use client";

import { Fragment, useEffect, useMemo, useRef, useState } from "react";
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
  GraduationCap,
  Menu,
  Microscope,
  Shield,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";
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

function IcosahedronIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d="M12 2.5 L20.5 7.5 L20.5 16.5 L12 21.5 L3.5 16.5 L3.5 7.5 Z" />
      <path d="M12 7 L16.5 14.5 L7.5 14.5 Z" />
      <path d="M12 2.5 L12 7" />
      <path d="M20.5 7.5 L16.5 14.5" />
      <path d="M3.5 7.5 L7.5 14.5" />
      <path d="M12 21.5 L12 14.5" opacity="0.55" />
    </svg>
  );
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

const competencyIcons = [Brain, IcosahedronIcon, Code2, Shield, Microscope, Dna];

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
        className="fixed bottom-4 right-4 z-50 min-h-[44px] min-w-[44px] rounded-full border border-white/10 bg-white/5 p-3 text-white/50 backdrop-blur-md transition-all duration-300 hover:bg-white/10 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:bottom-8 sm:left-8 sm:right-auto"
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
  const menuRef = useRef<HTMLElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);

  const navItems = useMemo(
    () => [
      { label: t.nav.works, href: "#works" },
      { label: t.nav.about, href: "#about" },
      { label: t.nav.contact, href: "#contact" },
    ],
    [t.nav.works, t.nav.about, t.nav.contact],
  );

  const featuredWorks = useMemo(
    () => [1, 2].map((id) => t.works.find((work) => work.id === id)!),
    [t.works],
  );
  const supportingWorks = useMemo(
    () => [3, 4, 5, 6].map((id) => t.works.find((work) => work.id === id)!),
    [t.works],
  );
  const competencyMatrix = useMemo(
    () =>
      t.about.competencies.map((competency, index) => ({
        competency,
        description: t.about.competencyDescriptions[index],
        Icon: competencyIcons[index],
      })),
    [t.about.competencies, t.about.competencyDescriptions],
  );

  const workBackdrops = useMemo(
    () => [
      "radial-gradient(circle at top right, rgba(122, 158, 197, 0.34), transparent 42%), linear-gradient(135deg, rgba(6, 10, 17, 0.98) 0%, rgba(12, 24, 40, 0.92) 48%, rgba(6, 10, 17, 0.98) 100%)",
      "radial-gradient(circle at 18% 14%, rgba(107, 181, 171, 0.3), transparent 38%), linear-gradient(160deg, rgba(5, 10, 14, 0.96) 0%, rgba(10, 24, 26, 0.9) 52%, rgba(5, 9, 13, 0.98) 100%)",
      "radial-gradient(circle at 80% 24%, rgba(126, 142, 214, 0.28), transparent 40%), linear-gradient(160deg, rgba(8, 11, 20, 0.96) 0%, rgba(19, 22, 42, 0.9) 50%, rgba(8, 11, 20, 0.98) 100%)",
      "radial-gradient(circle at 15% 10%, rgba(217, 166, 107, 0.22), transparent 40%), linear-gradient(150deg, rgba(12, 10, 8, 0.98) 0%, rgba(32, 19, 10, 0.86) 52%, rgba(11, 9, 8, 0.98) 100%)",
      "radial-gradient(circle at 82% 18%, rgba(88, 176, 183, 0.24), transparent 42%), linear-gradient(150deg, rgba(5, 11, 13, 0.98) 0%, rgba(8, 30, 31, 0.88) 54%, rgba(5, 11, 13, 0.98) 100%)",
      "radial-gradient(circle at 20% 18%, rgba(173, 140, 224, 0.24), transparent 40%), linear-gradient(150deg, rgba(8, 8, 16, 0.98) 0%, rgba(20, 14, 32, 0.88) 50%, rgba(8, 8, 16, 0.98) 100%)",
    ],
    [],
  );
  const getWorkBackdrop = (id: number) =>
    workBackdrops[(id - 1) % workBackdrops.length];

  const fadeUp = useMemo(
    () => ({
      hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 30 },
      visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.8, ease: "easeOut" as const },
      },
    }),
    [shouldReduceMotion],
  );

  const staggerContainer = useMemo(
    () => ({
      hidden: { opacity: 0 },
      visible: { opacity: 1, transition: { staggerChildren: 0.15 } },
    }),
    [],
  );

  const fadeScale = useMemo(
    () => ({
      hidden: { opacity: 0, scale: shouldReduceMotion ? 1 : 0.95 },
      visible: {
        opacity: 1,
        scale: 1,
        transition: { duration: 0.8, ease: "easeOut" as const },
      },
    }),
    [shouldReduceMotion],
  );

  const toggleMute = () => setIsMuted((prev) => !prev);

  useEffect(() => {
    if (!mobileMenuOpen) return;
    const previousOverflow = document.body.style.overflow;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    document.body.style.overflow = "hidden";

    const focusFirst = () => {
      const first = menuRef.current?.querySelector<HTMLElement>(
        'a, button, [tabindex]:not([tabindex="-1"])',
      );
      first?.focus();
    };
    const raf = requestAnimationFrame(focusFirst);

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        setMobileMenuOpen(false);
        return;
      }
      if (e.key !== "Tab" || !menuRef.current) return;
      const focusables = Array.from(
        menuRef.current.querySelectorAll<HTMLElement>(
          'a, button, [tabindex]:not([tabindex="-1"])',
        ),
      ).filter((el) => !el.hasAttribute("disabled"));
      if (focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      const active = document.activeElement as HTMLElement | null;
      if (e.shiftKey && active === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && active === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", handleKey);

    return () => {
      cancelAnimationFrame(raf);
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKey);
      previouslyFocused?.focus?.();
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

      <div className="noise-overlay relative z-10 min-h-screen overflow-x-hidden bg-transparent font-sans text-[#e9ecf1] selection:bg-[#47618c]/40 selection:text-[#e9ecf1]">
        <a
          href="#works"
          className="sr-only focus:not-sr-only focus:fixed focus:left-1/2 focus:top-4 focus:z-[60] focus:-translate-x-1/2 focus:rounded-full focus:bg-white focus:px-6 focus:py-3 focus:text-sm focus:font-semibold focus:text-black"
        >
          {t.skipLink}
        </a>

        <header className="fixed inset-x-0 top-0 z-50 px-4 py-4 sm:px-6 md:px-10">
          <div
            className={`mx-auto flex max-w-7xl items-center justify-between rounded-full border px-4 py-3 transition-all duration-500 sm:px-5 ${
              scrolled
                ? "border-white/10 bg-black/55 shadow-[0_18px_60px_rgba(0,0,0,0.22)] backdrop-blur-xl"
                : "border-white/0 bg-transparent"
            }`}
          >
            <Link
              href={`/${locale}`}
              className="text-[0.95rem] font-semibold tracking-[0.22em] text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:text-base"
            >
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1 }}
              >
                RAMON ROCA PINILLA
              </motion.span>
            </Link>

            <nav className="hidden items-center gap-5 md:flex">
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
              <div className="h-6 w-px bg-white/10" />
              <ProfileLinks
                className="flex items-center gap-2"
                linkClassName="h-9 w-9 border-white/0 bg-transparent text-slate-300 hover:border-white/20 hover:bg-white/10"
              />
              <div className="h-6 w-px bg-white/10" />
              <LanguageSwitcher locale={locale} />
            </nav>

            <button
              ref={toggleRef}
              className="min-h-[44px] min-w-[44px] rounded-full border border-white/10 bg-white/5 p-2 text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white md:hidden"
              onClick={() => setMobileMenuOpen((open) => !open)}
              aria-label={
                mobileMenuOpen ? t.mobileMenu.close : t.mobileMenu.open
              }
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-menu"
            >
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </header>

        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.nav
              ref={menuRef}
              id="mobile-menu"
              role="dialog"
              aria-modal="true"
              aria-labelledby="mobile-menu-title"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 flex flex-col items-center justify-center gap-8 bg-[#03070d]/95 backdrop-blur-xl"
            >
              <h2 id="mobile-menu-title" className="sr-only">
                {t.mobileMenu.title}
              </h2>
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

        <main className="relative overflow-hidden">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 -z-10"
          >
            <div className="absolute left-[-12rem] top-24 h-[28rem] w-[28rem] rounded-full bg-[#7a9ec5]/14 blur-3xl" />
            <div className="absolute right-[-10rem] top-[28rem] h-[24rem] w-[24rem] rounded-full bg-[#6bb5ab]/12 blur-3xl" />
            <div className="absolute bottom-[18rem] left-1/2 h-[32rem] w-[32rem] -translate-x-1/2 rounded-full bg-[#4e5fb8]/10 blur-3xl" />
            <div className="absolute inset-x-0 top-[36rem] h-[90rem] bg-[linear-gradient(to_bottom,rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(to_right,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:88px_88px] opacity-[0.12] [mask-image:linear-gradient(to_bottom,transparent,black_20%,black_78%,transparent)]" />
          </div>

          <section
            ref={heroRef}
            id="top"
            className="relative overflow-hidden px-6 pb-20 pt-28 md:px-12 md:pb-24 md:pt-36"
          >
            <div className="mx-auto max-w-7xl">
              <div className="grid gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(340px,0.9fr)] lg:items-end">
                <motion.div
                  className="relative z-10"
                  style={shouldReduceMotion ? {} : { opacity: heroOpacity, y: heroY }}
                >
                  <motion.div
                    initial="hidden"
                    animate="visible"
                    variants={staggerContainer}
                    className="max-w-5xl"
                  >
                    <motion.div
                      variants={fadeUp}
                      className="mb-7 flex max-w-4xl items-center gap-4"
                    >
                      <span className="text-[11px] font-mono uppercase tracking-[0.28em] text-[#7a9ec5] md:text-xs">
                        {t.hero.eyebrow}
                      </span>
                      <div className="hidden h-px flex-1 bg-gradient-to-r from-white/20 via-white/5 to-transparent md:block" />
                    </motion.div>

                    <motion.h1
                      variants={fadeUp}
                      className="max-w-5xl text-balance font-display text-[clamp(3.5rem,8vw,7.5rem)] font-medium leading-[0.92] tracking-[-0.05em] text-slate-100 drop-shadow-[0_18px_80px_rgba(0,0,0,0.5)]"
                    >
                      <KineticText text={t.hero.title} />
                    </motion.h1>

                    <motion.p
                      variants={fadeUp}
                      className="mt-7 max-w-3xl text-pretty text-lg font-light leading-relaxed tracking-[0.01em] text-slate-300 md:text-xl"
                    >
                      {t.hero.subtitle}
                    </motion.p>

                    <motion.p
                      variants={fadeUp}
                      className="mt-4 max-w-2xl font-display text-base italic tracking-wide text-[#7a9ec5] md:text-lg"
                    >
                      {t.hero.northStar}
                    </motion.p>

                    <motion.p
                      variants={fadeUp}
                      className="mt-5 text-sm font-medium uppercase tracking-[0.24em] text-[#6bb5ab] md:text-base"
                    >
                      {t.hero.supportingLine}
                    </motion.p>

                    <motion.p
                      variants={fadeUp}
                      className="mt-8 max-w-2xl text-xs font-mono uppercase tracking-[0.18em] text-slate-300 tabular-nums"
                    >
                      {t.hero.proof.join(" · ")}
                    </motion.p>

                    <motion.div
                      variants={fadeUp}
                      className="mt-10 flex flex-col gap-5 lg:flex-row lg:flex-wrap lg:items-center"
                    >
                      <div className="flex w-full flex-col gap-4 min-[480px]:w-auto min-[480px]:flex-row min-[480px]:flex-wrap">
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
                          className="inline-flex items-center justify-center rounded-full border border-white/20 px-8 py-4 text-center font-semibold text-white transition-all duration-300 hover:border-white/40 hover:bg-white/5 hover:shadow-[0_0_20px_rgba(255,255,255,0.08)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                        >
                          {t.hero.ctaSecondary}
                        </MagneticLink>
                      </div>

                      <div className="hidden h-10 w-px bg-white/10 lg:block" />

                      <ProfileLinks
                        className="flex items-center gap-3"
                        iconClassName="h-[1.125rem] w-[1.125rem]"
                      />
                    </motion.div>
                  </motion.div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: shouldReduceMotion ? 0 : 24 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2, duration: 0.8, ease: "easeOut" }}
                  className="relative z-10"
                >
                  <RefractionGlowCard
                    disabled={shouldReduceMotion}
                    className="rounded-[2rem]"
                  >
                    <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))] p-6 shadow-[0_28px_120px_rgba(0,0,0,0.24)] backdrop-blur-xl md:p-8">
                      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(122,158,197,0.22),transparent_38%),radial-gradient(circle_at_bottom_left,rgba(107,181,171,0.16),transparent_42%)]" />
                      <div className="relative z-[2]">
                        <span className="inline-flex rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[10px] font-mono uppercase tracking-[0.22em] text-[#6bb5ab]">
                          {t.timeline[0].year}
                        </span>
                        <p className="mt-6 text-[11px] font-mono uppercase tracking-[0.28em] text-[#7a9ec5]">
                          {t.timeline[0].company}
                        </p>
                        <h2 className="mt-3 max-w-sm text-balance font-display text-3xl leading-tight tracking-tight text-white">
                          {t.timeline[0].role}
                        </h2>
                        <p className="mt-4 text-pretty text-sm leading-relaxed text-slate-300">
                          {t.timeline[0].desc}
                        </p>

                        <div className="mt-8 grid grid-cols-2 gap-3">
                          {t.about.stats.map((stat) => (
                            <div
                              key={stat.label}
                              className="rounded-2xl border border-white/10 bg-black/20 px-4 py-4"
                            >
                              <span className="block font-mono text-2xl font-semibold tabular-nums text-white">
                                {stat.value}
                              </span>
                              <span className="mt-1 block text-[11px] uppercase tracking-[0.18em] text-slate-300">
                                {stat.label}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </RefractionGlowCard>

                  <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                    <GlowCard
                      disabled={shouldReduceMotion}
                      className="rounded-[1.6rem] border border-white/10 bg-white/[0.04] backdrop-blur-lg"
                    >
                      <div className="relative z-[2] h-full rounded-[1.6rem] p-5">
                        <p className="text-[10px] font-mono uppercase tracking-[0.22em] text-[#7a9ec5]">
                          {t.about.competenciesTitle}
                        </p>
                        <div className="mt-4 space-y-3">
                          {competencyMatrix.slice(0, 4).map(({ competency, Icon }) => (
                            <div
                              key={competency}
                              className="flex items-center gap-3 rounded-2xl border border-white/8 bg-black/20 px-3 py-3"
                            >
                              <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-white/[0.05] text-[#7a9ec5]">
                                <Icon className="h-[1.125rem] w-[1.125rem]" />
                              </span>
                              <span className="text-sm text-slate-200">{competency}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </GlowCard>

                    <GlowCard
                      disabled={shouldReduceMotion}
                      className="rounded-[1.6rem] border border-white/10 bg-white/[0.04] backdrop-blur-lg"
                    >
                      <div className="relative z-[2] h-full rounded-[1.6rem] p-5">
                        <div className="space-y-4">
                          {t.timeline.slice(1).map((item) => (
                            <div
                              key={`${item.year}-${item.role}`}
                              className="rounded-2xl border border-white/8 bg-black/20 px-4 py-4"
                            >
                              <span className="text-[11px] font-mono uppercase tracking-[0.2em] text-[#6bb5ab]">
                                {item.year}
                              </span>
                              <h3 className="mt-2 text-base font-semibold text-white">
                                {item.role}
                              </h3>
                              <p className="mt-1 text-sm text-slate-300">
                                {item.company}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </GlowCard>
                  </div>
                </motion.div>
              </div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.1, duration: 1 }}
                className="mt-14 flex items-center gap-4"
              >
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/15 to-white/2" />
                <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.3em] text-slate-400">
                  <span>Scroll</span>
                  <motion.svg
                    animate={shouldReduceMotion ? {} : { y: [0, 6, 0] }}
                    transition={{
                      duration: 2.6,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                    className="h-5 w-5"
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
                </div>
              </motion.div>
            </div>
          </section>

          <section
            id="works"
            className="mx-auto max-w-7xl scroll-mt-28 px-6 py-24 md:scroll-mt-32 md:px-12 md:py-32"
          >
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={fadeUp}
              className="mb-16 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(320px,0.68fr)] lg:items-end"
            >
              <div>
                <div className="mb-5 flex items-center gap-4">
                  <h2 className="text-sm font-bold uppercase tracking-widest text-[#7a9ec5]">
                    {t.sections.works}
                  </h2>
                  <motion.div
                    className="h-[1px] flex-1 origin-left bg-gradient-to-r from-white/25 via-white/10 to-transparent"
                    initial={{ scaleX: 0 }}
                    whileInView={{ scaleX: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 1.2, ease: "easeOut" }}
                  />
                </div>
              </div>
              <p className="max-w-xl text-pretty text-sm leading-relaxed text-slate-300 md:text-base">
                {t.meta.description}
              </p>
            </motion.div>

            <div className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]">
              {featuredWorks[0] && (
                <RefractionGlowCard
                  disabled={shouldReduceMotion}
                  className="rounded-[2rem]"
                >
                  <motion.a
                    href={featuredWorks[0].href}
                    target="_blank"
                    rel="noreferrer"
                    initial={{ opacity: 0, scale: shouldReduceMotion ? 1 : 0.97 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{ duration: 0.7 }}
                    className="group relative z-[2] flex h-full min-h-[420px] flex-col overflow-hidden rounded-[2rem] border border-white/10 p-8 shadow-[0_28px_120px_rgba(0,0,0,0.22)] transition-all duration-500 hover:border-[#7a9ec5]/30 hover:shadow-[0_40px_120px_rgba(0,0,0,0.35)] motion-safe:hover:-translate-y-1 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white md:p-10"
                    style={{ backgroundImage: getWorkBackdrop(featuredWorks[0].id) }}
                    aria-label={`${t.workLinkLabel}: ${featuredWorks[0].title}`}
                  >
                    <span className="pointer-events-none absolute right-7 top-3 font-display text-[3.75rem] leading-none text-white/[0.05] md:text-[4.5rem]">
                      01
                    </span>
                    <div className="mb-8 flex items-start justify-between gap-4">
                      <span className="rounded-full border border-[#6bb5ab]/30 bg-black/15 px-3 py-1 text-[11px] font-mono uppercase tracking-[0.18em] text-[#6bb5ab]">
                        {featuredWorks[0].year}
                      </span>
                      <span className="max-w-[11rem] text-right text-[11px] font-mono uppercase tracking-[0.2em] text-slate-300">
                        {featuredWorks[0].venue}
                      </span>
                    </div>

                    <h3 className="max-w-2xl text-balance font-display text-4xl font-medium leading-[1.02] tracking-tight text-white transition-colors duration-300 group-hover:text-[#d6e6fa] md:text-5xl">
                      {featuredWorks[0].title}
                    </h3>

                    <p className="mt-6 max-w-2xl text-pretty text-base font-light leading-relaxed text-slate-300 md:text-lg">
                      {featuredWorks[0].blurb}
                    </p>

                    <div className="mt-auto flex flex-col gap-5 pt-10">
                      <div className="flex flex-wrap gap-2">
                        {featuredWorks[0].tags.map((tag) => (
                          <span
                            key={tag}
                            className="rounded-full border border-white/12 bg-white/[0.06] px-3 py-1.5 text-[11px] uppercase tracking-[0.18em] text-slate-200"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                      <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#7a9ec5]">
                        {t.workLinkLabel}
                        <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                      </span>
                    </div>
                  </motion.a>
                </RefractionGlowCard>
              )}

              <div className="grid gap-6">
                {featuredWorks[1] && (
                  <RefractionGlowCard
                    disabled={shouldReduceMotion}
                    className="rounded-[2rem]"
                  >
                    <motion.a
                      href={featuredWorks[1].href}
                      target="_blank"
                      rel="noreferrer"
                      initial={{ opacity: 0, scale: shouldReduceMotion ? 1 : 0.97 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true, margin: "-50px" }}
                      transition={{ duration: 0.7, delay: 0.1 }}
                      className="group relative z-[2] flex min-h-[250px] flex-col overflow-hidden rounded-[2rem] border border-white/10 p-7 shadow-[0_24px_100px_rgba(0,0,0,0.22)] transition-all duration-500 hover:border-[#6bb5ab]/28 hover:shadow-[0_30px_110px_rgba(0,0,0,0.32)] motion-safe:hover:-translate-y-1 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white md:p-8"
                      style={{ backgroundImage: getWorkBackdrop(featuredWorks[1].id) }}
                      aria-label={`${t.workLinkLabel}: ${featuredWorks[1].title}`}
                    >
                      <span className="pointer-events-none absolute right-7 top-5 font-display text-[3.25rem] leading-none text-white/[0.05]">
                        02
                      </span>
                      <div className="flex items-start justify-between gap-4">
                        <span className="rounded-full border border-[#6bb5ab]/30 bg-black/15 px-3 py-1 text-[11px] font-mono uppercase tracking-[0.18em] text-[#6bb5ab]">
                          {featuredWorks[1].year}
                        </span>
                        <span className="max-w-[9rem] text-right text-[11px] font-mono uppercase tracking-[0.18em] text-slate-300">
                          {featuredWorks[1].venue}
                        </span>
                      </div>

                      <h3 className="mt-6 max-w-md text-balance text-2xl font-semibold leading-tight tracking-tight text-white transition-colors duration-300 group-hover:text-[#d8f0ea] md:text-3xl">
                        {featuredWorks[1].title}
                      </h3>
                      <p className="mt-4 text-pretty text-sm font-light leading-relaxed text-slate-300">
                        {featuredWorks[1].blurb}
                      </p>

                      <div className="mt-auto flex items-end justify-between gap-4 pt-8">
                        <div className="flex flex-wrap gap-2">
                          {featuredWorks[1].tags.map((tag) => (
                            <span
                              key={tag}
                              className="rounded-full border border-white/12 bg-white/[0.06] px-3 py-1 text-[10px] uppercase tracking-[0.18em] text-slate-200"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                        <span className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-[0.18em] text-[#7a9ec5]">
                          <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                        </span>
                      </div>
                    </motion.a>
                  </RefractionGlowCard>
                )}
              </div>
            </div>

            <div className="mt-6 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
              {supportingWorks.map((work, index) => (
                <RefractionGlowCard
                  key={work.id}
                  disabled={shouldReduceMotion}
                  className="rounded-[1.6rem]"
                >
                  <motion.a
                    href={work.href}
                    target="_blank"
                    rel="noreferrer"
                    initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-30px" }}
                    transition={{ duration: 0.55, delay: index * 0.08 }}
                    className="group relative z-[2] flex h-full min-h-[280px] flex-col overflow-hidden rounded-[1.6rem] border border-white/10 p-6 shadow-[0_20px_70px_rgba(0,0,0,0.18)] transition-all duration-500 hover:border-white/20 hover:shadow-[0_26px_90px_rgba(0,0,0,0.28)] motion-safe:hover:-translate-y-1 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                    style={{ backgroundImage: getWorkBackdrop(work.id) }}
                    aria-label={`${t.workLinkLabel}: ${work.title}`}
                  >
                    <span className="pointer-events-none absolute right-5 top-3 font-display text-[2.5rem] leading-none text-white/[0.05]">
                      {`0${index + 3}`}
                    </span>
                    <div className="flex items-center justify-between gap-4">
                      <span className="rounded-full border border-white/12 bg-black/20 px-2.5 py-1 text-[10px] font-mono uppercase tracking-[0.18em] text-[#6bb5ab]">
                        {work.year}
                      </span>
                      <span className="text-[10px] font-mono uppercase tracking-[0.18em] text-slate-400">
                        {work.venue}
                      </span>
                    </div>

                    <h3 className="mt-6 text-balance text-xl font-semibold leading-snug tracking-tight text-white transition-colors duration-300 group-hover:text-[#d8e6f8]">
                      {work.title}
                    </h3>
                    <p className="mt-4 flex-grow text-pretty text-sm font-light leading-relaxed text-slate-300">
                      {work.blurb}
                    </p>

                    <div className="mt-6 flex flex-wrap gap-2">
                      {work.tags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full border border-white/10 bg-white/[0.06] px-2.5 py-1 text-[10px] uppercase tracking-[0.16em] text-slate-300"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </motion.a>
                </RefractionGlowCard>
              ))}
            </div>
          </section>

          <section
            id="about"
            className="mx-auto max-w-7xl scroll-mt-28 px-6 py-32 md:scroll-mt-32 md:px-12"
          >
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={fadeUp}
              className="mb-16 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(320px,0.68fr)] lg:items-end"
            >
              <div>
                <div className="mb-5 flex items-center gap-4">
                  <h2 className="text-sm font-bold uppercase tracking-widest text-[#7a9ec5]">
                    {t.sections.about}
                  </h2>
                  <motion.div
                    className="h-[1px] flex-1 origin-left bg-gradient-to-r from-white/25 via-white/10 to-transparent"
                    initial={{ scaleX: 0 }}
                    whileInView={{ scaleX: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 1.2, ease: "easeOut" }}
                  />
                </div>
                <h3 className="max-w-4xl text-balance font-display text-4xl font-medium tracking-tight text-white md:text-5xl">
                  {t.about.heading}
                </h3>
              </div>
              <p className="max-w-xl text-pretty text-sm leading-relaxed text-slate-300 md:text-base">
                {t.sections.aboutSubhead}
              </p>
            </motion.div>

            <div className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(320px,0.95fr)]">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
              >
                <div className="flex flex-col gap-6 text-base font-light leading-relaxed text-slate-300">
                  <RefractionGlowCard disabled={shouldReduceMotion} className="relative mr-0 rounded-[2rem] md:mr-18">
                    <div className="absolute -inset-3 rounded-[2.2rem] bg-[radial-gradient(circle_at_top_left,rgba(122,158,197,0.16),transparent_72%)]" />
                    <div className="relative z-[2] rounded-[2rem] border border-white/10 bg-black/15 p-6 shadow-[0_24px_80px_rgba(0,0,0,0.18)] backdrop-blur-sm md:p-8">
                      <span className="mb-4 inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-mono uppercase tracking-[0.22em] text-[#7a9ec5]">
                        {aboutStoryLabels[0]}
                      </span>
                      <p lang={locale} className="text-left text-pretty">
                        {renderInlineEmphasis(t.about.bio[0])}
                      </p>
                    </div>
                  </RefractionGlowCard>

                  <RefractionGlowCard disabled={shouldReduceMotion} className="relative ml-0 rounded-[2rem] md:ml-20">
                    <div className="absolute -inset-3 rounded-[2.2rem] bg-[radial-gradient(circle_at_bottom_right,rgba(107,181,171,0.18),transparent_72%)]" />
                    <div className="relative z-[2] rounded-[2rem] border border-[#7a9ec5]/20 bg-[#0d1721]/65 p-6 shadow-[0_24px_80px_rgba(0,0,0,0.22)] backdrop-blur-md md:p-8">
                      <span className="mb-4 inline-flex items-center rounded-full border border-[#6bb5ab]/20 bg-[#6bb5ab]/8 px-3 py-1 text-[10px] font-mono uppercase tracking-[0.22em] text-[#6bb5ab]">
                        {aboutStoryLabels[1]}
                      </span>
                      <p lang={locale} className="text-left text-pretty">
                        {renderInlineEmphasis(t.about.bio[1])}
                      </p>
                    </div>
                  </RefractionGlowCard>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className="relative lg:sticky lg:top-28"
              >
                <GlowCard
                  disabled={shouldReduceMotion}
                  className="rounded-[2rem] border border-white/10 bg-white/[0.04] backdrop-blur-xl"
                >
                  <div className="relative z-[2] overflow-hidden rounded-[2rem] p-6 md:p-8">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(122,158,197,0.14),transparent_40%),radial-gradient(circle_at_bottom_right,rgba(107,181,171,0.1),transparent_38%)]" />
                    <div className="relative z-[2]">
                      <h4 className="text-sm font-bold uppercase tracking-widest text-white">
                        {t.about.competenciesTitle}
                      </h4>
                      <div className="mt-6 grid gap-4 sm:grid-cols-2">
                        {competencyMatrix.map(({ competency, description, Icon }) => (
                          <div
                            key={competency}
                            className="rounded-[1.4rem] border border-white/10 bg-black/20 p-4"
                          >
                            <div className="flex items-center gap-3">
                              <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-white/[0.05] text-[#7a9ec5]">
                                <Icon className="h-[1.125rem] w-[1.125rem]" />
                              </span>
                              <h5 className="text-sm font-semibold text-white">
                                {competency}
                              </h5>
                            </div>
                            <p className="mt-3 text-sm leading-relaxed text-slate-300">
                              {description}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </GlowCard>

                <GlowCard
                  disabled={shouldReduceMotion}
                  className="mt-6 rounded-[2rem] border border-white/10 bg-white/[0.04] backdrop-blur-xl"
                >
                  <div className="relative z-[2] overflow-hidden rounded-[2rem] p-6 md:p-8">
                    <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))]" />
                    <div className="relative z-[2]">
                      <div className="mb-6 flex items-center gap-4">
                        <div className="h-px flex-1 bg-gradient-to-r from-white/20 to-transparent" />
                        <span className="text-[11px] font-mono uppercase tracking-[0.24em] text-[#7a9ec5]">
                          {t.nav.about}
                        </span>
                      </div>

                      <div className="relative space-y-4 before:absolute before:bottom-6 before:left-[1.05rem] before:top-5 before:w-px before:bg-white/10">
                        {t.timeline.map((item, i) => (
                          <motion.div
                            key={i}
                            className="relative pl-10"
                            initial={{ opacity: 0, x: shouldReduceMotion ? 0 : -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{
                              duration: 0.6,
                              delay: i * 0.08,
                              ease: "easeOut",
                            }}
                          >
                            <div className="absolute left-0 top-5 h-3 w-3 rounded-full bg-[#6bb5ab] shadow-[0_0_14px_rgba(66,120,114,0.9)]" />
                            <div className="rounded-[1.4rem] border border-white/10 bg-black/20 p-4">
                              <span className="text-[11px] font-mono uppercase tracking-[0.2em] text-[#6bb5ab]">
                                {item.year}
                              </span>
                              <h4 className="mt-2 text-lg font-semibold text-white">
                                {item.role}
                              </h4>
                              <span className="mt-1 block text-sm font-medium text-slate-300">
                                {item.company}
                              </span>
                              <p className="mt-3 text-pretty text-sm font-light leading-relaxed text-slate-300">
                                {item.desc}
                              </p>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </div>
                </GlowCard>
              </motion.div>
            </div>
          </section>

          <section
            id="contact"
            className="mx-auto max-w-7xl scroll-mt-28 px-6 pb-24 pt-4 md:scroll-mt-32 md:px-12 md:pb-32"
          >
            <RefractionGlowCard
              disabled={shouldReduceMotion}
              className="rounded-[2.4rem]"
            >
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={staggerContainer}
                className="relative overflow-hidden rounded-[2.4rem] border border-white/10 bg-[linear-gradient(140deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))] px-6 py-8 shadow-[0_35px_140px_rgba(0,0,0,0.28)] backdrop-blur-xl md:px-10 md:py-10"
              >
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(122,158,197,0.18),transparent_32%),radial-gradient(circle_at_bottom_right,rgba(107,181,171,0.16),transparent_36%)]" />
                <div className="relative z-[2]">
                  <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
                    <div>
                      <motion.div
                        variants={fadeUp}
                        className="mb-6 flex items-center gap-4"
                      >
                        <span className="text-[11px] font-mono uppercase tracking-[0.28em] text-[#7a9ec5]">
                          {t.nav.contact}
                        </span>
                        <div className="h-px flex-1 bg-gradient-to-r from-white/25 via-white/10 to-transparent" />
                      </motion.div>

                      <motion.h2
                        variants={fadeScale}
                        className="max-w-4xl text-balance font-accent text-4xl font-medium tracking-tight text-white md:text-6xl"
                      >
                        {t.contact.heading}
                      </motion.h2>
                      <motion.p
                        variants={fadeUp}
                        className="mt-6 max-w-2xl text-pretty font-light leading-relaxed text-slate-300"
                      >
                        {t.contact.subtitle}
                      </motion.p>
                    </div>

                    <motion.div
                      variants={fadeUp}
                      className="flex flex-col items-start gap-4 lg:items-end"
                    >
                      <MagneticLink
                        href={`mailto:${t.contact.emailLabel}`}
                        disabled={shouldReduceMotion}
                        className="inline-flex items-center gap-3 rounded-full border border-white/15 bg-white/[0.04] px-6 py-4 text-base font-semibold text-white transition-colors hover:border-white/30 hover:bg-white/[0.08] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white md:text-xl"
                      >
                        {t.contact.emailLabel}
                        <ArrowUpRight className="h-[1.125rem] w-[1.125rem]" />
                      </MagneticLink>
                      <ProfileLinks
                        className="flex flex-wrap items-center gap-3"
                        iconClassName="h-[1.125rem] w-[1.125rem]"
                      />
                    </motion.div>
                  </div>

                  <motion.p
                    variants={fadeUp}
                    className="mt-10 text-[11px] font-mono uppercase tracking-[0.18em] text-slate-300 tabular-nums"
                  >
                    {t.hero.proof.join(" · ")}
                  </motion.p>

                  <motion.div
                    variants={fadeUp}
                    className="mt-10 flex flex-col items-start justify-between gap-6 border-t border-white/10 pt-6 text-xs font-mono text-slate-300 md:flex-row md:items-center"
                  >
                    <p className="tabular-nums">
                      &copy; {new Date().getFullYear()} Ramon Roca Pinilla.{" "}
                      {t.contact.footer}
                    </p>
                    <div className="flex items-center">
                      <LanguageSwitcher locale={locale} />
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            </RefractionGlowCard>
          </section>
        </main>
      </div>
    </>
  );
}
