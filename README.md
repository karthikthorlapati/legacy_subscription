# Legacy Subscription Billing Engine Refactor

This project refactors a tightly coupled, untestable "God class" that mixes direct database I/O, third-party payment API calls, time-based logic, and business rules into a highly modular, unit-testable architecture using SOLID principles and Dependency Injection.

## Technologies Used
- Node.js
- TypeScript
- PostgreSQL
- Docker & Docker Compose
- Jest for testing

## Setup and Running

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Configure Environment Variables**
   Copy `.env.example` to `.env` if you want to run it locally, though Docker Compose handles the environment variables.
   ```bash
   cp .env.example .env
   ```

3. **Start the Application**
   Run the application and PostgreSQL database using Docker Compose:
   ```bash
   docker-compose up -d --build
   ```

   This command will spin up the `db` and `api` services, automatically apply migrations, seed the database, and start the express server on port 3000.

4. **Verify Application Health**
   You can query the API directly:
   ```bash
   curl -X POST http://localhost:3000/api/renew -H "Content-Type: application/json" -d '{"userId":"user-1"}'
   ```

## Testing

To run the unit tests in isolation (no database or external APIs required):

```bash
npm run test
```

This ensures full coverage of the domain logic (`SubscriptionBillingService`) using mocked adapters for time and database operations.

## Architecture Documentation

Please see the [Architecture Decision Record (ADR)](docs/ADR-001-Refactoring-God-Class.md) for details on the decisions made during the refactoring process.
