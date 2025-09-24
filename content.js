if (!window._rlcDevHelper) {
  window._rlcDevHelper = true

  window.isPLP = !!$(".plp-content-slot").length

  window.caid = window.isPLP
    ? ":where(.plp-content-slot, .ingrid)"
    : "#main .open-html-content:has(.rlc-creative_v3)"

  window.devHelperState = {
    isShowingAB: false,
    isShowingFont: false,
    isShowingProdColor: false,
    isShowingVidUrl: false,
    isShowingMissingImages: true,
  }

  window.helperList = [
    { name: "AB tagging", fn: "toggleID" },
    { name: "font family", fn: "toggleFont" },
    {
      name: "product colors",
      fn: toggleProdColor,
      validation: () => $('[data-action="normalswatchescolor"]').length,
    },
    { name: "video URL", fn: toggleVidUrl },
    { name: "missing images", fn: toggleMissingImages, status: "show" },
  ]
}

// prevent multiple init
if (!$(".rlc-dev-helper").length) {
  helperInit()
  helperButtonInit()
  bindEvent()
}

function helperInit() {
  // generate CTA info container
  generateHotspotInfoContainer()
  generateBGLinkInfoContainer()
  generateCTAInfoContainer()
  generateQuickShopInfoContainer()

  // generate copy info container
  generateCopyGroupInfoContainer(window.caid)
  generateSingleCopyInfoContainer(window.caid)

  // generate missing image info container
  checkMissingImage(window.caid)

  // hide info container at the beginning
  hideID()
  hideFont()
  hideMissingImages()
}

