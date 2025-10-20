if (!window._rlcDevHelper) {
  window._rlcDevHelper = true;

  window.isPLP = !!$(".plp-content-slot").length;

  window.caid = window.isPLP
    ? ":where(.plp-content-slot, .ingrid)"
    : "#main .open-html-content:has(.rlc-creative_v3)";

  window.devHelperState = {
    isShowingAB: false,
    isShowingFont: false,
    isShowingProdColor: false,
    isShowingVidUrl: false,
    isShowingMissingImages: true,
    isShowingImageInfo: false,
  };

  /*
    name: feature's name
    fn: feature's logic
    status: show | hide (default: hide)
    checkError: CSS selectors for .rlc-dev-err
    validation: validate if should run function when click
  */
  window.helperList = [
    {
      name: "CGID/PID",
      fn: "toggleID",
      checkError:
        ":where(a, .rlc-cta, .rlc-linecta, .rlc-pillbutton):has(.rlc-dev-err)",
    },
    {
      name: "font family",
      fn: "toggleFont",
      checkError: "*:not(a):has(>.rlc-info-container .rlc-dev-err)",
    },
    {
      name: "product colors",
      fn: toggleProdColor,
      validation: () => $('[data-action="normalswatchescolor"]').length,
    },
    {
      name: "video URL",
      fn: toggleVidUrl,
    },
    {
      name: "missing images",
      fn: toggleMissingImages,
      status: "show",
    },
    {
      name: "image info",
      fn: toggleImageInfo,
    },
  ];
}

// prevent multiple init
if (!$(".rlc-dev-helper").length) {
  helperButtonInit();
  helperInit();
  bindEvent();
}

function helperInit() {
  // generate CTA info container
  generateHotspotInfoContainer();
  generateBGLinkInfoContainer();
  generateCTAInfoContainer();
  generateNavLinkInfoContainer();
  // generateJumpLinkInfoContainer();
  generateQuickShopInfoContainer();

  // generate copy info container
  generateCopyGroupInfoContainer(window.caid);
  generateSingleCopyInfoContainer(window.caid);

  // generate missing image info container
  checkMissingImage(window.caid);

  // generate missing image name
  generateImageInfo(window.caid);

  // check if there is any video
  checkIfVid(window.caid);

  // hide info container at the beginning
  hideID();
  hideFont();
  hideMissingImages();
  hideImageName();
}

function helperButtonInit() {
  let container = $("body");

  // comment becoz append to plp will blocked by quick shop popup
  // if (window.isPLP) {
  //   container = $(".plp");
  // }

  container.append(`
      <div class="rlc-dev-helper" data-status="off">
        <button class="rlc-btn--dev">
          <img 
            class="rlc-image" 
            alt="Polo Ralph Lauren" 
            loading="lazy"
            src="https://staging-au.sfcc-ralphlauren-as.com/on/demandware.static/-/Library-Sites-RalphLauren_EU_Library/default/dwd5345650/img/Brand_Logo_Library/POLO/2021_polo_pony_navy.svg" />
        </button>
        <ul class="rlc-dev-menu">
          ${generateDevItems(window.helperList)}
        </ul>
      </div>
    `);
}

