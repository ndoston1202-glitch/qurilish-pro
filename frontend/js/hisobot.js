// ===== HISOBOTLAR ASOSIY =====
let hisobotGuruhi = 'moliyaviy';

function hisobotYukla(guruh) {
  hisobotGuruhi = guruh || hisobotGuruhi || 'moliyaviy';
  const kontent = document.getElementById('asosiyKontent');
  kontent.innerHTML = `
    <!-- 3 GURUH -->
    <div style="display:flex;gap:8px;margin-bottom:16px;flex-wrap:wrap">
      <button onclick="hisobotYukla('moliyaviy')"
        style="flex:1;min-width:140px;padding:10px 16px;border-radius:10px;
        border:2px solid ${hisobotGuruhi==='moliyaviy'?'#2563eb':'#e2e8f0'};
        background:${hisobotGuruhi==='moliyaviy'?'#2563eb':'white'};
        color:${hisobotGuruhi==='moliyaviy'?'white':'#64748b'};
        cursor:pointer;font-size:13px;font-weight:600;transition:all 0.2s">
        <i class="fas fa-chart-line" style="margin-right:6px"></i>Moliyaviy
      </button>
      <button onclick="hisobotYukla('ombor')"
        style="flex:1;min-width:140px;padding:10px 16px;border-radius:10px;
        border:2px solid ${hisobotGuruhi==='ombor'?'#8b5cf6':'#e2e8f0'};
        background:${hisobotGuruhi==='ombor'?'#8b5cf6':'white'};
        color:${hisobotGuruhi==='ombor'?'white':'#64748b'};
        cursor:pointer;font-size:13px;font-weight:600;transition:all 0.2s">
        <i class="fas fa-warehouse" style="margin-right:6px"></i>Ombor
      </button>
      <button onclick="hisobotYukla('mijozlar')"
        style="flex:1;min-width:140px;padding:10px 16px;border-radius:10px;
        border:2px solid ${hisobotGuruhi==='mijozlar'?'#10b981':'#e2e8f0'};
        background:${hisobotGuruhi==='mijozlar'?'#10b981':'white'};
        color:${hisobotGuruhi==='mijozlar'?'white':'#64748b'};
        cursor:pointer;font-size:13px;font-weight:600;transition:all 0.2s">
        <i class="fas fa-users" style="margin-right:6px"></i>Mijozlar
      </button>
      <button onclick="hisobotYukla('xodimlar')"
        style="flex:1;min-width:140px;padding:10px 16px;border-radius:10px;
        border:2px solid ${hisobotGuruhi==='xodimlar'?'#f59e0b':'#e2e8f0'};
        background:${hisobotGuruhi==='xodimlar'?'#f59e0b':'white'};
        color:${hisobotGuruhi==='xodimlar'?'white':'#64748b'};
        cursor:pointer;font-size:13px;font-weight:600;transition:all 0.2s">
        <i class="fas fa-id-badge" style="margin-right:6px"></i>Xodimlar
      </button>
    </div>
    <div class="hisobot-tabs" id="hisobotTablar" style="margin-bottom:16px"></div>
    <div id="hisobotKontent"></div>`;

  if      (hisobotGuruhi === 'moliyaviy') moliyaviyTablarKorsatish();
  else if (hisobotGuruhi === 'ombor')     omborTablarKorsatish();
  else if (hisobotGuruhi === 'mijozlar')  mijozlarTablarKorsatish();
  else if (hisobotGuruhi === 'xodimlar')  xodimlarTablarKorsatish();
  // eski 'mahsulot' — ombor ga yo'naltirish
  else { hisobotGuruhi = 'ombor'; omborTablarKorsatish(); }
}

function moliyaviyTablarKorsatish() {
  document.getElementById('hisobotTablar').innerHTML = `
    <button class="tab-btn active" onclick="tabAlmashtir('kunlik',this)">
      <i class="fas fa-calendar-day"></i> Kunlik
    </button>
    <button class="tab-btn" onclick="tabAlmashtir('oylik',this)">
      <i class="fas fa-calendar-alt"></i> Oylik
    </button>
    <button class="tab-btn" onclick="tabAlmashtir('foyda',this)">
      <i class="fas fa-chart-line"></i> Foyda/Zarar
    </button>
    <button class="tab-btn" onclick="tabAlmashtir('xarajatlar',this)">
      <i class="fas fa-money-bill"></i> Xarajatlar
    </button>`;
  kunlikHisobot();
}

function omborTablarKorsatish() {
  document.getElementById('hisobotTablar').innerHTML = `
    <button class="tab-btn active" onclick="tabAlmashtir('qoldiq',this)">
      <i class="fas fa-boxes"></i> Qoldig'i
    </button>
    <button class="tab-btn" onclick="tabAlmashtir('top_mahsulot',this)">
      <i class="fas fa-trophy"></i> Top mahsulot
    </button>
    <button class="tab-btn" onclick="tabAlmashtir('kam_qolgan',this)">
      <i class="fas fa-exclamation-triangle"></i> Kam qolgan
    </button>
    <button class="tab-btn" onclick="tabAlmashtir('kirim_tarixi',this)">
      <i class="fas fa-truck"></i> Kirim tarixi
    </button>
    <button class="tab-btn" onclick="tabAlmashtir('aylanma',this)">
      <i class="fas fa-sync-alt"></i> Tovar aylanmasi
    </button>
    <button class="tab-btn" onclick="tabAlmashtir('sotuvlar',this)">
      <i class="fas fa-list"></i> Sotuvlar tarixi
    </button>
    <button class="tab-btn" onclick="tabAlmashtir('qaytarishlar',this)">
      <i class="fas fa-undo"></i> Qaytarishlar
    </button>`;
  qoldiqHisoboti();
}

function mijozlarTablarKorsatish() {
  document.getElementById('hisobotTablar').innerHTML = `
    <button class="tab-btn active" onclick="tabAlmashtir('top_xaridorlar',this)">
      <i class="fas fa-crown"></i> Top xaridorlar
    </button>
    <button class="tab-btn" onclick="tabAlmashtir('aktiv_mijozlar',this)">
      <i class="fas fa-user-check"></i> Aktiv mijozlar
    </button>
    <button class="tab-btn" onclick="tabAlmashtir('yangi_mijozlar',this)">
      <i class="fas fa-user-plus"></i> Yangi mijozlar
    </button>`;
  topXaridorlarHisoboti();
}

function xodimlarTablarKorsatish() {
  document.getElementById('hisobotTablar').innerHTML = `
    <button class="tab-btn active" onclick="tabAlmashtir('kassir_sotuv',this)">
      <i class="fas fa-cash-register"></i> Kassir sotuvi
    </button>`;
  kassirSotuvHisoboti();
}

function tabAlmashtir(tur, btn) {
  document.querySelectorAll('.hisobot-tabs .tab-btn').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
  switch(tur) {
    case 'kunlik':        kunlikHisobot();          break;
    case 'oylik':         oylikHisobot();           break;
    case 'foyda':         foydaHisoboti();          break;
    case 'xarajatlar':    xarajatlarSahifasi();     break;
    case 'sotuvlar':      sotuvlarTarixi();         break;
    case 'qaytarishlar':  qaytarishlarHisoboti();   break;
    case 'qoldiq':        qoldiqHisoboti();         break;
    case 'top_mahsulot':  topMahsulotHisoboti();    break;
    case 'kam_qolgan':    kamQolganHisoboti();       break;
    case 'kirim_tarixi':  kirimTarixiHisoboti();    break;
    case 'aylanma':       aylanmaHisoboti();        break;
    case 'top_xaridorlar': topXaridorlarHisoboti(); break;
    case 'aktiv_mijozlar': aktivMijozlarHisoboti(); break;
    case 'yangi_mijozlar': yangiMijozlarHisoboti(); break;
    case 'kassir_sotuv':  kassirSotuvHisoboti();    break;
  }
}

async function kunlikHisobot() {
  document.getElementById('hisobotKontent').innerHTML = `
    <div class="card">
      <div class="card-header">
        <h3><i class="fas fa-calendar-day"></i> Kunlik hisobot</h3>
        <input type="date" id="kunSana" value="${bugunSana()}" class="search-input" onchange="kunlikHisobotYukla()">
      </div>
      <div class="card-body" id="kunlikMalumat">
        <div style="text-align:center"><i class="fas fa-spinner fa-spin fa-2x"></i></div>
      </div>
    </div>`;
  await kunlikHisobotYukla();
}

