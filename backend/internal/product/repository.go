package product

import (
	"context"
	"errors"

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

func (r *repository) Create(ctx context.Context, p *Product) error {
	query := `
        INSERT INTO products (id, user_id, product_name, product_desc, product_price, category, brand, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    `
	_, err := r.db.Exec(ctx, query,
		p.ID, p.UserID, p.ProductName, p.ProductDesc,
		p.ProductPrice, p.Category, p.Brand, p.CreatedAt, p.UpdatedAt,
	)
	return err
}

func (r *repository) SaveImages(ctx context.Context, images []ProductImage) error {
	query := `
        INSERT INTO product_images (id, product_id, url, public_id)
        VALUES ($1, $2, $3, $4)
    `
	for _, img := range images {
		_, err := r.db.Exec(ctx, query, img.ID, img.ProductID, img.URL, img.PublicID)
		if err != nil {
			return err
		}
	}
	return nil
}

func (r *repository) GetByID(ctx context.Context, id uuid.UUID) (*Product, error) {
	query := `
        SELECT p.id, p.user_id, p.product_name, p.product_desc, p.product_price, p.category, p.brand, p.created_at, p.updated_at,
               pi.id, pi.url, pi.public_id
        FROM products p
        LEFT JOIN product_images pi ON pi.product_id = p.id
        WHERE p.id = $1
    `
	rows, err := r.db.Query(ctx, query, id)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var product *Product

	for rows.Next() {
		var p Product
		var imgID *uuid.UUID
		var imgURL *string
		var imgPublicID *string

		err := rows.Scan(
			&p.ID, &p.UserID, &p.ProductName, &p.ProductDesc, &p.ProductPrice, &p.Category, &p.Brand, &p.CreatedAt, &p.UpdatedAt,
			&imgID, &imgURL, &imgPublicID,
		)
		if err != nil {
			return nil, err
		}

		if product == nil {
			product = &p
		}

		if imgID != nil {
			product.Images = append(product.Images, ProductImage{
				ID:        *imgID,
				ProductID: product.ID,
				URL:       *imgURL,
				PublicID:  *imgPublicID,
			})
		}
	}

	if product == nil {
		return nil, errors.New("product not found")
	}

	return product, nil
}

func (r *repository) GetAll(ctx context.Context) ([]*Product, error) {
	query := `
        SELECT p.id, p.user_id, p.product_name, p.product_desc, p.product_price, p.category, p.brand, p.created_at, p.updated_at,
               pi.id, pi.url, pi.public_id
        FROM products p
        LEFT JOIN product_images pi ON pi.product_id = p.id
        ORDER BY p.created_at DESC
    `
	rows, err := r.db.Query(ctx, query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	productMap := make(map[uuid.UUID]*Product)
	var orderedProducts []*Product

	for rows.Next() {
		var p Product
		var imgID *uuid.UUID
		var imgURL *string
		var imgPublicID *string

		err := rows.Scan(
			&p.ID, &p.UserID, &p.ProductName, &p.ProductDesc, &p.ProductPrice, &p.Category, &p.Brand, &p.CreatedAt, &p.UpdatedAt,
			&imgID, &imgURL, &imgPublicID,
		)
		if err != nil {
			return nil, err
		}

		if existingP, ok := productMap[p.ID]; ok {
			if imgID != nil {
				existingP.Images = append(existingP.Images, ProductImage{
					ID:        *imgID,
					ProductID: p.ID,
					URL:       *imgURL,
					PublicID:  *imgPublicID,
				})
			}
		} else {
			if imgID != nil {
				p.Images = append(p.Images, ProductImage{
					ID:        *imgID,
					ProductID: p.ID,
					URL:       *imgURL,
					PublicID:  *imgPublicID,
				})
			}
			productMap[p.ID] = &p
			orderedProducts = append(orderedProducts, &p)
		}
	}

	return orderedProducts, nil
}

func (r *repository) GetImages(ctx context.Context, productID uuid.UUID) ([]ProductImage, error) {
	query := `SELECT id, product_id, url, public_id FROM product_images WHERE product_id = $1`
	rows, err := r.db.Query(ctx, query, productID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var images []ProductImage
	for rows.Next() {
		var img ProductImage
		if err := rows.Scan(&img.ID, &img.ProductID, &img.URL, &img.PublicID); err != nil {
			return nil, err
		}
		images = append(images, img)
	}
	return images, nil
}

func (r *repository) Delete(ctx context.Context, id uuid.UUID) error {
	// product_images bhi delete hongi — CASCADE ya manually
	_, err := r.db.Exec(ctx, `DELETE FROM products WHERE id = $1`, id)
	return err
}

func (r *repository) UpdateProduct(ctx context.Context, p *Product) error {
	query := `
        UPDATE products
        SET product_name=$1, product_desc=$2, product_price=$3, category=$4, brand=$5, updated_at=$6
        WHERE id=$7
    `
	_, err := r.db.Exec(ctx, query,
		p.ProductName, p.ProductDesc, p.ProductPrice,
		p.Category, p.Brand, p.UpdatedAt, p.ID,
	)
	return err
}

// removed images ko DB se delete karo
// OPTIONAL: A more optimized version with no loop!
func (r *repository) DeleteImages(ctx context.Context, productID uuid.UUID, publicIDs []string) error {
	query := `DELETE FROM product_images WHERE product_id=$1 AND public_id = ANY($2)`
	_, err := r.db.Exec(ctx, query, productID, publicIDs)
	return err
}
