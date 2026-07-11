package review

import (
	"context"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

type repository struct {
	db *pgxpool.Pool
}

func NewRepository(db *pgxpool.Pool) Repository {
	return &repository{db: db}
}

func (r *repository) Create(ctx context.Context, review *Review) error {
	query := `
		INSERT INTO reviews (id, product_id, user_id, rating, comment)
		VALUES ($1, $2, $3, $4, $5)
		RETURNING created_at, updated_at
	`
	return r.db.QueryRow(ctx, query, review.ID, review.ProductID, review.UserID, review.Rating, review.Comment).Scan(&review.CreatedAt, &review.UpdatedAt)
}

func (r *repository) GetByID(ctx context.Context, id uuid.UUID) (*Review, error) {
	query := `
		SELECT id, product_id, user_id, rating, comment, created_at, updated_at
		FROM reviews
		WHERE id = $1
	`
	var rev Review
	err := r.db.QueryRow(ctx, query, id).Scan(
		&rev.ID, &rev.ProductID, &rev.UserID, &rev.Rating, &rev.Comment, &rev.CreatedAt, &rev.UpdatedAt,
	)
	if err != nil {
		return nil, err
	}
	return &rev, nil
}

func (r *repository) GetByProductID(ctx context.Context, productID uuid.UUID) ([]*ReviewResponse, error) {
	query := `
		SELECT 
			r.id, r.product_id, r.user_id, r.rating, r.comment, r.created_at, r.updated_at,
			u.first_name, u.last_name
		FROM reviews r
		JOIN users u ON r.user_id = u.id
		WHERE r.product_id = $1
		ORDER BY r.created_at DESC
	`
	rows, err := r.db.Query(ctx, query, productID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var reviews []*ReviewResponse
	for rows.Next() {
		var rev ReviewResponse
		err := rows.Scan(
			&rev.ID, &rev.ProductID, &rev.UserID, &rev.Rating, &rev.Comment, &rev.CreatedAt, &rev.UpdatedAt,
			&rev.FirstName, &rev.LastName,
		)
		if err != nil {
			return nil, err
		}
		reviews = append(reviews, &rev)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	return reviews, nil
}

func (r *repository) Update(ctx context.Context, review *Review) error {
	query := `
		UPDATE reviews
		SET rating = $1, comment = $2, updated_at = CURRENT_TIMESTAMP
		WHERE id = $3
	`
	cmdTag, err := r.db.Exec(ctx, query, review.Rating, review.Comment, review.ID)
	if err != nil {
		return err
	}
	if cmdTag.RowsAffected() == 0 {
		return pgx.ErrNoRows
	}
	return nil
}

func (r *repository) Delete(ctx context.Context, id uuid.UUID) error {
	query := `DELETE FROM reviews WHERE id = $1`
	cmdTag, err := r.db.Exec(ctx, query, id)
	if err != nil {
		return err
	}
	if cmdTag.RowsAffected() == 0 {
		return pgx.ErrNoRows
	}
	return nil
}
