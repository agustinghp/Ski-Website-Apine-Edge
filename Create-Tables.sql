CREATE TABLE users (
    id INT SERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    location VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    -- Later add fields in user to add specifications for their skiis --
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