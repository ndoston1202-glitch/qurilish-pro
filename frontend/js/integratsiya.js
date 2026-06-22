// ===== INTEGRATSIYA ASOSIY SAHIFASI =====

let intTabJoriy = 'telegram';

async function integratsiyaYukla() {
  const kontent = document.getElementById('asosiyKontent');
  kontent.innerHTML = `
    <div style="max-width:900px">
      <!-- SARLAVHA -->
      <div style="margin-bottom:20px">
        <h2 style="font-size:18px;font-weight:700;color:#1e293b;margin-bottom:4px">
          <i class="fas fa-plug" style="color:#22d3ee"></i> Integratsiyalar
        </h2>
        <p style="font-size:13px;color:#64748b">
          Tashqi xizmatlar va dasturlar bilan ulash
        </p>
      </div>

      <!-- INTEGRATSIYA KARTALAR -->
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:14px;margin-bottom:24px">

        <!-- TELEGRAM -->
        <div onclick="intTabOch('telegram')"
          style="border:2px solid ${intTabJoriy==='telegram'?'#229ed9':'#e2e8f0'};
          border-radius:12px;padding:16px;cursor:pointer;background:white;
          transition:all 0.2s;position:relative"
          onmouseover="this.style.borderColor='#229ed9';this.style.boxShadow='0 4px 12px rgba(34,158,217,0.15)'"
          onmouseout="this.style.borderColor='${intTabJoriy==='telegram'?'#229ed9':'#e2e8f0'}';this.style.boxShadow=''">
          <div style="display:flex;align-items:center;gap:12px;margin-bottom:10px">
            <div style="width:44px;height:44px;border-radius:10px;background:#229ed9;
              display:flex;align-items:center;justify-content:center">
              <i class="fab fa-telegram" style="color:white;font-size:22px"></i>
            </div>
            <div>
              <div style="font-weight:700;font-size:15px">Telegram Bot</div>
              <div style="font-size:11px;color:#64748b">Bildirishnomalar va hisobotlar</div>
            </div>
          </div>
          <div id="tgKartaHolat" style="font-size:12px;color:#94a3b8">
            <i class="fas fa-circle" style="font-size:8px"></i> Tekshirilmoqda...
          </div>
        </div>

        <!-- SMS -->
        <div onclick="intTabOch('sms')"
          style="border:2px solid ${intTabJoriy==='sms'?'#10b981':'#e2e8f0'};
          border-radius:12px;padding:16px;cursor:pointer;background:white;
          transition:all 0.2s"
          onmouseover="this.style.borderColor='#10b981';this.style.boxShadow='0 4px 12px rgba(16,185,129,0.15)'"
          onmouseout="this.style.borderColor='${intTabJoriy==='sms'?'#10b981':'#e2e8f0'}';this.style.boxShadow=''">
          <div style="display:flex;align-items:center;gap:12px;margin-bottom:10px">
            <div style="width:44px;height:44px;border-radius:10px;background:#10b981;
              display:flex;align-items:center;justify-content:center">
              <i class="fas fa-sms" style="color:white;font-size:20px"></i>
            </div>
            <div>
              <div style="font-weight:700;font-size:15px">SMS Xabar</div>
              <div style="font-size:11px;color:#64748b">Eskiz, PlayMobile, Infobip</div>
            </div>
          </div>
          <div id="smsKartaHolat" style="font-size:12px;color:#94a3b8">
            <i class="fas fa-circle" style="font-size:8px"></i> Sozlanmagan
          </div>
        </div>

        <!-- KELAJAKDA -->
        <div style="border:2px dashed #e2e8f0;border-radius:12px;padding:16px;
          background:#fafafa;display:flex;align-items:center;justify-content:center;
          flex-direction:column;gap:8px;min-height:100px;opacity:0.6">
          <i class="fas fa-plus-circle" style="font-size:28px;color:#cbd5e1"></i>
          <div style="font-size:13px;color:#94a3b8;text-align:center">
            Kelajakda<br>
            <span style="font-size:11px">1C, Excel, API...</span>
          </div>
        </div>

      </div>

      <!-- TANLANGAN INTEGRATSIYA SOZLAMALARI -->
      <div id="intSozDiv"></div>
    </div>`;

  // Telegram holatini tekshirish
  intTelegramHolatYukla();
  intSmsHolatYukla();

  // Joriy tabni ochish
  intTabOch(intTabJoriy);
}

function intTabOch(tab) {
  intTabJoriy = tab;
  // Kartalarni qayta render qilmasdan faqat sozlamalar div ni yangilash
  if (tab === 'telegram') intTelegramSozKorsatish();
  else if (tab === 'sms') intSmsSozKorsatish();
}

