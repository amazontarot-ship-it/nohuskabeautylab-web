"use strict";

// Local markup regression checks; no external contact or analytics request.
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.join(__dirname, "..");
const read = file => fs.readFileSync(path.join(root, file), "utf8");
const home = read("index.html");
assert.match(home, /id="firmas"/);
assert.match(home, /id="firmas"><span id="estrellas"/);
const guide = read("guias/lifting-o-extensiones-pestanas.html");
const mobileGuide = guide.match(/<a\b[^>]*class="mobile-contact"[^>]*>/)[0];
assert.match(mobileGuide, /data-service="pestanas"/);
const guideMessage = new URL(mobileGuide.match(/href="([^"]+)"/)[1]).searchParams.get("text");
for (const modality of ["lifting", "Click Lash", "extensiones pelo a pelo"]) assert.ok(guideMessage.includes(modality));
// Resolve every local fragment link in the affected pages against the actual file.
for (const file of ["guias/lifting-o-extensiones-pestanas.html", "tratamientos/facial-contouring-granollers.html", "tratamientos/micropigmentacion-blush-granollers.html"]) {
  for (const match of read(file).matchAll(/href="([^":]*#[^"]+)"/g)) {
    const [target, fragment] = match[1].split("#");
    const resolved = path.posix.normalize(path.posix.join(path.posix.dirname(file), target));
    assert.ok(read(resolved).includes('id="' + fragment + '"'), file + ": " + match[1]);
  }
}
for (const file of fs.readdirSync(path.join(root, "tratamientos")).filter(file => file.endsWith(".html"))) {
  assert.doesNotMatch(read("tratamientos/" + file), /href="[^"]*#estrellas"/, file);
}
for (const file of ["facial-contouring-granollers.html", "micropigmentacion-blush-granollers.html"]) {
  assert.match(read("tratamientos/" + file), /href="\.\.\/index\.html#firmas"/);
}
for (const [file, expected] of [
  ["pestanas-granollers.html", /pestañas/],
  ["lifting-pestanas-granollers.html", /lifting coreano con tinte/],
  ["extensiones-pestanas-granollers.html", /Click Lash o extensiones pelo a pelo/]
]) {
  const html = read("tratamientos/" + file);
  assert.match(html, /body class="has-mobile-contact/);
  const mobile = html.match(/<a\b[^>]*class="mobile-contact"[^>]*>/);
  assert.ok(mobile, file);
  const url = new URL(mobile[0].match(/href="([^"]+)"/)[1]);
  assert.equal(url.origin + url.pathname, "https://wa.me/34624011715");
  assert.match(url.searchParams.get("text"), expected, file);
  assert.doesNotMatch(url.searchParams.get("text"), /encontrado en Google/);
}
assert.doesNotMatch(read("tratamientos/lifting-pestanas-granollers.html"), /data-service="lifting-coreano"/);
assert.match(read("tratamientos/lifting-pestanas-granollers.html"), /data-service="lifting-pestanas"/);
assert.match(read("tratamientos/seo-treatment.css"), /@media\(max-width:760px\).*?\.mobile-contact\{display:flex/s);
console.log("PASS: firmas destinations, mobile contact routes/messages, responsive rule and lifting labels (static markup).");
