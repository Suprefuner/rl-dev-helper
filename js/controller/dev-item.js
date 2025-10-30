// MARK: dev helper
function helperButtonInit() {
  let container = $("body");

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
        class="rlc-dev-item rlc-dev-item--${item.className}" 
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

