(function () {
  "use strict";
  var choice = document.querySelector("[data-consultation-choice]");
  if (!choice) return;
  var finish = document.querySelector("[data-consultation-finish]");
  // Estado local de la página: no guarda información ni cambia el consentimiento.
  var links = Array.from(document.querySelectorAll('a[href^="https://wa.me/34624011715"]')).map(function (link) {
    return { link: link, href: link.href, service: link.dataset.service, label: link.textContent, intent: link.dataset.contactIntent };
  });
  function update() {
    var option = choice.options[choice.selectedIndex];
    var preference = finish ? finish.value.replace(/\s+/g, " ").trim().slice(0, 120) : "";
    var finishMessage = preference ? "\nAcabado que busco: " + preference : "";
    // La valoración no lleva tarifa. Un trabajo a valorar tampoco ofrece cita de tratamiento.
    var terms = choice.dataset.pricedOptions !== undefined && option.textContent.match(/^(.+) · (\d+ €|A valorar)$/);
    var technique = terms ? terms[1] : option.textContent;
    var quoteOnly = terms && terms[2] === "A valorar";
    links.forEach(function (original) {
      var link = original.link;
      // Un enlace de una técnica concreta no es parte del selector general.
      if (original.service === "extensiones-volumen" || link.dataset.fixedConsultation !== undefined) return;
      if (original.intent === "appointment") link.dataset.contactIntent = quoteOnly ? "quote" : "appointment";
      if (!choice.value) {
        var originalUrl = new URL(original.href);
        var originalMessage = originalUrl.searchParams.get("text") || "";
        var originalParts = originalMessage.split("\n\nReferencia: WEB-");
        if (finishMessage) originalUrl.searchParams.set("text", originalParts[0] + finishMessage + (originalParts.length > 1 ? "\n\nReferencia: WEB-" + originalParts[1] : ""));
        link.href = finishMessage ? originalUrl.toString() : original.href;
        link.dataset.service = original.service;
        link.textContent = original.label;
        return;
      }
      var url = new URL(original.href);
      var message = url.searchParams.get("text") || "";
      var reference = message.match(/\n\nReferencia: WEB-[^\n]+/);
      var suffix = reference ? reference[0].replace("WEB-" + original.service.toUpperCase() + "-", "WEB-" + choice.value.toUpperCase() + "-") : "";
      var request = original.intent === "appointment" ? "solicitar cita para " : original.intent === "valuation" ? "una valoración gratuita de " : "consultar ";
      var keepMessage = link.dataset.keepMessage !== undefined;
      var selectedMessage = keepMessage
        ? message.split("\n\nReferencia: WEB-")[0] + "\nMe interesa: " + technique + "."
        : "Hola Nohuska, quiero " + request + (original.intent === "appointment" ? option.textContent : technique) + " en Granollers.";
      if (link.dataset.contactIntent === "quote") selectedMessage = "Hola Nohuska, quiero una valoración gratuita de " + technique + " en Granollers para conocer mi presupuesto.";
      if (original.intent === "appointment" && option.dataset && option.dataset.bookingDetail) selectedMessage += " Incluye " + option.dataset.bookingDetail + ". ¿Qué disponibilidad hay?";
      url.searchParams.set("text", selectedMessage + finishMessage + suffix);
      link.href = url.toString();
      link.dataset.service = choice.value;
      if (keepMessage) return;
      if (link.dataset.contactIntent === "quote") link.textContent = "Pedir presupuesto tras valoración";
      else if (original.intent === "appointment") link.textContent = terms ? terms[2] + " · Reservar " + technique : "Solicitar cita de " + technique;
      else if (original.intent === "valuation") link.textContent = "Valoración gratuita: " + technique;
      else link.textContent = "Consultar " + technique + " por WhatsApp";
    });
  }
  var manualChoice = !!choice.value;
  function followSection() {
    if (manualChoice || !window.location.hash) return;
    var target = document.getElementById(window.location.hash.slice(1));
    if (!target || !target.dataset.consultationValue) return;
    var key = target.dataset.consultationValue;
    var index = Array.from(choice.options).findIndex(function (opt) { return opt.id === key || opt.value === key; });
    if (index === -1) return;
    choice.selectedIndex = index;
    update();
  }
  choice.addEventListener("change", function () { manualChoice = true; update(); });
  if (finish) finish.addEventListener("input", update);
  window.addEventListener("hashchange", followSection);
  window.addEventListener("pageshow", update);
  update();
  followSection();
})();
