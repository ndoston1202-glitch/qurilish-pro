// ===== KASSA XOTIRASI (task 4) =====
const KASSA_XOTIRA_KALIT = 'kassa_xotira';

function kassaXotirasiniSaqla() {
  try {
    localStorage.setItem(KASSA_XOTIRA_KALIT, JSON.stringify({
      chekMahsulotlar,
      tanlangan_mijoz,
      chegirma: document.getElementById('chegirmaInput')?.value || '',
      tolov_turi: document.getElementById('tolovTuri')?.value || 'naqd',
    }));
  } catch(e) {}
}

function kassaXotirasiniYukla() {
  try {
    const d = localStorage.getItem(KASSA_XOTIRA_KALIT);
    if (!d) return false;
    const x = JSON.parse(d);
    if (!x.chekMahsulotlar || !x.chekMahsulotlar.length) return false;
    chekMahsulotlar = x.chekMahsulotlar;
    tanlangan_mijoz = x.tanlangan_mijoz || null;
    return x;
  } catch(e) { return false; }
}

function kassaXotirasiniTozala() {
  localStorage.removeItem(KASSA_XOTIRA_KALIT);
}


// ===== KO'P CHEK (MULTI-ORDER) TIZIMI =====
let kassaMahsulotlar = [];
let chekMahsulotlar = [];
let tanlangan_mijoz = null;

// Ko'p chek ma'lumotlari
let cheklar = [];
let joriyChekId = null;
let chekIdCounter = 1;

function yangiChekYarat(nom) {
  const id = 'chek_' + (chekIdCounter++);
  const chek = {
    id, nom: nom || `Chek ${cheklar.length + 1}`,
    mahsulotlar: [],
    mijoz: null,
    chegirma: 0,
    tolovlar: [{ tur: 'naqd', summa: 0 }]
  };
  cheklar.push(chek);
  return chek;
}

function joriyChekOl() {
  return cheklar.find(c => c.id === joriyChekId) || cheklar[0];
}

function joriyChekSaqla() {
  const chek = joriyChekOl();
  if (!chek) return;
  chek.mahsulotlar = [...chekMahsulotlar];
  chek.mijoz = tanlangan_mijoz;
  chek.chegirma = parseFloat(document.getElementById('chegirmaInput')?.value) || 0;
  chek.tolovlar = [...tolovQatorlarData];
}

