# iOS-Tech

Навчальний статичний сайт для підготовки до iOS-співбесід і проведення технічних інтерв'ю. Матеріали розбиті за рівнями Junior, Middle і Senior, а всередині - за напрямами Core, UI та Networking.

## Що всередині

- короткі відповіді на типові interview-питання;
- розширені навчальні пояснення: навіщо тема потрібна, як працює, приклад коду, як відповідати кандидату і що перевіряти інтерв'юеру;
- Swift-приклади для самоперевірки;
- генератор випадкових питань для співбесіди;
- окрема question bank з DOU iOS 250 questions;
- Senior-теми про архітектуру, Swift Package Manager, performance, observability і agentic development.

## Як відкрити

Проєкт не потребує build step. Відкрий `index.html` у браузері або запусти будь-який локальний static server з кореня репозиторію.

```bash
python -m http.server 8000
```

Після цього відкрий `http://localhost:8000`.

## Генератор питань

Сторінка `interview.html` дозволяє сформувати випадковий набір питань:

- вибрати кількість питань;
- відфільтрувати за рівнем Junior, Middle або Senior;
- відфільтрувати за напрямом Core, UI або Networking;
- перейти з питання прямо до навчальної теми з відповіддю та прикладами.

База питань винесена в `assets/questions.js`, щоб її було легко розширювати або в майбутньому додати інші платформи, наприклад Android.

Додаткова база з PDF/DOU-списку лежить у `assets/dou-ios-questions.js`. Вона містить питання без повних відповідей; готові навчальні теми можна поступово додавати й лінкувати з цієї бази.

## Структура

```text
.
├── index.html
├── assets/
│   ├── styles.css
│   └── learning.js
├── june/
├── middle/
└── seniour/
```

Кожна HTML-сторінка є окремою темою. Наприклад:

- `june/core/value-vs-reference.html`
- `middle/networking/retry-backoff.html`
- `seniour/core/agentic-development.html`
- `seniour/core/swift-package-manager.html`

## Як навчатися

1. Відкрий тему з головної сторінки.
2. Спробуй відповісти самостійно за 1-2 хвилини.
3. Звірся з короткою відповіддю.
4. Пройди блоки навчального розбору.
5. Напиши або проговори власний приклад з реального iOS-проєкту.

Для Senior-рівня корисно тренувати не визначення, а trade-offs: тестованість, підтримку, продуктивність, security, міграції, командні правила та ризики production-середовища.

## Swift Package Manager і модулі

У Senior/Core додано матеріали про Swift Package Manager і модульну архітектуру:

- як додавати remote та local packages;
- як описувати targets, products і dependencies в `Package.swift`;
- як менеджити versions, `Package.resolved`, transitive dependencies і ownership;
- як будувати feature/domain/shared modules;
- як робити фасадний API, коли назовні видно лише `public` facade, а services, DTO, mappers і concrete implementation залишаються `internal`.

## Agentic Development

У Senior/Core додано тему `Agentic development для iOS`. Вона пояснює, як працювати з AI-агентом у розробці: задавати ціль, давати контекст, контролювати scope, просити тести, перевіряти diff і не втрачати інженерний ownership.

Це корисно для сучасних iOS-команд, де AI може пришвидшувати рутинну роботу, але якість все одно залежить від рев'ю, тестів, безпеки й архітектурного мислення розробника.

## Як додати нову тему

1. Створи HTML-файл у відповідному рівні та групі, наприклад `middle/core/new-topic.html`.
2. Використай структуру наявних сторінок: `qa-card` для короткої відповіді й `learning-card` для навчального розбору.
3. Додай посилання на тему в `index.html`.
4. Якщо тема має спільний формат розбору, додай або онови дані в `assets/learning.js`.

## Ліцензія

Дивись [LICENSE](LICENSE).
