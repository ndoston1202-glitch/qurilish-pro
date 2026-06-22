async function mijozlarYukla() {
  const kontent = document.getElementById('asosiyKontent');
  kontent.innerHTML = `
    <div>
      <!-- STATISTIKA -->
      <div class="stats-grid" style="margin-bottom:16px" id="mijozStatDiv">
        <div style="text-align:center;padding:20px"><i class="fas fa-spinner fa-spin fa-2x"></i></div>
      </div>
      <div class="card">
        <div class="card-header">
          <div class="filter-bar">
            <input type="text" id="mijozQidiruvSahifa" class="search-input"
              placeholder="🔍 Ism yoki telefon..." oninput="mijozlarSahifaFilter()" style="min-width:220px">
            <select id="mijozQarzFilter" class="filter-select" onchange="mijozlarSahifaFilter()">
              <option value="">Barcha mijozlar</option>
              <option value="kechikkan">⚠ Kechikkan qarzlar</option>
              <option value="bugun">🔴 Bugun muddati</option>
              <option value="yaqin">🟡 3 kun ichida</option>
              <option value="bor">📋 Qarzlisi</option>
            </select>
          </div>
          <div style="display:flex;gap:8px">
            <button class="btn btn-secondary btn-sm" onclick="mijozlarExcelImport()">
              <i class="fas fa-file-excel"></i> Excel import
            </button>
            <button class="btn btn-primary" onclick="mijozQosh()">
              <i class="fas fa-user-plus"></i> Yangi mijoz
            </button>
          </div>
        </div>
        <div class="card-body" id="mijozlarJadval">
          <div style="text-align:center"><i class="fas fa-spinner fa-spin fa-2x"></i></div>
        </div>
      </div>
    </div>`;
  await mijozlarRoyxatYukla();
}

let _barcha_mijozlar = [];


async function mijozlarRoyxatYukla() {
  try {
    _barcha_mijozlar = await apiGet('/mijozlar');
    // Statistika
    const kechikkanlar = _barcha_mijozlar.filter(m => m.qarz_status === 'kechikkan');
    const bugungilar  = _barcha_mijozlar.filter(m => m.qarz_status === 'bugun');
    const qarzlilar   = _barcha_mijozlar.filter(m => m.ochiq_qarz_soni > 0);
    const jamiQarz    = _barcha_mijozlar.reduce((s,m) => s + (m.qarz_qoldi||0), 0);
    const statDiv = document.getElementById('mijozStatDiv');
    if (statDiv) {
      statDiv.innerHTML = `
        <div class="stat-card" style="cursor:pointer" onclick="document.getElementById('mijozQarzFilter').value='kechikkan';mijozlarSahifaFilter()">
          <div class="stat-icon red"><i class="fas fa-exclamation-circle"></i></div>
          <div class="stat-info"><h3 style="color:#ef4444">${kechikkanlar.length}</h3><p>Kechikkan qarzlar</p></div>
        </div>
        <div class="stat-card" style="cursor:pointer" onclick="document.getElementById('mijozQarzFilter').value='bugun';mijozlarSahifaFilter()">
          <div class="stat-icon orange"><i class="fas fa-clock"></i></div>
          <div class="stat-info"><h3 style="color:#f59e0b">${bugungilar.length}</h3><p>Bugun muddati</p></div>
        </div>
        <div class="stat-card" style="cursor:pointer" onclick="document.getElementById('mijozQarzFilter').value='bor';mijozlarSahifaFilter()">
          <div class="stat-icon blue"><i class="fas fa-users"></i></div>
          <div class="stat-info"><h3>${qarzlilar.length}</h3><p>Qarzli mijozlar</p></div>
        </div>
        <div class="stat-card">
          <div class="stat-icon red"><i class="fas fa-money-bill"></i></div>
          <div class="stat-info"><h3 style="color:#ef4444">${formatSum(jamiQarz)}</h3><p>Jami qarz</p></div>
        </div>`;
    }
    const div = document.getElementById('mijozlarJadval');
    if (div) mijozlarJadvalKorsatish(_barcha_mijozlar);
  } catch (e) { toast(e.message, 'error'); }
}

