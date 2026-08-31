"""
Тестирование ядра Q&A, персистентного хранения базы знаний, механики принятия решений и репутации (TASK-40).
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

TEST_PORT = 3105

class TestQAAndFeed(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        # Инициализация БД
        db.init_db()
        db.seed_feed_baseline()
        
        # Запуск тестового сервера
        cls.server_address = ("127.0.0.1", TEST_PORT)
        cls.httpd = ThreadingHTTPServer(cls.server_address, server.SmartContractumHandler)
        cls.server_thread = threading.Thread(target=cls.httpd.serve_forever, daemon=True)
        cls.server_thread.start()
        time.sleep(0.3)

    @classmethod
    def tearDownClass(cls):
        cls.httpd.shutdown()
        cls.httpd.server_close()

    def make_request(self, path, method="GET", data=None, token=None):
        url = f"http://127.0.0.1:{TEST_PORT}{path}"
        headers = {"Content-Type": "application/json"}
        if token:
            headers["Authorization"] = f"Bearer {token}"
            
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

    def test_01_db_baseline_and_creation(self):
        """Проверка сидинга базы знаний и создания новых публикаций разных типов"""
        posts = db.get_feed_posts()
        self.assertGreaterEqual(len(posts), 4, "Должно быть не менее 4 базовых публикаций")
        
        # Создаем вопрос
        q_data = {
            "title": "Как реализовать смарт-эскроу с арбитражем на Solidity 0.8.26?",
            "type": "question",
            "category": "smart-contracts",
            "content": "Необходимо предусмотреть мультисиг 2-из-3 (покупатель, продавец, арбитр) с автоматическим таймаутом.",
            "tags": "#solidity, #multisig, #escrow",
            "bountyAmount": "20 000 ₽"
        }
        ok, err, new_q = db.create_feed_post(q_data)
        self.assertTrue(ok)
        self.assertIsNotNone(new_q)
        self.assertEqual(new_q["type"], "question")
        self.assertEqual(new_q["bounty_amount"], "20 000 ₽")

        # Проверка фильтрации по типу
        questions = db.get_feed_posts(post_type="question")
        self.assertTrue(any(p["id"] == new_q["id"] for p in questions))

    def test_02_db_comment_and_accept_answer_flow(self):
        """Проверка добавления ответа, принятия лучшего решения и начисления репутации"""
        # Создаем тестового пользователя
        test_email = f"expert_{int(time.time())}@test.ru"
        user = db.create_user({
            "email": test_email,
            "password": "Password123!",
            "accountType": "individual",
            "phone": "+79998887766",
            "firstName": "Виктор",
            "lastName": "Морозов"
        })
        self.assertIsNotNone(user)
        self.assertIn("id", user)

        # Создаем вопрос
        ok, err, post = db.create_feed_post({
            "title": "Вопрос по валидации кадастровых номеров через оракул Росреестра",
            "type": "question",
            "category": "oracles",
            "content": "Какой формат возврата оптимален для ончейн-проверки обременения земельного участка?"
        })
        self.assertTrue(ok)

        # Добавляем ответ от эксперта
        c_ok, c_err, comment = db.add_feed_comment(
            post_id=post["id"],
            content="Используйте бинарную битовую маску статуса обременения (uint8) вместо строкового JSON, это экономит 90% газа.",
            user=user,
            is_answer=True
        )
        self.assertTrue(c_ok)
        self.assertEqual(comment["is_accepted_answer"], 0)

        # Принимаем ответ как решение
        a_ok, a_err, result = db.accept_answer(post["id"], comment["id"])
        self.assertTrue(a_ok)
        self.assertTrue(result["isSolved"])
        self.assertEqual(result["reputationAwarded"], 50)

        # Проверяем обновленный пост в БД
        updated_post = db.get_feed_post_by_id(post["id"])
        self.assertEqual(updated_post["is_solved"], 1)
        self.assertEqual(updated_post["accepted_answer_id"], comment["id"])

        # Проверяем репутацию эксперта
        conn = db.get_db_connection()
        cur = conn.cursor()
        cur.execute("SELECT score FROM user_reputation WHERE user_id = ?", (user["id"],))
        rep_row = cur.fetchone()
        conn.close()
        self.assertIsNotNone(rep_row)
        self.assertGreaterEqual(rep_row[0], 50)

    def test_03_db_helpful_voting(self):
        """Проверка голосования за полезность материалов"""
        posts = db.get_feed_posts()
        target_post = posts[0]
        initial_count = target_post["helpful_count"]

        v_ok, new_count = db.vote_feed_post(target_post["id"], delta=1)
        self.assertTrue(v_ok)
        self.assertEqual(new_count, initial_count + 1)

    def test_04_api_feed_rest_endpoints(self):
        """Сквозное тестирование REST API ленты, Q&A и репутации"""
        # GET /api/feed/posts
        status, res = self.make_request("/api/feed/posts")
        self.assertEqual(status, 200)
        self.assertTrue(res.get("success"))
        self.assertIsInstance(res.get("posts"), list)

        # POST /api/feed/posts
        new_post_payload = {
            "title": "Архитектура Zero-Knowledge доказательств для комплаенса сделок с ЦФА",
            "type": "article",
            "category": "security",
            "content": "Рассматриваем применение ZK-SNARKs (Groth16) для сокрытия суммы транзакции при подтверждении достаточности обеспечения.",
            "tags": "#zk-snark, #цфа, #приватность"
        }
        status, res = self.make_request("/api/feed/posts", method="POST", data=new_post_payload)
        self.assertEqual(status, 200)
        self.assertTrue(res.get("success"))
        created_post = res.get("post")
        self.assertIsNotNone(created_post)

        # POST /api/feed/posts/<id>/comments
        post_id = created_post["id"]
        status, res = self.make_request(f"/api/feed/posts/{post_id}/comments", method="POST", data={
            "content": "Отличная статья! Какие бенчмарки времени генерации пруфа на клиенте?"
        })
        self.assertEqual(status, 200)
        self.assertTrue(res.get("success"))
        created_comment = res.get("comment")

        # GET /api/feed/posts/<id>/comments
        status, res = self.make_request(f"/api/feed/posts/{post_id}/comments")
        self.assertEqual(status, 200)
        self.assertTrue(len(res.get("comments", [])) >= 1)

        # POST /api/feed/posts/<id>/accept-answer
        status, res = self.make_request(f"/api/feed/posts/{post_id}/accept-answer", method="POST", data={
            "commentId": created_comment["id"]
        })
        self.assertEqual(status, 200)
        self.assertTrue(res.get("success"))

        # POST /api/feed/posts/<id>/vote
        status, res = self.make_request(f"/api/feed/posts/{post_id}/vote", method="POST", data={"delta": 1})
        self.assertEqual(status, 200)
        self.assertTrue(res.get("success"))

        # GET /api/feed/leaderboard
        status, res = self.make_request("/api/feed/leaderboard")
        self.assertEqual(status, 200)
        self.assertTrue(res.get("success"))
        self.assertIsInstance(res.get("leaders"), list)


if __name__ == "__main__":
    unittest.main()
