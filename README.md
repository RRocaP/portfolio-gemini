# portfolio-gemini

Personal portfolio for **Ramon Roca Pinilla** — biomedical engineer working on
protein design, antimicrobial discovery, and AAV gene therapy.

Trilingual single page (EN / ES / CA) with a Gray–Scott reaction–diffusion
WebGL background, kinetic typography, ambient audio, and a bento grid of
selected publications.

## Stack

- [Next.js 16](https://nextjs.org) with `output: "export"` (static site)
- React 19, TypeScript
- Tailwind CSS 4
- [Framer Motion](https://www.framer.com/motion/) — UI animation
- [Three.js](https://threejs.org) + [@react-three/fiber](https://r3f.docs.pmnd.rs)
  + [@react-three/postprocessing](https://pmndrs.github.io/postprocessing/) —
  GPU reaction–diffusion shader background

## Develop

```bash
npm install
npm run dev        # http://localhost:3000 (redirects to /en)
npm run lint
npm run build      # writes static site to ./out
```

## Deploy

Two GitHub Actions deploy from `main` on every push:

- `github-pages-deploy.yml` → [GitHub Pages](https://rrocap.github.io/portfolio-gemini/)
  (sets `NEXT_PUBLIC_BASE_PATH=/portfolio-gemini`)
- `vercel-deploy.yml` → Vercel production

Manual runs are available via `workflow_dispatch` on each workflow.
