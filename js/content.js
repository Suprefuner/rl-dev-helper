// prevent multiple init
if (!$(".rlc-dev-helper").length) {
  /* 
    helperInit() to generate all the el 
    helperButtonInit() to capture any error el 
    helperButtonUpdate() to check and update dev item
  */
  helperInit();
  helperButtonInit();
  helperButtonUpdate();
  bindEvent();
}

function helperInit() {
  // generate CTA info container
  generateHotspotInfoContainer();
  generateBGLinkInfoContainer();
  generateCTAInfoContainer();
  generateNavLinkInfoContainer();
  generateQuickShopInfoContainer();

  // generate copy info container
  generateCopyGroupInfoContainer(window.caid);
  generateSingleCopyInfoContainer(window.caid);

  // generate missing image name
  generateImageInfo(window.caid);

  // hide info container at the beginning
  hideID();
  hideFont();
  hideMissingImages();
  hideImageName();
}

// functions that check and disable the dev item
function helperButtonUpdate() {
  // generate missing image info container
  checkMissingImage(window.caid);

  // check if there is any video
  checkIfVid();

  // check if there is any product color
  checkIfProdColor();
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
        if (toasterCloseBtn) {
          checkIfProdColor();
        }

        $(toasterCloseBtn).on("click.rlcDevHelper", toasterCloseBtnHandler);

        function toasterCloseBtnHandler() {
          if (!window.devHelperState.isShowingProdColor) return;

          $('.rlc-dev-item.rlc-dev-item--prod-color')[0].click();
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
      $('.rlc-dev-item.rlc-dev-item--missing-img')[0].click();
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