// Content script for FluentLens
// This script is injected into web pages

console.log('FluentLens content script loaded')

// Inject styles
function injectStyles() {
  const styleId = 'fluent-lens-styles'

  // Avoid injecting duplicate styles
  if (document.getElementById(styleId)) {
    return
  }

  const style = document.createElement('style')
  style.id = styleId
  style.textContent = `
    .fluent-lens-overlay {
      position: fixed;
      z-index: 999999;
    }
  `
  document.head.appendChild(style)
}

// Initialize the lens overlay
function init() {
  console.log('Initializing FluentLens overlay')
  injectStyles()
  // TODO: Implement lens overlay initialization
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init)
} else {
  init()
}
