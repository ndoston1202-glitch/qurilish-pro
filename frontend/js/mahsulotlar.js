let mahsulotlarRoyxat = [];
let kategoriyalarRoyxat = [];
let joriySahifa = 1;
const SAHIFADAGI_SON = 20;
let omborMahsulotTab = 'mahsulotlar';

async function mahsulotlarYukla(tab) {
  omborMahsulotTab = tab || 'mahsulotlar';
  const kontent = document.getElementById('asosiyKontent');

  const tablar = [
    { id:'mahsulotlar', nomi:'Mahsulotlar',   icon:'fa-boxes'     },
    { id:'ombor',       nomi:'Ombor',          icon:'fa-warehouse' },
    { id:'brendlar',    nomi:'Brendlar',       icon:'fa-copyright' },
  ];

  kontent.innerHTML = `
    <div style="display:flex;gap:0;margin-bottom:16px;border-bottom:2px solid #e2e8f0">
      ${tablar.map(t => `
        <button onclick="mahsulotlarYukla('${t.id}')"
          style="padding:10px 18px;border:none;background:none;cursor:pointer;font-size:14px;
          font-weight:600;white-space:nowrap;
          border-bottom:3px solid ${omborMahsulotTab===t.id?'#2563eb':'transparent'};
          color:${omborMahsulotTab===t.id?'#2563eb':'#64748b'};margin-bottom:-2px;
          transition:color 0.2s"
          onmouseover="if('${t.id}'!=='${omborMahsulotTab}')this.style.color='#1e293b'"
          onmouseout="if('${t.id}'!=='${omborMahsulotTab}')this.style.color='#64748b'">
          <i class="fas ${t.icon}" style="margin-right:6px"></i>${t.nomi}
        </button>`).join('')}
    </div>
    <div id="omborMahsulotKontent"></div>`;

  switch(omborMahsulotTab) {
    case 'mahsulotlar': await mahsulotlarTabYukla(); break;
    case 'ombor':       await omborYuklaTab();       break;
    case 'brendlar':    await omborBrendlarTab();    break;
    default: await mahsulotlarTabYukla(); break;
  }
}

async function mahsulotlarTabYukla() {
  document.getElementById('omborMahsulotKontent').innerHTML = `
    <div class="card">
      <div class="card-header">
        <div class="filter-bar">
          <input type="text" id="mahQidiruv" class="search-input"
            placeholder="🔍 Nomi yoki shtrix kod..." oninput="mahsulotlarFilter()">
          <select id="mahKategoriya" class="filter-select" onchange="mahsulotlarFilter()">
            <option value="">Barcha kategoriyalar</option>
          </select>
          <select id="mahHolat" class="filter-select" onchange="mahsulotlarFilter()">
            <option value="">Barchasi</option>
            <option value="kam">Kam qolganlar</option>
          </select>
        </div>
        <div style="display:flex;gap:8px;flex-wrap:wrap">
          <button class="btn btn-secondary btn-sm" onclick="kategoriyalarBoshqar()">
            <i class="fas fa-tags"></i> Kategoriyalar
          </button>
          <button class="btn btn-secondary btn-sm" onclick="mahsulotlarExcelImport()">
            <i class="fas fa-file-excel"></i> Excel import
          </button>
          <button class="btn btn-secondary btn-sm" id="etiketkaChiqarBtn" style="display:none"
            onclick="tanlanganlargaEtiketka()">
            <i class="fas fa-tag" style="color:#8b5cf6"></i>
            <span id="etiketkaChiqarSon">0</span> ta etiketka
          </button>
          <button class="btn btn-danger btn-sm" id="kopOchirBtn" style="display:none"
            onclick="tanlanganMahsulotOchir()">
            <i class="fas fa-trash"></i>
            <span id="kopOchirSon">0</span> ta o'chirish
          </button>
          <button class="btn btn-primary" onclick="mahsulotQosh()">
            <i class="fas fa-plus"></i> Yangi mahsulot
          </button>
        </div>
      </div>
      <div class="card-body">
        <div id="mahsulotlarJadval"></div>
        <div id="mahPagination" class="pagination"></div>
      </div>
    </div>`;

  try {
    [mahsulotlarRoyxat, kategoriyalarRoyxat] = await Promise.all([
      apiGet('/mahsulotlar'), apiGet('/kategoriyalar')
    ]);
    const sel = document.getElementById('mahKategoriya');
    kategoriyalarRoyxat.forEach(k => sel.innerHTML += `<option value="${k.id}">${k.nomi}</option>`);
    mahsulotlarKorsatish(mahsulotlarRoyxat);
  } catch (e) { toast(e.message, 'error'); }
}

async function omborYuklaTab() {
  document.getElementById('omborMahsulotKontent').innerHTML = `
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;flex-wrap:wrap">
      <div class="card">
        <div class="card-header">
          <h3><i class="fas fa-warehouse"></i> Inventar holati</h3>
          <div style="display:flex;gap:8px">
            <select id="omborKatFilter" class="filter-select" onchange="inventarYukla()">
              <option value="">Barcha kategoriyalar</option>
            </select>
            <button class="btn btn-primary btn-sm" onclick="kirimModalOch()"><i class="fas fa-plus"></i> Kirim</button>
          </div>
        </div>
        <div class="card-body" id="inventarRoyxat">
          <div style="text-align:center"><i class="fas fa-spinner fa-spin"></i></div>
        </div>
      </div>
      <div class="card">
        <div class="card-header">
          <h3><i class="fas fa-history"></i> Kirim tarixi</h3>
          <div class="filter-bar">
            <input type="date" id="omborBosh" class="search-input" style="width:140px" value="${bugunSana()}" onchange="kirimTarixYukla()">
            <input type="date" id="omborTugash" class="search-input" style="width:140px" value="${bugunSana()}" onchange="kirimTarixYukla()">
          </div>
        </div>
        <div class="card-body" id="kirimTarix">
          <div style="text-align:center"><i class="fas fa-spinner fa-spin"></i></div>
        </div>
      </div>
    </div>`;

  try {
    const kategoriyalar = await apiGet('/kategoriyalar');
    const sel = document.getElementById('omborKatFilter');
    kategoriyalar.forEach(k => sel.innerHTML += `<option value="${k.id}">${k.nomi}</option>`);
    await Promise.all([inventarYukla(), kirimTarixYukla()]);
  } catch (e) { toast(e.message, 'error'); }
}

