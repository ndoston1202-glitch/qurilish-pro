// ===== QARZ TIZIMI =====

// Kassada qarz sotuvida muddat tanlash
function qarzMuddatModal(callback) {
  const bugun = new Date();
  const default30 = new Date(bugun.getTime() + 30*24*60*60*1000).toISOString().split('T')[0];

  modalOch('📋 Qarz muddatini belgilang', `
    <div>
      <div style="background:#fff1f2;border:1px solid #fecaca;border-radius:8px;
        padding:12px;margin-bottom:14px;font-size:13px;color:#991b1b">
        <i class="fas fa-exclamation-triangle"></i>
        Qarzga sotish — muddat belgilash tavsiya etiladi
      </div>
      <div class="form-group">
        <label style="font-weight:600">To'lov muddati</label>
        <input type="date" id="qarzMuddatInp"
          value="${default30}"
          min="${bugun.toISOString().split('T')[0]}"
          style="width:100%;padding:10px;border:2px solid #e2e8f0;border-radius:8px;font-size:15px">
        <div style="display:flex;gap:6px;margin-top:8px;flex-wrap:wrap">
          ${[
            {n:'3 kun',  d:3},  {n:'7 kun',   d:7},
            {n:'14 kun', d:14}, {n:'30 kun',  d:30},
            {n:'60 kun', d:60}, {n:'Muddatsiz', d:0},
          ].map(t => `
            <button type="button" onclick="qarzMuddatBelgila(${t.d})"
              style="padding:4px 10px;border:1px solid #e2e8f0;border-radius:6px;
              background:white;font-size:12px;cursor:pointer"
              onmouseover="this.style.background='#f1f5f9'"
              onmouseout="this.style.background='white'">${t.n}</button>`).join('')}
        </div>
      </div>
      <div class="form-group">
        <label style="font-size:12px;color:#64748b">Izoh (ixtiyoriy)</label>
        <input type="text" id="qarzIzohInp" placeholder="Masalan: 1 oyga berdi..."
          style="width:100%;padding:8px;border:1px solid #e2e8f0;border-radius:6px;font-size:13px">
      </div>
      <div class="modal-footer" style="padding:0">
        <button class="btn btn-secondary" onclick="modalYop();(${callback.toString()})('')">
          Muddatsiz davom etish
        </button>
        <button class="btn btn-danger" onclick="qarzMuddatTasdiqlash(${callback.toString()})">
          <i class="fas fa-check"></i> Tasdiqlash
        </button>
      </div>
    </div>`);
}

function qarzMuddatBelgila(kunlar) {
  if (kunlar === 0) {
    document.getElementById('qarzMuddatInp').value = '';
    return;
  }
  const d = new Date();
  d.setDate(d.getDate() + kunlar);
  document.getElementById('qarzMuddatInp').value = d.toISOString().split('T')[0];
}

function qarzMuddatTasdiqlash(callback) {
  const muddat = document.getElementById('qarzMuddatInp')?.value || '';
  const izoh   = document.getElementById('qarzIzohInp')?.value  || '';
  modalYop();
  callback(muddat, izoh);
}

// ===== QARZLAR SAHIFASI (Kassa hisobi ichida) =====
async function qarzlarSahifaYukla() {
  const div = document.getElementById('asosiyKontent');
  const bugun = bugunSana();

  div.innerHTML = `
    <div style="max-width:1000px">
      <!-- STATISTIKA -->
      <div class="stats-grid" style="margin-bottom:16px" id="qarzStatDiv">
        <div style="text-align:center"><i class="fas fa-spinner fa-spin fa-2x"></i></div>
      </div>

      <!-- QARZLAR JADVALI -->
      <div class="card">
        <div class="card-header">
          <h3><i class="fas fa-clock" style="color:#ef4444"></i> Qarzlar jadvali</h3>
          <div class="filter-bar">
            <select id="qarzHolatFilter" class="filter-select" onchange="qarzlarYukla()">
              <option value="ochiq">Ochiq qarzlar</option>
              <option value="kechikkan">Kechikkanlar</option>
              <option value="">Barchasi</option>
            </select>
            <input type="text" id="qarzQidiruv" class="search-input"
              placeholder="🔍 Mijoz qidirish..." oninput="qarzFilter()"
              style="width:180px">
          </div>
        </div>
        <div class="card-body" id="qarzlarJadval">
          <div style="text-align:center"><i class="fas fa-spinner fa-spin fa-2x"></i></div>
        </div>
      </div>
    </div>`;

  await qarzlarYukla();
  await qarzStatYukla();
}

