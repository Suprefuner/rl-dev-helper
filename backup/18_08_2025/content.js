// Check activation state before running
chrome.storage.local.get(["isActive"], (result) => {
  if (!result.isActive) {
    return
  }

  window.rlcDevHelper = true

  const isPLP = !!$(".plp-content-slot").length
  let caid = isPLP
    ? ":where(.plp-content-slot, .ingrid)"
    : "#main .open-html-content:has(.rlc-creative_v3)"

  let isShowingAB = false;
  let isShowingFont = false;

  // Can add helper functions in the feature
  const helperList = [
    { name: "AB tagging", fn: "toggleAB" },
    { name: "font family", fn: "toggleFont" },
  ];

  helperInit();
  helperButtonInit();
  bindEvent();

  function helperInit() {
    $("<style>")
      .prop("type", "text/css")
      .html(`
        .rlc-dev-helper {
            --_offset: 20px;
            --_btn-size: 80px;
            position: fixed;
            left: var(--_offset);
            bottom: var(--_offset);
            z-index: 99;
        }
        button.rlc-btn--dev {
            width: var(--_btn-size);
            height: var(--_btn-size);
            margin-top: 0;
            padding: 6px;
            background-color: white;
            border-radius: 50%;
            box-shadow: 0 0 10px rgba(0, 0, 0, .2);
            transition: all .3s;
        }
        button.rlc-btn--dev .rlc-image {
            opacity: 1 !important;
            height: 100%;
            object-fit: contain;
        }
        .rlc-dev-helper[data-status='on'] button.rlc-btn--dev,
        button.rlc-btn--dev:hover {
            box-shadow: 0 0 0 5px #041e3a;
        }
        ul.rlc-dev-menu {
            width: 200px;
            list-style: none !important;
            margin: 0;
            padding: 6px;
            position: absolute;
            bottom: 0;
            left: 0;
            transform: translateY(calc(var(--_btn-size) * -1 - 16px));
            background-color: white;
            border-radius: 10px;
            box-shadow: 0 0 10px rgba(0, 0, 0, .5);
        }
        .rlc-dev-helper[data-status='off'] .rlc-dev-menu {
            display: none;
        }
        .rlc-dev-item+.rlc-dev-item {
            margin-top: 6px;
        }
        .rlc-dev-item {
            position: relative;
            padding: 4px 12px;
            color: white;
            font-size: 16px;
            line-height: 2;
            background-color: rgba(0, 0, 0, .5);
            cursor: pointer;
            border-radius: 6px;
            transition: background-color 0.3s ease;
        }
        li.rlc-dev-item {
            list-style-type: none !important;
        }
        .rlc-dev-item::before {
            content: attr(data-status);
        }
        .rlc-dev-item::marker {
            content: "";
            display: none !important;
        }
        .rlc-dev-item[data-state='on'],
        .rlc-dev-item:hover {
            background-color: #041e3a;
        }
        .rlc-ab-container {
            width: clamp(240px, 100%, 500px);
            height: max-content;
            padding: 10px;
            position: absolute;
            bottom: 100%;
            left: 50%;
            background-color: rgba(0,0,0,.3);
            border-radius: 10px;
            border: 1px solid #041e3a;
            backdrop-filter: blur(3px);
            font-family: "Founders Grotesk text Regular", Helvetica, Arial, sans-serif !important;
            font-size: 14px;
            color: white;
            text-align: left;
            text-transform: none;
            overflow-wrap: break-word;
            pointer-events: all;
            transition: background-color 0.3s;
            transform: translate(var(--_translateX, 0px), var(--_translateY, 0px))
        }
        .rlc-ab-container:hover {
            background-color: black;
            color: white;
            z-index: 99;
        }
        .rlc-pillbutton .rlc-ab-container:hover .rlc-textgroup .rlc-ab-font {
            color: white !important;
        }
        .rlc-slide .rlc-ab-container {
            max-width: var(--_max-width, calc(100% - 20px));
        }
        .rlc-slide :where(.rlc-pillbutton, .rlc-linecta, .rlc-target, a) .rlc-ab-container {
            width: clamp(200px, var(--_link-width, 0px) ,var(--_max-width, 500px));
            max-width: clamp(200px, var(--_link-width, 0px) ,var(--_max-width, 500px));
        }
        .rlc-ab-container * {
            text-transform: unset;
        }
        a .rlc-ab-container,
        .rlc-pillbutton .rlc-ab-container,
        .rlc-linecta .rlc-ab-container {
            top: unset;
            left: 0;
            bottom: 100%;
            --_translateY: -16px;
        }
        .rlc-hotspot .rlc-ab-container {
            top: 20px;
            left: 20px;
            transform: unset;
        }
        .rlc-bg_link .rlc-ab-container {
            top: 20px;
            left: 20px;
            transform: unset;
        }
        .rlc-cards .rlc-ab-container {
            left: unset;
            right: 20px;
        }
        header[class^='rlc-catslider'] .rlc-ab-container {
            top: 0;
            left: 0;
            bottom: unset;
        }
        .rlc-target .rlc-ab-container{
          --_max-width: 200px;
          --_link-width: 200px;
        }
        :where(.rlc-copygroup, .rlc-textgroup, .rlc-intro, .rlc-textgroup-in) > .rlc-ab-container {
          --_translateX: -50%;
          --_translateY: -12px;
        }
        .rlc-cards :where(.rlc-copygroup, .rlc-textgroup, .rlc-intro, .rlc-textgroup-in) > .rlc-ab-container {
            transform: none;
        }
        :where(.rlc-copygroup, .rlc-textgroup, .rlc-intro, .rlc-textgroup-in):where(.rlc-all-text-left, .rlc-desktop-text-left, .rlc-mobile-text-left) > .rlc-ab-container {
            transform: translate(var(--_translateX), -12px);
            left: 0;
        }
        .rlc-ab {
            color: black;
        }
        .rlc-ab-font {
            color: rgba(255,255,255,.5);
            font-size: 12px;
        }
        .rlc-show-overflow, 
        .rlc-show-overflow .rlc-hotspot,
        .rlc-show-overflow .rlc-linecta, 
        .rlc-show-overflow .rlc-target.rlc-instock{
          overflow: visible !important;
        }
    `)
      .appendTo("head");

    generateHotspotInfoContainer();
    generateBGLinkInfoContainer();
    generateCTAInfoContainer();
    generateQuickShopInfoContainer()

    $(`
        ${caid} *:has(>.rlc-copygroup),
        ${caid} *:has(>.rlc-textgroup),
        ${caid} *:has(>.rlc-intro),
        ${caid} *:has(>.rlc-catslider-hd)
    `).each((i, container) => {
      let html = "";
      $(container)
        .find(".rlc-copygroup, .rlc-copygroup-in, .rlc-textgroup, .rlc-textgroup-in, .rlc-intro, .rlc-catslider-hd")
        .each((i, group) => {
          if ($(group).children(".rlc-ab-container").length) return;

          $(group)
            .children(".rlc-sub, .rlc-title, .rlc-dek, .rlc-brand")
            .each((i, el) => {
              if ($(el).is("a") || $(el).html().includes("rlc-ab-container")) return;

              const textContent = $(el).text().trim();
              if (!textContent) return;

              html += `
              ${i !== 0 ? "---------------------------<br>" : ""}
              ${textContent}:<br>
              ${getFontFamily(el)}<br>
            `;
            });

          if (!html.trim()) return;
          addPositionToEl(group);

          let additionalCSS = 'style="';
          // const slideParent = $(group).closest(".rlc-slide")?.eq(0);
          const slideParent = $(group).closest(".rlc-slide");

          if (slideParent.length) {
            additionalCSS += `--_max-width: ${parseInt(slideParent.css("width")) - 48}px;`;
          }

          if ($(group).height() >= $(group).closest("article:not(.rlc-slide)").height() * 0.35) {
            additionalCSS += "top: 50%;";
          }

          if ($(container).closest(".rlc-padding").length) {
            additionalCSS += `margin-bottom: -${$(group).css("padding-top")};`;
          }

          if ($(container).offset().top - $(group).offset().top <= 120) {
            additionalCSS += `--_translateY: 0; bottom: unset; top: 0;`;
          }

          // if (
          //   (parseInt($(group).css('padding-left')) > 0 ||
          //   parseInt($(group).css('left')) > 0) && 
          //   parseInt($(group).css('margin-left')) === 0
          // ) {
          //   additionalCSS += `--_translateX: ${$(group).css('padding-left')};`;
          // }

          if (
            $(document).width() - $(group).width() <= 10 ||
            $(group).hasClass('rlc-copygroup-in') ||
            $(group).hasClass('rlc-textgroup-in') ||
            $(group).hasClass('rlc-all-pos-center')
          ) {
            additionalCSS += `--_translateX: -50%; left: 50%;`;
          }


          else if (
            (parseInt($(group).css('padding-left')) > 0 ||
              parseInt($(group).css('left')) > 0) &&
            parseInt($(group).css('margin-left')) === 0
          ) {

            if (parseInt($(group).width()) < parseInt($(slideParent).width() / 2)) {
              additionalCSS += `--_translateX: ${$(group).css('padding-left')};`;
            } else {
              if (
                $(group).hasClass('rlc-all-pos-center') ||
                $(document).width() - (parseInt($(group).width()) + parseInt($(group).css('padding-left') + parseInt($(group).css('padding-right')))) >= 10
              ) {
                additionalCSS += `--_translateX: -50%; left: 50%;`;
              } else {
                additionalCSS += `--_translateX: ${$(group).css('padding-left')};`;
              }
            }

            //  additionalCSS += `--_translateX: ${$(group).css('padding-left')};`;
          }

          additionalCSS += '"';

          $(group).append(createInfoContainer(html, additionalCSS));
          html = "";
        });
    });

    $(`
      ${caid} .rlc-title:not(:where(.rlc-copygroup, .rlc-copygroup-in, .rlc-textgroup, .rlc-textgroup-in, .rlc-intro, .rlc-catslider-hd) > .rlc-title),
      ${caid} .rlc-dek:not(:where(.rlc-copygroup, .rlc-copygroup-in, .rlc-textgroup, .rlc-textgroup-in, .rlc-intro, .rlc-catslider-hd) > .rlc-dek)
    `).each((i, el) => {
      let html = "";
      const parent = $(el).parent();
      parent
        .children(".rlc-sub, .rlc-title, .rlc-dek, .rlc-brand")
        .each((i, el) => {
          if ($(el).is("a") || $(parent).html().includes("rlc-ab-container")) return;

          html += `
            ${$(el).text()}:<br>
            ${getFontFamily(el)}<br>
            ---------------------------<br>
        `;
        });

      if (!html.trim()) return;
      addPositionToEl(parent);
      $(parent).append(createInfoContainer(html, `style="top: 0; ${parseInt($(document).width()) - (parseInt($(parent).width()) + parseInt($(parent).css('padding-left')) + parseInt($(parent).css('padding-right'))) < 10 ? '--_translateX: -50%;' : ''}"`));
    });

    $(".rlc-header").each((i, el) => {
      if ($(el).html().includes("rlc-ab-container")) return
      $(el).append(
        createInfoContainer(
          `
          ${$(el).text()}:<br>
          ${getFontFamily(el)}: <br>
      `,
          'style="--_translateX: -50%; --_translateY: -12px;"'
        )
      )
    })

    hideAB();
    hideFont();
  }

  function helperButtonInit() {
    if (!isPLP) {
      $("#main #rl-content .secondary-content .open-html-content .content-asset .rlc-creative_v3").append(`
        <div class="rlc-dev-helper" data-status="off">
            <button class="rlc-btn--dev">
                <img class="rlc-image" alt="Polo Ralph Lauren" loading="lazy"
                    src="https://staging-au.sfcc-ralphlauren-as.com/on/demandware.static/-/Library-Sites-RalphLauren_EU_Library/default/dwd5345650/img/Brand_Logo_Library/POLO/2021_polo_pony_navy.svg" />
            </button>
            <ul class="rlc-dev-menu">
                ${generateDevItems(helperList)}
            </ul>
        </div>
    `);
    } else {
      $(".plp").append(`
        <div class="rlc-dev-helper" data-status="off">
            <button class="rlc-btn--dev">
                <img class="rlc-image" alt="Polo Ralph Lauren" loading="lazy"
                    src="https://staging-au.sfcc-ralphlauren-as.com/on/demandware.static/-/Library-Sites-RalphLauren_EU_Library/default/dwd5345650/img/Brand_Logo_Library/POLO/2021_polo_pony_navy.svg" />
            </button>
            <ul class="rlc-dev-menu">
                ${generateDevItems(helperList)}
            </ul>
        </div>
    `);
    }


  }

  function bindEvent() {
    $(document).on('click.rlcDevHelper', ".rlc-btn--dev", devBtnHandler)
    $(document).on('click.rlcDevHelper', ".rlc-dev-item", (e) => devItemHandler(e, helperList))
  }
});

