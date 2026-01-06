export function shouldShowIcon(text: string): boolean {
  const MIN_CHARS = 2
  return text.trim().length >= MIN_CHARS
}
