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