async function qarzStatYukla() {
  try {
    const barchasi = await apiGet('/qarz_tarixi?holat=ochiq');
    const bugun = bugunSana();
    const kechikkan = barchasi.filter(q => q.status === 'kechikkan');
    const bugungi   = barchasi.filter(q => q.status === 'bugun');
    const yaqin     = barchasi.filter(q => q.status === 'yaqin');
    const jamiQarz  = barchasi.reduce((s,q) => s+(q.qoldi||0), 0);

    document.getElementById('qarzStatDiv').innerHTML = `
      <div class="stat-card" style="cursor:pointer" onclick="document.getElementById('qarzHolatFilter').value='kechikkan';qarzlarYukla()">
        <div class="stat-icon red"><i class="fas fa-exclamation-circle"></i></div>
        <div class="stat-info">
          <h3 style="color:#ef4444">${kechikkan.length}</h3>
          <p>Kechikkan qarzlar</p>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon orange"><i class="fas fa-clock"></i></div>
        <div class="stat-info">
          <h3 style="color:#f59e0b">${bugungi.length + yaqin.length}</h3>
          <p>Bugun/3 kun ichida</p>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon blue"><i class="fas fa-list"></i></div>
        <div class="stat-info"><h3>${barchasi.length}</h3><p>Jami ochiq qarz</p></div>
      </div>
      <div class="stat-card">
        <div class="stat-icon red"><i class="fas fa-money-bill"></i></div>
        <div class="stat-info">
          <h3 style="color:#ef4444">${formatSum(jamiQarz)}</h3>
          <p>Jami qarz summa</p>
        </div>
      </div>`;
  } catch(e) {}
}

let _qarzlarData = [];

async function qarzlarYukla() {
  const holat = document.getElementById('qarzHolatFilter')?.value || 'ochiq';
  const div = document.getElementById('qarzlarJadval');
  if (!div) return;
  div.innerHTML = '<div style="text-align:center;padding:20px"><i class="fas fa-spinner fa-spin fa-2x"></i></div>';

  try {
    const params = holat ? `holat=${holat}` : '';
    _qarzlarData = await apiGet('/qarz_tarixi' + (params ? '?'+params : ''));
    qarzJadvalKorsatish(_qarzlarData);
  } catch(e) { toast(e.message,'error'); }
}

function qarzFilter() {
  const q = document.getElementById('qarzQidiruv')?.value?.toLowerCase() || '';
  const f = _qarzlarData.filter(x =>
    (x.mijoz_ismi||'').toLowerCase().includes(q) ||
    (x.mijoz_telefon||'').includes(q));
  qarzJadvalKorsatish(f);
}

function qarzStatusBadge(q) {
  const map = {
    kechikkan: { bg:'#fee2e2', color:'#991b1b', icon:'fa-exclamation-circle',
                 matn: q.kechikkan_kun > 0 ? `${q.kechikkan_kun} kun kechikdi` : 'Kechikkan' },
    bugun:     { bg:'#fef3c7', color:'#92400e', icon:'fa-clock',       matn: 'Bugun!' },
    yaqin:     { bg:'#fef9c3', color:'#854d0e', icon:'fa-bell',        matn: '3 kun' },
    normal:    { bg:'#dcfce7', color:'#166534', icon:'fa-check-circle', matn: 'Vaqtida' },
    muddatsiz: { bg:'#f1f5f9', color:'#475569', icon:'fa-infinity',     matn: 'Muddatsiz' },
    tolandi:   { bg:'#dcfce7', color:'#166534', icon:'fa-check-double', matn: 'To\'landi' },
  };
  const s = map[q.status] || map.muddatsiz;
  return `<span style="background:${s.bg};color:${s.color};padding:3px 8px;
    border-radius:12px;font-size:11px;font-weight:600;display:inline-flex;align-items:center;gap:4px">
    <i class="fas ${s.icon}" style="font-size:10px"></i>${s.matn}
  </span>`;
}

