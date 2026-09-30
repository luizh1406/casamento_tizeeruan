import { writeFileSync, mkdirSync } from "node:fs";
mkdirSync("public/placeholders", { recursive: true });

function photo(name, w, h, c1, c2, c3, arch = true) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" preserveAspectRatio="xMidYMid slice">
<defs>
<linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${c1}"/><stop offset="1" stop-color="${c2}"/></linearGradient>
<radialGradient id="r" cx=".3" cy=".25" r=".8"><stop offset="0" stop-color="${c3}" stop-opacity=".9"/><stop offset="1" stop-color="${c3}" stop-opacity="0"/></radialGradient>
</defs>
<rect width="${w}" height="${h}" fill="url(#g)"/><rect width="${w}" height="${h}" fill="url(#r)"/>
${arch ? `<path d="M${w * 0.32} ${h} V${h * 0.55} a${w * 0.18} ${w * 0.18} 0 0 1 ${w * 0.36} 0 V${h}Z" fill="#fff" fill-opacity=".14"/>` : ""}
<circle cx="${w * 0.78}" cy="${h * 0.2}" r="${Math.min(w, h) * 0.07}" fill="#fff" fill-opacity=".35"/>
</svg>`;
  writeFileSync(`public/placeholders/${name}.svg`, svg);
}
photo("hero", 1600, 1000, "#d9c6b0", "#8f7a66", "#f6e9d8");

const stroke = `fill="none" stroke="#7a6350" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"`;
const icons = {
  coffee: `<path d="M-42 -10h70v34a26 26 0 0 1-26 26h-18a26 26 0 0 1-26-26z"/><path d="M28 0h10a12 12 0 0 1 0 24h-10"/><path d="M-22 -30c0-10 10-10 10-20M2 -30c0-10 10-10 10-20"/>`,
  dinner: `<path d="M-50 -40h34l-6 34a11 11 0 0 1-22 0z" transform="translate(-4 0)"/><path d="M-33 0v44M-46 46h26"/><path d="M14 -40h34l-6 34a11 11 0 0 1-22 0z"/><path d="M31 0v44M18 46h26"/>`,
  trip: `<path d="M-60 30c20-10 30 10 60 0s40-10 60 0"/><path d="M-30 20l10-45h40l10 45z"/><path d="M0 -25v-40l30 30"/>`,
  plane: `<path d="M-60 10l120-45-25 60-30-10-15 25-10-30z"/><path d="M-40 6l45-10"/>`,
  bed: `<path d="M-60 40v-70M60 40v-30H-60"/><path d="M-60 10v-20h55a12 12 0 0 1 12 12v8"/><circle cx="-38" cy="-8" r="9"/>`,
  star: `<path d="M0 -55l16 35 38 5-28 26 8 38-34-19-34 19 8-38-28-26 38-5z"/>`,
  surprise: `<rect x="-45" y="-15" width="90" height="60" rx="4"/><path d="M-50 -15h100v-22H-50zM0 -37v82"/><path d="M0 -37c-10-25-40-20-30 -3M0 -37c10-25 40-20 30-3"/>`,
};
for (const [n, body] of Object.entries(icons)) {
  writeFileSync(
    `public/placeholders/gift-${n}.svg`,
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f7efe4"/><stop offset="1" stop-color="#e9d9c6"/></linearGradient></defs><rect width="400" height="300" fill="url(#g)"/><circle cx="200" cy="150" r="88" fill="#fff" fill-opacity=".55"/><g transform="translate(200 150)" ${stroke}>${body}</g></svg>`,
  );
}
