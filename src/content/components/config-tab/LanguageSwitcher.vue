<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { LOCALE_OPTIONS, type SupportedLocale } from '@/shared/i18n/types'
import { changeLocale } from '@/shared/i18n'

const { locale } = useI18n()
const changing = ref(false)

const currentLocale = computed({
  get: () => locale.value as SupportedLocale,
  set: async (value: SupportedLocale) => {
    if (value === locale.value) return

    changing.value = true
    try {
      await changeLocale(value)
    } finally {
      changing.value = false
    }
  },
})
</script>

<template>
  <div class="flex items-center gap-2">
    <label
      for="locale-select"
      class="text-[0.75rem] font-bold text-slate-400 uppercase tracking-wider"
    >
      {{ $t('config.language') }}:
    </label>
    <select
      id="locale-select"
      v-model="currentLocale"
      :disabled="changing"
      class="px-3 py-2 rounded-lg border bg-slate-800 text-slate-200 text-sm border-slate-700 cursor-pointer transition-colors focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed hover:border-slate-600 hover:not(:disabled)"
    >
      <option
        v-for="option in LOCALE_OPTIONS"
        :key="option.value"
        :value="option.value"
        class="bg-slate-800 text-slate-200"
      >
        {{ option.nativeName }}
      </option>
    </select>
  </div>
</template>