function chekTablarYanila() {
  const tabDiv = document.getElementById('chekTablar');
  if (!tabDiv) return;
  tabDiv.innerHTML = cheklar.map(c => {
    const joriy = c.id === joriyChekId;
    const mahsulotSoni = c.mahsulotlar.length;
    return `
      <div onclick="chekTabAlmashtir('${c.id}')"
        style="display:flex;align-items:center;gap:6px;padding:6px 10px;
        border-radius:8px;cursor:pointer;white-space:nowrap;min-width:0;
        background:${joriy?'#2563eb':'#f1f5f9'};
        color:${joriy?'white':'#475569'};
        border:2px solid ${joriy?'#2563eb':'#e2e8f0'};
        transition:all 0.15s">
        <i class="fas fa-receipt" style="font-size:11px"></i>
        <span style="font-size:12px;font-weight:600;max-width:80px;overflow:hidden;text-overflow:ellipsis">
          ${c.mijoz ? c.mijoz.toliqIsm.split(' ')[0] : c.nom}
        </span>
        ${mahsulotSoni > 0 ? `<span style="background:${joriy?'rgba(255,255,255,0.3)':'#e2e8f0'};
          border-radius:10px;padding:1px 6px;font-size:10px;font-weight:700">${mahsulotSoni}</span>` : ''}
        ${cheklar.length > 1 ? `
          <button onclick="event.stopPropagation();chekOchir('${c.id}')"
            style="background:none;border:none;cursor:pointer;padding:0;
            color:${joriy?'rgba(255,255,255,0.7)':'#94a3b8'};font-size:14px;
            line-height:1;margin-left:2px" title="Yopish">×</button>` : ''}
      </div>`;
  }).join('') + `
    <button onclick="yangiChekQosh()"
      style="padding:6px 10px;border-radius:8px;border:2px dashed #e2e8f0;
      background:white;color:#64748b;cursor:pointer;font-size:12px;
      display:flex;align-items:center;gap:4px;white-space:nowrap;transition:all 0.15s"
      onmouseover="this.style.borderColor='#2563eb';this.style.color='#2563eb'"
      onmouseout="this.style.borderColor='#e2e8f0';this.style.color='#64748b'">
      <i class="fas fa-plus"></i> Yangi
    </button>`;
}

function yangiChekQosh() {
  joriyChekSaqla();
  // Maksimum 5 ta chek
  if (cheklar.length >= 5) {
    toast('⚠️ Maksimum 5 ta chek ochilishi mumkin!', 'warning');
    return;
  }
  const yangi = yangiChekYarat();
  joriyChekId = yangi.id;
  chekMahsulotlar = [];
  tanlangan_mijoz = null;
  chekTablarYanila();
  chekKorsatish();
  setTimeout(() => {
    const ch = document.getElementById('chegirmaInput');
    if (ch) ch.value = '';
    const tb = document.getElementById('tanlangan_mijoz_blok');
    if (tb) tb.innerHTML = '<span style="color:#94a3b8;font-size:13px">— Mijozsiz sotuv —</span>';
    tolovQatorlarData = [{ tur: 'naqd', summa: 0 }];
    tolovQatorlarKorsatish();
    chekHisoba();
  }, 50);
  toast(`✅ Yangi chek ochildi — ${yangi.nom}`, 'success');
}

function chekTabAlmashtir(id) {
  if (id === joriyChekId) return;
  joriyChekSaqla(); // Hozirgi chekni saqlash
  joriyChekId = id;
  const chek = joriyChekOl();
  if (!chek) return;

  // Yangi chekni yuklash
  chekMahsulotlar = [...(chek.mahsulotlar || [])];
  tanlangan_mijoz = chek.mijoz || null;
  tolovQatorlarData = [...(chek.tolovlar || [{ tur: 'naqd', summa: 0 }])];

  chekTablarYanila();
  chekKorsatish();
  setTimeout(() => {
    const ch = document.getElementById('chegirmaInput');
    if (ch) ch.value = chek.chegirma || '';
    if (tanlangan_mijoz) mijozBlokniyaJila();
    else {
      const tb = document.getElementById('tanlangan_mijoz_blok');
      if (tb) tb.innerHTML = '<span style="color:#94a3b8;font-size:13px">— Mijozsiz sotuv —</span>';
    }
    tolovQatorlarKorsatish();
    chekHisoba();
  }, 50);
}

function chekOchir(id) {
  if (cheklar.length <= 1) {
    chekTozala(); return;
  }
  const idx = cheklar.findIndex(c => c.id === id);
  cheklar.splice(idx, 1);

  if (joriyChekId === id) {
    joriyChekId = cheklar[Math.max(0, idx - 1)].id;
    const chek = joriyChekOl();
    chekMahsulotlar = [...(chek.mahsulotlar || [])];
    tanlangan_mijoz = chek.mijoz || null;
    tolovQatorlarData = [...(chek.tolovlar || [{ tur: 'naqd', summa: 0 }])];
  }

  chekTablarYanila();
  chekKorsatish();
  setTimeout(() => {
    const chek = joriyChekOl();
    const ch = document.getElementById('chegirmaInput');
    if (ch) ch.value = chek?.chegirma || '';
    if (tanlangan_mijoz) mijozBlokniyaJila();
    tolovQatorlarKorsatish();
    chekHisoba();
  }, 50);
}

async function kassaYukla() {
  const kontent = document.getElementById('asosiyKontent');
  const soz = sozlamalarniOl();

  // Birinchi chekni yaratish — faqat bo'sh bo'lsa
  if (cheklar.length === 0) {
    const birinchi = yangiChekYarat('Chek 1');
    joriyChekId = birinchi.id;
  }
  // Maksimum 5 ta chek — ortiqchalarini tozalash
  if (cheklar.length > 5) {
    cheklar = cheklar.slice(-5);
    if (!cheklar.find(c => c.id === joriyChekId)) {
      joriyChekId = cheklar[0].id;
    }
  }

  kontent.innerHTML = `
    <div style="display:flex;flex-direction:column;height:calc(100vh - 110px);gap:0">

      <!-- CHEK TABLARI -->
      <div style="display:flex;align-items:center;gap:6px;padding:8px 12px;
        background:white;border-bottom:1px solid #e2e8f0;flex-wrap:wrap" id="chekTablar">
      </div>

      <!-- 3 USTUNLI LAYOUT -->
      <div style="flex:1;overflow:hidden;display:grid;grid-template-columns:1fr 340px 300px;gap:0">

        <!-- CHAP: MAHSULOTLAR RO'YXATI -->
        <div style="overflow-y:auto;padding:12px;border-right:1px solid #e2e8f0;background:#f8fafc">
          <div class="card" style="margin-bottom:12px">
            <div class="card-body" style="padding:10px">
              <div class="filter-bar">
                <input type="text" id="kassaQidiruv" class="search-input"
                  placeholder="🔍 Nomi, SKU yoki shtrix-kod..." oninput="kassaMahsulotFilter()" style="flex:1">
                <select id="kassaKat" class="filter-select" onchange="kassaMahsulotFilter()">
                  <option value="">Barcha kategoriyalar</option>
                </select>
                <button class="btn btn-secondary btn-sm" onclick="kassaKorinishAlmash()" title="Ko'rinishni almashtir">
                  <i class="fas fa-th-large"></i>
                </button>
              </div>
            </div>
          </div>
          <div id="kassaMahsulotGrid" class="${soz.savdoKorinish==='jadval'?'':'mahsulot-grid'}"></div>
        </div>

        <!-- O'RTA: CHEK RO'YXATI -->
        <div style="display:flex;flex-direction:column;border-right:1px solid #e2e8f0;background:white;overflow:hidden">
          <!-- Sarlavha -->
          <div style="padding:10px 14px;border-bottom:1px solid #e2e8f0;
            display:flex;justify-content:space-between;align-items:center;flex-shrink:0">
            <h3 id="chekSarlavha" style="font-size:14px;font-weight:700">
              <i class="fas fa-receipt" style="color:#2563eb"></i> Joriy chek
            </h3>
            <div style="display:flex;gap:6px">
              <button class="btn btn-warning btn-sm" onclick="qaytarishModal()" title="Qaytarish">
                <i class="fas fa-undo"></i>
              </button>
              <button class="btn btn-secondary btn-sm" onclick="chekTozala()" title="Tozalash">
                <i class="fas fa-times"></i>
              </button>
            </div>
          </div>
          <!-- Mahsulotlar ro'yxati -->
          <div class="chek-items" id="chekItems" style="flex:1;overflow-y:auto">
            <div class="empty-state" style="padding:30px">
              <i class="fas fa-shopping-cart"></i><p>Mahsulot tanlang</p>
            </div>
          </div>
          <!-- Jami -->
          <div style="padding:10px 14px;border-top:1px solid #e2e8f0;background:#f8fafc;flex-shrink:0">
            <div style="display:flex;justify-content:space-between;font-size:13px;margin-bottom:4px">
              <span style="color:#64748b">Jami:</span>
              <span id="chekJami" style="font-weight:600">0 so'm</span>
            </div>
            <div style="display:flex;justify-content:space-between;align-items:center;font-size:13px;margin-bottom:4px">
              <span style="color:#64748b">Chegirma:</span>
              <input type="number" id="chegirmaInput" min="0" placeholder="0"
                style="width:100px;text-align:right;border:1px solid #e2e8f0;
                border-radius:4px;padding:3px 6px;font-size:13px"
                oninput="chekHisoba();joriyChekSaqla()">
            </div>
            <div style="display:flex;justify-content:space-between;font-size:16px;font-weight:700;
              color:#2563eb;padding-top:6px;border-top:1px solid #e2e8f0">
              <span>To'lash:</span>
              <span id="chekYakuniy">0 so'm</span>
            </div>
          </div>
        </div>

        <!-- O'NG: MIJOZ + TO'LOV + YAKUNLASH -->
        <div style="display:flex;flex-direction:column;background:white;overflow-y:auto">

          <!-- MIJOZ -->
          <div style="padding:12px;border-bottom:1px solid #e2e8f0;flex-shrink:0">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
              <span style="font-size:13px;font-weight:600;color:#475569">
                <i class="fas fa-user" style="color:#2563eb"></i> Mijoz
              </span>
              <button class="btn btn-secondary btn-sm" onclick="mijozTanlash()">
                <i class="fas fa-search"></i> Tanlash
              </button>
            </div>
            <div id="tanlangan_mijoz_blok">
              <span style="color:#94a3b8;font-size:13px">— Mijozsiz sotuv —</span>
            </div>
          </div>

          <!-- TO'LOV USULLARI -->
          <div style="padding:12px;border-bottom:1px solid #e2e8f0;flex:1">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
              <span style="font-size:13px;font-weight:600;color:#475569">
                <i class="fas fa-credit-card" style="color:#2563eb"></i> To'lov usuli
              </span>
              <button class="btn btn-secondary btn-sm" onclick="tolovQatorQosh()"
                style="font-size:11px;padding:3px 8px">
                <i class="fas fa-plus"></i> Qo'sh
              </button>
            </div>
            <div id="tolovQatorlar"></div>
            <div style="display:flex;justify-content:space-between;font-size:13px;
              padding:6px 10px;background:#f0fdf4;border-radius:6px;margin-top:6px">
              <span style="color:#64748b">Qolgan:</span>
              <span id="tolovQolgan" style="font-weight:700;color:#ef4444">0 so'm</span>
            </div>
          </div>

          <!-- YAKUNLASH TUGMASI -->
          <div style="padding:12px;flex-shrink:0">
            <button class="btn btn-success"
              style="width:100%;padding:14px;font-size:15px;font-weight:700;
              border-radius:10px;letter-spacing:0.3px"
              onclick="sotuvYakunla()">
              <i class="fas fa-check-circle"></i> Sotishni tasdiqlash
            </button>
          </div>
        </div>

      </div>
    </div>`;

  try {
    const [mahsulotlar, kategoriyalar] = await Promise.all([
      apiGet('/mahsulotlar?kassa=1'), apiGet('/kategoriyalar')
    ]);
    kassaMahsulotlar = mahsulotlar;
    const sel = document.getElementById('kassaKat');
    kategoriyalar.forEach(k => sel.innerHTML += `<option value="${k.id}">${k.nomi}</option>`);

    // Joriy chekni yuklash
    const chek = joriyChekOl();
    if (chek) {
      chekMahsulotlar = [...(chek.mahsulotlar || [])];
      tanlangan_mijoz = chek.mijoz || null;
      tolovQatorlarData = [...(chek.tolovlar || [{ tur: 'naqd', summa: 0 }])];
    } else {
      chekMahsulotlar = [];
      tanlangan_mijoz = null;
    }

    chekTablarYanila();
    kassaMahsulotKorsatish(kassaMahsulotlar);
    chekKorsatish();
    setTimeout(() => {
      if (chek?.chegirma) {
        const ch = document.getElementById('chegirmaInput');
        if (ch) ch.value = chek.chegirma;
      }
      if (tanlangan_mijoz) mijozBlokniyaJila();
      tolovQatorlarniBoshlash();
    }, 0);
  } catch(e) { toast(e.message, 'error'); }
}
// ===== ARALASH TO'LOV TIZIMI =====
let tolovQatorlarData = [];

function tolovQatorlarniBoshlash() {
  const soz = sozlamalarniOl();
  // Bitta standart qator bilan boshlash
  tolovQatorlarData = [{ tur: soz.savdoTolovDefault || 'naqd', summa: 0 }];
  tolovQatorlarKorsatish();
}

function tolovQatorKorsatishOptions(tanlangan) {
  const soz = sozlamalarniOl();
  let opts = '';
  if (soz.tolovNaqd !== false) opts += `<option value="naqd" ${tanlangan==='naqd'?'selected':''}>💵 Naqd</option>`;
  if (soz.tolovKarta !== false) opts += `<option value="karta" ${tanlangan==='karta'?'selected':''}>💳 Karta</option>`;
  if (soz.tolovQarz !== false) opts += `<option value="qarz" ${tanlangan==='qarz'?'selected':''}>📋 Qarz</option>`;
  if (soz.tolovBankTransfer) opts += `<option value="bank" ${tanlangan==='bank'?'selected':''}>🏦 Bank</option>`;
  return opts || `<option value="naqd" ${tanlangan==='naqd'?'selected':''}>💵 Naqd</option>`;
}

function tolovQatorlarKorsatish() {
  const div = document.getElementById('tolovQatorlar');
  if (!div) return;
  div.innerHTML = tolovQatorlarData.map((q, i) => `
    <div style="display:flex;align-items:center;gap:6px;margin-bottom:6px">
      <select onchange="tolovTurOzgartir(${i},this.value)"
        style="flex:1;border:1px solid #e2e8f0;border-radius:6px;padding:5px 8px;font-size:13px;background:white">
        ${tolovQatorKorsatishOptions(q.tur)}
      </select>
      <input type="number" min="0" placeholder="Summa"
        value="${q.summa || ''}"
        oninput="tolovSummaOzgartir(${i},this.value)"
        style="width:110px;border:1px solid #e2e8f0;border-radius:6px;padding:5px 8px;font-size:13px">
      <button onclick="tolovQatorToldir(${i})" title="Qolganini to'ldirish"
        style="border:none;background:#dbeafe;color:#2563eb;border-radius:6px;padding:5px 8px;cursor:pointer;font-size:12px;white-space:nowrap">
        ↓ Qolgan
      </button>
      ${tolovQatorlarData.length > 1 ? `
        <button onclick="tolovQatorOchir(${i})"
          style="border:none;background:#fee2e2;color:#ef4444;border-radius:6px;padding:5px 8px;cursor:pointer">
          <i class="fas fa-times"></i>
        </button>` : ''}
    </div>`).join('');

  tolovQolganniHisoba();
}

function tolovTurOzgartir(i, tur) {
  tolovQatorlarData[i].tur = tur;
  // Qarz tanlanganda mijoz tekshiruvi (real-time ogohlantirish)
  if (tur === 'qarz' && !tanlangan_mijoz) {
    toast('⚠️ Qarzga sotish uchun avval mijoz tanlang!', 'warning');
  }
  kassaXotirasiniSaqla();
  tolovQolganniHisoba();
}

function tolovSummaOzgartir(i, val) {
  tolovQatorlarData[i].summa = parseFloat(val) || 0;
  kassaXotirasiniSaqla();
  tolovQolganniHisoba();
}

function tolovQatorToldir(i) {
  // Qolgan summani shu qatorga to'ldirish
  const yakuniy = parseFloat(document.getElementById('chekYakuniy')?.textContent?.replace(/[^\d]/g,'')) || 0;
  const boshqalar = tolovQatorlarData.reduce((s, q, idx) => idx !== i ? s + (q.summa || 0) : s, 0);
  const qolgan = Math.max(0, yakuniy - boshqalar);
  tolovQatorlarData[i].summa = qolgan;
  kassaXotirasiniSaqla();
  tolovQatorlarKorsatish();
}

function tolovQatorQosh() {
  tolovQatorlarData.push({ tur: 'naqd', summa: 0 });
  tolovQatorlarKorsatish();
}

function tolovQatorOchir(i) {
  tolovQatorlarData.splice(i, 1);
  tolovQatorlarKorsatish();
}

function tolovQolganniHisoba() {
  const yakuniyEl = document.getElementById('chekYakuniy');
  if (!yakuniyEl) return;
  const yakuniy = chekMahsulotlar.reduce((s,m) => s + m.narxi*m.miqdor, 0)
    - (parseFloat(document.getElementById('chegirmaInput')?.value) || 0);
  const tolovJami = tolovQatorlarData.reduce((s, q) => s + (q.summa || 0), 0);
  const qolgan = Math.max(0, yakuniy - tolovJami);
  const qolganEl = document.getElementById('tolovQolgan');
  if (qolganEl) {
    qolganEl.textContent = formatSum(qolgan);
    qolganEl.style.color = qolgan === 0 ? '#10b981' : '#ef4444';
  }
}

function tolovQatorlarniYangilash() {
  // chekHisoba chaqirilganda to'lov qolganini ham yangilash
  tolovQolganniHisoba();
}

let _kassaJadvalKorinish = false;
function kassaKorinishAlmash() {
  _kassaJadvalKorinish = !_kassaJadvalKorinish;
  const grid = document.getElementById('kassaMahsulotGrid');
  if (_kassaJadvalKorinish) {
    grid.className = '';
    kassaMahsulotJadvalKorsatish(kassaMahsulotlar);
  } else {
    grid.className = 'mahsulot-grid';
    kassaMahsulotKorsatish(kassaMahsulotlar);
  }
}

function mijozBlokniyaJila() {
  if (!tanlangan_mijoz) return;
  const blok = document.getElementById('tanlangan_mijoz_blok');
  if (!blok) return;
  blok.innerHTML = `
    <div style="display:flex;align-items:center;gap:8px">
      <div style="width:28px;height:28px;border-radius:50%;background:#dbeafe;display:flex;align-items:center;
        justify-content:center;color:#2563eb;font-weight:700;font-size:12px">
        ${tanlangan_mijoz.ism[0].toUpperCase()}
      </div>
      <div style="flex:1">
        <div style="font-weight:600;font-size:13px">${tanlangan_mijoz.toliqIsm}</div>
        ${tanlangan_mijoz.telefon ? `<div style="font-size:11px;color:#64748b">${tanlangan_mijoz.telefon}</div>` : ''}
      </div>
      <button class="btn btn-secondary btn-sm btn-icon" onclick="mijozniBekor()"><i class="fas fa-times"></i></button>
    </div>`;
}

async function mijozTanlash() {
  const mijozlar = await apiGet('/mijozlar');
  window._kassaMijozlar = mijozlar;
  modalOch('Mijoz tanlash', `
    <div style="display:flex;gap:8px;margin-bottom:12px">
      <input type="text" id="mijozQidiruv" class="search-input" placeholder="🔍 Mijoz qidirish..."
        oninput="mijozlarFilter()" style="flex:1">
      <button class="btn btn-primary btn-sm" onclick="kassadanMijozQosh()" title="Yangi mijoz qo'shish">
        <i class="fas fa-user-plus"></i> Yangi
      </button>
    </div>
    <div id="mijozlarRoyxat" style="max-height:320px;overflow-y:auto">${mijozlarHtml(mijozlar)}</div>
    <div style="margin-top:12px;padding-top:12px;border-top:1px solid #e2e8f0">
      <button class="btn btn-secondary" style="width:100%" onclick="mijozniBekor()">
        <i class="fas fa-times"></i> Mijozsiz davom etish
      </button>
    </div>`);
}

function mijozlarHtml(royxat) {
  if (!royxat.length) return '<div class="empty-state"><i class="fas fa-users"></i><p>Mijoz topilmadi</p></div>';
  return royxat.map(m => `
    <div onclick="mijozniTanla(${m.id},'${(m.ism+' '+(m.familiya||'')).trim().replace(/'/g,"\\'")}',
      '${(m.telefon||'').replace(/'/g,"\\'")}','${(m.familiya||'').replace(/'/g,"\\'")}',
      '${m.ism.replace(/'/g,"\\'")}' )"
      style="padding:10px 12px;border:1px solid #e2e8f0;border-radius:8px;margin-bottom:6px;
        cursor:pointer;display:flex;align-items:center;gap:10px"
      onmouseover="this.style.background='#f0f9ff'" onmouseout="this.style.background='white'">
      <div style="width:36px;height:36px;border-radius:50%;background:#dbeafe;display:flex;align-items:center;
        justify-content:center;color:#2563eb;font-weight:700;flex-shrink:0">
        ${m.ism[0].toUpperCase()}
      </div>
      <div style="flex:1">
        <div style="font-weight:600;font-size:14px">${m.ism} ${m.familiya||''}</div>
        <div style="font-size:12px;color:#64748b">${m.telefon||'Telefon yo\'q'}
          ${m.qarz>0 ? `<span style="color:#ef4444;margin-left:8px">Qarz: ${formatSum(m.qarz)}</span>` : ''}
        </div>
      </div>
      <i class="fas fa-chevron-right" style="color:#94a3b8"></i>
    </div>`).join('');
}

function mijozlarFilter() {
  const q = document.getElementById('mijozQidiruv').value.toLowerCase();
  const f = (window._kassaMijozlar||[]).filter(m =>
    (m.ism+' '+(m.familiya||'')).toLowerCase().includes(q) || (m.telefon||'').includes(q));
  document.getElementById('mijozlarRoyxat').innerHTML = mijozlarHtml(f);
}

// Kassadan tezda yangi mijoz qo'shish
function kassadanMijozQosh() {
  const qidiruv = document.getElementById('mijozQidiruv')?.value || '';
  const kontent = `
    <form onsubmit="kassadanMijozSaqla(event)">
      <div class="form-row">
        <div class="form-group">
          <label>Ismi *</label>
          <input type="text" name="ism" required value="${qidiruv}" placeholder="Ismi" autofocus>
        </div>
        <div class="form-group">
          <label>Familiyasi</label>
          <input type="text" name="familiya" placeholder="Familiyasi">
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label>Telefon</label>
          <input type="text" name="telefon" placeholder="+998 90 123 45 67">
        </div>
        <div class="form-group">
          <label>Manzil</label>
          <input type="text" name="manzil" placeholder="Shahar, ko'cha">
        </div>
      </div>
      <div class="modal-footer" style="padding:0;margin-top:10px">
        <button type="button" class="btn btn-secondary" onclick="mijozTanlash()">
          <i class="fas fa-arrow-left"></i> Orqaga
        </button>
        <button type="submit" class="btn btn-primary">
          <i class="fas fa-user-plus"></i> Qo'shish va tanlash
        </button>
      </div>
    </form>`;
  modalOch('Yangi mijoz qo\'shish', kontent);
}

async function kassadanMijozSaqla(e) {
  e.preventDefault();
  const form = e.target;
  const data = {
    ism: form.ism.value.trim(),
    familiya: form.familiya.value.trim(),
    telefon: form.telefon.value.trim(),
    manzil: form.manzil.value.trim(),
  };
  try {
    const r = await apiPost('/mijozlar', data);
    toast('✅ Mijoz qo\'shildi!', 'success');
    // Yangi qo'shilgan mijozni avtomatik tanlash
    const toliqIsm = (data.ism + ' ' + data.familiya).trim();
    mijozniTanla(r.id, toliqIsm, data.telefon, data.familiya, data.ism);
  } catch (e) { toast(e.message, 'error'); }
}

function mijozniTanla(id, toliqIsm, telefon, familiya, ism) {
  // Boshqa cheklardan bu mijozni olib tashlash
  cheklar.forEach(c => {
    if (c.id !== joriyChekId && c.mijoz?.id === id) {
      c.mijoz = null;
    }
  });

  tanlangan_mijoz = {id, ism, familiya, telefon, toliqIsm};
  // Joriy chekga ham saqlash
  const chek = joriyChekOl();
  if (chek) chek.mijoz = tanlangan_mijoz;

  mijozBlokniyaJila();
  kassaXotirasiniSaqla();
  chekTablarYanila();
  modalYop();
}

function mijozniBekor() {
  tanlangan_mijoz = null;
  const blok = document.getElementById('tanlangan_mijoz_blok');
  if (blok) blok.innerHTML = '<span style="color:#94a3b8;font-size:13px">— Mijozsiz sotuv —</span>';
  kassaXotirasiniSaqla();
  modalYop();
}


function kassaMahsulotFilter() {
  const q = document.getElementById('kassaQidiruv').value.toLowerCase();
  const kat = document.getElementById('kassaKat').value;
  const f = kassaMahsulotlar.filter(m => {
    return (m.nomi.toLowerCase().includes(q)
        || (m.shtrix_kod||'').toLowerCase().includes(q)
        || (m.sku||'').toLowerCase().includes(q))
      && (!kat || m.kategoriya_id == kat);
  });
  _kassaJadvalKorinish ? kassaMahsulotJadvalKorsatish(f) : kassaMahsulotKorsatish(f);
}

function chekMahsulotlar_foydaliNarx(m) {
  // chegirma_foiz yoki chegirma_sum hisobga oladi
  const chegirmaFoiz = m.chegirma_foiz || 0;
  const chegirmaSom = m.chegirma_som || 0;
  let narx = m.asl_narx || m.narxi;
  if (chegirmaFoiz > 0) narx = narx * (1 - chegirmaFoiz / 100);
  else if (chegirmaSom > 0) narx = Math.max(0, narx - chegirmaSom);
  return Math.round(narx);
}

function kassaMahsulotKorsatish(royxat) {
  const grid = document.getElementById('kassaMahsulotGrid');
  if (!royxat.length) { grid.innerHTML = '<div class="empty-state"><i class="fas fa-search"></i><p>Topilmadi</p></div>'; return; }
  grid.innerHTML = royxat.map(m => `
    <div class="mahsulot-karta ${m.miqdor<=0?'kam':''}" onclick="${(m.miqdor>0||m.minus_sotish)?`chekGaQosh(${m.id})`:''}">
      <!-- RASM -->
      <div style="width:100%;height:100px;border-radius:8px;overflow:hidden;margin-bottom:8px;
        background:#f1f5f9;display:flex;align-items:center;justify-content:center;flex-shrink:0">
        ${m.rasm
          ? `<img src="${m.rasm}" style="width:100%;height:100%;object-fit:cover;cursor:zoom-in"
              onclick="event.stopPropagation();rasmKattaKorsatish(this.src)" title="Kattalashtirish">`
          : `<i class="fas fa-box fa-2x" style="color:#cbd5e1"></i>`}
      </div>
      <!-- KATEGORIYA -->
      ${m.kategoriya_nomi ? `<div style="font-size:10px;color:#94a3b8;margin-bottom:2px;text-transform:uppercase;letter-spacing:0.5px">${m.kategoriya_nomi}</div>` : ''}
      <!-- NOMI -->
      <h4 style="font-size:13px;font-weight:600;line-height:1.3;margin-bottom:4px">${m.nomi}</h4>
      ${m.sku ? `<div style="font-size:10px;color:#8b5cf6;background:#ede9fe;display:inline-block;padding:1px 6px;border-radius:4px;margin-bottom:4px;font-family:monospace">SKU: ${m.sku}</div>` : ''}
      <!-- NARXI -->
      <div class="narxi" style="font-size:15px;font-weight:700;color:#2563eb">${formatSum(m.sotish_narxi)}</div>
      <!-- MIQDOR -->
      <div style="display:flex;justify-content:space-between;align-items:center;margin-top:4px">
        <div class="miqdor" style="font-size:11px;color:#64748b">
          ${m.miqdor > 0
            ? `<span style="color:#10b981">✓</span> ${m.miqdor} ${m.birlik}`
            : m.minus_sotish
              ? `<span style="color:#f97316">⊖ ${m.miqdor} (minusga)</span>`
              : `<span style="color:#ef4444">⚠ Tugagan</span>`}
        </div>
        ${(m.miqdor > 0 || m.minus_sotish)
          ? `<div style="width:24px;height:24px;border-radius:50%;background:${m.miqdor>0?'#2563eb':'#f97316'};
              display:flex;align-items:center;justify-content:center">
              <i class="fas fa-plus" style="color:white;font-size:10px"></i>
            </div>`
          : ''}
      </div>
    </div>`).join('');
}

function kassaMahsulotJadvalKorsatish(royxat) {
  const grid = document.getElementById('kassaMahsulotGrid');
  if (!royxat.length) { grid.innerHTML = '<div class="empty-state"><i class="fas fa-search"></i><p>Topilmadi</p></div>'; return; }
  grid.innerHTML = `<div class="table-wrapper"><table>
    <thead><tr><th>Rasm</th><th>Nomi</th><th>Narxi</th><th>Mavjud</th><th></th></tr></thead>
    <tbody>${royxat.map(m => `
      <tr style="${(m.miqdor>0||m.minus_sotish)?'cursor:pointer':'opacity:0.6'}"
        ${(m.miqdor>0||m.minus_sotish)?`onclick="chekGaQosh(${m.id})"
          onmouseover="this.style.background='#f0f9ff'"
          onmouseout="this.style.background=''"`:''}>
        <td>
          <div style="width:40px;height:40px;border-radius:6px;overflow:hidden;
            background:#f1f5f9;display:flex;align-items:center;justify-content:center">
            ${m.rasm
              ? `<img src="${m.rasm}" style="width:100%;height:100%;object-fit:cover;cursor:zoom-in"
                  onclick="event.stopPropagation();rasmKattaKorsatish(this.src)">`
              : `<i class="fas fa-box" style="color:#cbd5e1;font-size:16px"></i>`}
          </div>
        </td>
        <td>
          <b style="font-size:13px">${m.nomi}</b>
          ${m.kategoriya_nomi ? `<br><small style="color:#94a3b8">${m.kategoriya_nomi}</small>` : ''}
        </td>
        <td><b style="color:#2563eb">${formatSum(m.sotish_narxi)}</b></td>
        <td>
          ${m.miqdor > 0
            ? `<span style="color:#10b981;font-weight:600">${m.miqdor} ${m.birlik}</span>`
            : m.minus_sotish
              ? `<span style="color:#f97316;font-size:12px">${m.miqdor} (minusga)</span>`
              : `<span style="color:#ef4444;font-size:12px">Tugagan</span>`}
        </td>
        <td>
          <button class="btn btn-primary btn-sm btn-icon" ${(m.miqdor<=0&&!m.minus_sotish)?'disabled':''}>
            <i class="fas fa-plus"></i>
          </button>
        </td>
      </tr>`).join('')}
    </tbody></table></div>`;
}

function chekGaQosh(mahsulot_id) {
  const m = kassaMahsulotlar.find(x => x.id == mahsulot_id);
  if (!m) return;
  // minus_sotish=1 bo'lsa qoldiq tugagan bo'lsa ham sotish mumkin
  if (m.miqdor <= 0 && !m.minus_sotish) { toast('Bu mahsulot omborda tugagan!', 'warning'); return; }
  const mavjud = chekMahsulotlar.find(x => x.mahsulot_id == mahsulot_id);
  if (mavjud) {
    if (mavjud.miqdor >= m.miqdor && !m.minus_sotish) { toast('Omborda yetarli emas!', 'warning'); return; }
    mavjud.miqdor += 1;
  } else {
    chekMahsulotlar.push({mahsulot_id:m.id, nomi:m.nomi, narxi:m.sotish_narxi,
      asl_narx:m.sotish_narxi, miqdor:1, birlik:m.birlik,
      max:m.minus_sotish ? 999999 : m.miqdor, rasm:m.rasm||null,
      chegirma_foiz:0, chegirma_som:0});
  }
  chekKorsatish();
  kassaXotirasiniSaqla();
  joriyChekSaqla();
  chekTablarYanila();
}

function chekKorsatish() {
  const div = document.getElementById('chekItems');
  if (!div) return;
  if (!chekMahsulotlar.length) {
    div.innerHTML = '<div class="empty-state" style="padding:30px"><i class="fas fa-shopping-cart"></i><p>Mahsulot tanlang</p></div>';
    chekHisoba(); return;
  }
  div.innerHTML = chekMahsulotlar.map((m,i) => {
    const chegirmaFoiz = m.chegirma_foiz || 0;
    const chegirmaSom = m.chegirma_som || 0;
    let chegirmaNarx = m.asl_narx || m.narxi;
    if (chegirmaFoiz > 0) chegirmaNarx = chegirmaNarx * (1 - chegirmaFoiz/100);
    else if (chegirmaSom > 0) chegirmaNarx = Math.max(0, chegirmaNarx - chegirmaSom);
    chegirmaNarx = Math.round(chegirmaNarx);
    const jami = chegirmaNarx * m.miqdor;
    return `
    <div class="chek-item" style="flex-direction:column;align-items:stretch;gap:6px">
      <div style="display:flex;align-items:center;gap:8px">
        ${m.rasm ? `<img src="${m.rasm}" style="width:32px;height:32px;object-fit:cover;border-radius:4px;flex-shrink:0">` : ''}
        <div style="flex:1">
          <div class="chek-item-nomi">${m.nomi}</div>
          <div class="chek-item-narxi">
            ${chegirmaFoiz>0||chegirmaSom>0
              ? `<s style="color:#94a3b8">${formatSum(m.asl_narx||m.narxi)}</s>
                 <b style="color:#10b981">${formatSum(chegirmaNarx)}</b>`
              : formatSum(m.narxi)} / ${m.birlik}
          </div>
        </div>
        <div class="chek-item-miqdor">
          <button onclick="chekMiqdorOzgartir(${i},-1)">−</button>
          <input type="number" value="${m.miqdor}" min="0.01" max="${m.max}" step="0.01"
            onchange="chekMiqdorSet(${i},this.value)" style="width:50px">
          <button onclick="chekMiqdorOzgartir(${i},1)">+</button>
        </div>
        <div class="chek-item-jami" style="min-width:80px;text-align:right">${formatSum(jami)}</div>
        <button class="btn btn-danger btn-icon btn-sm" onclick="chekDanOchir(${i})"><i class="fas fa-times"></i></button>
      </div>
      <!-- Alohida chegirma -->
      <div style="display:flex;align-items:center;gap:6px;padding:4px 8px;background:#f8fafc;border-radius:6px;font-size:12px">
        <span style="color:#64748b;min-width:60px">Chegirma:</span>
        <input type="number" placeholder="%" min="0" max="100" value="${chegirmaFoiz||''}"
          style="width:55px;border:1px solid #e2e8f0;border-radius:4px;padding:3px 6px;font-size:12px"
          oninput="mahsulotCheqirmaFoizOzgartir(${i},this.value)"
          title="Foizda chegirma">
        <span style="color:#94a3b8">%</span>
        <span style="color:#94a3b8;margin:0 2px">yoki</span>
        <input type="number" placeholder="so'm" min="0" value="${chegirmaSom||''}"
          style="width:80px;border:1px solid #e2e8f0;border-radius:4px;padding:3px 6px;font-size:12px"
          oninput="mahsulotCheqirmaSomOzgartir(${i},this.value)"
          title="So'mda chegirma">
        <span style="color:#94a3b8">so'm</span>
        ${chegirmaFoiz>0||chegirmaSom>0
          ? `<span style="color:#10b981;margin-left:4px">-${chegirmaFoiz>0?chegirmaFoiz+'%':formatSum(chegirmaSom)}</span>`
          : ''}
      </div>
    </div>`}).join('');
  chekHisoba();
}

function mahsulotCheqirmaFoizOzgartir(i, val) {
  const foiz = parseFloat(val) || 0;
  if (!chekMahsulotlar[i]) return;
  chekMahsulotlar[i].chegirma_foiz = foiz;
  chekMahsulotlar[i].chegirma_som = 0;
  const aslNarx = chekMahsulotlar[i].asl_narx || chekMahsulotlar[i].narxi;
  chekMahsulotlar[i].asl_narx = aslNarx;
  chekMahsulotlar[i].narxi = foiz > 0 ? Math.round(aslNarx * (1 - foiz/100)) : aslNarx;
  kassaXotirasiniSaqla();
  chekHisoba();
}

function mahsulotCheqirmaSomOzgartir(i, val) {
  const som = parseFloat(val) || 0;
  if (!chekMahsulotlar[i]) return;
  chekMahsulotlar[i].chegirma_som = som;
  chekMahsulotlar[i].chegirma_foiz = 0;
  const aslNarx = chekMahsulotlar[i].asl_narx || chekMahsulotlar[i].narxi;
  chekMahsulotlar[i].asl_narx = aslNarx;
  chekMahsulotlar[i].narxi = som > 0 ? Math.max(0, aslNarx - som) : aslNarx;
  kassaXotirasiniSaqla();
  chekHisoba();
}

function chekMiqdorOzgartir(i,delta) {
  const m=chekMahsulotlar[i], yangi=Math.round((m.miqdor+delta)*100)/100;
  if(yangi<=0){chekDanOchir(i);return;}
  if(yangi>m.max){toast('Omborda yetarli emas!','warning');return;}
  chekMahsulotlar[i].miqdor=yangi; chekKorsatish(); kassaXotirasiniSaqla();
}
function chekMiqdorSet(i,q) {
  const val=parseFloat(q);
  if(!val||val<=0){chekDanOchir(i);return;}
  if(val>chekMahsulotlar[i].max){toast('Omborda yetarli emas!','warning');return;}
  chekMahsulotlar[i].miqdor=val; chekKorsatish(); kassaXotirasiniSaqla();
}
function chekDanOchir(i) { chekMahsulotlar.splice(i,1); chekKorsatish(); kassaXotirasiniSaqla(); }

function chekTozala() {
  chekMahsulotlar=[]; tanlangan_mijoz=null;
  chekKorsatish();
  const ch=document.getElementById('chegirmaInput'); if(ch) ch.value='';
  const tb=document.getElementById('tanlangan_mijoz_blok');
  if(tb) tb.innerHTML='<span style="color:#94a3b8;font-size:13px">— Mijozsiz sotuv —</span>';
  kassaXotirasiniTozala();
  tolovQatorlarniBoshlash();
}

function chekHisoba() {
  const jami=chekMahsulotlar.reduce((s,m)=>s+m.narxi*m.miqdor,0);
  const chegirma=parseFloat(document.getElementById('chegirmaInput')?.value)||0;
  const yakuniy=Math.max(0,jami-chegirma);
  const jEl=document.getElementById('chekJami'); if(jEl) jEl.textContent=formatSum(jami);
  const yEl=document.getElementById('chekYakuniy'); if(yEl) yEl.textContent=formatSum(yakuniy);
  // Div tayyor bo'lsa to'lov qolganini yangilaymiz
  if(document.getElementById('tolovQolgan')) tolovQolganniHisoba();
}


async function sotuvYakunla() {
  if (!chekMahsulotlar.length) { toast('Chek bo\'sh!', 'warning'); return; }

  // QARZ TEKSHIRUVI — mijoz majburiy
  const qarzBor = tolovQatorlarData.some(q => q.tur === 'qarz');
  if (qarzBor && !tanlangan_mijoz) {
    toast('⚠️ Qarzga sotish uchun avval mijoz tanlang!', 'warning');
    setTimeout(() => mijozTanlash(), 300);
    return;
  }

  // Qarz bo'lsa muddat so'rash
  if (qarzBor && tanlangan_mijoz && typeof qarzMuddatModal === 'function') {
    qarzMuddatModal(async (muddat, izoh) => {
      await sotuvYuborish(muddat, izoh);
    });
    return;
  }

  await sotuvYuborish('', '');
}

async function sotuvYuborish(qarzMuddat, qarzIzoh) {

  const chegirma = parseFloat(document.getElementById('chegirmaInput').value) || 0;
  const jami = chekMahsulotlar.reduce((s,m) => s + m.narxi*m.miqdor, 0);
  const yakuniy = Math.max(0, jami - chegirma);

  // To'lov turlarini tayyorlash
  const tolovlar = tolovQatorlarData.filter(q => q.summa > 0);
  if (!tolovlar.length) {
    // Bitta ham summa kiritilmagan — yakuniy summani birinchi turga qo'yamiz
    tolovQatorlarData[0].summa = yakuniy;
    tolovQatorlarKorsatish();
  }

  // Asosiy to'lov turi (eng katta summali)
  const asosiyTolov = tolovQatorlarData.reduce((max, q) => q.summa > max.summa ? q : max, tolovQatorlarData[0]);
  const tolov_turi = asosiyTolov.tur;

  const data = {
    kassir_id: joriyFoydalanuvchi.id,
    mahsulotlar: chekMahsulotlar.map(m => ({mahsulot_id:m.mahsulot_id, miqdor:m.miqdor, narxi:m.narxi})),
    chegirma,
    tolov_turi,
    tolov_tafsilotlari: tolovQatorlarData.filter(q => q.summa > 0),
    mijoz_id: tanlangan_mijoz ? tanlangan_mijoz.id : null,
    mijoz_ismi: tanlangan_mijoz ? tanlangan_mijoz.toliqIsm : '',
    qarz_muddat: qarzMuddat || null,
    qarz_izoh: qarzIzoh || ''
  };

  try {
    const r = await apiPost('/sotuvlar', data);
    toast(`✅ Sotuv: ${r.chek_raqam}`, 'success');
    const soz = sozlamalarniOl();
    const snap = {
      mahsulotlar:[...chekMahsulotlar],
      mijoz: tanlangan_mijoz,
      chegirma,
      tolovlar: [...tolovQatorlarData]
    };
    kassaXotirasiniTozala();
    chekTozala();
    // Joriy chekni ham tozalash
    const chekObj = joriyChekOl();
    if (chekObj) {
      chekObj.mahsulotlar = [];
      chekObj.mijoz = null;
      chekObj.chegirma = 0;
      chekObj.tolovlar = [{ tur: 'naqd', summa: 0 }];
    }
    chekTablarYanila();
    kassaMahsulotlar = await apiGet('/mahsulotlar?kassa=1');
    kassaMahsulotKorsatish(kassaMahsulotlar);
    tolovQatorlarniBoshlash();
    if (soz.avtomatChek !== false) chekChidir(r, snap);
  } catch(e) { toast(e.message, 'error'); }
}

function chekChidir(sotuv, snap) {
  const soz = sozlamalarniOl();
  const mijozNomi = snap.mijoz ? snap.mijoz.toliqIsm : 'Mijozsiz';
  const tolovlar = snap.tolovlar || [{tur: sotuv.tolov_turi, summa: sotuv.jami_summa}];
  const tolovHtml = tolovlar.filter(t => t.summa > 0).map(t => `
    <div class="chek-print-qator">
      <span>${t.tur==='naqd'?'💵 Naqd':t.tur==='karta'?'💳 Karta':t.tur==='qarz'?'📋 Qarz':'🏦 Bank'}:</span>
      <span>${formatSum(t.summa)}</span>
    </div>`).join('');

  const html = `
    <div style="font-family:'Courier New',monospace;font-size:12px;padding:8px;width:100%">
      <h3 style="text-align:center;font-size:14px;margin-bottom:4px">${soz.chek_dokoni_nomi||"Qurilish Do'koni"}</h3>
      ${soz.chek_manzil?`<div style="text-align:center;font-size:10px">${soz.chek_manzil}</div>`:''}
      ${soz.chek_telefon?`<div style="text-align:center;font-size:10px">Tel: ${soz.chek_telefon}</div>`:''}
      <div style="border-top:1px dashed #000;border-bottom:1px dashed #000;padding:3px 0;margin:4px 0;text-align:center">Sotuv cheki</div>
      <div style="display:flex;justify-content:space-between"><span>Chek:</span><span>${sotuv.chek_raqam}</span></div>
      <div style="display:flex;justify-content:space-between"><span>Kassir:</span><span>${joriyFoydalanuvchi.ism}</span></div>
      <div style="display:flex;justify-content:space-between"><span>Mijoz:</span><span>${mijozNomi}</span></div>
      <div style="display:flex;justify-content:space-between"><span>Sana:</span><span>${new Date().toLocaleString('uz-UZ')}</span></div>
      <div style="border-top:1px dashed #000;margin:4px 0"></div>
      ${snap.mahsulotlar.map(m => {
        const chegirmaFoiz = m.chegirma_foiz || 0;
        const chegirmaSom = m.chegirma_som || 0;
        const chegirmaMatn = chegirmaFoiz > 0 ? ` (-${chegirmaFoiz}%)` : chegirmaSom > 0 ? ` (-${formatSum(chegirmaSom)})` : '';
        return `
        <div>${m.nomi}</div>
        <div style="display:flex;justify-content:space-between">
          <span>${m.miqdor} x ${formatSum(m.narxi)}${chegirmaMatn}</span>
          <span>${formatSum(m.narxi*m.miqdor)}</span>
        </div>`;
      }).join('')}
      <div style="border-top:1px dashed #000;margin:4px 0"></div>
      ${snap.chegirma>0?`<div style="display:flex;justify-content:space-between"><span>Chegirma:</span><span>-${formatSum(snap.chegirma)}</span></div>`:''}
      <div style="display:flex;justify-content:space-between;font-weight:bold;font-size:14px">
        <span>JAMI:</span><span>${formatSum(sotuv.jami_summa)}</span>
      </div>
      <div style="border-top:1px dashed #000;margin:4px 0"></div>
      ${tolovHtml}
      <div style="border-top:1px dashed #000;margin:4px 0"></div>
      <div style="text-align:center;margin-top:6px;font-size:10px">${soz.chek_xabar||"Rahmat! Yana keling! 🙏"}</div>
    </div>`;

  // printer.js orqali chiqarish
  if (typeof chekChiqar === 'function') {
    chekChiqar(html, 'Sotuv cheki');
  } else {
    // Fallback: modal orqali
    modalOch('Sotuv cheki', `
      ${html}
      <div class="modal-footer" style="padding:0;margin-top:16px">
        <button class="btn btn-secondary" onclick="modalYop()">Yopish</button>
        <button class="btn btn-primary" onclick="window.print()">🖨️ Chop etish</button>
      </div>`);
  }
}

// ===== QAYTARISH MODAL (task 3) =====
async function qaytarishModal() {
  const mahsulotlar = await apiGet('/mahsulotlar');
  const kontent = `
    <div>
      <p style="color:#64748b;font-size:13px;margin-bottom:12px">
        Qaytariladigan mahsulotlarni tanlang va miqdorini kiriting
      </p>
      <div class="form-group">
        <label>Sabab</label>
        <input type="text" id="qaytarish_sabab" class="search-input" style="width:100%"
          placeholder="Masalan: Sifatsiz, noto'g'ri mahsulot...">
      </div>
      <div id="qaytarishMahsulotlar" style="max-height:280px;overflow-y:auto;margin-bottom:12px">
        ${mahsulotlar.filter(m=>m.miqdor>=0).map(m=>`
          <div style="display:flex;align-items:center;gap:8px;padding:6px 0;border-bottom:1px solid #f1f5f9">
            <input type="checkbox" id="qtr_${m.id}" onchange="qaytarishChekBox(${m.id})">
            <label for="qtr_${m.id}" style="flex:1;font-size:13px;cursor:pointer">${m.nomi} <span style="color:#64748b">(${m.birlik})</span></label>
            <input type="number" id="qtr_m_${m.id}" min="0.01" step="0.01" placeholder="0"
              style="width:70px;border:1px solid #e2e8f0;border-radius:4px;padding:4px;display:none">
            <span style="font-size:12px;color:#2563eb;min-width:90px;text-align:right">${formatSum(m.sotish_narxi)}</span>
          </div>`).join('')}
      </div>
      <div style="padding:10px;background:#f8fafc;border-radius:8px;margin-bottom:12px">
        <b>Qaytarish summasi: <span id="qaytarishJami" style="color:#ef4444">0 so'm</span></b>
      </div>
      <div class="modal-footer" style="padding:0">
        <button class="btn btn-secondary" onclick="modalYop()">Bekor</button>
        <button class="btn btn-warning" onclick="qaytarishYakunla()">
          <i class="fas fa-undo"></i> Qaytarishni tasdiqlash
        </button>
      </div>
    </div>`;
  modalOch('Mahsulot qaytarish', kontent);
  window._qaytarishMahsulotlar = mahsulotlar;
}

function qaytarishChekBox(id) {
  const inp = document.getElementById(`qtr_m_${id}`);
  const chk = document.getElementById(`qtr_${id}`);
  inp.style.display = chk.checked ? 'block' : 'none';
  qaytarishJamiHisoba();
}

function qaytarishJamiHisoba() {
  let jami = 0;
  (window._qaytarishMahsulotlar||[]).forEach(m => {
    const chk = document.getElementById(`qtr_${m.id}`);
    const inp = document.getElementById(`qtr_m_${m.id}`);
    if (chk && chk.checked && inp) jami += (parseFloat(inp.value)||0) * m.sotish_narxi;
  });
  const el = document.getElementById('qaytarishJami');
  if (el) el.textContent = formatSum(jami);
}

async function qaytarishYakunla() {
  const mahsulotlar = [];
  (window._qaytarishMahsulotlar||[]).forEach(m => {
    const chk = document.getElementById(`qtr_${m.id}`);
    const inp = document.getElementById(`qtr_m_${m.id}`);
    if (chk && chk.checked && inp && parseFloat(inp.value)>0) {
      mahsulotlar.push({mahsulot_id:m.id, miqdor:parseFloat(inp.value), narxi:m.sotish_narxi});
    }
  });
  if (!mahsulotlar.length) { toast('Mahsulot tanlanmagan!', 'warning'); return; }
  const sabab = document.getElementById('qaytarish_sabab').value;
  try {
    const r = await apiPost('/qaytarishlar', {
      kassir_id: joriyFoydalanuvchi.id,
      mahsulotlar, sabab,
      mijoz_id: tanlangan_mijoz?.id||null,
      mijoz_ismi: tanlangan_mijoz?.toliqIsm||''
    });
    toast(`✅ Qaytarish qabul qilindi! ${r.chek_raqam}`, 'success');
    modalYop();
    kassaMahsulotlar = await apiGet('/mahsulotlar');
    kassaMahsulotKorsatish(kassaMahsulotlar);
  } catch(e) { toast(e.message, 'error'); }
}


// Rasmni kattalashtirish (kassa va boshqa sahifalar uchun)
function rasmKattaKorsatish(src) {
  modalOch('🖼️ Rasm', `
    <div style="text-align:center">
      <img src="${src}"
        style="max-width:100%;max-height:70vh;border-radius:10px;
        box-shadow:0 4px 20px rgba(0,0,0,0.15);object-fit:contain">
    </div>
    <div class="modal-footer" style="padding:0;margin-top:12px">
      <button class="btn btn-secondary" onclick="modalYop()">Yopish</button>
    </div>`);
}
