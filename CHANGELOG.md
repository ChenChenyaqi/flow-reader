# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Planned

### Completed

---

## [1.0.3] - 2026-02-16

### Added

- Full light theme support alongside existing dark theme
- Custom scrollbar styling with theme adaptation (light/dark mode)
- Theme persistence (user preference saved to storage)

### Fixed

- Scroll bar colors in light theme (previously showed dark colors)
- Scroll event isolation (scrolling inside card no longer affects webpage scroll)
- Text selection behavior during AI analysis

### Changed

- Improved theme switching mechanism with better Shadow DOM integration

---

## [1.0.2] - 2026-01-11

### Added

- VitePress documentation site with bilingual support (English/Chinese)
- Documentation pages: Guide, Features, Configuration sections
- Privacy policy page
- GitHub Issue templates
- LICENSE file
- CONTRIBUTING guide

### Fixed

- Corrected base path to `/flow-reader/` for GitHub Pages deployment
- Fixed VitePress deployment configuration
- Removed privacy policy link from CI to fix deployment errors
- Renamed `PRIVACY-POLICY.md` to `privacy-policy.md` for consistent casing
- Fixed type-check errors by removing pre-push hook
- Fixed CI test run errors
- Removed unused documentation files

---

## [1.0.1] - 2026-01-07

### Added

- Initial release of FlowReader MVP
- **Core Features**
  - Text selection and analysis on any webpage
  - AI-powered sentence simplification with streaming output
  - Grammar visualization (Subject-Predicate-Object highlighting)
  - CEFR-based vocabulary filtering (500-8000 words)
  - Chinese translation for vocabulary definitions
- **Multi-LLM Support**
  - Zhipu AI (GLM-4.7)
  - OpenAI
  - Custom API endpoints
- **Configuration**
  - API key management
  - Model selection
  - Vocabulary level settings
- **UI/UX**
  - Floating icon on text selection
  - Draggable analysis card
  - Shadow DOM for style isolation
- **Internationalization**
  - Chinese and English UI support

---

[1.0.3]: https://github.com/ChenChenyaqi/flow-reader/releases/tag/v1.0.3
[1.0.2]: https://github.com/ChenChenyaqi/flow-reader/releases/tag/v1.0.2
[1.0.1]: https://github.com/ChenChenyaqi/flow-reader/releases/tag/v1.0.1
