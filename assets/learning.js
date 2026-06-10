(function () {
  const path = window.location.pathname.replace(/\\/g, "/");
  const parts = path.split("/").slice(-3);
  const key = parts.join("/");
  const group = parts[1];

  const byGroup = {
    core: {
      concept:
        "Core-теми перевіряють не пам'ять назв API, а розуміння семантики Swift, ownership, помилок, конкурентності та архітектурних наслідків. Під час навчання щоразу запитуй себе: хто володіє даними, хто може їх змінити, де межа відповідальності і як це протестувати.",
      interview:
        "Відповідай від простого визначення до прикладу з iOS-проєкту. Добра відповідь має три частини: що це, чому це важливо, який компроміс або типова пастка.",
      mistakes: [
        "Відповідати лише термінами без прикладу з коду.",
        "Не згадувати ownership, lifecycle або тестованість.",
        "Плутати мовні можливості Swift із архітектурними рішеннями."
      ],
      practice:
        "Візьми невелику feature і опиши її models, services та state ownership без UI. Якщо пояснення виходить складним, це сигнал, що межі відповідальності розмиті.",
      exampleTitle: "Міні-приклад для тренування",
      exampleCode: `struct UserProfile {
    let id: UUID
    var displayName: String
}

protocol ProfileRepository {
    func profile(id: UUID) async throws -> UserProfile
}`
    },
    ui: {
      concept:
        "UI-теми перевіряють здатність будувати стабільний, доступний і продуктивний інтерфейс. Важливо думати не тільки про те, як намалювати екран, а й про lifecycle, state, navigation, accessibility, локалізацію та performance.",
      interview:
        "Пояснюй UI-рішення через user experience і підтримку коду: як екран оновлюється, що відбувається при повороті, Dynamic Type, deep link, помилці завантаження або повільному девайсі.",
      mistakes: [
        "Ігнорувати accessibility та Dynamic Type.",
        "Тримати navigation і business logic прямо у view.",
        "Не вміти пояснити, чому UI лагає або перемальовується."
      ],
      practice:
        "Зроби маленький список із loading, empty, error і content states. Потім додай VoiceOver labels і перевір, чи екран не розсипається при великому Dynamic Type.",
      exampleTitle: "SwiftUI state-приклад",
      exampleCode: `enum ScreenState {
    case loading
    case empty
    case content([String])
    case error(String)
}`
    },
    networking: {
      concept:
        "Networking у мобільному застосунку - це не тільки HTTP request. Це auth, retry policy, cancellation, cache, offline UX, security, observability і коректна мапа помилок у домен застосунку.",
      interview:
        "Починай із request/response, а потім переходь до production-питань: timeout, 401, refresh token race, flaky network, privacy у логах і тести без реальної мережі.",
      mistakes: [
        "Вважати успіхом будь-який response без transport error.",
        "Розкидати URLSession напряму по view models або controllers.",
        "Retry-ити небезпечні операції без idempotency."
      ],
      practice:
        "Напиши маленький HTTPClient protocol, fake implementation для тестів і один endpoint із decoding, status-code validation та domain error mapping.",
      exampleTitle: "Тестований client contract",
      exampleCode: `protocol HTTPClient {
    func send(_ request: URLRequest) async throws -> (Data, HTTPURLResponse)
}`
    }
  };

  const topics = {
    "seniour/core/agentic-development.html": {
      concept:
        "Agentic development працює найкраще, коли агент отримує чітку мету, релевантний контекст, межі змін і критерії готовності. Розробник лишається власником рішення, а агент допомагає з дослідженням, рутинними змінами, тестами й поясненням diff.",
      interview:
        "Пояснюй agentic development як engineering workflow: context gathering, план, маленькі зміни, verification, review. Наголошуй на privacy, security, тестах і контролі якості.",
      mistakes: [
        "Просити агента зробити все одразу без scope і non-goals.",
        "Приймати код без рев'ю, запуску тестів і перевірки edge cases.",
        "Передавати приватні tokens, secrets або PII без політик безпеки."
      ],
      practice:
        "Дай агенту маленьку feature, попроси знайти релевантні файли, запропонувати план, внести мінімальну зміну, додати тест і пояснити diff.",
      exampleTitle: "Приклад промпта",
      exampleCode: `Goal: Add an empty state to ProfileView.
Constraints: Keep changes inside Profile feature.
Verification: Add tests for loading, content, empty and error states.
Output: Summarize changed files and risks.`
    }
  };

  const data = topics[key] || byGroup[group];
  if (!data) return;

  const main = document.querySelector(".qa");
  if (!main || main.querySelector(".learning-card")) return;

  const card = document.createElement("section");
  card.className = "learning-card";
  card.innerHTML = `
    <h2>Навчальний розбір</h2>
    <div class="learning-grid">
      <div class="learning-block">
        <h3>Що треба зрозуміти</h3>
        <p>${data.concept}</p>
      </div>
      <div class="learning-block">
        <h3>Як пояснювати на співбесіді</h3>
        <p>${data.interview}</p>
      </div>
      <div class="learning-block">
        <h3>Типові помилки</h3>
        <ul>${data.mistakes.map((item) => `<li>${item}</li>`).join("")}</ul>
      </div>
      <div class="learning-block">
        <h3>Практика</h3>
        <p>${data.practice}</p>
      </div>
    </div>
    <div class="learning-example">
      <h3>${data.exampleTitle}</h3>
      <pre><code>${escapeHtml(data.exampleCode)}</code></pre>
    </div>
  `;
  main.appendChild(card);

  function escapeHtml(value) {
    return value
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;");
  }
})();