function bindEvent() {
  // main helper button
  $(document).on("click.rlcDevHelper", ".rlc-btn--dev", devBtnHandler);
  $(document).on("click.rlcDevHelper", ".rlc-dev-item", (e) =>
    devItemHandler(e, window.helperList)
  );

  // product color button
  $(document).on("click", ".rlc-dev-color-container", async function () {
    copy($(this).attr("data-color"), $(this));
  });

  // detect quick-shop popup
  const observer = new MutationObserver((mutationsList) => {
    for (const mutation of mutationsList) {
      if (mutation.type === "attributes" && mutation.target === document.body) {
        const toaster = $(mutation.target);
        const toasterCloseBtn = toaster.find(".rl-toaster-close");

        $(toasterCloseBtn).on("click.rlcDevHelper", toasterCloseBtnHandler);

        function toasterCloseBtnHandler() {
          if (!window.devHelperState.isShowingProdColor) return;

          $('.rlc-dev-item[data-index="2"]')[0].click();
          hideProdColor();
          window.devHelperState.isShowingProdColor = false;
          $(toasterCloseBtn).off("click.rlcDevHelper", toasterCloseBtnHandler);
        }
      }
    }
  });

  const documentBody = document.querySelector("body");

  observer.observe(documentBody, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ["class"],
  });

  // copy video JSON button
  $(document).on(
    "click",
    '.rlc-dev-video-container .rlc-dev-icon[data-action="copy"]',
    async function (e) {
      e.preventDefault();
      const parentEl = $(this).closest(".rlc-dev-video-container");
      const copyContent = $(parentEl).attr("data-video");
      copy(copyContent, $(this));
    }
  );

  // missing image button
  $(document).on("click.rlcDevHelper", ".rlc-dev-missing-image", function () {
    const missingImageItem = $(this);
    const id = $(this).attr("data-missing");
    const targetEl = $(`${id}`);

    $("html, body").animate(
      {
        scrollTop: targetEl.offset().top - 200,
      },
      500,
      function () {
        const isSwiper = !!targetEl.closest(".swiper-container").length;
        const isFadeSlider = !!targetEl.closest(".rlc-fadeslider2").length;
        const isAutoSlider = !!targetEl.closest(".rlc-autoslider").length;

        // different handle for swiper, fade slider and auto slider
        if (isSwiper) {
          const swiperEl = targetEl.closest(".swiper-container");
          const slideIndex = swiperEl
            .find(".rlc-slide")
            .index(swiperEl.find(`.rlc-slide:has(${id})`));

          swiperEl[0].swiper.slideTo(slideIndex, 300);
        }

        if (isFadeSlider) {
          const slider = targetEl.closest(".rlc-fadeslider2");
          const slide = targetEl.closest(".rlc-slide")[0];
          const sliderArrowBtn = slider.find(".rlc-carousel-arrow-right")[0];
          const sliderPauseBtn = slider.find(".rlc-looppause")[0];

          let isActiveSlide = $(slide).hasClass("rlc-active");
          const isPaused = slider.hasClass("user_paused");

          if (!isPaused) {
            sliderPauseBtn.click();
          }

          let clickInterval = setInterval(() => {
            isActiveSlide = $(slide).hasClass("rlc-active");

            !isActiveSlide
              ? sliderArrowBtn.click()
              : clearInterval(clickInterval);
          }, 100);
        }

        if (isAutoSlider) {
          const slider = targetEl.closest(".rlc-autoslider");
          const sliderWrapperEl = targetEl.closest(".rlc-in");
          const slideIndex = sliderWrapperEl
            .find(".rlc-slide")
            .index(sliderWrapperEl.find(`.rlc-slide:has(${id})`));
          const sliderPauseBtn = slider.find(".rlc-looppause")[0];

          if (!slider.hasClass("user_paused")) {
            sliderPauseBtn.click();
          }

          window.gsap
            .getTweensOf(sliderWrapperEl.find(".rlc-slide"))[0]
            .parent.toIndex(slideIndex, {
              duration: 0.8,
              ease: "power1.inOut",
            });
        }

        if (targetEl[0].naturalWidth === 0) return;

        removeMissingImageItemStyle(targetEl);
        missingImageItem.remove();

        if ($(".rlc-dev-missing-image").length) return;
        updateNoMissingImage();
      }
    );
  });

  // missing image container copy all button
  $(document).on(
    "click.rlcDevHelper",
    ".rlc-dev-missing-image-header .rlc-dev-copy-all",
    async function () {
      const missingImages = [...$(".rlc-dev-missing-img")]
        .map((img) => img.src || img.currentSrc)
        .join("\n");

      copy(missingImages, $(this));
    }
  );

  $(document).on(
    "click.rlcDevHelper",
    ".rlc-dev-missing-image-header .rlc-dev-check-again",
    function () {
      const currentPosition = $(window).scrollTop();

      $(".rlc-dev-missing-image").each((i, img) => {
        $(img).eq(0).click();
      });

      if ($(".rlc-dev-missing-image").length) return;
      updateNoMissingImage();
    }
  );

  $(document).on(
    "click.rlcDevHelper",
    ".rlc-dev-missing-image .rlc-dev-icon[data-action='copy']",
    async function () {
      const copyContent = $(this)
        .next()
        .find(".rlc-dev-missing-img-url")
        .text();

      copy(copyContent, $(this));
    }
  );

  // missing image container close button
  $(document).on(
    "click.rlcDevHelper",
    '.rlc-dev-icon[data-action="close"]',
    function () {
      $('.rlc-dev-item[data-index="4"]')[0].click();
    }
  );

  $(document).on("keyup.rlcDevHelper", function (e) {
    if (e.key === "`") {
      $(".rlc-btn--dev")[0].click();
      return;
    }

    const targetDevItem = +e.key;

    if (targetDevItem === "NaN") return;

    $(`.rlc-dev-item[data-index='${targetDevItem - 1}']`)
      ?.eq(0)
      .click();
  });
}

function toggleProdColor() {
  if (!$('[data-action="normalswatchescolor"]').length) return;

  window.devHelperState.isShowingProdColor ? hideProdColor() : showProdColor();
  window.devHelperState.isShowingProdColor =
    !window.devHelperState.isShowingProdColor;
}

function toggleVidUrl() {
  window.devHelperState.isShowingVidUrl ? hideVidUrl() : showVidUrl();
  window.devHelperState.isShowingVidUrl =
    !window.devHelperState.isShowingVidUrl;
}

function toggleMissingImages() {
  window.devHelperState.isShowingMissingImages
    ? hideMissingImages()
    : showMissingImages();
  window.devHelperState.isShowingMissingImages =
    !window.devHelperState.isShowingMissingImages;
}

// MARK: dev helper
function generateDevItems(list) {
  let html = "";
  list.forEach((item, i) => {
    const status = item?.status === "show";
    let hasError = false;

    if (item?.checkError) {
      const list = checkHasError(item.checkError).list;
      hasError = checkHasError(item.checkError).hasError;

      if (hasError) {
        const listNotUnderFlyout = [...list].filter(
          (el) => !$(el).closest(".rlc-flyout").length
        );

        hasError = !!listNotUnderFlyout.length;
      }
    }

    html += `
      <li 
        class="rlc-dev-item" 
        data-index="${i}" 
        data-status="${status ? "hide" : "show"}" 
        data-state="${status ? "on" : "off"}"
      >
          ${" " + item.name}
          ${hasError ? "🔴" : ""}
      </li>
    `;
  });
  return html;
}

function devBtnHandler(e) {
  if (!e.target.closest(".rlc-btn--dev")) return;

  const devToolContainer = $(e.target.closest(".rlc-dev-helper"));
  const isOn = devToolContainer.attr("data-status") === "on";
  devToolContainer.attr("data-status", isOn ? "off" : "on");

  function detectClickOutside(e) {
    if (e.target.closest(".rlc-dev-helper")) return;
    devToolContainer.attr("data-status", "off");
  }

  isOn
    ? $(document).off("click", detectClickOutside)
    : $(document).on("click", detectClickOutside);
}