function mijozlarSahifaFilter() {
  const q = (document.getElementById('mijozQidiruvSahifa')?.value || '').toLowerCase();
  const qarzF = document.getElementById('mijozQarzFilter')?.value || '';
  let f = _barcha_mijozlar.filter(m =>
    (m.ism + ' ' + (m.familiya || '')).toLowerCase().includes(q) ||
    (m.telefon || '').includes(q)
  );
  if (qarzF === 'kechikkan') f = f.filter(m => m.qarz_status === 'kechikkan');
  else if (qarzF === 'bugun')    f = f.filter(m => m.qarz_status === 'bugun');
  else if (qarzF === 'yaqin')    f = f.filter(m => m.qarz_status === 'yaqin');
  else if (qarzF === 'bor')      f = f.filter(m => m.ochiq_qarz_soni > 0);
  mijozlarJadvalKorsatish(f);
}


// Qarz holati badge
function mijozQarzBadge(m) {
  if (!m.ochiq_qarz_soni) return '<span class="badge badge-success">✅ Qarzsiz</span>';
  const s = m.qarz_status;
  if (s === 'kechikkan') return `
    <div>
      <span class="badge badge-danger">
        <i class="fas fa-exclamation-circle"></i>
        ${m.kechikkan_kun > 0 ? m.kechikkan_kun + ' kun kechikdi' : 'Kechikkan'}
      </span>
      <div style="font-size:11px;color:#ef4444;margin-top:2px">${formatSum(m.qarz_qoldi)}</div>
      ${m.qarz_muddat ? `<div style="font-size:10px;color:#94a3b8">Muddat: ${m.qarz_muddat}</div>` : ''}
    </div>`;
  if (s === 'bugun') return `
    <div>
      <span class="badge" style="background:#fef3c7;color:#92400e">🔴 Bugun!</span>
      <div style="font-size:11px;color:#f59e0b;margin-top:2px">${formatSum(m.qarz_qoldi)}</div>
    </div>`;
  if (s === 'yaqin') return `
    <div>
      <span class="badge" style="background:#fef9c3;color:#854d0e">🟡 ${m.qarz_muddat}</span>
      <div style="font-size:11px;color:#64748b;margin-top:2px">${formatSum(m.qarz_qoldi)}</div>
    </div>`;
  if (s === 'muddatsiz') return `
    <div>
      <span class="badge badge-warning"><i class="fas fa-infinity"></i> Muddatsiz</span>
      <div style="font-size:11px;color:#f59e0b;margin-top:2px">${formatSum(m.qarz_qoldi)}</div>
    </div>`;
  // normal
  return `
    <div>
      <span class="badge" style="background:#dbeafe;color:#1d4ed8">📋 ${m.qarz_muddat||''}</span>
      <div style="font-size:11px;color:#2563eb;margin-top:2px">${formatSum(m.qarz_qoldi)}</div>
    </div>`;
}


