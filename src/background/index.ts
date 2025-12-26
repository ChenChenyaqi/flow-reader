console.log("FluentLens Background Service Worker Running...");

// 监听安装事件
chrome.runtime.onInstalled.addListener(() => {
  console.log("FluentLens Installed");
});
