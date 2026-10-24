/* Ikon SVG (gaya garis, viewBox 24x24). Dipakai untuk kategori, dompet, dan antarmuka. */
(function () {
  "use strict";

  var P = {
    /* Kategori */
    user: '<circle cx="12" cy="8" r="4"/><path d="M4 21v-1a6 6 0 0 1 6-6h4a6 6 0 0 1 6 6v1"/>',
    users: '<circle cx="9" cy="8" r="3.5"/><path d="M2 21v-1a5 5 0 0 1 5-5h4a5 5 0 0 1 5 5v1M16 4.6a3.5 3.5 0 0 1 0 6.8M22 21v-1a5 5 0 0 0-3.5-4.8"/>',
    motorcycle: '<circle cx="5.5" cy="17" r="3"/><circle cx="18.5" cy="17" r="3"/><path d="M8.5 17h4.6l3-6.5M13 10.5h3.6M15 6h3l1.2 5"/>',
    car: '<path d="M5 17H3.5v-5L5.6 7h12.8l2.1 5v5H19M5 17a2 2 0 0 0 4 0M15 17a2 2 0 0 0 4 0M9 17h6M3.5 12h17"/>',
    bus: '<rect x="4" y="3" width="16" height="14" rx="3"/><path d="M4 11h16M8 17v3M16 17v3"/><circle cx="8" cy="14" r=".7"/><circle cx="16" cy="14" r=".7"/>',
    plane: '<path d="M17.8 19.2 16 11l3.5-3.5a2 2 0 0 0-2.8-2.8L13.2 8.2 5 6.4 3.6 7.8l6.3 3.5-3 3-3-.5L2.5 15l3.7 1.8L8 20.5l1.1-1.1-.5-3 3-3 3.5 6.3z"/>',
    grid: '<rect x="3" y="3" width="7.5" height="7.5" rx="2"/><rect x="13.5" y="3" width="7.5" height="7.5" rx="2"/><rect x="3" y="13.5" width="7.5" height="7.5" rx="2"/><rect x="13.5" y="13.5" width="7.5" height="7.5" rx="2"/>',
    cart: '<circle cx="9" cy="20" r="1.2"/><circle cx="18" cy="20" r="1.2"/><path d="M2 3h3l2.7 12.4a2 2 0 0 0 2 1.6h7.7a2 2 0 0 0 2-1.6L21 7H6"/>',
    utensils: '<path d="M6 3v7a2 2 0 0 0 4 0V3M8 3v18M17 21V3c-2.6 1.2-4 4-4 7.5 0 2 1.2 3.5 4 3.5"/>',
    coffee: '<path d="M4 8h13v6a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5zM17 10h1.5a2.5 2.5 0 0 1 0 5H17M8 2.5v2.5M12 2.5v2.5"/>',
    file: '<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5M9 13h6M9 17h6"/>',
    phone: '<rect x="6" y="2" width="12" height="20" rx="3"/><path d="M11 18h2"/>',
    wifi: '<path d="M2 9a15 15 0 0 1 20 0M5 12.5a10 10 0 0 1 14 0M8.5 16a5 5 0 0 1 7 0"/><circle cx="12" cy="19.5" r="1"/>',
    zap: '<path d="M13 2 4 14h7l-1 8 9-12h-7z"/>',
    gamepad: '<path d="M6 11h4M8 9v4M15 12h.01M18 10h.01"/><path d="M17.3 5H6.7a4 4 0 0 0-3.9 3.2l-1.4 7A2.8 2.8 0 0 0 6.3 17L8 15h8l1.7 2a2.8 2.8 0 0 0 4.9-1.8l-1.4-7A4 4 0 0 0 17.3 5z"/>',
    graduation: '<path d="M22 9 12 4 2 9l10 5z"/><path d="M6 11v5c0 1.5 2.7 3 6 3s6-1.5 6-3v-5M22 9v6"/>',
    book: '<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20V3H6.5A2.5 2.5 0 0 0 4 5.5z"/><path d="M4 19.5A2.5 2.5 0 0 0 6.5 22H20v-5"/>',
    scissors: '<circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><path d="M20 4 8.1 15.9M14.5 14.5 20 20M8.1 8.1 12 12"/>',
    activity: '<path d="M22 12h-4l-3 9L9 3l-3 9H2"/>',
    shirt: '<path d="M8 3 3 6l2 5 3-1v11h8V10l3 1 2-5-5-3a4 4 0 0 1-8 0z"/>',
    heart: '<path d="M12 21s-8-5.2-8-11a4.5 4.5 0 0 1 8-2.8A4.5 4.5 0 0 1 20 10c0 5.8-8 11-8 11z"/>',
    home: '<path d="m3 11 9-8 9 8M5 9.5V20h14V9.5M10 20v-6h4v6"/>',
    gift: '<rect x="3" y="8" width="18" height="4" rx="1"/><path d="M12 8v13M5 12v8a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-8M7.5 8a2.5 2.5 0 0 1 0-5C10 3 12 8 12 8s2-5 4.5-5a2.5 2.5 0 0 1 0 5"/>',
    hand: '<path d="M11 15h2a2 2 0 0 0 0-4h-3a2 2 0 0 0-1.4.6L3 17M7 21l1.6-1.4a2 2 0 0 1 1.4-.6h5.5a3 3 0 0 0 2.1-.9L21 14.5a1.6 1.6 0 0 0-2.3-2.2l-2.5 2.2"/><circle cx="17" cy="6" r="3"/>',
    briefcase: '<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2M3 13h18"/>',
    sparkles: '<path d="m12 3 1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8zM19 16l.8 2.2L22 19l-2.2.8L19 22l-.8-2.2L16 19l2.2-.8z"/>',
    store: '<path d="m4 9 1-5h14l1 5M4 9a2.7 2.7 0 0 0 5.3 0 2.7 2.7 0 0 0 5.4 0A2.7 2.7 0 0 0 20 9M5 12v8h14v-8M10 20v-5h4v5"/>',
    trending: '<path d="m3 17 6-6 4 4 8-8M15 7h6v6"/>',
    piggy: '<path d="M5 11a7 7 0 0 1 7-6h3l2-2v3.5a6 6 0 0 1 2 3.5h1v4h-1.5a6 6 0 0 1-2.5 3v2h-3v-1.5h-3V20H7v-2.5A6 6 0 0 1 5 13z"/><path d="M15 10h.01"/>',
    tag: '<path d="M20.6 13.4 13.4 20.6a2 2 0 0 1-2.8 0L3 13V3h10l7.6 7.6a2 2 0 0 1 0 2.8z"/><circle cx="7.5" cy="7.5" r="1.2"/>',

    /* Dompet */
    wallet: '<path d="M3 7a2 2 0 0 1 2-2h13v4"/><path d="M3 7v11a2 2 0 0 0 2 2h14a1 1 0 0 0 1-1V10a1 1 0 0 0-1-1H5a2 2 0 0 1-2-2z"/><path d="M16.5 14.5h.01"/>',
    cash: '<rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="12" cy="12" r="2.5"/><path d="M6 10v4M18 10v4"/>',
    bank: '<path d="M3 21h18M5 21V10M9.5 21V10M14.5 21V10M19 21V10M2.5 9 12 3l9.5 6z"/>',
    card: '<rect x="2" y="5" width="20" height="14" rx="2.5"/><path d="M2 10h20M6 15h4"/>',

    /* Antarmuka */
    repeat: '<path d="m17 2 4 4-4 4M3 11V9a3 3 0 0 1 3-3h15M7 22l-4-4 4-4M21 13v2a3 3 0 0 1-3 3H3"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    check: '<path d="m5 12.5 4.5 4.5L19 7.5"/>',
    close: '<path d="M6 6l12 12M18 6 6 18"/>',
    backspace: '<path d="M21 5H9l-6 7 6 7h12a1 1 0 0 0 1-1V6a1 1 0 0 0-1-1zM17 9.5l-5 5M12 9.5l5 5"/>',
    calendar: '<rect x="3" y="4.5" width="18" height="16.5" rx="2.5"/><path d="M3 10h18M8 2.5v4M16 2.5v4"/>',
    chevron: '<path d="m6 9 6 6 6-6"/>',
    chevronR: '<path d="m9 6 6 6-6 6"/>',
    pencil: '<path d="M4 20h4L19.5 8.5a2.1 2.1 0 0 0-3-3L5 17z"/><path d="m14.5 7.5 3 3"/>',
    trash: '<path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/>',
    arrowIn: '<path d="M17 7 7 17M7 8v9h9"/>',
    arrowOut: '<path d="M7 17 17 7M8 7h9v9"/>',
    list: '<path d="M8 6h13M8 12h13M8 18h13"/><path d="M3.5 6h.01M3.5 12h.01M3.5 18h.01"/>',
    pie: '<path d="M21 12A9 9 0 1 1 12 3v9z"/><path d="M15 3.5A9 9 0 0 1 20.5 9H15z"/>',
    download: '<path d="M12 3v12M7 10l5 5 5-5M4 20h16"/>',
    upload: '<path d="M12 16V4M7 9l5-5 5 5M4 20h16"/>',
    sheet: '<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5M8 13h8M8 17h8M12 13v4"/>',
    doc: '<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5M9 13h6M9 17h4"/>',
    shield: '<path d="M12 3 4.5 6v5.5c0 4.6 3.2 8.2 7.5 9.5 4.3-1.3 7.5-4.9 7.5-9.5V6z"/><path d="m9 12 2.2 2.2L15.5 10"/>',
    settings: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>',
    inbox: '<path d="M3 13h5l1.5 3h5L16 13h5M5.5 5h13L21 13v6a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-6z"/>'
  };

  /* Kategori yang bisa dipilih pengguna, urut tampil di pemilih ikon */
  var PICKABLE = ["user", "users", "motorcycle", "car", "bus", "plane", "cart", "utensils", "coffee", "home", "zap", "wifi", "phone",
    "gamepad", "graduation", "book", "scissors", "activity", "shirt", "heart", "gift", "hand", "briefcase", "store", "sparkles",
    "trending", "piggy", "file", "grid", "tag"];
  var WALLET = ["wallet", "cash", "bank", "card", "phone", "piggy"];

  /* Emoji bawaan versi lama -> kunci ikon, supaya data lama tetap tampil benar */
  var LEGACY = {
    "\u{1F9CD}": "user", "\u{1F3CD}": "motorcycle", "\u{1F52D}": "grid", "\u{1F6D2}": "cart", "\u{1F374}": "utensils",
    "\u{1F4DD}": "file", "\u{1F4F1}": "phone", "\u{1F3AE}": "gamepad", "\u{1F393}": "graduation", "✂": "scissors",
    "\u{1F3C3}": "activity", "\u{1F465}": "users", "\u{1F68C}": "bus", "\u{1F455}": "shirt", "❤": "heart",
    "\u{1F6CB}": "home", "\u{1F381}": "gift", "\u{1F91D}": "hand", "\u{1F4BC}": "briefcase", "\u{1F389}": "sparkles",
    "\u{1F3EA}": "store", "\u{1F3F7}": "tag", "\u{1F45B}": "wallet", "\u{1F4B5}": "cash", "\u{1F3E6}": "bank",
    "\u{1F4F2}": "phone", "\u{1F501}": "repeat", "⚙": "settings", "❔": "tag"
  };

  function key(v) {
    if (v && Object.prototype.hasOwnProperty.call(P, v)) return v;
    var s = String(v || "").replace(/[︎️]/g, "").trim();
    if (Object.prototype.hasOwnProperty.call(P, s)) return s;
    var first = Array.from(s)[0];
    return (first && LEGACY[first]) || "tag";
  }

  /* Mengembalikan markup <svg>. size dalam px, sw = tebal garis */
  function svg(name, size, sw) {
    var k = key(name);
    return '<svg class="i" width="' + (size || 20) + '" height="' + (size || 20) + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="' +
      (sw || 1.75) + '" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">' + P[k] + "</svg>";
  }

  window.Icons = { svg: svg, key: key, PICKABLE: PICKABLE, WALLET: WALLET };
})();
