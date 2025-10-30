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
    ".rlc-copygroup, .rlc-textgroup, .rlc-links, .rlc-back-arrow-group, .rlc-ul, .rlc-back-cta, #quickfilter-wrapper ul .filters-item, #rlc-stickynavbuttons .rlc-li"
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
      .children(
        ".rlc-pillbutton, .rlc-linecta, .rlc-target, .rlc-link, .filters-item-link, .rlc-link, a"
      )
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
        } else {
          adContainerCSS += "left: 50%; --_translateX: -50%;";
        }

        // fix sticky navbar right CTA
        if ($(el).parent().is("li")) {
          const containerEl = $(el).closest("ul").parent();
          if (
            Number.parseInt(containerEl.css("right")) < 100 ||
            containerEl.css("justify-content") === "flex-end"
          ) {
            adContainerCSS += "left: unset; right: 0; --_translateX: 0;";
          }
        }

        if (
          $(el).closest(
            ':where(.rlc-copygroup, .rlc-copygroup-in, .rlc-textgroup, .rlc-textgroup-in)[class*="pos-top"]'
          ).length
        ) {
          adContainerCSS += "top: 100%; --_translateY: 12px;";
        }

        if (checkIDTooLong(linkID)) {
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
  const breakpoint = 768;
  let isDesktop = window.matchMedia("(min-width: " + breakpoint + "px)");
  let device = isDesktop ? "desktop" : "mobile";

  $(".rlc-target.is-quick-shoppable").each((i, el) => {
    if (!$(el).hasClass("rlc-qs_ready")) {
      positionHandler(el, device);
    }
  });

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
  if ($(el).closest('[class*="flyout"]').length) {
    return true;
  }

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

  if (urlPart.includes("??")) {
    return `
      <span class="rlc-dev-err">Multiple ?, please remove</span>
    `;
  }

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
  const comingSoon = !!$(el).find(".rlc-cs").length;

  return `
    ${cgid ? cgid + "<br>" : ""}
    ${pid ? "◻️ PID: " + pid : ""}
    ${
      pid && outOfStock ? '<span class="rlc-dev-err">(Out of stock)</span>' : ""
    }
    ${
      pid && comingSoon ? '<span class="rlc-dev-err">(Coming soon)</span>' : ""
    }
    ${pid ? "<br>" : ""}
    ${productColor ? "◻️ Color: " + productColor + "<br>" : ""}
    ${filter ? "◻️ Filter: " + filterName + " = " + filterValue + "<br>" : ""}
  `;
}

function checkIDTooLong(ab) {
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