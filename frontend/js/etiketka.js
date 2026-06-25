// ===== ETIKETKA TIZIMI =====
let eJoriyElementlar = [];    // canvas dagi elementlar
let eJoriyTanlangan = null;   // tanlangan element indeksi
let eUzunlik = 58;            // mm
let eBalandlik = 30;          // mm
let eMiqyos = 3.78;           // 1mm = 3.78px (96dpi)
let eJoriyShablon = null;     // saqlangan shablon
let eJoriyMahsulot = null;    // etiketka chiqariladigan mahsulot
let eSurish = false;          // drag state
let eSurishOff = {x:0, y:0};

// ===== ASOSIY YUKLANISH =====
async function etiketkaYukla(mahsulot_id) {
  const kontent = document.getElementById('asosiyKontent');
  const shablonlar = await apiGet('/etiketka');

  kontent.innerHTML = `
    <div style="display:grid;grid-template-columns:1fr 340px;gap:16px;height:calc(100vh-110px)">
      <!-- CHAP: DIZAYNER -->
      <div class="card" style="overflow:hidden">
        <div class="card-header" style="padding:10px 16px">
          <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap">
            <h3 style="font-size:15px"><i class="fas fa-tag"></i> Etiketka dizayner</h3>
            <div style="display:flex;gap:6px;flex-wrap:wrap">
              <button class="btn btn-primary btn-sm" onclick="etiketkaTayyorModal()" style="background:#8b5cf6;border-color:#8b5cf6">
                <i class="fas fa-magic"></i> Tayyor shablon
              </button>
              <button class="btn btn-secondary btn-sm" onclick="eElementQosh('matn')">
                <i class="fas fa-font"></i> Matn
              </button>
              <button class="btn btn-secondary btn-sm" onclick="eElementQosh('shtrixkod')">
                <i class="fas fa-barcode"></i> Shtrix-kod
              </button>
              <button class="btn btn-secondary btn-sm" onclick="eElementQosh('qrkod')">
                <i class="fas fa-qrcode"></i> QR-kod
              </button>
              <button class="btn btn-secondary btn-sm" onclick="eElementQosh('chiziq')">
                <i class="fas fa-minus"></i> Chiziq
              </button>
              <button class="btn btn-secondary btn-sm" onclick="eElementQosh('rasm')">
                <i class="fas fa-image"></i> Rasm
              </button>
            </div>
          </div>
          <div style="display:flex;gap:6px">
            <button class="btn btn-warning btn-sm" onclick="eShablon_saqlash()">
              <i class="fas fa-save"></i> Saqlash
            </button>
            <button class="btn btn-success btn-sm" onclick="eChiqarish()">
              <i class="fas fa-print"></i> Chiqarish
            </button>
          </div>
        </div>
        <div class="card-body" style="padding:16px;overflow:auto;background:#e2e8f0;display:flex;align-items:flex-start;justify-content:center">
          <!-- CANVAS -->
          <div id="etiketCanvas"
            style="position:relative;background:white;box-shadow:0 2px 12px rgba(0,0,0,0.2);
            cursor:crosshair;user-select:none"
            onclick="eCanvasClick(event)"
            onmousemove="eCanvasSurish(event)"
            onmouseup="eSurishTugat(event)">
          </div>
        </div>
      </div>
      <!-- O'NG: SOZLAMALAR -->
      <div style="display:flex;flex-direction:column;gap:12px;overflow-y:auto">
        <!-- O'LCHAM -->
        <div class="card">
          <div class="card-header" style="padding:10px 14px"><h3 style="font-size:13px"><i class="fas fa-ruler"></i> O'lcham</h3></div>
          <div class="card-body" style="padding:12px">
            <div class="form-row">
              <div class="form-group" style="margin-bottom:8px">
                <label style="font-size:12px;font-weight:600">Uzunlik (mm)</label>
                <input type="number" id="eUzunlikInput" value="${eUzunlik}" min="10" max="300"
                  style="width:100%;padding:6px 10px;border:1px solid #e2e8f0;border-radius:6px;font-size:13px"
                  onchange="eOlchamOzgartir()">
              </div>
              <div class="form-group" style="margin-bottom:8px">
                <label style="font-size:12px;font-weight:600">Balandlik (mm)</label>
                <input type="number" id="eBalandlikInput" value="${eBalandlik}" min="10" max="200"
                  style="width:100%;padding:6px 10px;border:1px solid #e2e8f0;border-radius:6px;font-size:13px"
                  onchange="eOlchamOzgartir()">
              </div>
            </div>
            <div style="font-size:11px;color:#64748b;margin-bottom:8px">Standart o'lchamlar:</div>
            <div style="display:flex;gap:4px;flex-wrap:wrap">
              ${[
                ['58×30','58','30'],['58×40','58','40'],['40×30','40','30'],
                ['80×50','80','50'],['100×50','100','50'],['100×150','100','150']
              ].map(([n,u,b]) =>
                `<button onclick="eOlchamBelgila(${u},${b})"
                  style="padding:3px 8px;border:1px solid #e2e8f0;border-radius:4px;
                  background:white;font-size:11px;cursor:pointer"
                  onmouseover="this.style.background='#f1f5f9'"
                  onmouseout="this.style.background='white'">${n}</button>`
              ).join('')}
            </div>
          </div>
        </div>
        <!-- ELEMENT SOZLAMALARI -->
        <div class="card" id="eElementSoz" style="display:none">
          <div class="card-header" style="padding:10px 14px">
            <h3 style="font-size:13px"><i class="fas fa-cog"></i> Element sozlamalari</h3>
            <button class="btn btn-danger btn-sm btn-icon" onclick="eElementOchir()">
              <i class="fas fa-trash"></i>
            </button>
          </div>
          <div class="card-body" style="padding:12px" id="eElementSozKontent"></div>
        </div>
        <!-- SHABLONLAR -->
        <div class="card">
          <div class="card-header" style="padding:10px 14px">
            <h3 style="font-size:13px"><i class="fas fa-list"></i> Shablonlar</h3>
            <button class="btn btn-primary btn-sm" onclick="eShablon_saqlash()">
              <i class="fas fa-plus"></i> Yangi
            </button>
          </div>
          <div class="card-body" style="padding:8px" id="eShablonlarDiv">
            ${shablonlar.length ? shablonlar.map(s => `
              <div style="display:flex;align-items:center;justify-content:space-between;
                padding:6px 8px;border:1px solid #e2e8f0;border-radius:6px;margin-bottom:4px;
                cursor:pointer;font-size:12px" onclick="eShablonYukla(${s.id})"
                onmouseover="this.style.background='#f8fafc'" onmouseout="this.style.background='white'">
                <span><i class="fas fa-tag" style="color:#2563eb;margin-right:4px"></i>${s.nomi}</span>
                <div style="display:flex;gap:4px">
                  <span style="color:#94a3b8;font-size:11px">${s.uzunlik}×${s.balandlik}mm</span>
                  <button onclick="event.stopPropagation();eShablonOchir(${s.id})"
                    style="border:none;background:none;color:#ef4444;cursor:pointer;padding:0 2px">×</button>
                </div>
              </div>`).join('') :
              '<div style="text-align:center;color:#94a3b8;font-size:12px;padding:12px">Shablon yo\'q</div>'}
          </div>
        </div>
      </div>
    </div>`;

  eCanvasYanila();
  if (mahsulot_id) {
    const m = await apiGet('/mahsulotlar/' + mahsulot_id);
    eJoriyMahsulot = m;
    toast(`✅ "${m.nomi}" uchun etiketka`, 'success');
  }
}


