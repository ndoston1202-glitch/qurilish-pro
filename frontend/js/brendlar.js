// ===== BRENDLAR =====
async function brendlarYukla() {
  const kontent = document.getElementById('asosiyKontent');
  kontent.innerHTML = `
    <div class="card">
      <div class="card-header">
        <h3><i class="fas fa-tag"></i> Brendlar</h3>
        <div style="display:flex;gap:8px">
          <button class="btn btn-secondary btn-sm" onclick="brendlarExcelImport()">
            <i class="fas fa-file-excel"></i> Excel import
          </button>
          <button class="btn btn-primary" onclick="brendQosh()">
            <i class="fas fa-plus"></i> Yangi brend
          </button>
        </div>
      </div>
      <div class="card-body" id="brendlarDiv">
        <div style="text-align:center"><i class="fas fa-spinner fa-spin fa-2x"></i></div>
      </div>
    </div>`;
  await brendlarRoyxatYukla();
}

async function brendlarRoyxatYukla() {
  try {
    const brendlar = await apiGet('/brendlar');
    const div = document.getElementById('brendlarDiv');
    if (!div) return;

    if (!brendlar.length) {
      div.innerHTML = `<div class="empty-state">
        <i class="fas fa-tag fa-3x" style="opacity:0.2;margin-bottom:12px"></i>
        <p>Hali brend qo'shilmagan</p>
        <button class="btn btn-primary" style="margin-top:12px" onclick="brendQosh()">
          <i class="fas fa-plus"></i> Birinchi brendni qo'shing
        </button>
      </div>`;
      return;
    }

    div.innerHTML = `
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:16px">
        ${brendlar.map(b => `
          <div style="background:white;border:1px solid #e2e8f0;border-radius:12px;
            overflow:hidden;transition:all 0.2s;cursor:pointer"
            onmouseover="this.style.boxShadow='0 4px 20px rgba(0,0,0,0.1)';this.style.transform='translateY(-2px)'"
            onmouseout="this.style.boxShadow='';this.style.transform=''"
            onclick="brendBatafsil(${b.id},'${b.nomi.replace(/'/g,"\\'")}')">
            <!-- Rasm -->
            <div style="height:120px;background:#f8fafc;display:flex;align-items:center;
              justify-content:center;overflow:hidden">
              ${b.rasm
                ? `<img src="${b.rasm}" style="width:100%;height:100%;object-fit:contain;padding:8px">`
                : `<div style="text-align:center">
                    <i class="fas fa-tag fa-3x" style="color:#cbd5e1"></i>
                    <div style="font-size:11px;color:#94a3b8;margin-top:4px">Rasm yo'q</div>
                   </div>`}
            </div>
            <!-- Info -->
            <div style="padding:12px">
              <div style="font-weight:700;font-size:15px;margin-bottom:4px">${b.nomi}</div>
              ${b.tavsif ? `<div style="font-size:12px;color:#64748b;margin-bottom:8px">${b.tavsif}</div>` : ''}
              <div style="display:flex;gap:6px">
                <button class="btn btn-warning btn-sm" style="flex:1;font-size:12px"
                  onclick="event.stopPropagation();brendTahrir(${b.id})">
                  <i class="fas fa-edit"></i> Tahrirlash
                </button>
                <button class="btn btn-danger btn-sm btn-icon"
                  onclick="event.stopPropagation();brendOchir(${b.id},'${b.nomi.replace(/'/g,"\\'")}')">
                  <i class="fas fa-trash"></i>
                </button>
              </div>
            </div>
          </div>`).join('')}
      </div>
      <div style="padding:10px;color:#64748b;font-size:13px;margin-top:8px">
        Jami: ${brendlar.length} ta brend
      </div>`;
  } catch(e) { toast(e.message, 'error'); }
}

