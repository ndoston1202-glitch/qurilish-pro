// ===== SOZLAMALAR =====
const SOZLAMALAR_KALIT = 'dokoni_sozlamalar';

function sozlamalarniOl() {
  const def = {
    // Chek sozlamalari
    chek_dokoni_nomi: "Qurilish Do'koni",
    chek_manzil: '',
    chek_telefon: '',
    chek_xabar: "Rahmat! Yana keling! 🙏",
    chek_korinish: 'standart', // standart, kichik, katta

    // Interfeys
    rangTema: 'moviy', // moviy, yashil, toq
    tilozbekcha: true,

    // Savdo oynasi
    savdoKorinish: 'karta', // karta, jadval
    savdoTolovDefault: 'naqd',
    chegirmaMax: 100,
    avtomatChek: true,

    // To'lov usullari
    tolovNaqd: true,
    tolovKarta: true,
    tolovQarz: true,
    tolovBankTransfer: false,
    tolovNaqdNomi: "Naqd pul",
    tolovKartaNomi: "Plastik karta",
    tolovQarzNomi: "Qarz",
    tolovBankNomi: "Bank o'tkazmasi",
  };
  try {
    const saqlangan = localStorage.getItem(SOZLAMALAR_KALIT);
    return saqlangan ? { ...def, ...JSON.parse(saqlangan) } : def;
  } catch { return def; }
}

function sozlamalarniSaqla(sozlamalar) {
  localStorage.setItem(SOZLAMALAR_KALIT, JSON.stringify(sozlamalar));
}

function sozlamalarYukla() {
  const kontent = document.getElementById('asosiyKontent');
  const s = sozlamalarniOl();

  kontent.innerHTML = `
    <div style="max-width:800px">
      <!-- TABS -->
      <div class="hisobot-tabs" style="margin-bottom:20px">
        <button class="tab-btn active" onclick="sozTabAlmashtir('chek',this)">
          <i class="fas fa-receipt"></i> Chek
        </button>
        <button class="tab-btn" onclick="sozTabAlmashtir('interfeys',this)">
          <i class="fas fa-palette"></i> Interfeys
        </button>
        <button class="tab-btn" onclick="sozTabAlmashtir('savdo',this)">
          <i class="fas fa-cash-register"></i> Savdo oynasi
        </button>
        <button class="tab-btn" onclick="sozTabAlmashtir('tolov',this)">
          <i class="fas fa-credit-card"></i> To'lov usullari
        </button>
        <button class="tab-btn" onclick="sozTabAlmashtir('etiketka',this)">
          <i class="fas fa-tag"></i> Etiketka shablonlari
        </button>
        <button class="tab-btn" onclick="sozTabAlmashtir('printer',this)">
          <i class="fas fa-print"></i> Printer
        </button>
        <button class="tab-btn" onclick="sozTabAlmashtir('integratsiya',this)">
          <i class="fab fa-telegram"></i> Integratsiya
        </button>
      </div>
      <div id="sozKontent"></div>
    </div>`;

  sozTabAlmashtir('chek', document.querySelector('.tab-btn'));
}

