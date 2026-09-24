/* =====================================================================
   Pointner Entrümpelung – script.js
   Vanilla JS, keine externen Abhängigkeiten, keine Cookies, kein Tracking.
   ===================================================================== */
(function () {
  "use strict";

  var prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* -------------------------------------------------
     1. Aktuelles Jahr im Footer
  ------------------------------------------------- */
  var yearEl = document.getElementById("year");
  if (yearEl) { yearEl.textContent = String(new Date().getFullYear()); }

  /* -------------------------------------------------
     2. Sticky-Header: beim Scrollen schlanker
  ------------------------------------------------- */
  var header = document.getElementById("site-header");
  if (header) {
    var onScroll = function () {
      if (window.scrollY > 12) { header.classList.add("scrolled"); }
      else { header.classList.remove("scrolled"); }
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* -------------------------------------------------
     3. Mobile-Navigation
  ------------------------------------------------- */
  var toggle = document.getElementById("nav-toggle");
  var navList = document.getElementById("nav-list");
  if (toggle && navList) {
    var closeNav = function () {
      navList.classList.remove("open");
      toggle.setAttribute("aria-expanded", "false");
      toggle.setAttribute("aria-label", "Menü öffnen");
    };
    var openNav = function () {
      navList.classList.add("open");
      toggle.setAttribute("aria-expanded", "true");
      toggle.setAttribute("aria-label", "Menü schließen");
    };
    toggle.addEventListener("click", function () {
      if (navList.classList.contains("open")) { closeNav(); } else { openNav(); }
    });
    // Bei Klick auf einen Link schließen
    navList.addEventListener("click", function (e) {
      if (e.target.closest("a")) { closeNav(); }
    });
    // Mit Escape schließen
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && navList.classList.contains("open")) {
        closeNav();
        toggle.focus();
      }
    });
  }

  /* -------------------------------------------------
     4. Reveal on Scroll via IntersectionObserver
  ------------------------------------------------- */
  var revealEls = document.querySelectorAll(".reveal");
  if (prefersReducedMotion || !("IntersectionObserver" in window)) {
    revealEls.forEach(function (el) { el.classList.add("is-visible"); });
  } else {
    var io = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          obs.unobserve(entry.target);
        }
      });
    }, { rootMargin: "0px 0px -10% 0px", threshold: 0.12 });
    revealEls.forEach(function (el) { io.observe(el); });
  }

  /* -------------------------------------------------
     5. Kontaktformular: Validierung + Versand (Formspree)
  ------------------------------------------------- */
  var form = document.getElementById("contact-form");
  if (!form) { return; }

  var statusEl = document.getElementById("form-status");
  var submitBtn = document.getElementById("submit-btn");

  var showError = function (fieldId, show) {
    var msg = form.querySelector('[data-error-for="' + fieldId + '"]');
    if (msg) { msg.hidden = !show; }
  };

  var isValidEmail = function (value) {
    // Bewusst simpel gehalten; die eigentliche Prüfung macht der Browser/Server.
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  };

  var validate = function () {
    var ok = true;

    var name = form.elements["name"];
    if (name && !name.value.trim()) { showError("f-name", true); ok = false; }
    else { showError("f-name", false); }

    var email = form.elements["email"];
    if (email && !isValidEmail(email.value.trim())) { showError("f-email", true); ok = false; }
    else { showError("f-email", false); }

    var phone = form.elements["telefon"];
    if (phone && !phone.value.trim()) { showError("f-phone", true); ok = false; }
    else { showError("f-phone", false); }

    var privacy = form.elements["datenschutz"];
    if (privacy && !privacy.checked) { showError("f-privacy", true); ok = false; }
    else { showError("f-privacy", false); }

    return ok;
  };

  var setStatus = function (message, type) {
    if (!statusEl) { return; }
    statusEl.hidden = false;
    statusEl.textContent = message;
    statusEl.className = "form-status " + (type === "success" ? "is-success" : "is-error");
  };

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    // Honeypot: gefüllt = Bot -> lautlos abbrechen (Erfolg vortäuschen)
    var honey = form.elements["_gotcha"];
    if (honey && honey.value) { return; }

    if (!validate()) {
      setStatus("Bitte prüfen Sie die markierten Felder.", "error");
      var firstError = form.querySelector('.field-error:not([hidden])');
      if (firstError) {
        var field = firstError.previousElementSibling || firstError.parentElement;
        var input = field && field.querySelector ? field.querySelector("input, select, textarea") : null;
        if (input) { input.focus(); }
      }
      return;
    }

    var endpoint = form.getAttribute("action") || "";
    // Solange der Formspree-Endpoint noch ein Platzhalter ist: Hinweis geben.
    if (!endpoint || endpoint.indexOf("[") === 0 || endpoint.indexOf("FORMSPREE") !== -1) {
      setStatus("Formularversand ist noch nicht konfiguriert. Bitte tragen Sie den Formspree-Endpoint in index.html ein oder kontaktieren Sie uns direkt per Telefon oder E-Mail.", "error");
      return;
    }

    var originalLabel = submitBtn ? submitBtn.textContent : "";
    if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = "Wird gesendet …"; }

    var data = new FormData(form);

    fetch(endpoint, {
      method: "POST",
      body: data,
      headers: { "Accept": "application/json" }
    })
      .then(function (response) {
        if (response.ok) {
          form.reset();
          setStatus("Vielen Dank! Ihre Anfrage ist bei uns eingegangen. Wir melden uns innerhalb von 24 Stunden.", "success");
        } else {
          return response.json().then(function (body) {
            var detail = body && body.errors && body.errors.length ? " (" + body.errors[0].message + ")" : "";
            throw new Error(detail);
          }).catch(function () { throw new Error(); });
        }
      })
      .catch(function () {
        setStatus("Leider ist der Versand fehlgeschlagen. Bitte versuchen Sie es später erneut oder kontaktieren Sie uns direkt per Telefon oder E-Mail.", "error");
      })
      .finally(function () {
        if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = originalLabel; }
      });
  });

  // Live-Fehler ausblenden, sobald der Nutzer korrigiert
  ["f-name", "f-email", "f-phone", "f-privacy"].forEach(function (id) {
    var el = document.getElementById(id);
    if (el) { el.addEventListener("input", function () { showError(id, false); }); }
    if (el && el.type === "checkbox") { el.addEventListener("change", function () { showError(id, false); }); }
  });

})();

