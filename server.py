#!/usr/bin/env python3
"""
SmartContractum — Local Development Server with Live EGRUL & EGRIP / FNS Proxy API
"""

import os
import sys
import json
import time
import urllib.request
import urllib.parse
from http.server import HTTPServer, SimpleHTTPRequestHandler

PORT = int(sys.argv[1]) if len(sys.argv) > 1 and sys.argv[1].isdigit() else 3000
PUBLIC_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "public")

USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"

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
    Извлекает Фамилию, Имя и Отчество из строки ЕГРИП (например, ИНДИВИДУАЛЬНЫЙ ПРЕДПРИНИМАТЕЛЬ ИВАНОВ АЛЕКСАНДР СЕРГЕЕВИЧ)
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
    Выполняет реальный двухэтапный запрос к API ФНС России (egrul.nalog.ru) для ЕГРЮЛ и ЕГРИП:
    1. POST https://egrul.nalog.ru/ с телом query=<inn> для получения токена t
    2. GET https://egrul.nalog.ru/search-result/<token> для получения строк реестра
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
        # Шаг 1: Инициализация поиска и получение токена
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

        # Шаг 2: Получение результатов поиска по токену
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

        # Проверяем точное совпадение ИНН/ОГРН в строках ответа ФНС
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

        # Определение статуса прекращения деятельности / ликвидации по реестру ФНС
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

        # Извлечение ФИО
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

def run():
    server_address = ("", PORT)
    httpd = HTTPServer(server_address, SmartContractumHandler)
    print(f"SmartContractum Dev Server running on http://localhost:{PORT}")
    httpd.serve_forever()

if __name__ == "__main__":
    run()
