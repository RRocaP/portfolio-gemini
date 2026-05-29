"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  ArrowUpRight,
  BadgeCheck,
  Code2,
  FlaskConical,
  GraduationCap,
  Mail,
  Menu,
  Microscope,
  ShieldCheck,
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
import dynamic from "next/dynamic";

const heroPosterSrc = "/protein-fold.webp";

function HeroPoster() {
  return (
    <img
      src={heroPosterSrc}
      alt=""
      aria-hidden="true"
      className="h-full w-full object-cover"
    />
  );
}

// Defer the ~600KB three.js bundle off the critical path; the poster paints
// instantly and fills the same container (zero CLS).
const InteractiveProtein = dynamic(
  () => import("@/components/InteractiveProtein"),
  { ssr: false, loading: () => <HeroPoster /> },
);

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
      <path d="M12 6.8 L16.8 15 L7.2 15 Z" />
      <path d="M12 6.8 L12 2.5" />
      <path d="M16.8 15 L20.5 16.5" />
      <path d="M7.2 15 L3.5 16.5" />
      <path d="M12 6.8 L20.5 7.5" opacity="0.45" />
      <path d="M12 6.8 L3.5 7.5" opacity="0.45" />
    </svg>
  );
}

function ProteinLMIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d="M9 19.5h8" strokeWidth="2" opacity="0.85" vectorEffect="non-scaling-stroke" />
      <path d="M9 26.5h12" strokeWidth="2" opacity="0.85" vectorEffect="non-scaling-stroke" />
      <path d="M9 33.5h9" strokeWidth="2" opacity="0.85" vectorEffect="non-scaling-stroke" />
      <path d="M9 40.5h13" strokeWidth="2" opacity="0.85" vectorEffect="non-scaling-stroke" />
      <path d="M9 47.5h7" strokeWidth="2" opacity="0.85" vectorEffect="non-scaling-stroke" />
      <path d="M23 21c5.2 2.1 8.2 5.4 10 12" strokeWidth="1.3" opacity="0.6" vectorEffect="non-scaling-stroke" />
      <path d="M24 41c4.8-1.9 7.5-4.6 9-8" strokeWidth="1.3" opacity="0.6" vectorEffect="non-scaling-stroke" />
      <path d="M21 27c5.2.7 9 2.9 12 6" strokeWidth="1.3" opacity="0.6" vectorEffect="non-scaling-stroke" />
      <path d="M21 34h12" strokeWidth="1.3" opacity="0.6" vectorEffect="non-scaling-stroke" />
      <circle cx="34" cy="33" r="3.2" fill="currentColor" stroke="none" />
      <circle cx="27" cy="24" r="1.45" fill="currentColor" stroke="none" opacity="0.6" />
      <circle cx="27" cy="42" r="1.45" fill="currentColor" stroke="none" opacity="0.6" />
      <path d="M42.5 17.5c6.2-3 11.4-2.6 15.2.8" strokeWidth="2.4" vectorEffect="non-scaling-stroke" />
      <path d="M40.7 25.1c7.1-3.6 13.1-3.1 17.6.7" strokeWidth="2.4" vectorEffect="non-scaling-stroke" />
      <path d="M40.3 32.7c7.1-3.6 13.4-3 18 .7" strokeWidth="2.4" vectorEffect="non-scaling-stroke" />
      <path d="M40.7 40.2c7.1-3.5 13.1-3 17.6.7" strokeWidth="2.4" vectorEffect="non-scaling-stroke" />
      <path d="M42.5 47.8c6.2-3 11.4-2.6 15.2.8" strokeWidth="2.4" vectorEffect="non-scaling-stroke" />
      <path d="M48.7 16.2c-3 7.6-2.6 14.8.9 21.6 2 3.8 4.7 7.1 8 9.8" strokeWidth="1.4" opacity="0.55" vectorEffect="non-scaling-stroke" />
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

const competencyIcons = [
  ProteinLMIcon,
  IcosahedronIcon,
  Code2,
  ShieldCheck,
  Microscope,
  FlaskConical,
] as const;

const pageCopy: Record<
  Locale,
  {
    impact: string;
    current: string;
    profile: string;
    researchFocus: string;
    selectedResearch: string;
    experience: string;
    contactCta: string;
    contactButton: string;
    read: string;
  }
