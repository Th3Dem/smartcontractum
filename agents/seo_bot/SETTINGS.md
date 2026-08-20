# ⚙️ Инженерный регламент и параметры: seo_bot

> **Проект:** SmartContractum Enterprise Platform  
> **Роль:** SEO & Content Strategist / UX Copywriter  
> **Стандарт:** Semantic Web3 SEO & Schema.org JSON-LD  

---

## 1. Стандарт структурированных данных Schema.org (JSON-LD)

На всех страницах с ключевыми сценариями внедряется валидный граф Schema.org:

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "name": "SmartContractum",
      "url": "https://smartcontractum.ru",
      "description": "Здесь рождаются смарт-контракты. Профессиональная платформа и мост к ПКСК Банка России."
    },
    {
      "@type": "ItemList",
      "name": "Ключевые сценарии и маршруты платформы",
      "itemListElement": [
        {
          "@type": "SiteNavigationElement",
          "position": 1,
          "name": "У меня есть бизнес-задача",
          "url": "https://smartcontractum.ru/passport"
        },
        {
          "@type": "SiteNavigationElement",
          "position": 2,
          "name": "Ищу готовое решение",
          "url": "https://smartcontractum.ru/solutions"
        },
        {
          "@type": "SiteNavigationElement",
          "position": 3,
          "name": "Ищу специалиста или услугу",
          "url": "https://smartcontractum.ru/marketplace/services"
        },
        {
          "@type": "SiteNavigationElement",
          "position": 4,
          "name": "Я специалист и хочу участвовать",
          "url": "https://smartcontractum.ru/profile/join"
        },
        {
          "@type": "SiteNavigationElement",
          "position": 5,
          "name": "Данные и оракулы",
          "url": "https://smartcontractum.ru/data-sources"
        },
        {
          "@type": "SiteNavigationElement",
          "position": 6,
          "name": "Хочу разобраться в ПКСК",
          "url": "https://smartcontractum.ru/knowledge"
        }
      ]
    }
  ]
}
</script>
```

---

## 2. Правила UX-копирайтинга

1. **Лаконичность:** Один экран — одна главная мысль.
2. **Фокус на ценности:** Говорить о выгоде и результате для пользователя, а не о внутренней механике.
3. **Неразрывность:** Регуляторные термины (`Банка&nbsp;России`, `ПКСК`, `ЦФА`) оформлять через неразрывный пробел.

---

## 3. Регламент логирования в WORKLOG.md

В каждой записи `WORKLOG.md` раздел `seo_bot` обязан содержать:
* Обновленные тексты, заголовки, УТП или микрокопии.
* Интегрированные схемы микроразметки JSON-LD и аналитические атрибуты.
