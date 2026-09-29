const B = process.env.BASE || "http://localhost:3111";
let cookie = "";
async function call(method, path, body, extra = {}) {
  const r = await fetch(B + path, { method, headers: { "Content-Type": "application/json", cookie, ...extra }, body: body ? JSON.stringify(body) : undefined, redirect: "manual" });
  const sc = r.headers.get("set-cookie"); if (sc) cookie = sc.split(";")[0];
  let d; const ct = r.headers.get("content-type") || ""; d = ct.includes("json") ? await r.json() : await r.text();
  return { s: r.status, d };
}
const ok = (n, c, x = "") => console.log((c ? "PASS " : "FAIL ") + n, c ? "" : JSON.stringify(x));

let r = await call("GET", "/api/admin/settings"); ok("admin api blocked w/o login", r.s === 401, r);
r = await call("GET", "/admin"); ok("admin page redirects", r.s === 307 || r.s === 302 || r.s === 308, r.s);
r = await call("POST", "/api/admin/login", { email: "admin@casamento.local", password: "wrong" }); ok("bad login 401", r.s === 401, r);
r = await call("POST", "/api/admin/login", { email: process.env.AE || "admin@casamento.local", password: process.env.AP || "admin123" }); ok("login", r.s === 200, r);
r = await call("GET", "/api/admin/settings"); ok("settings get", r.s === 200 && r.d.brideName, r);
const settings = r.d;

// gift before pix configured
r = await call("GET", "/api/admin/gifts"); const gifts = r.d; ok("gifts seeded", gifts.length === 7, gifts.length);
r = await call("POST", "/api/gifts/orders", { giftId: gifts[0].id }); ok("no pix key => 503", r.s === 503, r);

settings.pix = { key: "+5541999999999", receiverName: "Helena e Rafael", city: "Curitiba" };
r = await call("PUT", "/api/admin/settings", settings); ok("settings save", r.s === 200, r);
r = await call("PUT", "/api/admin/settings", { ...settings, weddingDate: "xx" }); ok("settings validation", r.s === 400, r);

// fixed gift
r = await call("POST", "/api/gifts/orders", { giftId: gifts[0].id, guestName: "Maria", message: "Felicidades!" });
ok("order fixed", r.s === 200 && r.d.amountCents === 8000 && r.d.qr.startsWith("data:image/png"), r);
console.log("payload:", r.d.payload);
const tok = r.d.token; const payload = r.d.payload;
ok("payload has amount 80.00", payload.includes("540580.00"), payload);
ok("payload crc ok", (() => { const b = payload.slice(0, -4); let c = 0xffff; for (const ch of b) { c ^= ch.charCodeAt(0) << 8; for (let j = 0; j < 8; j++) c = c & 0x8000 ? ((c << 1) ^ 0x1021) & 0xffff : (c << 1) & 0xffff; } return c.toString(16).toUpperCase().padStart(4, "0") === payload.slice(-4); })());
// tamper: client tries to change fixed price
r = await call("POST", "/api/gifts/orders", { giftId: gifts[0].id, amountCents: 100 }); ok("fixed price not overridable", r.d.amountCents === 8000, r.d);
// free / custom
r = await call("POST", "/api/gifts/orders", { giftId: null, custom: true, amountCents: 100 }); ok("min value rejected", r.s === 400, r);
r = await call("POST", "/api/gifts/orders", { giftId: null, custom: true, amountCents: 99999999 }); ok("max value rejected", r.s === 400, r);
r = await call("POST", "/api/gifts/orders", { giftId: null, custom: true }); ok("missing value rejected", r.s === 400, r);
r = await call("POST", "/api/gifts/orders", { giftId: gifts[6].id, amountCents: 15050 }); ok("free gift custom value", r.s === 200 && r.d.amountCents === 15050, r);
r = await call("POST", "/api/gifts/orders", { giftId: gifts[0].id, custom: true, amountCents: 25000 }); ok("custom override on fixed gift", r.s === 200 && r.d.amountCents === 25000, r);

