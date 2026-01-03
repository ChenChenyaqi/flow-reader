export default {
  // 通用
  common: {
    save: '保存',
    cancel: '取消',
    close: '关闭',
    loading: '加载中...',
    error: '出错了',
    success: '成功',
    confirm: '确认',
    collapse: '折叠',
    expand: '展开',
  },

  // 配置卡片
  config: {
    title: '配置',
    llmConfig: 'LLM 配置',
    vocabulary: '词汇',
    other: '其它',
    language: '语言',
    provider: '服务商',
    apiKey: 'API 密钥',
    model: '模型名称',
    apiUrl: 'API 地址',
    vocabularyLevel: '词汇量等级',
    saveConfig: '保存配置',
    configSaved: '配置已保存',
  },

  // 词汇等级
  vocabularyLevel: {
    LEVEL_500: '500词 (A1 - 初学者)',
    LEVEL_1000: '1000词 (A2 - 小学)',
    LEVEL_2000: '2000词 (B1 - 初中)',
    LEVEL_3000: '3000词 (B2 - 高中)',
    LEVEL_5000: '5000词 (C1 - 大学)',
    LEVEL_8000: '8000词+ (C2 - 专业)',
  },

  // LLM 服务商
  provider: {
    zhipu: '智谱 AI',
    openai: 'OpenAI',
    custom: '自定义',
  },

  // 分析卡片
  card: {
    simplified: '简化文本',
    grammar: '语法分析',
    vocabulary: '生词',
    translation: '中文翻译',
    know: '认识',
    dontKnow: '不认识',
    noVocabulary: '没有生词',
    analyzing: '分析中...',
    regenerate: '重新生成',
    error: '分析失败，请检查配置',
    subject: '主语',
    predicate: '谓语',
    object: '宾语',
    length: '长度: {count} 字符',
  },

  // 错误消息
  error: {
    noApiKey: '请先配置 API 密钥',
    invalidConfig: '配置无效',
    networkError: '网络错误，请重试',
    rateLimit: '请求过于频繁，请稍后再试',
    unknownError: '未知错误',
  },

  // 语法高亮
  grammar: {
    subject: '主语',
    predicate: '谓语',
    object: '宾语',
  },
} as const
