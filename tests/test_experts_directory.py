"""
Тестирование каталога экспертов, публичных профилей и поиска специалистов (TASK-42).
"""

import unittest
import os
import json
import urllib.request
import urllib.parse
import urllib.error
import threading
import time
from http.server import ThreadingHTTPServer

import db
import server

TEST_PORT = 3106

class TestExpertsDirectory(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        db.init_db()
        db.seed_feed_baseline()
        
        cls.server_address = ("127.0.0.1", TEST_PORT)
        cls.httpd = ThreadingHTTPServer(cls.server_address, server.SmartContractumHandler)
        cls.server_thread = threading.Thread(target=cls.httpd.serve_forever, daemon=True)
        cls.server_thread.start()
        time.sleep(0.3)

    @classmethod
    def tearDownClass(cls):
        cls.httpd.shutdown()
        cls.httpd.server_close()

    def make_request(self, path, method="GET", data=None):
        url = f"http://127.0.0.1:{TEST_PORT}{path}"
        headers = {"Content-Type": "application/json"}
        req_data = json.dumps(data).encode("utf-8") if data else None
        req = urllib.request.Request(url, data=req_data, headers=headers, method=method)
        try:
            with urllib.request.urlopen(req) as resp:
                status = resp.status
                body = json.loads(resp.read().decode("utf-8"))
                return status, body
        except urllib.error.HTTPError as e:
            body = json.loads(e.read().decode("utf-8")) if e.fp else {}
            return e.code, body

    def test_01_db_get_experts_directory(self):
        """Проверка выборки каталога экспертов из БД с фильтрами"""
        all_experts = db.get_experts_directory()
        self.assertGreaterEqual(len(all_experts), 5, "В каталоге должно быть не менее 5 базовых экспертов")

        # Проверка наличия Елены Крыловой (Топ-1)
        elena = next((e for e in all_experts if e["id"] == 1), None)
        self.assertIsNotNone(elena)
        self.assertEqual(elena["name"], "Елена Крылова")
        self.assertEqual(elena["score"], 1420)

        # Фильтр по безопасности
        sec_experts = db.get_experts_directory(competency="security")
        self.assertTrue(any(e["name"] == "Михаил Соколов" for e in sec_experts))

        # Фильтр по поиску
        law_search = db.get_experts_directory(search="Дарья")
        self.assertEqual(len(law_search), 1)
        self.assertEqual(law_search[0]["name"], "Дарья Воронова")

    def test_02_db_get_expert_profile(self):
        """Проверка получения развернутого профиля эксперта со статьями"""
        profile = db.get_expert_profile(1)
        self.assertIsNotNone(profile)
        self.assertEqual(profile["name"], "Елена Крылова")
        self.assertIn("competencies", profile)
        self.assertIn("publications", profile)

    def test_03_api_experts_endpoints(self):
        """Проверка REST API эндпоинтов каталога экспертов"""
        # GET /api/experts
        status, res = self.make_request("/api/experts")
        self.assertEqual(status, 200)
        self.assertTrue(res.get("success"))
        self.assertGreaterEqual(res.get("count", 0), 5)

        # GET /api/experts?competency=cbrf-law
        status, res = self.make_request("/api/experts?competency=cbrf-law")
        self.assertEqual(status, 200)
        self.assertTrue(res.get("success"))

        # GET /api/experts/1
        status, res = self.make_request("/api/experts/1")
        self.assertEqual(status, 200)
        self.assertTrue(res.get("success"))
        self.assertEqual(res.get("expert", {}).get("name"), "Елена Крылова")

        # GET /api/experts/99999 (Not Found)
        status, res = self.make_request("/api/experts/99999")
        self.assertEqual(status, 404)
        self.assertFalse(res.get("success"))

    def test_04_html_experts_page_routing(self):
        """Проверка маршрутизации страницы каталога специалистов"""
        url = f"http://127.0.0.1:{TEST_PORT}/experts"
        with urllib.request.urlopen(url) as resp:
            self.assertEqual(resp.status, 200)
            html = resp.read().decode("utf-8")
            self.assertIn("Каталог сертифицированных экспертов", html)
            self.assertIn("expertsGrid", html)


if __name__ == "__main__":
    unittest.main()
