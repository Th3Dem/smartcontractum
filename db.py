"""
SmartContractum — Модуль базы данных и криптографической защиты персональных данных (152-ФЗ)
Хранение учетных записей (Физлица, ИП, Юрлица), сессий и реестра смарт-контрактов.
"""

import os
import sqlite3
import hashlib
import hmac
import secrets
import time
from datetime import datetime

DB_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "data")
DB_PATH = os.path.join(DB_DIR, "smartcontractum.db")

def get_db_connection():
    os.makedirs(DB_DIR, exist_ok=True)
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def hash_password(password: str, salt: str = None) -> tuple[str, str]:
    """
    Криптографически стойкое хеширование паролей по стандарту PBKDF2-HMAC-SHA256 (100 000 итераций).
    Защита от атак по радужным таблицам и подбора.
    """
    if not salt:
        salt = secrets.token_hex(16)
    pwd_hash = hashlib.pbkdf2_hmac(
        'sha256',
        password.encode('utf-8'),
        salt.encode('utf-8'),
        100_000
    ).hex()
    return pwd_hash, salt

def verify_password(password: str, pwd_hash: str, salt: str) -> bool:
    """
    Сравнение хэша с защитой от тайминг-атак (constant time comparison).
    """
    computed, _ = hash_password(password, salt)
    return hmac.compare_digest(computed, pwd_hash)

def init_db():
    """
    Инициализация таблиц базы данных: пользователи, сессии, смарт-контракты.
    """
    conn = get_db_connection()
    cursor = conn.cursor()

    # Таблица пользователей (Физлица, ИП, Организации)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        password_salt TEXT NOT NULL,
        account_type TEXT NOT NULL, -- 'individual', 'ip', 'organization'
        phone TEXT NOT NULL,
        
        -- Поля для физического лица
        last_name TEXT,
        first_name TEXT,
        middle_name TEXT,
        
        -- Поля для Индивидуального предпринимателя (ИП)
        ip_inn TEXT,
        ip_ogrnip TEXT,
        ip_last_name TEXT,
        ip_first_name TEXT,
        ip_middle_name TEXT,
        
        -- Поля для Юридического лица (Организации)
        org_inn TEXT,
        org_ogrn TEXT,
        org_kpp TEXT,
        company_full_name TEXT,
        company_short_name TEXT,
        rep_last_name TEXT,
        rep_first_name TEXT,
        blog_title TEXT DEFAULT '',
        
        is_verified INTEGER DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_login_at TIMESTAMP
    )
    """)

    # Миграция: добавление колонки blog_title, если таблица уже создана ранее
    cursor.execute("PRAGMA table_info(users)")
    cols = [col[1] for col in cursor.fetchall()]
    if "blog_title" not in cols:
        cursor.execute("ALTER TABLE users ADD COLUMN blog_title TEXT DEFAULT ''")

    # Таблица активных сессий авторизации
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS sessions (
        token TEXT PRIMARY KEY,
        user_id INTEGER NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        expires_at REAL NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
    """)

    # Таблица публикаций Сообщества (Q&A Вопросы, Статьи, Обсуждения RFC, Кейсы, Посты)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS feed_posts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        author_name TEXT NOT NULL,
        author_role TEXT DEFAULT '',
        type TEXT NOT NULL, -- 'question', 'article', 'discussion', 'case', 'post'
        category TEXT NOT NULL, -- 'smart-contracts', 'security', 'oracles', 'cbrf-law', 'escrow-b2b', 'marketplace-jobs'
        title TEXT NOT NULL,
        snippet TEXT DEFAULT '',
        content TEXT DEFAULT '',
        tags TEXT DEFAULT '',
        poll_data_json TEXT DEFAULT '',
        code_snippet TEXT DEFAULT '',
        helpful_count INTEGER DEFAULT 0,
        views_count INTEGER DEFAULT 1,
        is_solved INTEGER DEFAULT 0,
        accepted_answer_id INTEGER,
        bounty_amount TEXT DEFAULT '',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """)

    # Таблица комментариев и ответов на вопросы
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS feed_comments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        post_id INTEGER NOT NULL,
        user_id INTEGER,
        author_name TEXT NOT NULL,
        author_role TEXT DEFAULT '',
        content TEXT NOT NULL,
        is_accepted_answer INTEGER DEFAULT 0,
        helpful_count INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (post_id) REFERENCES feed_posts(id) ON DELETE CASCADE
    )
    """)

    # Таблица профессиональной репутации и компетенций
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS user_reputation (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER UNIQUE,
        display_name TEXT NOT NULL,
        score INTEGER DEFAULT 0,
        competencies_json TEXT DEFAULT '[]',
        verified_badges_json TEXT DEFAULT '[]',
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """)

    # Таблица голосований за полезность (дедупликация)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS feed_votes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        post_id INTEGER NOT NULL,
        user_id INTEGER,
        vote_delta INTEGER NOT NULL, -- +1 или -1
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(post_id, user_id)
    )
    """)

    conn.commit()
    conn.close()

    # Сидинг начальных постов при пустой базе
    seed_feed_baseline()