function mijozlarJadvalKorsatish(royxat) {
  const div = document.getElementById('mijozlarJadval');
  if (!div) return;
  if (!royxat.length) {
    div.innerHTML = '<div class="empty-state"><i class="fas fa-users"></i><p>Mijoz topilmadi</p></div>';
    return;
  }
  div.innerHTML = `
    <div class="table-wrapper">
      <table>
        <thead>
          <tr>
            <th>#</th><th>Ismi</th><th>Telefon</th><th>Manzil</th>
            <th>Qarz holati</th><th>Sotuvlar</th><th>Yaratilgan</th><th>Amallar</th>
          </tr>
        </thead>
        <tbody>
          ${royxat.map((m, i) => {
            const qarzRang = m.qarz_status === 'kechikkan' ? '#fff5f5'
              : m.qarz_status === 'bugun' ? '#fffbeb'
              : m.qarz_status === 'yaqin' ? '#fefce8' : '';
            return `
            <tr style="background:${qarzRang}">
              <td>${i+1}</td>
              <td>
                <div style="display:flex;align-items:center;gap:8px">
                  <div style="width:32px;height:32px;border-radius:50%;
                    background:${m.qarz_status==='kechikkan'?'#fee2e2':m.ochiq_qarz_soni?'#fef3c7':'#dbeafe'};
                    display:flex;align-items:center;justify-content:center;
                    color:${m.qarz_status==='kechikkan'?'#dc2626':m.ochiq_qarz_soni?'#d97706':'#2563eb'};
                    font-weight:700;font-size:13px;flex-shrink:0">
                    ${m.ism[0].toUpperCase()}
                  </div>
                  <div>
                    <div style="font-weight:600">${m.ism} ${m.familiya||''}</div>
                    ${m.izoh?`<div style="font-size:11px;color:#64748b">${m.izoh}</div>`:''}
                  </div>
                </div>
              </td>
              <td>${m.telefon||'-'}</td>
              <td style="font-size:13px">${m.manzil||'-'}</td>
              <td>${mijozQarzBadge(m)}</td>
              <td>
                <button class="btn btn-secondary btn-sm"
                  onclick="mijozBatafsil(${m.id},'${(m.ism+' '+(m.familiya||'')).trim().replace(/'/g,"\\'")}')">
                  <i class="fas fa-eye"></i> Ko'rish
                </button>
              </td>
              <td style="font-size:12px;color:#64748b">${formatSana(m.yaratilgan)}</td>
              <td>
                <button class="btn btn-warning btn-sm btn-icon" onclick="mijozTahrir(${m.id})" title="Tahrirlash">
                  <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-danger btn-sm btn-icon"
                  onclick="mijozOchir(${m.id},'${(m.ism+' '+(m.familiya||'')).trim().replace(/'/g,"\\'")}' )"
                  title="O'chirish">
                  <i class="fas fa-trash"></i>
                </button>
              </td>
            </tr>`}).join('')}
        </tbody>
      </table>
    </div>
    <div style="padding:10px;color:#64748b;font-size:13px">
      Jami: ${royxat.length} ta mijoz |
      Qarzli: <b style="color:#ef4444">${royxat.filter(m=>m.ochiq_qarz_soni>0).length}</b> ta
    </div>`;
}


