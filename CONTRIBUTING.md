# Contributing to FlowReader

Thank you for your interest in contributing! Here's a quick guide to get started.

---

## 🚀 Quick Start

```bash
# 1. Fork and clone
git clone https://github.com/ChenChenyaqi/flow-reader.git
cd flow-reader

# 2. Install dependencies (pnpm required)
pnpm install

# 3. Start dev server
pnpm dev

# 4. Load extension in Chrome
# Open chrome://extensions/ → Enable "Developer mode" → "Load unpacked" → Select dist/
```

---

## 📋 Development Workflow

**⚠️ Before starting new features**, please [open an issue](https://github.com/ChenChenyaqi/flow-reader/issues) or [discussion](https://github.com/ChenChenyaqi/flow-reader/discussions) first to discuss. This helps avoid duplicate work and ensures the feature aligns with the project vision.

**Bug fixes** don't need prior discussion - feel free to submit directly!

1. **Create a branch**: `git checkout -b feat/your-feature` or `fix/your-bug`
2. **Make changes** following [Coding Standards](#coding-standards)
3. **Run quality checks**: `pnpm type-check && pnpm lint && pnpm test`
4. **Commit**: Pre-commit hooks will auto-format and validate
5. **Push & create PR**

---

## 📝 Coding Standards

### Vue 3 + TypeScript

Use `<script setup lang="ts">` for all components. Follow this structure:

```vue
<script setup lang="ts">
// 1. Imports
import { ref, computed } from 'vue'

// 2. Props & Emits
interface Props {
  modelValue: string
}
const props = defineProps<Props>()

// 3. Composables
const { data } = useComposable()

// 4. State & Computed
const count = ref(0)
const doubled = computed(() => count.value * 2)

// 5. Methods
const increment = () => {
  count.value++
}
</script>
```

### Naming Conventions

| Type              | Convention        | Example           |
| ----------------- | ----------------- | ----------------- |
| Components        | PascalCase        | `LensCard.vue`    |
| Composables/Hooks | camelCase + `use` | `useSelection.ts` |
| Functions         | camelCase         | `handleClick()`   |
| Types             | PascalCase        | `UserConfig`      |

### Important Notes

- **Use Tailwind CSS** for styling
- **Shadow DOM**: Import CSS with `?inline` → `import styles from '@/assets/tailwind.css?inline'`
- **Use `@/` alias** for imports from `src/`

---

## 🧪 Testing

- **Unit tests** required for composables and utilities
- **Component tests** recommended but optional

```bash
pnpm test              # Run tests
pnpm test --watch      # Watch mode
pnpm test --coverage   # With coverage
```

---

## ✍️ Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/).

See allowed types in `commitlint.config.js`.

```bash
# Format: <type>(<scope>): <subject>
feat(icon): add hover animation
fix: resolve memory leak in vocabulary state
docs(readme): update installation guide
```

**Note**: Pre-commit hooks will validate your format automatically.

---

## 🔧 Useful Commands

| Command           | Description               |
| ----------------- | ------------------------- |
| `pnpm dev`        | Start dev server with HMR |
| `pnpm build`      | Build for production      |
| `pnpm type-check` | TypeScript type checking  |
| `pnpm lint`       | ESLint with auto-fix      |
| `pnpm format`     | Prettier formatting       |
| `pnpm test`       | Run tests                 |

---

## 📌 Pull Request Checklist

Before submitting, ensure:

- [ ] All quality checks pass (`type-check`, `lint`, `test`)
- [ ] Code follows the standards above
- [ ] Tests added/updated if needed
- [ ] PR title uses same format as commit messages

---

## 💡 Tips

- **Reload extension**: Go to `chrome://extensions/` and click "Reload"
- **Debug**: Use Chrome DevTools Console + Vue DevTools
- **Pre-commit hooks**: Auto-run `lint-staged` on staged files
- **Pre-push hook**: Auto-runs `pnpm test` before pushing

---

## 📚 Documentation

- [Design Doc](./docs/design.md)
- [Technical Doc](./docs/MVP-TECHNICAL-DOC.md)
- [Privacy Policy](./docs/PRIVACY-POLICY.md)

---

## ❓ Getting Help

- **Issues**: [GitHub Issues](https://github.com/ChenChenyaqi/flow-reader/issues)
- **Discussions**: [GitHub Discussions](https://github.com/ChenChenyaqi/flow-reader/discussions)

---

**Thanks for contributing! 🎉**
