# SEO & GEO Стратегия распространения знаний SmartContractum (Этап 1)

**Проект**: SmartContractum  
**Автор**: `seo_bot` / `pm_bot`

---

## 1. Концепция Content Engine (Органический трафик и цитируемость)
SmartContractum формирует независимую профессиональную базу знаний, в которой каждый экспертный вопрос и статья становятся самостоятельным индексируемым активом (Knowledge Asset):

$$ \text{Экспертный вопрос} \longrightarrow \text{ЧПУ URL} \longrightarrow \text{Принятый ответ} \longrightarrow \text{Schema.org} \longrightarrow \text{Поисковый и AI GEO-трафик} $$

---

## 2. Архитектура ЧПУ (Clean URLs)
- Статьи и лонгриды: `/articles/<slug>` (например, `/articles/solidity-gost-r-34-10-precompiles`);
- Вопросы и ответы Q&A: `/questions/<id>/<slug>` (например, `/questions/104/upd-privacy-in-smart-contracts`);
- Кейсы и паспорта: `/cases/<slug>` (например, `/cases/b2b-escrow-1c-erp-digital-ruble`);
- Тематические хабы: `/topics/<topic_id>` (например, `/topics/oracles`);
- Профили экспертов: `/experts/<handle>` (например, `/experts/elena_krylova`).

---

## 3. Микроразметка Schema.org
1. `Schema.org/QAPage` и `Question` + `suggestedAnswer` / `acceptedAnswer` для страниц вопросов.
2. `Schema.org/TechArticle` для лонгридов с указанием `author` (Person), `publisher` (Organization), `datePublished`, `dateModified`.
3. `Schema.org/BreadcrumbList` для навигационных цепочек.

---

## 4. GEO-принципы (Generative Engine Optimization)
- Четкие структурные определения терминов ПКСК, ГОСТ, Solidity, смарт-эскроу.
- Блоки «Краткий ответ» (Executive Summary / TL;DR) для ключевых материалов.
- Указание конкретных нормативных актов (ГК РФ, стандарты НИР ЦБ РФ) и исходных кодов с комментариями.
- Запрет генеративного SEO-спама и бессодержательных низкокачественных текстов.
