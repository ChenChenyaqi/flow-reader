<template>
  <div
    class="flex items-center justify-between px-4 py-3 bg-slate-950 border-b border-slate-800 cursor-move"
    @mousedown="$emit('startDrag', $event)"
  >
    <div class="flex items-center gap-2">
      <!-- Back button when in config mode -->
      <button
        v-if="showConfig"
        @click.stop="$emit('back')"
        class="text-slate-400 hover:text-slate-200 transition"
        :title="$t('common.cancel')"
      >
        <ChevronLeft :size="16" />
      </button>
      <div
        class="w-2 h-2 rounded-full"
        :class="showConfig ? 'bg-emerald-500' : 'bg-indigo-500 animate-pulse'"
      ></div>
      <span class="font-bold text-slate-200 text-sm">{{
        showConfig ? $t('config.llmConfig') : 'FluentRead'
      }}</span>
    </div>
    <div class="flex items-center gap-2">
      <!-- Collapse Toggle (only when not in config mode) -->
      <button
        v-if="!showConfig"
        @click.stop="$emit('toggleCollapse')"
        class="text-slate-400 hover:text-slate-200 transition"
        :title="isCollapsed ? $t('common.expand') : $t('common.collapse')"
      >
        <Minus
          v-if="!isCollapsed"
          :size="16"
        />
        <Plus
          v-else
          :size="16"
        />
      </button>
      <!-- Settings button (only when not in config mode) -->
      <button
        v-if="!showConfig"
        @click.stop="$emit('openConfig')"
        class="text-slate-400 hover:text-slate-200 transition"
        :title="$t('config.llmConfig')"
      >
        <Settings :size="16" />
      </button>
      <!-- Close button (hidden when in config mode) -->
      <button
        v-if="!showConfig"
        @click.stop="$emit('close')"
        :title="$t('common.close')"
        class="text-slate-400 hover:text-white transition"
      >
        <X :size="16" />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Minus, Plus, Settings, X, ChevronLeft } from 'lucide-vue-next'
defineProps<{
  showConfig: boolean
  isCollapsed: boolean
}>()

defineEmits<{
  (e: 'startDrag', $event: MouseEvent): void
  (e: 'openConfig'): void
  (e: 'toggleCollapse'): void
  (e: 'close'): void
  (e: 'back'): void
}>()
</script>