// ===== CANVAS =====
function eCanvasYanila() {
  const canvas = document.getElementById('etiketCanvas');
  if (!canvas) return;
  const w = Math.round(eUzunlik * eMiqyos);
  const h = Math.round(eBalandlik * eMiqyos);
  canvas.style.width = w + 'px';
  canvas.style.height = h + 'px';
  canvas.style.minWidth = w + 'px';
  canvas.style.minHeight = h + 'px';
  eElementlarKorsatish();
}

function eElementlarKorsatish() {
  const canvas = document.getElementById('etiketCanvas');
  if (!canvas) return;
  // Faqat elementlarni yangilaymiz
  canvas.querySelectorAll('.e-element').forEach(e => e.remove());
  eJoriyElementlar.forEach((el, i) => {
    const div = document.createElement('div');
    div.className = 'e-element';
    div.style.cssText = `
      position:absolute;
      left:${el.x * eMiqyos}px;
      top:${el.y * eMiqyos}px;
      width:${el.kenglik * eMiqyos}px;
      height:${el.balandlik * eMiqyos}px;
      cursor:move;
      border:${eJoriyTanlangan===i ? '2px solid #2563eb' : '1px dashed transparent'};
      border-radius:2px;
      display:flex;align-items:center;justify-content:center;
      overflow:hidden;box-sizing:border-box;
    `;
    div.dataset.index = i;
    div.onmousedown = (e) => { e.stopPropagation(); eTanla(i, e); };

    // Element turiga qarab ichini ko'rsatish
    if (el.tur === 'matn') {
      div.innerHTML = `<span style="font-size:${el.shrift_olchami * eMiqyos * 0.7}px;
        font-weight:${el.qalin?'bold':'normal'};
        font-style:${el.kursiv?'italic':'normal'};
        color:${el.rang||'#000'};
        text-align:${el.hizalash||'left'};
        width:100%;padding:0 2px;white-space:nowrap;overflow:hidden"
        >${eMatnQiymat(el)}</span>`;
    } else if (el.tur === 'shtrixkod') {
      const kodQiymat = eMatnQiymat(el) || (eJoriyMahsulot ? (eJoriyMahsulot.shtrix_kod || eJoriyMahsulot.sku) : '0000');
      const barH = Math.max(8, (el.balandlik || 14) * eMiqyos * 0.6);
      div.innerHTML = `<div style="text-align:center;width:100%;display:flex;flex-direction:column;align-items:center;justify-content:center">
        <div style="transform:scaleX(${Math.min(1, (el.kenglik*eMiqyos)/((String(kodQiymat).length+3)*11))});transform-origin:center">
          ${barcode128Html(kodQiymat, barH)}
        </div>
        <div style="font-size:${Math.max(6,(el.shrift_olchami||6)*eMiqyos*0.5)}px;margin-top:1px;letter-spacing:1px">${kodQiymat}</div>
      </div>`;
    } else if (el.tur === 'qrkod') {
      div.innerHTML = `<div style="width:${el.balandlik*eMiqyos*0.9}px;height:${el.balandlik*eMiqyos*0.9}px;
        background: repeating-conic-gradient(#333 0% 25%, white 0% 50%) 0 0 / 20% 20%;
        opacity:0.8"></div>`;
    } else if (el.tur === 'chiziq') {
      div.style.borderTop = `${el.qalinlik||1}px solid ${el.rang||'#000'}`;
      div.style.height = `${(el.qalinlik||1)}px`;
    } else if (el.tur === 'rasm' && el.src) {
      div.innerHTML = `<img src="${el.src}" style="width:100%;height:100%;object-fit:contain">`;
    }

    // Resize handle
    if (eJoriyTanlangan === i) {
      const handle = document.createElement('div');
      handle.style.cssText = `position:absolute;right:-4px;bottom:-4px;width:8px;height:8px;
        background:#2563eb;border-radius:50%;cursor:se-resize;z-index:10`;
      handle.onmousedown = (e) => { e.stopPropagation(); eResizeBoshlash(i, e); };
      div.appendChild(handle);
    }
    canvas.appendChild(div);
  });
}

