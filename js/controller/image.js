// MARK: Image
function generateImageInfo(caid) {
  $(`${caid} .rlc-image`).each((i, img) => {
    let imageContainer = $(img).closest(".rlc-imagery");
    if (!imageContainer.length) {
      imageContainer = $(img).closest(".rlc-picture");
    }
    const hasSource = !!imageContainer.find("source").length;

    const imageSource = {};
    if (hasSource) {
      imageSource.desktop = getImageName(
        imageContainer.find("source[class$=desktop]")[0]?.srcset
      );
      imageSource.mobile = getImageName(
        imageContainer.find("source[class$=mobile]")[0]?.srcset
      );
    } else {
      imageSource.all = getImageName(img.src || img.currentSrc);
    }

    let html = `
      <div class='rlc-dev-image-name-container'>
        ${imageSource.desktop ? "Desktop: " + imageSource.desktop + "<br>" : ""}
        ${imageSource.mobile ? "Mobile: " + imageSource.mobile + "<br>" : ""}
        ${imageSource.all ? "All: " + imageSource.all + "<br>" : ""}
        Size: ${$(img).width()}(w) x ${$(img).height()}(h) <br>
        Alt: ${$(img).attr("alt") || "[missing]"} 
      </div>
    `;

    imageContainer.append(html);
  });
}

function toggleImageInfo() {
  window.devHelperState.isShowingImageInfo ? hideImageName() : showImageName();

  window.devHelperState.isShowingImageInfo =
    !window.devHelperState.isShowingImageInfo;
}

function showImageName() {
  $(".rlc-dev-image-name-container").show();
}

function hideImageName() {
  $(".rlc-dev-image-name-container").hide();
}
