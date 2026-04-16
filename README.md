# Portfolio — Ramon Roca Pinilla

Personal portfolio site. Static export from Next.js, deployed in parallel to **Vercel** (canonical) and **GitHub Pages** (mirror + media CDN).

Live:
- https://rrocap.github.io/portfolio-gemini/

## Stack

- Next.js 16 (App Router, `output: "export"`)
- React 19, TypeScript 5.9
- Tailwind CSS v4
- Three.js + React Three Fiber (WebGL Gray-Scott reaction-diffusion background)
- Framer Motion, Radix UI, Lucide / Tabler icons
- i18n: en / es / ca (locale-routed under `/[locale]`)

## Develop

```bash
npm install
npm run dev      # http://localhost:3000
npm run lint
npm run build    # → out/ (static)
```

## Deploy

Both deploys trigger on push to `main`:

| Target | Workflow | Base path | Notes |
|---|---|---|---|
| Vercel (prod) | `.github/workflows/vercel-deploy.yml` | `""` | Removes `public/background.mp4` and points `NEXT_PUBLIC_BACKGROUND_VIDEO_URL` at the GH Pages copy to keep the bundle small. |
| GitHub Pages | `.github/workflows/github-pages-deploy.yml` | `/portfolio-gemini` | Auto-resolves base path from repo name. Hosts the heavy `background.mp4` asset. |

`NEXT_PUBLIC_BASE_PATH` is read by `next.config.ts`, `sitemap.ts`, `robots.ts`, and root metadata so OG/canonical URLs resolve correctly per target.

## Layout

```
src/
  app/
    layout.tsx              global metadata, fonts, analytics
    page.tsx                static shell → /en (with hreflang)
    sitemap.ts / robots.ts  Next.js metadata routes
    [locale]/               en / es / ca routes
  components/               UI + WebGL background
  hooks/  lib/              i18n strings, helpers
public/
  background.mp4            served via GH Pages on Vercel builds
  poster.jpg, audio/, works/
```
