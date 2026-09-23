(function () {
  "use strict";

  var analyticsId = "G-EV7CGL8W75";
  var consentKey = "nohuska_analytics_consent";

  function getStoredConsent() {
    try {
      return window.localStorage.getItem(consentKey);
    } catch (error) {
      return null;
    }
  }

  function storeConsent(value) {
    try {
      window.localStorage.setItem(consentKey, value);
    } catch (error) {
      // La elección sigue aplicándose durante esta visita si el almacenamiento está bloqueado.
    }
  }

  function loadAnalytics() {
    if (window.nohuskaAnalyticsLoaded) return;
    if (!["nohuska.com", "www.nohuska.com"].includes(window.location.hostname)) return;

    window.nohuskaAnalyticsLoaded = true;
    window.dataLayer = window.dataLayer || [];
    window.gtag = window.gtag || function () {
      window.dataLayer.push(arguments);
    };
    window.gtag("js", new Date());
    window.gtag("config", analyticsId, {
      allow_google_signals: false,
      allow_ad_personalization_signals: false
    });

    var script = document.createElement("script");
    script.async = true;
    script.src = "https://www.googletagmanager.com/gtag/js?id=" + analyticsId;
    document.head.appendChild(script);
  }

  function deleteAnalyticsCookies() {
    document.cookie.split(";").forEach(function (cookie) {
      var name = cookie.split("=")[0].trim();
      if (name === "_gid" || name.indexOf("_ga") === 0) {
        document.cookie = name + "=; Max-Age=0; path=/; SameSite=Lax";
        document.cookie = name + "=; Max-Age=0; path=/; domain=.nohuska.com; SameSite=Lax";
      }
    });
  }

  function removeConsentBanner() {
    var banner = document.getElementById("nohuska-cookie-banner");
    if (banner) banner.remove();
  }

  function setConsent(value) {
    storeConsent(value);
    removeConsentBanner();
    if (value === "granted") loadAnalytics();
    if (value === "denied") deleteAnalyticsCookies();
  }

  function showConsentBanner() {
    if (document.getElementById("nohuska-cookie-banner")) return;

    var banner = document.createElement("section");
    banner.id = "nohuska-cookie-banner";
    banner.className = "nohuska-cookie-banner";
    banner.setAttribute("role", "dialog");
    banner.setAttribute("aria-label", "Preferencias de cookies");
    banner.innerHTML = [
      '<div><strong>Tu privacidad importa</strong><p>Usamos Google Analytics para saber qué páginas ayudan a conseguir citas. Solo se activa si aceptas. Puedes cambiar tu elección cuando quieras.</p><a href="/cookies.html">Ver política de cookies</a></div>',
      '<div class="nohuska-cookie-actions"><button type="button" data-cookie-choice="denied">Rechazar</button><button type="button" data-cookie-choice="granted">Aceptar</button></div>'
    ].join("");
    document.body.appendChild(banner);

    banner.querySelectorAll("[data-cookie-choice]").forEach(function (button) {
      button.addEventListener("click", function () {
        setConsent(button.dataset.cookieChoice);
      });
    });
  }

  function addConsentControls() {
    var style = document.createElement("style");
    style.textContent = [
      ".nohuska-cookie-banner{position:fixed;z-index:10000;left:18px;right:18px;bottom:18px;max-width:820px;margin:auto;padding:20px;display:grid;grid-template-columns:1fr auto;gap:22px;align-items:center;background:#102522;color:#fff;border:1px solid rgba(255,255,255,.22);box-shadow:0 18px 60px rgba(8,28,25,.32);font:400 14px/1.5 Arial,sans-serif}",
      ".nohuska-cookie-banner strong{display:block;margin-bottom:4px;font-size:17px}.nohuska-cookie-banner p{margin:0 0 5px}.nohuska-cookie-banner a{color:#bce8e3;text-decoration:underline}.nohuska-cookie-actions{display:grid;grid-template-columns:1fr 1fr;gap:9px}.nohuska-cookie-actions button{min-width:112px;min-height:44px;padding:0 16px;border:1px solid #fff;background:#f7f3ec;color:#102522;font-weight:700;cursor:pointer}.nohuska-cookie-actions button:last-child{background:#087b79;color:#fff;border-color:#087b79}",
      ".nohuska-cookie-settings{position:fixed;z-index:89;left:10px;bottom:10px;padding:7px 10px;border:1px solid rgba(16,37,34,.35);border-radius:2px;background:#fffdf9;color:#102522;font:600 11px/1 Arial,sans-serif;cursor:pointer;box-shadow:0 6px 18px rgba(16,37,34,.12)}",
      "@media(max-width:720px){.nohuska-cookie-banner{grid-template-columns:1fr;gap:14px;padding:17px;bottom:10px}.nohuska-cookie-actions button{min-width:0}.nohuska-cookie-settings{bottom:78px}}"
    ].join("");
    document.head.appendChild(style);

    var settings = document.createElement("button");
    settings.type = "button";
    settings.className = "nohuska-cookie-settings";
    settings.textContent = "Cookies";
    settings.setAttribute("aria-label", "Cambiar preferencias de cookies");
    settings.addEventListener("click", showConsentBanner);
    document.body.appendChild(settings);

    var reset = document.getElementById("nohuska-cookie-reset");
    if (reset) reset.addEventListener("click", showConsentBanner);
  }

  addConsentControls();
  if (getStoredConsent() === "granted") loadAnalytics();
  if (!getStoredConsent()) showConsentBanner();

  var path = window.location.pathname.replace(/\/{2,}/g, "/").toLowerCase();
  var serviceRules = [
    ["micropigmentacion-labios", "labios"],
    ["micropigmentacion-pecas", "pecas"],
    ["freckles", "pecas"],
    ["extensiones-pestanas", "extensiones-pestanas"],
    ["lifting-pestanas", "lifting-pestanas"],
    ["pestanas", "pestanas"],
    ["powder-brows", "powder-brows"],
    ["natural-brow", "nohuska-brow"],
    ["tinte-hibrido", "tinte-cejas"],
    ["cejas", "cejas"],
    ["limpieza-facial", "limpieza-facial"],
    ["micropigmentacion-capilar", "micropigmentacion-capilar"],
    ["micropigmentacion", "micropigmentacion"],
    ["opina", "resena"]
  ];

  function getService() {
    for (var i = 0; i < serviceRules.length; i += 1) {
      if (path.indexOf(serviceRules[i][0]) !== -1) return serviceRules[i][1];
    }
    return "general";
  }

  function getLocation() {
    if (path.indexOf("barcelona") !== -1) return "barcelona";
    if (path.indexOf("valles-oriental") !== -1) return "valles-oriental";
    if (path.indexOf("espana") !== -1) return "espana";
    return "granollers";
  }

  function getSource() {
    var params = new URLSearchParams(window.location.search);
    var campaignSource = params.get("utm_source");
    var campaignMedium = params.get("utm_medium");
    var saved = window.sessionStorage.getItem("nohuska_source");
    var referrer = document.referrer.toLowerCase();
    var source = "web-directa";

    if (campaignSource) {
      source = campaignSource + (campaignMedium ? "-" + campaignMedium : "");
    } else if (saved) {
      source = saved;
    } else if (referrer.indexOf("google.") !== -1) {
      source = "google-organico";
    } else if (referrer.indexOf("instagram.com") !== -1) {
      source = "instagram";
    } else if (referrer) {
      source = "referencia-web";
    }

    window.sessionStorage.setItem("nohuska_source", source);
    return source.replace(/[^a-z0-9-]/gi, "-").slice(0, 40);
  }

  var service = getService();
  var locationName = getLocation();
  var source = getSource();
  var reference = "WEB-" + service.toUpperCase() + "-" + locationName.toUpperCase() + "-" + source.toUpperCase();

  function trackLead(method, link, position) {
    var eventData = {
      method: method,
      service: service,
      location: locationName,
      source: source,
      cta_position: link.dataset.ctaPosition || String(position),
      page_path: path,
      link_text: (link.textContent || "").trim().slice(0, 80)
    };

    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event: "nohuska_lead",
      lead_method: eventData.method,
      lead_service: eventData.service,
      lead_location: eventData.location,
      lead_source: eventData.source,
      lead_position: eventData.cta_position,
      page_path: eventData.page_path,
      link_text: eventData.link_text
    });

    if (typeof window.gtag === "function") {
      window.gtag("event", "generate_lead", eventData);
    }
  }

  document.querySelectorAll('a[href^="https://wa.me/34624011715"]').forEach(function (link, index) {
    try {
      var url = new URL(link.href);
      var message = url.searchParams.get("text") || "Hola Nohuska, quiero información.";
      if (message.indexOf("Referencia: WEB-") === -1) {
        url.searchParams.set("text", message + "\n\nReferencia: " + reference);
        link.href = url.toString();
      }
      link.dataset.service = service;
      link.dataset.source = source;
      if (!link.dataset.ctaPosition) link.dataset.ctaPosition = "whatsapp-" + (index + 1);
      link.addEventListener("click", function () {
        trackLead("whatsapp", link, index + 1);
      });
    } catch (error) {
      // El enlace original continúa funcionando si el navegador no admite URL.
    }
  });

  document.querySelectorAll('a[href^="tel:"]').forEach(function (link, index) {
    link.dataset.service = service;
    link.dataset.source = source;
    if (!link.dataset.ctaPosition) link.dataset.ctaPosition = "telefono-" + (index + 1);
    link.addEventListener("click", function () {
      trackLead("telefono", link, index + 1);
    });
  });
})();
