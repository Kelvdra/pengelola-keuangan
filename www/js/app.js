(function () {
  "use strict";

  /* ================= Data & konstanta ================= */
  var PAL = ["#6366f1", "#0ea5e9", "#14b8a6", "#10b981", "#f59e0b", "#f97316", "#ec4899", "#8b5cf6"];
  /* Warna palet lama -> palet baru (migrasi data tersimpan) */
  var OLD_COLOR = { "#7cb518": "#10b981", "#e0b03a": "#f59e0b", "#2fd09a": "#14b8a6", "#8c84f0": "#8b5cf6", "#4aa8d8": "#0ea5e9", "#e5708a": "#ec4899", "#6b7280": "#64748b" };

  /* [nama, ikon, warna] */
  var OUT = [
    ["Pribadi", "user", "#10b981"], ["Motor", "motorcycle", "#f59e0b"], ["Lainnya", "grid", "#14b8a6"], ["Belanja", "cart", "#f59e0b"],
    ["Makanan", "utensils", "#14b8a6"], ["Hutang", "file", "#8b5cf6"], ["Telepon", "phone", "#0ea5e9"], ["Hiburan", "gamepad", "#ec4899"],
    ["Pendidikan", "graduation", "#0ea5e9"], ["Kecantikan", "scissors", "#ec4899"], ["Olahraga", "activity", "#10b981"], ["Sosial", "users", "#0ea5e9"],
    ["Transportasi", "bus", "#f59e0b"], ["Pakaian", "shirt", "#8b5cf6"], ["Kesehatan", "heart", "#ec4899"], ["Rumah", "home", "#f59e0b"],
    ["Hadiah", "gift", "#8b5cf6"], ["Donasi", "hand", "#14b8a6"]
  ];
  var IN = [
    ["Gaji", "briefcase", "#f59e0b"], ["Bonus", "sparkles", "#10b981"], ["Usaha", "store", "#14b8a6"], ["Hadiah", "gift", "#8b5cf6"], ["Lainnya", "grid", "#0ea5e9"]
  ];
  var K = "pk_tx_v1", K2 = "pk_acc_v1", K3 = "pk_cat_v1";
  var tx = [], acc = [], AT = null, tab = "h", ty = "out", cat = null, eid = null, gt = "out";
  var NEUTRAL = "#64748b";

  /* ================= Util ================= */
  var $ = function (s) { return document.querySelector(s); };
  var svg = function (n, s, w) { return Icons.svg(n, s, w); };
  var esc = function (s) { return String(s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); };
  var rp = function (n) { return Math.round(n).toLocaleString("id-ID"); };
  var safeColor = function (c, fb) { return /^#[0-9a-f]{6}$/i.test(String(c || "")) ? String(c).toLowerCase() : (fb || NEUTRAL); };
  var parseNum = function (v) { return parseFloat(String(v).replace(/\s/g, "").replace(/\./g, "").replace(",", ".")) || 0; };
  var today = function () { var d = new Date(); return new Date(d - d.getTimezoneOffset() * 6e4).toISOString().slice(0, 10); };
  var ML = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
  var mlabel = function (m) { return ML[+m.slice(5) - 1] + " " + m.slice(0, 4); };

  function badge(icon, color, cls) {
    var c = safeColor(color);
    return '<div class="ic ' + (cls || "") + '" style="background:' + c + '24;color:' + c + '">' + svg(icon, cls === "sm" ? 18 : 22) + "</div>";
  }
  var info = function (t, c) { return (t === "in" ? IN : OUT).find(function (x) { return x[0] === c; }) || ["?", "tag", NEUTRAL]; };

  var toastT;
  function toast(t) {
    var e = $("#toast"); e.textContent = t; e.classList.add("show");
    clearTimeout(toastT); toastT = setTimeout(function () { e.classList.remove("show"); }, 2600);
  }

  /* ================= Dialog (pengganti prompt/confirm/alert) ================= */
  function present(html, mount) {
    return new Promise(function (res) {
      var sc = $("#scrim"), bx = $("#sheet");
      bx.innerHTML = '<div class="grab"></div>' + html; sc.classList.add("show");
      var done = function (v) { sc.classList.remove("show"); sc.onclick = null; res(v); };
      sc.onclick = function (e) { if (e.target === sc) done(null); };
      mount(bx, done);
    });
  }

  function confirmD(title, msg, ok, danger) {
    return present('<h3>' + esc(title) + '</h3><p class="m">' + esc(msg) + '</p><div class="acts"><button class="btn alt" data-r="0">Batal</button><button class="btn ' +
      (danger === false ? "" : "danger") + '" data-r="1">' + esc(ok || "Hapus") + "</button></div>",
      function (b, d) { b.querySelectorAll("[data-r]").forEach(function (x) { x.onclick = function () { d(x.dataset.r === "1"); }; }); }).then(Boolean);
  }

  /* Form umum: nama, angka, ikon, warna. Mengembalikan {name,num,icon,color} | {del:true} | null */
  function form(o) {
    var icon = o.icons ? Icons.key(o.icons.value) : null, color = o.colors ? safeColor(o.colors.value, PAL[0]) : null;
    var html = "<h3>" + esc(o.title) + "</h3>" + (o.sub ? '<p class="m">' + esc(o.sub) + "</p>" : '<div style="height:10px"></div>') +
      '<div class="field"><label for="f-name">' + esc(o.nameLabel) + '</label><input id="f-name" type="text" maxlength="30" autocomplete="off" value="' + esc(o.name || "") + '" placeholder="' + esc(o.ph || "") + '"></div>' +
      (o.num ? '<div class="field"><label for="f-num">' + esc(o.num.label) + '</label><input id="f-num" type="text" inputmode="decimal" value="' + esc(o.num.value) + '"></div>' : "") +
      (o.icons ? '<div class="field"><label>Ikon</label><div class="picks" id="f-ic"></div></div>' : "") +
      (o.colors ? '<div class="field"><label>Warna</label><div class="swatches" id="f-co"></div></div>' : "") +
      '<div class="acts"><button class="btn alt" data-r="x">Batal</button><button class="btn" data-r="ok">' + esc(o.ok || "Simpan") + "</button>" +
      (o.del ? '<button class="btn danger full" data-r="del">' + svg("trash", 18) + " " + esc(o.del) + "</button>" : "") + "</div>";
    return present(html, function (b, done) {
      var nm = b.querySelector("#f-name");
      function paint() {
        if (o.icons) b.querySelector("#f-ic").innerHTML = o.icons.list.map(function (k) {
          return '<button type="button" data-k="' + k + '" class="' + (k === icon ? "sel" : "") + '" aria-label="' + k + '"' + (k === icon && color ? ' style="color:' + color + '"' : "") + ">" + svg(k, 22) + "</button>";
        }).join("");
        if (o.colors) b.querySelector("#f-co").innerHTML = PAL.map(function (c) {
          return '<button type="button" data-c="' + c + '" class="' + (c === color ? "sel" : "") + '" style="background:' + c + '" aria-label="' + c + '">' + svg("check", 14, 3) + "</button>";
        }).join("");
      }
      paint();
      b.onclick = function (e) {
        var k = e.target.closest("[data-k]"), c = e.target.closest("[data-c]"), r = e.target.closest("[data-r]");
        if (k) { icon = k.dataset.k; paint(); }
        else if (c) { color = c.dataset.c; paint(); }
        else if (r) {
          if (r.dataset.r === "x") return done(null);
          if (r.dataset.r === "del") return done({ del: true });
          var name = nm.value.trim();
          if (!name) { nm.focus(); nm.style.borderColor = "var(--out)"; return; }
          done({ name: name, num: o.num ? parseNum(b.querySelector("#f-num").value) : 0, icon: icon, color: color });
        }
      };
      if (!o.name) setTimeout(function () { nm.focus(); }, 280);
    });
  }

  /* ================= Penyimpanan ================= */
  function load() {
    try { tx = JSON.parse(localStorage.getItem(K) || "[]"); } catch (e) { tx = []; }
    try { acc = JSON.parse(localStorage.getItem(K2) || "null"); } catch (e) { acc = null; }
    if (!acc || !acc.length) acc = [{ id: "cash", name: "Cash", icon: "cash", start: 0 }, { id: "bank", name: "Rekening", icon: "bank", start: 0 }, { id: "ewallet", name: "Dompet Digital", icon: "phone", start: 0 }];
    tx.forEach(function (t) { if (!t.acc && t.type !== "tf") t.acc = acc[0].id; });
    try { var c = JSON.parse(localStorage.getItem(K3) || "null"); if (c && c.OUT && c.IN) { OUT = c.OUT; IN = c.IN; } } catch (e) { }
    migrate();
  }
  /* Ubah emoji lama menjadi kunci ikon SVG dan warna lama menjadi palet baru */
  function migrate() {
    var fix = function (L) { L.forEach(function (c) { c[1] = Icons.key(c[1]); var lc = String(c[2]).toLowerCase(); c[2] = safeColor(OLD_COLOR[lc] || lc, PAL[0]); }); };
    fix(OUT); fix(IN);
    acc.forEach(function (a) { a.icon = Icons.key(a.icon); });
    persist();
  }
  function persist() {
    try { localStorage.setItem(K, JSON.stringify(tx)); localStorage.setItem(K2, JSON.stringify(acc)); localStorage.setItem(K3, JSON.stringify({ OUT: OUT, IN: IN })); } catch (e) { }
  }

  /* ================= Perhitungan ================= */
  function bal(id) {
    var b = (acc.find(function (a) { return a.id === id; }) || {}).start || 0;
    tx.forEach(function (t) {
      if (t.type === "in" && t.acc === id) b += t.amount;
      else if (t.type === "out" && t.acc === id) b -= t.amount;
      else if (t.type === "tf") { if (t.from === id) b -= t.amount; if (t.to === id) b += t.amount; }
    });
    return b;
  }
  var an = function (id) { return (acc.find(function (a) { return a.id === id; }) || { name: "?" }).name; };
  function gid(nm) {
    nm = String(nm || "").trim() || "Cash";
    var a = acc.find(function (x) { return x.name.toLowerCase() === nm.toLowerCase(); });
    if (!a) { a = { id: "a" + Date.now() + Math.random().toString(36).slice(2, 5), name: nm, icon: "wallet", start: 0 }; acc.push(a); }
    return a;
  }
  function months() { var s = new Set([today().slice(0, 7)]); tx.forEach(function (t) { s.add(t.date.slice(0, 7)); }); return Array.from(s).sort().reverse(); }
  function fillMon() {
    var c = $("#mon").value, sel = $("#mon");
    sel.innerHTML = '<option value="all">Semua</option>' + months().map(function (m) { return '<option value="' + m + '">' + mlabel(m) + "</option>"; }).join("");
    sel.value = c && Array.from(sel.options).some(function (o) { return o.value === c; }) ? c : today().slice(0, 7);
  }
  function cur() {
    var m = $("#mon").value;
    return tx.filter(function (t) { return m === "all" || t.date.startsWith(m); }).sort(function (a, b) { return b.date.localeCompare(a.date) || b.id - a.id; });
  }
  function sums(l) { var o = 0, i = 0; l.forEach(function (t) { if (t.type === "in") i += t.amount; else if (t.type === "out") o += t.amount; }); return [o, i]; }
  var money = function (n) { return (n < 0 ? "−" : "") + rp(Math.abs(n)); };

  /* ================= Tampilan utama ================= */
  function empty(icon, title, text) {
    return '<div class="empty"><div class="art">' + svg(icon, 32) + "</div><b>" + title + "</b><p>" + text + "</p></div>";
  }

  function render() {
    var l = cur(), s = sums(l), o = s[0], i = s[1], m = $("#main"), mv = $("#mon").value;
    $("#hLbl").textContent = "Saldo periode · " + (mv === "all" ? "Semua waktu" : mlabel(mv));
    $("#hBal").innerHTML = "<sup>" + (i - o < 0 ? "−Rp" : "Rp") + "</sup>" + rp(Math.abs(i - o));
    $("#hIn").textContent = "Rp " + rp(i); $("#hOut").textContent = "Rp " + rp(o);
    $("#hero").style.display = (tab === "h" || tab === "g") ? "" : "none";
    $("#sub").textContent = { h: "Riwayat transaksi", w: "Dompet saya", g: "Analisis kategori", d: "Data & cadangan" }[tab];

    if (tab === "h") return renderHistory(l, m);
    if (tab === "w") return renderWallets(m);
    if (tab === "g") return renderChart(l, m);
    renderData(m);
  }

  function renderHistory(l, m) {
    if (!l.length) { m.innerHTML = empty("inbox", "Belum ada transaksi", "Ketuk tombol + untuk mencatat pemasukan atau pengeluaran pertama Anda."); return; }
    var h = "", d = "", open = false;
    l.forEach(function (t) {
      if (t.date !== d) {
        if (open) h += "</div>";
        d = t.date; open = true;
        var dl = l.filter(function (x) { return x.date === d; }), ss = sums(dl);
        h += '<div class="day"><strong>' + new Date(d + "T00:00").toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "short" }) + "</strong><span>" +
          (ss[0] ? '<span class="neg">−' + rp(ss[0]) + "</span>" : "") + (ss[0] && ss[1] ? " · " : "") + (ss[1] ? '<span class="pos">+' + rp(ss[1]) + "</span>" : "") + '</span></div><div class="card in">';
      }
      var tf = t.type === "tf", c = tf ? ["Transfer", "repeat", NEUTRAL] : info(t.type, t.cat);
      h += '<button class="row" data-id="' + t.id + '">' + badge(c[1], c[2]) + '<div class="n"><div class="t">' + esc(t.note || t.cat) + "</div><small>" +
        (tf ? esc(an(t.from)) + " → " + esc(an(t.to)) : esc(t.cat) + " · " + esc(an(t.acc))) + '</small></div><b class="v num ' + (t.type === "in" ? "pos" : tf ? "" : "neg") + '">' +
        (t.type === "out" ? "−" : t.type === "in" ? "+" : "") + rp(t.amount) + "</b></button>";
    });
    m.innerHTML = h + "</div>";
    m.querySelectorAll(".row").forEach(function (r) { r.onclick = function () { openM(+r.dataset.id); }; });
  }

  function renderWallets(m) {
    var total = acc.reduce(function (s, a) { return s + bal(a.id); }, 0);
    m.innerHTML = '<div class="sec"><h2>Total semua dompet</h2></div><div class="card"><div class="total"><div><div class="lbl">Saldo gabungan</div><div class="big num ' + (total < 0 ? "neg" : "") + '">Rp ' + money(total) + "</div></div></div></div>" +
      '<div class="sec"><h2>Dompet</h2><span>' + acc.length + " akun</span></div><div class='card'>" +
      acc.map(function (a) {
        var b = bal(a.id);
        return '<button class="row" data-a="' + esc(a.id) + '">' + badge(a.icon, "#6366f1") + '<div class="n"><div class="t">' + esc(a.name) + "</div><small>Saldo awal " + money(a.start) + '</small></div><b class="v num ' + (b < 0 ? "neg" : "") + '">' + money(b) + "</b></button>";
      }).join("") + "</div>" +
      '<div class="stack"><button class="btn" id="tfb">' + svg("repeat", 18) + ' Pindahkan saldo</button><button class="btn alt" id="aa">' + svg("plus", 18) + ' Tambah dompet</button></div>' +
      '<p class="note">Ketuk dompet untuk mengubah nama, ikon, atau saldo awal. Dompet yang sudah dipakai transaksi tidak dapat dihapus.</p>';
    m.querySelectorAll("[data-a]").forEach(function (r) { r.onclick = function () { editWallet(acc.find(function (x) { return x.id === r.dataset.a; })); }; });
    $("#aa").onclick = function () { editWallet(null); };
    $("#tfb").onclick = function () { openM(null, "tf"); };
  }

  function editWallet(a) {
    form({
      title: a ? "Ubah dompet" : "Dompet baru", nameLabel: "Nama dompet", name: a ? a.name : "", ph: "mis. Tabungan",
      num: { label: "Saldo awal (Rp)", value: a ? a.start : 0 }, icons: { list: Icons.WALLET, value: a ? a.icon : "wallet" }, ok: a ? "Simpan" : "Tambah", del: a ? "Hapus dompet" : null
    }).then(function (r) {
      if (!r) return;
      if (r.del) {
        if (acc.length < 2 || tx.some(function (t) { return t.acc === a.id || t.from === a.id || t.to === a.id; })) return toast("Dompet ini sudah dipakai transaksi sehingga tidak bisa dihapus.");
        return confirmD("Hapus dompet?", "Dompet “" + a.name + "” akan dihapus permanen.").then(function (ok) { if (ok) { acc = acc.filter(function (x) { return x !== a; }); persist(); render(); toast("Dompet dihapus"); } });
      }
      if (a) { a.name = r.name; a.start = r.num; a.icon = r.icon; }
      else acc.push({ id: "a" + Date.now(), name: r.name, icon: r.icon, start: r.num });
      persist(); render(); toast(a ? "Dompet diperbarui" : "Dompet ditambahkan");
    });
  }

  function renderChart(l, m) {
    var by = {};
    l.filter(function (t) { return t.type === gt; }).forEach(function (t) { by[t.cat] = (by[t.cat] || 0) + t.amount; });
    var e = Object.keys(by).map(function (k) { return [k, by[k]]; }).sort(function (a, b) { return b[1] - a[1]; }), tot = e.reduce(function (s, x) { return s + x[1]; }, 0);
    var head = '<div class="seg" id="gs"><button data-y="out" class="' + (gt === "out" ? "on" : "") + '">Pengeluaran</button><button data-y="in" class="' + (gt === "in" ? "on" : "") + '">Pemasukan</button></div>';
    if (!tot) { m.innerHTML = head + empty("pie", "Belum ada data", "Grafik akan muncul setelah ada transaksi pada periode ini."); }
    else {
      var a = 0, C = 2 * Math.PI * 45, gr = e.map(function (x, i) {
        var c = info(gt, x[0])[2], len = x[1] / tot * C, s = a; a += len;
        return '<circle cx="60" cy="60" r="45" fill="none" stroke="' + safeColor(c) + '" stroke-width="15" style="--c:' + C + ";stroke-dasharray:" + Math.max(len - 1.8, .5) + " " + C + ";stroke-dashoffset:" + (-s) + ";animation-delay:" + i * .1 + 's"/>';
      }).join("");
      m.innerHTML = head + '<div class="donut"><svg viewBox="0 0 120 120"><circle cx="60" cy="60" r="45" fill="none" stroke="var(--surface-2)" stroke-width="15" style="animation:none"/>' + gr + '</svg><div class="mid"><span>Total ' + (gt === "out" ? "keluar" : "masuk") + '</span><b class="num cnt" data-v="' + tot + '">0</b></div></div>' +
        '<div class="card">' + e.map(function (x, i) {
          var c = info(gt, x[0]), pc = x[1] / tot * 100;
          return '<div class="row">' + badge(c[1], c[2], "sm") + '<div class="n"><div class="lr"><span>' + esc(x[0]) + '</span><span class="num">' + rp(x[1]) + '</span></div><div class="bar-w"><div class="bar" style="width:' + Math.max(3, pc) + "%;background:" + safeColor(c[2]) + ";animation:grow .8s cubic-bezier(.2,.8,.2,1) both;animation-delay:" + (.2 + i * .06) + 's"></div></div><span class="lr p">' + pc.toFixed(1).replace(".", ",") + "%</span></div></div>";
        }).join("") + "</div>";
      var ct = m.querySelector(".cnt");
      if (ct) { var T = +ct.dataset.v, t0 = performance.now(); (function f(n) { var p = Math.min(1, (n - t0) / 900); ct.textContent = rp(T * (1 - Math.pow(1 - p, 3))); if (p < 1) requestAnimationFrame(f); })(t0); }
    }
    m.querySelectorAll("#gs button").forEach(function (b) { b.onclick = function () { gt = b.dataset.y; render(); }; });
  }

  function renderData(m) {
    var A = function (id, ic, t, s, cls) { return '<button class="row act ' + (cls || "") + '" id="' + id + '"><div class="ic">' + svg(ic, 22) + '</div><div class="n"><div class="t">' + t + "</div><small>" + s + '</small></div><span class="go">' + svg("chevronR", 18) + "</span></button>"; };
    m.innerHTML = '<div class="sec"><h2>Ekspor</h2></div><div class="card">' +
      A("ex", "sheet", "Excel (.xlsx)", "Transaksi, dompet, dan kategori") + A("ep", "doc", "PDF", "Laporan ringkas siap cetak") + A("ec", "file", "CSV", "Format teks untuk aplikasi lain") + "</div>" +
      '<div class="sec"><h2>Impor</h2></div><div class="card"><label class="row act" style="cursor:pointer"><div class="ic">' + svg("upload", 22) + '</div><div class="n"><div class="t">Impor Excel / CSV</div><small>Pulihkan dari berkas cadangan</small></div><span class="go">' + svg("chevronR", 18) + '</span><input type="file" id="im" accept=".xlsx,.xls,.csv" hidden></label></div>' +
      '<div class="sec"><h2>Zona berbahaya</h2></div><div class="card">' + A("rs", "trash", "Hapus semua transaksi", "Ekspor dulu untuk cadangan", "dg") + "</div>" +
      '<div class="note" style="display:flex;gap:8px;align-items:flex-start">' + svg("shield", 18) + '<span>Data tersimpan hanya di perangkat ini dan bekerja sepenuhnya offline. Lakukan ekspor secara berkala sebagai cadangan.</span></div>' +
      '<p class="ft">Pengelola Keuangan</p>';
    wire();
  }

  /* ================= Ekspor / impor ================= */
  async function save(name, data) {
    try {
      var blob = data instanceof Blob ? data : new Blob([data]), C = window.Capacitor;
      if (C && C.isNativePlatform && C.isNativePlatform()) {
        var b64 = await new Promise(function (ok, no) { var r = new FileReader(); r.onload = function () { ok(r.result.split(",")[1]); }; r.onerror = no; r.readAsDataURL(blob); });
        var w = await C.Plugins.Filesystem.writeFile({ path: name, data: b64, directory: "CACHE" });
        await C.Plugins.Share.share({ title: name, url: w.uri, dialogTitle: "Simpan atau bagikan " + name }); toast("Siap dibagikan: " + name); return;
      }
      var u = URL.createObjectURL(blob), l = document.createElement("a"); l.href = u; l.download = name; document.body.appendChild(l); l.click(); l.remove();
      setTimeout(function () { URL.revokeObjectURL(u); }, 4000); toast("Diunduh: " + name);
    } catch (x) { toast("Gagal: " + (x.message || x)); }
  }
  function rows() {
    return [["Tanggal", "Jenis", "Kategori", "Catatan", "Jumlah", "Dompet", "Ke Dompet"]].concat(tx.slice().sort(function (a, b) { return a.date.localeCompare(b.date); }).map(function (t) {
      return [t.date, t.type === "in" ? "Pemasukan" : t.type === "tf" ? "Transfer" : "Pengeluaran", t.cat, t.note || "", t.amount, t.type === "tf" ? an(t.from) : an(t.acc), t.type === "tf" ? an(t.to) : ""];
    }));
  }

  function exportPdf() {
    var D = new jspdf.jsPDF(), r = rows(), s = sums(tx), W = 210, y;
    var header = function () {
      D.setFillColor(243, 244, 248); D.rect(0, y - 5, W, 8, "F"); D.setFont(undefined, "bold"); D.setFontSize(8.5); D.setTextColor(71, 85, 105);
      D.text("TANGGAL", 14, y); D.text("JENIS", 40, y); D.text("KATEGORI", 68, y); D.text("CATATAN", 100, y); D.text("DOMPET", 142, y); D.text("JUMLAH", 196, y, { align: "right" });
      y += 8; D.setFont(undefined, "normal");
    };
    D.setFillColor(79, 70, 229); D.rect(0, 0, W, 34, "F");
    D.setTextColor(255, 255, 255); D.setFont(undefined, "bold"); D.setFontSize(17); D.text("Laporan Keuangan", 14, 15);
    D.setFont(undefined, "normal"); D.setFontSize(9); D.text("Dibuat " + new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }), 14, 22);
    D.setFontSize(9.5); D.text("Pemasukan Rp " + rp(s[1]) + "    Pengeluaran Rp " + rp(s[0]) + "    Saldo Rp " + money(s[1] - s[0]), 14, 29);
    y = 46; header();
    r.slice(1).forEach(function (x, k) {
      if (y > 280) { D.addPage(); y = 16; header(); }
      if (k % 2) { D.setFillColor(250, 250, 252); D.rect(0, y - 4.6, W, 6.6, "F"); }
      D.setFontSize(8.5); D.setTextColor(15, 23, 42);
      D.text(String(x[0]), 14, y); D.text(String(x[1]), 40, y); D.text(String(x[2]).slice(0, 16), 68, y); D.text(String(x[3]).slice(0, 22), 100, y);
      D.text((x[5] + (x[6] ? " > " + x[6] : "")).slice(0, 20), 142, y);
      if (x[1] === "Pemasukan") D.setTextColor(5, 150, 105); else if (x[1] === "Pengeluaran") D.setTextColor(225, 29, 72);
      D.text((x[1] === "Pengeluaran" ? "-" : x[1] === "Pemasukan" ? "+" : "") + rp(x[4]), 196, y, { align: "right" }); y += 6.6;
    });
    var n = D.getNumberOfPages(); for (var p = 1; p <= n; p++) { D.setPage(p); D.setFontSize(8); D.setTextColor(133, 145, 165); D.text("Halaman " + p + " / " + n, 105, 291, { align: "center" }); }
    save("keuangan.pdf", D.output("arraybuffer"));
  }

  function wire() {
    $("#ex").onclick = function () {
      try {
        var wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(rows()), "Transaksi");
        XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([["Dompet", "Saldo awal"]].concat(acc.map(function (a) { return [a.name, a.start]; }))), "Dompet");
        XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([["Jenis", "Kategori", "Ikon", "Warna"]].concat(OUT.map(function (c) { return ["Pengeluaran"].concat(c); }), IN.map(function (c) { return ["Pemasukan"].concat(c); }))), "Kategori");
        save("keuangan.xlsx", XLSX.write(wb, { type: "array", bookType: "xlsx" }));
      } catch (e) { toast("Pustaka Excel belum termuat."); }
    };
    $("#ec").onclick = function () { save("keuangan.csv", "﻿" + rows().map(function (r) { return r.map(function (v) { return '"' + String(v).replace(/"/g, '""') + '"'; }).join(","); }).join("\n")); };
    $("#ep").onclick = function () { try { exportPdf(); } catch (e) { toast("Pustaka PDF belum termuat."); } };
    $("#im").onchange = async function (e) {
      var f = e.target.files[0]; if (!f) return;
      try {
        var wb = XLSX.read(await f.arrayBuffer(), { type: "array", cellDates: false });
        var js = XLSX.utils.sheet_to_json(wb.Sheets["Transaksi"] || wb.Sheets[wb.SheetNames[0]], { header: 1, raw: true });
        if (wb.Sheets["Dompet"]) XLSX.utils.sheet_to_json(wb.Sheets["Dompet"], { header: 1 }).slice(1).forEach(function (r) { if (r && r[0]) gid(r[0]).start = parseFloat(r[1]) || 0; });
        if (wb.Sheets["Kategori"]) XLSX.utils.sheet_to_json(wb.Sheets["Kategori"], { header: 1 }).slice(1).forEach(function (r) {
          if (!r || !r[1]) return;
          var L = /masuk/i.test(String(r[0])) ? IN : OUT, nm = String(r[1]);
          if (!L.some(function (c) { return c[0].toLowerCase() === nm.toLowerCase(); })) L.push([nm, Icons.key(r[2]), safeColor(OLD_COLOR[String(r[3]).toLowerCase()] || r[3], PAL[L.length % PAL.length])]);
        });
        var n = 0;
        js.slice(1).forEach(function (r) {
          if (!r || !r[0]) return;
          var d = r[0]; if (typeof d === "number") d = new Date(Math.round((d - 25569) * 864e5)).toISOString().slice(0, 10); d = String(d).slice(0, 10);
          var a = Math.abs(parseFloat(String(r[4]).replace(/[^\d.-]/g, ""))); if (!a || !/^\d{4}-\d{2}-\d{2}$/.test(d)) return;
          var jn = String(r[1]), t = /transfer/i.test(jn) ? "tf" : /masuk/i.test(jn) ? "in" : "out";
          if (tx.some(function (x) { return x.date === d && x.type === t && x.cat === r[2] && x.amount === a && x.note === (r[3] || ""); })) return;
          var o = { id: Date.now() + n, date: d, type: t, cat: t === "tf" ? "Transfer" : String(r[2] || "Lainnya"), note: String(r[3] || ""), amount: a };
          if (t === "tf") { o.from = gid(r[5]).id; o.to = gid(r[6]).id; } else o.acc = gid(r[5]).id;
          if (t !== "tf") { var L = t === "in" ? IN : OUT; if (!L.some(function (c) { return c[0] === o.cat; })) L.push([o.cat, "tag", PAL[L.length % PAL.length]]); }
          tx.push(o); n++;
        });
        persist(); fillMon(); render(); toast(n + " transaksi diimpor");
      } catch (x) { toast("Berkas tidak dapat dibaca."); }
      e.target.value = "";
    };
    $("#rs").onclick = function () {
      confirmD("Hapus semua transaksi?", "Seluruh riwayat transaksi akan dihapus dari perangkat ini. Pastikan Anda sudah mengekspor cadangan.", "Hapus semua").then(function (ok) {
        if (ok) { tx = []; persist(); fillMon(); render(); toast("Semua transaksi dihapus"); }
      });
    };
  }

  /* ================= Form transaksi ================= */
  function cats() {
    var tf = ty === "tf", v1 = $("#a1").value, v2 = $("#a2").value;
    var o = function (p) { return acc.map(function (a) { return '<option value="' + esc(a.id) + '">' + p + esc(a.name) + "</option>"; }).join(""); };
    $("#cats").style.display = tf ? "none" : "grid"; $("#tfh").style.display = tf ? "block" : "none";
    $("#a1").innerHTML = o(tf ? "Dari: " : "Dompet: "); $("#a2").innerHTML = o("Ke: ");
    $("#a1").value = AT ? (tf ? AT.from : AT.acc) : (v1 || acc[0].id);
    $("#a2").value = AT && tf ? AT.to : (v2 || (acc[1] || acc[0]).id);
    $("#a2").parentNode.style.display = tf ? "" : "none";
    $("#cats").innerHTML = (ty === "in" ? IN : OUT).map(function (c) {
      return '<button data-c="' + esc(c[0]) + '" class="' + (cat === c[0] ? "sel" : "") + '">' + badge(c[1], c[2]) + "<span>" + esc(c[0]) + "</span></button>";
    }).join("") + '<button id="cset" class="plain"><div class="ic">' + svg("settings", 22) + "</div><span>Atur</span></button>";
    $("#cats").querySelectorAll("button").forEach(function (b) { b.onclick = function () { if (b.id === "cset") return catMgr(); cat = b.dataset.c; cats(); $("#amt").focus(); }; });
    $("#seg").querySelectorAll("button").forEach(function (b) { b.classList.toggle("on", b.dataset.y === ty); });
    chip();
  }
  function openM(id, f) {
    eid = id || null; var t = tx.find(function (x) { return x.id === id; });
    ty = t ? t.type : (f || "out"); cat = t ? t.cat : null; AT = t;
    $("#amt").value = t ? fmtAmt(String(t.amount).replace(".", ",")) : ""; $("#note").value = t ? t.note : ""; $("#dt").value = t ? t.date : today();
    $("#del").style.visibility = t ? "visible" : "hidden"; dlab(); $("#mt").textContent = t ? "Ubah transaksi" : "Transaksi baru"; cats(); AT = null; $("#mod").classList.add("show");
  }
  function doSave() {
    var a = amtVal(), tf = ty === "tf";
    if (!tf && !cat) return toast("Pilih kategori terlebih dahulu.");
    if (!a || a <= 0) return toast("Masukkan jumlah yang valid.");
    if (tf && $("#a1").value === $("#a2").value) return toast("Dompet asal dan tujuan harus berbeda.");
    var o = { type: ty, cat: tf ? "Transfer" : cat, amount: a, note: $("#note").value.trim(), date: $("#dt").value || today() };
    if (tf) { o.from = $("#a1").value; o.to = $("#a2").value; } else o.acc = $("#a1").value;
    if (eid) Object.assign(tx.find(function (x) { return x.id === eid; }), o); else tx.push(Object.assign({ id: Date.now() }, o));
    persist(); $("#mod").classList.remove("show"); fillMon(); render(); toast(eid ? "Transaksi diperbarui" : "Transaksi disimpan");
  }

  /* Jumlah: keyboard angka bawaan HP, diformat otomatis dengan titik ribuan */
  function fmtAmt(raw) {
    raw = String(raw).replace(/[^\d,]/g, ""); var p = raw.split(","), i = p[0].replace(/^0+(?=\d)/, "").replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    return p.length > 1 ? (i || "0") + "," + p.slice(1).join("") : i;
  }
  var amtVal = function () { return parseFloat($("#amt").value.replace(/\./g, "").replace(",", ".")) || 0; };
  function onAmt() {
    var el = $("#amt"), pos = el.selectionStart, before = el.value.slice(0, pos).replace(/[^\d,]/g, "").length;
    el.value = fmtAmt(el.value);
    var n = 0, np = el.value.length; for (var k = 0; k < el.value.length; k++) { if (n === before) { np = k; break; } if (/[\d,]/.test(el.value[k])) n++; }
    try { el.setSelectionRange(np, np); } catch (e) { }
  }
  function dlab() {
    var v = $("#dt").value || today();
    $("#dtb").innerHTML = svg("calendar", 18) + "<span>" + (v === today() ? "Hari ini" : new Date(v + "T00:00").toLocaleDateString("id-ID", { day: "numeric", month: "short" })) + "</span>";
  }
  function chip() { $("#chip").innerHTML = cat ? '<button type="button">' + esc(cat) + "</button>" : ""; }

  /* ================= Pengaturan kategori ================= */
  function catMgr() {
    var L = ty === "in" ? IN : OUT;
    $("#cm").innerHTML = '<div class="mh"><span></span><b>Kategori ' + (ty === "in" ? "pemasukan" : "pengeluaran") + '</b><button id="cmx" class="r">Selesai</button></div><div class="mc"><div class="card">' +
      L.map(function (c, i) { return '<button class="row" data-i="' + i + '">' + badge(c[1], c[2], "sm") + '<div class="n"><div class="t">' + esc(c[0]) + '</div></div><span class="go">' + svg("pencil", 17) + "</span></button>"; }).join("") +
      '</div><div class="stack"><button class="btn" id="cadd">' + svg("plus", 18) + ' Tambah kategori</button></div><p class="note">Ketuk kategori untuk mengubah nama, ikon, dan warna. Mengganti nama akan ikut memperbarui transaksi lama.</p></div>';
    $("#cm").classList.add("show");
    $("#cmx").onclick = function () { $("#cm").classList.remove("show"); cats(); };
    $("#cadd").onclick = function () {
      form({ title: "Kategori baru", nameLabel: "Nama kategori", ph: "mis. Langganan", icons: { list: Icons.PICKABLE, value: "tag" }, colors: { value: PAL[L.length % PAL.length] }, ok: "Tambah" }).then(function (r) {
        if (!r) return;
        if (L.some(function (c) { return c[0].toLowerCase() === r.name.toLowerCase(); })) return toast("Nama kategori sudah ada.");
        L.push([r.name, r.icon, r.color]); persist(); catMgr(); toast("Kategori ditambahkan");
      });
    };
    $("#cm").querySelectorAll("[data-i]").forEach(function (row) {
      row.onclick = function () {
        var i = +row.dataset.i, c = L[i], old = c[0];
        form({ title: "Ubah kategori", nameLabel: "Nama kategori", name: c[0], icons: { list: Icons.PICKABLE, value: c[1] }, colors: { value: c[2] }, del: "Hapus kategori" }).then(function (r) {
          if (!r) return;
          if (r.del) {
            if (L.length < 2) return toast("Minimal harus ada satu kategori.");
            return confirmD("Hapus kategori?", "Kategori “" + old + "” akan dihapus. Transaksi lama tetap tersimpan.").then(function (ok) { if (ok) { L.splice(i, 1); persist(); catMgr(); } });
          }
          if (r.name.toLowerCase() !== old.toLowerCase() && L.some(function (x) { return x !== c && x[0].toLowerCase() === r.name.toLowerCase(); })) return toast("Nama kategori sudah ada.");
          c[0] = r.name; c[1] = r.icon; c[2] = r.color;
          if (c[0] !== old) { tx.forEach(function (t) { if (t.cat === old && t.type === ty) t.cat = c[0]; }); if (cat === old) cat = c[0]; }
          persist(); catMgr();
        });
      };
    });
  }

  /* ================= Inisialisasi ================= */
  function init() {
    $("#fab").innerHTML = svg("plus", 26, 2.4);
    $("#mark").innerHTML = svg("wallet", 19, 2);
    $("#hInI").innerHTML = svg("arrowIn", 16, 2.2); $("#hOutI").innerHTML = svg("arrowOut", 16, 2.2);
    $("#cx").onclick = function () { $("#mod").classList.remove("show"); };
    $("#del").onclick = function () {
      confirmD("Hapus transaksi?", "Transaksi ini akan dihapus permanen.").then(function (ok) {
        if (!ok) return; tx = tx.filter(function (x) { return x.id !== eid; }); persist(); $("#mod").classList.remove("show"); fillMon(); render(); toast("Transaksi dihapus");
      });
    };
    $("#fab").onclick = function () { openM(); };
    $("#seg").querySelectorAll("button").forEach(function (b) { b.onclick = function () { ty = b.dataset.y; cat = null; cats(); }; });
    document.querySelectorAll("nav button[data-t]").forEach(function (b) {
      b.onclick = function () { tab = b.dataset.t; document.querySelectorAll("nav button[data-t]").forEach(function (x) { x.classList.toggle("on", x === b); }); $("#main").scrollTop = 0; render(); };
    });
    $("#mon").onchange = render;
    var NAV = { h: "list", w: "wallet", g: "pie", d: "settings" };
    document.querySelectorAll("nav button[data-t]").forEach(function (b) { b.insertAdjacentHTML("afterbegin", svg(NAV[b.dataset.t], 22)); });
    document.querySelectorAll(".sel .i-slot").forEach(function (s) { s.outerHTML = svg("chevron", 16); });
    $("#save").innerHTML = svg("check", 20, 2.4) + " Simpan"; $("#save").onclick = doSave;
    $("#amt").oninput = onAmt;
    $("#amt").onkeydown = function (e) { if (e.key === "Enter") { e.preventDefault(); $("#note").focus(); } };
    $("#note").onkeydown = function (e) { if (e.key === "Enter") { e.preventDefault(); e.target.blur(); } };
    $("#dtb").onclick = function () { try { $("#dt").showPicker(); } catch (e) { $("#dt").click(); } };
    $("#dt").onchange = dlab;
    $("#chip").onclick = function () { if (cat) $("#note").value = cat; };
    load(); fillMon(); render();
  }

  init();
})();
