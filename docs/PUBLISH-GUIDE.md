# FlowReader - Chrome Web Store 发布指南

## 📦 发布材料准备情况

### ✅ 已完成的文档

| 文件 | 路径 | 用途 |
|------|------|------|
| **商店描述** | `docs/STORE-LISTING.md` | Chrome Web Store 商店描述（中英双语） |
| **隐私政策** | `docs/PRIVACY-POLICY.md` | 隐私政策文档 |
| **技术文档** | `docs/MVP-TECHNICAL-DOC.md` | MVP 技术文档 |
| **检查清单** | `docs/RELEASE-CHECKLIST.md` | 发布前检查清单 |

---

## 🚨 尚需准备的必要材料

### 1. 图标（必需）⚠️

**状态**: ❌ 项目中暂无图标文件

**你需要准备**:
- **128x128** PNG 图标（必需，商店展示）
- 可选：48x48, 16x16, 96x96

**快速解决方案**:

#### 方案 A：在线生成（推荐）

1. 访问 [Favicon.io](https://favicon.io/)
2. 输入文字 "FL" 或 "AI" 生成图标
3. 下载生成的 PNG 图标包
4. 选择 128x128 尺寸的图标

#### 方案 B：AI 生成

使用 AI 工具生成：
```bash
# DALL-E / Midjourney 提示词
"A simple and modern app icon for an English learning browser extension,
featuring a magnifying glass and an open book, minimal flat design,
blue and cyan color scheme, transparent background, clean style,
app icon style, high quality"
```

#### 方案 C：手动设计

使用 Figma / Canva 手动设计：
- 下载：https://www.canva.com/
- 搜索 "App Icon" 模板
- 使用蓝色 + 青色配色
- 添加放大镜和书本元素

### 2. 截图（1-5 张）⚠️

**状态**: 需要你手动截图

**需要拍摄的截图**:

| 截图 | 展示内容 | 场景建议 |
|------|---------|---------|
| **截图 1** | 主功能全景 | 在英文技术文档页面选中代码注释，显示完整分析卡片 |
| **截图 2** | 语法分析 | 选中复杂句子，展示主谓宾高亮 |
| **截图 3** | 生词学习 | 展示生词列表 + 认识/不认识按钮 |
| **截图 4** | 配置界面 | 配置卡片展开状态（LLM Config / Vocabulary Tab） |
| **截图 5** | 多场景使用 | 展示在不同类型网页使用 |

**截图规格**:
- 尺寸：**1280x800** 或 **640x400** (宽 x 高)
- 格式：PNG（推荐）或 JPG
- 内容：真实使用场景，不包含浏览器 UI

**推荐测试网页**:
- 技术文档：https://github.com/ 任意项目的 README
- 新闻网站：https://www.bbc.com/ 任意英文新闻
- 博客：https://medium.com/ 任意英文文章

**截图工具**:
- Windows: **Win + Shift + S** (自带截图工具)
- Mac: **Cmd + Shift + 5**
- 推荐：[Snipaste!](https://snipaste.com/)

### 3. 开发者账户（必需）⚠️

**步骤**:
1. 访问 [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole)
2. 注册 Google 账户（如果还没有）
3. 支付 $5 美元注册费（一次性）
4. 验证邮箱

---

## 📋 快速发布流程

### Step 1: 构建扩展

```bash
cd /Users/chenyaqi/Documents/code/flow-reader
pnpm build
```

输出文件在 `dist/` 目录。

### Step 2: 准备图标

1. 准备 128x128 PNG 图标
2. 重命名为 `icon.png` 或 `icon-128.png`
3. 放到 `dist/` 目录（或准备在商店表单中单独上传）

### Step 3: 截图准备

1. 在 3-5 个不同网页测试扩展功能
2. 每个场景截取一张 1280x800 的图片
3. 保存为 PNG 格式

### Step 4: 创建项目

1. 登录 [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole)
2. 点击"新建项目"
3. 上传 `dist/` 文件夹
4. 上传图标
5. 上传截图

### Step 5: 填写商店信息

从 `docs/STORE-LISTING.md` 复制以下内容：
- **扩展名称**: FlowReader
- **简短描述**: FlowReader - AI 驱动的英语学习助手...
- **详细描述**: 完整的中文和英文描述
- **功能列表**: 所有功能点

### Step 6: 隐私政策

1. 将 `docs/PRIVACY-POLICY.md` 上传到可访问的 URL
   - 推荐：GitHub Pages
   - 或：Netlify Drop
2. 在商店列表中填写隐私政策链接

### Step 7: 提交审核

1. 检查所有信息
2. 确认符合 Chrome Web Store 政策
3. 点击"提交审核"
4. 等待 1-3 个工作日

---

## ✅ 发布前最终检查

使用 `docs/RELEASE-CHECKLIST.md` 进行完整检查：

### 功能测试

- [x] 文本选择触发图标
- [ ] 点击图标打开分析卡片
- [ ] 简化文本正常显示
- [ ] 语法分析正确标记
- [ ] 生词列表正确显示
- [ ] 中文翻译准确
- [ ] 单词标记功能正常
- [ ] 配置功能正常
- [ ] 卡片可拖动和折叠

### 技术验证

- [x] `pnpm build` 成功
- [x] `pnpm type-check` 通过
- [x] `pnpm lint` 通过
- [ ] dist/ 目录大小合理

### 材料准备

- [ ] 扩展包已构建
- [ ] 图标已准备 (128x128)
- [ ] 截图已准备 (1-5 张)
- [ ] 商店描述已准备
- [ ] 隐私政策已准备
- [ ] 开发者账户已注册

---

## 📚 文档索引

### 技术文档

- **MVP 技术文档**: `docs/MVP-TECHNICAL-DOC.md`
  - 产品概述
  - 技术架构
  - 项目结构
  - 功能实现详情
  - 数据模型
  - API 设计

### 发布文档

- **商店描述**: `docs/STORE-LISTING.md`
  - 中文描述
  - English Description
  - 功能列表
  - 分类标签

- **隐私政策**: `docs/PRIVACY-POLICY.md`
  - 信息收集
  - 数据使用
  - 第三方服务
  - 用户权利

- **检查清单**: `docs/RELEASE-CHECKLIST.md`
  - 功能测试清单
  - 技术验证清单
  - 材料准备清单
  - 发布流程步骤

---

## 🎯 当前状态总结

### ✅ 已完成

| 项目 | 状态 |
|------|------|
| MVP 功能开发 | ✅ 100% 完成 |
| 技术文档 | ✅ 已完成 |
| 商店描述 | ✅ 已完成 |
| 隐私政策 | ✅ 已完成 |
| 发布清单 | ✅ 已完成 |
| 代码构建 | ✅ 验证通过 |

### ⏳ 待完成

| 项目 | 状态 | 优先级 |
|------|------|--------|
| 图标设计 | ⏳ 待准备 | 🔴 高（必需） |
| 截图制作 | ⏳ 待准备 | 🔴 高（必需） |
| 开发者账户 | ⏳ 待注册 | 🔴 高（必需） |
| 测试验证 | ⏳ 待执行 | 🟡 中（推荐） |

---

## 🚀 下一步行动

### 立即行动（发布必需）

1. **准备图标** ⏱️ 30分钟
   - 使用 Favicon.io 或 AI 生成
   - 下载 128x128 PNG

2. **准备截图** ⏱️ 1小时
   - 在 3-5 个网页测试
   - 截取 5 张 1280x800 图片

3. **注册开发者** ⏱️ 15分钟
   - 访问开发者后台
   - 支付 $5 注册费
   - 验证邮箱

4. **提交审核** ⏱️ 30分钟
   - 创建项目
   - 填写信息
   - 提交审核

### 可选行动（提升质量）

1. **全面测试** ⏱️ 2-3小时
   - 在不同类型网页测试
   - 验证所有边界情况
   - 使用 `docs/RELEASE-CHECKLIST.md`

2. **内容创作** ⏱️ 1-2小时
   - 录制演示视频
   - 编写使用教程
   - 准备社交媒体宣传

---

## 💡 建议

### 发布前

✅ **推荐做法**:
1. 先完成所有发布前测试
2. 准备高质量的图标和截图
3. 仔细阅读 Chrome Web Store 政策
4. 隐私政策部署到可访问的 URL

### 发布后

✅ **推广建议**:
1. 分享到社交媒体（Twitter、微博）
2. 在开发者社区发布（Velog、掘金）
3. 邀请朋友使用并反馈
4. 积极回应用户评论

### 持续改进

✅ **长期规划**:
1. 收集用户反馈
2. 监控使用数据
3. 规划 v1.1.0 功能（生词本）
4. 考虑云同步功能

---

## 📞 需要帮助？

如果在发布过程中遇到问题：

1. **查看文档**: `docs/MVP-TECHNICAL-DOC.md`
2. **检查清单**: `docs/RELEASE-CHECKLIST.md`
3. **Chrome 政策**: https://chrome.google.com/webstore/program_policies

---

**祝发布成功！🎉**

*最后更新: 2025-01-03*
*版本: v1.0.0*