async function kunlikHisobotYukla() {
  const sana = document.getElementById('kunSana')?.value || bugunSana();
  try {
    const data = await apiGet(`/hisobot/kunlik?sana=${sana}`);
    document.getElementById('kunlikMalumat').innerHTML = `
      <div class="stats-grid" style="margin-bottom:20px">
        <div class="stat-card"><div class="stat-icon blue"><i class="fas fa-shopping-cart"></i></div>
          <div class="stat-info"><h3>${data.sotuvlar.son||0}</h3><p>Sotuvlar soni</p></div></div>
        <div class="stat-card"><div class="stat-icon green"><i class="fas fa-coins"></i></div>
          <div class="stat-info"><h3>${formatSum(data.sotuvlar.jami)}</h3><p>Jami daromad</p></div></div>
        <div class="stat-card"><div class="stat-icon red"><i class="fas fa-minus-circle"></i></div>
          <div class="stat-info"><h3>${formatSum(data.xarajatlar.jami)}</h3><p>Xarajatlar</p></div></div>
        <div class="stat-card"><div class="stat-icon orange"><i class="fas fa-chart-line"></i></div>
          <div class="stat-info"><h3>${formatSum((data.sotuvlar.jami||0)-(data.xarajatlar.jami||0))}</h3><p>Sof foyda</p></div></div>
      </div>
      ${data.topMahsulotlar.length ? `
        <h4 style="margin-bottom:12px"><i class="fas fa-trophy" style="color:#f59e0b"></i> Top 10</h4>
        <div class="table-wrapper"><table>
          <thead><tr><th>#</th><th>Mahsulot</th><th>Miqdor</th><th>Summa</th></tr></thead>
          <tbody>${data.topMahsulotlar.map((m,i)=>`
            <tr><td>${i<3?['🥇','🥈','🥉'][i]:i+1}</td><td>${m.nomi}</td>
            <td>${m.jami_miqdor}</td><td><b>${formatSum(m.jami_summa)}</b></td></tr>`).join('')}
          </tbody></table></div>` :
        '<div class="empty-state"><i class="fas fa-chart-bar"></i><p>Bu kunda sotuv yo\'q</p></div>'}`;
  } catch(e) { toast(e.message,'error'); }
}

async function oylikHisobot() {
  const yil=new Date().getFullYear(), oy=new Date().getMonth()+1;
  const oylar=['Yanvar','Fevral','Mart','Aprel','May','Iyun','Iyul','Avgust','Sentabr','Oktabr','Noyabr','Dekabr'];
  document.getElementById('hisobotKontent').innerHTML = `
    <div class="card">
      <div class="card-header">
        <h3><i class="fas fa-calendar-alt"></i> Oylik hisobot</h3>
        <div class="filter-bar">
          <select id="oyYil" class="filter-select" onchange="oylikHisobotYukla()">
            ${[yil-1,yil,yil+1].map(y=>`<option ${y==yil?'selected':''}>${y}</option>`).join('')}
          </select>
          <select id="oyOy" class="filter-select" onchange="oylikHisobotYukla()">
            ${oylar.map((o,i)=>`<option value="${i+1}" ${i+1==oy?'selected':''}>${o}</option>`).join('')}
          </select>
        </div>
      </div>
      <div class="card-body" id="oylikMalumat"><div style="text-align:center"><i class="fas fa-spinner fa-spin fa-2x"></i></div></div>
    </div>`;
  await oylikHisobotYukla();
}

async function oylikHisobotYukla() {
  const yil=document.getElementById('oyYil')?.value, oy=document.getElementById('oyOy')?.value;
  try {
    const data=await apiGet(`/hisobot/oylik?yil=${yil}&oy=${oy}`);
    const oylar=['Yanvar','Fevral','Mart','Aprel','May','Iyun','Iyul','Avgust','Sentabr','Oktabr','Noyabr','Dekabr'];
    document.getElementById('oylikMalumat').innerHTML = `
      <div class="stats-grid" style="margin-bottom:20px">
        <div class="stat-card"><div class="stat-icon blue"><i class="fas fa-shopping-cart"></i></div>
          <div class="stat-info"><h3>${data.jami.son||0}</h3><p>Jami sotuvlar</p></div></div>
        <div class="stat-card"><div class="stat-icon green"><i class="fas fa-coins"></i></div>
          <div class="stat-info"><h3>${formatSum(data.jami.jami)}</h3><p>Jami daromad</p></div></div>
        <div class="stat-card"><div class="stat-icon red"><i class="fas fa-minus-circle"></i></div>
          <div class="stat-info"><h3>${formatSum(data.xarajatlar.jami)}</h3><p>Xarajatlar</p></div></div>
        <div class="stat-card"><div class="stat-icon orange"><i class="fas fa-chart-line"></i></div>
          <div class="stat-info"><h3>${formatSum((data.jami.jami||0)-(data.xarajatlar.jami||0))}</h3><p>Sof foyda</p></div></div>
      </div>
      ${data.kunliklar.length ? `
        <div class="table-wrapper"><table>
          <thead><tr><th>Sana</th><th>Sotuvlar</th><th>Jami summa</th></tr></thead>
          <tbody>${data.kunliklar.map(k=>`
            <tr><td>${new Date(k.kun).toLocaleDateString('uz-UZ',{day:'numeric',month:'long'})}</td>
            <td>${k.sotuvlar_soni}</td><td><b>${formatSum(k.jami)}</b></td></tr>`).join('')}
          </tbody></table></div>` :
        '<div class="empty-state"><i class="fas fa-chart-bar"></i><p>Bu oyda sotuv yo\'q</p></div>'}`;
  } catch(e) { toast(e.message,'error'); }
}


// ===== SOTUVLAR TARIXI — chekni qayta chiqarish (task 3) =====
async function sotuvlarTarixi() {
  const bugun=bugunSana(), oyBoshi=bugun.slice(0,8)+'01';
  document.getElementById('hisobotKontent').innerHTML = `
    <div class="card">
      <div class="card-header">
        <h3><i class="fas fa-list"></i> Sotuvlar tarixi</h3>
        <div class="filter-bar">
          <input type="date" id="stBosh" value="${oyBoshi}" class="search-input" onchange="sotuvlarRoyxatYukla()">
          <input type="date" id="stTugash" value="${bugun}" class="search-input" onchange="sotuvlarRoyxatYukla()">
        </div>
      </div>
      <div class="card-body" id="sotuvlarRoyxat"><div style="text-align:center"><i class="fas fa-spinner fa-spin fa-2x"></i></div></div>
    </div>`;
  await sotuvlarRoyxatYukla();
}

async function sotuvlarRoyxatYukla() {
  const bosh=document.getElementById('stBosh')?.value, tug=document.getElementById('stTugash')?.value;
  try {
    const sotuvlar=await apiGet(`/sotuvlar?boshlanish=${bosh}&tugash=${tug}`);
    const jami=sotuvlar.reduce((s,x)=>s+x.jami_summa,0);
    document.getElementById('sotuvlarRoyxat').innerHTML = sotuvlar.length ? `
      <div style="background:#f0fdf4;padding:12px 16px;border-radius:8px;margin-bottom:16px;display:flex;gap:20px">
        <span><b>${sotuvlar.length}</b> ta sotuv</span>
        <span>Jami: <b>${formatSum(jami)}</b></span>
      </div>
      <div class="table-wrapper"><table>
        <thead><tr><th>Chek</th><th>Kassir</th><th>Mijoz</th><th>To'lov</th><th>Summa</th><th>Sana</th><th></th></tr></thead>
        <tbody>${sotuvlar.map(s=>`
          <tr>
            <td><span class="badge badge-info">${s.chek_raqam}</span></td>
            <td>${s.kassir_ismi}</td>
            <td>${s.mijoz_ismi||'-'}</td>
            <td><span class="badge ${s.tolov_turi==='naqd'?'badge-success':s.tolov_turi==='karta'?'badge-info':'badge-warning'}">
              ${s.tolov_turi==='naqd'?'💵 Naqd':s.tolov_turi==='karta'?'💳 Karta':'📋 Qarz'}
            </span></td>
            <td><b>${formatSum(s.jami_summa)}</b></td>
            <td style="font-size:12px;color:#64748b">${formatSana(s.sana)}</td>
            <td style="display:flex;gap:4px">
              <button class="btn btn-secondary btn-sm btn-icon" title="Batafsil" onclick="sotuvBatafsil(${s.id})"><i class="fas fa-eye"></i></button>
              <button class="btn btn-primary btn-sm btn-icon" title="Chekni qayta chiqarish" onclick="chekniQaytaChiqar(${s.id})"><i class="fas fa-print"></i></button>
              ${joriyFoydalanuvchi.rol==='admin'?`<button class="btn btn-danger btn-sm btn-icon" title="O'chirish" onclick="sotuvOchir(${s.id})"><i class="fas fa-trash"></i></button>`:''}
            </td>
          </tr>`).join('')}
        </tbody></table></div>` :
      '<div class="empty-state"><i class="fas fa-receipt"></i><p>Bu davrda sotuv yo\'q</p></div>';
  } catch(e) { toast(e.message,'error'); }
}

