import type { SimplifyContext } from '@/shared/types/llm'
import { vocabularyState } from '@/shared/services/vocabularyState'
import { extractAndFilterWords } from '../utils/wordFilter'

const GRAMMAR_PROMPT = `You are an expert English teacher. Analyze the following text.

## CRITICAL RULE - MUST FOLLOW
**ONLY select words from "Available Words to Explain" list. DO NOT select any other words.**

If "Available Words to Explain" is empty or contains only simple words within user's vocabulary level, return "vocabulary": []

## Context
- User Vocabulary Level: {vocabularyLevel} (~{wordCount} words)
- Words User is Learning: {unknownWords}
- Available Words to Explain: {filteredWords}

## STRICT SELECTION RULES
1. You MUST ONLY choose words from "Available Words to Explain"
2. Do NOT explain: reached, december, months, numbers, basic verbs
3. If filteredWords = ["repository", "deprecated", "vue"], ONLY choose from these 3
4. Prioritize: words in "Words User is Learning" list > words with frequency rank > {wordCount}

## Negative Examples - DO NOT DO THIS
❌ WRONG: Available Words = ["repository", "vue"], you explain "reached" (NOT in list!)
❌ WRONG: Available Words = ["repository"], you explain "deprecated" (NOT in list!)
❌ WRONG: Available Words = [], you still return vocabulary with words
❌ WRONG: Explaining simple words like: get, make, go, see, come, take, use, know, think, want, look, give, find, tell, ask, work, seem, feel, try, leave, call, good, bad, big, small, old, new, first, last, long, short, high, low, right, wrong

## Positive Examples - DO THIS INSTEAD
✅ CORRECT: Available Words = [] → vocabulary: []
✅ CORRECT: Available Words = ["repository", "deprecated"] → vocabulary: [{"word": "repository", "simpleDefinition": "...", "chineseTranslation": "..."}, {"word": "deprecated", "simpleDefinition": "...", "chineseTranslation": "..."}]
✅ CORRECT: Available Words = ["cat", "run"] with user level 2000 → vocabulary: [] (these are simple)

## Task 1: Grammar Marking
Wrap subject, predicate, object with tags:
- <subject>...</subject>
- <predicate>...</predicate>
- <object>...</object>

## Task 2: Vocabulary Explanation
ONLY select from: {filteredWords}

For each word:
- simpleDefinition: Simple English explanation using basic words (top 2000)
- chineseTranslation: Accurate Chinese translation
- If definition still has hard words, add Chinese in parentheses: "a place (地方) to keep things"

Return 5-8 most difficult words from the list, or fewer if list is small. Return [] if all are simple.

## Task 3: Translation
Translate to Chinese. For technical content, keep terms like Vue, React, API in English.

## Output Format
Return EXACTLY this JSON structure:

{
  "markedText": "The <subject>repository</subject> <predicate>is</predicate> <object>old</object>.",
  "vocabulary": [
    {
      "word": "repository",
      "simpleDefinition": "a place where things are stored or kept",
      "chineseTranslation": "仓库"
    }
  ],
  "translation": "这个仓库很旧。",
  "confidence": 90
}

**If no difficult words:**
{
  "markedText": "The <subject>cat</subject> <predicate>is</predicate> <object>cute</object>.",
  "vocabulary": [],
  "translation": "这只猫很可爱。",
  "confidence": 95
}

## Confidence Rating
Rate your analysis accuracy (0-100):
- 90-100: Clear grammar structure, unambiguous
- 70-89: Generally correct but some complexity
- 50-69: Uncertain (complex sentence, multiple interpretations)
- Below 50: Low confidence (unusual structure, missing context)

Text: {text}`

const SIMPLE_PROMPT = `Analyze this text. No vocabulary explanation needed - return empty array.

Mark grammar with <subject>, <predicate>, <object> tags.
Translate to Chinese (keep technical terms in English).

Return JSON: {"markedText": "...", "vocabulary": [], "translation": "...", "confidence": 90}

Text: {text}`

/**
 * Build grammar analysis prompt with context
 */
export async function buildGrammarPrompt(text: string, context: SimplifyContext): Promise<string> {
  // Ensure vocabulary state is initialized
  if (!vocabularyState.initialized) {
    await vocabularyState.init()
  }

  const level = vocabularyState.level
  const wordCount = parseInt(level.replace('LEVEL_', ''))

  // Get unknown words from global state
  const unknownWords = vocabularyState.unknownWordsList.slice(0, 50)

  // Extract and filter words from text
  const filteredWords = await extractAndFilterWords(text)

  // Use simple prompt if no words to analyze
  if (filteredWords.length === 0) {
    return SIMPLE_PROMPT.replace('{text}', text)
  }

  // Build full grammar analysis prompt
  const placeholders: Record<string, string> = {
    pageUrl: context.pageUrl || 'Not provided',
    pageTitle: context.pageTitle || 'Not provided',
    pageDescription: context.pageDescription || 'Not provided',
    vocabularyLevel: level,
    wordCount: wordCount.toString(),
    unknownWords: unknownWords.length > 0 ? unknownWords.join(', ') : 'None',
    filteredWords: filteredWords.join(', '),
    text,
  }

  return Object.entries(placeholders).reduce(
    (prompt, [key, value]) => prompt.replace(`{${key}}`, value),
    GRAMMAR_PROMPT
  )
}
