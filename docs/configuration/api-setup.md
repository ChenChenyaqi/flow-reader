# API Setup

FlowReader uses a **BYOK (Bring Your Own Key)** model, giving you full control over which AI service to use.

## Supported Providers

### Zhipu AI (GLM-4.7)

**Recommended for China users**

- Fast response times
- Reliable service in China
- [Get Free Key](https://open.bigmodel.cn/)

**Configuration:**

- **Provider:** Zhipu AI
- **API Key:** Your Zhipu API key
- **Model:** `glm-4-flash` (free) or `glm-4-plus`

### OpenAI

**Standard GPT models**

- Access to latest GPT models
- Global availability
- [Get API Key](https://platform.openai.com/api-keys)

**Configuration:**

- **Provider:** OpenAI
- **API Key:** Your OpenAI API key
- **Model:** `gpt-4o`, `gpt-4o-mini`, or other supported models

### Custom API

**Any OpenAI-compatible endpoint**

Supports any API that follows the OpenAI format:

- DeepSeek
- Local LLMs (Ollama, LM Studio)
- Other OpenAI-compatible services

**Configuration:**

- **Provider:** Custom
- **API Key:** Your API key (if required)
- **API URL:** Your custom endpoint (e.g., `http://localhost:11434/v1`)
- **Model:** Your model name

## Setup Steps

1. Open FlowReader Settings
2. Go to the **Settings** tab
3. Select your **Provider**
4. Enter your **API Key**
5. Enter your **Model Name**
6. (For Custom) Enter your **API URL**
7. Click **Save**

## Troubleshooting

### "Invalid API Key"

- Double-check your API key for typos
- Ensure the key hasn't expired
- Verify you're using the correct key for the provider

### "Network Error"

- Check your internet connection
- Try a different provider (Zhipu for China users)
- Verify custom API URL is accessible

### Slow Response

- Try a faster model (e.g., `glm-4-flash`, `gpt-4o-mini`)
- Select shorter text for analysis
- Check your internet connection

---

[Return to Configuration](./index.md) · [Vocabulary Settings](./vocabulary-settings.md)
