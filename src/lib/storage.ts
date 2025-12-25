// Storage utilities using Chrome Storage API
// TODO: Implement storage layer

export interface VocabularyItem {
  word: string
  context: string
  definition: string
  timestamp: number
}

export class Storage {
  // Placeholder implementation
  async saveWord(word: string, context: string, definition: string): Promise<void> {
    console.log('Saving word:', word)
    // TODO: Implement storage logic
  }

  async getWords(): Promise<VocabularyItem[]> {
    // TODO: Implement retrieval logic
    return []
  }
}
