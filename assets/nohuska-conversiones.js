(function () {
  "use strict";

  if (window.nohuskaContactTrackingInitialized) return;
  window.nohuskaContactTrackingInitialized = true;

  var analyticsId = "G-EV7CGL8W75";
  var consentKey = "nohuska_analytics_consent";
  var analyticsConsent = getStoredConsent();
  var allowedSources = ["google", "instagram", "facebook", "booksy", "chatgpt", "bing", "whatsapp", "newsletter", "internal-test"];
  var allowedMediums = ["organic", "referral", "social", "email", "cpc", "paid-social", "qa"];
  // Solo códigos públicos revisados: nunca nombres, teléfonos o texto libre.
  var allowedCampaigns = ["perfil_empresa_granollers", "reserva_perfil_empresa", "gbp_micropigmentacion_cejas_oct2026", "gbp_korean_gaze_oct2026", "christmas_glow_2026", "whatsapp-qa-20261022"];

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
    if (analyticsConsent !== "granted") return;
    if (window.nohuskaAnalyticsLoaded) return;
    if (!["nohuska.com", "www.nohuska.com"].includes(window.location.hostname)) return;

    window.nohuskaAnalyticsLoaded = true;
    window.dataLayer = window.dataLayer || [];
    window.gtag = window.gtag || function () {
      window.dataLayer.push(arguments);
    };
    window.gtag("consent", "default", {
      analytics_storage: "granted",
      ad_storage: "denied",
      ad_user_data: "denied",
      ad_personalization: "denied"
    });
    window.gtag("js", new Date());
    var analyticsConfig = {
      allow_google_signals: false,
      allow_ad_personalization_signals: false,
      // No enviar parámetros de la URL ni rutas completas de referencia.
      page_location: window.location.origin + window.location.pathname,
      page_referrer: getReferrerOrigin()
    };
    var params = new URLSearchParams(window.location.search);
    var campaignSource = (params.get("utm_source") || "").toLowerCase();
    var campaignMedium = (params.get("utm_medium") || "").toLowerCase();
    // Conservar atribución GA4 de las campañas públicas aunque se suprima la query.
    if (campaignSource) {
      analyticsConfig.campaign_source = allowedSources.indexOf(campaignSource) !== -1 ? campaignSource : "campana-otra";
      if (campaignMedium) analyticsConfig.campaign_medium = allowedMediums.indexOf(campaignMedium) !== -1 ? campaignMedium : "otro";
    }
    if (params.get("utm_campaign")) analyticsConfig.campaign_name = campaign;
    if (isContactQa()) analyticsConfig.debug_mode = true;
    window.gtag("config", analyticsId, analyticsConfig);

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
    analyticsConsent = value;
    storeConsent(value);
    removeConsentBanner();
    window["ga-disable-" + analyticsId] = value !== "granted";
    if (typeof window.gtag === "function") {
      window.gtag("consent", "update", { analytics_storage: value });
    }
    if (value === "granted") {
      saveAttribution();
      loadAnalytics();
    }
    if (value === "denied") {
      clearAttribution();
      deleteAnalyticsCookies();
    }
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

  var path = window.location.pathname.replace(/\/{2,}/g, "/").toLowerCase();
  var serviceRules = [
    ["henna-lips", "henna-lips"],
    ["ritual-nohuska-masaje", "ritual-nohuska"],
    ["ritual-nohuska", "ritual-nohuska"],
    ["masaje", "ritual-nohuska"],
    ["korean-gaze", "korean-gaze"],
    ["micropigmentacion-cejas", "micropigmentacion-cejas"],
    ["micropigmentacion-labios", "labios"],
    ["micropigmentacion-pecas", "pecas"],
    ["freckles", "pecas"],
    ["/pecas/", "pecas"],
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

  function getSessionValue(key) {
    if (analyticsConsent !== "granted") return null;
    try {
      return window.sessionStorage.getItem(key);
    } catch (error) {
      return null;
    }
  }

  function setSessionValue(key, value) {
    if (analyticsConsent !== "granted") return;
    try {
      window.sessionStorage.setItem(key, value);
    } catch (error) {
      // El contacto y la elección de cookies funcionan sin almacenamiento.
    }
  }

  function clearAttribution() {
    try {
      window.sessionStorage.removeItem("nohuska_source");
      window.sessionStorage.removeItem("nohuska_campaign");
    } catch (error) {
      // Algunos navegadores bloquean sessionStorage por completo.
    }
  }

  function saveAttribution() {
    if (source) setSessionValue("nohuska_source", source);
    if (campaign) setSessionValue("nohuska_campaign", campaign);
  }

  function getReferrerOrigin() {
    try {
      return document.referrer ? new URL(document.referrer).origin : "";
    } catch (error) {
      return "";
    }
  }

  function getSource() {
    var params = new URLSearchParams(window.location.search);
    var campaignSource = (params.get("utm_source") || "").toLowerCase();
    var campaignMedium = (params.get("utm_medium") || "").toLowerCase();
    var saved = getSessionValue("nohuska_source");
    var referrerHost = "";
    try {
      referrerHost = document.referrer ? new URL(document.referrer).hostname.toLowerCase() : "";
    } catch (error) {
      // Un referente inválido no interrumpe los enlaces de contacto.
    }
    var source = "directo-o-desconocido";

    if (campaignSource) {
      source = allowedSources.indexOf(campaignSource) !== -1 ? campaignSource : "campana-otra";
      if (allowedMediums.indexOf(campaignMedium) !== -1) source += "-" + campaignMedium;
    } else if (saved && (/^(google|instagram|facebook|booksy|chatgpt|bing|whatsapp|newsletter|internal-test|campana-otra)(-(organic|referral|social|email|cpc|paid-social|organico|qa))?$/.test(saved) || saved === "referencia-web" || saved === "directo-o-desconocido")) {
      source = saved;
    } else if (/(^|\.)google\.(com|es|cat|fr|de|it|pt|co\.uk)$/.test(referrerHost)) {
      source = "google-organico";
    } else if (/(^|\.)instagram\.com$/.test(referrerHost)) {
      source = "instagram";
    } else if (/(^|\.)chatgpt\.com$/.test(referrerHost)) {
      source = "chatgpt";
    } else if (referrerHost && referrerHost !== window.location.hostname && !/^(www\.)?(nohuska\.com|nohuskabeautylab\.com)$/.test(referrerHost)) {
      source = "referencia-web";
    }

    setSessionValue("nohuska_source", source);
    return source;
  }

  function getCampaign() {
    var params = new URLSearchParams(window.location.search);
    var current = params.get("utm_campaign");
    var saved = getSessionValue("nohuska_campaign");
    var candidate = current || saved;
    var campaign = candidate ? (allowedCampaigns.indexOf(candidate) !== -1 ? candidate : "campana-otra") : "sin-campana";

    if (current) setSessionValue("nohuska_campaign", campaign);
    return campaign;
  }

  var service = getService();
  var locationName = getLocation();
  var source = getSource();
  var campaign = getCampaign();
  addConsentControls();
  if (analyticsConsent === "granted") loadAnalytics();
  if (!analyticsConsent) showConsentBanner();

  function isContactQa() {
    return source === "internal-test-qa" && campaign === "whatsapp-qa-20261022";
  }

  function buildReference(serviceName) {
    var result = "WEB-" + serviceName.toUpperCase() + "-" + locationName.toUpperCase() + "-" + source.toUpperCase();
    if (campaign !== "sin-campana") result += "-" + campaign.toUpperCase();
    return result;
  }

  function trackContactClick(eventName, method, link, position) {
    if (analyticsConsent !== "granted" || typeof window.gtag !== "function") return;
    var eventData = {
      method: method,
      service: link.dataset.service || service,
      location: locationName,
      source: source,
      campaign: campaign,
      cta_position: link.dataset.ctaPosition || String(position),
      page_path: path
    };
    if (isContactQa()) {
      eventData.debug_mode = true;
      eventData.test_event = true;
    }
    // Una única emisión por clic. No acredita conversación, lead ni reserva.
    window.gtag("event", eventName, eventData);
  }

  document.querySelectorAll('a[href^="https://wa.me/34624011715"]').forEach(function (link, index) {
    try {
      var url = new URL(link.href);
      var message = url.searchParams.get("text") || "Hola Nohuska, quiero información.";
      var linkService = link.dataset.service || service;
      if (message.indexOf("Referencia: WEB-") === -1) {
        url.searchParams.set("text", message + "\n\nReferencia: " + buildReference(linkService));
        link.href = url.toString();
      }
      link.dataset.service = linkService;
      link.dataset.source = source;
      if (!link.dataset.ctaPosition) link.dataset.ctaPosition = "whatsapp-" + (index + 1);
      link.addEventListener("click", function () {
        trackContactClick("click_whatsapp", "whatsapp", link, index + 1);
      });
    } catch (error) {
      // El enlace original continúa funcionando si el navegador no admite URL.
    }
  });

  document.querySelectorAll('a[href^="tel:"]').forEach(function (link, index) {
    link.addEventListener("click", function () {
      trackContactClick("click_call", "call", link, index + 1);
    });
  });

  document.querySelectorAll('a[href*="booksy.com"]').forEach(function (link, index) {
    link.addEventListener("click", function () {
      trackContactClick("click_booksy", "booksy", link, index + 1);
    });
  });

  document.querySelectorAll('a[href^="tel:"]').forEach(function (link, index) {
    link.dataset.service = service;
    link.dataset.source = source;
    if (!link.dataset.ctaPosition) link.dataset.ctaPosition = "telefono-" + (index + 1);
  });

  document.querySelectorAll('a[href*="google.com/maps"], a[href*="maps.google.com"], a[href*="maps.app.goo.gl"]').forEach(function (link, index) {
    link.addEventListener("click", function () {
      if (analyticsConsent !== "granted" || typeof window.gtag !== "function") return;
      var eventData = {
        service: link.dataset.service || service,
        location: locationName,
        source: source,
        campaign: campaign,
        cta_position: link.dataset.ctaPosition || "mapa-" + (index + 1),
        page_path: path
      };
      window.gtag("event", "maps_click", eventData);
    });
  });
})();
