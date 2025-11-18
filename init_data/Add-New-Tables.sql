-- For user profile pictures
ALTER TABLE users ADD COLUMN profile_image VARCHAR(255);

-- For product images (supports multiple images)
CREATE TABLE product_images (
    id SERIAL PRIMARY KEY,
    product_id INTEGER REFERENCES Products(id) ON DELETE CASCADE,
    image_path VARCHAR(255) NOT NULL,
    is_primary BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- For service images (optional, if you want service images too)
CREATE TABLE service_images (
    id SERIAL PRIMARY KEY,
    service_id INTEGER REFERENCES Services(id) ON DELETE CASCADE,
    image_path VARCHAR(255) NOT NULL,
    is_primary BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);