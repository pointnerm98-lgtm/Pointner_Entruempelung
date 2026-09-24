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