// ===== OMBOR ICHIDAGI ETIKETKA TABI =====
async function omborEtiketkaTab() {
  const div = document.getElementById('omborMahsulotKontent');
  div.innerHTML = '<div style="text-align:center;padding:30px"><i class="fas fa-spinner fa-spin fa-2x" style="color:#2563eb"></i></div>';
  try {
    const shablonlar = await apiGet('/etiketka');
    div.innerHTML = `
      <div class="card">
        <div class="card-header">
          <h3><i class="fas fa-tag"></i> Etiketka shablonlari</h3>
          <div style="display:flex;gap:8px">
            <button class="btn btn-secondary btn-sm" onclick="mahsulotlarYukla('etiketka');setTimeout(()=>sozTabAlmashtir('etiketka',document.querySelector('[onclick*=etiketka]')),100)"
              onclick="sahifaOch('sozlamalar');setTimeout(()=>sozTabAlmashtir('etiketka',document.querySelector('.tab-btn:nth-child(5)')),400)">
              <i class="fas fa-cog"></i> Sozlamalar
            </button>
            <button class="btn btn-primary" onclick="sahifaOch('etiketka')">
              <i class="fas fa-plus"></i> Yangi shablon
            </button>
          </div>
        </div>
        <div class="card-body">
          ${!shablonlar.length ? `
            <div class="empty-state" style="padding:40px">
              <i class="fas fa-tag fa-3x" style="opacity:0.2;margin-bottom:16px"></i>
              <p style="margin-bottom:16px">Hali shablon yaratilmagan</p>
              <button class="btn btn-primary" onclick="sahifaOch('etiketka')">
                <i class="fas fa-plus"></i> Birinchi shablonni yarating
              </button>
            </div>` : `
            <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:14px">
              ${shablonlar.map(s => `
                <div style="border:1px solid #e2e8f0;border-radius:10px;overflow:hidden;
                  transition:all 0.2s;cursor:pointer;background:white"
                  onmouseover="this.style.boxShadow='0 4px 16px rgba(0,0,0,0.08)';this.style.transform='translateY(-2px)'"
                  onmouseout="this.style.boxShadow='';this.style.transform=''">
                  <div style="background:#f8fafc;padding:14px;display:flex;align-items:center;
                    justify-content:center;min-height:70px">
                    <div style="background:white;border:1px solid #e2e8f0;border-radius:4px;
                      padding:8px 12px;box-shadow:0 1px 4px rgba(0,0,0,0.08);text-align:center">
                      <div style="font-size:9px;font-weight:600;color:#475569">${s.nomi}</div>
                      <div style="font-size:8px;color:#94a3b8">${s.uzunlik}×${s.balandlik}mm</div>
                    </div>
                  </div>
                  <div style="padding:10px">
                    <div style="font-weight:700;font-size:13px;margin-bottom:2px">${s.nomi}</div>
                    <div style="font-size:11px;color:#64748b;margin-bottom:8px">
                      📏 ${s.uzunlik}×${s.balandlik}mm |
                      📦 ${JSON.parse(s.elementlar||'[]').length} ta element
                    </div>
                    <div style="display:flex;gap:5px">
                      <button class="btn btn-warning btn-sm" style="flex:1;font-size:11px"
                        onclick="etiketkaOchirTahrir(${s.id})">
                        <i class="fas fa-edit"></i> Tahrirlash
                      </button>
                      <button class="btn btn-success btn-sm btn-icon"
                        onclick="omborEtiketkaChiqar(${s.id})" title="Etiketka chiqarish">
                        <i class="fas fa-print"></i>
                      </button>
                      <button class="btn btn-danger btn-sm btn-icon"
                        onclick="omborEtiketkaOchir(${s.id},'${s.nomi.replace(/'/g,"\\'")}')">
                        <i class="fas fa-trash"></i>
                      </button>
                    </div>
                  </div>
                </div>`).join('')}
            </div>
            <div style="padding:10px;color:#64748b;font-size:13px;margin-top:8px">
              Jami: ${shablonlar.length} ta shablon
            </div>`}
        </div>
      </div>`;
  } catch(e) { toast(e.message, 'error'); }
}

function etiketkaOchirTahrir(id) {
  sahifaOch('etiketka');
  setTimeout(async () => {
    await new Promise(r => setTimeout(r, 400));
    if (typeof eShablonYukla === 'function') eShablonYukla(id);
  }, 200);
}

async function omborEtiketkaChiqar(id) {
  if (typeof sozEtiketkaChiqar === 'function') sozEtiketkaChiqar(id);
}

function omborEtiketkaOchir(id, nomi) {
  tasdiqlash(`"${nomi}" shablonini o'chirasizmi?`, async () => {
    try {
      await apiDelete('/etiketka/' + id);
      toast('Shablon o\'chirildi!');
      omborEtiketkaTab();
    } catch(e) { toast(e.message, 'error'); }
  });
}

// ===== OMBOR ICHIDAGI BRENDLAR TABI =====
async function omborBrendlarTab() {
  const div = document.getElementById('omborMahsulotKontent');
  div.innerHTML = '<div style="text-align:center;padding:30px"><i class="fas fa-spinner fa-spin fa-2x" style="color:#2563eb"></i></div>';
  try {
    const brendlar = await apiGet('/brendlar');
    div.innerHTML = `
      <div class="card">
        <div class="card-header">
          <h3><i class="fas fa-copyright"></i> Brendlar</h3>
          <button class="btn btn-primary" onclick="brendQosh_()">
            <i class="fas fa-plus"></i> Yangi brend
          </button>
        </div>
        <div class="card-body">
          ${!brendlar.length ? `
            <div class="empty-state" style="padding:40px">
              <i class="fas fa-tag fa-3x" style="opacity:0.2;margin-bottom:16px"></i>
              <p style="margin-bottom:16px">Hali brend qo'shilmagan</p>
              <button class="btn btn-primary" onclick="brendQosh_()">
                <i class="fas fa-plus"></i> Birinchi brendni qo'shing
              </button>
            </div>` : `
            <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:14px">
              ${brendlar.map(b => `
                <div style="border:1px solid #e2e8f0;border-radius:10px;overflow:hidden;
                  transition:all 0.2s;background:white"
                  onmouseover="this.style.boxShadow='0 4px 16px rgba(0,0,0,0.08)'"
                  onmouseout="this.style.boxShadow=''">
                  <div style="height:80px;background:#f8fafc;display:flex;align-items:center;
                    justify-content:center;overflow:hidden">
                    ${b.rasm
                      ? `<img src="${b.rasm}" style="width:100%;height:100%;object-fit:contain;padding:6px">`
                      : `<i class="fas fa-copyright fa-2x" style="color:#cbd5e1"></i>`}
                  </div>
                  <div style="padding:10px">
                    <div style="font-weight:700;font-size:13px;margin-bottom:2px">${b.nomi}</div>
                    ${b.tavsif ? `<div style="font-size:11px;color:#64748b;margin-bottom:6px">${b.tavsif}</div>` : ''}
                    <div style="display:flex;gap:5px">
                      <button class="btn btn-warning btn-sm" style="flex:1;font-size:11px"
                        onclick="omborBrendTahrir(${b.id})">
                        <i class="fas fa-edit"></i>
                      </button>
                      <button class="btn btn-danger btn-sm btn-icon"
                        onclick="omborBrendOchir(${b.id},'${b.nomi.replace(/'/g,"\\'")}')">
                        <i class="fas fa-trash"></i>
                      </button>
                    </div>
                  </div>
                </div>`).join('')}
            </div>
            <div style="padding:10px;color:#64748b;font-size:13px;margin-top:8px">
              Jami: ${brendlar.length} ta brend
            </div>`}
        </div>
      </div>`;
  } catch(e) { toast(e.message, 'error'); }
}