// ===== HAQIQIY CODE128 BARCODE GENERATOR =====
const CODE128_PATTERNS = [
"212222","222122","222221","121223","121322","131222","122213","122312","132212","221213",
"221312","231212","112232","122132","122231","113222","123122","123221","223211","221132",
"221231","213212","223112","312131","311222","321122","321221","312212","322112","322211",
"212123","212321","232121","111323","131123","131321","112313","132113","132311","211313",
"231113","231311","112133","112331","132131","113123","113321","133121","313121","211331",
"231131","213113","213311","213131","311123","311321","331121","312113","312311","332111",
"314111","221411","431111","111224","111422","121124","121421","141122","141221","112214",
"112412","122114","122411","142112","142211","241211","221114","413111","241112","134111",
"111242","121142","121241","114212","124112","124211","411212","421112","421211","212141",
"214121","412121","111143","111341","131141","114113","114311","411113","411311","113141",
"114131","311141","411131","211412","211214","211232","2331112"];

// Code128B — har qanday matn/raqam uchun skanerlanadigan barcode HTML
function barcode128Html(matn, balandlikPx) {
  if (!matn) matn = '0000';
  matn = String(matn);
  const START_B = 104, STOP = 106;
  let kodlar = [START_B];
  let sum = START_B;
  for (let i = 0; i < matn.length; i++) {
    let val = matn.charCodeAt(i) - 32;
    if (val < 0 || val > 94) val = 0; // faqat ASCII 32-126
    kodlar.push(val);
    sum += val * (i + 1);
  }
  kodlar.push(sum % 103); // checksum
  kodlar.push(STOP);

  // Har kod patternini chiziqlarga aylantirish
  let bars = '';
  kodlar.forEach(kod => {
    const p = CODE128_PATTERNS[kod];
    for (let j = 0; j < p.length; j++) {
      const w = parseInt(p[j]);
      const rang = (j % 2 === 0) ? '#000' : '#fff';
      bars += `<span style="display:inline-block;width:${w}px;height:${balandlikPx||30}px;background:${rang}"></span>`;
    }
  });
  return `<div style="display:inline-flex;align-items:flex-end;line-height:0;font-size:0">${bars}</div>`;
}

function eShtirixKodChiziqlar() {
  let html = '';
  const pattern = [3,1,2,1,3,1,1,2,1,3,2,1,1,3,1,2,1,1,3,2];
  pattern.forEach((w, i) => {
    if (i % 2 === 0) html += `<div style="background:#333;width:${w}px;height:100%"></div>`;
    else html += `<div style="background:white;width:${w}px;height:100%"></div>`;
  });
  return html;
}

function eMatnQiymat(el) {
  if (!eJoriyMahsulot) return el.qiymat_nomi || el.qiymat || '';
  const m = eJoriyMahsulot;
  const soz = JSON.parse(localStorage.getItem('dokoni_sozlamalar') || '{}');
  const map = {
    'mahsulot_nomi': m.nomi,
    'narxi': formatSum(m.sotish_narxi),
    'narxi_qisqa': String(m.sotish_narxi).replace(/\B(?=(\d{3})+(?!\d))/g, ' '),
    'shtrix_kod': m.shtrix_kod || m.sku || '',
    'sku': m.sku || '',
    'kategoriya': m.kategoriya_nomi || '',
    'birlik': m.birlik,
    'miqdor': String(m.miqdor),
    'kompaniya': soz.chek_dokoni_nomi || "Qurilish Do'koni",
    'erkin': el.qiymat || '',
  };
  return map[el.maydon] || el.qiymat || '';
}


// ===== ELEMENT QO'SHISH =====
function eElementQosh(tur) {
  const defaults = {
    matn:      { tur:'matn',      x:2, y:2,  kenglik:40, balandlik:8,  maydon:'mahsulot_nomi', qiymat:'', shrift_olchami:8,  rang:'#000000', qalin:false, kursiv:false, hizalash:'left' },
    shtrixkod: { tur:'shtrixkod', x:2, y:12, kenglik:40, balandlik:14, maydon:'shtrix_kod',    qiymat:'', shrift_olchami:6 },
    qrkod:     { tur:'qrkod',     x:2, y:2,  kenglik:20, balandlik:20, maydon:'sku',           qiymat:'' },
    chiziq:    { tur:'chiziq',    x:0, y:14, kenglik:58, balandlik:1,  rang:'#000000', qalinlik:1 },
    rasm:      { tur:'rasm',      x:2, y:2,  kenglik:20, balandlik:20, src:'' },
  };
  const el = { ...defaults[tur], id: Date.now() };
  eJoriyElementlar.push(el);
  eJoriyTanlangan = eJoriyElementlar.length - 1;
  eElementlarKorsatish();
  eElementSozKorsatish();
}

