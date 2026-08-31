# TECH_SPEC.md — Техническая спецификация Q&A ядра и репутации (TASK-40)

## 1. Схема базы данных SQLite (`db.py`)
```sql
CREATE TABLE IF NOT EXISTS feed_posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    author_name TEXT NOT NULL,
    author_role TEXT DEFAULT '',
    type TEXT NOT NULL, -- 'question', 'article', 'discussion', 'case', 'post'
    category TEXT NOT NULL, -- 'smart-contracts', 'security', 'oracles', 'cbrf-law', 'escrow-b2b', 'marketplace-jobs'
    title TEXT NOT NULL,
    snippet TEXT DEFAULT '',
    content TEXT DEFAULT '',
    tags TEXT DEFAULT '',
    poll_data_json TEXT DEFAULT '',
    code_snippet TEXT DEFAULT '',
    helpful_count INTEGER DEFAULT 0,
    views_count INTEGER DEFAULT 1,
    is_solved INTEGER DEFAULT 0,
    accepted_answer_id INTEGER,
    bounty_amount TEXT DEFAULT '',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS feed_comments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    post_id INTEGER NOT NULL,
    user_id INTEGER,
    author_name TEXT NOT NULL,
    author_role TEXT DEFAULT '',
    content TEXT NOT NULL,
    is_accepted_answer INTEGER DEFAULT 0,
    helpful_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (post_id) REFERENCES feed_posts(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS user_reputation (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER UNIQUE,
    display_name TEXT NOT NULL,
    score INTEGER DEFAULT 0,
    competencies_json TEXT DEFAULT '[]',
    verified_badges_json TEXT DEFAULT '[]',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## 2. Спецификация REST API (`server.py`)
- `GET /api/feed/posts`: Query params: `type`, `cat`, `search`, `limit`, `offset`. Возвращает `{ success: true, posts: [...] }`.
- `POST /api/feed/posts`: Body: `{ title, type, category, tags, content, pollOptions, codeSnippet }`. Возвращает `{ success: true, post: {...} }`.
- `GET /api/feed/posts/<id>/comments`: Возвращает `{ success: true, comments: [...] }`.
- `POST /api/feed/posts/<id>/comments`: Body: `{ content, isAnswer }`. Возвращает `{ success: true, comment: {...} }`.
- `POST /api/feed/posts/<id>/accept-answer`: Body: `{ commentId }`. Возвращает `{ success: true, reputationAwarded: 50 }`.
- `POST /api/feed/posts/<id>/vote`: Body: `{ delta: 1 | -1 }`. Возвращает `{ success: true, helpfulCount: N }`.

## 3. Вердикт
`APPROVED`
