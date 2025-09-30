function cleanUp() {
  $(".rlc-dev-helper").remove();
  $(".rlc-info-container").remove();
  $(".rlc-dev-color-container").remove();
  $(".rlc-dev-video-container").remove();
  $(".rlc-dev-missing-image-container").remove();
  $(".rlc-dev-missing-img").removeAttr("id");

  $(document).off(".rlcDevHelper");
  
  window._rlcDevHelper = false

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

  if (!fontFamily.toLowerCase().includes(",")) {
    isCorrectFontFamily = false;
  }

  if (!isCorrectFontFamily) {
    fontFamily = `<span class='rlc-dev-err'>${fontFamily}</span>`;
  }

  return `
   ◻️ family: ${fontFamily} <br>
   ◻️ size: ${window.getComputedStyle(el).getPropertyValue("font-size")} <br>
   ◻️ weight: ${window.getComputedStyle(el).getPropertyValue("font-weight")}
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

function getImageName(imgUrl){
  return imgUrl
    ? imgUrl.split('/').at(-1)
    : ""
}

// MARK: svg path 
function getIconPath(icon){
  if(icon === 'copy'){
    return `<path class='rlc-icon--default' d="M288 64C252.7 64 224 92.7 224 128L224 384C224 419.3 252.7 448 288 448L480 448C515.3 448 544 419.3 544 384L544 183.4C544 166 536.9 149.3 524.3 137.2L466.6 81.8C454.7 70.4 438.8 64 422.3 64L288 64zM160 192C124.7 192 96 220.7 96 256L96 512C96 547.3 124.7 576 160 576L352 576C387.3 576 416 547.3 416 512L416 496L352 496L352 512L160 512L160 256L176 256L176 192L160 192z"/>`
  }


  if(icon === 'success'){
    return `<path class='rlc-icon--success' d="M530.8 134.1C545.1 144.5 548.3 164.5 537.9 178.8L281.9 530.8C276.4 538.4 267.9 543.1 258.5 543.9C249.1 544.7 240 541.2 233.4 534.6L105.4 406.6C92.9 394.1 92.9 373.8 105.4 361.3C117.9 348.8 138.2 348.8 150.7 361.3L252.2 462.8L486.2 141.1C496.6 126.8 516.6 123.6 530.9 134z"/>`
  }

  if(icon === 'close') {
    return `<path d="M183.1 137.4C170.6 124.9 150.3 124.9 137.8 137.4C125.3 149.9 125.3 170.2 137.8 182.7L275.2 320L137.9 457.4C125.4 469.9 125.4 490.2 137.9 502.7C150.4 515.2 170.7 515.2 183.2 502.7L320.5 365.3L457.9 502.6C470.4 515.1 490.7 515.1 503.2 502.6C515.7 490.1 515.7 469.8 503.2 457.3L365.8 320L503.1 182.6C515.6 170.1 515.6 149.8 503.1 137.3C490.6 124.8 470.3 124.8 457.8 137.3L320.5 274.7L183.1 137.4z"/>`
  }
}

function checkHasError(target){
  return !!$(target).length
}