let isProcessing = false;

const whitelist = [
  "https://staging-*.sfcc-ralphlauren-*.com/*",
  "https://staging-*-sterling.sfcc-ralphlauren-eu.com/*",
  "https://www.ralphlauren.com*",
  "https://www.ralphlauren.co.jp*",
  "https://www.ralphlauren.co.kr*",
];

function isValidUrl(url, list) {
  return list.some((pattern) => {
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
    console.log({isActive})
    chrome.storage.local.set({ isActive }, () => {
      chrome.action.setIcon({
        path: isActive ? "../assets/images/logo/active_logo.png" : "../assets/images/logo/inactive_logo.png",
        tabId: tab.id,
      });

      if (isActive) {
        chrome.scripting.insertCSS(
          {
            target: { tabId: tab.id },
            files: ["style.css"],
          },
          () => {
            chrome.scripting.executeScript(
              {
                target: { tabId: tab.id },
                files: [
                  "js/utils.js",
                  "js/controller/dev-item.js",
                  "js/controller/id.js",
                  "js/controller/font.js",
                  "js/controller/image.js",
                  "js/controller/video.js",
                  "js/controller/prod-color.js",
                  "js/controller/missing-img.js",
                  "js/controller/ca.js",
                  "js/config.js",
                  "js/content.js",
                ],
                world: "MAIN",
              },
              () => {
                isProcessing = false;
              }
            );
          }
        );
      } else {
        chrome.scripting.removeCSS(
          {
            target: { tabId: tab.id },
            files: ["style.css"],
          },
          () => {
            chrome.scripting.executeScript(
              {
                target: { tabId: tab.id },
                files: ["js/utils.js"],
                world: "MAIN",
              },
              () => {
                chrome.scripting.executeScript(
                  {
                    target: { tabId: tab.id },
                    func: () => {
                      window.cleanUp();
                      window.rlcDevHelperLoaded = false;
                    },
                    world: "MAIN",
                  },
                  () => {
                    isProcessing = false;
                  }
                );
              }
            );
          }
        );
      }
    });
  });
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (
    changeInfo.status === "complete" &&
    tab.active &&
    isValidUrl(tab.url, whitelist)
  ) {
    chrome.storage.local.set({ isActive: false }, () => {
      chrome.action.setIcon({
        path: "../assets/images/logo/inactive_logo.png",
        tabId: tabId,
      });
      chrome.scripting.removeCSS(
        {
          target: { tabId: tabId },
          files: ["style.css"],
        },
        () => {
          chrome.scripting.executeScript(
            {
              target: { tabId: tabId },
              files: ["js/utils.js"],
              world: "MAIN",
            },
            () => {
              chrome.scripting.executeScript({
                target: { tabId: tabId },
                func: () => {
                  window.cleanUp();
                  window.rlcDevHelperLoaded = false;
                },
                world: "MAIN",
              });
            }
          );
        }
      );
    });
  }
});
