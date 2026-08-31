"""
Тестирование хабов базы знаний, таксономии и тематических страниц (TASK-44).
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

TEST_PORT = 3107

class TestHubsAndTaxonomy(unittest.TestCase):
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

    def test_01_db_get_hubs_list(self):
        """Проверка выборки списка 6 ключевых тематических хабов из БД"""
        hubs = db.get_hubs_list()
        self.assertEqual(len(hubs), 6, "Должно быть ровно 6 ключевых хабов знаний")

        slugs = [h["slug"] for h in hubs]
        self.assertIn("smart-contracts", slugs)
        self.assertIn("security", slugs)
        self.assertIn("oracles", slugs)
        self.assertIn("cbrf-law", slugs)
        self.assertIn("escrow-b2b", slugs)
        self.assertIn("marketplace-jobs", slugs)

        # Проверка структуры каждого хаба
        for h in hubs:
            self.assertIn("name", h)
            self.assertIn("icon", h)
            self.assertIn("description", h)
            self.assertIn("tags", h)
            self.assertGreaterEqual(h["postsCount"], 1)
            self.assertGreaterEqual(h["expertsCount"], 1)

    def test_02_db_get_hub_details(self):
        """Проверка выборки развернутой информации о хабе с публикациями и экспертами"""
        details = db.get_hub_details("smart-contracts")
        self.assertIsNotNone(details)
        self.assertEqual(details["hub"]["slug"], "smart-contracts")
        self.assertIn("posts", details)
        self.assertIn("experts", details)

        # Несуществующий хаб
        invalid = db.get_hub_details("unknown-hub-slug")
        self.assertIsNone(invalid)

    def test_03_api_hubs_endpoints(self):
        """Проверка REST API эндпоинтов хабов (/api/hubs, /api/hubs/<slug>)"""
        # GET /api/hubs
        status, res = self.make_request("/api/hubs")
        self.assertEqual(status, 200)
        self.assertTrue(res.get("success"))
        self.assertEqual(len(res.get("hubs", [])), 6)

        # GET /api/hubs/security
        status, res = self.make_request("/api/hubs/security")
        self.assertEqual(status, 200)
        self.assertTrue(res.get("success"))
        self.assertIn("data", res)
        self.assertEqual(res["data"]["hub"]["slug"], "security")

        # GET /api/hubs/unknown-999
        status, res = self.make_request("/api/hubs/unknown-999")
        self.assertEqual(status, 404)
        self.assertFalse(res.get("success"))

    def test_04_html_hubs_page_routing(self):
        """Проверка маршрутизации страницы хабов базы знаний"""
        url = f"http://127.0.0.1:{TEST_PORT}/hubs"
        with urllib.request.urlopen(url) as resp:
            self.assertEqual(resp.status, 200)
            html = resp.read().decode("utf-8")
            self.assertIn("Тематические разделы базы знаний", html)
            self.assertIn("hubsGrid", html)


if __name__ == "__main__":
    unittest.main()
