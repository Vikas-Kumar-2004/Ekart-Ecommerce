-- =============================================================================
-- SECTION: REVIEWS
-- =============================================================================

CREATE TABLE reviews (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    
    product_id UUID NOT NULL
        REFERENCES products(id)
        ON DELETE CASCADE,
        
    user_id UUID NOT NULL
        REFERENCES users(id)
        ON DELETE CASCADE,
        
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    
    comment TEXT NOT NULL,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Ensure a user can only leave one review per product
    CONSTRAINT unique_user_product_review UNIQUE (product_id, user_id)
);
