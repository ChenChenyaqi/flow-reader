import { vocabularyState } from '@/shared/services/vocabularyState'
import commonWords from './commonWords.json'

// Maximum number of filtered words to analyze
const MAX_FILTERED_WORDS = 200

// Common function words to exclude from analysis
const COMMON_FUNCTION_WORDS = new Set(commonWords)

/**
 * Extract words from text (excluding punctuation and numbers)
 */
function extractWords(text: string): string[] {
  // Match words including contractions (e.g., "don't", "it's")
  const words = text.match(/\b[a-zA-Z]+(?:'[a-zA-Z]+)?\b/g) || []
  return words.map(w => w.toLowerCase())
}

/**
 * Extract and filter words from text based on user's vocabulary level
 *
 * Filters out:
 * - Single letter words
 * - Common function words
 * - Words the user already knows
 * - Pure numbers
 */
export async function extractAndFilterWords(text: string): Promise<string[]> {
  // Ensure vocabulary state is initialized
  if (!vocabularyState.initialized) {
    await vocabularyState.init()
  }

  // Extract all words from text
  const allWords = extractWords(text)

  // Get known words set
  const knownWordsSet = new Set(vocabularyState.knownWordsList)

  // Filter words based on multiple criteria
  const filteredWords = Array.from(
    new Set(
      allWords.filter(
        word =>
          word.length > 1 && // Exclude single letter words
          !COMMON_FUNCTION_WORDS.has(word) && // Exclude common function words
          !knownWordsSet.has(word) && // Exclude known words
          !/^\d+$/.test(word) // Exclude pure numbers
      )
    )
  ).slice(0, MAX_FILTERED_WORDS)

  return filteredWords
}