> = {
  en: {
    impact: "Evidence",
    current: "Current position",
    profile: "Profile",
    researchFocus: "Research focus",
    selectedResearch: "Selected research",
    experience: "Experience",
    contactCta: "Discuss a role",
    contactButton: "Email Ramon",
    read: "Read paper",
  },
  es: {
    impact: "Evidencia",
    current: "Posición actual",
    profile: "Perfil",
    researchFocus: "Foco de investigación",
    selectedResearch: "Investigación seleccionada",
    experience: "Experiencia",
    contactCta: "Hablar de una oportunidad",
    contactButton: "Enviar email",
    read: "Ver artículo",
  },
  ca: {
    impact: "Evidència",
    current: "Posició actual",
    profile: "Perfil",
    researchFocus: "Focus de recerca",
    selectedResearch: "Recerca seleccionada",
    experience: "Experiència",
    contactCta: "Parlar d'una oportunitat",
    contactButton: "Enviar email",
    read: "Veure article",
  },
};

function LanguageSwitcher({
  locale,
  tone = "dark",
}: {
  locale: Locale;
  tone?: "dark" | "light";
}) {
  const inactive =
    tone === "light"
      ? "text-white/72 hover:text-white"
      : "text-[#6b5d45] hover:text-[#23201a]";
  const active =
    tone === "light"
      ? "border-white/35 bg-white/12 text-white"
      : "border-[#23201a]/20 bg-[#23201a] text-white";

  return (
    <div className="flex items-center gap-1">
      {locales.map((l) => (
        <Link
          key={l}
          href={`/${l}`}
          aria-current={l === locale ? "page" : undefined}
          lang={l}
          className={`rounded-md border px-2.5 py-1.5 text-xs font-medium uppercase transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 ${
            l === locale
              ? active
              : `border-transparent ${inactive} focus-visible:outline-current`
          }`}
        >
          {l}
        </Link>
      ))}
    </div>
  );
}

function ProfileLinks({
  tone = "dark",
  className = "",
}: {
  tone?: "dark" | "light";
  className?: string;
}) {
  const linkClass =
    tone === "light"
      ? "border-white/20 text-white/76 hover:border-white/45 hover:bg-white/10 hover:text-white focus-visible:outline-white"
      : "border-[#23201a]/15 text-[#5a4c38] hover:border-[#23201a]/35 hover:bg-white hover:text-[#23201a] focus-visible:outline-[#23201a]";

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {profileLinks.map(({ label, href, Icon }) => (
        <a
          key={label}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={label}
          title={label}
          className={`inline-flex h-9 w-9 items-center justify-center rounded-md border transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 ${linkClass}`}
        >
          <Icon className="h-4 w-4" />
          <span className="sr-only">{label}</span>
        </a>
      ))}
    </div>
  );
}

function SectionKicker({
  children,
  dark = false,
  index,
}: {
  children: React.ReactNode;
  dark?: boolean;
  index?: string;
}) {
  return (
    <p
      className={`font-mono text-[0.65rem] uppercase tracking-[0.22em] ${
        dark ? "text-[#9fc8c0]" : "text-[#356b68]"
      }`}
    >
      {index && (
        <span aria-hidden="true" className="mr-3 opacity-55">
          {index}
        </span>
      )}
      <span aria-hidden="true" className="mr-2 opacity-60">
        —
      </span>
      {children}
    </p>
  );
}