function devItemHandler(e, helperList) {
  if (
    !e.target.closest(".rlc-dev-item") ||
    $(e.target.closest(".rlc-dev-item")).hasClass("rlc-disabled")
  )
    return;

  const index = $(e.target).attr("data-index");
  const item = helperList[index];
  const { fn, validation } = item;

  if (typeof fn !== "function" && typeof window[fn] !== "function") {
    return console.error(`Function ${fn} is not defined.`);
  }

  if (validation && !validation()) return;

  if (typeof fn === "function") {
    item.fn();
  }

  if (typeof window[fn] === "function") {
    window[fn]();
  }

  updateDevItemStatus(e.currentTarget);
  const isOn = $(e.target).attr("data-state") === "on";
  $(e.target).attr("data-state", isOn ? "off" : "on");
}

function updateDevItemStatus(el) {
  const isShow = $(el).attr("data-status") === "show";
  $(el).attr("data-status", isShow ? "hide" : "show");
}

// MARK: CGID/PID
function generateHotspotInfoContainer() {
  $(".rlc-hotspot").each((i, el) => {
    if (
      checkInfoContainerExist(el) ||
      shouldIgnoreLink(el) ||
      !$(el).attr("href")
    )
      return;

    addPositionToEl(el);

    let additionalCSS = 'style="';
    const slideParent = $(el).closest(".rlc-slide");

    additionalCSS += `--_max-width: min(${
      $(el)
        .closest(
          ":where(.rlc-copygroup, .rlc-copygroup-in, .rlc-textgroup, .rlc-textgroup-in, .rlc-product-tile, .rlc-50-50__block, .rlc-block)"
        )
        .width() - 60
    }px, 500px);`;

    if (slideParent.length) {
      if (getCSSInt(slideParent, "padding-left") > 0) {
        additionalCSS += `left: ${
          getCSSInt(slideParent, "padding-left") + 20
        }px;`;
      }

      if (slideParent.width() > $(window).width() / 1.2) {
        additionalCSS += `--_link-width: 500px;`;
      } else if (slideParent.width() > $(window).width() / 3) {
        additionalCSS += `--_link-width: ${
          slideParent.width() - 40 - getCSSInt(slideParent, "padding-right")
        }px;`;
      } else {
        additionalCSS += `--_link-width: calc(100% - 60px);`;
      }
    }

    additionalCSS += '"';

    $(el).html(createInfoContainer(getLinkID(el), additionalCSS));
  });

  $(".rlc-bg > a").each((i, el) => {
    if (
      checkInfoContainerExist(el) ||
      shouldIgnoreLink(el) ||
      !$(el).attr("href")
    )
      return;

    addPositionToEl(el);

    let additionalCSS = 'style="';
    const slideParent = $(el).closest(".rlc-slide");

    additionalCSS += `--_max-width: min(${
      $(el)
        .closest(
          ":where(.rlc-copygroup, .rlc-copygroup-in, .rlc-textgroup, .rlc-textgroup-in, .rlc-product-tile, .rlc-50-50__block, .rlc-block)"
        )
        .width() - 60
    }px, 500px);`;

    if (slideParent.length) {
      if (getCSSInt(slideParent, "padding-left") > 0) {
        additionalCSS += `left: ${
          getCSSInt(slideParent, "padding-left") + 20
        }px;`;
      }

      if (slideParent.width() > $(window).width() / 1.2) {
        additionalCSS += `--_link-width: 500px;`;
      } else if (slideParent.width() > $(window).width() / 3) {
        additionalCSS += `--_link-width: ${
          slideParent.width() - 40 - getCSSInt(slideParent, "padding-right")
        }px;`;
      } else {
        additionalCSS += `--_link-width: calc(100% - 60px);`;
      }
    }

    additionalCSS += '"';

    $(el).append(createInfoContainer(getLinkID(el), additionalCSS));
  });
}

function generateBGLinkInfoContainer() {
  $(".rlc-bg_link").each((i, el) => {
    if (checkInfoContainerExist(el) || shouldIgnoreLink(el)) return;
    addPositionToEl(el);

    const slideParent = $(el).closest(".rlc-slide");

    let additionalCSS = 'style="';
    if (slideParent.length) {
      $(el).css(
        "--_max-width",
        `${
          slideParent.width() - getCSSInt(slideParent, "padding-right") - 40
        }px`
      );
    }
    additionalCSS = '"';
    $(el).append(createInfoContainer(getLinkID(el), additionalCSS));
  });
}

