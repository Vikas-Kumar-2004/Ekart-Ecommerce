ecommerce/
│
├── cmd/
│   └── api/
│       └── main.go
│
├── configs/
│   ├── config.go
│   └── database.go
│
├── internal/
│
│   ├── user/
│   │   ├── model.go
│   │   ├── dto.go
│   │   ├── interfaces.go        // Service & Repository interfaces
│   │   ├── service.go           // Service implementation
│   │   ├── repository.go        // Repository implementation
│   │   ├── handler.go
│   │   ├── routes.go
│   │   └── validator.go
│   │
│   ├── product/
│   │   ├── model.go
│   │   ├── dto.go
│   │   ├── interfaces.go
│   │   ├── service.go
│   │   ├── repository.go
│   │   ├── handler.go
│   │   ├── routes.go
│   │   └── validator.go
│   │
│   ├── cart/
│   │   ├── model.go
│   │   ├── dto.go
│   │   ├── interfaces.go
│   │   ├── service.go
│   │   ├── repository.go
│   │   ├── handler.go
│   │   └── routes.go
│   │
│   ├── order/
│   │   ├── model.go
│   │   ├── dto.go
│   │   ├── interfaces.go
│   │   ├── service.go
│   │   ├── repository.go
│   │   ├── handler.go
│   │   └── routes.go
│   │
│   ├── session/
│   │   ├── model.go
│   │   ├── interfaces.go
│   │   ├── service.go
│   │   ├── repository.go
│   │   ├── handler.go
│   │   └── routes.go
│   │
│   ├── middleware/
│   │   ├── auth.go
│   │   ├── logger.go
│   │   └── recovery.go
│   │
│   ├── shared/
│   │   ├── errors/
│   │   ├── response/
│   │   ├── utils/
│   │   ├── constants/
│   │   └── validator/
│   │
│   └── database/
│       └── migrate.go
│
├── pkg/
│
├── .env
├── go.mod
└── go.sum

<!-- ---------------------------------------------------------------------------------------------------------------- -->

**One-to-Many (`||--o{`)**
- `USERS` → `PRODUCTS` — ek user kai products create kar sakta hai
- `USERS` → `ORDERS` — ek user kai orders place kar sakta hai
- `USERS` → `SESSIONS` — ek user ke kai active sessions ho sakte hain
- `PRODUCTS` → `PRODUCT_IMAGES` — ek product ke kai images
- `ORDERS` → `ORDER_ITEMS` — ek order mein kai products
- `CARTS` → `CART_ITEMS` — ek cart mein kai items

**One-to-One (`||--|{`)**
- `USERS` → `CARTS` — ek user ka sirf ek cart (`UNIQUE` constraint hai DB mein)

**Junction Tables (Many-to-Many bridge)**
- `ORDER_ITEMS` — `ORDERS` aur `PRODUCTS` ko jodta hai
- `CART_ITEMS` — `CARTS` aur `PRODUCTS` ko jodta hai, extra `price` column bhi hai

> ⚠️ **Missing:** `order_items` mein abhi `price` column nahi hai tumhare DB mein — pehle discuss kiya tha ki add karna chahiye taaki order history accurate rahe. `ALTER TABLE order_items ADD COLUMN price NUMERIC(10,2);` run kar lo!

