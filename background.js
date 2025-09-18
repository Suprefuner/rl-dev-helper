let isProcessing = false;

const whitelist = [
  "https://staging-*.sfcc-ralphlauren-*.com/*",
  "https://staging-*-sterling.sfcc-ralphlauren-eu.com/*",
  "https://www.ralphlauren.com*",
  "https://www.ralphlauren.co.jp*",
  "https://www.ralphlauren.co.kr*",
];

function isValidUrl(url, list) {
  return list.some(pattern => {
    const regex = new RegExp("^" + pattern.replace(/\*/g, ".*") + "$");
    return regex.test(url);
  });
}

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.set({ isActive: false });
});

chrome.action.onClicked.addListener((tab) => {
  if (isProcessing || !isValidUrl(tab.url, whitelist)) return;
  isProcessing = true;

  chrome.storage.local.get(["isActive"], (result) => {
    const isActive = !result.isActive;
    chrome.storage.local.set({ isActive }, () => {
      chrome.action.setIcon({
        path: isActive ? "active_logo.png" : "inactive_logo.png",
        tabId: tab.id,
      });

      if (isActive) {
        chrome.scripting.insertCSS({
          target: { tabId: tab.id },
          files: ["style.css"],
        }, () => {
          chrome.scripting.executeScript({
            target: { tabId: tab.id },
            files: ["jquery-3.7.1.min.js", "content.js"],
          }, () => {
            isProcessing = false;
          });
        })
      } else {
        chrome.scripting.removeCSS({
          target: { tabId: tab.id },
          files: ["styles.css"],
        }, () => {
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
        })
      }
    });
  });
  
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  // if (changeInfo.status === "complete" && tab.active && isValidUrl(tab.url)) {
  if (changeInfo.status === "complete" && tab.active && isValidUrl(tab.url, whitelist)) {
    chrome.storage.local.set({ isActive: false }, () => {
      chrome.action.setIcon({
        path: "inactive_logo.png",
        tabId: tabId,
      });
      chrome.scripting.removeCSS({
        target: { tabId: tabId },
        files: ["styles.css"],
      }, () => { 
        chrome.scripting.executeScript({
        target: { tabId: tabId },
          func: () => {
            if (typeof window.cleanUp === "function") {
              window.cleanUp();
            }
            window.rlcDevHelperLoaded = false;
          },
        });
      })
    });
  }
});