// ===== QARZ TIZIMI =====

// Kassada qarz sotuvida muddat tanlash
function qarzMuddatModal(callback) {
  const bugun = new Date();
  const default30 = new Date(bugun.getTime() + 30*24*60*60*1000).toISOString().split('T')[0];

  // callback ni global o'zgaruvchiga saqlaymiz — HTML onclick da ishlatish uchun
  window._qarzMuddatCallback = callback;

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
        <button class="btn btn-secondary" onclick="modalYop();window._qarzMuddatCallback('','')">
          Muddatsiz davom etish
        </button>
        <button class="btn btn-danger" onclick="qarzMuddatTasdiqlash()">
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

function qarzMuddatTasdiqlash() {
  const muddat = document.getElementById('qarzMuddatInp')?.value || '';
  const izoh   = document.getElementById('qarzIzohInp')?.value  || '';
  modalYop();
  if (typeof window._qarzMuddatCallback === 'function') {
    window._qarzMuddatCallback(muddat, izoh);
    window._qarzMuddatCallback = null;
  }
}

// ===== QARZLAR SAHIFASI — KANBAN KO'RINISHI =====
async function qarzlarSahifaYukla() {
  const div = document.getElementById('asosiyKontent');
  div.innerHTML = `
    <div>
      <!-- STATISTIKA -->
      <div class="stats-grid" style="margin-bottom:16px" id="qarzStatDiv">
        <div style="text-align:center;padding:20px"><i class="fas fa-spinner fa-spin fa-2x"></i></div>
      </div>

      <!-- FILTER VA QIDIRUV -->
      <div style="display:flex;gap:8px;align-items:center;margin-bottom:14px;flex-wrap:wrap">
        <input type="text" id="qarzQidiruv" class="search-input"
          placeholder="🔍 Mijoz qidirish..." oninput="qarzKanbanFilter()" style="flex:1;min-width:200px">
        <div style="display:flex;gap:6px">
          <button class="btn btn-secondary btn-sm" onclick="qarzKorinishAlmash('kanban')" id="btnKanban"
            style="font-size:12px;background:#2563eb;color:white;border-color:#2563eb">
            <i class="fas fa-columns"></i> Ustunlar
          </button>
          <button class="btn btn-secondary btn-sm" onclick="qarzKorinishAlmash('jadval')" id="btnJadval"
            style="font-size:12px">
            <i class="fas fa-list"></i> Jadval
          </button>
        </div>
      </div>

      <!-- KANBAN USTUNLAR -->
      <div id="qarzKanbanDiv" style="display:flex;gap:14px;overflow-x:auto;padding-bottom:16px;align-items:flex-start">
        <div style="text-align:center;padding:40px;width:100%">
          <i class="fas fa-spinner fa-spin fa-2x" style="color:#2563eb"></i>
        </div>
      </div>

      <!-- JADVAL KO'RINISH (yashirin) -->
      <div id="qarzJadvalDiv" style="display:none">
        <div class="card">
          <div class="card-body" id="qarzlarJadval"></div>
        </div>
      </div>
    </div>`;

  await qarzKanbanYukla();
  await qarzStatYukla();
}

let _qarzKanbanData = [];
let _qarzKorinish = 'kanban';

async function qarzKanbanYukla() {
  try {
    _qarzKanbanData = await apiGet('/qarz_tarixi?holat=ochiq');
    qarzKanbanKorsatish(_qarzKanbanData);
  } catch(e) { toast(e.message,'error'); }
}

function qarzKanbanFilter() {
  const q = (document.getElementById('qarzQidiruv')?.value || '').toLowerCase();
  const f = _qarzKanbanData.filter(x =>
    (x.mijoz_ismi||'').toLowerCase().includes(q) ||
    (x.mijoz_telefon||'').includes(q));
  if (_qarzKorinish === 'kanban') qarzKanbanKorsatish(f);
  else qarzJadvalKorsatish(f);
}

function qarzKorinishAlmash(tur) {
  _qarzKorinish = tur;
  const kanbanDiv = document.getElementById('qarzKanbanDiv');
  const jadvalDiv = document.getElementById('qarzJadvalDiv');
  const btnK = document.getElementById('btnKanban');
  const btnJ = document.getElementById('btnJadval');

  if (tur === 'kanban') {
    kanbanDiv.style.display = 'flex';
    jadvalDiv.style.display = 'none';
    btnK.style.background = '#2563eb'; btnK.style.color = 'white'; btnK.style.borderColor = '#2563eb';
    btnJ.style.background = ''; btnJ.style.color = ''; btnJ.style.borderColor = '';
    qarzKanbanKorsatish(_qarzKanbanData);
  } else {
    kanbanDiv.style.display = 'none';
    jadvalDiv.style.display = '';
    btnJ.style.background = '#2563eb'; btnJ.style.color = 'white'; btnJ.style.borderColor = '#2563eb';
    btnK.style.background = ''; btnK.style.color = ''; btnK.style.borderColor = '';
    qarzJadvalKorsatish(_qarzKanbanData);
  }
}

function qarzKanbanKorsatish(royxat) {
  const wrap = document.getElementById('qarzKanbanDiv');
  if (!wrap) return;

  // Ustunlar ta'rifi
  const ustunlar = [
    {
      id: 'kechikkan',
      nomi: 'Muddati o\'tgan',
      rang: '#ef4444', bg: '#fff1f2', border: '#fecaca',
      icon: 'fa-exclamation-circle',
      filter: q => q.status === 'kechikkan',
    },
    {
      id: 'bugun',
      nomi: 'Bugun to\'lanadi',
      rang: '#f97316', bg: '#fff7ed', border: '#fed7aa',
      icon: 'fa-clock',
      filter: q => q.status === 'bugun',
    },
    {
      id: 'bir_kun',
      nomi: '1 kun qoldi',
      rang: '#eab308', bg: '#fefce8', border: '#fde68a',
      icon: 'fa-hourglass-half',
      filter: q => q.status === 'yaqin' && q.kechikkan_kun === -1,
    },
    {
      id: 'kelajak',
      nomi: 'Kelajakda',
      rang: '#2563eb', bg: '#eff6ff', border: '#bfdbfe',
      icon: 'fa-calendar-alt',
      filter: q => q.status === 'normal' || (q.status === 'yaqin' && q.kechikkan_kun !== -1),
    },
    {
      id: 'muddatsiz',
      nomi: 'Muddatsiz',
      rang: '#64748b', bg: '#f8fafc', border: '#e2e8f0',
      icon: 'fa-infinity',
      filter: q => q.status === 'muddatsiz',
    },
  ];

  wrap.innerHTML = ustunlar.map(u => {
    const cards = royxat.filter(u.filter);
    const jamiSumma = cards.reduce((s,q) => s+(q.qoldi||0), 0);

    return `
      <div style="min-width:260px;max-width:300px;flex:1;
        background:${u.bg};border:1px solid ${u.border};border-radius:12px;overflow:hidden">

        <!-- USTUN SARLAVHA -->
        <div style="padding:12px 14px;border-bottom:1px solid ${u.border};
          display:flex;align-items:center;justify-content:space-between;
          background:white;position:sticky;top:0">
          <div style="display:flex;align-items:center;gap:8px">
            <div style="width:10px;height:10px;border-radius:50%;background:${u.rang}"></div>
            <span style="font-weight:700;font-size:13px;color:#1e293b">${u.nomi}</span>
            <span style="background:${u.rang};color:white;border-radius:10px;
              padding:1px 8px;font-size:11px;font-weight:700">${cards.length}</span>
          </div>
          ${jamiSumma > 0 ? `
            <span style="font-size:11px;font-weight:700;color:${u.rang}">
              ${formatSum(jamiSumma)}
            </span>` : ''}
        </div>

        <!-- KARTALAR -->
        <div style="padding:10px;display:flex;flex-direction:column;gap:8px;
          max-height:calc(100vh - 280px);overflow-y:auto">
          ${cards.length === 0 ? `
            <div style="text-align:center;padding:24px;color:#94a3b8;font-size:12px">
              <i class="fas ${u.icon}" style="font-size:24px;opacity:0.3;display:block;margin-bottom:8px"></i>
              Yo'q
            </div>` :
            cards.map(q => qarzKartaHtml(q, u.rang)).join('')}
        </div>
      </div>`;
  }).join('');
}

function qarzKartaHtml(q, rang) {
  const qoldirKun = q.kechikkan_kun !== undefined ? Math.abs(q.kechikkan_kun) : 0;
  const muddatMatn = q.muddat
    ? (q.status === 'kechikkan'
        ? `<span style="color:#ef4444;font-weight:600">
            <i class="fas fa-exclamation-triangle" style="font-size:10px"></i>
            ${qoldirKun > 0 ? qoldirKun+' kun kechikdi' : 'Kechikkan'}
           </span>`
        : `<span style="color:#64748b"><i class="fas fa-calendar" style="font-size:10px"></i> ${q.muddat}</span>`)
    : `<span style="color:#94a3b8"><i class="fas fa-infinity" style="font-size:10px"></i> Muddatsiz</span>`;

  return `
    <div style="background:white;border-radius:8px;padding:12px;
      border:1px solid #e2e8f0;box-shadow:0 1px 3px rgba(0,0,0,0.06);
      border-left:3px solid ${rang};cursor:default"
      onmouseover="this.style.boxShadow='0 4px 12px rgba(0,0,0,0.1)'"
      onmouseout="this.style.boxShadow='0 1px 3px rgba(0,0,0,0.06)'">

      <!-- MIJOZ ISMI -->
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px">
        <div style="width:28px;height:28px;border-radius:50%;background:${rang}22;
          display:flex;align-items:center;justify-content:center;
          color:${rang};font-weight:700;font-size:12px;flex-shrink:0">
          ${(q.mijoz_ismi||'?')[0].toUpperCase()}
        </div>
        <div style="flex:1;min-width:0">
          <div style="font-weight:600;font-size:13px;white-space:nowrap;
            overflow:hidden;text-overflow:ellipsis">${q.mijoz_ismi||'—'}</div>
          ${q.mijoz_telefon
            ? `<div style="font-size:11px;color:#64748b">${q.mijoz_telefon}</div>`
            : ''}
        </div>
      </div>

      <!-- SUMMA -->
      <div style="display:flex;justify-content:space-between;align-items:center;
        margin-bottom:8px;padding:6px 8px;background:#f8fafc;border-radius:6px">
        <div>
          <div style="font-size:10px;color:#94a3b8">Qoldi</div>
          <div style="font-size:15px;font-weight:700;color:${rang}">${formatSum(q.qoldi||0)}</div>
        </div>
        <div style="text-align:right">
          <div style="font-size:10px;color:#94a3b8">Jami qarz</div>
          <div style="font-size:12px;color:#64748b">${formatSum(q.summa||0)}</div>
        </div>
      </div>

      <!-- MUDDAT -->
      <div style="font-size:11px;margin-bottom:10px">${muddatMatn}</div>

      <!-- TUGMALAR -->
      <div style="display:flex;gap:6px">
        <button class="btn btn-success btn-sm" style="flex:1;font-size:11px;padding:5px 8px"
          onclick="qarzTolashModal(${q.id},'${(q.mijoz_ismi||'').replace(/'/g,"\\'")}',${q.qoldi||0})">
          <i class="fas fa-check"></i> To'lash
        </button>
        <button class="btn btn-secondary btn-sm btn-icon" style="font-size:11px"
          onclick="qarzMuddatOzgartir(${q.id},'${q.muddat||''}')"
          title="Muddatni o'zgartirish">
          <i class="fas fa-calendar"></i>
        </button>
      </div>
    </div>`;
}

async function qarzStatYukla() {
  try {
    const barchasi = await apiGet('/qarz_tarixi?holat=ochiq');
    const kechikkan = barchasi.filter(q => q.status === 'kechikkan');
    const bugungi   = barchasi.filter(q => q.status === 'bugun');
    const yaqin     = barchasi.filter(q => q.status === 'yaqin');
    const jamiQarz  = barchasi.reduce((s,q) => s+(q.qoldi||0), 0);

    document.getElementById('qarzStatDiv').innerHTML = `
      <div class="stat-card" style="cursor:pointer" onclick="qarzKanbanFiltri('kechikkan')">
        <div class="stat-icon red"><i class="fas fa-exclamation-circle"></i></div>
        <div class="stat-info"><h3 style="color:#ef4444">${kechikkan.length}</h3><p>Kechikkan</p></div>
      </div>
      <div class="stat-card" style="cursor:pointer" onclick="qarzKanbanFiltri('bugun')">
        <div class="stat-icon orange"><i class="fas fa-clock"></i></div>
        <div class="stat-info"><h3 style="color:#f59e0b">${bugungi.length}</h3><p>Bugun to'lanadi</p></div>
      </div>
      <div class="stat-card" style="cursor:pointer" onclick="qarzKanbanFiltri('yaqin')">
        <div class="stat-icon" style="background:#fef9c3"><i class="fas fa-hourglass-half" style="color:#eab308"></i></div>
        <div class="stat-info"><h3 style="color:#eab308">${yaqin.length}</h3><p>3 kun ichida</p></div>
      </div>
      <div class="stat-card">
        <div class="stat-icon blue"><i class="fas fa-list"></i></div>
        <div class="stat-info"><h3>${barchasi.length}</h3><p>Jami ochiq</p></div>
      </div>
      <div class="stat-card">
        <div class="stat-icon red"><i class="fas fa-money-bill"></i></div>
        <div class="stat-info"><h3 style="color:#ef4444">${formatSum(jamiQarz)}</h3><p>Jami qarz</p></div>
      </div>`;
  } catch(e) {}
}

// Statistika kartasiga bosib filtr qo'llash
function qarzKanbanFiltri(status) {
  const f = _qarzKanbanData.filter(q => q.status === status);
  if (_qarzKorinish === 'kanban') qarzKanbanKorsatish(f);
  else qarzJadvalKorsatish(f);
  const inp = document.getElementById('qarzQidiruv');
  if (inp) inp.value = '';
}

// Eski funksiyalar — compatibility
let _qarzlarData = [];
async function qarzlarYukla() { await qarzKanbanYukla(); }
function qarzFilter() { qarzKanbanFilter(); }

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
