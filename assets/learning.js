(function () {
  const path = window.location.pathname.replace(/\\/g, "/");
  const parts = path.split("/").slice(-3);
  const key = parts.join("/");

  const lessons = {
    "june/core/error-handling.html": {
      why: "Error handling потрібен, щоб явно описувати невдалі сценарії: мережа впала, JSON не декодується, користувач не має доступу або локальна база не зберегла дані.",
      how: "У Swift помилки часто моделюють через enum, кидають через throws і ловлять у do/catch. UI не повинен знати сирі transport errors, тому їх маплять у domain-level помилки.",
      code: `enum LoginError: Error {
    case invalidCredentials
    case offline
    case unknown
}

func login(email: String, password: String) async throws -> User {
    do {
        return try await authService.login(email: email, password: password)
    } catch URLError.notConnectedToInternet {
        throw LoginError.offline
    } catch {
        throw LoginError.unknown
    }
}`,
      note: "На співбесіді добре сказати, що throws описує failure path, але не всі помилки треба показувати користувачу буквально."
    },
    "june/core/memory-basics.html": {
      why: "ARC автоматично звільняє class instances, але retain cycle може залишити екран, view model або closure у пам'яті назавжди.",
      how: "Strong reference утримує object. Weak reference не утримує і стає nil після деалокації. Unowned не утримує, але crash-иться, якщо object уже знищений.",
      code: `final class ProfileViewController: UIViewController {
    private var onSave: (() -> Void)?

    override func viewDidLoad() {
        super.viewDidLoad()

        onSave = { [weak self] in
            self?.saveProfile()
        }
    }
}`,
      note: "Weak self потрібен не всюди, а там, де closure може жити довше за owner або утворити цикл."
    },
    "june/core/optionals.html": {
      why: "Optional змушує явно обробити відсутність значення замість неочікуваного null crash у runtime.",
      how: "Для early exit найчастіше використовують guard let. Для коротких трансформацій зручно map/flatMap або nil coalescing, але fallback має бути доменно правильним.",
      code: `func showUserName(_ user: User?) {
    guard let user else {
        showPlaceholder()
        return
    }

    nameLabel.text = user.name
}`,
      note: "Force unwrap варто залишати тільки там, де інваріант справді гарантований і crash буде сигналом програмістської помилки."
    },
    "june/core/protocols.html": {
      why: "Protocols дозволяють залежати від поведінки, а не від конкретного типу. Це основа DI, тестових fake objects і слабкого coupling.",
      how: "ViewModel може залежати від protocol, а production і test code передають різні реалізації. Protocol extension додає default behavior, але не має ховати складну логіку.",
      code: `protocol ProfileLoading {
    func loadProfile() async throws -> Profile
}

final class ProfileViewModel {
    private let loader: ProfileLoading

    init(loader: ProfileLoading) {
        self.loader = loader
    }
}`,
      note: "Не створюй protocol для кожного класу автоматично. Він потрібен, коли є реальна варіативність або потреба тестувати boundary."
    },
    "june/core/value-vs-reference.html": {
      why: "Value semantics робить код передбачуванішим: зміна копії не змінює оригінал. Reference semantics потрібна, коли важлива спільна identity.",
      how: "Struct копіюється логічно, class передається як reference. Стандартні колекції Swift виглядають як value types, але оптимізовані через copy-on-write.",
      code: `struct Profile {
    var name: String
}

var first = Profile(name: "Ira")
var second = first
second.name = "Oleh"

print(first.name)  // Ira`,
      note: "Senior-відповідь має згадати ARC для classes і безпечність value types у concurrent code."
    },

    "june/networking/codable.html": {
      why: "Codable потрібен, щоб безпечно перетворювати JSON у typed Swift models і назад без ручного парсингу словників.",
      how: "DTO описує формат API, а domain model описує потреби застосунку. У production їх часто розділяють, щоб API-зміни не протікали в UI.",
      code: `struct UserDTO: Decodable {
    let id: Int
    let fullName: String
}

struct User {
    let id: String
    let name: String
}

extension User {
    init(dto: UserDTO) {
        id = String(dto.id)
        name = dto.fullName
    }
}`,
      note: "Не всі API-поля мають ставати domain model. DTO може бути нестабільним, domain має бути зручним для app logic."
    },
    "june/networking/http-basics.html": {
      why: "HTTP basics потрібні, щоб правильно будувати request, читати response і розуміти, де проблема: client, server, auth чи network.",
      how: "Request має method, URL, headers і body. Response має status code, headers і body. Для iOS важливо не змішувати transport success із business success.",
      code: `var request = URLRequest(url: URL(string: "https://api.example.com/profile")!)
request.httpMethod = "GET"
request.setValue("application/json", forHTTPHeaderField: "Accept")`,
      note: "URLSession може успішно повернути response зі статусом 404 або 500. Це не transport error, але це failure для domain logic."
    },
    "june/networking/simple-api-client.html": {
      why: "API client прибирає дублювання request-building, decoding і error mapping з view models та controllers.",
      how: "Зазвичай client приймає Endpoint або URLRequest, виконує request, перевіряє status code, декодує DTO і повертає typed результат.",
      code: `final class APIClient {
    func get<T: Decodable>(_ url: URL) async throws -> T {
        let (data, response) = try await URLSession.shared.data(from: url)
        guard let http = response as? HTTPURLResponse,
              200..<300 ~= http.statusCode else {
            throw APIError.badStatus
        }
        return try JSONDecoder().decode(T.self, from: data)
    }
}`,
      note: "У реальному проєкті URLSession.shared краще інжектити через protocol, щоб client було можливо тестувати."
    },
    "june/networking/status-codes.html": {
      why: "Status codes допомагають зрозуміти, що сталося з request: проблема клієнта, сервера, авторизації чи redirect/cache behavior.",
      how: "2xx зазвичай success, 4xx client-side або auth/domain issue, 5xx server issue. Але UI має отримувати domain message, а не просто число.",
      code: `func validate(_ response: HTTPURLResponse) throws {
    switch response.statusCode {
    case 200..<300:
        return
    case 401:
        throw APIError.unauthorized
    case 500..<600:
        throw APIError.server
    default:
        throw APIError.unexpectedStatus(response.statusCode)
    }
}`,
      note: "401 часто запускає refresh token flow, а 403 означає, що користувач автентифікований, але не має доступу."
    },
    "june/networking/urlsession.html": {
      why: "URLSession - базовий transport layer в iOS. Через нього виконують foreground requests, uploads, downloads і background transfers.",
      how: "Async API повертає data і URLResponse. Після цього треба перевірити HTTPURLResponse, status code, decoding і cancellation.",
      code: `func loadProfile() async throws -> ProfileDTO {
    let url = URL(string: "https://api.example.com/profile")!
    let (data, response) = try await URLSession.shared.data(from: url)

    guard let http = response as? HTTPURLResponse,
          200..<300 ~= http.statusCode else {
        throw APIError.badStatus
    }

    return try JSONDecoder().decode(ProfileDTO.self, from: data)
}`,
      note: "Для production краще не викликати URLSession напряму з ViewModel, а сховати його за HTTPClient."
    },

    "june/ui/autolayout-basics.html": {
      why: "Auto Layout потрібен, щоб UI адаптувався до різних екранів, мов, Dynamic Type і safe areas без ручного розрахунку frame.",
      how: "Constraints описують зв'язки між anchors. Система вирішує рівняння layout. Якщо constraints недостатньо - layout ambiguous, якщо конфліктують - частина constraints ламається.",
      code: `titleLabel.translatesAutoresizingMaskIntoConstraints = false

NSLayoutConstraint.activate([
    titleLabel.topAnchor.constraint(equalTo: view.safeAreaLayoutGuide.topAnchor, constant: 16),
    titleLabel.leadingAnchor.constraint(equalTo: view.leadingAnchor, constant: 20),
    titleLabel.trailingAnchor.constraint(equalTo: view.trailingAnchor, constant: -20)
])`,
      note: "Не забувай про content hugging і compression resistance для labels та buttons із динамічним текстом."
    },
    "june/ui/storyboard-vs-code.html": {
      why: "Вибір між Storyboard, XIB і UI in code впливає на reviewability, merge conflicts, onboarding і швидкість розробки.",
      how: "Storyboard зручний для простих flow і візуального layout. UI in code краще масштабується в командах, легше рев'ювиться і частіше підходить для design systems.",
      code: `final class ProfileViewController: UIViewController {
    private let titleLabel = UILabel()

    override func viewDidLoad() {
        super.viewDidLoad()
        view.addSubview(titleLabel)
        titleLabel.text = "Profile"
    }
}`,
      note: "На співбесіді не треба казати, що один підхід завжди кращий. Пояснюй через team size, legacy і complexity."
    },
    "june/ui/swiftui-basics.html": {
      why: "SwiftUI View описує UI як функцію від state. Коли state змінюється, SwiftUI перераховує body і оновлює екран.",
      how: "@State належить самій View, @Binding передає доступ до state з parent view, а body має залишатися декларативним описом UI.",
      code: `struct CounterView: View {
    @State private var count = 0

    var body: some View {
        Button("Count: \\(count)") {
            count += 1
        }
    }
}`,
      note: "Не клади networking або важкі side effects прямо в body. Body може викликатися багато разів."
    },
    "june/ui/table-collection.html": {
      why: "UITableView і UICollectionView потрібні для ефективного показу великих списків через cell reuse.",
      how: "Table view простіший для вертикальних списків. Collection view гнучкіший: grids, horizontal sections, compositional layouts і складні екрани.",
      code: `final class UserCell: UICollectionViewCell {
    func configure(with user: User) {
        nameLabel.text = user.name
        avatarView.image = nil
    }

    override func prepareForReuse() {
        super.prepareForReuse()
        avatarView.image = nil
    }
}`,
      note: "Cell не має бути owner бізнес-стану. Вона тільки відображає модель, яку отримала."
    },
    "june/ui/uikit-lifecycle.html": {
      why: "Lifecycle UIViewController показує, коли view створена, коли з'являється на екрані, коли layout порахований і коли треба чистити ресурси.",
      how: "viewDidLoad - одноразовий setup. viewWillAppear - оновлення перед показом. viewDidLayoutSubviews - робота, якій потрібні final sizes.",
      code: `override func viewDidLoad() {
    super.viewDidLoad()
    configureUI()
}

override func viewWillAppear(_ animated: Bool) {
    super.viewWillAppear(animated)
    refreshVisibleState()
}`,
      note: "Не запускай один і той самий network request у viewWillAppear без контролю, інакше push/pop може створити дублікати."
    },

    "middle/core/concurrency-basics.html": {
      why: "async/await робить асинхронний код читабельним, а structured concurrency допомагає керувати lifetime задач.",
      how: "Task створює асинхронну роботу. await позначає suspension point. Через async let або task groups можна виконувати незалежну роботу паралельно.",
      code: `async let profile = profileService.loadProfile()
async let posts = postsService.loadPosts()

let screen = try await ProfileScreenData(
    profile: profile,
    posts: posts
)`,
      note: "Після await стан міг змінитися. Для UI state часто потрібен @MainActor."
    },
    "middle/core/copy-on-write.html": {
      why: "Copy-on-write дозволяє value types бути зручними й при цьому не копіювати великі дані без потреби.",
      how: "Копія спільно використовує storage, доки хтось не починає mutation. Перед mutation Swift перевіряє унікальність storage.",
      code: `var first = [1, 2, 3]
var second = first

second.append(4)

print(first)   // [1, 2, 3]
print(second)  // [1, 2, 3, 4]`,
      note: "Не кажи, що value type завжди фізично копіюється при кожному присвоєнні. Це логічна, а не обов'язково негайна фізична копія."
    },
    "middle/core/dependency-injection.html": {
      why: "Dependency Injection робить залежності явними, зменшує coupling і дозволяє тестувати код без реальних API, бази або analytics.",
      how: "Об'єкт отримує залежності через init, property або method. Для ViewModel найчастіше використовують initializer injection.",
      code: `final class FeedViewModel {
    private let repository: FeedRepository

    init(repository: FeedRepository) {
        self.repository = repository
    }
}`,
      note: "DI container може допомогти з композицією, але не має ховати залежності настільки, що код стає магічним."
    },
    "middle/core/gcd-operationqueue.html": {
      why: "GCD і OperationQueue потрібні для керування роботою поза main thread, але мають різні рівні абстракції.",
      how: "GCD легкий і низькорівневий. OperationQueue дає cancellation, dependencies, priority і KVO-friendly модель operations.",
      code: `let queue = OperationQueue()
let download = BlockOperation { downloadImage() }
let resize = BlockOperation { resizeImage() }

resize.addDependency(download)
queue.addOperations([download, resize], waitUntilFinished: false)`,
      note: "У новому Swift-коді часто краще починати з structured concurrency, але legacy UIKit code все ще часто має GCD/OperationQueue."
    },
    "middle/core/generics.html": {
      why: "Generics дозволяють писати reusable type-safe код без дублювання для кожного типу.",
      how: "Generic parameter описує placeholder типу. Associated types використовують у protocols, коли конкретний тип визначає conforming type.",
      code: `struct Response<Value: Decodable>: Decodable {
    let data: Value
}

func decode<T: Decodable>(_ type: T.Type, from data: Data) throws -> T {
    try JSONDecoder().decode(T.self, from: data)
}`,
      note: "Generics варто застосовувати там, де вони прибирають реальне дублювання, а не просто роблять API розумнішим на вигляд."
    },

    "middle/networking/auth-refresh-token.html": {
      why: "Refresh token flow потрібен, щоб користувач не логінився заново після кожного expired access token.",
      how: "При 401 client має один раз оновити token, повторити original request і не запустити кілька refresh-запитів паралельно.",
      code: `actor TokenRefresher {
    private var refreshTask: Task<TokenPair, Error>?

    func validToken() async throws -> TokenPair {
        if let refreshTask { return try await refreshTask.value }

        let task = Task { try await authAPI.refreshToken() }
        refreshTask = task
        defer { refreshTask = nil }
        return try await task.value
    }
}`,
      note: "Найтиповіша production-помилка - refresh token race, коли десять запитів одночасно отримали 401 і всі пішли refresh-ити token."
    },
    "middle/networking/caching.html": {
      why: "HTTP caching зменшує latency, економить трафік і дозволяє показувати дані швидше.",
      how: "Cache-Control, ETag і Last-Modified дозволяють server/client домовитись, чи можна використати cached response або треба revalidate.",
      code: `var request = URLRequest(url: url)
request.cachePolicy = .returnCacheDataElseLoad

let configuration = URLSessionConfiguration.default
configuration.urlCache = URLCache(
    memoryCapacity: 20_000_000,
    diskCapacity: 100_000_000
)`,
      note: "Cache для персональних даних має враховувати privacy, logout і invalidation."
    },
    "middle/networking/reachability.html": {
      why: "Reachability допомагає змінити UX, коли мережа недоступна, але не гарантує, що конкретний request пройде.",
      how: "NWPathMonitor повідомляє про зміну network path. UI може показати offline banner, але request все одно має мати власну error handling logic.",
      code: `let monitor = NWPathMonitor()
monitor.pathUpdateHandler = { path in
    let isOnline = path.status == .satisfied
    Task { @MainActor in
        networkState.isOnline = isOnline
    }
}
monitor.start(queue: DispatchQueue(label: "NetworkMonitor"))`,
      note: "Не блокуйте ручний retry тільки через reachability. Captive portal або flaky network можуть давати несподівані стани."
    },
    "middle/networking/retry-backoff.html": {
      why: "Retry допомагає пережити тимчасові збої, а backoff не дозволяє клієнту добивати backend повторними запитами.",
      how: "Зазвичай використовують exponential backoff, jitter, max attempts і allowlist помилок, які можна retry-ити.",
      code: `func retry<T>(
    attempts: Int,
    operation: @escaping () async throws -> T
) async throws -> T {
    var delay: UInt64 = 300_000_000

    for attempt in 1...attempts {
        do { return try await operation() }
        catch where attempt < attempts {
            try await Task.sleep(nanoseconds: delay)
            delay *= 2
        }
    }

    return try await operation()
}`,
      note: "POST payment не можна просто retry-ити без idempotency key. GET feed зазвичай безпечніший."
    },
    "middle/networking/testing-network.html": {
      why: "Networking tests потрібні, щоб перевірити request building, decoding і error mapping без реального backend.",
      how: "Замість URLSession напряму використовують protocol або custom URLProtocol. Тести підставляють fixture data і status codes.",
      code: `final class FakeHTTPClient: HTTPClient {
    var result: Result<(Data, HTTPURLResponse), Error>!

    func send(_ request: URLRequest) async throws -> (Data, HTTPURLResponse) {
        try result.get()
    }
}`,
      note: "Тестуй не тільки 200 OK, а й 401, 500, empty body і invalid JSON."
    },

    "middle/ui/accessibility.html": {
      why: "Accessibility робить застосунок доступним для VoiceOver, Dynamic Type, Switch Control і користувачів з різними потребами.",
      how: "Потрібні правильні labels, traits, reading order, достатній contrast і layout, який не ламається при великих шрифтах.",
      code: `Button(action: submit) {
    Image(systemName: "paperplane.fill")
}
.accessibilityLabel("Надіслати повідомлення")
.accessibilityHint("Відправляє поточний текст у чат")`,
      note: "Accessibility - не polish в кінці, а частина definition of done для UI."
    },
    "middle/ui/composition-layout.html": {
      why: "Compositional Layout потрібен для складних collection view екранів: grid, carousel, секції з різною геометрією.",
      how: "Layout складається з item, group і section. Кожна секція може мати власний layout і scrolling behavior.",
      code: `let item = NSCollectionLayoutItem(
    layoutSize: .init(widthDimension: .fractionalWidth(1.0),
                      heightDimension: .fractionalHeight(1.0))
)
let group = NSCollectionLayoutGroup.horizontal(
    layoutSize: .init(widthDimension: .fractionalWidth(1.0),
                      heightDimension: .absolute(120)),
    subitems: [item]
)
let section = NSCollectionLayoutSection(group: group)`,
      note: "Це краще за самописний layout, коли екран має кілька секцій із різними правилами."
    },
    "middle/ui/diffable-data-source.html": {
      why: "Diffable Data Source прибирає ручний менеджмент index paths і зменшує crash-и через inconsistent updates.",
      how: "Ти описуєш snapshot поточного стану, а data source рахує diff і застосовує анімації.",
      code: `var snapshot = NSDiffableDataSourceSnapshot<Section, Item>()
snapshot.appendSections([.main])
snapshot.appendItems(items, toSection: .main)

dataSource.apply(snapshot, animatingDifferences: true)`,
      note: "Item identity має бути стабільною. Якщо hash змінюється неконтрольовано, diff буде поводитись дивно."
    },
    "middle/ui/navigation-coordinators.html": {
      why: "Coordinator pattern потрібен, щоб прибрати navigation logic з UIViewController або SwiftUI View. Екран показує UI, а coordinator вирішує, куди перейти далі.",
      how: "Coordinator володіє navigation controller або router, створює screens, інжектить dependencies і обробляє callbacks від view models.",
      code: `final class ProfileCoordinator {
    private let navigationController: UINavigationController
    private let factory: ProfileFactory

    init(navigationController: UINavigationController, factory: ProfileFactory) {
        self.navigationController = navigationController
        self.factory = factory
    }

    func start(userID: String) {
        let viewModel = ProfileViewModel(userID: userID)
        viewModel.onSettingsTap = { [weak self] in
            self?.showSettings()
        }
        navigationController.pushViewController(
            factory.makeProfile(viewModel: viewModel),
            animated: true
        )
    }

    private func showSettings() {
        navigationController.pushViewController(factory.makeSettings(), animated: true)
    }
}`,
      note: "ViewModel не має знати про UINavigationController. Вона може повідомити про intent, а coordinator виконає navigation."
    },
    "middle/ui/swiftui-data-flow.html": {
      why: "SwiftUI data flow потрібен, щоб зрозуміти ownership state: хто створює object, хто його спостерігає і що викликає оновлення View.",
      how: "ObservableObject публікує зміни через @Published. @StateObject створює й утримує object, @ObservedObject спостерігає object, переданий ззовні.",
      code: `@MainActor
final class ProfileViewModel: ObservableObject {
    @Published private(set) var isLoading = false
}

struct ProfileView: View {
    @ObservedObject var viewModel: ProfileViewModel

    var body: some View {
        Text(viewModel.isLoading ? "Loading" : "Ready")
    }
}`,
      note: "Якщо View сама створює ViewModel, використовуй @StateObject. Якщо отримує з parent/container - @ObservedObject."
    },

    "seniour/core/actors-sendable.html": {
      why: "Actors і Sendable потрібні для безпечного mutable state у concurrent code.",
      how: "Actor ізолює свій state. Доступ до actor state ззовні потребує await. Sendable описує типи, які безпечно передавати між concurrency domains.",
      code: `actor ImageCache {
    private var storage: [URL: UIImage] = [:]

    func image(for url: URL) -> UIImage? {
        storage[url]
    }

    func store(_ image: UIImage, for url: URL) {
        storage[url] = image
    }
}`,
      note: "Actor не означає, що всі race conditions зникли. Після await можлива reentrancy, і state треба перечитувати уважно."
    },
    "seniour/core/architecture-tradeoffs.html": {
      why: "Архітектурні патерни потрібні, щоб керувати complexity, testability і ownership, але жоден не є silver bullet.",
      how: "Порівнюй MVC, MVVM, VIPER, Clean і TCA за dependency direction, boilerplate, state management, learning curve і migration cost.",
      code: `// MVVM boundary
struct LoginView: View {
    @StateObject var viewModel: LoginViewModel
}

@MainActor
final class LoginViewModel: ObservableObject {
    private let authService: AuthService
}`,
      note: "Senior-відповідь має пояснити, який патерн підходить для конкретної команди й продукту, а не назвати улюблений."
    },
    "seniour/core/memory-graph-leaks.html": {
      why: "Memory Graph потрібен, щоб знайти, хто утримує object після того, як він мав звільнитись.",
      how: "Відтвори flow, закрий екран, відкрий Memory Graph і подивись retaining path до controller/view model.",
      code: `deinit {
    print("ProfileViewController deinit")
}`,
      note: "deinit print - не заміна Instruments, але швидкий сигнал, що екран взагалі звільняється."
    },
    "seniour/core/performance-instruments.html": {
      why: "Instruments потрібен, щоб оптимізувати не навмання, а за вимірами: CPU, allocations, leaks, hangs, animation hitches.",
      how: "Спочатку визнач user-visible metric, потім зніми baseline, знайди hotspot, внеси зміну і повтори вимір.",
      code: `import os.signpost

let log = OSLog(subsystem: "App", category: "Feed")
os_signpost(.begin, log: log, name: "RenderFeed")
renderFeed()
os_signpost(.end, log: log, name: "RenderFeed")`,
      note: "Профілюй release-like build на реальному девайсі. Debug build часто дає неправильні висновки."
    },

    "seniour/networking/background-transfers.html": {
      why: "Background transfers потрібні для великих upload/download задач, які мають продовжитись після згортання або relaunch app.",
      how: "Потрібна background URLSessionConfiguration, delegate callbacks і persistence mapping між URLSessionTask та domain operation.",
      code: `let configuration = URLSessionConfiguration.background(
    withIdentifier: "com.example.uploads"
)
let session = URLSession(
    configuration: configuration,
    delegate: uploadDelegate,
    delegateQueue: nil
)`,
      note: "Completion closure як у foreground dataTask тут не підходить. Після relaunch результат прийде через delegate."
    },
    "seniour/networking/graphql-rest-grpc.html": {
      why: "Вибір API style впливає на cache, typing, tooling, payload size, backend complexity і debugging.",
      how: "REST простий і cache-friendly, GraphQL дає гнучкий selection set, gRPC сильний для typed contracts і streaming/internal APIs.",
      code: `// REST: resource-oriented
GET /users/42/orders

// GraphQL: client selects fields
query {
  user(id: "42") { name orders { id total } }
}`,
      note: "GraphQL не автоматично швидший. Він може зменшити overfetching, але додає schema/tooling/cache complexity."
    },
    "seniour/networking/network-architecture.html": {
      why: "Production networking layer потрібен, щоб усі features однаково будували requests, обробляли auth, retry, logs і помилки.",
      how: "Зазвичай є Endpoint, HTTPClient, decoder, error mapper, auth interceptor і repository layer, який віддає domain models.",
      code: `protocol Endpoint {
    var path: String { get }
    var method: HTTPMethod { get }
    var headers: [String: String] { get }
}

protocol HTTPClient {
    func send<T: Decodable>(_ endpoint: Endpoint) async throws -> T
}`,
      note: "Feature не має напряму працювати з URLSession, інакше retry/auth/logging розповзуться по всьому app."
    },
    "seniour/networking/observability.html": {
      why: "Observability потрібна, щоб розуміти, що відбувається в production: latency, error rate, retries, cache hits і user impact.",
      how: "Додають structured logs, metrics, tracing/correlation IDs і redaction для privacy-safe даних.",
      code: `logger.info("api_request_finished",
    metadata: [
        "path": "\\(endpoint.path)",
        "status": "\\(statusCode)",
        "duration_ms": "\\(duration)"
    ]
)`,
      note: "Не логуй tokens, PII або request body з приватними даними. Observability без privacy - production risk."
    },
    "seniour/networking/security-pinning.html": {
      why: "TLS і pinning потрібні для захисту traffic, але pinning має operational cost і може зламати production при неправильній rotation.",
      how: "ATS задає baseline security. Pinning порівнює server certificate або public key із очікуваними pins у app.",
      code: `func urlSession(
    _ session: URLSession,
    didReceive challenge: URLAuthenticationChallenge
) async -> (URLSession.AuthChallengeDisposition, URLCredential?) {
    // Evaluate trust, compare public key hash, then return credential or cancel.
    (.performDefaultHandling, nil)
}`,
      note: "Потрібні backup pins, monitoring і rollback plan. Інакше certificate rotation може покласти app."
    },

    "seniour/ui/design-system.html": {
      why: "Design system потрібна, щоб UI був консистентним, доступним і дешевим у підтримці на багатьох екранах.",
      how: "Вона складається з tokens, components, typography, spacing, accessibility rules, documentation і migration policy.",
      code: `struct PrimaryButton: View {
    let title: String
    let action: () -> Void

    var body: some View {
        Button(title, action: action)
            .buttonStyle(.borderedProminent)
            .controlSize(.large)
    }
}`,
      note: "Design system - це не enum кольорів. Це API, ownership, versioning і правила adoption."
    },
    "seniour/ui/rendering-performance.html": {
      why: "Rendering performance потрібна, щоб scroll, transitions і animations вкладалися у frame budget.",
      how: "Шукай main-thread blocking, overdraw, image decoding, зайві SwiftUI invalidations і важку роботу в cell configuration.",
      code: `cell.configure(title: item.title)

Task.detached {
    let image = await imageDecoder.decode(item.imageData)
    await MainActor.run {
        cell.setImage(image)
    }
}`,
      note: "Не декодуй великі картинки синхронно під час scroll. Це майже гарантований hitch."
    },
    "seniour/ui/state-restoration.html": {
      why: "State restoration потрібен, щоб після kill/relaunch користувач повернувся до наміру, а не просто до випадкового набору views.",
      how: "Зберігай route і domain identifiers, а не весь UI object graph. Після relaunch перевір auth, permissions і stale data.",
      code: `struct RestoredRoute: Codable {
    let screen: String
    let entityID: String
}

let route = RestoredRoute(screen: "orderDetails", entityID: order.id)`,
      note: "Не зберігай sensitive дані plain text і не відновлюй екран, до якого користувач уже не має доступу."
    },
    "seniour/ui/swiftui-uikit-interop.html": {
      why: "Interop потрібен для поступової міграції або використання сильних сторін SwiftUI та UIKit в одному app.",
      how: "UIKit може показувати SwiftUI через UIHostingController, а SwiftUI може обгортати UIKit через UIViewRepresentable.",
      code: `let view = ProfileHeaderView(user: user)
let hosting = UIHostingController(rootView: view)
navigationController.pushViewController(hosting, animated: true)`,
      note: "Найчастіші проблеми interop - sizing, safe area, navigation ownership і дублювання state."
    },
    "seniour/ui/ui-testing-strategy.html": {
      why: "UI tests потрібні для критичних user journeys, але вони дорогі й повільні, тому не мають тестувати кожну дрібну умову.",
      how: "Добра стратегія має test pyramid: unit tests для logic, integration tests для boundaries, UI tests для найцінніших flows.",
      code: `func testLoginSuccess() {
    let app = XCUIApplication()
    app.launchArguments = ["-useFakeBackend", "-loginSuccess"]
    app.launch()

    app.textFields["Email"].tap()
    app.textFields["Email"].typeText("user@example.com")
    app.buttons["Log In"].tap()

    XCTAssertTrue(app.staticTexts["Profile"].exists)
}`,
      note: "Не використовуй sleep для очікувань. Краще чекати появу конкретного element із timeout."
    }
  };

  const main = document.querySelector(".qa");
  if (!main || main.querySelector(".learning-card")) return;

  const lesson = lessons[key];
  if (!lesson) return;

  const card = document.createElement("section");
  card.className = "learning-card";
  card.innerHTML = `
    <h2>Навчальний розбір</h2>
    <div class="learning-grid">
      <div class="learning-block">
        <h3>Навіщо це потрібно</h3>
        <p>${lesson.why}</p>
      </div>
      <div class="learning-block">
        <h3>Як це працює</h3>
        <p>${lesson.how}</p>
      </div>
    </div>
    <div class="learning-example">
      <h3>Приклад коду</h3>
      <pre><code>${escapeHtml(lesson.code)}</code></pre>
    </div>
    <div class="learning-block learning-note">
      <h3>На що звернути увагу</h3>
      <p>${lesson.note}</p>
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
