import { reactive } from 'vue'
import type {
  VocabularyLevel,
  WordMasteryStatus,
} from '@/shared/types/vocabulary'
import { vocabularyStorage } from './vocabularyStorage'
import { VocabularyLevel as VocabLevel, WordMasteryStatus as MasteryStatus } from '@/shared/types/vocabulary'

/**
 * 全局词汇状态
 * 在插件启动时初始化，避免重复加载
 */
interface VocabularyState {
  // 当前词汇量等级
  level: VocabularyLevel

  // 认识的单词集合（用 Set 提高查询性能）
  knownWords: Set<string>

  // 不认识的单词集合
  unknownWords: Set<string>

  // 忽略的单词集合
  ignoredWords: Set<string>

  // 是否已初始化
  initialized: boolean

  // 最后更新时间
  lastUpdated: number
}

// 内部可变状态
const state = reactive<VocabularyState>({
  level: VocabLevel.LEVEL_2000,
  knownWords: new Set<string>(),
  unknownWords: new Set<string>(),
  ignoredWords: new Set<string>(),
  initialized: false,
  lastUpdated: 0,
})

/**
 * 全局词汇状态管理服务
 *
 * 使用方式：
 * import { vocabularyState } from '@/shared/services/vocabularyState'
 *
 * // 获取当前等级
 * const level = vocabularyState.level
 *
 * // 检查单词是否认识
 * const isKnown = vocabularyState.isWordKnown('hello')
 *
 * // 标记单词
 * await vocabularyState.markWord('hello', 'KNOWN')
 */
