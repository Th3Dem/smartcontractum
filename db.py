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
        
        is_verified INTEGER DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_login_at TIMESTAMP
    )
    """)

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

    # Таблица смарт-контрактов
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS contracts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        contract_number TEXT NOT NULL,
        title TEXT NOT NULL,
        counterparty TEXT NOT NULL,
        amount TEXT NOT NULL,
        status TEXT NOT NULL, -- 'draft', 'negotiation', 'active', 'completed'
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
    """)

    conn.commit()
    conn.close()

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

# Инициализируем БД при импорте
init_db()