// ===== BREND QOSHISH/TAHRIRLASH =====
function brendFormKontent(b = null) {
  return `
    <form onsubmit="brendSaqlash(event,${b ? b.id : 'null'})">
      <div class="form-group">
        <label style="font-weight:600">Brend nomi *</label>
        <input type="text" name="nomi" required autofocus
          style="width:100%;padding:10px;border:2px solid #e2e8f0;border-radius:8px;font-size:14px"
          value="${b ? b.nomi : ''}" placeholder="Masalan: Adidas, Nike, Samsung...">
      </div>
      <div class="form-group">
        <label style="font-weight:600">Tavsif</label>
        <input type="text" name="tavsif"
          style="width:100%;padding:10px;border:2px solid #e2e8f0;border-radius:8px;font-size:14px"
          value="${b ? (b.tavsif||'') : ''}" placeholder="Ixtiyoriy tavsif">
      </div>
      <!-- LOGO RASM -->
      <div class="form-group">
        <label style="font-weight:600"><i class="fas fa-image"></i> Brend logosi</label>
        <div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap">
          <div id="brendRasmPreview" style="width:90px;height:90px;border:2px dashed #e2e8f0;
            border-radius:10px;display:flex;align-items:center;justify-content:center;
            overflow:hidden;background:#f8fafc;flex-shrink:0;cursor:pointer"
            onclick="document.getElementById('brendRasmFayl').click()">
            ${b && b.rasm
              ? `<img src="${b.rasm}" style="width:100%;height:100%;object-fit:contain;padding:4px">`
              : `<div style="text-align:center"><i class="fas fa-tag fa-2x" style="color:#cbd5e1"></i><div style="font-size:10px;color:#94a3b8;margin-top:4px">Logo</div></div>`}
          </div>
          <div style="flex:1">
            <input type="file" id="brendRasmFayl" accept="image/*"
              onchange="brendRasmTanlash(this)" style="display:none">
            <button type="button" class="btn btn-secondary btn-sm"
              onclick="document.getElementById('brendRasmFayl').click()">
              <i class="fas fa-upload"></i> Logo yuklash
            </button>
            ${b && b.rasm ? `<button type="button" class="btn btn-danger btn-sm" style="margin-left:6px"
              onclick="brendRasmOchir()"><i class="fas fa-times"></i></button>` : ''}
            <div style="font-size:11px;color:#94a3b8;margin-top:6px">PNG, JPG (max 2MB)</div>
          </div>
        </div>
        <input type="hidden" name="rasm" id="brendRasmInput" value="${b ? (b.rasm||'') : ''}">
      </div>
      <div class="modal-footer" style="padding:0;margin-top:10px">
        <button type="button" class="btn btn-secondary" onclick="modalYop()">Bekor</button>
        <button type="submit" class="btn btn-primary">
          <i class="fas fa-save"></i> Saqlash
        </button>
      </div>
    </form>`;
}

function brendQosh() {
  modalOch('Yangi brend qo\'shish', brendFormKontent());
}

async function brendTahrir(id) {
  try {
    const brendlar = await apiGet('/brendlar');
    const b = brendlar.find(x => x.id == id);
    if (!b) return;
    modalOch('Brendni tahrirlash', brendFormKontent(b));
  } catch(e) { toast(e.message, 'error'); }
}

function brendRasmTanlash(input) {
  const file = input.files[0];
  if (!file) return;
  if (file.size > 2 * 1024 * 1024) { toast('Logo 2MB dan kichik bo\'lsin!', 'warning'); input.value=''; return; }
  const reader = new FileReader();
  reader.onload = e => {
    const base64 = e.target.result;
    document.getElementById('brendRasmInput').value = base64;
    const prev = document.getElementById('brendRasmPreview');
    if (prev) prev.innerHTML = `<img src="${base64}"
      style="width:100%;height:100%;object-fit:contain;padding:4px;cursor:pointer"
      onclick="rasmKattaKorsatish(this.src)">`;
  };
  reader.readAsDataURL(file);
}