// ===== MIJOZ BATAFSIL MODAL (Sotuvlar + Qarzlar tab) =====
async function mijozBatafsil(id, nomi) {
  try {
    const data = await apiGet('/mijozlar/' + id);
    const sotuvlar = data.sotuvlar || [];
    const qarzlar  = data.qarzlar  || [];
    const ochiqQarzlar    = qarzlar.filter(q => q.holat === 'ochiq');
    const kechikkanQarzlar = ochiqQarzlar.filter(q => q.status === 'kechikkan' || q.status === 'bugun');
    const jamiQarz = ochiqQarzlar.reduce((s,q) => s+(q.qoldi||0), 0);

    modalOch(`👤 ${nomi}`, `
      <div>
        <!-- STATISTIKA -->
        <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:14px">
          <div style="text-align:center;padding:10px;background:#f0f9ff;border-radius:8px;border:1px solid #bae6fd">
            <div style="font-size:20px;font-weight:700;color:#2563eb">${sotuvlar.length}</div>
            <div style="font-size:11px;color:#64748b">Jami sotuvlar</div>
          </div>
          <div style="text-align:center;padding:10px;background:#f0fdf4;border-radius:8px;border:1px solid #bbf7d0">
            <div style="font-size:18px;font-weight:700;color:#10b981">${formatSum(sotuvlar.reduce((s,x)=>s+x.jami_summa,0))}</div>
            <div style="font-size:11px;color:#64748b">Jami xarid</div>
          </div>
          <div style="text-align:center;padding:10px;
            background:${jamiQarz>0?'#fff1f2':'#f0fdf4'};
            border-radius:8px;border:1px solid ${jamiQarz>0?'#fecaca':'#bbf7d0'}">
            <div style="font-size:18px;font-weight:700;color:${jamiQarz>0?'#ef4444':'#10b981'}">
              ${jamiQarz>0 ? formatSum(jamiQarz) : '✅ 0'}
            </div>
            <div style="font-size:11px;color:#64748b">
              Ochiq qarz ${kechikkanQarzlar.length>0?'<span style="color:#ef4444">('+kechikkanQarzlar.length+' kechikkan)</span>':''}
            </div>
          </div>
        </div>

        <!-- TABLAR -->
        <div style="display:flex;gap:6px;margin-bottom:12px;border-bottom:2px solid #e2e8f0">
          <button id="tabSotuvBtn" onclick="mijozTabAlmash('sotuv')"
            style="padding:7px 16px;border:none;border-bottom:2px solid #2563eb;
            margin-bottom:-2px;background:none;color:#2563eb;font-weight:600;
            font-size:13px;cursor:pointer">
            <i class="fas fa-receipt"></i> Sotuvlar (${sotuvlar.length})
          </button>
          <button id="tabQarzBtn" onclick="mijozTabAlmash('qarz')"
            style="padding:7px 16px;border:none;border-bottom:2px solid transparent;
            margin-bottom:-2px;background:none;
            color:${ochiqQarzlar.length>0?'#ef4444':'#64748b'};
            font-weight:600;font-size:13px;cursor:pointer">
            <i class="fas fa-clock"></i> Qarzlar (${ochiqQarzlar.length})
            ${kechikkanQarzlar.length>0?`<span style="background:#ef4444;color:white;border-radius:8px;padding:1px 6px;font-size:10px;margin-left:4px">${kechikkanQarzlar.length}</span>`:''}
          </button>
        </div>

        <!-- SOTUVLAR -->
        <div id="tabSotuvKontent">
          ${sotuvlar.length ? `
            <div class="table-wrapper" style="max-height:300px;overflow-y:auto">
              <table>
                <thead><tr><th>Chek</th><th>Summa</th><th>To'lov</th><th>Sana</th></tr></thead>
                <tbody>
                  ${sotuvlar.map(s=>`
                    <tr>
                      <td><span class="badge badge-info" style="cursor:pointer"
                        onclick="mijozChekTafsilot(${s.id},'${s.chek_raqam}')">${s.chek_raqam}</span></td>
                      <td><b>${formatSum(s.jami_summa)}</b></td>
                      <td><span class="badge ${s.tolov_turi==='naqd'?'badge-success':s.tolov_turi==='karta'?'badge-info':'badge-danger'}">
                        ${s.tolov_turi==='naqd'?'💵 Naqd':s.tolov_turi==='karta'?'💳 Karta':'📋 Qarz'}
                      </span></td>
                      <td style="font-size:12px;color:#64748b">${formatSana(s.sana)}</td>
                    </tr>`).join('')}
                </tbody>
              </table>
            </div>` :
            '<div class="empty-state" style="padding:24px"><i class="fas fa-receipt"></i><p>Sotuv yo\'q</p></div>'}
        </div>

        <!-- QARZLAR -->
        <div id="tabQarzKontent" style="display:none">
          ${ochiqQarzlar.length ? `
            <div class="table-wrapper" style="max-height:300px;overflow-y:auto">
              <table>
                <thead>
                  <tr><th>Summa</th><th>Qoldi</th><th>Muddat</th><th>Holat</th><th>Sana</th><th></th></tr>
                </thead>
                <tbody>
                  ${ochiqQarzlar.map(q=>{
                    const s = q.status;
                    const rang = s==='kechikkan'?'#ef4444':s==='bugun'?'#f59e0b':s==='yaqin'?'#eab308':'#10b981';
                    const matn = s==='kechikkan'?(q.kechikkan_kun>0?q.kechikkan_kun+' kun kechikdi':'Kechikkan')
                                :s==='bugun'?'Bugun!':s==='yaqin'?'3 kun':s==='muddatsiz'?'Muddatsiz':'Vaqtida';
                    return `
                    <tr style="background:${s==='kechikkan'?'#fff5f5':s==='bugun'?'#fffbeb':''}">
                      <td>${formatSum(q.summa)}</td>
                      <td><b style="color:#ef4444">${formatSum(q.qoldi)}</b></td>
                      <td style="font-size:12px">${q.muddat||'—'}</td>
                      <td>
                        <span style="background:${rang}22;color:${rang};padding:2px 8px;
                          border-radius:10px;font-size:11px;font-weight:600">
                          ${matn}
                        </span>
                      </td>
                      <td style="font-size:11px;color:#64748b">${formatSana(q.yaratilgan)}</td>
                      <td>
                        <button class="btn btn-success btn-sm" style="font-size:11px;padding:3px 8px"
                          onclick="modalYop();qarzTolashModal(${q.id},'${nomi.replace(/'/g,"\\'")}',${q.qoldi})">
                          <i class="fas fa-check"></i> To'lash
                        </button>
                      </td>
                    </tr>`}).join('')}
                </tbody>
              </table>
            </div>
            <div style="padding:8px;font-size:13px;color:#64748b;border-top:1px solid #f1f5f9">
              Jami ochiq qarz: <b style="color:#ef4444">${formatSum(jamiQarz)}</b>
            </div>` :
            '<div class="empty-state" style="padding:24px"><i class="fas fa-check-circle fa-2x" style="color:#10b981"></i><p>Ochiq qarz yo\'q ✅</p></div>'}
        </div>
      </div>`);

    // Kechikkan qarz bo'lsa qarz tabini avtomatik ochish
    if (kechikkanQarzlar.length > 0) {
      setTimeout(() => mijozTabAlmash('qarz'), 100);
    }
  } catch(e) { toast(e.message, 'error'); }
}

