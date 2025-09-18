// Check activation state before running
chrome.storage.local.get(["isActive"], (result) => {
  if (!result.isActive) return
  window.rlcDevHelper = true

  const isPLP = !!$(".plp-content-slot").length
  let caid = isPLP
    ? ":where(.plp-content-slot, .ingrid)"
    : "#main .open-html-content:has(.rlc-creative_v3)"

  const devHelperState = {
    isShowingAB: false,
    isShowingFont: false,
    isShowingProdColor: false,
  }
  // let isShowingAB = false
  // let isShowingFont = false
  // let isShowingProdColor = false

  // Can add helper functions in the future
  const helperList = [
    { name: "AB tagging", fn: "toggleAB" },
    { name: "font family", fn: "toggleFont" },
    { name: "product colors", fn: toggleProdColor },
  ]

  helperInit()
  helperButtonInit()
  bindEvent()

  function helperInit() {
    generateHotspotInfoContainer()
    generateBGLinkInfoContainer()
    generateCTAInfoContainer()
    generateQuickShopInfoContainer()

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
                additionalCSS += `--_translateX: ${$(group).css(
                  "padding-left"
                )};`
              }
            }
          }
          // if ($(document).width() - $(group).width() <= 10) {
          //   additionalCSS += `--_translateX: -50%; left: 50%;`
          // } else if (
          //   (parseInt($(group).css("padding-left")) > 0 || parseInt($(group).css("left")) > 0) &&
          //   parseInt($(group).css("margin-left")) === 0
          // ) {
          //   if (parseInt($(group).width()) >= parseInt($(slideParent).width() / 2)) {
          //     if (
          //       $(group).hasClass("rlc-all-pos-center") ||
          //       $(document).width() - (parseInt($(group).width()) +
          //           parseInt($(group).css("padding-left") + parseInt($(group).css("padding-right")))) >= 10
          //     ) {
          //       additionalCSS += `--_translateX: -50%; left: 50%;`
          //     } else {
          //       additionalCSS += `--_translateX: ${$(group).css(
          //         "padding-left"
          //       )};`
          //     }
          //   }
          // }

          additionalCSS += '"'

          $(group).append(createInfoContainer(html, additionalCSS))
          html = ""
        })
    })

    $(`
      ${caid} .rlc-title:not(:where(.rlc-copygroup, .rlc-copygroup-in, .rlc-textgroup, .rlc-textgroup-in, .rlc-intro, .rlc-catslider-hd) > .rlc-title),
      ${caid} .rlc-dek:not(:where(.rlc-copygroup, .rlc-copygroup-in, .rlc-textgroup, .rlc-textgroup-in, .rlc-intro, .rlc-catslider-hd) > .rlc-dek)
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
            parseInt($(document).width()) - parseInt($(parent).outerWidth()) <
            10
              ? "--_translateX: -50%;"
              : ""
          }"
          `
        )
      )
    })

    // $(".rlc-header").each((i, el) => {
    //   if ($(el).html().includes("rlc-ab-container")) return
    //   $(el).append(
    //     createInfoContainer(`
    //       ${$(el).text()}:<br>
    //       ${getFontDetails(el)}<br>
    //     `,
    //       'style="--_translateX: -50%; --_translateY: -12px;"'
    //     )
    //   )
    // })
    $(".rlc-header").each((i, el) => {
      if ($(el).html().includes("rlc-ab-container")) return
      $(el).append(
        createInfoContainer(`
          ${$(el).text()}:<br>
          ${getFontDetails(el)}<br>
        `)
      )
    })

    hideAB()
    hideFont()
  }

  function helperButtonInit() {
    // let container = $("#main #rl-content .secondary-content .open-html-content .content-asset .rlc-creative_v3").length
    //   ? $("#main #rl-content .secondary-content .open-html-content .content-asset .rlc-creative_v3")
    //   : $("#main #rl-content .open-html-content .content-asset .rlc-creative_v3")
    let container = $('body')

    if (isPLP) {
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
          ${generateDevItems(helperList)}
        </ul>
      </div>
    `)
  }

  function bindEvent() {
    $(document).on("click.rlcDevHelper", ".rlc-btn--dev", devBtnHandler)
    $(document).on("click.rlcDevHelper", ".rlc-dev-item", (e) =>
      devItemHandler(e, helperList)
    )

    $(document).on('click', '.rl-toaster-close', () => {
      console.log('close');
      // hideProdColor()
      // state.isShowingProdColor = false
      // $('.rlc-dev-item[data-index="2"]').attr('data-state', 'off')
    })
    
    $(document).on('click', '.rlc-dev-color-container', async function(e){
      try {
        await navigator.clipboard.writeText($(this).attr('data-color'));
        console.log('copied');
      } catch (error) {
        console.log('something went wrong to copy');
      }
    })
  }

  function toggleProdColor() {
    devHelperState.isShowingProdColor ? hideProdColor() : showProdColor()
    devHelperState.isShowingProdColor = !devHelperState.isShowingProdColor
  }
})

function cleanUp() {
  $(".rlc-dev-helper").remove()
  $(".rlc-ab-container").remove()
  $(document).off(".rlcDevHelper")
  $(document).off(".rlcDevHelper")

  removeZIndexFromCarousel()
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
  if (!e.target.closest(".rlc-dev-item")) return

  updateDevItemStatus(e.currentTarget)
  const index = $(e.target).attr("data-index")
  const item = helperList[index]
  const { fn } = item

  if (typeof fn !== "function" && typeof window[fn] !== "function") {
    return console.error(`Function ${fn} is not defined.`)
  }

  if (typeof fn === "function") {
    item.fn()
  }

  if (typeof window[fn] === "function") {
    window[fn]()
  }

  const isOn = $(e.target).attr("data-state") === "on"
  $(e.target).attr("data-state", isOn ? "off" : "on")
}

function generateDevItems(list) {
  let html = ""
  list.forEach((item, i) => {
    html += `
      <li class="rlc-dev-item" data-index="${i}" data-status="show">
          ${" " + item.name}
      </li>
    `
  })
  return html
}

function generateHotspotInfoContainer() {
  $(".rlc-hotspot").each((i, el) => {
    if (checkInfoContainerExist(el) || shouldIgnoreLink(el)) return

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

    $(el).html(createInfoContainer(getAB(el), additionalCSS))
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
    $(el).append(createInfoContainer(getAB(el), additionalCSS))
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

          const abTagging = getAB(el)

          html += `
            ${$(el).text()}: <br>
            ${!isSameFont ? getFontDetails(el) + "<br>" : ""}
          `

          if (abTagging) {
            html += `
              <span class='rlc-ab-divider' style='opacity: 0.5;'></span>
              🔍 AB Tagging: <br>
              ${abTagging} <br>
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
        const abTagging = getAB(el)
        let adContainerCSS = 'style="'
        const containerClasses =
          ".rlc-copygroup, .rlc-copygroup-in, .rlc-textgroup, .rlc-textgroup-in, .rlc-product-tile, .rlc-50-50__block, .rlc-block"

        // adContainerCSS += `--_max-width: ${$(el).closest(`:where(${containerClasses})`).width() - 12}px;`

        // if(slideParent.width() > $(window).width() / 1.2){
        //   additionalCSS += `--_link-width: 500px;`
        // } else if (slideParent.width() > $(window).width() / 3) {
        //   additionalCSS += `--_link-width: ${slideParent.width() - 40 - getCSSInt(slideParent, "padding-right")}px;`
        // } else {
        //   additionalCSS += `--_link-width: calc(100% - 60px);`
        // }
        // adContainerCSS += `--_link-width: ${$(el).closest(`:where(${containerClasses})`).width() - 12}px;`

        // adContainerCSS += `--_max-width: ${$(linksContainer).width() - 12}px;`

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
        // adContainerCSS += `--_link-width: ${$(el).closest(`:where(${containerClasses})`).width() - 12}px;`

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

        if (checkABTooLong(abTagging)) {
          adContainerCSS += `--_link-width: ${$(linksContainer).width()}px;`
        }

        if($(el).closest('a').css('overflow') === 'hidden'){
          adContainerCSS += `overflow: visible;`
        }

        adContainerCSS += '"'

        let html = `
            🔍 font: <br>
            ${getFontDetails(el)} <br>
        `

        if (abTagging) {
          html += `
            <span class='rlc-ab-divider'></span>
            🔍 AB Tagging: <br>
            ${abTagging}
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

    $(el).append(createInfoContainer(getAB(el), adContainerCSS))
  })
}

function shouldIgnoreLink(el) {
  return $(el).hasClass("rlc-tag_ignore") || $(el).hasClass("rlc-page-anchors")
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

function updateDevItemStatus(el) {
  const isShow = $(el).attr("data-status") === "show"
  $(el).attr("data-status", isShow ? "hide" : "show")
}

function getAB(el) {
  if (!$(el).is("a") || !el.href.includes("?")) {
    return ""
  }

  const urlPart = el.href.includes(".co.")
    ? decodeURIComponent(el.href.split(".co")[1])
    : decodeURIComponent(el.href.split(".com")[1])

  let [cgid, tagging] = urlPart.split("?")
  let pid = null
  let productColor = null

  if (cgid?.includes("search")) {
    cgid = `<span class='rlc-dev-err'>${
      urlPart.split("search?")[1].split("&")[0]
    }</span>`
  }

  // PID handling
  if (cgid?.includes(".html")) {
    pid = cgid.split("-").at(-1).split(".html")[0]
    productColor = decodeURIComponent(
      urlPart.split("?")[1].split("?")[0].split("&")[0].split("colorname=")[1]
    )
    productColor = productColor === "undefined" && null
    cgid = null
  }
  const filter = tagging?.includes("prefn") ? tagging.split("?")[0] : null
  const filterName = filter ? filter.split("&")[0].split("=")[1] : null
  const filterValue = filter ? filter.split("&")[1].split("=")[1] : null
  const abTagging = urlPart?.includes("ab=") ? urlPart.split("ab=")[1] : null

  const outOfStock = !!$(el).closest(".notinstock").length

  return `
    ${cgid ? "◻️ CGID: " + cgid + "<br>" : ""}
    ${pid ? "◻️ PID: " + pid : ""}
    ${
      pid && outOfStock ? '<span class="rlc-dev-err">(Out of stock)</span>' : ""
    }
    ${pid ? "<br>" : ""}
    ${productColor ? "◻️ Color: " + productColor + "<br>" : ""}
    ${filter ? "◻️ Filter: " + filterName + " = " + filterValue + "<br>" : ""}
    ◻️ Tag: ${abTagging}
  `
}

function checkABTooLong(ab) {
  return ab.length >= 120
}

function addPositionToEl(el) {
  if ($(el).css("position") !== "static" || $(el).hasClass("rlc-textgroup-in"))
    return
  $(el).css("position", "relative")
}

function addZIndexToCarousel(el) {
  const carouselEl = $(el).closest(".rlc-carousel")
  if (
    !carouselEl ||
    carouselEl.find(".rlc-carousel-dev-z-index").length ||
    carouselEl.find(".rlc-slide .rlc-background").length
  )
    return

  carouselEl.find(".rlc-slide").each((i, slide) => {
    $(slide).addClass("rlc-carousel-dev-z-index")
    $(slide).css("z-index", `-${i + 1}`)
  })
}

function showOverflow(el) {
  $(el).addClass("rlc-show-overflow")
}

function hideOverflow(el) {
  $(".rlc-show-overflow").removeClass("rlc-show-overflow")
}

function removeZIndexFromCarousel() {
  $(".rlc-carousel-dev-z-index")
    .removeAttr("style")
    .removeClass("rlc-carousel-dev-z-index")
}

function checkTooManyLinks(container) {
  return (
    $(container).find(".rlc-pillbutton, .rlc-linecta, .rlc-target, a").length >
    3
  )
}

function getFontDetails(el) {
  return `
   ◻️ family: ${window
     .getComputedStyle(el)
     .getPropertyValue("font-family")} <br>
   ◻️ size: ${window.getComputedStyle(el).getPropertyValue("font-size")}
  `
}

function toggleAB() {
  isShowingAB ? hideAB() : showAB()
}

function hideAB() {
  $(
    ":where(.rlc-links, .rlc-hotspot, .rlc-bg_link, :where(.rlc-copygroup, .rlc-textgroup) :where(.rlc-pillbutton, .rlc-linecta, .rlc-target, a)) > .rlc-ab-container, .rlc-linecta > .rlc-ab-container, .rlc-target.is-quick-shoppable.rlc-qs_ready > .rlc-ab-container"
  ).hide()
  removeZIndexFromCarousel()
  hideOverflow()
  isShowingAB = false
}

function showAB() {
  $(
    ":where(.rlc-links, .rlc-hotspot, .rlc-bg_link, :where(.rlc-copygroup, .rlc-textgroup) :where(.rlc-pillbutton, .rlc-linecta, .rlc-target, a)) > .rlc-ab-container, .rlc-linecta > .rlc-ab-container, .rlc-target.is-quick-shoppable.rlc-qs_ready > .rlc-ab-container"
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

function getCSSInt(el, prop) {
  return parseInt($(el).css(prop))
}

function showProdColor() {
  if (!$('[data-action="normalswatchescolor"]').length) return
  
  $('[data-action="normalswatchescolor"]').each((i, item) => {
    const color = $(item).attr('data-selected')
    let html = `
      <div class="rlc-dev-color-container" data-color='${color}'>
        ${color}
      </div>
    `

    const parentEl = $(item).closest('li.variations-attribute')
    parentEl.prepend(html)
  })
}

function hideProdColor() {
  console.log("hide color")
  if (!$('[data-action="normalswatchescolor"]').length) return
  $('.rlc-dev-color-container').remove()
}