function brendQosh_() {
  if (typeof brendQosh === 'function') {
    brendQosh();
    // Modal yopilgandan keyin tabni yangilash
    const asl = window._tasdiqlashCallback;
    setTimeout(() => omborBrendlarTab(), 2000);
  }
}

async function omborBrendTahrir(id) {
  if (typeof brendTahrir === 'function') {
    await brendTahrir(id);
    setTimeout(() => omborBrendlarTab(), 1500);
  }
}

function omborBrendOchir(id, nomi) {
  tasdiqlash(`"${nomi}" brendini o'chirasizmi?`, async () => {
    try {
      await apiDelete('/brendlar/' + id);
      toast('Brend o\'chirildi!');
      omborBrendlarTab();
    } catch(e) { toast(e.message, 'error'); }
  });
}

function mahsulotlarFilter() {
  const q = document.getElementById('mahQidiruv').value.toLowerCase();
  const kat = document.getElementById('mahKategoriya').value;
  const holat = document.getElementById('mahHolat').value;
  let filtrlangan = mahsulotlarRoyxat.filter(m => {
    const nomMos = m.nomi.toLowerCase().includes(q) || (m.shtrix_kod || '').includes(q);
    const katMos = !kat || m.kategoriya_id == kat;
    const holatMos = holat !== 'kam' || m.miqdor <= m.min_miqdor;
    return nomMos && katMos && holatMos;
  });
  joriySahifa = 1;
  mahsulotlarKorsatish(filtrlangan);
}

function mahsulotlarKorsatish(royxat) {
  const bosh = (joriySahifa - 1) * SAHIFADAGI_SON;
  const sahifadagilar = royxat.slice(bosh, bosh + SAHIFADAGI_SON);
  const jami_sahifa = Math.ceil(royxat.length / SAHIFADAGI_SON);

  document.getElementById('mahsulotlarJadval').innerHTML = sahifadagilar.length ? `
    <div class="table-wrapper">
      <table>
        <thead>
          <tr>
            <th style="width:36px">
              <input type="checkbox" id="hammaTanla" onchange="hammaMahsulotTanla(this)"
                title="Hammasini tanlash" style="cursor:pointer;width:16px;height:16px">
            </th>
            <th>#</th><th>Nomi</th><th>Kategoriya</th><th>SKU</th><th>Shtrix kod</th>
            <th>Birlik</th><th>Kelish narxi</th><th>Sotish narxi</th>
            <th>Miqdor</th><th>Holat</th><th>Sotuv</th><th>Amallar</th>
          </tr>
        </thead>
        <tbody>
          ${sahifadagilar.map((m, i) => `
            <tr>
              <td>
                <input type="checkbox" class="mah-checkbox" value="${m.id}"
                  onchange="etiketkaCheckOzgartir()"
                  style="cursor:pointer;width:16px;height:16px">
              </td>
              <td>${bosh + i + 1}</td>
              <td>
                <div style="display:flex;align-items:center;gap:8px">
                  ${m.rasm ? `<img src="${m.rasm}" style="width:36px;height:36px;object-fit:cover;border-radius:6px;flex-shrink:0">` : `<div style="width:36px;height:36px;background:#f1f5f9;border-radius:6px;display:flex;align-items:center;justify-content:center;flex-shrink:0"><i class="fas fa-box" style="color:#cbd5e1"></i></div>`}
                  <b>${m.nomi}</b>
                </div>
              </td>
              <td><span class="badge badge-secondary">${m.kategoriya_nomi || '-'}</span></td>
              <td style="font-family:monospace;font-size:11px">
                ${m.sku ? `<span style="background:#ede9fe;color:#6d28d9;padding:2px 6px;border-radius:4px">${m.sku}</span>` : '<span style="color:#cbd5e1">—</span>'}
              </td>
              <td style="font-family:monospace;font-size:12px">${m.shtrix_kod || '-'}</td>
              <td>${m.birlik}</td>
              <td>${formatSum(m.kelish_narxi)}</td>
              <td><b style="color:#2563eb">${formatSum(m.sotish_narxi)}</b></td>
              <td>${m.miqdor} ${m.birlik}</td>
              <td>${m.miqdor <= m.min_miqdor
                ? '<span class="badge badge-danger"><i class="fas fa-exclamation-triangle"></i> Kam</span>'
                : '<span class="badge badge-success"><i class="fas fa-check"></i> Yetarli</span>'}</td>
              <td>
                <button class="btn btn-warning btn-sm btn-icon" title="Tahrirlash"
                  onclick="mahsulotTahrir(${m.id})"><i class="fas fa-edit"></i></button>
                <button class="btn btn-secondary btn-sm btn-icon" title="Etiketka chiqarish"
                  onclick="mahsulotEtiketka(${m.id})" style="background:#8b5cf6;color:white;border-color:#8b5cf6">
                  <i class="fas fa-tag"></i></button>
                <button class="btn btn-danger btn-sm btn-icon" title="O'chirish"
                  onclick="mahsulotOchir(${m.id},'${m.nomi.replace(/'/g,"\\'")}',${m.miqdor})">
                  <i class="fas fa-trash"></i></button>
              </td>
              <td>
                <span onclick="sotuvKorinishToggle(${m.id},${m.sotuvda_korinsin},this)"
                  style="cursor:pointer;display:inline-flex;align-items:center;gap:5px;padding:3px 10px;
                  border-radius:20px;font-size:12px;font-weight:600;transition:all 0.2s;
                  background:${m.sotuvda_korinsin!==0?'#dcfce7':'#fee2e2'};
                  color:${m.sotuvda_korinsin!==0?'#166534':'#991b1b'}">
                  <i class="fas ${m.sotuvda_korinsin!==0?'fa-eye':'fa-eye-slash'}"></i>
                  ${m.sotuvda_korinsin!==0?'Ko\'rinadi':'Yashirin'}
                </span>
              </td>
            </tr>`).join('')}
        </tbody>
      </table>
    </div>
    <div style="padding:10px;color:#64748b;font-size:13px">Jami: ${royxat.length} ta mahsulot</div>` :
    '<div class="empty-state"><i class="fas fa-search"></i><p>Mahsulot topilmadi</p></div>';

  let pages = '';
  if (jami_sahifa > 1) {
    if (joriySahifa > 1) pages += `<button class="page-btn" onclick="sahifaOtIndex(${joriySahifa-1})"><i class="fas fa-chevron-left"></i></button>`;
    for (let i = Math.max(1, joriySahifa-2); i <= Math.min(jami_sahifa, joriySahifa+2); i++) {
      pages += `<button class="page-btn ${i===joriySahifa?'active':''}" onclick="sahifaOtIndex(${i})">${i}</button>`;
    }
    if (joriySahifa < jami_sahifa) pages += `<button class="page-btn" onclick="sahifaOtIndex(${joriySahifa+1})"><i class="fas fa-chevron-right"></i></button>`;
  }
  document.getElementById('mahPagination').innerHTML = pages;
  window._mahsulotlarFiltrlangan = royxat;
}