def create_user(user_data: dict) -> dict:
    """
    Создает нового проверенного пользователя в базе данных с защищенным хешированием пароля.
    """
    conn = get_db_connection()
    cursor = conn.cursor()

    email = user_data["email"].strip().lower()
    raw_password = user_data["password"]
    account_type = user_data.get("accountType", "individual")
    phone = user_data.get("phone", "")

    pwd_hash, pwd_salt = hash_password(raw_password)

    # Извлечение данных в зависимости от типа субъекта
    last_name = user_data.get("lastName", "")
    first_name = user_data.get("firstName", "")
    middle_name = user_data.get("middleName", "")

    ip_inn = user_data.get("ipInn", "")
    ip_ogrnip = user_data.get("ipOgrnip", "")
    ip_last_name = user_data.get("ipLastName", "")
    ip_first_name = user_data.get("ipFirstName", "")
    ip_middle_name = user_data.get("ipMiddleName", "")

    org_inn = user_data.get("orgInn", "")
    org_ogrn = user_data.get("orgOgrn", "")
    org_kpp = user_data.get("orgKpp", "")
    company_full = user_data.get("companyFullName", "")
    company_short = user_data.get("companyShortName", "")
    rep_last_name = user_data.get("repLastName", "")
    rep_first_name = user_data.get("repFirstName", "")

    # Проверка существования пользователя
    cursor.execute("SELECT id FROM users WHERE email = ?", (email,))
    existing = cursor.fetchone()
    if existing:
        # Обновляем пароль и данные пользователя при повторной верификации
        user_id = existing["id"]
        cursor.execute("""
            UPDATE users SET
                password_hash = ?, password_salt = ?, account_type = ?, phone = ?,
                last_name = ?, first_name = ?, middle_name = ?,
                ip_inn = ?, ip_ogrnip = ?, ip_last_name = ?, ip_first_name = ?, ip_middle_name = ?,
                org_inn = ?, org_ogrn = ?, org_kpp = ?, company_full_name = ?, company_short_name = ?,
                rep_last_name = ?, rep_first_name = ?, is_verified = 1
            WHERE id = ?
        """, (
            pwd_hash, pwd_salt, account_type, phone,
            last_name, first_name, middle_name,
            ip_inn, ip_ogrnip, ip_last_name, ip_first_name, ip_middle_name,
            org_inn, org_ogrn, org_kpp, company_full, company_short,
            rep_last_name, rep_first_name, user_id
        ))
    else:
        cursor.execute("""
            INSERT INTO users (
                email, password_hash, password_salt, account_type, phone,
                last_name, first_name, middle_name,
                ip_inn, ip_ogrnip, ip_last_name, ip_first_name, ip_middle_name,
                org_inn, org_ogrn, org_kpp, company_full_name, company_short_name,
                rep_last_name, rep_first_name, is_verified
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
        """, (
            email, pwd_hash, pwd_salt, account_type, phone,
            last_name, first_name, middle_name,
            ip_inn, ip_ogrnip, ip_last_name, ip_first_name, ip_middle_name,
            org_inn, org_ogrn, org_kpp, company_full, company_short,
            rep_last_name, rep_first_name
        ))
        user_id = cursor.lastrowid

        # Добавляем стартовые типовые шаблоны смарт-контрактов для нового кабинета
        seed_starter_contracts(cursor, user_id, account_type, company_short or f"{last_name} {first_name}")

    conn.commit()
    user = get_user_by_id(user_id)
    conn.close()
    return user

def seed_starter_contracts(cursor, user_id: int, account_type: str, display_name: str):
    """
    Добавляет первичные шаблоны смарт-контрактов в реестр пользователя.
    """
    year = datetime.now().year
    starter_contracts = [
        (f"SC-{year}-001", "Договор возмездного оказания услуг с обеспечением эскроу", "ООО «Цифровые Технологии»", "350 000 ₽", "active"),
        (f"SC-{year}-002", "Соглашение о конфиденциальности (NDA) с криптоподписью", "АО «Инновационный Центр»", "Бессрочно", "active"),
        (f"SC-{year}-003", "Договор поставки оборудования с автоматическим актированием", "ООО «Логистик Групп»", "1 240 000 ₽", "negotiation")
    ]
    for num, title, cparty, amount, status in starter_contracts:
        cursor.execute("""
            INSERT INTO contracts (user_id, contract_number, title, counterparty, amount, status)
            VALUES (?, ?, ?, ?, ?, ?)
        """, (user_id, num, title, cparty, amount, status))

def authenticate_user(email: str, password: str) -> dict | None:
    """
    Проверяет email и пароль пользователя. При успехе возвращает профиль.
    """
    conn = get_db_connection()
    cursor = conn.cursor()
    clean_email = email.strip().lower()

    cursor.execute("SELECT * FROM users WHERE email = ?", (clean_email,))
    user_row = cursor.fetchone()

    if not user_row:
        conn.close()
        return None

    if not verify_password(password, user_row["password_hash"], user_row["password_salt"]):
        conn.close()
        return None

    # Обновляем время последнего входа
    cursor.execute("UPDATE users SET last_login_at = CURRENT_TIMESTAMP WHERE id = ?", (user_row["id"],))
    conn.commit()
    
    user_id = user_row["id"]
    conn.close()
    return get_user_by_id(user_id)

def create_session(user_id: int, duration_days: int = 7) -> str:
    """
    Генерирует криптографически стойкий 256-битный токен сессии.
    """
    token = secrets.token_hex(32)
    expires_at = time.time() + (duration_days * 86400)

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("INSERT INTO sessions (token, user_id, expires_at) VALUES (?, ?, ?)", (token, user_id, expires_at))
    conn.commit()
    conn.close()
    return token

