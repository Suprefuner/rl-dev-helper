function generateCAInfo() {
  // MB
  const mbSlot = $(
    ".open-html-content:has(.rlc-creative_v3):has(.rlc-redesign-fy25)"
  );
  const mbEl = mbSlot.eq(0).find("section > article");
  const mbCA = mbEl.attr("id").replace("rlcid-", "");

  mbEl.append(generateCAHTML(mbCA));

  // In-grid
  $(`.ingrid`).each((i, ingrid) => {
    const ingridEl = $(ingrid).find(">div");
    const ingridContentEl = $(ingridEl).find("> section > article");
    const ingridCA = ingridEl?.attr("id")?.replaceAll("rlcid-", "");

    ingridContentEl.append(generateCAHTML(ingridCA));
  });
}

function toggleCAInfo() {
  window.devHelperState.isShowingCAInfo ? hideCA() : showCA();

  window.devHelperState.isShowingCAInfo =
    !window.devHelperState.isShowingCAInfo;
}

function showCA() {
  $(".rlc-info-container[data-type='ca']").show();
}

function hideCA() {
  $(".rlc-info-container[data-type='ca']").hide();
}


function generateCAHTML(ca) {
  return `
      <div class='rlc-info-container' data-type='ca'>
        ${ca}
      </div>
    `;
}

function checkIfPLP() {
  const devItem = $('.rlc-dev-item.rlc-dev-item--ca');
  !$('.ingrid').length
    ? disableDevItem(devItem)
    : enableDevItem(devItem);
}