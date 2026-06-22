// ===== LOGIN =====
document.getElementById('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const username = document.getElementById('loginUsername').value;
  const parol = document.getElementById('loginParol').value;
  const xatoDiv = document.getElementById('loginXato');
  xatoDiv.style.display = 'none';
  try {
    const data = await apiPost('/login', { username, parol });
    joriyFoydalanuvchi = data.foydalanuvchi;
    localStorage.setItem('foydalanuvchi', JSON.stringify(joriyFoydalanuvchi));
    ilovaYukla();
  } catch (e) {
    xatoDiv.textContent = e.message;
    xatoDiv.style.display = 'block';
  }
});

// ===== RUXSAT TEKSHIRUVI =====
function sahifaRuxsatBormi(sahifaKalit) {
  if (!joriyFoydalanuvchi) return false;
  // Admin — hamma narsaga ruxsat
  if (joriyFoydalanuvchi.rol === 'admin') return true;
  // ruxsatlar null/undefined bo'lsa — barcha ruxsat (eski foydalanuvchilar uchun)
  if (!joriyFoydalanuvchi.ruxsatlar) return true;
  try {
    const rx = typeof joriyFoydalanuvchi.ruxsatlar === 'string'
      ? JSON.parse(joriyFoydalanuvchi.ruxsatlar)
      : joriyFoydalanuvchi.ruxsatlar;
    // Aniq false bo'lsa — taqiqlangan; aks holda ruxsat
    return rx[sahifaKalit] !== false;
  } catch { return true; }
}

// ===== SIDEBAR MENU YASHIRISH/KO'RSATISH =====
function sidebarMenuYanila() {
  // Admin-only bo'limlar
  if (joriyFoydalanuvchi.rol === 'admin') {
    document.querySelectorAll('.admin-only').forEach(el => el.style.display = 'flex');
  } else {
    document.querySelectorAll('.admin-only').forEach(el => el.style.display = 'none');
  }

  // Ruxsatlarga ko'ra har bir menyu elementini ko'rsatish/yashirish
  // (faqat kassir uchun — admin da hamma ko'rinadi)
  if (joriyFoydalanuvchi.rol !== 'admin' && joriyFoydalanuvchi.ruxsatlar) {
    try {
      const rx = typeof joriyFoydalanuvchi.ruxsatlar === 'string'
        ? JSON.parse(joriyFoydalanuvchi.ruxsatlar)
        : joriyFoydalanuvchi.ruxsatlar;

      // menu-{kalit} ID li elementlarni tekshirish
      const sahifaMenular = [
        'dashboard', 'hisobot', 'kassa', 'kassa_hisobi', 'qarzlar',
        'mahsulotlar', 'etiketka', 'brendlar',
        'mijozlar', 'jurnal', 'ai', 'xodimlar', 'sozlamalar'
      ];
      sahifaMenular.forEach(kalit => {
        const el = document.getElementById('menu-' + kalit);
        if (el) {
          el.style.display = rx[kalit] === false ? 'none' : '';
        }
      });
    } catch {}
  } else if (joriyFoydalanuvchi.rol === 'admin') {
    // Admin — hamma menyu ko'rinsin
    ['dashboard','hisobot','kassa','kassa_hisobi','qarzlar','mahsulotlar','etiketka',
     'brendlar','mijozlar','jurnal','ai','xodimlar','sozlamalar'].forEach(kalit => {
      const el = document.getElementById('menu-' + kalit);
      if (el) el.style.display = '';
    });
  }
}

function ilovaYukla() {
  document.getElementById('loginSahifa').style.display = 'none';
  document.getElementById('asosiyIlova').style.display = 'flex';
  document.getElementById('asosiyIlova').style.flexDirection = 'row';

  document.getElementById('sidebarUserIsm').textContent = joriyFoydalanuvchi.ism + ' ' + joriyFoydalanuvchi.familiya;
  document.getElementById('sidebarUserRol').textContent = joriyFoydalanuvchi.rol === 'admin' ? '👑 Admin' : '💼 Kassir';
  document.getElementById('topbarUser').textContent = joriyFoydalanuvchi.ism;

  // Menyu ruxsatlarini ko'rsatish/yashirish
  sidebarMenuYanila();

  // Sana
  const sanani = () => {
    const h = new Date();
    document.getElementById('topbarSana').textContent = h.toLocaleString('uz-UZ', { weekday:'short', day:'numeric', month:'long', hour:'2-digit', minute:'2-digit' });
  };
  sanani(); setInterval(sanani, 60000);

  sozlamalarniQolla();

  // Birinchi ochilishi mumkin bo'lgan sahifani topish
  const tartib = ['dashboard','kassa','kassa_hisobi','mahsulotlar','hisobot',
                  'mijozlar','jurnal','ai','xodimlar','sozlamalar'];
  const birinchi = tartib.find(k => sahifaRuxsatBormi(k)) || 'dashboard';
  sahifaOch(birinchi);
}

