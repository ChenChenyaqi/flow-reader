
---

# FlowReader - 产品设计文档 (PRD)

| 项目 | 内容 |
| :--- | :--- |
| **产品名称** | FlowReader (流利透镜) |
| **版本** | v1.0.0 (MVP) |
| **Slogan** | Turn Passive Reading into Active Fluency. (化被动阅读为主动掌握) |
| **目标用户** | 具备英语基础（高中/四六级/B1+），希望通过阅读外刊、博客、论文来进阶英语能力的人群。 |
| **核心价值** | 在不脱离原文语境的情况下，通过**结构拆解**和**降维释义**，扫除阅读障碍，积累地道表达。 |
| **技术栈** | Vue 3, Vite, TypeScript, pnpm, Tailwind CSS, OpenAI API (BYOK), IndexedDB. |

---

## 1. 产品愿景与定位 (Vision)

### 1.1 用户画像 (Persona)
*   **The Global Reader:** 喜欢看 *New York Times*, *Medium*, *Economist* 的职场人。
*   **The Academic:** 需要阅读英文文献的研究生/留学生。
*   **The Developer:** 需要看官方文档的程序员。
*   **痛点:** 遇到长难句（Long Nested Sentences）和熟词生义（Contextual Vocabulary），不想频繁跳出页面查词典，也不想依赖全网页傻瓜式翻译。

### 1.2 设计原则
1.  **Context is King:** 拒绝孤立的单词解释，一切解释基于当前句子的语境。
2.  **English First:** 优先用简单英语解释复杂英语（Paraphrasing），中文作为最后的兜底辅助。
3.  **Frictionless:** 交互极致轻量，用完即走，不打断沉浸式阅读体验。

---

## 2. 核心功能需求 (Core Features)

### 2.1 智能设置 (Smart Settings)
*   **API Key 管理:** 用户输入自己的 OpenAI API Key（或其他兼容接口），数据加密存储在本地。
*   **Persona 设定:** 用户可选择自己的职业/兴趣（如：通用、科技、金融、医学、法律）。
    *   *作用:* 调整 AI 的解释风格（例如在金融模式下，"Liquid" 会优先解释为“流动性”而非“液体”）。
*   **显示偏好:** 是否默认显示中文翻译（建议默认关闭）。

### 2.2 "透镜"分析引擎 (The Lens HUD)
这是产品的核心。用户划词选中一段文本后，悬浮展示分析卡片。

#### A. 句法结构可视化 (Syntax Visualizer)
解决“单词都认识，连起来看不懂”的问题。
*   **成分高亮:**
    *   <span style="color:#3b82f6">**主语**</span> | <span style="color:#ef4444">**谓语**</span> | <span style="color:#10b981">**宾语**</span>
*   **降噪模式 (De-noise):**
    *   将从句、插入语、修饰语变成灰色或折叠。让句子的骨架（Main Clause）一目了然。

#### B. 语境降维释义 (Contextual Simplification)
解决“看懂了字面，不懂内涵”的问题。
*   **Simple English Rewrite:** 用 CEFR A2/B1 级别的简单词汇重写原句。
    *   *原文:* "The company's precarious financial position precipitated a drastic restructuring."
    *   *简化:* "The company had big money problems, so they had to change how they work very quickly."
*   **Idiom Detector (习语侦测):** 自动识别片语或习语（如 "pull it off", "break the ice"）并解释，防止用户按字面意思误解。

#### C. 沉浸式生词本 (Instant Capture)
解决“查了就忘”的问题。
*   **划词入库:** 分析面板上的单词可点击。点击后，将 `{单词, 当前例句, 英文释义}` 一键存入本地数据库。

#### D. 原生发音 (Text-to-Speech)
*   调用浏览器原生 TTS (`window.speechSynthesis`) 或 OpenAI TTS (如果有 Key 额度)，支持倍速播放，纠正听力。

### 2.3 个人知识库 (Knowledge Dashboard)
由于是纯前端插件，提供一个独立的 `dashboard.html` 页面。
*   **Review Mode:** 单词卡片复习。
*   **Export:** 支持导出为 Anki 格式 (.apkg) 或 Markdown/JSON，方便导入其他笔记软件（Notion/Obsidian）。

---

## 3. 技术架构设计 (Pure Frontend Architecture)

### 3.1 目录结构 (Vue 3 + Vite + CRXJS)

```text
flow-reader/
├── src/
│   ├── background/         # Service Worker (API Proxy)
│   ├── content/            # 页面注入脚本
│   │   ├── LensOverlay.vue # 核心悬浮窗组件
│   │   ├── Highlight.vue   # 句法高亮组件
│   │   └── main.js         # Shadow DOM 挂载逻辑
│   ├── options/            # 设置页
│   ├── dashboard/          # 复习与管理页
│   ├── lib/
│   │   ├── llm-bridge.ts   # AI 接口统一封装
│   │   ├── prompt.ts       # 提示词工程
│   │   └── storage.ts      # IndexedDB 封装 (Dexie.js 推荐)
│   └── manifest.json
└── vite.config.ts
```

