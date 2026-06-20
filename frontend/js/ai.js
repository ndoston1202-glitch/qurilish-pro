// ===== AI YORDAMCHI =====

async function aiYukla() {
  const kontent = document.getElementById('asosiyKontent');
  kontent.innerHTML = `
    <div style="max-width:900px">

      <!-- AI TABS -->
      <div class="hisobot-tabs" style="margin-bottom:20px">
        <button class="tab-btn active" onclick="aiTabAlmashtir('chat',this)">
          <i class="fas fa-robot"></i> AI Yordamchi
        </button>
        <button class="tab-btn" onclick="aiTabAlmashtir('tahlil',this)">
          <i class="fas fa-chart-line"></i> Sotuv Tahlili
        </button>
        <button class="tab-btn" onclick="aiTabAlmashtir('bashorat',this)">
          <i class="fas fa-crystal-ball"></i> Bashorat
        </button>
      </div>

      <div id="aiKontent"></div>
    </div>`;

  aiTabAlmashtir('chat', document.querySelector('.tab-btn'));
}

function aiTabAlmashtir(tur, btn) {
  document.querySelectorAll('.hisobot-tabs .tab-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  switch(tur) {
    case 'chat':    aiChatKorsatish();    break;
    case 'tahlil':  aiTahlilYukla();     break;
    case 'bashorat': aiBashoratYukla();  break;
  }
}

// ===== 1. AI CHATBOT =====
let chatTarix = [];

function aiChatKorsatish() {
  document.getElementById('aiKontent').innerHTML = `
    <div class="card" style="height:calc(100vh - 220px);display:flex;flex-direction:column">
      <div class="card-header">
        <div style="display:flex;align-items:center;gap:10px">
          <div style="width:40px;height:40px;border-radius:50%;background:linear-gradient(135deg,#2563eb,#7c3aed);
            display:flex;align-items:center;justify-content:center">
            <i class="fas fa-robot" style="color:white;font-size:18px"></i>
          </div>
          <div>
            <div style="font-weight:700">AI Yordamchi</div>
            <div style="font-size:12px;color:#10b981">● Online</div>
          </div>
        </div>
        <button class="btn btn-secondary btn-sm" onclick="chatTarixTozala()">
          <i class="fas fa-trash"></i> Tozala
        </button>
      </div>

      <!-- Chat xabarlar -->
      <div id="chatXabarlar" style="flex:1;overflow-y:auto;padding:16px;display:flex;flex-direction:column;gap:12px">
        <div style="display:flex;gap:10px;align-items:flex-start">
          <div style="width:32px;height:32px;border-radius:50%;background:linear-gradient(135deg,#2563eb,#7c3aed);
            display:flex;align-items:center;justify-content:center;flex-shrink:0">
            <i class="fas fa-robot" style="color:white;font-size:14px"></i>
          </div>
          <div style="background:#f1f5f9;border-radius:12px 12px 12px 0;padding:12px 16px;max-width:80%;font-size:14px">
            Salom! Men sizning do'koningiz AI yordamchisiman. 🏗️<br><br>
            Quyidagilarni so'rashingiz mumkin:<br>
            • "Bugun nechta sotuv bo'ldi?"<br>
            • "Qaysi mahsulot kam qolgan?"<br>
            • "Bu oyning eng yaxshi mahsuloti?"<br>
            • Boshqa savollar...
          </div>
        </div>
      </div>

      <!-- Input -->
      <div style="padding:16px;border-top:1px solid #e2e8f0">
        <div style="display:flex;gap:8px">
          <input type="text" id="chatInput" placeholder="Savol yozing..."
            style="flex:1;padding:10px 14px;border:2px solid #e2e8f0;border-radius:24px;font-size:14px;outline:none"
            onkeypress="if(event.key==='Enter')chatYuborish()"
            onfocus="this.style.borderColor='#2563eb'" onblur="this.style.borderColor='#e2e8f0'">
          <button onclick="chatYuborish()" id="chatBtn"
            style="width:44px;height:44px;border-radius:50%;border:none;background:linear-gradient(135deg,#2563eb,#7c3aed);
            color:white;cursor:pointer;display:flex;align-items:center;justify-content:center">
            <i class="fas fa-paper-plane"></i>
          </button>
        </div>
        <!-- Tez savollar -->
        <div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:8px">
          ${[
            "Bugun nechta sotuv?",
            "Kam qolgan mahsulotlar?",
            "Eng ko'p sotilgan?",
            "Oylik daromad?"
          ].map(s => `<button onclick="chatTezSavol('${s}')"
            style="padding:4px 12px;border:1px solid #e2e8f0;border-radius:16px;background:white;
            font-size:12px;cursor:pointer;color:#475569" onmouseover="this.style.background='#f1f5f9'"
            onmouseout="this.style.background='white'">${s}</button>`).join('')}
        </div>
      </div>
    </div>`;
}