def get_user_by_token(token: str) -> dict | None:
    """
    Находит пользователя по действующему токену сессии.
    """
    if not token:
        return None
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT users.* FROM users
        JOIN sessions ON users.id = sessions.user_id
        WHERE sessions.token = ? AND sessions.expires_at > ?
    """, (token, time.time()))
    
    row = cursor.fetchone()
    conn.close()
    if not row:
        return None
    return sanitize_user_dict(dict(row))

def delete_session(token: str):
    """
    Завершает сессию (Logout).
    """
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM sessions WHERE token = ?", (token,))
    conn.commit()
    conn.close()

def get_user_by_id(user_id: int) -> dict | None:
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM users WHERE id = ?", (user_id,))
    row = cursor.fetchone()
    conn.close()
    if not row:
        return None
    return sanitize_user_dict(dict(row))

def get_user_contracts(user_id: int) -> list[dict]:
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM contracts WHERE user_id = ? ORDER BY id DESC", (user_id,))
    rows = cursor.fetchall()
    conn.close()
    return [dict(r) for r in rows]

def sanitize_user_dict(user: dict) -> dict:
    """
    Удаляет конфиденциальные хэши и соли перед отправкой в клиентское API (152-ФЗ).
    """
    safe = dict(user)
    safe.pop("password_hash", None)
    safe.pop("password_salt", None)
    
    # Формируем читаемое имя в зависимости от типа субъекта
    acc_type = safe.get("account_type", "individual")
    if acc_type == "individual":
        safe["displayName"] = f"{safe.get('last_name', '')} {safe.get('first_name', '')} {safe.get('middle_name', '')}".strip()
        safe["typeLabel"] = "Физическое лицо"
    elif acc_type == "ip":
        safe["displayName"] = f"ИП {safe.get('ip_last_name', '')} {safe.get('ip_first_name', '')} {safe.get('ip_middle_name', '')}".strip()
        safe["typeLabel"] = "Индивидуальный предприниматель"
    elif acc_type == "organization":
        safe["displayName"] = safe.get("company_short_name") or safe.get("company_full_name") or "Организация"
        safe["representative"] = f"{safe.get('rep_last_name', '')} {safe.get('rep_first_name', '')}".strip()
        safe["typeLabel"] = "Юридическое лицо (Организация)"

    return safe

def get_user_by_email(email: str) -> dict | None:
    """
    Находит пользователя по email (без учета регистра).
    """
    if not email:
        return None
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM users WHERE email = ?", (email.strip().lower(),))
    row = cursor.fetchone()
    conn.close()
    if not row:
        return None
    return dict(row)

def update_user_password(email: str, new_password: str) -> bool:
    """
    Обновляет пароль пользователя с новым хэшем PBKDF2-HMAC-SHA256 и сбрасывает все активные сессии.
    """
    user = get_user_by_email(email)
    if not user:
        return False
    pwd_hash, pwd_salt = hash_password(new_password)
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("UPDATE users SET password_hash = ?, password_salt = ? WHERE id = ?", (pwd_hash, pwd_salt, user["id"]))
    cursor.execute("DELETE FROM sessions WHERE user_id = ?", (user["id"],))
    conn.commit()
    conn.close()
    return True

def change_user_password(user_id: int, current_pwd: str, new_pwd: str) -> tuple[bool, str | None]:
    """
    Безопасная смена пароля авторизованным пользователем.
    Проверяет текущий пароль и хэширует новый по PBKDF2-HMAC-SHA256.
    """
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM users WHERE id = ?", (user_id,))
    user = cursor.fetchone()
    if not user:
        conn.close()
        return False, "Пользователь не найден"

    if not verify_password(current_pwd, user["password_hash"], user["password_salt"]):
        conn.close()
        return False, "Неверно указан текущий пароль"

    if not new_pwd or len(new_pwd) < 8:
        conn.close()
        return False, "Новый пароль должен содержать не менее 8 символов"

    new_hash, new_salt = hash_password(new_pwd)
    cursor.execute("UPDATE users SET password_hash = ?, password_salt = ? WHERE id = ?", (new_hash, new_salt, user_id))
    conn.commit()
    conn.close()
    return True, "Пароль успешно изменен"

def update_user_profile(user_id: int, data: dict) -> tuple[bool, str | None, dict | None]:
    """
    Обновляет персональные данные профиля (ФИО, телефон, email, название блога).
    Проверяет уникальность email среди других пользователей.
    Возвращает (success, error_message, updated_user).
    """
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute("SELECT * FROM users WHERE id = ?", (user_id,))
    user_row = cursor.fetchone()
    if not user_row:
        conn.close()
        return False, "Пользователь не найден", None
    
    current_user = dict(user_row)
    acc_type = current_user.get("account_type", "individual")
    
    # 1. Валидация E-mail
    if "email" in data:
        new_email = str(data["email"]).strip().lower()
        if not new_email or "@" not in new_email:
            conn.close()
            return False, "Укажите корректный адрес электронной почты (E-mail)", None
        
        # Проверка уникальности email
        cursor.execute("SELECT id FROM users WHERE email = ? AND id != ?", (new_email, user_id))
        conflict = cursor.fetchone()
        if conflict:
            conn.close()
            return False, "Пользователь с таким адресом электронной почты уже зарегистрирован", None
    else:
        new_email = current_user.get("email", "")

    if "phone" in data:
        new_phone = str(data["phone"]).strip()
        if new_phone and len(new_phone) < 10:
            conn.close()
            return False, "Укажите корректный номер телефона", None
    else:
        new_phone = current_user.get("phone", "")

    if "lastName" in data or "last_name" in data:
        last_name = str(data.get("lastName") if "lastName" in data else data.get("last_name", "")).strip()
    else:
        last_name = current_user.get("last_name") or current_user.get("ip_last_name") or current_user.get("rep_last_name") or ""

    if "firstName" in data or "first_name" in data:
        first_name = str(data.get("firstName") if "firstName" in data else data.get("first_name", "")).strip()
    else:
        first_name = current_user.get("first_name") or current_user.get("ip_first_name") or current_user.get("rep_first_name") or ""

    if "middleName" in data or "middle_name" in data:
        middle_name = str(data.get("middleName") if "middleName" in data else data.get("middle_name", "")).strip()
    else:
        middle_name = current_user.get("middle_name") or current_user.get("ip_middle_name") or ""

    if "blogTitle" in data or "blog_title" in data:
        blog_title = str(data.get("blogTitle") if "blogTitle" in data else data.get("blog_title", "")).strip()
    else:
        blog_title = current_user.get("blog_title", "")

    if acc_type == "individual":
        cursor.execute("""
            UPDATE users
            SET last_name = ?, first_name = ?, middle_name = ?, phone = ?, email = ?, blog_title = ?
            WHERE id = ?
        """, (
            last_name,
            first_name,
            middle_name,
            new_phone,
            new_email,
            blog_title,
            user_id
        ))
    elif acc_type == "ip":
        cursor.execute("""
            UPDATE users
            SET ip_last_name = ?, ip_first_name = ?, ip_middle_name = ?, phone = ?, email = ?, blog_title = ?
            WHERE id = ?
        """, (
            last_name,
            first_name,
            middle_name,
            new_phone,
            new_email,
            blog_title,
            user_id
        ))
    elif acc_type == "organization":
        cursor.execute("""
            UPDATE users
            SET rep_last_name = ?, rep_first_name = ?, phone = ?, email = ?, blog_title = ?
            WHERE id = ?
        """, (
            last_name,
            first_name,
            new_phone,
            new_email,
            blog_title,
            user_id
        ))
    else:
        cursor.execute("""
            UPDATE users
            SET last_name = ?, first_name = ?, middle_name = ?, phone = ?, email = ?, blog_title = ?
            WHERE id = ?
        """, (
            last_name, first_name, middle_name, new_phone, new_email, blog_title, user_id
        ))
    
    conn.commit()

    
    cursor.execute("SELECT * FROM users WHERE id = ?", (user_id,))
    updated_row = cursor.fetchone()
    conn.close()
    
    return True, None, sanitize_user_dict(dict(updated_row))


# =============================================================================
# Q&A, ЛЕНТА СООБЩЕСТВА, БАЗА ЗНАНИЙ И РЕПУТАЦИЯ
# =============================================================================

def seed_feed_baseline():
    """
    Первичный сидинг профессиональной базы знаний и Q&A при пустой таблице feed_posts.
    """
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute("SELECT COUNT(*) FROM feed_posts")
        cnt = cursor.fetchone()[0]
        if cnt > 0:
            conn.close()
            return

        # 1. RFC-04 Discussion
        cursor.execute("""
            INSERT INTO feed_posts (
                author_name, author_role, type, category, title, snippet, content, tags,
                poll_data_json, helpful_count, views_count, is_solved
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            "Рабочая группа стандартов SmartContractum [DEMO]",
            "Общественные консультации · Экспертный совет",
            "discussion",
            "oracles",
            "RFC-04: Стандарты децентрализованных оракулов для смарт-контрактов ПКСК",
            "Инициировано открытое экспертное обсуждение архитектуры отказоустойчивых шлюзов доставки внешних данных в платформу смарт-контрактов. Голосуйте за предпочтительный механизм консенсуса оракулов.",
            "Полный текст спецификации RFC-04 включает требования к ZK-доказательствам истинности внешних котировок и прямому ГОСТ TLS-соединению с государственными реестрами.",
            "#пкск-цб-рф, #rfc-стандарты, #оракулы, #голосование",
            '{"options": [{"id": 1, "text": "Прямой TLS-шлюз с подписью ГОСТ (ФНС / Казначейство)", "votes": 202}, {"id": 2, "text": "Децентрализованный ZK-комитет нод валидаторов", "votes": 108}, {"id": 3, "text": "Гибридная модель (Tee-анклавы + ончейн-мультисиг)", "votes": 38}], "totalVotes": 348}',
            78,
            1840,
            0
        ))

        # 2. Article: КС-2/КС-3 и смарт-эскроу
        cursor.execute("""
            INSERT INTO feed_posts (
                author_name, author_role, type, category, title, snippet, content, tags,
                code_snippet, helpful_count, views_count, is_solved
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            "Дарья Воронова",
            "Fintech & Smart-Law Counsel · Репутация: +980 (Право & ЦБ РФ)",
            "article",
            "cbrf-law",
            "Связка закрывающих строительных актов КС-2/КС-3 с ончейн-эскроу в цифровом рубле",
            "Пошаговый разбор юридических и технических аспектов автоматического раскрытия депонированных средств при получении подписанного УКЭП акта приемки выполненных строительных работ.",
            "В статье рассматриваются прецеденты применения статьи 860.7 ГК РФ (Договор счета эскроу) в связке с автоматизированным шлюзом цифрового рубля.",
            "#смарт-эскроу, #строительство-кс2, #цифровой-рубль, #гк-рф",
            "// Пример верификации акта КС-2 в смарт-эскроу\nfunction releaseMilestone(bytes32 actHash, bytes calldata gostSign) external onlyEscrowAgent {\n    require(verifyGost3410(actHash, gostSign, vendorPubKey), \"Invalid GOST signature\");\n    cbrfDigitalRuble.transferFrom(escrowVault, contractorAddress, milestoneAmount);\n}",
            94,
            3200,
            0
        ))

        # 3. Case: 1C:ERP
        cursor.execute("""
            INSERT INTO feed_posts (
                author_name, author_role, type, category, title, snippet, content, tags,
                helpful_count, views_count, is_solved
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            "Елена Крылова",
            "Lead Architect · SmartContractum · Репутация: +1 420 (Разработка)",
            "case",
            "escrow-b2b",
            "Паспорт сценария: B2B взаиморасчеты через 1С:ERP и Цифровой рубль без кассовых разрывов",
            "Типовой паспорт интеграции учетной системы 1С:Предприятие со смарт-эскроу. Позволяет предприятиям осуществлять сквозную постоплату поставок сырья по факту закрытия складских ордеров в реальном времени.",
            "Архитектура решения базируется на прямом REST/gRPC шлюзе 1С к смарт-контракту эскроу.",
            "#1c-erp, #смарт-эскроу, #в2в-расчеты, #автоматизация",
            112,
            4150,
            0
        ))

        # 4. Question: ГОСТ Р 34.10 в EVM (с принятым решением)
        cursor.execute("""
            INSERT INTO feed_posts (
                author_name, author_role, type, category, title, snippet, content, tags,
                helpful_count, views_count, is_solved, bounty_amount
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            "Александр Попов",
            "EVM Developer · SmartContractum Lab",
            "question",
            "security",
            "Как оптимизировать вызовы прекомпилов ГОСТ Р 34.10 в кастомном EVM-контуре?",
            "При выполнении пакетных проверок 50+ подписей подряд натыкаемся на лимит газа блока. Есть ли проверенные паттерны агрегации хэшей или пакетной верификации без раздувания memory footprint?",
            "Коллеги, проектируем шлюз валидации первичных документов. При проверке одиночной подписи ГОСТ 34.10-2012 тратится 42 000 газа. При цикле for лимит транзакции исчерпывается.",
            "#solidity, #гост-криптография, #evm-precompiles, #газ-оптимизация",
            86,
            2700,
            1,
            "15 000 ₽"
        ))
        q4_id = cursor.lastrowid

        # Ответ к вопросу 4
        cursor.execute("""
            INSERT INTO feed_comments (
                post_id, author_name, author_role, content, is_accepted_answer, helpful_count
            ) VALUES (?, ?, ?, ?, ?, ?)
        """, (
            q4_id,
            "Михаил Соколов",
            "Security Auditor · Репутация: +1 180 (Аудит ИБ)",
            "Рекомендуем использовать паттерн Merkle-аккумулятора: на стороне бэкенда строится дерево Меркла по хэшам актов, а в контракт передается корень и агрегированная подпись. Это снижает gas footprint с 2.1М до 140k на пакет из 50 документов.",
            1,
            42
        ))
        c4_id = cursor.lastrowid
        cursor.execute("UPDATE feed_posts SET accepted_answer_id = ? WHERE id = ?", (c4_id, q4_id))

        # 5. Data Hub Card
        cursor.execute("""
            INSERT INTO feed_posts (
                author_name, author_role, type, category, title, snippet, content, tags,
                helpful_count, views_count, is_solved
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            "Шлюз Оракулов ФНС РФ (ЕГРЮЛ/ЕГРИП)",
            "Демонстрационный контур данных [DEMO] · 99.98% SLA",
            "case",
            "oracles",
            "Доверенный оракул ФНС: Валидация выписок ЕГРЮЛ/ЕГРИП, блокировок счетов и статуса банкротства контрагентов",
            "Интеграционный шлюз поставщика данных для смарт-контрактов. Позволяет смарт-эскроу и кредитным смарт-контрактам проверять правоспособность юрлица и отсутствие блокировок ФНС перед исполнением транзакции.",
            "Шлюз поддерживает криптографическую валидацию TLS ГОСТ и JSON-RPC интерфейс.",
            "#егрюл-фнс, #оракулы, #рынок-данных, #комплаенс",
            65,
            2400,
            0
        ))

        # 6. Post: Short insight (EIP-1153)
        cursor.execute("""
            INSERT INTO feed_posts (
                author_name, author_role, type, category, title, snippet, content, tags,
                helpful_count, views_count, is_solved
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            "Михаил Соколов",
            "Security Auditor · Репутация: +1 180 (Аудит ИБ)",
            "post",
            "smart-contracts",
            "Обновлен тестовый стенд верификации смарт-контрактов: поддержка компилятора Yul 0.8.26",
            "В тестовом стенде аудита добавлена автоматическая проверка транзиентной памяти (Transient Storage / EIP-1153) для смарт-эскроу. Теперь gas footprint снижается на 35% при пакетном исполнении взаиморасчетов.",
            "Опкоды TLOAD и TSTORE позволяют реализовывать дешевые мьютексы и защитные реентранси-гарды без лишней записи в постоянный Storage.",
            "#eip1153, #gas-optimization, #yul, #безопасность",
            43,
            1100,
            0
        ))

        # 7. Начальная репутация экспертов
        cursor.execute("INSERT OR IGNORE INTO user_reputation (user_id, display_name, score, competencies_json) VALUES (1, 'Елена Крылова', 1420, '[\"Разработка смарт-контрактов\", \"1С:ERP Архитектура\"]')")
        cursor.execute("INSERT OR IGNORE INTO user_reputation (user_id, display_name, score, competencies_json) VALUES (2, 'Михаил Соколов', 1180, '[\"Аудит ИБ\", \"Solidity Security\", \"EIP-1153\"]')")
        cursor.execute("INSERT OR IGNORE INTO user_reputation (user_id, display_name, score, competencies_json) VALUES (3, 'Дарья Воронова', 980, '[\"Право & ЦБ РФ\", \"Смарт-эскроу\"]')")

        conn.commit()
        conn.close()
    except Exception as e:
        print(f"[DB SEED WARNING] Error during baseline seed: {e}")


def create_feed_post(post_data: dict, user: dict = None) -> tuple[bool, str | None, dict | None]:
    """
    Создает новую публикацию в базе знаний/ленте (вопрос, статья, обсуждение, кейс, пост).
    """
    title = str(post_data.get("title", "")).strip()
    if not title or len(title) < 5:
        return False, "Заголовок публикации должен содержать не менее 5 символов", None
        
    post_type = str(post_data.get("type", "question")).strip().lower()
    if post_type not in ("question", "article", "discussion", "poll", "case", "post"):
        post_type = "question"
    if post_type == "poll":
        post_type = "discussion"

    category = str(post_data.get("category", "smart-contracts")).strip().lower()
    content = str(post_data.get("content", "")).strip()
    snippet = str(post_data.get("snippet", "")).strip()
    if not snippet and content:
        snippet = content[:220] + ("..." if len(content) > 220 else "")

    tags = str(post_data.get("tags", "")).strip()
    code_snippet = str(post_data.get("codeSnippet", "")).strip()
    poll_data_json = str(post_data.get("pollDataJson", "")).strip()
    bounty_amount = str(post_data.get("bountyAmount", "")).strip()

    user_id = user.get("id") if user else None
    if user:
        author_name = user.get("first_name", "") + " " + user.get("last_name", "")
        author_name = author_name.strip() or user.get("company_short_name") or user.get("email")
        author_role = user.get("blog_title") or ("Верифицированный эксперт" if user.get("is_verified") else "Участник сообщества")
    else:
        author_name = str(post_data.get("authorName", "Анонимный специалист")).strip()
        author_role = str(post_data.get("authorRole", "Участник сообщества")).strip()

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO feed_posts (
            user_id, author_name, author_role, type, category, title, snippet, content,
            tags, poll_data_json, code_snippet, helpful_count, views_count, is_solved, bounty_amount
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 1, 0, ?)
    """, (
        user_id, author_name, author_role, post_type, category, title, snippet, content,
        tags, poll_data_json, code_snippet, bounty_amount
    ))
    new_id = cursor.lastrowid
    conn.commit()

    cursor.execute("SELECT * FROM feed_posts WHERE id = ?", (new_id,))
    row = cursor.fetchone()
    conn.close()

    return True, None, dict(row)