function brendRasmOchir() {
  document.getElementById('brendRasmInput').value = '';
  const prev = document.getElementById('brendRasmPreview');
  if (prev) prev.innerHTML = `<div style="text-align:center">
    <i class="fas fa-tag fa-2x" style="color:#cbd5e1"></i>
    <div style="font-size:10px;color:#94a3b8;margin-top:4px">Logo</div></div>`;
}

async function brendSaqlash(e, id) {
  e.preventDefault();
  const form = e.target;
  const data = {
    nomi: form.nomi.value.trim(),
    tavsif: form.tavsif.value.trim(),
    rasm: document.getElementById('brendRasmInput')?.value || null
  };
  if (!data.nomi) { toast('Brend nomi kiritilmagan!', 'warning'); return; }
  try {
    if (id) { await apiPut('/brendlar/' + id, data); toast('✅ Brend yangilandi!'); }
    else { await apiPost('/brendlar', data); toast('✅ Brend qo\'shildi!'); }
    modalYop();
    brendlarRoyxatYukla();
  } catch(e) { toast(e.message, 'error'); }
}

function brendOchir(id, nomi) {
  tasdiqlash(`"${nomi}" brendini o'chirasizmi?`, async () => {
    try {
      await apiDelete('/brendlar/' + id);
      toast('Brend o\'chirildi!');
      brendlarRoyxatYukla();
    } catch(e) { toast(e.message, 'error'); }
  });
}

// ===== BREND BATAFSIL - mahsulotlari bilan =====
async function brendBatafsil(id, nomi) {
  try {
    const data = await apiGet('/brendlar/' + id);
    const mahsulotlar = data.mahsulotlar || [];
    modalOch(`🏷️ ${nomi}`, `
      <div style="display:flex;align-items:center;gap:16px;margin-bottom:16px;
        padding:12px;background:#f8fafc;border-radius:10px">
        ${data.rasm
          ? `<img src="${data.rasm}" style="width:60px;height:60px;object-fit:contain;border-radius:8px;background:white;padding:4px;cursor:pointer"
              onclick="rasmKattaKorsatish(this.src)">`
          : `<div style="width:60px;height:60px;background:#e2e8f0;border-radius:8px;
              display:flex;align-items:center;justify-content:center">
              <i class="fas fa-tag fa-xl" style="color:#94a3b8"></i></div>`}
        <div>
          <div style="font-size:18px;font-weight:700">${nomi}</div>
          ${data.tavsif ? `<div style="color:#64748b;font-size:13px">${data.tavsif}</div>` : ''}
          <div style="font-size:12px;color:#94a3b8;margin-top:2px">${mahsulotlar.length} ta mahsulot</div>
        </div>
      </div>
      ${mahsulotlar.length ? `
        <div style="font-weight:600;margin-bottom:8px;font-size:13px;color:#475569">
          <i class="fas fa-boxes"></i> Mahsulotlar:
        </div>
        <div style="max-height:300px;overflow-y:auto">
          <div class="table-wrapper">
            <table>
              <thead><tr><th>Mahsulot</th><th>Narxi</th><th>Miqdor</th></tr></thead>
              <tbody>
                ${mahsulotlar.map(m=>`
                  <tr>
                    <td>
                      <div style="display:flex;align-items:center;gap:8px">
                        ${m.rasm
                          ? `<img src="${m.rasm}" style="width:32px;height:32px;object-fit:cover;border-radius:4px">`
                          : `<div style="width:32px;height:32px;background:#f1f5f9;border-radius:4px;display:flex;align-items:center;justify-content:center"><i class="fas fa-box" style="color:#cbd5e1;font-size:12px"></i></div>`}
                        <b style="font-size:13px">${m.nomi}</b>
                      </div>
                    </td>
                    <td><b style="color:#2563eb">${formatSum(m.sotish_narxi)}</b></td>
                    <td>${m.miqdor} ${m.birlik}</td>
                  </tr>`).join('')}
              </tbody>
            </table>
          </div>
        </div>` :
        '<div class="empty-state" style="padding:20px"><i class="fas fa-box-open"></i><p>Bu brendda mahsulot yo\'q</p></div>'}
      <div class="modal-footer" style="padding:0;margin-top:14px">
        <button class="btn btn-secondary" onclick="modalYop()">Yopish</button>
        <button class="btn btn-warning" onclick="modalYop();brendTahrir(${id})">
          <i class="fas fa-edit"></i> Tahrirlash
        </button>
      </div>`);
  } catch(e) { toast(e.message, 'error'); }
}