function sahifaOtIndex(n) {
  joriySahifa = n;
  mahsulotlarKorsatish(window._mahsulotlarFiltrlangan || mahsulotlarRoyxat);
}

// ===== QO'SHISH / TAHRIRLASH =====
function mahsulotQosh() {
  modalOch('Yangi mahsulot qo\'shish', mahsulotFormKontent());
  setTimeout(() => brendSelectYukla(null), 50);
}

async function mahsulotTahrir(id) {
  try {
    const m = await apiGet('/mahsulotlar/' + id);
    modalOch('Mahsulotni tahrirlash', mahsulotFormKontent(m));
    brendSelectYukla(m.brend_id);
    // Shtrix kodlarni ham yuklash
    setTimeout(() => mahsulotTahrirKodlar(id), 100);
  } catch (e) { toast(e.message, 'error'); }
}

async function brendSelectYukla(tanlangan_id) {
  try {
    const brendlar = await apiGet('/brendlar');
    const sel = document.getElementById('brendSelect');
    if (!sel) return;
    sel.innerHTML = '<option value="">— Brendsiz —</option>';
    brendlar.forEach(b => {
      const opt = document.createElement('option');
      opt.value = b.id;
      opt.textContent = b.nomi;
      if (tanlangan_id && b.id == tanlangan_id) opt.selected = true;
      sel.appendChild(opt);
    });
  } catch(e) {}
}

function mahsulotFormKontent(m = null) {
  const katOptions = kategoriyalarRoyxat.map(k =>
    `<option value="${k.id}" ${m && m.kategoriya_id == k.id ? 'selected' : ''}>${k.nomi}</option>`
  ).join('');
  const birliklar = ['dona', 'kg', 'm', 'm2', 'm3', 'litr', 'qop', 'paket', 'rulon'];
  return `
    <form onsubmit="mahsulotSaqlash(event,${m ? m.id : 'null'})">
      <div class="form-group">
        <label>Mahsulot nomi *</label>
        <input type="text" name="nomi" required value="${m ? m.nomi : ''}"
          placeholder="Masalan: Portland tsement M400">
      </div>
      <div class="form-row">
        <div class="form-group">
          <label>Kategoriya</label>
          <select name="kategoriya_id">
            <option value="">— Tanlang —</option>${katOptions}
          </select>
        </div>
        <div class="form-group">
          <label>Brend</label>
          <select name="brend_id" id="brendSelect">
            <option value="">— Brendsiz —</option>
          </select>
        </div>
      </div>
        <div class="form-group">
          <label>Birlik *</label>
          <select name="birlik">
            ${birliklar.map(b => `<option ${m && m.birlik===b ? 'selected' : ''}>${b}</option>`).join('')}
          </select>
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label>Kelish narxi (so'm)</label>
          <input type="number" name="kelish_narxi" min="0" value="${m ? m.kelish_narxi : ''}">
        </div>
        <div class="form-group">
          <label>Sotish narxi (so'm) *</label>
          <input type="number" name="sotish_narxi" min="0" required value="${m ? m.sotish_narxi : ''}">
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label>Mavjud miqdor</label>
          <input type="number" name="miqdor" min="0" step="0.01" value="${m ? m.miqdor : '0'}">
        </div>
        <div class="form-group">
          <label>Minimum miqdor</label>
          <input type="number" name="min_miqdor" min="0" step="0.01" value="${m ? m.min_miqdor : '5'}">
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label><i class="fas fa-barcode"></i> Asosiy shtrix kod</label>
          <div style="display:flex;gap:4px">
            <input type="text" name="shtrix_kod"
              value="${m ? (m.shtrix_kod || '') : ''}"
              placeholder="Asosiy shtrix kod" style="flex:1">
            <button type="button" class="btn btn-secondary btn-sm"
              onclick="qoshimchaKodlarKorsatish(${m ? m.id : 'null'})"
              title="Ko'p shtrix kod"
              style="padding:6px 10px;white-space:nowrap">
              <i class="fas fa-plus"></i> Ko'proq
            </button>
          </div>
          <!-- Qo'shimcha shtrix kodlar -->
          <div id="qoshimchaKodlarDiv" style="margin-top:6px;display:none">
            <div id="qoshimchaKodlarRoyxat"></div>
            <div style="display:flex;gap:6px;margin-top:6px">
              <input type="text" id="yangiKodInput" placeholder="Yangi shtrix kod..."
                style="flex:1;padding:6px 10px;border:1px solid #e2e8f0;border-radius:6px;font-size:13px">
              <button type="button" class="btn btn-success btn-sm"
                onclick="qoshimchaKodQosh(${m ? m.id : 'null'})">
                <i class="fas fa-plus"></i> Qo'sh
              </button>
            </div>
          </div>
        </div>
        <div class="form-group">
          <label><i class="fas fa-hashtag"></i> SKU kodi
            <span style="font-size:11px;color:#94a3b8;font-weight:normal">(ichki raqam)</span>
          </label>
          <div style="display:flex;gap:4px">
            <input type="text" name="sku" id="skuInput"
              value="${m ? (m.sku || '') : ''}"
              placeholder="Masalan: SKU-001"
              style="flex:1">
            <button type="button" class="btn btn-secondary btn-sm"
              onclick="skuAvtoGenerate()"
              title="Avtomatik yaratish"
              style="padding:6px 10px;white-space:nowrap">
              <i class="fas fa-magic"></i>
            </button>
          </div>
        </div>
      </div>
      <div class="form-group">
        <label>Tavsif</label>
        <textarea name="tavsif" rows="2" style="resize:vertical">${m ? (m.tavsif || '') : ''}</textarea>
      </div>

      <!-- RASM -->
      <div class="form-group">
        <label><i class="fas fa-image"></i> Mahsulot rasmi</label>
        <div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap">
          <div id="rasmPreview" style="width:80px;height:80px;border:2px dashed #e2e8f0;border-radius:8px;
            display:flex;align-items:center;justify-content:center;overflow:hidden;background:#f8fafc;flex-shrink:0">
            ${m && m.rasm
              ? `<img src="${m.rasm}" style="width:100%;height:100%;object-fit:cover;border-radius:6px">`
              : '<i class="fas fa-image fa-2x" style="color:#cbd5e1"></i>'}
          </div>
          <div style="flex:1">
            <input type="file" id="rasmFaylInput" accept="image/*" onchange="rasmTanlash(this)"
              style="display:none">
            <button type="button" class="btn btn-secondary btn-sm" onclick="document.getElementById('rasmFaylInput').click()">
              <i class="fas fa-upload"></i> Rasm tanlash
            </button>
            ${m && m.rasm ? `<button type="button" class="btn btn-danger btn-sm" style="margin-left:6px" onclick="rasmOchir()">
              <i class="fas fa-times"></i> O'chirish
            </button>` : ''}
            <div style="font-size:11px;color:#94a3b8;margin-top:4px">PNG, JPG, JPEG (max 5MB)</div>
          </div>
        </div>
        <input type="hidden" name="rasm" id="rasmInput" value="${m ? (m.rasm || '') : ''}">
      </div>

      <!-- SOTUVDA KO'RINISH TOGGLE -->
      <div class="form-group">
        <div style="display:flex;align-items:center;justify-content:space-between;
          padding:12px 16px;background:#f8fafc;border-radius:10px;border:1px solid #e2e8f0">
          <div>
            <div style="font-weight:600;font-size:14px">
              <i class="fas fa-eye" style="color:#2563eb;margin-right:6px"></i>
              Sotuvda ko'rinsin
            </div>
            <div style="font-size:12px;color:#64748b;margin-top:2px">
              O'chirilsa kassada ko'rinmaydi
            </div>
          </div>
          <label style="position:relative;display:inline-block;width:52px;height:28px;cursor:pointer">
            <input type="checkbox" name="sotuvda_korinsin" id="sotuvdaKorinsin"
              ${!m || m.sotuvda_korinsin !== 0 ? 'checked' : ''}
              style="opacity:0;width:0;height:0"
              onchange="toggleKorinishRang(this)">
            <span id="toggleSpan" style="position:absolute;top:0;left:0;right:0;bottom:0;
              border-radius:34px;transition:0.3s;
              background:${!m || m.sotuvda_korinsin !== 0 ? '#2563eb' : '#e2e8f0'}">
              <span style="position:absolute;height:20px;width:20px;left:${!m || m.sotuvda_korinsin !== 0 ? '28px' : '4px'};
                bottom:4px;background:white;border-radius:50%;transition:0.3s;
                box-shadow:0 1px 3px rgba(0,0,0,0.3)" id="toggleCircle"></span>
            </span>
          </label>
        </div>
      </div>

      <div class="modal-footer" style="padding:0;margin-top:10px">
        <button type="button" class="btn btn-secondary" onclick="modalYop()">Bekor</button>
        <button type="submit" class="btn btn-primary"><i class="fas fa-save"></i> Saqlash</button>
      </div>
    </form>`;
}

