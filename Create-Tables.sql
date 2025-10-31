Create Table Products(
    ProductID INT PRIMARY KEY,
    id INT,
    CONSTRAINT user_product FOREIGN KEY(id) REFERENCES Users(id)
    ProductName VARCHAR(50) NOT NULL,
    ProductDescription VARCHAR(500),
    Brand VARCHAR(50) NOT NULL,
    Model VARCHAR(50) NOT NULL,
    SkiLength DECIMAL(3,2),
    SkiWidth DECIMAL(3,2),
    Price DECIMAL(5,2),

);

Create Table Services(
    ServiceID INT PRIMARY KEY,
    id INT,
    CONSSTRAINT user_services FOREIGN KEY(id) REFERENCES Users(id)
    ServiceName VARCHAR(50) NOT NULL,
    ServiceDescription VARCHAR(500),
    Price DECIMAL(5,2)
)