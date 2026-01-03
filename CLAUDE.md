# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

FluentRead is a Chrome extension that turns passive reading into active fluency for English learning. It's built with Vue 3, TypeScript, and Vite, using CRXJS for Chrome extension development.

## Common Commands

```bash
# Development
pnpm dev          # Start dev server (HMR on port 5174)
pnpm build        # Build for production (outputs to dist/)
pnpm preview      # Preview production build

# Quality Assurance
pnpm type-check   # Run TypeScript type checking (vue-tsc)
pnpm lint         # Run ESLint with auto-fix
pnpm format       # Format code with Prettier
```

**Important**: Always use `pnpm` as the package manager, not `npm` or `yarn`.

## Architecture

### Extension Structure

The extension has three main components:

1. **Background Service Worker** (`src/background/index.ts`)
   - Handles extension lifecycle events
   - Acts as communication hub between components
   - Uses Chrome Extension Manifest V3

2. **Content Script** (`src/content/index.ts` + `ContentApp.vue`)
   - Injected into all web pages (`<all_urls>`)
   - Runs at `document_end`
   - **Critical**: Uses Shadow DOM for CSS isolation

3. **Options/Dashboard Pages** (`src/options/`, `src/dashboard/`)
   - Extension popup (OptionsApp.vue)
   - Full-page dashboard (DashboardApp.vue)
   - Settings and analytics interfaces

### Shadow DOM Pattern (Important)

The content script creates an isolated Shadow DOM to prevent CSS conflicts with host pages:

```typescript
// From src/content/index.ts
const host = document.createElement("div");
host.id = "fluent-read-host";
document.body.appendChild(host);

const shadow = host.attachShadow({ mode: "open" });

// Inline Tailwind CSS into Shadow DOM
import tailwindContent from "../assets/tailwind.css?inline";
const style = document.createElement("style");
style.textContent = tailwindContent;
shadow.appendChild(style);

// Mount Vue app inside Shadow DOM
const appContainer = document.createElement("div");
appContainer.id = "app";
shadow.appendChild(appContainer);

const app = createApp(ContentApp);
app.mount(appContainer);
```

**Key Points**:
- All Tailwind styles must be inlined into Shadow DOM using `?inline` import
- Regular `<style src="...">` in Vue components doesn't work in Shadow DOM context
- Use `import css from "...?inline"` pattern for any CSS needed in content scripts

### TypeScript Configuration

TypeScript is configured with strict settings and Chrome extension types:

- `chrome-types` package provides Chrome Extension API types
- Path aliases: `@/*` → `src/*`
- `jsxImportSource: "vue"` for Vue 3 JSX
- Vue components are recognized via `src/vite-env.d.ts` declaration

**Critical Type Declarations** (in `src/vite-env.d.ts`):
```typescript
declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

declare module "*.css?inline" {
  const content: string;
  export default content;
}
```

### Build System

- **Vite** with **CRXJS** plugin handles Chrome extension build
- **Tailwind CSS v4** with Vite plugin integration
- **Vue 3** with Composition API and `<script setup>`
- Build outputs to `dist/` directory
- Manifest V3 format (see `src/manifest.json`)

### Styling Strategy

- **Tailwind CSS** for all styling
- **Dark mode**: Uses `class` strategy (`darkMode: "class"`)
- **Content Script**: Must inline CSS into Shadow DOM
- **Options/Dashboard**: Standard scoped CSS in Vue components

## Code Quality Standards

### ESLint Rules

The project enforces specific coding standards:

- **Vue Components**: PascalCase for component names and definitions
- **Event Naming**: camelCase for custom events
- **Macro Order**: `defineOptions` → `defineProps` → `defineEmits` → `defineSlots`
- **TypeScript**: No unused vars, explicit `any` is warned, no inferrable types
- **Console/Debugger**: Error in production, warning in development

### Import Patterns

- Use `@/` path alias for src imports (e.g., `@/assets/tailwind.css`)
- CSS imports in content scripts: use `?inline` query param
- Vue components: No `.vue` extension needed in imports (handled by TypeScript)

## Development Workflow

1. **Initial Setup**: Run `pnpm install` to install dependencies
2. **Development**: Run `pnpm dev` - builds with HMR on port 5174
3. **Load Extension**: Load `dist/` folder as unpacked extension in Chrome
4. **Type Checking**: Run `pnpm type-check` before committing
5. **Building**: Run `pnpm build` to create production build
6. **Linting**: Run `pnpm lint` to fix code style issues

## Testing Chrome Extensions

To test changes:
1. Run `pnpm dev` (watch mode) or `pnpm build` (one-time build)
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode"
4. Click "Load unpacked" and select the `dist/` folder
5. Reload the extension after each build

**Note**: The dev server watches for changes and rebuilds automatically, but you still need to reload the extension in Chrome to see changes.

## File Structure Highlights

```
src/
├── background/index.ts       # Service worker (lifecycle, messaging)
├── content/
│   ├── index.ts              # Content script entry (Shadow DOM setup)
│   └── ContentApp.vue        # Injected Vue component
├── options/
│   ├── index.html            # Options/popup entry
│   └── OptionsApp.vue        # Settings page component
├── dashboard/
│   ├── index.html            # Dashboard entry
│   └── DashboardApp.vue      # Analytics/knowledge base component
├── assets/
│   └── tailwind.css          # Tailwind CSS entry point
├── manifest.json             # Extension manifest (permissions, scripts)
└── vite-env.d.ts             # TypeScript module declarations
```

## Common Pitfalls

1. **Shadow DOM CSS**: Styles won't apply in content scripts unless inlined using `?inline`
2. **Chrome API Types**: Always use `chrome-types` package, not `@types/chrome` (outdated)
3. **Import Extensions**: TypeScript handles `.vue` imports via type declaration
4. **HMR Limitations**: Extension pages require manual reload after code changes
5. **Path Aliases**: Use `@/` not `src/` for imports to match TypeScript config
