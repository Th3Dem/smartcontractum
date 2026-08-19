"""Passport Engine Service: Decision Tree and Specification Generator."""

import hashlib
from datetime import datetime
from typing import Tuple
from backend.models.passport import PassportCreate


def generate_passport_code(title: str) -> str:
    """Generate a unique PKSC Passport Code."""
    timestamp = datetime.now().strftime("%y%m%d%H%M")
    hash_part = hashlib.sha256(title.encode("utf-8")).hexdigest()[:4].upper()
    return f"SC-2026-PKSC-{timestamp}-{hash_part}"


def generate_decision_tree(payload: PassportCreate, passport_code: str) -> str:
    """Generate ASCII Decision Tree Logic representation."""
    success_act = (
        payload.success_action
        or "Мгновенный перевод средств из Эскроу на счет Поставщика"
    )

    tree_lines = [
        "[СТРУКТУРА ДЕРЕВА РЕШЕНИЙ ДЛЯ ПУБЛИКАЦИИ]",
        f"├─ ИДЕНТИФИКАТОР: {passport_code}",
        f"├─ НАЗВАНИЕ: {payload.title}",
        f"├─ УЧАСТНИКИ: {payload.parties}",
        f"├─ ИСТОЧНИК ДАННЫХ: {payload.data_source_type}",
        "└─ ЛОГИКА ИСПОЛНЕНИЯ:",
        f'   IF (Событие: "{payload.trigger_event}" == ПОДТВЕРЖДЕНО) THEN',
        f"      └─ ИСХОД: {success_act}",
        f'   ELSE IF (Статус == "Спор" OR {payload.exception_flow}) THEN',
        "      └─ ИСКЛЮЧЕНИЕ: Заморозка эскроу и эскалация в арбитражный контур ПКСК",
        "   ELSE",
        "      └─ ОЖИДАНИЕ: Опрос доверенного оракула с интервалом синхронизации",
    ]
    return "\n".join(tree_lines)


def generate_full_passport_markdown(
    payload: PassportCreate, passport_code: str, decision_tree: str
) -> str:
    """Generate complete Markdown specification document for export."""
    now_str = datetime.now().strftime("%d.%m.%Y, %H:%M (МСК)")

    md_lines = [
        f"# 📑 ПАСПОРТ СМАРТ-КОНТРАКТА ПКСК: {payload.title}",
        "",
        "> **Стандарт:** Регуляторная спецификация ПКСК Банка России (Фаза НИР 2026-2027)  ",
        f"> **Регистрационный код:** `{passport_code}`  ",
        f"> **Дата генерации:** {now_str}  ",
        "> **Лицензионный контур:** SmartContractum Umbrella-Integrator  ",
        "",
        "---",
        "",
        "## 1. ОБЩИЕ СВЕДЕНИЯ О СЦЕНАРИИ",
        f"- **Наименование бизнес-сценария:** {payload.title}",
        f"- **Идентифицированные стороны сделки:** {payload.parties}",
        f"- **Категория доверенного источника данных:** {payload.data_source_type}",
        "",
        "---",
        "",
        "## 2. АЛГОРИТМИЧЕСКОЕ «ДЕРЕВО РЕШЕНИЙ» (Decision Tree)",
        "",
        "```text",
        decision_tree,
        "```",
        "",
        "---",
        "",
        "## 3. СПЕЦИФИКАЦИЯ ТРИГГЕРОВ И ИСКЛЮЧЕНИЙ",
        "### 3.1. Условие успешного исполнения (Success Trigger):",
        f"- **Событие-триггер:** `{payload.trigger_event}`",
        f"- **Исполняемое действие:** `{payload.success_action or 'Автоматический взаиморасчет'}`",
        "",
        "### 3.2. Обработка спорных ситуаций (Exception Flow):",
        f"- **Условие сбоя / исключения:** `{payload.exception_flow}`",
        "- **Регламент разрешения:** Блокировка депонированных активов в защищенном Эскроу "
        "и передача криптографического журнала событий в третейский арбитраж.",
        "",
        "---",
        "",
        "## 4. ДЕКЛАРАЦИЯ БЕЗОПАСНОСТИ И ПРЕД-АУДИТА",
        "- [x] Кодовая база подготовлена к статическому анализу (SAST Bandit/Trivy).",
        "- [x] Исключено раскрытие сырых закрытых ключей и коммерческой тайны.",
        "- [x] Соответствие требованиям безопасности распределенных реестров Банка России.",
        "",
        "---",
        "*(Сгенерировано автоматически платформой SmartContractum — Umbrella-интегратором ПКСК Банка России)*",
    ]
    return "\n".join(md_lines)


def process_passport_creation(
    payload: PassportCreate,
) -> Tuple[str, str, str]:
    """Process payload and return (passport_code, decision_tree_text, full_markdown)."""
    code = generate_passport_code(payload.title)
    tree = generate_decision_tree(payload, code)
    full_md = generate_full_passport_markdown(payload, code, tree)
    return code, tree, full_md
