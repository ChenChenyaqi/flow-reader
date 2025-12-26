<template>
  <div class="min-h-screen bg-slate-50 flex items-center justify-center">
    <div class="bg-white p-8 rounded shadow-md w-96">
      <h1 class="text-xl font-bold mb-4 text-slate-800">FluentLens Settings</h1>
      <label class="block mb-2 text-sm font-medium text-slate-600">OpenAI API Key</label>
      <input
        type="password"
        class="w-full border p-2 rounded mb-4"
        placeholder="sk-..."
      />
      <button class="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700">Save</button>
    </div>
  </div>
</template>

<script setup lang="ts"></script>
