# TASK-01: Интерфейс авторизации, регистрации и входа в личный кабинет (Этап 1)

## Название
Разработка адаптивного интерфейса авторизации, регистрации (физлицо/эксперт и организация) и первичного входа в личный кабинет платформы.

## Исходный запрос человека
«создай мне интерфейся для первого окошка для регистрации по авторизации личного кабинета»

## Цель
Реализовать эргономичный, типобезопасный и защищенный интерфейс для входа и регистрации пользователей платформы смарт-контрактов с четким разделением ролей (индивидуальный специалист/эксперт и представитель организации), валидацией полей, состояниями загрузки/ошибок и соответствием требованиям информационной безопасности.

## Тип задачи
Frontend UI & Auth Flow (Этап 1: Профессиональное сообщество и профили)

## Scope (В рамках задачи)
- Экран/модальное окно авторизации (Email/Пароль, сохранение сессии, переход к регистрации).
- Экран/форма первичной регистрации с выбором типа субъекта:
  - Физическое лицо / Независимый эксперт (ФИО, Email, Телефон, Пароль, Согласие с офертой и 152-ФЗ).
  - Организация / Юридическое лицо (Наименование, ИНН, ФИО представителя, Корпоративный Email, Пароль).
- Сценарий восстановления пароля (Forgot Password Flow).
- Валидация форм в реальном времени (надежность пароля, формат Email/ИНН, обязательные поля).
- Матрица состояний: Default, Focus, Loading/Submitting, Field Error, Global Server Error, Success.
- Переключатель тем (Dark/Light mode) и адаптивная верстка (Mobile/Tablet/Desktop).
- Мок API/клиента для изолированного запуска и тестирования интерфейса.

## Dependencies
- Дизайн-система и типографика платформы.

## Assigned Developers
- `frontend_bot` (Senior TypeScript / React / Next.js Developer)

## Required Gates
- [x] **Product Gate** (`product_bot`) — разработка `PRODUCT_SPEC.md`
- [x] **Architecture Gate** (`architect_bot`) — разработка `TECH_SPEC.md` (контракты auth API и модель состояния)
- [x] **UX Gate** (`ux_bot`) — разработка `UX_SPEC.md` (состояния форм, валидация, переходы)
- [ ] Data Gate (`data_bot`) — Not Required для интерфейсного прототипа
- [ ] Domain Gate (`domain_bot`) — Not Required
- [ ] SEO Gate (`seo_bot`) — Not Required (закрытая зона авторизации)
- [x] **Security Gate** (`security_bot`) — разработка `SECURITY_REVIEW.md` (парольные политики, XSS, защита от перебора)
- [ ] Moderation Gate (`moderation_bot`) — Not Required
- [x] **QA Gate** (`qa_bot`) — независимый аудит `QA_REVIEW.md`

## Required Artifacts
- `PRODUCT_SPEC.md`
- `TECH_SPEC.md`
- `UX_SPEC.md`
- `SECURITY_REVIEW.md`
- `DEV_HANDOVER.md`
- `QA_REVIEW.md`
- `pr_body.txt`

## Definition of Done
1. Спецификации `PRODUCT_SPEC.md`, `TECH_SPEC.md`, `UX_SPEC.md` согласованы.
2. Подготовлена ветка `feat/TASK-01-auth-onboarding` через `git_bot`.
3. Компоненты интерфейса реализованы в `src/components/auth/` на TypeScript / React.
4. Пройден Frontend Compilation Gate (`typecheck`, `lint`, компонентные тесты `test`, `build`).
5. Пройден аудит безопасности `SECURITY_REVIEW.md: APPROVED`.
6. Пройдено функциональное тестирование `QA_REVIEW.md: APPROVED`.
7. `git_bot` сформировал `pr_body.txt` и подготовил изменения к слиянию.

## Constraints
- Никаких незащищенных передач паролей в открытом виде.
- Исключить любые зависимости, требующие внешних закрытых API без мока.
- Строгая изоляция артефактов в `tasks/TASK-01-auth-onboarding/`.