function qarzJadvalKorsatish(royxat) {
  const div = document.getElementById('qarzlarJadval');
  if (!div) return;

  if (!royxat.length) {
    div.innerHTML = `<div class="empty-state" style="padding:40px">
      <i class="fas fa-check-circle fa-3x" style="color:#10b981;opacity:0.5;margin-bottom:12px"></i>
      <p>Qarz topilmadi ✅</p>
    </div>`;
    return;
  }

  div.innerHTML = `
    <div class="table-wrapper">
      <table>
        <thead>
          <tr>
            <th>#</th><th>Mijoz</th><th>Qarz summasi</th><th>Qoldi</th>
            <th>Muddat</th><th>Holat</th><th>Sana</th><th>Amallar</th>
          </tr>
        </thead>
        <tbody>
          ${royxat.map((q,i) => `
            <tr style="background:${q.status==='kechikkan'?'#fff5f5':q.status==='bugun'?'#fffbeb':''}">
              <td>${i+1}</td>
              <td>
                <div style="font-weight:600">${q.mijoz_ismi}</div>
                ${q.mijoz_telefon?`<div style="font-size:11px;color:#64748b">${q.mijoz_telefon}</div>`:''}
              </td>
              <td>${formatSum(q.summa)}</td>
              <td>
                <b style="color:${q.qoldi>0?'#ef4444':'#10b981'}">
                  ${formatSum(q.qoldi)}
                </b>
              </td>
              <td style="font-size:12px">
                ${q.muddat
                  ? `<span style="font-weight:600">${q.muddat}</span>`
                  : '<span style="color:#94a3b8">—</span>'}
              </td>
              <td>${qarzStatusBadge(q)}</td>
              <td style="font-size:11px;color:#64748b">${formatSana(q.yaratilgan)}</td>
              <td>
                ${q.holat === 'ochiq' ? `
                  <button class="btn btn-success btn-sm" onclick="qarzTolashModal(${q.id},'${q.mijoz_ismi.replace(/'/g,"\\'")}',${q.qoldi})"
                    title="To'lash">
                    <i class="fas fa-check"></i> To'lash
                  </button>
                  <button class="btn btn-secondary btn-sm btn-icon" onclick="qarzMuddatOzgartir(${q.id},'${q.muddat||''}')"
                    title="Muddatni o'zgartirish">
                    <i class="fas fa-calendar"></i>
                  </button>` :
                  `<span style="color:#10b981;font-size:12px">✅ To'landi</span>`}
              </td>
            </tr>`).join('')}
        </tbody>
      </table>
    </div>
    <div style="padding:8px;color:#64748b;font-size:13px">
      Jami: ${royxat.length} ta |
      Qoldi: <b style="color:#ef4444">${formatSum(royxat.reduce((s,q)=>s+(q.qoldi||0),0))}</b>
    </div>`;
}

