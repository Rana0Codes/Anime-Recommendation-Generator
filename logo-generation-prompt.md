# Anime Recommendation Generator (ARG) — Brand Identity & Logo Generation Guide

**Project Name:** Anime Recommendation Generator  
**Short Name / Abbreviation:** ARG  
**Author / Creator:** Juyel Rana ([@Rana0Codes](https://github.com/Rana0Codes))  
**Document Version:** 2.0.0  
**Target:** Visual Identity, Vector Iconography & Master Brand Mark  

---

## 1. Brand Concept & Strategic Positioning

### 1.1 Brand Purpose
**Anime Recommendation Generator (ARG)** is an editorial presentation engine and curation platform for anime tastemakers, reviewers, and enthusiasts. Powered by the AniList catalog, it transforms anime discovery into publication-grade, shareable visual recommendation graphics (16:9 Landscape, 1:1 Square, 9:16 Story/Reel) and weekly multi-slot showcases for social platforms (Twitter/X, Discord, Instagram, Reddit).

### 1.2 Personality & Tone
- **Editorial & Cinematic:** Clean, authoritative, modern, and polished—akin to premier animation studios and respected pop-culture media publications (e.g., Crunchyroll, IGN Editorial, Studio MAPPA aesthetic).
- **Anti-Slop & Professional:** Avoids cliché "chibi" clip art, generic comic bursts, chaotic retro-vaporwave noise, or tacky cartoon mascots.
- **Iconic Geometry:** A timeless, instantly recognizable geometric emblem with a sharp silhouette that scales gracefully from a 16×16 favicon to an ultra-HD social card watermark.

### 1.3 Color System & Visual Harmony
The brand emblem harmonizes directly with the application's dark theme palette:
- **Primary Indigo:** `#6366f1` (Electric Indigo / Kyoto Twilight)
- **Secondary Magenta:** `#ec4899` (Sakura Pulse / Tokyo Neon)
- **Accent Cyan:** `#06b6d4` / `#00f2fe` (Cyber Shōnen Cyan)
- **Deep Slate / Obsidian (Dark Canvas):** `#070914` / `#0f1422`
- **Pure White / Platinum (Highlight):** `#ffffff` / `#f8fafc`

---

## 2. Master Ready-to-Use Image Generation Prompts

### Option A: The "Origami Prism Star" (Recommended — Primary Brand Emblem)
A modern fusion of a minimalist 4-pointed origami star (representing curation and top ratings) crossed with an aperture prism (representing media, broadcasting, and film reels).

```text
A modern minimalist vector logo emblem for "Anime Recommendation Generator" (ARG), an editorial anime curation and media presentation platform. The logo features a stylized geometric 4-pointed origami star merged with a sleek camera aperture and glowing prism facet. Clean geometric lines, sharp faceted vertices, iconic silhouette. Dual-tone gradient blending electric indigo (#6366f1), vivid sakura magenta (#ec4899), and cyber cyan (#06b6d4) with subtle luminescent edge highlights. Flat vector aesthetic, smooth curves, high contrast against an isolated solid pure black background or transparent background. Vector graphics, SVG app icon style, award-winning logo design, pristine proportions, golden ratio geometry. NO text, NO letters, NO words, NO mockup, NO 3D photorealistic shadows, NO device frames, NO watermarks, NO copyrighted anime characters, NO complex comic panels.
```

---

### Option B: The "Cinematic Torii Aperture" (Cultural Heritage & Modern Media)
A sophisticated minimalist fusion of traditional Japanese Torii architecture stylized into modern cinema/film frame guides.

```text
A sleek contemporary minimalist vector logo symbol representing Anime Recommendation Generator. The symbol creatively abstracts a traditional Japanese Torii gate structure into a modern cinematic widescreen frame or viewfinder motif. Symmetrical, balanced, architectural lines with rounded precision corners. Subtle neon gradient of electric violet (#6366f1) and radiant fuchsia (#ec4899) on obsidian slate. Flat 2D vector logo icon, clean SVG style, high visual contrast, instantly recognizable at 32x32 pixels. Centered, isolated on a solid dark slate background. NO typography, NO lettering, NO realistic hands or faces, NO photographic elements, NO gradients banding, NO realistic reflections, NO device mockups.
```

---

### Option C: Horizontal Typographic Lockup Specification (Emblem + Wordmark)
*Note: Because AI image generators frequently misspell text, use the image model solely to generate the vector emblem above, then pair it programmatically in SVG/CSS with the exact typographic lockup below:*

```text
[ EMBLEM (36x36px) ]  ANIME RECOMMENDATION GENERATOR  [ ARG ]
                       Editorial Presentation Engine
```
- **Typeface:** `Inter` (weights: 900 ExtraBold for title, 600 SemiBold for subtitle)
- **Title Text:** `Anime Recommendation Generator`
- **Badge / Chip:** `ARG` (gradient border, uppercase, 10px bold)
- **Subtitle Text:** `Editorial Presentation Engine` (or `Official Community Watchlist`)
- **Letter Spacing:** `-0.02em` for title, `+0.08em` (uppercase) for subtitle
- **Title Color:** `#ffffff`
- **Subtitle Color:** `#94a3b8`

---

## 3. Negative Constraints (Strict Prompt Negatives)
When invoking image generation tools (Midjourney, DALL-E 3, Imagen 3, Stable Diffusion XL), include these negative keywords:

> `text, words, typography, spelling, letters, font, watermark, copyright, Naruto, Dragon Ball, One Piece, anime face, girl, boy, sketch, messy lines, noisy background, gradient mesh bleed, photorealistic mockup, stationery, business card, desk, paper texture, 3D render, glossy plastic, low resolution, pixelated, jpeg artifacts.`

---

## 4. Logo Asset Delivery & Specification Guidelines

Once an approved design is produced and selected, prepare and export the assets in the following structure:

### 4.1 Asset File Structure
```text
public/
└── brand/
    ├── logo.svg              # Scalable master vector emblem (preferred)
    ├── logo-full.svg         # Horizontal vector lockup (emblem + text)
    ├── logo-512.png          # 512x512 PNG with alpha transparency (PWA icon)
    ├── logo-192.png          # 192x192 PNG with alpha transparency (Mobile shortcut)
    └── favicon.ico           # 32x32 / 16x16 Favicon
```

### 4.2 Asset Dimensional Matrix

| Format | Dimensions | Purpose | Background |
| :--- | :---: | :--- | :--- |
| **`logo.svg`** | Scalable (viewBox `0 0 48 48`) | In-app navbar, export card header/footer watermark | Transparent |
| **`logo-full.svg`** | Scalable (viewBox `0 0 260 48`) | Main navigation banner & documentation header | Transparent |
| **`logo-512.png`** | 512 × 512 px (PNG-24) | High-res avatar, Twitter/X profile icon, Discord bot | Transparent |
| **`logo-192.png`** | 192 × 192 px (PNG-24) | Android / iOS Web App Manifest icon | Transparent |
| **`favicon.ico`** | 32 × 32 px & 16 × 16 px | Browser tab favicon | Transparent |

---

## 5. Implementation in Codebase

The application utilizes a dedicated vector emblem component:
[`src/components/BrandLogo.js`](file:///c:/Users/Juyel%20Rana/Desktop/Fix%20Github/Anime-Recommendation-Generator/src/components/BrandLogo.js)
and centralized brand constants:
[`src/constants/brand.js`](file:///c:/Users/Juyel%20Rana/Desktop/Fix%20Github/Anime-Recommendation-Generator/src/constants/brand.js)

This component renders the geometric origami prism emblem natively in inline SVG, guaranteeing zero pixelation across retina screens and SVG export serialization. When a custom raster/SVG file is placed in `/public/brand/logo.svg`, the component will seamlessly load the final approved asset.