function cleanUp() {
  $(".rlc-dev-helper").remove();
  $(".rlc-ab-container").remove();
  $(document).off(".rlcDevHelper");
  $(document).off(".rlcDevHelper");

  removeZIndexFromCarousel();
}

function devBtnHandler(e) {
  if (!e.target.closest(".rlc-btn--dev")) return

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
  if (!e.target.closest(".rlc-dev-item")) return

  updateDevItemStatus(e.currentTarget);
  const index = $(e.target).attr("data-index");
  const item = helperList[index];
  const { fn } = item;

  if (typeof fn !== "function" && typeof window[fn] !== "function") {
    return console.error(`Function ${fn} is not defined.`);
  }

  if (typeof fn === "function") {
    item.fn();
  }

  if (typeof window[fn] === "function") {
    window[fn]();
  }

  const isOn = $(e.target).attr("data-state") === "on";
  $(e.target).attr("data-state", isOn ? "off" : "on");
}

function generateDevItems(list) {
  let html = "";
  list.forEach((item, i) => {
    html += `
        <li class="rlc-dev-item" data-index="${i}" data-status="show">
            ${" " + item.name}
        </li>
    `;
  });
  return html;
}

function generateHotspotInfoContainer() {
  $(".rlc-hotspot").each((i, el) => {
    if (checkInfoContainerExist(el) || shouldIgnoreLink(el)) return;

    addPositionToEl(el);

    let additionalCSS = 'style="';
    const slideParent = $(el).closest(".rlc-slide");
    if (slideParent.length) {
      if (parseInt(slideParent.css("padding-left")) > 0) {
        additionalCSS += `left: ${parseInt(slideParent.css("padding-left")) + 20}px;`;
      }

      if (parseInt(slideParent.css("width")) > $(window).width() / 3) {
        const paddingRight = slideParent.css("padding-right")
        additionalCSS += `--_link-width: calc(${slideParent.css("width")} - 40px ${paddingRight ? "- " + paddingRight : ""});`;
      }
    }

    additionalCSS += '"';

    $(el).html(createInfoContainer(getAB(el), additionalCSS));
  });
}

