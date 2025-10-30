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

function toggleProdColor() {
  if (!$('[data-action="normalswatchescolor"]').length) return;

  window.devHelperState.isShowingProdColor ? hideProdColor() : showProdColor();
  window.devHelperState.isShowingProdColor =
    !window.devHelperState.isShowingProdColor;
}

function checkIfProdColor() {
  const devItem = $('.rlc-dev-item.rlc-dev-item--prod-color');
  !$('[data-action="normalswatchescolor"]').length
    ? disableDevItem(devItem)
    : enableDevItem(devItem);
}