# Claudia Roussel

Personal site. Home is Projects.

## Fill in

- Homepage intro: `src/components/Header.astro`
- Project labels and sizes: `src/data/projects.ts`
- Project photographs: `public/images/projects/{slug}.jpg`  
  (`superpower`, `rippling`, `mercu`, `flagship`, `refundid`)
- Portrait: `public/images/claudia.jpg`
- Services copy: `src/data/services.ts`
- About page: `src/pages/claudia.astro`
- Contact email: `src/pages/contact.astro`

## Blog

Drag a `.md` file into `blog/`. Format is in [`blog/README.md`](blog/README.md).

## Local

```bash
npm install
npm run dev
```

GitHub Pages builds from `main` via `.github/workflows/deploy.yml`. In the repo settings, set Pages to **GitHub Actions**.