function generateBGLinkInfoContainer() {
  $(".rlc-bg_link").each((i, el) => {
    if (checkInfoContainerExist(el) || shouldIgnoreLink(el)) return;
    addPositionToEl(el);

    const slideParent = $(el).closest(".rlc-slide");

    let additionalCSS = 'style="'
    if (slideParent.length) {

      const slideWidth = slideParent.css('width')
      const slidePaddingRight = slideParent.css("padding-right")

      $(el).css('--_max-width', `calc(${slideWidth} - 40px - ${slidePaddingRight || 0})`)
    }
    additionalCSS = '"'
    $(el).append(createInfoContainer(getAB(el)));
  });
}

function generateCTAInfoContainer() {
  $(".rlc-links, .rlc-copygroup, .rlc-textgroup").each((i, linksContainer) => {
    if (checkInfoContainerExist(linksContainer)) return;

    const isTooManyLinks = checkTooManyLinks(linksContainer);

    if (isTooManyLinks) {
      let html = "";
      let CTAFont = "";
      $(linksContainer)
        .find(".rlc-pillbutton, .rlc-linecta, .rlc-target, a")
        .each((i, el) => {
          if (shouldIgnoreLink(el)) return
          const fontFamily = getFontFamily(el);
          const isSameFont = CTAFont === fontFamily;

          if (!isSameFont) {
            CTAFont = fontFamily;
          }

          const abTagging = getAB(el)

          html += `
              ${$(el).text()}: <br>
              ${!isSameFont ? getFontFamily(el) + ": <br>" : ""}
          `;

          if (abTagging) {
            html += `
              --------------------------<br>
              AB: <br>
              ${abTagging} <br>
              --------------------------<br>
            `
          }
        });

      addPositionToEl(linksContainer);
      addZIndexToCarousel(linksContainer);
      return;
    }

    $(linksContainer)
      .find(".rlc-pillbutton, .rlc-linecta, .rlc-target, a")
      .each((j, el) => {
        if (shouldIgnoreLink(el)) return
        addPositionToEl(el);
        addZIndexToCarousel(el);
        const abTagging = getAB(el)
        let adContainerCSS = 'style="'

        if ($(el).offset().left - $(linksContainer).offset().left > 50) {
          adContainerCSS += 'left: 50%; --_translateX: -50%;'
        }

        if (checkABTooLong(abTagging)) {
          adContainerCSS += `--_link-width: ${$(linksContainer).width()};`
        }

        adContainerCSS += '"'

        let html = `
            font: <br>
            ${getFontFamily(el)}: <br>
        `

        if (abTagging) {
          html += `
            --------------------------<br>
            AB: <br>
            ${abTagging}
          `
        }

        $(el).append(createInfoContainer(html, adContainerCSS));
      });
  });
}

