import type {
  UserVocabularyConfig,
  WordMasteryStatus,
  VocabularyLevel,
} from '@/shared/types/vocabulary'
import { VocabularyLevel as VocabLevel } from '@/shared/types/vocabulary'
import { WordMasteryStatus as MasteryStatus } from '@/shared/types/vocabulary'

const STORAGE_KEY = 'flow-reader-vocabulary'

const DEFAULT_CONFIG: UserVocabularyConfig = {
  level: VocabLevel.LEVEL_2000,
  knownWords: [],
  unknownWords: [],
  ignoredWords: [],
  lastUpdated: Date.now(),
}

class VocabularyStorageService {
  /**
   * 加载用户词汇配置
   */
  async loadConfig(): Promise<UserVocabularyConfig> {
    return new Promise(resolve => {
      chrome.storage.local.get([STORAGE_KEY], result => {
        const stored = result[STORAGE_KEY] as UserVocabularyConfig | undefined
        resolve(stored || { ...DEFAULT_CONFIG })
      })
    })
  }

  /**
   * 保存用户词汇配置
   */
  async saveConfig(config: UserVocabularyConfig): Promise<void> {
    return new Promise(resolve => {
      const updated = {
        ...config,
        lastUpdated: Date.now(),
      }
      chrome.storage.local.set({ [STORAGE_KEY]: updated }, () => {
        resolve()
      })
    })
  }

  /**
   * 更新词汇量等级
   */
  async updateVocabularyLevel(level: VocabularyLevel): Promise<void> {
    const config = await this.loadConfig()
    config.level = level
    await this.saveConfig(config)
  }

  /**
   * 标记单词状态
   */
  async markWord(word: string, status: WordMasteryStatus): Promise<void> {
    const normalizedWord = word.toLowerCase().trim()
    if (!normalizedWord) return

    const config = await this.loadConfig()

    // 从所有列表中移除该词
    const removeFromList = (list: string[]) => {
      const index = list.indexOf(normalizedWord)
      if (index > -1) {
        list.splice(index, 1)
      }
    }

    removeFromList(config.knownWords)
    removeFromList(config.unknownWords)
    removeFromList(config.ignoredWords)

    // 添加到对应的列表
    switch (status) {
      case 'KNOWN':
        config.knownWords.push(normalizedWord)
        break
      case 'UNKNOWN':
        config.unknownWords.push(normalizedWord)
        break
      case 'IGNORED':
        config.ignoredWords.push(normalizedWord)
        break
    }

    await this.saveConfig(config)
  }

  /**
   * 批量标记单词
   */
  async markWords(words: string[], status: WordMasteryStatus): Promise<void> {
    const config = await this.loadConfig()
    const normalizedWords = words.map(w => w.toLowerCase().trim()).filter(Boolean)

    // 从所有列表中移除
    const removeSet = new Set(normalizedWords)
    config.knownWords = config.knownWords.filter(w => !removeSet.has(w))
    config.unknownWords = config.unknownWords.filter(w => !removeSet.has(w))
    config.ignoredWords = config.ignoredWords.filter(w => !removeSet.has(w))

    // 添加到对应列表
    switch (status) {
      case 'KNOWN':
        config.knownWords.push(...normalizedWords)
        break
      case 'UNKNOWN':
        config.unknownWords.push(...normalizedWords)
        break
      case 'IGNORED':
        config.ignoredWords.push(...normalizedWords)
        break
    }

    await this.saveConfig(config)
  }

  /**
   * 检查单词是否已记录
   */
  async getWordStatus(word: string): Promise<WordMasteryStatus | null> {
    const normalizedWord = word.toLowerCase().trim()
    const config = await this.loadConfig()

    if (config.knownWords.includes(normalizedWord)) {
      return MasteryStatus.KNOWN
    }
    if (config.unknownWords.includes(normalizedWord)) {
      return MasteryStatus.UNKNOWN
    }
    if (config.ignoredWords.includes(normalizedWord)) {
      return MasteryStatus.IGNORED
    }
    return null
  }

  /**
   * 获取统计数据
   */
  async getStats(): Promise<{
    level: VocabularyLevel
    knownCount: number
    unknownCount: number
    ignoredCount: number
  }> {
    const config = await this.loadConfig()
    return {
      level: config.level,
      knownCount: config.knownWords.length,
      unknownCount: config.unknownWords.length,
      ignoredCount: config.ignoredWords.length,
    }
  }

  /**
   * 清除所有数据
   */
  async clearAll(): Promise<void> {
    return new Promise(resolve => {
      chrome.storage.local.remove([STORAGE_KEY], () => {
        resolve()
      })
    })
  }
}

export const vocabularyStorage = new VocabularyStorageService()
