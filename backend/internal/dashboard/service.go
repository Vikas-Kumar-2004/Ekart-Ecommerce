package dashboard

import "context"

type service struct {
	repo Repository
}

var _ Service = &service{}

func NewService(repo Repository) Service {
	return &service{repo: repo}
}

func (s *service) GetSalesData(ctx context.Context) (*SalesDataResponse, error) {
	totalUsers, err := s.repo.CountUsers(ctx)
	if err != nil {
		return nil, err
	}

	totalProducts, err := s.repo.CountProducts(ctx)
	if err != nil {
		return nil, err
	}

	totalOrders, err := s.repo.CountPaidOrders(ctx)
	if err != nil {
		return nil, err
	}

	totalSales, err := s.repo.SumPaidSales(ctx)
	if err != nil {
		return nil, err
	}

	sales, err := s.repo.SalesByDateLast30Days(ctx)
	if err != nil {
		return nil, err
	}
	if sales == nil {
		sales = []DailySales{} // JS ka empty array, null nahi
	}

	return &SalesDataResponse{
		TotalUsers:    totalUsers,
		TotalProducts: totalProducts,
		TotalOrders:   totalOrders,
		TotalSales:    totalSales,
		Sales:         sales,
	}, nil
}