async function mahsulotSaqlash(e, id) {
  e.preventDefault();
  const form = e.target;
  const data = {
    nomi: form.nomi.value.trim(),
    kategoriya_id: form.kategoriya_id.value || null,
    birlik: form.birlik.value,
    kelish_narxi: parseFloat(form.kelish_narxi.value) || 0,
    sotish_narxi: parseFloat(form.sotish_narxi.value),
    miqdor: parseFloat(form.miqdor.value) || 0,
    min_miqdor: parseFloat(form.min_miqdor.value) || 5,
    shtrix_kod: form.shtrix_kod.value || null,
    sku: form.sku?.value?.trim() || null,
    tavsif: form.tavsif.value,
    rasm: document.getElementById('rasmInput')?.value || null,
    sotuvda_korinsin: form.sotuvda_korinsin?.checked ? 1 : 0,
    brend_id: form.brend_id?.value || null,
    foydalanuvchi_id: joriyFoydalanuvchi?.id || null
  };
  try {
    if (id) { await apiPut('/mahsulotlar/' + id, data); toast('Mahsulot yangilandi!'); }
    else { await apiPost('/mahsulotlar', data); toast('Mahsulot qo\'shildi!'); }
    modalYop();
    mahsulotlarYukla();
  } catch (e) { toast(e.message, 'error'); }
}

// ===== CHECKBOX + KO'P ETIKETKA =====
function hammaMahsulotTanla(chk) {
  document.querySelectorAll('.mah-checkbox').forEach(c => c.checked = chk.checked);
  etiketkaCheckOzgartir();
}

function etiketkaCheckOzgartir() {
  const tanlangan = document.querySelectorAll('.mah-checkbox:checked');
  const btn = document.getElementById('etiketkaChiqarBtn');
  const son = document.getElementById('etiketkaChiqarSon');
  if (btn) btn.style.display = tanlangan.length > 0 ? 'flex' : 'none';
  if (son) son.textContent = tanlangan.length;
  // O'chirish tugmasi
  const ochBtn = document.getElementById('kopOchirBtn');
  const ochSon = document.getElementById('kopOchirSon');
  if (ochBtn) ochBtn.style.display = tanlangan.length > 0 ? 'flex' : 'none';
  if (ochSon) ochSon.textContent = tanlangan.length;
  // Hamma tanlash checkboxni yangilash
  const hammasi = document.querySelectorAll('.mah-checkbox');
  const hammaChk = document.getElementById('hammaTanla');
  if (hammaChk && hammasi.length > 0) {
    hammaChk.checked = tanlangan.length === hammasi.length;
    hammaChk.indeterminate = tanlangan.length > 0 && tanlangan.length < hammasi.length;
  }
}

// ===== KO'P MAHSULOT O'CHIRISH =====
async function tanlanganMahsulotOchir() {
  const tanlangan = [...document.querySelectorAll('.mah-checkbox:checked')];
  if (!tanlangan.length) { toast('Mahsulot tanlanmagan!', 'warning'); return; }
  const idlar = tanlangan.map(c => parseInt(c.value));

  tasdiqlash(`${idlar.length} ta mahsulotni o'chirasizmi?\n(Faqat miqdori 0 bo'lganlar o'chiriladi)`, async () => {
    try {
      const r = await apiPost('/mahsulotlar/kop_ochir', { idlar });
      let xabar = `✅ ${r.ochirildi} ta mahsulot o'chirildi!`;
      toast(xabar, 'success');
      if (r.otkazildi && r.otkazildi.length) {
        setTimeout(() => {
          toast(`⚠️ ${r.otkazildi.length} ta o'tkazildi (miqdori > 0)`, 'warning');
        }, 2500);
      }
      mahsulotlarTabYukla();
    } catch(e) { toast(e.message, 'error'); }
  });
}

