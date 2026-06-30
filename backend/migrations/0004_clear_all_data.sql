-- +migrate Up
TRUNCATE TABLE
    product_images,
    order_items,
    cart_items,
    sessions,
    orders,
    carts,
    products,
    users
RESTART IDENTITY CASCADE;

-- +migrate Down
-- Data deletion cannot be rolled back.