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
    chrome.storage.local.set({ isActive }, () => {
      chrome.action.setIcon({
        path: isActive ? "logo/active_logo.png" : "logo/inactive_logo.png",
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
                files: ["utils.js", "content.js"],
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
                files: ["utils.js"],
                world: "MAIN",
              }, ()=>{
chrome.scripting.executeScript({
              target: { tabId: tab.id },
              func: () => {
                window.cleanUp();
                window.rlcDevHelperLoaded = false;
              },
              world: "MAIN",
              }, () => {
              isProcessing = false;
            });
          }
        );
      }
  )}});
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
        path: "logo/inactive_logo.png",
        tabId: tabId,
      });
      chrome.scripting.removeCSS(
        {
          target: { tabId: tabId },
          files: ["style.css"],
        },
        () => {
          chrome.scripting.executeScript({
          target: { tabId: tabId },
          files: ["utils.js"],
          world: "MAIN",
        }, () => {
          chrome.scripting.executeScript({
            target: { tabId: tabId },
            func: () => {
              window.cleanUp();
              // if (typeof window.cleanUp === "function") {
              //   window.cleanUp();
              // } else {
              //   // Fallback cleanup
              //   const elements = document.querySelectorAll(
              //     ".rlc-dev-helper, .rlc-info-container, .rlc-dev-color-container, " +
              //     ".rlc-dev-video-container, .rlc-dev-missing-image-container, .rlc-dev-missing-img"
              //   );
              //   elements.forEach(el => el.remove());
              //   document.querySelectorAll(".rlc-carousel-dev-z-index").forEach(el => {
              //     el.style.zIndex = "";
              //     el.classList.remove("rlc-carousel-dev-z-index");
              //   });
              //   document.removeEventListener("click.rlcDevHelper");
              //   document.removeEventListener("mouseover.rlcDevHelper");
              //   document.removeEventListener("mouseout.rlcDevHelper");
              // }
              window.rlcDevHelperLoaded = false;
            },
            world: "MAIN",
          });
        });
        }
      );
    });
  }
});
