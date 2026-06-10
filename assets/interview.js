(function () {
  const countInput = document.querySelector("#questionCount");
  const levelFilter = document.querySelector("#levelFilter");
  const groupFilter = document.querySelector("#groupFilter");
  const showAnswersInput = document.querySelector("#showAnswers");
  const generateButton = document.querySelector("#generateQuestions");
  const resultTitle = document.querySelector("#resultTitle");
  const resultDescription = document.querySelector("#resultDescription");
  const questionList = document.querySelector("#questionList");

  const questions = [
    ...(window.INTERVIEW_QUESTIONS || []),
    ...(window.DOU_IOS_QUESTIONS || [])
  ];

  generateButton.addEventListener("click", generate);
  showAnswersInput.addEventListener("change", generate);
  generate();

  function generate() {
    const count = clamp(Number(countInput.value) || 10, 1, 50);
    countInput.value = count;

    const level = levelFilter.value;
    const group = groupFilter.value;
    const pool = questions.filter((item) => {
      const matchesLevel = level === "all" || item.level === level;
      const matchesGroup = group === "all" || item.group === group;
      return matchesLevel && matchesGroup;
    });

    const selected = shuffle(pool).slice(0, Math.min(count, pool.length));
    render(selected, pool.length, count);
  }

  function render(items, availableCount, requestedCount) {
    resultTitle.textContent = `Сформовано ${items.length} ${pluralize(items.length)}`;
    resultDescription.textContent =
      availableCount < requestedCount
        ? `За вибраними фільтрами доступно тільки ${availableCount}.`
        : showAnswersInput.checked
          ? "Відповіді згенеровані прямо в списку. Для частини питань також є окремі навчальні теми."
          : "Увімкни “Показувати відповіді”, щоб бачити коротку відповідь, тези, код і follow-up для інтерв'юера.";

    questionList.innerHTML = items
      .map((item, index) => {
        const meta = [item.level, item.group, item.section, item.source]
          .filter(Boolean)
          .join(" / ");
        const action = item.page
          ? `<a href="${item.page}">Відкрити тему</a>`
          : `<span class="question-source">${item.source || "Питання без сторінки"}</span>`;
        const answer = showAnswersInput.checked ? renderAnswer(item) : "";

        return `
          <article class="question-card">
            <div>
              <p class="eyebrow">${meta}</p>
              <h3>${index + 1}. ${item.question}</h3>
              ${answer}
            </div>
            ${action}
          </article>
        `;
      })
      .join("");
  }

  function renderAnswer(item) {
    const answer = window.getInterviewAnswer
      ? window.getInterviewAnswer(item)
      : null;

    if (!answer) return "";

    const details = answer.details && answer.details.length
      ? `<ul>${answer.details.map((detail) => `<li>${detail}</li>`).join("")}</ul>`
      : "";
    const code = answer.code
      ? `<pre><code>${escapeHtml(answer.code)}</code></pre>`
      : "";
    const interviewer = answer.interviewer
      ? `<p><strong>Для інтерв'юера:</strong> ${answer.interviewer}</p>`
      : "";

    return `
      <div class="generated-answer">
        <p><strong>Коротка відповідь:</strong> ${answer.short}</p>
        ${details}
        ${code}
        ${interviewer}
      </div>
    `;
  }

  function shuffle(items) {
    const copy = [...items];
    for (let index = copy.length - 1; index > 0; index -= 1) {
      const randomIndex = Math.floor(Math.random() * (index + 1));
      [copy[index], copy[randomIndex]] = [copy[randomIndex], copy[index]];
    }
    return copy;
  }

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  function pluralize(count) {
    if (count === 1) return "питання";
    if (count > 1 && count < 5) return "питання";
    return "питань";
  }

  function escapeHtml(value) {
    return value
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;");
  }
})();
