(function () {
  var WISHLIST_KEY = "umbra-wishlist-v1";

  function loadWishIds() {
    try {
      var raw = localStorage.getItem(WISHLIST_KEY);
      if (!raw) return [];
      var data = JSON.parse(raw);
      return Array.isArray(data) ? data : [];
    } catch (e) {
      return [];
    }
  }

  function saveWishIds(ids) {
    try {
      localStorage.setItem(WISHLIST_KEY, JSON.stringify(ids));
    } catch (e) {}
  }

  function isWished(id) {
    return loadWishIds().indexOf(id) >= 0;
  }

  function toggleWishId(id) {
    var ids = loadWishIds().slice();
    var i = ids.indexOf(id);
    if (i >= 0) ids.splice(i, 1);
    else ids.push(id);
    saveWishIds(ids);
  }

  function syncWishButton(card) {
    var id = card.getAttribute("data-product-id");
    var btn = card.querySelector(".product-card__wish");
    if (!btn || !id) return;
    var on = isWished(id);
    btn.setAttribute("aria-pressed", on ? "true" : "false");
    btn.textContent = on ? "♥" : "♡";
    btn.setAttribute("aria-label", on ? "Убрать из избранного" : "Добавить в избранное");
  }

  document.querySelectorAll(".product-card").forEach(function (card) {
    var id = card.getAttribute("data-product-id");
    var btn = card.querySelector(".product-card__wish");
    if (!btn || !id) return;
    syncWishButton(card);
    btn.addEventListener("click", function (e) {
      e.stopPropagation();
      toggleWishId(id);
      syncWishButton(card);
    });
  });
})();

