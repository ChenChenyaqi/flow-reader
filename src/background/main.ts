// Background service worker for FluentLens
// This script runs in the background and handles API proxy calls

console.log('FluentLens background service worker initialized')

// Listen for messages from content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('Background received message:', message)

  // Handle different message types
  if (message.type === 'API_REQUEST') {
    // TODO: Implement API proxy logic
    sendResponse({ success: true, data: null })
  }

  return true
})