def get_feed_posts(post_type: str = None, category: str = None, search: str = None, limit: int = 50, offset: int = 0) -> list[dict]:
    """
    Возвращает список публикаций с поддержкой фильтрации и поиска.
    """
    conn = get_db_connection()
    cursor = conn.cursor()

    query = "SELECT * FROM feed_posts WHERE 1=1"
    params = []

    if post_type and post_type not in ("all", "for-you", "following"):
        if post_type in ("discussion", "poll"):
            query += " AND (type = 'discussion' OR type = 'poll')"
        else:
            query += " AND type = ?"
            params.append(post_type)

    if category and category != "all":
        query += " AND category = ?"
        params.append(category)

    if search:
        search_like = f"%{search.strip().lower()}%"
        query += " AND (LOWER(title) LIKE ? OR LOWER(snippet) LIKE ? OR LOWER(content) LIKE ? OR LOWER(tags) LIKE ? OR LOWER(author_name) LIKE ?)"
        params.extend([search_like, search_like, search_like, search_like, search_like])

    query += " ORDER BY id DESC LIMIT ? OFFSET ?"
    params.extend([limit, offset])

    cursor.execute(query, params)
    rows = cursor.fetchall()
    conn.close()

    return [dict(r) for r in rows]


def get_feed_post_by_id(post_id: int) -> dict | None:
    """
    Возвращает публикацию по ID с инкрементом счетчика просмотров.
    """
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("UPDATE feed_posts SET views_count = views_count + 1 WHERE id = ?", (post_id,))
    conn.commit()

    cursor.execute("SELECT * FROM feed_posts WHERE id = ?", (post_id,))
    row = cursor.fetchone()
    conn.close()
    return dict(row) if row else None


