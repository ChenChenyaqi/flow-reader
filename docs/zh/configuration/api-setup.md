# API 设置

FlowReader 采用 **BYOK（自备密钥）** 模式，让您完全控制使用哪个 AI 服务。

## 支持的提供商

### 智谱 AI (GLM-4.7)

**推荐中国用户使用**

- 响应速度快
- 在中国服务稳定
- [获取免费密钥](https://open.bigmodel.cn/)

**配置：**

- **提供商：** 智谱 AI
- **API 密钥：** 您的智谱 API 密钥
- **模型：** `glm-4-flash`（免费）或 `glm-4-plus`

### OpenAI

**标准 GPT 模型**

- 访问最新的 GPT 模型
- 全球可用性
- [获取 API 密钥](https://platform.openai.com/api-keys)

**配置：**

- **提供商：** OpenAI
- **API 密钥：** 您的 OpenAI API 密钥
- **模型：** `gpt-4o`、`gpt-4o-mini` 或其他支持的模型

### 自定义 API

**任何兼容 OpenAI 的端点**

支持任何遵循 OpenAI 格式的 API：

- DeepSeek
- 本地 LLM（Ollama、LM Studio）
- 其他兼容 OpenAI 的服务

**配置：**

- **提供商：** 自定义
- **API 密钥：** 您的 API 密钥（如需要）
- **API URL：** 您的自定义端点（例如 `http://localhost:11434/v1`）
- **模型：** 您的模型名称

## 设置步骤

1. 打开 FlowReader 设置
2. 进入 **设置** 标签页
3. 选择您的 **提供商**
4. 输入您的 **API 密钥**
5. 输入您的 **模型名称**
6. （对于自定义）输入您的 **API URL**
7. 点击 **保存**

## 故障排除

### "无效的 API 密钥"

- 仔细检查 API 密钥是否有拼写错误
- 确保密钥未过期
- 验证您正在使用提供商的正确密钥

### "网络错误"

- 检查您的互联网连接
- 尝试其他提供商（中国用户使用智谱）
- 验证自定义 API URL 可访问

### 响应缓慢

- 尝试更快的模型（例如 `glm-4-flash`、`gpt-4o-mini`）
- 选择较短的文本进行分析
- 检查您的互联网连接

---

[返回配置](./index.md) · [词汇设置](./vocabulary-settings.md)
