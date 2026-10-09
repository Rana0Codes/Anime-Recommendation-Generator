# 🎌 Anime Recommendation Studio (v2.0)

> **Create, customize, and export stunning 1920x1080 Full HD & social shareable anime recommendation posters powered by the AniList GraphQL API.**

[![React](https://img.shields.io/badge/React-18.2-61DAFB?logo=react&logoColor=black)](https://reactjs.org/)
[![Material--UI](https://img.shields.io/badge/MUI-v5-007FFF?logo=mui&logoColor=white)](https://mui.com/)
[![AniList API](https://img.shields.io/badge/AniList-GraphQL_API-02A9FF?logo=anilist&logoColor=white)](https://anilist.co/)
[![html2canvas](https://img.shields.io/badge/Export-html2canvas-orange)](https://html2canvas.hertzen.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

## ✨ Features

### 🔍 1. AniList GraphQL API Search & Random Discovery
- Instant search across thousands of anime titles with real-time autocompletion.
- **Random Roulette**: Discover unexpected gems categorized by genre with a single click.
- Rich metadata: English/Romaji titles, high-resolution cover & banner art, studio credits, episode count, broadcast status, genres, and community scores.

### 🎨 2. 1920x1080 High-Res Shareable Template Generator
- Generates beautiful, publication-ready cards with **1-click high-resolution PNG export** (`html2canvas`).
- **Multiple Aspect Ratios**:
  - `16:9 Banner` (1920x1080) — Ideal for Twitter/X headers, Discord, and Reddit.
  - `9:16 Story / Reel` (1080x1920) — Ideal for Instagram Stories, TikTok, and YouTube Shorts.
  - `1:1 Square` (1080x1080) — Ideal for Instagram feeds and community cards.
- **4 Custom Visual Themes**:
  - 🌌 **Cyberpunk Neon**: Deep night backdrop with cyan and magenta neon glow.
  - 🖤 **Dark Onyx**: Modern dark minimalist aesthetic with teal accents.
  - 🌸 **Sakura Night**: Dark floral violet with cherry blossom highlights.
  - 🌅 **Sunset Synthwave**: Warm violet-orange gradient with retro synthwave energy.
- **Personal Touch**: Add your custom reviewer notes, community rating stars, and custom curator handle (`@YourName`).
- **Direct Clipboard Copy**: Copy generated graphics straight to your clipboard.

### 📅 3. Weekly Top 3 Recommendation Showcase
- Curate a cohesive weekly watchlist across 3 categorized slots:
  - 👑 `#1 MUST WATCH`
  - 🔥 `#2 BINGE WORTHY`
  - ✨ `#3 HIDDEN GEM`
- Assemble 3 anime into a unified **1920x1080 Weekly Showcase Poster** with custom headline and curator branding.

### ✍️ 4. Custom & Manual Entry Mode
- Recommend unlisted shows, upcoming releases, custom indie projects, or manga.
- **Local File Upload**: Drag and drop any image from your computer with automatic base64 processing (guarantees 100% CORS-free high-res canvas exports).
- Custom title, synopsis, studio, episode count, release year, and genre tags.

---

## 🛠️ Tech Stack

- **Frontend Framework:** React 18
- **UI & Design System:** Material-UI (MUI v5) + Emotion + Tailwind CSS
- **API Integration:** AniList GraphQL API
- **Export Engine:** `html2canvas` (with multi-ratio scale rendering & clipboard API)
- **Icons:** `@mui/icons-material` & `react-icons`

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v16.0.0 or higher)
- npm (v8.0.0 or higher)

### Installation

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
   Open [http://localhost:3000](http://localhost:3000) to view the app in your browser.

4. **Build for production:**
   ```bash
   npm run build
   ```

---

## 📁 Project Structure

```
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

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check out the [issues page](https://github.com/Rana0Codes/Anime-Recommendation-Generator/issues).

---

## 👤 Author

- **Juyel Rana**
- GitHub: [@Rana0Codes](https://github.com/Rana0Codes)
- LinkedIn: [Juyel Rana](https://www.linkedin.com/in/juyel-rana/)

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