def add_feed_comment(post_id: int, content: str, user: dict = None, is_answer: bool = False) -> tuple[bool, str | None, dict | None]:
    """
    Добавляет комментарий или ответ на вопрос в ветку публикации.
    """
    content = content.strip()
    if not content or len(content) < 2:
        return False, "Текст ответа/комментария не может быть пустым", None

    user_id = user.get("id") if user else None
    if user:
        author_name = user.get("first_name", "") + " " + user.get("last_name", "")
        author_name = author_name.strip() or user.get("company_short_name") or user.get("email")
        author_role = user.get("blog_title") or ("Эксперт" if user.get("is_verified") else "Участник")
    else:
        author_name = "Инженер сообщества"
        author_role = "Участник"

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO feed_comments (
            post_id, user_id, author_name, author_role, content, is_accepted_answer, helpful_count
        ) VALUES (?, ?, ?, ?, ?, 0, 0)
    """, (post_id, user_id, author_name, author_role, content))
    comment_id = cursor.lastrowid
    conn.commit()

    cursor.execute("SELECT * FROM feed_comments WHERE id = ?", (comment_id,))
    row = cursor.fetchone()
    conn.close()

    return True, None, dict(row)


def get_feed_comments(post_id: int) -> list[dict]:
    """
    Возвращает все комментарии и ответы к публикации.
    """
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM feed_comments WHERE post_id = ? ORDER BY is_accepted_answer DESC, id ASC", (post_id,))
    rows = cursor.fetchall()
    conn.close()
    return [dict(r) for r in rows]


def accept_answer(post_id: int, comment_id: int, user: dict = None) -> tuple[bool, str | None, dict | None]:
    """
    Отмечает ответ на вопрос как принятое решение (Accepted Answer) и начисляет +50 очков репутации автору ответа.
    """
    conn = get_db_connection()
    cursor = conn.cursor()

    # Проверка наличия поста
    cursor.execute("SELECT * FROM feed_posts WHERE id = ?", (post_id,))
    post = cursor.fetchone()
    if not post:
        conn.close()
        return False, "Публикация не найдена", None

    # Проверка наличия комментария
    cursor.execute("SELECT * FROM feed_comments WHERE id = ? AND post_id = ?", (comment_id, post_id))
    comment = cursor.fetchone()
    if not comment:
        conn.close()
        return False, "Ответ не найден в данной ветке", None

    # Снимаем предыдущий принятый ответ
    cursor.execute("UPDATE feed_comments SET is_accepted_answer = 0 WHERE post_id = ?", (post_id,))
    # Устанавливаем новый принятый ответ
    cursor.execute("UPDATE feed_comments SET is_accepted_answer = 1 WHERE id = ?", (comment_id,))
    # Обновляем пост
    cursor.execute("UPDATE feed_posts SET is_solved = 1, accepted_answer_id = ? WHERE id = ?", (comment_id, post_id))

    # Начисление репутации автору ответа (+50 очков)
    awarded_points = 50
    comment_user_id = comment["user_id"]
    if comment_user_id:
        cursor.execute("""
            INSERT INTO user_reputation (user_id, display_name, score)
            VALUES (?, ?, ?)
            ON CONFLICT(user_id) DO UPDATE SET score = score + ?
        """, (comment_user_id, comment["author_name"], awarded_points, awarded_points))

    conn.commit()
    conn.close()

    return True, None, {
        "postId": post_id,
        "commentId": comment_id,
        "isSolved": True,
        "reputationAwarded": awarded_points
    }


def vote_feed_post(post_id: int, delta: int, user: dict = None) -> tuple[bool, int]:
    """
    Учитывает голос за полезность («Полезно ▲ / ▼») и обновляет счетчик.
    """
    delta_val = 1 if delta >= 0 else -1
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("UPDATE feed_posts SET helpful_count = helpful_count + ? WHERE id = ?", (delta_val, post_id))
    conn.commit()

    cursor.execute("SELECT helpful_count FROM feed_posts WHERE id = ?", (post_id,))
    row = cursor.fetchone()
    new_count = row[0] if row else 0
    conn.close()

    return True, new_count


def get_top_reputation_users(limit: int = 5) -> list[dict]:
    """
    Возвращает лидерборд экспертов по очкам профессиональной репутации.
    """
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM user_reputation ORDER BY score DESC LIMIT ?", (limit,))
    rows = cursor.fetchall()
    conn.close()
    return [dict(r) for r in rows]


def get_experts_directory(competency: str = None, search: str = None, limit: int = 50, offset: int = 0) -> list[dict]:
    """
    Возвращает каталог специалистов и компаний рынка смарт-контрактов с фильтрацией.
    """
    # Базовые сертифицированные эксперты платформы
    curated_experts = [
        {
            "id": 1,
            "name": "Елена Крылова",
            "initials": "ЕК",
            "role": "Lead Architect & Smart-Contracts Engineer",
            "company": "SmartContractum Lab",
            "score": 1420,
            "category": "smart-contracts",
            "competencies": ["Разработка EVM", "Solidity 0.8.26", "1С:ERP Архитектура", "EIP-1153", "Смарт-эскроу"],
            "badges": ["✓ Верифицирован по ЕГРЮЛ", "🏆 Топ-1 Платформы"],
            "articlesCount": 18,
            "solvedCount": 12,
            "rating": "5.0",
            "avatarClass": "avatar-blue",
            "bio": "Ведущий архитектор смарт-контрактных решений. 8+ лет проектирования децентрализованных систем, протоколов эскроу и интеграции с корпоративными ERP.",
            "contactAvailable": True
        },
        {
            "id": 2,
            "name": "Михаил Соколов",
            "initials": "МС",
            "role": "Security Auditor & Formal Verification Lead",
            "company": "CryptoAudit Pro",
            "score": 1180,
            "category": "security",
            "competencies": ["Аудит ИБ", "Solidity Security", "Yul Оптимизация", "ГОСТ Криптография", "SAST / DAST"],
            "badges": ["✓ Сертифицированный аудитор ИБ", "🏆 Топ-2"],
            "articlesCount": 14,
            "solvedCount": 9,
            "rating": "4.95",
            "avatarClass": "avatar-green",
            "bio": "Специалист по аудиту безопасности смарт-контрактов, формальной верификации байткода и криптографическим протоколам ГОСТ Р 34.10.",
            "contactAvailable": True
        },
        {
            "id": 3,
            "name": "Дарья Воронова",
            "initials": "ДВ",
            "role": "Fintech & Smart-Law Counsel",
            "company": "Fintech Legal Partners",
            "score": 980,
            "category": "cbrf-law",
            "competencies": ["Право & ЦБ РФ", "Смарт-эскроу (ст. 860.7 ГК)", "Цифровой рубль", "ЦФА 259-ФЗ", "Комплаенс"],
            "badges": ["✓ Юрист ЦФА & ПКСК", "🏆 Топ-3"],
            "articlesCount": 11,
            "solvedCount": 8,
            "rating": "4.9",
            "avatarClass": "avatar-purple",
            "bio": "Консультант по правовому структурированию смарт-эскроу сделок, выпуску цифровых финансовых активов и взаимодействию с Банком России.",
            "contactAvailable": True
        },
        {
            "id": 4,
            "name": "Александр Попов",
            "initials": "АП",
            "role": "EVM Core & Protocol Engineer",
            "company": "SmartContractum Core Team",
            "score": 860,
            "category": "smart-contracts",
            "competencies": ["EVM Precompiles", "ГОСТ 34.10 в EVM", "Solidity", "ZK-Rollups", "Gas Profiling"],
            "badges": ["✓ Протокольный инженер"],
            "articlesCount": 7,
            "solvedCount": 6,
            "rating": "4.85",
            "avatarClass": "avatar-blue",
            "bio": "Инженер виртуальных машин и прекомпилов криптографических стандартов ГОСТ для кастомных EVM-сетей.",
            "contactAvailable": True
        },
        {
            "id": 5,
            "name": "ООО «Финтех Интеграция»",
            "initials": "ФИ",
            "role": "Корпоративный интегратор 1С и ПКСК",
            "company": "ИТ-Интегратор",
            "score": 790,
            "category": "escrow-b2b",
            "competencies": ["1C:Предприятие 8.3", "Смарт-эскроу", "Шлюзы Оракулов", "B2B Взаиморасчеты", "КС-2 / КС-3"],
            "badges": ["✓ Аккредитованная IT-компания (ИНН 7701234567)"],
            "articlesCount": 5,
            "solvedCount": 4,
            "rating": "4.8",
            "avatarClass": "avatar-green",
            "bio": "Системный интегратор корпоративных ERP и казначейских систем с ончейн-эскроу контрактами в цифровых рублях.",
            "contactAvailable": True
        },
        {
            "id": 6,
            "name": "Шлюз Оракулов ФНС РФ (Демо-контур)",
            "initials": "ФНС",
            "role": "Провайдер внешних данных [DEMO]",
            "company": "SmartContractum Data Hub",
            "score": 650,
            "category": "oracles",
            "competencies": ["ЕГРЮЛ / ЕГРИП", "Оракулы данных", "TLS ГОСТ", "99.98% SLA"],
            "badges": ["✓ Демо-шлюз данных"],
            "articlesCount": 4,
            "solvedCount": 3,
            "rating": "4.75",
            "avatarClass": "avatar-purple",
            "bio": "Поставщик оракулов правоспособности юрлиц, блокировок счетов и финансовой надежности контрагентов.",
            "contactAvailable": True
        }
    ]

    # Дополняем зарегистрированными пользователями из БД
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("""
            SELECT u.id, u.first_name, u.last_name, u.email, u.blog_title, u.account_type, u.company_short_name,
                   COALESCE(r.score, 50) as score, COALESCE(r.competencies_json, '[]') as comp_json
            FROM users u
            LEFT JOIN user_reputation r ON u.id = r.user_id
            WHERE u.is_verified = 1
            ORDER BY score DESC
        """)
        db_users = cursor.fetchall()
        conn.close()

        for u in db_users:
            u_id = 100 + u["id"]
            name = (u["first_name"] or "") + " " + (u["last_name"] or "")
            name = name.strip() or u["company_short_name"] or u["email"]
            initials = (name[:2]).upper() if name else "СП"
            
            curated_experts.append({
                "id": u_id,
                "name": name,
                "initials": initials,
                "role": u["blog_title"] or "Специалист сообщества",
                "company": u["company_short_name"] or "Независимый эксперт",
                "score": u["score"],
                "category": "smart-contracts",
                "competencies": ["Разработка смарт-контрактов", "EVM", "Аудит"],
                "badges": ["✓ Верифицирован"],
                "articlesCount": 2,
                "solvedCount": 1,
                "rating": "4.8",
                "avatarClass": "avatar-blue",
                "bio": f"Эксперт сообщества SmartContractum. Специализируется на смарт-контрактах и правовых моделях.",
                "contactAvailable": True
            })
    except Exception:
        pass

    # Фильтрация
    results = []
    for exp in curated_experts:
        # Фильтр по компетенции
        if competency and competency not in ("all", "all-directions"):
            match_cat = (exp.get("category") == competency)
            match_comp = any(competency.lower() in c.lower() for c in exp.get("competencies", []))
            if not (match_cat or match_comp):
                continue

        # Фильтр по поиску
        if search:
            s = search.strip().lower()
            text_to_search = f"{exp['name']} {exp['role']} {exp['company']} {' '.join(exp['competencies'])} {exp['bio']}".lower()
            if s not in text_to_search:
                continue

        results.append(exp)

    return results[offset:offset + limit]


def get_expert_profile(expert_id: int) -> dict | None:
    """
    Возвращает детальный публичный профиль эксперта.
    """
    experts = get_experts_directory(limit=200)
    for exp in experts:
        if exp["id"] == expert_id:
            # Получаем публикации эксперта из БД
            conn = get_db_connection()
            cursor = conn.cursor()
            cursor.execute("SELECT id, title, type, category, helpful_count, created_at FROM feed_posts WHERE author_name LIKE ? LIMIT 5", (f"%{exp['name'].split()[0]}%",))
            posts = [dict(r) for r in cursor.fetchall()]
            conn.close()

            exp_copy = dict(exp)
            exp_copy["publications"] = posts
            return exp_copy

    return None


def get_hubs_list() -> list[dict]:
    """
    Возвращает список 6 ключевых хабов знаний с агрегированной статистикой.
    """
    hubs_meta = [
        {
            "slug": "smart-contracts",
            "name": "Разработка EVM & Смарт-контракты",
            "icon": "⚡",
            "category": "smart-contracts",
            "description": "Архитектура Solidity, опкоды EVM, EIP-1153 transient storage, прекомпилы ГОСТ, оптимизация газа и байткода.",
            "tags": ["#solidity", "#evm", "#eip1153", "#gas-opt", "#yul"],
            "subscribersCount": 1240
        },
        {
            "slug": "security",
            "name": "Аудит ИБ & Верификация",
            "icon": "🛡️",
            "category": "security",
            "description": "Формальная верификация, аудит байткода, защита от reentrancy, криптография ГОСТ Р 34.10 и SAST/DAST анализ.",
            "tags": ["#security", "#formal-verification", "#audit", "#gost-crypto", "#sast"],
            "subscribersCount": 980
        },
        {
            "slug": "oracles",
            "name": "Оракулы & Рынок данных",
            "icon": "🌐",
            "category": "oracles",
            "description": "Шлюзы внешних данных, государственные реестры ФНС / Росреестр, интеграция с IoT и криптографическая подпись TLS ГОСТ.",
            "tags": ["#oracles", "#data-feed", "#egrul", "#tls-gost", "#chainlink"],
            "subscribersCount": 760
        },
        {
            "slug": "cbrf-law",
            "name": "Право, ЦБ РФ & ЦФА",
            "icon": "🏛️",
            "category": "cbrf-law",
            "description": "Регулирование смарт-контрактов, ст. 860.7 ГК РФ (эскроу), платформа ПКСК Банка России, цифровой рубль и 259-ФЗ.",
            "tags": ["#cbrf", "#smart-law", "#cfa", "#digital-ruble", "#escrow-law"],
            "subscribersCount": 1120
        },
        {
            "slug": "escrow-b2b",
            "name": "Смарт-эскроу & 1С:Предприятие",
            "icon": "💼",
            "category": "escrow-b2b",
            "description": "Интеграция корпоративных ERP и 1С, закрывающие акты КС-2/КС-3, ончейн-факторинг и безопасные B2B-взаиморасчеты.",
            "tags": ["#1c-erp", "#b2b-escrow", "#ks2-ks3", "#factoring", "#smart-treasury"],
            "subscribersCount": 840
        },
        {
            "slug": "marketplace-jobs",
            "name": "Биржа заказов & Проектные команды",
            "icon": "🤝",
            "category": "marketplace-jobs",
            "description": "Поиск подрядчиков, тендеры на аудит смарт-контрактов, вакансии для EVM-разработчиков и проектные команды.",
            "tags": ["#jobs", "#bounty", "#dev-teams", "#tenders", "#freelance"],
            "subscribersCount": 650
        }
    ]

    conn = get_db_connection()
    cursor = conn.cursor()

    result = []
    for h in hubs_meta:
        cursor.execute("SELECT COUNT(*) FROM feed_posts WHERE category = ?", (h["slug"],))
        posts_cnt = cursor.fetchone()[0]

        cursor.execute("SELECT COUNT(*) FROM feed_posts WHERE category = ? AND type = 'question'", (h["slug"],))
        questions_cnt = cursor.fetchone()[0]

        cursor.execute("SELECT COUNT(*) FROM feed_posts WHERE category = ? AND type = 'article'", (h["slug"],))
        articles_cnt = cursor.fetchone()[0]

        experts = get_experts_directory(competency=h["slug"])

        h_copy = dict(h)
        h_copy["postsCount"] = max(posts_cnt, 2)
        h_copy["questionsCount"] = max(questions_cnt, 1)
        h_copy["articlesCount"] = max(articles_cnt, 1)
        h_copy["expertsCount"] = max(len(experts), 1)
        result.append(h_copy)

    conn.close()
    return result


def get_hub_details(slug: str) -> dict | None:
    """
    Возвращает развернутую информацию о хабе, его публикации и топ экспертов.
    """
    hubs = get_hubs_list()
    hub = next((h for h in hubs if h["slug"] == slug), None)
    if not hub:
        return None

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT id, author_name, author_role, type, category, title, snippet, helpful_count, views_count, is_solved, created_at
        FROM feed_posts
        WHERE category = ?
        ORDER BY helpful_count DESC, id DESC
        LIMIT 10
    """, (slug,))
    posts = [dict(r) for r in cursor.fetchall()]
    conn.close()

    experts = get_experts_directory(competency=slug, limit=4)

    return {
        "hub": hub,
        "posts": posts,
        "experts": experts
    }


# Инициализируем БД при импорте
init_db()






