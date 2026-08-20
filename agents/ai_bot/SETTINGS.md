# ⚙️ Инженерный регламент и параметры: ai_bot

> **Проект:** SmartContractum Enterprise Platform  
> **Роль:** AI Integration & Prompt Engineer  
> **Стандарт:** Resilient Circuit Breaker & Structured JSON  

---

## 1. Регламент Circuit Breaker & Fallback Architecture

```
[Пользовательский запрос]
          │
          ▼
┌──────────────────┐      Успех (200 OK)      ┌─────────────────────────┐
│ Circuit Breaker  │ ───────────────────────► │ Structured JSON Паспорт │
│ State: CLOSED    │                          └─────────────────────────┘
└─────────┬────────┘
          │ (3 ошибки подряд: 429 / 503 / Timeout)
          ▼
┌──────────────────┐      Мгновенно (<50ms)   ┌─────────────────────────┐
│ Circuit Breaker  │ ───────────────────────► │ Детерминированный       │
│ State: OPEN (30s)│                          │ локальный Fallback      │
└──────────────────┘                          └─────────────────────────┘
```

1. **Параметры таймаутов:**
   - Таймаут соединения (Connect Timeout): `3.0s`.
   - Таймаут генерации (Read Timeout): `12.0s`.
2. **Параметры повторов (Retry Policy):**
   - До 2 повторных попыток с экспоненциальным бэкоффом (`0.5s`, `1.5s`).
3. **Безопасность ключей:**
   - Ключ `GEMINI_API_KEY` считывается строго из переменной окружения. Логирование ключа в чистом виде категорически запрещено.

---

## 2. Конфигурация окружения (Environment Variables)

```env
# AI Engine
GEMINI_API_KEY=AIzaSy...
GEMINI_MODEL=gemini-1.5-flash
AI_CIRCUIT_BREAKER_FAIL_MAX=3
AI_CIRCUIT_BREAKER_RESET_TIMEOUT=30
AI_FALLBACK_ENABLED=true
```

---

## 3. Регламент логирования в WORKLOG.md

В каждой записи `WORKLOG.md` раздел `ai_bot` обязан содержать:
* Описание промпт-структур, валидационных схем или графов переходов.
* Статус отказоустойчивости (Circuit Breaker status & fallback verification).
