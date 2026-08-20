# ⚙️ Инженерный регламент и параметры: devops_bot

> **Статус:** AppSec & DevSecOps Engineer  
> **Локация:** `/_core_agents/devops_bot/`  
> **Стандарт:** Enterprise Security, Zero Secret Leaks & Automated Git Flow  

---

## 1. Регламент ветвления и релизов

```
feature/* ──► dev ──► staging ──► main (Production)
```

1. **Правило коммитов:**
   - Формат коммитов: `feat(...)`, `fix(...)`, `perf(...)`, `refactor(...)`, `docs(...)`.
   - Включать в коммит все измененные файлы и синхронизированный `WORKLOG.md`.

2. **Команда синхронизации всех веток:**
   ```bash
   git add .
   git commit -m "feat/fix: ..."
   git push origin dev
   git checkout staging && git merge dev && git push origin staging
   git checkout main && git merge staging && git push origin main
   git checkout dev
   ```

---

## 2. Стандарты безопасности заголовков (Security Headers)

В `backend/main.py` должны быть активны заголовки:
```python
response.headers["X-Content-Type-Options"] = "nosniff"
response.headers["X-Frame-Options"] = "DENY"
response.headers["X-XSS-Protection"] = "1; mode=block"
response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
```
