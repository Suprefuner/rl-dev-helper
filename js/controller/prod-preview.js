let previewPopup = document.getElementById("rlc-dev-prod-preview-popup");
let lastestImgUrl = "";

if (!previewPopup) {
  previewPopup = document.createElement("div");
  previewPopup.id = "rlc-dev-prod-preview-popup";
  previewPopup.innerHTML = `
    <div class="rlc-preview-popup-msg">
    </div>

    <div class="rlc-product-container">
      <div class="rlc-dev-prod-no"></div>
      <div class="rlc-dev-prod-color"></div>
      <div class="rlc-dev-prod-color-container"></div>
      <img src="" alt="" class="rlc-product-image">
    </div>
  `;
  document.body.appendChild(previewPopup);
}

let currentAbortSignalId = null;

document.addEventListener("mouseover", (e) => {
  const isInContentAsset = e.target.closest(".content-asset");
  if (!isInContentAsset) {
    hidePreviewPopup();
    return;
  }

  const link = e.target.closest("a");

  if (!link || (!link.href.includes("dwvar") && !/\d{4,}\.html/.test(link))) {
    if (previewPopup.style.display === "block") {
      hidePreviewPopup();
    }
    return;
  }

  if(link && !link.href.includes("dwvar")) {
    if (previewPopup.style.display === "block") {
      hidePreviewPopup();
    }
    return
  }

  if(link.closest('.notinstock') || link.closest('.notorderable')) {
    updatePreviewPopupMsg("Not available")
    return;
  }

  const newSignalId = Date.now().toString();
  currentAbortSignalId = newSignalId;

  previewPopup.style.left = `${e.clientX}px`;
  previewPopup.style.top = `${e.pageY + 15}px`;

  if (link.href !== lastestImgUrl) {
    previewPopup.querySelector("img").src = "";
    updatePreviewPopupMsg("Loading...");
    lastestImgUrl = link.href;
  }

  previewPopup.style.display = "block";
  const prodNo = link.href.split(".html")[0].split("-").at(-1);

  chrome.runtime.sendMessage(
    {
      action: "fetchPreview",
      url: link.href,
      signalId: newSignalId,
    },
    (response) => {
      if (currentAbortSignalId !== newSignalId) return

      if (response && response.success) {
        const parser = new DOMParser();
        const doc = parser.parseFromString(response.html, "text/html");

        const img = doc.querySelector(
          '#pdpMain .pdp-top-cont .pdp-left-col .pdp-top-left .swiper-slide[data-slideindex="0"] img',
        );
        let imgUrl = img?.getAttribute("data-img");

        const prodColors = doc.querySelector(".js-attribute-wrapper.colorname");
        const selectedProdColor = doc.querySelector(".selected .js-variation-link").getAttribute('data-selected')
        const prodClrsContainer = previewPopup.querySelector(".rlc-dev-prod-color-container");

        if (prodColors && prodClrsContainer) {
          const clonedElement = document.importNode(prodColors, true);

          prodClrsContainer.innerHTML = "";
          prodClrsContainer.appendChild(clonedElement);
        }

        if (imgUrl) {
          if (imgUrl.startsWith("/")) {
            const origin = new URL(url).origin;
            imgUrl = origin + imgUrl;
          }
          previewPopup.querySelector(".rlc-product-image").src = imgUrl;
          previewPopup.querySelector(".rlc-dev-prod-no").innerHTML = `PID: ${prodNo}`;
          previewPopup.querySelector(".rlc-dev-prod-color").innerHTML = `Color: ${selectedProdColor}`;
        } else {
          updatePreviewPopupMsg("No image found");
        }
      } else {
        updatePreviewPopupMsg("Failed to load");
      }
    },
  );
});

document.addEventListener("mousemove", (e) => {
  if (previewPopup.style.display === "block") {
    const offset = 20;
    const popupWidth = 240;
    const windowWidth = window.innerWidth;

    let leftPos = e.pageX + offset;

    if (e.clientX + offset + popupWidth > windowWidth) {
      leftPos = e.pageX - popupWidth;
    }

    let topPos = e.pageY + offset;

    previewPopup.style.left = leftPos + "px";
    previewPopup.style.top = topPos + "px";
  }
});

document.addEventListener("mouseleave", (e) => {
  if (e.target.tagName === "A") {
    // hidePreviewPopup()
  }
});

function updatePreviewPopupMsg(msg) {
  previewPopup.querySelector(".rlc-preview-popup-msg").innerHTML = msg;
}

function hidePreviewPopup() {
  previewPopup.style.display = "none";
  previewPopup.querySelector(".rlc-product-image").src = "";
}
