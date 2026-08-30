# Technical Specification: TASK-01 — Интерфейс авторизации и регистрации личного кабинета

## 1. Контекст
Реализация клиентской архитектуры модуля аутентификации и регистрации на базе React / TypeScript / Next.js с соблюдением принципов модульности, строгой типизации и безопасности.

## 2. Затрагиваемые компоненты
- `src/components/auth/AuthModal.tsx` — базовый контейнер модального окна/экрана с переключением табов.
- `src/components/auth/LoginForm.tsx` — форма входа.
- `src/components/auth/RegisterForm.tsx` — форма регистрации с выбором типа аккаунта.
- `src/components/auth/ForgotPasswordForm.tsx` — форма восстановления пароля.
- `src/components/auth/PasswordStrengthMeter.tsx` — визуальный индикатор надежности пароля.
- `src/components/ui/Input.tsx`, `src/components/ui/Button.tsx`, `src/components/ui/Tabs.tsx`, `src/components/ui/Alert.tsx` — базовые UI-компоненты.
- `src/types/auth.ts` — TypeScript интерфейсы и типы запросов/ответов.
- `src/services/authClient.ts` — типизированный клиент API (с поддержкой mock-режима для автономной работы).

## 3. Доменные сущности и схемы (DTO)
- `AuthCredentials`: `{ email: string; password: string; rememberMe?: boolean }`
- `IndividualRegisterPayload`: `{ userType: 'individual'; fullName: string; email: string; phone: string; password: string; agreement: boolean }`
- `OrganizationRegisterPayload`: `{ userType: 'organization'; companyName: string; inn: string; representativeName: string; email: string; password: string; agreement: boolean }`
- `AuthResponse`: `{ success: boolean; token?: string; user?: UserProfileDTO; error?: { code: string; message: string } }`

## 4. Архитектурное решение и состояние (State Management)
- Формы реализуются на контролируемых/неконтролируемых компонентах с валидацией схем через `Zod` (или чистые TypeScript валидаторы).
- Локальное состояние режима (`AuthMode: 'login' | 'register' | 'forgot_password'`).
- Состояние типа регистрации (`AccountType: 'individual' | 'organization'`).
- Состояние отправки (`status: 'idle' | 'submitting' | 'success' | 'error'`).

## 5. API Контракты (Client-Side Mock & Future Backend)
- `POST /api/v1/auth/login` $\rightarrow$ `{ token: string, user: UserProfile }`
- `POST /api/v1/auth/register/individual` $\rightarrow$ `{ success: true, message: 'Confirmation sent' }`
- `POST /api/v1/auth/register/organization` $\rightarrow$ `{ success: true, message: 'Confirmation sent' }`
- `POST /api/v1/auth/forgot-password` $\rightarrow$ `{ success: true }`

## 6. Permissions & Security Considerations
- Пароли никогда не выводятся в лог и не сохраняются в открытом виде в `localStorage`.
- Токены сессии предполагается сохранять в `HttpOnly, Secure, SameSite=Strict` cookies.
- Защита от XSS: все пользовательские строки экранируются React по умолчанию, исключено использование `dangerouslySetInnerHTML`.
- Rate Limiting на клиенте: блокировка повторной отправки на 60 секунд при получении ошибки 429.

## 7. Модель ошибок (Error Model)
Стандартизированные коды ошибок:
- `AUTH_INVALID_CREDENTIALS`: "Неверный email или пароль."
- `AUTH_USER_EXISTS`: "Пользователь с таким email уже зарегистрирован."
- `AUTH_INVALID_INN`: "Указан некорректный ИНН юридического лица."
- `NETWORK_ERROR`: "Не удалось связаться с сервером. Попробуйте позже."

## 8. Адаптивность и темы
- Использование семантических CSS переменных / CSS Modules / Tailwind.
- Поддержка переключения тем: Dark Mode и Light Mode.

## 9. Технические критерии приемки
- [ ] 100% строгая типизация TypeScript (`noImplicitAny`, zero typecheck errors).
- [ ] Нулевые предупреждения линтера (ESLint clean).
- [ ] Наличие изолированных компонентных тестов (React Testing Library / Jest / Vitest).
- [ ] Автономная работа в браузере через встроенный mock-провайдер.
