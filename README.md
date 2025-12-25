# FluentLens

Turn Passive Reading into Active Fluency - A Chrome extension for English learning.

## Project Overview

FluentLens is a Chrome extension that helps intermediate English learners improve their reading comprehension through:
- Syntax visualization (Subject-Verb-Object highlighting)
- Contextual simplification (Simple English rewrites)
- Instant vocabulary capture
- Personal knowledge base

## Tech Stack

- **Framework**: Vue 3
- **Build Tool**: Vite
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Extension**: Chrome Manifest V3 (via CRXJS)
- **Storage**: Chrome Storage API

## Project Structure

```
fluent-lens/
├── src/
│   ├── background/         # Service Worker (API Proxy)
│   │   └── main.ts
│   ├── content/            # Content scripts injected into web pages
│   │   ├── main.ts
│   │   └── style.css
│   ├── options/            # Extension options/popup page
│   │   ├── App.vue
│   │   ├── main.ts
│   │   ├── style.css
│   │   └── index.html
│   ├── dashboard/          # Vocabulary dashboard
│   │   ├── App.vue
│   │   ├── main.ts
│   │   ├── style.css
│   │   └── index.html
│   └── lib/                # Utility libraries
│       ├── llm-bridge.ts   # AI API integration
│       ├── prompt.ts       # Prompt templates
│       └── storage.ts      # Storage utilities
├── public/
│   └── manifest.json       # Extension manifest
├── dist/                   # Build output (generated)
├── docs/                   # Design documentation
├── vite.config.ts          # Vite configuration
├── tsconfig.json           # TypeScript configuration
├── tailwind.config.js      # Tailwind CSS configuration
└── package.json            # Dependencies and scripts
```

## Development

### Installation

```bash
# Install dependencies
npm install
```

### Development

```bash
# Start development server with hot reload
npm run dev
```

The extension will be built in the `dist/` directory. Load this as an unpacked extension in Chrome:
1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked"
4. Select the `dist/` directory

### Build

```bash
# Build for production
npm run build
```

### Type Checking

```bash
# Run TypeScript type checker
npm run type-check
```

## Current Status

This is the initial project setup. All core infrastructure is in place:
- ✅ Project structure
- ✅ Build configuration (Vite + CRXJS)
- ✅ TypeScript configuration
- ✅ Tailwind CSS setup
- ✅ Basic entry points (background, content, options, dashboard)
- ✅ Chrome Extension Manifest V3
- ✅ Dev server with hot reload

## Next Steps

See `docs/design.md` for the complete product roadmap and implementation plan.

## License

MIT
