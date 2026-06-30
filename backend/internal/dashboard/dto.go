package dashboard

type DailySales struct {
    Date   string  `json:"date"`
    Amount float64 `json:"amount"`
}

type SalesDataResponse struct {
    TotalUsers    int          `json:"totalUsers"`
    TotalProducts int          `json:"totalProducts"`
    TotalOrders   int          `json:"totalOrders"`
    TotalSales    float64      `json:"totalSales"`
    Sales         []DailySales `json:"sales"`
}