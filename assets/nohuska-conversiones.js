(function () {
  "use strict";

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