function sozTabAlmashtir(tur, btn) {
  document.querySelectorAll('.hisobot-tabs .tab-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  const s = sozlamalarniOl();
  switch(tur) {
    case 'chek': sozChekKorsatish(s); break;
    case 'interfeys': sozInterfeysKorsatish(s); break;
    case 'savdo': sozSavdoKorsatish(s); break;
    case 'tolov': sozTolovKorsatish(s); break;
    case 'etiketka': sozEtiketkaKorsatish(); break;
    case 'printer': printerSozlamalarKorsatish(); break;
    case 'integratsiya': sozIntegratsiyaKorsatish(); break;
  }
}

// ===== 1. CHEK SOZLAMALARI =====
function sozChekKorsatish(s) {
  document.getElementById('sozKontent').innerHTML = `
    <div class="card">
      <div class="card-header"><h3><i class="fas fa-receipt"></i> Chek sozlamalari</h3></div>
      <div class="card-body">
        <div class="form-group">
          <label>Do'kon nomi (chekda chiqadi)</label>
          <input type="text" id="soz_chek_dokoni_nomi" class="search-input" style="width:100%"
            value="${s.chek_dokoni_nomi}" placeholder="Qurilish Do'koni">
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>Manzil</label>
            <input type="text" id="soz_chek_manzil" class="search-input" style="width:100%"
              value="${s.chek_manzil}" placeholder="Toshkent, Chilonzor...">
          </div>
          <div class="form-group">
            <label>Telefon</label>
            <input type="text" id="soz_chek_telefon" class="search-input" style="width:100%"
              value="${s.chek_telefon}" placeholder="+998 90 123 45 67">
          </div>
        </div>
        <div class="form-group">
          <label>Chek pastidagi xabar</label>
          <input type="text" id="soz_chek_xabar" class="search-input" style="width:100%"
            value="${s.chek_xabar}" placeholder="Rahmat! Yana keling!">
        </div>
        <div class="form-group">
          <label>Chek ko'rinishi</label>
          <select id="soz_chek_korinish" class="filter-select" style="width:100%">
            <option value="standart" ${s.chek_korinish==='standart'?'selected':''}>Standart (80mm)</option>
            <option value="kichik" ${s.chek_korinish==='kichik'?'selected':''}>Kichik (58mm)</option>
            <option value="katta" ${s.chek_korinish==='katta'?'selected':''}>Katta (A4)</option>
          </select>
        </div>
        <div class="form-group">
          <label>
            <input type="checkbox" id="soz_avtomatChek" ${s.avtomatChek?'checked':''} style="margin-right:8px">
            Sotuvdan so'ng avtomatik chek ko'rsatsin
          </label>
        </div>

        <!-- CHEK PREVIEW -->
        <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:16px;margin-top:16px">
          <div style="font-weight:600;margin-bottom:10px;color:#475569">
            <i class="fas fa-eye"></i> Chek ko'rinishi (namuna):
          </div>
          <div id="chekPreview" style="max-width:300px;margin:0 auto;background:white;padding:12px;border:1px dashed #e2e8f0;border-radius:4px;font-family:monospace;font-size:12px">
          </div>
        </div>

        <div style="margin-top:16px">
          <button class="btn btn-primary" onclick="sozChekSaqla()">
            <i class="fas fa-save"></i> Saqlash
          </button>
          <button class="btn btn-secondary" style="margin-left:8px" onclick="chekPreviewYanila()">
            <i class="fas fa-eye"></i> Ko'rish
          </button>
        </div>
      </div>
    </div>`;
  chekPreviewYanila();
}

function chekPreviewYanila() {
  const nomi = document.getElementById('soz_chek_dokoni_nomi')?.value || "Qurilish Do'koni";
  const manzil = document.getElementById('soz_chek_manzil')?.value || '';
  const tel = document.getElementById('soz_chek_telefon')?.value || '';
  const xabar = document.getElementById('soz_chek_xabar')?.value || "Rahmat! Yana keling!";
  const preview = document.getElementById('chekPreview');
  if (!preview) return;
  preview.innerHTML = `
    <div style="text-align:center;font-weight:bold;font-size:14px;border-bottom:1px dashed #000;padding-bottom:6px;margin-bottom:8px">
      🏗️ ${nomi}
    </div>
    ${manzil ? `<div style="text-align:center;font-size:11px">${manzil}</div>` : ''}
    ${tel ? `<div style="text-align:center;font-size:11px">Tel: ${tel}</div>` : ''}
    <div style="border-bottom:1px dashed #000;margin:6px 0"></div>
    <div style="display:flex;justify-content:space-between"><span>Chek:</span><span>CHK12345</span></div>
    <div style="display:flex;justify-content:space-between"><span>Sana:</span><span>${new Date().toLocaleDateString()}</span></div>
    <div style="border-bottom:1px dashed #000;margin:6px 0"></div>
    <div style="display:flex;justify-content:space-between"><span>Tsement x2</span></div>
    <div style="display:flex;justify-content:space-between"><span>2 x 95,000</span><span>190,000</span></div>
    <div style="border-bottom:1px dashed #000;margin:6px 0"></div>
    <div style="display:flex;justify-content:space-between;font-weight:bold"><span>JAMI:</span><span>190,000 so'm</span></div>
    <div style="text-align:center;margin-top:8px;font-size:11px">${xabar}</div>`;
}

function sozChekSaqla() {
  const s = sozlamalarniOl();
  s.chek_dokoni_nomi = document.getElementById('soz_chek_dokoni_nomi').value;
  s.chek_manzil = document.getElementById('soz_chek_manzil').value;
  s.chek_telefon = document.getElementById('soz_chek_telefon').value;
  s.chek_xabar = document.getElementById('soz_chek_xabar').value;
  s.chek_korinish = document.getElementById('soz_chek_korinish').value;
  s.avtomatChek = document.getElementById('soz_avtomatChek').checked;
  sozlamalarniSaqla(s);
  toast('✅ Chek sozlamalari saqlandi!', 'success');
}

// ===== 2. INTERFEYS SOZLAMALARI =====
function sozInterfeysKorsatish(s) {
  document.getElementById('sozKontent').innerHTML = `
    <div class="card">
      <div class="card-header"><h3><i class="fas fa-palette"></i> Interfeys sozlamalari</h3></div>
      <div class="card-body">
        <div class="form-group">
          <label>Rang temasi</label>
          <div style="display:flex;gap:12px;margin-top:8px;flex-wrap:wrap">
            ${[
              {id:'moviy', rang:'#2563eb', nomi:'Ko\'k'},
              {id:'yashil', rang:'#10b981', nomi:'Yashil'},
              {id:'toq', rang:'#7c3aed', nomi:'Binafsha'},
              {id:'qizil', rang:'#ef4444', nomi:'Qizil'},
              {id:'toshrang', rang:'#475569', nomi:'Toshrang'},
            ].map(t => `
              <div onclick="rangTanlash('${t.id}')"
                style="width:60px;text-align:center;cursor:pointer;padding:8px;border-radius:8px;border:2px solid ${s.rangTema===t.id?t.rang:'#e2e8f0'}">
                <div style="width:36px;height:36px;border-radius:50%;background:${t.rang};margin:0 auto 4px"></div>
                <span style="font-size:11px">${t.nomi}</span>
              </div>`).join('')}
          </div>
        </div>

        <div class="form-group" style="margin-top:16px">
          <label>Sahifadagi mahsulotlar soni (mahsulotlar ro'yxatida)</label>
          <select id="soz_sahifa_son" class="filter-select" style="width:200px">
            ${[10,20,50,100].map(n => `<option value="${n}" ${(s.sahifaSon||20)==n?'selected':''}>${n} ta</option>`).join('')}
          </select>
        </div>

        <div style="margin-top:16px">
          <button class="btn btn-primary" onclick="sozInterfeysSaqla()">
            <i class="fas fa-save"></i> Saqlash
          </button>
        </div>
      </div>
    </div>`;
}

function rangTanlash(id) {
  const s = sozlamalarniOl();
  s.rangTema = id;
  sozlamalarniSaqla(s);
  const ranglar = {moviy:'#2563eb', yashil:'#10b981', toq:'#7c3aed', qizil:'#ef4444', toshrang:'#475569'};
  const rang = ranglar[id] || '#2563eb';
  document.documentElement.style.setProperty('--primary', rang);
  toast(`✅ Rang o'zgartirildi!`, 'success');
  sozInterfeysKorsatish(s);
}

function sozInterfeysSaqla() {
  const s = sozlamalarniOl();
  s.sahifaSon = parseInt(document.getElementById('soz_sahifa_son').value);
  sozlamalarniSaqla(s);
  toast('✅ Interfeys sozlamalari saqlandi!', 'success');
}

// ===== 3. SAVDO OYNASI SOZLAMALARI =====
function sozSavdoKorsatish(s) {
  document.getElementById('sozKontent').innerHTML = `
    <div class="card">
      <div class="card-header"><h3><i class="fas fa-cash-register"></i> Savdo oynasi sozlamalari</h3></div>
      <div class="card-body">
        <div class="form-group">
          <label>Mahsulotlar ko'rinishi</label>
          <div style="display:flex;gap:12px;margin-top:8px">
            <label style="display:flex;align-items:center;gap:8px;cursor:pointer;padding:12px;border:2px solid ${s.savdoKorinish==='karta'?'#2563eb':'#e2e8f0'};border-radius:8px">
              <input type="radio" name="savdoKorinish" value="karta" ${s.savdoKorinish==='karta'?'checked':''}
                onchange="document.querySelectorAll('[name=savdoKorinish]').forEach((e,i)=>e.parentElement.style.borderColor=e.checked?'#2563eb':'#e2e8f0')">
              <i class="fas fa-th-large fa-lg" style="color:#2563eb"></i> Karta ko'rinish
            </label>
            <label style="display:flex;align-items:center;gap:8px;cursor:pointer;padding:12px;border:2px solid ${s.savdoKorinish==='jadval'?'#2563eb':'#e2e8f0'};border-radius:8px">
              <input type="radio" name="savdoKorinish" value="jadval" ${s.savdoKorinish==='jadval'?'checked':''}
                onchange="document.querySelectorAll('[name=savdoKorinish]').forEach((e,i)=>e.parentElement.style.borderColor=e.checked?'#2563eb':'#e2e8f0')">
              <i class="fas fa-list fa-lg" style="color:#2563eb"></i> Jadval ko'rinish
            </label>
          </div>
        </div>

        <div class="form-group">
          <label>Standart to'lov turi</label>
          <select id="soz_savdoTolovDefault" class="filter-select" style="width:100%">
            <option value="naqd" ${s.savdoTolovDefault==='naqd'?'selected':''}>💵 Naqd pul</option>
            <option value="karta" ${s.savdoTolovDefault==='karta'?'selected':''}>💳 Plastik karta</option>
            <option value="qarz" ${s.savdoTolovDefault==='qarz'?'selected':''}>📋 Qarz</option>
          </select>
        </div>

        <div class="form-group">
          <label>Maksimal chegirma (%)</label>
          <input type="number" id="soz_chegirmaMax" min="0" max="100" class="search-input"
            style="width:150px" value="${s.chegirmaMax||100}">
        </div>

        <div style="margin-top:16px">
          <button class="btn btn-primary" onclick="sozSavdoSaqla()">
            <i class="fas fa-save"></i> Saqlash
          </button>
        </div>
      </div>
    </div>`;
}

function sozSavdoSaqla() {
  const s = sozlamalarniOl();
  const kor = document.querySelector('[name=savdoKorinish]:checked');
  s.savdoKorinish = kor ? kor.value : 'karta';
  s.savdoTolovDefault = document.getElementById('soz_savdoTolovDefault').value;
  s.chegirmaMax = parseInt(document.getElementById('soz_chegirmaMax').value) || 100;
  sozlamalarniSaqla(s);
  toast('✅ Savdo oynasi sozlamalari saqlandi!', 'success');
}

// ===== 4. TO'LOV USULLARI SOZLAMALARI =====
function sozTolovKorsatish(s) {
  document.getElementById('sozKontent').innerHTML = `
    <div class="card">
      <div class="card-header"><h3><i class="fas fa-credit-card"></i> To'lov usullari</h3></div>
      <div class="card-body">
        <p style="color:#64748b;margin-bottom:16px;font-size:14px">
          Yoqilgan to'lov usullari kassada ko'rinadi
        </p>
        ${[
          {key:'Naqd', icon:'💵', desc:'Naqd pul'},
          {key:'Karta', icon:'💳', desc:'Plastik karta'},
          {key:'Qarz', icon:'📋', desc:'Qarzga berish'},
          {key:'BankTransfer', icon:'🏦', desc:"Bank o'tkazmasi"},
        ].map(t => `
          <div style="display:flex;align-items:center;justify-content:space-between;padding:12px;border:1px solid #e2e8f0;border-radius:8px;margin-bottom:8px">
            <div style="display:flex;align-items:center;gap:10px">
              <span style="font-size:20px">${t.icon}</span>
              <div>
                <div style="font-weight:600">${t.desc}</div>
                <input type="text" id="soz_tolov${t.key}Nomi" class="search-input"
                  style="width:200px;margin-top:4px;padding:4px 8px;font-size:12px"
                  value="${s['tolov'+t.key+'Nomi'] || t.desc}"
                  placeholder="Tugma nomi">
              </div>
            </div>
            <label style="display:flex;align-items:center;gap:8px;cursor:pointer">
              <span style="font-size:13px;color:#64748b">${s['tolov'+t.key]?'Yoqilgan':'O\'chirilgan'}</span>
              <div class="toggle-switch" onclick="tolovToggle('${t.key}',this)"
                style="width:44px;height:24px;border-radius:12px;background:${s['tolov'+t.key]?'#2563eb':'#e2e8f0'};
                position:relative;cursor:pointer;transition:background 0.2s" data-aktiv="${s['tolov'+t.key]?'1':'0'}">
                <div style="position:absolute;top:2px;width:20px;height:20px;border-radius:50%;background:white;
                  box-shadow:0 1px 3px rgba(0,0,0,0.3);transition:left 0.2s;
                  left:${s['tolov'+t.key]?'22px':'2px'}"></div>
              </div>
            </label>
          </div>`).join('')}

        <div style="margin-top:16px">
          <button class="btn btn-primary" onclick="sozTolovSaqla()">
            <i class="fas fa-save"></i> Saqlash
          </button>
        </div>
      </div>
    </div>`;
}

function tolovToggle(key, el) {
  const aktiv = el.dataset.aktiv === '1';
  const yangi = !aktiv;
  el.dataset.aktiv = yangi ? '1' : '0';
  el.style.background = yangi ? '#2563eb' : '#e2e8f0';
  el.children[0].style.left = yangi ? '22px' : '2px';
  el.previousElementSibling.textContent = yangi ? 'Yoqilgan' : "O'chirilgan";
}

function sozTolovSaqla() {
  const s = sozlamalarniOl();
  ['Naqd','Karta','Qarz','BankTransfer'].forEach(key => {
    const tog = document.querySelector(`[onclick="tolovToggle('${key}',this)"]`);
    if (tog) s['tolov'+key] = tog.dataset.aktiv === '1';
    const nomi = document.getElementById(`soz_tolov${key}Nomi`);
    if (nomi) s['tolov'+key+'Nomi'] = nomi.value;
  });
  sozlamalarniSaqla(s);
  toast('✅ To\'lov usullari saqlandi!', 'success');
}

// ===== ETIKETKA SHABLONLARI (Sozlamalar ichida) =====
async function sozEtiketkaKorsatish() {
  document.getElementById('sozKontent').innerHTML = `
    <div class="card">
      <div class="card-header">
        <h3><i class="fas fa-tag"></i> Etiketka shablonlari</h3>
        <div style="display:flex;gap:8px">
          <button class="btn btn-primary btn-sm" onclick="sozEtiketkaYangiQosh()">
            <i class="fas fa-plus"></i> Yangi shablon
          </button>
          <button class="btn btn-secondary btn-sm" onclick="sahifaOch('etiketka')">
            <i class="fas fa-external-link-alt"></i> Dizaynerga o'tish
          </button>
        </div>
      </div>
      <div class="card-body" id="sozEtiketkaDiv">
        <div style="text-align:center"><i class="fas fa-spinner fa-spin fa-2x"></i></div>
      </div>
    </div>`;
  await sozEtiketkaRoyxatYukla();
}

async function sozEtiketkaRoyxatYukla() {
  try {
    const shablonlar = await apiGet('/etiketka');
    const div = document.getElementById('sozEtiketkaDiv');
    if (!div) return;

    if (!shablonlar.length) {
      div.innerHTML = `
        <div class="empty-state" style="padding:40px">
          <i class="fas fa-tag fa-3x" style="opacity:0.2;margin-bottom:16px"></i>
          <p style="margin-bottom:16px">Hali shablon yaratilmagan</p>
          <button class="btn btn-primary" onclick="sozEtiketkaYangiQosh()">
            <i class="fas fa-plus"></i> Birinchi shablonni yarating
          </button>
        </div>`;
      return;
    }

    div.innerHTML = `
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:16px">
        ${shablonlar.map(s => `
          <div style="border:1px solid #e2e8f0;border-radius:12px;overflow:hidden;
            transition:all 0.2s;background:white"
            onmouseover="this.style.boxShadow='0 4px 16px rgba(0,0,0,0.08)'"
            onmouseout="this.style.boxShadow=''">
            <!-- PREVIEW -->
            <div style="background:#f8fafc;padding:16px;display:flex;align-items:center;justify-content:center;min-height:80px">
              <div style="background:white;border:1px solid #e2e8f0;border-radius:4px;
                padding:8px;box-shadow:0 1px 4px rgba(0,0,0,0.1);font-size:10px;text-align:center">
                <div style="width:${Math.min(120,s.uzunlik*1.5)}px;height:${Math.min(60,s.balandlik*1.5)}px;
                  display:flex;align-items:center;justify-content:center;color:#64748b">
                  <div>
                    <div style="font-size:8px;font-weight:600">${s.nomi}</div>
                    <div style="font-size:7px;color:#94a3b8;margin-top:2px">${s.uzunlik}×${s.balandlik}mm</div>
                    <div style="font-size:7px;color:#94a3b8">
                      ${JSON.parse(s.elementlar||'[]').length} ta element
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <!-- INFO -->
            <div style="padding:12px">
              <div style="font-weight:700;font-size:14px;margin-bottom:4px">${s.nomi}</div>
              <div style="font-size:12px;color:#64748b;margin-bottom:10px">
                📏 ${s.uzunlik}×${s.balandlik}mm |
                📦 ${JSON.parse(s.elementlar||'[]').length} ta element
              </div>
              <div style="display:flex;gap:6px">
                <button class="btn btn-primary btn-sm" style="flex:1"
                  onclick="sozEtiketkaOch(${s.id})">
                  <i class="fas fa-edit"></i> Tahrirlash
                </button>
                <button class="btn btn-success btn-sm btn-icon"
                  onclick="sozEtiketkaChiqar(${s.id})" title="Etiketka chiqarish">
                  <i class="fas fa-print"></i>
                </button>
                <button class="btn btn-danger btn-sm btn-icon"
                  onclick="sozEtiketkaOchir(${s.id},'${s.nomi.replace(/'/g,"\\'")}')" title="O'chirish">
                  <i class="fas fa-trash"></i>
                </button>
              </div>
            </div>
          </div>`).join('')}
      </div>
      <div style="padding:10px;color:#64748b;font-size:13px;margin-top:8px">
        Jami: ${shablonlar.length} ta shablon
      </div>`;
  } catch(e) { toast(e.message, 'error'); }
}

