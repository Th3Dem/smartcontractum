#!/usr/bin/env python3
"""
SmartContractum — Local Development Server with Live EGRUL/EGRIP Proxy & Real SMTP Email Delivery
"""

import os
import sys
import json
import time
import random
import smtplib
import ssl
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.header import Header
from email.utils import formataddr
import urllib.request
import urllib.parse
from http.server import HTTPServer, SimpleHTTPRequestHandler

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

# Хранилище сессий верификации E-mail: clean_email -> {"code": "839102", "payload": {...}, "expires": timestamp}
EMAIL_SESSIONS = {}

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

def send_real_email_code(to_email: str, code: str) -> dict:
    """
    Отправляет РЕАЛЬНОЕ электронное письмо с кодом верификации через SMTP.
    Поддерживает Yandex, Mail.ru, Google Workspace, Timeweb, Beget и любые SMTP-сервера.
    """
    load_env_file()
    
    smtp_host = os.getenv("SMTP_HOST", "")
    smtp_port = int(os.getenv("SMTP_PORT", "465")) if os.getenv("SMTP_PORT", "465").isdigit() else 465
    smtp_user = os.getenv("SMTP_USER", "")
    smtp_password = os.getenv("SMTP_PASSWORD", "")
    from_name = os.getenv("SMTP_FROM_NAME", "SmartContractum")
    from_email = os.getenv("SMTP_FROM_EMAIL", smtp_user or "no-reply@smartcontractum.ru")

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

    # 1. Если заданы параметры реального SMTP сервера — отправляем реальное письмо
    if smtp_host and smtp_user and smtp_password:
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

            print(f"[SMTP REAL DISPATCH] Письмо с кодом {code} успешно отправлено на {to_email} через {smtp_host}")
            return {
                "success": True,
                "realSent": True,
                "provider": f"SMTP ({smtp_host})",
                "message": f"Письмо с кодом отправлено на {to_email}"
            }
        except Exception as exc:
            print(f"[SMTP ERROR] Ошибка отправки на {to_email}: {exc}")
            return {
                "success": False,
                "error": f"Ошибка отправки через SMTP ({smtp_host}): {str(exc)}"
            }

    # 2. Если SMTP еще не настроен в .env — эмулируем отправку с выводом в консоль и подсказкой
    print(f"[SMTP DEV GATEWAY] Код верификации для {to_email}: {code} (Укажите SMTP_HOST, SMTP_USER, SMTP_PASSWORD в .env для реальной отправки)")
    return {
        "success": True,
        "realSent": False,
        "provider": "LOCAL_DEV_EMAIL",
        "demoCode": code,
        "message": f"Письмо с проверочным кодом направлено на {to_email}"
    }

class SmartContractumHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=PUBLIC_DIR, **kwargs)

    def do_GET(self):
        parsed = urllib.parse.urlparse(self.path)
        
        # API эндпоинт для запроса к ЕГРЮЛ/ЕГРИП ФНС РФ
        if parsed.path == "/api/egrul":
            params = urllib.parse.parse_qs(parsed.query)
            inn = params.get("inn", [""])[0]
            
            result = query_egrul_nalog_ru(inn)
            
            response_bytes = json.dumps(result, ensure_ascii=False).encode("utf-8")
            self.send_response(200)
            self.send_header("Content-Type", "application/json; charset=utf-8")
            self.send_header("Content-Length", str(len(response_bytes)))
            self.send_header("Access-Control-Allow-Origin", "*")
            self.end_headers()
            self.wfile.write(response_bytes)
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

        # 1. Регистрация: отправка проверочного письма на E-mail
        if parsed.path == "/api/auth/register-send-email":
            raw_email = payload.get("email", "").strip().lower()
            
            if not raw_email or "@" not in raw_email:
                result = {"success": False, "error": "Пожалуйста, укажите корректный адрес электронной почты"}
            else:
                # Генерация 6-значного кода
                code = f"{random.randint(100000, 999999)}"
                EMAIL_SESSIONS[raw_email] = {
                    "code": code,
                    "payload": payload,
                    "expires": time.time() + 600 # Срок действия 10 минут
                }

                send_result = send_real_email_code(raw_email, code)
                
                if send_result.get("success"):
                    result = {
                        "success": True,
                        "realSent": send_result.get("realSent", False),
                        "provider": send_result.get("provider"),
                        "email": raw_email,
                        "demoCode": send_result.get("demoCode"),
                        "cooldown": 60,
                        "message": f"Письмо с кодом направлено на {raw_email}"
                    }
                else:
                    result = {
                        "success": False,
                        "error": send_result.get("error", "Не удалось отправить письмо через почтовый сервер")
                    }

            response_bytes = json.dumps(result, ensure_ascii=False).encode("utf-8")
            self.send_response(200)
            self.send_header("Content-Type", "application/json; charset=utf-8")
            self.send_header("Content-Length", str(len(response_bytes)))
            self.send_header("Access-Control-Allow-Origin", "*")
            self.end_headers()
            self.wfile.write(response_bytes)
            return

        # 2. Проверка кода E-mail и финализация регистрации
        if parsed.path == "/api/auth/verify-email":
            raw_email = payload.get("email", "").strip().lower()
            code = payload.get("code", "").strip()
            
            session = EMAIL_SESSIONS.get(raw_email)
            if not session:
                result = {"success": False, "error": "Код для данного E-mail не запрашивался или срок его действия истек"}
            elif time.time() > session["expires"]:
                result = {"success": False, "error": "Срок действия кода истек. Пожалуйста, запросите новый код"}
            elif session["code"] != code:
                result = {"success": False, "error": "Введен неверный код подтверждения из письма"}
            else:
                # Успешная активация аккаунта
                user_payload = session.get("payload", {})
                result = {
                    "success": True,
                    "verified": True,
                    "message": "E-mail успешно подтвержден! Личный кабинет активирован.",
                    "user": {
                        "email": raw_email,
                        "accountType": user_payload.get("accountType", "individual")
                    }
                }

            response_bytes = json.dumps(result, ensure_ascii=False).encode("utf-8")
            self.send_response(200)
            self.send_header("Content-Type", "application/json; charset=utf-8")
            self.send_header("Content-Length", str(len(response_bytes)))
            self.send_header("Access-Control-Allow-Origin", "*")
            self.end_headers()
            self.wfile.write(response_bytes)
            return

        # 404 для других POST-запросов
        self.send_response(404)
        self.end_headers()

def run():
    server_address = ("", PORT)
    httpd = HTTPServer(server_address, SmartContractumHandler)
    print(f"SmartContractum Dev Server running on http://localhost:{PORT}")
    httpd.serve_forever()

if __name__ == "__main__":
    run()
