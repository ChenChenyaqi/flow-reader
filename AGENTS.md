# AGENTS.md

This file provides guidance for agentic coding assistants working on FluentRead.

## Build & Quality Commands

```bash
# Development
pnpm dev                # Start dev server with HMR (port 5174)
pnpm build              # Build for production to dist/
pnpm preview            # Preview production build

# Quality Assurance
pnpm type-check         # TypeScript type checking (vue-tsc --noEmit)
pnpm lint               # ESLint with auto-fix
pnpm format             # Prettier formatting
pnpm test               # Run all Vitest tests
pnpm test -- --run <test-file>   # Run single test file
pnpm test -- <test-file>         # Watch mode for single test
```

**Important**: Always use `pnpm`, never `npm` or `yarn`.

## Code Style Guidelines

### Package Manager

- Use `pnpm` exclusively
- Install dependencies: `pnpm install`

### Import Conventions

- Use path alias `@/` for all src imports: `import Foo from '@/components/Foo.vue'`
- No `.vue` extension in Vue imports (handled by TypeScript)
- Content script CSS imports: `import css from '@/assets/tailwind.css?inline'`

### Formatting (Prettier)

- No semicolons
- Single quotes for strings
- Print width: 100 characters
- Indentation: 2 spaces (no tabs)
- Trailing commas: es5 style
- Line endings: LF (Unix)
- Vue: single attribute per line

### TypeScript

- Strict mode enabled
- No unused variables or parameters (prefix unused with `_`)
- Explicit `any` is warned, avoid when possible
- No inferrable types
- Chrome Extension APIs: use `chrome-types` package, not `@types/chrome`

### Naming Conventions

- Vue components: PascalCase (`LensCard.vue`, `<LensCard>`)
- Vue props/events: camelCase (`handleClick`, `@update:model`)
- Functions/variables: camelCase
- Constants: UPPER_SNAKE_CASE

### Vue Component Structure

- Use `<script setup lang="ts">`
- Macro order: `defineOptions` → `defineProps` → `defineEmits` → `defineSlots`
- Props/Emits with explicit types: `defineProps<{ foo: string }>()`
- Event definitions: `defineEmits<{ (e: 'update'): void }>()`

### Chrome Extension Specifics

- Content scripts use Shadow DOM for CSS isolation
- In Tailwind CSS into Shadow DOM: `import css from '...?inline'`
- Regular `<style src="...">` doesn't work in Shadow DOM
- No scoped styles in content script components
- Extension pages require manual reload in Chrome after changes

### Error Handling & Debugging

- Production: no console or debugger (ESLint error)
- Development: console/debugger warnings allowed
- Prefer early returns over nested conditions
- Use optional chaining for safe property access

### Testing (Vitest)

- Environment: jsdom
- Setup file: `src/test/setup.ts` (mocks Vue lifecycle hooks)
- Test files: place in `src/**/__tests__/` directories
- Use `vi` from vitest for mocking
- Composables can be tested directly (lifecycle hooks mocked)

### Common Patterns

- Composables: export functions starting with `use` (`useSelection`)
- Refs: use `ref()` for primitives, `reactive()` for objects
- Watchers: `watch()` and `watchEffect()` for reactivity
- Click outside: use `useClickOutside` composable
- Positioning: use `usePosition` composable

### Before Committing

1. Run `pnpm type-check` - fix all type errors
2. Run `pnpm lint` - auto-fix style issues
3. Run `pnpm test` - ensure tests pass
4. Verify extension loads in Chrome (chrome://extensions/)

### Build System Notes

- Vite with CRXJS plugin for Chrome extension build
- Output to `dist/` directory
- Dev server watches and rebuilds automatically
- Manifest V3 format (see `src/manifest.json`)