async function sozEtiketkaYangiQosh() {
  // Nom so'rash
  const nomi = await new Promise(resolve => {
    modalOch('Yangi etiketka shabloni', `
      <div class="form-group">
        <label style="font-weight:600">Shablon nomi *</label>
        <input type="text" id="yangiShablonNomi" autofocus
          style="width:100%;padding:10px;border:2px solid #e2e8f0;border-radius:8px;font-size:14px"
          placeholder="Masalan: Asosiy etiketka 58×30mm"
          onkeypress="if(event.key==='Enter'){modalYop();document.getElementById('yangiShablonNomi').blur()}">
      </div>
      <div style="margin-bottom:12px">
        <div style="font-weight:600;font-size:13px;margin-bottom:8px">Standart o'lchamlar:</div>
        <div style="display:flex;gap:6px;flex-wrap:wrap">
          ${[['58×30mm','58','30'],['58×40mm','58','40'],['40×30mm','40','30'],
             ['80×50mm','80','50'],['100×50mm','100','50'],['100×150mm','100','150']]
            .map(([n,u,b]) => `
              <button onclick="sozShablonOlchamTanla('${u}','${b}','${n}')"
                style="padding:5px 12px;border:1px solid #e2e8f0;border-radius:6px;
                background:white;font-size:12px;cursor:pointer"
                id="olcham_${u}_${b}"
                onmouseover="this.style.background='#f1f5f9'"
                onmouseout="if(!this.dataset.tanlandi)this.style.background='white'">${n}</button>`).join('')}
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label style="font-size:12px">Uzunlik (mm)</label>
          <input type="number" id="yangiUzunlik" value="58" min="10"
            style="width:100%;padding:8px;border:1px solid #e2e8f0;border-radius:6px">
        </div>
        <div class="form-group">
          <label style="font-size:12px">Balandlik (mm)</label>
          <input type="number" id="yangiBalandlik" value="30" min="10"
            style="width:100%;padding:8px;border:1px solid #e2e8f0;border-radius:6px">
        </div>
      </div>
      <div class="modal-footer" style="padding:0">
        <button class="btn btn-secondary" onclick="modalYop()">Bekor</button>
        <button class="btn btn-primary" onclick="sozEtiketkaYaratish()">
          <i class="fas fa-magic"></i> Yaratish va tahrirlash
        </button>
      </div>`);
  });
}