function generateCTAInfoContainer() {
  $(
    ".rlc-copygroup, .rlc-textgroup, .rlc-links, .rlc-back-arrow-group, .rlc-ul, .rlc-back-cta"
  ).each((i, linksContainer) => {
    if (checkInfoContainerExist(linksContainer)) return;

    const isTooManyLinks = checkTooManyLinks(linksContainer);

    if (isTooManyLinks) {
      let html = "";
      let CTAFont = "";
      let ctaList = $(linksContainer).hasClass("rlc-ul")
        ? $(linksContainer).find(".rlc-pillbutton, .rlc-linecta, a")
        : $(linksContainer).children(".rlc-pillbutton, .rlc-linecta, a");

      ctaList.each((i, el) => {
        if (shouldIgnoreLink(el)) return;
        const fontFamily = getFontDetails(el);
        const isSameFont = CTAFont === fontFamily;

        if (!isSameFont) {
          CTAFont = fontFamily;
        }

        const linkID = getLinkID(el);

        html += `
            ${$(el).text()}: <br>
            ${!isSameFont ? getFontDetails(el) + "<br>" : ""}
          `;

        if (linkID) {
          html += `
              🔍 ID: ${linkID}          
              <span class='rlc-ab-divider'></span>
            `;
        }
      });

      $(linksContainer);

      if (!html) return;

      addPositionToEl(linksContainer);
      addZIndexToCarousel(linksContainer);
      $(linksContainer).append(createInfoContainer(html, `data-links="many"`));
      return;
    }

    $(linksContainer)
      .children(".rlc-pillbutton, .rlc-linecta, .rlc-target, a")
      .each((j, el) => {
        if (shouldIgnoreLink(el)) return;

        addPositionToEl(el);
        addZIndexToCarousel(el);
        const linkID = getLinkID(el);
        let adContainerCSS = 'style="';

        if ($(linksContainer).width() > $(window).width() / 1.2) {
          adContainerCSS += `--_link-width: 500px;`;
        } else if ($(linksContainer).width() > $(window).width() / 3) {
          adContainerCSS += `--_link-width: ${
            $(linksContainer).width() -
            40 -
            getCSSInt(linksContainer, "padding-right")
          }px;`;
        } else if (
          $(linksContainer)
            .closest("article")
            .attr("class")
            ?.includes("hero") ||
          $(linksContainer).closest("article").attr("id")?.includes("hero")
        ) {
          adContainerCSS += `--_link-width: 400px;`;
        } else {
          adContainerCSS += `--_link-width: calc(100% - 60px);`;
        }

        if (
          $(el).closest(
            ':where(.rlc-copygroup, .rlc-copygroup-in, .rlc-textgroup, .rlc-textgroup-in)[class*="bottom-left"], :where(.rlc-copygroup, .rlc-copygroup-in, .rlc-textgroup, .rlc-textgroup-in)[class*="top-left"]'
          ).length
        ) {
          adContainerCSS += "left: 0; --_translateX: 0;";
        } else if (
          $(el).closest(
            ':where(.rlc-copygroup, .rlc-copygroup-in, .rlc-textgroup, .rlc-textgroup-in)[class*="bottom-right"], :where(.rlc-copygroup, .rlc-copygroup-in, .rlc-textgroup, .rlc-textgroup-in)[class*="top-right"]'
          ).length
        ) {
          adContainerCSS += "right: 0; --_translateX: 0;";
        } else if (
          $(el).closest(
            ':where(.rlc-copygroup, .rlc-copygroup-in, .rlc-textgroup, .rlc-textgroup-in)[class*="bottom-center"], :where(.rlc-copygroup, .rlc-copygroup-in, .rlc-textgroup, .rlc-textgroup-in)[class*="top-center"]'
          ).length
        ) {
          adContainerCSS += "left: 50%; --_translateX: -50%;";
        } else if (
          $(el).offset().left - $(linksContainer).offset().left <=
          50
        ) {
          adContainerCSS += "left: 0; --_translateX: 0;";
        } else {
          adContainerCSS += "left: 50%; --_translateX: -50%;";
        }

        if (
          $(el).closest(
            ':where(.rlc-copygroup, .rlc-copygroup-in, .rlc-textgroup, .rlc-textgroup-in)[class*="pos-top"]'
          ).length
        ) {
          adContainerCSS += "top: 100%; --_translateY: 12px;";
        }

        if (checkABTooLong(linkID)) {
          adContainerCSS += `--_link-width: ${$(linksContainer).width()}px;`;
        }

        if ($(el).closest("a").css("overflow") === "hidden") {
          adContainerCSS += `overflow: visible;`;
          $(el).closest("a").css("overflow", "visible");
        }

        adContainerCSS += '"';

        let html = `
            🔍 font: <br>
            ${getFontDetails(el)} <br>
        `;

        if (linkID) {
          html += `
            <span class='rlc-ab-divider'></span>
            🔍 ID: <br>
            ${linkID}
          `;
        }

        $(el).append(createInfoContainer(html, adContainerCSS));
      });
  });
}

function generateNavLinkInfoContainer() {
  // for nav links
  $(".rlc-navcta").each((j, el) => {
    if (shouldIgnoreLink(el)) return;
    addPositionToEl(el);
    addZIndexToCarousel(el);
    const linkID = getLinkID(el);

    let html = `
            🔍 font: <br>
            ${getFontDetails(el)} <br>
        `;

    if (linkID) {
      html += `
            <span class='rlc-ab-divider'></span>
            🔍 ID: <br>
            ${linkID}
          `;
    }

    $(el).append(createInfoContainer(html));
  });
}

function generateQuickShopInfoContainer() {
  $(".rlc-target.is-quick-shoppable.rlc-qs_ready").each((i, el) => {
    if (checkInfoContainerExist(el)) return;
    addPositionToEl(el);

    let adContainerCSS = 'style="';

    const parentEl = $(el).closest(":where(.rlc-block, .rlc-slide)")[0];

    if (parentEl) {
      const leftOffset = Math.abs(
        $(el).offset().left - $(parentEl).offset().left
      );
      const rightOffset = Math.abs(
        $(el).offset().left +
          $(el).width() -
          ($(parentEl).offset().left + $(parentEl).width())
      );
      const topOffset = Math.abs($(el).offset().top - $(parentEl).offset().top);
      const bottomOffset = Math.abs(
        $(el).offset().top +
          $(el).height() -
          ($(parentEl).offset().top + $(parentEl).height())
      );

      if (leftOffset > rightOffset) {
        adContainerCSS += `left: unset; right: 50%;`;
      }

      if (bottomOffset > topOffset) {
        adContainerCSS += `bottom: unset; top: 100%;`;
      }
    }

    adContainerCSS += '"';

    $(el).append(createInfoContainer(getLinkID(el), adContainerCSS));
  });
}

function shouldIgnoreLink(el) {
  const ignoreClassList = ["rlc-tag_ignore", "rlc-popblive", "rlc-popyoutube"];

  for (let i = 0; i < ignoreClassList.length; i++) {
    if ($(el).hasClass(ignoreClassList[i])) {
      return true;
    }
  }

  return false;
}

