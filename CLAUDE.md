# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**FluentRead** is a Chrome extension that turns passive reading into active fluency for English learning. It uses AI to provide instant text simplification, grammar analysis, and vocabulary learning when users select English text on any webpage.

Built with Vue 3, TypeScript, and Vite, using CRXJS for Chrome extension development.

**Core Features**:
- Select any English text on any webpage to get instant AI analysis
- Text simplification (converts complex sentences to simple English)
- Grammar analysis with visual highlighting (subject/predicate/object)
- Vocabulary learning with smart filtering based on user level
- Support for multiple LLM providers (OpenAI, Zhipu AI, custom APIs)
- Internationalization (i18n) with Chinese and English support

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

The extension has two main components:

1. **Background Service Worker** (`src/background/`)
   - Handles extension lifecycle events
   - Manages LLM API requests (avoids CORS issues)
   - Supports streaming and non-streaming modes
   - Request cancellation via AbortController

2. **Content Script** (`src/content/`)
   - Injected into all web pages (`<all_urls>`)
   - Runs at `document_end`
   - **Critical**: Uses Shadow DOM for CSS isolation
   - Contains all UI components (icon, card, configuration)

### Data Flow

```
User selects text
       ↓
LensIcon appears (content script)
       ↓
User clicks icon → LensCard opens
       ↓
useLLM composable sends Chrome runtime message
       ↓
Background Service Worker receives message
       ↓
llmApi.ts makes request to LLM provider
       ↓
Streaming response sent back to content script
       ↓
Results displayed in LensCard (simplified text, grammar, vocabulary)
```

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

// 1. Initialize vocabulary state BEFORE mounting Vue
await vocabularyState.init();

// 2. Initialize i18n (loads user preference or uses browser default)
const i18n = await initializeI18n();

// 3. Mount Vue app inside Shadow DOM (with i18n)
const appContainer = document.createElement("div");
appContainer.id = "app";
shadow.appendChild(appContainer);

