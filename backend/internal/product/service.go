package product

import (
	"context"
	"encoding/json"
	"errors"
	"go-ekart/pkg/cloudinary"
	"time"

	"github.com/google/uuid"
)

type service struct {
	repo Repository
	cdn  *cloudinary.Client // inject karo
}

var _ Service = &service{}

func NewService(repo Repository, cdn *cloudinary.Client) Service {
	return &service{repo: repo, cdn: cdn}
}

func (s *service) AddProduct(ctx context.Context, userID uuid.UUID, req *AddProductRequest, files [][]byte) (*ProductResponse, error) {
	// 1. validation
	if req.ProductName == "" || req.ProductDesc == "" || req.ProductPrice == 0 || req.Category == "" || req.Brand == "" {
		return nil, errors.New("all fields are required")
	}

	// 2. product banao
	p := &Product{
		ID:           uuid.New(),
		UserID:       userID,
		ProductName:  req.ProductName,
		ProductDesc:  req.ProductDesc,
		ProductPrice: req.ProductPrice,
		Category:     req.Category,
		Brand:        req.Brand,
		CreatedAt:    time.Now(),
		UpdatedAt:    time.Now(),
	}

	if err := s.repo.Create(ctx, p); err != nil {
		return nil, err
	}

	// 3. images upload — JS ka for loop over req.files
	var images []ProductImage
	for _, fileBytes := range files {
		result, err := s.cdn.Upload(ctx, fileBytes, "ekart_products")
		if err != nil {
			return nil, err
		}

		images = append(images, ProductImage{
			ID:        uuid.New(),
			ProductID: p.ID,
			URL:       result.SecureURL,
			PublicID:  result.PublicID,
		})
	}

	if len(images) > 0 {
		if err := s.repo.SaveImages(ctx, images); err != nil {
			return nil, err
		}
		p.Images = images
	}

	return toProductResponse(p), nil
}

func (s *service) GetAllProducts(ctx context.Context) ([]*ProductResponse, error) {
	products, err := s.repo.GetAll(ctx)
	if err != nil {
		return nil, err
	}

	// JS ka if (!products) — Go mein empty slice return karo, nil nahi
	if len(products) == 0 {
		return []*ProductResponse{}, nil
	}

	var response []*ProductResponse
	for _, p := range products {
		response = append(response, toProductResponse(p))
	}
	return response, nil
}

func (s *service) DeleteProduct(ctx context.Context, productID uuid.UUID) error {
	// 1. product dhundho
	p, err := s.repo.GetByID(ctx, productID)
	if err != nil || p == nil {
		return errors.New("product not found")
	}

	// 2. cloudinary se images delete karo — JS ka for loop over productImg
	images, err := s.repo.GetImages(ctx, productID)
	if err != nil {
		return err
	}

	for _, img := range images {
		if img.PublicID != "" {
			if err := s.cdn.Destroy(ctx, img.PublicID); err != nil {
				return err
			}
		}
	}

	// 3. DB se delete karo
	return s.repo.Delete(ctx, productID)
}

func (s *service) UpdateProduct(ctx context.Context, productID uuid.UUID, req *UpdateProductRequest, files [][]byte) (*ProductResponse, error) {
	// 1. product dhundho
	p, err := s.repo.GetByID(ctx, productID)
	if err != nil || p == nil {
		return nil, errors.New("product not found")
	}

	// 2. existing images handle karo — JS ka JSON.parse(existingImages)
	existingImages, err := s.repo.GetImages(ctx, productID)
	if err != nil {
		return nil, err
	}

	var keepImages []ProductImage
	var removedImages []ProductImage

	if req.ExistingImages != "" {
		// frontend ne jo public_ids bheje hain unhe parse karo
		var keepIDs []string
		if err := json.Unmarshal([]byte(req.ExistingImages), &keepIDs); err != nil {
			return nil, errors.New("invalid existingImages format")
		}

		// JS ka filter — keepIDs mein jo hain wo rakho
		keepMap := make(map[string]bool)
		for _, id := range keepIDs {
			keepMap[id] = true
		}

		for _, img := range existingImages {
			if keepMap[img.PublicID] {
				keepImages = append(keepImages, img)
			} else {
				removedImages = append(removedImages, img) // ye delete honge
			}
		}
	} else {
		keepImages = existingImages // sab rakho agar kuch nahi bheja
	}

	// 3. removed images cloudinary + DB se delete karo
	var removedPublicIDs []string
	for _, img := range removedImages {
		if img.PublicID != "" {
			if err := s.cdn.Destroy(ctx, img.PublicID); err != nil {
				return nil, err
			}
			removedPublicIDs = append(removedPublicIDs, img.PublicID)
		}
	}
	if len(removedPublicIDs) > 0 {
		if err := s.repo.DeleteImages(ctx, productID, removedPublicIDs); err != nil {
			return nil, err
		}
	}

	// 4. nayi images upload karo — JS ka req.files loop
	var newImages []ProductImage
	for _, fileBytes := range files {
		result, err := s.cdn.Upload(ctx, fileBytes, "mern_products")
		if err != nil {
			return nil, err
		}
		newImages = append(newImages, ProductImage{
			ID:        uuid.New(),
			ProductID: productID,
			URL:       result.SecureURL,
			PublicID:  result.PublicID,
		})
	}
	if len(newImages) > 0 {
		if err := s.repo.SaveImages(ctx, newImages); err != nil {
			return nil, err
		}
	}

	// 5. product fields update — JS ka "productName || product.productName"
	if req.ProductName != "" {
		p.ProductName = req.ProductName
	}
	if req.ProductDesc != "" {
		p.ProductDesc = req.ProductDesc
	}
	if req.ProductPrice != 0 {
		p.ProductPrice = req.ProductPrice
	}
	if req.Category != "" {
		p.Category = req.Category
	}
	if req.Brand != "" {
		p.Brand = req.Brand
	}
	p.Images = append(keepImages, newImages...)
	p.UpdatedAt = time.Now()

	if err := s.repo.UpdateProduct(ctx, p); err != nil {
		return nil, err
	}

	return toProductResponse(p), nil
}

// ── Helper ────────────────────────────────────────────────────────────────────
func toProductResponse(p *Product) *ProductResponse {
	var imgs []ProductImageResponse
	for _, img := range p.Images {
		imgs = append(imgs, ProductImageResponse{URL: img.URL, PublicID: img.PublicID})
	}
	return &ProductResponse{
		ID:           p.ID,
		ProductName:  p.ProductName,
		ProductDesc:  p.ProductDesc,
		ProductPrice: p.ProductPrice,
		Category:     p.Category,
		Brand:        p.Brand,
		Images:       imgs,
	}
}
