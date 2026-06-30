-- =============================================================================
-- SECTION 1: USERS
-- =============================================================================

CREATE TABLE users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    profile_pic TEXT,
    profile_pic_public_id TEXT,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT DEFAULT 'user',
    token TEXT,
    is_verified BOOLEAN DEFAULT FALSE,
    is_logged_in BOOLEAN DEFAULT FALSE,
    otp TEXT,
    otp_expiry TIMESTAMP,
    address TEXT,
    city TEXT,
    zip_code TEXT,
    phone_no TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
-- =============================================================================
-- SECTION 2: PRODUCTS
-- =============================================================================

CREATE TABLE products (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    product_name VARCHAR(255) NOT NULL,

    product_desc TEXT NOT NULL,

    product_price NUMERIC(10,2) NOT NULL,

    category VARCHAR(100),

    brand VARCHAR(100),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE product_images (

    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

    product_id UUID NOT NULL
        REFERENCES products(id)
        ON DELETE CASCADE,

    url TEXT NOT NULL,

    public_id TEXT NOT NULL
);

-- =============================================================================
-- SECTION 3: ORDERS
-- =============================================================================

CREATE TABLE orders (

    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

    user_id UUID NOT NULL
        REFERENCES users(id)
        ON DELETE CASCADE,

    amount NUMERIC(10,2) NOT NULL,

    tax NUMERIC(10,2) NOT NULL,

    shipping NUMERIC(10,2) NOT NULL,

    currency VARCHAR(10) DEFAULT 'INR',

    status VARCHAR(20) DEFAULT 'Pending',

    razorpay_order_id TEXT,

    razorpay_payment_id TEXT,

    razorpay_signature TEXT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE order_items (

    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

    order_id UUID NOT NULL
        REFERENCES orders(id)
        ON DELETE CASCADE,

    product_id UUID NOT NULL
        REFERENCES products(id)
        ON DELETE CASCADE,

    quantity INTEGER NOT NULL CHECK(quantity > 0)
);

-- =============================================================================
-- SECTION 4: CARTS
-- =============================================================================

CREATE TABLE carts (

    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

    user_id UUID NOT NULL UNIQUE
        REFERENCES users(id)
        ON DELETE CASCADE,

    total_price NUMERIC(10,2) DEFAULT 0,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE cart_items (

    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

    cart_id UUID NOT NULL
        REFERENCES carts(id)
        ON DELETE CASCADE,

    product_id UUID NOT NULL
        REFERENCES products(id)
        ON DELETE CASCADE,

    quantity INTEGER NOT NULL DEFAULT 1
        CHECK(quantity > 0),

    price NUMERIC(10,2) NOT NULL
);
-- =============================================================================
-- SECTION 5: SESSIONS
-- =============================================================================

CREATE TABLE sessions (

    id  UUID DEFAULT gen_random_uuid() PRIMARY KEY,

    user_id UUID NOT NULL
        REFERENCES users(id)
        ON DELETE CASCADE,

    refresh_token TEXT NOT NULL UNIQUE,

    is_active BOOLEAN DEFAULT TRUE,

    expires_at TIMESTAMP NOT NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);