// status flow
r = await call("GET", `/api/gifts/orders/${tok}`); ok("status pending", r.d.status === "pending", r);
r = await call("POST", `/api/gifts/orders/${tok}/report`); ok("report", r.d.status === "reported", r);
// webhook disabled
r = await call("POST", "/api/webhooks/pix", { pix: [] }); ok("webhook disabled w/o secret", r.s === 404, r);
// admin confirm
r = await call("GET", "/admin/recebidos"); ok("recebidos page", r.s === 200, r.s);
const list = await call("GET", "/admin/recebidos");
const orders = (await call("GET", "/api/admin/settings")); // noop
// find order id via dashboard page hack not needed: patch id 1
r = await call("PATCH", "/api/admin/orders/1", { status: "confirmed" }); ok("admin confirm", r.s === 200 && r.d.status === "confirmed", r);
r = await call("GET", `/api/gifts/orders/${tok}`); ok("status confirmed", r.d.status === "confirmed", r);

// RSVP
const rs = { name: "João da Silva", phone: "(41) 99999-1234", attending: true, companionsCount: 1, companionsNames: "Ana", notes: "", startedAt: Date.now() - 10000 };
r = await call("POST", "/api/rsvp", { ...rs, name: "a" }); ok("rsvp validation", r.s === 400, r);
r = await call("POST", "/api/rsvp", { ...rs, phone: "123" }); ok("rsvp phone validation", r.s === 400, r);
r = await call("POST", "/api/rsvp", { ...rs, companionsNames: "" }); ok("rsvp companions names required", r.s === 400, r);
r = await call("POST", "/api/rsvp", { ...rs, website: "http://spam" }); ok("honeypot silently ok", r.s === 200, r);
r = await call("POST", "/api/rsvp", { ...rs, startedAt: Date.now() }); ok("too-fast silently ok", r.s === 200, r);
r = await call("POST", "/api/rsvp", rs); ok("rsvp ok", r.s === 200, r);
r = await call("POST", "/api/rsvp", { ...rs, attending: false }); ok("rsvp update same phone", r.s === 200, r);
r = await call("POST", "/api/rsvp", rs, { origin: "http://evil.com" }); ok("csrf origin blocked", r.s === 403, r);
r = await call("GET", "/api/admin/rsvps/export"); ok("csv export", r.s === 200 && r.d.includes("João da Silva") && (r.d.match(/João/g) || []).length === 1, r.d);
for (const p of ["/admin", "/admin/convidados", "/admin/presentes", "/admin/configuracoes"]) { r = await call("GET", p); ok("page " + p, r.s === 200, r.s); }
r = await call("GET", "/og"); ok("og image", r.s === 200, r.s);
r = await call("GET", "/"); ok("home ok + tagline", r.s === 200 && r.d.includes("og:title") && r.d.includes("Casamento de Helena"), "");
console.log((r.d.match(/<meta property="og:[^>]+>/g) || []).join("\n"));
// gifts crud
r = await call("POST", "/api/admin/gifts", { name: "Teste", description: "d", imageUrl: "", amountCents: 10000, active: true, sortOrder: 9 }); ok("gift create", r.s === 201, r);
const gid = r.d.id;
r = await call("PUT", `/api/admin/gifts/${gid}`, { name: "Teste2", description: "d", imageUrl: "", amountCents: 12000, active: false, sortOrder: 9 }); ok("gift update", r.s === 200 && r.d.name === "Teste2", r);
r = await call("POST", "/api/gifts/orders", { giftId: gid }); ok("inactive gift rejected", r.s === 400, r);
r = await call("DELETE", `/api/admin/gifts/${gid}`); ok("gift delete", r.s === 200, r);
// logout
r = await call("POST", "/api/admin/logout"); cookie = ""; r = await call("GET", "/api/admin/gifts"); ok("after logout 401", r.s === 401, r);