async function sotuvBatafsil(id) {
  try {
    const s=await apiGet('/sotuvlar/'+id);
    modalOch('Sotuv tafsilotlari', `
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;font-size:14px;margin-bottom:12px">
        <div><b>Chek:</b> ${s.chek_raqam}</div>
        <div><b>Kassir:</b> ${s.kassir_ismi}</div>
        <div><b>Sana:</b> ${formatSana(s.sana)}</div>
        <div><b>To'lov:</b> ${s.tolov_turi}</div>
        ${s.mijoz_ismi?`<div><b>Mijoz:</b> ${s.mijoz_ismi}</div>`:''}
      </div>
      <div class="table-wrapper"><table>
        <thead><tr><th>Mahsulot</th><th>Miqdor</th><th>Narxi</th><th>Jami</th></tr></thead>
        <tbody>${s.tafsilotlar.map(t=>`
          <tr><td>${t.mahsulot_nomi}</td><td>${t.miqdor} ${t.birlik}</td>
          <td>${formatSum(t.narxi)}</td><td><b>${formatSum(t.jami)}</b></td></tr>`).join('')}
        </tbody></table></div>
      <div style="border-top:1px solid #e2e8f0;margin-top:12px;padding-top:12px">
        ${s.chegirma>0?`<div style="display:flex;justify-content:space-between;margin-bottom:6px"><span>Chegirma:</span><span>-${formatSum(s.chegirma)}</span></div>`:''}
        <div style="display:flex;justify-content:space-between;font-size:18px;font-weight:700;color:#2563eb">
          <span>Jami:</span><span>${formatSum(s.jami_summa)}</span>
        </div>
      </div>
      <div class="modal-footer" style="padding:0;margin-top:12px">
        <button class="btn btn-secondary" onclick="modalYop()">Yopish</button>
        <button class="btn btn-primary" onclick="chekniQaytaChiqar(${s.id})"><i class="fas fa-print"></i> Chekni chiqarish</button>
      </div>`);
  } catch(e) { toast(e.message,'error'); }
}

// Chekni qayta chiqarish — printer.js orqali
async function chekniQaytaChiqar(id) {
  try {
    const s = await apiGet('/sotuvlar/'+id);
    const soz = sozlamalarniOl();
    const html = `
      <div style="font-family:'Courier New',monospace;font-size:12px;padding:8px;width:100%">
        <h3 style="text-align:center;font-size:14px;margin-bottom:4px">${soz.chek_dokoni_nomi||"Qurilish Do'koni"}</h3>
        ${soz.chek_manzil?`<div style="text-align:center;font-size:10px">${soz.chek_manzil}</div>`:''}
        ${soz.chek_telefon?`<div style="text-align:center;font-size:10px">Tel: ${soz.chek_telefon}</div>`:''}
        <div style="border-top:1px dashed #000;border-bottom:1px dashed #000;padding:3px 0;margin:4px 0;text-align:center">Sotuv cheki</div>
        <div style="display:flex;justify-content:space-between"><span>Chek:</span><span>${s.chek_raqam}</span></div>
        <div style="display:flex;justify-content:space-between"><span>Kassir:</span><span>${s.kassir_ismi}</span></div>
        ${s.mijoz_ismi?`<div style="display:flex;justify-content:space-between"><span>Mijoz:</span><span>${s.mijoz_ismi}</span></div>`:''}
        <div style="display:flex;justify-content:space-between"><span>Sana:</span><span>${formatSana(s.sana)}</span></div>
        <div style="border-top:1px dashed #000;margin:4px 0"></div>
        ${s.tafsilotlar.map(t=>`
          <div>${t.mahsulot_nomi}</div>
          <div style="display:flex;justify-content:space-between">
            <span>${t.miqdor} x ${formatSum(t.narxi)}</span><span>${formatSum(t.jami)}</span>
          </div>`).join('')}
        <div style="border-top:1px dashed #000;margin:4px 0"></div>
        ${s.chegirma>0?`<div style="display:flex;justify-content:space-between"><span>Chegirma:</span><span>-${formatSum(s.chegirma)}</span></div>`:''}
        <div style="display:flex;justify-content:space-between;font-weight:bold;font-size:13px">
          <span>JAMI:</span><span>${formatSum(s.jami_summa)}</span>
        </div>
        <div style="border-top:1px dashed #000;margin:4px 0"></div>
        <div style="text-align:center;font-size:10px">${soz.chek_xabar||"Rahmat! Yana keling! 🙏"}</div>
      </div>`;

    if (typeof chekChiqar === 'function') {
      chekChiqar(html, `Chek — ${s.chek_raqam}`);
    } else {
      modalOch(`Chek — ${s.chek_raqam}`, html + `
        <div class="modal-footer" style="padding:0;margin-top:16px">
          <button class="btn btn-secondary" onclick="modalYop()">Yopish</button>
          <button class="btn btn-primary" onclick="window.print()">🖨️ Chop etish</button>
        </div>`);
    }
  } catch(e) { toast(e.message,'error'); }
}

function sotuvOchir(id) {
  tasdiqlash('Bu sotuvni o\'chirasizmi? Mahsulotlar omborga qaytariladi!', async () => {
    try { await apiDelete('/sotuvlar/'+id); toast('Sotuv o\'chirildi!'); sotuvlarRoyxatYukla(); }
    catch(e) { toast(e.message,'error'); }
  });
}


// ===== FOYDA / ZARAR HISOBOTI (task 5) =====
async function foydaHisoboti() {
  const bugun=bugunSana(), oyBoshi=bugun.slice(0,8)+'01';
  document.getElementById('hisobotKontent').innerHTML = `
    <div class="card">
      <div class="card-header">
        <h3><i class="fas fa-chart-line"></i> Foyda / Zarar hisoboti</h3>
        <div class="filter-bar">
          <input type="date" id="fBosh" value="${oyBoshi}" class="search-input" onchange="foydaYukla()">
          <input type="date" id="fTugash" value="${bugun}" class="search-input" onchange="foydaYukla()">
          <button class="btn btn-success btn-sm" onclick="foydaExcelExport()"><i class="fas fa-file-excel"></i> Excel</button>
        </div>
      </div>
      <div class="card-body" id="foydaKontent"><div style="text-align:center"><i class="fas fa-spinner fa-spin fa-2x"></i></div></div>
    </div>`;
  await foydaYukla();
}

async function foydaYukla() {
  const bosh=document.getElementById('fBosh')?.value, tug=document.getElementById('fTugash')?.value;
  try {
    const data=await apiGet(`/hisobot/foyda?boshlanish=${bosh}&tugash=${tug}`);
    window._foydaData = data;
    const foydaRangi = data.jami_foyda >= 0 ? '#10b981' : '#ef4444';
    document.getElementById('foydaKontent').innerHTML = `
      <div class="stats-grid" style="margin-bottom:20px">
        <div class="stat-card">
          <div class="stat-icon ${data.jami_foyda>=0?'green':'red'}">
            <i class="fas fa-${data.jami_foyda>=0?'arrow-up':'arrow-down'}"></i>
          </div>
          <div class="stat-info">
            <h3 style="color:${foydaRangi}">${formatSum(data.jami_foyda)}</h3>
            <p>Jami ${data.jami_foyda>=0?'foyda':'zarar'}</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon blue"><i class="fas fa-boxes"></i></div>
          <div class="stat-info"><h3>${data.rows.length}</h3><p>Sotilgan mahsulot turi</p></div>
        </div>
      </div>
      ${data.rows.length ? `
        <div class="table-wrapper"><table>
          <thead><tr>
            <th>Mahsulot</th><th>Miqdor</th>
            <th>Kelish narxi</th><th>Sotish jami</th>
            <th>Kelish jami</th><th>Foyda/Zarar</th>
          </tr></thead>
          <tbody>${data.rows.map(r=>{
            const foyda=r.foyda||0;
            const rang=foyda>=0?'#10b981':'#ef4444';
            return `<tr>
              <td><b>${r.nomi}</b></td>
              <td>${r.jami_miqdor} ${r.birlik}</td>
              <td>${formatSum(r.kelish_narxi)}</td>
              <td>${formatSum(r.jami_sotish)}</td>
              <td>${formatSum(r.jami_kelish)}</td>
              <td><b style="color:${rang}">${foyda>=0?'+':''}${formatSum(foyda)}</b></td>
            </tr>`;}).join('')}
          </tbody>
          <tfoot><tr style="background:#f8fafc;font-weight:700">
            <td colspan="5">JAMI FOYDA/ZARAR</td>
            <td style="color:${foydaRangi}">${data.jami_foyda>=0?'+':''}${formatSum(data.jami_foyda)}</td>
          </tr></tfoot>
        </table></div>` :
        '<div class="empty-state"><i class="fas fa-chart-line"></i><p>Bu davrda sotuv yo\'q</p></div>'}`;
  } catch(e) { toast(e.message,'error'); }
}

function foydaExcelExport() {
  const data = window._foydaData;
  if (!data || !data.rows.length) { toast('Ma\'lumot yo\'q!','warning'); return; }
  const bosh=document.getElementById('fBosh')?.value||'';
  const tug=document.getElementById('fTugash')?.value||'';
  let csv = '\uFEFF';
  csv += `Foyda/Zarar hisoboti: ${bosh} - ${tug}\n\n`;
  csv += 'Mahsulot,Birlik,Miqdor,Kelish narxi,Sotish jami,Kelish jami,Foyda/Zarar\n';
  data.rows.forEach(r => {
    csv += `"${r.nomi}",${r.birlik},${r.jami_miqdor},${r.kelish_narxi},${r.jami_sotish||0},${r.jami_kelish||0},${r.foyda||0}\n`;
  });
  csv += `\n,,,,,,${data.jami_foyda}\n`;
  excelYukla(csv, `foyda_${bosh}_${tug}.csv`);
}