function sozShablonOlchamTanla(u, b, n) {
  document.getElementById('yangiUzunlik').value = u;
  document.getElementById('yangiBalandlik').value = b;
  document.querySelectorAll('[id^=olcham_]').forEach(el => {
    el.style.background = 'white';
    el.style.borderColor = '#e2e8f0';
    delete el.dataset.tanlandi;
  });
  const btn = document.getElementById(`olcham_${u}_${b}`);
  if (btn) { btn.style.background='#eff6ff'; btn.style.borderColor='#2563eb'; btn.dataset.tanlandi='1'; }
}

async function sozEtiketkaYaratish() {
  const nomi    = document.getElementById('yangiShablonNomi')?.value?.trim();
  const uzunlik = parseFloat(document.getElementById('yangiUzunlik')?.value) || 58;
  const balandlik = parseFloat(document.getElementById('yangiBalandlik')?.value) || 30;
  if (!nomi) { toast('Shablon nomini kiriting!', 'warning'); return; }
  try {
    const r = await apiPost('/etiketka', { nomi, uzunlik, balandlik, elementlar: [] });
    modalYop();
    toast('✅ Shablon yaratildi! Dizaynerga o\'tmoqda...', 'success');
    // Dizaynerga o'tib shablonni yuklash
    setTimeout(async () => {
      sahifaOch('etiketka');
      await new Promise(res => setTimeout(res, 500));
      if (typeof eShablonYukla === 'function') eShablonYukla(r.id);
    }, 300);
  } catch(e) { toast(e.message, 'error'); }
}