// ===== ELEMENT TANLASH =====
function eTanla(i, event) {
  eJoriyTanlangan = i;
  eSurish = true;
  const canvas = document.getElementById('etiketCanvas');
  const rect = canvas.getBoundingClientRect();
  const el = eJoriyElementlar[i];
  eSurishOff = {
    x: event.clientX - rect.left - el.x * eMiqyos,
    y: event.clientY - rect.top  - el.y * eMiqyos
  };
  eElementlarKorsatish();
  eElementSozKorsatish();
}

function eCanvasClick(event) {
  if (!eSurish) {
    eJoriyTanlangan = null;
    eElementlarKorsatish();
    document.getElementById('eElementSoz').style.display = 'none';
  }
  eSurish = false;
}

function eCanvasSurish(event) {
  if (!eSurish || eJoriyTanlangan === null) return;
  const canvas = document.getElementById('etiketCanvas');
  const rect = canvas.getBoundingClientRect();
  const el = eJoriyElementlar[eJoriyTanlangan];
  let newX = (event.clientX - rect.left - eSurishOff.x) / eMiqyos;
  let newY = (event.clientY - rect.top  - eSurishOff.y) / eMiqyos;
  // Chegaralar
  newX = Math.max(0, Math.min(eUzunlik - el.kenglik, newX));
  newY = Math.max(0, Math.min(eBalandlik - el.balandlik, newY));
  el.x = Math.round(newX * 10) / 10;
  el.y = Math.round(newY * 10) / 10;
  eElementlarKorsatish();
}

function eSurishTugat() { eSurish = false; }

let eResizingIndex = null, eResizeStart = {};
function eResizeBoshlash(i, event) {
  eResizingIndex = i;
  eResizeStart = { x: event.clientX, y: event.clientY,
    w: eJoriyElementlar[i].kenglik, h: eJoriyElementlar[i].balandlik };
  const onMove = (e) => {
    if (eResizingIndex === null) return;
    const el = eJoriyElementlar[eResizingIndex];
    el.kenglik = Math.max(5, eResizeStart.w + (e.clientX - eResizeStart.x) / eMiqyos);
    el.balandlik = Math.max(3, eResizeStart.h + (e.clientY - eResizeStart.y) / eMiqyos);
    eElementlarKorsatish();
    eElementSozKorsatish();
  };
  const onUp = () => { eResizingIndex = null; document.removeEventListener('mousemove', onMove); document.removeEventListener('mouseup', onUp); };
  document.addEventListener('mousemove', onMove);
  document.addEventListener('mouseup', onUp);
}

function eElementOchir() {
  if (eJoriyTanlangan === null) return;
  eJoriyElementlar.splice(eJoriyTanlangan, 1);
  eJoriyTanlangan = null;
  eElementlarKorsatish();
  document.getElementById('eElementSoz').style.display = 'none';
}


// ===== ELEMENT SOZLAMALARI PANELI =====
const E_MAYDONLAR = [
  {v:'mahsulot_nomi', n:'Mahsulot nomi'},
  {v:'narxi',         n:'Narxi (so\'m bilan)'},
  {v:'narxi_qisqa',   n:'Narxi (qisqa, so\'msiz)'},
  {v:'shtrix_kod',    n:'Shtrix-kod'},
  {v:'sku',           n:'SKU kodi'},
  {v:'kategoriya',    n:'Kategoriya'},
  {v:'birlik',        n:'Birlik'},
  {v:'kompaniya',     n:'Kompaniya nomi'},
  {v:'erkin',         n:'Erkin matn'},
];