const app = createApp(LensOverlay);
app.use(i18n);
app.mount(appContainer);
```

**Key Points**:
- All Tailwind styles must be inlined into Shadow DOM using `?inline` import
- Regular `<style src="...">` in Vue components doesn't work in Shadow DOM context
- Use `import css from "...?inline"` pattern for any CSS needed in content scripts
- **Critical**: `vocabularyState.init()` MUST complete before creating the Vue app
- **Critical**: `initializeI18n()` must be called and the result passed to `app.use()` before mounting

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
- **Content Script**: Must inline CSS into Shadow DOM
- Icons: Lucide Vue Next

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

## File Structure

```
src/
├── background/                    # Background Service Worker
│   ├── index.ts                   # Service Worker entry (message handling)
│   └── services/
│       └── llmApi.ts              # LLM API service (providers, streaming)
│
├── content/                       # Content Script (injected into web pages)
│   ├── index.ts                   # Content script entry (Shadow DOM setup)
│   ├── LensOverlay.vue            # Root component (manages icon + card state)
│   ├── components/
│   │   ├── LensIcon.vue           # Floating icon (appears on text selection)
│   │   ├── LensCard.vue           # Main analysis card (20KB, core UI)
│   │   ├── GrammarHighlight.vue   # Grammar highlighting display
│   │   ├── TranslationSection.vue # Translation section
│   │   ├── VocabularySection.vue  # Vocabulary list section
│   │   ├── VocabularyLevelSelector.vue  # Vocabulary level selector
│   │   └── LanguageSwitcher.vue   # Language switcher (i18n)
│   └── composables/
│       ├── useLLM.ts              # LLM interaction logic (18KB)
│       ├── useSelection.ts        # Text selection handling
│       ├── usePosition.ts         # Position calculation utilities
│       ├── useClickOutside.ts     # Click-outside detection
│       └── useControlConfigCard.ts # Config card state management
│
├── shared/                        # Shared code
│   ├── i18n/                      # Internationalization
│   │   ├── index.ts               # i18n instance and initialization
│   │   ├── types.ts               # i18n types (SupportedLocale, LOCALE_OPTIONS)
│   │   └── locales/
│   │       ├── zh-CN.ts           # Chinese translations
│   │       └── en.ts              # English translations
│   ├── services/
│   │   ├── storage.ts             # Chrome Storage wrapper (LLM config)
│   │   ├── vocabularyState.ts     # Global vocabulary state management
│   │   ├── vocabularyStorage.ts   # Chrome Storage wrapper (vocabulary)
│   │   └── languageStorage.ts     # Language preference storage
│   └── types/
│       ├── llm.ts                 # LLM-related types (Provider, Config, Messages)
│       └── vocabulary.ts          # Vocabulary types (Level, Status, UserData)
│
├── dashboard/                     # Dashboard page (placeholder, future use)
│   ├── DashboardApp.vue
│   └── main.ts
│
├── assets/
│   └── tailwind.css               # Tailwind CSS entry point
│
├── manifest.json                  # Extension manifest (permissions, scripts)
└── vite-env.d.ts                  # TypeScript module declarations
```

## Key Components

### Background Service Worker

**`src/background/index.ts`**: Main entry point
- Handles `onInstalled` event
- Unified LLM request handler (stream + non-stream)
- Grammar analysis request handler
- Request cancellation via `CANCEL_LLM_REQUEST` message
- Maintains `activeRequests` Map with AbortControllers

**`src/background/services/llmApi.ts`**: LLM API Service
- `LLMApiService` class
- Supports three providers: `ZHIPU`, `OPENAI`, `CUSTOM`
- Methods: `streamRequest()`, `nonStreamRequest()`, `grammarAnalysisRequest()`
- Uses OpenAI SDK for API calls

### Content Script Components

**`src/content/LensOverlay.vue`**: Root component
- Manages global state (show icon, show card, configuration)
- Handles text selection events
- Controls `LensIcon` and `LensCard` visibility
- Loads/saves LLM and vocabulary configuration

**`src/content/components/LensCard.vue`**: Main analysis card
- Displays simplified text (streaming)
- Grammar highlighting with color-coded tags
- Vocabulary list with "Know/Don't Know" buttons
- Translation section
- Configuration UI with tabs (LLM Config / Vocabulary)
- Language switcher in Vocabulary tab
- Draggable and collapsible

**`src/content/components/LanguageSwitcher.vue`**: Language switcher
- Dropdown for language selection (Chinese/English)
- Dynamically updates UI without page reload
- Persists preference to chrome.storage.local

### Composables

**`src/content/composables/useLLM.ts`**: Core LLM logic
- Chrome runtime message passing
- Dynamic prompt building (simple vs full based on vocabulary)
- Streaming response processing
- Grammar analysis result parsing
- Word extraction and filtering

**`src/content/composables/useSelection.ts`**: Text selection
- Monitors `mouseup` and `keyup` events
- Calculates icon position (avoids viewport overflow)
- Returns selected text

**`src/content/composables/usePosition.ts`**: Position utilities
- Viewport boundary detection
- Smart positioning for icon and card

**`src/content/composables/useClickOutside.ts`**: Click detection
- Detects clicks outside a component
- Used for closing card/config

### Shared Services

**`src/shared/services/vocabularyState.ts`**: Global vocabulary state
- **Must be initialized before Vue app mounting**
- Manages known/unknown/ignored word sets
- Vocabulary level tracking (500-8000 words)
- Batch operations (mark multiple words)
- Persistent storage synchronization

**`src/shared/services/storage.ts`**: LLM config storage
- Wrapper around `chrome.storage.local`
- Keys: `fluent-read-llm-config`
- Type-safe get/set methods

**`src/shared/services/vocabularyStorage.ts`**: Vocabulary storage
- Wrapper around `chrome.storage.local`
- Key: `fluent-read-vocabulary`
- Handles `UserVocabularyConfig` structure

**`src/shared/services/languageStorage.ts`**: Language preference storage
- Wrapper around `chrome.storage.local`
- Key: `fluent-read-language`
- Stores user's selected language (zh-CN or en)

### i18n (Internationalization)

**`src/shared/i18n/index.ts`**: i18n setup
- `initializeI18n()`: Loads saved language or uses browser default
- `changeLocale(locale)`: Dynamically changes language without reload
- `getCurrentLocale()`: Returns current locale

**Supported Languages**:
- `zh-CN`: Simplified Chinese (default for Chinese browsers)
- `en`: English (default for other browsers)

**Usage in Components**:
```vue
<script setup lang="ts">
import { useI18n } from 'vue-i18n'

const { t, locale } = useI18n()

// Get translation
const label = computed(() => t('config.save'))

// Get current locale
const currentLang = computed(() => locale.value)
</script>

<template>
  <!-- Use $t in template -->
  <button>{{ $t('common.save') }}</button>
  <span>{{ $t('card.analyzing') }}</span>
</template>
```

**Translation Structure** (`src/shared/i18n/locales/`):
```
common:
  save, cancel, close, loading, error, success, confirm

