(function () {
  const rules = [
    {
      match: ["локального збереження", "persistent storage", "зберігання даних", "збереження даних"],
      answer: {
        short: "Локальне збереження в iOS обирають за типом даних: налаштування, секрети, файли, кеш або структурована offline-база.",
        details: [
          "UserDefaults - для малих non-sensitive налаштувань.",
          "Keychain - для tokens, credentials і секретів.",
          "FileManager - для документів, кешів і тимчасових файлів.",
          "Core Data/Realm/SQLite - для складних моделей, relationships і offline-first сценаріїв."
        ],
        code: "let defaults = UserDefaults.standard\ndefaults.set(true, forKey: \"hasSeenOnboarding\")",
        interviewer: "Попроси кандидата вибрати storage для access token, cached feed, downloaded PDF і user setting."
      }
    },
    {
      match: ["декількох потоках", "багатопоток", "конкурентн", "потоках", "потоків"],
      answer: {
        short: "Для роботи на кількох потоках в iOS використовують GCD, OperationQueue, Swift Concurrency, locks/semaphores і actors.",
        details: [
          "Main thread відповідає за UI.",
          "GCD дає DispatchQueue для async/sync виконання.",
          "OperationQueue корисний для cancellable/dependent operations.",
          "Actors ізолюють mutable state у Swift Concurrency."
        ],
        code: "Task.detached {\n    let image = await decodeImage(data)\n    await MainActor.run { imageView.image = image }\n}",
        interviewer: "Follow-up: як кандидат захистить shared mutable state від race condition?"
      }
    },
    {
      match: ["модель роботи з пам", "підрахунку посилань", "підрахунок посилань", "reference counting"],
      answer: {
        short: "iOS використовує ARC для керування пам'яттю Objective-C/Swift class instances через automatic reference counting.",
        details: [
          "Кожне strong посилання збільшує reference count.",
          "Коли strong count стає нулем, object деалокується.",
          "Weak не утримує object і автоматично стає nil.",
          "Retain cycle заважає count стати нулем."
        ],
        code: "class Child {\n    weak var parent: Parent?\n}\n\nclass Parent {\n    var child: Child?\n}",
        interviewer: "Попроси кандидата пояснити retain cycle parent-child і closure-self."
      }
    },
    {
      match: ["foreground active", "foreground inactive", "inactive стан", "background", "suspended"],
      answer: {
        short: "App states описують, чи app активний, тимчасово неактивний, у background, suspended або terminated.",
        details: [
          "Foreground Active - app на екрані й отримує events.",
          "Foreground Inactive - app видимий, але тимчасово не отримує events, наприклад під час системного interruption.",
          "Background - app виконує обмежену роботу поза екраном.",
          "Suspended - app у пам'яті, але код не виконується."
        ],
        code: "func sceneWillResignActive(_ scene: UIScene) {}\nfunc sceneDidBecomeActive(_ scene: UIScene) {}\nfunc sceneDidEnterBackground(_ scene: UIScene) {}",
        interviewer: "Follow-up: що треба зберегти при переході в background?"
      }
    },
    {
      match: ["func-структури", "mutating", "могла змінювати значення"],
      answer: {
        short: "Щоб метод struct або enum міг змінювати self чи його властивості, його треба позначити mutating.",
        details: [
          "Struct і enum є value types.",
          "Instance methods за замовчуванням не можуть змінювати self.",
          "mutating дозволяє змінити властивості або присвоїти нове self.",
          "Для let instance mutating method викликати не можна."
        ],
        code: "struct Counter {\n    private(set) var value = 0\n\n    mutating func increment() {\n        value += 1\n    }\n}",
        interviewer: "Попроси кандидата пояснити, чому mutating не потрібен class method."
      }
    },
    {
      match: ["swift 5", "нові можливості swift", "swift 5+"],
      answer: {
        short: "Swift 5+ приніс ABI stability, Result, property wrappers, Codable improvements, concurrency async/await, actors і Sendable.",
        details: [
          "Swift 5.0 - ABI stability.",
          "Swift 5.1 - property wrappers і opaque result types.",
          "Swift 5.5 - async/await, actors, structured concurrency.",
          "Нові версії додають покращення generics, concurrency checks і macros."
        ],
        code: "@MainActor\nfinal class ViewModel: ObservableObject {\n    func load() async {\n        data = try? await service.load()\n    }\n}",
        interviewer: "Follow-up: які з цих можливостей кандидат реально використовував у production?"
      }
    },
    {
      match: ["купа і стек", "heap", "stack"],
      answer: {
        short: "Stack зберігає call frames і локальні значення з коротким lifetime. Heap зберігає objects або storage з динамічним lifetime.",
        details: [
          "Stack швидкий і звільняється автоматично при виході з function.",
          "Heap гнучкіший, але потребує керування lifetime через ARC або інші механізми.",
          "Class instances зазвичай живуть у heap.",
          "Value type може містити storage у heap, наприклад Array buffer."
        ],
        code: "func makeUser() {\n    let name = \"Ira\"          // local value\n    let service = APIService() // class instance managed by ARC\n}",
        interviewer: "Попроси кандидата не спрощувати до 'struct завжди stack, class завжди heap' - у Swift це не завжди точна модель."
      }
    },
    {
      match: ["agentic development", "ai-агент", "ai agent"],
      answer: {
        short: "Agentic development - це workflow, де розробник керує AI-агентом: дає контекст, ставить ціль, обмежує scope, перевіряє diff і запускає тести.",
        details: [
          "AI може допомогти знайти файли, запропонувати план, внести рутинні зміни й додати тести.",
          "Розробник лишається owner архітектурних рішень.",
          "Потрібні privacy правила: не передавати secrets, tokens, PII.",
          "Результат завжди треба рев'ювити й перевіряти локально."
        ],
        code: "Goal: Add empty state to ProfileView.\nScope: Only Profile feature.\nVerification: Add tests and summarize risks.",
        interviewer: "Попроси кандидата описати, як він контролюватиме AI-generated code у production-команді."
      }
    },
    {
      match: ["production networking layer", "networking layer", "http-client", "endpoint"],
      answer: {
        short: "Production networking layer централізує request building, auth, retry, decoding, logging, metrics і error mapping.",
        details: [
          "Endpoint описує path, method, headers, query і body.",
          "HTTPClient виконує transport і перевіряє status code.",
          "Repository мапить DTO у domain model.",
          "Interceptors або decorators додають auth, retry і observability."
        ],
        code: "protocol Endpoint {\n    var path: String { get }\n    var method: HTTPMethod { get }\n}\n\nprotocol HTTPClient {\n    func send<T: Decodable>(_ endpoint: Endpoint) async throws -> T\n}",
        interviewer: "Попроси кандидата пояснити, де має жити DTO-to-domain mapping."
      }
    },
    {
      match: ["background uploads", "background downloads", "background transfers", "background urlsession"],
      answer: {
        short: "Background transfers дозволяють upload/download продовжуватись, коли app у background або після relaunch.",
        details: [
          "Потрібна URLSessionConfiguration.background з identifier.",
          "Результати приходять через URLSessionDelegate.",
          "Треба зберігати mapping між task identifier і domain operation.",
          "Не можна покладатися на completion closure як у foreground request."
        ],
        code: "let configuration = URLSessionConfiguration.background(\n    withIdentifier: \"com.example.uploads\"\n)\nlet session = URLSession(configuration: configuration, delegate: delegate, delegateQueue: nil)",
        interviewer: "Follow-up: як відновити progress upload після relaunch app?"
      }
    },
    {
      match: ["структури даних", "структур даних", "array", "linked list", "map", "dictionary", "hashmap"],
      answer: {
        short: "Структури даних організовують зберігання й доступ до даних. Вибір структури впливає на складність операцій і пам'ять.",
        details: [
          "Array має швидкий доступ за індексом O(1), але insert/delete всередині може бути O(n).",
          "Dictionary/Set базуються на hashing і дають швидкий пошук у середньому O(1).",
          "Linked list має дешеве вставлення за відомим вузлом, але повільний доступ за індексом.",
          "Для iOS важливо обирати структуру під реальний access pattern."
        ],
        code: "var usersByID: [String: User] = [:]\nusersByID[user.id] = user\nlet profile = usersByID[requestedID]",
        interviewer: "Попроси кандидата пояснити, коли Dictionary кращий за Array для lookup."
      }
    },
    {
      match: ["enum", "перелічуван", "асоційовані значення", "associated values"],
      answer: {
        short: "Enum у Swift описує один із кількох можливих станів. Associated values дозволяють кожному case нести власні дані.",
        details: [
          "Enum добре підходить для UI state, domain errors і navigation routes.",
          "Associated values роблять enum типобезпечним.",
          "Raw values - це фіксовані значення типу String/Int тощо.",
          "Switch по enum змушує явно обробити всі cases."
        ],
        code: "enum ProfileState {\n    case loading\n    case loaded(User)\n    case failed(String)\n}",
        interviewer: "Попроси кандидата змоделювати loading/content/error через enum замість кількох Bool."
      }
    },
    {
      match: ["open і public", "private і public", "рівнями доступу", "типів (за доступом)", "access control", "доступ"],
      answer: {
        short: "Access control визначає, хто може бачити тип, властивість або метод: private, fileprivate, internal, public, open.",
        details: [
          "internal - default у межах module.",
          "public відкриває API для інших modules, але class не можна subclass-ити ззовні.",
          "open дозволяє subclass/override з іншого module.",
          "private/fileprivate обмежують видимість усередині scope або файлу."
        ],
        code: "public protocol PaymentsFacade {\n    func startCheckout(orderID: String)\n}\n\ninternal final class DefaultPaymentsFacade: PaymentsFacade {\n    func startCheckout(orderID: String) {}\n}",
        interviewer: "Follow-up: чому в модулі краще тримати implementation internal, а назовні давати малий facade?"
      }
    },
    {
      match: ["var", "let", "мутаб"],
      answer: {
        short: "let створює immutable binding, var - mutable binding. Для value types let також забороняє зміну властивостей значення.",
        details: [
          "let для class не робить object immutable, а лише забороняє переприсвоїти reference.",
          "var для struct дозволяє змінювати його mutable properties.",
          "Immutability зменшує кількість неочікуваних змін стану.",
          "У concurrent code immutable дані безпечніші."
        ],
        code: "let service = APIService()\n// service = APIService() не можна\n\nvar profile = Profile(name: \"Ira\")\nprofile.name = \"Oleh\"",
        interviewer: "Попроси кандидата пояснити різницю let для class instance і let для struct instance."
      }
    },
    {
      match: ["lazy var", "lazy"],
      answer: {
        short: "lazy var ініціалізується тільки при першому доступі. Це корисно для дорогих або залежних від self об'єктів.",
        details: [
          "lazy може бути тільки var, бо значення встановлюється після init.",
          "Зручно для UI components у UIKit.",
          "Не варто ховати важкі side effects у lazy без потреби.",
          "lazy не є автоматично thread-safe."
        ],
        code: "private lazy var titleLabel: UILabel = {\n    let label = UILabel()\n    label.font = .preferredFont(forTextStyle: .headline)\n    return label\n}()",
        interviewer: "Follow-up: чому lazy var може звертатись до self, а звичайна stored property у init phase - ні?"
      }
    },
    {
      match: ["extension", "ключове слово"],
      answer: {
        short: "extension додає нові methods, computed properties, protocol conformance або nested types до існуючого типу.",
        details: [
          "Extension допомагає групувати код за відповідальністю.",
          "Можна додати conformance до protocol.",
          "Stored properties у extension додавати не можна.",
          "Надмірні extensions можуть розкидати логіку й ускладнити навігацію."
        ],
        code: "extension UserDTO {\n    func toDomain() -> User {\n        User(id: String(id), name: fullName)\n    }\n}",
        interviewer: "Попроси кандидата пояснити, чому stored property в extension неможлива."
      }
    },
    {
      match: ["функція", "метод", "function"],
      answer: {
        short: "Функція - це іменований блок коду з параметрами й результатом. Метод - це функція, пов'язана з типом або instance.",
        details: [
          "У Swift функції можуть бути top-level, instance, static або class methods.",
          "Параметри мають external/internal names.",
          "throws/async змінюють спосіб виклику.",
          "Access control визначає, хто може викликати функцію з іншого module."
        ],
        code: "func loadProfile(id: String) async throws -> Profile {\n    try await repository.profile(id: id)\n}",
        interviewer: "Follow-up: чим static method відрізняється від instance method?"
      }
    },
    {
      match: ["колекції", "collections", "set", "hash", "array", "dictionary"],
      answer: {
        short: "Основні колекції Swift: Array, Dictionary і Set. Вони мають value semantics і copy-on-write оптимізацію.",
        details: [
          "Array зберігає ordered список.",
          "Dictionary зберігає key-value pairs.",
          "Set зберігає унікальні Hashable значення.",
          "Якщо два об'єкти в Set мають однаковий hash, Swift додатково перевіряє equality."
        ],
        code: "let ids: Set<String> = [\"a\", \"b\", \"a\"]\nprint(ids.count) // 2",
        interviewer: "Попроси кандидата пояснити різницю між Hashable і Equatable."
      }
    },
    {
      match: ["anyobject", "any object", "any "],
      answer: {
        short: "Any може представляти значення будь-якого типу, а AnyObject - тільки instance class/reference type.",
        details: [
          "Any включає struct, enum, class, function types.",
          "AnyObject використовується для class-only APIs і Objective-C interop.",
          "Надмірне використання Any втрачає type safety.",
          "Краще використовувати generics або protocols, якщо можливо."
        ],
        code: "let values: [Any] = [1, \"text\", true]\nlet objects: [AnyObject] = [UIView(), NSObject()]",
        interviewer: "Follow-up: коли Any є ознакою поганого дизайну API?"
      }
    },
    {
      match: ["читання/запис", ".txt", "файлу", "filemanager"],
      answer: {
        short: "Для читання й запису файлів в iOS використовують FileManager і URL до sandbox-директорій app.",
        details: [
          "Documents - для user-generated даних.",
          "Caches - для відновлюваних кешів.",
          "Temporary - для тимчасових файлів.",
          "Не можна писати в bundle app після інсталяції."
        ],
        code: "let url = FileManager.default.urls(for: .documentDirectory, in: .userDomainMask)[0]\n    .appendingPathComponent(\"notes.txt\")\ntry \"Hello\".write(to: url, atomically: true, encoding: .utf8)\nlet text = try String(contentsOf: url, encoding: .utf8)",
        interviewer: "Попроси кандидата пояснити різницю між bundle resource і documents file."
      }
    },
    {
      match: ["синхронне", "асинхронне", "послідовним"],
      answer: {
        short: "Синхронне виконання блокує caller до завершення роботи. Асинхронне запускає роботу й повертає control раніше.",
        details: [
          "Sequential означає виконання кроків один за одним.",
          "Concurrent означає, що задачі можуть перекриватися в часі.",
          "Parallel означає реальне одночасне виконання на кількох ядрах.",
          "UI не можна блокувати довгими синхронними операціями на main thread."
        ],
        code: "Task {\n    let profile = try await service.loadProfile()\n    await MainActor.run { self.profile = profile }\n}",
        interviewer: "Follow-up: чи async завжди означає parallel? Ні, і кандидат має це пояснити."
      }
    },
    {
      match: ["ui-фреймворки", "ui frameworks", "swiftui та uikit"],
      answer: {
        short: "Основні UI-фреймворки iOS: UIKit і SwiftUI. UIKit imperative/object-oriented, SwiftUI declarative/state-driven.",
        details: [
          "UIKit зрілий, гнучкий і широко використовується в legacy apps.",
          "SwiftUI описує UI як функцію від state.",
          "Їх можна комбінувати через UIHostingController і UIViewRepresentable.",
          "Вибір залежить від iOS version target, команди й існуючої codebase."
        ],
        code: "let hosting = UIHostingController(rootView: ProfileHeaderView(user: user))\nnavigationController.pushViewController(hosting, animated: true)",
        interviewer: "Попроси кандидата назвати проблеми interop: sizing, navigation, state ownership."
      }
    },
    {
      match: ["система контролю версій", "скв", "version control"],
      answer: {
        short: "Система контролю версій зберігає історію змін, дозволяє працювати в гілках і координувати командну розробку.",
        details: [
          "Git - distributed VCS.",
          "Branch дозволяє ізолювати роботу.",
          "Merge/rebase інтегрують зміни.",
          "Pull request додає code review і CI checks."
        ],
        code: "git checkout -b feature/profile-empty-state\ngit add .\ngit commit -m \"Add profile empty state\"",
        interviewer: "Follow-up: як розв'язувати merge conflict і зберегти зрозумілу історію?"
      }
    },
    {
      match: ["push notifications", "notification", "apns"],
      answer: {
        short: "Push Notifications доставляються через APNs: provider server відправляє payload у APNs, а APNs доставляє його на device/app.",
        details: [
          "App просить дозвіл у користувача.",
          "Device отримує device token і передає його backend.",
          "Backend відправляє notification через APNs.",
          "App обробляє foreground/background tap або silent push залежно від payload і state."
        ],
        code: "UNUserNotificationCenter.current().requestAuthorization(options: [.alert, .badge, .sound]) { granted, error in\n    if granted { DispatchQueue.main.async { UIApplication.shared.registerForRemoteNotifications() } }\n}",
        interviewer: "Попроси кандидата пояснити різницю між local, remote і silent notification."
      }
    },
    {
      match: ["runloop", "run loop"],
      answer: {
        short: "RunLoop керує подіями потоку: timers, input sources, events. Main RunLoop підтримує UI event processing.",
        details: [
          "RunLoop дозволяє потоку чекати події без активного busy waiting.",
          "Timers прив'язані до run loop modes.",
          "Scroll може перемикати mode, через що timer у default mode може не спрацьовувати.",
          "Main RunLoop критичний для UI responsiveness."
        ],
        code: "Timer.scheduledTimer(withTimeInterval: 1, repeats: true) { _ in\n    tick()\n}",
        interviewer: "Follow-up: чому timer може не працювати під час scroll і що таке common modes?"
      }
    },
    {
      match: ["objective-c", "objc", "obj-c"],
      answer: {
        short: "Swift і Objective-C можуть співіснувати в одному iOS-проєкті через bridging header і generated Swift interface.",
        details: [
          "Swift може викликати Objective-C API, якщо вони видимі через bridging header.",
          "Objective-C може бачити Swift класи через -Swift.h, якщо вони сумісні з ObjC runtime.",
          "@objc відкриває Swift declarations для Objective-C.",
          "Swift має stronger type safety, value types, optionals і modern concurrency."
        ],
        code: "@objc final class ProfilePresenter: NSObject {\n    @objc func reload() {}\n}",
        interviewer: "Попроси кандидата пояснити, які Swift features погано мостяться в Objective-C."
      }
    },
    {
      match: ["value types", "reference types", "reference та value", "value та reference"],
      answer: {
        short: "Value types мають семантику незалежного значення, а reference types мають shared identity. У Swift struct/enum зазвичай value types, class - reference type.",
        details: [
          "Value type при зміні копії не змінює оригінал.",
          "Reference type може мати кілька посилань на один object.",
          "Class instances керуються ARC.",
          "Array/Dictionary/Set мають value semantics і використовують copy-on-write."
        ],
        code: "struct User { var name: String }\n\nvar first = User(name: \"Ira\")\nvar second = first\nsecond.name = \"Oleh\"\n\nprint(first.name) // Ira",
        interviewer: "Попроси кандидата пояснити, чому ViewModel часто class, а DTO/domain model часто struct."
      }
    },
    {
      match: ["error handling", "помил", "throws", "do/catch"],
      answer: {
        short: "Error handling у Swift описує failure path через throws, do/catch, Result або optional, залежно від природи помилки.",
        details: [
          "throws підходить для операцій, які можуть завершитися помилкою: network, storage, decoding.",
          "do/catch дозволяє обробити конкретні помилки.",
          "Result зручний для callback API або збереження результату як value.",
          "UI має отримувати domain error, а не сирий URLError чи DecodingError."
        ],
        code: "do {\n    let profile = try await service.loadProfile()\n    state = .loaded(profile)\n} catch APIError.unauthorized {\n    state = .loggedOut\n} catch {\n    state = .failed(\"Не вдалося завантажити дані\")\n}",
        interviewer: "Попроси кандидата замапити transport, decoding і business errors у різні UI states."
      }
    },
    {
      match: ["dependency injection", "di ", "інжект", "залежност"],
      answer: {
        short: "Dependency Injection робить залежності явними: об'єкт отримує потрібні сервіси ззовні, а не створює їх сам.",
        details: [
          "Це зменшує coupling і полегшує unit testing.",
          "Найчастіше в iOS використовують initializer injection.",
          "DI container може допомогти з composition, але не має ховати залежності повністю.",
          "Для тестів можна передати fake або mock implementation."
        ],
        code: "final class FeedViewModel {\n    private let repository: FeedRepository\n\n    init(repository: FeedRepository) {\n        self.repository = repository\n    }\n}",
        interviewer: "Попроси кандидата переписати ViewModel, яка напряму створює APIClient, на DI."
      }
    },
    {
      match: ["retry", "backoff", "timeout"],
      answer: {
        short: "Retry і backoff потрібні для тимчасових збоїв мережі, але їх треба застосовувати тільки до безпечних або idempotent операцій.",
        details: [
          "Timeout обмежує час очікування.",
          "Exponential backoff збільшує паузу між спробами.",
          "Jitter зменшує ризик одночасних повторів від багатьох клієнтів.",
          "POST payment без idempotency key не можна retry-ити як звичайний GET."
        ],
        code: "for attempt in 1...maxAttempts {\n    do { return try await request() }\n    catch where attempt < maxAttempts {\n        try await Task.sleep(nanoseconds: delay)\n        delay *= 2\n    }\n}",
        interviewer: "Попроси кандидата скласти retry policy для GET feed, login і payment."
      }
    },
    {
      match: ["reachability", "offline", "поганого інтернет", "поганої мереж", "nwpathmonitor"],
      answer: {
        short: "Reachability показує стан network path, але не гарантує, що конкретний request успішно завершиться.",
        details: [
          "NWPathMonitor допомагає показати offline banner або змінити UX.",
          "Кожен request усе одно має власну error handling logic.",
          "Captive portal і flaky network можуть давати несподівані результати.",
          "Offline UX має дозволяти retry і, за потреби, працювати з cache."
        ],
        code: "let monitor = NWPathMonitor()\nmonitor.pathUpdateHandler = { path in\n    let isOnline = path.status == .satisfied\n    Task { @MainActor in state.isOnline = isOnline }\n}",
        interviewer: "Попроси кандидата пояснити, як він тестуватиме app у Network Link Conditioner."
      }
    },
    {
      match: ["memory leaks", "leak", "memory graph", "витік"],
      answer: {
        short: "Memory leak в iOS часто виникає через retain cycle: closure, delegate, Timer, NotificationCenter, Combine subscription або async task.",
        details: [
          "Перевір deinit екрана після закриття.",
          "Використай Xcode Memory Graph, Leaks або Allocations.",
          "Дивись retaining path, а не просто кількість об'єктів.",
          "Не всі memory growth є leak: cache може рости навмисно."
        ],
        code: "deinit {\n    print(\"ProfileViewController deinit\")\n}",
        interviewer: "Попроси кандидата знайти, хто утримує ViewController після pop."
      }
    },
    {
      match: ["modularization", "модул", "спм", "swift package manager", "package.swift"],
      answer: {
        short: "Модульна архітектура ділить app на targets/packages з чіткими public API, dependency direction і ownership.",
        details: [
          "Feature module містить feature UI/state.",
          "Domain module містить models і business contracts.",
          "Shared modules не мають ставати смітником utilities.",
          "SPM дозволяє описати products, targets і dependencies у Package.swift."
        ],
        code: ".target(\n    name: \"ProfileFeature\",\n    dependencies: [\"ProfileDomain\", \"Networking\"]\n)",
        interviewer: "Попроси кандидата намалювати dependency graph і пояснити, що має бути public, а що internal."
      }
    },
    {
      match: ["instruments", "performance", "профілювати", "rendering performance"],
      answer: {
        short: "Performance треба оптимізувати після вимірювання. Instruments допомагає знайти CPU hotspots, allocations, leaks і rendering hitches.",
        details: [
          "Time Profiler показує CPU-heavy code.",
          "Allocations і Leaks допомагають із пам'яттю.",
          "Core Animation показує frame drops, overdraw і rendering issues.",
          "Профілювати треба release-like build на реальному девайсі."
        ],
        code: "os_signpost(.begin, log: log, name: \"LoadFeed\")\nawait loadFeed()\nos_signpost(.end, log: log, name: \"LoadFeed\")",
        interviewer: "Попроси кандидата пояснити, як він доведе, що оптимізація справді допомогла."
      }
    },
    {
      match: ["design system", "дизайн system", "tokens"],
      answer: {
        short: "Design system - це набір tokens, components, правил accessibility, документації й ownership для консистентного UI.",
        details: [
          "Tokens описують кольори, spacing, typography, radius.",
          "Components приховують повторювану UI-логіку.",
          "Потрібні правила versioning і migration.",
          "Сильна design system враховує localization, Dynamic Type і theming."
        ],
        code: "struct PrimaryButton: View {\n    let title: String\n    let action: () -> Void\n\n    var body: some View {\n        Button(title, action: action)\n            .buttonStyle(.borderedProminent)\n    }\n}",
        interviewer: "Попроси кандидата описати API Button component для loading, disabled і destructive states."
      }
    },
    {
      match: ["observability", "logs", "metrics", "tracing"],
      answer: {
        short: "Observability дозволяє зрозуміти production-поведінку app: latency, errors, retries, cache hits і user impact.",
        details: [
          "Logs мають бути structured і privacy-safe.",
          "Metrics показують rates, latency percentiles і dimensions.",
          "Tracing/correlation ID допомагає зв'язати client request із backend.",
          "Не можна логувати tokens, PII і приватний request body."
        ],
        code: "logger.info(\"api_finished\", metadata: [\n    \"path\": \"\\(endpoint.path)\",\n    \"status\": \"\\(statusCode)\",\n    \"duration_ms\": \"\\(duration)\"\n])",
        interviewer: "Попроси кандидата спроєктувати dashboard для login API."
      }
    },
    {
      match: ["status code", "status codes", "статус"],
      answer: {
        short: "HTTP status code показує результат обробки request на рівні HTTP, але app має мапити його в domain behavior.",
        details: [
          "2xx - success.",
          "400 - поганий request, 401 - auth required, 403 - немає доступу, 404 - не знайдено.",
          "5xx - server-side issue.",
          "401 часто запускає refresh token flow."
        ],
        code: "switch response.statusCode {\ncase 200..<300: return\ncase 401: throw APIError.unauthorized\ncase 500..<600: throw APIError.server\ncase let code: throw APIError.badStatus(code)\n}",
        interviewer: "Попроси кандидата пояснити різницю між 401 і 403."
      }
    },
    {
      match: ["application lifecycle", "життєвий цикл ios", "app lifecycle", "scene lifecycle"],
      answer: {
        short: "iOS app lifecycle описує переходи застосунку між inactive, active, background, suspended і terminated states.",
        details: [
          "UIApplicationDelegate відповідає за app-level events.",
          "UISceneDelegate керує lifecycle конкретної scene/window.",
          "У background треба зберегти стан і завершити критичні задачі.",
          "Push, deep link і background events можуть запускати app у різних станах."
        ],
        code: "func sceneDidEnterBackground(_ scene: UIScene) {\n    persistence.saveContext()\n}\n\nfunc sceneWillEnterForeground(_ scene: UIScene) {\n    refreshSessionIfNeeded()\n}",
        interviewer: "Follow-up: що станеться з network request, коли app піде в background?"
      }
    },
    {
      match: ["storyboard", "xib", "nib", "ui in code"],
      answer: {
        short: "Storyboard/XIB і UI in code - це різні способи описати UI. Вибір залежить від команди, complexity і review process.",
        details: [
          "Storyboard зручний для простих flow і візуального layout.",
          "XIB підходить для reusable UIKit views.",
          "UI in code краще рев'ювиться, менше конфліктує в git і краще підходить для design systems.",
          "У legacy app часто доводиться підтримувати змішаний підхід."
        ],
        code: "final class ProfileViewController: UIViewController {\n    private let titleLabel = UILabel()\n\n    override func viewDidLoad() {\n        super.viewDidLoad()\n        view.addSubview(titleLabel)\n    }\n}",
        interviewer: "Попроси кандидата пояснити, як він організує UI in code без хаосу в ViewController."
      }
    },
    {
      match: ["патерн", "patterns", "gof", "factory", "strategy", "adapter"],
      answer: {
        short: "Design patterns - це повторювані рішення типових проблем проєктування: створення об'єктів, комунікація, композиція й розширення поведінки.",
        details: [
          "Factory ховає створення об'єктів.",
          "Strategy дозволяє підміняти алгоритм через спільний interface.",
          "Adapter узгоджує несумісні API.",
          "Observer/Delegate/Coordinator часто зустрічаються в iOS."
        ],
        code: "protocol SortingStrategy {\n    func sort(_ values: [Int]) -> [Int]\n}\n\nfinal class Sorter {\n    var strategy: SortingStrategy\n}",
        interviewer: "Попроси кандидата назвати приклади патернів прямо з UIKit або Foundation."
      }
    },
    {
      match: ["solid"],
      answer: {
        short: "SOLID - це п'ять принципів проєктування, які допомагають робити код слабко зв'язаним, тестованим і простішим для зміни.",
        details: [
          "S: клас або модуль має мати одну основну причину для зміни.",
          "O: поведінку краще розширювати новими типами, а не ламати існуючий код.",
          "L: subtype має коректно замінювати base type.",
          "I: краще кілька малих протоколів, ніж один великий.",
          "D: high-level code має залежати від абстракцій, а не конкретних сервісів."
        ],
        code: "protocol ProfileLoading {\n    func loadProfile() async throws -> Profile\n}\n\nfinal class ProfileViewModel {\n    private let loader: ProfileLoading\n\n    init(loader: ProfileLoading) {\n        self.loader = loader\n    }\n}",
        interviewer: "Попроси кандидата показати SOLID не визначеннями, а прикладом з iOS: ViewModel, service protocol, coordinator або module boundary."
      }
    },
    {
      match: ["ооп", "інкапсуляц", "поліморф", "абстракц", "спадкув"],
      answer: {
        short: "ООП організовує код навколо об'єктів, які мають стан і поведінку. Основні принципи: інкапсуляція, спадкування, поліморфізм та абстракція.",
        details: [
          "Інкапсуляція ховає внутрішній стан і відкриває контрольований API.",
          "Спадкування дозволяє перевикористовувати поведінку, але в Swift часто краще composition/protocols.",
          "Поліморфізм дозволяє працювати з різними типами через спільний контракт.",
          "Абстракція прибирає деталі реалізації з клієнтського коду."
        ],
        code: "protocol PaymentProcessing {\n    func pay(amount: Decimal) async throws\n}\n\nfinal class ApplePayProcessor: PaymentProcessing {\n    func pay(amount: Decimal) async throws {\n        // Apple Pay implementation\n    }\n}",
        interviewer: "Добрий follow-up: коли inheritance у Swift гірший за protocol + composition?"
      }
    },
    {
      match: ["протокол", "protocol"],
      answer: {
        short: "Protocol у Swift задає контракт: властивості й методи, які має реалізувати тип. Це спосіб залежати від поведінки, а не від конкретного класу.",
        details: [
          "Протоколи корисні для Dependency Injection, делегування, тестових fake objects і слабкого coupling.",
          "Protocol extension може дати default implementation.",
          "Для delegate часто додають AnyObject, щоб мати weak reference.",
          "Не треба створювати протокол для кожного класу без потреби."
        ],
        code: "protocol UserLoading {\n    func loadUser() async throws -> User\n}\n\nfinal class UserViewModel {\n    private let loader: UserLoading\n\n    init(loader: UserLoading) {\n        self.loader = loader\n    }\n}",
        interviewer: "Попроси кандидата пояснити різницю між protocol як abstraction boundary і protocol, створеним лише для mock-ів."
      }
    },
    {
      match: ["класом і структур", "class", "struct", "структурою"],
      answer: {
        short: "Class є reference type і має identity. Struct є value type: при присвоєнні або передачі створюється незалежне логічне значення.",
        details: [
          "Class керується ARC і може мати inheritance.",
          "Struct простіше тестувати, безпечніше передавати між частинами коду й часто краще підходить для models.",
          "Value type не означає, що Swift завжди фізично копіює дані одразу: колекції використовують copy-on-write.",
          "Class потрібен, коли важлива shared identity або lifecycle object."
        ],
        code: "struct Profile {\n    var name: String\n}\n\nvar a = Profile(name: \"Ira\")\nvar b = a\nb.name = \"Oleh\"\n\nprint(a.name) // Ira",
        interviewer: "Follow-up: коли model краще зробити class, а коли struct?"
      }
    },
    {
      match: ["optional", "опціонал", "force unwrap", "if let", "guard let"],
      answer: {
        short: "Optional означає, що значення може бути відсутнім. Swift змушує явно обробляти nil, що зменшує кількість runtime crash-ів.",
        details: [
          "if let зручний для локальної гілки.",
          "guard let краще для early exit і чистого основного flow.",
          "force unwrap варто використовувати тільки там, де nil неможливий за інваріантом.",
          "?? має сенс лише тоді, коли fallback доменно правильний."
        ],
        code: "func show(user: User?) {\n    guard let user else {\n        showEmptyState()\n        return\n    }\n\n    titleLabel.text = user.name\n}",
        interviewer: "Попроси кандидата переписати код із force unwrap на guard let і пояснити, який fallback коректний."
      }
    },
    {
      match: ["closure", "замик"],
      answer: {
        short: "Closure - це блок коду, який можна передати й виконати пізніше. Closure може захоплювати значення з навколишнього scope.",
        details: [
          "Escaping closure живе довше за виклик функції, тому може створити retain cycle.",
          "Non-escaping closure виконується в межах виклику функції.",
          "У iOS closure часто використовують для callbacks, completion handlers і SwiftUI actions.",
          "Для self у escaping closure треба свідомо обирати strong/weak capture."
        ],
        code: "viewModel.onFinish = { [weak self] result in\n    self?.showResult(result)\n}",
        interviewer: "Follow-up: коли [weak self] не потрібен, а коли без нього буде retain cycle?"
      }
    },
    {
      match: ["race-condition", "data race", "гонк"],
      answer: {
        short: "Race condition виникає, коли результат залежить від непередбачуваного порядку виконання кількох потоків або задач.",
        details: [
          "Data race - це небезпечний одночасний доступ до mutable state, де хоча б один доступ є write.",
          "Запобігання: serial queue, locks, actors, immutable data, MainActor для UI state.",
          "Проблеми часто проявляються нестабільно й погано відтворюються.",
          "Тести мають перевіряти не тільки happy path, а й паралельні виклики."
        ],
        code: "actor Counter {\n    private var value = 0\n\n    func increment() {\n        value += 1\n    }\n}",
        interviewer: "Попроси кандидата знайти race у простому shared counter або token refresh flow."
      }
    },
    {
      match: ["mvc", "mvvm", "mvp", "viper", "clean", "архітектур"],
      answer: {
        short: "Архітектурний патерн задає межі відповідальності між UI, state, business logic, navigation і data layer.",
        details: [
          "MVC простий, але часто перетворює UIViewController на Massive View Controller.",
          "MVVM відділяє state і presentation logic у ViewModel.",
          "VIPER/Clean сильніше розділяють boundaries, але додають boilerplate.",
          "Вибір залежить від складності продукту, команди, тестів і вартості підтримки."
        ],
        code: "struct LoginView: View {\n    @StateObject var viewModel: LoginViewModel\n}\n\n@MainActor\nfinal class LoginViewModel: ObservableObject {\n    private let authService: AuthService\n}",
        interviewer: "Добрий follow-up: яку архітектуру кандидат обере для маленького MVP і для великого banking app?"
      }
    },
    {
      match: ["coordinator"],
      answer: {
        short: "Coordinator pattern виносить navigation logic з ViewController/ViewModel в окремий об'єкт, який керує flow.",
        details: [
          "ViewController показує UI, але не вирішує, який екран відкривати далі.",
          "Coordinator створює screens, інжектить dependencies і слухає user intents.",
          "Це зменшує coupling між екранами й полегшує deep links.",
          "Важливо правильно керувати lifecycle child coordinators."
        ],
        code: "final class ProfileCoordinator {\n    private let navigationController: UINavigationController\n\n    func showSettings() {\n        let vc = SettingsViewController()\n        navigationController.pushViewController(vc, animated: true)\n    }\n}",
        interviewer: "Попроси кандидата пояснити, як уникнути retain cycle між coordinator і view model callbacks."
      }
    },
    {
      match: ["singleton"],
      answer: {
        short: "Singleton гарантує один shared instance типу. В iOS приклади: URLSession.shared, UserDefaults.standard, NotificationCenter.default.",
        details: [
          "Перевага: простий глобальний доступ.",
          "Недолік: приховані залежності, складніше тестування, глобальний mutable state.",
          "Часто Singleton називають антипатерном, коли ним заміняють dependency injection.",
          "Краще інжектити shared service як dependency."
        ],
        code: "final class AnalyticsService {\n    static let shared = AnalyticsService()\n    private init() {}\n}",
        interviewer: "Follow-up: як протестувати код, який напряму викликає AnalyticsService.shared?"
      }
    },
    {
      match: ["delegate"],
      answer: {
        short: "Delegate - це патерн, де один об'єкт передає частину поведінки іншому через protocol.",
        details: [
          "UIKit активно використовує delegate: UITableViewDelegate, UICollectionViewDelegate, URLSessionDelegate.",
          "Delegate зазвичай weak, щоб уникнути retain cycle.",
          "DataSource відповідає за дані, delegate - за поведінку/події.",
          "Delegate корисний для one-to-one communication."
        ],
        code: "protocol LoginViewControllerDelegate: AnyObject {\n    func loginViewControllerDidFinish(_ controller: LoginViewController)\n}\n\nfinal class LoginViewController: UIViewController {\n    weak var delegate: LoginViewControllerDelegate?\n}",
        interviewer: "Попроси кандидата порівняти delegate, closure callback і NotificationCenter."
      }
    },
    {
      match: ["observer", "notificationcenter", "kvo"],
      answer: {
        short: "Observer дозволяє об'єкту реагувати на зміни або події, не маючи прямої сильної залежності від sender.",
        details: [
          "NotificationCenter підходить для broadcast подій.",
          "KVO спостерігає зміни властивостей Objective-C compatible objects.",
          "Combine/SwiftUI дають сучасніші reactive механізми.",
          "Занадто багато глобальних notifications ускладнюють debugging."
        ],
        code: "NotificationCenter.default.addObserver(\n    forName: UIApplication.didBecomeActiveNotification,\n    object: nil,\n    queue: .main\n) { _ in\n    refresh()\n}",
        interviewer: "Follow-up: як уникнути memory leaks або дубльованих observers?"
      }
    },
    {
      match: ["arc", "memory management", "reference cycles", "retain cycle", "weak", "unowned", "mrc", "autoreleasepool"],
      answer: {
        short: "ARC керує lifetime class instances через підрахунок strong references. Object звільняється, коли strong reference count стає нулем.",
        details: [
          "Strong утримує object.",
          "Weak не утримує object і стає nil після деалокації.",
          "Unowned не утримує object, але crash-иться, якщо object уже знищений.",
          "Retain cycle виникає, коли objects утримують один одного."
        ],
        code: "final class Screen {\n    var onTap: (() -> Void)?\n\n    func bind() {\n        onTap = { [weak self] in\n            self?.handleTap()\n        }\n    }\n}",
        interviewer: "Попроси кандидата пояснити retain cycle у closure, Timer, delegate або Combine subscription."
      }
    },
    {
      match: ["copy-on-write", "copy on write"],
      answer: {
        short: "Copy-on-write дозволяє value types мати логічну семантику копії без негайного фізичного копіювання storage.",
        details: [
          "Дві змінні можуть тимчасово ділити storage.",
          "Перед mutation Swift перевіряє, чи storage унікальний.",
          "Array, Dictionary, Set використовують CoW.",
          "Це поєднує передбачуваність value semantics і продуктивність."
        ],
        code: "var a = [1, 2, 3]\nvar b = a\nb.append(4)\n\nprint(a) // [1, 2, 3]",
        interviewer: "Follow-up: чому value type не завжди означає негайну фізичну копію?"
      }
    },
    {
      match: ["async/await", "structured concurrency", "actor"],
      answer: {
        short: "async/await робить асинхронний код схожим на послідовний, а structured concurrency керує lifetime задач.",
        details: [
          "async функція може призупинятися на await.",
          "Task створює асинхронну роботу.",
          "Actor ізолює mutable state від data races.",
          "UI state варто оновлювати на MainActor."
        ],
        code: "@MainActor\nfinal class ProfileViewModel: ObservableObject {\n    func load() async {\n        profile = try? await service.loadProfile()\n    }\n}",
        interviewer: "Попроси кандидата пояснити, що може змінитися після await і чому actor має reentrancy."
      }
    },
    {
      match: ["gcd", "dispatchqueue", "nsoperation", "operationqueue", "thread", "pthread", "semaphore", "mutex", "qos", "deadlock"],
      answer: {
        short: "Інструменти багатопоточності потрібні для виконання роботи поза main thread і синхронізації доступу до shared state.",
        details: [
          "GCD дає dispatch queues і простий API для async/sync work.",
          "OperationQueue додає dependencies, cancellation і priority.",
          "Locks/semaphores синхронізують доступ, але можуть створити deadlock.",
          "QoS допомагає системі зрозуміти пріоритет роботи."
        ],
        code: "DispatchQueue.global(qos: .userInitiated).async {\n    let image = decodeImage(data)\n\n    DispatchQueue.main.async {\n        imageView.image = image\n    }\n}",
        interviewer: "Follow-up: чому sync на main queue з main thread призведе до deadlock?"
      }
    },
    {
      match: ["urlsession", "http", "rest", "restful", "json", "xml", "api", "мереж", "socket", "websocket", "alamofire", "afnetworking"],
      answer: {
        short: "Networking layer має будувати request, виконувати його, перевіряти response, декодувати дані й мапити помилки в domain layer.",
        details: [
          "HTTP request має method, URL, headers і body.",
          "2xx зазвичай success; 4xx - client/auth/domain issue; 5xx - server issue.",
          "REST організовує API навколо resources і HTTP methods.",
          "URLSession - стандартний transport API в iOS; Alamofire додає зручні abstraction-и."
        ],
        code: "let (data, response) = try await URLSession.shared.data(for: request)\n\nguard let http = response as? HTTPURLResponse,\n      200..<300 ~= http.statusCode else {\n    throw APIError.badStatus\n}\n\nlet dto = try JSONDecoder().decode(UserDTO.self, from: data)",
        interviewer: "Попроси кандидата обробити 401, timeout, invalid JSON і cancellation."
      }
    },
    {
      match: ["refresh token", "401", "auth"],
      answer: {
        short: "Refresh token flow оновлює access token після expiration, щоб користувач не логінився заново.",
        details: [
          "При 401 client має оновити token і повторити original request.",
          "Потрібно уникати refresh token race, коли багато запитів одночасно запускають refresh.",
          "Refresh token треба зберігати безпечно, зазвичай у Keychain.",
          "При refresh failure користувача переводять у logout/session expired state."
        ],
        code: "actor TokenRefresher {\n    private var task: Task<TokenPair, Error>?\n\n    func refresh() async throws -> TokenPair {\n        if let task { return try await task.value }\n        let newTask = Task { try await api.refreshToken() }\n        task = newTask\n        defer { task = nil }\n        return try await newTask.value\n    }\n}",
        interviewer: "Follow-up: як зробити так, щоб 10 паралельних 401 запустили лише один refresh?"
      }
    },
    {
      match: ["core data", "realm", "userdefaults", "plist", "persistent", "keychain", "зберег", "субд", "sqlite", "filemanager"],
      answer: {
        short: "Storage в iOS обирають за типом даних: налаштування, секрети, файли, structured data або offline database.",
        details: [
          "UserDefaults підходить для малих налаштувань, не для секретів.",
          "Keychain - для tokens і credentials.",
          "FileManager - для файлів і кешів.",
          "Core Data/Realm - для складних моделей, relationships і offline persistence."
        ],
        code: "UserDefaults.standard.set(true, forKey: \"hasSeenOnboarding\")\nlet hasSeen = UserDefaults.standard.bool(forKey: \"hasSeenOnboarding\")",
        interviewer: "Попроси кандидата пояснити, де зберігати access token, profile cache і downloaded video."
      }
    },
    {
      match: ["codable", "decodable", "encodable", "serialization"],
      answer: {
        short: "Codable об'єднує Encodable і Decodable та дозволяє перетворювати Swift types у JSON/plist і назад.",
        details: [
          "DTO має відповідати формату API.",
          "Domain model може відрізнятися від DTO.",
          "CodingKeys потрібні, коли назви JSON-полів не збігаються зі Swift naming.",
          "Decoding errors треба мапити в зрозумілі domain errors."
        ],
        code: "struct UserDTO: Decodable {\n    let id: Int\n    let fullName: String\n\n    enum CodingKeys: String, CodingKey {\n        case id\n        case fullName = \"full_name\"\n    }\n}",
        interviewer: "Follow-up: чому DTO і domain model часто краще розділяти?"
      }
    },
    {
      match: ["swiftui", "@state", "@binding", "observableobject", "observedobject", "view"],
      answer: {
        short: "SwiftUI описує UI як функцію від state. Коли state змінюється, SwiftUI перераховує body і оновлює екран.",
        details: [
          "@State належить самій View.",
          "@Binding передає доступ до state з parent.",
          "@StateObject створює й утримує ObservableObject.",
          "@ObservedObject спостерігає object, який передали ззовні."
        ],
        code: "struct ProfileView: View {\n    @ObservedObject var viewModel: ProfileViewModel\n\n    var body: some View {\n        Text(viewModel.title)\n    }\n}",
        interviewer: "Попроси кандидата пояснити, чому View body не має виконувати network request напряму."
      }
    },
    {
      match: ["uikit", "viewcontroller", "lifecycle", "auto layout", "constraints", "frame", "bounds", "responder", "touch", "gesture"],
      answer: {
        short: "UIKit будує UI через view hierarchy, UIViewController lifecycle, Auto Layout і event handling через responder chain.",
        details: [
          "viewDidLoad - одноразовий setup.",
          "viewWillAppear - оновлення перед показом.",
          "Auto Layout описує constraints між views.",
          "frame - позиція в coordinate system superview; bounds - власна coordinate system view."
        ],
        code: "override func viewDidLoad() {\n    super.viewDidLoad()\n    configureUI()\n}\n\noverride func viewWillAppear(_ animated: Bool) {\n    super.viewWillAppear(animated)\n    refreshState()\n}",
        interviewer: "Follow-up: де правильно читати final size view і чому не у viewDidLoad?"
      }
    },
    {
      match: ["tableview", "collectionview", "diffable", "compositional"],
      answer: {
        short: "UITableView/UICollectionView ефективно показують списки через cell reuse. CollectionView має гнучкіший layout.",
        details: [
          "Cell має конфігуруватися з model і скидати стан у prepareForReuse.",
          "Diffable Data Source застосовує snapshot і зменшує crash-и від ручних updates.",
          "Compositional Layout дозволяє будувати складні секції: grids, carousel, nested layouts.",
          "State не має жити тільки всередині cell."
        ],
        code: "var snapshot = NSDiffableDataSourceSnapshot<Section, Item>()\nsnapshot.appendSections([.main])\nsnapshot.appendItems(items)\ndataSource.apply(snapshot, animatingDifferences: true)",
        interviewer: "Попроси кандидата пояснити, чому нестабільний Hashable id ламає diffable updates."
      }
    },
    {
      match: ["accessibility", "voiceover", "dynamic type"],
      answer: {
        short: "Accessibility робить app доступним для VoiceOver, Dynamic Type, Switch Control та інших сценаріїв.",
        details: [
          "Потрібні коректні accessibilityLabel, traits і reading order.",
          "Dynamic Type не має ламати layout.",
          "Контраст і touch target size важливі для usability.",
          "Accessibility identifiers також допомагають UI tests."
        ],
        code: "Button(action: send) {\n    Image(systemName: \"paperplane.fill\")\n}\n.accessibilityLabel(\"Надіслати повідомлення\")",
        interviewer: "Follow-up: як протестувати екран із VoiceOver і великим Dynamic Type?"
      }
    },
    {
      match: ["unit", "ui-тест", "testing", "tdd", "xctest", "тест"],
      answer: {
        short: "Тести перевіряють поведінку коду й захищають від regressions. Unit tests швидкі, integration tests перевіряють boundaries, UI tests покривають критичні flows.",
        details: [
          "Unit test має бути ізольований від мережі й нестабільного часу.",
          "Для networking використовують fake HTTPClient або custom URLProtocol.",
          "UI tests краще запускати на ключові user journeys, а не на кожну дрібницю.",
          "TDD означає писати тест до реалізації, але важливіше мати тестовану архітектуру."
        ],
        code: "func testLoadProfileSuccess() async throws {\n    let loader = FakeProfileLoader(result: .success(.mock))\n    let viewModel = ProfileViewModel(loader: loader)\n\n    await viewModel.load()\n\n    XCTAssertEqual(viewModel.state, .loaded(.mock))\n}",
        interviewer: "Попроси кандидата протестувати error state без реального backend."
      }
    },
    {
      match: ["git", "pull request", "merge", "rebase", "branch"],
      answer: {
        short: "Git - distributed version control system для історії змін, collaboration і release management.",
        details: [
          "commit фіксує зміни локально.",
          "push відправляє commits у remote.",
          "pull забирає зміни й інтегрує їх.",
          "fetch тільки завантажує remote state без merge.",
          ".gitignore виключає generated/local files."
        ],
        code: "git fetch origin\ngit rebase origin/main\ngit push --force-with-lease",
        interviewer: "Follow-up: коли rebase небезпечний і чому force-with-lease кращий за force push?"
      }
    },
    {
      match: ["cocoapods", "podfile", "podspec", "swift package manager", "spm", "dependency manager"],
      answer: {
        short: "Dependency manager підключає зовнішні або внутрішні бібліотеки, керує версіями й інтегрує їх у build.",
        details: [
          "SPM - стандартний Apple tool для packages, targets і products.",
          "CocoaPods використовує Podfile і workspace.",
          "Podspec описує library для поширення через CocoaPods.",
          "Важливо контролювати versions, transitive dependencies і licenses."
        ],
        code: ".package(url: \"https://github.com/apple/swift-collections.git\", from: \"1.1.0\")",
        interviewer: "Попроси кандидата порівняти SPM і CocoaPods у великому modular app."
      }
    },
    {
      match: ["ci", "continuous integration", "jenkins", "fastlane", "testflight", "app store connect", "provisioning", "certificate", "bundle identifier"],
      answer: {
        short: "CI/CD автоматизує перевірку, збірку, підпис і доставку iOS app.",
        details: [
          "CI запускає tests, lint, build і checks на кожен PR або branch.",
          "fastlane автоматизує signing, screenshots, build upload і release steps.",
          "TestFlight використовується для beta distribution.",
          "Provisioning profile і certificate потрібні для code signing."
        ],
        code: "lane :beta do\n  run_tests\n  build_app(scheme: \"App\")\n  upload_to_testflight\nend",
        interviewer: "Follow-up: що робити, якщо CI build падає через signing?"
      }
    },
    {
      match: ["combine", "rx", "publisher", "reactive", "frp", "future", "promise"],
      answer: {
        short: "Reactive programming моделює асинхронні події як streams. Combine/Rx дозволяють трансформувати, комбінувати й підписуватись на потоки значень.",
        details: [
          "Publisher видає values або completion.",
          "Subscriber отримує values.",
          "Operators map/filter/debounce/combineLatest змінюють stream.",
          "Потрібно керувати lifetime subscriptions, інакше будуть leaks або неочікувані events."
        ],
        code: "searchTextPublisher\n    .debounce(for: .milliseconds(300), scheduler: RunLoop.main)\n    .removeDuplicates()\n    .sink { query in\n        search(query)\n    }",
        interviewer: "Попроси кандидата пояснити backpressure, cancellation або retain cycle у sink."
      }
    },
    {
      match: ["algorithms", "алгоритм", "сорту", "пошук", "рекурс"],
      answer: {
        short: "Алгоритми важливі для оцінки складності, вибору структури даних і розуміння trade-offs продуктивності.",
        details: [
          "Binary search працює за O(log n), але потребує відсортованих даних.",
          "Quick sort у середньому O(n log n), але може деградувати до O(n²).",
          "Merge sort стабільний і O(n log n), але потребує додаткової пам'яті.",
          "Рекурсія має base case і recursive case; без base case буде stack overflow."
        ],
        code: "func binarySearch(_ values: [Int], target: Int) -> Int? {\n    var low = 0\n    var high = values.count - 1\n\n    while low <= high {\n        let mid = (low + high) / 2\n        if values[mid] == target { return mid }\n        if values[mid] < target { low = mid + 1 } else { high = mid - 1 }\n    }\n    return nil\n}",
        interviewer: "Follow-up: яка складність алгоритму і що зміниться на великих даних?"
      }
    }
  ];

  const sectionAnswers = {
    Core: "Очікувана відповідь має пояснити визначення, практичний iOS-приклад, trade-offs і типові помилки.",
    UI: "Очікувана відповідь має покрити state, lifecycle, layout, accessibility, performance і поведінку на edge cases.",
    Networking: "Очікувана відповідь має покрити request/response, error mapping, retries, auth, cancellation і тестування без реальної мережі.",
    Storage: "Очікувана відповідь має пояснити, які дані де зберігати, як працює persistence, privacy і invalidation.",
    Testing: "Очікувана відповідь має пояснити test pyramid, isolation, fake dependencies і які сценарії варто автоматизувати.",
    Tooling: "Очікувана відповідь має пояснити, як інструмент використовується в командному workflow, CI/CD, dependency або release process."
  };

  window.getInterviewAnswer = function getInterviewAnswer(item) {
    if (item.answer) {
      return normalizeAnswer(item.answer);
    }

    const text = normalize(`${item.question || ""} ${item.section || ""} ${item.group || ""}`);
    const rule = rules.find((candidate) =>
      candidate.match.some((pattern) => text.includes(normalize(pattern)))
    );

    if (rule) {
      return rule.answer;
    }

    const fallback = sectionAnswers[item.group] || sectionAnswers.Core;
    return {
      short: fallback,
      details: [
        "Почни з короткого визначення.",
        "Дай приклад з реального iOS-проєкту.",
        "Поясни ризики, edge cases і як це тестувати.",
        "Заверши trade-off: коли підхід корисний, а коли створює зайву складність."
      ],
      code: "",
      interviewer: "Попроси кандидата навести приклад із власного досвіду й уточни, як він перевіряв це рішення в production або тестах."
    };
  };

  function normalize(value) {
    return String(value).toLowerCase().replaceAll("і", "i").replaceAll("ї", "i");
  }

  function normalizeAnswer(value) {
    if (typeof value === "string") {
      return {
        short: value,
        details: [],
        code: "",
        interviewer: "Попроси кандидата розкрити відповідь прикладом із коду."
      };
    }
    return value;
  }
})();