async function tanlanganlargaEtiketka() {
  const tanlangan = [...document.querySelectorAll('.mah-checkbox:checked')];
  if (!tanlangan.length) { toast('Mahsulot tanlanmagan!', 'warning'); return; }

  const idlar = tanlangan.map(c => parseInt(c.value));

  // Shablon tanlash
  try {
    const shablonlar = await apiGet('/etiketka');
    if (!shablonlar.length) {
      toast('Avval etiketka shabloni yarating!', 'warning');
      sahifaOch('etiketka');
      return;
    }
    modalOch(`🏷️ ${idlar.length} ta mahsulotga etiketka`, `
      <p style="color:#64748b;font-size:13px;margin-bottom:12px">
        <b>${idlar.length}</b> ta tanlangan mahsulot uchun shablon tanlang:
      </p>
      <div style="max-height:300px;overflow-y:auto;display:flex;flex-direction:column;gap:6px">
        ${shablonlar.map(s => `
          <div onclick="kopEtiketkaChiqar([${idlar.join(',')}],${s.id})"
            style="padding:10px 14px;border:1px solid #e2e8f0;border-radius:8px;cursor:pointer;
            display:flex;justify-content:space-between;align-items:center"
            onmouseover="this.style.background='#f0f9ff';this.style.borderColor='#2563eb'"
            onmouseout="this.style.background='white';this.style.borderColor='#e2e8f0'">
            <div>
              <div style="font-weight:600;font-size:14px">${s.nomi}</div>
              <div style="font-size:11px;color:#64748b">${s.uzunlik}×${s.balandlik}mm</div>
            </div>
            <i class="fas fa-chevron-right" style="color:#94a3b8"></i>
          </div>`).join('')}
      </div>
      <div class="modal-footer" style="padding:0;margin-top:12px">
        <button class="btn btn-secondary" onclick="modalYop()">Bekor</button>
      </div>`);
  } catch(e) { toast(e.message, 'error'); }
}

async function kopEtiketkaChiqar(mahsulotIdlar, shablon_id) {
  modalYop();
  try {
    const shablon = await apiGet('/etiketka/' + shablon_id);
    const elementlar = JSON.parse(shablon.elementlar || '[]');
    const soz = printerSozlamalariniOl ? printerSozlamalariniOl() : {};
    const nusxa = soz.etiketka_nusxa || 1;

    // Har mahsulot uchun etiketka tayyorlaymiz
    const mahsulotlar = await Promise.all(mahsulotIdlar.map(id => apiGet('/mahsulotlar/' + id)));

    const w = Math.round(shablon.uzunlik * 3.78);
    const h = Math.round(shablon.balandlik * 3.78);

    // Har mahsulot uchun etiketka HTML
    let barcha = '';
    mahsulotlar.forEach((m, mi) => {
      for (let n = 0; n < nusxa; n++) {
        const etiketkaHtml = elementlar.map(el => {
          const x = el.x * 3.78, y = el.y * 3.78;
          const kw = el.kenglik * 3.78, kh = el.balandlik * 3.78;
          const sozQiymat = JSON.parse(localStorage.getItem('dokoni_sozlamalar') || '{}');
          const qiymat = {
            mahsulot_nomi: m.nomi, narxi: formatSum(m.sotish_narxi),
            shtrix_kod: m.shtrix_kod || m.sku || '', sku: m.sku || '',
            kategoriya: m.kategoriya_nomi || '', birlik: m.birlik,
            kompaniya: sozQiymat.chek_dokoni_nomi || "Qurilish Do'koni",
            erkin: el.qiymat || ''
          }[el.maydon] || el.qiymat || '';

          if (el.tur === 'matn') return `
            <div style="position:absolute;left:${x}px;top:${y}px;width:${kw}px;height:${kh}px;
              font-size:${el.shrift_olchami * 3.78 * 0.7}px;font-weight:${el.qalin?'bold':'normal'};
              font-style:${el.kursiv?'italic':'normal'};color:${el.rang||'#000'};
              text-align:${el.hizalash||'left'};overflow:hidden;white-space:nowrap;
              display:flex;align-items:center;padding:0 2px">${qiymat}</div>`;
          if (el.tur === 'chiziq') return `
            <div style="position:absolute;left:${x}px;top:${y}px;width:${kw}px;
              border-top:${el.qalinlik||1}px solid ${el.rang||'#000'}"></div>`;
          return '';
        }).join('');

        const isLast = mi === mahsulotlar.length - 1 && n === nusxa - 1;
        barcha += `
          <div style="position:relative;width:${w}px;height:${h}px;background:white;
            overflow:hidden;${!isLast?'page-break-after:always':''}">
            ${etiketkaHtml}
          </div>`;
      }
    });

    // Print oynasi
    const printWin = window.open('', '_blank', `width=${w+100},height=${h*2+150}`);
    printWin.document.write(`<!DOCTYPE html><html><head>
      <title>Etiketkalar (${mahsulotlar.length} ta)</title>
      <style>
        *{margin:0;padding:0;box-sizing:border-box}
        @page{size:${shablon.uzunlik}mm ${shablon.balandlik}mm;margin:0}
        body{background:white}
        .ctrl{padding:8px 12px;background:#f1f5f9;display:flex;gap:8px;align-items:center;flex-wrap:wrap}
        .ctrl button{padding:6px 14px;border-radius:6px;border:none;cursor:pointer;font-size:12px;font-weight:600}
        @media print{.ctrl{display:none}}
      </style>
    </head><body>
      <div class="ctrl">
        <button style="background:#2563eb;color:white" onclick="window.print()">
          🖨️ ${mahsulotlar.length} ta mahsulot, ${mahsulotlar.length * nusxa} ta etiketka chop etish
        </button>
        <button style="background:#e2e8f0" onclick="window.close()">Yopish</button>
        <span style="font-size:11px;color:#64748b">
          📐 ${shablon.uzunlik}×${shablon.balandlik}mm | 📋 ${nusxa} nusxa/mahsulot
        </span>
      </div>
      ${barcha}
    </body></html>`);
    printWin.document.close();

    toast(`✅ ${mahsulotlar.length} ta mahsulot, ${mahsulotlar.length * nusxa} ta etiketka!`, 'success');
  } catch(e) { toast(e.message, 'error'); }
}

// ===== KO'P SHTRIX KOD FUNKSIYALARI =====
let _qoshimchaKodlarCache = [];

async function qoshimchaKodlarKorsatish(mahsulot_id) {
  const div = document.getElementById('qoshimchaKodlarDiv');
  if (!div) return;

  // Toggle
  if (div.style.display !== 'none') {
    div.style.display = 'none'; return;
  }
  div.style.display = 'block';

  if (!mahsulot_id || mahsulot_id === 'null') {
    document.getElementById('qoshimchaKodlarRoyxat').innerHTML =
      '<div style="font-size:12px;color:#94a3b8;padding:4px">Mahsulot saqlangandan keyin ko\'p kod qo\'shiladi</div>';
    return;
  }

  await qoshimchaKodlarYanila(mahsulot_id);
}

