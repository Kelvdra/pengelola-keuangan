/* Penulis .xlsx mandiri (tanpa dependensi): gaya sel, rumus, merge, freeze pane, filter, data bar, pengaturan cetak.
   Berkas dikemas sebagai ZIP tanpa kompresi sehingga ringan dan sepenuhnya offline. */
(function () {
  "use strict";

  var esc = function (s) { return String(s).replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;"); };
  function colName(n) { var s = ""; while (n > 0) { var m = (n - 1) % 26; s = String.fromCharCode(65 + m) + s; n = Math.floor((n - 1) / 26); } return s; }
  var ref = function (r, c) { return colName(c) + r; };

  /* ---------- ZIP (store) ---------- */
  var CRC = (function () { var t = [], n, k, c; for (n = 0; n < 256; n++) { c = n; for (k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; } return t; })();
  function crc32(b) { var c = 0xFFFFFFFF; for (var i = 0; i < b.length; i++) c = CRC[(c ^ b[i]) & 255] ^ (c >>> 8); return (c ^ 0xFFFFFFFF) >>> 0; }
  function zip(files) {
    var enc = new TextEncoder(), parts = [], central = [], offset = 0;
    var u16 = function (v) { return [v & 255, (v >>> 8) & 255]; }, u32 = function (v) { return [v & 255, (v >>> 8) & 255, (v >>> 16) & 255, (v >>> 24) & 255]; };
    files.forEach(function (f) {
      var name = enc.encode(f.name), data = enc.encode(f.data), crc = crc32(data);
      var head = [].concat(u32(0x04034b50), u16(20), u16(0x0800), u16(0), u16(0), u16(0x21), u32(crc), u32(data.length), u32(data.length), u16(name.length), u16(0));
      parts.push(new Uint8Array(head), name, data);
      central.push({ name: name, crc: crc, size: data.length, offset: offset });
      offset += head.length + name.length + data.length;
    });
    var cdStart = offset;
    central.forEach(function (c) {
      var h = [].concat(u32(0x02014b50), u16(20), u16(20), u16(0x0800), u16(0), u16(0), u16(0x21), u32(c.crc), u32(c.size), u32(c.size), u16(c.name.length), u16(0), u16(0), u16(0), u16(0), u32(0), u32(c.offset));
      parts.push(new Uint8Array(h), c.name); offset += h.length + c.name.length;
    });
    var end = [].concat(u32(0x06054b50), u16(0), u16(0), u16(central.length), u16(central.length), u32(offset - cdStart), u32(cdStart), u16(0));
    parts.push(new Uint8Array(end));
    var total = parts.reduce(function (s, p) { return s + p.length; }, 0), out = new Uint8Array(total), pos = 0;
    parts.forEach(function (p) { out.set(p, pos); pos += p.length; });
    return out;
  }

  /* ---------- Workbook ---------- */
  function Workbook() {
    this.sheets = []; this.fonts = []; this.fills = []; this.borders = []; this.fmts = []; this.xfs = []; this.cache = {};
    this._add(this.fonts, '<font><sz val="10"/><color rgb="FF0F172A"/><name val="Calibri"/><family val="2"/></font>');
    this._add(this.fills, '<fill><patternFill patternType="none"/></fill>'); this._add(this.fills, '<fill><patternFill patternType="gray125"/></fill>');
    this._add(this.borders, "<border><left/><right/><top/><bottom/><diagonal/></border>");
    this.xfs.push('<xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/>');
  }
  Workbook.prototype._add = function (list, xml) { var i = list.indexOf(xml); if (i < 0) { list.push(xml); i = list.length - 1; } return i; };

  /* style({b,i,sz,color,fill,h,v,wrap,indent,fmt,border:{top:[style,color],...}}) -> indeks xf */
  Workbook.prototype.style = function (o) {
    o = o || {}; var key = JSON.stringify(o); if (this.cache[key] !== undefined) return this.cache[key];
    var font = '<font>' + (o.b ? "<b/>" : "") + (o.i ? "<i/>" : "") + '<sz val="' + (o.sz || 10) + '"/><color rgb="' + (o.color || "FF0F172A") + '"/><name val="Calibri"/><family val="2"/></font>';
    var fid = this._add(this.fonts, font);
    var flid = o.fill ? this._add(this.fills, '<fill><patternFill patternType="solid"><fgColor rgb="' + o.fill + '"/><bgColor indexed="64"/></patternFill></fill>') : 0;
    var bd = o.border || {}, bx = "<border>" + ["left", "right", "top", "bottom"].map(function (k) { return bd[k] ? "<" + k + ' style="' + bd[k][0] + '"><color rgb="' + bd[k][1] + '"/></' + k + ">" : "<" + k + "/>"; }).join("") + "<diagonal/></border>";
    var bid = this._add(this.borders, bx), nid = 0;
    if (o.fmt) { var fi = this.fmts.indexOf(o.fmt); if (fi < 0) { this.fmts.push(o.fmt); fi = this.fmts.length - 1; } nid = 164 + fi; }
    var al = (o.h || o.v || o.wrap || o.indent) ? '<alignment' + (o.h ? ' horizontal="' + o.h + '"' : "") + ' vertical="' + (o.v || "center") + '"' + (o.wrap ? ' wrapText="1"' : "") + (o.indent ? ' indent="' + o.indent + '"' : "") + "/>" : '<alignment vertical="center"/>';
    var xf = '<xf numFmtId="' + nid + '" fontId="' + fid + '" fillId="' + flid + '" borderId="' + bid + '" xfId="0" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"' + (nid ? ' applyNumberFormat="1"' : "") + ">" + al + "</xf>";
    this.xfs.push(xf); this.cache[key] = this.xfs.length - 1; return this.cache[key];
  };
  Workbook.prototype.sheet = function (name, opts) { var s = new Sheet(name, opts || {}); this.sheets.push(s); return s; };

  function Sheet(name, opts) { this.name = name; this.o = opts; this.cells = {}; this.merges = []; this.cols = {}; this.rowH = {}; this.cf = []; this.maxR = 1; this.maxC = 1; }
  /* cell(r, c, {v, f, s}) : v nilai (angka/teks), f rumus tanpa "=", s indeks gaya */
  Sheet.prototype.cell = function (r, c, d) {
    (this.cells[r] = this.cells[r] || {})[c] = d; if (r > this.maxR) this.maxR = r; if (c > this.maxC) this.maxC = c; return this;
  };
  Sheet.prototype.merge = function (r1, c1, r2, c2, style) {
    this.merges.push(ref(r1, c1) + ":" + ref(r2, c2));
    if (style !== undefined) for (var r = r1; r <= r2; r++) for (var c = c1; c <= c2; c++) if (!(this.cells[r] && this.cells[r][c])) this.cell(r, c, { s: style });
    return this;
  };
  Sheet.prototype.width = function (c, w) { this.cols[c] = w; return this; };
  Sheet.prototype.height = function (r, h) { this.rowH[r] = h; return this; };
  Sheet.prototype.dataBar = function (range, color) { this.cf.push({ range: range, color: color }); return this; };

  Sheet.prototype.xml = function (idx) {
    var o = this.o, x = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">';
    x += "<sheetPr>" + (o.tab ? '<tabColor rgb="' + o.tab + '"/>' : "") + (o.fit ? '<pageSetUpPr fitToPage="1"/>' : "") + "</sheetPr>";
    x += '<dimension ref="A1:' + ref(this.maxR, this.maxC) + '"/>';
    x += '<sheetViews><sheetView workbookViewId="0"' + (o.grid === false ? ' showGridLines="0"' : "") + (idx === 0 ? ' tabSelected="1"' : "") + (o.zoom ? ' zoomScale="' + o.zoom + '"' : "") + ">";
    if (o.freeze) { var fr = o.freeze[0], fc = o.freeze[1]; x += '<pane' + (fc ? ' xSplit="' + fc + '"' : "") + (fr ? ' ySplit="' + fr + '"' : "") + ' topLeftCell="' + ref(fr + 1, fc + 1) + '" activePane="' + (fr && fc ? "bottomRight" : fr ? "bottomLeft" : "topRight") + '" state="frozen"/>'; }
    x += "</sheetView></sheetViews><sheetFormatPr defaultRowHeight=\"16\" customHeight=\"1\"/>";
    var cks = Object.keys(this.cols).map(Number).sort(function (a, b) { return a - b; });
    if (cks.length) x += "<cols>" + cks.map(function (c) { return '<col min="' + c + '" max="' + c + '" width="' + this.cols[c] + '" customWidth="1"/>'; }, this).join("") + "</cols>";
    x += "<sheetData>";
    Object.keys(this.cells).map(Number).sort(function (a, b) { return a - b; }).forEach(function (r) {
      x += '<row r="' + r + '"' + (this.rowH[r] ? ' ht="' + this.rowH[r] + '" customHeight="1"' : "") + ">";
      var row = this.cells[r]; Object.keys(row).map(Number).sort(function (a, b) { return a - b; }).forEach(function (c) {
        var d = row[c], a = ref(r, c), s = d.s ? ' s="' + d.s + '"' : "";
        if (d.f !== undefined) {
          var isStr = typeof d.v === "string";
          x += '<c r="' + a + '"' + s + (isStr ? ' t="str"' : "") + "><f>" + esc(d.f) + "</f>" + (d.v === undefined || d.v === null ? "" : "<v>" + (isStr ? esc(d.v) : d.v) + "</v>") + "</c>";
        } else if (typeof d.v === "number" && isFinite(d.v)) x += '<c r="' + a + '"' + s + "><v>" + d.v + "</v></c>";
        else if (d.v !== undefined && d.v !== null && d.v !== "") x += '<c r="' + a + '"' + s + ' t="inlineStr"><is><t xml:space="preserve">' + esc(d.v) + "</t></is></c>";
        else x += '<c r="' + a + '"' + s + "/>";
      }, this);
      x += "</row>";
    }, this);
    x += "</sheetData>";
    if (o.filter) x += '<autoFilter ref="' + o.filter + '"/>';
    if (this.merges.length) x += '<mergeCells count="' + this.merges.length + '">' + this.merges.map(function (m) { return '<mergeCell ref="' + m + '"/>'; }).join("") + "</mergeCells>";
    this.cf.forEach(function (c, i) { x += '<conditionalFormatting sqref="' + c.range + '"><cfRule type="dataBar" priority="' + (i + 1) + '"><dataBar><cfvo type="num" val="0"/><cfvo type="num" val="1"/><color rgb="' + c.color + '"/></dataBar></cfRule></conditionalFormatting>'; });
    if (o.center) x += '<printOptions horizontalCentered="1"/>';
    x += '<pageMargins left="0.5" right="0.5" top="0.6" bottom="0.7" header="0.3" footer="0.3"/>';
    x += '<pageSetup paperSize="9" orientation="' + (o.landscape ? "landscape" : "portrait") + '"' + (o.fit ? ' fitToWidth="1" fitToHeight="0"' : "") + "/>";
    x += "<headerFooter><oddFooter>" + esc(o.footer || "&L" + this.name + "&RHalaman &P dari &N") + "</oddFooter></headerFooter>";
    return x + "</worksheet>";
  };

  Workbook.prototype.build = function (meta) {
    meta = meta || {};
    var NS = 'xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"', H = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>';
    var files = [];
    files.push({ name: "[Content_Types].xml", data: H + '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>' +
      this.sheets.map(function (s, i) { return '<Override PartName="/xl/worksheets/sheet' + (i + 1) + '.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>'; }).join("") +
      '<Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/><Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/><Override PartName="/docProps/app.xml" ContentType="application/vnd.openxmlformats-officedocument.extended-properties+xml"/></Types>' });
    files.push({ name: "_rels/.rels", data: H + '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/><Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/extended-properties" Target="docProps/app.xml"/></Relationships>' });
    var now = new Date().toISOString().replace(/\.\d+Z$/, "Z");
    files.push({ name: "docProps/core.xml", data: H + '<cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"><dc:title>' + esc(meta.title || "Laporan Keuangan") + "</dc:title><dc:creator>" + esc(meta.creator || "Pengelola Keuangan") + '</dc:creator><dcterms:created xsi:type="dcterms:W3CDTF">' + now + '</dcterms:created></cp:coreProperties>' });
    files.push({ name: "docProps/app.xml", data: H + '<Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties"><Application>Pengelola Keuangan</Application></Properties>' });
    files.push({ name: "xl/workbook.xml", data: H + "<workbook " + NS + ' xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><bookViews><workbookView activeTab="0"/></bookViews><sheets>' +
      this.sheets.map(function (s, i) { return '<sheet name="' + esc(s.name) + '" sheetId="' + (i + 1) + '" r:id="rId' + (i + 1) + '"/>'; }).join("") + '</sheets><calcPr calcId="191029" fullCalcOnLoad="1"/></workbook>' });
    files.push({ name: "xl/_rels/workbook.xml.rels", data: H + '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' +
      this.sheets.map(function (s, i) { return '<Relationship Id="rId' + (i + 1) + '" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet' + (i + 1) + '.xml"/>'; }).join("") +
      '<Relationship Id="rId' + (this.sheets.length + 1) + '" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>' });
    var nf = this.fmts.length ? '<numFmts count="' + this.fmts.length + '">' + this.fmts.map(function (f, i) { return '<numFmt numFmtId="' + (164 + i) + '" formatCode="' + esc(f) + '"/>'; }).join("") + "</numFmts>" : "";
    files.push({ name: "xl/styles.xml", data: H + "<styleSheet " + NS + ">" + nf + '<fonts count="' + this.fonts.length + '">' + this.fonts.join("") + '</fonts><fills count="' + this.fills.length + '">' + this.fills.join("") + '</fills><borders count="' + this.borders.length + '">' + this.borders.join("") +
      '</borders><cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs><cellXfs count="' + this.xfs.length + '">' + this.xfs.join("") + '</cellXfs><cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles></styleSheet>' });
    this.sheets.forEach(function (s, i) { files.push({ name: "xl/worksheets/sheet" + (i + 1) + ".xml", data: s.xml(i) }); });
    return zip(files);
  };

  window.XlsxWriter = { Workbook: Workbook, ref: ref, colName: colName };
})();
