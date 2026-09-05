# 2. Datastores & Enterprise Patterns

ULTRON employs several distributed system design patterns to guarantee consistency and reliability.

## 1. Decomposed Databases
Instead of a monolithic database, ULTRON logically isolates schemas inside PostgreSQL:
- `ultron_catalog`
- `ultron_inventory`
- `ultron_orders`
- `ultron_payments`

This enforces bounded contexts, meaning a service can only mutate its own tables, preventing tightly coupled spaghetti queries.

## 2. Distributed Locking (Redis Redlock)
When a user adds an item to their cart, the `inventory-service` requests a Redlock in Redis.
- **Why?** To prevent race conditions where two users attempt to check out the same 1-of-1 physical device.
- **Flow:** If Redis grants the lock, PostgreSQL updates the item status to `LOCKED_CHECKOUT_HOLD`. If the lock expires (TTL), it automatically reverts to `AVAILABLE`.

## 3. Distributed Transactions (Order Orchestration)
The `order-service` handles checkout using PostgreSQL ACID transactions:
1. `BEGIN` transaction.
2. Insert Order and Order Items.
3. Make a synchronous HTTP call to `inventory-service` to transition the item from `LOCKED_CHECKOUT_HOLD` to `SOLD`.
4. If inventory confirms, execute `COMMIT`. If anything fails (e.g., lock expired), execute `ROLLBACK`.

## 4. Idempotency & Transactional Outbox Pattern
The `payment-service` is built to withstand network retries and crashes:
- **Idempotency:** It requires an `Idempotency-Key` header. It uses `SELECT ... FOR UPDATE` to check if the payment was already processed. If yes, it immediately returns the cached result—preventing double charges.
- **Transactional Outbox:** To ensure we don't save a payment in the DB but fail to dispatch the event (due to a crash), both the payment record AND the event payload (`payment_outbox_events`) are inserted in the *same* SQL transaction.
- **Outbox Worker:** A background loop polls the outbox table using `SELECT ... FOR UPDATE SKIP LOCKED`. This PostgreSQL feature allows multiple instances of the service to pull distinct events from the queue simultaneously without deadlocking, guaranteeing at-least-once event delivery.
