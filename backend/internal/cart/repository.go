package cart

import (
	"context"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
)

type repository struct {
	db *pgxpool.Pool
}

var _ Repository = &repository{}

func NewRepository(db *pgxpool.Pool) Repository {
	return &repository{db: db}
}

func (r *repository) GetByUserID(ctx context.Context, userID uuid.UUID) (*Cart, error) {
	cart := &Cart{}
	cartQuery := `SELECT id, user_id, total_price FROM carts WHERE user_id = $1`
	err := r.db.QueryRow(ctx, cartQuery, userID).Scan(&cart.ID, &cart.UserID, &cart.TotalPrice)
	if err != nil {
		return nil, err
	}
	itemQuery := `
        SELECT ci.id, ci.cart_id, ci.product_id, ci.quantity, p.product_price
        FROM cart_items ci
        JOIN products p ON p.id = ci.product_id
        WHERE ci.cart_id = $1
    `
	rows, err := r.db.Query(ctx, itemQuery, cart.ID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	for rows.Next() {
		var item CartItem
		if err := rows.Scan(&item.ID, &item.CartID, &item.ProductID, &item.Quantity, &item.Price); err != nil {
			return nil, err
		}
		cart.Items = append(cart.Items, item)
	}
	return cart, nil
}

func (r *repository) Create(ctx context.Context, cart *Cart) error {
	query := `INSERT INTO carts (id, user_id, total_price) VALUES ($1, $2, $3)`
	_, err := r.db.Exec(ctx, query, cart.ID, cart.UserID, cart.TotalPrice)
	return err
}

func (r *repository) AddItem(ctx context.Context, item *CartItem) error {
	query := `INSERT INTO cart_items (id, cart_id, product_id, quantity, price) VALUES ($1, $2, $3, $4, $5)`
	_, err := r.db.Exec(ctx, query, item.ID, item.CartID, item.ProductID, item.Quantity, item.Price)
	return err
}

func (r *repository) UpdateItemQuantity(ctx context.Context, cartID, productID uuid.UUID, quantity int) error {
	query := `UPDATE cart_items SET quantity = $1 WHERE cart_id = $2 AND product_id = $3`
	_, err := r.db.Exec(ctx, query, quantity, cartID, productID)
	return err
}

func (r *repository) UpdateTotalPrice(ctx context.Context, cartID uuid.UUID, total float64) error {
	query := `UPDATE carts SET total_price = $1 WHERE id = $2`
	_, err := r.db.Exec(ctx, query, total, cartID)
	return err
}


func (r *repository) RemoveItem(ctx context.Context, cartID, productID uuid.UUID) error {
	query := `DELETE FROM cart_items WHERE cart_id = $1 AND product_id = $2`
	_, err := r.db.Exec(ctx, query, cartID, productID)
	return err
}