function chatTezSavol(savol) {
  document.getElementById('chatInput').value = savol;
  chatYuborish();
}

async function chatYuborish() {
  const input = document.getElementById('chatInput');
  const savol = input.value.trim();
  if (!savol) return;
  input.value = '';

  // Foydalanuvchi xabari
  chatXabarQosh('user', savol);
  chatTarix.push({role:'user', content: savol});

  // AI yuklanmoqda
  const loadId = 'load_' + Date.now();
  chatXabarQosh('ai', '<i class="fas fa-spinner fa-spin"></i> Fikrlamoqda...', loadId);

  const btn = document.getElementById('chatBtn');
  btn.disabled = true;

  try {
    const r = await apiPost('/ai/chat', {savol});
    document.getElementById(loadId)?.remove();
    chatXabarQosh('ai', r.javob.replace(/\n/g, '<br>'));
    chatTarix.push({role:'assistant', content: r.javob});
  } catch(e) {
    document.getElementById(loadId)?.remove();
    chatXabarQosh('ai', '❌ Internet ulanishini tekshiring yoki keyinroq urinib ko\'ring.');
  }
  btn.disabled = false;
}

function chatXabarQosh(kim, matn, id) {
  const div = document.getElementById('chatXabarlar');
  const isAI = kim === 'ai';
  const el = document.createElement('div');
  if (id) el.id = id;
  el.style.cssText = 'display:flex;gap:10px;align-items:flex-start' + (isAI ? '' : ';flex-direction:row-reverse');
  el.innerHTML = `
    <div style="width:32px;height:32px;border-radius:50%;flex-shrink:0;
      background:${isAI ? 'linear-gradient(135deg,#2563eb,#7c3aed)' : '#10b981'};
      display:flex;align-items:center;justify-content:center">
      <i class="fas ${isAI ? 'fa-robot' : 'fa-user'}" style="color:white;font-size:14px"></i>
    </div>
    <div style="background:${isAI ? '#f1f5f9' : '#2563eb'};color:${isAI ? '#1e293b' : 'white'};
      border-radius:${isAI ? '12px 12px 12px 0' : '12px 12px 0 12px'};
      padding:12px 16px;max-width:80%;font-size:14px;line-height:1.6">
      ${matn}
    </div>`;
  div.appendChild(el);
  div.scrollTop = div.scrollHeight;
}

function chatTarixTozala() {
  chatTarix = [];
  aiChatKorsatish();
}

// ===== 2. AI TAHLIL =====
async function aiTahlilYukla() {
  document.getElementById('aiKontent').innerHTML = `
    <div class="card">
      <div class="card-header">
        <div style="display:flex;align-items:center;gap:10px">
          <div style="width:40px;height:40px;border-radius:50%;background:linear-gradient(135deg,#10b981,#059669);
            display:flex;align-items:center;justify-content:center">
            <i class="fas fa-chart-line" style="color:white;font-size:18px"></i>
          </div>
          <div>
            <div style="font-weight:700">AI Sotuv Tahlili</div>
            <div style="font-size:12px;color:#64748b">Joriy va o'tgan oy taqqoslash</div>
          </div>
        </div>
        <button class="btn btn-primary btn-sm" onclick="aiTahlilYukla()">
          <i class="fas fa-sync"></i> Yangilash
        </button>
      </div>
      <div class="card-body" id="tahlilDiv">
        <div style="text-align:center;padding:40px">
          <i class="fas fa-spinner fa-spin fa-3x" style="color:#2563eb"></i>
          <p style="margin-top:12px;color:#64748b">AI tahlil qilmoqda...</p>
        </div>
      </div>
    </div>`;

  try {
    const r = await apiPost('/ai/tahlil', {});
    const div = document.getElementById('tahlilDiv');

    // Statistika kartalar
    const joriy = r.malumot?.joriy_oy;
    const oldingi = r.malumot?.oldingi_oy;
    const ozgarish = joriy && oldingi && oldingi.jami > 0
      ? ((joriy.jami - oldingi.jami) / oldingi.jami * 100).toFixed(1)
      : 0;

    div.innerHTML = `
      ${joriy ? `
      <div class="stats-grid" style="margin-bottom:20px">
        <div class="stat-card">
          <div class="stat-icon green"><i class="fas fa-shopping-cart"></i></div>
          <div class="stat-info"><h3>${joriy.son}</h3><p>Joriy oy sotuvlar</p></div>
        </div>
        <div class="stat-card">
          <div class="stat-icon blue"><i class="fas fa-coins"></i></div>
          <div class="stat-info"><h3>${formatSum(joriy.jami)}</h3><p>Joriy oy daromad</p></div>
        </div>
        <div class="stat-card">
          <div class="stat-icon ${ozgarish >= 0 ? 'green' : 'red'}">
            <i class="fas fa-${ozgarish >= 0 ? 'arrow-up' : 'arrow-down'}"></i>
          </div>
          <div class="stat-info">
            <h3 style="color:${ozgarish >= 0 ? '#10b981' : '#ef4444'}">${ozgarish >= 0 ? '+' : ''}${ozgarish}%</h3>
            <p>O'tgan oyga nisbatan</p>
          </div>
        </div>
      </div>` : ''}

      <!-- AI Tahlil matni -->
      <div style="background:linear-gradient(135deg,#f0fdf4,#dcfce7);border:1px solid #bbf7d0;
        border-radius:12px;padding:20px;margin-bottom:16px">
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:12px">
          <i class="fas fa-robot" style="color:#10b981;font-size:18px"></i>
          <span style="font-weight:700;color:#166534">AI Tahlil</span>
        </div>
        <div style="font-size:14px;line-height:1.8;color:#1e293b;white-space:pre-wrap">${r.javob}</div>
      </div>`;
  } catch(e) {
    document.getElementById('tahlilDiv').innerHTML = `
      <div class="empty-state">
        <i class="fas fa-wifi-slash fa-2x" style="color:#ef4444;margin-bottom:8px"></i>
        <p>Internet ulanishi kerak!</p>
      </div>`;
  }
}

