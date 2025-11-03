CREATE TABLE Products (
    ProductID SERIAL PRIMARY KEY,
    id INT NOT NULL,
    CONSTRAINT user_product FOREIGN KEY (id) REFERENCES Users(id),
    ProductName VARCHAR(50) NOT NULL,
    ProductDescription VARCHAR(500),
    Brand VARCHAR(50) NOT NULL,
    Model VARCHAR(50) NOT NULL,
    SkiLength DECIMAL(4,1),
    SkiWidth DECIMAL(4,1),
    Price DECIMAL(7,2)
);

CREATE TABLE Services (
    ServiceID SERIAL PRIMARY KEY,
    id INT NOT NULL,
    CONSTRAINT user_services FOREIGN KEY (id) REFERENCES Users(id),
    ServiceName VARCHAR(50) NOT NULL,
    ServiceDescription VARCHAR(500),
    Price DECIMAL(7,2)
);