// ===== TELEGRAM HOLAT TEKSHIRISH =====
async function intTelegramHolatYukla() {
  try {
    const data = await apiGet('/integratsiya/telegram');
    const el = document.getElementById('tgKartaHolat');
    if (!el) return;
    if (data && data.token && data.faol) {
      el.innerHTML = '<i class="fas fa-circle" style="font-size:8px;color:#10b981"></i> <span style="color:#10b981;font-weight:600">Ulangan</span>';
    } else if (data && data.token) {
      el.innerHTML = '<i class="fas fa-circle" style="font-size:8px;color:#f59e0b"></i> <span style="color:#f59e0b">Sozlangan, faol emas</span>';
    } else {
      el.innerHTML = '<i class="fas fa-circle" style="font-size:8px;color:#94a3b8"></i> <span style="color:#94a3b8">Sozlanmagan</span>';
    }
  } catch {}
}

async function intSmsHolatYukla() {
  try {
    const data = await apiGet('/integratsiya/sms');
    const el = document.getElementById('smsKartaHolat');
    if (!el) return;
    if (data && data.token && data.faol) {
      el.innerHTML = '<i class="fas fa-circle" style="font-size:8px;color:#10b981"></i> <span style="color:#10b981;font-weight:600">Ulangan</span>';
    } else {
      el.innerHTML = '<i class="fas fa-circle" style="font-size:8px;color:#94a3b8"></i> <span style="color:#94a3b8">Sozlanmagan</span>';
    }
  } catch {}
}