// ===== BRENDLAR EXCEL IMPORT =====
function brendlarExcelImport() {
  modalOch('📥 Brendlarni Excel/CSV orqali import', `
    <div>
      <div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:8px;padding:12px;margin-bottom:14px">
        <div style="font-weight:600;margin-bottom:6px;color:#1d4ed8">
          <i class="fas fa-download"></i> 1-qadam: Shablonni yuklab oling
        </div>
        <button class="btn btn-primary btn-sm" onclick="brendShablonYukla()">
          <i class="fas fa-file-csv"></i> CSV Shablon yuklab olish
        </button>
      </div>
      <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:12px;margin-bottom:14px">
        <div style="font-weight:600;margin-bottom:6px;color:#15803d">
          <i class="fas fa-upload"></i> 2-qadam: To'ldirilgan faylni yuklang
        </div>
        <input type="file" id="brendCSVFayl" accept=".csv,.txt"
          style="width:100%;padding:8px;border:2px dashed #e2e8f0;border-radius:8px;background:white"
          onchange="csvFaylOqi(this,'brendCSVMatn')">
      </div>
      <div class="form-group">
        <label style="font-weight:600">CSV mazmuni:</label>
        <textarea id="brendCSVMatn" rows="5"
          style="width:100%;font-family:monospace;font-size:12px;border:1px solid #e2e8f0;border-radius:8px;padding:8px"
          placeholder="nomi,tavsif&#10;Knauf,Qurilish materiallari&#10;Makita,Asbob-uskunalar"></textarea>
      </div>
      <div class="modal-footer" style="padding:0">
        <button class="btn btn-secondary" onclick="modalYop()">Bekor</button>
        <button class="btn btn-success" onclick="brendCSVYukla()">
          <i class="fas fa-upload"></i> Import qilish
        </button>
      </div>
    </div>`);
}

function brendShablonYukla() {
  const csv = 'nomi,tavsif\nKnauf,Qurilish materiallari\nMakita,Asbob-uskunalar\nKNAUF,Gips va tsement';
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = 'brendlar_shablon.csv'; a.click();
  URL.revokeObjectURL(url);
  toast('Shablon yuklandi!', 'success');
}

async function brendCSVYukla() {
  const csv = document.getElementById('brendCSVMatn')?.value?.trim();
  if (!csv) { toast('CSV matn bo\'sh!', 'warning'); return; }

  const qatorlar = csv.split('\n').filter(q => q.trim());
  // Sarlavha qatorini o'tkazib yuboramiz
  const boshlanish = qatorlar[0].toLowerCase().includes('nomi') ? 1 : 0;

  let qoshildi = 0; let xatolar = [];

  for (let i = boshlanish; i < qatorlar.length; i++) {
    const parts = qatorlar[i].split(',');
    const nomi = parts[0]?.trim();
    const tavsif = parts[1]?.trim() || '';
    if (!nomi) continue;
    try {
      await apiPost('/brendlar', { nomi, tavsif });
      qoshildi++;
    } catch(e) {
      xatolar.push(`"${nomi}": ${e.message}`);
    }
  }

  modalYop();
  toast(`✅ ${qoshildi} ta brend qo'shildi!`, 'success');
  if (xatolar.length) {
    setTimeout(() => toast(`⚠ ${xatolar.length} ta xato: ${xatolar[0]}`, 'warning'), 2000);
  }
  brendlarRoyxatYukla();
}
