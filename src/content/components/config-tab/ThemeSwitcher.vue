<script setup lang="ts">
import { ref, computed } from 'vue'
import { useTheme } from '@/content/composables/useTheme'
import type { ThemeMode } from '@/shared/types/theme'

const { currentTheme, setTheme } = useTheme()
const changing = ref(false)

const THEME_OPTIONS: { value: ThemeMode; label: string }[] = [
  { value: 'light', label: 'theme.light' },
  { value: 'dark', label: 'theme.dark' },
]

const currentThemeValue = computed({
  get: () => currentTheme.value,
  set: async (value: ThemeMode) => {
    if (value === currentTheme.value) return

    changing.value = true
    try {
      await setTheme(value)
    } finally {
      changing.value = false
    }
  },
})
</script>

<template>
  <div class="flex items-center gap-2">
    <label
      for="theme-select"
      class="text-[0.75rem] font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider"
    >
      {{ $t('config.theme') }}:
    </label>
    <select
      id="theme-select"
      v-model="currentThemeValue"
      :disabled="changing"
      class="px-3 py-2 rounded-lg border bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-200 text-sm border-gray-300 dark:border-slate-700 cursor-pointer transition-colors focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed hover:border-gray-400 dark:hover:border-slate-600 hover:not(:disabled)"
    >
      <option
        v-for="option in THEME_OPTIONS"
        :key="option.value"
        :value="option.value"
        class="bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-200"
      >
        {{ $t(option.label) }}
      </option>
    </select>
  </div>
</template>
