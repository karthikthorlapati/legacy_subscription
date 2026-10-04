# Context
The legacy `SubscriptionManager` class was problematic because it functioned as a "God class". It tightly coupled core business logic (like checking subscription dates, applying December discounts, and calculating new expiration dates) directly with infrastructure details (such as direct PostgreSQL queries, external Stripe API calls, and temporal coupling to `new Date()`). This made the module entirely untestable in isolation, leading to fragile code where infrastructure changes could break business rules, and unit testing required setting up full databases and modifying system clocks.

# Decision
We decided to adopt a Ports and Adapters (Hexagonal) Architecture with Dependency Injection (DI). We extracted all business logic into a pure domain service (`SubscriptionBillingService`) and defined interfaces (Ports) for external dependencies: `ISubscriptionRepository`, `IUserRepository`, `IPaymentGateway`, and `ITimeProvider`. We then created concrete implementations (Adapters) for these ports, such as `PostgresSubscriptionRepository` and `MockPaymentGateway`. 

# Consequences
- **Testability**: The core business logic can now be fully unit-tested in isolation without real databases or network calls, drastically speeding up tests and removing flakiness.
- **Maintainability**: The application adheres to the Single Responsibility Principle (SRP) and Dependency Inversion Principle (DIP). Adapters can be replaced (e.g., swapping Postgres for MySQL or Stripe for PayPal) without modifying the domain logic.
- **Complexity**: The file count has increased due to the separation of concerns, and understanding the architecture requires knowledge of interfaces and Dependency Injection. However, this trade-off is well worth the improved testability and flexibility.

# Code Smells Addressed
- **Temporal Coupling**: Direct calls to `new Date()` were replaced with an `ITimeProvider` port, allowing the system clock to be mocked deterministically in tests.
- **I/O Interleaving**: Business rules were separated from raw infrastructure calls. Database queries are now handled by Repositories, and HTTP requests are handled by Gateways, eliminating interleaved SQL/HTTP calls inside the main service.
- **Hidden Dependencies**: Instantiating connections directly within the method was removed in favor of constructor injection, making the dependencies of the service explicit.
