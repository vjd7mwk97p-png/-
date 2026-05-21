(function () {
  var STORAGE_KEY = "umbra-cart-v1";
  var drawer = document.getElementById("cart-drawer");
  if (!drawer) return;

  var backdrop = drawer.querySelector(".cart-drawer__backdrop");
  var panel = drawer.querySelector(".cart-drawer__panel");
  var backBtn = document.getElementById("cart-drawer-back");
  var listEl = document.getElementById("cart-drawer-list");
  var emptyEl = document.getElementById("cart-drawer-empty");
  var cartTriggers = document.querySelectorAll(".top-bar__link--cart");
  var footerEl = document.getElementById("cart-drawer-footer");
  var totalNumEl = document.getElementById("cart-drawer-total-num");
  var lastFocus = null;
  var flashTimer = null;

  function loadCart() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      var data = JSON.parse(raw);
      return Array.isArray(data) ? data : [];
    } catch (e) {
      return [];
    }
  }

  function saveCart(items) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch (e) {}
  }

  function formatPriceSpaces(rub) {
    var n = Math.max(0, Math.floor(Number(rub)) || 0);
    return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  }

  function lineId(name, size) {
    return String(name || "").trim() + "::" + String(size || "").trim();
  }

  function sizeLabel(size) {
    var s = String(size || "").trim() || "—";
    return "Размер " + s;
  }

  function flashAdded() {
    var nodes = document.querySelectorAll(".top-bar__link--cart");
    nodes.forEach(function (el) {
      el.classList.add("is-cart-added-flash");
    });
    if (flashTimer) clearTimeout(flashTimer);
    flashTimer = setTimeout(function () {
      flashTimer = null;
      document.querySelectorAll(".top-bar__link--cart").forEach(function (el) {
        el.classList.remove("is-cart-added-flash");
      });
    }, 700);
  }

  function openDrawer() {
    lastFocus = document.activeElement;
    drawer.classList.add("is-open");
    drawer.setAttribute("aria-hidden", "false");
    document.body.classList.add("cart-drawer-open");
    if (backBtn) backBtn.focus();
  }

  function closeDrawer() {
    if (!drawer.classList.contains("is-open")) return;
    drawer.classList.remove("is-open");
    drawer.setAttribute("aria-hidden", "true");
    document.body.classList.remove("cart-drawer-open");
    if (lastFocus && typeof lastFocus.focus === "function") {
      lastFocus.focus();
    }
    lastFocus = null;
  }

  function render() {
    var items = loadCart();
    if (!listEl || !emptyEl) return;
    listEl.innerHTML = "";
    var total = items.reduce(function (acc, it) {
      return acc + (it.priceRub || 0) * (it.qty || 0);
    }, 0);
    if (totalNumEl) totalNumEl.textContent = formatPriceSpaces(total);
    if (footerEl) footerEl.hidden = items.length === 0;

    if (items.length === 0) {
      emptyEl.hidden = false;
      return;
    }
    emptyEl.hidden = true;
    items.forEach(function (item) {
      var li = document.createElement("li");
      li.className = "cart-drawer__item";
      li.setAttribute("data-id", item.id);
      var priceMain = formatPriceSpaces(item.priceRub);
      li.innerHTML =
        '<div class="cart-drawer__item-media">' +
        '<img src="' +
        escapeAttr(item.image) +
        '" alt="" width="96" height="120" loading="lazy" />' +
        "</div>" +
        '<div class="cart-drawer__item-main">' +
        '<div class="cart-drawer__item-price">' +
        '<span class="cart-drawer__price-num">' +
        priceMain +
        "</span>" +
        '<span class="cart-drawer__price-unit" aria-hidden="true">руб</span>' +
        "</div>" +
        '<p class="cart-drawer__item-name">' +
        escapeHtml(item.name) +
        "</p>" +
        '<p class="cart-drawer__item-meta">' +
        escapeHtml(sizeLabel(item.size)) +
        "</p>" +
        '<div class="cart-drawer__item-qty">' +
        '<button type="button" class="cart-drawer__qty-btn" data-cart-dec aria-label="Уменьшить количество">−</button>' +
        '<span class="cart-drawer__qty-val" aria-live="polite">' +
        String(item.qty) +
        "</span>" +
        '<button type="button" class="cart-drawer__qty-btn" data-cart-inc aria-label="Увеличить количество">+</button>' +
        "</div>" +
        "</div>";
      listEl.appendChild(li);
    });
  }

  function escapeAttr(s) {
    return String(s || "")
      .replace(/&/g, "&amp;")
      .replace(/"/g, "&quot;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  function escapeHtml(s) {
    return String(s || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function setQty(id, delta) {
    var items = loadCart();
    var next = items
      .map(function (it) {
        if (it.id !== id) return it;
        var q = Math.max(0, (it.qty || 0) + delta);
        return q === 0 ? null : Object.assign({}, it, { qty: q });
      })
      .filter(Boolean);
    saveCart(next);
    render();
  }

  function addLine(payload) {
    var name = (payload && payload.name) || "";
    var size = (payload && payload.size) || "M";
    var priceRub = Math.max(0, parseInt(payload && payload.priceRub, 10) || 0);
    var image = (payload && payload.image) || "";
    var id = lineId(name, size);
    var items = loadCart();
    var found = false;
    var merged = items.map(function (it) {
      if (it.id !== id) return it;
      found = true;
      return Object.assign({}, it, { qty: (it.qty || 0) + 1 });
    });
    if (!found) {
      merged.push({ id: id, name: name, size: size, priceRub: priceRub, image: image, qty: 1 });
    }
    saveCart(merged);
    render();
  }

  if (listEl) {
    listEl.addEventListener("click", function (e) {
      var row = e.target.closest(".cart-drawer__item");
      if (!row) return;
      var id = row.getAttribute("data-id");
      if (!id) return;
      if (e.target.closest("[data-cart-inc]")) {
        setQty(id, +1);
      } else if (e.target.closest("[data-cart-dec]")) {
        setQty(id, -1);
      }
    });
  }

  cartTriggers.forEach(function (el) {
    el.addEventListener("click", function (e) {
      e.preventDefault();
      openDrawer();
    });
  });

  if (backdrop) {
    backdrop.addEventListener("click", function () {
      closeDrawer();
    });
  }
  if (backBtn) {
    backBtn.addEventListener("click", function () {
      closeDrawer();
    });
  }
  drawer.addEventListener("click", function (e) {
    if (e.target === drawer) closeDrawer();
  });

  window.UmbraCart = {
    addLine: addLine,
    openDrawer: openDrawer,
    closeDrawer: closeDrawer,
    render: render,
    loadCart: loadCart,
    flashAdded: flashAdded,
  };

  render();

  if (document.body.getAttribute("data-site") !== "catalog") {
    document.addEventListener("keydown", function (e) {
      if (e.key !== "Escape") return;
      if (drawer.classList.contains("is-open")) closeDrawer();
    });
  }
})();