### 3.2 关键技术点

#### A. LLM Bridge & Prompt Engineering
为了适应更广泛的人群，提示词（Prompt）必须由“程序员导向”转变为“语言教师导向”。

**System Prompt 设计:**
```javascript
const systemPrompt = `
You are a professional ESL (English as a Second Language) tutor.
Your user is an intermediate learner reading real-world content.

Task: Analyze the user's selected text.
Response Format: JSON only.

Requirements:
1. "syntax": Identify Subject, Verb, Object, and Nested Clauses.
2. "rewrite": Paraphrase the meaning using simple, direct English (Plain English).
3. "vocabulary": Identify 1-3 distinct words/idioms that are crucial to the context. Give definitions based on THIS context.
4. "tone": Detect the tone (e.g., Sarcastic, Formal, Academic).

If the sentence contains idioms (e.g., "piece of cake"), explicitly point them out in "vocabulary".
`;
```

#### B. 跨域与流式传输 (CORS & Streaming)
*   **问题:** 网页 Content Script 无法直接调用 OpenAI API（会有 CORS 报错）。
*   **解决:**
    1.  UI 层 (Content Script) 发送消息 `chrome.runtime.sendMessage` 给 Background。
    2.  Background 层 (Service Worker) 发起 `fetch` 请求。
    3.  Background 层收到 Stream 数据块，通过 `chrome.tabs.sendMessage` 实时推回给 UI 层实现打字机效果。

#### C. 样式隔离 (Shadow DOM)
*   必须坚持使用 Shadow DOM，确保插件漂亮的 UI 在 1990 年代的旧网站和最新的 SPA 网站上表现一致。

---

## 4. UI/UX 交互细节

### 4.1 视觉风格
*   **Logo:** 一个极简的透镜图标，带有蓝紫色渐变。
*   **配色:**
    *   主色调: `Slate-900` (深色背景，减少阅读干扰)。
    *   强调色: `Indigo-500` (科技感与沉稳并存)。
    *   高亮色: 使用柔和的 Pastel 色系（淡蓝、淡红、淡绿），避免刺眼。

### 4.2 交互流程
1.  **Selection:** 用户鼠标划词 -> 文本下方出现半透明 `FlowReader` 图标。
2.  **Activation:**
    *   点击图标 -> 图标膨胀变大，变为 Loading 动画。
    *   同时，Shadow DOM 容器挂载，面板淡入。
3.  **Analysis (Streaming):**
    *   先出文本：“Thinking...”
    *   接着：Simple Rewrite 逐字显示。
    *   最后：原文被渲染为彩色高亮结构。
4.  **Interaction:**
    *   鼠标悬停在 <span style="color:#ef4444">**红色谓语**</span> 上 -> 显示该动词的原形和时态。
    *   点击右下角 `Save` -> 变为 `Saved ✓`。

---

## 5. 开发路线图 (MVP Roadmap)

| 阶段 | 周期 | 任务重点 |
| :--- | :--- | :--- |
| **P0: 骨架搭建** | Week 1 | 初始化 Vue+Vite 环境；配置 manifest v3；实现 Shadow DOM 注入；完成 Options 页面（API Key 输入）。 |
| **P1: 核心联调** | Week 1-2 | 打通 UI -> Background -> OpenAI 的链路；调试 Prompt 输出稳定的 JSON；实现流式打字机效果。 |
| **P2: 句法透视** | Week 2 | 前端根据 AI 返回的 JSON，利用 CSS 实现主谓宾高亮渲染；开发“降噪/折叠”开关。 |
| **P3: 本地存储** | Week 3 | 引入 IndexedDB；实现“保存卡片”功能；开发简单的 Dashboard 列表页。 |
| **P4: 发布测试** | Week 4 | 图标设计；编写 README；打包 crx；邀请种子用户（英语学习群）测试。 |

---

## 6. 扩展性思考 (Future Features)

虽然是 MVP，但架构上要预留接口：

1.  **PDF 阅读支持:** 这是一个巨大的市场（论文党）。利用 Chrome 自带的 PDF Viewer API 或 PDF.js 注入。
2.  **多语种支持:** 架构上支持 Prompt 切换，未来可以做 "FlowReader for Japanese/French"。
3.  **YouTube 字幕增强:** 能够抓取 YouTube CC 字幕并进行同样的句法分析（解决听不懂长难句的问题）。

这份文档将目标人群从“窄众（程序员）”转向了“大众（英语进阶者）”，同时保持了纯前端的技术轻便性。你可以直接基于此开始编码。
