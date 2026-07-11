package order

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

func (r *repository) Create(ctx context.Context, o *Order) error {
	query := `
        INSERT INTO orders (id, user_id, amount, tax, shipping, currency, status, razorpay_order_id, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    `
	_, err := r.db.Exec(ctx, query,
		o.ID, o.UserID, o.Amount, o.Tax, o.Shipping,
		o.Currency, o.Status, o.RazorpayOrderID, o.CreatedAt, o.UpdatedAt,
	)
	return err
}

func (r *repository) SaveProducts(ctx context.Context, products []OrderItem) error {
	query := `INSERT INTO order_items (id, order_id, product_id, quantity, price) VALUES ($1, $2, $3, $4, $5)`
	for _, p := range products {
		if _, err := r.db.Exec(ctx, query, p.ID, p.OrderID, p.ProductID, p.Quantity, p.Price); err != nil {
			return err
		}
	}
	return nil
}

func (r *repository) GetByID(ctx context.Context, id uuid.UUID) (*Order, error) {
	query := `
		SELECT id, user_id, amount, tax, shipping, currency, status, razorpay_order_id, razorpay_payment_id, razorpay_signature, created_at, updated_at
		FROM orders
		WHERE id = $1
	`
	o := &Order{}
	err := r.db.QueryRow(ctx, query, id).Scan(
		&o.ID, &o.UserID, &o.Amount, &o.Tax, &o.Shipping,
		&o.Currency, &o.Status, &o.RazorpayOrderID, &o.RazorpayPaymentID, &o.RazorpaySignature, &o.CreatedAt, &o.UpdatedAt,
	)
	if err != nil {
		return nil, err
	}
	return o, nil
}

func (r *repository) GetByUserID(ctx context.Context, userID uuid.UUID) ([]*Order, error) {
	// scan karo yahan
	return nil, nil
}

// JS ka Order.findOneAndUpdate({ razorpayOrderId }, { status }, { new: true })
func (r *repository) UpdateStatus(ctx context.Context, razorpayOrderID string, status OrderStatus) (*Order, error) {
	query := `
        UPDATE orders SET status = $1, updated_at = NOW()
        WHERE razorpay_order_id = $2
        RETURNING id, user_id, amount, tax, shipping, currency, status, razorpay_order_id, created_at, updated_at
    `
	o := &Order{}
	err := r.db.QueryRow(ctx, query, status, razorpayOrderID).Scan(
		&o.ID, &o.UserID, &o.Amount, &o.Tax, &o.Shipping,
		&o.Currency, &o.Status, &o.RazorpayOrderID, &o.CreatedAt, &o.UpdatedAt,
	)
	return o, err
}

func (r *repository) UpdateStatusByID(ctx context.Context, id uuid.UUID, status OrderStatus) error {
	query := `UPDATE orders SET status = $1, updated_at = NOW() WHERE id = $2`
	_, err := r.db.Exec(ctx, query, status, id)
	return err
}

// JS ka findOneAndUpdate({ status: "Paid", razorpayPaymentId, razorpaySignature })
func (r *repository) UpdatePayment(ctx context.Context, razorpayOrderID, paymentID, signature string) (*Order, error) {
	query := `
        UPDATE orders
        SET status = $1, razorpay_payment_id = $2, razorpay_signature = $3, updated_at = NOW()
        WHERE razorpay_order_id = $4
        RETURNING id, user_id, amount, tax, shipping, currency, status, razorpay_order_id, created_at, updated_at
    `
	o := &Order{}
	err := r.db.QueryRow(ctx, query, StatusPaid, paymentID, signature, razorpayOrderID).Scan(
		&o.ID, &o.UserID, &o.Amount, &o.Tax, &o.Shipping,
		&o.Currency, &o.Status, &o.RazorpayOrderID, &o.CreatedAt, &o.UpdatedAt,
	)
	return o, err
}

func (r *repository) ClearCart(ctx context.Context, cartID uuid.UUID) error {
	// items delete karo
	_, err := r.db.Exec(ctx, `DELETE FROM cart_items WHERE cart_id = $1`, cartID)
	if err != nil {
		return err
	}
	// total reset karo
	_, err = r.db.Exec(ctx, `UPDATE carts SET total_price = 0 WHERE id = $1`, cartID)
	return err
}

