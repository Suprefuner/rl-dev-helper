// MARK: VideoURL
function showVidUrl() {
  if (!$(".rlc-videocontainer").length) return;

  $(".rlc-videocontainer").each((i, item) => {
    const videoUrl = $(item)
      .attr("data-video")
      .replaceAll("'", '"')
      .replaceAll("https:", "");
    const videoUrlJSON = JSON.parse(videoUrl);

    let html = `
      <div class="rlc-dev-video-container" data-video="${JSON.stringify(
        videoUrlJSON
      ).replaceAll('"', "'")}">
        <div class='rlc-dev-video-item'>
          <span>
            mobile: 
          </span>
          <a href='https:${videoUrlJSON.mobile}' target='_blank'>
            ${videoUrlJSON.mobile}
          </a>
        </div>
        <div class='rlc-dev-video-item'>
          <span>
            desktop: 
          </span>
          <a href='https:${videoUrlJSON.desktop}' target='_blank'>
            ${videoUrlJSON.desktop}
          </a>
        </div>

        <a href="#" class='rlc-dev-icon' data-action='copy' data-state='idle'>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640">
            ${getIconPath("copy")}
            ${getIconPath("success")}
          </svg>
        </a>
      </a>
    `;
    $(item).append(html);
  });
}

function hideVidUrl() {
  if (!$(".rlc-videocontainer .rlc-dev-video-container").length) return;
  $(".rlc-videocontainer .rlc-dev-video-container").remove();
}

function toggleVidUrl() {
  window.devHelperState.isShowingVidUrl ? hideVidUrl() : showVidUrl();
  window.devHelperState.isShowingVidUrl =
    !window.devHelperState.isShowingVidUrl;
}

function checkIfVid() {
  if (!$(".rlc-videocontainer").length) {
    disableDevItem($('.rlc-dev-item.rlc-dev-item--video'));
  }
}