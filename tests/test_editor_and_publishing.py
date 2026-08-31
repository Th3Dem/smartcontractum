"""
Тестирование редактора публикаций и сквозного создания статей (TASK-36).
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

TEST_PORT = 3108

class TestEditorAndPublishing(unittest.TestCase):
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

    def test_01_editor_html_page_routing(self):
        """Проверка маршрутизации и элементов страницы редактора"""
        url = f"http://127.0.0.1:{TEST_PORT}/editor"
        with urllib.request.urlopen(url) as resp:
            self.assertEqual(resp.status, 200)
            html = resp.read().decode("utf-8")
            self.assertIn("Редактор публикаций", html)
            self.assertIn("postTypeSelect", html)
            self.assertIn("postCatSelect", html)
            self.assertIn("btnSubmitPost", html)

    def test_02_publish_article_via_api(self):
        """Проверка публикации технической статьи через REST API"""
        payload = {
            "title": "Гайд по внедрению EIP-1153 в смарт-контракты",
            "type": "article",
            "category": "smart-contracts",
            "tags": "#eip1153,#solidity,#gas",
            "content": "Детальный разбор TSTORE и TLOAD для временного хранения данных.",
            "authorName": "Тестовый Инженер"
        }
        status, res = self.make_request("/api/feed/posts", method="POST", data=payload)
        self.assertEqual(status, 200)
        self.assertTrue(res.get("success"))
        post = res.get("post", {})
        self.assertEqual(post.get("title"), payload["title"])
        self.assertEqual(post.get("category"), "smart-contracts")
        self.assertEqual(post.get("type"), "article")

        # Проверяем появление в списке статей
        status, feed_res = self.make_request("/api/feed/posts?cat=smart-contracts")
        self.assertEqual(status, 200)
        posts = feed_res.get("posts", [])
        self.assertTrue(any(p["id"] == post["id"] for p in posts))


if __name__ == "__main__":
    unittest.main()
