import { createApp } from 'vue'
import ContentApp from './ContentApp.vue'
import tailwindContent from '../assets/tailwind.css?inline' // 引入样式，Vite 会处理它

// 创建宿主元素
const host = document.createElement('div')
host.id = 'fluent-lens-host'
document.body.appendChild(host)

// 创建 Shadow DOM
const shadow = host.attachShadow({ mode: 'open' })
const style = document.createElement('style')
style.textContent = tailwindContent
shadow.appendChild(style)

// 创建 Vue 挂载点
const appContainer = document.createElement('div')
appContainer.id = 'app'
shadow.appendChild(appContainer)

// 关键：将 Vite 注入的 style 移动到 Shadow DOM 中
// 注意：在开发模式下，Vite 可能会把 style 注入到 head。
// CRXJS 处理大部分样式注入，但为了保险起见，我们需要确保 Shadow DOM 能读取到 Tailwind 样式
// 在生产构建中，import css 会生成独立的 css 文件，CRXJS 会自动处理 content_scripts 的 css 注入
// 但 Shadow DOM 隔离了外部 CSS，所以我们需要手动 Adopt 或者插入 style 标签。

// 简单方案：在这个 MVP 阶段，我们让 Vue 组件自己负责样式（通过 style 标签），
// 或者手动创建一个 style 标签把 tailwind.css 的内容塞进去。
// 由于是脚手架，我们先挂载 Vue。

const app = createApp(ContentApp)
app.mount(appContainer)

console.log('FluentLens Content Script Injected')