function createInfoContainer(ab, attr = "") {
  return `
      <div class="rlc-info-container" ${attr}>
          <p class="rlc-p rlc-ab">${ab}</p>
      </div>
  `;
}

function checkInfoContainerExist(el) {
  return !!$(el).find("> .rlc-info-container").length;
}

function getLinkID(el) {
  if (!$(el).is("a")) {
    return "";
  }

  if (el.href.includes("youtube") || el.href.includes("instagram")) {
    return `
      external link: <br>
      ${el.href}
    `;
  }

  if (
    el.href.includes("#") ||
    $(el).hasClass("rlc-jumplink") ||
    $(el).hasClass("rlc-page-anchors")
  ) {
    return `
      Jump link: ${el.href.split("#")[1]}
    `;
  }

  const urlPart = el.href.includes(".co.")
    ? decodeURIComponent(el.href.split(".co")[1])
    : decodeURIComponent(el.href.split(".com")[1]);

  let cgid = null;
  let tagging = null;

  if (urlPart.includes("?")) {
    [cgid, tagging] = urlPart?.split("?");
  } else {
    cgid = urlPart;
  }

  if (urlPart?.includes("search")) {
    const searchQuery = urlPart.split("search")[1];
    if (searchQuery === "" || searchQuery) {
      cgid = `
        <span class='rlc-dev-err'>
          ${searchQuery === "" ? "missing CGID" : "invalid CGID: <br>"} 
          ${
            searchQuery !== "" ? urlPart?.split("search?")[1].split("&")[0] : ""
          }
        </span>
      `;
    }
  }

  if (urlPart?.includes("ab=")) {
    cgid = `
      <span class='rlc-dev-err'>
        contains ab tagging: <br>
        ab=${urlPart.split("ab=")[1].split("&")[0]}
      </span> <br>
      ${cgid}
    `;
  }

  // PID handling
  if (!!$(el).closest(".notfound").length) {
    return `
      <span class="rlc-dev-err">Invalid PID</span>
    `;
  }

  let pid = null;
  let productColor = null;

  if (urlPart?.includes(".html")) {
    if (urlPart?.includes("?")) {
      const productInfo = urlPart.split(".html")[1];
      pid = productInfo.split("_")[0]?.replace("?dwvar", "");
      productColor = productInfo.split("_")[1]?.replace("colorname=", "");
      if (productColor.includes("ab=")) {
        productColor = productColor.split("?ab=")[0];
      }
    } else {
      pid = urlPart.split("-").at(-1).replace(".html", "");
    }
    cgid = cgid.includes("contains ab tagging")
      ? `
      <span class='rlc-dev-err'>
        contains ab tagging: <br>
        ab=${urlPart.split("ab=")[1].split("&")[0]}
      </span> 
    `
      : null;
  }
  const filter = tagging?.includes("prefn") ? tagging.split("?")[0] : null;
  const filterName = filter ? filter.split("&")[0].split("=")[1] : null;
  const filterValue = filter ? filter.split("&")[1].split("=")[1] : null;

  const outOfStock = !!$(el).closest(".notinstock").length;

  return `
    ${cgid ? cgid + "<br>" : ""}
    ${pid ? "◻️ PID: " + pid : ""}
    ${
      pid && outOfStock ? '<span class="rlc-dev-err">(Out of stock)</span>' : ""
    }
    ${pid ? "<br>" : ""}
    ${productColor ? "◻️ Color: " + productColor + "<br>" : ""}
    ${filter ? "◻️ Filter: " + filterName + " = " + filterValue + "<br>" : ""}
  `;
}

function checkABTooLong(ab) {
  return ab.length >= 120;
}

function checkTooManyLinks(container) {
  return (
    $(container).find(".rlc-pillbutton, .rlc-linecta, .rlc-target, a").length >
    3
  );
}

function toggleID() {
  isShowingAB ? hideID() : showID();
}

function hideID() {
  $(
    ":where(.rlc-links, .rlc-hotspot, .rlc-bg_link, :where(.rlc-copygroup, .rlc-textgroup) :where(.rlc-pillbutton, .rlc-linecta, .rlc-target, a)) > .rlc-info-container, .rlc-linecta > .rlc-info-container, .rlc-target.is-quick-shoppable.rlc-qs_ready > .rlc-info-container, .rlc-buttongroup .rlc-links .rlc-pillbutton > .rlc-info-container"
  ).hide();
  $(".rlc-cta .rlc-info-container").hide();
  $(".rlc-bg > a .rlc-info-container").hide();
  $(".rlc-navcta .rlc-info-container").hide();
  $(".rlc-ul .rlc-info-container").hide();
  $(".rlc-back-cta .rlc-info-container").hide();
  removeZIndexFromCarousel();
  hideOverflow();
  isShowingAB = false;
}

function showID() {
  $(
    ":where(.rlc-links, .rlc-hotspot, .rlc-bg_link, :where(.rlc-copygroup, .rlc-textgroup) :where(.rlc-pillbutton, .rlc-linecta, .rlc-target, a)) > .rlc-info-container, .rlc-linecta > .rlc-info-container, .rlc-target.is-quick-shoppable.rlc-qs_ready > .rlc-info-container, .rlc-buttongroup .rlc-links .rlc-pillbutton > .rlc-info-container"
  ).each((i, el) => {
    addZIndexToCarousel(el);

    const container = $(el).closest(".rlc-imagery").length
      ? $(el).closest(".rlc-imagery")
      : $(el).closest(
          ":where(.rlc-copygroup, .rlc-textgroup, .rlc-copygroup-in, rlc-textgroup-in)"
        );

    showOverflow(container);
    $(el).show();
  });

  $(".rlc-cta .rlc-info-container").show();
  $(".rlc-bg > a .rlc-info-container").show();
  $(".rlc-navcta .rlc-info-container").show();
  $(".rlc-ul .rlc-info-container").show();
  $(".rlc-back-cta .rlc-info-container").show();
  isShowingAB = true;
}

