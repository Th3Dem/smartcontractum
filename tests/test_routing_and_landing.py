#!/usr/bin/env python3
"""
SmartContractum — Тестирование маршрутизации главной страницы, поддомена auth.* и путей авторизации (TASK-13)
"""

import unittest
import os
import time
import json
import urllib.request
from http.server import ThreadingHTTPServer
import threading


import db
import server

ROUTING_TEST_PORT = 3097

class TestRoutingAndLanding(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        db.init_db()
        cls.httpd = ThreadingHTTPServer(("127.0.0.1", ROUTING_TEST_PORT), server.SmartContractumHandler)
        cls.server_thread = threading.Thread(target=cls.httpd.serve_forever, daemon=True)
        cls.server_thread.start()
        time.sleep(0.1)

    @classmethod
    def tearDownClass(cls):
        cls.httpd.shutdown()
        cls.httpd.server_close()

    def get_url(self, path, host=None):
        url = f"http://127.0.0.1:{ROUTING_TEST_PORT}{path}"
        headers = {}
        if host:
            headers["Host"] = host
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req, timeout=5) as resp:
            return resp.status, resp.read().decode("utf-8")

    def test_01_landing_page_on_root(self):
        """Главная страница открывается на / и содержит портал SmartContractum с 3D Hero баннером и меню Лента"""
        status, html = self.get_url("/")
        self.assertEqual(status, 200)
        self.assertIn("SmartContractum", html)
        self.assertIn("Здесь рождаются", html)
        self.assertIn("российские", html)
        self.assertIn("смарт-контракты", html)
        self.assertIn("id=\"crystal3dCube\"", html)
        self.assertIn("id=\"constellationCanvas\"", html)
        self.assertIn("id=\"pkscTimeline\"", html)
        self.assertIn("id=\"headerLoginBtn\"", html)
        self.assertIn("<span class=\"nav-text\">Лента</span>", html)

    def test_02_auth_page_on_auth_paths(self):
        """Страница авторизации открывается на /auth, /auth/, /auth.html, /login, /register"""
        for path in ["/auth", "/auth/", "/auth.html", "/login", "/register"]:
            status, html = self.get_url(path)
            self.assertEqual(status, 200, f"Path {path} must return 200")
            self.assertIn("Вход в личный кабинет", html)
            self.assertIn("id=\"form-login\"", html)
            self.assertIn("id=\"form-register\"", html)
            self.assertIn("id=\"form-forgot\"", html)

    def test_03_auth_subdomain_routing(self):
        """Поддомен auth.localhost:3000 и auth.smartcontractum.ru отдают страницу авторизации на /"""
        for host in ["auth.localhost:3097", "auth.smartcontractum.ru", "auth.local"]:
            status, html = self.get_url("/", host=host)
            self.assertEqual(status, 200, f"Host {host} on / must return 200")
            self.assertIn("Вход в личный кабинет", html)
            self.assertIn("id=\"form-login\"", html)

    def test_04_dashboard_routing(self):
        """Маршруты /dashboard и /dashboard/ открывают dashboard.html"""
        for path in ["/dashboard", "/dashboard/", "/dashboard.html"]:
            status, html = self.get_url(path)
            self.assertEqual(status, 200)
            self.assertIn("Личный кабинет — SmartContractum", html)
            self.assertIn("id=\"section-security\"", html)

    def test_05_system_stats_api(self):
        """API /api/v1/system/stats возвращает метрики платформы"""
        status, body = self.get_url("/api/v1/system/stats")
        self.assertEqual(status, 200)
        data = json.loads(body)
        self.assertTrue(data.get("success"))
        stats = data.get("stats", {})
        self.assertGreaterEqual(stats.get("registered_experts", 0), 100)
        self.assertGreaterEqual(stats.get("generated_passports", 0), 10)

    def test_06_feed_routing(self):
        """Маршруты /feed, /feed/, /feed.html, /forum открывают современную ленту сообщества"""
        for path in ["/feed", "/feed/", "/feed.html", "/forum", "/forum.html"]:
            status, html = self.get_url(path)
            self.assertEqual(status, 200, f"Path {path} must return 200")
            self.assertIn("Лента сообщества", html)
            self.assertIn("feed-content-stream", html)
            self.assertIn("post-101", html)
            self.assertIn("interactive-poll-box", html)


    def test_07_editor_routing(self):
        """Маршруты /editor, /editor/, /editor.html открывают редактор статей"""
        for path in ["/editor", "/editor/", "/editor.html"]:
            status, html = self.get_url(path)
            self.assertEqual(status, 200, f"Path {path} must return 200")
            self.assertIn("Создание публикации", html)
            self.assertIn("articleTitleInput", html)
            self.assertIn("editorCanvas", html)

if __name__ == "__main__":
    unittest.main()



