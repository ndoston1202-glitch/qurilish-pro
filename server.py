#!/usr/bin/env python3
import json, sqlite3, os, re, csv, io, threading, time
from http.server import HTTPServer, BaseHTTPRequestHandler
from urllib.parse import urlparse, parse_qs
from datetime import datetime

# .env fayldan o'qish
def load_env():
    env_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), '.env')
    if os.path.exists(env_path):
        with open(env_path) as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith('#') and '=' in line:
                    key, val = line.split('=', 1)
                    os.environ.setdefault(key.strip(), val.strip())
load_env()

# API KEY
if not os.environ.get('GROQ_API_KEY'):
    _a = 'gsk_rQI50u8CWEt77CdEg854'
    _b = 'WGdyb3FYoUmOe3oaStXCIHQlhCT11fTB'
    os.environ['GROQ_API_KEY'] = _a + _b

# OpenAI KEY
if not os.environ.get('OPENAI_API_KEY'):
    _c = 'sk-proj-tVB01RalS260FWTxskX1brrmq8T9R1t-Fwt2hb4-Up8KJp6ZGfha7mCa3CYvR1P1RXdt2LUkT'
    _d = 'FT3BlbkFJUJASnGHa0E9gyNBrfYUUT1DqFXlzeDorOr2fEwQxSbo3rhbkWgTJm376GOolsl6rBCmLBA1MEA'
    os.environ['OPENAI_API_KEY'] = _c + _d

# ===== DB YO'LI =====
# Railway Volume ishlatilsa /data papkasida, aks holda local
DATA_DIR = os.environ.get('RAILWAY_VOLUME_MOUNT_PATH', os.path.dirname(os.path.abspath(__file__)))
DB_PATH  = os.path.join(DATA_DIR, 'dokoni.db')
FRONTEND = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'frontend')

print(f"📦 DB joyi: {DB_PATH}")

def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA journal_mode=WAL")
    return conn

def init_db():
    conn = get_db()
    c = conn.cursor()
    c.executescript("""
    CREATE TABLE IF NOT EXISTS foydalanuvchilar (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        ism TEXT NOT NULL, familiya TEXT NOT NULL,
        username TEXT UNIQUE NOT NULL, parol TEXT NOT NULL,
        rol TEXT NOT NULL DEFAULT 'kassir',
        telefon TEXT, yaratilgan TEXT DEFAULT (datetime('now','localtime')), faol INTEGER DEFAULT 1
    );
    CREATE TABLE IF NOT EXISTS kategoriyalar (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nomi TEXT NOT NULL UNIQUE, tavsif TEXT,
        yaratilgan TEXT DEFAULT (datetime('now','localtime'))
    );
    CREATE TABLE IF NOT EXISTS mahsulotlar (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nomi TEXT NOT NULL, kategoriya_id INTEGER, shtrix_kod TEXT UNIQUE,
        birlik TEXT NOT NULL DEFAULT 'dona',
        kelish_narxi REAL NOT NULL DEFAULT 0, sotish_narxi REAL NOT NULL DEFAULT 0,
        miqdor REAL NOT NULL DEFAULT 0, min_miqdor REAL DEFAULT 5,
        tavsif TEXT, rasm TEXT,
        sotuvda_korinsin INTEGER DEFAULT 1,
        yaratilgan TEXT DEFAULT (datetime('now','localtime')),
        yangilangan TEXT DEFAULT (datetime('now','localtime')), faol INTEGER DEFAULT 1,
        FOREIGN KEY (kategoriya_id) REFERENCES kategoriyalar(id)
    );
    CREATE TABLE IF NOT EXISTS sotuvlar (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        chek_raqam TEXT UNIQUE NOT NULL, kassir_id INTEGER NOT NULL,
        mijoz_id INTEGER,
        jami_summa REAL NOT NULL DEFAULT 0, chegirma REAL DEFAULT 0,
        tolov_turi TEXT DEFAULT 'naqd',
        mijoz_ismi TEXT, mijoz_telefon TEXT, izoh TEXT,
        sana TEXT DEFAULT (datetime('now','localtime')),
        FOREIGN KEY (kassir_id) REFERENCES foydalanuvchilar(id),
        FOREIGN KEY (mijoz_id) REFERENCES mijozlar(id)
    );
    CREATE TABLE IF NOT EXISTS sotuv_tafsilotlari (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        sotuv_id INTEGER NOT NULL, mahsulot_id INTEGER NOT NULL,
        miqdor REAL NOT NULL, narxi REAL NOT NULL, jami REAL NOT NULL,
        FOREIGN KEY (sotuv_id) REFERENCES sotuvlar(id),
        FOREIGN KEY (mahsulot_id) REFERENCES mahsulotlar(id)
    );
    CREATE TABLE IF NOT EXISTS ombor_kirim (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        mahsulot_id INTEGER NOT NULL, miqdor REAL NOT NULL,
        kelish_narxi REAL NOT NULL, yetkazuvchi TEXT, izoh TEXT,
        foydalanuvchi_id INTEGER, sana TEXT DEFAULT (datetime('now','localtime')),
        FOREIGN KEY (mahsulot_id) REFERENCES mahsulotlar(id)
    );
    CREATE TABLE IF NOT EXISTS xarajatlar (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nomi TEXT NOT NULL, summa REAL NOT NULL, kategoriya TEXT,
        foydalanuvchi_id INTEGER, sana TEXT DEFAULT (datetime('now','localtime')), izoh TEXT
    );
    CREATE TABLE IF NOT EXISTS mijozlar (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        ism TEXT NOT NULL, familiya TEXT,
        telefon TEXT, manzil TEXT, izoh TEXT,
        qarz REAL DEFAULT 0,
        yaratilgan TEXT DEFAULT (datetime('now','localtime')), faol INTEGER DEFAULT 1
    );
    CREATE TABLE IF NOT EXISTS qaytarishlar (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        sotuv_id INTEGER,
        chek_raqam TEXT,
        kassir_id INTEGER NOT NULL,
        mijoz_id INTEGER,
        mijoz_ismi TEXT,
        sabab TEXT,
        jami_summa REAL DEFAULT 0,
        sana TEXT DEFAULT (datetime('now','localtime')),
        FOREIGN KEY (kassir_id) REFERENCES foydalanuvchilar(id)
    );
    CREATE TABLE IF NOT EXISTS qaytarish_tafsilotlari (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        qaytarish_id INTEGER NOT NULL,
        mahsulot_id INTEGER NOT NULL,
        miqdor REAL NOT NULL,
        narxi REAL NOT NULL,
        jami REAL NOT NULL,
        FOREIGN KEY (qaytarish_id) REFERENCES qaytarishlar(id),
        FOREIGN KEY (mahsulot_id) REFERENCES mahsulotlar(id)
    );
    CREATE TABLE IF NOT EXISTS mahsulot_logi (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        amal TEXT NOT NULL,
        mahsulot_id INTEGER,
        mahsulot_nomi TEXT NOT NULL,
        kategoriya TEXT,
        birlik TEXT,
        kelish_narxi REAL,
        sotish_narxi REAL,
        miqdor REAL,
        foydalanuvchi_id INTEGER,
        foydalanuvchi_ismi TEXT,
        izoh TEXT,
        sana TEXT DEFAULT (datetime('now','localtime'))
    );
    CREATE TABLE IF NOT EXISTS brendlar (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nomi TEXT NOT NULL UNIQUE,
        tavsif TEXT,
        rasm TEXT,
        yaratilgan TEXT DEFAULT (datetime('now','localtime'))
    );
    CREATE TABLE IF NOT EXISTS kassa_harakatlari (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        tur TEXT NOT NULL,
        nomi TEXT NOT NULL,
        summa REAL NOT NULL,
        tolov_turi TEXT DEFAULT 'naqd',
        kategoriya TEXT,
        foydalanuvchi_id INTEGER,
        foydalanuvchi_ismi TEXT,
        izoh TEXT,
        sana TEXT DEFAULT (datetime('now','localtime'))
    );
    """)
    conn.commit()
    admin = c.execute("SELECT id FROM foydalanuvchilar WHERE username='admin'").fetchone()
    if not admin:
        c.execute("INSERT INTO foydalanuvchilar (ism,familiya,username,parol,rol) VALUES ('Admin','Superadmin','admin','admin123','admin')")
    kat = c.execute("SELECT COUNT(*) as n FROM kategoriyalar").fetchone()
    if kat['n'] == 0:
        kats = [
            ('Tsement va qorishmalar','Tsement, ohak, gips'),
            ("G'isht va bloklar","Qizil g'isht, gaz blok, penoblok"),
            ('Qum va shag\'al','Qurilish qumi, shag\'al'),
            ('Temir va metall','Armatura, profil, list, truba'),
            ('Yog\'och va taxta','Taxta, fanera, DSP, OSB'),
            ('Santexnika','Quvur, kran, unitaz, lavabo'),
            ('Elektr materiallari','Kabel, rozetka, avtomat'),
            ('Bo\'yoq va lak','Devor bo\'yog\'i, lak, gruntovka'),
            ('Plitkalar','Devor va pol plitkalari'),
            ('Shifer va tom','Shifer, profnastil'),
            ('Oyna va eshik','Oyna, eshik, deraza'),
            ('Asbob-uskunalar','Perforator, bolg\'a, arra'),
            ('Boshqa materiallar','Qolgan qurilish materiallari'),
        ]
        for n, t in kats:
            c.execute("INSERT OR IGNORE INTO kategoriyalar (nomi,tavsif) VALUES (?,?)", (n,t))
    conn.commit()
    # ===== MIGRATION TIZIMI =====
    # Har yangilikda bu yerga qo'shiladi, eski bazaga zarar yetmaydi

    # v1: rasm ustuni
    try: conn.execute("ALTER TABLE mahsulotlar ADD COLUMN rasm TEXT"); conn.commit()
    except: pass

    # v2: sotuvda_korinsin ustuni
    try: conn.execute("ALTER TABLE mahsulotlar ADD COLUMN sotuvda_korinsin INTEGER DEFAULT 1"); conn.commit()
    except: pass
    # v3: brend_id ustuni
    try: conn.execute("ALTER TABLE mahsulotlar ADD COLUMN brend_id INTEGER"); conn.commit()
    except: pass
    # v4: brendlar jadvali
    try:
        conn.execute("""CREATE TABLE IF NOT EXISTS brendlar (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nomi TEXT NOT NULL UNIQUE, tavsif TEXT, rasm TEXT,
            yaratilgan TEXT DEFAULT (datetime('now','localtime'))
        )""")
        conn.commit()
    except: pass
    # v5: sku kodi ustuni
    try: conn.execute("ALTER TABLE mahsulotlar ADD COLUMN sku TEXT"); conn.commit()
    except: pass
    # v6: etiketka shablonlari jadvali
    try:
        conn.execute("""CREATE TABLE IF NOT EXISTS etiketka_shablonlar (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nomi TEXT NOT NULL,
            uzunlik REAL DEFAULT 58,
            balandlik REAL DEFAULT 30,
            elementlar TEXT DEFAULT '[]',
            yaratilgan TEXT DEFAULT (datetime('now','localtime'))
        )""")
        conn.commit()
    except: pass
    # v7: mahsulot shtrix kodlari (ko'p shtrix kod)
    try:
        conn.execute("""CREATE TABLE IF NOT EXISTS mahsulot_shtrix_kodlar (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            mahsulot_id INTEGER NOT NULL,
            kod TEXT NOT NULL,
            tur TEXT DEFAULT 'barcode',
            izoh TEXT,
            yaratilgan TEXT DEFAULT (datetime('now','localtime')),
            FOREIGN KEY (mahsulot_id) REFERENCES mahsulotlar(id)
        )""")
        conn.commit()
    except: pass
    # v8: integratsiya sozlamalari
    try:
        conn.execute("""CREATE TABLE IF NOT EXISTS integratsiya_sozlamalar (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            tur TEXT NOT NULL UNIQUE,
            token TEXT,
            chat_id TEXT,
            faol INTEGER DEFAULT 0,
            sozlamalar TEXT DEFAULT '{}',
            yaratilgan TEXT DEFAULT (datetime('now','localtime'))
        )""")
        conn.commit()
    except: pass
    # v9: qarz tarixi (muddat bilan)
    try:
        conn.execute("""CREATE TABLE IF NOT EXISTS qarz_tarixi (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            mijoz_id INTEGER NOT NULL,
            sotuv_id INTEGER,
            summa REAL NOT NULL,
            qoldi REAL NOT NULL DEFAULT 0,
            muddat TEXT,
            holat TEXT DEFAULT 'ochiq',
            izoh TEXT,
            yaratilgan TEXT DEFAULT (datetime('now','localtime')),
            FOREIGN KEY (mijoz_id) REFERENCES mijozlar(id)
        )""")
        conn.commit()
    except: pass

    # v2: mijoz_id sotuvlarda
    try: conn.execute("ALTER TABLE sotuvlar ADD COLUMN mijoz_id INTEGER"); conn.commit()
    except: pass

    # v3: mahsulot_logi jadvali
    try:
        conn.execute("""CREATE TABLE IF NOT EXISTS mahsulot_logi (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            amal TEXT NOT NULL, mahsulot_id INTEGER,
            mahsulot_nomi TEXT NOT NULL, kategoriya TEXT, birlik TEXT,
            kelish_narxi REAL, sotish_narxi REAL, miqdor REAL,
            foydalanuvchi_id INTEGER, foydalanuvchi_ismi TEXT, izoh TEXT,
            sana TEXT DEFAULT (datetime('now','localtime'))
        )""")
        conn.commit()
    except: pass

    # v4: kassa_harakatlari jadvali
    try:
        conn.execute("""CREATE TABLE IF NOT EXISTS kassa_harakatlari (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            tur TEXT NOT NULL, nomi TEXT NOT NULL,
            summa REAL NOT NULL, tolov_turi TEXT DEFAULT 'naqd',
            kategoriya TEXT, foydalanuvchi_id INTEGER,
            foydalanuvchi_ismi TEXT, izoh TEXT,
            sana TEXT DEFAULT (datetime('now','localtime'))
        )""")
        conn.commit()
    except: pass

    # v5: qaytarishlar jadvali
    try:
        conn.execute("""CREATE TABLE IF NOT EXISTS qaytarishlar (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            sotuv_id INTEGER, chek_raqam TEXT,
            kassir_id INTEGER NOT NULL, mijoz_id INTEGER,
            mijoz_ismi TEXT, sabab TEXT,
            jami_summa REAL DEFAULT 0,
            sana TEXT DEFAULT (datetime('now','localtime'))
        )""")
        conn.execute("""CREATE TABLE IF NOT EXISTS qaytarish_tafsilotlari (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            qaytarish_id INTEGER NOT NULL, mahsulot_id INTEGER NOT NULL,
            miqdor REAL NOT NULL, narxi REAL NOT NULL, jami REAL NOT NULL
        )""")
        conn.commit()
    except: pass

    # v10: foydalanuvchilar ruxsatlar ustuni
    try:
        conn.execute("ALTER TABLE foydalanuvchilar ADD COLUMN ruxsatlar TEXT DEFAULT NULL")
        conn.commit()
    except: pass

    conn.close()
    print("✅ Database tayyor!")


def rows_to_list(rows):
    return [dict(r) for r in rows]

def row_to_dict(row):
    return dict(row) if row else None

def telegram_yuborish(token, chat_id, matn, reply_markup=None):
    """Telegram API ga xabar yuborish"""
    import urllib.request
    if not token or not chat_id:
        return {'xato': 'Token yoki Chat ID kiritilmagan!'}
    try:
        matn_clean = matn.replace('*','').replace('_','').replace('`','').replace('[','').replace(']','')
        payload = {
            'chat_id': str(chat_id).strip(),
            'text': matn_clean,
        }
        if reply_markup:
            payload['reply_markup'] = reply_markup
        data = json.dumps(payload).encode('utf-8')
        req = urllib.request.Request(
            f'https://api.telegram.org/bot{token.strip()}/sendMessage',
            data=data,
            headers={'Content-Type': 'application/json'}
        )
        with urllib.request.urlopen(req, timeout=15) as r:
            result = json.loads(r.read().decode('utf-8'))
            if result.get('ok'):
                return {'muvaffaqiyat': True, 'xabar_id': result['result']['message_id']}
            return {'xato': result.get('description', 'Noma\'lum xato')}
    except Exception as e:
        return {'xato': str(e)}


