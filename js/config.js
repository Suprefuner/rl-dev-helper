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
    isShowingCAInfo: false,
  };

  /*
    name: feature's name
    fn: feature's function name | feature's function
    status: show | hide (default: hide)
    checkError: CSS selectors for .rlc-dev-err
    validation: validate if should run function when click
  */
  window.helperList = [
    {
      name: "CGID/PID",
      fn: "toggleID",
      className: "id",
      checkError:
        ":where(a, .rlc-cta, .rlc-linecta, .rlc-pillbutton):has(.rlc-dev-err)",
    },
    {
      name: "font family",
      fn: "toggleFont",
      className: "font",
      checkError: "*:not(a):has(>.rlc-info-container .rlc-dev-err)",
    },
    {
      name: "image info",
      className: "image",
      fn: toggleImageInfo,
    },
    {
      name: "video URL",
      className: "video",
      fn: toggleVidUrl,
    },
    {
      name: "product colors",
      fn: toggleProdColor,
      className: "prod-color",
      validation: () => $('[data-action="normalswatchescolor"]').length,
    },
    {
      name: "missing images",
      fn: toggleMissingImages,
      className: "missing-img",
      status: "show",
    },
    {
      name: "slot CA",
      fn: toggleCAInfo,
      className: "ca",
      validation: () => window.isPLP,
    },
  ];
}