function eElementSozKorsatish() {
  const panel = document.getElementById('eElementSoz');
  const kontent = document.getElementById('eElementSozKontent');
  if (!panel || !kontent) return;
  if (eJoriyTanlangan === null) { panel.style.display='none'; return; }
  panel.style.display = 'block';
  const el = eJoriyElementlar[eJoriyTanlangan];

  let html = `
    <!-- POZITSIYA VA O'LCHAM -->
    <div class="form-row" style="gap:6px;margin-bottom:8px">
      <div><label style="font-size:11px">X (mm)</label>
        <input type="number" value="${el.x}" step="0.5" onchange="eElOzgartir('x',+this.value)"
          style="width:100%;padding:4px 6px;border:1px solid #e2e8f0;border-radius:4px;font-size:12px"></div>
      <div><label style="font-size:11px">Y (mm)</label>
        <input type="number" value="${el.y}" step="0.5" onchange="eElOzgartir('y',+this.value)"
          style="width:100%;padding:4px 6px;border:1px solid #e2e8f0;border-radius:4px;font-size:12px"></div>
    </div>
    <div class="form-row" style="gap:6px;margin-bottom:8px">
      <div><label style="font-size:11px">Kenglik (mm)</label>
        <input type="number" value="${el.kenglik}" step="0.5" onchange="eElOzgartir('kenglik',+this.value)"
          style="width:100%;padding:4px 6px;border:1px solid #e2e8f0;border-radius:4px;font-size:12px"></div>
      <div><label style="font-size:11px">Balandlik (mm)</label>
        <input type="number" value="${el.balandlik}" step="0.5" onchange="eElOzgartir('balandlik',+this.value)"
          style="width:100%;padding:4px 6px;border:1px solid #e2e8f0;border-radius:4px;font-size:12px"></div>
    </div>`;

  if (el.tur === 'matn') {
    html += `
      <div style="margin-bottom:8px">
        <label style="font-size:11px;font-weight:600">Ma'lumot turi</label>
        <select onchange="eElOzgartir('maydon',this.value)"
          style="width:100%;padding:4px 6px;border:1px solid #e2e8f0;border-radius:4px;font-size:12px">
          ${E_MAYDONLAR.map(m => `<option value="${m.v}" ${el.maydon===m.v?'selected':''}>${m.n}</option>`).join('')}
        </select>
      </div>
      ${el.maydon === 'erkin' ? `
      <div style="margin-bottom:8px">
        <label style="font-size:11px">Matn</label>
        <input type="text" value="${el.qiymat||''}" onchange="eElOzgartir('qiymat',this.value)"
          style="width:100%;padding:4px 6px;border:1px solid #e2e8f0;border-radius:4px;font-size:12px">
      </div>` : ''}
      <div class="form-row" style="gap:6px;margin-bottom:8px">
        <div><label style="font-size:11px">Shrift (mm)</label>
          <input type="number" value="${el.shrift_olchami||8}" min="4" max="30" step="0.5"
            onchange="eElOzgartir('shrift_olchami',+this.value)"
            style="width:100%;padding:4px 6px;border:1px solid #e2e8f0;border-radius:4px;font-size:12px"></div>
        <div><label style="font-size:11px">Rang</label>
          <input type="color" value="${el.rang||'#000000'}" onchange="eElOzgartir('rang',this.value)"
            style="width:100%;padding:2px;border:1px solid #e2e8f0;border-radius:4px;height:30px"></div>
      </div>
      <div style="display:flex;gap:8px;margin-bottom:8px">
        <label style="display:flex;align-items:center;gap:4px;font-size:12px;cursor:pointer">
          <input type="checkbox" ${el.qalin?'checked':''} onchange="eElOzgartir('qalin',this.checked)"> Qalin
        </label>
        <label style="display:flex;align-items:center;gap:4px;font-size:12px;cursor:pointer">
          <input type="checkbox" ${el.kursiv?'checked':''} onchange="eElOzgartir('kursiv',this.checked)"> Kursiv
        </label>
      </div>
      <div style="margin-bottom:8px">
        <label style="font-size:11px">Hizalash</label>
        <div style="display:flex;gap:4px">
          ${['left','center','right'].map(h => `
            <button onclick="eElOzgartir('hizalash','${h}')"
              style="flex:1;padding:4px;border:1px solid ${el.hizalash===h?'#2563eb':'#e2e8f0'};
              border-radius:4px;background:${el.hizalash===h?'#dbeafe':'white'};cursor:pointer;font-size:11px">
              <i class="fas fa-align-${h}"></i>
            </button>`).join('')}
        </div>
      </div>`;
  } else if (el.tur === 'shtrixkod' || el.tur === 'qrkod') {
    html += `
      <div style="margin-bottom:8px">
        <label style="font-size:11px;font-weight:600">Kod turi</label>
        <select onchange="eElOzgartir('maydon',this.value)"
          style="width:100%;padding:4px 6px;border:1px solid #e2e8f0;border-radius:4px;font-size:12px">
          <option value="shtrix_kod" ${el.maydon==='shtrix_kod'?'selected':''}>Shtrix-kod</option>
          <option value="sku" ${el.maydon==='sku'?'selected':''}>SKU kodi</option>
          <option value="erkin" ${el.maydon==='erkin'?'selected':''}>Erkin matn</option>
        </select>
      </div>
      ${el.maydon === 'erkin' ? `
      <div style="margin-bottom:8px">
        <label style="font-size:11px">Kod qiymati</label>
        <input type="text" value="${el.qiymat||''}" onchange="eElOzgartir('qiymat',this.value)"
          style="width:100%;padding:4px 6px;border:1px solid #e2e8f0;border-radius:4px;font-size:12px">
      </div>` : ''}`;
  } else if (el.tur === 'chiziq') {
    html += `
      <div class="form-row" style="gap:6px;margin-bottom:8px">
        <div><label style="font-size:11px">Rang</label>
          <input type="color" value="${el.rang||'#000000'}" onchange="eElOzgartir('rang',this.value)"
            style="width:100%;padding:2px;border:1px solid #e2e8f0;border-radius:4px;height:30px"></div>
        <div><label style="font-size:11px">Qalinlik (px)</label>
          <input type="number" value="${el.qalinlik||1}" min="1" max="10"
            onchange="eElOzgartir('qalinlik',+this.value)"
            style="width:100%;padding:4px 6px;border:1px solid #e2e8f0;border-radius:4px;font-size:12px"></div>
      </div>`;
  } else if (el.tur === 'rasm') {
    html += `
      <div style="margin-bottom:8px">
        <label style="font-size:11px">Rasm yuklash</label><br>
        <input type="file" accept="image/*" onchange="eRasmYukla(this)"
          style="font-size:11px;width:100%">
      </div>`;
  }

  kontent.innerHTML = html;
}

function eElOzgartir(kalit, qiymat) {
  if (eJoriyTanlangan === null) return;
  eJoriyElementlar[eJoriyTanlangan][kalit] = qiymat;
  eElementlarKorsatish();
  eElementSozKorsatish();
}

function eRasmYukla(input) {
  const file = input.files[0]; if (!file) return;
  const reader = new FileReader();
  reader.onload = e => { eElOzgartir('src', e.target.result); };
  reader.readAsDataURL(file);
}


// ===== O'LCHAM =====
function eOlchamOzgartir() {
  eUzunlik  = parseFloat(document.getElementById('eUzunlikInput')?.value)  || 58;
  eBalandlik = parseFloat(document.getElementById('eBalandlikInput')?.value) || 30;
  eCanvasYanila();
}