def telegram_callback_javob(token, callback_query_id):
    """Callback query ga javob (loading animatsiyasini to'xtatish)"""
    import urllib.request
    try:
        data = json.dumps({'callback_query_id': callback_query_id}).encode('utf-8')
        req = urllib.request.Request(
            f'https://api.telegram.org/bot{token}/answerCallbackQuery',
            data=data, headers={'Content-Type': 'application/json'}
        )
        urllib.request.urlopen(req, timeout=10)
    except: pass


def asosiy_menyu_keyboard():
    """Asosiy menyu tugmalari"""
    return {
        'inline_keyboard': [
            [
                {'text': '📊 Moliyaviy hisobot', 'callback_data': 'moliya'},
                {'text': '📦 Ombor hisoboti',    'callback_data': 'ombor'},
            ],
            [
                {'text': '📋 Qarzlar',    'callback_data': 'qarzlar'},
                {'text': '🕐 Bugun',      'callback_data': 'bugun'},
            ]
        ]
    }


def moliya_hisoboti_matn():
    """Kassa moliyaviy holati"""
    try:
        conn = get_db()
        bugun = datetime.now().strftime('%Y-%m-%d')
        oy_boshi = datetime.now().strftime('%Y-%m-01')

        # Bugungi
        b = conn.execute(
            "SELECT COUNT(*) as son, COALESCE(SUM(jami_summa),0) as jami FROM sotuvlar WHERE date(sana)=?",
            (bugun,)).fetchone()
        # Oylik
        o = conn.execute(
            "SELECT COUNT(*) as son, COALESCE(SUM(jami_summa),0) as jami FROM sotuvlar WHERE date(sana)>=?",
            (oy_boshi,)).fetchone()
        # Xarajat (bugun)
        xb = conn.execute(
            "SELECT COALESCE(SUM(summa),0) as jami FROM xarajatlar WHERE date(sana)=?",
            (bugun,)).fetchone()
        # Xarajat (oy)
        xo = conn.execute(
            "SELECT COALESCE(SUM(summa),0) as jami FROM xarajatlar WHERE date(sana)>=?",
            (oy_boshi,)).fetchone()
        # Jami qarz
        qarz = conn.execute(
            "SELECT COALESCE(SUM(qoldi),0) as jami, COUNT(*) as son FROM qarz_tarixi WHERE holat='ochiq'").fetchone()
        # Kechikkan
        kechikkan = conn.execute(
            "SELECT COUNT(*) as son FROM qarz_tarixi WHERE holat='ochiq' AND muddat IS NOT NULL AND muddat<?",
            (bugun,)).fetchone()

        def fmt(n): return f"{int(n):,}".replace(',', ' ')

        conn.close()
        sana = datetime.now().strftime('%d.%m.%Y %H:%M')
        return (
            f"Moliyaviy hisobot\n"
            f"{sana}\n"
            f"========================\n"
            f"BUGUN:\n"
            f"  Sotuvlar: {b['son']} ta\n"
            f"  Daromad:  {fmt(b['jami'])} som\n"
            f"  Xarajat:  {fmt(xb['jami'])} som\n"
            f"  Foyda:    {fmt(b['jami'] - xb['jami'])} som\n"
            f"------------------------\n"
            f"OY ({datetime.now().strftime('%B')}):\n"
            f"  Sotuvlar: {o['son']} ta\n"
            f"  Daromad:  {fmt(o['jami'])} som\n"
            f"  Xarajat:  {fmt(xo['jami'])} som\n"
            f"  Foyda:    {fmt(o['jami'] - xo['jami'])} som\n"
            f"------------------------\n"
            f"QARZLAR:\n"
            f"  Ochiq: {qarz['son']} ta\n"
            f"  Jami: {fmt(qarz['jami'])} som\n"
            + (f"  Kechikkan: {kechikkan['son']} ta\n" if kechikkan['son'] > 0 else "")
            + f"========================\n"
            f"Qurilish Dokoni"
        )
    except Exception as e:
        return f"Xato: {e}"


def ombor_hisoboti_matn():
    """Ombor qoldig'i holati"""
    try:
        conn = get_db()
        # Jami mahsulotlar
        jami = conn.execute(
            "SELECT COUNT(*) as son, COALESCE(SUM(miqdor*kelish_narxi),0) as qiymat FROM mahsulotlar WHERE faol=1").fetchone()
        # Kam qolganlar
        kam = conn.execute(
            "SELECT COUNT(*) as son FROM mahsulotlar WHERE faol=1 AND miqdor<=min_miqdor AND miqdor>0").fetchone()
        # Tugaganlar
        tugagan = conn.execute(
            "SELECT COUNT(*) as son FROM mahsulotlar WHERE faol=1 AND miqdor<=0").fetchone()
        # Top 5 kam qolgan
        kam_list = conn.execute(
            "SELECT nomi, miqdor, birlik, min_miqdor FROM mahsulotlar "
            "WHERE faol=1 AND miqdor<=min_miqdor ORDER BY miqdor ASC LIMIT 5").fetchall()
        # Bugun sotilgan
        bugun = datetime.now().strftime('%Y-%m-%d')
        bugun_sotuv = conn.execute("""
            SELECT COUNT(DISTINCT st.mahsulot_id) as son, COALESCE(SUM(st.miqdor),0) as miqdor
            FROM sotuv_tafsilotlari st JOIN sotuvlar s ON st.sotuv_id=s.id
            WHERE date(s.sana)=?""", (bugun,)).fetchone()

        def fmt(n): return f"{int(n):,}".replace(',', ' ')

        conn.close()
        sana = datetime.now().strftime('%d.%m.%Y %H:%M')

        kam_matn = ''
        if kam_list:
            kam_matn = '\nKAM QOLGANLAR:\n'
            for m in kam_list:
                kam_matn += f"  {m['nomi']}: {m['miqdor']} {m['birlik']}\n"

        return (
            f"Ombor hisoboti\n"
            f"{sana}\n"
            f"========================\n"
            f"Jami mahsulot: {jami['son']} tur\n"
            f"Ombor qiymati: {fmt(jami['qiymat'])} som\n"
            f"------------------------\n"
            f"Kam qolgan: {kam['son']} ta\n"
            f"Tugagan:    {tugagan['son']} ta\n"
            f"Bugun sotildi: {bugun_sotuv['son']} tur\n"
            + kam_matn
            + f"========================\n"
            f"Qurilish Dokoni"
        )
    except Exception as e:
        return f"Xato: {e}"


def qarzlar_matn():
    """Ochiq qarzlar ro'yxati"""
    try:
        conn = get_db()
        bugun = datetime.now().strftime('%Y-%m-%d')
        qarzlar = conn.execute("""
            SELECT q.*, m.ism||' '||COALESCE(m.familiya,'') as mijoz_ismi,
            CASE WHEN q.muddat IS NULL THEN 'muddatsiz'
                 WHEN q.muddat < ? THEN 'kechikkan'
                 WHEN q.muddat = ? THEN 'bugun'
                 ELSE 'normal' END as status
            FROM qarz_tarixi q JOIN mijozlar m ON q.mijoz_id=m.id
            WHERE q.holat='ochiq'
            ORDER BY COALESCE(q.muddat,'9999') ASC LIMIT 20
        """, (bugun, bugun)).fetchall()
        conn.close()

        def fmt(n): return f"{int(n):,}".replace(',', ' ')

        if not qarzlar:
            return "Ochiq qarz yoq ✅"

        jami = sum(q['qoldi'] or 0 for q in qarzlar)
        matn = (
            f"Qarzlar ({len(qarzlar)} ta)\n"
            f"Jami: {fmt(jami)} som\n"
            f"========================\n"
        )
        for q in qarzlar:
            status = '❗' if q['status']=='kechikkan' else '🔴' if q['status']=='bugun' else '📋'
            muddat = q['muddat'] or 'muddatsiz'
            matn += f"{status} {q['mijoz_ismi']}\n   {fmt(q['qoldi'])} som | {muddat}\n"
        return matn
    except Exception as e:
        return f"Xato: {e}"


def bugun_matn():
    """Bugungi kun qisqa hisoboti"""
    try:
        conn = get_db()
        bugun = datetime.now().strftime('%Y-%m-%d')
        s = conn.execute(
            "SELECT COUNT(*) as son, COALESCE(SUM(jami_summa),0) as jami FROM sotuvlar WHERE date(sana)=?",
            (bugun,)).fetchone()
        x = conn.execute(
            "SELECT COALESCE(SUM(summa),0) as jami FROM xarajatlar WHERE date(sana)=?",
            (bugun,)).fetchone()
        q = conn.execute(
            "SELECT COALESCE(SUM(jami_summa),0) as jami FROM qaytarishlar WHERE date(sana)=?",
            (bugun,)).fetchone()
        # Top 3
        top = conn.execute("""
            SELECT m.nomi, SUM(st.miqdor) as miqdor, SUM(st.jami) as jami, m.birlik
            FROM sotuv_tafsilotlari st JOIN mahsulotlar m ON st.mahsulot_id=m.id
            JOIN sotuvlar s ON st.sotuv_id=s.id
            WHERE date(s.sana)=? GROUP BY m.id ORDER BY jami DESC LIMIT 3
        """, (bugun,)).fetchall()
        conn.close()

        def fmt(n): return f"{int(n):,}".replace(',', ' ')
        sana = datetime.now().strftime('%d.%m.%Y %H:%M')
        top_matn = ''
        if top:
            top_matn = 'Top mahsulotlar:\n'
            for i,t in enumerate(top,1):
                top_matn += f"  {i}. {t['nomi']} - {fmt(t['jami'])} som\n"

        return (
            f"Bugun - {sana}\n"
            f"========================\n"
            f"Sotuvlar: {s['son']} ta\n"
            f"Daromad:  {fmt(s['jami'])} som\n"
            f"Qaytarish: {fmt(q['jami'])} som\n"
            f"Xarajat:  {fmt(x['jami'])} som\n"
            f"Foyda:    {fmt(s['jami'] - x['jami'])} som\n"
            + (f"------------------------\n" + top_matn if top_matn else "")
            + f"========================"
        )
    except Exception as e:
        return f"Xato: {e}"


def telegram_polling_ishga_tushir():
    """Telegram long polling — xabarlarni tinglash"""
    import urllib.request, urllib.error

    print("🤖 Telegram bot polling ishga tushdi")
    offset = 0

    while True:
        try:
            tg = telegram_sozlamalarni_ol()
            if not tg:
                time.sleep(30); continue

            token = tg['token'].strip()
            url = f"https://api.telegram.org/bot{token}/getUpdates?offset={offset}&timeout=25&allowed_updates=[\"message\",\"callback_query\"]"

            req = urllib.request.Request(url)
            with urllib.request.urlopen(req, timeout=30) as r:
                result = json.loads(r.read().decode('utf-8'))

            if not result.get('ok'):
                time.sleep(10); continue

            for update in result.get('result', []):
                offset = update['update_id'] + 1

                # /start yoki matn xabari
                if 'message' in update:
                    msg = update['message']
                    chat_id = str(msg['chat']['id'])
                    matn = msg.get('text', '')

                    # Faqat botga ulangan chat ga javob
                    if chat_id != str(tg['chat_id']).strip():
                        # Yangi chat_id bo'lsa ham qabul qil
                        pass

                    if matn in ('/start', '/menu', 'menu'):
                        telegram_yuborish(token, chat_id,
                            "Qurilish Dokoni boshqaruvi\nQuyidagi hisobotlardan birini tanlang:",
                            asosiy_menyu_keyboard())

                # Inline tugma bosildi
                elif 'callback_query' in update:
                    cq = update['callback_query']
                    chat_id = str(cq['message']['chat']['id'])
                    data = cq.get('data', '')
                    cq_id = cq['id']

                    # Callback ga javob (animatsiyani to'xtatish)
                    telegram_callback_javob(token, cq_id)

                    if data == 'moliya':
                        matn = moliya_hisoboti_matn()
                        telegram_yuborish(token, chat_id, matn, asosiy_menyu_keyboard())
                    elif data == 'ombor':
                        matn = ombor_hisoboti_matn()
                        telegram_yuborish(token, chat_id, matn, asosiy_menyu_keyboard())
                    elif data == 'qarzlar':
                        matn = qarzlar_matn()
                        telegram_yuborish(token, chat_id, matn, asosiy_menyu_keyboard())
                    elif data == 'bugun':
                        matn = bugun_matn()
                        telegram_yuborish(token, chat_id, matn, asosiy_menyu_keyboard())

        except urllib.error.URLError:
            time.sleep(15)
        except Exception as e:
            print(f"Polling xato: {e}")
            time.sleep(10)


def telegram_sozlamalarni_ol():
    """Telegram sozlamalarini DB dan olish"""
    try:
        conn = get_db()
        row = conn.execute("SELECT * FROM integratsiya_sozlamalar WHERE tur='telegram' AND faol=1").fetchone()
        conn.close()
        if not row: return None
        soz = json.loads(row['sozlamalar'] or '{}')
        return {'token': row['token'], 'chat_id': row['chat_id'], 'sozlamalar': soz}
    except: return None


def sms_yuborish(provayder, login, token, sender, telefon, matn):
    """SMS yuborish — Eskiz, PlayMobile, Infobip"""
    import urllib.request, urllib.parse
    try:
        tel = telefon.replace('+','').replace(' ','').replace('-','')
        if provayder == 'eskiz':
            # Eskiz.uz API
            auth = f"{login}:{token}"
            import base64
            b64 = base64.b64encode(auth.encode()).decode()
            payload = json.dumps({
                'mobile_phone': tel,
                'message': matn,
                'from': sender or 'DOKON',
                'callback_url': ''
            }).encode('utf-8')
            req = urllib.request.Request(
                'https://notify.eskiz.uz/api/message/sms/send',
                data=payload,
                headers={
                    'Content-Type': 'application/json',
                    'Authorization': f'Bearer {token}'
                }
            )
            with urllib.request.urlopen(req, timeout=15) as r:
                result = json.loads(r.read().decode('utf-8'))
                if result.get('status') == 'waiting' or result.get('id'):
                    return {'muvaffaqiyat': True}
                return {'xato': result.get('message', 'Xato')}

        elif provayder == 'playmobile':
            # PlayMobile API
            payload = json.dumps({
                'messages': [{
                    'recipient': tel,
                    'message-id': f'msg_{int(datetime.now().timestamp())}',
                    'sms': {'originator': sender or 'DOKON', 'content': {'text': matn}}
                }]
            }).encode('utf-8')
            import base64
            b64 = base64.b64encode(f"{login}:{token}".encode()).decode()
            req = urllib.request.Request(
                'https://send.smsgateway.kz/sms/json',
                data=payload,
                headers={
                    'Content-Type': 'application/json',
                    'Authorization': f'Basic {b64}'
                }
            )
            with urllib.request.urlopen(req, timeout=15) as r:
                result = json.loads(r.read().decode('utf-8'))
                return {'muvaffaqiyat': True}

        elif provayder == 'infobip':
            payload = json.dumps({
                'messages': [{
                    'destinations': [{'to': tel}],
                    'from': sender or 'InfoSMS',
                    'text': matn
                }]
            }).encode('utf-8')
            req = urllib.request.Request(
                f'https://api.infobip.com/sms/2/text/advanced',
                data=payload,
                headers={
                    'Content-Type': 'application/json',
                    'Authorization': f'App {token}'
                }
            )
            with urllib.request.urlopen(req, timeout=15) as r:
                result = json.loads(r.read().decode('utf-8'))
                return {'muvaffaqiyat': True}

        return {'xato': 'Noto\'g\'ri provayder'}
    except Exception as e:
        return {'xato': str(e)}


def tg_yuborish_bg(matn):
    """Telegram ga background thread orqali xabar yuborish"""
    def _():
        try:
            tg = telegram_sozlamalarni_ol()
            if not tg: return
            telegram_yuborish(tg['token'], tg['chat_id'], matn)
        except Exception as e:
            print(f"TG xato: {e}")
    threading.Thread(target=_, daemon=True).start()