export const vocabularyState = {
  // ========== 只读访问器 ==========

  /** 当前词汇量等级 */
  get level(): VocabularyLevel {
    return state.level
  },

  /** 已认识的单词列表（数组形式） */
  get knownWordsList(): string[] {
    return Array.from(state.knownWords)
  },

  /** 不认识的单词列表（数组形式） */
  get unknownWordsList(): string[] {
    return Array.from(state.unknownWords)
  },

  /** 忽略的单词列表（数组形式） */
  get ignoredWordsList(): string[] {
    return Array.from(state.ignoredWords)
  },

  /** 是否已初始化 */
  get initialized(): boolean {
    return state.initialized
  },

  /** 最后更新时间 */
  get lastUpdated(): number {
    return state.lastUpdated
  },

  // ========== 业务方法 ==========

  /**
   * 初始化全局状态
   * 在插件启动时调用一次
   */
  async init(): Promise<void> {
    if (state.initialized) {
      console.log('[VocabularyState] Already initialized, skipping')
      return
    }

    console.log('[VocabularyState] Initializing...')

    try {
      const config = await vocabularyStorage.loadConfig()

      state.level = config.level
      state.knownWords = new Set(config.knownWords)
      state.unknownWords = new Set(config.unknownWords)
      state.ignoredWords = new Set(config.ignoredWords)
      state.lastUpdated = config.lastUpdated
      state.initialized = true

      console.log('[VocabularyState] Initialized successfully', {
        level: state.level,
        knownCount: state.knownWords.size,
        unknownCount: state.unknownWords.size,
        ignoredCount: state.ignoredWords.size,
      })
    } catch (error) {
      console.error('[VocabularyState] Initialization failed:', error)
      // 失败时使用默认值
      state.level = VocabLevel.LEVEL_2000
      state.knownWords = new Set()
      state.unknownWords = new Set()
      state.ignoredWords = new Set()
      state.initialized = true
    }
  },

  /**
   * 检查单词是否已认识
   */
  isWordKnown(word: string): boolean {
    const normalized = word.toLowerCase().trim()
    return state.knownWords.has(normalized)
  },

  /**
   * 检查单词是否标记为不认识
   */
  isWordUnknown(word: string): boolean {
    const normalized = word.toLowerCase().trim()
    return state.unknownWords.has(normalized)
  },

  /**
   * 检查单词是否被忽略
   */
  isWordIgnored(word: string): boolean {
    const normalized = word.toLowerCase().trim()
    return state.ignoredWords.has(normalized)
  },

  /**
   * 获取单词状态
   */
  getWordStatus(word: string): WordMasteryStatus | null {
    const normalized = word.toLowerCase().trim()
    if (state.knownWords.has(normalized)) return MasteryStatus.KNOWN
    if (state.unknownWords.has(normalized)) return MasteryStatus.UNKNOWN
    if (state.ignoredWords.has(normalized)) return MasteryStatus.IGNORED
    return null
  },

  /**
   * 标记单词（同时更新内存和存储）
   */
  async markWord(word: string, status: WordMasteryStatus): Promise<void> {
    const normalized = word.toLowerCase().trim()
    if (!normalized) return

    console.log(`[VocabularyState] Marking "${normalized}" as ${status}`)

    // 从所有集合中移除
    state.knownWords.delete(normalized)
    state.unknownWords.delete(normalized)
    state.ignoredWords.delete(normalized)

    // 添加到对应集合
    switch (status) {
      case 'KNOWN':
        state.knownWords.add(normalized)
        break
      case 'UNKNOWN':
        state.unknownWords.add(normalized)
        break
      case 'IGNORED':
        state.ignoredWords.add(normalized)
        break
    }

    // 同步到持久化存储
    await vocabularyStorage.saveConfig({
      level: state.level,
      knownWords: Array.from(state.knownWords),
      unknownWords: Array.from(state.unknownWords),
      ignoredWords: Array.from(state.ignoredWords),
      lastUpdated: Date.now(),
    })

    state.lastUpdated = Date.now()

    console.log(`[VocabularyState] Word "${normalized}" marked as ${status}`)
  },

  /**
   * 批量标记单词
   */
  async markWords(words: string[], status: WordMasteryStatus): Promise<void> {
    const normalizedWords = words
      .map((w) => w.toLowerCase().trim())
      .filter(Boolean)

    if (normalizedWords.length === 0) return

    console.log(
      `[VocabularyState] Marking ${normalizedWords.length} words as ${status}`
    )

    // 从所有集合中移除
    normalizedWords.forEach((word) => {
      state.knownWords.delete(word)
      state.unknownWords.delete(word)
      state.ignoredWords.delete(word)
    })

    // 添加到对应集合
    const targetSet =
      status === 'KNOWN'
        ? state.knownWords
        : status === 'UNKNOWN'
          ? state.unknownWords
          : state.ignoredWords

    normalizedWords.forEach((word) => targetSet.add(word))

    // 同步到持久化存储
    await vocabularyStorage.saveConfig({
      level: state.level,
      knownWords: Array.from(state.knownWords),
      unknownWords: Array.from(state.unknownWords),
      ignoredWords: Array.from(state.ignoredWords),
      lastUpdated: Date.now(),
    })

    state.lastUpdated = Date.now()
  },

  /**
   * 更新词汇量等级
   */
  async updateLevel(level: VocabularyLevel): Promise<void> {
    console.log(`[VocabularyState] Updating level to ${level}`)
    state.level = level

    await vocabularyStorage.saveConfig({
      level: state.level,
      knownWords: Array.from(state.knownWords),
      unknownWords: Array.from(state.unknownWords),
      ignoredWords: Array.from(state.ignoredWords),
      lastUpdated: Date.now(),
    })

    state.lastUpdated = Date.now()
    console.log(`[VocabularyState] Level updated to ${level}`)
  },

  /**
   * 获取统计信息
   */
  getStats() {
    return {
      level: state.level,
      knownCount: state.knownWords.size,
      unknownCount: state.unknownWords.size,
      ignoredCount: state.ignoredWords.size,
      lastUpdated: state.lastUpdated,
    }
  },

  /**
   * 清除所有数据
   */
  async clearAll(): Promise<void> {
    console.log('[VocabularyState] Clearing all data')

    state.knownWords.clear()
    state.unknownWords.clear()
    state.ignoredWords.clear()
    state.level = VocabLevel.LEVEL_2000
    state.lastUpdated = Date.now()

    await vocabularyStorage.clearAll()
    console.log('[VocabularyState] All data cleared')
  },

  /**
   * 刷新状态（从存储重新加载）
   */
  async refresh(): Promise<void> {
    console.log('[VocabularyState] Refreshing from storage...')

    const config = await vocabularyStorage.loadConfig()

    state.level = config.level
    state.knownWords = new Set(config.knownWords)
    state.unknownWords = new Set(config.unknownWords)
    state.ignoredWords = new Set(config.ignoredWords)
    state.lastUpdated = config.lastUpdated

    console.log('[VocabularyState] Refreshed successfully')
  },
}

// 导出类型（用于 TypeScript）
export type VocabularyStateService = typeof vocabularyState