// ===== 3. AI BASHORAT =====
async function aiBashoratYukla() {
  document.getElementById('aiKontent').innerHTML = `
    <div class="card">
      <div class="card-header">
        <div style="display:flex;align-items:center;gap:10px">
          <div style="width:40px;height:40px;border-radius:50%;background:linear-gradient(135deg,#7c3aed,#4f46e5);
            display:flex;align-items:center;justify-content:center">
            <i class="fas fa-magic" style="color:white;font-size:18px"></i>
          </div>
          <div>
            <div style="font-weight:700">AI Bashorat</div>
            <div style="font-size:12px;color:#64748b">Keyingi oy tahlili va tavsiyalar</div>
          </div>
        </div>
        <button class="btn btn-primary btn-sm" onclick="aiBashoratYukla()">
          <i class="fas fa-sync"></i> Yangilash
        </button>
      </div>
      <div class="card-body" id="bashoratDiv">
        <div style="text-align:center;padding:40px">
          <i class="fas fa-spinner fa-spin fa-3x" style="color:#7c3aed"></i>
          <p style="margin-top:12px;color:#64748b">AI bashorat qilmoqda...</p>
        </div>
      </div>
    </div>`;

  try {
    const r = await apiPost('/ai/bashorat', {});
    const div = document.getElementById('bashoratDiv');

    div.innerHTML = `
      ${r.oylar ? `
      <div style="display:flex;gap:10px;margin-bottom:20px;overflow-x:auto">
        ${r.oylar.map(o => `
          <div style="flex:1;min-width:160px;padding:12px;background:#f8fafc;border-radius:8px;
            border:1px solid #e2e8f0;text-align:center">
            <div style="font-size:12px;color:#64748b;margin-bottom:4px">${o.oy}</div>
            <div style="font-weight:700;font-size:16px">${formatSum(o.jami)}</div>
            <div style="font-size:12px;color:#94a3b8">${o.son} sotuv</div>
          </div>`).join('')}
        <div style="flex:1;min-width:160px;padding:12px;background:linear-gradient(135deg,#ede9fe,#ddd6fe);
          border-radius:8px;border:2px dashed #7c3aed;text-align:center">
          <div style="font-size:12px;color:#7c3aed;margin-bottom:4px;font-weight:600">Keyingi oy</div>
          <div style="font-size:20px">🔮</div>
          <div style="font-size:12px;color:#7c3aed">AI bashorat</div>
        </div>
      </div>` : ''}

      <div style="background:linear-gradient(135deg,#faf5ff,#ede9fe);border:1px solid #ddd6fe;
        border-radius:12px;padding:20px">
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:12px">
          <i class="fas fa-magic" style="color:#7c3aed;font-size:18px"></i>
          <span style="font-weight:700;color:#4c1d95">AI Bashorat va Tavsiyalar</span>
        </div>
        <div style="font-size:14px;line-height:1.8;color:#1e293b;white-space:pre-wrap">${r.javob}</div>
      </div>`;
  } catch(e) {
    document.getElementById('bashoratDiv').innerHTML = `
      <div class="empty-state">
        <i class="fas fa-wifi-slash fa-2x" style="color:#ef4444;margin-bottom:8px"></i>
        <p>Internet ulanishi kerak!</p>
      </div>`;
  }
}