function sozEtiketkaOch(id) {
  sahifaOch('etiketka');
  setTimeout(async () => {
    await new Promise(res => setTimeout(res, 500));
    if (typeof eShablonYukla === 'function') eShablonYukla(id);
  }, 300);
}

async function sozEtiketkaChiqar(id) {
  // Mahsulot tanlash modali
  try {
    const mahsulotlar = await apiGet('/mahsulotlar');
    modalOch('🏷️ Qaysi mahsulot uchun etiketka?', `
      <div style="margin-bottom:10px">
        <input type="text" id="etiketMahQidiruv" class="search-input"
          placeholder="🔍 Mahsulot qidirish..." oninput="etiketMahFilter()"
          style="width:100%">
      </div>
      <div id="etiketMahRoyxat" style="max-height:320px;overflow-y:auto">
        ${sozEtiketkaMahsulotlarHtml(mahsulotlar, id)}
      </div>
      <div class="modal-footer" style="padding:0;margin-top:12px">
        <button class="btn btn-secondary" onclick="modalYop()">Bekor</button>
      </div>`);
    window._etiketMahsulotlar = mahsulotlar;
    window._etiketShablonId = id;
  } catch(e) { toast(e.message,'error'); }
}

function sozEtiketkaMahsulotlarHtml(royxat, shablon_id) {
  if (!royxat.length) return '<div class="empty-state"><i class="fas fa-box-open"></i><p>Mahsulot topilmadi</p></div>';
  return royxat.map(m => `
    <div onclick="sozEtiketkaChiqarMahsulot(${m.id},${shablon_id})"
      style="padding:10px 12px;border:1px solid #e2e8f0;border-radius:8px;margin-bottom:6px;
      cursor:pointer;display:flex;align-items:center;gap:10px"
      onmouseover="this.style.background='#f0f9ff'" onmouseout="this.style.background='white'">
      ${m.rasm ? `<img src="${m.rasm}" style="width:36px;height:36px;object-fit:cover;border-radius:6px;flex-shrink:0">` :
        `<div style="width:36px;height:36px;background:#f1f5f9;border-radius:6px;display:flex;align-items:center;justify-content:center;flex-shrink:0"><i class="fas fa-box" style="color:#cbd5e1"></i></div>`}
      <div style="flex:1">
        <div style="font-weight:600;font-size:13px">${m.nomi}</div>
        <div style="font-size:11px;color:#64748b">${m.kategoriya_nomi||''} | ${formatSum(m.sotish_narxi)}</div>
      </div>
      <i class="fas fa-print" style="color:#2563eb"></i>
    </div>`).join('');
}

function etiketMahFilter() {
  const q = document.getElementById('etiketMahQidiruv')?.value.toLowerCase() || '';
  const f = (window._etiketMahsulotlar||[]).filter(m => m.nomi.toLowerCase().includes(q));
  document.getElementById('etiketMahRoyxat').innerHTML = sozEtiketkaMahsulotlarHtml(f, window._etiketShablonId);
}

async function sozEtiketkaChiqarMahsulot(mahsulot_id, shablon_id) {
  modalYop();
  try {
    eJoriyMahsulot = await apiGet('/mahsulotlar/' + mahsulot_id);
    await eShablonBilanChiqar(shablon_id);
  } catch(e) { toast(e.message, 'error'); }
}

function sozEtiketkaOchir(id, nomi) {
  tasdiqlash(`"${nomi}" shablonini o'chirasizmi?`, async () => {
    try {
      await apiDelete('/etiketka/' + id);
      toast('Shablon o\'chirildi!');
      sozEtiketkaRoyxatYukla();
    } catch(e) { toast(e.message, 'error'); }
  });
}

