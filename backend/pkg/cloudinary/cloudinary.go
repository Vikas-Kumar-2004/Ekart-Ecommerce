package cloudinary

import (
	"bytes"
	"context"
	"fmt"

	"github.com/cloudinary/cloudinary-go/v2"
	"github.com/cloudinary/cloudinary-go/v2/api/uploader"
)

type Client struct {
	cld *cloudinary.Cloudinary
}

func NewClient(cloudName, apiKey, apiSecret string) (*Client, error) {
	cld, err := cloudinary.NewFromParams(cloudName, apiKey, apiSecret)
	if err != nil {
		return nil, err
	}
	return &Client{cld: cld}, nil
}

type UploadResult struct {
	SecureURL string
	PublicID  string
}

// Upload — JS ka cloudinary.uploader.upload(fileUri, { folder: "..." })
func (c *Client) Upload(ctx context.Context, fileBytes []byte, folder string) (*UploadResult, error) {
	resp, err := c.cld.Upload.Upload(ctx, bytes.NewReader(fileBytes), uploader.UploadParams{
		Folder: folder,
	})
	if err != nil {
		return nil, fmt.Errorf("cloudinary upload failed: %w", err)
	}
	return &UploadResult{
		SecureURL: resp.SecureURL,
		PublicID:  resp.PublicID,
	}, nil
}

// Destroy — JS ka cloudinary.uploader.destroy(publicId)
func (c *Client) Destroy(ctx context.Context, publicID string) error {
	_, err := c.cld.Upload.Destroy(ctx, uploader.DestroyParams{
		PublicID: publicID,
	})
	return err
}
