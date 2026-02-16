/// <reference types="vite/client" />
/// <reference types="vitest/globals" />

// Vue component type declaration
declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<object, object, unknown>
  export default component
}

declare module '*.css?inline' {
  const content: string
  export default content
}

declare module '*.css' {
  const content: string
  export default content
}