config:
  title, llmConfig, vocabulary, language, provider, apiKey, model, apiUrl, vocabularyLevel, saveConfig, configSaved

vocabularyLevel:
  LEVEL_500, LEVEL_1000, LEVEL_2000, LEVEL_3000, LEVEL_5000, LEVEL_8000

provider:
  zhipu, openai, custom

card:
  simplified, grammar, vocabulary, translation, know, dontKnow, noVocabulary, analyzing, error, subject, predicate, object

error:
  noApiKey, invalidConfig, networkError, rateLimit, unknownError

grammar:
  subject, predicate, object
```

**Adding New Translations**:
1. Add the translation key to both `src/shared/i18n/locales/zh-CN.ts` and `src/shared/i18n/locales/en.ts`
2. Use in template with `{{ $t('path.to.key') }}` or in script with `t('path.to.key')`
3. For dynamic values, use interpolation: `{{ $t('message', { name: 'FluentRead' }) }}`

## Type Definitions

### i18n Types (`src/shared/i18n/types.ts`)

```typescript
type SupportedLocale = 'zh-CN' | 'en'

interface LanguageConfig {
  locale: SupportedLocale
  lastUpdated: number
}

const LOCALE_OPTIONS = [
  { value: 'zh-CN', label: '简体中文', nativeName: '简体中文' },
  { value: 'en', label: 'English', nativeName: 'English' }
]
```

### LLM Types (`src/shared/types/llm.ts`)

```typescript
enum LLMProvider {
  ZHIPU = 'zhipu',
  OPENAI = 'openai',
  CUSTOM = 'custom'
}

interface LLMConfig {
  provider: LLMProvider
  apiKey: string
  model: string
  apiUrl?: string  // Only for CUSTOM provider
}

interface LLMMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

// Chrome runtime message types
type LLMRequestMessage = { type: 'LLM_REQUEST', requestId: string, stream: boolean, ... }
type GrammarAnalysisRequestMessage = { type: 'GRAMMAR_ANALYSIS_REQUEST', ... }
type CancelLLMRequestMessage = { type: 'CANCEL_LLM_REQUEST', requestId: string }
```

### Vocabulary Types (`src/shared/types/vocabulary.ts`)

```typescript
enum VocabularyLevel {
  LEVEL_500 = 'LEVEL_500',      // A1 - Beginner
  LEVEL_1000 = 'LEVEL_1000',    // A2 - Elementary
  LEVEL_2000 = 'LEVEL_2000',    // B1 - Intermediate (default)
  LEVEL_3000 = 'LEVEL_3000',    // B2 - Upper Intermediate
  LEVEL_5000 = 'LEVEL_5000',    // C1 - Advanced
  LEVEL_8000 = 'LEVEL_8000'     // C2 - Proficient
}

enum WordMasteryStatus {
  KNOWN = 'KNOWN',              // User knows this word
  UNKNOWN = 'UNKNOWN',          // User doesn't know this word
  IGNORED = 'IGNORED'           // User wants to ignore this word
}

interface UserVocabularyConfig {
  level: VocabularyLevel
  knownWords: string[]
  unknownWords: string[]
  ignoredWords: string[]
  lastUpdated: number
}
```

## Common Pitfalls

1. **Shadow DOM CSS**: Styles won't apply in content scripts unless inlined using `?inline`
2. **Chrome API Types**: Always use `chrome-types` package, not `@types/chrome` (outdated)
3. **Import Extensions**: TypeScript handles `.vue` imports via type declaration
4. **HMR Limitations**: Extension pages require manual reload after code changes
5. **Path Aliases**: Use `@/` not `src/` for imports to match TypeScript config
6. **Vocabulary State Initialization**: `vocabularyState.init()` MUST complete before mounting Vue app
7. **Background Service for LLM**: Always make LLM requests from background service worker to avoid CORS
8. **i18n in Script Section**: Use `useI18n()` composable to access `t()` function in `<script setup>`, not `$t()`
9. **i18n Initialization**: `initializeI18n()` must be called and the result passed to `app.use()` before mounting Vue app

## Documentation

- **MVP Technical Doc**: `docs/MVP-TECHNICAL-DOC.md` - Complete technical documentation
- **Publishing Guide**: `docs/PUBLISH-GUIDE.md` - Chrome Web Store release instructions
- **Release Checklist**: `docs/RELEASE-CHECKLIST.md` - Pre-release verification
- **Privacy Policy**: `docs/PRIVACY-POLICY.md` - Privacy documentation
