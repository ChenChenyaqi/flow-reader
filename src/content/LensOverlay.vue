<template>
  <div class="fluent-lens-container text-base font-sans antialiased text-slate-800">
    <!-- 1. 悬浮触发图标 (Floating Trigger Icon) -->
    <!-- 使用 fixed 定位，根据计算出的 left/top 显示 -->
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0 scale-75"
      enter-to-class="opacity-100 scale-100"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100 scale-100"
      leave-to-class="opacity-0 scale-75"
    >
      <button
        v-if="showIcon"
        @mousedown.stop.prevent="handleIconClick"
        class="fixed z-[999999] group flex items-center justify-center w-8 h-8 bg-slate-900 hover:bg-indigo-600 rounded-lg shadow-lg cursor-pointer transition-colors border border-slate-700/50"
        :style="{
          left: `${iconPosition.x}px`,
          top: `${iconPosition.y}px`,
        }"
      >
        <!-- Logo Icon (简化的闪电/透镜图标) -->
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          class="text-white group-hover:scale-110 transition-transform"
        >
          <path d="M2 12h20"></path>
          <path d="M20 12v6a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-6"></path>
          <path d="M12 2L2 12h20L12 2z"></path>
        </svg>
      </button>
    </Transition>

    <!-- 2. 内容卡片 (Main Card) -->
    <!-- 暂时居中显示，或者跟随位置。这里为了展示清晰，采用类似 Modal 的居中显示，背景透明 -->
    <Transition
      enter-active-class="transition duration-300 ease-out"
      enter-from-class="opacity-0 translate-y-4"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition duration-200 ease-in"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 translate-y-4"
    >
      <div
        v-if="showCard"
        class="fixed z-[999999] w-[400px] bg-slate-900 rounded-xl shadow-2xl border border-slate-700 overflow-hidden flex flex-col"
        :style="{
          left: `${cardPosition.x}px`,
          top: `${cardPosition.y}px`,
        }"
      >
        <!-- Card Header -->
        <div
          class="flex items-center justify-between px-4 py-3 bg-slate-950 border-b border-slate-800"
        >
          <div class="flex items-center gap-2">
            <div class="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></div>
            <span class="font-bold text-slate-200 text-sm">FluentLens</span>
          </div>
          <button
            @click="closeCard"
            class="text-slate-400 hover:text-white transition"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <line
                x1="18"
                y1="6"
                x2="6"
                y2="18"
              ></line>
              <line
                x1="6"
                y1="6"
                x2="18"
                y2="18"
              ></line>
            </svg>
          </button>
        </div>

        <!-- Card Body -->
        <div class="p-5 max-h-[60vh] overflow-y-auto">
          <div class="mb-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
            Selected Content
          </div>

          <!-- 显示选中的文本 -->
          <div
            class="text-slate-300 text-lg leading-relaxed font-serif bg-slate-800/50 p-3 rounded border-l-4 border-indigo-500"
          >
            {{ selectionText }}
          </div>
        </div>

        <!-- Card Footer (Placeholder) -->
        <div
          class="px-4 py-3 bg-slate-950/50 border-t border-slate-800 text-xs text-slate-500 flex justify-between"
        >
          <span>Length: {{ selectionText.length }} chars</span>
          <span class="text-indigo-400">Analysis Pending...</span>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

// --- State ---
const showIcon = ref(false)
const showCard = ref(false)
const selectionText = ref('')
const iconPosition = ref({ x: 0, y: 0 })
const cardPosition = ref({ x: 0, y: 0 })

// --- Event Handlers ---

// 1. 监听鼠标抬起：判断是否有划词
const handleMouseUp = () => {
  // 稍微延迟，确保选区对象已生成
  setTimeout(() => {
    // 如果卡片已经打开，暂时不处理新的划词，或者你可以选择关闭旧卡片
    if (showCard.value) return

    const selection = window.getSelection()
    const text = selection?.toString().trim()

    if (text && text.length > 0) {
      selectionText.value = text

      // 计算选区的位置
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0)
        const rect = range.getBoundingClientRect()

        // 设置图标位置：选区的右下角
        // 加上 scrollX/Y 是为了绝对定位，但这里使用了 fixed 定位，所以直接用 client rect
        iconPosition.value = {
          x: rect.right + 10, // 右侧偏移 10px
          y: rect.bottom + 10, // 下方偏移 10px
        }

        // 防止图标溢出屏幕右侧/底部
        const viewportWidth = window.innerWidth
        if (iconPosition.value.x > viewportWidth - 50) {
          iconPosition.value.x = rect.left // 如果太靠右，就放到左边
        }

        showIcon.value = true
      }
    } else {
      // 只是普通点击，没有选中文本 -> 隐藏图标
      // 注意：这里不要隐藏卡片，只有点击卡片外部才隐藏卡片
      showIcon.value = false
    }
  }, 10)
}

// 2. 监听鼠标按下：处理“点击网页空白处”
const handleMouseDown = (e: MouseEvent) => {
  // 检查点击目标是否是我们 Shadow DOM 内部的元素
  // 这里的 e.target 在 Document 层面通常指向 Shadow Host 元素
  const shadowHost = document.getElementById('fluent-lens-host')

  if (e.target === shadowHost) {
    // 点击的是我们插件的 UI，不做任何处理，交给 Vue 内部事件
    return
  }

  // 点击的是网页其他区域 -> 隐藏图标
  showIcon.value = false
  // (可选) 如果你希望点击网页空白处关闭卡片，取消下面注释
  // showCard.value = false;
}

// 3. 点击图标
const handleIconClick = () => {
  showIcon.value = false

  // 设置卡片位置 (稍微偏离一点图标位置，或者居中)
  // 这里做一个简单的自适应定位
  const viewportWidth = window.innerWidth
  const viewportHeight = window.innerHeight

  let x = iconPosition.value.x
  let y = iconPosition.value.y + 20

  // 简单的边界检查
  if (x + 400 > viewportWidth) x = viewportWidth - 420
  if (y + 300 > viewportHeight) y = viewportHeight - 320

  cardPosition.value = { x, y }
  showCard.value = true
}

// 4. 关闭卡片
const closeCard = () => {
  showCard.value = false
  // 清空选区 (可选)
  window.getSelection()?.removeAllRanges()
}

// --- Lifecycle ---
onMounted(() => {
  document.addEventListener('mouseup', handleMouseUp)
  document.addEventListener('mousedown', handleMouseDown)
})

onUnmounted(() => {
  document.removeEventListener('mouseup', handleMouseUp)
  document.removeEventListener('mousedown', handleMouseDown)
})
</script>
