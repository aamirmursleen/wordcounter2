<div align="center">

# counter.nafran.com

**Word counter & text analysis for writers, students, and creators.**

[![Live](https://img.shields.io/badge/live-counter.nafran.com-blue?style=flat-square)](https://counter.nafran.com)
[![License: MIT](https://img.shields.io/badge/license-MIT-green?style=flat-square)](LICENSE)
[![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-f7df1e?style=flat-square&logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)

<br />

Real-time word counting, readability analysis, keyword density, AI token estimation, and productivity tools. Runs entirely in your browser — your text never leaves your device.

<br />

[Try it live](https://counter.nafran.com) · [Features](#features) · [Self-host](#self-hosting)

</div>

---

## Features

### Text Analysis
- **Word & character count** — real-time updates as you type
- **Sentence & paragraph count** — full structural breakdown
- **Reading & speaking time** — estimated durations
- **AI token estimation** — approximate OpenAI token count for LLM usage

### Readability
- **Flesch-Kincaid** grade level and reading ease
- **Gunning Fog Index** — text complexity score
- **SMOG Index** — years of education needed to understand
- **Automated Readability Index (ARI)** — character-based formula

### SEO & Social
- **Keyword density** — top keywords with frequency analysis
- **Social media limits** — character counts for Twitter, Facebook, Instagram
- **Optimal word count** — recommendations by content type

### Productivity
- **Focus Mode** — distraction-free writing environment
- **Kill Mode** — deletes your content if you stop typing (extreme productivity)
- **Goal setting** — set word/character targets with progress tracking
- **Auto-save** — content persists in localStorage

### Writing Tools
- **Find & Replace** — search and replace across your text
- **Case transformation** — 7 options (lowercase, UPPERCASE, Title Case, etc.)
- **Text cleaning** — remove extra whitespace, normalize formatting
- **File upload/download** — import .txt/.doc files, export as .txt

### Privacy
- **100% client-side** — all processing happens in your browser
- **No server calls** — your text is never transmitted
- **No tracking** — no analytics, no cookies
- **No account** — start using immediately

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Markup | HTML5 |
| Styling | [Tailwind CSS](https://tailwindcss.com) (CDN) |
| Logic | Vanilla JavaScript (ES6+) |
| Icons | [Font Awesome](https://fontawesome.com) 6 |
| Storage | Browser localStorage |
| Hosting | [Vercel](https://vercel.com) |

Zero dependencies. No build step. Just HTML, CSS, and JS.

## Self-Hosting

```bash
git clone https://github.com/aamirmursleen/wordcounter2.git
cd wordcounter2

# Option 1: Open directly
open index.html

# Option 2: Local server
python -m http.server 8000
```

Deploy anywhere that serves static files — Vercel, Netlify, GitHub Pages, Cloudflare Pages, or any web server.

## Project Structure

```
wordcounter2/
├── index.html      # Main page with full SEO meta tags
├── script.js       # All application logic (WordCounter class)
├── _headers        # Security & caching headers
└── _redirects      # URL redirects
```

## License

[MIT](LICENSE)