function generateQuickShopInfoContainer() {
  $(".rlc-instock.rlc-target.is-quick-shoppable.rlc-qs_ready").each((i, el) => {
    if (checkInfoContainerExist(el)) return;
    addPositionToEl(el);
    $(el).append(createInfoContainer(getAB(el)));
  });
}

function shouldIgnoreLink(el) {
  return $(el).hasClass('rlc-tag_ignore') ||
    $(el).hasClass('rlc-page-anchors')
}

function createInfoContainer(ab, attr = "") {
  return `
      <div class="rlc-ab-container" ${attr}>
          <p class="rlc-p rlc-ab">${ab}</p>
      </div>
  `;
}

function checkInfoContainerExist(el) {
  return !!$(el).find(".rlc-ab-container").length;
}

function updateDevItemStatus(el) {
  const isShow = $(el).attr("data-status") === "show";
  $(el).attr("data-status", isShow ? "hide" : "show");
}

function getAB(el) {
  return !$(el).is("a") || !el.href.includes("?") ? "" : decodeURIComponent(el.href.split("com")[1]);
}

function checkABTooLong(ab) {
  return ab.length >= 120
}

function addPositionToEl(el) {
  if ($(el).css("position") !== "static" || $(el).hasClass("rlc-textgroup-in")) return;
  $(el).css("position", "relative");
}

