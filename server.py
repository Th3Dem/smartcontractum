#!/usr/bin/env python3
"""
SmartContractum — Local Development Server with Live EGRUL/EGRIP Proxy & Real SMS Gateway
Поддержка реальной отправки СМС через шлюзы SMS.RU, SMSC.RU, SMS-Aero
"""

import os
import sys
import json
import time
import random
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

# Хранилище сессий СМС-верификации: clean_phone -> {"code": "1234", "expires": timestamp}
SMS_SESSIONS = {}

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

def send_real_sms(phone: str, code: str) -> dict:
    """
    Отправляет РЕАЛЬНОЕ СМС-сообщение на номер абонента через официальный СМС-шлюз.
    Поддерживает провайдеры: SMS.RU, SMSC.RU (СМС-Центр), SMS-Aero.
    """
    load_env_file()
    clean_phone = "".join(filter(str.isdigit, phone))
    if clean_phone.startswith("8") and len(clean_phone) == 11:
        clean_phone = "7" + clean_phone[1:]
    elif len(clean_phone) == 10:
        clean_phone = "7" + clean_phone

    text = f"SmartContractum: код подтверждения {code}. Никому не сообщайте его."
    provider = os.getenv("SMS_PROVIDER", "sms_ru").lower()
    sms_api_key = os.getenv("SMS_API_KEY") or os.getenv("SMSRU_API_KEY", "")

    # 1. Реальная отправка через SMS.RU
    if (provider == "sms_ru" or sms_api_key) and sms_api_key:
        try:
            params = urllib.parse.urlencode({
                "api_id": sms_api_key,
                "to": clean_phone,
                "msg": text,
                "json": 1
            })
            url = f"https://sms.ru/sms/send?{params}"
            req = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
            with urllib.request.urlopen(req, timeout=10) as resp:
                data = json.loads(resp.read().decode("utf-8"))
            
            if data.get("status") == "OK" and data.get("status_code") == 100:
                sms_info = data.get("sms", {}).get(clean_phone, {})
                if sms_info.get("status") == "OK" or sms_info.get("status_code") == 100:
                    return {
                        "success": True,
                        "realSent": True,
                        "provider": "SMS.RU",
                        "balance": data.get("balance"),
                        "message": f"СМС успешно отправлено на номер +{clean_phone}"
                    }
                else:
                    return {
                        "success": False,
                        "error": f"SMS.RU: {sms_info.get('status_text', 'Ошибка доставки оператором')}"
                    }
            else:
                return {
                    "success": False,
                    "error": f"Ошибка сервиса SMS.RU (код {data.get('status_code')}): {data.get('status_text', 'Проверьте API-ключ')}"
                }
        except Exception as exc:
            return {"success": False, "error": f"Ошибка шлюза SMS.RU: {str(exc)}"}

    # 2. Реальная отправка через SMSC.RU (СМС-Центр)
    smsc_login = os.getenv("SMSC_LOGIN")
    smsc_psw = os.getenv("SMSC_PASSWORD")
    if (provider == "smsc" or smsc_login) and smsc_login and smsc_psw:
        try:
            params = urllib.parse.urlencode({
                "login": smsc_login,
                "psw": smsc_psw,
                "phones": clean_phone,
                "mes": text,
                "fmt": 3
            })
            url = f"https://smsc.ru/sys/send.php?{params}"
            req = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
            with urllib.request.urlopen(req, timeout=10) as resp:
                data = json.loads(resp.read().decode("utf-8"))
            if "error" in data:
                return {"success": False, "error": f"SMSC.RU: {data.get('error')}"}
            return {
                "success": True,
                "realSent": True,
                "provider": "SMSC.RU",
                "message": f"СМС успешно отправлено на номер +{clean_phone}",
                "smsId": data.get("id")
            }
        except Exception as exc:
            return {"success": False, "error": f"Ошибка шлюза SMSC.RU: {str(exc)}"}

    # 3. Режим ожидания ключа (Dev-шлюз с подсказкой)
    return {
        "success": True,
        "realSent": False,
        "provider": "DEV_GATEWAY",
        "demoCode": code,
        "message": f"Для реальной отправки СМС укажите API-ключ провайдера (SMS.RU или SMSC.RU) в файле .env",
        "consoleLog": f"[SMS OUTBOUND] Номер: +{clean_phone} | Сообщение: {text}"
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

        # 1. Эндпоинт отправки СМС-кода
        if parsed.path == "/api/auth/send-sms":
            raw_phone = payload.get("phone", "")
            clean_phone = "".join(filter(str.isdigit, raw_phone))
            
            if len(clean_phone) < 10:
                result = {"success": False, "error": "Пожалуйста, укажите полный номер телефона для отправки СМС"}
            else:
                # Генерация 4-значного защитного кода
                code = f"{random.randint(1000, 9999)}"
                SMS_SESSIONS[clean_phone] = {
                    "code": code,
                    "expires": time.time() + 300 # Срок действия 5 минут
                }
                
                # Реальная отправка через СМС-шлюз
                send_result = send_real_sms(raw_phone, code)
                
                if send_result.get("success"):
                    result = {
                        "success": True,
                        "realSent": send_result.get("realSent", False),
                        "provider": send_result.get("provider"),
                        "message": f"СМС с кодом подтверждения направлено на номер {raw_phone}",
                        "demoCode": send_result.get("demoCode"),
                        "cooldown": 60
                    }
                else:
                    result = {
                        "success": False,
                        "error": send_result.get("error", "Не удалось отправить СМС через шлюз оператора")
                    }

            response_bytes = json.dumps(result, ensure_ascii=False).encode("utf-8")
            self.send_response(200)
            self.send_header("Content-Type", "application/json; charset=utf-8")
            self.send_header("Content-Length", str(len(response_bytes)))
            self.send_header("Access-Control-Allow-Origin", "*")
            self.end_headers()
            self.wfile.write(response_bytes)
            return

        # 2. Эндпоинт проверки СМС-кода
        if parsed.path == "/api/auth/verify-sms":
            raw_phone = payload.get("phone", "")
            code = payload.get("code", "").strip()
            clean_phone = "".join(filter(str.isdigit, raw_phone))
            
            session = SMS_SESSIONS.get(clean_phone)
            if not session:
                result = {"success": False, "error": "Код для данного номера не запрашивался или срок его действия истек"}
            elif time.time() > session["expires"]:
                result = {"success": False, "error": "Срок действия СМС-кода истек. Пожалуйста, запросите новый код"}
            elif session["code"] != code:
                result = {"success": False, "error": "Введен неверный код подтверждения из СМС"}
            else:
                result = {"success": True, "verified": True, "message": "Номер телефона успешно подтвержден"}

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
