<template>
  <div
    class="grammar-highlight text-slate-400"
    v-html="renderMarkedText()"
  ></div>
</template>

<script setup lang="ts">
import type { GrammarAnalysis, GrammarRole } from '@/shared/types/llm'

const props = defineProps<{
  text: string
  analysis: GrammarAnalysis
}>()

// Role to color mapping (use violet for object to avoid conflict with simplified text emerald)
const roleColors: Record<GrammarRole, string> = {
  subject: 'text-blue-400 border-b-2 border-blue-400',
  predicate: 'text-amber-400 border-b-2 border-amber-400',
  object: 'text-violet-400 border-b-2 border-violet-400',
}

/**
 * Render marked text with HTML spans
 */
function renderMarkedText(): string {
  const marked = props.analysis.markedText

  // Replace <role>content</role> with <span class="color">content</span>
  return marked
    .replace(/<subject>(.*?)<\/subject>/g, `<span class="${roleColors.subject}">$1</span>`)
    .replace(/<predicate>(.*?)<\/predicate>/g, `<span class="${roleColors.predicate}">$1</span>`)
    .replace(/<object>(.*?)<\/object>/g, `<span class="${roleColors.object}">$1</span>`)
}
</script>
