# 🎌 Anime Recommendation Studio (v2.0)

> **Interactive anime discovery engine and graphic generator powered by the AniList GraphQL API, with custom visual themes and 1-click 1920x1080 Full HD poster export.**

[![React](https://img.shields.io/badge/React-18.2-61DAFB?logo=react&logoColor=black)](https://reactjs.org/)
[![Material--UI](https://img.shields.io/badge/MUI-v5-007FFF?logo=mui&logoColor=white)](https://mui.com/)
[![AniList API](https://img.shields.io/badge/AniList-GraphQL_API-02A9FF?logo=anilist&logoColor=white)](https://anilist.co/)
[![html2canvas](https://img.shields.io/badge/Export-html2canvas-orange)](https://html2canvas.hertzen.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

## 🌟 Overview & Problem Solved

Discovering new anime and sharing recommendations often suffers from information overload, scattered review links, and low-quality screenshots.

**Anime Recommendation Studio (v2.0)** provides a focused discovery and presentation workflow:
1. **Search & Discovery:** Instant lookup against AniList's catalog via GraphQL with autocompletion and random genre roulette.
2. **Visual Presentation:** 4 curated design themes that transform anime metadata into publication-ready recommendation cards.
3. **High-Resolution Export:** Client-side vector-to-canvas rendering generating **1920x1080 Full HD graphics** ready for Twitter/X, Discord, Instagram, and Reddit.
4. **Weekly Curations:** Assemble a multi-title watchlist into a unified 3-slot showcase poster.

---

## ✨ Features & Capabilities

### 🔍 1. AniList GraphQL Discovery Engine
- **Instant Search:** Real-time autocompletion across thousands of anime titles with English, Romaji, and Native Japanese title matching.
- **Random Roulette:** One-click serendipitous discovery filtered by specific genres (Action, Sci-Fi, Psychological, Fantasy, etc.).
- **Rich Metadata:** Displays broadcast status, episode counts, release seasons, studio credits, genres, community ratings, and high-res cover art.

### 🎨 2. 1920x1080 High-Resolution Poster Generator
- **Multi-Ratio Output:**
  - `16:9 Banner` (1920 × 1080 px) — Ideal for Twitter/X banners, Discord embeds, and desktop wallpapers.
  - `9:16 Story / Reel` (1080 × 1920 px) — Tailored for Instagram Stories, TikTok, and YouTube Shorts.
  - `1:1 Square` (1080 × 1080 px) — Standard format for Instagram feeds and social profile posts.
- **4 Custom Visual Themes:**
  - 🌌 **Cyberpunk Neon:** Deep space navy with electric cyan (#00f2fe) and neon magenta glow.
  - 🖤 **Dark Onyx:** Minimalist charcoal backdrop with refined teal accents.
  - 🌸 **Sakura Night:** Floral midnight violet with soft cherry blossom highlights.
  - 🌅 **Sunset Synthwave:** Warm violet-to-orange gradient inspired by 80s retro aesthetics.
- **Curator Customization:** Add personal reviewer ratings (1–10 stars), custom editorial notes, and personal curator handles (`@YourName`).
- **One-Click Export:** Instant PNG file download or direct-to-clipboard image copying.

### 📅 3. Weekly Top 3 Recommendation Showcase
- Curate a cohesive watchlist across 3 distinct slots:
  - 👑 `#1 MUST WATCH` (Lead priority title)
  - 🔥 `#2 BINGE WORTHY` (High-engagement series)
  - ✨ `#3 HIDDEN GEM` (Underrated discovery)
- Assembles all three titles into a single, cohesive **1920 × 1080 Weekly Showcase Graphic**.

### ✍️ 4. Manual Entry & Local Asset Mode
- Add unlisted indie animations, upcoming releases, custom light novels, or manga.
- **Drag-and-Drop Local Image Upload:** Supports local image selection with automatic client-side base64 conversion to bypass external CORS restrictions completely.

---

## 🏗️ Architecture & Network Behavior

### 1. AniList GraphQL API Integration
- **Endpoint:** `https://graphql.anilist.co`
- **Method:** HTTP POST with structured GraphQL query payloads requesting filtered fields (`id`, `title`, `coverImage`, `bannerImage`, `genres`, `averageScore`, `studios`, `episodes`).
- **Rate Limits:** AniList enforces an unauthenticated public rate limit of **90 requests per minute**. The application includes error boundaries and debounce mechanisms on search inputs to stay well within limits.

### 2. Client-Side Export Engine & CORS Resilience
- Graphic export utilizes `html2canvas` configured with explicit high-density scaling (`scale: 2` or fixed 1920x1080 render targets).
- **CORS Mitigation:** External image CDNs (e.g., `s4.anilist.co`) can trigger browser canvas security taint when exported. The application provides two mitigations:
  - Anonymous CORS attribute requests on loaded image elements.
  - Local image upload mode with automatic base64 `data:` URI conversion, guaranteeing 100% reliable canvas serialization in any browser environment.

---

## 🛠️ Tech Stack

```text
Frontend Framework │ React 18.2
UI Components      │ Material-UI (MUI v5), Emotion
Styling            │ Emotion CSS-in-JS, Tailwind CSS utility classes
API Protocol       │ GraphQL (AniList public endpoint)
Export Engine      │ html2canvas (multi-scale canvas rasterizer)
Icons              │ @mui/icons-material, react-icons
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v16.0.0 or higher)
- npm (v8.0.0 or higher)

### Installation & Local Execution

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Rana0Codes/Anime-Recommendation-Generator.git
   cd Anime-Recommendation-Generator
   ```

2. **Install dependencies:**
   ```bash
   npm install --legacy-peer-deps
   ```

3. **Start the development server:**
   ```bash
   npm start
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

4. **Build production bundle:**
   ```bash
   npm run build
   ```

---

## 📁 Project Structure

```text
Anime-Recommendation-Generator/
├── public/
│   └── index.html
├── src/
│   ├── components/
│   │   ├── ApiSearch.js               # AniList search & random discovery
│   │   ├── ManualInput.js             # Custom anime form & local file uploader
│   │   ├── Navbar.js                  # Studio navigation & branding
│   │   ├── RecommendationType.js      # Single vs. Weekly mode switcher
│   │   ├── SearchOptions.js           # API Search vs. Manual entry selector
│   │   ├── TemplateCard.js            # 1080p poster generator with theme engine
│   │   └── WeeklyRecommendations.js   # 3-slot weekly poster assembler
│   ├── services/
│   │   └── aniListApi.js              # AniList GraphQL query service & transforms
│   ├── App.css
│   ├── App.js                         # Root application with dark theme
│   └── index.js
├── package.json
└── README.md
```

---

## ⚠️ Known Limitations & Device Requirements

- **Canvas Rendering Fidelity:** `html2canvas` reconstructs the DOM using Canvas drawing primitives. Certain CSS properties (e.g., complex `backdrop-filter: blur()`) may render slightly differently across Chromium, Firefox, and WebKit engines.
- **Mobile Export Constraints:** Generating 1920x1080 canvas buffers on memory-constrained mobile browsers may experience slight export latency (~1–2 seconds) compared to desktop.
- **AniList Unauthenticated Quota:** Rapid continuous typing without debounce can temporarily trigger AniList HTTP 429 rate limit responses.

---

## 👤 Author & Maintainer

- **Juyel Rana** ([@Rana0Codes](https://github.com/Rana0Codes))
- LinkedIn: [linkedin.com/in/juyel-rana](https://www.linkedin.com/in/juyel-rana/)

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