// ===== SAHIFALAR =====
function sahifaOch(nomi) {
  // Ruxsat tekshiruvi — admin bo'lmasa
  if (!sahifaRuxsatBormi(nomi)) {
    document.getElementById('asosiyKontent').innerHTML = `
      <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;
        height:60vh;gap:16px;text-align:center">
        <div style="width:80px;height:80px;border-radius:50%;background:#fee2e2;
          display:flex;align-items:center;justify-content:center">
          <i class="fas fa-lock fa-2x" style="color:#ef4444"></i>
        </div>
        <h2 style="font-size:20px;color:#1e293b;margin:0">Kirish taqiqlangan</h2>
        <p style="color:#64748b;font-size:14px;margin:0;max-width:300px">
          Sizga bu bo'limga kirish ruxsati berilmagan.<br>
          Admin bilan bog'laning.
        </p>
        <button class="btn btn-secondary" onclick="sahifaOch('dashboard')">
          <i class="fas fa-home"></i> Dashboardga qaytish
        </button>
      </div>`;
    return;
  }

  // Menyu faollashtirish
  document.querySelectorAll('.sidebar-menu li').forEach(li => li.classList.remove('active'));
  const menuEl = document.getElementById('menu-' + nomi);
  if (menuEl) menuEl.classList.add('active');

  const nomlar = {
    dashboard:    'Dashboard',
    kassa:        'Sotuv',
    kassa_hisobi: 'Kassa hisobi',
    qarzlar:      'Qarzlar jadvali',
    mahsulotlar:  'Ombor',
    etiketka:     'Etiketka dizayner',
    hisobot:      'Hisobotlar',
    jurnal:       'Jurnal',
    ai:           '🤖 AI Yordamchi',
    mijozlar:     'Mijozlar',
    xodimlar:     'Xodimlar',
    sozlamalar:   'Sozlamalar'
  };
  document.getElementById('sahifaNomi').textContent = nomlar[nomi] || nomi;

  // Mobile: sidebar yop
  document.getElementById('sidebar').classList.remove('ochiq');
  document.getElementById('overlay').classList.remove('ochiq');

  const kontent = document.getElementById('asosiyKontent');
  kontent.innerHTML = '<div style="text-align:center;padding:40px"><i class="fas fa-spinner fa-spin fa-2x" style="color:#2563eb"></i></div>';

  switch(nomi) {
    case 'dashboard': dashboardYukla(); break;
    case 'kassa': kassaYukla(); break;
    case 'kassa_hisobi': kassaHisobiYukla(); break;
    case 'qarzlar': qarzlarSahifaYukla(); break;
    case 'mahsulotlar': mahsulotlarYukla('mahsulotlar'); break;
    case 'ombor': mahsulotlarYukla('ombor'); break;
    case 'etiketka': etiketkaYukla(null); break;
    case 'hisobot': hisobotYukla(); break;
    case 'jurnal': jurnalYukla(); break;
    case 'ai': aiYukla(); break;
    case 'xodimlar': xodimlarYukla(); break;
    case 'mijozlar': mijozlarYukla(); break;
    case 'brendlar': brendlarYukla(); break;
    case 'sozlamalar': sozlamalarYukla(); break;
  }
}

// ===== SIDEBAR TOGGLE =====
function sidebarToggle() {
  document.getElementById('sidebar').classList.toggle('ochiq');
  document.getElementById('overlay').classList.toggle('ochiq');
}

// ===== CHIQISH =====
function chiqish() {
  joriyFoydalanuvchi = null;
  localStorage.removeItem('foydalanuvchi');
  document.getElementById('asosiyIlova').style.display = 'none';
  document.getElementById('loginSahifa').style.display = 'flex';
  document.getElementById('loginUsername').value = '';
  document.getElementById('loginParol').value = '';
}

// ===== SAHIFA YUKLANGANDA =====
window.addEventListener('load', () => {
  const saqlangan = localStorage.getItem('foydalanuvchi');
  if (saqlangan) {
    joriyFoydalanuvchi = JSON.parse(saqlangan);
    ilovaYukla();
  }
});