// JS ka Order.find({}).sort({ createdAt: -1 }).populate("user").populate("products.productId")
func (r *repository) GetAll(ctx context.Context) ([]*Order, error) {
	query := `
        SELECT
            o.id, o.user_id, o.amount, o.tax, o.shipping, o.currency,
            o.status, o.razorpay_order_id, o.razorpay_payment_id, o.created_at,

            u.first_name, u.last_name, u.email,

            oi.id, oi.product_id, oi.quantity, oi.price,
            p.product_name

        FROM orders o
        JOIN users u        ON u.id = o.user_id
        LEFT JOIN order_items oi  ON oi.order_id = o.id
        LEFT JOIN products p      ON p.id = oi.product_id

        ORDER BY o.created_at DESC
    `
	rows, err := r.db.Query(ctx, query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	// orderMap — ek order ke multiple items honge, group karo
	orderMap := make(map[uuid.UUID]*Order)
	var orderIDs []uuid.UUID // order preserve karne ke liye

	for rows.Next() {
		var (
			o           Order
			firstName   string
			lastName    string
			itemID      *uuid.UUID
			productID   *uuid.UUID
			quantity    *int
			price       *float64
			productName *string
		)

		if err := rows.Scan(
			&o.ID, &o.UserID, &o.Amount, &o.Tax, &o.Shipping, &o.Currency,
			&o.Status, &o.RazorpayOrderID, &o.RazorpayPaymentID, &o.CreatedAt,
			&firstName, &lastName, &o.UserEmail,
			&itemID, &productID, &quantity, &price, &productName,
		); err != nil {
			return nil, err
		}

		// order pehli baar aa raha hai
		if _, exists := orderMap[o.ID]; !exists {
			o.UserName = firstName + " " + lastName
			orderMap[o.ID] = &o
			orderIDs = append(orderIDs, o.ID)
		}

		// item attach karo — JS ka .populate("products.productId")
		if itemID != nil {
			pName := ""
			if productName != nil {
				pName = *productName
			}
			orderMap[o.ID].Items = append(orderMap[o.ID].Items, OrderItem{
				ID:          *itemID,
				OrderID:     o.ID,
				ProductID:   *productID,
				Quantity:    *quantity,
				Price:       *price,
				ProductName: pName,
			})
		}
	}

	// ordered list banao
	var orders []*Order
	for _, id := range orderIDs {
		orders = append(orders, orderMap[id])
	}
	return orders, nil
}


// JS ka Order.find({ user: userId }).populate("products.productId").populate("user")
func (r *repository) GetByUserIDDetailed(ctx context.Context, userID uuid.UUID) ([]*Order, error) {
    query := `
        SELECT
            o.id, o.user_id, o.amount, o.tax, o.shipping, o.currency,
            o.status, o.razorpay_order_id, o.razorpay_payment_id, o.created_at,

            u.first_name, u.last_name, u.email,

            oi.id, oi.product_id, oi.quantity, oi.price,
            p.product_name

        FROM orders o
        JOIN users u            ON u.id = o.user_id
        LEFT JOIN order_items oi  ON oi.order_id = o.id
        LEFT JOIN products p      ON p.id = oi.product_id

        WHERE o.user_id = $1
        ORDER BY o.created_at DESC
    `
    rows, err := r.db.Query(ctx, query, userID)
    if err != nil {
        return nil, err
    }
    defer rows.Close()

    orderMap := make(map[uuid.UUID]*Order)
    var orderIDs []uuid.UUID

    for rows.Next() {
        var (
            o           Order
            firstName   string
            lastName    string
            itemID      *uuid.UUID
            productID   *uuid.UUID
            quantity    *int
            price       *float64
            productName *string
        )

        if err := rows.Scan(
            &o.ID, &o.UserID, &o.Amount, &o.Tax, &o.Shipping, &o.Currency,
            &o.Status, &o.RazorpayOrderID, &o.RazorpayPaymentID, &o.CreatedAt,
            &firstName, &lastName, &o.UserEmail,
            &itemID, &productID, &quantity, &price, &productName,
        ); err != nil {
            return nil, err
        }

        if _, exists := orderMap[o.ID]; !exists {
            o.UserName = firstName + " " + lastName
            orderMap[o.ID] = &o
            orderIDs = append(orderIDs, o.ID)
        }

        if itemID != nil {
            pName := ""
            if productName != nil {
                pName = *productName
            }
            orderMap[o.ID].Items = append(orderMap[o.ID].Items, OrderItem{
                ID:          *itemID,
                OrderID:     o.ID,
                ProductID:   *productID,
                Quantity:    *quantity,
                Price:       *price,
                ProductName: pName,
            })
        }
    }

    var orders []*Order
    for _, id := range orderIDs {
        orders = append(orders, orderMap[id])
    }
    return orders, nil // JS ka "if empty return 404" commented hai — empty slice hi return karenge
}