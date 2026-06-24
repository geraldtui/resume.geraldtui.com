(function () {
  "use strict";

  var STORAGE_KEY = "resumeZoom";
  var MIN = 0.5;
  var MAX = 2;
  var STEP = 0.1;
  // Visual size of the "100%" default. 1.2 makes the default render at what
  // used to be the 120% size (the previous default was too small).
  var BASE_SCALE = 1.2;

  var wrapper = document.querySelector(".resume-wrapper");
  var viewport = document.querySelector(".zoom-viewport");
  var label = document.getElementById("zoomLevel");
  var inBtn = document.getElementById("zoomInButton");
  var outBtn = document.getElementById("zoomOutButton");

  if (!wrapper || !inBtn || !outBtn) {
    return;
  }

  function clamp(value) {
    return Math.min(MAX, Math.max(MIN, value));
  }

  function readStored() {
    var raw = parseFloat(localStorage.getItem(STORAGE_KEY));
    return isNaN(raw) ? 1 : clamp(raw);
  }

  var zoom = readStored();

  function apply() {
    var isMobile = window.innerWidth <= 900;
    
    // On mobile, don't apply zoom - let users use native pinch-to-zoom instead
    if (isMobile) {
      wrapper.style.transform = "none";
      if (viewport) {
        viewport.style.height = "auto";
      }
      return;
    }
    
    // Desktop: apply zoom transform
    var effective = zoom * BASE_SCALE;
    wrapper.style.transformOrigin = "top center";
    wrapper.style.transform = "scale(" + effective + ")";

    // Reserve layout space so scaled content doesn't overlap the page,
    // keeping scrollbars correct at any zoom level.
    if (viewport) {
      viewport.style.height = wrapper.offsetHeight * effective + "px";
    }

    if (label) {
      label.textContent = Math.round(zoom * 100) + "%";
    }
    outBtn.disabled = zoom <= MIN + 0.0001;
    inBtn.disabled = zoom >= MAX - 0.0001;
  }

  function setZoom(next) {
    zoom = clamp(Math.round(next * 100) / 100);
    localStorage.setItem(STORAGE_KEY, String(zoom));
    apply();
  }

  inBtn.addEventListener("click", function () {
    setZoom(zoom + STEP);
  });
  outBtn.addEventListener("click", function () {
    setZoom(zoom - STEP);
  });

  // Recompute reserved height when fonts/images finish loading or on resize.
  window.addEventListener("load", apply);
  window.addEventListener("resize", apply);

  apply();
})();