// ===== MAHSULOT QOLDIG'I HISOBOTI =====
async function qoldiqHisoboti() {
  document.getElementById('hisobotKontent').innerHTML = `
    <div class="card">
      <div class="card-header">
        <h3><i class="fas fa-boxes"></i> Mahsulotlar qoldig'i</h3>
        <div class="filter-bar" style="flex-wrap:wrap">
          <input type="text" id="qoldiqQidiruv" class="search-input"
            placeholder="🔍 Mahsulot qidirish..."
            oninput="qoldiqFilter()" style="min-width:180px">
          <select id="qoldiqBrendFilter" class="filter-select" onchange="qoldiqFilter()">
            <option value="">Barcha brendlar</option>
          </select>
          <select id="qoldiqKatFilter" class="filter-select" onchange="qoldiqFilter()">
            <option value="">Barcha kategoriyalar</option>
          </select>
          <select id="qoldiqHolatFilter" class="filter-select" onchange="qoldiqFilter()">
            <option value="">Barcha holat</option>
            <option value="kam">⚠ Kam qolganlar</option>
            <option value="yetarli">✅ Yetarlilar</option>
          </select>
          <button class="btn btn-success btn-sm" onclick="qoldiqExcelExport()">
            <i class="fas fa-file-excel"></i> Excel
          </button>
        </div>
      </div>
      <div class="card-body" id="qoldiqKontent">
        <div style="text-align:center"><i class="fas fa-spinner fa-spin fa-2x"></i></div>
      </div>
    </div>`;
  await qoldiqYukla();
}

async function qoldiqYukla() {
  try {
    const [rows, brendlar] = await Promise.all([
      apiGet('/hisobot/qoldiq'),
      apiGet('/brendlar')
    ]);
    window._qoldiqData = rows;

    // Brendlar filterni to'ldirish
    const brendSel = document.getElementById('qoldiqBrendFilter');
    if (brendSel && brendlar.length) {
      brendlar.forEach(b => brendSel.innerHTML += `<option value="${b.id}">${b.nomi}</option>`);
    }

    // Kategoriyalar filterni to'ldirish
    const katlar = [...new Set(rows.map(r=>r.kategoriya_nomi||'Kategoriyasiz'))].sort();
    const sel = document.getElementById('qoldiqKatFilter');
    if (sel) katlar.forEach(k => sel.innerHTML += `<option>${k}</option>`);

    qoldiqKorsatish(rows);
  } catch(e) { toast(e.message,'error'); }
}

function qoldiqFilter() {
  const q     = (document.getElementById('qoldiqQidiruv')?.value||'').toLowerCase();
  const kat   = document.getElementById('qoldiqKatFilter')?.value||'';
  const brend = document.getElementById('qoldiqBrendFilter')?.value||'';
  const holat = document.getElementById('qoldiqHolatFilter')?.value||'';

  const f = (window._qoldiqData||[]).filter(r => {
    const qMos     = !q     || r.nomi.toLowerCase().includes(q) || (r.sku||'').toLowerCase().includes(q);
    const katMos   = !kat   || (r.kategoriya_nomi||'Kategoriyasiz') === kat;
    const brendMos = !brend || String(r.brend_id) === String(brend);
    const holatMos = !holat || (holat==='kam' ? r.miqdor<=r.min_miqdor : r.miqdor>r.min_miqdor);
    return qMos && katMos && brendMos && holatMos;
  });
  qoldiqKorsatish(f);
}

function qoldiqKorsatish(rows) {
  const jamiKelish=rows.reduce((s,r)=>s+(r.kelish_qiymati||0),0);
  const jamiSotish=rows.reduce((s,r)=>s+(r.sotish_qiymati||0),0);
  const div=document.getElementById('qoldiqKontent');
  if (!rows.length) { div.innerHTML='<div class="empty-state"><i class="fas fa-boxes"></i><p>Mahsulot topilmadi</p></div>'; return; }
  div.innerHTML = `
    <div class="stats-grid" style="margin-bottom:16px">
      <div class="stat-card"><div class="stat-icon blue"><i class="fas fa-boxes"></i></div>
        <div class="stat-info"><h3>${rows.length}</h3><p>Mahsulot turi</p></div></div>
      <div class="stat-card"><div class="stat-icon orange"><i class="fas fa-money-bill"></i></div>
        <div class="stat-info"><h3>${formatSum(jamiKelish)}</h3><p>Kelish qiymati</p></div></div>
      <div class="stat-card"><div class="stat-icon green"><i class="fas fa-coins"></i></div>
        <div class="stat-info"><h3>${formatSum(jamiSotish)}</h3><p>Sotish qiymati</p></div></div>
    </div>
    <div class="table-wrapper"><table>
      <thead><tr>
        <th>#</th><th>Mahsulot</th><th>Brend</th><th>Kategoriya</th><th>Birlik</th>
        <th>Soni</th><th>Kelish narxi</th><th>Sotish narxi</th>
        <th>Kelish qiymati</th><th>Sotish qiymati</th><th>Holat</th>
      </tr></thead>
      <tbody>${rows.map((r,i)=>`
        <tr>
          <td>${i+1}</td>
          <td>
            <b>${r.nomi}</b>
            ${r.sku?`<br><span style="font-size:10px;color:#8b5cf6;background:#ede9fe;padding:1px 5px;border-radius:3px">${r.sku}</span>`:''}
          </td>
          <td style="font-size:12px">${r.brend_nomi?`<span class="badge badge-warning" style="font-size:11px">${r.brend_nomi}</span>`:'<span style="color:#cbd5e1">—</span>'}</td>
          <td><span class="badge badge-secondary">${r.kategoriya_nomi||'-'}</span></td>
          <td>${r.birlik}</td>
          <td><b>${r.miqdor}</b></td>
          <td>${formatSum(r.kelish_narxi)}</td>
          <td>${formatSum(r.sotish_narxi)}</td>
          <td>${formatSum(r.kelish_qiymati)}</td>
          <td>${formatSum(r.sotish_qiymati)}</td>
          <td>${r.miqdor<=r.min_miqdor
            ?'<span class="badge badge-danger">⚠ Kam</span>'
            :'<span class="badge badge-success">✅ Yetarli</span>'}</td>
        </tr>`).join('')}
      </tbody>
      <tfoot><tr style="background:#f8fafc;font-weight:700">
        <td colspan="8">JAMI</td>
        <td>${formatSum(jamiKelish)}</td>
        <td>${formatSum(jamiSotish)}</td><td></td>
      </tr></tfoot>
    </table></div>`;
}

function qoldiqExcelExport() {
  const rows = window._qoldiqData || [];
  if (!rows.length) { toast('Ma\'lumot yo\'q!','warning'); return; }
  let csv = '\uFEFF';
  csv += `Mahsulotlar qoldig'i hisoboti — ${new Date().toLocaleDateString('uz-UZ')}\n\n`;
  csv += '#,Mahsulot,Kategoriya,Birlik,Soni,Kelish narxi,Sotish narxi,Kelish qiymati,Sotish qiymati,Holat\n';
  rows.forEach((r,i) => {
    const holat = r.miqdor <= r.min_miqdor ? 'Kam' : 'Yetarli';
    csv += `${i+1},"${r.nomi}","${r.kategoriya_nomi||'-'}",${r.birlik},${r.miqdor},${r.kelish_narxi},${r.sotish_narxi},${r.kelish_qiymati||0},${r.sotish_qiymati||0},${holat}\n`;
  });
  const jamiKelish=rows.reduce((s,r)=>s+(r.kelish_qiymati||0),0);
  const jamiSotish=rows.reduce((s,r)=>s+(r.sotish_qiymati||0),0);
  csv += `\nJAMI,,,,,,,,${jamiKelish},${jamiSotish},\n`;
  excelYukla(csv, `mahsulotlar_qoldig_${new Date().toISOString().split('T')[0]}.csv`);
}