// MARK: Font family
function generateCopyGroupInfoContainer(caid) {
  $(`
        ${caid} *:has(>.rlc-copygroup),
        ${caid} *:has(>.rlc-textgroup),
        ${caid} *:has(>.rlc-intro),
        ${caid} *:has(>.rlc-catslider-hd)
    `).each((i, container) => {
    let html = "";
    $(container)
      .find(
        ".rlc-copygroup, .rlc-copygroup-in, .rlc-textgroup, .rlc-textgroup-in, .rlc-intro, .rlc-catslider-hd"
      )
      .each((i, group) => {
        if ($(group).children(".rlc-info-container").length) {
          return;
        }

        $(group)
          .children(
            ".rlc-sub, .rlc-title, .rlc-dek, .rlc-brand, .rlc-copy, .rlc-quote, .rlc-sig, .rlc-label"
          )
          .each((i, el) => {
            if ($(el).is("a") || $(el).html().includes("rlc-info-container"))
              return;

            const textContent = $(el).text().trim();
            if (!textContent) return;

            html += `
                ${i !== 0 ? "<span class='rlc-ab-divider'></span>" : ""}
                ${textContent}:<br>
                ${getFontDetails(el)}<br>
              `;
          });

        if (!html.trim()) return;
        addPositionToEl(group);

        let additionalCSS = 'style="';
        const slideParent = $(group).closest(".rlc-slide");

        if (slideParent.length) {
          const slideWidth =
            getCSSInt(slideParent, "width") - 48 < 250
              ? 500
              : getCSSInt(slideParent, "width") - 48;
          additionalCSS += `--_max-width: min(${slideWidth}px, 500px);`;
        }

        // center ab-container if copy group is too big
        if (
          $(group).height() >=
          $(group).closest("article:not(.rlc-slide)").height() * 0.35
        ) {
          additionalCSS += "top: 50%;";
        }

        // update position if it's padding component
        if ($(container).closest(".rlc-padding").length) {
          additionalCSS += `margin-bottom: -${$(group).css("padding-top")};`;
        }

        // update position if copy group is at top of the container
        if ($(container).offset().top - $(group).offset().top <= 120) {
          additionalCSS += `--_translateY: 0; bottom: unset; top: 0;`;
        }

        // update position if copy group is at bottom of the container
        const blockContainer = $(container).closest(".rlc-block");
        if (
          blockContainer.length &&
          $(container).offset().top -
            (blockContainer.offset().top + blockContainer.height()) <=
            50
        ) {
          additionalCSS += `--_translateY: 0; bottom: 0; top: unset;`;
        }

        if ($(container).closest(".rlc-carousel").length) {
          $(container).closest(".rlc-carousel").css("overflow", "visible");
        }

        // center ab-container if copy group almost the same width of container
        if ($(document).width() - $(group).width() <= 10) {
          additionalCSS += `--_translateX: -50%; left: 50%;`;
        } else if (
          (getCSSInt(group, "padding-left") > 0 ||
            getCSSInt(group, "left") > 0) &&
          getCSSInt(group, "margin-left") === 0
        ) {
          if ($(group).width() >= $(group).width() / 2) {
            if (
              $(group).hasClass("rlc-all-pos-center") ||
              $(document).width() - $(group).outerWidth() >= 10
            ) {
              additionalCSS += `--_translateX: -50%; left: 50%;`;
            } else {
              if (
                $(group).css("padding-left") !== $(group).css("padding-right")
              ) {
                additionalCSS += `--_translateX: ${$(group).css(
                  "padding-left"
                )};`;
              }
            }
          }
        }

        additionalCSS += '"';

        $(group).append(createInfoContainer(html, additionalCSS));
        html = "";
      });
  });
}

function generateSingleCopyInfoContainer(caid) {
  $(`
      ${caid} .rlc-title:not(
        :where(
          .rlc-copygroup, 
          .rlc-copygroup-in, .rlc-textgroup, 
          .rlc-textgroup-in, .rlc-intro, 
          .rlc-catslider-hd
        ) > .rlc-title),
      ${caid} .rlc-dek:not(
        :where(
          .rlc-copygroup, 
          .rlc-copygroup-in, 
          .rlc-textgroup, 
          .rlc-textgroup-in, 
          .rlc-intro, 
          .rlc-catslider-hd
        ) > .rlc-dek)
    `).each((i, el) => {
    let html = "";
    const parent = $(el).parent();
    parent
      .children(".rlc-sub, .rlc-title, .rlc-dek, .rlc-brand")
      .each((i, el) => {
        if (
          $(el).is("a") ||
          // $(parent).html().includes("rlc-info-container")
          $(parent).find("> .rlc-info-container").length
        )
          return;

        html += `
            ${$(el).text()}:<br>
            ${getFontDetails(el)}<br>
            <span class='rlc-ab-divider'></span>
          `;
      });

    if (!html.trim()) return;
    addPositionToEl(parent);
    $(parent).append(
      createInfoContainer(
        html,
        `style="top: 0; ${
          parseInt($(document).width()) - parseInt($(parent).outerWidth()) < 10
            ? "--_translateX: -50%;"
            : ""
        }"
          `
      )
    );
  });

  $(".rlc-header").each((i, el) => {
    if ($(el).html().includes("rlc-info-container")) return;
    $(el).append(
      createInfoContainer(`
          ${$(el).text()}:<br>
          ${getFontDetails(el)}<br>
        `)
    );
  });

  $(`
    ${caid} .rlc-intro:not(
      :where(
        .rlc-copygroup, 
        .rlc-copygroup-in, 
        .rlc-textgroup, 
        .rlc-textgroup-in, 
        .rlc-intro, 
        .rlc-catslider-hd
      ) > .rlc-intro)
  `).each((i, el) => {
    if ($(el).html().includes("rlc-info-container")) return;
    $(el).append(
      createInfoContainer(`
          ${$(el).text()}:<br>
          ${getFontDetails(el)}<br>
        `)
    );
  });
}