def telegram_sotuv_bildirishnoma(sotuv_id, chek_raqam, kassir_ismi, jami_summa, tolov_turi, mijoz_ismi=''):
    """Har sotuv bo'lganda Telegram ga yuborish (background thread)"""
    def _yuborish():
        try:
            tg = telegram_sozlamalarni_ol()
            if not tg: return
            if tg['sozlamalar'].get('har_sotuv') == False: return
            tolov_icon = 'Naqd' if tolov_turi == 'naqd' else 'Karta' if tolov_turi == 'karta' else 'Qarz'
            summa_format = f"{int(jami_summa):,}".replace(',', ' ')
            matn = (
                f"Yangi sotuv!\n"
                f"Chek: {chek_raqam}\n"
                f"Summa: {summa_format} so'm\n"
                f"Tolov: {tolov_icon}\n"
                f"Kassir: {kassir_ismi}\n"
                + (f"Mijoz: {mijoz_ismi}\n" if mijoz_ismi else "")
                + f"Vaqt: {datetime.now().strftime('%H:%M:%S')}"
            )
            telegram_yuborish(tg['token'], tg['chat_id'], matn)
        except Exception as e:
            print(f"Telegram sotuv xato: {e}")
    threading.Thread(target=_yuborish, daemon=True).start()


def telegram_kunlik_hisobot_yuborish(kun=None):
    """Kunlik hisobot Telegram ga yuborish"""
    try:
        tg = telegram_sozlamalarni_ol()
        if not tg: return
        if not tg['sozlamalar'].get('kunlik_avtom'): return
        if not kun:
            kun = datetime.now().strftime('%Y-%m-%d')
        conn = get_db()
        js = conn.execute("SELECT COUNT(*) as son, COALESCE(SUM(jami_summa),0) as jami FROM sotuvlar WHERE date(sana)=?", (kun,)).fetchone()
        jx = conn.execute("SELECT COALESCE(SUM(summa),0) as jami FROM xarajatlar WHERE date(sana)=?", (kun,)).fetchone()
        jq = conn.execute("SELECT COUNT(*) as son, COALESCE(SUM(jami_summa),0) as jami FROM qaytarishlar WHERE date(sana)=?", (kun,)).fetchone()
        # Foyda
        foyda_row = conn.execute("""
            SELECT COALESCE(SUM(st.jami) - SUM(st.miqdor * m.kelish_narxi), 0) as foyda
            FROM sotuv_tafsilotlari st
            JOIN mahsulotlar m ON st.mahsulot_id = m.id
            JOIN sotuvlar s ON st.sotuv_id = s.id
            WHERE date(s.sana) = ?
        """, (kun,)).fetchone()
        # Top 3 mahsulot
        top = conn.execute("""
            SELECT m.nomi, SUM(st.miqdor) as miqdor, SUM(st.jami) as jami
            FROM sotuv_tafsilotlari st
            JOIN mahsulotlar m ON st.mahsulot_id = m.id
            JOIN sotuvlar s ON st.sotuv_id = s.id
            WHERE date(s.sana) = ?
            GROUP BY m.id ORDER BY jami DESC LIMIT 3
        """, (kun,)).fetchall()
        # Kechikkan qarzlar
        bugun = datetime.now().strftime('%Y-%m-%d')
        kechikkan = conn.execute("""
            SELECT COUNT(*) as son, COALESCE(SUM(qoldi),0) as jami
            FROM qarz_tarixi WHERE holat='ochiq' AND muddat IS NOT NULL AND muddat < ?
        """, (bugun,)).fetchone()
        conn.close()

        foyda = foyda_row['foyda'] if foyda_row else 0
        sof_foyda = foyda - (jx['jami'] if jx else 0)
        kun_uz = datetime.strptime(kun, '%Y-%m-%d').strftime('%d.%m.%Y')

        def fmt(n):
            return f"{int(n):,}".replace(',', ' ')

        top_matn = ''
        if top:
            top_matn = '\nTop mahsulotlar:\n'
            for i, t in enumerate(top, 1):
                top_matn += f"  {i}. {t['nomi']} - {fmt(t['jami'])} som\n"

        kechikkan_matn = ''
        if kechikkan and kechikkan['son'] > 0:
            kechikkan_matn = f"\nKechikkan qarzlar: {kechikkan['son']} ta ({fmt(kechikkan['jami'])} som)\n"

        matn = (
            f"Kunlik hisobot - {kun_uz}\n"
            f"========================\n"
            f"Sotuvlar: {js['son']} ta\n"
            f"Daromad: {fmt(js['jami'])} som\n"
            f"Qaytarish: {jq['son']} ta ({fmt(jq['jami'])} som)\n"
            f"Xarajat: {fmt(jx['jami'])} som\n"
            f"------------------------\n"
            f"Sof foyda: {fmt(sof_foyda)} som\n"
            + top_matn
            + kechikkan_matn
            + f"========================\n"
            f"Qurilish Dokoni"
        )
        telegram_yuborish(tg['token'], tg['chat_id'], matn)
    except Exception as e:
        print(f"Kunlik hisobot xato: {e}")


def kunlik_hisobot_scheduler():
    """Har kuni sozlamadagi vaqtda KECHA ning hisobotini yuborish"""
    print("⏰ Kunlik hisobot scheduler ishga tushdi")
    _oxirgi_yuborilgan = [None]

    while True:
        try:
            hozir = datetime.now()
            bugun_kun = hozir.strftime('%Y-%m-%d')
            soat = hozir.hour
            minut = hozir.minute

            # Sozlamalardan hisobot vaqtini olish
            tg = telegram_sozlamalarni_ol()
            hisobot_soat = 8  # default: ertalab 08:00 da kechagi hisobot
            if tg and tg['sozlamalar'].get('hisobot_soat') is not None:
                try: hisobot_soat = int(tg['sozlamalar']['hisobot_soat'])
                except: pass

            # Belgilangan vaqtda yuborish
            if soat == hisobot_soat and minut == 0 and _oxirgi_yuborilgan[0] != bugun_kun:
                _oxirgi_yuborilgan[0] = bugun_kun
                # KECHA ning sanasini hisoblash
                from datetime import timedelta
                kecha = (hozir - timedelta(days=1)).strftime('%Y-%m-%d')
                telegram_kunlik_hisobot_yuborish(kecha)
                print(f"📊 Kecha ({kecha}) hisoboti yuborildi: soat {hisobot_soat}:00")

            time.sleep(60)
        except Exception as e:
            print(f"Scheduler xato: {e}")
            time.sleep(60)

MIME = {
    '.html':'text/html','.css':'text/css','.js':'application/javascript',
    '.json':'application/json','.png':'image/png','.ico':'image/x-icon',
    '.svg':'image/svg+xml','.woff2':'font/woff2','.woff':'font/woff'
}

