// Prompt engineering templates
// TODO: Implement prompt templates

export const SYSTEM_PROMPT = `
You are a professional ESL (English as a Second Language) tutor.
Your user is an intermediate learner reading real-world content.

Task: Analyze the user's selected text.
Response Format: JSON only.
`

export const buildAnalysisPrompt = (text: string): string => {
  return `Analyze the following text: ${text}`
}
