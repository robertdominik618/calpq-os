# CALPQ Technology Stack Evaluation — 2026-09-13

Status: `EVALUATION / INPUT TO ADR-0002`

## Decision context

CALPQ needs one architecture that can support iOS/iPadOS, Android, web and Windows while preserving the M00 rules: UI without business logic, framework-independent domain rules, provider-neutral integrations, strong accessibility, auditability, offline capability and a realistic maintenance load for a small highly automated team.

## Client candidates

Weights: platform coverage 15, web/accessibility 15, Apple fit 12, code reuse 14, Core testability 10, native integration 8, Windows 8, offline 6, ecosystem 7, exit portability 5.

| Candidate | Weighted score / 100 | Main advantage | Main limitation |
|---|---:|---|---|
| React Native + Expo + Web/PWA | **94.2** | native mobile views + standard web/DOM + high TypeScript reuse | native Windows is not the baseline; Windows v1 is PWA |
| Native Swift/Kotlin/Web split | 88.8 | highest platform-specific fidelity | multiple application codebases and highest maintenance cost |
| Tauri 2 + web frontend | 88.4 | excellent desktop footprint and web reuse | adds Rust plus WebView/mobile integration complexity |
| Flutter | 87.0 | mature single UI codebase across mobile/web/Windows | web accessibility relies on Flutter semantics over canvas; less natural DOM baseline |
| Kotlin Multiplatform + Compose | 86.2 | excellent shared domain logic; stable mobile/desktop UI | Compose Web/Wasm remains Beta |
| .NET MAUI + Blazor | 82.6 | strong C# ecosystem and Windows integration | MAUI itself has no browser web target; web requires a parallel Blazor surface |

The scores are decision aids, not mathematical proof. CALPQ's accessibility, web and lean-maintenance requirements are intentionally weighted strongly.

## Selected client direction

**React Native + Expo + Expo Router + React Native Web.**

- iOS/iPadOS and Android: native React Native application using the New Architecture.
- Web: Expo Router / React Native Web with web-specific components where semantic HTML improves accessibility or browser behavior.
- Windows baseline: installable PWA. Microsoft documents PWA integration with Windows Start, taskbar, Alt+Tab and notifications.
- Native Windows shell: optional later adapter by separate ADR if device integration, enterprise deployment or measured UX requirements justify it.

This keeps one primary application language while preserving platform-specific modules and files where native behavior is required.

## Server candidates

Server choice prioritizes maintainability, contract sharing, integration ecosystem, deployability and deterministic testing rather than maximum synthetic throughput.

| Candidate | Decision | Notes |
|---|---|---|
| TypeScript + Node.js LTS | **SELECTED** | same primary language as clients; strong web/AI/document ecosystem; simple deployment |
| Go | reserve | excellent operational simplicity/performance, but creates a second primary language immediately |
| Kotlin/JVM | reserve | strong type system and server maturity, but no advantage large enough to justify a second stack |
| ASP.NET Core | reserve | mature and capable; same multi-language penalty and separate UI ecosystem |
| Rust | specialist adapter only | excellent safety/performance, but unnecessary complexity for the baseline business application |

## Proposed server baseline

- TypeScript with strict compiler policy.
- Node.js **24 LTS** for production baseline. Node.js 26 is Current on the decision date and should not be the production baseline until it reaches LTS and passes an upgrade ADR/check.
- Fastify 5.x as the HTTP/API framework because its schema-first validation/serialization model fits explicit contracts without imposing a heavy application framework.
- REST/JSON API with OpenAPI 3.1.x as the initial public/wire contract. OpenAPI 3.2.1 was published only days before this evaluation, so CALPQ should not adopt it until toolchain compatibility is proven.
- PostgreSQL **18 current supported major**, always on the current minor release for the selected major.
- SQL migrations are explicit and versioned. No ORM is allowed to become the canonical schema authority.
- S3-compatible object-storage port for original documents and large binary evidence.
- PostgreSQL-backed transactional outbox/jobs initially; Redis, Kafka or another broker requires measured need and a later ADR.
- OpenTelemetry-compatible observability interfaces.
- OIDC/OAuth-compatible identity boundary; concrete identity provider remains replaceable.

## Offline and local data

Native clients may use SQLite behind a local persistence port. Web uses browser storage behind the same logical boundary.

The server remains authoritative for regulated state transitions. Offline operations use explicit local states and a synchronization/outbox model; conflict resolution must be domain-specific rather than last-write-wins by default.

PWA service-worker caching must be conservative. Expo documentation explicitly warns that aggressive service-worker caching can make updates difficult. Therefore Windows/web offline mode starts narrower than native mobile offline mode.

## AI, OCR and document processing

AI and OCR providers are adapters, never Core dependencies. Provider SDKs may exist only inside adapter packages. Every extracted or generated datum that can influence a regulated result carries provenance and verification state.

Long-running document/OCR/AI processing runs outside request/response handlers through background jobs. The API returns job/state identifiers rather than holding long HTTP requests open.

## Deployment and lock-in policy

- GitHub remains source of truth.
- GitHub Actions remains the CI baseline.
- Server workloads are OCI-container deployable.
- Web output must remain self-hostable. Expo EAS may be used as an accelerator, but it is not a mandatory runtime dependency.
- PostgreSQL and object storage are accessed through portable contracts.
- No business rule may depend on a cloud-provider-specific SDK.

## Version evidence snapshot

At the decision date:

- React Native 0.87 is active; 0.86 is also active. Expo stable SDK lines intentionally track supported React Native versions rather than every React Native release.
- Expo documentation lists SDK 57 with React Native 0.86 and first-class web support.
- React Native's New Architecture is the mandatory direction in modern releases.
- Node.js 24 is LTS; Node.js 26 is Current.
- PostgreSQL 18 is Current and supported through 2030; PostgreSQL 19 is still Beta.
- Compose Multiplatform UI is stable for Android, iOS and desktop, while web/Wasm remains Beta.
- Flutter supports Android, iOS, web and Windows, but its web accessibility layer maps a Flutter semantics tree onto HTML because the UI is canvas-rendered.

## Primary evidence

- React Native releases: https://reactnative.dev/releases/
- Expo SDK reference: https://docs.expo.dev/versions/latest/
- Expo web: https://docs.expo.dev/workflow/web/
- Expo PWA guidance: https://github.com/expo/expo/blob/main/docs/pages/guides/progressive-web-apps.mdx
- Microsoft PWA on Windows: https://learn.microsoft.com/en-us/microsoft-edge/progressive-web-apps/ux
- Kotlin Multiplatform platform stability: https://kotlinlang.org/docs/multiplatform/supported-platforms.html
- Flutter supported platforms: https://docs.flutter.dev/reference/supported-platforms
- Flutter web accessibility: https://docs.flutter.dev/ui/accessibility/web-accessibility
- .NET MAUI platforms: https://learn.microsoft.com/en-us/dotnet/maui/supported-platforms
- Tauri 2: https://tauri.app/
- Node.js releases: https://nodejs.org/en/about/previous-releases
- PostgreSQL versioning: https://www.postgresql.org/support/versioning/
- Fastify validation/serialization: https://fastify.dev/docs/latest/Reference/Validation-and-Serialization/
- OpenAPI: https://spec.openapis.org/oas/
