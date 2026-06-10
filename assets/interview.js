(function () {
  const countInput = document.querySelector("#questionCount");
  const levelFilter = document.querySelector("#levelFilter");
  const groupFilter = document.querySelector("#groupFilter");
  const generateButton = document.querySelector("#generateQuestions");
  const resultTitle = document.querySelector("#resultTitle");
  const resultDescription = document.querySelector("#resultDescription");
  const questionList = document.querySelector("#questionList");

  const questions = window.INTERVIEW_QUESTIONS || [];

  generateButton.addEventListener("click", generate);
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
        : "Відкрий тему, якщо хочеш подивитись відповідь, приклад коду і навчальний розбір.";

    questionList.innerHTML = items
      .map((item, index) => {
        return `
          <article class="question-card">
            <div>
              <p class="eyebrow">${item.level} / ${item.group}</p>
              <h3>${index + 1}. ${item.question}</h3>
            </div>
            <a href="${item.page}">Відкрити тему</a>
          </article>
        `;
      })
      .join("");
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
})();
