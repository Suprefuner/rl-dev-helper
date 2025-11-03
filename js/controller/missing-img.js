// MARK: Missing Image
function checkMissingImage(caid) {
  const scrollPos = $(window).scrollTop();

  if (!window.hasCheckedMissingImage) {
    window.scrollTo(0, document.body.offsetHeight);
  }

  setTimeout(() => {
    let missingImages = [];

    const hasAutoSlider = !!$(`${caid} .rlc-autoslider`).length;

    if (hasAutoSlider) {
      $(`${caid} .rlc-autoslider`).each((i, slider) => {
        const sliderWrapperEl = $(slider).find(".rlc-in");
        const totalSlide = sliderWrapperEl.find(".rlc-slide").length;
        const sliderPauseBtn = $(slider).find(".rlc-looppause")[0];

        if (
          !$(slider).hasClass("user_paused") &&
          sliderPauseBtn
        ) {
          sliderPauseBtn.click();
        }

        const tweenParent = window.gsap.getTweensOf(
          sliderWrapperEl.find(".rlc-slide")
        )[0].parent;

        // scroll to the fist item first and then the last item
        tweenParent.toIndex(0, {
          duration: 0.5,
          ease: "power1.inOut",
        });

        tweenParent.toIndex(totalSlide + 1, {
          duration: 0.5,
          ease: "power1.inOut",
          delay: 0.5,
        });
      });
    }

    window.scrollTo(0, scrollPos);

    $(`${caid} img`).each(function (i) {
      const img = $(this);
      if (img[0].naturalWidth === 0) {
        let parentEl = img.closest(".rlc-block");
        if (parentEl.hasClass("rlc-slide")) {
          parentEl = parentEl.parent();
        }

        const missingID = `rlc-missing-image--${i}`;
        const imgUrl =
          img.attr("src") !== undefined ? img.attr("src") : img[0].currentSrc;

        if (imgUrl) {
          missingImages.push({
            imgUrl: imgUrl,
            id: missingID,
          });

          img
            .addClass("rlc-dev-missing-img")
            .attr("id", missingID)
            .css("--_height", `${parentEl.height()}px`);
        }
      }
    });

    window.hasCheckedMissingImage = true;

    if (!missingImages.length) {
      updateNoMissingImage();
      return;
    } else {
      setTimeout(() => {
        // if there are missing images -> double check
        missingImages.forEach((img, i) => {
          const imgEl = $(`#${img.id}`);
          if (imgEl[0]?.naturalWidth !== 0) {
            removeMissingImageItemStyle(imgEl);

            missingImages[i].id = "";
            missingImages[i].imgUrl = "";
          }
        });

        missingImages = missingImages.filter((img) => img.id && img.imgUrl);

        if (!missingImages.length) {
          updateNoMissingImage();
          return;
        }

        generateMissingImageContainer(missingImages);
        showMissingImages();
      }, 500);
    }
  }, 500);
}

function generateMissingImageContainer(missingImages) {
  let container = $("body");

  container.append(`
    <div class="rlc-dev-missing-image-container">
      <header class='rlc-dev-missing-image-header'>
        <h4 class='rlc-dev-missing-image-title'>
          Missing images found: 
        </h4>
        
        <div class='rlc-dev-btns'>
          <div class='rlc-dev-copy-all'>
            Copy all
          </div>

          <div class='rlc-dev-check-again'>
            Check again
          </div>
        </div>
      </header>
      <ul class="rlc-dev-missing-images">
        ${generateMissingImageItem(missingImages)}
      </ul>
      <div class="rlc-dev-icon" data-action="close">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640">
            ${getIconPath("close")}
          </svg>
        </div>
    </div>
  `);
}

function generateMissingImageItem(missingImages) {
  const ordinalList = ["st", "nd", "rd"];

  return missingImages
    .map((img, _) => {
      const isSlide = !!$(`#${img.id}`).closest(".rlc-slide").length;
      let slideParent = null;
      let slideEl = null;
      let slideIndex = null;

      if (isSlide) {
        slideParent = $(`#${img.id}`).closest(".rlc-slide").parent();
        slideEl = $(`#${img.id}`).closest(".rlc-slide")[0];
        slideIndex = slideParent.find(".rlc-slide").index(slideEl);
      }

      const ordinal = slideIndex < 3 ? ordinalList[slideIndex] || "th" : "th";

      return `
        <li class='rlc-dev-missing-image' data-missing='#${img.id}'>
          <div class='rlc-dev-icon' data-action='copy' data-state='idle'>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640">
              ${getIconPath("copy")}
              ${getIconPath("success")}
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
      `;
    })
    .join("");
}

function removeMissingImageItemStyle(el) {
  $(el)
    .removeClass("rlc-dev-missing-img")
    .removeAttr("id")
    .css("--_height", "auto");
}

function updateNoMissingImage(devItem) {
  const missingImageDevItem = $('.rlc-dev-item.rlc-dev-item--missing-img');
  disableDevItem(missingImageDevItem);

  if (!missingImageDevItem.text().includes("✅")) {
    missingImageDevItem.append(" ✅");
  }

  $(".rlc-dev-missing-image-container").remove();
}

function showMissingImages() {
  $(".rlc-dev-missing-image-container").show();
}

function hideMissingImages() {
  $(".rlc-dev-missing-image-container").hide();
}

function toggleMissingImages() {
  window.devHelperState.isShowingMissingImages
    ? hideMissingImages()
    : showMissingImages();
  window.devHelperState.isShowingMissingImages =
    !window.devHelperState.isShowingMissingImages;
}