function addZIndexToCarousel(el) {
  const carouselEl = $(el).closest(".rlc-carousel");
  if (!carouselEl || carouselEl.find(".rlc-carousel-dev-z-index").length) return;

  carouselEl.find(".rlc-slide").each((i, slide) => {
    $(slide).addClass("rlc-carousel-dev-z-index");
    $(slide).css("z-index", `-${i + 1}`);
  });
}

function showOverflow(el) {
  $(el).addClass('rlc-show-overflow')
}

function hideOverflow(el) {
  $('.rlc-show-overflow').removeClass('rlc-show-overflow')
}

function removeZIndexFromCarousel() {
  $(".rlc-carousel-dev-z-index").removeAttr("style").removeClass("rlc-carousel-dev-z-index");
}

function checkTooManyLinks(container) {
  return $(container).find(".rlc-pillbutton, .rlc-linecta, .rlc-target, a").length > 3;
}

function getFontFamily(el) {
  return ` ${window.getComputedStyle(el).getPropertyValue("font-family")}`;
}

function toggleAB() {
  isShowingAB ? hideAB() : showAB();
}

function hideAB() {
  $(":where(.rlc-links, .rlc-hotspot, .rlc-bg_link, :where(.rlc-copygroup, .rlc-textgroup) :where(.rlc-pillbutton, .rlc-linecta, .rlc-target, a)) > .rlc-ab-container, .rlc-linecta > .rlc-ab-container, .rlc-instock.rlc-target.is-quick-shoppable.rlc-qs_ready > .rlc-ab-container").hide();
  removeZIndexFromCarousel();
  hideOverflow()
  isShowingAB = false;
}

