(function () {
  "use strict";
  var choice = document.querySelector("[data-consultation-choice]");
  if (!choice) return;
  // Estado local de la página: no guarda información ni cambia el consentimiento.
  var links = Array.from(document.querySelectorAll('a[href^="https://wa.me/34624011715"]')).map(function (link) {
    return { link: link, href: link.href, service: link.dataset.service, label: link.textContent };
  });
  function update() {
    var option = choice.options[choice.selectedIndex];
    links.forEach(function (original) {
      var link = original.link;
      if (!choice.value) {
        link.href = original.href;
        link.dataset.service = original.service;
        link.textContent = original.label;
        return;
      }
      var url = new URL(original.href);
      var message = url.searchParams.get("text") || "";
      var reference = message.match(/\n\nReferencia: WEB-[^\n]+/);
      var suffix = reference ? reference[0].replace("WEB-" + original.service.toUpperCase() + "-", "WEB-" + choice.value.toUpperCase() + "-") : "";
      url.searchParams.set("text", "Hola Nohuska, quiero consultar " + option.textContent + " en Granollers." + suffix);
      link.href = url.toString();
      link.dataset.service = choice.value;
      link.textContent = "Consultar " + option.textContent + " por WhatsApp";
    });
  }
  choice.addEventListener("change", update);
  window.addEventListener("pageshow", update);
  update();
})();
