-- 1. Users Table (Must be created first)
-- Stores all user account information
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    profile_image VARCHAR(255),
    password_hash VARCHAR(255) NOT NULL,
    -- All the location Information
    location VARCHAR(100),
    latitude DECIMAL(9,6),
    longitude DECIMAL(9,6),
    -- When the user was created
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Products Table (Depends on users)
-- Stores all ski/gear listings
CREATE TABLE Products (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    productName VARCHAR(50) NOT NULL,
    productDescription TEXT,
    brand VARCHAR(50) NOT NULL,
    model VARCHAR(50),
    productType VARCHAR(20) DEFAULT 'ski' CHECK (productType IN ('ski', 'snowboard', 'helmet', 'boots', 'poles', 'goggles', 'gloves', 'jackets', 'pants', 'other')),
    -- Ski dimensions (required for skis)
    skiLength DECIMAL(4,1),
    skiWidth DECIMAL(4,1),
    -- Snowboard dimensions (required for snowboards)
    snowboardLength DECIMAL(4,1),
    snowboardWidth DECIMAL(4,1),
    -- Helmet size (required for helmets) - in cm
    helmetSize DECIMAL(4,1),
    -- Boot fields (required for boots)
    bootType VARCHAR(20) CHECK (bootType IN ('ski', 'snowboard')),
    bootSize DECIMAL(4,1), -- US/EU size
    -- Poles length (required for poles) - in cm
    polesLength DECIMAL(4,1),
    -- Clothing size (for goggles, gloves, jackets, pants) - size like S, M, L, XL, etc.
    clothingSize VARCHAR(10),
    price DECIMAL(7,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Services Table (Depends on users)
-- Stores all service listings (tuning, lessons, etc.)
CREATE TABLE Services (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    serviceName VARCHAR(50) NOT NULL,
    serviceDescription TEXT,
    price DECIMAL(7,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Connections Table (Depends on users)
-- Stores the 'friend' or 'connection' status between two users
CREATE TABLE connections (
    id SERIAL PRIMARY KEY,
    requester_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    receiver_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    initiated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined')),
    UNIQUE (requester_id, receiver_id)
);

-- 5. Messages Table (Depends on users)
-- Stores all private chat messages between two users
CREATE TABLE messages (
    id SERIAL PRIMARY KEY,
    sender_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    receiver_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    message_text TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(10) NOT NULL DEFAULT 'sent' CHECK (status IN ('sent', 'read'))
);

-- 6. Seller Reviews Table (Depends on users)
-- Stores reviews one user leaves for another (as a seller)
CREATE TABLE reviewsSellers (
    id SERIAL PRIMARY KEY,
    reviewer_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    reviewee_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    rating INT CHECK (rating BETWEEN 1 AND 5) NOT NULL,
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (reviewer_id, reviewee_id)
);

-- 7. Service Reviews Table (Depends on users and services)
-- Stores reviews for a specific service listing
CREATE TABLE reviewsServices (
    id SERIAL PRIMARY KEY,
    reviewer_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    service_id INT NOT NULL REFERENCES Services(id) ON DELETE CASCADE,
    rating INT CHECK (rating BETWEEN 1 AND 5) NOT NULL,
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (reviewer_id, service_id)
);

CREATE TABLE product_images (
    id SERIAL PRIMARY KEY,
    product_id INTEGER REFERENCES Products(id) ON DELETE CASCADE,
    image_path VARCHAR(255) NOT NULL,
    is_primary BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE service_images (
    id SERIAL PRIMARY KEY,
    service_id INTEGER REFERENCES Services(id) ON DELETE CASCADE,
    image_path VARCHAR(255) NOT NULL,
    is_primary BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