function eOlchamBelgila(u, b) {
  eUzunlik = u; eBalandlik = b;
  const ui = document.getElementById('eUzunlikInput');
  const bi = document.getElementById('eBalandlikInput');
  if (ui) ui.value = u;
  if (bi) bi.value = b;
  eCanvasYanila();
}

// ===== SHABLONLAR =====
async function eShablon_saqlash() {
  const nomi = eJoriyShablon?.nomi || prompt('Shablon nomi:', 'Yangi shablon');
  if (!nomi) return;
  const data = { nomi, uzunlik: eUzunlik, balandlik: eBalandlik, elementlar: eJoriyElementlar };
  try {
    if (eJoriyShablon?.id) {
      await apiPut('/etiketka/' + eJoriyShablon.id, data);
      toast('✅ Shablon yangilandi!', 'success');
    } else {
      const r = await apiPost('/etiketka', data);
      eJoriyShablon = { id: r.id, nomi };
      toast('✅ Shablon saqlandi!', 'success');
    }
    eShablonlarRoyxatYanila();
  } catch(e) { toast(e.message, 'error'); }
}

async function eShablonYukla(id) {
  try {
    const s = await apiGet('/etiketka/' + id);
    eJoriyShablon = { id: s.id, nomi: s.nomi };
    eUzunlik  = s.uzunlik;
    eBalandlik = s.balandlik;
    eJoriyElementlar = JSON.parse(s.elementlar || '[]');
    eJoriyTanlangan = null;
    const ui = document.getElementById('eUzunlikInput');
    const bi = document.getElementById('eBalandlikInput');
    if (ui) ui.value = eUzunlik;
    if (bi) bi.value = eBalandlik;
    eCanvasYanila();
    toast(`✅ "${s.nomi}" yuklandi`, 'success');
  } catch(e) { toast(e.message, 'error'); }
}

async function eShablonOchir(id) {
  tasdiqlash('Bu shablonni o\'chirasizmi?', async () => {
    try {
      await apiDelete('/etiketka/' + id);
      toast('Shablon o\'chirildi!');
      if (eJoriyShablon?.id === id) { eJoriyShablon = null; eJoriyElementlar = []; eCanvasYanila(); }
      eShablonlarRoyxatYanila();
    } catch(e) { toast(e.message, 'error'); }
  });
}

async function eShablonlarRoyxatYanila() {
  try {
    const shablonlar = await apiGet('/etiketka');
    const div = document.getElementById('eShablonlarDiv');
    if (!div) return;
    div.innerHTML = shablonlar.length ? shablonlar.map(s => `
      <div style="display:flex;align-items:center;justify-content:space-between;
        padding:6px 8px;border:1px solid ${eJoriyShablon?.id===s.id?'#2563eb':'#e2e8f0'};
        border-radius:6px;margin-bottom:4px;cursor:pointer;font-size:12px;
        background:${eJoriyShablon?.id===s.id?'#eff6ff':'white'}"
        onclick="eShablonYukla(${s.id})"
        onmouseover="this.style.background='#f8fafc'" onmouseout="this.style.background='${eJoriyShablon?.id===s.id?'#eff6ff':'white'}'">
        <span><i class="fas fa-tag" style="color:#2563eb;margin-right:4px"></i>${s.nomi}</span>
        <div style="display:flex;gap:4px">
          <span style="color:#94a3b8;font-size:11px">${s.uzunlik}×${s.balandlik}mm</span>
          <button onclick="event.stopPropagation();eShablonOchir(${s.id})"
            style="border:none;background:none;color:#ef4444;cursor:pointer;padding:0 2px;font-size:14px">×</button>
        </div>
      </div>`).join('') :
      '<div style="text-align:center;color:#94a3b8;font-size:12px;padding:12px">Shablon yo\'q</div>';
  } catch(e) {}
}


