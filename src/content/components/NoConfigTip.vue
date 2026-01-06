<template>
  <div class="p-5">
    <div class="bg-amber-950/30 border border-amber-900 rounded-lg p-4">
      <div class="flex items-start gap-3">
        <div class="text-amber-400 mt-0.5">
          <AlertTriangle :size="16" />
        </div>
        <div>
          <p class="text-amber-200 text-sm font-medium">{{ $t('error.noApiKey') }}</p>
          <p class="text-amber-300/70 text-xs mt-1">
            {{ $t('error.invalidConfig') }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { AlertTriangle } from 'lucide-vue-next'
</script>
