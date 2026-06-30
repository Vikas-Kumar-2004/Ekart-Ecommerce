package dashboard

import "context"

type Repository interface {
    CountUsers(ctx context.Context) (int, error)
    CountProducts(ctx context.Context) (int, error)
    CountPaidOrders(ctx context.Context) (int, error)
    SumPaidSales(ctx context.Context) (float64, error)
    SalesByDateLast30Days(ctx context.Context) ([]DailySales, error)
}

type Service interface {
    GetSalesData(ctx context.Context) (*SalesDataResponse, error)
}