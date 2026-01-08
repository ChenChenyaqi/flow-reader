<div align="center">
  <img src="public/icon-128.png" alt="FlowReader Logo" width="100" height="100">

  <h1>FlowReader</h1>

  <p>
    <strong>Turn passive reading into active language learning with AI.</strong>
  </p>

  <p>
    <a href="README_ZH.md">🌐 中文文档</a> |
    <a href="#installation">⬇️ Installation</a> |
    <a href="#usage">🚀 Usage</a>
  </p>

  <p>
    <img src="https://img.shields.io/badge/License-AGPL%20v3-blue.svg" alt="License">
    <img src="https://img.shields.io/badge/Chrome-Extension-googlechrome.svg" alt="Chrome Extension">
    <img src="https://img.shields.io/badge/Vue.js-3.0-green.svg" alt="Vue">
    <img src="https://img.shields.io/badge/Powered%20by-LLM-orange.svg" alt="AI Powered">
  </p>
</div>

---

## 📖 Introduction

**FlowReader** is an open-source browser extension designed for developers and English learners (A1-B2). It uses AI to instantly analyze selected text on any webpage, breaking down complex sentences, visualizing grammar structures, and explaining vocabulary based on your proficiency level.

**Privacy First:** FlowReader is a pure frontend application. Your API Keys and reading data are stored locally in your browser and are never sent to our servers.

## ✨ Key Features

- **⚡️ Instant Analysis**: Select text on any webpage to trigger the AI assistant.
- **📉 Smart Simplification**: Rewrites complex sentences into simple English (A1-A2 level) using a typewriter effect.
- **🔍 Grammar Visualization**: Automatically highlights **Subject**, **Predicate**, and **Object** to help you understand sentence structures.
- **📚 Adaptive Vocabulary**:
  - Filters words based on your CEFR level (500~8000 words).
  - Provides simple English definitions and Chinese translations.
  - Remembers words you mark as "Known".
- **🤖 Multi-Model Support**: Supports **Zhipu AI** (GLM-4), **OpenAI**, and custom API endpoints.

## 🚀 Getting Started

### Installation

#### Option 1: Install from Web Store (Recommended)

> _Coming soon to Chrome Web Store ._

- [Microsoft Edge Add-ons](https://microsoftedge.microsoft.com/addons/detail/fluentread/mnlilgfbjkbbimcjhneefdginlfefbal)

#### Option 2: Load Unpacked (For Developers/MVP)

1. Download the latest `flow-reader` zip from [Releases](https://github.com/ChenChenyaqi/flow-reader/releases) or build it yourself (see below).
2. Open Chrome/Edge and navigate to `chrome://extensions/`.
3. Enable **"Developer mode"** in the top right corner.
4. Click **"Load unpacked"**.
5. Select the `flow-reader` folder.

**Remember to refresh your browser after installation**

### ⚙️ Quick Configuration

Before using FlowReader, you need to configure your AI provider (BYOK - Bring Your Own Key).

1. After selecting any text, click the 🔍 (magnifying glass) icon that appears in the lower right corner.
2. Click the **Settings** icon in the upper right corner of the pop-up **FlowReader** card.
3. Go to the **Settings** card.
4. Choose a service provider:
   - **Zhipu AI (GLM-4)**: Recommended for users in China. [Get Free Key For New Users](https://open.bigmodel.en/)
   - **OpenAI**: Standard GPT-5 models.
   - **Custom**: Compatible with any OpenAI-format API (e.g., DeepSeek, Local LLM).
   - **Other**
5. Enter the corresponding **API Key** and **Model Name**.
6. Click the **Save** button.
7. (Optional) Set your current vocabulary level on the **Vocabulary** tab.

### 💡 How to Use

1. **Select Text**: Highlight any sentence or paragraph on a webpage.
2. **Click the Floating Icon**: A FlowReader icon will appear near your selection.
3. **Read & Learn**:
   - View the simplified version streaming in.
   - Check the colored grammar highlights.
   - Click "Known" on vocabulary you've mastered.

## 🛠️ Development

If you want to contribute or build from source:

```bash
# 1. Clone the repo
git clone https://github.com/ChenChenyaqi/flow-reader.git

# 2. Install dependencies
pnpm install

# 3. Start dev server (HMR supported)
pnpm dev

# 4. Build for production
pnpm build
```
