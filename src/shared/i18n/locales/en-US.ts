export default {
  // Common
  common: {
    save: 'Save',
    cancel: 'Cancel',
    close: 'Close',
    loading: 'Loading...',
    error: 'Error',
    success: 'Success',
    confirm: 'Confirm',
    collapse: 'Collapse',
    expand: 'Expand',
  },

  // Config Card
  config: {
    title: 'Configuration',
    llmConfig: 'LLM Config',
    vocabulary: 'Vocabulary',
    other: 'Other',
    language: 'Language',
    provider: 'Provider',
    apiKey: 'API Key',
    model: 'Model Name',
    apiUrl: 'API URL',
    vocabularyLevel: 'Vocabulary Level',
    saveConfig: 'Save Configuration',
    configSaved: 'Configuration saved',
  },

  // Vocabulary Levels
  vocabularyLevel: {
    LEVEL_500: '500 words (A1 - Beginner)',
    LEVEL_1000: '1000 words (A2 - Elementary)',
    LEVEL_2000: '2000 words (B1 - Intermediate)',
    LEVEL_3000: '3000 words (B2 - Upper Intermediate)',
    LEVEL_5000: '5000 words (C1 - Advanced)',
    LEVEL_8000: '8000+ words (C2 - Proficient)',
  },

  // LLM Providers
  provider: {
    zhipu: 'Zhipu AI (Recommended)',
    doubao: 'Doubao',
    qianwen: 'Qianwen',
    deepseek: 'DeepSeek',
    moonshot: 'Moonshot (Kimi)',
    openai: 'OpenAI',
    groq: 'Groq',
    custom: 'Custom',
  },

  // Analysis Card
  card: {
    simplified: 'Simplified',
    grammar: 'Grammar',
    vocabulary: 'Vocabulary',
    translation: 'Translation',
    know: 'Know',
    dontKnow: "Don't Know",
    noVocabulary: 'No new vocabulary',
    analyzing: 'Analyzing...',
    regenerate: 'Regenerate',
    error: 'Analysis failed. Please check your configuration.',
    subject: 'Subject',
    predicate: 'Predicate',
    object: 'Object',
    length: 'Length: {count} chars',
    confidence: 'Confidence',
  },

  // Error Messages
  error: {
    noApiKey: 'Please configure your API key first',
    invalidConfig: 'Invalid configuration',
    networkError: 'Network error. Please try again.',
    rateLimit: 'Too many requests. Please try again later.',
    unknownError: 'Unknown error',
  },

  // Grammar
  grammar: {
    subject: 'Subject',
    predicate: 'Predicate',
    object: 'Object',
  },
} as const