async function qoshimchaKodlarYanila(mahsulot_id) {
  if (!mahsulot_id || mahsulot_id === 'null') return;
  try {
    const kodlar = await apiGet(`/shtrix_kodlar?mahsulot_id=${mahsulot_id}`);
    _qoshimchaKodlarCache = kodlar;
    const div = document.getElementById('qoshimchaKodlarRoyxat');
    if (!div) return;

    if (!kodlar.length) {
      div.innerHTML = '<div style="font-size:12px;color:#94a3b8;padding:4px">Qo\'shimcha kod yo\'q</div>';
      return;
    }

    div.innerHTML = kodlar.map(k => `
      <div style="display:flex;align-items:center;gap:6px;padding:4px 0;border-bottom:1px solid #f1f5f9">
        <span style="flex:1;font-family:monospace;font-size:12px;
          background:#f1f5f9;padding:3px 8px;border-radius:4px">${k.kod}</span>
        <span style="font-size:10px;color:#94a3b8;min-width:50px">${k.tur||'barcode'}</span>
        <button type="button" onclick="qoshimchaKodOchir(${k.id},${mahsulot_id})"
          style="border:none;background:#fee2e2;color:#ef4444;border-radius:4px;
          padding:2px 8px;cursor:pointer;font-size:12px">×</button>
      </div>`).join('');
  } catch(e) {}
}

async function qoshimchaKodQosh(mahsulot_id) {
  const inp = document.getElementById('yangiKodInput');
  const kod = inp?.value?.trim();
  if (!kod) { toast('Kod kiriting!', 'warning'); return; }

  if (!mahsulot_id || mahsulot_id === 'null') {
    toast('Avval mahsulotni saqlang!', 'warning'); return;
  }

  try {
    await apiPost('/shtrix_kodlar', {
      mahsulot_id: parseInt(mahsulot_id),
      kod,
      tur: 'barcode'
    });
    if (inp) inp.value = '';
    toast('✅ Kod qo\'shildi!', 'success');
    await qoshimchaKodlarYanila(mahsulot_id);
  } catch(e) { toast(e.message, 'error'); }
}

async function qoshimchaKodOchir(kod_id, mahsulot_id) {
  try {
    await apiDelete('/shtrix_kodlar/' + kod_id);
    toast('Kod o\'chirildi!');
    await qoshimchaKodlarYanila(mahsulot_id);
  } catch(e) { toast(e.message, 'error'); }
}

// Mahsulot tahrirlashda shtrix kodlar bo'limini yuklash
async function mahsulotTahrirKodlar(mahsulot_id) {
  const div = document.getElementById('qoshimchaKodlarDiv');
  if (!div) return;
  div.style.display = 'block';
  await qoshimchaKodlarYanila(mahsulot_id);
}

// SKU avtomatik generatsiya
function skuAvtoGenerate() {
  const nomiEl = document.querySelector('[name=nomi]');
  const nomi = nomiEl?.value?.trim() || '';
  const prefix = nomi.slice(0,3).toUpperCase().replace(/[^A-ZА-ЯA-Z0-9]/gi,'X');
  const raqam = String(Date.now()).slice(-4);
  const sku = `${prefix}-${raqam}`;
  const inp = document.getElementById('skuInput');
  if (inp) inp.value = sku;
}

// ===== Jadvalda etiketka tugmasi =====
// Jadvalda to'g'ridan-to'g'ri bosib toggle qilish
async function sotuvKorinishToggle(id, joriyHolat, el) {
  const yangi = joriyHolat !== 0 ? 0 : 1;
  try {
    const m = await apiGet('/mahsulotlar/' + id);
    await apiPut('/mahsulotlar/' + id, { ...m, sotuvda_korinsin: yangi });
    // Elementni yangilash
    el.style.background = yangi ? '#dcfce7' : '#fee2e2';
    el.style.color = yangi ? '#166534' : '#991b1b';
    el.innerHTML = `<i class="fas ${yangi ? 'fa-eye' : 'fa-eye-slash'}"></i> ${yangi ? "Ko'rinadi" : 'Yashirin'}`;
    el.setAttribute('onclick', `sotuvKorinishToggle(${id},${yangi},this)`);
    toast(yangi ? '✅ Sotuvda ko\'rinadi' : '🔕 Sotuvdan yashirildi', yangi ? 'success' : 'warning');
  } catch(e) { toast(e.message, 'error'); }
}

function toggleKorinishRang(checkbox) {
  const span = document.getElementById('toggleSpan');
  const circle = document.getElementById('toggleCircle');
  if (!span || !circle) return;
  if (checkbox.checked) {
    span.style.background = '#2563eb';
    circle.style.left = '28px';
  } else {
    span.style.background = '#e2e8f0';
    circle.style.left = '4px';
  }
}
function rasmTanlash(input) {
  const file = input.files[0];
  if (!file) return;
  // 5MB limit
  if (file.size > 5 * 1024 * 1024) {
    toast('⚠️ Rasm 5MB dan kichik bo\'lsin!', 'warning');
    input.value = '';
    return;
  }
  const reader = new FileReader();
  reader.onload = e => {
    const base64 = e.target.result;
    document.getElementById('rasmInput').value = base64;
    const preview = document.getElementById('rasmPreview');
    if (preview) preview.innerHTML = `
      <img src="${base64}"
        style="width:100%;height:100%;object-fit:cover;border-radius:6px;cursor:zoom-in"
        onclick="rasmKattaKorsatish(this.src)"
        title="Kattalashtirish uchun bosing">`;
  };
  reader.readAsDataURL(file);
}

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

function rasmOchir() {
  document.getElementById('rasmInput').value = '';
  const preview = document.getElementById('rasmPreview');
  if (preview) preview.innerHTML = '<i class="fas fa-image fa-2x" style="color:#cbd5e1"></i>';
}

// ===== O'CHIRISH — miqdor 0 bo'lishi shart =====
function mahsulotOchir(id, nomi, miqdor) {
  if (miqdor > 0) {
    modalOch('⚠️ O\'chirib bo\'lmaydi', `
      <div style="text-align:center;padding:10px">
        <i class="fas fa-exclamation-triangle fa-3x" style="color:#f59e0b;margin-bottom:12px"></i>
        <p style="font-size:15px;margin-bottom:8px">
          <b>"${nomi}"</b> mahsulotini o'chirib bo'lmaydi!
        </p>
        <p style="color:#64748b;font-size:14px">
          Hozirgi miqdor: <b style="color:#ef4444">${miqdor}</b><br>
          O'chirishdan avval miqdorni <b>0</b> ga tushiring.
        </p>
        <div style="margin-top:16px">
          <button class="btn btn-secondary" onclick="modalYop()">Yopish</button>
          <button class="btn btn-warning" style="margin-left:8px"
            onclick="modalYop();mahsulotTahrir(${id})">
            <i class="fas fa-edit"></i> Miqdorni o'zgartirish
          </button>
        </div>
      </div>`);
    return;
  }
  tasdiqlash(`"${nomi}" mahsulotini o'chirasizmi?`, async () => {
    try {
      await apiDelete('/mahsulotlar/' + id);
      toast('Mahsulot o\'chirildi!');
      mahsulotlarYukla();
    } catch (e) { toast(e.message, 'error'); }
  });
}