function helperButtonInit() {
  let container = $("body")

  if (window.isPLP) {
    container = $(".plp")
  }

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
    `)
}

function bindEvent() {
  $(document).on("click.rlcDevHelper", ".rlc-btn--dev", devBtnHandler)
  $(document).on("click.rlcDevHelper", ".rlc-dev-item", (e) =>
    devItemHandler(e, window.helperList)
  )

  $(document).on("click", ".rlc-dev-color-container", async function () {
    copy($(this).attr("data-color"), $(this))
  })

  $(document).on(
    "click",
    '.rlc-dev-video-container .rlc-dev-icon[data-action="copy"]',
    async function () {
      const parentEl = $(this).closest(".rlc-dev-video-container")
      const copyContent = $(parentEl).attr("data-video")
      copy(copyContent, $(this))
    }
  )

  const observer = new MutationObserver((mutationsList) => {
    for (const mutation of mutationsList) {
      if (mutation.type === "attributes" && mutation.target === document.body) {
        const toaster = $(mutation.target)
        const toasterCloseBtn = toaster.find(".rl-toaster-close")

        $(toasterCloseBtn).on("click.rlcDevHelper", toasterCloseBtnHandler)

        function toasterCloseBtnHandler() {
          if (!window.devHelperState.isShowingProdColor) return

          $('.rlc-dev-item[data-index="2"]')[0].click()
          hideProdColor()
          window.devHelperState.isShowingProdColor = false
          $(toasterCloseBtn).off("click.rlcDevHelper", toasterCloseBtnHandler)
        }
      }
    }
  })

  const documentBody = document.querySelector("body")

  observer.observe(documentBody, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ["class"],
  })

  $(document).on("click.rlcDevHelper", ".rlc-dev-missing-image", function () {
    const target = $(this).attr("data-missing")
    $("html, body").animate(
      {
        scrollTop: $(`${target}`).offset().top - 200,
      },
      500
    )

    const isSwiper = !!$(`${target}`).closest(".swiper-container").length
    const isFadeSlider = !!$(`${target}`).closest(".rlc-fadeslider2").length
    const isAutoSlider = !!$(`${target}`).closest(".rlc-autoslider").length

    if (isSwiper) {
      const swiperEl = $(`${target}`).closest(".swiper-container")
      const slideIndex = swiperEl
        .find(".rlc-slide")
        .index(swiperEl.find(`.rlc-slide:has(${target})`))

      swiperEl[0].swiper.slideTo(slideIndex, 300)
    }

    if (isFadeSlider) {
      const slider = $(`${target}`).closest(".rlc-fadeslider2")
      const slide = $(`${target}`).closest(".rlc-slide")[0]
      const sliderArrowBtn = slider.find(".rlc-carousel-arrow-right")[0]
      const sliderPauseBtn = slider.find(".rlc-looppause")[0]

      let isActiveSlide = $(slide).hasClass("rlc-active")
      const isPaused = slider.hasClass("user_paused")

      if (!isPaused) {
        sliderPauseBtn.click()
      }

      let clickInterval = setInterval(() => {
        isActiveSlide = $(slide).hasClass("rlc-active")

        !isActiveSlide ? sliderArrowBtn.click() : clearInterval(clickInterval)
      }, 100)
    }

    if (isAutoSlider) {
      const slider = $(`${target}`).closest(".rlc-autoslider")
      const sliderWrapperEl = $(`${target}`).closest(".rlc-in")
      const slideIndex = sliderWrapperEl
        .find(".rlc-slide")
        .index(sliderWrapperEl.find(`.rlc-slide:has(${target})`))
      const sliderPauseBtn = slider.find(".rlc-looppause")[0]

      if (!slider.hasClass("user_paused")) {
        sliderPauseBtn.click()
      }

      window.gsap
        .getTweensOf(sliderWrapperEl.find(".rlc-slide"))[0]
        .parent.toIndex(slideIndex, {
          duration: 0.8,
          ease: "power1.inOut",
        })
    }
  })

  $(document).on(
    "click.rlcDevHelper",
    '.rlc-dev-icon[data-action="close"]',
    function () {
      $('.rlc-dev-item[data-index="4"]')[0].click()
    }
  )

  $(document).on(
    "click.rlcDevHelper",
    ".rlc-dev-missing-image-header .rlc-dev-copy-all",
    async function () {
      const missingImages = [...$(".rlc-dev-missing-img")]
        .map((img) => img.src || img.currentSrc)
        .join("\n")

      copy(missingImages, $(this))
    }
  )

  $(document).on(
    "click.rlcDevHelper",
    ".rlc-dev-missing-image .rlc-dev-icon[data-action='copy']",
    async function () {
      const copyContent = $(this).next().find(".rlc-dev-missing-img-url").text()

      copy(copyContent, $(this))
    }
  )
}

function toggleProdColor() {
  if (!$('[data-action="normalswatchescolor"]').length) return

  window.devHelperState.isShowingProdColor ? hideProdColor() : showProdColor()
  window.devHelperState.isShowingProdColor =
    !window.devHelperState.isShowingProdColor
}

function toggleVidUrl() {
  window.devHelperState.isShowingVidUrl ? hideVidUrl() : showVidUrl()
  window.devHelperState.isShowingVidUrl = !window.devHelperState.isShowingVidUrl
}

function toggleMissingImages() {
  window.devHelperState.isShowingMissingImages
    ? hideMissingImages()
    : showMissingImages()
  window.devHelperState.isShowingMissingImages =
    !window.devHelperState.isShowingMissingImages
}

// MARK: dev helperß
function generateDevItems(list) {
  let html = ""
  list.forEach((item, i) => {
    const status = item?.status === "show"

    html += `
      <li 
        class="rlc-dev-item" 
        data-index="${i}" 
        data-status="${status ? "hide" : "show"}" 
        data-state="${status ? "on" : "off"}"
      >
          ${" " + item.name}
      </li>
    `
  })
  return html
}

function devBtnHandler(e) {
  if (!e.target.closest(".rlc-btn--dev")) return

  const devToolContainer = $(e.target.closest(".rlc-dev-helper"))
  const isOn = devToolContainer.attr("data-status") === "on"
  devToolContainer.attr("data-status", isOn ? "off" : "on")

  function detectClickOutside(e) {
    if (e.target.closest(".rlc-dev-helper")) return
    devToolContainer.attr("data-status", "off")
  }

  isOn
    ? $(document).off("click", detectClickOutside)
    : $(document).on("click", detectClickOutside)
}

function devItemHandler(e, helperList) {
  if (
    !e.target.closest(".rlc-dev-item") ||
    $(e.target.closest(".rlc-dev-item")).hasClass("rlc-disabled")
  )
    return

  const index = $(e.target).attr("data-index")
  const item = helperList[index]
  const { fn, validation } = item

  if (typeof fn !== "function" && typeof window[fn] !== "function") {
    return console.error(`Function ${fn} is not defined.`)
  }

  if (validation && !validation()) return

  if (typeof fn === "function") {
    item.fn()
  }

  if (typeof window[fn] === "function") {
    window[fn]()
  }

  updateDevItemStatus(e.currentTarget)
  const isOn = $(e.target).attr("data-state") === "on"
  $(e.target).attr("data-state", isOn ? "off" : "on")
}

function updateDevItemStatus(el) {
  const isShow = $(el).attr("data-status") === "show"
  $(el).attr("data-status", isShow ? "hide" : "show")
}

// MARK: CGID/PID
function generateHotspotInfoContainer() {
  $(".rlc-hotspot").each((i, el) => {
    if (
      checkInfoContainerExist(el) ||
      shouldIgnoreLink(el) ||
      !$(el).attr("href")
    )
      return

    addPositionToEl(el)

    let additionalCSS = 'style="'
    const slideParent = $(el).closest(".rlc-slide")

    additionalCSS += `--_max-width: min(${
      $(el)
        .closest(
          ":where(.rlc-copygroup, .rlc-copygroup-in, .rlc-textgroup, .rlc-textgroup-in, .rlc-product-tile, .rlc-50-50__block, .rlc-block)"
        )
        .width() - 60
    }px, 500px);`

    if (slideParent.length) {
      if (getCSSInt(slideParent, "padding-left") > 0) {
        additionalCSS += `left: ${
          getCSSInt(slideParent, "padding-left") + 20
        }px;`
      }

      if (slideParent.width() > $(window).width() / 1.2) {
        additionalCSS += `--_link-width: 500px;`
      } else if (slideParent.width() > $(window).width() / 3) {
        additionalCSS += `--_link-width: ${
          slideParent.width() - 40 - getCSSInt(slideParent, "padding-right")
        }px;`
      } else {
        additionalCSS += `--_link-width: calc(100% - 60px);`
      }
    }

    additionalCSS += '"'

    $(el).html(createInfoContainer(getLinkID(el), additionalCSS))
  })
}

function generateBGLinkInfoContainer() {
  $(".rlc-bg_link").each((i, el) => {
    if (checkInfoContainerExist(el) || shouldIgnoreLink(el)) return
    addPositionToEl(el)

    const slideParent = $(el).closest(".rlc-slide")

    let additionalCSS = 'style="'
    if (slideParent.length) {
      $(el).css(
        "--_max-width",
        `${
          slideParent.width() - getCSSInt(slideParent, "padding-right") - 40
        }px`
      )
    }
    additionalCSS = '"'
    $(el).append(createInfoContainer(getLinkID(el), additionalCSS))
  })
}

function generateCTAInfoContainer() {
  $(".rlc-links, .rlc-copygroup, .rlc-textgroup").each((i, linksContainer) => {
    if (checkInfoContainerExist(linksContainer)) return

    const isTooManyLinks = checkTooManyLinks(linksContainer)

    if (isTooManyLinks) {
      let html = ""
      let CTAFont = ""
      $(linksContainer)
        .find(".rlc-pillbutton, .rlc-linecta, a")
        .each((i, el) => {
          if (shouldIgnoreLink(el)) return
          const fontFamily = getFontDetails(el)
          const isSameFont = CTAFont === fontFamily

          if (!isSameFont) {
            CTAFont = fontFamily
          }

          const linkID = getLinkID(el)

          html += `
            ${$(el).text()}: <br>
            ${!isSameFont ? getFontDetails(el) + "<br>" : ""}
          `

          if (linkID) {
            html += `
              <span class='rlc-ab-divider' style='opacity: 0.5;'></span>
              🔍 ID:<br>
              ${linkID}
              <span class='rlc-ab-divider'></span>
            `
          }
        })

      addPositionToEl(linksContainer)
      addZIndexToCarousel(linksContainer)
      $(linksContainer).append(createInfoContainer(html, `style="left:0;"`))
      return
    }

    $(linksContainer)
      .find(".rlc-pillbutton, .rlc-linecta, .rlc-target, a")
      .each((j, el) => {
        if (shouldIgnoreLink(el)) return
        addPositionToEl(el)
        addZIndexToCarousel(el)
        const linkID = getLinkID(el)
        let adContainerCSS = 'style="'

        if ($(linksContainer).width() > $(window).width() / 1.2) {
          adContainerCSS += `--_link-width: 500px;`
        } else if ($(linksContainer).width() > $(window).width() / 3) {
          adContainerCSS += `--_link-width: ${
            $(linksContainer).width() -
            40 -
            getCSSInt(linksContainer, "padding-right")
          }px;`
        } else if (
          $(linksContainer)
            .closest("article")
            .attr("class")
            ?.includes("hero") ||
          $(linksContainer).closest("article").attr("id")?.includes("hero")
        ) {
          adContainerCSS += `--_link-width: 400px;`
        } else {
          adContainerCSS += `--_link-width: calc(100% - 60px);`
        }

        if (
          $(el).closest(
            ':where(.rlc-copygroup, .rlc-copygroup-in, .rlc-textgroup, .rlc-textgroup-in)[class*="bottom-left"], :where(.rlc-copygroup, .rlc-copygroup-in, .rlc-textgroup, .rlc-textgroup-in)[class*="top-left"]'
          ).length
        ) {
          adContainerCSS += "left: 0; --_translateX: 0;"
        } else if (
          $(el).closest(
            ':where(.rlc-copygroup, .rlc-copygroup-in, .rlc-textgroup, .rlc-textgroup-in)[class*="bottom-right"], :where(.rlc-copygroup, .rlc-copygroup-in, .rlc-textgroup, .rlc-textgroup-in)[class*="top-right"]'
          ).length
        ) {
          adContainerCSS += "right: 0; --_translateX: 0;"
        } else if (
          $(el).closest(
            ':where(.rlc-copygroup, .rlc-copygroup-in, .rlc-textgroup, .rlc-textgroup-in)[class*="bottom-center"], :where(.rlc-copygroup, .rlc-copygroup-in, .rlc-textgroup, .rlc-textgroup-in)[class*="top-center"]'
          ).length
        ) {
          adContainerCSS += "left: 50%; --_translateX: -50%;"
        } else if (
          $(el).offset().left - $(linksContainer).offset().left <=
          50
        ) {
          adContainerCSS += "left: 0; --_translateX: 0;"
        } else {
          adContainerCSS += "left: 50%; --_translateX: -50%;"
        }

        if (
          $(el).closest(
            ':where(.rlc-copygroup, .rlc-copygroup-in, .rlc-textgroup, .rlc-textgroup-in)[class*="pos-top"]'
          ).length
        ) {
          adContainerCSS += "top: 100%; --_translateY: 12px;"
        }

        if (checkABTooLong(linkID)) {
          adContainerCSS += `--_link-width: ${$(linksContainer).width()}px;`
        }

        if ($(el).closest("a").css("overflow") === "hidden") {
          adContainerCSS += `overflow: visible;`
        }

        adContainerCSS += '"'

        let html = `
            🔍 font: <br>
            ${getFontDetails(el)} <br>
        `

        if (linkID) {
          html += `
            <span class='rlc-ab-divider'></span>
            🔍 ID: <br>
            ${linkID}
          `
        }

        $(el).append(createInfoContainer(html, adContainerCSS))
      })
  })
}

function generateQuickShopInfoContainer() {
  $(".rlc-target.is-quick-shoppable.rlc-qs_ready").each((i, el) => {
    if (checkInfoContainerExist(el)) return
    addPositionToEl(el)

    let adContainerCSS = 'style="'

    const parentEl = $(el).closest(":where(.rlc-block, .rlc-slide)")[0]

    if (parentEl) {
      const leftOffset = Math.abs(
        $(el).offset().left - $(parentEl).offset().left
      )
      const rightOffset = Math.abs(
        $(el).offset().left +
          $(el).width() -
          ($(parentEl).offset().left + $(parentEl).width())
      )
      const topOffset = Math.abs($(el).offset().top - $(parentEl).offset().top)
      const bottomOffset = Math.abs(
        $(el).offset().top +
          $(el).height() -
          ($(parentEl).offset().top + $(parentEl).height())
      )

      if (leftOffset > rightOffset) {
        adContainerCSS += `left: unset; right: 50%;`
      }

      if (bottomOffset > topOffset) {
        adContainerCSS += `bottom: unset; top: 100%;`
      }
    }

    adContainerCSS += '"'

    $(el).append(createInfoContainer(getLinkID(el), adContainerCSS))
  })
}

function shouldIgnoreLink(el) {
  const ignoreClassList = [
    "rlc-tag_ignore",
    "rlc-page-anchors",
    "rlc-popblive",
    "rlc-popyoutube",
  ]

  for (let i = 0; i < ignoreClassList.length; i++) {
    if ($(el).hasClass(ignoreClassList[i])) {
      return true
    }
  }

  return false
}

function createInfoContainer(ab, attr = "") {
  return `
      <div class="rlc-ab-container" ${attr}>
          <p class="rlc-p rlc-ab">${ab}</p>
      </div>
  `
}

function checkInfoContainerExist(el) {
  return !!$(el).find(".rlc-ab-container").length
}

function getLinkID(el) {
  if (!$(el).is("a")) {
    return ""
  }

  const urlPart = el.href.includes(".co.")
    ? decodeURIComponent(el.href.split(".co")[1])
    : decodeURIComponent(el.href.split(".com")[1])

  let cgid = null
  let tagging = null

  if (urlPart.includes("?")) {
    ;[cgid, tagging] = urlPart?.split("?")
  } else {
    cgid = urlPart
  }

  if (cgid?.includes("search")) {
    cgid = `<span class='rlc-dev-err'>${
      urlPart.split("search?")[1].split("&")[0]
    }</span>`
  }

  if (cgid?.includes("ab=")) {
    cgid = `<span class='rlc-dev-err'>ab=${
      urlPart.split("ab=")[1].split("&")[0]
    }</span>`
  }

  // PID handling
  let pid = null
  let productColor = null

  if (urlPart?.includes(".html")) {
    if (urlPart?.includes("?")) {
      const productInfo = urlPart.split(".html")[1]
      pid = productInfo.split("_")[0]?.replace("?dwvar", "")
      productColor = productInfo.split("_")[1]?.replace("colorname=", "")
    } else {
      pid = urlPart.split("-").at(-1).replace(".html", "")
    }
    cgid = null
  }
  const filter = tagging?.includes("prefn") ? tagging.split("?")[0] : null
  const filterName = filter ? filter.split("&")[0].split("=")[1] : null
  const filterValue = filter ? filter.split("&")[1].split("=")[1] : null

  const outOfStock = !!$(el).closest(".notinstock").length

  return `
    ${cgid ? cgid + "<br>" : ""}
    ${pid ? "◻️ PID: " + pid : ""}
    ${
      pid && outOfStock ? '<span class="rlc-dev-err">(Out of stock)</span>' : ""
    }
    ${pid ? "<br>" : ""}
    ${productColor ? "◻️ Color: " + productColor + "<br>" : ""}
    ${filter ? "◻️ Filter: " + filterName + " = " + filterValue + "<br>" : ""}
  `
}

function checkABTooLong(ab) {
  return ab.length >= 120
}

function checkTooManyLinks(container) {
  return (
    $(container).find(".rlc-pillbutton, .rlc-linecta, .rlc-target, a").length >
    3
  )
}

function toggleID() {
  isShowingAB ? hideID() : showID()
}

function hideID() {
  $(
    ":where(.rlc-links, .rlc-hotspot, .rlc-bg_link, :where(.rlc-copygroup, .rlc-textgroup) :where(.rlc-pillbutton, .rlc-linecta, .rlc-target, a)) > .rlc-ab-container, .rlc-linecta > .rlc-ab-container, .rlc-target.is-quick-shoppable.rlc-qs_ready > .rlc-ab-container, .rlc-buttongroup .rlc-links .rlc-pillbutton > .rlc-ab-container"
  ).hide()
  removeZIndexFromCarousel()
  hideOverflow()
  isShowingAB = false
}

function showID() {
  $(
    ":where(.rlc-links, .rlc-hotspot, .rlc-bg_link, :where(.rlc-copygroup, .rlc-textgroup) :where(.rlc-pillbutton, .rlc-linecta, .rlc-target, a)) > .rlc-ab-container, .rlc-linecta > .rlc-ab-container, .rlc-target.is-quick-shoppable.rlc-qs_ready > .rlc-ab-container, .rlc-buttongroup .rlc-links .rlc-pillbutton > .rlc-ab-container"
  ).each((i, el) => {
    addZIndexToCarousel(el)

    const container = $(el).closest(".rlc-imagery").length
      ? $(el).closest(".rlc-imagery")
      : $(el).closest(
          ":where(.rlc-copygroup, .rlc-textgroup, .rlc-copygroup-in, rlc-textgroup-in)"
        )

    showOverflow(container)
    $(el).show()
  })
  isShowingAB = true
}

// MARK: Font family
function generateCopyGroupInfoContainer(caid) {
  $(`
        ${caid} *:has(>.rlc-copygroup),
        ${caid} *:has(>.rlc-textgroup),
        ${caid} *:has(>.rlc-intro),
        ${caid} *:has(>.rlc-catslider-hd)
    `).each((i, container) => {
    let html = ""
    $(container)
      .find(
        ".rlc-copygroup, .rlc-copygroup-in, .rlc-textgroup, .rlc-textgroup-in, .rlc-intro, .rlc-catslider-hd"
      )
      .each((i, group) => {
        if ($(group).children(".rlc-ab-container").length) return

        $(group)
          .children(".rlc-sub, .rlc-title, .rlc-dek, .rlc-brand")
          .each((i, el) => {
            if ($(el).is("a") || $(el).html().includes("rlc-ab-container"))
              return

            const textContent = $(el).text().trim()
            if (!textContent) return

            html += `
                ${i !== 0 ? "<span class='rlc-ab-divider'></span>" : ""}
                ${textContent}:<br>
                ${getFontDetails(el)}<br>
              `
          })

        if (!html.trim()) return
        addPositionToEl(group)

        let additionalCSS = 'style="'
        const slideParent = $(group).closest(".rlc-slide")

        if (slideParent.length) {
          additionalCSS += `--_max-width: min(${
            getCSSInt(slideParent, "width") - 48
          }px, 500px);`
        }

        // center ab-container if copy group is too big
        if (
          $(group).height() >=
          $(group).closest("article:not(.rlc-slide)").height() * 0.35
        ) {
          additionalCSS += "top: 50%;"
        }

        // update position if it's padding component
        if ($(container).closest(".rlc-padding").length) {
          additionalCSS += `margin-bottom: -${$(group).css("padding-top")};`
        }

        // update position if copy group is at top of the container
        if ($(container).offset().top - $(group).offset().top <= 120) {
          additionalCSS += `--_translateY: 0; bottom: unset; top: 0;`
        }

        // update position if copy group is at bottom of the container
        const blockContainer = $(container).closest(".rlc-block")
        if (
          $(container).offset().top -
            (blockContainer.offset().top + blockContainer.height()) <=
          50
        ) {
          additionalCSS += `--_translateY: 0; bottom: 0; top: unset;`
        }

        // center ab-container if copy group almost the same width of container
        if ($(document).width() - $(group).width() <= 10) {
          additionalCSS += `--_translateX: -50%; left: 50%;`
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
              additionalCSS += `--_translateX: -50%; left: 50%;`
            } else {
              additionalCSS += `--_translateX: ${$(group).css("padding-left")};`
            }
          }
        }

        additionalCSS += '"'

        $(group).append(createInfoContainer(html, additionalCSS))
        html = ""
      })
  })
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
    let html = ""
    const parent = $(el).parent()
    parent
      .children(".rlc-sub, .rlc-title, .rlc-dek, .rlc-brand")
      .each((i, el) => {
        if ($(el).is("a") || $(parent).html().includes("rlc-ab-container"))
          return

        html += `
            ${$(el).text()}:<br>
            ${getFontDetails(el)}<br>
            <span class='rlc-ab-divider'></span>
          `
      })

    if (!html.trim()) return
    addPositionToEl(parent)
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
    )
  })

  $(".rlc-header").each((i, el) => {
    if ($(el).html().includes("rlc-ab-container")) return
    $(el).append(
      createInfoContainer(`
          ${$(el).text()}:<br>
          ${getFontDetails(el)}<br>
        `)
    )
  })
}

function toggleFont() {
  isShowingFont ? hideFont() : showFont()
}

function hideFont() {
  const groupClasses =
    ".rlc-copygroup, .rlc-copygroup-in, .rlc-textgroup, .rlc-textgroup-in, .rlc-intro, .rlc-catslider-hd, .rlc-inner-catslider-hd"

  $(`:where(${groupClasses}) > .rlc-ab-container`).hide()
  $(
    `*:has(>.rlc-title:not(:where(${groupClasses}) .rlc-title)) > .rlc-ab-container`
  ).hide()
  $(
    `*:has(>.rlc-dek:not(:where(${groupClasses}) .rlc-dek)) > .rlc-ab-container`
  ).hide()
  $(".rlc-header > .rlc-ab-container").hide()
  isShowingFont = false
}

function showFont() {
  const groupClasses =
    ".rlc-copygroup, .rlc-copygroup-in, .rlc-textgroup, .rlc-textgroup-in, .rlc-intro, .rlc-catslider-hd, .rlc-inner-catslider-hd"

  $(`:where(${groupClasses}) > .rlc-ab-container`).show()
  $(
    `*:has(>.rlc-title:not(:where(${groupClasses}) .rlc-title)) > .rlc-ab-container`
  ).show()
  $(
    `*:has(>.rlc-dek:not(:where(${groupClasses}) .rlc-dek)) > .rlc-ab-container`
  ).show()
  $(".rlc-header > .rlc-ab-container").show()
  isShowingFont = true
}

// MARK: product color
function showProdColor() {
  $('[data-action="normalswatchescolor"]').each((i, item) => {
    const color = $(item).attr("data-selected")
    let html = `
      <div class="rlc-dev-color-container" data-color='${color}'>
        ${color}
      </div>
    `

    const parentEl = $(item).closest("li.variations-attribute")
    parentEl.prepend(html)
  })
}

function hideProdColor() {
  if (!$('[data-action="normalswatchescolor"]').length) return
  $(".rlc-dev-color-container").remove()
}

// MARK: VideoURL
function showVidUrl() {
  if (!$(".rlc-videocontainer").length) return

  $(".rlc-videocontainer").each((i, item) => {
    const videoUrl = $(item)
      .attr("data-video")
      .replaceAll("'", '"')
      .replaceAll("https:", "")
    const videoUrlJSON = JSON.parse(videoUrl)
    let html = `
      <div class="rlc-dev-video-container" data-video='${JSON.stringify(
        JSON.parse(videoUrl),
        null,
        4
      )}'>
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

        <div class='rlc-dev-icon' data-action='copy' data-state='idle'>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640">
            <path class='rlc-icon--default' d="M288 64C252.7 64 224 92.7 224 128L224 384C224 419.3 252.7 448 288 448L480 448C515.3 448 544 419.3 544 384L544 183.4C544 166 536.9 149.3 524.3 137.2L466.6 81.8C454.7 70.4 438.8 64 422.3 64L288 64zM160 192C124.7 192 96 220.7 96 256L96 512C96 547.3 124.7 576 160 576L352 576C387.3 576 416 547.3 416 512L416 496L352 496L352 512L160 512L160 256L176 256L176 192L160 192z"/>

            <path class='rlc-icon--success' d="M530.8 134.1C545.1 144.5 548.3 164.5 537.9 178.8L281.9 530.8C276.4 538.4 267.9 543.1 258.5 543.9C249.1 544.7 240 541.2 233.4 534.6L105.4 406.6C92.9 394.1 92.9 373.8 105.4 361.3C117.9 348.8 138.2 348.8 150.7 361.3L252.2 462.8L486.2 141.1C496.6 126.8 516.6 123.6 530.9 134z"/>
          </svg>
        </div>
      </a>
    `
    $(item).append(html)
  })
}

function hideVidUrl() {
  if (!$(".rlc-videocontainer .rlc-dev-video-container").length) return
  $(".rlc-videocontainer .rlc-dev-video-container").remove()
}

// MARK: Missing Image
function checkMissingImage(caid) {
  if (!window.hasCheckedMissingImage) {
    window.scrollTo({
      top: document.body.offsetHeight,
      left: 0,
      behavior: "smooth",
    })
  }

  setTimeout(() => {
    window.scrollTo(0, 0)

    const fallbackSrc = ""
    let missingImages = []

    let delay = 0
    const hasAutoSlider = !!$(`${caid} .rlc-autoslider`).length

    if (hasAutoSlider) {
      $(`${caid} .rlc-autoslider`).each((i, slider) => {
        const sliderWrapperEl = $(slider).find(".rlc-in")
        const totalSlide = sliderWrapperEl.find(".rlc-slide").length
        const sliderPauseBtn = $(slider).find(".rlc-looppause")[0]

        if (!$(slider).hasClass("user_paused")) {
          sliderPauseBtn.click()
        }

        window.gsap
          .getTweensOf(sliderWrapperEl.find(".rlc-slide"))[0]
          .parent.toIndex(totalSlide + 1, {
            duration: 0.5,
            ease: "power1.inOut",
          })
      })

      delay = 800
    }

    setTimeout(() => {
      $(`${caid} img`).each(function (i) {
        const img = $(this)
        if (img[0].naturalWidth === 0) {
          let parentEl = img.closest(".rlc-block")
          if (parentEl.hasClass("rlc-slide")) {
            parentEl = parentEl.parent()
          }

          const missingID = `rlc-missing-image--${i}`
          const imgUrl =
            img.attr("src") !== undefined ? img.attr("src") : img[0].currentSrc

          if (imgUrl) {
            missingImages.push({
              imgUrl: imgUrl,
              id: missingID,
            })

            img
              .addClass("rlc-dev-missing-img")
              .attr("id", missingID)
              .css("--_height", `${parentEl.height()}px`)
            // .css("background-image", `url(${fallbackSrc})`);
          }
        }
      })

      window.hasCheckedMissingImage = true

      if (!missingImages.length) {
        $('.rlc-dev-item[data-index="4"]')
          .addClass("rlc-disabled")
          .removeAttr("data-state")
          .attr("data-status", "no")
        return
      }

      let container = $("body")

      container.append(`
    <div class="rlc-dev-missing-image-container">
      <header class='rlc-dev-missing-image-header'>
        <h4 class='rlc-dev-missing-image-title'>
          Missing images found: 
        </h4>
        <div class='rlc-dev-copy-all'>
          Copy All
        </div>
      </header>
      <ul class="rlc-dev-missing-images">
        ${generateMissingImageItem(missingImages)}
      </ul>
      <div class="rlc-dev-icon" data-action="close">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640"><!--!Font Awesome Free v7.0.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc.--><path d="M183.1 137.4C170.6 124.9 150.3 124.9 137.8 137.4C125.3 149.9 125.3 170.2 137.8 182.7L275.2 320L137.9 457.4C125.4 469.9 125.4 490.2 137.9 502.7C150.4 515.2 170.7 515.2 183.2 502.7L320.5 365.3L457.9 502.6C470.4 515.1 490.7 515.1 503.2 502.6C515.7 490.1 515.7 469.8 503.2 457.3L365.8 320L503.1 182.6C515.6 170.1 515.6 149.8 503.1 137.3C490.6 124.8 470.3 124.8 457.8 137.3L320.5 274.7L183.1 137.4z"/></svg>
        </div>
    </div>
  `)

      showMissingImages()
    }, delay)
  }, 1000)
}

function generateMissingImageItem(missingImages) {
  const ordinalList = ["st", "nd", "rd"]

  return missingImages
    .map((img, _) => {
      const isSlide = !!$(`#${img.id}`).closest(".rlc-slide").length
      let slideParent = null
      let slideEl = null
      let slideIndex = null

      if (isSlide) {
        slideParent = $(`#${img.id}`).closest(".rlc-slide").parent()
        slideEl = $(`#${img.id}`).closest(".rlc-slide")[0]
        slideIndex = slideParent.find(".rlc-slide").index(slideEl)
      }

      const ordinal = slideIndex < 4 ? ordinalList[slideIndex] : "th"

      return `
    <li class='rlc-dev-missing-image' data-missing='#${img.id}'>
      <div class='rlc-dev-icon' data-action='copy' data-state='idle'>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640">
          <path class='rlc-icon--default' d="M288 64C252.7 64 224 92.7 224 128L224 384C224 419.3 252.7 448 288 448L480 448C515.3 448 544 419.3 544 384L544 183.4C544 166 536.9 149.3 524.3 137.2L466.6 81.8C454.7 70.4 438.8 64 422.3 64L288 64zM160 192C124.7 192 96 220.7 96 256L96 512C96 547.3 124.7 576 160 576L352 576C387.3 576 416 547.3 416 512L416 496L352 496L352 512L160 512L160 256L176 256L176 192L160 192z"/>

          <path class='rlc-icon--success' d="M530.8 134.1C545.1 144.5 548.3 164.5 537.9 178.8L281.9 530.8C276.4 538.4 267.9 543.1 258.5 543.9C249.1 544.7 240 541.2 233.4 534.6L105.4 406.6C92.9 394.1 92.9 373.8 105.4 361.3C117.9 348.8 138.2 348.8 150.7 361.3L252.2 462.8L486.2 141.1C496.6 126.8 516.6 123.6 530.9 134z"/>
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
  `
    })
    .join("")
}

function showMissingImages() {
  if ($(".rlc-dev-missing-image-container").is(":visible")) return
  $(".rlc-dev-missing-image-container").show()
}

function hideMissingImages() {
  if (!$(".rlc-dev-missing-image-container").is(":visible")) return
  $(".rlc-dev-missing-image-container").hide()
}
