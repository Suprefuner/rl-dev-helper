function cleanUp() {
  $(".rlc-dev-helper").remove();
  $(".rlc-ab-container").remove();
  $(".rlc-dev-color-container").remove();
  $(".rlc-dev-video-container").remove();
  $(".rlc-dev-missing-image-container").remove();
  $(".rlc-dev-missing-img").removeAttr("id");

  $(document).off(".rlcDevHelper");
  
  window.isPLP = undefined;
  window.caid = undefined;
  window.devHelperState = undefined;
  window.helperList = undefined;

  removeZIndexFromCarousel();
}

function getCSSInt(el, prop) {
  return parseInt($(el).css(prop));
}

function getFontDetails(el) {
  const lang = $("html").attr("lang").split("_")[0].toLowerCase();
  let isCorrectFontFamily = true;
  let fontFamily = window.getComputedStyle(el).getPropertyValue("font-family");

  if (lang === "en") {
    if (
      fontFamily.toLowerCase().includes("tc") ||
      fontFamily.toLowerCase().includes("kr") ||
      fontFamily.toLowerCase().includes("hiragino")
    ) {
      isCorrectFontFamily = false;
    }
  }

  if (lang === "ko") {
    if (!fontFamily.toLowerCase().includes("kr")) {
      isCorrectFontFamily = false;
    }
  }

  if (lang === "ja") {
    if (!fontFamily.toLowerCase().includes("hiragino")) {
      isCorrectFontFamily = false;
    }
  }

  if (lang === "zh") {
    if (!fontFamily.toLowerCase().includes("tc")) {
      isCorrectFontFamily = false;
    }
  }

  if (!isCorrectFontFamily) {
    fontFamily = `<span class='rlc-dev-err'>${fontFamily}</span>`;
  }

  return `
   ◻️ family: ${fontFamily} <br>
   ◻️ size: ${window.getComputedStyle(el).getPropertyValue("font-size")}
  `;
}

function addPositionToEl(el) {
  if ($(el).css("position") !== "static" || $(el).hasClass("rlc-textgroup-in"))
    return;
  $(el).css("position", "relative");
}

function showOverflow(el) {
  $(el).addClass("rlc-show-overflow");
}

function hideOverflow() {
  $(".rlc-show-overflow").removeClass("rlc-show-overflow");
}

function addZIndexToCarousel(el) {
  const carouselEl = $(el).closest(".rlc-carousel");
  if (
    !carouselEl ||
    carouselEl.find(".rlc-carousel-dev-z-index").length ||
    carouselEl.find(".rlc-slide .rlc-background").length
  )
    return;

  carouselEl.find(".rlc-slide").each((i, slide) => {
    $(slide).addClass("rlc-carousel-dev-z-index");
    $(slide).css("z-index", `-${i + 1}`);
  });
}

function removeZIndexFromCarousel() {
  $(".rlc-carousel-dev-z-index")
    .removeAttr("style")
    .removeClass("rlc-carousel-dev-z-index");
}

async function copy(content, target, callback = () => {}) {
  try {
    await navigator.clipboard.writeText(content);
    target.attr("data-state", "success");
    setTimeout(() => target.removeAttr("data-state"), 1000);
    callback();
  } catch (error) {
    console.log("something went wrong to copy");
  }
}