// ===== INTEGRATSIYA SOZLAMALARI =====
async function sozIntegratsiyaKorsatish() {
  document.getElementById('sozKontent').innerHTML = `
    <div style="display:flex;flex-direction:column;gap:16px">
      <div class="card">
        <div class="card-header">
          <div style="display:flex;align-items:center;gap:10px">
            <div style="width:40px;height:40px;border-radius:10px;background:#229ed9;
              display:flex;align-items:center;justify-content:center">
              <i class="fab fa-telegram" style="color:white;font-size:20px"></i>
            </div>
            <div>
              <div style="font-weight:700;font-size:15px">Telegram Bot</div>
              <div style="font-size:12px;color:#64748b">Kunlik jurnal va bildirishnomalar</div>
            </div>
          </div>
          <div id="telegramHolat" style="font-size:12px;color:#94a3b8">Yuklanmoqda...</div>
        </div>
        <div class="card-body">

          <!-- FAQAT TOKEN KERAK -->
          <div style="background:#f0f9ff;border:1px solid #bae6fd;border-radius:10px;
            padding:14px;margin-bottom:16px">
            <div style="font-weight:700;font-size:13px;color:#0369a1;margin-bottom:8px">
              <i class="fas fa-info-circle"></i> Qanday ulash? (2 qadam)
            </div>
            <ol style="font-size:13px;color:#0c4a6e;line-height:2.2;padding-left:16px">
              <li>Telegramda <b>@BotFather</b> ga yozing → <code>/newbot</code> → Token oling</li>
              <li>Tokenni kiriting → <b>"Ulash"</b> tugmasini bosing — hammasi tayyor! ✅</li>
            </ol>
          </div>

          <div class="form-group">
            <label style="font-weight:600;font-size:14px">
              <i class="fab fa-telegram" style="color:#229ed9"></i> Bot Token *
            </label>
            <div style="display:flex;gap:8px">
              <input type="password" id="tgToken"
                style="flex:1;padding:11px 14px;border:2px solid #e2e8f0;border-radius:8px;font-size:14px"
                placeholder="1234567890:AAEhBOweik6ad3gM5Zn_example">
              <button class="btn btn-secondary btn-sm" onclick="tokenKorsatYashir()" id="tokenKozBtn">
                <i class="fas fa-eye"></i>
              </button>
            </div>
            <div style="font-size:11px;color:#94a3b8;margin-top:4px">
              @BotFather → /newbot → yuborilgan token
            </div>
          </div>

          <!-- CHAT ID — avtomatik topiladi -->
          <div class="form-group">
            <label style="font-weight:600;font-size:14px">Chat ID
              <span style="font-size:11px;font-weight:400;color:#94a3b8">(avtomatik topiladi)</span>
            </label>
            <div style="display:flex;gap:8px">
              <input type="text" id="tgChatId" readonly
                style="flex:1;padding:11px 14px;border:2px solid #e2e8f0;border-radius:8px;
                font-size:14px;background:#f8fafc;color:#475569"
                placeholder="Token kiritib 'Ulash' bosganingizda avtomatik to'ladi">
              <button class="btn btn-primary btn-sm" onclick="chatIdTopish()" title="Chat ID ni avtomatik topish">
                <i class="fas fa-search"></i> Topish
              </button>
            </div>
            <div style="font-size:11px;color:#64748b;margin-top:4px">
              💡 Chat ID ni topish uchun: Botingizga <b>/start</b> yuboring, keyin <b>"Topish"</b> bosing
            </div>
          </div>

          <!-- BILDIRISHNOMALAR -->
          <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;
            padding:14px;margin-bottom:16px">
            <div style="font-weight:700;font-size:13px;margin-bottom:10px">
              <i class="fas fa-bell"></i> Qanday xabarlar kesin?
            </div>
            <div style="display:flex;flex-direction:column;gap:8px">
              ${[
                {id:'har_sotuv',    n:'Har sotuv bo\'lganda xabar',        e:'🛒'},
                {id:'kunlik_avtom', n:'Kun oxirida hisobotni avtomatik yuborish', e:'📊'},
                {id:'kam_mahsulot', n:'Mahsulot kam qolganda xabar',        e:'⚠️'},
                {id:'kechikkan_qarz',n:'Kechikkan qarzlar haqida xabar',   e:'⏰'},
              ].map(b=>`
                <label style="display:flex;align-items:center;gap:10px;cursor:pointer;
                  padding:8px 12px;border:1px solid #e2e8f0;border-radius:8px;background:white">
                  <input type="checkbox" id="tg_${b.id}" style="width:16px;height:16px;cursor:pointer">
                  <span style="font-size:13px">${b.e} ${b.n}</span>
                </label>`).join('')}
            </div>
          </div>

          <!-- TUGMALAR -->
          <div style="display:flex;gap:8px;flex-wrap:wrap">
            <button class="btn btn-primary" onclick="telegramUlash()" style="flex:1">
              <i class="fab fa-telegram"></i> Ulash va saqlash
            </button>
            <button class="btn btn-secondary" onclick="telegramTest()">
              <i class="fas fa-paper-plane"></i> Test
            </button>
            <button class="btn btn-success" onclick="telegramKunlikYuborish()">
              <i class="fas fa-chart-bar"></i> Hisobot yuborish
            </button>
          </div>

          <div id="tgStatus" style="display:none;margin-top:12px;padding:10px 14px;border-radius:8px;font-size:13px"></div>
        </div>
      </div>
    </div>`;

  // Mavjud sozlamalarni yuklash
  try {
    const data = await apiGet('/integratsiya/telegram');
    if (data && data.token) {
      document.getElementById('tgToken').value = data.token;
      document.getElementById('tgChatId').value = data.chat_id || '';
      const soz = JSON.parse(data.sozlamalar || '{}');
      ['har_sotuv','kunlik_avtom','kam_mahsulot','kechikkan_qarz'].forEach(k => {
        const el = document.getElementById('tg_' + k);
        if (el) el.checked = soz[k] || false;
      });
      const h = document.getElementById('telegramHolat');
      if (h) h.innerHTML = data.faol
        ? '<span style="color:#10b981;font-weight:600">● Ulangan</span>'
        : '<span style="color:#94a3b8">● Ulanmagan</span>';
    } else {
      const h = document.getElementById('telegramHolat');
      if (h) h.innerHTML = '<span style="color:#94a3b8">● Sozlanmagan</span>';
    }
  } catch(e) {}
}

// ===== CHAT ID AVTOMATIK TOPISH =====
async function chatIdTopish() {
  const token = document.getElementById('tgToken')?.value?.trim();
  if (!token) { toast('Avval token kiriting!', 'warning'); return; }

  const statusDiv = document.getElementById('tgStatus');
  if (statusDiv) {
    statusDiv.style.display = 'block';
    statusDiv.style.background = '#f8fafc';
    statusDiv.style.border = '1px solid #e2e8f0';
    statusDiv.style.color = '#475569';
    statusDiv.innerHTML = '⏳ Bot bilan bog\'lanilmoqda...';
  }

  try {
    // Telegram getUpdates orqali chat_id topish
    const r = await fetch(`https://api.telegram.org/bot${token}/getUpdates`);
    const data = await r.json();

    if (!data.ok) {
      throw new Error(data.description || 'Token noto\'g\'ri!');
    }

    const updates = data.result;
    if (!updates || updates.length === 0) {
      if (statusDiv) {
        statusDiv.style.background = '#fffbeb';
        statusDiv.style.border = '1px solid #fcd34d';
        statusDiv.style.color = '#92400e';
        statusDiv.innerHTML = `
          ⚠️ Xabar topilmadi! Avval botingizga <b>/start</b> yuboring, keyin qayta bosing.
          <br>Botingiz: <b>t.me/...</b>`;
      }
      return;
    }

    // Oxirgi xabardan chat_id olish
    const lastUpdate = updates[updates.length - 1];
    const chatId = lastUpdate.message?.chat?.id ||
                   lastUpdate.channel_post?.chat?.id ||
                   lastUpdate.callback_query?.message?.chat?.id;
    const chatIsmi = lastUpdate.message?.chat?.first_name ||
                     lastUpdate.message?.chat?.title || '';

    if (chatId) {
      document.getElementById('tgChatId').value = chatId;
      if (statusDiv) {
        statusDiv.style.background = '#f0fdf4';
        statusDiv.style.border = '1px solid #bbf7d0';
        statusDiv.style.color = '#166534';
        statusDiv.innerHTML = `✅ Chat ID topildi: <b>${chatId}</b>${chatIsmi ? ' — ' + chatIsmi : ''}`;
      }
      toast(`✅ Chat ID topildi: ${chatId}`, 'success');
    }
  } catch(err) {
    if (statusDiv) {
      statusDiv.style.background = '#fff1f2';
      statusDiv.style.border = '1px solid #fecaca';
      statusDiv.style.color = '#991b1b';
      statusDiv.innerHTML = `❌ Xato: ${err.message}`;
    }
    toast('❌ ' + err.message, 'error');
  }
}