function toggleFont() {
  isShowingFont ? hideFont() : showFont();
}

function hideFont() {
  const groupClasses =
    ".rlc-copygroup, .rlc-copygroup-in, .rlc-textgroup, .rlc-textgroup-in, .rlc-intro, .rlc-catslider-hd, .rlc-inner-catslider-hd, .rlc-copy";

  $(`:where(${groupClasses}) > .rlc-info-container`).hide();
  $(
    `*:has(>.rlc-title:not(:where(${groupClasses}) .rlc-title)) > .rlc-info-container`
  ).hide();
  $(
    `*:has(>.rlc-dek:not(:where(${groupClasses}) .rlc-dek)) > .rlc-info-container`
  ).hide();
  $(".rlc-header > .rlc-info-container").hide();

  // remove overflow visible CSS override from showFont()
  $(".rlc-block:has(.rlc-info-container)").removeAttr("style");

  isShowingFont = false;
}

function showFont() {
  const groupClasses =
    ".rlc-copygroup, .rlc-copygroup-in, .rlc-textgroup, .rlc-textgroup-in, .rlc-intro, .rlc-catslider-hd, .rlc-inner-catslider-hd, .rlc-copy";

  $(`:where(${groupClasses}) > .rlc-info-container`).show();
  $(
    `*:has(>.rlc-title:not(:where(${groupClasses}) .rlc-title)) > .rlc-info-container`
  ).show();
  $(
    `*:has(>.rlc-dek:not(:where(${groupClasses}) .rlc-dek)) > .rlc-info-container`
  ).show();
  $(".rlc-header > .rlc-info-container").show();

  // only update the overflow if the target isn't in slider
  $(".rlc-block:not(:has(.rlc-slide)):has(.rlc-info-container)").each(
    (i, el) => {
      if ($(el).css("overflow") === "hidden") {
        $(el).css("overflow", "visible");
      }
    }
  );
  isShowingFont = true;
}

// MARK: product color
function showProdColor() {
  $('[data-action="normalswatchescolor"]').each((i, item) => {
    const color = $(item).attr("data-selected");
    let html = `
      <div class="rlc-dev-color-container" data-color='${color}'>
        ${color}
      </div>
    `;

    const parentEl = $(item).closest("li.variations-attribute");
    parentEl.prepend(html);
  });
}

function hideProdColor() {
  if (!$('[data-action="normalswatchescolor"]').length) return;
  $(".rlc-dev-color-container").remove();
}

// MARK: VideoURL
function showVidUrl() {
  if (!$(".rlc-videocontainer").length) return;

  $(".rlc-videocontainer").each((i, item) => {
    const videoUrl = $(item)
      .attr("data-video")
      .replaceAll("'", '"')
      .replaceAll("https:", "");
    const videoUrlJSON = JSON.parse(videoUrl);

    let html = `
      <div class="rlc-dev-video-container" data-video="${JSON.stringify(
        videoUrlJSON
      ).replaceAll('"', "'")}">
        <div class='rlc-dev-video-item'>
          <span>
            mobile: 
          </span>
          <a href='https:${videoUrlJSON.mobile}' target='_blank'>
            ${videoUrlJSON.mobile}
          </a>
        </div>
        <div class='rlc-dev-video-item'>
          <span>
            desktop: 
          </span>
          <a href='https:${videoUrlJSON.desktop}' target='_blank'>
            ${videoUrlJSON.desktop}
          </a>
        </div>

        <a href="#" class='rlc-dev-icon' data-action='copy' data-state='idle'>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640">
            ${getIconPath("copy")}
            ${getIconPath("success")}
          </svg>
        </a>
      </a>
    `;
    $(item).append(html);
  });
}

function hideVidUrl() {
  if (!$(".rlc-videocontainer .rlc-dev-video-container").length) return;
  $(".rlc-videocontainer .rlc-dev-video-container").remove();
}

function checkIfVid(caid) {
  if (!$(`${caid} .rlc-hasvideo.rlc-vidLoaded`).length) {
    disableDevItem($('.rlc-dev-item[data-index="3"]'));
  }
}

