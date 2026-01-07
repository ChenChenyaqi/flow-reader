<div align="center">
  <img src="public/icon-128.png" alt="FlowReader Logo" width="100" height="100">

  <h1>FlowReader 心流阅读</h1>

  <p>
    <strong>利用 AI 技术，将被动阅读转化为主动的语言学习体验。</strong>
  </p>

  <p>
    <a href="README.md"> 🌐English</a> |
    <a href="#安装指南">⬇️ 安装指南</a> |
    <a href="#快速上手">🚀 快速上手</a>
  </p>

  <p>
    <img src="https://img.shields.io/badge/License-AGPL%20v3-blue.svg" alt="License">
    <img src="https://img.shields.io/badge/Chrome-Extension-googlechrome.svg" alt="Chrome Extension">
    <img src="https://img.shields.io/badge/Vue.js-3.0-green.svg" alt="Vue">
  </p>
</div>

---

## 📖 项目介绍

**FlowReader (心流阅读)** 是一款开源的浏览器扩展，专为开发者和英语学习者（A1-B2 水平）设计。它利用大语言模型（LLM）技术，在你阅读网页时提供即时的辅助，帮你扫清生词障碍，看懂长难句。

**隐私优先：** FlowReader 是一个纯前端应用。你的 API Key 和阅读数据仅存储在本地浏览器中，绝不会上传到我们的服务器。

## ✨ 核心功能

- **⚡️ 划词分析**：在任意网页选中英文文本，点击浮窗图标即可触发 AI 分析。
- **📉 智能简化**：将复杂的长难句重写为 A1-A2 级别的简单英语，并提供打字机式的流式输出体验。
- **🔍 语法可视化**：自动分析句子结构，通过不同颜色的下划线高亮 **主语**、**谓语** 和 **宾语**，让你一眼看穿句子骨架。
- **📚 个性化生词本**：
  - 根据你的词汇量等级（500~8000词）智能过滤生词。
  - 提供简单的英文定义和中文翻译。
  - 支持标记“已认识”，系统会自动记住并过滤该单词。
- **🤖 多模型支持**：原生支持 **智谱 AI (GLM-4)**（国内直连）、**OpenAI** 以及自定义 API。

## 🚀 快速上手

### 1. 安装插件

#### 方法 A：从商店安装（推荐）

> _即将上架 Chrome 应用商店。_

- [Microsoft Edge 插件市场](https://microsoftedge.microsoft.com/addons/detail/fluentread/mnlilgfbjkbbimcjhneefdginlfefbal)

#### 方法 B：加载解压包（开发者/尝鲜）

1. 在 [Releases](https://github.com/ChenChenyaqi/flow-reader/releases) 页面下载最新的 `dist` 压缩包并解压。
2. 打开 Chrome 或 Edge 浏览器，访问 `chrome://extensions/`。
3. 开启右上角的 **"开发者模式" (Developer mode)**。
4. 点击左上角的 **"加载已解压的扩展程序" (Load unpacked)**。
5. 选择解压后的 `dist` 文件夹。

**安装后记得刷新浏览器**

### 2. 配置 API Key (必做)

FlowReader 采用 BYOK (Bring Your Own Key) 模式，你需要配置自己的 AI 服务商。

1. 选中任意文本后，点击右下角出现的🔍(放大镜)图标。
2. 点击弹出的**FlowReader**卡片右上角的**Settings (配置)** 图标。
3. 进入 **Settings (配置)** 卡片。
4. 选择服务商：
   - **智谱 AI (Zhipu)**：国内用户推荐，速度快且稳定。[点击领取新人免费额度](https://open.bigmodel.cn/)
   - **OpenAI**：适合海外用户。
   - **Custom**：支持任何兼容 OpenAI 格式的接口（如 DeepSeek、本地 Ollama 等）。
   - **Other**
5. 输入对应的 **API Key** 和 **模型名称**。
6. 点击**保存**按钮。
7. (可选) 在 **词汇** 标签页设置你的当前词汇量等级。

### 3. 开始使用

1. **选中文本**：在浏览英文技术文档或新闻时，选中一段你觉得困难的文本。
2. **点击图标**：选区附近会出现一个 FlowReader 的浮动图标，点击它。
3. **查看分析**：
   - 阅读 AI 实时生成的简化版文本。
   - 观察高亮的语法结构（主谓宾）。
   - 查看生词翻译，并标记你认识的单词。

## 🛠️ 本地开发

如果你想参与贡献或自己编译：

```bash
# 1. 克隆项目
git clone https://github.com/ChenChenyaqi/flow-reader.git

# 2. 安装依赖
pnpm install

# 3. 启动开发服务器 (支持热更新)
pnpm dev

# 4. 构建生产版本
pnpm build
```
