# ⚙️ Инженерный регламент и параметры: load_bot

> **Проект:** SmartContractum Enterprise Platform  
> **Роль:** Performance & Load QA Specialist  
> **Стандарт:** Sub-Second Response & 60 FPS GPU Budget  

---

## 1. Пороги производительности (Performance Budget)

| Метрика | Целевое значение | Критический порог |
| :--- | :---: | :---: |
| **API Response Time (p50)** | < 45 ms | > 100 ms |
| **API Response Time (p95)** | < 180 ms | > 350 ms |
| **API Response Time (p99)** | < 300 ms | > 600 ms |
| **Throughput (Стартовый контур)** | 2 500+ RPS | < 1 000 RPS |
| **Client FPS (Desktop/Mobile)** | 60 FPS | < 50 FPS |
| **CPU при покое курсора** | 0.0% | > 2.0% |
| **Total Blocking Time (TBT)** | 0 ms | > 50 ms |

---

## 2. Сценарии проверки графической производительности

1. **Тест покоя (Resting State Benchmark):**
   - Убедиться, что при отсутствии движения мыши вызовы перерисовки Canvas не потребляют лишних циклов CPU/GPU.
2. **Тест активной тяги (Vortex Tracking Benchmark):**
   - Проверить, что расчет расстояний и тангенциального вихря для 77 частиц выполняется менее чем за `1.2ms` на кадр.
3. **Тест отсечения (Viewport Culling):**
   - Проверить, что `IntersectionObserver` полностью глушит `requestAnimationFrame` при скролле ниже 100px от первого экрана.

---

## 3. Регламент логирования в WORKLOG.md

В каждой записи `WORKLOG.md` раздел `load_bot` обязан содержать:
* Результаты профилирования графики (FPS, CPU/GPU utilisation).
* Оценку времени отклика модифицированных серверных эндпоинтов.
* Подтверждение соблюдения SLA производительности.