// ===== TELEGRAM SOZLAMALAR =====
async function intTelegramSozKorsatish() {
  const div = document.getElementById('intSozDiv');
  if (!div) return;
  div.innerHTML = `
    <div class="card">
      <div class="card-header">
        <div style="display:flex;align-items:center;gap:10px">
          <div style="width:36px;height:36px;border-radius:8px;background:#229ed9;
            display:flex;align-items:center;justify-content:center">
            <i class="fab fa-telegram" style="color:white;font-size:18px"></i>
          </div>
          <div>
            <div style="font-weight:700;font-size:15px">Telegram Bot sozlamalari</div>
            <div style="font-size:12px;color:#64748b">Bot token va bildirishnomalarni sozlang</div>
          </div>
        </div>
        <div id="telegramHolat" style="font-size:12px;color:#94a3b8">Yuklanmoqda...</div>
      </div>
      <div class="card-body">

        <!-- QANDAY ULASH -->
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

        <div class="form-row">
          <div class="form-group">
            <label style="font-weight:600;font-size:14px">
              <i class="fab fa-telegram" style="color:#229ed9"></i> Bot Token *
            </label>
            <div style="display:flex;gap:8px">
              <input type="password" id="tgToken"
                style="flex:1;padding:10px 14px;border:2px solid #e2e8f0;border-radius:8px;font-size:14px"
                placeholder="1234567890:AAEhBOweik6ad3gM5Zn_example">
              <button class="btn btn-secondary btn-sm" onclick="tokenKorsatYashir()" id="tokenKozBtn">
                <i class="fas fa-eye"></i>
              </button>
            </div>
          </div>
          <div class="form-group">
            <label style="font-weight:600;font-size:14px">Chat ID
              <span style="font-size:11px;font-weight:400;color:#94a3b8">(avtomatik topiladi)</span>
            </label>
            <div style="display:flex;gap:8px">
              <input type="text" id="tgChatId" readonly
                style="flex:1;padding:10px 14px;border:2px solid #e2e8f0;border-radius:8px;
                font-size:14px;background:#f8fafc"
                placeholder="Ulash tugmasini bosing">
              <button class="btn btn-primary btn-sm" onclick="chatIdTopish()">
                <i class="fas fa-search"></i> Topish
              </button>
            </div>
          </div>
        </div>

        <!-- BILDIRISHNOMALAR -->
        <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;
          padding:14px;margin-bottom:16px">
          <div style="font-weight:700;font-size:13px;margin-bottom:10px">
            <i class="fas fa-bell"></i> Qanday xabarlar kesin?
          </div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
            ${[
              {id:'har_sotuv',     n:'Har sotuv bo\'lganda',          e:'🛒'},
              {id:'kunlik_avtom',  n:'Kunlik hisobot (avtomatik)',     e:'📊'},
              {id:'kam_mahsulot',  n:'Mahsulot kam qolganda',         e:'⚠️'},
              {id:'kechikkan_qarz',n:'Kechikkan qarzlar',             e:'⏰'},
            ].map(b=>`
              <label style="display:flex;align-items:center;gap:8px;cursor:pointer;
                padding:8px 12px;border:1px solid #e2e8f0;border-radius:8px;background:white">
                <input type="checkbox" id="tg_${b.id}" style="width:15px;height:15px;cursor:pointer">
                <span style="font-size:13px">${b.e} ${b.n}</span>
              </label>`).join('')}
          </div>
          <!-- Hisobot vaqti -->
          <div style="display:flex;align-items:center;gap:10px;padding:10px 12px;
            border:1px solid #e2e8f0;border-radius:8px;background:white;margin-top:8px">
            <span style="font-size:13px;color:#64748b;flex:1">🕙 Kunlik hisobot vaqti:</span>
            <select id="tg_hisobot_soat" style="border:1px solid #e2e8f0;border-radius:6px;
              padding:5px 10px;font-size:13px;background:white">
              ${Array.from({length:24},(_,i)=>`
                <option value="${i}" ${i===8?'selected':''}>${String(i).padStart(2,'0')}:00</option>
              `).join('')}
            </select>
            <span style="font-size:11px;color:#94a3b8">Ertasi kuni shu vaqtda kechagi hisobot</span>
          </div>
        </div>

        <!-- TUGMALAR -->
        <div style="display:flex;gap:8px;flex-wrap:wrap">
          <button class="btn btn-primary" onclick="telegramUlash()" style="flex:1;min-width:140px">
            <i class="fab fa-telegram"></i> Ulash va saqlash
          </button>
          <button class="btn btn-secondary" onclick="telegramTest()">
            <i class="fas fa-paper-plane"></i> Test
          </button>
          <button class="btn btn-success" onclick="telegramKunlikYuborish()">
            <i class="fas fa-chart-bar"></i> Hisobot yuborish
          </button>
        </div>
        <div id="tgStatus" style="display:none;margin-top:12px;padding:10px 14px;
          border-radius:8px;font-size:13px"></div>
      </div>
    </div>`;

  // Mavjud sozlamalarni yuklash
  try {
    const data = await apiGet('/integratsiya/telegram');
    if (data && data.token) {
      document.getElementById('tgToken').value = data.token;
      const chatEl = document.getElementById('tgChatId');
      if (chatEl) { chatEl.value = data.chat_id || ''; chatEl.removeAttribute('readonly'); }
      const soz = JSON.parse(data.sozlamalar || '{}');
      ['har_sotuv','kunlik_avtom','kam_mahsulot','kechikkan_qarz'].forEach(k => {
        const el = document.getElementById('tg_' + k);
        if (el) el.checked = soz[k] || false;
      });
      const soatEl = document.getElementById('tg_hisobot_soat');
      if (soatEl) soatEl.value = soz.hisobot_soat ?? 8;
      const h = document.getElementById('telegramHolat');
      if (h) h.innerHTML = data.faol
        ? '<span style="color:#10b981;font-weight:600">● Ulangan</span>'
        : '<span style="color:#94a3b8">● Ulanmagan</span>';
    } else {
      const h = document.getElementById('telegramHolat');
      if (h) h.innerHTML = '<span style="color:#94a3b8">● Sozlanmagan</span>';
    }
  } catch {}
}