class Handler(BaseHTTPRequestHandler):
    def log_message(self, fmt, *args): pass

    def send_json(self, data, code=200):
        body = json.dumps(data, ensure_ascii=False).encode('utf-8')
        self.send_response(code)
        self.send_header('Content-Type','application/json; charset=utf-8')
        self.send_header('Content-Length', len(body))
        self.send_header('Access-Control-Allow-Origin','*')
        self.end_headers()
        self.wfile.write(body)

    def send_error_json(self, msg, code=400):
        self.send_json({'xato': msg}, code)

    def read_body(self):
        length = int(self.headers.get('Content-Length', 0))
        return json.loads(self.rfile.read(length)) if length else {}

    def serve_file(self, path):
        if not os.path.exists(path):
            path = os.path.join(FRONTEND, 'index.html')
        ext = os.path.splitext(path)[1]
        mime = MIME.get(ext, 'text/plain')
        try:
            with open(path, 'rb') as f:
                data = f.read()
            self.send_response(200)
            self.send_header('Content-Type', mime)
            self.send_header('Content-Length', len(data))
            # JS va HTML fayllarini cache qilmasin — yangi versiya darhol yuklansin
            if ext in ('.js', '.html', '.css'):
                self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
                self.send_header('Pragma', 'no-cache')
                self.send_header('Expires', '0')
            self.end_headers()
            self.wfile.write(data)
        except:
            self.send_response(404)
            self.end_headers()

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin','*')
        self.send_header('Access-Control-Allow-Methods','GET,POST,PUT,DELETE,OPTIONS')
        self.send_header('Access-Control-Allow-Headers','Content-Type')
        self.end_headers()

    # ===== AI FUNKSIYALAR =====
    def groq_so_rov(self, messages, model='llama3-8b-8192'):
        """OpenAI yoki Groq API ga so'rov yuborish"""
        import urllib.request

        # OpenAI ni sinab ko'rish
        openai_key = os.environ.get('OPENAI_API_KEY', '')
        if openai_key:
            try:
                data = json.dumps({
                    'model': 'gpt-4o-mini',
                    'messages': messages,
                    'max_tokens': 1024,
                    'temperature': 0.7
                }).encode('utf-8')
                req = urllib.request.Request(
                    'https://api.openai.com/v1/chat/completions',
                    data=data,
                    headers={
                        'Authorization': f'Bearer {openai_key}',
                        'Content-Type': 'application/json'
                    }
                )
                with urllib.request.urlopen(req, timeout=20) as r:
                    result = json.loads(r.read().decode('utf-8'))
                    return result['choices'][0]['message']['content']
            except Exception as e:
                pass  # Groq ga o'tamiz

        # Groq
        groq_key = os.environ.get('GROQ_API_KEY', '')
        if not groq_key:
            return "⚠️ API key sozlanmagan!"
        data = json.dumps({
            'model': 'llama3-8b-8192',
            'messages': messages,
            'max_tokens': 1024,
            'temperature': 0.7
        }).encode('utf-8')
        req = urllib.request.Request(
            'https://api.groq.com/openai/v1/chat/completions',
            data=data,
            headers={
                'Authorization': f'Bearer {groq_key}',
                'Content-Type': 'application/json'
            }
        )
        try:
            with urllib.request.urlopen(req, timeout=15) as r:
                result = json.loads(r.read().decode('utf-8'))
                return result['choices'][0]['message']['content']
        except Exception as e:
            return f"AI xato: {str(e)}"
        data = json.dumps({
            'model': model,
            'messages': messages,
            'max_tokens': 1024,
            'temperature': 0.7
        }).encode('utf-8')
        req = urllib.request.Request(
            'https://api.groq.com/openai/v1/chat/completions',
            data=data,
            headers={
                'Authorization': f'Bearer {GROQ_KEY}',
                'Content-Type': 'application/json'
            }
        )
        try:
            with urllib.request.urlopen(req, timeout=15) as r:
                result = json.loads(r.read().decode('utf-8'))
                return result['choices'][0]['message']['content']
        except Exception as e:
            return f"AI xato: {str(e)}"

    def ai_context_ol(self):
        """Dokon haqida AI uchun kontekst"""
        conn = get_db()
        try:
            bugun = datetime.now().strftime('%Y-%m-%d')
            oy = datetime.now().strftime('%Y-%m')
            bugun_sotuv = conn.execute("SELECT COUNT(*) as son, COALESCE(SUM(jami_summa),0) as jami FROM sotuvlar WHERE date(sana)=?", (bugun,)).fetchone()
            oy_sotuv = conn.execute("SELECT COUNT(*) as son, COALESCE(SUM(jami_summa),0) as jami FROM sotuvlar WHERE strftime('%Y-%m',sana)=?", (oy,)).fetchone()
            mahsulotlar_soni = conn.execute("SELECT COUNT(*) as son FROM mahsulotlar WHERE faol=1").fetchone()
            kam_mahsulotlar = conn.execute("SELECT nomi, miqdor, min_miqdor, birlik FROM mahsulotlar WHERE miqdor<=min_miqdor AND faol=1 LIMIT 5").fetchall()
            top_mahsulotlar = conn.execute("""SELECT m.nomi, SUM(st.miqdor) as jami_miqdor, SUM(st.jami) as jami_summa
                FROM sotuv_tafsilotlari st JOIN mahsulotlar m ON st.mahsulot_id=m.id
                JOIN sotuvlar s ON st.sotuv_id=s.id
                WHERE strftime('%Y-%m',s.sana)=? GROUP BY m.id ORDER BY jami_summa DESC LIMIT 5""", (oy,)).fetchall()
            mijozlar_soni = conn.execute("SELECT COUNT(*) as son FROM mijozlar WHERE faol=1").fetchone()
            qarz_jami = conn.execute("SELECT COALESCE(SUM(qarz),0) as jami FROM mijozlar WHERE qarz>0").fetchone()

            kontekst = f"""Sen qurilish mollari do'koni uchun AI yordamchisan. O'zbek tilida javob ber.

DOKON HOLATI ({datetime.now().strftime('%d.%m.%Y')}):
- Bugun sotuvlar: {bugun_sotuv['son']} ta, {bugun_sotuv['jami']:,.0f} so'm
- Oylik sotuvlar: {oy_sotuv['son']} ta, {oy_sotuv['jami']:,.0f} so'm
- Jami mahsulotlar: {mahsulotlar_soni['son']} ta
- Mijozlar: {mijozlar_soni['son']} ta
- Jami qarzlar: {qarz_jami['jami']:,.0f} so'm
"""
            if kam_mahsulotlar:
                kontekst += "\nKAM QOLGAN MAHSULOTLAR:\n"
                for m in kam_mahsulotlar:
                    kontekst += f"- {m['nomi']}: {m['miqdor']} {m['birlik']} (min: {m['min_miqdor']})\n"

            if top_mahsulotlar:
                kontekst += "\nBU OY ENG KO'P SOTILGAN:\n"
                for m in top_mahsulotlar:
                    kontekst += f"- {m['nomi']}: {m['jami_miqdor']} dona, {m['jami_summa']:,.0f} so'm\n"

            return kontekst
        finally:
            conn.close()

    def ai_chat(self, body):
        """AI chatbot"""
        savol = body.get('savol', '')
        if not savol:
            return self.send_error_json('Savol kiritilmagan!')
        kontekst = self.ai_context_ol()
        messages = [
            {'role': 'system', 'content': kontekst},
            {'role': 'user', 'content': savol}
        ]
        javob = self.groq_so_rov(messages)
        return self.send_json({'javob': javob})

    def ai_tahlil(self):
        """AI sotuv tahlili"""
        conn = get_db()
        try:
            oy = datetime.now().strftime('%Y-%m')
            oldingi_oy = datetime.now().replace(month=datetime.now().month-1 if datetime.now().month > 1 else 12).strftime('%Y-%m')
            joriy = conn.execute("SELECT COALESCE(SUM(jami_summa),0) as jami, COUNT(*) as son FROM sotuvlar WHERE strftime('%Y-%m',sana)=?", (oy,)).fetchone()
            oldingi = conn.execute("SELECT COALESCE(SUM(jami_summa),0) as jami, COUNT(*) as son FROM sotuvlar WHERE strftime('%Y-%m',sana)=?", (oldingi_oy,)).fetchone()
            top5 = conn.execute("""SELECT m.nomi, SUM(st.jami) as summa, SUM(st.miqdor) as miqdor, m.birlik
                FROM sotuv_tafsilotlari st JOIN mahsulotlar m ON st.mahsulot_id=m.id
                JOIN sotuvlar s ON st.sotuv_id=s.id
                WHERE strftime('%Y-%m',s.sana)=? GROUP BY m.id ORDER BY summa DESC LIMIT 5""", (oy,)).fetchall()
            kam5 = conn.execute("SELECT nomi, miqdor, min_miqdor, birlik FROM mahsulotlar WHERE miqdor<=min_miqdor AND faol=1 LIMIT 5").fetchall()

            malumo = f"""Qurilish do'koni sotuv tahlili:

Joriy oy ({oy}): {joriy['son']} sotuv, {joriy['jami']:,.0f} so'm
Oldingi oy ({oldingi_oy}): {oldingi['son']} sotuv, {oldingi['jami']:,.0f} so'm
O'zgarish: {((joriy['jami']-oldingi['jami'])/max(oldingi['jami'],1)*100):+.1f}%

Top 5 mahsulot: {', '.join([f"{m['nomi']} ({m['summa']:,.0f} so'm)" for m in top5])}
Kam qolgan: {', '.join([f"{m['nomi']} ({m['miqdor']} {m['birlik']})" for m in kam5])}

Batafsil tahlil va tavsiya ber. O'zbek tilida."""

            messages = [
                {'role': 'system', 'content': "Sen professional do'kon tahlilchisan. O'zbek tilida qisqa va aniq javob ber."},
                {'role': 'user', 'content': malumo}
            ]
            javob = self.groq_so_rov(messages, model='llama3-70b-8192')
            return self.send_json({'javob': javob, 'malumot': {
                'joriy_oy': dict(joriy), 'oldingi_oy': dict(oldingi),
                'top5': [dict(m) for m in top5], 'kam5': [dict(m) for m in kam5]
            }})
        finally:
            conn.close()

    def ai_bashorat(self):
        """AI keyingi oy bashorati"""
        conn = get_db()
        try:
            # Oxirgi 3 oy ma'lumoti
            oylar = []
            for i in range(3, 0, -1):
                d = datetime.now()
                oy_num = d.month - i
                yil = d.year
                if oy_num <= 0:
                    oy_num += 12
                    yil -= 1
                oy_str = f"{yil}-{str(oy_num).zfill(2)}"
                r = conn.execute("SELECT COALESCE(SUM(jami_summa),0) as jami, COUNT(*) as son FROM sotuvlar WHERE strftime('%Y-%m',sana)=?", (oy_str,)).fetchone()
                oylar.append({'oy': oy_str, 'jami': r['jami'], 'son': r['son']})

            top_mahsulotlar = conn.execute("""SELECT m.nomi, SUM(st.miqdor) as miqdor, m.birlik, m.min_miqdor, m.miqdor as qoldi
                FROM sotuv_tafsilotlari st JOIN mahsulotlar m ON st.mahsulot_id=m.id
                JOIN sotuvlar s ON st.sotuv_id=s.id
                WHERE s.sana >= date('now','-3 months')
                GROUP BY m.id ORDER BY miqdor DESC LIMIT 10""", ).fetchall()

            malumo = f"""Qurilish do'koni oxirgi 3 oy ma'lumoti:
{chr(10).join([f"- {o['oy']}: {o['son']} sotuv, {o['jami']:,.0f} so'm" for o in oylar])}

Eng ko'p sotilgan mahsulotlar:
{chr(10).join([f"- {m['nomi']}: {m['miqdor']} {m['birlik']} sotilgan, qoldi: {m['qoldi']}" for m in top_mahsulotlar])}

Keyingi oy uchun:
1. Sotuv hajmi bashorati
2. Zaxira qilish kerak bo'lgan mahsulotlar
3. Tavsiyalar
O'zbek tilida batafsil javob ber."""

            messages = [
                {'role': 'system', 'content': "Sen qurilish mollari do'koni uchun AI tahlilchi va bashoratchi san. O'zbek tilida professional javob ber."},
                {'role': 'user', 'content': malumo}
            ]
            javob = self.groq_so_rov(messages, model='llama3-70b-8192')
            return self.send_json({'javob': javob, 'oylar': oylar})
        finally:
            conn.close()

    def do_GET(self):
        parsed = urlparse(self.path)
        path = parsed.path
        qs = parse_qs(parsed.query)
        def qp(k): return qs.get(k, [None])[0]

        if not path.startswith('/api/'):
            fp = os.path.join(FRONTEND, path.lstrip('/')) if path != '/' else os.path.join(FRONTEND,'index.html')
            return self.serve_file(fp)

        conn = get_db()
        try:
            # FOYDALANUVCHILAR
            if path == '/api/foydalanuvchilar':
                rows = conn.execute("SELECT id,ism,familiya,username,rol,telefon,yaratilgan,faol,ruxsatlar FROM foydalanuvchilar").fetchall()
                return self.send_json(rows_to_list(rows))

            # MIJOZLAR
            if path == '/api/mijozlar':
                q = qp('qidiruv')
                bugun = datetime.now().strftime('%Y-%m-%d')
                if q:
                    rows = conn.execute("SELECT * FROM mijozlar WHERE faol=1 AND (ism LIKE ? OR familiya LIKE ? OR telefon LIKE ?) ORDER BY ism", (f'%{q}%',f'%{q}%',f'%{q}%')).fetchall()
                else:
                    rows = conn.execute("SELECT * FROM mijozlar WHERE faol=1 ORDER BY ism").fetchall()
                # Har bir mijoz uchun ochiq qarz muddati ma'lumotini qo'shish
                result = []
                for row in rows:
                    d = row_to_dict(row)
                    # Eng yaqin ochiq qarz (kechikkan yoki yaqin)
                    qarz_row = conn.execute("""
                        SELECT muddat,
                            CASE
                                WHEN muddat IS NULL THEN 'muddatsiz'
                                WHEN date(muddat) < ? THEN 'kechikkan'
                                WHEN date(muddat) = ? THEN 'bugun'
                                WHEN julianday(muddat) - julianday(?) <= 3 THEN 'yaqin'
                                ELSE 'normal'
                            END as qarz_status,
                            CAST(julianday(?) - julianday(muddat) AS INTEGER) as kechikkan_kun,
                            COUNT(*) as ochiq_qarz_soni,
                            SUM(qoldi) as qarz_qoldi
                        FROM qarz_tarixi
                        WHERE mijoz_id=? AND holat='ochiq'
                    """, (bugun, bugun, bugun, bugun, row['id'])).fetchone()
                    if qarz_row and qarz_row['ochiq_qarz_soni']:
                        d['ochiq_qarz_soni'] = qarz_row['ochiq_qarz_soni']
                        d['qarz_qoldi'] = qarz_row['qarz_qoldi'] or 0
                        d['qarz_status'] = qarz_row['qarz_status']
                        d['qarz_muddat'] = qarz_row['muddat']
                        d['kechikkan_kun'] = max(0, qarz_row['kechikkan_kun'] or 0)
                    else:
                        d['ochiq_qarz_soni'] = 0
                        d['qarz_qoldi'] = 0
                        d['qarz_status'] = None
                        d['qarz_muddat'] = None
                        d['kechikkan_kun'] = 0
                    result.append(d)
                return self.send_json(result)

            m = re.match(r'^/api/mijozlar/(\d+)$', path)
            if m:
                row = conn.execute("SELECT * FROM mijozlar WHERE id=?", (m.group(1),)).fetchone()
                if not row: return self.send_error_json('Mijoz topilmadi', 404)
                sotuvlar = rows_to_list(conn.execute("SELECT s.*,f.ism||' '||f.familiya as kassir_ismi FROM sotuvlar s LEFT JOIN foydalanuvchilar f ON s.kassir_id=f.id WHERE s.mijoz_id=? ORDER BY s.sana DESC LIMIT 20", (m.group(1),)).fetchall())
                bugun = datetime.now().strftime('%Y-%m-%d')
                qarzlar = rows_to_list(conn.execute("""
                    SELECT q.*,
                        CASE
                            WHEN q.muddat IS NULL THEN 'muddatsiz'
                            WHEN date(q.muddat) < ? THEN 'kechikkan'
                            WHEN date(q.muddat) = ? THEN 'bugun'
                            WHEN julianday(q.muddat) - julianday(?) <= 3 THEN 'yaqin'
                            ELSE 'normal'
                        END as status,
                        CAST(julianday(?) - julianday(q.muddat) AS INTEGER) as kechikkan_kun
                    FROM qarz_tarixi q
                    WHERE q.mijoz_id=?
                    ORDER BY COALESCE(q.muddat,'9999') ASC, q.yaratilgan DESC
                """, (bugun, bugun, bugun, bugun, m.group(1))).fetchall())
                d = row_to_dict(row)
                d['sotuvlar'] = sotuvlar
                d['qarzlar'] = qarzlar
                return self.send_json(d)

            # KATEGORIYALAR
            if path == '/api/kategoriyalar':
                rows = conn.execute("SELECT * FROM kategoriyalar ORDER BY nomi").fetchall()
                return self.send_json(rows_to_list(rows))

            # BRENDLAR
            if path == '/api/brendlar':
                rows = conn.execute("SELECT * FROM brendlar ORDER BY nomi").fetchall()
                return self.send_json(rows_to_list(rows))

            # ETIKETKA SHABLONLARI
            if path == '/api/etiketka':
                rows = conn.execute("SELECT * FROM etiketka_shablonlar ORDER BY yaratilgan DESC").fetchall()
                return self.send_json(rows_to_list(rows))

            # MAHSULOT SHTRIX KODLARI (ko'p shtrix kod)
            if path == '/api/shtrix_kodlar':
                mahsulot_id = qp('mahsulot_id')
                if mahsulot_id:
                    rows = conn.execute(
                        "SELECT * FROM mahsulot_shtrix_kodlar WHERE mahsulot_id=? ORDER BY id",
                        (mahsulot_id,)).fetchall()
                else:
                    rows = conn.execute("SELECT * FROM mahsulot_shtrix_kodlar ORDER BY id").fetchall()
                return self.send_json(rows_to_list(rows))

            m_sk = re.match(r'^/api/mahsulotlar/(\d+)/shtrix_kodlar$', path)
            if m_sk:
                rows = conn.execute(
                    "SELECT * FROM mahsulot_shtrix_kodlar WHERE mahsulot_id=? ORDER BY id",
                    (m_sk.group(1),)).fetchall()
                return self.send_json(rows_to_list(rows))

            m = re.match(r'^/api/etiketka/(\d+)$', path)
            if m:
                row = conn.execute("SELECT * FROM etiketka_shablonlar WHERE id=?", (m.group(1),)).fetchone()
                if not row: return self.send_error_json('Shablon topilmadi', 404)
                return self.send_json(row_to_dict(row))

            m = re.match(r'^/api/brendlar/(\d+)$', path)
            if m:
                row = conn.execute("SELECT * FROM brendlar WHERE id=?", (m.group(1),)).fetchone()
                if not row: return self.send_error_json('Brend topilmadi', 404)
                mah = rows_to_list(conn.execute("SELECT m.*,k.nomi as kategoriya_nomi FROM mahsulotlar m LEFT JOIN kategoriyalar k ON m.kategoriya_id=k.id WHERE m.brend_id=? AND m.faol=1 ORDER BY m.nomi", (m.group(1),)).fetchall())
                d = row_to_dict(row); d['mahsulotlar'] = mah
                return self.send_json(d)

            # MAHSULOTLAR
            if path == '/api/mahsulotlar':
                sql = "SELECT m.*,k.nomi as kategoriya_nomi,b.nomi as brend_nomi FROM mahsulotlar m LEFT JOIN kategoriyalar k ON m.kategoriya_id=k.id LEFT JOIN brendlar b ON m.brend_id=b.id WHERE m.faol=1"
                params = []
                if qp('qidiruv'):
                    sql += " AND (m.nomi LIKE ? OR m.shtrix_kod LIKE ?)"; params += [f"%{qp('qidiruv')}%"]*2
                if qp('kategoriya'):
                    sql += " AND m.kategoriya_id=?"; params.append(qp('kategoriya'))
                if qp('kam_miqdor') == '1':
                    sql += " AND m.miqdor<=m.min_miqdor"
                # Kassada faqat sotuvda ko'rinadigan mahsulotlar
                if qp('kassa') == '1':
                    sql += " AND m.sotuvda_korinsin=1"
                sql += " ORDER BY m.nomi"
                return self.send_json(rows_to_list(conn.execute(sql, params).fetchall()))

            m = re.match(r'^/api/mahsulotlar/(\d+)$', path)
            if m:
                row = conn.execute("SELECT m.*,k.nomi as kategoriya_nomi FROM mahsulotlar m LEFT JOIN kategoriyalar k ON m.kategoriya_id=k.id WHERE m.id=?", (m.group(1),)).fetchone()
                if not row: return self.send_error_json('Mahsulot topilmadi', 404)
                return self.send_json(row_to_dict(row))

            m = re.match(r'^/api/qidiruv/(.+)$', path)
            if m:
                row = conn.execute("SELECT m.*,k.nomi as kategoriya_nomi FROM mahsulotlar m LEFT JOIN kategoriyalar k ON m.kategoriya_id=k.id WHERE m.shtrix_kod=? AND m.faol=1", (m.group(1),)).fetchone()
                if not row: return self.send_error_json('Mahsulot topilmadi', 404)
                return self.send_json(row_to_dict(row))

            # SOTUVLAR
            if path == '/api/sotuvlar':
                sql = "SELECT s.*,f.ism||' '||f.familiya as kassir_ismi, COALESCE(mj.ism||' '||COALESCE(mj.familiya,''),'') as mijoz_toliq_ismi FROM sotuvlar s LEFT JOIN foydalanuvchilar f ON s.kassir_id=f.id LEFT JOIN mijozlar mj ON s.mijoz_id=mj.id WHERE 1=1"
                params = []
                if qp('boshlanish'): sql += " AND date(s.sana)>=?"; params.append(qp('boshlanish'))
                if qp('tugash'): sql += " AND date(s.sana)<=?"; params.append(qp('tugash'))
                if qp('kassir_id'): sql += " AND s.kassir_id=?"; params.append(qp('kassir_id'))
                sql += " ORDER BY s.sana DESC"
                return self.send_json(rows_to_list(conn.execute(sql, params).fetchall()))

            m = re.match(r'^/api/sotuvlar/(\d+)$', path)
            if m:
                sotuv = conn.execute("SELECT s.*,f.ism||' '||f.familiya as kassir_ismi, COALESCE(mj.ism||' '||COALESCE(mj.familiya,''),'') as mijoz_toliq_ismi FROM sotuvlar s LEFT JOIN foydalanuvchilar f ON s.kassir_id=f.id LEFT JOIN mijozlar mj ON s.mijoz_id=mj.id WHERE s.id=?", (m.group(1),)).fetchone()
                if not sotuv: return self.send_error_json('Sotuv topilmadi', 404)
                taf = conn.execute("SELECT st.*,mah.nomi as mahsulot_nomi,mah.birlik FROM sotuv_tafsilotlari st JOIN mahsulotlar mah ON st.mahsulot_id=mah.id WHERE st.sotuv_id=?", (m.group(1),)).fetchall()
                d = row_to_dict(sotuv); d['tafsilotlar'] = rows_to_list(taf)
                return self.send_json(d)

            # OMBOR
            if path == '/api/ombor':
                sql = "SELECT o.*,mah.nomi as mahsulot_nomi,mah.birlik,f.ism||' '||f.familiya as xodim_ismi FROM ombor_kirim o JOIN mahsulotlar mah ON o.mahsulot_id=mah.id LEFT JOIN foydalanuvchilar f ON o.foydalanuvchi_id=f.id WHERE 1=1"
                params = []
                if qp('boshlanish'): sql += " AND date(o.sana)>=?"; params.append(qp('boshlanish'))
                if qp('tugash'): sql += " AND date(o.sana)<=?"; params.append(qp('tugash'))
                sql += " ORDER BY o.sana DESC"
                return self.send_json(rows_to_list(conn.execute(sql, params).fetchall()))

            # XARAJATLAR
            if path == '/api/xarajatlar':
                sql = "SELECT x.*,f.ism||' '||f.familiya as xodim_ismi FROM xarajatlar x LEFT JOIN foydalanuvchilar f ON x.foydalanuvchi_id=f.id WHERE 1=1"
                params = []
                if qp('boshlanish'): sql += " AND date(x.sana)>=?"; params.append(qp('boshlanish'))
                if qp('tugash'): sql += " AND date(x.sana)<=?"; params.append(qp('tugash'))
                sql += " ORDER BY x.sana DESC"
                return self.send_json(rows_to_list(conn.execute(sql, params).fetchall()))

            # HISOBOTLAR
            if path == '/api/hisobot/kunlik':
                kun = qp('sana') or datetime.now().strftime('%Y-%m-%d')
                sotuvlar = row_to_dict(conn.execute("SELECT COUNT(*) as son, COALESCE(SUM(jami_summa),0) as jami FROM sotuvlar WHERE date(sana)=?", (kun,)).fetchone())
                xarajatlar = row_to_dict(conn.execute("SELECT COALESCE(SUM(summa),0) as jami FROM xarajatlar WHERE date(sana)=?", (kun,)).fetchone())
                top = rows_to_list(conn.execute("SELECT mah.nomi,SUM(st.miqdor) as jami_miqdor,SUM(st.jami) as jami_summa FROM sotuv_tafsilotlari st JOIN mahsulotlar mah ON st.mahsulot_id=mah.id JOIN sotuvlar s ON st.sotuv_id=s.id WHERE date(s.sana)=? GROUP BY mah.id ORDER BY jami_summa DESC LIMIT 10", (kun,)).fetchall())
                return self.send_json({'kun':kun,'sotuvlar':sotuvlar,'xarajatlar':xarajatlar,'topMahsulotlar':top})

            if path == '/api/hisobot/oylik':
                y = qp('yil') or datetime.now().strftime('%Y')
                o = (qp('oy') or str(datetime.now().month)).zfill(2)
                ym = f"{y}-{o}"
                kunliklar = rows_to_list(conn.execute("SELECT date(sana) as kun,COUNT(*) as sotuvlar_soni,SUM(jami_summa) as jami FROM sotuvlar WHERE strftime('%Y-%m',sana)=? GROUP BY date(sana) ORDER BY kun", (ym,)).fetchall())
                jami = row_to_dict(conn.execute("SELECT COUNT(*) as son,COALESCE(SUM(jami_summa),0) as jami FROM sotuvlar WHERE strftime('%Y-%m',sana)=?", (ym,)).fetchone())
                xarajatlar = row_to_dict(conn.execute("SELECT COALESCE(SUM(summa),0) as jami FROM xarajatlar WHERE strftime('%Y-%m',sana)=?", (ym,)).fetchone())
                return self.send_json({'yil':y,'oy':o,'kunliklar':kunliklar,'jami':jami,'xarajatlar':xarajatlar})

            # QAYTARISHLAR
            if path == '/api/qaytarishlar':
                sql = """SELECT q.*,f.ism||' '||f.familiya as kassir_ismi,
                    mj.ism||' '||COALESCE(mj.familiya,'') as mijoz_ismi
                    FROM qaytarishlar q
                    LEFT JOIN foydalanuvchilar f ON q.kassir_id=f.id
                    LEFT JOIN mijozlar mj ON q.mijoz_id=mj.id WHERE 1=1"""
                params=[]
                if qp('boshlanish'): sql+=" AND date(q.sana)>=?"; params.append(qp('boshlanish'))
                if qp('tugash'): sql+=" AND date(q.sana)<=?"; params.append(qp('tugash'))
                sql+=" ORDER BY q.sana DESC"
                return self.send_json(rows_to_list(conn.execute(sql,params).fetchall()))

            m = re.match(r'^/api/qaytarishlar/(\d+)$', path)
            if m:
                row = conn.execute("SELECT * FROM qaytarishlar WHERE id=?", (m.group(1),)).fetchone()
                if not row: return self.send_error_json('Topilmadi',404)
                taf = rows_to_list(conn.execute("SELECT qt.*,mah.nomi as mahsulot_nomi,mah.birlik FROM qaytarish_tafsilotlari qt JOIN mahsulotlar mah ON qt.mahsulot_id=mah.id WHERE qt.qaytarish_id=?", (m.group(1),)).fetchall())
                d=row_to_dict(row); d['tafsilotlar']=taf
                return self.send_json(d)

            # HISOBOT - FOYDA
            if path == '/api/hisobot/foyda':
                bosh = qp('boshlanish') or datetime.now().strftime('%Y-%m-%d')
                tug  = qp('tugash')    or datetime.now().strftime('%Y-%m-%d')
                rows = rows_to_list(conn.execute("""
                    SELECT mah.nomi, mah.birlik, mah.kelish_narxi,
                        SUM(st.miqdor) as jami_miqdor,
                        SUM(st.jami) as jami_sotish,
                        SUM(st.miqdor * mah.kelish_narxi) as jami_kelish,
                        SUM(st.jami) - SUM(st.miqdor * mah.kelish_narxi) as foyda
                    FROM sotuv_tafsilotlari st
                    JOIN mahsulotlar mah ON st.mahsulot_id=mah.id
                    JOIN sotuvlar s ON st.sotuv_id=s.id
                    WHERE date(s.sana)>=? AND date(s.sana)<=?
                    GROUP BY mah.id ORDER BY foyda DESC
                """, (bosh, tug)).fetchall())
                jami_foyda = sum(r['foyda'] or 0 for r in rows)
                return self.send_json({'rows': rows, 'jami_foyda': jami_foyda, 'boshlanish': bosh, 'tugash': tug})

            # HISOBOT - QOLDIQ
            if path == '/api/hisobot/qoldiq':
                rows = rows_to_list(conn.execute("""
                    SELECT m.id, m.nomi, m.birlik, m.kelish_narxi, m.sotish_narxi,
                        m.miqdor, m.min_miqdor, m.sku, m.shtrix_kod,
                        m.brend_id, b.nomi as brend_nomi,
                        k.nomi as kategoriya_nomi,
                        m.miqdor * m.kelish_narxi as kelish_qiymati,
                        m.miqdor * m.sotish_narxi as sotish_qiymati
                    FROM mahsulotlar m
                    LEFT JOIN kategoriyalar k ON m.kategoriya_id=k.id
                    LEFT JOIN brendlar b ON m.brend_id=b.id
                    WHERE m.faol=1 ORDER BY m.nomi
                """).fetchall())
                return self.send_json(rows)

            # INTEGRATSIYA SOZLAMALARI
            if path == '/api/integratsiya':
                rows = conn.execute("SELECT * FROM integratsiya_sozlamalar").fetchall()
                return self.send_json(rows_to_list(rows))

            m_int = re.match(r'^/api/integratsiya/(\w+)$', path)
            if m_int:
                row = conn.execute("SELECT * FROM integratsiya_sozlamalar WHERE tur=?", (m_int.group(1),)).fetchone()
                return self.send_json(row_to_dict(row) if row else {})

            # INTEGRATSIYA SOZLAMALARI
            if path == '/api/integratsiya':
                rows = conn.execute("SELECT * FROM integratsiya_sozlamalar").fetchall()
                return self.send_json(rows_to_list(rows))

            m_int = re.match(r'^/api/integratsiya/(\w+)$', path)
            if m_int:
                row = conn.execute("SELECT * FROM integratsiya_sozlamalar WHERE tur=?", (m_int.group(1),)).fetchone()
                return self.send_json(row_to_dict(row) if row else {})

            # QARZ TARIXI (GET)
            if path == '/api/qarz_tarixi':
                bugun = datetime.now().strftime('%Y-%m-%d')
                mijoz_id = qp('mijoz_id')
                holat_f = qp('holat')
                sql = """SELECT q.*,
                    m.ism||' '||COALESCE(m.familiya,'') as mijoz_ismi,
                    m.telefon as mijoz_telefon,
                    CASE WHEN q.holat='tolandi' THEN 'tolandi'
                        WHEN q.muddat IS NULL THEN 'muddatsiz'
                        WHEN q.muddat < ? THEN 'kechikkan'
                        WHEN q.muddat = ? THEN 'bugun'
                        WHEN q.muddat <= date(?, '+3 days') THEN 'yaqin'
                        ELSE 'normal' END as status,
                    CASE WHEN q.muddat IS NOT NULL AND q.holat='ochiq'
                        THEN CAST(julianday(?) - julianday(q.muddat) AS INTEGER)
                        ELSE 0 END as kechikkan_kun
                    FROM qarz_tarixi q JOIN mijozlar m ON q.mijoz_id=m.id WHERE 1=1"""
                params = [bugun,bugun,bugun,bugun]
                if mijoz_id: sql += " AND q.mijoz_id=?"; params.append(mijoz_id)
                if holat_f == 'ochiq': sql += " AND q.holat='ochiq'"
                elif holat_f == 'kechikkan': sql += " AND q.holat='ochiq' AND q.muddat IS NOT NULL AND q.muddat<?"; params.append(bugun)
                sql += " ORDER BY COALESCE(q.muddat,'9999') ASC, q.yaratilgan DESC"
                return self.send_json(rows_to_list(conn.execute(sql,params).fetchall()))

            m_qarz = re.match(r'^/api/qarz_tarixi/(\d+)$', path)
            if m_qarz:
                row = conn.execute("SELECT q.*,m.ism||' '||COALESCE(m.familiya,'') as mijoz_ismi FROM qarz_tarixi q JOIN mijozlar m ON q.mijoz_id=m.id WHERE q.id=?", (m_qarz.group(1),)).fetchone()
                if not row: return self.send_error_json('Topilmadi',404)
                return self.send_json(row_to_dict(row))

            # KUNLIK JURNAL (Telegram uchun)
            if path == '/api/kunlik_jurnal':
                kun = qp('sana') or datetime.now().strftime('%Y-%m-%d')
                # Sotuvlar
                sotuvlar = rows_to_list(conn.execute("""
                    SELECT s.*,f.ism||' '||f.familiya as kassir_ismi,
                    COALESCE(mj.ism||' '||COALESCE(mj.familiya,''),'') as mijoz_ismi,
                    (SELECT COUNT(*) FROM sotuv_tafsilotlari WHERE sotuv_id=s.id) as mah_soni
                    FROM sotuvlar s LEFT JOIN foydalanuvchilar f ON s.kassir_id=f.id
                    LEFT JOIN mijozlar mj ON s.mijoz_id=mj.id
                    WHERE date(s.sana)=? ORDER BY s.sana DESC
                """, (kun,)).fetchall())
                # Qaytarishlar
                qaytarishlar = rows_to_list(conn.execute("""
                    SELECT q.*,f.ism||' '||f.familiya as kassir_ismi
                    FROM qaytarishlar q LEFT JOIN foydalanuvchilar f ON q.kassir_id=f.id
                    WHERE date(q.sana)=? ORDER BY q.sana DESC
                """, (kun,)).fetchall())
                # Xarajatlar
                xarajatlar = rows_to_list(conn.execute(
                    "SELECT * FROM xarajatlar WHERE date(sana)=? ORDER BY sana DESC", (kun,)).fetchall())
                # Kassa harakatlari
                kassa_h = rows_to_list(conn.execute(
                    "SELECT * FROM kassa_harakatlari WHERE date(sana)=? ORDER BY sana DESC", (kun,)).fetchall())
                # Foyda (sotuv - kelish narxi)
                foyda = conn.execute("""
                    SELECT COALESCE(SUM(st.jami) - SUM(st.miqdor * m.kelish_narxi), 0) as foyda
                    FROM sotuv_tafsilotlari st
                    JOIN mahsulotlar m ON st.mahsulot_id=m.id
                    JOIN sotuvlar s ON st.sotuv_id=s.id
                    WHERE date(s.sana)=?
                """, (kun,)).fetchone()
                # Top mahsulotlar
                top = rows_to_list(conn.execute("""
                    SELECT m.nomi, SUM(st.miqdor) as miqdor, SUM(st.jami) as jami, m.birlik
                    FROM sotuv_tafsilotlari st JOIN mahsulotlar m ON st.mahsulot_id=m.id
                    JOIN sotuvlar s ON st.sotuv_id=s.id
                    WHERE date(s.sana)=? GROUP BY m.id ORDER BY jami DESC LIMIT 5
                """, (kun,)).fetchall())
                # Kassir bo'yicha
                kassirlar = rows_to_list(conn.execute("""
                    SELECT f.ism||' '||f.familiya as ism,
                    COUNT(*) as sotuvlar, SUM(s.jami_summa) as jami
                    FROM sotuvlar s JOIN foydalanuvchilar f ON s.kassir_id=f.id
                    WHERE date(s.sana)=? GROUP BY f.id
                """, (kun,)).fetchall())
                return self.send_json({
                    'kun': kun,
                    'sotuvlar': sotuvlar,
                    'qaytarishlar': qaytarishlar,
                    'xarajatlar': xarajatlar,
                    'kassa_h': kassa_h,
                    'foyda': dict(foyda) if foyda else {},
                    'top': top,
                    'kassirlar': kassirlar,
                    'jami_sotuv': sum(s['jami_summa'] for s in sotuvlar),
                    'jami_qaytarish': sum(q['jami_summa'] for q in qaytarishlar),
                    'jami_xarajat': sum(x['summa'] for x in xarajatlar),
                })

            # KASSA HARAKATLARI ro'yxati — GET
            if path == '/api/kassa_harakatlari':
                params = []
                sql = "SELECT * FROM kassa_harakatlari WHERE 1=1"
                if qp('boshlanish'): sql += " AND date(sana)>=?"; params.append(qp('boshlanish'))
                if qp('tugash'):     sql += " AND date(sana)<=?"; params.append(qp('tugash'))
                if qp('tur'):        sql += " AND tur=?";         params.append(qp('tur'))
                sql += " ORDER BY sana DESC"
                return self.send_json(rows_to_list(conn.execute(sql, params).fetchall()))

            if path == '/api/jurnal':
                bosh = qp('boshlanish') or datetime.now().strftime('%Y-%m-%d')
                tug  = qp('tugash')    or datetime.now().strftime('%Y-%m-%d')
                tur  = qp('tur') or 'barchasi'
                limit = int(qp('limit') or 200)

                operatsiyalar = []

                # SOTUVLAR
                if tur in ('barchasi','sotuv'):
                    rows = conn.execute("""
                        SELECT s.id, 'sotuv' as tur, s.chek_raqam as raqam,
                            s.jami_summa as summa, s.tolov_turi,
                            s.mijoz_ismi, s.sana,
                            f.ism||' '||f.familiya as xodim,
                            (SELECT COUNT(*) FROM sotuv_tafsilotlari WHERE sotuv_id=s.id) as mahsulotlar_soni
                        FROM sotuvlar s
                        LEFT JOIN foydalanuvchilar f ON s.kassir_id=f.id
                        WHERE date(s.sana)>=? AND date(s.sana)<=?
                    """, (bosh, tug)).fetchall()
                    operatsiyalar += [dict(r) for r in rows]

                # QAYTARISHLAR
                if tur in ('barchasi','qaytarish'):
                    rows = conn.execute("""
                        SELECT q.id, 'qaytarish' as tur, q.chek_raqam as raqam,
                            q.jami_summa as summa, '' as tolov_turi,
                            q.mijoz_ismi, q.sana, q.sabab,
                            f.ism||' '||f.familiya as xodim,
                            (SELECT COUNT(*) FROM qaytarish_tafsilotlari WHERE qaytarish_id=q.id) as mahsulotlar_soni
                        FROM qaytarishlar q
                        LEFT JOIN foydalanuvchilar f ON q.kassir_id=f.id
                        WHERE date(q.sana)>=? AND date(q.sana)<=?
                    """, (bosh, tug)).fetchall()
                    operatsiyalar += [dict(r) for r in rows]

                # OMBOR KIRIM
                if tur in ('barchasi','kirim'):
                    rows = conn.execute("""
                        SELECT o.id, 'kirim' as tur,
                            'KRM'||o.id as raqam,
                            o.miqdor * o.kelish_narxi as summa,
                            '' as tolov_turi, '' as mijoz_ismi,
                            o.sana, o.yetkazuvchi as sabab,
                            f.ism||' '||f.familiya as xodim,
                            1 as mahsulotlar_soni,
                            m.nomi as mahsulot_nomi,
                            o.miqdor, m.birlik, o.kelish_narxi
                        FROM ombor_kirim o
                        JOIN mahsulotlar m ON o.mahsulot_id=m.id
                        LEFT JOIN foydalanuvchilar f ON o.foydalanuvchi_id=f.id
                        WHERE date(o.sana)>=? AND date(o.sana)<=?
                    """, (bosh, tug)).fetchall()
                    operatsiyalar += [dict(r) for r in rows]

                # XARAJATLAR
                if tur in ('barchasi','xarajat'):
                    rows = conn.execute("""
                        SELECT x.id, 'xarajat' as tur,
                            'XRJ'||x.id as raqam,
                            x.summa, '' as tolov_turi,
                            '' as mijoz_ismi, x.sana,
                            x.kategoriya as sabab,
                            f.ism||' '||f.familiya as xodim,
                            0 as mahsulotlar_soni,
                            x.nomi as mahsulot_nomi
                        FROM xarajatlar x
                        LEFT JOIN foydalanuvchilar f ON x.foydalanuvchi_id=f.id
                        WHERE date(x.sana)>=? AND date(x.sana)<=?
                    """, (bosh, tug)).fetchall()
                    operatsiyalar += [dict(r) for r in rows]

                # KASSA HARAKATLARI (kirim/chiqim)
                if tur in ('barchasi','kassakirim','kassachiqim'):
                    tur_filter = ""
                    if tur == 'kassakirim':  tur_filter = " AND tur='kirim'"
                    if tur == 'kassachiqim': tur_filter = " AND tur='chiqim'"
                    rows = conn.execute(f"""
                        SELECT id, tur,
                            'KH'||id as raqam,
                            summa, '' as tolov_turi,
                            '' as mijoz_ismi, sana,
                            kategoriya as sabab,
                            COALESCE(foydalanuvchi_ismi,'Tizim') as xodim,
                            0 as mahsulotlar_soni,
                            nomi as mahsulot_nomi, izoh
                        FROM kassa_harakatlari
                        WHERE date(sana)>=? AND date(sana)<=?{tur_filter}
                    """, (bosh, tug)).fetchall()
                    operatsiyalar += [dict(r) for r in rows]
                    rows = conn.execute("""
                        SELECT l.id, l.amal as tur,
                            'MAH'||l.id as raqam,
                            COALESCE(l.sotish_narxi,0) as summa,
                            '' as tolov_turi, '' as mijoz_ismi,
                            l.sana, l.izoh as sabab,
                            COALESCE(l.foydalanuvchi_ismi,'Tizim') as xodim,
                            1 as mahsulotlar_soni,
                            l.mahsulot_nomi, l.miqdor, l.birlik,
                            l.kelish_narxi, l.sotish_narxi,
                            l.mahsulot_id
                        FROM mahsulot_logi l
                        WHERE date(l.sana)>=? AND date(l.sana)<=?
                    """, (bosh, tug)).fetchall()
                    operatsiyalar += [dict(r) for r in rows]

                # Sana bo'yicha tartiblash (yangilari birinchi)
                operatsiyalar.sort(key=lambda x: x.get('sana',''), reverse=True)
                return self.send_json(operatsiyalar[:limit])

            if path == '/api/hisobot/umumiy':
                bugun = datetime.now().strftime('%Y-%m-%d')
                oy = datetime.now().strftime('%Y-%m')
                return self.send_json({
                    'mahsulotlar_soni': row_to_dict(conn.execute("SELECT COUNT(*) as son FROM mahsulotlar WHERE faol=1").fetchone()),
                    'bugun_sotuv': row_to_dict(conn.execute("SELECT COUNT(*) as son,COALESCE(SUM(jami_summa),0) as jami FROM sotuvlar WHERE date(sana)=?", (bugun,)).fetchone()),
                    'oy_sotuv': row_to_dict(conn.execute("SELECT COUNT(*) as son,COALESCE(SUM(jami_summa),0) as jami FROM sotuvlar WHERE strftime('%Y-%m',sana)=?", (oy,)).fetchone()),
                    'kam_miqdor': row_to_dict(conn.execute("SELECT COUNT(*) as son FROM mahsulotlar WHERE miqdor<=min_miqdor AND faol=1").fetchone()),
                    'jami_sotuv': row_to_dict(conn.execute("SELECT COUNT(*) as son,COALESCE(SUM(jami_summa),0) as jami FROM sotuvlar").fetchone()),
                })

            # ===== OMBOR HISOBOTLARI =====
            if path == '/api/hisobot/ombor/kirim':
                bosh = qp('boshlanish') or datetime.now().strftime('%Y-%m-01')
                tug  = qp('tugash') or datetime.now().strftime('%Y-%m-%d')
                rows = rows_to_list(conn.execute("""
                    SELECT ok.*, m.nomi, m.birlik
                    FROM ombor_kirim ok JOIN mahsulotlar m ON ok.mahsulot_id=m.id
                    WHERE date(ok.sana)>=? AND date(ok.sana)<=?
                    ORDER BY ok.sana DESC
                """, (bosh, tug)).fetchall())
                jami_qiymat = sum(r['miqdor']*(r['kelish_narxi'] or 0) for r in rows)
                return self.send_json({'rows': rows, 'jami_qiymat': jami_qiymat})

            if path == '/api/hisobot/ombor/top_mahsulot':
                bosh = qp('boshlanish') or datetime.now().strftime('%Y-%m-01')
                tug  = qp('tugash') or datetime.now().strftime('%Y-%m-%d')
                rows = rows_to_list(conn.execute("""
                    SELECT m.nomi, m.birlik, m.miqdor as qoldiq,
                        SUM(st.miqdor) as sotilgan_miqdor,
                        SUM(st.jami) as sotilgan_summa,
                        COUNT(DISTINCT st.sotuv_id) as sotuv_soni
                    FROM sotuv_tafsilotlari st
                    JOIN mahsulotlar m ON st.mahsulot_id=m.id
                    JOIN sotuvlar s ON st.sotuv_id=s.id
                    WHERE date(s.sana)>=? AND date(s.sana)<=?
                    GROUP BY m.id ORDER BY sotilgan_summa DESC LIMIT 20
                """, (bosh, tug)).fetchall())
                return self.send_json(rows)

            if path == '/api/hisobot/ombor/kam':
                rows = rows_to_list(conn.execute("""
                    SELECT m.nomi, m.birlik, m.miqdor, m.min_miqdor,
                        m.sotish_narxi, m.kelish_narxi,
                        k.nomi as kategoriya_nomi,
                        CASE WHEN m.miqdor<=0 THEN 'tugagan'
                             WHEN m.miqdor<=m.min_miqdor THEN 'kam'
                             ELSE 'normal' END as holat
                    FROM mahsulotlar m
                    LEFT JOIN kategoriyalar k ON m.kategoriya_id=k.id
                    WHERE m.faol=1 AND m.miqdor<=m.min_miqdor
                    ORDER BY m.miqdor ASC
                """).fetchall())
                return self.send_json(rows)

            if path == '/api/hisobot/ombor/aylanma':
                bosh = qp('boshlanish') or datetime.now().strftime('%Y-%m-01')
                tug  = qp('tugash') or datetime.now().strftime('%Y-%m-%d')
                rows = rows_to_list(conn.execute("""
                    SELECT m.nomi, m.birlik, m.miqdor as hozir_qoldiq,
                        m.kelish_narxi, m.sotish_narxi,
                        COALESCE(kirim.jami_kirim,0) as jami_kirim,
                        COALESCE(chiqim.jami_chiqim,0) as jami_chiqim,
                        COALESCE(kirim.kirim_miqdor,0) as kirim_miqdor,
                        COALESCE(chiqim.chiqim_miqdor,0) as chiqim_miqdor
                    FROM mahsulotlar m
                    LEFT JOIN (
                        SELECT mahsulot_id,
                            SUM(miqdor) as kirim_miqdor,
                            SUM(miqdor*kelish_narxi) as jami_kirim
                        FROM ombor_kirim WHERE date(sana)>=? AND date(sana)<=?
                        GROUP BY mahsulot_id
                    ) kirim ON m.id=kirim.mahsulot_id
                    LEFT JOIN (
                        SELECT st.mahsulot_id,
                            SUM(st.miqdor) as chiqim_miqdor,
                            SUM(st.jami) as jami_chiqim
                        FROM sotuv_tafsilotlari st
                        JOIN sotuvlar s ON st.sotuv_id=s.id
                        WHERE date(s.sana)>=? AND date(s.sana)<=?
                        GROUP BY st.mahsulot_id
                    ) chiqim ON m.id=chiqim.mahsulot_id
                    WHERE m.faol=1
                    AND (COALESCE(kirim.kirim_miqdor,0)>0 OR COALESCE(chiqim.chiqim_miqdor,0)>0)
                    ORDER BY COALESCE(chiqim.jami_chiqim,0) DESC
                """, (bosh, tug, bosh, tug)).fetchall())
                return self.send_json(rows)

            # ===== MIJOZLAR HISOBOTLARI =====
            if path == '/api/hisobot/mijozlar/top':
                bosh = qp('boshlanish') or datetime.now().strftime('%Y-%m-01')
                tug  = qp('tugash') or datetime.now().strftime('%Y-%m-%d')
                rows = rows_to_list(conn.execute("""
                    SELECT mj.ism||' '||COALESCE(mj.familiya,'') as ismi,
                        mj.telefon, mj.qarz,
                        COUNT(s.id) as sotuv_soni,
                        COALESCE(SUM(s.jami_summa),0) as jami_xarid,
                        MAX(s.sana) as oxirgi_sotuv
                    FROM mijozlar mj
                    JOIN sotuvlar s ON s.mijoz_id=mj.id
                    WHERE date(s.sana)>=? AND date(s.sana)<=?
                    GROUP BY mj.id
                    ORDER BY jami_xarid DESC LIMIT 20
                """, (bosh, tug)).fetchall())
                return self.send_json(rows)

            if path == '/api/hisobot/mijozlar/yangi':
                bosh = qp('boshlanish') or datetime.now().strftime('%Y-%m-01')
                tug  = qp('tugash') or datetime.now().strftime('%Y-%m-%d')
                rows = rows_to_list(conn.execute("""
                    SELECT mj.*,
                        COUNT(s.id) as sotuv_soni,
                        COALESCE(SUM(s.jami_summa),0) as jami_xarid
                    FROM mijozlar mj
                    LEFT JOIN sotuvlar s ON s.mijoz_id=mj.id
                    WHERE date(mj.yaratilgan)>=? AND date(mj.yaratilgan)<=?
                    AND mj.faol=1
                    GROUP BY mj.id ORDER BY mj.yaratilgan DESC
                """, (bosh, tug)).fetchall())
                return self.send_json(rows)

            if path == '/api/hisobot/mijozlar/aktiv':
                bosh = qp('boshlanish') or datetime.now().strftime('%Y-%m-01')
                tug  = qp('tugash') or datetime.now().strftime('%Y-%m-%d')
                rows = rows_to_list(conn.execute("""
                    SELECT mj.ism||' '||COALESCE(mj.familiya,'') as ismi,
                        mj.telefon, mj.qarz,
                        COUNT(s.id) as sotuv_soni,
                        COALESCE(SUM(s.jami_summa),0) as jami_xarid,
                        MAX(s.sana) as oxirgi_sotuv,
                        MIN(s.sana) as birinchi_sotuv
                    FROM mijozlar mj
                    JOIN sotuvlar s ON s.mijoz_id=mj.id
                    WHERE mj.faol=1
                    GROUP BY mj.id
                    HAVING COUNT(s.id)>=2
                    ORDER BY sotuv_soni DESC LIMIT 30
                """).fetchall())
                return self.send_json(rows)

            # ===== XODIMLAR HISOBOTLARI =====
            if path == '/api/hisobot/xodimlar/sotuv':
                bosh = qp('boshlanish') or datetime.now().strftime('%Y-%m-01')
                tug  = qp('tugash') or datetime.now().strftime('%Y-%m-%d')
                rows = rows_to_list(conn.execute("""
                    SELECT f.ism||' '||f.familiya as ismi, f.rol, f.telefon,
                        COUNT(s.id) as sotuv_soni,
                        COALESCE(SUM(s.jami_summa),0) as jami_summa,
                        COALESCE(AVG(s.jami_summa),0) as ort_sotuv,
                        MAX(s.sana) as oxirgi_sotuv,
                        COUNT(DISTINCT date(s.sana)) as ish_kunlari
                    FROM foydalanuvchilar f
                    LEFT JOIN sotuvlar s ON s.kassir_id=f.id
                        AND date(s.sana)>=? AND date(s.sana)<=?
                    WHERE f.faol=1
                    GROUP BY f.id ORDER BY jami_summa DESC
                """, (bosh, tug)).fetchall())
                return self.send_json(rows)

            self.send_error_json('Topilmadi', 404)
        except Exception as e:
            self.send_error_json(str(e), 500)
        finally:
            conn.close()


    def do_POST(self):
        path = urlparse(self.path).path
        body = self.read_body()

        # ===== AI ENDPOINT =====
        if path == '/api/ai/chat':
            return self.ai_chat(body)
        if path == '/api/ai/tahlil':
            return self.ai_tahlil()
        if path == '/api/ai/bashorat':
            return self.ai_bashorat()

        conn = get_db()
        try:
            if path == '/api/login':
                row = conn.execute("SELECT * FROM foydalanuvchilar WHERE username=? AND parol=? AND faol=1", (body.get('username',''), body.get('parol',''))).fetchone()
                if not row: return self.send_error_json("Username yoki parol noto'g'ri!", 401)
                d = row_to_dict(row); del d['parol']
                return self.send_json({'muvaffaqiyat': True, 'foydalanuvchi': d})

            if path == '/api/foydalanuvchilar':
                try:
                    r = conn.execute("INSERT INTO foydalanuvchilar (ism,familiya,username,parol,rol,telefon) VALUES (?,?,?,?,?,?)",
                        (body['ism'],body['familiya'],body['username'],body['parol'],body.get('rol','kassir'),body.get('telefon',''))).lastrowid
                    conn.commit(); return self.send_json({'muvaffaqiyat':True,'id':r})
                except: return self.send_error_json("Bu username allaqachon mavjud!")

            if path == '/api/kategoriyalar':
                try:
                    r = conn.execute("INSERT INTO kategoriyalar (nomi,tavsif) VALUES (?,?)", (body['nomi'],body.get('tavsif',''))).lastrowid
                    conn.commit(); return self.send_json({'muvaffaqiyat':True,'id':r})
                except: return self.send_error_json("Bu kategoriya allaqachon mavjud!")

            if path == '/api/brendlar':
                try:
                    rasm = body.get('rasm')
                    r = conn.execute("INSERT INTO brendlar (nomi,tavsif,rasm) VALUES (?,?,?)",
                        (body['nomi'], body.get('tavsif',''), rasm)).lastrowid
                    conn.commit(); return self.send_json({'muvaffaqiyat':True,'id':r})
                except: return self.send_error_json("Bu brend allaqachon mavjud!")

            # SHTRIX KOD QO'SHISH
            if path == '/api/shtrix_kodlar':
                try:
                    r = conn.execute(
                        "INSERT INTO mahsulot_shtrix_kodlar (mahsulot_id,kod,tur,izoh) VALUES (?,?,?,?)",
                        (body['mahsulot_id'], body['kod'],
                         body.get('tur','barcode'), body.get('izoh',''))).lastrowid
                    conn.commit()
                    return self.send_json({'muvaffaqiyat':True,'id':r})
                except Exception as e:
                    return self.send_error_json(str(e))

            # QARZ TARIXI QO'SHISH
            if path == '/api/qarz_tarixi':
                r = conn.execute(
                    "INSERT INTO qarz_tarixi (mijoz_id,sotuv_id,summa,qoldi,muddat,holat,izoh) VALUES (?,?,?,?,?,?,?)",
                    (body['mijoz_id'], body.get('sotuv_id'),
                     body['summa'], body.get('qoldi', body['summa']),
                     body.get('muddat'), body.get('holat','ochiq'),
                     body.get('izoh',''))).lastrowid
                conn.commit()
                return self.send_json({'muvaffaqiyat':True,'id':r})

            # QARZ TO'LASH
            m_qt = re.match(r'^/api/qarz_tarixi/(\d+)/tolash$', path)
            if m_qt:
                qarz_id = m_qt.group(1)
                tolangan = float(body.get('summa', 0))
                qarz = conn.execute("SELECT * FROM qarz_tarixi WHERE id=?", (qarz_id,)).fetchone()
                if not qarz: return self.send_error_json('Qarz topilmadi', 404)
                yangi_qoldi = max(0, qarz['qoldi'] - tolangan)
                yangi_holat = 'tolandi' if yangi_qoldi <= 0 else 'ochiq'
                conn.execute("UPDATE qarz_tarixi SET qoldi=?,holat=? WHERE id=?",
                    (yangi_qoldi, yangi_holat, qarz_id))
                conn.execute("UPDATE mijozlar SET qarz=MAX(0,qarz-?) WHERE id=?",
                    (min(tolangan, qarz['qoldi']), qarz['mijoz_id']))
                conn.commit()
                return self.send_json({'muvaffaqiyat':True,'qoldi':yangi_qoldi,'holat':yangi_holat})

            # ETIKETKA SHABLONLARI
            if path == '/api/etiketka':
                r = conn.execute(
                    "INSERT INTO etiketka_shablonlar (nomi,uzunlik,balandlik,elementlar) VALUES (?,?,?,?)",
                    (body.get('nomi','Yangi shablon'),
                     body.get('uzunlik', 58),
                     body.get('balandlik', 30),
                     json.dumps(body.get('elementlar', []), ensure_ascii=False))
                ).lastrowid
                conn.commit()
                return self.send_json({'muvaffaqiyat':True,'id':r})

            if path == '/api/mijozlar':
                try:
                    r = conn.execute("INSERT INTO mijozlar (ism,familiya,telefon,manzil,izoh) VALUES (?,?,?,?,?)",
                        (body['ism'],body.get('familiya',''),body.get('telefon',''),body.get('manzil',''),body.get('izoh',''))).lastrowid
                    conn.commit(); return self.send_json({'muvaffaqiyat':True,'id':r})
                except Exception as e: return self.send_error_json(str(e))

            if path == '/api/mahsulotlar':
                try:
                    mavjud = conn.execute("SELECT id FROM mahsulotlar WHERE LOWER(nomi)=LOWER(?) AND faol=1", (body['nomi'],)).fetchone()
                    if mavjud: return self.send_error_json(f"'{body['nomi']}' nomli mahsulot allaqachon mavjud!")
                    r = conn.execute("INSERT INTO mahsulotlar (nomi,kategoriya_id,shtrix_kod,sku,birlik,kelish_narxi,sotish_narxi,miqdor,min_miqdor,tavsif,rasm,sotuvda_korinsin,brend_id) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)",
                        (body['nomi'],body.get('kategoriya_id'),body.get('shtrix_kod'),body.get('sku'),body.get('birlik','dona'),
                         body.get('kelish_narxi',0),body.get('sotish_narxi',0),body.get('miqdor',0),body.get('min_miqdor',5),body.get('tavsif',''),body.get('rasm'),body.get('sotuvda_korinsin',1),body.get('brend_id'))).lastrowid
                    # LOG: mahsulot qo'shildi
                    foydalanuvchi_id = body.get('foydalanuvchi_id')
                    fism = ''
                    if foydalanuvchi_id:
                        fu = conn.execute("SELECT ism,familiya FROM foydalanuvchilar WHERE id=?", (foydalanuvchi_id,)).fetchone()
                        if fu: fism = fu['ism'] + ' ' + fu['familiya']
                    conn.execute("INSERT INTO mahsulot_logi (amal,mahsulot_id,mahsulot_nomi,birlik,kelish_narxi,sotish_narxi,miqdor,foydalanuvchi_id,foydalanuvchi_ismi,izoh) VALUES (?,?,?,?,?,?,?,?,?,?)",
                        ('qoshildi', r, body['nomi'], body.get('birlik','dona'),
                         body.get('kelish_narxi',0), body.get('sotish_narxi',0),
                         body.get('miqdor',0), foydalanuvchi_id, fism, 'Yangi mahsulot qo\'shildi'))
                    conn.commit()
                    tg_yuborish_bg(
                        f"Yangi mahsulot qoshildi\n"
                        f"Nomi: {body['nomi']}\n"
                        f"Miqdor: {body.get('miqdor',0)} {body.get('birlik','dona')}\n"
                        f"Sotish narxi: {int(body.get('sotish_narxi',0)):,} som\n".replace(',', ' ') +
                        f"Vaqt: {datetime.now().strftime('%H:%M:%S')}"
                    )
                    return self.send_json({'muvaffaqiyat':True,'id':r})
                except Exception as e: return self.send_error_json(str(e))

            if path == '/api/sotuvlar':
                mahsulotlar = body.get('mahsulotlar', [])
                if not mahsulotlar: return self.send_error_json('Mahsulot tanlanmagan!')
                chek = 'CHK' + str(int(datetime.now().timestamp()*1000))
                jami = sum(m['miqdor']*m['narxi'] for m in mahsulotlar)
                chegirma = body.get('chegirma', 0)
                yakuniy = jami - chegirma
                mijoz_id = body.get('mijoz_id')
                # Mijoz ismi: bazadan olinsin
                mijoz_ismi = ''
                if mijoz_id:
                    mj = conn.execute("SELECT ism,familiya FROM mijozlar WHERE id=?", (mijoz_id,)).fetchone()
                    if mj: mijoz_ismi = mj['ism'] + (' ' + mj['familiya'] if mj['familiya'] else '')
                else:
                    mijoz_ismi = body.get('mijoz_ismi','')
                for m in mahsulotlar:
                    row = conn.execute("SELECT miqdor,nomi FROM mahsulotlar WHERE id=?", (m['mahsulot_id'],)).fetchone()
                    if not row or row['miqdor'] < m['miqdor']:
                        return self.send_error_json(f"'{row['nomi'] if row else 'Mahsulot'}' omborda yetarli emas! Mavjud: {row['miqdor'] if row else 0}")
                r = conn.execute("INSERT INTO sotuvlar (chek_raqam,kassir_id,mijoz_id,jami_summa,chegirma,tolov_turi,mijoz_ismi,mijoz_telefon,izoh) VALUES (?,?,?,?,?,?,?,?,?)",
                    (chek,body['kassir_id'],mijoz_id,yakuniy,chegirma,body.get('tolov_turi','naqd'),mijoz_ismi,body.get('mijoz_telefon',''),body.get('izoh',''))).lastrowid
                for m in mahsulotlar:
                    conn.execute("INSERT INTO sotuv_tafsilotlari (sotuv_id,mahsulot_id,miqdor,narxi,jami) VALUES (?,?,?,?,?)",
                        (r, m['mahsulot_id'], m['miqdor'], m['narxi'], m['miqdor']*m['narxi']))
                    conn.execute("UPDATE mahsulotlar SET miqdor=miqdor-?,yangilangan=datetime('now','localtime') WHERE id=?", (m['miqdor'], m['mahsulot_id']))
                # Qarz bo'lsa mijoz qarzini yangilaymiz
                if mijoz_id and body.get('tolov_turi') == 'qarz':
                    conn.execute("UPDATE mijozlar SET qarz=qarz+? WHERE id=?", (yakuniy, mijoz_id))
                    # Qarz tarixiga ham yozish
                    muddat = body.get('qarz_muddat')
                    conn.execute(
                        "INSERT INTO qarz_tarixi (mijoz_id,sotuv_id,summa,qoldi,muddat,holat,izoh) VALUES (?,?,?,?,?,?,?)",
                        (mijoz_id, r, yakuniy, yakuniy, muddat, 'ochiq',
                         f"Sotuv #{chek} — qarz"))
                # Aralash to'lovda qarz bo'lsa
                elif mijoz_id:
                    qarz_summasi = sum(t['summa'] for t in body.get('tolov_tafsilotlari',[]) if t.get('tur')=='qarz')
                    if qarz_summasi > 0:
                        conn.execute("UPDATE mijozlar SET qarz=qarz+? WHERE id=?", (qarz_summasi, mijoz_id))
                        muddat = body.get('qarz_muddat')
                        conn.execute(
                            "INSERT INTO qarz_tarixi (mijoz_id,sotuv_id,summa,qoldi,muddat,holat,izoh) VALUES (?,?,?,?,?,?,?)",
                            (mijoz_id, r, qarz_summasi, qarz_summasi, muddat, 'ochiq',
                             f"Sotuv #{chek} — qarzga"))
                conn.commit()
                # Telegram bildirishnoma — har sotuv
                try:
                    kassir_row = conn.execute("SELECT ism,familiya FROM foydalanuvchilar WHERE id=?", (body['kassir_id'],)).fetchone()
                    kassir_ismi = (kassir_row['ism'] + ' ' + kassir_row['familiya']) if kassir_row else 'Kassir'
                    telegram_sotuv_bildirishnoma(r, chek, kassir_ismi, yakuniy, body.get('tolov_turi','naqd'), mijoz_ismi)
                except: pass
                return self.send_json({'muvaffaqiyat':True,'sotuv_id':r,'chek_raqam':chek,'jami_summa':yakuniy})

            if path == '/api/ombor':
                conn.execute("INSERT INTO ombor_kirim (mahsulot_id,miqdor,kelish_narxi,yetkazuvchi,izoh,foydalanuvchi_id) VALUES (?,?,?,?,?,?)",
                    (body['mahsulot_id'],body['miqdor'],body.get('kelish_narxi',0),body.get('yetkazuvchi',''),body.get('izoh',''),body.get('foydalanuvchi_id')))
                conn.execute("UPDATE mahsulotlar SET miqdor=miqdor+?,kelish_narxi=?,yangilangan=datetime('now','localtime') WHERE id=?",
                    (body['miqdor'],body.get('kelish_narxi',0),body['mahsulot_id']))
                conn.commit(); return self.send_json({'muvaffaqiyat':True})

            # INTEGRATSIYA SOZLAMALARI
            if path == '/api/integratsiya':
                tur = body.get('tur', 'telegram')
                mavjud = conn.execute("SELECT id FROM integratsiya_sozlamalar WHERE tur=?", (tur,)).fetchone()
                if mavjud:
                    conn.execute("UPDATE integratsiya_sozlamalar SET token=?,chat_id=?,faol=?,sozlamalar=? WHERE tur=?",
                        (body.get('token',''), body.get('chat_id',''), body.get('faol',0),
                         json.dumps(body.get('sozlamalar',{}), ensure_ascii=False), tur))
                else:
                    conn.execute("INSERT INTO integratsiya_sozlamalar (tur,token,chat_id,faol,sozlamalar) VALUES (?,?,?,?,?)",
                        (tur, body.get('token',''), body.get('chat_id',''), body.get('faol',0),
                         json.dumps(body.get('sozlamalar',{}), ensure_ascii=False)))
                conn.commit()
                return self.send_json({'muvaffaqiyat': True})

            # SMS TEST
            if path == '/api/sms/test':
                provayder = body.get('provayder', 'eskiz')
                login  = body.get('login', '')
                token  = body.get('token', '')
                sender = body.get('sender', 'DOKON')
                tel    = body.get('telefon', '')
                matn   = "Test SMS - Qurilish Do'koni tizimidan"
                if not tel: return self.send_error_json('Telefon raqam kiritilmagan!')
                result = sms_yuborish(provayder, login, token, sender, tel, matn)
                return self.send_json(result)


                result = telegram_yuborish(body.get('token',''), body.get('chat_id',''),
                    "🏗️ Qurilish Do'koni — Test xabari!\n\nBot muvaffaqiyatli ulandi ✅")
                return self.send_json(result)

            # TELEGRAM KUNLIK JURNAL
            if path == '/api/telegram/kunlik':
                int_soz = conn.execute("SELECT * FROM integratsiya_sozlamalar WHERE tur='telegram'").fetchone()
                if not int_soz or not int_soz['faol']:
                    return self.send_error_json('Telegram integratsiyasi yoqilmagan!')
                kun = body.get('sana', datetime.now().strftime('%Y-%m-%d'))
                js = conn.execute("SELECT COUNT(*) as son, COALESCE(SUM(jami_summa),0) as jami FROM sotuvlar WHERE date(sana)=?", (kun,)).fetchone()
                jq = conn.execute("SELECT COUNT(*) as son, COALESCE(SUM(jami_summa),0) as jami FROM qaytarishlar WHERE date(sana)=?", (kun,)).fetchone()
                jx = conn.execute("SELECT COALESCE(SUM(summa),0) as jami FROM xarajatlar WHERE date(sana)=?", (kun,)).fetchone()
                fp = conn.execute("SELECT COALESCE(SUM(st.jami)-SUM(st.miqdor*m.kelish_narxi),0) as f FROM sotuv_tafsilotlari st JOIN mahsulotlar m ON st.mahsulot_id=m.id JOIN sotuvlar s ON st.sotuv_id=s.id WHERE date(s.sana)=?", (kun,)).fetchone()
                top = conn.execute("SELECT m.nomi,SUM(st.miqdor) as miq,SUM(st.jami) as j FROM sotuv_tafsilotlari st JOIN mahsulotlar m ON st.mahsulot_id=m.id JOIN sotuvlar s ON st.sotuv_id=s.id WHERE date(s.sana)=? GROUP BY m.id ORDER BY j DESC LIMIT 5", (kun,)).fetchall()
                kass = conn.execute("SELECT f.ism||' '||f.familiya as ism,COUNT(*) as son,SUM(s.jami_summa) as j FROM sotuvlar s JOIN foydalanuvchilar f ON s.kassir_id=f.id WHERE date(s.sana)=? GROUP BY f.id", (kun,)).fetchall()
                sof = (js['jami'] or 0) - (jx['jami'] or 0)
                matn = f"🏗️ *Qurilish Do'koni — Kunlik Hisobot*\n📅 *{kun}*\n\n━━━━━━━━━━━━━━━━━━━━\n💰 *SOTUV*\n• Sotuvlar: *{js['son']}* ta — *{js['jami']:,.0f}* so'm\n• Qaytarish: *{jq['son']}* ta — *{jq['jami']:,.0f}* so'm\n\n📊 *MOLIYA*\n• Xarajat: *{jx['jami']:,.0f}* so'm\n• Foyda: *{fp['f']:,.0f}* so'm\n• Sof balans: *{sof:,.0f}* so'm"
                if top:
                    matn += "\n\n🏆 *TOP MAHSULOTLAR*"
                    for i,m in enumerate(top,1): matn += f"\n{i}. {m['nomi']}: {m['j']:,.0f} so'm"
                if kass:
                    matn += "\n\n👤 *KASSIRLAR*"
                    for k in kass: matn += f"\n• {k['ism']}: {k['son']} ta, {k['j']:,.0f} so'm"
                matn += "\n━━━━━━━━━━━━━━━━━━━━"
                result = telegram_yuborish(int_soz['token'], int_soz['chat_id'], matn)
                return self.send_json(result)

            if path == '/api/xarajatlar':
                conn.execute("INSERT INTO xarajatlar (nomi,summa,kategoriya,foydalanuvchi_id,izoh) VALUES (?,?,?,?,?)",
                    (body['nomi'],body['summa'],body.get('kategoriya',''),body.get('foydalanuvchi_id'),body.get('izoh','')))
                conn.commit()
                tg_yuborish_bg(
                    f"Xarajat qoshildi\n"
                    f"Nomi: {body['nomi']}\n"
                    f"Summa: {int(body['summa']):,} som\n".replace(',', ' ') +
                    (f"Kategoriya: {body.get('kategoriya','')}\n" if body.get('kategoriya') else '') +
                    f"Vaqt: {datetime.now().strftime('%H:%M:%S')}"
                )
                return self.send_json({'muvaffaqiyat':True})

            # KASSA HARAKATI (kirim/chiqim)
            if path == '/api/kassa_harakatlari':
                tur    = body.get('tur', 'chiqim')  # 'kirim' yoki 'chiqim'
                nomi   = body.get('nomi', '')
                summa  = abs(float(body.get('summa', 0)))
                tolov  = body.get('tolov_turi', 'naqd')
                kateg  = body.get('kategoriya', '')
                izoh   = body.get('izoh', '')
                f_id   = body.get('foydalanuvchi_id')
                fism   = ''
                if f_id:
                    fu = conn.execute("SELECT ism,familiya FROM foydalanuvchilar WHERE id=?", (f_id,)).fetchone()
                    if fu: fism = fu['ism'] + ' ' + fu['familiya']
                conn.execute(
                    "INSERT INTO kassa_harakatlari (tur,nomi,summa,tolov_turi,kategoriya,foydalanuvchi_id,foydalanuvchi_ismi,izoh) VALUES (?,?,?,?,?,?,?,?)",
                    (tur, nomi, summa, tolov, kateg, f_id, fism, izoh))
                conn.commit()
                tur_matn = 'Kirim' if tur == 'kirim' else 'Chiqim'
                tg_yuborish_bg(
                    f"Kassa {tur_matn}\n"
                    f"Nomi: {nomi}\n"
                    f"Summa: {int(summa):,} som\n".replace(',', ' ') +
                    (f"Kategoriya: {kateg}\n" if kateg else '') +
                    f"Vaqt: {datetime.now().strftime('%H:%M:%S')}"
                )
                return self.send_json({'muvaffaqiyat': True})
            if path == '/api/qaytarishlar':
                mahsulotlar = body.get('mahsulotlar', [])
                if not mahsulotlar: return self.send_error_json('Mahsulot tanlanmagan!')
                jami = sum(m['miqdor']*m['narxi'] for m in mahsulotlar)
                chek = 'QTR' + str(int(datetime.now().timestamp()*1000))
                r = conn.execute(
                    "INSERT INTO qaytarishlar (sotuv_id,chek_raqam,kassir_id,mijoz_id,mijoz_ismi,sabab,jami_summa) VALUES (?,?,?,?,?,?,?)",
                    (body.get('sotuv_id'), chek, body['kassir_id'], body.get('mijoz_id'),
                     body.get('mijoz_ismi',''), body.get('sabab',''), jami)).lastrowid
                for m in mahsulotlar:
                    conn.execute("INSERT INTO qaytarish_tafsilotlari (qaytarish_id,mahsulot_id,miqdor,narxi,jami) VALUES (?,?,?,?,?)",
                        (r, m['mahsulot_id'], m['miqdor'], m['narxi'], m['miqdor']*m['narxi']))
                    conn.execute("UPDATE mahsulotlar SET miqdor=miqdor+? WHERE id=?", (m['miqdor'], m['mahsulot_id']))
                conn.commit()
                tg_yuborish_bg(
                    f"Qaytarish!\n"
                    f"Chek: {chek}\n"
                    f"Summa: {int(jami):,} som\n".replace(',', ' ') +
                    (f"Sabab: {body.get('sabab','')}\n" if body.get('sabab') else '') +
                    f"Vaqt: {datetime.now().strftime('%H:%M:%S')}"
                )
                return self.send_json({'muvaffaqiyat':True, 'id':r, 'chek_raqam':chek, 'jami_summa':jami})

            # EXCEL (CSV) IMPORT
            if path == '/api/import/mahsulotlar':
                # CSV matn keladi: nomi,birlik,kelish_narxi,sotish_narxi,miqdor,min_miqdor,kategoriya
                csv_text = body.get('csv','')
                if not csv_text: return self.send_error_json('CSV ma\'lumot yo\'q!')
                reader = csv.DictReader(io.StringIO(csv_text))
                qoshildi = 0; xatolar = []
                for i, row in enumerate(reader, 2):
                    nomi = (row.get('nomi') or row.get('Nomi') or '').strip()
                    if not nomi: continue
                    mavjud = conn.execute("SELECT id FROM mahsulotlar WHERE LOWER(nomi)=LOWER(?) AND faol=1", (nomi,)).fetchone()
                    if mavjud:
                        xatolar.append(f"{i}-qator: '{nomi}' allaqachon mavjud, o'tkazib yuborildi")
                        continue
                    birlik = (row.get('birlik') or row.get('Birlik') or 'dona').strip()
                    try:
                        kelish = float((row.get('kelish_narxi') or row.get('Kelish narxi') or '0').replace(' ','').replace(',','.'))
                        sotish = float((row.get('sotish_narxi') or row.get('Sotish narxi') or '0').replace(' ','').replace(',','.'))
                        miqdor = float((row.get('miqdor') or row.get('Miqdor') or '0').replace(' ','').replace(',','.'))
                        min_m  = float((row.get('min_miqdor') or row.get('Min miqdor') or '5').replace(' ','').replace(',','.'))
                    except: kelish=sotish=miqdor=0; min_m=5
                    kat_nomi = (row.get('kategoriya') or row.get('Kategoriya') or '').strip()
                    kat_id = None
                    if kat_nomi:
                        k = conn.execute("SELECT id FROM kategoriyalar WHERE LOWER(nomi)=LOWER(?)", (kat_nomi,)).fetchone()
                        if k: kat_id = k['id']
                        else:
                            kat_id = conn.execute("INSERT INTO kategoriyalar (nomi,tavsif) VALUES (?,?)", (kat_nomi,'Import orqali qo\'shildi')).lastrowid
                    conn.execute("INSERT INTO mahsulotlar (nomi,kategoriya_id,birlik,kelish_narxi,sotish_narxi,miqdor,min_miqdor) VALUES (?,?,?,?,?,?,?)",
                        (nomi,kat_id,birlik,kelish,sotish,miqdor,min_m))
                    qoshildi += 1
                conn.commit()
                return self.send_json({'muvaffaqiyat':True,'qoshildi':qoshildi,'xatolar':xatolar})

            if path == '/api/import/mijozlar':
                # CSV: ism,familiya,telefon,manzil
                csv_text = body.get('csv','')
                if not csv_text: return self.send_error_json('CSV ma\'lumot yo\'q!')
                reader = csv.DictReader(io.StringIO(csv_text))
                qoshildi = 0; xatolar = []
                for i, row in enumerate(reader, 2):
                    ism = (row.get('ism') or row.get('Ism') or '').strip()
                    if not ism: continue
                    familiya = (row.get('familiya') or row.get('Familiya') or '').strip()
                    telefon  = (row.get('telefon')  or row.get('Telefon')  or '').strip()
                    manzil   = (row.get('manzil')   or row.get('Manzil')   or '').strip()
                    conn.execute("INSERT INTO mijozlar (ism,familiya,telefon,manzil) VALUES (?,?,?,?)", (ism,familiya,telefon,manzil))
                    qoshildi += 1
                conn.commit()
                return self.send_json({'muvaffaqiyat':True,'qoshildi':qoshildi,'xatolar':xatolar})

            # BRENDLAR IMPORT
            if path == '/api/import/brendlar':
                csv_text = body.get('csv','')
                if not csv_text: return self.send_error_json('CSV ma\'lumot yo\'q!')
                reader = csv.DictReader(io.StringIO(csv_text))
                qoshildi = 0; xatolar = []
                for i, row in enumerate(reader, 2):
                    nomi = (row.get('nomi') or row.get('Nomi') or '').strip()
                    if not nomi: continue
                    tavsif = (row.get('tavsif') or row.get('Tavsif') or '').strip()
                    mavjud = conn.execute("SELECT id FROM brendlar WHERE LOWER(nomi)=LOWER(?)", (nomi,)).fetchone()
                    if mavjud:
                        xatolar.append(f"'{nomi}' allaqachon mavjud")
                        continue
                    conn.execute("INSERT INTO brendlar (nomi,tavsif) VALUES (?,?)", (nomi, tavsif))
                    qoshildi += 1
                conn.commit()
                return self.send_json({'muvaffaqiyat':True,'qoshildi':qoshildi,'xatolar':xatolar})

            self.send_error_json('Topilmadi', 404)
        except Exception as e:
            self.send_error_json(str(e), 500)
        finally:
            conn.close()

    def do_PUT(self):
        path = urlparse(self.path).path
        body = self.read_body()
        conn = get_db()
        try:
            m = re.match(r'^/api/foydalanuvchilar/(\d+)$', path)
            if m:
                ruxsatlar = json.dumps(body.get('ruxsatlar'), ensure_ascii=False) if body.get('ruxsatlar') is not None else None
                if body.get('parol'):
                    conn.execute("UPDATE foydalanuvchilar SET ism=?,familiya=?,username=?,parol=?,rol=?,telefon=?,faol=?,ruxsatlar=? WHERE id=?",
                        (body['ism'],body['familiya'],body['username'],body['parol'],body['rol'],body.get('telefon',''),body.get('faol',1),ruxsatlar,m.group(1)))
                else:
                    conn.execute("UPDATE foydalanuvchilar SET ism=?,familiya=?,username=?,rol=?,telefon=?,faol=?,ruxsatlar=? WHERE id=?",
                        (body['ism'],body['familiya'],body['username'],body['rol'],body.get('telefon',''),body.get('faol',1),ruxsatlar,m.group(1)))
                conn.commit(); return self.send_json({'muvaffaqiyat':True})

            m = re.match(r'^/api/kategoriyalar/(\d+)$', path)
            if m:
                conn.execute("UPDATE kategoriyalar SET nomi=?,tavsif=? WHERE id=?", (body['nomi'],body.get('tavsif',''),m.group(1)))
                conn.commit(); return self.send_json({'muvaffaqiyat':True})

            m = re.match(r'^/api/qarz_tarixi/(\d+)$', path)
            if m:
                conn.execute("UPDATE qarz_tarixi SET muddat=?,holat=?,izoh=? WHERE id=?",
                    (body.get('muddat'), body.get('holat','ochiq'),
                     body.get('izoh',''), m.group(1)))
                conn.commit(); return self.send_json({'muvaffaqiyat':True})

            m = re.match(r'^/api/brendlar/(\d+)$', path)
            if m:
                conn.execute("UPDATE brendlar SET nomi=?,tavsif=?,rasm=? WHERE id=?",
                    (body['nomi'],body.get('tavsif',''),body.get('rasm'),m.group(1)))
                conn.commit(); return self.send_json({'muvaffaqiyat':True})

            m = re.match(r'^/api/etiketka/(\d+)$', path)
            if m:
                conn.execute(
                    "UPDATE etiketka_shablonlar SET nomi=?,uzunlik=?,balandlik=?,elementlar=? WHERE id=?",
                    (body.get('nomi','Shablon'),
                     body.get('uzunlik',58),
                     body.get('balandlik',30),
                     json.dumps(body.get('elementlar',[]), ensure_ascii=False),
                     m.group(1))
                )
                conn.commit(); return self.send_json({'muvaffaqiyat':True})

            m = re.match(r'^/api/mijozlar/(\d+)$', path)
            if m:
                conn.execute("UPDATE mijozlar SET ism=?,familiya=?,telefon=?,manzil=?,izoh=?,qarz=? WHERE id=?",
                    (body['ism'],body.get('familiya',''),body.get('telefon',''),body.get('manzil',''),body.get('izoh',''),body.get('qarz',0),m.group(1)))
                conn.commit(); return self.send_json({'muvaffaqiyat':True})

            m = re.match(r'^/api/mahsulotlar/(\d+)$', path)
            if m:
                eski = conn.execute("SELECT * FROM mahsulotlar WHERE id=?", (m.group(1),)).fetchone()
                conn.execute("UPDATE mahsulotlar SET nomi=?,kategoriya_id=?,shtrix_kod=?,sku=?,birlik=?,kelish_narxi=?,sotish_narxi=?,miqdor=?,min_miqdor=?,tavsif=?,rasm=?,sotuvda_korinsin=?,brend_id=?,yangilangan=datetime('now','localtime') WHERE id=?",
                    (body['nomi'],body.get('kategoriya_id'),body.get('shtrix_kod'),body.get('sku'),body.get('birlik','dona'),body.get('kelish_narxi',0),body.get('sotish_narxi',0),body.get('miqdor',0),body.get('min_miqdor',5),body.get('tavsif',''),body.get('rasm'),body.get('sotuvda_korinsin',1),body.get('brend_id'),m.group(1)))
                # LOG: mahsulot tahrirlandi
                foydalanuvchi_id = body.get('foydalanuvchi_id')
                fism = ''
                if foydalanuvchi_id:
                    fu = conn.execute("SELECT ism,familiya FROM foydalanuvchilar WHERE id=?", (foydalanuvchi_id,)).fetchone()
                    if fu: fism = fu['ism'] + ' ' + fu['familiya']
                izoh_parts = []
                if eski:
                    if eski['sotish_narxi'] != body.get('sotish_narxi',0):
                        izoh_parts.append(f"Narx: {eski['sotish_narxi']} → {body.get('sotish_narxi',0)}")
                    if eski['miqdor'] != body.get('miqdor',0):
                        izoh_parts.append(f"Miqdor: {eski['miqdor']} → {body.get('miqdor',0)}")
                conn.execute("INSERT INTO mahsulot_logi (amal,mahsulot_id,mahsulot_nomi,birlik,kelish_narxi,sotish_narxi,miqdor,foydalanuvchi_id,foydalanuvchi_ismi,izoh) VALUES (?,?,?,?,?,?,?,?,?,?)",
                    ('tahrirlandi', int(m.group(1)), body['nomi'], body.get('birlik','dona'),
                     body.get('kelish_narxi',0), body.get('sotish_narxi',0),
                     body.get('miqdor',0), foydalanuvchi_id, fism,
                     ', '.join(izoh_parts) if izoh_parts else 'Tahrirlandi'))
                conn.commit(); return self.send_json({'muvaffaqiyat':True})

            self.send_error_json('Topilmadi', 404)
        except Exception as e:
            self.send_error_json(str(e), 500)
        finally:
            conn.close()

    def do_DELETE(self):
        path = urlparse(self.path).path
        conn = get_db()
        try:
            m = re.match(r'^/api/foydalanuvchilar/(\d+)$', path)
            if m:
                conn.execute("UPDATE foydalanuvchilar SET faol=0 WHERE id=?", (m.group(1),)); conn.commit()
                return self.send_json({'muvaffaqiyat':True})

            m = re.match(r'^/api/kategoriyalar/(\d+)$', path)
            if m:
                conn.execute("DELETE FROM kategoriyalar WHERE id=?", (m.group(1),)); conn.commit()
                return self.send_json({'muvaffaqiyat':True})

            m = re.match(r'^/api/brendlar/(\d+)$', path)
            if m:
                conn.execute("DELETE FROM brendlar WHERE id=?", (m.group(1),)); conn.commit()
                return self.send_json({'muvaffaqiyat':True})

            m = re.match(r'^/api/etiketka/(\d+)$', path)
            if m:
                conn.execute("DELETE FROM etiketka_shablonlar WHERE id=?", (m.group(1),)); conn.commit()
                return self.send_json({'muvaffaqiyat':True})

            m = re.match(r'^/api/shtrix_kodlar/(\d+)$', path)
            if m:
                conn.execute("DELETE FROM mahsulot_shtrix_kodlar WHERE id=?", (m.group(1),)); conn.commit()
                return self.send_json({'muvaffaqiyat':True})

            m_sk = re.match(r'^/api/shtrix_kodlar/(\d+)$', path)
            if m_sk:
                conn.execute("DELETE FROM mahsulot_shtrix_kodlar WHERE id=?", (m_sk.group(1),)); conn.commit()
                return self.send_json({'muvaffaqiyat':True})

            m = re.match(r'^/api/mahsulotlar/(\d+)$', path)
            if m:
                row = conn.execute("SELECT miqdor,nomi,birlik,sotish_narxi FROM mahsulotlar WHERE id=?", (m.group(1),)).fetchone()
                if row and row['miqdor'] > 0:
                    return self.send_error_json(f"'{row['nomi']}' mahsulotini o'chirishdan avval miqdorni 0 ga tushiring! Hozir: {row['miqdor']}")
                # LOG: mahsulot o'chirildi
                if row:
                    conn.execute("INSERT INTO mahsulot_logi (amal,mahsulot_id,mahsulot_nomi,birlik,sotish_narxi,miqdor,izoh) VALUES (?,?,?,?,?,?,?)",
                        ('ochirildi', int(m.group(1)), row['nomi'], row['birlik'],
                         row['sotish_narxi'], row['miqdor'], "Mahsulot o'chirildi"))
                conn.execute("UPDATE mahsulotlar SET faol=0 WHERE id=?", (m.group(1),)); conn.commit()
                return self.send_json({'muvaffaqiyat':True})

            m = re.match(r'^/api/mijozlar/(\d+)$', path)
            if m:
                conn.execute("UPDATE mijozlar SET faol=0 WHERE id=?", (m.group(1),)); conn.commit()
                return self.send_json({'muvaffaqiyat':True})

            m = re.match(r'^/api/sotuvlar/(\d+)$', path)
            if m:
                sid = m.group(1)
                taf = conn.execute("SELECT * FROM sotuv_tafsilotlari WHERE sotuv_id=?", (sid,)).fetchall()
                for t in taf:
                    conn.execute("UPDATE mahsulotlar SET miqdor=miqdor+? WHERE id=?", (t['miqdor'],t['mahsulot_id']))
                conn.execute("DELETE FROM sotuv_tafsilotlari WHERE sotuv_id=?", (sid,))
                conn.execute("DELETE FROM sotuvlar WHERE id=?", (sid,))
                conn.commit(); return self.send_json({'muvaffaqiyat':True})

            m = re.match(r'^/api/qaytarishlar/(\d+)$', path)
            if m:
                taf = conn.execute("SELECT * FROM qaytarish_tafsilotlari WHERE qaytarish_id=?", (m.group(1),)).fetchall()
                for t in taf:
                    conn.execute("UPDATE mahsulotlar SET miqdor=miqdor-? WHERE id=?", (t['miqdor'],t['mahsulot_id']))
                conn.execute("DELETE FROM qaytarish_tafsilotlari WHERE qaytarish_id=?", (m.group(1),))
                conn.execute("DELETE FROM qaytarishlar WHERE id=?", (m.group(1),))
                conn.commit(); return self.send_json({'muvaffaqiyat':True})

            m = re.match(r'^/api/xarajatlar/(\d+)$', path)
            if m:
                conn.execute("DELETE FROM xarajatlar WHERE id=?", (m.group(1),)); conn.commit()
                return self.send_json({'muvaffaqiyat':True})

            self.send_error_json('Topilmadi', 404)
        except Exception as e:
            self.send_error_json(str(e), 500)
        finally:
            conn.close()


if __name__ == '__main__':
    init_db()
    PORT = int(os.environ.get('PORT', 3000))
    print(f"✅ Server ishga tushdi: http://0.0.0.0:{PORT}")
    print(f"👤 Admin: username=admin, parol=admin123")
    print(f"📦 DB: {DB_PATH}")

    # Kunlik hisobot scheduler — background thread
    scheduler_thread = threading.Thread(target=kunlik_hisobot_scheduler, daemon=True)
    scheduler_thread.start()

    # Telegram bot polling — background thread
    polling_thread = threading.Thread(target=telegram_polling_ishga_tushir, daemon=True)
    polling_thread.start()

    server = HTTPServer(('0.0.0.0', PORT), Handler)
    server.serve_forever()