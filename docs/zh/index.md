---
layout: home

hero:
  name: FlowReader
  text: 利用 AI 技术，将被动阅读转化为主动的语言学习体验
  tagline: 即时文本分析、智能简化、语法可视化，专为英语学习者设计
  image:
    src: /icon-128.png
    alt: FlowReader Logo
  actions:
    - theme: brand
      text: 快速开始
      link: /zh/guide/quick-start
    - theme: alt
      text: 功能特性
      link: /zh/features/
    - theme: alt
      text: GitHub
      link: https://github.com/ChenChenyaqi/flow-reader

features:
  - icon: ⚡
    title: 即时分析
    details: 在任意网页上选择文本，立即触发 AI 驱动的分析，支持流式响应。
  - icon: 📉
    title: 智能简化
    details: 使用打字机效果，将复杂句子重写为简单英语（A1-A2 水平）。
  - icon: 🔍
    title: 语法可视化
    details: 自动高亮主语、谓语和宾语，帮助您快速理解句子结构。
  - icon: 📚
    title: 个性化词汇
    details: 根据您的 CEFR 等级（500~8000 词汇）过滤单词，提供定义和翻译，并记住您标记为"已认识"的单词。
  - icon: 🤖
    title: 多模型支持
    details: 支持智谱 AI (GLM-4.7)、OpenAI 和自定义 API 端点，采用 BYOK（自备密钥）模式。
  - icon: 🔒
    title: 隐私优先
    details: 您的 API 密钥和阅读数据仅存储在本地浏览器中，绝不会发送到我们的服务器。
---

## 什么是 FlowReader？

**FlowReader** 是一款开源的浏览器扩展，专为开发者和英语学习者（A1-B2 水平）设计。它利用 AI 技术，即时分析您在任意网页上选择的文本，拆解复杂句子，可视化语法结构，并根据您的熟练度解释词汇。

## 工作原理

<div class="grid">

### 1. 选择文本

在网页上高亮选择任何句子或段落

### 2. 点击图标

FlowReader 图标会出现在您的选区附近

### 3. 学习理解

- 查看简化文本流式输出
- 检查彩色语法高亮
- 学习词汇翻译

</div>

## 隐私承诺

FlowReader 是一个**纯前端应用**。您的数据保留在您的设备上：

- ✅ API 密钥存储在本地 `chrome.storage.local`
- ✅ 阅读历史永不离开浏览器
- ✅ 无服务器端数据收集
- ✅ 无分析或跟踪

---

<div align="center">

[快速开始](/zh/guide/quick-start) · [功能特性](/zh/features/) · [配置指南](/zh/configuration/)

[GitHub 仓库](https://github.com/ChenChenyaqi/flow-reader) · [隐私政策](/zh/privacy-policy)

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