// ===== SMS SOZLAMALAR =====
async function intSmsSozKorsatish() {
  const div = document.getElementById('intSozDiv');
  if (!div) return;
  div.innerHTML = `
    <div class="card">
      <div class="card-header">
        <div style="display:flex;align-items:center;gap:10px">
          <div style="width:36px;height:36px;border-radius:8px;background:#10b981;
            display:flex;align-items:center;justify-content:center">
            <i class="fas fa-sms" style="color:white;font-size:18px"></i>
          </div>
          <div>
            <div style="font-weight:700;font-size:15px">SMS Integratsiya</div>
            <div style="font-size:12px;color:#64748b">Mijozlarga avtomatik SMS yuborish</div>
          </div>
        </div>
        <div id="smsHolat" style="font-size:12px;color:#94a3b8">Yuklanmoqda...</div>
      </div>
      <div class="card-body">

        <!-- SMS PROVAYDER TANLASH -->
        <div class="form-group">
          <label style="font-weight:600">SMS Provayder</label>
          <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-top:6px">
            ${[
              {id:'eskiz',    n:'Eskiz.uz',    rang:'#2563eb', img:'E'},
              {id:'playmobile', n:'PlayMobile', rang:'#7c3aed', img:'P'},
              {id:'infobip',  n:'Infobip',     rang:'#059669', img:'I'},
            ].map(p=>`
              <label style="display:flex;flex-direction:column;align-items:center;gap:6px;
                padding:12px;border:2px solid #e2e8f0;border-radius:10px;cursor:pointer;
                transition:all 0.15s"
                onmouseover="this.style.borderColor='${p.rang}'"
                onmouseout="if(!document.getElementById('sms_pvd_${p.id}').checked)this.style.borderColor='#e2e8f0'">
                <input type="radio" name="sms_provayder" id="sms_pvd_${p.id}" value="${p.id}"
                  style="display:none" onchange="smsPvdOzgartir('${p.rang}',this)">
                <div style="width:36px;height:36px;border-radius:8px;background:${p.rang};
                  display:flex;align-items:center;justify-content:center;
                  color:white;font-weight:700;font-size:16px">${p.img}</div>
                <span style="font-size:13px;font-weight:600">${p.n}</span>
              </label>`).join('')}
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label style="font-weight:600">Login / API Key *</label>
            <input type="text" id="smsLogin"
              style="width:100%;padding:10px;border:2px solid #e2e8f0;border-radius:8px;font-size:14px"
              placeholder="login yoki api_key">
          </div>
          <div class="form-group">
            <label style="font-weight:600">Parol / Token *</label>
            <input type="password" id="smsParol"
              style="width:100%;padding:10px;border:2px solid #e2e8f0;border-radius:8px;font-size:14px"
              placeholder="parol yoki token">
          </div>
        </div>

        <div class="form-group">
          <label style="font-weight:600">Sender nomi (From)</label>
          <input type="text" id="smsSender" maxlength="11"
            style="width:100%;padding:10px;border:2px solid #e2e8f0;border-radius:8px;font-size:14px"
            placeholder="Do'koningiz nomi (max 11 harf)">
          <div style="font-size:11px;color:#94a3b8;margin-top:4px">
            Mijoz telefonida ko'rinadigan ism (masalan: DOKONIM)
          </div>
        </div>

        <!-- SMS BILDIRISHNOMALAR -->
        <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;
          padding:14px;margin-bottom:16px">
          <div style="font-weight:700;font-size:13px;margin-bottom:10px">
            <i class="fas fa-bell"></i> Qaysi hollarda SMS yuborilsin?
          </div>
          <div style="display:flex;flex-direction:column;gap:8px">
            ${[
              {id:'sms_sotuv',    n:'Sotuv qilinganda chek SMS',     e:'🛒',
               shablon:'Xarid uchun rahmat! Chek: {chek}, Summa: {summa} som. {dokon}'},
              {id:'sms_qarz',     n:'Qarz olganda eslatma',          e:'📋',
               shablon:'Hurmatli {mijoz}, {summa} somlik qarzingiz mavjud. Muddat: {muddat}. {dokon}'},
              {id:'sms_tug',      n:'Qarz to\'lash muddati yaqinlashganda', e:'⏰',
               shablon:'Hurmatli {mijoz}, qarz to\'lov muddati: {muddat}. Qoldi: {summa} som. {dokon}'},
            ].map(b=>`
              <div style="border:1px solid #e2e8f0;border-radius:8px;background:white">
                <label style="display:flex;align-items:center;gap:8px;cursor:pointer;padding:10px 12px">
                  <input type="checkbox" id="${b.id}" style="width:15px;height:15px;cursor:pointer"
                    onchange="smsShablon('${b.id}_matn', this.checked)">
                  <span style="font-size:13px;font-weight:600">${b.e} ${b.n}</span>
                </label>
                <div id="${b.id}_matn" style="padding:0 12px 10px;display:none">
                  <textarea id="${b.id}_shablon" rows="2"
                    style="width:100%;padding:8px;border:1px solid #e2e8f0;border-radius:6px;
                    font-size:12px;font-family:monospace;resize:vertical"
                    placeholder="SMS matni...">${b.shablon}</textarea>
                  <div style="font-size:10px;color:#94a3b8;margin-top:3px">
                    {mijoz} {chek} {summa} {muddat} {dokon} — o'zgaruvchilar
                  </div>
                </div>
              </div>`).join('')}
          </div>
        </div>

        <!-- TUGMALAR -->
        <div style="display:flex;gap:8px;flex-wrap:wrap">
          <button class="btn btn-primary" onclick="smsSaqla()" style="flex:1;min-width:140px">
            <i class="fas fa-save"></i> Saqlash
          </button>
          <button class="btn btn-secondary" onclick="smsTest()">
            <i class="fas fa-vial"></i> Test SMS
          </button>
        </div>
        <div id="smsStatus" style="display:none;margin-top:12px;padding:10px 14px;
          border-radius:8px;font-size:13px"></div>
      </div>
    </div>`;

  // Mavjud sozlamalarni yuklash
  try {
    const data = await apiGet('/integratsiya/sms');
    if (data && data.token) {
      document.getElementById('smsLogin').value  = data.login || '';
      document.getElementById('smsParol').value  = data.token || '';
      document.getElementById('smsSender').value = data.sender || '';
      const soz = JSON.parse(data.sozlamalar || '{}');
      ['sms_sotuv','sms_qarz','sms_tug'].forEach(k => {
        const el = document.getElementById(k);
        if (el) { el.checked = soz[k] || false; smsShablon(k+'_matn', el.checked); }
        const sh = document.getElementById(k+'_shablon');
        if (sh && soz[k+'_shablon']) sh.value = soz[k+'_shablon'];
      });
      if (soz.provayder) {
        const pvd = document.getElementById('sms_pvd_'+soz.provayder);
        if (pvd) pvd.checked = true;
      }
      const h = document.getElementById('smsHolat');
      if (h) h.innerHTML = data.faol
        ? '<span style="color:#10b981;font-weight:600">● Ulangan</span>'
        : '<span style="color:#94a3b8">● Ulanmagan</span>';
    } else {
      const h = document.getElementById('smsHolat');
      if (h) h.innerHTML = '<span style="color:#94a3b8">● Sozlanmagan</span>';
    }
  } catch {}
}