// ===== CHIQARISH (PRINT) =====
function eChiqarish() {
  const soz = (typeof sozlamalarniOl === 'function') ? sozlamalarniOl() : (JSON.parse(localStorage.getItem('dokoni_sozlamalar')||'{}'));
  const w = Math.round(eUzunlik * eMiqyos);
  const h = Math.round(eBalandlik * eMiqyos);

  let elementlarHtml = eJoriyElementlar.map(el => {
    const x = el.x * eMiqyos, y = el.y * eMiqyos;
    const kw = el.kenglik * eMiqyos, kh = el.balandlik * eMiqyos;
    const qiymat = eMatnQiymat(el);
    if (el.tur === 'matn') return `
      <div style="position:absolute;left:${x}px;top:${y}px;width:${kw}px;height:${kh}px;
        font-size:${el.shrift_olchami * eMiqyos * 0.7}px;
        font-weight:${el.qalin?'bold':'normal'};
        font-style:${el.kursiv?'italic':'normal'};
        color:${el.rang||'#000'};text-align:${el.hizalash||'left'};
        overflow:hidden;white-space:nowrap;padding:0 2px;
        display:flex;align-items:center">${qiymat}</div>`;
    if (el.tur === 'shtrixkod') return `
      <div style="position:absolute;left:${x}px;top:${y}px;width:${kw}px;height:${kh}px;
        display:flex;flex-direction:column;align-items:center;justify-content:center;overflow:hidden">
        <div style="transform:scaleX(${Math.min(1, kw/((String(qiymat).length+3)*11))});transform-origin:center">
          ${barcode128Html(qiymat, kh*0.7)}
        </div>
        <div style="font-size:${Math.max(6,6*eMiqyos*0.5)}px;margin-top:1px;letter-spacing:1px">${qiymat}</div>
      </div>`;
    if (el.tur === 'chiziq') return `
      <div style="position:absolute;left:${x}px;top:${y}px;width:${kw}px;
        border-top:${el.qalinlik||1}px solid ${el.rang||'#000'}"></div>`;
    if (el.tur === 'rasm' && el.src) return `
      <img src="${el.src}" style="position:absolute;left:${x}px;top:${y}px;
        width:${kw}px;height:${kh}px;object-fit:contain">`;
    return '';
  }).join('');

  const etiketkaHtml = `
    <div style="position:relative;width:${w}px;height:${h}px;background:white;overflow:hidden">
      ${elementlarHtml}
    </div>`;

  // printer.js orqali chiqarish
  if (typeof etiketkaChiqar === 'function') {
    etiketkaChiqar(etiketkaHtml, eUzunlik, eBalandlik);
  } else {
    // Fallback
    const printWin = window.open('', '_blank', 'width=400,height=300');
    printWin.document.write(`<!DOCTYPE html><html><head>
      <style>
        @page{size:${eUzunlik}mm ${eBalandlik}mm;margin:0}
        body{margin:0;background:white}
        .btn{padding:6px 14px;border-radius:6px;border:none;cursor:pointer;margin:4px}
        @media print{.ctrl{display:none}}
      </style>
    </head><body>
      <div class="ctrl" style="padding:8px;background:#f1f5f9">
        <button class="btn" style="background:#2563eb;color:white" onclick="window.print()">🖨️ Chop etish</button>
        <button class="btn" style="background:#e2e8f0" onclick="window.close()">Yopish</button>
      </div>
      ${etiketkaHtml}
    </body></html>`);
    printWin.document.close();
  }
}

// ===== MAHSULOTDAN ETIKETKA CHIQARISH =====
async function mahsulotEtiketka(mahsulot_id) {
  eJoriyMahsulot = await apiGet('/mahsulotlar/' + mahsulot_id);
  eJoriyElementlar = [];
  eJoriyTanlangan = null;
  eJoriyShablon = null;

  // Shablonlar bormi?
  const shablonlar = await apiGet('/etiketka');
  if (shablonlar.length) {
    // Shablon tanlash modali
    modalOch('🏷️ Etiketka shabloni tanlang', `
      <p style="color:#64748b;font-size:13px;margin-bottom:12px">
        "<b>${eJoriyMahsulot.nomi}</b>" uchun shablon tanlang yoki yangi yarating:
      </p>
      <div style="max-height:300px;overflow-y:auto;display:flex;flex-direction:column;gap:6px">
        ${shablonlar.map(s => `
          <div onclick="modalYop();eShablonBilanChiqar(${s.id})"
            style="padding:10px 14px;border:1px solid #e2e8f0;border-radius:8px;cursor:pointer;
            display:flex;justify-content:space-between;align-items:center"
            onmouseover="this.style.background='#f0f9ff';this.style.borderColor='#2563eb'"
            onmouseout="this.style.background='white';this.style.borderColor='#e2e8f0'">
            <div>
              <div style="font-weight:600;font-size:14px">${s.nomi}</div>
              <div style="font-size:12px;color:#64748b">${s.uzunlik}×${s.balandlik}mm</div>
            </div>
            <i class="fas fa-chevron-right" style="color:#94a3b8"></i>
          </div>`).join('')}
      </div>
      <div class="modal-footer" style="padding:0;margin-top:12px">
        <button class="btn btn-secondary" onclick="modalYop()">Bekor</button>
        <button class="btn btn-primary" onclick="modalYop();sahifaOch('etiketka')">
          <i class="fas fa-plus"></i> Yangi shablon
        </button>
      </div>`);
  } else {
    sahifaOch('etiketka');
  }
}

async function eShablonBilanChiqar(shablon_id) {
  const s = await apiGet('/etiketka/' + shablon_id);
  eJoriyShablon = { id: s.id, nomi: s.nomi };
  eUzunlik = s.uzunlik;
  eBalandlik = s.balandlik;
  eJoriyElementlar = JSON.parse(s.elementlar || '[]');
  // To'g'ridan chiqarish
  eChiqarish();
}



