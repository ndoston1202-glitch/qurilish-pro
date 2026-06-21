// ===== PRINTER TIZIMI =====
// Brauzer xavfsizlik cheklovi sababli printer to'g'ridan API orqali tanlash mumkin emas.
// Yechim: Sozlamalarda printer nomi saqlanib, chop etishda o'sha printer ko'rsatiladi.

const PRINTER_KALIT = 'dokoni_printer_sozlamalar';

function printerSozlamalariniOl() {
  try {
    return JSON.parse(localStorage.getItem(PRINTER_KALIT) || '{}');
  } catch { return {}; }
}

function printerSozlamalariniSaqla(data) {
  localStorage.setItem(PRINTER_KALIT, JSON.stringify(data));
}

// ===== PRINTER SOZLAMALARI SAHIFASI =====
function printerSozlamalarKorsatish() {
  const soz = printerSozlamalariniOl();
  document.getElementById('sozKontent').innerHTML = `
    <div class="card">
      <div class="card-header">
        <h3><i class="fas fa-print"></i> Printer sozlamalari</h3>
      </div>
      <div class="card-body">

        <!-- MUHIM ESLATMA -->
        <div style="background:#fffbeb;border:1px solid #fcd34d;border-radius:10px;
          padding:14px;margin-bottom:20px;font-size:13px">
          <div style="font-weight:700;color:#92400e;margin-bottom:6px">
            <i class="fas fa-info-circle"></i> Qanday ishlaydi?
          </div>
          <p style="color:#78350f;line-height:1.6">
            Chek yoki etiketka chop etishda brauzer print dialog ochiladi.
            <br>Siz printer nomini bir marta yozing — keyinchalik dialog <b>avtomatik o'sha printerni ko'rsatadi</b>.
            <br>Faqat <b>Enter</b> yoki <b>Chop etish</b> tugmasini bosing.
          </p>
        </div>

        <!-- CHEK PRINTERI -->
        <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:10px;padding:16px;margin-bottom:16px">
          <div style="font-weight:700;font-size:14px;margin-bottom:12px;color:#166534">
            <i class="fas fa-receipt" style="margin-right:6px"></i>
            Chek printeri
          </div>
          <div class="form-group" style="margin-bottom:8px">
            <label style="font-size:12px;color:#64748b">Printer nomi</label>
            <input type="text" id="chekPrinterNomi"
              value="${soz.chek_printer || ''}"
              placeholder="Masalan: POS-80, EPSON TM-T20, XPrinter"
              style="width:100%;padding:10px;border:2px solid #e2e8f0;border-radius:8px;font-size:14px">
          </div>
          <div class="form-row">
            <div class="form-group" style="margin-bottom:8px">
              <label style="font-size:12px;color:#64748b">Chek kengligi (mm)</label>
              <select id="chekKenglik"
                style="width:100%;padding:10px;border:2px solid #e2e8f0;border-radius:8px;font-size:14px;background:white">
                <option value="58" ${(soz.chek_kenglik||'80')==='58'?'selected':''}>58mm</option>
                <option value="72" ${(soz.chek_kenglik||'80')==='72'?'selected':''}>72mm</option>
                <option value="80" ${(soz.chek_kenglik||'80')==='80'?'selected':''}>80mm (standart)</option>
              </select>
            </div>
            <div class="form-group" style="margin-bottom:8px">
              <label style="font-size:12px;color:#64748b">Chek uzunligi</label>
              <select id="chekUzunlik"
                style="width:100%;padding:10px;border:2px solid #e2e8f0;border-radius:8px;font-size:14px;background:white">
                <option value="auto" ${(soz.chek_uzunlik||'auto')==='auto'?'selected':''}>Avtomatik</option>
                <option value="50mm" ${(soz.chek_uzunlik||'auto')==='50mm'?'selected':''}>50mm</option>
                <option value="100mm" ${(soz.chek_uzunlik||'auto')==='100mm'?'selected':''}>100mm</option>
                <option value="150mm" ${(soz.chek_uzunlik||'auto')==='150mm'?'selected':''}>150mm</option>
              </select>
            </div>
          </div>
          <div style="margin-bottom:8px">
            <label style="display:flex;align-items:center;gap:8px;cursor:pointer;font-size:13px">
              <input type="checkbox" id="chekAvtomatic" ${soz.chek_avtomatic?'checked':''}
                style="width:16px;height:16px">
              Chek avtomatik chiqsin (dialog ko'rsatmasdan)
            </label>
          </div>
          <button class="btn btn-success btn-sm" onclick="printerTestChek()">
            <i class="fas fa-print"></i> Test chek chiqarish
          </button>
        </div>

        <!-- ETIKETKA PRINTERI -->
        <div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:10px;padding:16px;margin-bottom:16px">
          <div style="font-weight:700;font-size:14px;margin-bottom:12px;color:#1e40af">
            <i class="fas fa-tag" style="margin-right:6px"></i>
            Etiketka printeri
          </div>
          <div class="form-group" style="margin-bottom:8px">
            <label style="font-size:12px;color:#64748b">Printer nomi</label>
            <input type="text" id="etiketkaPrinterNomi"
              value="${soz.etiketka_printer || ''}"
              placeholder="Masalan: ZEBRA ZD220, TSC TE200, GODEX"
              style="width:100%;padding:10px;border:2px solid #e2e8f0;border-radius:8px;font-size:14px">
          </div>
          <div class="form-row">
            <div class="form-group" style="margin-bottom:8px">
              <label style="font-size:12px;color:#64748b">Standart o'lcham</label>
              <select id="etiketkaOlcham"
                style="width:100%;padding:10px;border:2px solid #e2e8f0;border-radius:8px;font-size:14px;background:white">
                <option value="58x30" ${(soz.etiketka_olcham||'58x30')==='58x30'?'selected':''}>58×30mm</option>
                <option value="58x40" ${(soz.etiketka_olcham||'58x30')==='58x40'?'selected':''}>58×40mm</option>
                <option value="40x30" ${(soz.etiketka_olcham||'58x30')==='40x30'?'selected':''}>40×30mm</option>
                <option value="80x50" ${(soz.etiketka_olcham||'58x30')==='80x50'?'selected':''}>80×50mm</option>
                <option value="100x50" ${(soz.etiketka_olcham||'58x30')==='100x50'?'selected':''}>100×50mm</option>
              </select>
            </div>
            <div class="form-group" style="margin-bottom:8px">
              <label style="font-size:12px;color:#64748b">Nusxalar soni</label>
              <input type="number" id="etiketkaNusxa"
                value="${soz.etiketka_nusxa || 1}" min="1" max="100"
                style="width:100%;padding:10px;border:2px solid #e2e8f0;border-radius:8px;font-size:14px">
            </div>
          </div>
          <button class="btn btn-primary btn-sm" onclick="printerTestEtiketka()">
            <i class="fas fa-print"></i> Test etiketka chiqarish
          </button>
        </div>

        <!-- SAQLASH -->
        <button class="btn btn-primary" style="width:100%;padding:12px" onclick="printerSozlamalarSaqla()">
          <i class="fas fa-save"></i> Sozlamalarni saqlash
        </button>

        <!-- YO'RIQNOMA -->
        <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:14px;margin-top:16px">
          <div style="font-weight:700;font-size:13px;margin-bottom:8px">
            <i class="fas fa-lightbulb" style="color:#f59e0b"></i> Printer nomini qanday bilaman?
          </div>
          <ol style="font-size:12px;color:#475569;line-height:1.8;padding-left:16px">
            <li>Windows <b>Start</b> → <b>Printerlar va skanerlar</b> oching</li>
            <li>Printeringiz nomini <b>aynan shu yerga</b> ko'chiring</li>
            <li><b>Saqlash</b> tugmasini bosing</li>
            <li>Chek yoki etiketka chiqarayotganda dialog ochilsa — printeringizni tanlang</li>
          </ol>
        </div>

      </div>
    </div>`;
}