// ===== TELEGRAM ULASH VA SAQLASH =====
async function telegramUlash() {
  const token   = document.getElementById('tgToken')?.value?.trim();
  const chat_id = document.getElementById('tgChatId')?.value?.trim();

  if (!token) { toast('Token kiritilmagan!', 'warning'); return; }

  // Chat ID yo'q bo'lsa avtomatik topishga harakat
  if (!chat_id) {
    toast('Chat ID topilmoqda...', 'success');
    await chatIdTopish();
    const yangiChatId = document.getElementById('tgChatId')?.value?.trim();
    if (!yangiChatId) {
      toast('⚠️ Botingizga /start yuboring, keyin qayta bosing!', 'warning');
      return;
    }
  }

  const finalChatId = document.getElementById('tgChatId')?.value?.trim();
  const sozlamalar = {};
  ['har_sotuv','kunlik_avtom','kam_mahsulot','kechikkan_qarz'].forEach(k => {
    sozlamalar[k] = document.getElementById('tg_' + k)?.checked || false;
  });

  try {
    await apiPost('/integratsiya', { tur:'telegram', token, chat_id: finalChatId, faol: 1, sozlamalar });
    toast('✅ Telegram ulandi!', 'success');
    const h = document.getElementById('telegramHolat');
    if (h) h.innerHTML = '<span style="color:#10b981;font-weight:600">● Ulangan</span>';

    // Test xabar yuborish
    const statusDiv = document.getElementById('tgStatus');
    if (statusDiv) {
      statusDiv.style.display = 'block';
      statusDiv.style.background = '#f0fdf4';
      statusDiv.style.border = '1px solid #bbf7d0';
      statusDiv.style.color = '#166534';
      statusDiv.innerHTML = '⏳ Test xabar yuborilmoqda...';
    }
    const r = await apiPost('/telegram/test', { token, chat_id: finalChatId });
    if (r.muvaffaqiyat && statusDiv) {
      statusDiv.innerHTML = '✅ Telegram muvaffaqiyatli ulandi! Test xabar yuborildi.';
    }
  } catch(e) { toast(e.message, 'error'); }
}

function tokenKorsatYashir() {
  const inp = document.getElementById('tgToken');
  const btn = document.getElementById('tokenKozBtn');
  if (!inp) return;
  if (inp.type === 'password') { inp.type='text'; btn.innerHTML='<i class="fas fa-eye-slash"></i>'; }
  else { inp.type='password'; btn.innerHTML='<i class="fas fa-eye"></i>'; }
}

async function telegramTest() {
  const token   = document.getElementById('tgToken')?.value?.trim();
  const chat_id = document.getElementById('tgChatId')?.value?.trim();
  if (!token || !chat_id) { toast('Avval "Ulash" tugmasini bosing!', 'warning'); return; }
  const statusDiv = document.getElementById('tgStatus');
  if (statusDiv) {
    statusDiv.style.display='block';
    statusDiv.style.background='#f8fafc';
    statusDiv.style.border='1px solid #e2e8f0';
    statusDiv.style.color='#475569';
    statusDiv.textContent='⏳ Yuborilmoqda...';
  }
  try {
    const r = await apiPost('/telegram/test', { token, chat_id });
    if (r.muvaffaqiyat) {
      if (statusDiv) { statusDiv.style.background='#f0fdf4'; statusDiv.style.border='1px solid #bbf7d0'; statusDiv.style.color='#166534'; statusDiv.textContent='✅ Test xabar yuborildi! Telegramni tekshiring.'; }
      toast('✅ Test xabar yuborildi!', 'success');
    } else throw new Error(r.xato||'Xato');
  } catch(e) {
    if (statusDiv) { statusDiv.style.background='#fff1f2'; statusDiv.style.border='1px solid #fecaca'; statusDiv.style.color='#991b1b'; statusDiv.textContent=`❌ ${e.message}`; }
    toast('❌ ' + e.message, 'error');
  }
}