function excelYukla(csv, fayl_nomi) {
  const blob = new Blob([csv], {type:'text/csv;charset=utf-8;'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href=url; a.download=fayl_nomi; a.click();
  URL.revokeObjectURL(url);
  toast('✅ Excel fayl yuklandi!', 'success');
}

// ===== QAYTARISHLAR (task 3) =====
async function qaytarishlarHisoboti() {
  const bugun=bugunSana(), oyBoshi=bugun.slice(0,8)+'01';
  document.getElementById('hisobotKontent').innerHTML = `
    <div class="card">
      <div class="card-header">
        <h3><i class="fas fa-undo"></i> Qaytarishlar</h3>
        <div class="filter-bar">
          <input type="date" id="qrBosh" value="${oyBoshi}" class="search-input" onchange="qaytarishlarYukla()">
          <input type="date" id="qrTugash" value="${bugun}" class="search-input" onchange="qaytarishlarYukla()">
        </div>
      </div>
      <div class="card-body" id="qaytarishlarKontent"><div style="text-align:center"><i class="fas fa-spinner fa-spin fa-2x"></i></div></div>
    </div>`;
  await qaytarishlarYukla();
}

async function qaytarishlarYukla() {
  const bosh=document.getElementById('qrBosh')?.value, tug=document.getElementById('qrTugash')?.value;
  try {
    const rows=await apiGet(`/qaytarishlar?boshlanish=${bosh}&tugash=${tug}`);
    const jami=rows.reduce((s,r)=>s+r.jami_summa,0);
    document.getElementById('qaytarishlarKontent').innerHTML = rows.length ? `
      <div style="background:#fff1f2;padding:12px 16px;border-radius:8px;margin-bottom:16px">
        <b>${rows.length}</b> ta qaytarish | Jami: <b style="color:#ef4444">${formatSum(jami)}</b>
      </div>
      <div class="table-wrapper"><table>
        <thead>
          <tr>
            <th>Raqam</th><th>Kassir</th><th>Mijoz</th>
            <th>Sabab</th><th>Summa</th><th>Sana</th><th>Amallar</th>
          </tr>
        </thead>
        <tbody>${rows.map(r=>`
          <tr style="cursor:pointer" onmouseover="this.style.background='#fef2f2'" onmouseout="this.style.background=''">
            <td><span class="badge badge-warning" style="cursor:pointer" onclick="qaytarishBatafsil(${r.id})">${r.chek_raqam}</span></td>
            <td>${r.kassir_ismi||'-'}</td>
            <td>${r.mijoz_ismi||'-'}</td>
            <td style="font-size:12px;max-width:120px">${r.sabab||'-'}</td>
            <td><b style="color:#ef4444">${formatSum(r.jami_summa)}</b></td>
            <td style="font-size:12px;color:#64748b">${formatSana(r.sana)}</td>
            <td style="display:flex;gap:4px">
              <button class="btn btn-secondary btn-sm btn-icon" title="Batafsil ko'rish"
                onclick="qaytarishBatafsil(${r.id})">
                <i class="fas fa-eye"></i>
              </button>
              ${joriyFoydalanuvchi.rol==='admin'?`
                <button class="btn btn-danger btn-sm btn-icon" title="O'chirish"
                  onclick="qaytarishOchir(${r.id})">
                  <i class="fas fa-trash"></i>
                </button>`:''}
            </td>
          </tr>`).join('')}
        </tbody>
      </table></div>` :
      '<div class="empty-state"><i class="fas fa-undo"></i><p>Bu davrda qaytarish yo\'q</p></div>';
  } catch(e) { toast(e.message,'error'); }
}

// ===== QAYTARISH BATAFSIL =====
async function qaytarishBatafsil(id) {
  try {
    const r = await apiGet('/qaytarishlar/' + id);
    const tafsilotlar = r.tafsilotlar || [];
    modalOch(`Qaytarish — ${r.chek_raqam}`, `
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;font-size:14px;margin-bottom:16px;
        background:#fff1f2;padding:12px;border-radius:8px;border:1px solid #fecaca">
        <div><b>Raqam:</b> <span class="badge badge-warning">${r.chek_raqam}</span></div>
        <div><b>Kassir:</b> ${r.kassir_ismi||'-'}</div>
        <div><b>Sana:</b> ${formatSana(r.sana)}</div>
        <div><b>Mijoz:</b> ${r.mijoz_ismi||'-'}</div>
        ${r.sabab?`<div colspan="2"><b>Sabab:</b> ${r.sabab}</div>`:''}
      </div>

      <h4 style="margin-bottom:10px;font-size:14px;color:#475569">
        <i class="fas fa-list"></i> Qaytarilgan mahsulotlar:
      </h4>

      ${tafsilotlar.length ? `
        <div class="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Mahsulot</th>
                <th>Miqdor</th>
                <th>Narxi</th>
                <th>Jami</th>
              </tr>
            </thead>
            <tbody>
              ${tafsilotlar.map((t,i) => `
                <tr>
                  <td>${i+1}</td>
                  <td><b>${t.mahsulot_nomi}</b></td>
                  <td>${t.miqdor} ${t.birlik}</td>
                  <td>${formatSum(t.narxi)}</td>
                  <td><b style="color:#ef4444">${formatSum(t.jami)}</b></td>
                </tr>`).join('')}
            </tbody>
          </table>
        </div>
        <div style="border-top:1px solid #e2e8f0;margin-top:12px;padding-top:12px;
          display:flex;justify-content:space-between;font-size:16px;font-weight:700">
          <span>Jami qaytarish:</span>
          <span style="color:#ef4444">-${formatSum(r.jami_summa)}</span>
        </div>` :
        '<div class="empty-state"><i class="fas fa-box-open"></i><p>Tafsilot topilmadi</p></div>'}

      <div class="modal-footer" style="padding:0;margin-top:16px">
        <button class="btn btn-secondary" onclick="modalYop()">Yopish</button>
        ${joriyFoydalanuvchi.rol==='admin' ? `
          <button class="btn btn-danger" onclick="modalYop();qaytarishOchir(${r.id})">
            <i class="fas fa-trash"></i> O'chirish
          </button>` : ''}
      </div>`);
  } catch(e) { toast(e.message,'error'); }
}

function qaytarishOchir(id) {
  tasdiqlash('Bu qaytarishni o\'chirasizmi?', async () => {
    try { await apiDelete('/qaytarishlar/'+id); toast('O\'chirildi!'); qaytarishlarYukla(); }
    catch(e) { toast(e.message,'error'); }
  });
}

// ===== XARAJATLAR =====
async function xarajatlarSahifasi() {
  const bugun=bugunSana(), oyBoshi=bugun.slice(0,8)+'01';
  document.getElementById('hisobotKontent').innerHTML = `
    <div class="card">
      <div class="card-header">
        <h3><i class="fas fa-money-bill"></i> Xarajatlar</h3>
        <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">
          <input type="date" id="xrBosh" value="${oyBoshi}" class="search-input" onchange="xarajatlarYukla()">
          <input type="date" id="xrTugash" value="${bugun}" class="search-input" onchange="xarajatlarYukla()">
          <button class="btn btn-primary btn-sm" onclick="xarajatQosh()"><i class="fas fa-plus"></i> Xarajat</button>
        </div>
      </div>
      <div class="card-body" id="xarajatlarRoyxat"><div style="text-align:center"><i class="fas fa-spinner fa-spin fa-2x"></i></div></div>
    </div>`;
  await xarajatlarYukla();
}

async function xarajatlarYukla() {
  const bosh=document.getElementById('xrBosh')?.value, tug=document.getElementById('xrTugash')?.value;
  try {
    const xar=await apiGet(`/xarajatlar?boshlanish=${bosh}&tugash=${tug}`);
    const jami=xar.reduce((s,x)=>s+x.summa,0);
    document.getElementById('xarajatlarRoyxat').innerHTML = xar.length ? `
      <div style="background:#fff1f2;padding:12px 16px;border-radius:8px;margin-bottom:16px">
        Jami xarajat: <b>${formatSum(jami)}</b>
      </div>
      <div class="table-wrapper"><table>
        <thead><tr><th>Nomi</th><th>Summa</th><th>Kategoriya</th><th>Xodim</th><th>Sana</th><th></th></tr></thead>
        <tbody>${xar.map(x=>`
          <tr>
            <td>${x.nomi}</td>
            <td><b style="color:#ef4444">${formatSum(x.summa)}</b></td>
            <td>${x.kategoriya||'-'}</td>
            <td>${x.xodim_ismi||'-'}</td>
            <td style="font-size:12px;color:#64748b">${formatSana(x.sana)}</td>
            <td><button class="btn btn-danger btn-sm btn-icon" onclick="xarajatOchir(${x.id})"><i class="fas fa-trash"></i></button></td>
          </tr>`).join('')}
        </tbody></table></div>` :
      '<div class="empty-state"><i class="fas fa-money-bill"></i><p>Bu davrda xarajat yo\'q</p></div>';
  } catch(e) { toast(e.message,'error'); }
}

function xarajatQosh() {
  const katlar=['Ijara','Maosh','Kommunal','Yuk tashish','Ta\'mirlash','Boshqa'];
  modalOch('Yangi xarajat', `
    <form onsubmit="xarajatSaqlash(event)">
      <div class="form-group"><label>Nomi *</label>
        <input type="text" name="nomi" required placeholder="Masalan: Oylik ijara"></div>
      <div class="form-row">
        <div class="form-group"><label>Summa *</label>
          <input type="number" name="summa" min="1" required placeholder="0"></div>
        <div class="form-group"><label>Kategoriya</label>
          <select name="kategoriya" class="filter-select" style="width:100%">
            <option value="">— Tanlang —</option>
            ${katlar.map(k=>`<option>${k}</option>`).join('')}
          </select></div>
      </div>
      <div class="form-group"><label>Izoh</label>
        <input type="text" name="izoh" placeholder="Ixtiyoriy"></div>
      <div class="modal-footer" style="padding:0;margin-top:10px">
        <button type="button" class="btn btn-secondary" onclick="modalYop()">Bekor</button>
        <button type="submit" class="btn btn-danger"><i class="fas fa-save"></i> Saqlash</button>
      </div>
    </form>`);
}

async function xarajatSaqlash(e) {
  e.preventDefault();
  const f=e.target;
  try {
    await apiPost('/xarajatlar',{nomi:f.nomi.value,summa:parseFloat(f.summa.value),kategoriya:f.kategoriya.value,izoh:f.izoh.value,foydalanuvchi_id:joriyFoydalanuvchi.id});
    toast('Xarajat qo\'shildi!'); modalYop(); xarajatlarYukla();
  } catch(e){toast(e.message,'error');}
}
function xarajatOchir(id) {
  tasdiqlash('Bu xarajatni o\'chirasizmi?', async()=>{
    try{await apiDelete('/xarajatlar/'+id);toast('O\'chirildi!');xarajatlarYukla();}
    catch(e){toast(e.message,'error');}
  });
}



// ===== OMBOR: TOP MAHSULOT =====
async function topMahsulotHisoboti() {
  const bugun=bugunSana(), oyBoshi=bugun.slice(0,8)+'01';
  document.getElementById('hisobotKontent').innerHTML = `
    <div class="card">
      <div class="card-header">
        <h3><i class="fas fa-trophy" style="color:#f59e0b"></i> Eng ko'p sotiladigan mahsulotlar</h3>
        <div class="filter-bar">
          <input type="date" id="tmBosh" value="${oyBoshi}" class="search-input" onchange="topMahsulotYukla()">
          <input type="date" id="tmTugash" value="${bugun}" class="search-input" onchange="topMahsulotYukla()">
          <button class="btn btn-success btn-sm" onclick="topMahsulotExcel()"><i class="fas fa-file-excel"></i> Excel</button>
        </div>
      </div>
      <div class="card-body" id="tmKontent"><div style="text-align:center"><i class="fas fa-spinner fa-spin fa-2x"></i></div></div>
    </div>`;
  await topMahsulotYukla();
}

async function topMahsulotYukla() {
  const b=document.getElementById('tmBosh')?.value, t=document.getElementById('tmTugash')?.value;
  try {
    const rows = await apiGet(`/hisobot/ombor/top_mahsulot?boshlanish=${b}&tugash=${t}`);
    window._tmData = rows;
    const div = document.getElementById('tmKontent');
    if (!rows.length) { div.innerHTML='<div class="empty-state"><i class="fas fa-box-open"></i><p>Ma\'lumot yo\'q</p></div>'; return; }
    div.innerHTML = `
      <div class="table-wrapper"><table>
        <thead><tr><th>#</th><th>Mahsulot</th><th>Birlik</th><th>Sotilgan miqdor</th>
          <th>Sotuv soni</th><th>Jami summa</th><th>Qoldiq</th></tr></thead>
        <tbody>${rows.map((r,i)=>`
          <tr>
            <td>${i<3?['🥇','🥈','🥉'][i]:i+1}</td>
            <td><b>${r.nomi}</b></td>
            <td>${r.birlik}</td>
            <td><b>${r.sotilgan_miqdor}</b></td>
            <td>${r.sotuv_soni}</td>
            <td><b style="color:#10b981">${formatSum(r.sotilgan_summa)}</b></td>
            <td style="color:${r.qoldiq<=0?'#ef4444':r.qoldiq<=5?'#f59e0b':'#10b981'}">${r.qoldiq}</td>
          </tr>`).join('')}
        </tbody></table></div>
      <div style="padding:8px;font-size:13px;color:#64748b">
        Jami: <b>${formatSum(rows.reduce((s,r)=>s+r.sotilgan_summa,0))}</b>
      </div>`;
  } catch(e) { toast(e.message,'error'); }
}

function topMahsulotExcel() {
  const rows = window._tmData || [];
  if (!rows.length) { toast('Ma\'lumot yo\'q!','warning'); return; }
  let csv = '\uFEFFTop mahsulotlar\n\n#,Mahsulot,Birlik,Sotilgan miqdor,Sotuv soni,Jami summa,Qoldiq\n';
  rows.forEach((r,i) => { csv += `${i+1},"${r.nomi}",${r.birlik},${r.sotilgan_miqdor},${r.sotuv_soni},${r.sotilgan_summa},${r.qoldiq}\n`; });
  excelYukla(csv, `top_mahsulot.csv`);
}


// ===== OMBOR: KAM QOLGAN =====
async function kamQolganHisoboti() {
  document.getElementById('hisobotKontent').innerHTML = `
    <div class="card">
      <div class="card-header">
        <h3><i class="fas fa-exclamation-triangle" style="color:#ef4444"></i> Kam qolgan mahsulotlar</h3>
        <button class="btn btn-success btn-sm" onclick="kamQolganExcel()"><i class="fas fa-file-excel"></i> Excel</button>
      </div>
      <div class="card-body" id="kamKontent"><div style="text-align:center"><i class="fas fa-spinner fa-spin fa-2x"></i></div></div>
    </div>`;
  try {
    const rows = await apiGet('/hisobot/ombor/kam');
    window._kamData = rows;
    const tugagan = rows.filter(r=>r.holat==='tugagan');
    const kam = rows.filter(r=>r.holat==='kam');
    const div = document.getElementById('kamKontent');
    if (!rows.length) { div.innerHTML='<div class="empty-state"><i class="fas fa-check-circle" style="color:#10b981"></i><p>Hamma mahsulot yetarli ✅</p></div>'; return; }
    div.innerHTML = `
      <div class="stats-grid" style="margin-bottom:16px">
        <div class="stat-card"><div class="stat-icon red"><i class="fas fa-times-circle"></i></div>
          <div class="stat-info"><h3 style="color:#ef4444">${tugagan.length}</h3><p>Tugagan</p></div></div>
        <div class="stat-card"><div class="stat-icon orange"><i class="fas fa-exclamation-triangle"></i></div>
          <div class="stat-info"><h3 style="color:#f59e0b">${kam.length}</h3><p>Kam qolgan</p></div></div>
      </div>
      <div class="table-wrapper"><table>
        <thead><tr><th>#</th><th>Mahsulot</th><th>Kategoriya</th><th>Mavjud</th>
          <th>Minimal</th><th>Sotish narxi</th><th>Holat</th></tr></thead>
        <tbody>${rows.map((r,i)=>`
          <tr style="background:${r.holat==='tugagan'?'#fff1f2':'#fffbeb'}">
            <td>${i+1}</td>
            <td><b>${r.nomi}</b></td>
            <td>${r.kategoriya_nomi||'-'}</td>
            <td><b style="color:${r.miqdor<=0?'#ef4444':'#f59e0b'}">${r.miqdor} ${r.birlik}</b></td>
            <td>${r.min_miqdor} ${r.birlik}</td>
            <td>${formatSum(r.sotish_narxi)}</td>
            <td>${r.holat==='tugagan'
              ?'<span class="badge badge-danger">❌ Tugagan</span>'
              :'<span class="badge badge-warning">⚠ Kam</span>'}</td>
          </tr>`).join('')}
        </tbody></table></div>`;
  } catch(e) { toast(e.message,'error'); }
}

function kamQolganExcel() {
  const rows = window._kamData || [];
  if (!rows.length) { toast('Ma\'lumot yo\'q!','warning'); return; }
  let csv = '\uFEFFKam qolgan mahsulotlar\n\n#,Mahsulot,Kategoriya,Birlik,Mavjud,Minimal,Sotish narxi,Holat\n';
  rows.forEach((r,i) => { csv += `${i+1},"${r.nomi}","${r.kategoriya_nomi||'-'}",${r.birlik},${r.miqdor},${r.min_miqdor},${r.sotish_narxi},${r.holat}\n`; });
  excelYukla(csv, `kam_qolgan.csv`);
}


// ===== OMBOR: KIRIM TARIXI =====
async function kirimTarixiHisoboti() {
  const bugun=bugunSana(), oyBoshi=bugun.slice(0,8)+'01';
  document.getElementById('hisobotKontent').innerHTML = `
    <div class="card">
      <div class="card-header">
        <h3><i class="fas fa-truck" style="color:#2563eb"></i> Kirim tarixi</h3>
        <div class="filter-bar">
          <input type="date" id="ktBosh" value="${oyBoshi}" class="search-input" onchange="kirimTarixiYukla()">
          <input type="date" id="ktTugash" value="${bugun}" class="search-input" onchange="kirimTarixiYukla()">
          <button class="btn btn-success btn-sm" onclick="kirimExcel()"><i class="fas fa-file-excel"></i> Excel</button>
        </div>
      </div>
      <div class="card-body" id="ktKontent"><div style="text-align:center"><i class="fas fa-spinner fa-spin fa-2x"></i></div></div>
    </div>`;
  await kirimTarixiYukla();
}

async function kirimTarixiYukla() {
  const b=document.getElementById('ktBosh')?.value, t=document.getElementById('ktTugash')?.value;
  try {
    const data = await apiGet(`/hisobot/ombor/kirim?boshlanish=${b}&tugash=${t}`);
    window._ktData = data;
    const rows = data.rows || [];
    const div = document.getElementById('ktKontent');
    if (!rows.length) { div.innerHTML='<div class="empty-state"><i class="fas fa-truck"></i><p>Bu davrda kirim yo\'q</p></div>'; return; }
    div.innerHTML = `
      <div style="background:#eff6ff;padding:10px 14px;border-radius:8px;margin-bottom:12px;font-size:14px">
        Jami kirim qiymati: <b>${formatSum(data.jami_qiymat)}</b>
      </div>
      <div class="table-wrapper"><table>
        <thead><tr><th>#</th><th>Mahsulot</th><th>Miqdor</th><th>Kelish narxi</th>
          <th>Qiymat</th><th>Yetkazuvchi</th><th>Sana</th></tr></thead>
        <tbody>${rows.map((r,i)=>`
          <tr>
            <td>${i+1}</td>
            <td><b>${r.nomi}</b></td>
            <td>${r.miqdor} ${r.birlik}</td>
            <td>${formatSum(r.kelish_narxi)}</td>
            <td><b>${formatSum(r.miqdor*(r.kelish_narxi||0))}</b></td>
            <td>${r.yetkazuvchi||'-'}</td>
            <td style="font-size:12px;color:#64748b">${formatSana(r.sana)}</td>
          </tr>`).join('')}
        </tbody></table></div>`;
  } catch(e) { toast(e.message,'error'); }
}

function kirimExcel() {
  const rows = (window._ktData?.rows) || [];
  if (!rows.length) { toast('Ma\'lumot yo\'q!','warning'); return; }
  let csv = '\uFEFFKirim tarixi\n\n#,Mahsulot,Miqdor,Birlik,Kelish narxi,Yetkazuvchi,Sana\n';
  rows.forEach((r,i) => { csv += `${i+1},"${r.nomi}",${r.miqdor},${r.birlik},${r.kelish_narxi},"${r.yetkazuvchi||'-'}","${r.sana}"\n`; });
  excelYukla(csv, `kirim_tarixi.csv`);
}


// ===== OMBOR: TOVAR AYLANMASI =====
async function aylanmaHisoboti() {
  const bugun=bugunSana(), oyBoshi=bugun.slice(0,8)+'01';
  document.getElementById('hisobotKontent').innerHTML = `
    <div class="card">
      <div class="card-header">
        <h3><i class="fas fa-sync-alt" style="color:#8b5cf6"></i> Tovar aylanmasi</h3>
        <div class="filter-bar">
          <input type="date" id="ayBosh" value="${oyBoshi}" class="search-input" onchange="aylanmaYukla()">
          <input type="date" id="ayTugash" value="${bugun}" class="search-input" onchange="aylanmaYukla()">
          <button class="btn btn-success btn-sm" onclick="aylanmaExcel()"><i class="fas fa-file-excel"></i> Excel</button>
        </div>
      </div>
      <div class="card-body" id="ayKontent"><div style="text-align:center"><i class="fas fa-spinner fa-spin fa-2x"></i></div></div>
    </div>`;
  await aylanmaYukla();
}

async function aylanmaYukla() {
  const b=document.getElementById('ayBosh')?.value, t=document.getElementById('ayTugash')?.value;
  try {
    const rows = await apiGet(`/hisobot/ombor/aylanma?boshlanish=${b}&tugash=${t}`);
    window._ayData = rows;
    const div = document.getElementById('ayKontent');
    if (!rows.length) { div.innerHTML='<div class="empty-state"><i class="fas fa-sync"></i><p>Bu davrda harakat yo\'q</p></div>'; return; }
    div.innerHTML = `
      <div class="table-wrapper"><table>
        <thead><tr><th>#</th><th>Mahsulot</th><th>Kirim miqdori</th><th>Chiqim miqdori</th>
          <th>Kirim qiymati</th><th>Chiqim qiymati</th><th>Hozir qoldiq</th></tr></thead>
        <tbody>${rows.map((r,i)=>`
          <tr>
            <td>${i+1}</td><td><b>${r.nomi}</b></td>
            <td style="color:#2563eb">${r.kirim_miqdor} ${r.birlik}</td>
            <td style="color:#ef4444">${r.chiqim_miqdor} ${r.birlik}</td>
            <td style="color:#2563eb">${formatSum(r.jami_kirim)}</td>
            <td style="color:#ef4444">${formatSum(r.jami_chiqim)}</td>
            <td><b style="color:${r.hozir_qoldiq<=0?'#ef4444':'#10b981'}">${r.hozir_qoldiq} ${r.birlik}</b></td>
          </tr>`).join('')}
        </tbody></table></div>`;
  } catch(e) { toast(e.message,'error'); }
}

function aylanmaExcel() {
  const rows = window._ayData || [];
  if (!rows.length) { toast('Ma\'lumot yo\'q!','warning'); return; }
  let csv = '\uFEFFTovar aylanmasi\n\n#,Mahsulot,Birlik,Kirim miqdori,Chiqim miqdori,Kirim qiymati,Chiqim qiymati,Qoldiq\n';
  rows.forEach((r,i) => { csv += `${i+1},"${r.nomi}",${r.birlik},${r.kirim_miqdor},${r.chiqim_miqdor},${r.jami_kirim},${r.jami_chiqim},${r.hozir_qoldiq}\n`; });
  excelYukla(csv, `aylanma.csv`);
}


// ===== MIJOZLAR: TOP XARIDORLAR =====
async function topXaridorlarHisoboti() {
  const bugun=bugunSana(), oyBoshi=bugun.slice(0,8)+'01';
  document.getElementById('hisobotKontent').innerHTML = `
    <div class="card">
      <div class="card-header">
        <h3><i class="fas fa-crown" style="color:#f59e0b"></i> Top xaridorlar</h3>
        <div class="filter-bar">
          <input type="date" id="txBosh" value="${oyBoshi}" class="search-input" onchange="topXaridorlarYukla()">
          <input type="date" id="txTugash" value="${bugun}" class="search-input" onchange="topXaridorlarYukla()">
          <button class="btn btn-success btn-sm" onclick="topXaridorExcel()"><i class="fas fa-file-excel"></i> Excel</button>
        </div>
      </div>
      <div class="card-body" id="txKontent"><div style="text-align:center"><i class="fas fa-spinner fa-spin fa-2x"></i></div></div>
    </div>`;
  await topXaridorlarYukla();
}

async function topXaridorlarYukla() {
  const b=document.getElementById('txBosh')?.value, t=document.getElementById('txTugash')?.value;
  try {
    const rows = await apiGet(`/hisobot/mijozlar/top?boshlanish=${b}&tugash=${t}`);
    window._txData = rows;
    const div = document.getElementById('txKontent');
    if (!rows.length) { div.innerHTML='<div class="empty-state"><i class="fas fa-users"></i><p>Bu davrda xarid yo\'q</p></div>'; return; }
    div.innerHTML = `
      <div class="table-wrapper"><table>
        <thead><tr><th>#</th><th>Mijoz</th><th>Telefon</th><th>Xarid soni</th>
          <th>Jami xarid</th><th>Qarz</th><th>Oxirgi sotuv</th></tr></thead>
        <tbody>${rows.map((r,i)=>`
          <tr>
            <td>${i<3?['🥇','🥈','🥉'][i]:i+1}</td>
            <td><b>${r.ismi}</b></td>
            <td>${r.telefon||'-'}</td>
            <td><b>${r.sotuv_soni}</b></td>
            <td><b style="color:#10b981">${formatSum(r.jami_xarid)}</b></td>
            <td style="color:${r.qarz>0?'#ef4444':'#10b981'}">${r.qarz>0?formatSum(r.qarz):'0'}</td>
            <td style="font-size:12px;color:#64748b">${formatSana(r.oxirgi_sotuv)}</td>
          </tr>`).join('')}
        </tbody></table></div>
      <div style="padding:8px;font-size:13px;color:#64748b">
        Jami: <b>${formatSum(rows.reduce((s,r)=>s+r.jami_xarid,0))}</b>
      </div>`;
  } catch(e) { toast(e.message,'error'); }
}

function topXaridorExcel() {
  const rows = window._txData || [];
  if (!rows.length) { toast('Ma\'lumot yo\'q!','warning'); return; }
  let csv = '\uFEFFTop xaridorlar\n\n#,Mijoz,Telefon,Xarid soni,Jami xarid,Qarz\n';
  rows.forEach((r,i) => { csv += `${i+1},"${r.ismi}","${r.telefon||'-'}",${r.sotuv_soni},${r.jami_xarid},${r.qarz||0}\n`; });
  excelYukla(csv, `top_xaridorlar.csv`);
}


// ===== MIJOZLAR: AKTIV MIJOZLAR =====
async function aktivMijozlarHisoboti() {
  document.getElementById('hisobotKontent').innerHTML = `
    <div class="card">
      <div class="card-header">
        <h3><i class="fas fa-user-check" style="color:#10b981"></i> Aktiv mijozlar (2+ marta xarid)</h3>
        <button class="btn btn-success btn-sm" onclick="aktivMijozExcel()"><i class="fas fa-file-excel"></i> Excel</button>
      </div>
      <div class="card-body" id="amKontent"><div style="text-align:center"><i class="fas fa-spinner fa-spin fa-2x"></i></div></div>
    </div>`;
  try {
    const rows = await apiGet('/hisobot/mijozlar/aktiv');
    window._amData = rows;
    const div = document.getElementById('amKontent');
    if (!rows.length) { div.innerHTML='<div class="empty-state"><i class="fas fa-users"></i><p>Aktiv mijoz yo\'q</p></div>'; return; }
    div.innerHTML = `
      <div style="background:#f0fdf4;padding:10px 14px;border-radius:8px;margin-bottom:12px">
        Jami aktiv mijozlar: <b>${rows.length}</b> ta |
        Jami xarid: <b>${formatSum(rows.reduce((s,r)=>s+r.jami_xarid,0))}</b>
      </div>
      <div class="table-wrapper"><table>
        <thead><tr><th>#</th><th>Mijoz</th><th>Telefon</th><th>Jami xarid soni</th>
          <th>Jami summa</th><th>Birinchi xarid</th><th>Oxirgi xarid</th></tr></thead>
        <tbody>${rows.map((r,i)=>`
          <tr>
            <td>${i+1}</td>
            <td><b>${r.ismi}</b></td>
            <td>${r.telefon||'-'}</td>
            <td><span style="background:#dbeafe;color:#1d4ed8;padding:2px 8px;border-radius:10px;font-weight:700">${r.sotuv_soni}</span></td>
            <td><b style="color:#10b981">${formatSum(r.jami_xarid)}</b></td>
            <td style="font-size:12px;color:#64748b">${formatSana(r.birinchi_sotuv)}</td>
            <td style="font-size:12px;color:#64748b">${formatSana(r.oxirgi_sotuv)}</td>
          </tr>`).join('')}
        </tbody></table></div>`;
  } catch(e) { toast(e.message,'error'); }
}

function aktivMijozExcel() {
  const rows = window._amData || [];
  if (!rows.length) { toast('Ma\'lumot yo\'q!','warning'); return; }
  let csv = '\uFEFFAktiv mijozlar\n\n#,Mijoz,Telefon,Xarid soni,Jami summa\n';
  rows.forEach((r,i) => { csv += `${i+1},"${r.ismi}","${r.telefon||'-'}",${r.sotuv_soni},${r.jami_xarid}\n`; });
  excelYukla(csv, `aktiv_mijozlar.csv`);
}

// ===== MIJOZLAR: YANGI MIJOZLAR =====
async function yangiMijozlarHisoboti() {
  const bugun=bugunSana(), oyBoshi=bugun.slice(0,8)+'01';
  document.getElementById('hisobotKontent').innerHTML = `
    <div class="card">
      <div class="card-header">
        <h3><i class="fas fa-user-plus" style="color:#2563eb"></i> Yangi mijozlar</h3>
        <div class="filter-bar">
          <input type="date" id="ymBosh" value="${oyBoshi}" class="search-input" onchange="yangiMijozYukla()">
          <input type="date" id="ymTugash" value="${bugun}" class="search-input" onchange="yangiMijozYukla()">
          <button class="btn btn-success btn-sm" onclick="yangiMijozExcel()"><i class="fas fa-file-excel"></i> Excel</button>
        </div>
      </div>
      <div class="card-body" id="ymKontent"><div style="text-align:center"><i class="fas fa-spinner fa-spin fa-2x"></i></div></div>
    </div>`;
  await yangiMijozYukla();
}

async function yangiMijozYukla() {
  const b=document.getElementById('ymBosh')?.value, t=document.getElementById('ymTugash')?.value;
  try {
    const rows = await apiGet(`/hisobot/mijozlar/yangi?boshlanish=${b}&tugash=${t}`);
    window._ymData = rows;
    const div = document.getElementById('ymKontent');
    if (!rows.length) { div.innerHTML='<div class="empty-state"><i class="fas fa-user-plus"></i><p>Bu davrda yangi mijoz yo\'q</p></div>'; return; }
    div.innerHTML = `
      <div style="background:#eff6ff;padding:10px 14px;border-radius:8px;margin-bottom:12px">
        ${b} — ${t} davrida <b>${rows.length}</b> ta yangi mijoz
      </div>
      <div class="table-wrapper"><table>
        <thead><tr><th>#</th><th>Ismi</th><th>Telefon</th><th>Manzil</th>
          <th>Xarid soni</th><th>Jami xarid</th><th>Qo'shilgan</th></tr></thead>
        <tbody>${rows.map((r,i)=>`
          <tr>
            <td>${i+1}</td>
            <td><b>${r.ism} ${r.familiya||''}</b></td>
            <td>${r.telefon||'-'}</td>
            <td style="font-size:12px">${r.manzil||'-'}</td>
            <td>${r.sotuv_soni||0}</td>
            <td>${formatSum(r.jami_xarid||0)}</td>
            <td style="font-size:12px;color:#64748b">${formatSana(r.yaratilgan)}</td>
          </tr>`).join('')}
        </tbody></table></div>`;
  } catch(e) { toast(e.message,'error'); }
}

function yangiMijozExcel() {
  const rows = window._ymData || [];
  if (!rows.length) { toast('Ma\'lumot yo\'q!','warning'); return; }
  let csv = '\uFEFFYangi mijozlar\n\n#,Ismi,Telefon,Manzil,Xarid soni,Jami xarid\n';
  rows.forEach((r,i) => { csv += `${i+1},"${r.ism} ${r.familiya||''}","${r.telefon||'-'}","${r.manzil||'-'}",${r.sotuv_soni||0},${r.jami_xarid||0}\n`; });
  excelYukla(csv, `yangi_mijozlar.csv`);
}


// ===== XODIMLAR: KASSIR SOTUV HISOBOTI =====
async function kassirSotuvHisoboti() {
  const bugun=bugunSana(), oyBoshi=bugun.slice(0,8)+'01';
  document.getElementById('hisobotKontent').innerHTML = `
    <div class="card">
      <div class="card-header">
        <h3><i class="fas fa-cash-register" style="color:#f59e0b"></i> Kassir sotuv hisoboti</h3>
        <div class="filter-bar">
          <input type="date" id="ksBosh" value="${oyBoshi}" class="search-input" onchange="kassirSotuvYukla()">
          <input type="date" id="ksTugash" value="${bugun}" class="search-input" onchange="kassirSotuvYukla()">
          <button class="btn btn-success btn-sm" onclick="kassirExcel()"><i class="fas fa-file-excel"></i> Excel</button>
        </div>
      </div>
      <div class="card-body" id="ksKontent"><div style="text-align:center"><i class="fas fa-spinner fa-spin fa-2x"></i></div></div>
    </div>`;
  await kassirSotuvYukla();
}

async function kassirSotuvYukla() {
  const b=document.getElementById('ksBosh')?.value, t=document.getElementById('ksTugash')?.value;
  try {
    const rows = await apiGet(`/hisobot/xodimlar/sotuv?boshlanish=${b}&tugash=${t}`);
    window._ksData = rows;
    const div = document.getElementById('ksKontent');
    if (!rows.length) { div.innerHTML='<div class="empty-state"><i class="fas fa-id-badge"></i><p>Ma\'lumot yo\'q</p></div>'; return; }
    const jamiSotuvlar = rows.reduce((s,r)=>s+r.sotuv_soni,0);
    const jamiSumma = rows.reduce((s,r)=>s+r.jami_summa,0);
    div.innerHTML = `
      <div class="stats-grid" style="margin-bottom:16px">
        <div class="stat-card"><div class="stat-icon blue"><i class="fas fa-users"></i></div>
          <div class="stat-info"><h3>${rows.length}</h3><p>Xodimlar</p></div></div>
        <div class="stat-card"><div class="stat-icon green"><i class="fas fa-shopping-cart"></i></div>
          <div class="stat-info"><h3>${jamiSotuvlar}</h3><p>Jami sotuvlar</p></div></div>
        <div class="stat-card"><div class="stat-icon orange"><i class="fas fa-coins"></i></div>
          <div class="stat-info"><h3>${formatSum(jamiSumma)}</h3><p>Jami summa</p></div></div>
      </div>
      <div class="table-wrapper"><table>
        <thead><tr>
          <th>#</th><th>Xodim</th><th>Rol</th><th>Sotuvlar soni</th>
          <th>Jami summa</th><th>O'rtacha sotuv</th><th>Ish kunlari</th><th>Oxirgi sotuv</th>
        </tr></thead>
        <tbody>${rows.map((r,i)=>`
          <tr>
            <td>${i<3&&r.sotuv_soni>0?['🥇','🥈','🥉'][i]:i+1}</td>
            <td>
              <div style="display:flex;align-items:center;gap:8px">
                <div style="width:30px;height:30px;border-radius:50%;
                  background:${r.rol==='admin'?'#fef3c7':'#dbeafe'};
                  display:flex;align-items:center;justify-content:center;
                  color:${r.rol==='admin'?'#d97706':'#2563eb'};font-weight:700;font-size:12px">
                  ${r.ismi[0].toUpperCase()}
                </div>
                <b>${r.ismi}</b>
              </div>
            </td>
            <td><span class="badge ${r.rol==='admin'?'badge-warning':'badge-info'}">${r.rol==='admin'?'👑 Admin':'💼 Kassir'}</span></td>
            <td><b style="color:${r.sotuv_soni>0?'#2563eb':'#94a3b8'}">${r.sotuv_soni}</b></td>
            <td><b style="color:#10b981">${formatSum(r.jami_summa)}</b></td>
            <td>${formatSum(Math.round(r.ort_sotuv||0))}</td>
            <td>${r.ish_kunlari||0} kun</td>
            <td style="font-size:12px;color:#64748b">${r.oxirgi_sotuv?formatSana(r.oxirgi_sotuv):'-'}</td>
          </tr>`).join('')}
        </tbody></table></div>`;
  } catch(e) { toast(e.message,'error'); }
}

function kassirExcel() {
  const rows = window._ksData || [];
  if (!rows.length) { toast('Ma\'lumot yo\'q!','warning'); return; }
  let csv = '\uFEFFKassir sotuv hisoboti\n\n#,Xodim,Rol,Sotuvlar soni,Jami summa,Ort summa,Ish kunlari\n';
  rows.forEach((r,i) => { csv += `${i+1},"${r.ismi}",${r.rol},${r.sotuv_soni},${r.jami_summa},${Math.round(r.ort_sotuv||0)},${r.ish_kunlari||0}\n`; });
  excelYukla(csv, `kassir_sotuv.csv`);
}
