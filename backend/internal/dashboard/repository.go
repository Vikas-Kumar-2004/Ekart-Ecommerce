package dashboard

import (
    "context"

    "github.com/jackc/pgx/v5/pgxpool"
)

type repository struct {
    db *pgxpool.Pool
}

var _ Repository = &repository{}

func NewRepository(db *pgxpool.Pool) Repository {
    return &repository{db: db}
}


func (r *repository) CountUsers(ctx context.Context) (int, error) {
    var count int
    err := r.db.QueryRow(ctx, `SELECT COUNT(*) FROM users`).Scan(&count)
    return count, err
}


func (r *repository) CountProducts(ctx context.Context) (int, error) {
    var count int
    err := r.db.QueryRow(ctx, `SELECT COUNT(*) FROM products`).Scan(&count)
    return count, err
}

func (r *repository) CountPaidOrders(ctx context.Context) (int, error) {
    var count int
    err := r.db.QueryRow(ctx, `SELECT COUNT(*) FROM orders WHERE status = 'Paid'`).Scan(&count)
    return count, err
}

func (r *repository) SumPaidSales(ctx context.Context) (float64, error) {
    var total float64
    query := `SELECT COALESCE(SUM(amount), 0) FROM orders WHERE status = 'Paid'`
    err := r.db.QueryRow(ctx, query).Scan(&total)
    return total, err // JS ka totalSalesAgg[0]?.total || 0 — COALESCE handle karta hai null
}

func (r *repository) SalesByDateLast30Days(ctx context.Context) ([]DailySales, error) {
    query := `
        SELECT TO_CHAR(created_at, 'YYYY-MM-DD') AS date, SUM(amount) AS amount
        FROM orders
        WHERE status = 'Paid' AND created_at >= NOW() - INTERVAL '30 days'
        GROUP BY TO_CHAR(created_at, 'YYYY-MM-DD')
        ORDER BY date ASC
    `
    rows, err := r.db.Query(ctx, query)
    if err != nil {
        return nil, err
    }
    defer rows.Close()

    var sales []DailySales
    for rows.Next() {
        var s DailySales
        if err := rows.Scan(&s.Date, &s.Amount); err != nil {
            return nil, err
        }
        sales = append(sales, s)
    }
    return sales, nil
}