function showAB() {
  $(":where(.rlc-links, .rlc-hotspot, .rlc-bg_link, :where(.rlc-copygroup, .rlc-textgroup) :where(.rlc-pillbutton, .rlc-linecta, .rlc-target, a)) > .rlc-ab-container, .rlc-linecta > .rlc-ab-container, .rlc-instock.rlc-target.is-quick-shoppable.rlc-qs_ready > .rlc-ab-container").each((i, el) => {
    addZIndexToCarousel(el);

    const container = $(el).closest(".rlc-imagery").length
      ? $(el).closest('.rlc-imagery')
      : $(el).closest(':where(.rlc-copygroup, .rlc-textgroup, .rlc-copygroup-in, rlc-textgroup-in)')

    showOverflow(container)

    $(el).show();
  });
  isShowingAB = true;
}

function toggleFont() {
  isShowingFont ? hideFont() : showFont();
}

function hideFont() {
  $(":where(.rlc-copygroup, .rlc-copygroup-in, .rlc-textgroup, .rlc-textgroup-in, .rlc-intro, .rlc-catslider-hd, .rlc-inner-catslider-hd) > .rlc-ab-container").hide();
  $("*:has(>.rlc-title:not(:where(.rlc-copygroup, .rlc-copygroup-in, .rlc-textgroup, .rlc-textgroup-in, .rlc-intro, .rlc-catslider-hd, .rlc-inner-catslider-hd) .rlc-title)) > .rlc-ab-container").hide();
  $("*:has(>.rlc-dek:not(:where(.rlc-copygroup, .rlc-copygroup-in, .rlc-textgroup, .rlc-textgroup-in, .rlc-intro, .rlc-catslider-hd, .rlc-inner-catslider-hd) .rlc-dek)) > .rlc-ab-container").hide();
  $(".rlc-header > .rlc-ab-container").hide()
  isShowingFont = false;
}

function showFont() {
  $(":where(.rlc-copygroup, .rlc-copygroup-in, .rlc-textgroup, .rlc-textgroup-in, .rlc-intro, .rlc-catslider-hd, .rlc-inner-catslider-hd) > .rlc-ab-container").show();
  $("*:has(>.rlc-title:not(:where(.rlc-copygroup, .rlc-copygroup-in, .rlc-textgroup, .rlc-textgroup-in, .rlc-intro, .rlc-catslider-hd, .rlc-inner-catslider-hd) .rlc-title)) > .rlc-ab-container").show();
  $("*:has(>.rlc-dek:not(:where(.rlc-copygroup, .rlc-copygroup-in, .rlc-textgroup, .rlc-textgroup-in, .rlc-intro, .rlc-catslider-hd, .rlc-inner-catslider-hd) .rlc-dek)) > .rlc-ab-container").show();
  $(".rlc-header > .rlc-ab-container").show()
  isShowingFont = true;
}