// ===== TAYYOR SHABLONLAR (4 razmer) =====
const ETIKETKA_TAYYOR = {
  '58x30': {
    nomi: 'Etiketka 58×30', uzunlik: 58, balandlik: 30,
    elementlar: [
      { tur:'matn', x:2, y:1.5, kenglik:54, balandlik:6, maydon:'mahsulot_nomi', shrift_olchami:8, qalin:true, hizalash:'center', rang:'#000000' },
      { tur:'matn', x:2, y:8, kenglik:54, balandlik:4, maydon:'sku', shrift_olchami:6, hizalash:'center', rang:'#000000' },
      { tur:'shtrixkod', x:2, y:12.5, kenglik:34, balandlik:15, maydon:'shtrix_kod', shrift_olchami:6 },
      { tur:'matn', x:37, y:16, kenglik:20, balandlik:9, maydon:'narxi_qisqa', shrift_olchami:9, qalin:true, hizalash:'center', rang:'#000000' },
    ]
  },
  '58x40': {
    nomi: 'Etiketka 58×40', uzunlik: 58, balandlik: 40,
    elementlar: [
      { tur:'matn', x:2, y:2, kenglik:54, balandlik:7, maydon:'mahsulot_nomi', shrift_olchami:10, qalin:true, hizalash:'center', rang:'#000000' },
      { tur:'matn', x:2, y:10, kenglik:54, balandlik:5, maydon:'sku', shrift_olchami:7, hizalash:'center', rang:'#000000' },
      { tur:'shtrixkod', x:2, y:16, kenglik:54, balandlik:13, maydon:'shtrix_kod', shrift_olchami:7 },
      { tur:'matn', x:2, y:30, kenglik:54, balandlik:9, maydon:'narxi_qisqa', shrift_olchami:12, qalin:true, hizalash:'center', rang:'#000000' },
    ]
  },
  '30x40': {
    nomi: 'Etiketka 30×40', uzunlik: 30, balandlik: 40,
    elementlar: [
      { tur:'matn', x:1, y:2, kenglik:28, balandlik:8, maydon:'mahsulot_nomi', shrift_olchami:7, qalin:true, hizalash:'center', rang:'#000000' },
      { tur:'matn', x:1, y:11, kenglik:28, balandlik:4, maydon:'sku', shrift_olchami:6, hizalash:'center', rang:'#000000' },
      { tur:'shtrixkod', x:1, y:16, kenglik:28, balandlik:13, maydon:'shtrix_kod', shrift_olchami:6 },
      { tur:'matn', x:1, y:30, kenglik:28, balandlik:8, maydon:'narxi_qisqa', shrift_olchami:10, qalin:true, hizalash:'center', rang:'#000000' },
    ]
  },
  '20x30': {
    nomi: 'Etiketka 20×30', uzunlik: 20, balandlik: 30,
    elementlar: [
      { tur:'matn', x:1, y:1, kenglik:18, balandlik:5, maydon:'mahsulot_nomi', shrift_olchami:5, qalin:true, hizalash:'center', rang:'#000000' },
      { tur:'matn', x:1, y:7, kenglik:18, balandlik:3, maydon:'sku', shrift_olchami:4, hizalash:'center', rang:'#000000' },
      { tur:'shtrixkod', x:1, y:11, kenglik:18, balandlik:10, maydon:'shtrix_kod', shrift_olchami:5 },
      { tur:'matn', x:1, y:22, kenglik:18, balandlik:6, maydon:'narxi_qisqa', shrift_olchami:8, qalin:true, hizalash:'center', rang:'#000000' },
    ]
  },
};

function etiketkaTayyorModal() {
  const kartalar = Object.entries(ETIKETKA_TAYYOR).map(([kalit, sh]) => {
    // Vizual nisbat — preview qutisi
    const w = Math.min(sh.uzunlik * 2.2, 150);
    const h = Math.min(sh.balandlik * 2.2, 110);
    return `
      <div onclick="etiketkaTayyorYukla('${kalit}')"
        style="border:2px solid #e2e8f0;border-radius:12px;padding:14px;cursor:pointer;
        display:flex;flex-direction:column;align-items:center;gap:10px;transition:all 0.15s;background:white"
        onmouseover="this.style.borderColor='#8b5cf6';this.style.background='#faf5ff'"
        onmouseout="this.style.borderColor='#e2e8f0';this.style.background='white'">
        <div style="font-weight:700;font-size:15px;color:#1e293b">${sh.uzunlik}×${sh.balandlik} mm</div>
        <!-- Mini preview -->
        <div style="width:${w}px;height:${h}px;border:1.5px solid #cbd5e1;border-radius:4px;
          position:relative;background:white;display:flex;flex-direction:column;
          align-items:center;justify-content:space-between;padding:4px;overflow:hidden">
          <div style="font-size:8px;font-weight:700;text-align:center;line-height:1.1">Mahsulot</div>
          <div style="font-size:6px;color:#8b5cf6">SKU: 0001</div>
          <div style="display:flex;gap:1px;align-items:flex-end;height:30%">
            ${Array.from({length:12},(_,i)=>`<div style="width:1.5px;height:${60+Math.random()*40}%;background:#000"></div>`).join('')}
          </div>
          <div style="font-size:${kalit==='58x30'?'8':'10'}px;font-weight:700;color:#2563eb">99 000</div>
        </div>
        <div style="font-size:11px;color:#94a3b8">Tanlash uchun bosing</div>
      </div>`;
  }).join('');

  modalOch('🏷️ Tayyor etiketka shablonlari', `
    <p style="color:#64748b;font-size:13px;margin-bottom:14px">
      Razmerni tanlang — mahsulot nomi, SKU, shtrix-kod va narx avtomatik joylashtiriladi:
    </p>
    <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:12px">
      ${kartalar}
    </div>`);
}

function etiketkaTayyorYukla(kalit) {
  const sh = ETIKETKA_TAYYOR[kalit];
  if (!sh) return;
  modalYop();
  // O'lcham va elementlarni o'rnatish
  eUzunlik = sh.uzunlik;
  eBalandlik = sh.balandlik;
  eJoriyElementlar = sh.elementlar.map((el, i) => ({ ...el, id: Date.now() + i }));
  eJoriyTanlangan = null;
  eJoriyShablon = null; // yangi shablon sifatida saqlanadi
  // Inputlarni yangilash
  const ui = document.getElementById('eUzunlikInput');
  const bi = document.getElementById('eBalandlikInput');
  if (ui) ui.value = eUzunlik;
  if (bi) bi.value = eBalandlik;
  eCanvasYanila();
  toast(`✅ ${sh.nomi} shabloni yaratildi! Kerak bo'lsa tahrirlang va saqlang.`, 'success');
}
