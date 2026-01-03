/**
 * 词汇量等级
 */
export enum VocabularyLevel {
  LEVEL_500 = 'LEVEL_500', // 初学者
  LEVEL_1000 = 'LEVEL_1000', // 小学水平
  LEVEL_2000 = 'LEVEL_2000', // 初中水平
  LEVEL_3000 = 'LEVEL_3000', // 高中水平
  LEVEL_5000 = 'LEVEL_5000', // 大学水平
  LEVEL_8000 = 'LEVEL_8000', // 专业水平
}

/**
 * 词汇量等级对应的显示文本和描述
 */
export const VOCABULARY_LEVEL_INFO = {
  [VocabularyLevel.LEVEL_500]: {
    label: '500词',
    description: '英语初学者',
    cefr: 'A1',
  },
  [VocabularyLevel.LEVEL_1000]: {
    label: '1000词',
    description: '小学水平',
    cefr: 'A2',
  },
  [VocabularyLevel.LEVEL_2000]: {
    label: '2000词',
    description: '初中水平',
    cefr: 'B1',
  },
  [VocabularyLevel.LEVEL_3000]: {
    label: '3000词',
    description: '高中水平',
    cefr: 'B2',
  },
  [VocabularyLevel.LEVEL_5000]: {
    label: '5000词',
    description: '大学水平',
    cefr: 'C1',
  },
  [VocabularyLevel.LEVEL_8000]: {
    label: '8000词+',
    description: '专业水平',
    cefr: 'C2',
  },
} as const

/**
 * 单词掌握状态
 */
export enum WordMasteryStatus {
  KNOWN = 'KNOWN', // 认识
  UNKNOWN = 'UNKNOWN', // 不认识
  IGNORED = 'IGNORED', // 忽略（过于简单或专有名词）
}

/**
 * 用户单词记录
 */
export interface UserWordRecord {
  word: string // 单词（小写）
  status: WordMasteryStatus // 掌握状态
  timestamp: number // 记录时间戳
  context?: string // 首次出现的上下文（可选）
}

/**
 * 用户词汇量配置
 */
export interface UserVocabularyConfig {
  level: VocabularyLevel // 当前词汇量等级
  knownWords: string[] // 认识的单词列表
  unknownWords: string[] // 不认识的单词列表
  ignoredWords: string[] // 忽略的单词列表
  lastUpdated: number // 最后更新时间
}

/**
 * 词汇过滤结果
 */
export interface VocabularyFilterResult {
  knownWords: string[] // 从本地数据库过滤出的已知单词
  unknownWords: string[] // 从本地数据库过滤出的未知单词
  remainingText: string // 过滤后需要发送给AI的文本
}
