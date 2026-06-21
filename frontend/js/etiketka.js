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
      div.innerHTML = `<div style="text-align:center;font-size:${8*eMiqyos*0.5}px;color:#333;width:100%">
        <div style="display:flex;gap:1px;justify-content:center;height:70%;align-items:flex-end">
          ${eShtirixKodChiziqlar()}
        </div>
        <div style="font-size:${6*eMiqyos*0.5}px;margin-top:1px">${eMatnQiymat(el)}</div>
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
  {v:'narxi',         n:'Narxi'},
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
  const soz = sozlamalarniOl();
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
        display:flex;flex-direction:column;align-items:center;justify-content:center">
        <div style="display:flex;gap:1px;height:75%;align-items:flex-end">
          ${eShtirixKodChiziqlar()}
        </div>
        <div style="font-size:${6*eMiqyos*0.5}px;margin-top:1px">${qiymat}</div>
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