function mijozTabAlmash(tab) {
  const sotuvBtn = document.getElementById('tabSotuvBtn');
  const qarzBtn  = document.getElementById('tabQarzBtn');
  const sotuvK   = document.getElementById('tabSotuvKontent');
  const qarzK    = document.getElementById('tabQarzKontent');
  if (!sotuvBtn || !qarzBtn) return;

  if (tab === 'sotuv') {
    sotuvBtn.style.borderBottomColor = '#2563eb';
    sotuvBtn.style.color = '#2563eb';
    qarzBtn.style.borderBottomColor  = 'transparent';
    if (sotuvK) sotuvK.style.display = '';
    if (qarzK)  qarzK.style.display  = 'none';
  } else {
    qarzBtn.style.borderBottomColor  = '#ef4444';
    sotuvBtn.style.borderBottomColor = 'transparent';
    sotuvBtn.style.color = '#64748b';
    if (qarzK)  qarzK.style.display  = '';
    if (sotuvK) sotuvK.style.display = 'none';
  }
}


// ===== MIJOZ QO'SHISH / TAHRIRLASH =====
function mijozFormKontent(m = null) {
  return `
    <form onsubmit="mijozSaqlash(event, ${m ? m.id : 'null'})">
      <div class="form-row">
        <div class="form-group">
          <label>Ismi *</label>
          <input type="text" name="ism" required value="${m ? m.ism : ''}" placeholder="Ismi">
        </div>
        <div class="form-group">
          <label>Familiyasi</label>
          <input type="text" name="familiya" value="${m ? (m.familiya||'') : ''}" placeholder="Familiyasi">
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label>Telefon</label>
          <input type="text" name="telefon" value="${m ? (m.telefon||'') : ''}" placeholder="+998 90 123 45 67">
        </div>
        <div class="form-group">
          <label>Manzil</label>
          <input type="text" name="manzil" value="${m ? (m.manzil||'') : ''}" placeholder="Shahar, ko'cha">
        </div>
      </div>
      ${m ? `
        <div class="form-group">
          <label>Qarz (so'm)</label>
          <input type="number" name="qarz" min="0" value="${m.qarz||0}">
        </div>` : ''}
      <div class="form-group">
        <label>Izoh</label>
        <input type="text" name="izoh" value="${m ? (m.izoh||'') : ''}" placeholder="Ixtiyoriy">
      </div>
      <div class="modal-footer" style="padding:0;margin-top:10px">
        <button type="button" class="btn btn-secondary" onclick="modalYop()">Bekor</button>
        <button type="submit" class="btn btn-primary"><i class="fas fa-save"></i> Saqlash</button>
      </div>
    </form>`;
}

function mijozQosh() { modalOch('Yangi mijoz qo\'shish', mijozFormKontent()); }

async function mijozTahrir(id) {
  try {
    const royxat = await apiGet('/mijozlar');
    const m = royxat.find(x => x.id == id);
    if (!m) return;
    modalOch('Mijozni tahrirlash', mijozFormKontent(m));
  } catch (e) { toast(e.message, 'error'); }
}

async function mijozSaqlash(e, id) {
  e.preventDefault();
  const form = e.target;
  const data = {
    ism: form.ism.value, familiya: form.familiya.value,
    telefon: form.telefon.value, manzil: form.manzil.value,
    izoh: form.izoh.value, qarz: form.qarz ? parseFloat(form.qarz.value)||0 : 0
  };
  try {
    if (id) { await apiPut('/mijozlar/'+id, data); toast('✅ Mijoz yangilandi!'); }
    else { await apiPost('/mijozlar', data); toast('✅ Mijoz qo\'shildi!'); }
    modalYop(); mijozlarRoyxatYukla();
  } catch (e) { toast(e.message, 'error'); }
}

function mijozOchir(id, nomi) {
  tasdiqlash(`"${nomi}" mijozini o'chirasizmi?`, async () => {
    try {
      await apiDelete('/mijozlar/'+id);
      toast('Mijoz o\'chirildi!'); mijozlarRoyxatYukla();
    } catch (e) { toast(e.message, 'error'); }
  });
}

// ===== CHEK TAFSILOT =====
async function mijozChekTafsilot(sotuv_id, chek_raqam) {
  try {
    const s = await apiGet('/sotuvlar/'+sotuv_id);
    modalOch(`🧾 ${chek_raqam}`, `
      <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;
        padding:12px;margin-bottom:12px;font-size:13px">
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px">
          <div><span style="color:#64748b">Kassir:</span> <b>${s.kassir_ismi}</b></div>
          <div><span style="color:#64748b">Sana:</span> <b>${formatSana(s.sana)}</b></div>
          <div><span style="color:#64748b">To'lov:</span>
            <span class="badge ${s.tolov_turi==='naqd'?'badge-success':s.tolov_turi==='karta'?'badge-info':'badge-danger'}">
              ${s.tolov_turi==='naqd'?'💵 Naqd':s.tolov_turi==='karta'?'💳 Karta':'📋 Qarz'}
            </span>
          </div>
          ${s.chegirma>0?`<div><span style="color:#64748b">Chegirma:</span> <b style="color:#ef4444">-${formatSum(s.chegirma)}</b></div>`:''}
        </div>
      </div>
      <div class="table-wrapper">
        <table>
          <thead><tr><th>#</th><th>Mahsulot</th><th>Miqdor</th><th>Narxi</th><th>Jami</th></tr></thead>
          <tbody>
            ${s.tafsilotlar.map((t,i)=>`
              <tr>
                <td>${i+1}</td><td><b>${t.mahsulot_nomi}</b></td>
                <td>${t.miqdor} ${t.birlik}</td>
                <td>${formatSum(t.narxi)}</td>
                <td><b style="color:#10b981">${formatSum(t.jami)}</b></td>
              </tr>`).join('')}
          </tbody>
        </table>
      </div>
      <div style="display:flex;justify-content:space-between;font-size:16px;font-weight:700;
        padding:10px 0;border-top:2px solid #e2e8f0;margin-top:8px">
        <span>JAMI:</span><span style="color:#10b981">${formatSum(s.jami_summa)}</span>
      </div>
      <div class="modal-footer" style="padding:0;margin-top:10px">
        <button class="btn btn-secondary" onclick="modalYop()">Yopish</button>
        <button class="btn btn-primary" onclick="window.print()"><i class="fas fa-print"></i> Chop</button>
      </div>`);
  } catch(e) { toast(e.message,'error'); }
}

// ===== EXCEL IMPORT =====
function mijozlarExcelImport() {
  modalOch('Mijozlarni Excel/CSV import', `
    <div>
      <div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:8px;padding:12px;margin-bottom:12px">
        <div style="font-weight:600;margin-bottom:6px;color:#1d4ed8">
          <i class="fas fa-download"></i> 1-qadam: Shablonni yuklab oling
        </div>
        <button class="btn btn-primary btn-sm" onclick="mijozShablonYukla()">
          <i class="fas fa-file-csv"></i> CSV Shablon
        </button>
      </div>
      <div class="form-group">
        <label style="font-weight:600">CSV fayl yuklash:</label>
        <input type="file" id="mijozCSVFayl" accept=".csv,.txt"
          style="width:100%;padding:8px;border:2px dashed #e2e8f0;border-radius:8px"
          onchange="csvFaylOqi(this,'mijozCSVMatn')">
      </div>
      <div class="form-group">
        <label style="font-weight:600">Yoki to'g'ridan matn kiriting:</label>
        <textarea id="mijozCSVMatn" rows="5"
          style="width:100%;font-family:monospace;font-size:12px;border:1px solid #e2e8f0;border-radius:8px;padding:8px"
          placeholder="ism,familiya,telefon,manzil"></textarea>
      </div>
      <div class="modal-footer" style="padding:0">
        <button class="btn btn-secondary" onclick="modalYop()">Bekor</button>
        <button class="btn btn-success" onclick="mijozCSVYukla()">
          <i class="fas fa-upload"></i> Import
        </button>
      </div>
    </div>`);
}

function mijozShablonYukla() {
  const csv = 'ism,familiya,telefon,manzil\nAlisher,Karimov,+998901234567,Toshkent\nBobur,Rahimov,+998901111111,Samarqand';
  const blob = new Blob(['\uFEFF'+csv], {type:'text/csv;charset=utf-8;'});
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob); a.download = 'mijozlar_shablon.csv'; a.click();
  toast('Shablon yuklandi!','success');
}

async function mijozCSVYukla() {
  const csv = document.getElementById('mijozCSVMatn').value.trim();
  if (!csv) { toast('CSV bo\'sh!','warning'); return; }
  try {
    const r = await apiPost('/import/mijozlar', {csv});
    modalYop(); toast(`✅ ${r.qoshildi} ta mijoz qo'shildi!`,'success');
    mijozlarRoyxatYukla();
  } catch(e) { toast(e.message,'error'); }
}

function csvFaylOqi(input, targetId) {
  const file = input.files[0]; if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    let text = e.target.result;
    if (text.charCodeAt(0)===0xFEFF) text = text.slice(1);
    document.getElementById(targetId).value = text;
  };
  reader.readAsText(file,'UTF-8');
}

// Eski funksiya nomi — compatibility uchun
function mijozSotuvlari(id, nomi) { mijozBatafsil(id, nomi); }
