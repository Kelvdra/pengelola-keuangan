/* Menyusun laporan keuangan .xlsx profesional: Ringkasan (rumus otomatis), Transaksi, Dompet, Kategori.
   Sheet Transaksi/Dompet/Kategori tetap kompatibel dengan fitur Impor aplikasi. */
(function () {
  "use strict";

  var INDIGO = "FF4F46E5", INK = "FF0F172A", MUT = "FF64748B", LINE = "FFE2E8F0", SOFT = "FFEEF0FF", GREEN = "FF059669", RED = "FFE11D48", ZEBRA = "FFF8FAFC", WHITE = "FFFFFFFF";
  var RP = '"Rp" #,##0;[Red]-"Rp" #,##0;"-"', NUM = "#,##0", PCT = "0.0%", DATE = "dd/mm/yyyy", MON = "mmm yyyy";
  var MONTHS = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];

  var serial = function (iso) { var p = String(iso).slice(0, 10).split("-"); return Date.UTC(+p[0], +p[1] - 1, +p[2]) / 864e5 + 25569; };
  var tx$ = "Transaksi!";
  var A = tx$ + "$A:$A", B = tx$ + "$B:$B", C = tx$ + "$C:$C", E = tx$ + "$E:$E", F = tx$ + "$F:$F", G = tx$ + "$G:$G";
  var JENIS = { in: "Pemasukan", out: "Pengeluaran", tf: "Transfer" };
  var lbl = function (d) { return d.getDate() + " " + MONTHS[d.getMonth()] + " " + d.getFullYear(); };

  function build(D) {
    var W = XlsxWriter.Workbook, wb = new W(), ref = XlsxWriter.ref;
    var an = D.an, acc = D.acc;
    var txs = D.tx.slice().sort(function (a, b) { return a.date.localeCompare(b.date) || a.id - b.id; });
    var N = txs.length, last = N + 1;

    /* ---------- Gaya ---------- */
    var thin = ["thin", LINE];
    var S = {
      title: wb.style({ b: 1, sz: 20, color: WHITE, fill: INDIGO, h: "left", indent: 1 }),
      sub: wb.style({ sz: 10, color: "FFE0E7FF", fill: INDIGO, h: "left", indent: 1 }),
      cardL: function (c) { return wb.style({ b: 1, sz: 8.5, color: MUT, fill: SOFT, h: "center", border: { left: ["medium", WHITE], right: ["medium", WHITE], top: ["medium", WHITE] } }); },
      cardV: function (c, f) { return wb.style({ b: 1, sz: 16, color: c, fill: SOFT, h: "center", fmt: f, border: { left: ["medium", WHITE], right: ["medium", WHITE], bottom: ["medium", WHITE] } }); },
      sec: wb.style({ b: 1, sz: 11, color: INDIGO, border: { bottom: ["medium", INDIGO] } }),
      th: wb.style({ b: 1, color: WHITE, fill: INDIGO, h: "center", wrap: 1 }),
      thL: wb.style({ b: 1, color: WHITE, fill: INDIGO, h: "left", indent: 1 }),
      txt: wb.style({ h: "left", indent: 1, border: { bottom: thin } }),
      rp: wb.style({ fmt: RP, h: "right", border: { bottom: thin } }),
      num: wb.style({ fmt: NUM, h: "center", border: { bottom: thin } }),
      pct: wb.style({ fmt: PCT, h: "center", border: { bottom: thin } }),
      mon: wb.style({ fmt: MON, h: "left", indent: 1, border: { bottom: thin } }),
      tTxt: wb.style({ b: 1, fill: SOFT, h: "left", indent: 1, border: { top: ["thin", INDIGO] } }),
      tRp: wb.style({ b: 1, fill: SOFT, fmt: RP, h: "right", border: { top: ["thin", INDIGO] } }),
      tNum: wb.style({ b: 1, fill: SOFT, fmt: NUM, h: "center", border: { top: ["thin", INDIGO] } }),
      tPct: wb.style({ b: 1, fill: SOFT, fmt: PCT, h: "center", border: { top: ["thin", INDIGO] } }),
      tBlank: wb.style({ fill: SOFT, border: { top: ["thin", INDIGO] } }),
      kL: wb.style({ color: MUT, h: "left", indent: 1, border: { bottom: thin } }),
      kV: wb.style({ b: 1, h: "right", fmt: RP, border: { bottom: thin } }),
      kN: wb.style({ b: 1, h: "right", fmt: NUM, border: { bottom: thin } }),
      kD: wb.style({ b: 1, h: "right", fmt: DATE, border: { bottom: thin } }),
      kT: wb.style({ b: 1, h: "right", border: { bottom: thin } }),
      note: wb.style({ i: 1, sz: 9, color: MUT, h: "left", indent: 1, wrap: 1, v: "top" }),
      // Transaksi
      hd: wb.style({ b: 1, color: WHITE, fill: INDIGO, h: "center", wrap: 1 }),
      d: function (z) { return wb.style({ fmt: DATE, h: "center", fill: z ? ZEBRA : undefined }); },
      t: function (z, c, b) { return wb.style({ h: "left", indent: 1, color: c, b: b, fill: z ? ZEBRA : undefined }); },
      r: function (z, c) { return wb.style({ fmt: NUM, h: "right", color: c, fill: z ? ZEBRA : undefined }); }
    };

    /* ---------- Data turunan ---------- */
    var sum = function (f) { return txs.reduce(function (s, t) { return s + (f(t) ? t.amount : 0); }, 0); };
    var inc = sum(function (t) { return t.type === "in"; }), out = sum(function (t) { return t.type === "out"; });
    var monthKeys = Array.from(new Set(txs.map(function (t) { return t.date.slice(0, 7); }))).sort();
    if (!monthKeys.length) monthKeys = [new Date().toISOString().slice(0, 7)];
    var catsOf = function (type) {
      var m = {}; txs.filter(function (t) { return t.type === type; }).forEach(function (t) { var o = m[t.cat] || (m[t.cat] = { n: t.cat, sum: 0, cnt: 0 }); o.sum += t.amount; o.cnt++; });
      return Object.keys(m).map(function (k) { return m[k]; }).sort(function (a, b) { return b.sum - a.sum; });
    };
    var ws0 = acc.map(function (a) {
      var o = { name: a.name, start: a.start || 0, inc: 0, out: 0, tin: 0, tout: 0 };
      txs.forEach(function (t) {
        if (t.type === "in" && an(t.acc) === a.name) o.inc += t.amount; else if (t.type === "out" && an(t.acc) === a.name) o.out += t.amount;
        else if (t.type === "tf") { if (an(t.to) === a.name) o.tin += t.amount; if (an(t.from) === a.name) o.tout += t.amount; }
      });
      o.end = o.start + o.inc - o.out + o.tin - o.tout; return o;
    });

    /* =============== Sheet 1: Ringkasan =============== */
    var R = wb.sheet("Ringkasan", { grid: false, tab: INDIGO, fit: 1, center: 1 });
    [2, 28, 17, 17, 17, 17, 17, 2].forEach(function (w, i) { R.width(i + 1, w); });
    var first = txs[0], lastT = txs[N - 1];
    R.height(2, 40).height(3, 20);
    R.cell(2, 2, { v: "LAPORAN KEUANGAN", s: S.title }).merge(2, 2, 2, 7, S.title);
    R.cell(3, 2, { v: (N ? "Periode " + lbl(new Date(first.date + "T00:00")) + " – " + lbl(new Date(lastT.date + "T00:00")) : "Belum ada transaksi") + "  ·  Dicetak " + lbl(new Date()), s: S.sub }).merge(3, 2, 3, 7, S.sub);

    // Kartu ringkas
    R.height(5, 20).height(6, 36);
    R.cell(5, 2, { v: "TOTAL PEMASUKAN", s: S.cardL() }); R.cell(6, 2, { f: "SUMIFS(" + E + "," + B + ',"Pemasukan")', v: inc, s: S.cardV(GREEN, RP) });
    R.cell(5, 3, { v: "TOTAL PENGELUARAN", s: S.cardL() }).merge(5, 3, 5, 4, S.cardL()); R.cell(6, 3, { f: "SUMIFS(" + E + "," + B + ',"Pengeluaran")', v: out, s: S.cardV(RED, RP) }).merge(6, 3, 6, 4, S.cardV(RED, RP));
    R.cell(5, 5, { v: "SALDO BERSIH", s: S.cardL() }).merge(5, 5, 5, 6, S.cardL()); R.cell(6, 5, { f: "B6-C6", v: inc - out, s: S.cardV(INDIGO, RP) }).merge(6, 5, 6, 6, S.cardV(INDIGO, RP));
    R.cell(5, 7, { v: "RASIO TABUNGAN", s: S.cardL() }); R.cell(6, 7, { f: "IF(B6=0,0,E6/B6)", v: inc ? (inc - out) / inc : 0, s: S.cardV(INK, PCT) });

    var r = 8, mFirst, mLast, wTot;
    // Ikhtisar (diisi setelah baris-baris tabel diketahui)
    var ikRow = r; r += 8;

    // Rekap bulanan
    R.cell(r, 2, { v: "REKAP BULANAN", s: S.sec }).merge(r, 2, r, 7, S.sec); R.height(r, 22); r++;
    ["Bulan", "Pemasukan", "Pengeluaran", "Arus Kas Bersih", "Rasio Tabungan", "Saldo Kumulatif"].forEach(function (h, i) { R.cell(r, 2 + i, { v: h, s: i ? S.th : S.thL }); }); R.height(r, 22); r++;
    mFirst = r; var cum = 0;
    monthKeys.forEach(function (k, i) {
      var mi = sum(function (t) { return t.type === "in" && t.date.slice(0, 7) === k; }), mo = sum(function (t) { return t.type === "out" && t.date.slice(0, 7) === k; });
      var y = +k.slice(0, 4), m = +k.slice(5);
      R.cell(r, 2, { v: serial(k + "-01"), s: S.mon });
      var crit = A + ',">="&$B' + r + "," + A + ',"<"&EDATE($B' + r + ",1)";
      R.cell(r, 3, { f: "SUMIFS(" + E + "," + B + ',"Pemasukan",' + crit + ")", v: mi, s: S.rp });
      R.cell(r, 4, { f: "SUMIFS(" + E + "," + B + ',"Pengeluaran",' + crit + ")", v: mo, s: S.rp });
      R.cell(r, 5, { f: "C" + r + "-D" + r, v: mi - mo, s: S.rp });
      R.cell(r, 6, { f: "IF(C" + r + "=0,0,E" + r + "/C" + r + ")", v: mi ? (mi - mo) / mi : 0, s: S.pct });
      cum += mi - mo; R.cell(r, 7, { f: i ? "G" + (r - 1) + "+E" + r : "E" + r, v: cum, s: S.rp }); r++;
    });
    mLast = r - 1;
    R.cell(r, 2, { v: "Total", s: S.tTxt });
    R.cell(r, 3, { f: "SUM(C" + mFirst + ":C" + mLast + ")", v: inc, s: S.tRp }); R.cell(r, 4, { f: "SUM(D" + mFirst + ":D" + mLast + ")", v: out, s: S.tRp });
    R.cell(r, 5, { f: "SUM(E" + mFirst + ":E" + mLast + ")", v: inc - out, s: S.tRp }); R.cell(r, 6, { f: "IF(C" + r + "=0,0,E" + r + "/C" + r + ")", v: inc ? (inc - out) / inc : 0, s: S.tPct });
    R.cell(r, 7, { s: S.tBlank }); r += 2;

    // Tabel kategori
    var firstCat = {};
    function catTable(title, type, jenis, total) {
      R.cell(r, 2, { v: title, s: S.sec }).merge(r, 2, r, 7, S.sec); R.height(r, 22); r++;
      ["Kategori", "Jumlah", "% dari Total", "Transaksi", "Rata-rata", "Peringkat"].forEach(function (h, i) { R.cell(r, 2 + i, { v: h, s: i ? S.th : S.thL }); }); R.height(r, 22); r++;
      var list = catsOf(type), f0 = r, tr = r + Math.max(list.length, 1);
      if (!list.length) { R.cell(r, 2, { v: "Belum ada data", s: S.txt }); for (var c = 3; c <= 7; c++) R.cell(r, c, { s: S.txt }); r++; }
      list.forEach(function (o) {
        R.cell(r, 2, { v: o.n, s: S.txt });
        R.cell(r, 3, { f: "SUMIFS(" + E + "," + B + ',"' + jenis + '",' + C + ",$B" + r + ")", v: o.sum, s: S.rp });
        R.cell(r, 4, { f: "IF($C$" + tr + "=0,0,C" + r + "/$C$" + tr + ")", v: total ? o.sum / total : 0, s: S.pct });
        R.cell(r, 5, { f: "COUNTIFS(" + B + ',"' + jenis + '",' + C + ",$B" + r + ")", v: o.cnt, s: S.num });
        R.cell(r, 6, { f: "IF(E" + r + "=0,0,C" + r + "/E" + r + ")", v: o.sum / o.cnt, s: S.rp });
        R.cell(r, 7, { f: "RANK(C" + r + ",$C$" + f0 + ":$C$" + (tr - 1) + ")", v: 1 + list.filter(function (x) { return x.sum > o.sum; }).length, s: S.num }); r++;
      });
      if (list.length) { R.dataBar("D" + f0 + ":D" + (tr - 1), "FF818CF8"); firstCat[type] = f0; }
      var cnt = list.reduce(function (s, o) { return s + o.cnt; }, 0);
      R.cell(r, 2, { v: "Total", s: S.tTxt });
      R.cell(r, 3, { f: "SUM(C" + f0 + ":C" + (tr - 1) + ")", v: total, s: S.tRp }); R.cell(r, 4, { f: "SUM(D" + f0 + ":D" + (tr - 1) + ")", v: list.length && total ? 1 : 0, s: S.tPct });
      R.cell(r, 5, { f: "SUM(E" + f0 + ":E" + (tr - 1) + ")", v: cnt, s: S.tNum }); R.cell(r, 6, { f: "IF(E" + r + "=0,0,C" + r + "/E" + r + ")", v: cnt ? total / cnt : 0, s: S.tRp }); R.cell(r, 7, { s: S.tBlank });
      r += 2;
    }
    catTable("PENGELUARAN PER KATEGORI", "out", "Pengeluaran", out);
    catTable("PEMASUKAN PER KATEGORI", "in", "Pemasukan", inc);

    // Posisi dompet
    R.cell(r, 2, { v: "POSISI SALDO DOMPET", s: S.sec }).merge(r, 2, r, 7, S.sec); R.height(r, 22); r++;
    ["Dompet", "Saldo Awal", "Total Masuk", "Total Keluar", "Saldo Akhir", "Proporsi"].forEach(function (h, i) { R.cell(r, 2 + i, { v: h, s: i ? S.th : S.thL }); }); R.height(r, 22); r++;
    var wf = r, wt = r + ws0.length, totEnd = ws0.reduce(function (s, o) { return s + o.end; }, 0);
    ws0.forEach(function (o, i) {
      var d = i + 2;
      R.cell(r, 2, { f: "Dompet!A" + d, v: o.name, s: S.txt });
      R.cell(r, 3, { f: "Dompet!B" + d, v: o.start, s: S.rp });
      R.cell(r, 4, { f: "Dompet!C" + d + "+Dompet!E" + d, v: o.inc + o.tin, s: S.rp });
      R.cell(r, 5, { f: "Dompet!D" + d + "+Dompet!F" + d, v: o.out + o.tout, s: S.rp });
      R.cell(r, 6, { f: "Dompet!G" + d, v: o.end, s: S.rp });
      R.cell(r, 7, { f: "IF($F$" + wt + "=0,0,F" + r + "/$F$" + wt + ")", v: totEnd ? o.end / totEnd : 0, s: S.pct }); r++;
    });
    R.cell(r, 2, { v: "Total", s: S.tTxt });
    var sm = function (k) { return ws0.reduce(function (s, o) { return s + (k === "s" ? o.start : k === "i" ? o.inc + o.tin : k === "o" ? o.out + o.tout : o.end); }, 0); };
    [["C", "s"], ["D", "i"], ["E", "o"], ["F", "e"]].forEach(function (p, i) { R.cell(r, 3 + i, { f: "SUM(" + p[0] + wf + ":" + p[0] + (wt - 1) + ")", v: sm(p[1]), s: S.tRp }); });
    R.cell(r, 7, { f: "SUM(G" + wf + ":G" + (wt - 1) + ")", v: totEnd ? 1 : 0, s: S.tPct }); wTot = r; r += 2;
    R.cell(r, 2, { v: "Seluruh angka pada lembar ini dihitung otomatis dengan rumus dari sheet Transaksi dan Dompet. Tambahkan transaksi baru di sheet Transaksi dan laporan akan menyesuaikan.", s: S.note }).merge(r, 2, r, 7, S.note); R.height(r, 30);

    // Ikhtisar
    var rr = ikRow;
    R.cell(rr, 2, { v: "IKHTISAR", s: S.sec }).merge(rr, 2, rr, 7, S.sec); R.height(rr, 22); rr++;
    var avgMon = out / monthKeys.length, top = catsOf("out")[0];
    var items = [
      ["Periode awal", { f: 'IF(COUNT(' + A + ')=0,"-",MIN(' + A + "))", v: N ? serial(first.date) : "-", s: S.kD }],
      ["Periode akhir", { f: 'IF(COUNT(' + A + ')=0,"-",MAX(' + A + "))", v: N ? serial(lastT.date) : "-", s: S.kD }],
      ["Jumlah transaksi", { f: "COUNT(" + A + ")", v: N, s: S.kN }],
      ["Rata-rata pengeluaran per bulan", { f: "IF(COUNT($B$" + mFirst + ":$B$" + mLast + ")=0,0,C6/COUNT($B$" + mFirst + ":$B$" + mLast + "))", v: avgMon, s: S.kV }],
      ["Kategori pengeluaran terbesar", firstCat.out ? { f: "B" + firstCat.out, v: top.n, s: S.kT } : { v: "-", s: S.kT }],
      ["Total saldo semua dompet", { f: "F" + wTot, v: totEnd, s: S.kV }]
    ];
    items.forEach(function (it) { R.cell(rr, 2, { v: it[0], s: S.kL }); R.cell(rr, 3, it[1]).merge(rr, 3, rr, 4, it[1].s); rr++; });

    /* =============== Sheet 2: Transaksi =============== */
    var T = wb.sheet("Transaksi", { tab: GREEN, freeze: [1, 0], filter: "A1:I" + Math.max(last, 2), landscape: 1, fit: 1 });
    [12, 14, 20, 34, 16, 18, 18, 16, 18].forEach(function (w, i) { T.width(i + 1, w); });
    T.height(1, 24);
    ["Tanggal", "Jenis", "Kategori", "Catatan", "Jumlah", "Dompet", "Ke Dompet", "Arus Kas", "Saldo Berjalan"].forEach(function (h, i) { T.cell(1, i + 1, { v: h, s: S.hd }); });
    var startSum = ws0.reduce(function (s, o) { return s + o.start; }, 0), run = startSum;
    txs.forEach(function (t, i) {
      var rw = i + 2, z = i % 2, col = t.type === "in" ? GREEN : t.type === "out" ? RED : MUT, flow = t.type === "in" ? t.amount : t.type === "out" ? -t.amount : 0;
      run += flow;
      T.cell(rw, 1, { v: serial(t.date), s: S.d(z) });
      T.cell(rw, 2, { v: JENIS[t.type] || "Pengeluaran", s: S.t(z, col, 1) });
      T.cell(rw, 3, { v: t.cat, s: S.t(z) });
      T.cell(rw, 4, { v: t.note || "", s: S.t(z) });
      T.cell(rw, 5, { v: t.amount, s: S.r(z, col) });
      T.cell(rw, 6, { v: t.type === "tf" ? an(t.from) : an(t.acc), s: S.t(z) });
      T.cell(rw, 7, { v: t.type === "tf" ? an(t.to) : "", s: S.t(z) });
      T.cell(rw, 8, { f: 'IF(B' + rw + '="Pemasukan",E' + rw + ',IF(B' + rw + '="Pengeluaran",-E' + rw + ",0))", v: flow, s: S.r(z, col) });
      T.cell(rw, 9, { f: i ? "I" + (rw - 1) + "+H" + rw : "SUM(Dompet!$B$2:$B$" + (acc.length + 1) + ")+H" + rw, v: run, s: S.r(z) });
    });

    /* =============== Sheet 3: Dompet =============== */
    var Dm = wb.sheet("Dompet", { tab: "FF0EA5E9", freeze: [1, 0], fit: 1 });
    [24, 16, 16, 16, 16, 16, 18].forEach(function (w, i) { Dm.width(i + 1, w); });
    Dm.height(1, 24);
    ["Dompet", "Saldo Awal", "Pemasukan", "Pengeluaran", "Transfer Masuk", "Transfer Keluar", "Saldo Akhir"].forEach(function (h, i) { Dm.cell(1, i + 1, { v: h, s: S.hd }); });
    var rpz = function (z, b) { return wb.style({ fmt: RP, h: "right", b: b, fill: z ? ZEBRA : undefined }); };
    ws0.forEach(function (o, i) {
      var rw = i + 2, z = i % 2, sx = function (jenis, col) { return "SUMIFS(" + E + "," + B + ',"' + jenis + '",' + col + ",$A" + rw + ")"; };
      Dm.cell(rw, 1, { v: o.name, s: S.t(z, INK, 1) });
      Dm.cell(rw, 2, { v: o.start, s: rpz(z) });
      Dm.cell(rw, 3, { f: sx("Pemasukan", F), v: o.inc, s: rpz(z) });
      Dm.cell(rw, 4, { f: sx("Pengeluaran", F), v: o.out, s: rpz(z) });
      Dm.cell(rw, 5, { f: sx("Transfer", G), v: o.tin, s: rpz(z) });
      Dm.cell(rw, 6, { f: sx("Transfer", F), v: o.tout, s: rpz(z) });
      Dm.cell(rw, 7, { f: "B" + rw + "+C" + rw + "-D" + rw + "+E" + rw + "-F" + rw, v: o.end, s: rpz(z, 1) });
    });

    /* =============== Sheet 4: Kategori =============== */
    var K = wb.sheet("Kategori", { tab: "FFF59E0B", freeze: [1, 0], fit: 1 });
    [14, 22, 14, 12, 18, 18].forEach(function (w, i) { K.width(i + 1, w); });
    K.height(1, 24);
    ["Jenis", "Kategori", "Ikon", "Warna", "Jumlah Transaksi", "Total"].forEach(function (h, i) { K.cell(1, i + 1, { v: h, s: S.hd }); });
    var kr = 2;
    [["Pengeluaran", D.OUT, "out"], ["Pemasukan", D.IN, "in"]].forEach(function (g) {
      g[1].forEach(function (c, i) {
        var z = (kr % 2) === 1, cnt = txs.filter(function (t) { return t.type === g[2] && t.cat === c[0]; });
        K.cell(kr, 1, { v: g[0], s: S.t(z) }); K.cell(kr, 2, { v: c[0], s: S.t(z, INK, 1) }); K.cell(kr, 3, { v: c[1], s: S.t(z, MUT) });
        K.cell(kr, 4, { v: c[2], s: wb.style({ b: 1, color: WHITE, h: "center", fill: "FF" + String(c[2]).replace("#", "").toUpperCase() }) });
        K.cell(kr, 5, { f: "COUNTIFS(" + B + ",$A" + kr + "," + C + ",$B" + kr + ")", v: cnt.length, s: S.r(z) });
        K.cell(kr, 6, { f: "SUMIFS(" + E + "," + B + ",$A" + kr + "," + C + ",$B" + kr + ")", v: cnt.reduce(function (s, t) { return s + t.amount; }, 0), s: rpz(z) });
        kr++;
      });
    });

    return wb.build({ title: "Laporan Keuangan" });
  }

  window.FinanceReport = { build: build };
})();