// ===== QARZ TO'LASH MODAL =====
function qarzTolashModal(id, mijozIsmi, qoldi) {
  modalOch(`💳 Qarz to'lash — ${mijozIsmi}`, `
    <div style="background:#fff1f2;padding:12px;border-radius:8px;margin-bottom:14px;text-align:center">
      <div style="font-size:12px;color:#64748b">Qolgan qarz:</div>
      <div style="font-size:22px;font-weight:700;color:#ef4444">${formatSum(qoldi)}</div>
    </div>
    <form onsubmit="qarzTolashSaqlaJadval(event,${id},${qoldi})">
      <div class="form-group">
        <label style="font-weight:600">To'lov summasi *</label>
        <input type="number" id="qarzTolSumma" name="summa"
          min="1" max="${qoldi}" required value="${qoldi}"
          style="width:100%;padding:10px;border:2px solid #e2e8f0;border-radius:8px;font-size:16px">
        <div style="display:flex;gap:8px;margin-top:6px">
          <button type="button" class="btn btn-secondary btn-sm" style="flex:1"
            onclick="document.getElementById('qarzTolSumma').value=${qoldi}">
            To'liq: ${formatSum(qoldi)}
          </button>
          <button type="button" class="btn btn-secondary btn-sm" style="flex:1"
            onclick="document.getElementById('qarzTolSumma').value=${Math.round(qoldi/2)}">
            Yarmi: ${formatSum(Math.round(qoldi/2))}
          </button>
        </div>
      </div>
      <div class="form-group">
        <label style="font-weight:600">To'lov turi</label>
        <div style="display:flex;gap:8px;margin-top:4px">
          <label style="display:flex;align-items:center;gap:6px;cursor:pointer;padding:8px 12px;border:2px solid #e2e8f0;border-radius:8px;flex:1">
            <input type="radio" name="tolov_turi_qarz" value="naqd" checked> 💵 Naqd
          </label>
          <label style="display:flex;align-items:center;gap:6px;cursor:pointer;padding:8px 12px;border:2px solid #e2e8f0;border-radius:8px;flex:1">
            <input type="radio" name="tolov_turi_qarz" value="karta"> 💳 Karta
          </label>
        </div>
      </div>
      <div class="modal-footer" style="padding:0">
        <button type="button" class="btn btn-secondary" onclick="modalYop()">Bekor</button>
        <button type="submit" class="btn btn-success">
          <i class="fas fa-check-circle"></i> To'lash
        </button>
      </div>
    </form>`);
}

async function qarzTolashSaqlaJadval(e, id, qoldi) {
  e.preventDefault();
  const form = e.target;
  const summa = parseFloat(form.summa.value) || 0;
  const tolov = form.querySelector('[name=tolov_turi_qarz]:checked')?.value || 'naqd';
  if (summa <= 0 || summa > qoldi) { toast('Summa noto\'g\'ri!','warning'); return; }

  try {
    const r = await apiPost('/qarz_tarixi/' + id + '/tolash', { summa, tolov_turi: tolov });
    // Kassa harakatiga yozish
    await apiPost('/kassa_harakatlari', {
      tur:'kirim', nomi:`Qarz to'lovi`,
      summa, tolov_turi: tolov, kategoriya: 'Qarz to\'lovi',
      foydalanuvchi_id: joriyFoydalanuvchi?.id
    });
    modalYop();
    toast(`✅ ${formatSum(summa)} qarz to'landi!`, 'success');
    qarzlarYukla();
    qarzStatYukla();
  } catch(err) { toast(err.message, 'error'); }
}

// Muddat o'zgartirish
function qarzMuddatOzgartir(id, joriyMuddat) {
  modalOch('📅 Muddatni o\'zgartirish', `
    <div class="form-group">
      <label style="font-weight:600">Yangi muddat</label>
      <input type="date" id="yangiMuddatInp" value="${joriyMuddat}"
        style="width:100%;padding:10px;border:2px solid #e2e8f0;border-radius:8px;font-size:15px">
    </div>
    <div class="modal-footer" style="padding:0">
      <button class="btn btn-secondary" onclick="modalYop()">Bekor</button>
      <button class="btn btn-primary" onclick="qarzMuddatSaqla(${id})">
        <i class="fas fa-save"></i> Saqlash
      </button>
    </div>`);
}

async function qarzMuddatSaqla(id) {
  const muddat = document.getElementById('yangiMuddatInp')?.value || '';
  try {
    // Oddiy PUT bilan qarz tarixini yangilash
    const qarz = await apiGet('/qarz_tarixi/' + id);
    await apiPut('/qarz_tarixi/' + id, { ...qarz, muddat });
    toast('✅ Muddat yangilandi!', 'success');
    modalYop();
    qarzlarYukla();
  } catch(e) { toast(e.message, 'error'); }
}


// ===== QARZ BADGE (sidebar) =====
async function qarzBadgeYanila() {
  try {
    const qarzlar = await apiGet('/qarz_tarixi?holat=ochiq');
    const kechikkan = qarzlar.filter(q => q.status === 'kechikkan' || q.status === 'bugun');
    const badge = document.getElementById('qarzBadge');
    if (!badge) return;
    if (kechikkan.length > 0) {
      badge.textContent = kechikkan.length;
      badge.style.display = 'inline';
    } else {
      badge.style.display = 'none';
    }
  } catch {}
}
