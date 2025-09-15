let isProcessing = false;

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.set({ isActive: false });
});

chrome.action.onClicked.addListener((tab) => {
  if (isProcessing) return;
  isProcessing = true;

  chrome.storage.local.get(["isActive"], (result) => {
    const isActive = !result.isActive;
    chrome.storage.local.set({ isActive }, () => {
      chrome.action.setIcon({
        path: isActive ? "active_logo.png" : "inactive_logo.png",
        tabId: tab.id,
      });

      if (isActive) {
        chrome.scripting.executeScript({
          target: { tabId: tab.id },
          files: ["jquery-3.7.1.min.js", "content.js"],
        }, () => {
          isProcessing = false;
        });
      } else {
        chrome.scripting.executeScript({
          target: { tabId: tab.id },
          func: () => {
            if (typeof window.cleanUp === "function") {
              window.cleanUp();
            }
            window.rlcDevHelperLoaded = false;
          },
        }, () => {
          isProcessing = false;
        });
      }
    });
  });
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === "complete" && tab.active) {
    chrome.storage.local.set({ isActive: false }, () => {
      chrome.action.setIcon({
        path: "inactive_logo.png",
        tabId: tabId,
      });
      chrome.scripting.executeScript({
        target: { tabId: tabId },
        func: () => {
          if (typeof window.cleanUp === "function") {
            window.cleanUp();
          }
          window.rlcDevHelperLoaded = false;
        },
      });
    });
  }
});