function printerSozlamalarSaqla() {
  const data = {
    chek_printer:      document.getElementById('chekPrinterNomi')?.value?.trim() || '',
    chek_kenglik:      document.getElementById('chekKenglik')?.value || '80',
    chek_uzunlik:      document.getElementById('chekUzunlik')?.value || 'auto',
    chek_avtomatic:    document.getElementById('chekAvtomatic')?.checked || false,
    etiketka_printer:  document.getElementById('etiketkaPrinterNomi')?.value?.trim() || '',
    etiketka_olcham:   document.getElementById('etiketkaOlcham')?.value || '58x30',
    etiketka_nusxa:    parseInt(document.getElementById('etiketkaNusxa')?.value) || 1,
  };
  printerSozlamalariniSaqla(data);
  toast('✅ Printer sozlamalari saqlandi!', 'success');
}

// ===== CHEK CHIQARISH FUNKSIYASI =====
function chekChiqar(html, sarlavha) {
  const soz = printerSozlamalariniOl();
  const kenglik = soz.chek_kenglik || '80';
  const uzunlik = soz.chek_uzunlik || 'auto';
  const printerNomi = soz.chek_printer || '';

  const printWin = window.open('', '_blank',
    `width=${parseInt(kenglik)*4+50},height=600,menubar=no,toolbar=no,location=no`);

  printWin.document.write(`<!DOCTYPE html><html><head>
    <title>${sarlavha || 'Chek'}</title>
    <style>
      * { margin:0; padding:0; box-sizing:border-box; }
      @page {
        size: ${kenglik}mm ${uzunlik};
        margin: 2mm;
      }
      body {
        font-family: 'Courier New', monospace;
        font-size: 12px;
        width: ${kenglik}mm;
        color: #000;
        background: white;
      }
      .controls {
        padding: 10px;
        background: #f1f5f9;
        border-bottom: 1px solid #e2e8f0;
        display: flex;
        gap: 8px;
        align-items: center;
        flex-wrap: wrap;
      }
      .controls button {
        padding: 6px 16px;
        border-radius: 6px;
        border: none;
        cursor: pointer;
        font-size: 13px;
        font-weight: 600;
      }
      .print-btn { background: #2563eb; color: white; }
      .close-btn { background: #e2e8f0; color: #333; }
      .printer-info { font-size: 12px; color: #64748b; }
      @media print {
        .controls { display: none !important; }
        body { width: ${kenglik}mm; }
      }
    </style>
  </head><body>
    <div class="controls">
      <button class="print-btn" onclick="window.print()">🖨️ Chop etish</button>
      <button class="close-btn" onclick="window.close()">✕ Yopish</button>
      ${printerNomi ? `<span class="printer-info">📠 Printer: <b>${printerNomi}</b></span>` : ''}
      <span class="printer-info">📄 ${kenglik}mm kenglik</span>
    </div>
    ${html}
  </body></html>`);

  printWin.document.close();

  // Avtomatik chiqarish (sozlamadan)
  if (soz.chek_avtomatic) {
    setTimeout(() => {
      try { printWin.print(); } catch(e) {}
    }, 500);
  }
}