// ===== EXCEL IMPORT (SHABLON BILAN) =====
function mahsulotlarExcelImport() {
  const kontent = `
    <div>
      <!-- Shablon yuklab olish -->
      <div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:8px;padding:12px;margin-bottom:14px">
        <div style="font-weight:600;margin-bottom:6px;color:#1d4ed8">
          <i class="fas fa-download"></i> 1-qadam: Shablonni yuklab oling
        </div>
        <p style="font-size:13px;color:#3b82f6;margin-bottom:8px">
          Shablon faylni yuklab oling, ma'lumotlarni to'ldiring va qayta yuklang.
        </p>
        <button class="btn btn-primary btn-sm" onclick="mahsulotShablonYukla()">
          <i class="fas fa-file-csv"></i> CSV Shablon yuklab olish
        </button>
      </div>

      <!-- Fayl yuklash -->
      <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:12px;margin-bottom:14px">
        <div style="font-weight:600;margin-bottom:6px;color:#15803d">
          <i class="fas fa-upload"></i> 2-qadam: To'ldirilgan faylni yuklang
        </div>
        <input type="file" id="mahCSVFayl" accept=".csv,.txt"
          style="width:100%;padding:8px;border:2px dashed #e2e8f0;border-radius:8px;background:white"
          onchange="csvFaylOqi(this,'mahCSVMatn')">
      </div>

      <!-- Preview -->
      <div class="form-group">
        <label style="font-weight:600">CSV mazmuni (tekshirish yoki qo'lda kiritish):</label>
        <textarea id="mahCSVMatn" rows="7"
          style="width:100%;font-family:monospace;font-size:12px;border:1px solid #e2e8f0;border-radius:8px;padding:8px"
          placeholder="nomi,birlik,kelish_narxi,sotish_narxi,miqdor,min_miqdor,kategoriya"></textarea>
      </div>

      <div style="background:#fef3c7;border:1px solid #fcd34d;border-radius:8px;padding:10px;font-size:12px;color:#92400e;margin-bottom:10px">
        <b>⚠ Eslatma:</b> Bir xil nomli mahsulotlar o'tkazib yuboriladi (duplikat himoyasi).
      </div>

      <div class="modal-footer" style="padding:0">
        <button class="btn btn-secondary" onclick="modalYop()">Bekor</button>
        <button class="btn btn-success" onclick="mahsulotCSVYukla()">
          <i class="fas fa-upload"></i> Import qilish
        </button>
      </div>
    </div>`;
  modalOch('Mahsulotlarni Excel/CSV orqali import', kontent);
}

function mahsulotShablonYukla() {
  // Kategoriya nomlarini olish
  const katlar = kategoriyalarRoyxat.map(k => k.nomi).join(' / ');
  const sarlavha = 'nomi,birlik,kelish_narxi,sotish_narxi,miqdor,min_miqdor,kategoriya';
  const namunaQatorlar = [
    `Portland tsement M400,qop,85000,95000,100,10,Tsement va qorishmalar`,
    `Armatura 12mm,m,18000,22000,500,20,Temir va metall`,
    `G'isht qizil,dona,1200,1500,1000,50,G'isht va bloklar`,
  ];
  const csvMatn = sarlavha + '\n' + namunaQatorlar.join('\n');
  const blob = new Blob(['\uFEFF' + csvMatn], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'mahsulotlar_shablon.csv';
  a.click();
  URL.revokeObjectURL(url);
  toast('Shablon yuklandi! Excel yoki Notepad da oching.', 'success');
}

async function mahsulotCSVYukla() {
  const csv = document.getElementById('mahCSVMatn').value.trim();
  if (!csv) { toast('CSV matn bo\'sh!', 'warning'); return; }
  try {
    const r = await apiPost('/import/mahsulotlar', { csv });
    modalYop();
    toast(`✅ ${r.qoshildi} ta mahsulot qo'shildi!`, 'success');
    if (r.xatolar && r.xatolar.length) {
      setTimeout(() => toast(`⚠ ${r.xatolar.length} ta o'tkazib yuborildi: ${r.xatolar[0]}`, 'warning'), 3500);
    }
    mahsulotlarYukla();
  } catch (e) { toast(e.message, 'error'); }
}

// CSV faylni o'qish yordamchi funksiya
function csvFaylOqi(input, targetId) {
  const file = input.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    let text = e.target.result;
    // BOM ni olib tashlash
    if (text.charCodeAt(0) === 0xFEFF) text = text.slice(1);
    document.getElementById(targetId).value = text;
  };
  reader.readAsText(file, 'UTF-8');
}

// ===== KATEGORIYALAR =====
function kategoriyalarBoshqar() {
  kategoriyalarYuklaModal();
}

async function kategoriyalarYuklaModal() {
  const katlar = await apiGet('/kategoriyalar');
  const kontent = `
    <div style="margin-bottom:16px">
      <form onsubmit="kategoriyaQosh(event)" style="display:flex;gap:8px">
        <input type="text" id="yangiKat" placeholder="Kategoriya nomi"
          class="search-input" required style="flex:1">
        <button type="submit" class="btn btn-primary btn-sm">
          <i class="fas fa-plus"></i> Qo'sh
        </button>
      </form>
    </div>
    <div class="table-wrapper">
      <table>
        <thead><tr><th>Nomi</th><th>Amallar</th></tr></thead>
        <tbody>
          ${katlar.map(k => `
            <tr>
              <td>${k.nomi}</td>
              <td>
                <button class="btn btn-danger btn-sm btn-icon"
                  onclick="kategoriyaOchir(${k.id},'${k.nomi.replace(/'/g,"\\'")}')">
                  <i class="fas fa-trash"></i>
                </button>
              </td>
            </tr>`).join('')}
        </tbody>
      </table>
    </div>`;
  modalOch('Kategoriyalarni boshqarish', kontent);
}

async function kategoriyaQosh(e) {
  e.preventDefault();
  const nomi = document.getElementById('yangiKat').value;
  try {
    await apiPost('/kategoriyalar', { nomi });
    toast('Kategoriya qo\'shildi!');
    kategoriyalarYuklaModal();
  } catch (e) { toast(e.message, 'error'); }
}

function kategoriyaOchir(id, nomi) {
  tasdiqlash(`"${nomi}" kategoriyasini o'chirasizmi?`, async () => {
    try {
      await apiDelete('/kategoriyalar/' + id);
      toast('Kategoriya o\'chirildi!');
      kategoriyalarYuklaModal();
    } catch (e) { toast(e.message, 'error'); }
  });
}