async function telegramKunlikYuborish() {
  const statusDiv = document.getElementById('tgStatus');
  if (statusDiv) { statusDiv.style.display='block'; statusDiv.style.background='#f8fafc'; statusDiv.style.border='1px solid #e2e8f0'; statusDiv.style.color='#475569'; statusDiv.textContent='⏳ Hisobot yuborilmoqda...'; }
  try {
    const bugun = new Date().toISOString().split('T')[0];
    const r = await apiPost('/telegram/kunlik', { sana: bugun });
    if (r.muvaffaqiyat) {
      if (statusDiv) { statusDiv.style.background='#f0fdf4'; statusDiv.style.border='1px solid #bbf7d0'; statusDiv.style.color='#166534'; statusDiv.textContent='✅ Bugungi hisobot Telegramga yuborildi!'; }
      toast('✅ Hisobot yuborildi!', 'success');
    } else throw new Error(r.xato||'Xato');
  } catch(e) {
    if (statusDiv) { statusDiv.style.background='#fff1f2'; statusDiv.style.border='1px solid #fecaca'; statusDiv.style.color='#991b1b'; statusDiv.textContent=`❌ ${e.message}`; }
    toast('❌ ' + e.message, 'error');
  }
}
  document.getElementById('sozKontent').innerHTML = `
    <div style="display:flex;flex-direction:column;gap:16px">

      <!-- TELEGRAM -->
      <div class="card">
        <div class="card-header">
          <div style="display:flex;align-items:center;gap:10px">
            <div style="width:40px;height:40px;border-radius:10px;background:#229ed9;
              display:flex;align-items:center;justify-content:center">
              <i class="fab fa-telegram" style="color:white;font-size:20px"></i>
            </div>
            <div>
              <div style="font-weight:700;font-size:15px">Telegram Bot</div>
              <div style="font-size:12px;color:#64748b">Kunlik jurnal va bildirishnomalar</div>
            </div>
          </div>
          <div id="telegramHolat" style="font-size:12px;color:#94a3b8">Yuklanmoqda...</div>
        </div>
        <div class="card-body">

          <!-- QANDAY ULASH -->
          <div style="background:#f0f9ff;border:1px solid #bae6fd;border-radius:10px;
            padding:14px;margin-bottom:16px">
            <div style="font-weight:700;font-size:13px;color:#0369a1;margin-bottom:8px">
              <i class="fas fa-info-circle"></i> Qanday ulash?
            </div>
            <ol style="font-size:12px;color:#0c4a6e;line-height:2;padding-left:16px">
              <li>Telegramda <b>@BotFather</b> ga yozing → <code>/newbot</code></li>
              <li>Bot nomini bering → <b>Token</b> oling (bu yerga kiriting)</li>
              <li>Botingizga <b>/start</b> yuboring</li>
              <li>Telegramda <b>@userinfobot</b> ga yozing → <b>Chat ID</b> oling</li>
              <li><b>Test yuborish</b> tugmasini bosing ✅</li>
            </ol>
          </div>

          <div class="form-group">
            <label style="font-weight:600">Bot Token *</label>
            <div style="display:flex;gap:8px">
              <input type="password" id="tgToken"
                style="flex:1;padding:10px;border:2px solid #e2e8f0;border-radius:8px;font-size:14px"
                placeholder="1234567890:AAEhBOweik6ad3gM5...">
              <button class="btn btn-secondary btn-sm" onclick="tokenKorsatYashir()"
                id="tokenKozBtn" title="Ko'rish/yashirish">
                <i class="fas fa-eye"></i>
              </button>
            </div>
            <div style="font-size:11px;color:#94a3b8;margin-top:4px">
              @BotFather dan olingan token
            </div>
          </div>

          <div class="form-group">
            <label style="font-weight:600">Chat ID *</label>
            <input type="text" id="tgChatId"
              style="width:100%;padding:10px;border:2px solid #e2e8f0;border-radius:8px;font-size:14px"
              placeholder="-1001234567890 yoki 123456789">
            <div style="font-size:11px;color:#94a3b8;margin-top:4px">
              @userinfobot orqali oling | Guruh uchun manfiy raqam
            </div>
          </div>

          <!-- BILDIRISHNOMA SOZLAMALARI -->
          <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;
            padding:14px;margin-bottom:16px">
            <div style="font-weight:700;font-size:13px;margin-bottom:10px">
              <i class="fas fa-bell"></i> Bildirishnomalar
            </div>
            <div style="display:flex;flex-direction:column;gap:8px">
              ${[
                {id:'har_sotuv',     nomi:'Har sotuv bo\'lganda xabar',      emoji:'🛒'},
                {id:'kunlik_avtom',  nomi:'Kunlik hisobotni avtomatik yuborish', emoji:'📊'},
                {id:'kam_mahsulot',  nomi:'Kam qolgan mahsulot xabari',      emoji:'⚠️'},
                {id:'qaytarish',     nomi:'Qaytarish bo\'lganda xabar',       emoji:'↩️'},
              ].map(b => `
                <label style="display:flex;align-items:center;gap:10px;cursor:pointer;
                  padding:8px 12px;border:1px solid #e2e8f0;border-radius:8px;background:white">
                  <input type="checkbox" id="tg_${b.id}"
                    style="width:16px;height:16px;cursor:pointer">
                  <span style="font-size:13px">${b.emoji} ${b.nomi}</span>
                </label>`).join('')}
            </div>
          </div>

          <!-- TUGMALAR -->
          <div style="display:flex;gap:8px;flex-wrap:wrap">
            <button class="btn btn-primary" onclick="telegramSaqla()">
              <i class="fas fa-save"></i> Saqlash
            </button>
            <button class="btn btn-secondary" onclick="telegramTest()">
              <i class="fab fa-telegram"></i> Test yuborish
            </button>
            <button class="btn btn-success" onclick="telegramKunlikYuborish()">
              <i class="fas fa-chart-bar"></i> Bugungi hisobot yuborish
            </button>
          </div>

          <!-- STATUS -->
          <div id="tgStatus" style="display:none;margin-top:12px;padding:10px 14px;border-radius:8px;font-size:13px"></div>

        </div>
      </div>

    </div>`;

  // Mavjud sozlamalarni yuklash
  try {
    const data = await apiGet('/integratsiya/telegram');
    if (data && data.token) {
      document.getElementById('tgToken').value = data.token;
      document.getElementById('tgChatId').value = data.chat_id || '';
      // Bildirishnomalarni yuklash
      const soz = JSON.parse(data.sozlamalar || '{}');
      ['har_sotuv','kunlik_avtom','kam_mahsulot','qaytarish'].forEach(k => {
        const el = document.getElementById('tg_' + k);
        if (el) el.checked = soz[k] || false;
      });
      const holat = document.getElementById('telegramHolat');
      if (holat) {
        holat.innerHTML = data.faol
          ? '<span style="color:#10b981;font-weight:600">● Ulangan</span>'
          : '<span style="color:#94a3b8">● Ulanmagan</span>';
      }
    } else {
      const holat = document.getElementById('telegramHolat');
      if (holat) holat.innerHTML = '<span style="color:#94a3b8">● Sozlanmagan</span>';
    }
  } catch(e) {
    const holat = document.getElementById('telegramHolat');
    if (holat) holat.innerHTML = '<span style="color:#94a3b8">● Sozlanmagan</span>';
  }

function sozlamalarniQolla() {
  const s = sozlamalarniOl();
  // Rang
  const ranglar = {moviy:'#2563eb', yashil:'#10b981', toq:'#7c3aed', qizil:'#ef4444', toshrang:'#475569'};
  if (ranglar[s.rangTema]) {
    document.documentElement.style.setProperty('--primary', ranglar[s.rangTema]);
  }
}


