# Maple Air — Assets Folder Guide

All files marked with `(placeholder)` need to be replaced with real assets before launch.

---

## Current Files

| File | Status | Notes |
|------|--------|-------|
| `logo.svg` | ✅ Placeholder | Wordmark — MAPLE serif + AIR sans. Replace with final brand SVG from design team. |
| `logo-white.svg` | ✅ Placeholder | White/reversed version for dark backgrounds (footer, overlays). |
| `favicon.svg` | ✅ Placeholder | "MA" monogram on sage green. Export as `favicon.ico` at 16, 32, 48px for full browser support. |
| `hero-placeholder.svg` | ✅ Placeholder | Replace with `hero-lifestyle.jpg` — bright airy interior, natural light, family, 1200×960px. |
| `product-idu50k-placeholder.svg` | ✅ Placeholder | Replace with `product-idu50k.jpg` — clean product photo of IDU 50K unit, 1200×800px. |
| `lab-before-placeholder.svg` | ✅ Placeholder | Replace with `lab-before.jpg` — petri dish before treatment (1,358 CFU/m³), 900×750px. |
| `lab-after-placeholder.svg` | ✅ Placeholder | Replace with `lab-after.jpg` — petri dish after treatment (92 CFU/m³), 900×750px. |

---

## Images Still Needed

Add these files to this folder and update `index.html` `src` attributes accordingly:

| File to add | Where used in index.html | Description |
|-------------|--------------------------|-------------|
| `hero-bg.jpg` | `hero__bg-image` section | Full-bleed background — muted lifestyle image or video poster frame. Min 1920×1080px. |
| `hero-lifestyle.jpg` | `hero__visual` pane | Right-side hero image. 4:5 aspect. Premium home interior. 900×1100px. |
| `product-idu50k.jpg` | Purchase module left panel | Product photo of the black IDU 50K unit. Clean background. 1200×800px. |
| `lab-before.jpg` | The Science section — left lab image | Petri dish — pre-treatment, dense colony growth. 900×750px. |
| `lab-after.jpg` | The Science section — right lab image | Petri dish — post-treatment, near-clear. 900×750px. Same size as before. |

---

## How to swap in real images

For each image, find the `<!-- SWAP: -->` comment in `index.html` and replace the placeholder SVG/div with:

```html
<img src="assets/filename.jpg" alt="[descriptive alt text]" loading="lazy" decoding="async" />
```

For the hero background specifically:
```html
<!-- Option A: image -->
<img src="assets/hero-bg.jpg" alt="" aria-hidden="true" />

<!-- Option B: muted video -->
<video autoplay muted loop playsinline poster="assets/hero-bg.jpg">
  <source src="assets/hero-bg.mp4" type="video/mp4" />
</video>
```

---

## Logo format recommendations

- Provide logo in: SVG (primary), PNG @2x (fallback), and white/dark variants
- Favicon: SVG + `.ico` bundle (16×16, 32×32, 48×48)
- Apple touch icon: 180×180px PNG at `/apple-touch-icon.png`
