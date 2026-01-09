---
layout: home

hero:
  name: FlowReader
  text: Turn passive reading into active language learning with AI
  tagline: Instant text analysis, smart simplification, and grammar visualization for English learners
  image:
    src: /icon-128.png
    alt: FlowReader Logo
  actions:
    - theme: brand
      text: Get Started
      link: /guide/quick-start
    - theme: alt
      text: View Features
      link: /features/
    - theme: alt
      text: GitHub
      link: https://github.com/ChenChenyaqi/flow-reader

features:
  - icon: ⚡
    title: Instant Analysis
    details: Select text on any webpage to trigger instant AI-powered analysis with streaming responses.
  - icon: 📉
    title: Smart Simplification
    details: Rewrites complex sentences into simple English (A1-A2 level) using a typewriter effect.
  - icon: 🔍
    title: Grammar Visualization
    details: Automatically highlights Subject, Predicate, and Object to help you understand sentence structures.
  - icon: 📚
    title: Adaptive Vocabulary
    details: Filters words based on your CEFR level (500~8000 words), provides definitions and translations, and remembers words you mark as "Known".
  - icon: 🤖
    title: Multi-Model Support
    details: Supports Zhipu AI (GLM-4), OpenAI, and custom API endpoints with BYOK (Bring Your Own Key).
  - icon: 🔒
    title: Privacy First
    details: Your API Keys and reading data are stored locally in your browser and never sent to our servers.
---

## What is FlowReader?

**FlowReader** is an open-source browser extension designed for developers and English learners (A1-B2). It uses AI to instantly analyze selected text on any webpage, breaking down complex sentences, visualizing grammar structures, and explaining vocabulary based on your proficiency level.

## How It Works

<div class="grid">

### 1. Select Text

Highlight any sentence or paragraph on a webpage

### 2. Click the Icon

A FlowReader icon appears near your selection

### 3. Learn & Understand

- View simplified text streaming in
- Check colored grammar highlights
- Learn vocabulary with translations

</div>

## Privacy Commitment

FlowReader is a **pure frontend application**. Your data stays on your device:

- ✅ API Keys stored locally in `chrome.storage.local`
- ✅ Reading history never leaves your browser
- ✅ No server-side data collection
- ✅ No analytics or tracking

---

<div align="center">

[Get Started](/guide/quick-start) · [View Features](/features/) · [Configuration Guide](/configuration/)

[GitHub Repository](https://github.com/ChenChenyaqi/flow-reader) · [Privacy Policy](/PRIVACY-POLICY)

</div>

<style>
.grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(250px, 1fr));
  gap: 2rem;
  margin: 2rem 0;
  padding: 2rem 0;
  border-top: 1px solid var(--vp-c-divider);
  border-bottom: 1px solid var(--vp-c-divider);
}

.grid div {
  text-align: center;
}

.grid div strong {
  display: block;
  font-size: 1.2em;
  margin-bottom: 0.5rem;
  color: var(--vp-c-brand-1);
}
</style>
