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
        ".rlc-copygroup, .rlc-copygroup-in, .rlc-textgroup, .rlc-textgroup-in, .rlc-intro, .rlc-catslider-hd, .rlc-in"
      )
      .each((i, group) => {
        if ($(group).children(".rlc-info-container").length) {
          return;
        }

        $(group)
          .children(
            ".rlc-sub, .rlc-title, .rlc-dek, .rlc-brand, .rlc-copy, .rlc-quote, .rlc-sig, .rlc-label, h2"
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

        if (
          $(group).css('flex-direction', 'column') &&
          $(group).css('justify-content', 'center') 
        ) {
          additionalCSS += `--_translateY: -50%; top: 50%;`;
        }

        // update position if copy group is at bottom of the container
        const blockContainer = $(container).closest(".rlc-block");
        if (
          blockContainer.length &&
          $(container).offset().top -
            (blockContainer.offset().top + blockContainer.height()) <=
            50
        ) {
          if(
            $(group).css('flex-direction') !== 'column' &&
            $(group).css('justify-content') !== 'center' 
          ) {
            additionalCSS += `--_translateY: 0; bottom: 0; top: unset;`;
          }
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
      ${caid} h2:not(
        :where(
          .rlc-copygroup, 
          .rlc-copygroup-in, .rlc-textgroup, 
          .rlc-textgroup-in, .rlc-intro, 
          .rlc-catslider-hd
        ) > h2),
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
    ".rlc-copygroup, .rlc-copygroup-in, .rlc-textgroup, .rlc-textgroup-in, .rlc-intro, .rlc-catslider-hd, .rlc-inner-catslider-hd, .rlc-copy, .rlc-copy-inner";

  $(`:where(${groupClasses}) > .rlc-info-container`).hide();
  $(`:where(${groupClasses}) .rlc-title ~ .rlc-info-container`).hide();
  $(`:where(${groupClasses}) .rlc-dek ~ .rlc-info-container`).hide();
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
    ".rlc-copygroup, .rlc-copygroup-in, .rlc-textgroup, .rlc-textgroup-in, .rlc-intro, .rlc-catslider-hd, .rlc-inner-catslider-hd, .rlc-copy, .rlc-copy-inner";

  $(`:where(${groupClasses}) > .rlc-info-container`).show();
  $(`:where(${groupClasses}) .rlc-title ~ .rlc-info-container`).show();
  $(`:where(${groupClasses}) .rlc-dek ~ .rlc-info-container`).show();
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