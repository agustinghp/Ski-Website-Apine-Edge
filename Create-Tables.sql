CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    location VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    -- Later add fields in user to add specifications for their skiis --
);


CREATE TABLE Services (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    serviceName VARCHAR(50) NOT NULL,
    serviceDescription TEXT,
    price DECIMAL(7,2)
);

CREATE TABLE Products (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    productName VARCHAR(50) NOT NULL,
    productDescription TEXT,
    brand VARCHAR(50) NOT NULL,
    model VARCHAR(50) NOT NULL,
    skiLength DECIMAL(4,1),
    skiWidth DECIMAL(4,1),
    price DECIMAL(7,2)
);

CREATE TABLE connections (
    id SERIAL PRIMARY KEY,
    requester_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    receiver_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    initiated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined')),
    UNIQUE (requester_id, receiver_id)
);



CREATE TABLE reviewsServices (
    id SERIAL PRIMARY KEY,
    reviewer_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    service_id INT NOT NULL REFERENCES services(id) ON DELETE CASCADE,
    rating INT CHECK (rating BETWEEN 1 AND 5) NOT NULL,
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (reviewer_id, service_id)
);


CREATE TABLE reviewsSellers (
    id SERIAL PRIMARY KEY,
    reviewer_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    reviewee_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    rating INT CHECK (rating BETWEEN 1 AND 5) NOT NULL,
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (reviewer_id, reviewee_id)
);