// ===== ETIKETKA CHIQARISH FUNKSIYASI =====
function etiketkaChiqar(html, uzunlik_mm, balandlik_mm) {
  const soz = printerSozlamalariniOl();
  const printerNomi = soz.etiketka_printer || '';
  const nusxa = soz.etiketka_nusxa || 1;

  // Nusxalarni takrorlash
  let nusxaHtml = '';
  for (let i = 0; i < nusxa; i++) {
    nusxaHtml += html;
    if (i < nusxa - 1) nusxaHtml += '<div style="page-break-after:always"></div>';
  }

  const printWin = window.open('', '_blank',
    `width=${uzunlik_mm*4+100},height=${balandlik_mm*4+100},menubar=no,toolbar=no,location=no`);

  printWin.document.write(`<!DOCTYPE html><html><head>
    <title>Etiketka</title>
    <style>
      * { margin:0; padding:0; box-sizing:border-box; }
      @page {
        size: ${uzunlik_mm}mm ${balandlik_mm}mm;
        margin: 0;
      }
      body { background: white; }
      .controls {
        padding: 8px 12px;
        background: #f1f5f9;
        border-bottom: 1px solid #e2e8f0;
        display: flex;
        gap: 8px;
        align-items: center;
        flex-wrap: wrap;
      }
      .controls button {
        padding: 5px 14px;
        border-radius: 6px;
        border: none;
        cursor: pointer;
        font-size: 12px;
        font-weight: 600;
      }
      .print-btn { background: #2563eb; color: white; }
      .close-btn { background: #e2e8f0; color: #333; }
      .info { font-size: 11px; color: #64748b; }
      .nusxa-input {
        padding: 3px 8px;
        border: 1px solid #e2e8f0;
        border-radius: 4px;
        width: 50px;
        font-size: 12px;
      }
      @media print {
        .controls { display: none !important; }
      }
    </style>
  </head><body>
    <div class="controls">
      <button class="print-btn" onclick="window.print()">🖨️ Chop etish</button>
      <button class="close-btn" onclick="window.close()">✕ Yopish</button>
      ${printerNomi ? `<span class="info">📠 <b>${printerNomi}</b></span>` : ''}
      <span class="info">📐 ${uzunlik_mm}×${balandlik_mm}mm</span>
      <span class="info">📋 ${nusxa} nusxa</span>
    </div>
    ${nusxaHtml}
  </body></html>`);

  printWin.document.close();
}

// ===== TEST FUNKSIYALAR =====
function printerTestChek() {
  const soz = printerSozlamalariniOl();
  const html = `
    <div style="padding:8px;font-family:monospace;font-size:12px;text-align:center">
      <div style="font-size:16px;font-weight:bold;margin-bottom:4px">
        ${JSON.parse(localStorage.getItem('dokoni_sozlamalar')||'{}').chek_dokoni_nomi || "Qurilish Do'koni"}
      </div>
      <div style="border-top:1px dashed #000;border-bottom:1px dashed #000;padding:4px 0;margin:4px 0">
        ===== TEST CHEK =====
      </div>
      <div style="text-align:left">
        <div>Mahsulot 1 x 1 ........... 10,000</div>
        <div>Mahsulot 2 x 2 ........... 20,000</div>
      </div>
      <div style="border-top:1px dashed #000;margin:4px 0"></div>
      <div style="font-weight:bold">JAMI: 30,000 so'm</div>
      <div style="margin-top:6px;font-size:10px">Rahmat! Yana keling!</div>
    </div>`;
  chekChiqar(html, 'Test chek');
}

function printerTestEtiketka() {
  const html = `
    <div style="width:58mm;height:30mm;padding:3mm;font-family:Arial,sans-serif;
      background:white;display:flex;flex-direction:column;justify-content:center">
      <div style="font-size:10pt;font-weight:bold">Test Mahsulot</div>
      <div style="font-size:8pt;color:#333">SKU: TEST-001</div>
      <div style="font-size:12pt;font-weight:bold;color:#2563eb">10,000 so'm</div>
      <div style="font-size:7pt;color:#666">Qurilish Do'koni</div>
    </div>`;
  etiketkaChiqar(html, 58, 30);
}