function Header({
  locale,
  t,
  scrolled,
  mobileMenuOpen,
  setMobileMenuOpen,
}: {
  locale: Locale;
  t: Translation;
  scrolled: boolean;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const navItems = [
    { label: t.nav.works, href: "#works" },
    { label: t.nav.about, href: "#about" },
    { label: t.nav.contact, href: "#contact" },
  ];

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 border-b transition-colors duration-300 ${
        scrolled || mobileMenuOpen
          ? "border-[#23201a]/10 bg-[#f4ede0]/92 text-[#23201a] backdrop-blur-xl"
          : "border-transparent bg-transparent text-[#23201a]"
      }`}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 md:px-10">
        <Link
          href={`/${locale}`}
          className="text-sm font-semibold uppercase focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current md:text-base"
        >
          Ramon Roca Pinilla
        </Link>

        <nav className="hidden items-center gap-7 md:flex">
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="text-sm font-medium text-[#6d5e47] transition-colors hover:text-[#23201a] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current"
            >
              {item.label}
            </a>
          ))}
          <ProfileLinks tone="dark" />
          <LanguageSwitcher locale={locale} tone="dark" />
        </nav>

        <button
          className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-[#23201a]/15 text-[#23201a] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current md:hidden"
          onClick={() => setMobileMenuOpen((open) => !open)}
          aria-label={mobileMenuOpen ? t.mobileMenu.close : t.mobileMenu.open}
          aria-expanded={mobileMenuOpen}
          aria-controls="mobile-menu"
        >
          {mobileMenuOpen ? <X size={21} /> : <Menu size={21} />}
        </button>
      </div>
    </header>
  );
}

export default function PortfolioPage() {
  const params = useParams<{ locale: string }>();
  const locale: Locale = isValidLocale(params.locale) ? params.locale : "en";
  const t = translations[locale];
  const copy = pageCopy[locale];
  const shouldReduceMotion = useReducedMotion();

  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  // Defer the client-only hero choice until after mount so the server and the
  // first client render agree (both show the poster), avoiding a hydration mismatch.
  const [mounted, setMounted] = useState(false);

  // Single one-time mount flag — the intentional extra render is the point here.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 28);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  const featuredWorks = useMemo(
    () => [1, 2, 3].map((id) => t.works.find((work) => work.id === id)!),
    [t.works],
  );

  const remainingWorks = useMemo(
    () => t.works.filter((work) => !featuredWorks.some((item) => item.id === work.id)),
    [featuredWorks, t.works],
  );

  const competencyMatrix = useMemo(
    () =>
      t.about.competencies.map((competency, index) => ({
        competency,
        description: t.about.competencyDescriptions[index],
        Icon: competencyIcons[index] ?? BadgeCheck,
      })),
    [t.about.competencies, t.about.competencyDescriptions],
  );

  const fadeUp = {
    hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 18 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as const },
    },
  };

  const navItems = [
    { label: t.nav.works, href: "#works" },
    { label: t.nav.about, href: "#about" },
    { label: t.nav.contact, href: "#contact" },
  ];

  return (
    <div className="min-h-screen bg-[#f4ede0] text-[#23201a] selection:bg-[#dcc9a5] selection:text-[#23201a]">
      <a
        href="#works"
        className="sr-only focus:not-sr-only focus:fixed focus:left-1/2 focus:top-4 focus:z-[70] focus:-translate-x-1/2 focus:rounded-md focus:bg-white focus:px-5 focus:py-3 focus:text-sm focus:font-semibold focus:text-[#23201a]"
      >
        {t.skipLink}
      </a>

      <Header
        locale={locale}
        t={t}
        scrolled={scrolled}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
      />

      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.nav
            id="mobile-menu"
            role="dialog"
            aria-modal="true"
            aria-labelledby="mobile-menu-title"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 flex flex-col justify-center bg-[#f4ede0] px-8 text-[#23201a] md:hidden"
          >
            <h2 id="mobile-menu-title" className="sr-only">
              {t.mobileMenu.title}
            </h2>
            <div className="space-y-6">
              {navItems.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-[2.45rem] font-semibold leading-none tracking-[-0.02em] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#23201a]"
                >
                  {item.label}
                </a>
              ))}
            </div>
            <div className="mt-12 flex flex-wrap items-center gap-5">
              <ProfileLinks />
              <LanguageSwitcher locale={locale} />
            </div>
          </motion.nav>
        )}
      </AnimatePresence>

      <main>
        <section className="relative isolate min-h-[94svh] overflow-hidden bg-[#f5eee1] pt-16 text-[#23201a] md:pt-20">
          <div
            aria-hidden="true"
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(72% 66% at 78% 52%, rgba(240,168,155,0.18), rgba(245,238,225,0.10) 60%, transparent 78%), radial-gradient(54% 44% at 12% 22%, rgba(255,250,242,0.86), transparent 70%), linear-gradient(180deg, rgba(248,242,232,0.92), rgba(244,234,219,0.88))",
            }}
          />

          <div className="relative z-10 mx-auto grid min-h-[calc(94svh-4rem)] max-w-[90rem] grid-cols-1 gap-10 px-5 pb-12 pt-5 md:min-h-[calc(94svh-5rem)] md:px-10 md:pb-16 lg:grid-cols-[0.40fr_0.60fr] lg:items-center lg:gap-10 lg:pt-0">
            <motion.div
              initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.0, ease: [0.16, 1, 0.3, 1] }}
              className="relative z-20 max-w-2xl"
            >
              <SectionKicker>{copy.profile}</SectionKicker>
              <h1 className="mt-7 text-balance font-display text-[clamp(3rem,6vw,6.6rem)] font-normal leading-[0.95] tracking-[-0.02em]">
                {t.hero.title}
              </h1>
              <p className="mt-8 max-w-[34rem] text-pretty text-[1.05rem] leading-[1.65] text-[#5a4c38] md:text-[1.18rem] md:leading-[1.62]">
                {t.hero.subtitle}
              </p>
              <ul className="mt-8 flex max-w-2xl flex-wrap gap-2">
                {t.hero.proof.map((item) => (
                  <li
                    key={item}
                    className="rounded-full border border-[#23201a]/18 bg-white/40 px-3 py-1.5 font-mono text-[0.68rem] uppercase tracking-[0.12em] text-[#5a4c38] backdrop-blur-sm"
                  >
                    {item}
                  </li>
                ))}
              </ul>
              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <a
                  href="#works"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-[#23201a] px-6 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-[#3a342a] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#23201a]"
                >
                  {t.hero.ctaPrimary}
                  <ArrowUpRight className="h-4 w-4" />
                </a>
                <a
                  href="#contact"
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-[#23201a]/25 bg-white/30 px-6 py-3.5 text-sm font-semibold text-[#23201a] transition-colors hover:bg-white/65 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#23201a]"
                >
                  {t.hero.ctaSecondary}
                  <Mail className="h-4 w-4" />
                </a>
              </div>
            </motion.div>

            <motion.figure
              initial={{ opacity: 0, scale: 0.985 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
              className="relative z-10 m-0 aspect-[1.05/1] w-full min-h-[28rem] lg:aspect-auto lg:h-[min(78svh,720px)]"
            >
              <div
                aria-hidden="true"
                className="absolute inset-[-12%] bg-[radial-gradient(ellipse_at_56%_52%,rgba(240,168,155,0.22),rgba(218,41,28,0.06)_36%,rgba(245,238,225,0)_72%)] blur-3xl"
              />
              <div className="absolute inset-0 z-10 overflow-hidden rounded-2xl">
                {mounted && shouldReduceMotion === false ? <InteractiveProtein /> : <HeroPoster />}
              </div>
              <figcaption className="sr-only">
                {t.dynamics.caption}
              </figcaption>
            </motion.figure>
          </div>
        </section>

        {/* Hairline rule separator — replaces the cool-grey stripe background */}
        <div aria-hidden="true" className="mx-auto max-w-7xl px-5 md:px-10">
          <div className="h-px w-full bg-[rgba(154,51,40,0.18)]" />
        </div>

        <section aria-label={copy.impact}>
          <div className="mx-auto grid max-w-7xl divide-y divide-[rgba(35,32,26,0.10)] px-5 md:grid-cols-4 md:divide-x md:divide-y-0 md:px-10">
            {t.about.stats.map((stat) => (
              <div key={stat.label} className="py-7 md:px-7 md:py-9">
                <p className="font-mono text-xs uppercase tracking-[0.12em] text-[#6b5d45]">
                  {stat.label}
                </p>
                <p className="mt-2 text-4xl font-semibold text-[#23201a]">
                  {stat.value}
                </p>
              </div>
            ))}
          </div>
        </section>

        <div aria-hidden="true" className="mx-auto max-w-7xl px-5 md:px-10">
          <div className="h-px w-full bg-[rgba(154,51,40,0.18)]" />
        </div>

        <section className="mx-auto max-w-7xl px-5 py-[4.5rem] md:px-10 md:py-24">
          <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={fadeUp}
            >
              <SectionKicker index="01">{copy.current}</SectionKicker>
              <h2 className="mt-4 max-w-2xl text-balance text-[2.5rem] font-display font-normal leading-[0.98] tracking-[-0.01em] md:text-[3.5rem]">
                {t.timeline[0].role}
              </h2>
              <p className="mt-3 text-lg font-medium text-[#5a4c38]">
                {t.timeline[0].company}
              </p>
              <p className="mt-5 max-w-2xl text-pretty text-base leading-7 text-[#6d5e47]">
                {t.timeline[0].desc}
              </p>
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={fadeUp}
              className="grid gap-3 sm:grid-cols-2"
            >
              {competencyMatrix.slice(0, 4).map(({ competency, Icon }) => (
                <div
                  key={competency}
                  className="min-h-32 rounded-lg border border-[#d8cfba] bg-[#fbf6ec] p-6 shadow-[0_18px_55px_rgba(21,23,25,0.035)] transition-colors hover:border-[#bcb09a] hover:bg-white"
                >
                  <Icon className="h-5 w-5 text-[#356b68]" />
                  <p className="mt-6 max-w-[13rem] text-lg font-semibold leading-snug">
                    {competency}
                  </p>
                </div>
              ))}
            </motion.div>
          </div>
        </section>

        <section
          id="works"
          aria-labelledby="works-heading"
          className="scroll-mt-24 bg-[#f6efe3]"
        >
          <div className="mx-auto max-w-7xl px-5 py-[4.5rem] md:px-10 md:py-24">
            <div className="mb-14 grid gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
              <div>
                <SectionKicker index="02">{copy.selectedResearch}</SectionKicker>
                <h2
                  id="works-heading"
                  className="mt-4 max-w-3xl text-balance text-[2.5rem] font-display font-normal leading-[0.98] tracking-[-0.01em] md:text-[3.5rem]"
                >
                  {t.sections.works}
                </h2>
              </div>
              <p className="max-w-2xl text-pretty text-base leading-7 text-[#6d5e47]">
                {t.meta.description}
              </p>
            </div>

            <div className="divide-y divide-[#d9dfdc] border-y border-[#d9dfdc]">
              {featuredWorks.map((work, index) => (
                <motion.article
                  key={work.id}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: "-80px" }}
                  variants={fadeUp}
                  className="group grid gap-6 py-8 transition-colors hover:bg-[#f7f8f6] lg:grid-cols-[0.16fr_1fr_0.24fr] lg:px-5 lg:py-11"
                >
                  <div>
                    <p className="inline-flex items-center gap-1.5 font-mono text-sm text-[#356b68]">
                      {String(index + 1).padStart(2, "0")}
                      <span
                        aria-hidden="true"
                        className="translate-x-[-2px] opacity-0 transition-all duration-300 ease-out group-hover:translate-x-0 group-hover:opacity-100"
                      >
                        ↘
                      </span>
                    </p>
                    <p className="mt-3 font-mono text-xs text-[#6b5d45]">
                      {work.year}
                    </p>
                  </div>
                  <div>
                    <p className="font-mono text-xs uppercase text-[#6b5d45]">
                      {work.venue}
                    </p>
                    <h3 className="mt-3 max-w-3xl text-3xl font-semibold leading-tight">
                      {work.title}
                    </h3>
                    <p className="mt-4 max-w-3xl text-pretty text-base leading-7 text-[#6d5e47]">
                      {work.blurb}
                    </p>
                    <div className="mt-5 flex flex-wrap gap-2">
                      {work.tags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-md border border-[#d8cfba] bg-[#f4ede0] px-2.5 py-1 text-xs text-[#5a4c38]"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="lg:pt-9 lg:text-right">
                    <a
                      href={work.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded-md border border-[#23201a]/15 px-4 py-2 text-sm font-semibold transition-colors hover:border-[#23201a]/35 hover:bg-[#23201a] hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#23201a]"
                    >
                      {copy.read}
                      <ArrowUpRight className="h-4 w-4" />
                    </a>
                  </div>
                </motion.article>
              ))}
            </div>

            <div className="mt-10 grid gap-4 md:grid-cols-3">
              {remainingWorks.map((work) => (
                <a
                  key={work.id}
                  href={work.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex min-h-[18rem] flex-col rounded-lg border border-[#d8cfba] bg-[#fcf8ef] p-5 shadow-[0_18px_55px_rgba(21,23,25,0.035)] transition-colors hover:border-[#23201a]/35 hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#23201a]"
                >
                  <p className="font-mono text-xs text-[#6b5d45]">
                    {work.year} / {work.venue}
                  </p>
                  <h3 className="mt-4 text-xl font-semibold leading-snug">
                    {work.title}
                  </h3>
                  <p className="mt-3 text-sm leading-6 text-[#6d5e47]">
                    {work.blurb}
                  </p>
                  <span className="mt-auto inline-flex items-center gap-2 pt-6 text-sm font-semibold text-[#356b68]">
                    {copy.read}
                    <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </span>
                </a>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-5 py-[4.5rem] md:px-10 md:py-24">
          <div className="mb-12 max-w-3xl">
            <SectionKicker index="03">{copy.researchFocus}</SectionKicker>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {competencyMatrix.map(({ competency, description, Icon }) => (
              <div
                key={competency}
                className="rounded-lg border border-[#d8cfba] bg-[#fbf6ec] p-6 shadow-[0_18px_55px_rgba(21,23,25,0.035)] transition-colors hover:border-[#bcb09a] hover:bg-white"
              >
                <Icon className="h-5 w-5 text-[#356b68]" />
                <h3 className="mt-5 text-lg font-semibold">{competency}</h3>
                <p className="mt-3 text-sm leading-6 text-[#6d5e47]">
                  {description}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section
          id="about"
          aria-labelledby="about-heading"
          className="scroll-mt-24"
        >
          <div className="mx-auto grid max-w-7xl gap-12 px-5 py-[4.5rem] md:px-10 md:py-24 lg:grid-cols-[0.82fr_1.18fr]">
            <div>
              <SectionKicker index="04">{copy.experience}</SectionKicker>
              <h2
                id="about-heading"
                className="mt-4 text-balance text-[2.5rem] font-display font-normal leading-[0.98] tracking-[-0.01em] md:text-[3.5rem]"
              >
                {t.sections.about}
              </h2>
              <p className="mt-5 max-w-xl text-pretty text-base leading-7 text-[#6d5e47]">
                {t.sections.aboutSubhead}
              </p>
            </div>

            <div>
              <div className="space-y-6 text-base leading-7 text-[#5a4c38]">
                {t.about.bio.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>

              <ol className="mt-12 divide-y divide-[#c9bfa8] border-y border-[#c9bfa8]">
                {t.timeline.map((item) => (
                  <li key={`${item.year}-${item.role}`} className="grid gap-4 py-6 md:grid-cols-[0.22fr_1fr]">
                    <p className="font-mono text-sm text-[#356b68]">
                      {item.year}
                    </p>
                    <div>
                      <h3 className="text-xl font-semibold">{item.role}</h3>
                      <p className="mt-1 font-medium text-[#6d5e47]">
                        {item.company}
                      </p>
                      <p className="mt-3 text-sm leading-6 text-[#6d5e47]">
                        {item.desc}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </section>

        <section
          id="contact"
          aria-labelledby="contact-heading"
          className="scroll-mt-24 bg-[#101312] text-white"
        >
          <div className="mx-auto max-w-7xl px-5 py-24 md:px-10 md:py-32">
            <div className="grid gap-10 lg:grid-cols-[1fr_0.45fr] lg:items-end">
              <div>
                <SectionKicker dark>{copy.contactCta}</SectionKicker>
                <h2
                  id="contact-heading"
                  className="mt-5 max-w-4xl text-balance text-[2.75rem] font-display font-normal leading-[0.98] tracking-[-0.01em] md:text-[4rem]"
                >
                  {t.contact.heading}
                </h2>
                <p className="mt-6 max-w-2xl text-pretty text-base leading-7 text-white/72">
                  {t.contact.subtitle}
                </p>
              </div>

              <div className="flex flex-col items-start gap-4 lg:items-end">
                <a
                  href={`mailto:${t.contact.emailLabel}`}
                  className="inline-flex items-center gap-2 rounded-md bg-white px-5 py-3 text-sm font-semibold text-[#23201a] transition-colors hover:bg-[#e6dfd0] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                >
                  {copy.contactButton}
                  <ArrowUpRight className="h-4 w-4" />
                </a>
                <ProfileLinks tone="light" />
              </div>
            </div>

            <div className="mt-14 flex flex-col justify-between gap-5 border-t border-white/12 pt-6 text-sm text-white/58 md:flex-row md:items-center">
              <p>
                &copy; {new Date().getFullYear()} Ramon Roca Pinilla.{" "}
                {t.contact.footer}
              </p>
              <LanguageSwitcher locale={locale} tone="light" />
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