function smsShablon(id, holat) {
  const el = document.getElementById(id);
  if (el) el.style.display = holat ? '' : 'none';
}

function smsPvdOzgartir(rang, radio) {
  document.querySelectorAll('[name=sms_provayder]').forEach(r => {
    r.closest('label').style.borderColor = '#e2e8f0';
  });
  radio.closest('label').style.borderColor = rang;
}

async function smsSaqla() {
  const login  = document.getElementById('smsLogin')?.value?.trim();
  const token  = document.getElementById('smsParol')?.value?.trim();
  const sender = document.getElementById('smsSender')?.value?.trim();
  const pvd    = document.querySelector('[name=sms_provayder]:checked')?.value || 'eskiz';

  if (!login || !token) { toast('Login va parol to\'ldiring!', 'warning'); return; }

  const sozlamalar = { provayder: pvd };
  ['sms_sotuv','sms_qarz','sms_tug'].forEach(k => {
    sozlamalar[k] = document.getElementById(k)?.checked || false;
    const sh = document.getElementById(k+'_shablon');
    if (sh) sozlamalar[k+'_shablon'] = sh.value;
  });

  try {
    await apiPost('/integratsiya', {
      tur: 'sms', login, token, sender, faol: 1, sozlamalar
    });
    toast('✅ SMS integratsiya saqlandi!', 'success');
    intSmsHolatYukla();
    const h = document.getElementById('smsHolat');
    if (h) h.innerHTML = '<span style="color:#10b981;font-weight:600">● Ulangan</span>';
  } catch(e) { toast(e.message, 'error'); }
}

async function smsTest() {
  const login  = document.getElementById('smsLogin')?.value?.trim();
  const token  = document.getElementById('smsParol')?.value?.trim();
  const sender = document.getElementById('smsSender')?.value?.trim();
  const pvd    = document.querySelector('[name=sms_provayder]:checked')?.value || 'eskiz';
  if (!login || !token) { toast('Avval saqlang!', 'warning'); return; }

  const tel = prompt('Test SMS yuborish uchun telefon raqam kiriting:\n(+998901234567)');
  if (!tel) return;

  const statusDiv = document.getElementById('smsStatus');
  if (statusDiv) {
    statusDiv.style.display = 'block';
    statusDiv.style.background = '#f8fafc';
    statusDiv.style.color = '#475569';
    statusDiv.textContent = '⏳ SMS yuborilmoqda...';
  }

  try {
    const r = await apiPost('/sms/test', { login, token, sender, provayder: pvd, telefon: tel });
    if (r.muvaffaqiyat) {
      if (statusDiv) {
        statusDiv.style.background = '#f0fdf4';
        statusDiv.style.color = '#166534';
        statusDiv.textContent = '✅ Test SMS yuborildi! Telefoningizni tekshiring.';
      }
      toast('✅ Test SMS yuborildi!', 'success');
    } else throw new Error(r.xato || 'Xato');
  } catch(e) {
    if (statusDiv) {
      statusDiv.style.background = '#fff1f2';
      statusDiv.style.color = '#991b1b';
      statusDiv.textContent = '❌ ' + e.message;
    }
    toast('❌ ' + e.message, 'error');
  }
}
