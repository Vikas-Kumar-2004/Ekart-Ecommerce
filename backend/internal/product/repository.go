package product

import (
	"context"
	"errors"
	"fmt"
	"strings"

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

func (r *repository) GetUniqueCategories(ctx context.Context) ([]string, error) {
	rows, err := r.db.Query(ctx, "SELECT DISTINCT category FROM products WHERE category IS NOT NULL AND category != '' ORDER BY category ASC")
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var categories []string
	for rows.Next() {
		var cat string
		if err := rows.Scan(&cat); err != nil {
			return nil, err
		}
		categories = append(categories, cat)
	}
	return categories, nil
}

func (r *repository) GetUniqueBrands(ctx context.Context) ([]string, error) {
	rows, err := r.db.Query(ctx, "SELECT DISTINCT brand FROM products WHERE brand IS NOT NULL AND brand != '' ORDER BY brand ASC")
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var brands []string
	for rows.Next() {
		var brand string
		if err := rows.Scan(&brand); err != nil {
			return nil, err
		}
		brands = append(brands, brand)
	}
	return brands, nil
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

func (r *repository) GetAll(ctx context.Context, filter ProductFilter, page, limit int) ([]*Product, int, error) {
	// Build WHERE clause dynamically
	whereClause := "WHERE 1=1"
	var args []interface{}
	argID := 1

	if filter.Search != "" {
		whereClause += fmt.Sprintf(" AND p.product_name ILIKE $%d", argID)
		args = append(args, "%"+filter.Search+"%")
		argID++
	}
	if filter.Category != "" && filter.Category != "All" {
		whereClause += fmt.Sprintf(" AND p.category = $%d", argID)
		args = append(args, filter.Category)
		argID++
	}
	if filter.Brand != "" && filter.Brand != "All" {
		whereClause += fmt.Sprintf(" AND p.brand = $%d", argID)
		args = append(args, filter.Brand)
		argID++
	}
	if filter.MinPrice > 0 {
		whereClause += fmt.Sprintf(" AND p.product_price >= $%d", argID)
		args = append(args, filter.MinPrice)
		argID++
	}
	if filter.MaxPrice > 0 && filter.MaxPrice > filter.MinPrice {
		whereClause += fmt.Sprintf(" AND p.product_price <= $%d", argID)
		args = append(args, filter.MaxPrice)
		argID++
	}

	// Determine Sort
	sortClause := "ORDER BY p.created_at DESC"
	if filter.SortOrder == "lowToHigh" {
		sortClause = "ORDER BY p.product_price ASC"
	} else if filter.SortOrder == "highToLow" {
		sortClause = "ORDER BY p.product_price DESC"
	}

	// 1. Get total count
	var totalCount int
	countQuery := fmt.Sprintf("SELECT COUNT(*) FROM products p %s", whereClause)
	err := r.db.QueryRow(ctx, countQuery, args...).Scan(&totalCount)
	if err != nil {
		return nil, 0, err
	}

	offset := (page - 1) * limit

	// 2. Fetch paginated products with images using CTE
	query := fmt.Sprintf(`
        WITH paginated_products AS (
            SELECT p.id, p.user_id, p.product_name, p.product_desc, p.product_price, p.category, p.brand, p.created_at, p.updated_at
            FROM products p
            %s
            %s
            LIMIT $%d OFFSET $%d
        )
        SELECT pp.id, pp.user_id, pp.product_name, pp.product_desc, pp.product_price, pp.category, pp.brand, pp.created_at, pp.updated_at,
               pi.id, pi.url, pi.public_id
        FROM paginated_products pp
        LEFT JOIN product_images pi ON pi.product_id = pp.id
        %s
    `, whereClause, sortClause, argID, argID+1, strings.ReplaceAll(sortClause, "p.", "pp."))

	args = append(args, limit, offset)

	rows, err := r.db.Query(ctx, query, args...)
	if err != nil {
		return nil, 0, err
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
			return nil, 0, err
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

	return orderedProducts, totalCount, nil
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