// MARK: Missing Image
function checkMissingImage(caid) {
  const scrollPos = $(window).scrollTop();

  if (!window.hasCheckedMissingImage) {
    window.scrollTo(0, document.body.offsetHeight);
  }

  setTimeout(() => {
    let missingImages = [];

    const hasAutoSlider = !!$(`${caid} .rlc-autoslider`).length;

    if (hasAutoSlider) {
      $(`${caid} .rlc-autoslider`).each((i, slider) => {
        const sliderWrapperEl = $(slider).find(".rlc-in");
        const totalSlide = sliderWrapperEl.find(".rlc-slide").length;
        const sliderPauseBtn = $(slider).find(".rlc-looppause")[0];

        if (!$(slider).hasClass("user_paused")) {
          sliderPauseBtn.click();
        }

        const tweenParent = window.gsap.getTweensOf(
          sliderWrapperEl.find(".rlc-slide")
        )[0].parent;

        // scroll to the fist item first and then the last item
        tweenParent.toIndex(0, {
          duration: 0.5,
          ease: "power1.inOut",
        });

        tweenParent.toIndex(totalSlide + 1, {
          duration: 0.5,
          ease: "power1.inOut",
          delay: 0.5,
        });
      });
    }

    window.scrollTo(0, scrollPos);

    $(`${caid} img`).each(function (i) {
      const img = $(this);
      if (img[0].naturalWidth === 0) {
        let parentEl = img.closest(".rlc-block");
        if (parentEl.hasClass("rlc-slide")) {
          parentEl = parentEl.parent();
        }

        const missingID = `rlc-missing-image--${i}`;
        const imgUrl =
          img.attr("src") !== undefined ? img.attr("src") : img[0].currentSrc;

        if (imgUrl) {
          missingImages.push({
            imgUrl: imgUrl,
            id: missingID,
          });

          img
            .addClass("rlc-dev-missing-img")
            .attr("id", missingID)
            .css("--_height", `${parentEl.height()}px`);
        }
      }
    });

    window.hasCheckedMissingImage = true;

    if (!missingImages.length) {
      updateNoMissingImage();
      return;
    } else {
      setTimeout(() => {
        // if there are missing images -> double check
        missingImages.forEach((img, i) => {
          const imgEl = $(`#${img.id}`);
          if (imgEl[0]?.naturalWidth !== 0) {
            removeMissingImageItemStyle(imgEl);

            missingImages[i].id = "";
            missingImages[i].imgUrl = "";
          }
        });

        missingImages = missingImages.filter((img) => img.id && img.imgUrl);

        if (!missingImages.length) {
          updateNoMissingImage();
          return;
        }

        generateMissingImageContainer(missingImages);
        showMissingImages();
      }, 500);
    }
  }, 500);
}

function generateMissingImageContainer(missingImages) {
  let container = $("body");

  container.append(`
    <div class="rlc-dev-missing-image-container">
      <header class='rlc-dev-missing-image-header'>
        <h4 class='rlc-dev-missing-image-title'>
          Missing images found: 
        </h4>
        
        <div class='rlc-dev-btns'>
          <div class='rlc-dev-copy-all'>
            Copy all
          </div>

          <div class='rlc-dev-check-again'>
            Check again
          </div>
        </div>
      </header>
      <ul class="rlc-dev-missing-images">
        ${generateMissingImageItem(missingImages)}
      </ul>
      <div class="rlc-dev-icon" data-action="close">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640">
            ${getIconPath("close")}
          </svg>
        </div>
    </div>
  `);
}

function generateMissingImageItem(missingImages) {
  const ordinalList = ["st", "nd", "rd"];

  return missingImages
    .map((img, _) => {
      const isSlide = !!$(`#${img.id}`).closest(".rlc-slide").length;
      let slideParent = null;
      let slideEl = null;
      let slideIndex = null;

      if (isSlide) {
        slideParent = $(`#${img.id}`).closest(".rlc-slide").parent();
        slideEl = $(`#${img.id}`).closest(".rlc-slide")[0];
        slideIndex = slideParent.find(".rlc-slide").index(slideEl);
      }

      const ordinal = slideIndex < 3 ? ordinalList[slideIndex] : "th";

      return `
        <li class='rlc-dev-missing-image' data-missing='#${img.id}'>
          <div class='rlc-dev-icon' data-action='copy' data-state='idle'>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640">
              ${getIconPath("copy")}
              ${getIconPath("success")}
            </svg>
          </div>
          <div>
            <span class='rlc-dev-missing-img-url'>
              ${img.imgUrl}
            </span>

            <span class='rlc-dev-missing-img-slide-index'>
              ${
                slideIndex !== -1
                  ? " ( " + (slideIndex + 1) + ordinal + " slide )"
                  : ""
              }
            </span>
          <div>
        </li>
      `;
    })
    .join("");
}

function removeMissingImageItemStyle(el) {
  $(el)
    .removeClass("rlc-dev-missing-img")
    .removeAttr("id")
    .css("--_height", "auto");
}

function updateNoMissingImage(devItem) {
  const missingImageDevItem = $('.rlc-dev-item[data-index="4"]');
  disableDevItem(missingImageDevItem);

  if (!missingImageDevItem.text().includes("✅")) {
    missingImageDevItem.append(" ✅");
  }

  $(".rlc-dev-missing-image-container").remove();
}

function showMissingImages() {
  $(".rlc-dev-missing-image-container").show();
}

function hideMissingImages() {
  $(".rlc-dev-missing-image-container").hide();
}

// MARK: Image
function generateImageInfo(caid) {
  $(`${caid} .rlc-image`).each((i, img) => {
    const imageContainer = $(img).closest(".rlc-imagery");
    const hasSource = !!imageContainer.find("source").length;

    const imageSource = {};
    if (hasSource) {
      imageSource.desktop = getImageName(
        imageContainer.find("source[class$=desktop]")[0]?.srcset
      );
      imageSource.mobile = getImageName(
        imageContainer.find("source[class$=mobile]")[0]?.srcset
      );
    } else {
      imageSource.all = getImageName(img.src || img.currentSrc);
    }

    let html = `
      <div class='rlc-dev-image-name-container'>
        ${imageSource.desktop ? "Desktop: " + imageSource.desktop + "<br>" : ""}
        ${imageSource.mobile ? "Mobile: " + imageSource.mobile + "<br>" : ""}
        ${imageSource.all ? "All: " + imageSource.all + "<br>" : ""}
        Alt: ${$(img).attr("alt") || "[missing]"}
      </div>
    `;

    imageContainer.append(html);
  });
}

function toggleImageInfo() {
  window.devHelperState.isShowingImageInfo ? hideImageName() : showImageName();

  window.devHelperState.isShowingImageInfo =
    !window.devHelperState.isShowingImageInfo;
}

function showImageName() {
  $(".rlc-dev-image-name-container").show();
}

function hideImageName() {
  $(".rlc-dev-image-name-container").hide();
}
