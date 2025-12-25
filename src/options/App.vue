<template>
  <div class="min-w-[320px] p-6 bg-slate-900 text-white">
    <h1 class="text-xl font-bold mb-4 text-primary">FluentLens</h1>
    <p class="text-sm text-gray-300 mb-6">Turn Passive Reading into Active Fluency</p>

    <div class="space-y-4">
      <div>
        <label class="block text-sm font-medium mb-2">OpenAI API Key</label>
        <input
          type="password"
          class="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          placeholder="sk-..."
        />
      </div>

      <div>
        <label class="block text-sm font-medium mb-2">Persona</label>
        <select class="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary">
          <option value="general">General</option>
          <option value="tech">Technology</option>
          <option value="finance">Finance</option>
          <option value="medical">Medical</option>
          <option value="legal">Legal</option>
        </select>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Options page component
console.log('FluentLens options page loaded')
</script>
