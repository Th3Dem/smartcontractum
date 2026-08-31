#!/usr/bin/env python3
"""
SmartContractum — Full Backend Server with Database Storage, 152-FZ Protection,
Live EGRUL/EGRIP Proxy & Real SMTP Email Delivery
"""

import os
import sys
import json
import time
import random
import secrets
import hmac
import hashlib
import smtplib
import ssl
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.header import Header
from email.utils import formataddr
import urllib.request
import urllib.parse
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler


import db

PORT = int(sys.argv[1]) if len(sys.argv) > 1 and sys.argv[1].isdigit() else 3000
PUBLIC_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "public")

USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"

# Автозагрузка переменных окружения из .env
def load_env_file():
    env_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), ".env")
    if os.path.exists(env_path):
        with open(env_path, "r", encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith("#") and "=" in line:
                    k, v = line.split("=", 1)
                    os.environ[k.strip()] = v.strip().strip("'").strip('"')

load_env_file()

# Временное хранилище сессий верификации E-mail: clean_email -> {"code": "839102", "payload": {...}, "expires": timestamp}
EMAIL_SESSIONS = {}

# Временное хранилище сессий сброса пароля: clean_email -> {"code": "...", "expires": ..., "verified": bool, "reset_token": "...", "token_expires": ...}
PASSWORD_RESET_SESSIONS = {}

# Временное хранилище сессий смены пароля в кабинете (Безопасность): user_id -> {"code": "...", "email": "...", "expires": ..., "verified": bool, "change_token": "...", "token_expires": ...}
SECURITY_PASSWORD_RESET_SESSIONS = {}



def validate_inn_checksum(inn: str) -> bool:
    """
    Проверка контрольной суммы ИНН (ФНС России):
    - 10 цифр для юридических лиц
    - 12 цифр для физических лиц и ИП
    """
    if not inn.isdigit():
        return False
    if len(inn) == 10:
        coeffs = [2, 4, 10, 3, 5, 9, 4, 6, 8]
        control = sum(int(digit) * coeff for digit, coeff in zip(inn[:9], coeffs)) % 11 % 10
        return control == int(inn[9])
    elif len(inn) == 12:
        coeffs1 = [7, 2, 4, 10, 3, 5, 9, 4, 6, 8]
        control1 = sum(int(digit) * coeff for digit, coeff in zip(inn[:10], coeffs1)) % 11 % 10
        coeffs2 = [3, 7, 2, 4, 10, 3, 5, 9, 4, 6, 8]
        control2 = sum(int(digit) * coeff for digit, coeff in zip(inn[:11], coeffs2)) % 11 % 10
        return control1 == int(inn[10]) and control2 == int(inn[11])
    return False

def parse_ip_fio(name_str: str):
    """
    Извлекает Фамилию, Имя и Отчество из строки ЕГРИП
    """
    clean = name_str.upper()
    prefixes = [
        'ИНДИВИДУАЛЬНЫЙ ПРЕДПРИНИМАТЕЛЬ',
        'ИП',
        'ГЛАВА КФХ',
        'ГЛАВА КРЕСТЬЯНСКОГО (ФЕРМЕРСКОГО) ХОЗЯЙСТВА',
        'КРЕСТЬЯНСКОЕ (ФЕРМЕРСКОЕ) ХОЗЯЙСТВО'
    ]
    for prefix in prefixes:
        clean = clean.replace(prefix, '')
    clean = clean.replace('"', '').replace("'", '').strip()
    tokens = [t.capitalize() for t in clean.split() if t]
    
    last = tokens[0] if len(tokens) >= 1 else ''
    first = tokens[1] if len(tokens) >= 2 else ''
    middle = ' '.join(tokens[2:]) if len(tokens) >= 3 else ''
    return last, first, middle

def query_egrul_nalog_ru(inn: str):
    """
    Выполняет реальный двухэтапный запрос к API ФНС России (egrul.nalog.ru) для ЕГРЮЛ и ЕГРИП
    """
    clean_inn = "".join(filter(str.isdigit, inn))
    if len(clean_inn) not in (10, 12):
        return {
            "success": False,
            "error": "ИНН должен содержать 10 цифр (юридическое лицо) или 12 цифр (ИП)"
        }

    headers = {
        "User-Agent": USER_AGENT,
        "Accept": "application/json, text/javascript, */*; q=0.01",
        "X-Requested-With": "XMLHttpRequest",
        "Referer": "https://egrul.nalog.ru/index.html",
        "Origin": "https://egrul.nalog.ru"
    }

    try:
        post_data = urllib.parse.urlencode({"query": clean_inn}).encode("utf-8")
        req1 = urllib.request.Request(
            "https://egrul.nalog.ru/",
            data=post_data,
            headers=headers,
            method="POST"
        )
        with urllib.request.urlopen(req1, timeout=8) as resp1:
            token_resp = json.loads(resp1.read().decode("utf-8"))
        
        token = token_resp.get("t")
        if not token:
            return {
                "success": False,
                "error": "Сервис ФНС не вернул идентификатор сессии поиска"
            }

        time.sleep(0.4)
        ts = int(time.time() * 1000)
        res_url = f"https://egrul.nalog.ru/search-result/{token}?r={ts}&_={ts}"
        
        req2 = urllib.request.Request(res_url, headers=headers, method="GET")
        with urllib.request.urlopen(req2, timeout=8) as resp2:
            data = json.loads(resp2.read().decode("utf-8"))

        rows = data.get("rows", [])
        if not rows:
            return {
                "success": False,
                "error": f"Субъект с ИНН {clean_inn} не найден в реестре ЕГРЮЛ/ЕГРИП ФНС России"
            }

        matching_rows = [r for r in rows if r.get("i") == clean_inn or r.get("o") == clean_inn]
        if not matching_rows:
            return {
                "success": False,
                "error": f"Субъект с ИНН {clean_inn} не найден в реестре ЕГРЮЛ/ЕГРИП ФНС России"
            }

        row = matching_rows[0]
        full_name = row.get("n", "").strip()
        short_name = row.get("c", "").strip() or full_name
        ogrn = row.get("o", "").strip()
        kpp = row.get("p", "").strip()
        reg_date = row.get("r", "").strip()
        termination_date = row.get("v", "").strip() or row.get("e", "").strip()
        address = row.get("a", "").strip() or row.get("rn", "").strip()
        ceo_raw = row.get("g", "").strip()
        is_ip = (len(clean_inn) == 12) or (row.get("k") == "ip") or ("ПРЕДПРИНИМАТЕЛЬ" in full_name.upper())

        is_liquidator = any(term in ceo_raw.upper() for term in ["ЛИКВИДАТОР", "ЛИКВИДАЦИОНН", "КОНКУРСНЫЙ УПРАВЛЯЮЩИЙ", "ВНЕШНИЙ УПРАВЛЯЮЩИЙ", "АРБИТРАЖНЫЙ УПРАВЛЯЮЩИЙ"])
        is_liquidated = (
            bool(termination_date)
            or "ликвидирован" in full_name.lower()
            or "прекратил" in full_name.lower()
            or "прекративший" in full_name.lower()
            or "недействующ" in full_name.lower()
            or "в процессе ликвидации" in full_name.lower()
            or is_liquidator
        )
        if is_liquidated:
            if is_liquidator and not termination_date:
                liquidator_role = ceo_raw.split(":")[0].strip() if ":" in ceo_raw else "Ликвидатор"
                status_text = f"Стадия ликвидации (в реестре указан: {liquidator_role})"
            elif termination_date:
                status_text = f"Деятельность прекращена (дата: {termination_date})"
            else:
                status_text = "Ликвидирована / Прекратила деятельность"
            status_type = "LIQUIDATED"
        else:
            status_text = "Действующий предприниматель (ЕГРИП)" if is_ip else "Действующая организация (ЕГРЮЛ)"
            status_type = "ACTIVE"

        if is_ip:
            ip_last, ip_first, ip_middle = parse_ip_fio(full_name)
            ceo_lastname = ip_last
            ceo_firstname = ip_first
        else:
            ip_last = ip_first = ip_middle = ""
            ceo_lastname = ""
            ceo_firstname = ""
            if ceo_raw:
                parts = ceo_raw.split(":")
                name_part = parts[-1].strip() if len(parts) > 1 else ceo_raw
                name_tokens = name_part.split()
                if len(name_tokens) >= 1:
                    ceo_lastname = name_tokens[0]
                if len(name_tokens) >= 2:
                    ceo_firstname = name_tokens[1]

        return {
            "success": True,
            "source": "egrul.nalog.ru (ФНС России)",
            "isIP": is_ip,
            "company": {
                "inn": clean_inn,
                "ogrn": ogrn,
                "ogrnip": ogrn if is_ip else "",
                "kpp": kpp,
                "fullName": full_name,
                "shortName": short_name,
                "statusType": status_type,
                "statusText": status_text,
                "isLiquidated": is_liquidated,
                "address": address,
                "registrationDate": reg_date,
                "terminationDate": termination_date,
                "ceoRaw": ceo_raw,
                "ceoLastName": ceo_lastname,
                "ceoFirstName": ceo_firstname,
                "ipLastName": ip_last,
                "ipFirstName": ip_first,
                "ipMiddleName": ip_middle
            }
        }

    except Exception as exc:
        return {
            "success": False,
            "error": f"Ошибка связи с egrul.nalog.ru: {str(exc)}"
        }

def is_test_email(email: str) -> bool:
    clean = email.lower().strip()
    return any(clean.endswith(dom) for dom in ["@test.ru", "@test.com", "@example.com", "@localhost", "@smartcontractum.ru"]) or os.getenv("TESTING") == "1"

def send_real_email_code(to_email: str, code: str) -> dict:
    """
    Отправляет РЕАЛЬНОЕ электронное письмо с кодом верификации через SMTP.
    Поддерживает Yandex, Mail.ru, Google Workspace, Timeweb, Beget и любые SMTP-сервера.
    """
    load_env_file()
    
    if is_test_email(to_email):
        print(f"[SMTP MOCK DISPATCH] Тестовый адрес {to_email}: код {code} (без обращения к внешнему серверу)")
        return {
            "success": True,
            "realSent": False,
            "provider": "Mock Test",
            "message": f"Письмо с проверочным кодом успешно отправлено на {to_email}"
        }

    smtp_host = os.getenv("SMTP_HOST", "").strip()
    smtp_port = int(os.getenv("SMTP_PORT", "465")) if os.getenv("SMTP_PORT", "465").isdigit() else 465
    smtp_user = os.getenv("SMTP_USER", "").strip()
    smtp_password = os.getenv("SMTP_PASSWORD", "").strip()
    from_name = os.getenv("SMTP_FROM_NAME", "SmartContractum")
    from_email = os.getenv("SMTP_FROM_EMAIL", smtp_user or "no-reply@smartcontractum.ru").strip()

    # Если параметры почтового сервера не заполнены
    if not (smtp_host and smtp_user and smtp_password):
        return {
            "success": False,
            "error": "Почтовый сервер (SMTP) не настроен в файле .env. Пожалуйста, укажите параметры SMTP для реальной отправки писем."
        }

    subject = f"{code} — Код подтверждения регистрации в SmartContractum"


    html_content = f"""<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="utf-8">
  <title>Подтверждение регистрации</title>
</head>
<body style="margin: 0; padding: 30px 10px; background-color: #081628; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #f1f5f9;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0">
    <tr>
      <td align="center">
        <table width="100%" max-width="540" style="max-width: 540px; background-color: #0e223d; border: 1px solid #173e6d; border-radius: 12px; padding: 36px 30px; box-shadow: 0 10px 30px rgba(0,0,0,0.4);" border="0" cellspacing="0" cellpadding="0">
          <tr>
            <td>
              <div style="font-size: 13px; font-weight: 800; color: #2f6fce; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 20px;">
                SMARTCONTRACTUM
              </div>
              <h1 style="font-size: 22px; font-weight: 700; color: #ffffff; margin: 0 0 14px 0;">
                Подтверждение регистрации
              </h1>
              <p style="font-size: 14.5px; line-height: 1.6; color: #94a3b8; margin: 0 0 24px 0;">
                Здравствуйте! Вы указали данный адрес электронной почты для создания личного кабинета на платформе <strong>SmartContractum</strong>.
              </p>
              <div style="text-align: center; margin: 28px 0; padding: 22px; background-color: #081628; border-radius: 8px; border: 1px solid #1e4a80;">
                <div style="font-size: 12px; text-transform: uppercase; letter-spacing: 1.5px; color: #64748b; margin-bottom: 8px;">
                  Ваш проверочный код
                </div>
                <div style="font-size: 34px; font-weight: 800; letter-spacing: 8px; color: #38bdf8; font-family: monospace, monospace;">
                  {code}
                </div>
              </div>
              <p style="font-size: 13px; line-height: 1.5; color: #64748b; margin: 0 0 12px 0;">
                ⏱ Код действителен в течение <strong>10 минут</strong>. Не передавайте данный код третьим лицам.
              </p>
              <p style="font-size: 12px; line-height: 1.4; color: #475569; margin: 20px 0 0 0; border-top: 1px solid #173e6d; padding-top: 16px;">
                Если вы не совершали запрос на регистрацию, просто проигнорируйте это письмо.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>"""

    try:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = Header(subject, "utf-8")
        msg["From"] = formataddr((str(Header(from_name, "utf-8")), from_email))
        msg["To"] = to_email

        text_part = MIMEText(f"Здравствуйте! Ваш код подтверждения SmartContractum: {code}. Код действителен 10 минут.", "plain", "utf-8")
        html_part = MIMEText(html_content, "html", "utf-8")

        msg.attach(text_part)
        msg.attach(html_part)

        if smtp_port == 465:
            context = ssl.create_default_context()
            with smtplib.SMTP_SSL(smtp_host, smtp_port, context=context, timeout=12) as server:
                server.login(smtp_user, smtp_password)
                server.sendmail(from_email, [to_email], msg.as_string())
        else:
            with smtplib.SMTP(smtp_host, smtp_port, timeout=12) as server:
                server.starttls()
                server.login(smtp_user, smtp_password)
                server.sendmail(from_email, [to_email], msg.as_string())

        print(f"[SMTP REAL DISPATCH] Письмо с кодом успешно отправлено на {to_email} через {smtp_host}")
        return {
            "success": True,
            "realSent": True,
            "provider": f"SMTP ({smtp_host})",
            "message": f"Письмо с проверочным кодом успешно отправлено на {to_email}"
        }
    except Exception as exc:
        print(f"[SMTP ERROR] Ошибка отправки на {to_email}: {exc}")
        return {
            "success": False,
            "error": f"Ошибка отправки через почтовый сервер ({smtp_host}): {str(exc)}"
        }

def send_reset_password_email(to_email: str, code: str) -> dict:
    """
    Отправляет электронное письмо с кодом для сброса пароля через SMTP.
    """
    load_env_file()
    
    if is_test_email(to_email):
        print(f"[SMTP MOCK DISPATCH] Тестовый адрес {to_email}: код сброса {code} (без обращения к внешнему серверу)")
        return {
            "success": True,
            "realSent": False,
            "provider": "Mock Test",
            "message": f"Письмо с проверочным кодом для сброса пароля успешно отправлено на {to_email}"
        }

    smtp_host = os.getenv("SMTP_HOST", "").strip()
    smtp_port = int(os.getenv("SMTP_PORT", "465")) if os.getenv("SMTP_PORT", "465").isdigit() else 465
    smtp_user = os.getenv("SMTP_USER", "").strip()
    smtp_password = os.getenv("SMTP_PASSWORD", "").strip()
    from_name = os.getenv("SMTP_FROM_NAME", "SmartContractum")
    from_email = os.getenv("SMTP_FROM_EMAIL", smtp_user or "no-reply@smartcontractum.ru").strip()


    if not (smtp_host and smtp_user and smtp_password):
        return {
            "success": False,
            "error": "Почтовый сервер (SMTP) не настроен в файле .env."
        }

    subject = f"{code} — Сброс пароля в SmartContractum"

    html_content = f"""<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="utf-8">
  <title>Сброс пароля</title>
</head>
<body style="margin: 0; padding: 30px 10px; background-color: #081628; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #f1f5f9;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0">
    <tr>
      <td align="center">
        <table width="100%" max-width="540" style="max-width: 540px; background-color: #0e223d; border: 1px solid #173e6d; border-radius: 12px; padding: 36px 30px; box-shadow: 0 10px 30px rgba(0,0,0,0.4);" border="0" cellspacing="0" cellpadding="0">
          <tr>
            <td>
              <div style="font-size: 13px; font-weight: 800; color: #2f6fce; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 20px;">
                SMARTCONTRACTUM
              </div>
              <h1 style="font-size: 22px; font-weight: 700; color: #ffffff; margin: 0 0 14px 0;">
                Восстановление пароля
              </h1>
              <p style="font-size: 14.5px; line-height: 1.6; color: #94a3b8; margin: 0 0 24px 0;">
                Здравствуйте! Был получен запрос на сброс пароля для учетной записи <strong>{to_email}</strong> на платформе <strong>SmartContractum</strong>.
              </p>
              <div style="text-align: center; margin: 28px 0; padding: 22px; background-color: #081628; border-radius: 8px; border: 1px solid #1e4a80;">
                <div style="font-size: 12px; text-transform: uppercase; letter-spacing: 1.5px; color: #64748b; margin-bottom: 8px;">
                  Код для сброса пароля
                </div>
                <div style="font-size: 34px; font-weight: 800; letter-spacing: 8px; color: #38bdf8; font-family: monospace, monospace;">
                  {code}
                </div>
              </div>
              <p style="font-size: 13px; line-height: 1.5; color: #64748b; margin: 0 0 12px 0;">
                ⏱ Код действителен в течение <strong>10 минут</strong>. Не передавайте данный код никому.
              </p>
              <p style="font-size: 12px; line-height: 1.4; color: #475569; margin: 20px 0 0 0; border-top: 1px solid #173e6d; padding-top: 16px;">
                Если вы не отправляли запрос на сброс пароля, немедленно проверьте безопасность вашей учетной записи или проигнорируйте это письмо.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>"""

    try:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = Header(subject, "utf-8")
        msg["From"] = formataddr((str(Header(from_name, "utf-8")), from_email))
        msg["To"] = to_email

        text_part = MIMEText(f"Здравствуйте! Ваш проверочный код для сброса пароля в SmartContractum: {code}. Код действителен 10 минут.", "plain", "utf-8")
        html_part = MIMEText(html_content, "html", "utf-8")

        msg.attach(text_part)
        msg.attach(html_part)

        if smtp_port == 465:
            context = ssl.create_default_context()
            with smtplib.SMTP_SSL(smtp_host, smtp_port, context=context, timeout=12) as server:
                server.login(smtp_user, smtp_password)
                server.sendmail(from_email, [to_email], msg.as_string())
        else:
            with smtplib.SMTP(smtp_host, smtp_port, timeout=12) as server:
                server.starttls()
                server.login(smtp_user, smtp_password)
                server.sendmail(from_email, [to_email], msg.as_string())

        print(f"[SMTP RESET DISPATCH] Письмо с кодом сброса успешно отправлено на {to_email} через {smtp_host}")
        return {
            "success": True,
            "realSent": True,
            "provider": f"SMTP ({smtp_host})",
            "message": f"Письмо с проверочным кодом для сброса пароля успешно отправлено на {to_email}"
        }
    except Exception as exc:
        print(f"[SMTP ERROR] Ошибка отправки на {to_email}: {exc}")
        return {
            "success": False,
            "error": f"Ошибка отправки через почтовый сервер ({smtp_host}): {str(exc)}"
        }

class SmartContractumHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=PUBLIC_DIR, **kwargs)

    def extract_auth_token(self):
        auth_header = self.headers.get("Authorization", "")
        if auth_header.startswith("Bearer "):
            return auth_header[7:].strip()
        parsed = urllib.parse.urlparse(self.path)
        params = urllib.parse.parse_qs(parsed.query)
        return params.get("token", [""])[0]

    def send_json(self, data, status=200):
        response_bytes = json.dumps(data, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(response_bytes)))
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, Authorization")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.end_headers()
        self.wfile.write(response_bytes)

    def end_headers(self):
        if hasattr(self, 'command') and self.command == 'GET':
            self.send_header("Cache-Control", "no-cache, no-store, must-revalidate")
            self.send_header("Pragma", "no-cache")
            self.send_header("Expires", "0")
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(204)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, Authorization")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.end_headers()


    def serve_static_file(self, filepath, content_type="text/html; charset=utf-8"):
        if not os.path.exists(filepath):
            self.send_response(404)
            self.end_headers()
            return
        with open(filepath, "rb") as f:
            content = f.read()
        self.send_response(200)
        self.send_header("Content-Type", content_type)
        self.send_header("Content-Length", str(len(content)))
        self.end_headers()
        self.wfile.write(content)

    def do_GET(self):
        parsed = urllib.parse.urlparse(self.path)
        
        # 1. API эндпоинт для запроса к ЕГРЮЛ/ЕГРИП ФНС РФ
        if parsed.path == "/api/egrul":
            params = urllib.parse.parse_qs(parsed.query)
            inn = params.get("inn", [""])[0]
            result = query_egrul_nalog_ru(inn)
            self.send_json(result)
            return

        # 2. API эндпоинт профиля текущего пользователя (/api/auth/me)
        if parsed.path == "/api/auth/me":
            token = self.extract_auth_token()
            user = db.get_user_by_token(token)
            if not user:
                self.send_json({"success": False, "error": "Неавторизованный доступ. Сессия не найдена или истекла."}, 401)
                return
            
            contracts = db.get_user_contracts(user["id"])
            self.send_json({
                "success": True,
                "user": user,
                "contracts": contracts
            })
            return

        # 3. API списка смарт-контрактов
        if parsed.path == "/api/contracts":
            token = self.extract_auth_token()
            user = db.get_user_by_token(token)
            if not user:
                self.send_json({"success": False, "error": "Неавторизованный доступ"}, 401)
                return
            contracts = db.get_user_contracts(user["id"])
            self.send_json({"success": True, "contracts": contracts})
            return

        # 3.1 API системной статистики экосистемы (/api/v1/system/stats)
        if parsed.path == "/api/v1/system/stats":
            self.send_json({
                "success": True,
                "stats": {
                    "registered_experts": 142,
                    "generated_passports": 38,
                    "trusted_sources": 19,
                    "verified_scenarios": 15
                }
            })
            return

        # 3.2 API ленты публикаций, вопросов Q&A и базы знаний (/api/feed/posts)
        if parsed.path == "/api/feed/posts":
            params = urllib.parse.parse_qs(parsed.query)
            p_type = params.get("type", [None])[0]
            p_cat = params.get("cat", [None])[0]
            search = params.get("search", [None])[0]
            limit = int(params.get("limit", ["50"])[0])
            offset = int(params.get("offset", ["0"])[0])
            posts = db.get_feed_posts(post_type=p_type, category=p_cat, search=search, limit=limit, offset=offset)
            self.send_json({"success": True, "posts": posts})
            return

        # 3.3 API получения отдельного поста или ветки комментариев
        if parsed.path.startswith("/api/feed/posts/"):
            parts = parsed.path.strip("/").split("/")
            if len(parts) == 4 and parts[3].isdigit():
                post_id = int(parts[3])
                post = db.get_feed_post_by_id(post_id)
                if post:
                    self.send_json({"success": True, "post": post})
                else:
                    self.send_json({"success": False, "error": "Публикация не найдена"}, 404)
                return
            elif len(parts) == 5 and parts[3].isdigit() and parts[4] == "comments":
                post_id = int(parts[3])
                comments = db.get_feed_comments(post_id)
                self.send_json({"success": True, "comments": comments})
                return

        # 3.4 API лидерборда экспертов
        if parsed.path == "/api/feed/leaderboard":
            leaders = db.get_top_reputation_users(5)
            self.send_json({"success": True, "leaders": leaders})
            return


        # 4. Проверка Host для поддомена второго уровня (auth.localhost, auth.smartcontractum.ru и т.п.)
        host_header = self.headers.get("Host", "").lower().split(":")[0]
        if host_header.startswith("auth."):
            if parsed.path in ["/", "/index.html", "/auth", "/auth.html", "/login", "/register"]:
                self.serve_static_file(os.path.join(PUBLIC_DIR, "auth.html"))
                return

        # 5. Маршрутизация путей авторизации и регистрации
        if parsed.path in ["/auth", "/auth/", "/auth.html", "/login", "/register"]:
            self.serve_static_file(os.path.join(PUBLIC_DIR, "auth.html"))
            return

        # 6. Маршрутизация главной страницы
        if parsed.path in ["/", "/index.html", "/landing", "/landing.html"]:
            self.serve_static_file(os.path.join(PUBLIC_DIR, "index.html"))
            return

        # 7. Маршрутизация Личного кабинета
        if parsed.path in ["/dashboard", "/dashboard/"]:
            self.serve_static_file(os.path.join(PUBLIC_DIR, "dashboard.html"))
            return

        # 8. Маршрутизация Ленты статей и Базы знаний (Хабр 2.0)
        if parsed.path in ["/feed", "/feed/", "/feed.html", "/forum", "/forum.html"]:
            self.serve_static_file(os.path.join(PUBLIC_DIR, "feed.html"))
            return

        # 9. Маршрутизация Редактора статей
        if parsed.path in ["/editor", "/editor/", "/editor.html", "/feed/create"]:
            self.serve_static_file(os.path.join(PUBLIC_DIR, "editor.html"))
            return

        # Стандартная раздача статики
        super().do_GET()



    def do_POST(self):
        parsed = urllib.parse.urlparse(self.path)
        content_length = int(self.headers.get('Content-Length', 0))
        post_body = self.rfile.read(content_length).decode('utf-8')
        
        try:
            payload = json.loads(post_body) if post_body else {}
        except Exception:
            payload = {}

        # 1. Регистрация: генерация кода и отправка проверочного письма на E-mail
        if parsed.path == "/api/auth/register-send-email":
            raw_email = payload.get("email", "").strip().lower()
            
            if not raw_email or "@" not in raw_email:
                self.send_json({"success": False, "error": "Пожалуйста, укажите корректный адрес электронной почты"})
                return

            if not payload.get("password") or len(payload.get("password")) < 8:
                self.send_json({"success": False, "error": "Пароль должен содержать не менее 8 символов"})
                return

            code = f"{random.randint(100000, 999999)}"
            EMAIL_SESSIONS[raw_email] = {
                "code": code,
                "payload": payload,
                "expires": time.time() + 600 # 10 минут
            }

            send_result = send_real_email_code(raw_email, code)
            
            if send_result.get("success"):
                self.send_json({
                    "success": True,
                    "realSent": True,
                    "email": raw_email,
                    "cooldown": 60,
                    "message": f"Письмо с проверочным кодом направлено на {raw_email}"
                })
            else:
                self.send_json({
                    "success": False,
                    "error": send_result.get("error", "Не удалось отправить проверочное письмо через SMTP")
                })
            return

        # 2. Проверка кода E-mail -> СОХРАНЕНИЕ В БАЗУ ДАННЫХ -> СОЗДАНИЕ СЕССИИ
        if parsed.path == "/api/auth/verify-email":
            raw_email = payload.get("email", "").strip().lower()
            code = payload.get("code", "").strip()
            
            session = EMAIL_SESSIONS.get(raw_email)
            if not session:
                self.send_json({"success": False, "error": "Код для данного E-mail не запрашивался или срок его действия истек"})
                return
            elif time.time() > session["expires"]:
                self.send_json({"success": False, "error": "Срок действия кода истек. Пожалуйста, запросите новый код"})
                return
            elif session["code"] != code:
                self.send_json({"success": False, "error": "Введен неверный проверочный код из электронного письма"})
                return

            # Код подтвержден! Сохраняем пользователя в SQLite с PBKDF2 хешированием
            user_payload = session.get("payload", {})
            try:
                user = db.create_user(user_payload)
                token = db.create_session(user["id"])
                
                # Очищаем сессию верификации
                EMAIL_SESSIONS.pop(raw_email, None)

                self.send_json({
                    "success": True,
                    "verified": True,
                    "token": token,
                    "user": user,
                    "message": "E-mail успешно подтвержден! Учетная запись сохранена в базе данных."
                })
            except Exception as e:
                self.send_json({"success": False, "error": f"Ошибка сохранения пользователя в базе данных: {str(e)}"})
            return

        # 3. Вход в личный кабинет (Авторизация по БД)
        if parsed.path == "/api/auth/login":
            email = payload.get("email", "").strip().lower()
            password = payload.get("password", "")

            if not email or not password:
                self.send_json({"success": False, "error": "Пожалуйста, введите E-mail и пароль"})
                return

            user = db.authenticate_user(email, password)
            if not user:
                self.send_json({"success": False, "error": "Неверный адрес электронной почты (E-mail) или пароль"})
                return

            # Создаем сессионный токен
            token = db.create_session(user["id"])
            self.send_json({
                "success": True,
                "token": token,
                "user": user,
                "message": "Успешная авторизация"
            })
            return

        # 4. Выход из личного кабинета (Logout)
        if parsed.path == "/api/auth/logout":
            token = self.extract_auth_token()
            if token:
                db.delete_session(token)
            self.send_json({"success": True, "message": "Сессия успешно завершена"})
            return

        # 5. Сброс пароля: Шаг 1 — запрос кода и отправка на E-mail
        if parsed.path == "/api/auth/forgot-password":
            raw_email = payload.get("email", "").strip().lower()
            
            if not raw_email or "@" not in raw_email:
                self.send_json({"success": False, "error": "Пожалуйста, укажите корректный адрес электронной почты (E-mail)"})
                return

            user = db.get_user_by_email(raw_email)
            if not user:
                self.send_json({"success": False, "error": "Пользователь с указанным адресом электронной почты не зарегистрирован на платформе"})
                return

            code = f"{secrets.randbelow(900000) + 100000}"
            PASSWORD_RESET_SESSIONS[raw_email] = {
                "code": code,
                "expires": time.time() + 600, # 10 минут
                "verified": False,
                "reset_token": None,
                "token_expires": 0
            }

            send_result = send_reset_password_email(raw_email, code)
            
            if send_result.get("success"):
                self.send_json({
                    "success": True,
                    "realSent": True,
                    "email": raw_email,
                    "cooldown": 60,
                    "message": f"Письмо с кодом для сброса пароля направлено на {raw_email}"
                })
            else:
                self.send_json({
                    "success": False,
                    "error": send_result.get("error", "Не удалось отправить письмо с кодом сброса через SMTP")
                })
            return

        # 6. Сброс пароля: Шаг 2 — проверка кода из письма и выдача resetToken
        if parsed.path == "/api/auth/forgot-verify-code":
            raw_email = payload.get("email", "").strip().lower()
            code = payload.get("code", "").strip()

            session = PASSWORD_RESET_SESSIONS.get(raw_email)
            if not session:
                self.send_json({"success": False, "error": "Запрос на сброс пароля не найден или срок его действия истек. Пожалуйста, начните сначала"})
                return
            elif time.time() > session["expires"]:
                self.send_json({"success": False, "error": "Срок действия проверочного кода истек (10 минут). Запросите код повторно"})
                return
            elif not hmac.compare_digest(session["code"], code):
                self.send_json({"success": False, "error": "Введен неверный проверочный код из электронного письма"})
                return

            reset_token = secrets.token_hex(32)
            session["verified"] = True
            session["reset_token"] = reset_token
            session["token_expires"] = time.time() + 900 # 15 минут

            self.send_json({
                "success": True,
                "verified": True,
                "resetToken": reset_token,
                "message": "Проверочный код подтвержден! Теперь задайте новый пароль."
            })
            return

        # 7. Сброс пароля: Шаг 3 — установка нового пароля в БД
        if parsed.path == "/api/auth/forgot-reset-password":
            raw_email = payload.get("email", "").strip().lower()
            reset_token = payload.get("resetToken", "").strip()
            new_password = payload.get("newPassword", "")

            session = PASSWORD_RESET_SESSIONS.get(raw_email)
            if not session or not session.get("verified") or not session.get("reset_token"):
                self.send_json({"success": False, "error": "Сессия восстановления пароля недействительна. Пожалуйста, начните сначала"})
                return
            elif time.time() > session.get("token_expires", 0):
                self.send_json({"success": False, "error": "Время действия токена смены пароля истекло. Пожалуйста, запросите сброс заново"})
                return
            elif not hmac.compare_digest(session["reset_token"], reset_token):
                self.send_json({"success": False, "error": "Недействительный токен сброса пароля"})
                return
            elif len(new_password) < 8:
                self.send_json({"success": False, "error": "Пароль должен содержать не менее 8 символов"})
                return

            # Обновляем пароль в базе данных и сбрасываем активные сессии
            updated = db.update_user_password(raw_email, new_password)
            if not updated:
                self.send_json({"success": False, "error": "Не удалось обновить пароль. Пользователь не найден"})
                return

            # Удаляем сессию сброса
            PASSWORD_RESET_SESSIONS.pop(raw_email, None)

            self.send_json({
                "success": True,
                "message": "Пароль успешно изменен! Теперь вы можете войти в личный кабинет с новым паролем."
            })
            return

        # 8. Обновление персональных данных профиля
        if parsed.path == "/api/user/update-profile":
            token = self.extract_auth_token()
            user = db.get_user_by_token(token)
            if not user:
                self.send_json({"success": False, "error": "Неавторизованный доступ. Сессия не найдена или истекла."}, 401)
                return

            success, err_msg, updated_user = db.update_user_profile(user["id"], payload)
            if not success:
                self.send_json({"success": False, "error": err_msg or "Ошибка обновления профиля"}, 400)
                return

            self.send_json({
                "success": True,
                "user": updated_user,
                "message": "Данные профиля успешно сохранены"
            })
            return

        # 9. Смена пароля авторизованным пользователем (старый метод)
        if parsed.path == "/api/user/change-password":
            token = self.extract_auth_token()
            user = db.get_user_by_token(token)
            if not user:
                self.send_json({"success": False, "error": "Неавторизованный доступ. Сессия не найдена или истекла."}, 401)
                return

            current_pwd = payload.get("currentPassword", "")
            new_pwd = payload.get("newPassword", "")

            if not current_pwd:
                self.send_json({"success": False, "error": "Пожалуйста, введите текущий пароль"}, 400)
                return

            if not new_pwd or len(new_pwd) < 8:
                self.send_json({"success": False, "error": "Новый пароль должен содержать не менее 8 символов"}, 400)
                return

            success, err_msg = db.change_user_password(user["id"], current_pwd, new_pwd)
            if not success:
                self.send_json({"success": False, "error": err_msg or "Ошибка смены пароля"}, 400)
                return

            self.send_json({
                "success": True,
                "message": "Пароль успешно изменен!"
            })
            return

        # 10. Смена пароля в Личном кабинете: Шаг 1 — Запрос кода на E-mail
        if parsed.path == "/api/security/request-password-change":
            token = self.extract_auth_token()
            user = db.get_user_by_token(token)
            if not user:
                self.send_json({"success": False, "error": "Неавторизованный доступ. Сессия не найдена или истекла."}, 401)
                return

            user_email = user.get("email", "").strip().lower()
            if not user_email:
                self.send_json({"success": False, "error": "У пользователя не указан адрес электронной почты"}, 400)
                return

            code = f"{secrets.randbelow(900000) + 100000}"
            SECURITY_PASSWORD_RESET_SESSIONS[user["id"]] = {
                "code": code,
                "email": user_email,
                "expires": time.time() + 600, # 10 минут
                "verified": False,
                "change_token": None,
                "token_expires": 0
            }

            send_result = send_reset_password_email(user_email, code)
            if send_result.get("success"):
                self.send_json({
                    "success": True,
                    "realSent": True,
                    "email": user_email,
                    "cooldown": 60,
                    "message": f"Код подтверждения для смены пароля направлен на {user_email}"
                })
            else:
                self.send_json({
                    "success": False,
                    "error": send_result.get("error", "Не удалось отправить письмо с кодом смены пароля")
                })
            return

        # 11. Смена пароля в Личном кабинете: Шаг 2 — Проверка 6-значного кода и выдача changeToken
        if parsed.path == "/api/security/verify-password-code":
            token = self.extract_auth_token()
            user = db.get_user_by_token(token)
            if not user:
                self.send_json({"success": False, "error": "Неавторизованный доступ. Сессия не найдена или истекла."}, 401)
                return

            code = payload.get("code", "").strip()
            session = SECURITY_PASSWORD_RESET_SESSIONS.get(user["id"])
            if not session:
                self.send_json({"success": False, "error": "Запрос на смену пароля не найден или срок его действия истек. Запросите код заново."}, 400)
                return
            elif time.time() > session["expires"]:
                self.send_json({"success": False, "error": "Срок действия проверочного кода истек (10 минут). Запросите код повторно."}, 400)
                return
            elif not hmac.compare_digest(session["code"], code):
                self.send_json({"success": False, "error": "Введен неверный проверочный код из электронного письма"}, 400)
                return

            change_token = secrets.token_hex(32)
            session["verified"] = True
            session["change_token"] = change_token
            session["token_expires"] = time.time() + 900 # 15 минут

            self.send_json({
                "success": True,
                "verified": True,
                "changeToken": change_token,
                "message": "Проверочный код подтвержден! Введите новый пароль."
            })
            return

        # 12. Смена пароля в Личном кабинете: Шаг 3 — Установка нового пароля
        if parsed.path == "/api/security/change-password-verified":
            token = self.extract_auth_token()
            user = db.get_user_by_token(token)
            if not user:
                self.send_json({"success": False, "error": "Неавторизованный доступ. Сессия не найдена или истекла."}, 401)
                return

            change_token = payload.get("changeToken", "").strip()
            new_pwd = payload.get("newPassword", "")

            session = SECURITY_PASSWORD_RESET_SESSIONS.get(user["id"])
            if not session or not session.get("verified") or not session.get("change_token"):
                self.send_json({"success": False, "error": "Сессия подтверждения смены пароля недействительна. Начните сначала."}, 400)
                return
            elif time.time() > session.get("token_expires", 0):
                self.send_json({"success": False, "error": "Время действия токена смены пароля истекло. Запросите код заново."}, 400)
                return
            elif not hmac.compare_digest(session["change_token"], change_token):
                self.send_json({"success": False, "error": "Недействительный токен смены пароля"}, 400)
                return
            elif not new_pwd or len(new_pwd) < 8:
                self.send_json({"success": False, "error": "Новый пароль должен содержать не менее 8 символов"}, 400)
                return

            # Обновляем пароль в БД
            new_hash, new_salt = db.hash_password(new_pwd)
            conn = db.get_db_connection()
            cursor = conn.cursor()
            cursor.execute("UPDATE users SET password_hash = ?, password_salt = ? WHERE id = ?", (new_hash, new_salt, user["id"]))
            conn.commit()
            conn.close()

            # Очищаем сессию смены
            SECURITY_PASSWORD_RESET_SESSIONS.pop(user["id"], None)

            self.send_json({
                "success": True,
                "message": "Пароль успешно изменен!"
            })
            return

        # 13. Публикация нового вопроса, статьи или поста (/api/feed/posts)
        if parsed.path == "/api/feed/posts":
            token = self.extract_auth_token()
            user = db.get_user_by_token(token) if token else None
            success, err, post = db.create_feed_post(payload, user=user)
            if not success:
                self.send_json({"success": False, "error": err or "Ошибка создания публикации"}, 400)
                return
            self.send_json({"success": True, "post": post, "message": "Публикация успешно размещена"})
            return

        # 14. Добавление ответа или комментария (/api/feed/posts/<id>/comments)
        if parsed.path.startswith("/api/feed/posts/") and parsed.path.endswith("/comments"):
            parts = parsed.path.strip("/").split("/")
            if len(parts) == 5 and parts[3].isdigit():
                post_id = int(parts[3])
                token = self.extract_auth_token()
                user = db.get_user_by_token(token) if token else None
                content = payload.get("content", "")
                is_answer = bool(payload.get("isAnswer", False))
                success, err, comment = db.add_feed_comment(post_id, content, user=user, is_answer=is_answer)
                if not success:
                    self.send_json({"success": False, "error": err or "Ошибка добавления ответа"}, 400)
                    return
                self.send_json({"success": True, "comment": comment, "message": "Ответ успешно опубликован"})
                return

        # 15. Отметка ответа как принятого решения (/api/feed/posts/<id>/accept-answer)
        if parsed.path.startswith("/api/feed/posts/") and parsed.path.endswith("/accept-answer"):
            parts = parsed.path.strip("/").split("/")
            if len(parts) == 5 and parts[3].isdigit():
                post_id = int(parts[3])
                token = self.extract_auth_token()
                user = db.get_user_by_token(token) if token else None
                comment_id = payload.get("commentId")
                if not comment_id:
                    self.send_json({"success": False, "error": "commentId обязателен"}, 400)
                    return
                success, err, result = db.accept_answer(post_id, int(comment_id), user=user)
                if not success:
                    self.send_json({"success": False, "error": err or "Ошибка принятия ответа"}, 400)
                    return
                self.send_json({
                    "success": True,
                    "result": result,
                    "message": "Ответ принят как лучшее решение! Автору начислено +50 очков репутации."
                })
                return

        # 16. Оценка полезности («Полезно ▲ / ▼») (/api/feed/posts/<id>/vote)
        if parsed.path.startswith("/api/feed/posts/") and parsed.path.endswith("/vote"):
            parts = parsed.path.strip("/").split("/")
            if len(parts) == 5 and parts[3].isdigit():
                post_id = int(parts[3])
                token = self.extract_auth_token()
                user = db.get_user_by_token(token) if token else None
                delta = int(payload.get("delta", 1))
                success, helpful_count = db.vote_feed_post(post_id, delta, user=user)
                self.send_json({
                    "success": True,
                    "helpfulCount": helpful_count,
                    "message": "Голос учтен"
                })
                return

        # 404 для других POST-запросов
        self.send_response(404)
        self.end_headers()




def run():
    server_address = ("", PORT)
    httpd = ThreadingHTTPServer(server_address, SmartContractumHandler)
    print(f"SmartContractum Server running on http://localhost:{PORT}")
    httpd.serve_forever()

if __name__ == "__main__":
    run()
