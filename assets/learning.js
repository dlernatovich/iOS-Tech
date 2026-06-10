(function () {
  const path = window.location.pathname.replace(/\\/g, "/");
  const parts = path.split("/").slice(-3);
  const key = parts.join("/");

  const byGroup = {
    core: {
      concept: "Core-теми перевіряють не пам'ять назв API, а розуміння семантики Swift, ownership, помилок, конкурентності та архітектурних наслідків. Для навчання корисно щоразу питати себе: хто володіє даними, хто може їх змінити, де межа відповідальності і як це протестувати.",
      interview: "Відповідай від простого визначення до практичного прикладу з iOS-проєкту. Добра відповідь зазвичай має три частини: що це, чому це важливо, який компроміс або типова пастка.",
      mistakes: ["Відповідати тільки термінами без прикладу з коду.", "Не згадувати ownership, lifecycle або тестованість.", "Плутати мовні можливості Swift із архітектурними рішеннями."],
      practice: "Візьми невелику feature і спробуй описати її models, services та state ownership без UI. Якщо пояснення виходить складним, це сигнал, що межі відповідальності розмиті."
    },
    ui: {
      concept: "UI-теми перевіряють здатність будувати стабільний, доступний і продуктивний інтерфейс. Важливо думати не тільки про те, як намалювати екран, а й про lifecycle, state, navigation, accessibility, локалізацію та performance.",
      interview: "Пояснюй UI-рішення через user experience і підтримку коду: як екран оновлюється, що відбувається при повороті, Dynamic Type, deep link, помилці завантаження або повільному девайсі.",
      mistakes: ["Ігнорувати accessibility та Dynamic Type.", "Тримати navigation і business logic прямо у view.", "Не вміти пояснити, чому UI лагає або перемальовується."],
      practice: "Зроби маленький список із loading, empty, error і content states. Потім додай VoiceOver labels і перевір, чи екран не розсипається при великому Dynamic Type."
    },
    networking: {
      concept: "Networking у мобільному застосунку це не тільки HTTP request. Це auth, retry policy, cancellation, cache, offline UX, security, observability і коректна мапа помилок у домен застосунку.",
      interview: "Починай із request/response, а потім переходь до production-питань: що робити з timeout, 401, refresh token race, flaky network, privacy у логах і тестами без реальної мережі.",
      mistakes: ["Вважати успіхом будь-який response без transport error.", "Розкидати URLSession напряму по view models або controllers.", "Retry-ити небезпечні операції без idempotency."],
      practice: "Напиши маленький HTTPClient protocol, fake implementation для тестів і один endpoint із decoding, status-code validation та domain error mapping."
    }
  };

  const topics = {
    "june/core/value-vs-reference.html": {
      concept: "Value semantics означає, що зміна однієї змінної неочікувано не змінює іншу. Це робить код передбачуванішим. Reference semantics корисна, коли потрібна спільна identity: наприклад, controller, cache, service або observable object.",
      interview: "Поясни через struct і class, потім згадай, що Array виглядає як value type, але оптимізована через copy-on-write.",
      mistakes: ["Казати, що value type завжди фізично копіюється негайно.", "Не згадати identity для class.", "Обирати class тільки тому, що так звично з UIKit."],
      practice: "Створи struct User і class UserBox, скопіюй їх у дві змінні та зміни поле. Подивись, як відрізняється поведінка."
    },
    "june/core/optionals.html": {
      concept: "Optional змушує явно працювати з відсутністю значення. Це зменшує кількість runtime crash порівняно з мовами, де null може бути будь-де.",
      interview: "Скажи, що Optional це enum із випадками some і none, а далі покажи guard let як основний спосіб раннього виходу.",
      mistakes: ["Використовувати force unwrap як звичайний стиль.", "Ховати проблему через ?? без розуміння, чи дефолтне значення коректне.", "Робити nested if let там, де guard читається краще."],
      practice: "Перепиши функцію з трьома force unwrap на guard let і додай зрозумілу помилку або fallback."
    },
    "june/core/protocols.html": {
      concept: "Protocol дозволяє залежати від поведінки, а не від конкретного типу. Це центральна ідея для test doubles, delegation і dependency inversion.",
      interview: "Покажи приклад service protocol і mock. Згадай, що protocol extension додає дефолтну реалізацію, але може приховати складну dispatch-поведінку.",
      mistakes: ["Створювати protocol для кожного класу без потреби.", "Не обмежувати delegate protocols через AnyObject, коли потрібен weak.", "Плутати inheritance класів і protocol conformance."],
      practice: "Винеси залежність APIClient за protocol і протестуй view model через fake client."
    },
    "june/core/memory-basics.html": {
      concept: "ARC керує життям об'єктів класів через strong references. Retain cycle виникає, коли об'єкти утримують один одного так, що лічильник ніколи не стає нулем.",
      interview: "Поясни strong за замовчуванням, weak для optional зворотних посилань і unowned тільки коли lifetime гарантовано коротший або рівний.",
      mistakes: ["Ставити unowned для delegate або async closure.", "Додавати weak self всюди без розуміння ownership.", "Забувати про timers, closures і subscriptions."],
      practice: "Зроби два класи Parent і Child з взаємними посиланнями, потім виправ retain cycle через weak."
    },
    "june/core/error-handling.html": {
      concept: "Помилки у Swift є частиною control flow. Добрий код відділяє transport/parsing/storage errors від доменних помилок, які розуміє UI.",
      interview: "Поясни throws, do/catch і коли використовувати Result. Додай приклад enum помилок для конкретної feature.",
      mistakes: ["Ловити всі помилки і мовчки ігнорувати.", "Показувати користувачу технічний текст помилки.", "Використовувати try! у production flow."],
      practice: "Опиши enum LoginError і замап URLSession/decoding помилки в повідомлення для UI."
    },
    "june/ui/uikit-lifecycle.html": {
      concept: "Lifecycle показує, коли view завантажена, коли вона з'являється на екрані і коли layout уже порахований. Неправильний метод часто дає дублікати requests або некоректні розміри.",
      interview: "Поясни різницю між viewDidLoad для одноразового setup і viewWillAppear для оновлення перед показом.",
      mistakes: ["Запускати один і той самий request у viewWillAppear без контролю.", "Читати final frame у viewDidLoad.", "Тримати business logic у controller."],
      practice: "Додай print у lifecycle methods і пройди push/pop, tab switch та modal presentation."
    },
    "june/ui/autolayout-basics.html": {
      concept: "Auto Layout це система рівнянь. Якщо constraints недостатньо, layout ambiguous. Якщо вони конфліктують, система ламає частину constraints у runtime.",
      interview: "Поясни anchors, safeAreaLayoutGuide, intrinsicContentSize і content hugging/compression resistance.",
      mistakes: ["Забувати translatesAutoresizingMaskIntoConstraints = false.", "Фіксувати ширину там, де має бути adaptive layout.", "Ігнорувати warnings у консолі."],
      practice: "Зроби label і button, які коректно працюють з довгим українським текстом і Dynamic Type."
    },
    "june/ui/table-collection.html": {
      concept: "Обидва компоненти показують багато елементів через reuse, але collection view має гнучкішу модель layout. Table view простіший для класичного вертикального списку.",
      interview: "Поясни reuse identifiers, cell lifecycle, data source, delegate і чому для складних секцій краще collection view.",
      mistakes: ["Зберігати state тільки в cell.", "Не скидати вміст cell перед reuse.", "Робити складний grid через table view."],
      practice: "Зроби список користувачів, а потім перероби його на grid через collection view."
    },
    "june/ui/storyboard-vs-code.html": {
      concept: "Це не питання правильної віри, а питання командного процесу. Storyboard дає швидкий visual setup, code дає явність, reviewability і легші merge conflicts.",
      interview: "Порівнюй за критеріями: розмір команди, merge conflicts, reusable components, onboarding і тестування.",
      mistakes: ["Казати, що один підхід завжди правильний.", "Не враховувати legacy app.", "Змішувати підходи без правил команди."],
      practice: "Опиши правила, коли у твоєму проєкті дозволені storyboard, XIB і UI in code."
    },
    "june/ui/swiftui-basics.html": {
      concept: "SwiftUI View є описом UI для поточного state. Коли state змінюється, framework заново обчислює body і застосовує різницю.",
      interview: "Поясни @State як локальний source of truth і @Binding як посилання на state власника.",
      mistakes: ["Думати, що View це довгоживучий об'єкт як UIView.", "Класти network calls прямо в body.", "Плутати @StateObject і @ObservedObject."],
      practice: "Створи counter з @State, потім винеси value у parent і передай child через @Binding."
    },
    "june/networking/http-basics.html": {
      concept: "HTTP має семантику: GET має бути safe, PUT часто idempotent, POST зазвичай створює side effect. Для мобільного це впливає на retry і cache.",
      interview: "Поясни method, headers, body, status code і приклад Authorization header.",
      mistakes: ["Передавати sensitive дані в query.", "Не розуміти різницю між 401 і 403.", "Ігнорувати cache headers."],
      practice: "Візьми один endpoint і розпиши method, URL, headers, body, success response і error response."
    },
    "june/networking/urlsession.html": {
      concept: "URLSession це transport layer. Він не знає твоєї доменної логіки, тому перевірка status code, decoding і error mapping мають бути явно описані вище.",
      interview: "Покажи async/await приклад і поясни, чому треба перевіряти HTTPURLResponse.",
      mistakes: ["Використовувати shared session для всього без конфігурації.", "Не налаштовувати timeout.", "Не підтримувати cancellation."],
      practice: "Створи URLSessionConfiguration з timeout і передай її в APIClient."
    },
    "june/networking/codable.html": {
      concept: "Codable зручний, коли JSON структура близька до Swift model. Для складних API іноді краще DTO + mapper, щоб domain model не залежала від backend quirks.",
      interview: "Поясни CodingKeys, keyDecodingStrategy і custom init(from:) для складних випадків.",
      mistakes: ["Використовувати одну model і для API, і для domain, і для UI завжди.", "Ігнорувати optional поля без бізнес-сенсу.", "Не тестувати decoding fixtures."],
      practice: "Зроби JSON fixture з snake_case і задекодуй його у DTO."
    },
    "june/networking/status-codes.html": {
      concept: "Transport success і application success не одне й те саме. URLSession може повернути data без Swift error навіть для 404 або 500.",
      interview: "Поясни групи status codes і як вони мапляться у domain errors.",
      mistakes: ["Декодувати success DTO для error body.", "Однаково обробляти 401, 403 і 500.", "Не логувати важливий контекст помилки."],
      practice: "Напиши switch для 200...299, 401, 404, 500...599 і default."
    },
    "june/networking/simple-api-client.html": {
      concept: "API client централізує правила мережі: base URL, headers, decoding, validation, errors. Це зменшує дублювання і робить поведінку однаковою у всьому app.",
      interview: "Поясни, які частини client мають бути generic, а які domain-specific.",
      mistakes: ["Змішувати UI alerts у networking layer.", "Повернути сирий Data у всі feature layers.", "Не мати mockable protocol."],
      practice: "Додай endpoint enum і generic request<T: Decodable>."
    },
    "middle/core/generics.html": {
      concept: "Generics дозволяють писати алгоритм один раз, зберігаючи конкретний тип. Associated types роблять protocol гнучким, але впливають на можливість використовувати його як existential.",
      interview: "Поясни на прикладі Repository<Entity>, а потім згадай some vs any.",
      mistakes: ["Робити generic API там, де простий protocol читається краще.", "Не розуміти compiler errors навколо associatedtype.", "Плутати type erasure з inheritance."],
      practice: "Створи AnyRepository wrapper для protocol з associatedtype."
    },
    "middle/core/concurrency-basics.html": {
      concept: "Structured concurrency допомагає не втрачати задачі. Parent task контролює child tasks, cancellation поширюється, а await позначає suspension point.",
      interview: "Поясни, що async не гарантує background thread і чому UI updates мають бути на MainActor.",
      mistakes: ["Створювати detached tasks без причини.", "Ігнорувати cancellation.", "Оновлювати UI поза MainActor."],
      practice: "Напиши паралельне завантаження двох ресурсів через async let і додай cancellation check."
    },
    "middle/core/gcd-operationqueue.html": {
      concept: "GCD низькорівневіший і простіший для dispatch. OperationQueue корисна, коли операції мають dependencies, priorities і cancellation state.",
      interview: "Порівнюй за моделлю керування роботою, не тільки за синтаксисом.",
      mistakes: ["Блокувати main queue через sync.", "Створювати deadlock на serial queue.", "Використовувати OperationQueue для простих one-off задач."],
      practice: "Зроби дві Operations, де друга стартує тільки після першої."
    },
    "middle/core/copy-on-write.html": {
      concept: "Copy-on-write дає value API поверх shared storage. Фізична копія відбувається тільки перед мутацією, якщо storage має більше одного власника.",
      interview: "Поясни на Array і згадай isKnownUniquelyReferenced для власних COW типів.",
      mistakes: ["Думати, що COW скасовує всі витрати копіювання.", "Не враховувати великі мутації у циклах.", "Плутати value semantics із thread safety."],
      practice: "Заміряй час копіювання великого Array без мутації і з мутацією."
    },
    "middle/core/dependency-injection.html": {
      concept: "DI робить залежності явними. Найчастіше достатньо initializer injection; service locator або container потрібні тільки коли складність справді виправдана.",
      interview: "Поясни, як DI допомагає unit tests і preview/test environments.",
      mistakes: ["Створювати concrete service всередині view model.", "Робити глобальні singletons для всього.", "Ускладнювати маленьку feature DI-container'ом."],
      practice: "Заміни Singleton.shared у view model на protocol, переданий через init."
    },
    "middle/ui/diffable-data-source.html": {
      concept: "Snapshot є декларацією поточного стану списку. UIKit сам рахує diff, але тільки якщо item identity стабільна і Hashable реалізований правильно.",
      interview: "Поясни sections/items, snapshot apply і чому identity не має залежати від mutable UI state.",
      mistakes: ["Використовувати UUID(), який генерується при кожному render.", "Змішувати manual updates і snapshot без потреби.", "Не розділяти identity та content."],
      practice: "Зроби snapshot для списку повідомлень і онови тільки текст одного item."
    },
    "middle/ui/composition-layout.html": {
      concept: "Compositional Layout дозволяє описувати layout секціями. Це особливо корисно для екранів, де різні секції мають різну геометрію.",
      interview: "Поясни item, group, section, supplementary item і orthogonal scrolling.",
      mistakes: ["Будувати надто складну layout-функцію без розбиття.", "Не тестувати на різних ширинах.", "Забувати про estimated sizes і self-sizing cells."],
      practice: "Створи екран із hero-секцією, horizontal carousel і vertical list."
    },
    "middle/ui/swiftui-data-flow.html": {
      concept: "SwiftUI сильний тоді, коли source of truth один і зрозумілий. Якщо стан дублюється між parent, child і view model, UI швидко стає непередбачуваним.",
      interview: "Поясни різницю між ownership wrappers: @StateObject створює і володіє, @ObservedObject спостерігає переданий об'єкт.",
      mistakes: ["Створювати @ObservedObject прямо у body/init view.", "Використовувати EnvironmentObject для всього.", "Дублювати один state у кількох місцях."],
      practice: "Побудуй форму редагування профілю з draft state і Save/Cancel."
    },
    "middle/ui/accessibility.html": {
      concept: "Accessibility робить продукт доступним для людей із різними потребами і часто покращує загальну якість UI. Це не optional polish, а частина якості.",
      interview: "Згадай VoiceOver, Dynamic Type, contrast, hit targets, reduce motion і accessibility identifiers для UI tests.",
      mistakes: ["Давати іконкам без тексту порожні labels.", "Ламати layout при великих шрифтах.", "Використовувати колір як єдиний сигнал стану."],
      practice: "Увімкни VoiceOver і пройди один flow без погляду на екран."
    },
    "middle/ui/navigation-coordinators.html": {
      concept: "Coordinator відокремлює навігацію від екранів. Це особливо корисно, коли один екран може відкриватися з різних flows або коли є deep links.",
      interview: "Поясни ownership child coordinators і як уникати retain cycles у flow.",
      mistakes: ["Створити один величезний AppCoordinator.", "Не видаляти child coordinator після завершення.", "Змішувати routing і business logic."],
      practice: "Опиши coordinator для login flow з success і cancel callbacks."
    },
    "middle/networking/retry-backoff.html": {
      concept: "Retry покращує UX тільки для тимчасових помилок. Exponential backoff із jitter захищає backend від синхронних повторів великої кількості клієнтів.",
      interview: "Поясни idempotency і наведи приклад, що можна retry-ити, а що ні.",
      mistakes: ["Retry без ліміту.", "Retry для 4xx помилок, які не виправляться самі.", "Повторювати payment POST без idempotency key."],
      practice: "Напиши retry policy, яка повторює тільки network timeout і 503 до трьох разів."
    },
    "middle/networking/auth-refresh-token.html": {
      concept: "Refresh flow має бути синхронізований. Якщо 10 requests отримали 401 одночасно, app має зробити один refresh і розбудити решту після оновлення token.",
      interview: "Поясни token storage, refresh lock/actor, retry original request і logout при refresh failure.",
      mistakes: ["Запускати паралельні refresh requests.", "Зберігати token у UserDefaults.", "Зациклити 401 -> refresh -> 401."],
      practice: "Спроєктуй actor AuthTokenProvider, який серіалізує refresh."
    },
    "middle/networking/caching.html": {
      concept: "HTTP cache корисний для response reuse, але domain cache потрібен для offline сценаріїв і контрольованого UX. Це різні рівні відповідальності.",
      interview: "Поясни Cache-Control, ETag і URLCache, потім скажи, коли потрібна database.",
      mistakes: ["Очікувати offline mode тільки від URLCache.", "Не інвалідувати cache після мутацій.", "Кешувати sensitive дані без політики."],
      practice: "Розпиши cache policy для профілю користувача, стрічки і feature flags."
    },
    "middle/networking/reachability.html": {
      concept: "Reachability описує стан network path, а не доступність конкретного backend. Сервер може бути down навіть при хорошому Wi-Fi.",
      interview: "Поясни NWPathMonitor як сигнал для UX, але не заміну error handling.",
      mistakes: ["Не робити request, бо monitor показав offline секунду тому.", "Показувати wrong state при captive portal.", "Не retry-ити queued operations після відновлення мережі."],
      practice: "Зроби offline banner, який не блокує ручну спробу повторити request."
    },
    "middle/networking/testing-network.html": {
      concept: "Тести мають перевіряти request building, decoding, error mapping і retry/auth logic без залежності від реального backend.",
      interview: "Поясни protocol-based mock і custom URLProtocol. Згадай JSON fixtures як контрактні приклади.",
      mistakes: ["Робити unit tests, які ходять в інтернет.", "Не тестувати error body.", "Тестувати тільки happy path."],
      practice: "Додай fixtures для 200, 401, 500 і invalid JSON."
    },
    "seniour/core/actors-sendable.html": {
      concept: "Actors не просто mutex із красивим синтаксисом. Вони задають ізоляцію стану, але через reentrancy actor може виконувати інший work, поки поточний метод чекає await.",
      interview: "Поясни actor isolation, Sendable, MainActor, reentrancy і коли потрібен nonisolated.",
      mistakes: ["Думати, що actor автоматично вирішує всі race conditions.", "Передавати non-Sendable mutable reference між tasks.", "Ігнорувати reentrancy після await."],
      practice: "Напиши actor cache і подумай, що станеться, якщо два callers одночасно запитають один ключ."
    },
    "seniour/core/memory-graph-leaks.html": {
      concept: "Leak hunting це системний процес: відтворити сценарій, зафіксувати baseline, знайти ownership path, виправити причину і перевірити повторно.",
      interview: "Назви інструменти і типові джерела retain cycles: closures, timers, notifications, Combine, async tasks.",
      mistakes: ["Додавати weak self без аналізу ownership.", "Не перевіряти deinit екрана.", "Плутати memory growth через cache з leak."],
      practice: "Відкрий і закрий екран 10 разів, перевір Memory Graph і поясни, хто утримує controller."
    },
    "seniour/core/architecture-tradeoffs.html": {
      concept: "Senior не продає одну архітектуру як silver bullet. Він обирає структуру під ризики продукту: складність домену, розмір команди, тестування, release cadence.",
      interview: "Порівнюй за критеріями: boilerplate, testability, learning curve, state management, dependency direction і build time.",
      mistakes: ["Називати VIPER або Clean завжди кращими.", "Не враховувати legacy constraints.", "Обговорювати папки замість boundaries."],
      practice: "Візьми одну feature і опиши її реалізацію в MVVM та Clean. Порівняй кількість файлів і тестованість."
    },
    "seniour/core/modularization.html": {
      concept: "Модульність це про межі відповідальності і dependency direction. Вона може прискорити збірку та ownership, але поганий граф залежностей зробить систему крихкою.",
      interview: "Поясни feature modules, shared modules, public API, SPM, binary dependencies і cyclic dependency risk.",
      mistakes: ["Створювати модуль на кожну дрібницю.", "Дозволяти feature-to-feature imports без правил.", "Ховати нестабільний API у shared module."],
      practice: "Намалюй dependency graph для app, core, design system і двох features."
    },
    "seniour/core/performance-instruments.html": {
      concept: "Performance оптимізують після вимірювання. Без baseline легко виправити не ту проблему або погіршити інший сценарій.",
      interview: "Поясни Time Profiler, Allocations, Leaks, Core Animation і чому тестувати треба на реальному девайсі у release-like умовах.",
      mistakes: ["Профілювати debug build і робити висновки.", "Оптимізувати без user-visible metric.", "Не перевірити regression після зміни."],
      practice: "Знайди main-thread роботу під час scroll і винеси її з cell configuration."
    },
    "seniour/ui/swiftui-uikit-interop.html": {
      concept: "Interop потрібен для поступових міграцій і використання сильних сторін обох frameworks. Найскладніші частини: lifecycle, sizing, navigation і state ownership.",
      interview: "Поясни UIHostingController, UIViewRepresentable, Coordinator inside representable і передачу dependencies.",
      mistakes: ["Дублювати state між UIKit і SwiftUI.", "Не враховувати safe area/sizing.", "Змішувати navigation ownership."],
      practice: "Вбудуй SwiftUI profile header у UIKit screen і передай action callback назад."
    },
    "seniour/ui/rendering-performance.html": {
      concept: "Rendering performance це боротьба за стабільний frame budget. 60 fps дає приблизно 16.7 ms на кадр, 120 fps ще менше.",
      interview: "Поясни main-thread blocking, overdraw, image decoding, cell reuse і SwiftUI invalidation.",
      mistakes: ["Декодувати великі картинки у cellForItem.", "Оновлювати весь список замість одного item.", "Не перевіряти на старших і слабших девайсах."],
      practice: "Додай os_signpost навколо важкої ділянки і перевір її в Instruments."
    },
    "seniour/ui/design-system.html": {
      concept: "Design system це продукт усередині продукту. Вона має API, версії, міграції, документацію, owners і критерії якості.",
      interview: "Говори про tokens, components, accessibility, Figma parity, theming, testing і adoption plan.",
      mistakes: ["Звести design system до enum кольорів.", "Не мати правил для breaking changes.", "Ігнорувати localized text і Dynamic Type."],
      practice: "Опиши Button component API для loading, disabled, destructive і icon states."
    },
    "seniour/ui/state-restoration.html": {
      concept: "State restoration має відновлювати намір користувача, а не випадкову внутрішню структуру views. Найкраще зберігати route і domain identifiers.",
      interview: "Поясни конфлікт restoration із deep link, auth expiry і stale data.",
      mistakes: ["Зберігати sensitive дані у plain storage.", "Відновлювати екран, до якого користувач уже не має доступу.", "Не версіонувати формат стану."],
      practice: "Опиши payload для відновлення checkout flow після kill app."
    },
    "seniour/ui/ui-testing-strategy.html": {
      concept: "UI tests дорогі, тому вони мають покривати найцінніші user journeys. Решта логіки краще тестується unit та integration tests.",
      interview: "Поясни test pyramid, accessibility identifiers, launch arguments, fake backend і боротьбу з flakiness.",
      mistakes: ["Покривати UI tests кожну дрібну умову.", "Залежати від реального backend.", "Використовувати sleep замість очікувань."],
      practice: "Напиши сценарій login success і login failure з fake API."
    },
    "seniour/networking/network-architecture.html": {
      concept: "Production networking layer має бути передбачуваним: один спосіб будувати request, один спосіб мапити помилки, контроль auth, retry, logs і metrics.",
      interview: "Опиши шари від Endpoint до Repository і поясни, де живе DTO-to-domain mapping.",
      mistakes: ["Дати feature layers доступ до сирого URLSession.", "Логувати tokens або PII.", "Змішати decoding, UI messages і transport в одному класі."],
      practice: "Спроєктуй Endpoint protocol із path, method, headers, query і body."
    },
    "seniour/networking/security-pinning.html": {
      concept: "Security рішення мають operational cost. Pinning може захистити від частини MITM, але неправильна ротація може покласти production app.",
      interview: "Поясни ATS, TLS trust evaluation, certificate vs public key pinning, backup pins і rollout plan.",
      mistakes: ["Вимикати ATS глобально.", "Hardcode secrets і вважати це захистом.", "Не мати плану на certificate rotation."],
      practice: "Склади checklist для впровадження pinning із rollback strategy."
    },
    "seniour/networking/graphql-rest-grpc.html": {
      concept: "API стиль впливає на client complexity, cache, tooling і evolution. Для iOS важливо, наскільки добре схема типізується, тестується і дебажиться.",
      interview: "Порівняй не за модністю, а за use case: public API, mobile feed, internal streaming, schema evolution.",
      mistakes: ["Казати, що GraphQL завжди швидший.", "Ігнорувати cache invalidation.", "Не враховувати backend і tooling команди."],
      practice: "Оціни один екран catalog app у REST і GraphQL: кількість requests, overfetching, cache."
    },
    "seniour/networking/background-transfers.html": {
      concept: "Background URLSession віддає контроль системі. App має бути готовий до delegate callbacks після relaunch і до того, що операція живе довше за process.",
      interview: "Поясни background configuration identifier, file upload, delegate, progress persistence і constraints.",
      mistakes: ["Очікувати completion closure як у foreground session.", "Не зберігати mapping task -> domain operation.", "Не тестувати relaunch scenario."],
      practice: "Опиши flow background upload фото з progress і retry після relaunch."
    },
    "seniour/networking/observability.html": {
      concept: "Observability відповідає на питання, що відбувається в production. Для networking це latency, errors, retries, payload size, cache hits і correlation із user impact.",
      interview: "Поясни metrics, structured logs, tracing/correlation IDs, sampling і privacy-safe redaction.",
      mistakes: ["Логувати request body з PII.", "Мати метрики без dimensions app version/network type.", "Створити alerts, на які ніхто не реагує."],
      practice: "Склади dashboard для login API: success rate, p95 latency, 401 rate, refresh failures."
    }
  };

  const group = parts[1];
  const data = topics[key] || byGroup[group];
  if (!data) return;

  const main = document.querySelector(".qa");
  if (!main) return;

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
  `;
  main.appendChild(card);
})();