(function () {
  var productModal = document.getElementById("product-modal");
  var productModalBackdrop = productModal && productModal.querySelector(".product-modal__backdrop");
  var productModalBack = document.getElementById("product-modal-back");
  var productModalImg = document.getElementById("product-modal-img");
  var productModalTitle = document.getElementById("product-modal-title");
  var productModalPrice = document.getElementById("product-modal-price");
  var productModalComposition = document.getElementById("product-modal-composition");
  var productModalSizeChart = document.getElementById("product-modal-size-chart");
  var productModalAdd = document.getElementById("product-modal-add");
  var productModalSizeBtns = productModal ? productModal.querySelectorAll(".product-modal__size") : [];
  var lastFocusedEl = null;

  var sizeChartModal = document.getElementById("size-chart-modal");
  var sizeChartBackdrop = sizeChartModal && sizeChartModal.querySelector(".size-chart-modal__backdrop");
  var sizeChartBack = document.getElementById("size-chart-modal-back");
  var sizeChartLastFocus = null;

  function closeSizeChartModal() {
    if (!sizeChartModal || !sizeChartModal.classList.contains("is-open")) return;
    sizeChartModal.classList.remove("is-open");
    sizeChartModal.setAttribute("aria-hidden", "true");
    if (sizeChartLastFocus && typeof sizeChartLastFocus.focus === "function") {
      sizeChartLastFocus.focus();
    }
    sizeChartLastFocus = null;
  }

  function openSizeChartModal() {
    if (!sizeChartModal) return;
    sizeChartLastFocus = document.activeElement;
    sizeChartModal.classList.add("is-open");
    sizeChartModal.setAttribute("aria-hidden", "false");
    if (sizeChartBack) sizeChartBack.focus();
  }

  function closeProductModal() {
    closeSizeChartModal();
    if (!productModal || !productModal.classList.contains("is-open")) return;
    productModal.classList.remove("is-open");
    productModal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("product-modal-open");
    if (lastFocusedEl && typeof lastFocusedEl.focus === "function") {
      lastFocusedEl.focus();
    }
    lastFocusedEl = null;
  }

  function openProductModal(card) {
    if (!productModal || !card) return;
    var img = card.querySelector(".product-card__thumb img");
    var nameEl = card.querySelector(".product-card__name");
    var priceEl = card.querySelector(".product-card__price");
    var composition = card.getAttribute("data-composition") || "—";
    if (img && productModalImg) {
      productModalImg.src = img.getAttribute("src") || "";
      productModalImg.alt = img.getAttribute("alt") || "";
    }
    if (nameEl && productModalTitle) productModalTitle.textContent = nameEl.textContent || "";
    if (priceEl && productModalPrice) productModalPrice.textContent = priceEl.textContent || "";
    if (productModalComposition) productModalComposition.textContent = composition;
    productModalSizeBtns.forEach(function (btn, i) {
      btn.classList.toggle("is-active", i === 0);
    });
    lastFocusedEl = document.activeElement;
    productModal.classList.add("is-open");
    productModal.setAttribute("aria-hidden", "false");
    document.body.classList.add("product-modal-open");
    if (productModalBack) productModalBack.focus();
  }

  document.querySelectorAll(".product-card").forEach(function (card) {
    var surface = card.querySelector(".product-card__surface");
    if (!surface) return;
    surface.addEventListener("click", function (e) {
      if (e.target.closest(".product-card__wish")) return;
      e.preventDefault();
      openProductModal(card);
    });
  });

  if (productModalBackdrop) {
    productModalBackdrop.addEventListener("click", function () {
      closeProductModal();
    });
  }
  if (productModalBack) {
    productModalBack.addEventListener("click", function () {
      closeProductModal();
    });
  }
  if (productModal) {
    productModal.addEventListener("click", function (e) {
      if (e.target === productModal) closeProductModal();
    });
  }
  if (productModalSizeChart) {
    productModalSizeChart.addEventListener("click", function (e) {
      e.stopPropagation();
      openSizeChartModal();
    });
  }

  if (sizeChartBackdrop) {
    sizeChartBackdrop.addEventListener("click", function () {
      closeSizeChartModal();
    });
  }
  if (sizeChartBack) {
    sizeChartBack.addEventListener("click", function () {
      closeSizeChartModal();
    });
  }
  if (sizeChartModal) {
    sizeChartModal.addEventListener("click", function (e) {
      if (e.target === sizeChartModal) closeSizeChartModal();
    });
  }
  if (productModalAdd) {
    productModalAdd.addEventListener("click", function () {
      var active = productModal && productModal.querySelector(".product-modal__size.is-active");
      var size = active && active.getAttribute("data-size") ? active.getAttribute("data-size") : "M";
      var name = productModalTitle ? productModalTitle.textContent.trim() : "";
      var priceText = productModalPrice ? productModalPrice.textContent : "";
      var priceRub = parseInt(String(priceText).replace(/[^\d]/g, ""), 10) || 0;
      var image = productModalImg ? productModalImg.getAttribute("src") || "" : "";
      if (window.UmbraCart) {
        window.UmbraCart.addLine({ name: name, size: size, priceRub: priceRub, image: image });
        if (typeof window.UmbraCart.flashAdded === "function") {
          window.UmbraCart.flashAdded();
        }
      }
      closeProductModal();
    });
  }
  productModalSizeBtns.forEach(function (btn) {
    btn.addEventListener("click", function () {
      productModalSizeBtns.forEach(function (b) {
        b.classList.toggle("is-active", b === btn);
      });
    });
  });

  var burger = document.getElementById("catalog-burger");
  var menu = document.getElementById("catalog-menu");
  var backdrop = menu ? menu.querySelector(".catalog-menu__backdrop") : null;
  var closeBtn = menu ? menu.querySelector(".catalog-menu__close") : null;

  function setOpen(open) {
    if (!menu || !burger) return;
    menu.classList.toggle("is-open", open);
    menu.setAttribute("aria-hidden", open ? "false" : "true");
    burger.setAttribute("aria-expanded", open ? "true" : "false");
    document.body.classList.toggle("catalog-menu-open", open);
    if (open) {
      closeBtn && closeBtn.focus();
    } else {
      burger.focus();
    }
  }

  document.addEventListener("keydown", function (e) {
    if (e.key !== "Escape") return;
    if (sizeChartModal && sizeChartModal.classList.contains("is-open")) {
      closeSizeChartModal();
      return;
    }
    var cartDrawer = document.getElementById("cart-drawer");
    if (cartDrawer && cartDrawer.classList.contains("is-open") && window.UmbraCart) {
      window.UmbraCart.closeDrawer();
      return;
    }
    if (productModal && productModal.classList.contains("is-open")) {
      closeProductModal();
      return;
    }
    if (menu && menu.classList.contains("is-open")) {
      setOpen(false);
    }
  });

  if (!burger || !menu) return;

  burger.addEventListener("click", function () {
    setOpen(!menu.classList.contains("is-open"));
  });
  if (backdrop) {
    backdrop.addEventListener("click", function () {
      setOpen(false);
    });
  }
  if (closeBtn) {
    closeBtn.addEventListener("click", function () {
      setOpen(false);
    });
  }
  menu.querySelectorAll(".catalog-menu__link").forEach(function (link) {
    link.addEventListener("click", function () {
      setOpen(false);
    });
  });
})();