/* =====================================================================
   Vorher-Nachher-Vergleich (Vanilla JS, keine Bibliothek)
   Maus, Touch (Pointer Events) und Tastatur (Pfeile/Home/End).
   Ohne JS: beide Bilder untereinander mit Beschriftung (siehe CSS).
   ===================================================================== */
(function () {
  "use strict";

  var ba = document.getElementById("ba");
  if (!ba) { return; }
  var frame = ba.querySelector(".ba-frame");
  var handle = document.getElementById("ba-handle");
  if (!frame || !handle) { return; }

  ba.classList.add("is-ready");

  var pos = 50;
  var setPos = function (p) {
    pos = Math.max(0, Math.min(100, p));
    var v = Math.round(pos);
    frame.style.setProperty("--pos", pos + "%");
    handle.setAttribute("aria-valuenow", String(v));
    handle.setAttribute("aria-valuetext", v + " Prozent – Vorher-Ansicht");
  };
  setPos(50);

  var dragging = false;
  var posFromX = function (clientX) {
    var r = frame.getBoundingClientRect();
    if (!r.width) { return pos; }
    return ((clientX - r.left) / r.width) * 100;
  };

  var onDown = function (clientX, ev) {
    dragging = true;
    ba.classList.add("is-dragging");
    setPos(posFromX(clientX));
    if (ev && ev.preventDefault) { ev.preventDefault(); }
  };
  var onMove = function (clientX) {
    if (dragging) { setPos(posFromX(clientX)); }
  };
  var onUp = function () {
    dragging = false;
    ba.classList.remove("is-dragging");
  };

  if (window.PointerEvent) {
    frame.addEventListener("pointerdown", function (e) {
      if (e.pointerId != null && frame.setPointerCapture) {
        try { frame.setPointerCapture(e.pointerId); } catch (err) {}
      }
      onDown(e.clientX, e);
    });
    frame.addEventListener("pointermove", function (e) { onMove(e.clientX); });
    frame.addEventListener("pointerup", onUp);
    frame.addEventListener("pointercancel", onUp);
  } else {
    frame.addEventListener("mousedown", function (e) { onDown(e.clientX, e); });
    window.addEventListener("mousemove", function (e) { onMove(e.clientX); });
    window.addEventListener("mouseup", onUp);
    frame.addEventListener("touchstart", function (e) { onDown(e.touches[0].clientX, e); }, { passive: false });
    frame.addEventListener("touchmove", function (e) { onMove(e.touches[0].clientX); }, { passive: true });
    window.addEventListener("touchend", onUp);
  }

  handle.addEventListener("keydown", function (e) {
    var step = e.shiftKey ? 10 : 2;
    var handled = true;
    switch (e.key) {
      case "ArrowLeft":
      case "ArrowDown": setPos(pos - step); break;
      case "ArrowRight":
      case "ArrowUp": setPos(pos + step); break;
      case "Home": setPos(0); break;
      case "End": setPos(100); break;
      default: handled = false;
    }
    if (handled) { e.preventDefault(); }
  });

})();
