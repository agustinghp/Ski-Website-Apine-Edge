-- =====================================================
-- Populate Database with Test Data
-- =====================================================

-- Clear existing data (optional - uncomment if needed)
-- TRUNCATE TABLE reviewsServices, reviewsSellers, connections, Products, Services, users RESTART IDENTITY CASCADE;

-- =====================================================
-- Insert Test Users
-- =====================================================
-- Password for all test users is: "1234"
-- Hashed using bcrypt with 10 rounds

INSERT INTO users (username, email, password_hash, location, latitude, longitude) VALUES
('john_powder', 'john@example.com', '$2b$10$l5BQZG1uLon46wN.HJzF7u1cIbp/AJlyfzlJ9l2iSDR.tmKD1XeVy', 'Aspen, CO', 39.1911, -106.8175),
('sarah_slopes', 'sarah@example.com', '$2b$10$l5BQZG1uLon46wN.HJzF7u1cIbp/AJlyfzlJ9l2iSDR.tmKD1XeVy', 'Park City, UT', 40.6461, -111.4980),
('mike_mountain', 'mike@example.com', '$2b$10$l5BQZG1uLon46wN.HJzF7u1cIbp/AJlyfzlJ9l2iSDR.tmKD1XeVy', 'Breckenridge, CO', 39.4817, -106.0384),
('emma_edge', 'emma@example.com', '$2b$10$l5BQZG1uLon46wN.HJzF7u1cIbp/AJlyfzlJ9l2iSDR.tmKD1XeVy', 'Jackson Hole, WY', 43.4799, -110.7624),
('alex_alpine', 'alex@example.com', '$2b$10$l5BQZG1uLon46wN.HJzF7u1cIbp/AJlyfzlJ9l2iSDR.tmKD1XeVy', 'Vail, CO', 39.6403, -106.3742),
('lisa_lodge', 'lisa@example.com', '$2b$10$l5BQZG1uLon46wN.HJzF7u1cIbp/AJlyfzlJ9l2iSDR.tmKD1XeVy', 'Telluride, CO', 37.9375, -107.8123),
('dave_downhill', 'dave@example.com', '$2b$10$l5BQZG1uLon46wN.HJzF7u1cIbp/AJlyfzlJ9l2iSDR.tmKD1XeVy', 'Steamboat Springs, CO', 40.4850, -106.8317),
('rachel_run', 'rachel@example.com', '$2b$10$l5BQZG1uLon46wN.HJzF7u1cIbp/AJlyfzlJ9l2iSDR.tmKD1XeVy', 'Sun Valley, ID', 43.6971, -114.3517),
('tom_trail', 'tom@example.com', '$2b$10$l5BQZG1uLon46wN.HJzF7u1cIbp/AJlyfzlJ9l2iSDR.tmKD1XeVy', 'Mammoth Lakes, CA', 37.6308, -119.0326),
('nina_nordic', 'nina@example.com', '$2b$10$l5BQZG1uLon46wN.HJzF7u1cIbp/AJlyfzlJ9l2iSDR.tmKD1XeVy', 'Boulder, CO', 40.0150, -105.2705),
('chris_carve', 'chris@example.com', '$2b$10$l5BQZG1uLon46wN.HJzF7u1cIbp/AJlyfzlJ9l2iSDR.tmKD1XeVy', 'Whistler, BC', 50.1163, -122.9574),
('jessica_jump', 'jessica@example.com', '$2b$10$l5BQZG1uLon46wN.HJzF7u1cIbp/AJlyfzlJ9l2iSDR.tmKD1XeVy', 'Lake Tahoe, CA', 39.0968, -120.0324),
('ryan_ride', 'ryan@example.com', '$2b$10$l5BQZG1uLon46wN.HJzF7u1cIbp/AJlyfzlJ9l2iSDR.tmKD1XeVy', 'Big Sky, MT', 45.2847, -111.3703),
('maya_mogul', 'maya@example.com', '$2b$10$l5BQZG1uLon46wN.HJzF7u1cIbp/AJlyfzlJ9l2iSDR.tmKD1XeVy', 'Stowe, VT', 44.4654, -72.6874),
('kevin_kick', 'kevin@example.com', '$2b$10$l5BQZG1uLon46wN.HJzF7u1cIbp/AJlyfzlJ9l2iSDR.tmKD1XeVy', 'Taos, NM', 36.4072, -105.5731),
('olivia_offpiste', 'olivia@example.com', '$2b$10$l5BQZG1uLon46wN.HJzF7u1cIbp/AJlyfzlJ9l2iSDR.tmKD1XeVy', 'Alta, UT', 40.5885, -111.6377),
('brian_bindings', 'brian@example.com', '$2b$10$l5BQZG1uLon46wN.HJzF7u1cIbp/AJlyfzlJ9l2iSDR.tmKD1XeVy', 'Squaw Valley, CA', 39.1967, -120.2358),
('sophia_snow', 'sophia@example.com', '$2b$10$l5BQZG1uLon46wN.HJzF7u1cIbp/AJlyfzlJ9l2iSDR.tmKD1XeVy', 'Deer Valley, UT', 40.6372, -111.4780),
('daniel_drop', 'daniel@example.com', '$2b$10$l5BQZG1uLon46wN.HJzF7u1cIbp/AJlyfzlJ9l2iSDR.tmKD1XeVy', 'Snowbird, UT', 40.5830, -111.6538),
('lily_lift', 'lily@example.com', '$2b$10$l5BQZG1uLon46wN.HJzF7u1cIbp/AJlyfzlJ9l2iSDR.tmKD1XeVy', 'Killington, VT', 43.6776, -72.7795),
('james_jump', 'james@example.com', '$2b$10$l5BQZG1uLon46wN.HJzF7u1cIbp/AJlyfzlJ9l2iSDR.tmKD1XeVy', 'Heavenly, CA', 38.9399, -119.9772),
('hannah_hill', 'hannah@example.com', '$2b$10$l5BQZG1uLon46wN.HJzF7u1cIbp/AJlyfzlJ9l2iSDR.tmKD1XeVy', 'Crested Butte, CO', 38.8997, -106.9658),
('william_wax', 'william@example.com', '$2b$10$l5BQZG1uLon46wN.HJzF7u1cIbp/AJlyfzlJ9l2iSDR.tmKD1XeVy', 'Keystone, CO', 39.5792, -105.9347),
('ava_avalanche', 'ava@example.com', '$2b$10$l5BQZG1uLon46wN.HJzF7u1cIbp/AJlyfzlJ9l2iSDR.tmKD1XeVy', 'Arapahoe Basin, CO', 39.6425, -105.8719),
('ethan_edge', 'ethan@example.com', '$2b$10$l5BQZG1uLon46wN.HJzF7u1cIbp/AJlyfzlJ9l2iSDR.tmKD1XeVy', 'Copper Mountain, CO', 39.5022, -106.1497),
('isabella_ice', 'isabella@example.com', '$2b$10$l5BQZG1uLon46wN.HJzF7u1cIbp/AJlyfzlJ9l2iSDR.tmKD1XeVy', 'Winter Park, CO', 39.8864, -105.7625),
('noah_nordic', 'noah@example.com', '$2b$10$l5BQZG1uLon46wN.HJzF7u1cIbp/AJlyfzlJ9l2iSDR.tmKD1XeVy', 'Beaver Creek, CO', 39.6042, -106.5165),
('mia_mountain', 'mia@example.com', '$2b$10$l5BQZG1uLon46wN.HJzF7u1cIbp/AJlyfzlJ9l2iSDR.tmKD1XeVy', 'Snowmass, CO', 39.2130, -106.9378),
('lucas_lift', 'lucas@example.com', '$2b$10$l5BQZG1uLon46wN.HJzF7u1cIbp/AJlyfzlJ9l2iSDR.tmKD1XeVy', 'Sugarloaf, ME', 45.0317, -70.3131),
('amelia_alpine', 'amelia@example.com', '$2b$10$l5BQZG1uLon46wN.HJzF7u1cIbp/AJlyfzlJ9l2iSDR.tmKD1XeVy', 'Mount Bachelor, OR', 44.0029, -121.6783),
('henry_hill', 'henry@example.com', '$2b$10$l5BQZG1uLon46wN.HJzF7u1cIbp/AJlyfzlJ9l2iSDR.tmKD1XeVy', 'Sun Valley, ID', 43.6971, -114.3517),
('charlotte_carve', 'charlotte@example.com', '$2b$10$l5BQZG1uLon46wN.HJzF7u1cIbp/AJlyfzlJ9l2iSDR.tmKD1XeVy', 'Park City, UT', 40.6461, -111.4980),
('benjamin_bindings', 'benjamin@example.com', '$2b$10$l5BQZG1uLon46wN.HJzF7u1cIbp/AJlyfzlJ9l2iSDR.tmKD1XeVy', 'Aspen, CO', 39.1911, -106.8175),
('harper_hill', 'harper@example.com', '$2b$10$l5BQZG1uLon46wN.HJzF7u1cIbp/AJlyfzlJ9l2iSDR.tmKD1XeVy', 'Breckenridge, CO', 39.4817, -106.0384),
('mason_mogul', 'mason@example.com', '$2b$10$l5BQZG1uLon46wN.HJzF7u1cIbp/AJlyfzlJ9l2iSDR.tmKD1XeVy', 'Vail, CO', 39.6403, -106.3742),
('ella_edge', 'ella@example.com', '$2b$10$l5BQZG1uLon46wN.HJzF7u1cIbp/AJlyfzlJ9l2iSDR.tmKD1XeVy', 'Jackson Hole, WY', 43.4799, -110.7624),
('jackson_jump', 'jackson@example.com', '$2b$10$l5BQZG1uLon46wN.HJzF7u1cIbp/AJlyfzlJ9l2iSDR.tmKD1XeVy', 'Telluride, CO', 37.9375, -107.8123);


-- =====================================================
-- Insert Test Products - SKIS
-- =====================================================

INSERT INTO Products (user_id, productName, productDescription, brand, model, productType, skiLength, skiWidth, price) VALUES
-- User 1's products
(1, 'All-Mountain Carver', 'Perfect for groomed runs and powder. Excellent condition, used one season.', 'Rossignol', 'Experience 88', 'ski', 177.0, 88.0, 425.00),
(1, 'Backcountry Touring Skis', 'Lightweight touring skis with AT bindings included. Great for uphill adventures.', 'Black Diamond', 'Helio 105', 'ski', 184.0, 105.0, 650.00),
(1, 'Racing Slalom Skis', 'Competition-level slalom skis. Fast edge-to-edge. Advanced skiers only.', 'Atomic', 'Redster G9', 'ski', 165.0, 65.0, 875.00),

-- User 2's products
(2, 'Women''s Powder Skis', 'Wide skis designed for deep snow. Barely used, like new condition.', 'K2', 'Mindbender 106', 'ski', 170.0, 106.0, 550.00),
(2, 'Beginner Friendly Skis', 'Great for learning. Forgiving and stable. Includes bindings.', 'Salomon', 'QST Lux 92', 'ski', 163.0, 92.0, 325.00),
(2, 'Freestyle Park Skis', 'Twin-tip design for park and pipe. Durable construction, some cosmetic wear.', 'Armada', 'ARV 96', 'ski', 180.0, 96.0, 399.00),

-- User 3's products
(3, 'Powder Floaters', 'Ultra-wide skis that float on the deepest powder days. Like surfing on snow!', 'Line', 'Sick Day 114', 'ski', 186.0, 114.0, 625.00),
(3, 'All-Mountain Women''s', 'Versatile women''s skis for all conditions. Excellent control and stability.', 'Volkl', 'Flair 81', 'ski', 168.0, 81.0, 475.00),
(3, 'Big Mountain Charger', 'Stiff and stable for high speeds on steep terrain. Expert level skis.', 'Nordica', 'Enforcer 100', 'ski', 191.0, 100.0, 699.00),

-- User 4's products
(4, 'Lightweight Touring', 'Carbon construction for uphill efficiency. Pin bindings ready.', 'Dynafit', 'Beast 108', 'ski', 181.0, 108.0, 799.00),
(4, 'Carving Specialists', 'Precision carving on hardpack. Race-inspired construction.', 'Head', 'Supershape i.Speed', 'ski', 170.0, 70.0, 525.00),
(4, 'Mogul Master Skis', 'Short and nimble for bump skiing. Soft flex for quick turns.', 'K2', 'Mindbender 85', 'ski', 169.0, 85.0, 449.00),

-- User 5's products
(5, 'Powder Paradise', 'Rockered tips for effortless float. Perfect for Colorado powder days.', 'Blizzard', 'Rustler 11', 'ski', 188.0, 110.0, 675.00),
(5, 'Junior Race Skis', 'High-performance junior racing skis. Great for competitive youth skiers.', 'Fischer', 'RC One Jr', 'ski', 150.0, 63.0, 299.00),
(5, 'Freeride Destroyer', 'Aggressive all-mountain freeride skis. Built to charge hard.', 'DPS', 'Cassiar 95', 'ski', 184.0, 95.0, 825.00),

-- User 6's products
(6, 'Beginner Package', 'Complete beginner setup with skis, bindings, and poles. Ready to go!', 'Rossignol', 'Experience 74', 'ski', 160.0, 74.0, 275.00),
(6, 'Park & Pipe Twins', 'Symmetrical twin tips for switch riding. Butter-soft flex.', 'Moment', 'Deathwish', 'ski', 178.0, 100.0, 525.00),
(6, 'Women''s Carving Elite', 'High-performance women''s carving skis with amazing edge grip.', 'Atomic', 'Cloud Q12', 'ski', 165.0, 78.0, 599.00),

-- User 7's products
(7, 'Touring Ultralight', 'Incredibly light for long tours. Sacrifices nothing on the downhill.', 'Movement', 'Alp Tracks 89', 'ski', 176.0, 89.0, 749.00),
(7, 'All-Mountain Cruiser', 'Smooth and stable all-mountain skis. Perfect daily driver.', 'Salomon', 'QST 98', 'ski', 180.0, 98.0, 499.00),
(7, 'Race GS Skis', 'Giant slalom racing skis. Stiff and responsive for high-speed turns.', 'Fischer', 'RC4 The Curv GT', 'ski', 183.0, 68.0, 950.00),

-- User 8's products
(8, 'Powder Specialist', 'Ultra-wide powder skis with rocker profile. Float like a cloud!', 'Moment', 'Wildcat 116', 'ski', 190.0, 116.0, 750.00),
(8, 'All-Mountain Explorer', 'Versatile skis for exploring the whole mountain. Great for intermediate skiers.', 'Volkl', 'Mantra M6', 'ski', 177.0, 96.0, 625.00),
(8, 'Freestyle All-Mountain', 'Twin tips with all-mountain capability. Perfect for playful skiing.', 'Line', 'Sir Francis Bacon', 'ski', 184.0, 104.0, 575.00),

-- User 9's products
(9, 'Backcountry Beast', 'Heavy-duty touring skis for serious backcountry adventures.', 'Black Diamond', 'Helio 116', 'ski', 189.0, 116.0, 850.00),
(9, 'Carving Machine', 'Precision carving skis with excellent edge hold on hardpack.', 'Head', 'Supershape e.Rally', 'ski', 170.0, 76.0, 550.00),
(9, 'Women''s All-Mountain', 'Perfect balance of stability and playfulness for women skiers.', 'Blizzard', 'Black Pearl 88', 'ski', 166.0, 88.0, 525.00),

-- User 10's products
(10, 'Racing Slalom', 'World Cup level slalom skis. Extremely responsive and quick.', 'Atomic', 'Redster X9', 'ski', 165.0, 65.0, 1100.00),
(10, 'Powder Surfer', 'Ultra-wide powder skis with surf-like feel. Perfect for deep days.', 'DPS', 'Pagoda Tour 112', 'ski', 186.0, 112.0, 900.00),
(10, 'All-Mountain Daily', 'Reliable all-mountain skis that handle everything. Great condition.', 'Nordica', 'Navigator 85', 'ski', 175.0, 85.0, 425.00);


-- =====================================================
-- Insert Test Products - SNOWBOARDS
-- =====================================================

INSERT INTO Products (user_id, productName, productDescription, brand, model, productType, snowboardLength, snowboardWidth, price) VALUES
(11, 'Freestyle Park Board', 'Twin-tip design perfect for park and pipe. Durable and playful.', 'Burton', 'Custom Flying V', 'snowboard', 155.0, 25.2, 450.00),
(11, 'All-Mountain Charger', 'Stiff and stable for aggressive riding. Handles speed and steeps.', 'Lib Tech', 'Orca', 'snowboard', 153.0, 25.8, 550.00),
(12, 'Powder Board', 'Wide nose and tapered tail for effortless powder riding.', 'Jones', 'Hovercraft', 'snowboard', 158.0, 26.0, 600.00),
(12, 'Beginner Friendly Board', 'Soft flex and forgiving shape. Perfect for learning.', 'K2', 'Raygun Pop', 'snowboard', 152.0, 24.8, 275.00),
(13, 'Freeride Destroyer', 'Aggressive freeride board built for big mountain lines.', 'Capita', 'Mega Merc', 'snowboard', 160.0, 26.2, 675.00),
(13, 'Women''s All-Mountain', 'Versatile women''s board for all conditions. Great control.', 'GNU', 'B-Nice', 'snowboard', 149.0, 24.5, 425.00),
(14, 'Splitboard Touring', 'Convertible splitboard for backcountry adventures. Includes skins.', 'Weston', 'Backwoods', 'snowboard', 161.0, 26.0, 850.00),
(14, 'Park Specialist', 'Buttery soft flex for jibs and rails. Twin tip design.', 'Ride', 'Twinpig', 'snowboard', 148.0, 25.0, 399.00),
(15, 'Big Mountain Board', 'Stiff and directional for high-speed big mountain riding.', 'Never Summer', 'Proto Synthesis', 'snowboard', 162.0, 26.4, 725.00),
(15, 'Freestyle All-Mountain', 'Playful all-mountain board with twin tip design.', 'Salomon', 'Huck Knife', 'snowboard', 156.0, 25.5, 475.00),
(16, 'Powder Specialist', 'Ultra-wide powder board. Floats like a dream in deep snow.', 'Lib Tech', 'Skunk Ape', 'snowboard', 164.0, 27.0, 650.00),
(16, 'Carving Board', 'Hard-boot carving board. Precision turns on groomers.', 'Donek', 'Saber', 'snowboard', 163.0, 20.5, 800.00),
(17, 'Women''s Freestyle', 'Perfect women''s board for park and freestyle riding.', 'Burton', 'Feelgood', 'snowboard', 147.0, 24.3, 450.00),
(17, 'All-Mountain Explorer', 'Versatile board that handles everything the mountain throws at you.', 'Jones', 'Mountain Twin', 'snowboard', 157.0, 25.6, 575.00),
(18, 'Backcountry Split', 'Lightweight splitboard for touring. Excellent uphill efficiency.', 'K2', 'Splitboard', 'snowboard', 159.0, 25.8, 900.00),
(18, 'Park Jib Board', 'Ultra-soft flex for butters and jibs. Short and playful.', 'Ride', 'Warpig', 'snowboard', 143.0, 25.0, 350.00),
(19, 'Freeride Charger', 'Stiff directional board for aggressive freeriding.', 'Capita', 'BSOD', 'snowboard', 161.0, 26.0, 700.00),
(19, 'Beginner Package', 'Complete beginner setup with board and bindings.', 'Burton', 'LTR', 'snowboard', 150.0, 24.5, 325.00),
(20, 'Powder Surfer', 'Surf-inspired powder board. Wide and floaty.', 'Lib Tech', 'T.Rice Pro', 'snowboard', 158.0, 26.2, 625.00),
(20, 'All-Mountain Daily', 'Reliable daily driver. Handles everything well.', 'GNU', 'Rider''s Choice', 'snowboard', 155.0, 25.3, 500.00);


-- =====================================================
-- Insert Test Products - HELMETS
-- =====================================================

INSERT INTO Products (user_id, productName, productDescription, brand, model, productType, helmetSize, price) VALUES
(21, 'MIPS Safety Helmet', 'Multi-directional Impact Protection System. Lightweight and comfortable.', 'Smith', 'Vantage MIPS', 'helmet', 58.0, 180.00),
(21, 'Ventilated Race Helmet', 'Aerodynamic racing helmet with excellent ventilation.', 'Giro', 'Ledge MIPS', 'helmet', 59.0, 150.00),
(22, 'Women''s Fashion Helmet', 'Stylish women''s helmet with removable ear pads. Great colors!', 'POC', 'Obex Spin', 'helmet', 56.0, 200.00),
(22, 'Budget-Friendly Helmet', 'Affordable helmet with good protection. Perfect for beginners.', 'Outdoor Master', 'Ski Helmet', 'helmet', 58.0, 65.00),
(23, 'Premium MIPS Helmet', 'Top-of-the-line helmet with MIPS and audio compatibility.', 'Smith', 'Code MIPS', 'helmet', 60.0, 250.00),
(23, 'Youth Helmet', 'Lightweight helmet designed for kids. Adjustable fit system.', 'Giro', 'Ledge Jr', 'helmet', 54.0, 85.00),
(24, 'Backcountry Helmet', 'Lightweight helmet perfect for touring. Minimal weight.', 'POC', 'Obex Backcountry', 'helmet', 59.0, 220.00),
(24, 'Freestyle Helmet', 'Durable helmet built for park riding. Extra protection.', 'Anon', 'Logan', 'helmet', 58.0, 140.00),
(25, 'Ventilated All-Mountain', 'Well-ventilated helmet for warm days. Comfortable fit.', 'Smith', 'Mission', 'helmet', 57.0, 120.00),
(25, 'Audio-Ready Helmet', 'Helmet with built-in audio compatibility. Great for music lovers.', 'Giro', 'Range MIPS', 'helmet', 59.0, 190.00),
(26, 'Race-Specific Helmet', 'Aerodynamic helmet designed for racing. FIS approved.', 'Uvex', 'Race 8', 'helmet', 58.0, 280.00),
(26, 'Adjustable Fit Helmet', 'Helmet with dial-fit system for perfect comfort.', 'Bern', 'Watts', 'helmet', 57.0, 110.00),
(27, 'Women''s Premium Helmet', 'High-end women''s helmet with excellent fit and style.', 'POC', 'Obex Spin', 'helmet', 55.0, 240.00),
(27, 'Budget MIPS Helmet', 'Affordable MIPS protection. Great value for money.', 'Outdoor Master', 'Pro', 'helmet', 58.0, 75.00),
(28, 'Ultra-Light Helmet', 'Incredibly lightweight helmet. Barely notice you''re wearing it.', 'POC', 'Obex Backcountry', 'helmet', 59.0, 260.00),
(28, 'Freeride Helmet', 'Durable helmet for aggressive riding. Extra coverage.', 'Anon', 'Raider', 'helmet', 60.0, 170.00),
(29, 'Classic Style Helmet', 'Retro-styled helmet with modern safety features.', 'Bern', 'Baker', 'helmet', 58.0, 130.00),
(29, 'Youth MIPS Helmet', 'Kids helmet with MIPS protection. Adjustable sizing.', 'Giro', 'Ledge Jr MIPS', 'helmet', 52.0, 95.00),
(30, 'All-Season Helmet', 'Versatile helmet that works in all conditions.', 'Smith', 'Vantage', 'helmet', 57.0, 160.00),
(30, 'Premium Audio Helmet', 'High-end helmet with integrated audio system.', 'Giro', 'Range MIPS Audio', 'helmet', 59.0, 300.00);


-- =====================================================
-- Insert Test Products - BOOTS
-- =====================================================

INSERT INTO Products (user_id, productName, productDescription, brand, model, productType, bootType, bootSize, price) VALUES
(1, 'Performance Ski Boots', 'High-performance boots with customizable fit. Heat-moldable liner.', 'Lange', 'RX 130', 'boots', 'ski', 27.5, 550.00),
(2, 'Women''s Comfort Boots', 'Comfortable women''s boots with excellent fit. Great for all-day skiing.', 'Tecnica', 'Mach Sport 85', 'boots', 'ski', 25.0, 350.00),
(3, 'Racing Boots', 'Stiff racing boots for competitive skiers. Maximum performance.', 'Rossignol', 'Hero Elite 130', 'boots', 'ski', 28.0, 750.00),
(4, 'Backcountry Touring Boots', 'Lightweight touring boots with walk mode. Perfect for uphill.', 'Scarpa', 'Maestrale RS', 'boots', 'ski', 27.0, 650.00),
(5, 'Beginner Boots', 'Soft-flexing boots perfect for learning. Comfortable and forgiving.', 'Salomon', 'X Max 80', 'boots', 'ski', 26.5, 250.00),
(6, 'All-Mountain Boots', 'Versatile boots that handle everything. Great fit and performance.', 'Nordica', 'Speedmachine 110', 'boots', 'ski', 28.5, 500.00),
(7, 'Freestyle Boots', 'Flexible boots for park and pipe. Comfortable for jibbing.', 'Full Tilt', 'Classic', 'boots', 'ski', 27.0, 400.00),
(8, 'Women''s Performance Boots', 'High-performance women''s boots. Stiff and responsive.', 'Atomic', 'Hawx Ultra 110', 'boots', 'ski', 24.5, 600.00),
(9, 'Budget-Friendly Boots', 'Affordable boots with good performance. Great for intermediate skiers.', 'Dalbello', 'DS 90', 'boots', 'ski', 27.5, 300.00),
(10, 'Expert Boots', 'Stiff expert-level boots. Maximum power transmission.', 'Lange', 'RX 130 LV', 'boots', 'ski', 26.0, 700.00),
(11, 'Snowboard Boots - Freestyle', 'Soft-flexing boots perfect for park riding. Comfortable all day.', 'Burton', 'Ruler', 'boots', 'snowboard', 9.0, 200.00),
(12, 'Snowboard Boots - Stiff', 'Stiff boots for aggressive freeriding. Maximum response.', 'Thirty-Two', 'TM-2', 'boots', 'snowboard', 10.0, 350.00),
(13, 'Women''s Snowboard Boots', 'Comfortable women''s boots with great fit. Perfect for all-mountain.', 'Vans', 'Aura', 'boots', 'snowboard', 7.5, 250.00),
(14, 'Beginner Snowboard Boots', 'Soft boots perfect for learning. Easy to get in and out.', 'K2', 'Maysis', 'boots', 'snowboard', 9.5, 180.00),
(15, 'All-Mountain Snowboard Boots', 'Versatile boots that work everywhere. Good balance of flex.', 'DC', 'Judge', 'boots', 'snowboard', 10.5, 280.00),
(16, 'Freestyle Snowboard Boots', 'Ultra-soft boots for jibbing. Buttery feel.', 'Nike', 'Zoom Kaiju', 'boots', 'snowboard', 9.0, 320.00),
(17, 'Backcountry Snowboard Boots', 'Stiff boots for splitboarding. Excellent walk mode.', 'K2', 'Thraxis', 'boots', 'snowboard', 8.5, 400.00),
(18, 'Budget Snowboard Boots', 'Affordable boots with decent performance. Great for beginners.', 'Ride', 'Fuse', 'boots', 'snowboard', 10.0, 150.00),
(19, 'Premium Snowboard Boots', 'High-end boots with custom fit options. Maximum performance.', 'Burton', 'Ion', 'boots', 'snowboard', 9.5, 450.00),
(20, 'Racing Snowboard Boots', 'Stiff racing boots for alpine snowboarding. Hard-boot compatible.', 'Deeluxe', 'Track 700', 'boots', 'snowboard', 8.0, 500.00);


-- =====================================================
-- Insert Test Products - POLES
-- =====================================================

INSERT INTO Products (user_id, productName, productDescription, brand, model, productType, polesLength, price) VALUES
(21, 'Carbon Race Poles', 'Ultra-lightweight carbon poles. Perfect for racing.', 'Leki', 'Carbon Race', 'poles', 125.0, 180.00),
(22, 'Adjustable Touring Poles', 'Collapsible poles perfect for backcountry touring. Lightweight.', 'Black Diamond', 'Trail Pro', 'poles', 130.0, 120.00),
(23, 'Aluminum All-Mountain', 'Durable aluminum poles. Great for all-around use.', 'Rossignol', 'Heritage', 'poles', 115.0, 45.00),
(24, 'Women''s Lightweight Poles', 'Lightweight poles designed for women. Comfortable grips.', 'Leki', 'Ladies Carbon', 'poles', 110.0, 150.00),
(25, 'Budget-Friendly Poles', 'Affordable poles that get the job done. Good for beginners.', 'K2', 'Velocity', 'poles', 120.0, 35.00),
(26, 'Freestyle Poles', 'Durable poles built for park riding. Can take a beating.', 'Line', 'Pollard', 'poles', 125.0, 55.00),
(27, 'Racing Poles', 'Aerodynamic racing poles. Maximum speed.', 'Swix', 'Race', 'poles', 130.0, 200.00),
(28, 'Touring Poles', 'Lightweight touring poles with powder baskets.', 'Black Diamond', 'Trail Back', 'poles', 135.0, 100.00),
(29, 'All-Mountain Poles', 'Versatile poles for everyday skiing. Durable construction.', 'Salomon', 'S-Lab', 'poles', 120.0, 80.00),
(30, 'Youth Poles', 'Adjustable poles for growing kids. Great value.', 'Rossignol', 'Junior', 'poles', 100.0, 30.00),
(1, 'Premium Carbon Poles', 'Top-of-the-line carbon poles. Incredibly light.', 'Leki', 'Carbon SL', 'poles', 125.0, 250.00),
(2, 'Backcountry Poles', 'Collapsible poles with large powder baskets.', 'Black Diamond', 'Trail Ergo', 'poles', 130.0, 140.00),
(3, 'Budget Poles', 'Basic poles at a great price. Perfect for rental fleets.', 'K2', 'Basic', 'poles', 115.0, 25.00),
(4, 'Freeride Poles', 'Durable poles for aggressive skiing. Extra strong.', 'Line', 'Chronic', 'poles', 120.0, 65.00),
(5, 'Racing Poles Pro', 'Professional racing poles. Used by World Cup athletes.', 'Swix', 'Pro', 'poles', 128.0, 280.00),
(6, 'Women''s Poles', 'Comfortable women''s poles with ergonomic grips.', 'Leki', 'Ladies', 'poles', 112.0, 90.00),
(7, 'Touring Ultralight', 'Ultra-lightweight poles for long tours.', 'Black Diamond', 'Distance Carbon', 'poles', 135.0, 180.00),
(8, 'All-Mountain Daily', 'Reliable poles for everyday use. Great value.', 'Rossignol', 'Experience', 'poles', 118.0, 50.00),
(9, 'Freestyle Durable', 'Built to last in the park. Can handle crashes.', 'Line', 'Blend', 'poles', 125.0, 70.00),
(10, 'Premium Racing', 'High-end racing poles. Maximum performance.', 'Swix', 'Carbon Race', 'poles', 130.0, 320.00);


-- =====================================================
-- Insert Test Products - GOGGLES
-- =====================================================

INSERT INTO Products (user_id, productName, productDescription, brand, model, productType, clothingSize, price) VALUES
(11, 'Premium Goggles', 'High-end goggles with excellent clarity. Anti-fog technology.', 'Oakley', 'Flight Deck', 'goggles', 'One Size', 180.00),
(12, 'Budget Goggles', 'Affordable goggles with good visibility. Perfect for beginners.', 'Outdoor Master', 'Pro', 'goggles', 'One Size', 35.00),
(13, 'Photochromic Goggles', 'Lenses that adjust to light conditions automatically.', 'Smith', 'I/O Mag', 'goggles', 'One Size', 220.00),
(14, 'Women''s Fashion Goggles', 'Stylish women''s goggles with great colors and fit.', 'Anon', 'M4', 'goggles', 'One Size', 160.00),
(15, 'OTG Goggles', 'Over-the-glasses goggles. Perfect for prescription wearers.', 'Giro', 'Contour', 'goggles', 'One Size', 120.00),
(16, 'Racing Goggles', 'Aerodynamic racing goggles. Maximum visibility.', 'Oakley', 'Prizm', 'goggles', 'One Size', 200.00),
(17, 'Budget-Friendly Goggles', 'Great value goggles. Good performance at low price.', 'Outdoor Master', 'Classic', 'goggles', 'One Size', 25.00),
(18, 'Premium Photochromic', 'Top-of-the-line photochromic lenses. Crystal clear.', 'Smith', '4D Mag', 'goggles', 'One Size', 280.00),
(19, 'Freestyle Goggles', 'Durable goggles built for park riding. Great ventilation.', 'Anon', 'M3', 'goggles', 'One Size', 140.00),
(20, 'All-Mountain Goggles', 'Versatile goggles for all conditions. Excellent fit.', 'Giro', 'Vivid', 'goggles', 'One Size', 100.00),
(21, 'Youth Goggles', 'Goggles designed for kids. Comfortable and affordable.', 'Smith', 'Squad Jr', 'goggles', 'One Size', 60.00),
(22, 'Backcountry Goggles', 'Lightweight goggles perfect for touring.', 'Oakley', 'Line Miner', 'goggles', 'One Size', 170.00),
(23, 'Premium Anti-Fog', 'Advanced anti-fog technology. Never fog up again.', 'Smith', 'I/O 7', 'goggles', 'One Size', 240.00),
(24, 'Budget OTG', 'Affordable over-the-glasses option.', 'Outdoor Master', 'OTG', 'goggles', 'One Size', 40.00),
(25, 'Racing Pro Goggles', 'Professional racing goggles. Maximum performance.', 'Oakley', 'Prizm Race', 'goggles', 'One Size', 300.00),
(26, 'Women''s Premium', 'High-end women''s goggles with excellent clarity.', 'Anon', 'M4 Toric', 'goggles', 'One Size', 190.00),
(27, 'Freestyle Budget', 'Affordable goggles for park riding.', 'Giro', 'Blok', 'goggles', 'One Size', 55.00),
(28, 'Photochromic Premium', 'Best photochromic technology available.', 'Smith', 'I/O Mag XL', 'goggles', 'One Size', 320.00),
(29, 'All-Mountain Budget', 'Great value for all-mountain skiing.', 'Outdoor Master', 'Ultra', 'goggles', 'One Size', 45.00),
(30, 'Racing Elite', 'Elite racing goggles used by professionals.', 'Oakley', 'Prizm Elite', 'goggles', 'One Size', 350.00);


-- =====================================================
-- Insert Test Products - GLOVES
-- =====================================================

INSERT INTO Products (user_id, productName, productDescription, brand, model, productType, clothingSize, price) VALUES
(1, 'Premium Ski Gloves', 'Waterproof and insulated. Perfect for cold days.', 'Hestra', 'Fall Line', 'gloves', 'L', 180.00),
(2, 'Budget Gloves', 'Affordable gloves with decent warmth. Good for beginners.', 'Outdoor Research', 'Versaliner', 'gloves', 'M', 45.00),
(3, 'Women''s Gloves', 'Stylish women''s gloves with excellent fit.', 'Burton', 'Gore-Tex', 'gloves', 'S', 120.00),
(4, 'Racing Gloves', 'Aerodynamic racing gloves. Minimal bulk.', 'Swix', 'Race', 'gloves', 'M', 150.00),
(5, 'Freestyle Gloves', 'Durable gloves for park riding. Good dexterity.', 'Dakine', 'Titan', 'gloves', 'L', 80.00),
(6, 'Backcountry Gloves', 'Lightweight gloves perfect for touring.', 'Black Diamond', 'Guide', 'gloves', 'M', 140.00),
(7, 'Budget-Friendly Gloves', 'Great value gloves. Warm and waterproof.', 'Outdoor Master', 'Pro', 'gloves', 'L', 35.00),
(8, 'Premium Mittens', 'Warmest option available. Perfect for extreme cold.', 'Hestra', 'Army Leather', 'gloves', 'XL', 200.00),
(9, 'All-Mountain Gloves', 'Versatile gloves for all conditions.', 'Burton', 'Gore-Tex 2-in-1', 'gloves', 'M', 100.00),
(10, 'Racing Mittens', 'Racing mittens with excellent dexterity.', 'Swix', 'Race Mitt', 'gloves', 'L', 130.00),
(11, 'Youth Gloves', 'Gloves designed for kids. Warm and affordable.', 'Burton', 'Kids', 'gloves', 'S', 40.00),
(12, 'Freestyle Mittens', 'Durable mittens for park riding.', 'Dakine', 'Titan Mitt', 'gloves', 'M', 70.00),
(13, 'Backcountry Mittens', 'Lightweight mittens for touring.', 'Black Diamond', 'Guide Mitt', 'gloves', 'L', 120.00),
(14, 'Premium Gloves Pro', 'Top-of-the-line gloves. Maximum warmth and protection.', 'Hestra', 'Vertical Cut', 'gloves', 'XL', 250.00),
(15, 'Budget Mittens', 'Affordable mittens. Great for cold days.', 'Outdoor Master', 'Mitt', 'gloves', 'L', 30.00),
(16, 'Women''s Premium Gloves', 'High-end women''s gloves with excellent fit.', 'Hestra', 'Ladies', 'gloves', 'S', 160.00),
(17, 'Racing Gloves Pro', 'Professional racing gloves. Maximum performance.', 'Swix', 'Race Pro', 'gloves', 'M', 180.00),
(18, 'Freestyle Budget', 'Affordable gloves for park riding.', 'Dakine', 'Basic', 'gloves', 'L', 50.00),
(19, 'All-Mountain Premium', 'Premium all-mountain gloves. Versatile and warm.', 'Burton', 'Gore-Tex Pro', 'gloves', 'M', 140.00),
(20, 'Backcountry Premium', 'High-end touring gloves. Lightweight and warm.', 'Black Diamond', 'Guide Pro', 'gloves', 'L', 200.00);


-- =====================================================
-- Insert Test Products - JACKETS
-- =====================================================

INSERT INTO Products (user_id, productName, productDescription, brand, model, productType, clothingSize, price) VALUES
(21, 'Premium Shell Jacket', 'Waterproof and breathable shell. Perfect for all conditions.', 'Arc''teryx', 'Beta AR', 'jackets', 'M', 550.00),
(22, 'Budget Jacket', 'Affordable jacket with decent waterproofing. Great value.', 'Columbia', 'Bugaboo', 'jackets', 'L', 120.00),
(23, 'Women''s Insulated Jacket', 'Warm women''s jacket with synthetic insulation.', 'The North Face', 'Metropolis', 'jackets', 'S', 200.00),
(24, 'Freestyle Jacket', 'Durable jacket built for park riding. Stylish design.', 'Burton', 'AK', 'jackets', 'M', 350.00),
(25, 'Backcountry Shell', 'Lightweight shell perfect for touring.', 'Patagonia', 'Powder Bowl', 'jackets', 'L', 400.00),
(26, 'Racing Suit', 'Aerodynamic racing suit. Maximum speed.', 'Spyder', 'Race', 'jackets', 'M', 600.00),
(27, 'Budget Insulated', 'Affordable insulated jacket. Warm and comfortable.', 'Outdoor Research', 'Refuge', 'jackets', 'XL', 150.00),
(28, 'Premium 3-in-1', 'Versatile 3-in-1 jacket system. Great for variable conditions.', 'Arc''teryx', 'Beta LT', 'jackets', 'L', 650.00),
(29, 'Women''s Shell', 'Lightweight women''s shell. Excellent breathability.', 'Patagonia', 'Powder Bowl', 'jackets', 'S', 380.00),
(30, 'Freestyle Budget', 'Affordable freestyle jacket. Good style and function.', 'Dakine', 'Poacher', 'jackets', 'M', 180.00),
(1, 'All-Mountain Jacket', 'Versatile jacket for all conditions. Great value.', 'The North Face', 'Freedom', 'jackets', 'L', 280.00),
(2, 'Premium Insulated', 'Top-of-the-line insulated jacket. Maximum warmth.', 'Arc''teryx', 'Fission SV', 'jackets', 'M', 750.00),
(3, 'Backcountry Budget', 'Affordable touring shell. Lightweight and functional.', 'Outdoor Research', 'Interstellar', 'jackets', 'L', 220.00),
(4, 'Women''s Premium', 'High-end women''s jacket. Excellent fit and performance.', 'Patagonia', 'Powder Bowl', 'jackets', 'S', 450.00),
(5, 'Racing Budget', 'Affordable racing suit. Good performance.', 'Spyder', 'Race Lite', 'jackets', 'M', 350.00),
(6, 'Freestyle Premium', 'Premium freestyle jacket. Durable and stylish.', 'Burton', 'AK 2L', 'jackets', 'L', 500.00),
(7, 'All-Mountain Budget', 'Great value all-mountain jacket.', 'Columbia', 'Whirlibird', 'jackets', 'XL', 160.00),
(8, 'Premium Shell Pro', 'Professional-grade shell. Maximum protection.', 'Arc''teryx', 'Alpha SV', 'jackets', 'M', 800.00),
(9, 'Women''s Budget', 'Affordable women''s jacket. Good for beginners.', 'The North Face', 'Thermoball', 'jackets', 'S', 140.00),
(10, 'Backcountry Premium', 'High-end touring shell. Lightweight and durable.', 'Patagonia', 'Powder Bowl Pro', 'jackets', 'L', 550.00);


-- =====================================================
-- Insert Test Products - PANTS
-- =====================================================

INSERT INTO Products (user_id, productName, productDescription, brand, model, productType, clothingSize, price) VALUES
(11, 'Premium Shell Pants', 'Waterproof and breathable shell pants. Perfect for all conditions.', 'Arc''teryx', 'Beta AR', 'pants', 'M', 450.00),
(12, 'Budget Pants', 'Affordable pants with decent waterproofing. Great value.', 'Columbia', 'Bugaboo', 'pants', 'L', 100.00),
(13, 'Women''s Insulated Pants', 'Warm women''s pants with synthetic insulation.', 'The North Face', 'Freedom', 'pants', 'S', 180.00),
(14, 'Freestyle Pants', 'Durable pants built for park riding. Stylish design.', 'Burton', 'AK', 'pants', 'M', 300.00),
(15, 'Backcountry Shell', 'Lightweight shell pants perfect for touring.', 'Patagonia', 'Powder Bowl', 'pants', 'L', 350.00),
(16, 'Racing Suit Pants', 'Aerodynamic racing pants. Maximum speed.', 'Spyder', 'Race', 'pants', 'M', 500.00),
(17, 'Budget Insulated', 'Affordable insulated pants. Warm and comfortable.', 'Outdoor Research', 'Refuge', 'pants', 'XL', 130.00),
(18, 'Premium Bibs', 'Versatile bib pants. Great for deep snow days.', 'Arc''teryx', 'Beta AR Bib', 'pants', 'L', 550.00),
(19, 'Women''s Shell', 'Lightweight women''s shell pants. Excellent breathability.', 'Patagonia', 'Powder Bowl', 'pants', 'S', 320.00),
(20, 'Freestyle Budget', 'Affordable freestyle pants. Good style and function.', 'Dakine', 'Poacher', 'pants', 'M', 150.00),
(21, 'All-Mountain Pants', 'Versatile pants for all conditions. Great value.', 'The North Face', 'Freedom', 'pants', 'L', 240.00),
(22, 'Premium Insulated', 'Top-of-the-line insulated pants. Maximum warmth.', 'Arc''teryx', 'Fission SV', 'pants', 'M', 650.00),
(23, 'Backcountry Budget', 'Affordable touring shell. Lightweight and functional.', 'Outdoor Research', 'Interstellar', 'pants', 'L', 200.00),
(24, 'Women''s Premium', 'High-end women''s pants. Excellent fit and performance.', 'Patagonia', 'Powder Bowl', 'pants', 'S', 400.00),
(25, 'Racing Budget', 'Affordable racing pants. Good performance.', 'Spyder', 'Race Lite', 'pants', 'M', 300.00),
(26, 'Freestyle Premium', 'Premium freestyle pants. Durable and stylish.', 'Burton', 'AK 2L', 'pants', 'L', 450.00),
(27, 'All-Mountain Budget', 'Great value all-mountain pants.', 'Columbia', 'Whirlibird', 'pants', 'XL', 140.00),
(28, 'Premium Bibs Pro', 'Professional-grade bib pants. Maximum protection.', 'Arc''teryx', 'Alpha SV Bib', 'pants', 'M', 700.00),
(29, 'Women''s Budget', 'Affordable women''s pants. Good for beginners.', 'The North Face', 'Thermoball', 'pants', 'S', 120.00),
(30, 'Backcountry Premium', 'High-end touring shell pants. Lightweight and durable.', 'Patagonia', 'Powder Bowl Pro', 'pants', 'L', 480.00);


-- =====================================================
-- Insert Test Products - OTHER
-- =====================================================

INSERT INTO Products (user_id, productName, productDescription, brand, model, productType, price) VALUES
(1, 'Ski Backpack', 'Lightweight backpack perfect for backcountry skiing. Includes avy gear pocket.', 'Black Diamond', 'Jetforce', 'other', 450.00),
(2, 'Avalanche Beacon', 'Digital avalanche beacon with multiple burial detection.', 'Pieps', 'DSP Sport', 'other', 350.00),
(3, 'Ski Rack', 'Roof-mounted ski rack. Holds 4 pairs of skis securely.', 'Thule', 'Ski Rack', 'other', 180.00),
(4, 'Ski Boot Bag', 'Padded boot bag with wheels. Perfect for travel.', 'Dakine', 'Boot Locker', 'other', 120.00),
(5, 'Goggle Lens', 'Replacement lens for Smith I/O goggles. High contrast yellow.', 'Smith', 'I/O Lens', 'other', 80.00),
(6, 'Ski Socks', 'Premium merino wool ski socks. Excellent moisture wicking.', 'Smartwool', 'PhD Ski', 'other', 25.00),
(7, 'Base Layer Top', 'Merino wool base layer. Warm and breathable.', 'Icebreaker', 'Oasis', 'other', 90.00),
(8, 'Base Layer Bottom', 'Merino wool base layer bottoms. Perfect for cold days.', 'Icebreaker', 'Oasis', 'other', 85.00),
(9, 'Ski Lock', 'Cable lock for securing skis. Deterrent against theft.', 'Kryptonite', 'Ski Lock', 'other', 35.00),
(10, 'Helmet Camera Mount', 'Mount for GoPro cameras. Attaches to helmet.', 'GoPro', 'Helmet Mount', 'other', 30.00),
(11, 'Ski Wax Kit', 'Complete waxing kit with iron, wax, and tools.', 'Swix', 'Wax Kit', 'other', 150.00),
(12, 'Edge Sharpener', 'Professional edge sharpening tool. Keep edges razor sharp.', 'Toko', 'Edge Sharpener', 'other', 75.00),
(13, 'Ski Bag', 'Padded ski bag for travel. Protects skis during transport.', 'Dakine', 'Fall Line', 'other', 100.00),
(14, 'Avalanche Shovel', 'Lightweight aluminum avalanche shovel. Essential backcountry gear.', 'Black Diamond', 'Deploy', 'other', 65.00),
(15, 'Avalanche Probe', 'Collapsible avalanche probe. 320cm length.', 'Black Diamond', 'Quickdraw', 'other', 55.00),
(16, 'Ski Strap', 'Velcro ski straps for carrying skis. Simple and effective.', 'Dakine', 'Ski Strap', 'other', 12.00),
(17, 'Goggle Case', 'Hard case for protecting goggles. Prevents scratches.', 'Smith', 'Goggle Case', 'other', 20.00),
(18, 'Ski Tuning Vise', 'Vise for holding skis during tuning. Stable and adjustable.', 'Swix', 'Tuning Vise', 'other', 200.00),
(19, 'Boot Dryer', 'Electric boot dryer. Keeps boots fresh and dry.', 'DryGuy', 'Boot Dryer', 'other', 45.00),
(20, 'Ski Storage Rack', 'Wall-mounted ski storage rack. Holds 4 pairs.', 'StoreYourBoard', 'Ski Rack', 'other', 60.00),
(21, 'Merino Wool Buff', 'Versatile merino wool buff. Multiple ways to wear.', 'Buff', 'Merino', 'other', 18.00),
(22, 'Ski Tool', 'Multi-tool for on-mountain adjustments. Screwdriver and file included.', 'Tognar', 'Ski Tool', 'other', 40.00),
(23, 'Goggle Strap', 'Replacement goggle strap. Various colors available.', 'Smith', 'Strap', 'other', 15.00),
(24, 'Ski Brake Retainer', 'Retainer for ski brakes during travel. Prevents damage.', 'Dakine', 'Brake Retainer', 'other', 8.00),
(25, 'Base Layer Set', 'Complete merino wool base layer set. Top and bottom.', 'Smartwool', 'Base Layer', 'other', 140.00),
(26, 'Ski Boot Insoles', 'Custom-fit boot insoles. Improves comfort and performance.', 'Superfeet', 'Ski Insoles', 'other', 50.00),
(27, 'Goggle Lens Cleaner', 'Specialty cleaner for goggle lenses. Anti-fog formula.', 'Zeiss', 'Lens Cleaner', 'other', 10.00),
(28, 'Ski Pole Baskets', 'Replacement powder baskets for ski poles.', 'Black Diamond', 'Powder Baskets', 'other', 12.00),
(29, 'Helmet Audio System', 'Audio system that fits in helmet. Great for music on the slopes.', 'Outdoor Tech', 'Chips', 'other', 80.00),
(30, 'Ski Binding Covers', 'Protective covers for bindings during travel.', 'Dakine', 'Binding Covers', 'other', 25.00);


-- =====================================================
-- Insert Test Services
-- =====================================================

INSERT INTO Services (user_id, serviceName, serviceDescription, price) VALUES
-- User 1's services
(1, 'Ski Tuning & Waxing', 'Professional edge sharpening, base repair, and hot wax. Quick turnaround!', 45.00),
(1, 'Custom Boot Fitting', 'Expert boot fitting with heat molding and custom footbeds. Your feet will thank you.', 150.00),

-- User 2's services
(2, 'Private Ski Lessons', 'PSIA certified instructor. All ages and ability levels welcome. Half-day or full-day.', 200.00),
(2, 'Video Analysis', 'Record your skiing and get detailed feedback on technique improvement.', 75.00),

-- User 3's services
(3, 'Backcountry Guiding', 'Certified avalanche professional. Explore the best backcountry terrain safely.', 350.00),
(3, 'Avalanche Safety Course', 'Level 1 avalanche education. Learn rescue techniques and snowpack assessment.', 400.00),

-- User 4's services
(4, 'Ski Rental Delivery', 'High-quality rental skis delivered to your door. No need to visit the shop!', 85.00),
(4, 'Equipment Storage', 'Secure seasonal storage for your skis, boots, and gear. Climate controlled.', 120.00),

-- User 5's services
(5, 'Race Coaching', 'Former World Cup racer. Specialized training for competitive skiers.', 300.00),
(5, 'Ski Photography', 'Professional action photography on the mountain. Capture your best moments!', 250.00),

-- User 6's services
(6, 'Group Lessons', 'Fun group lessons for families or friends. Learn together, save money!', 150.00),
(6, 'Kids Ski Camp', 'Full-day kids camp with lessons, lunch, and supervision. Ages 6-12.', 175.00),

-- User 7's services
(7, 'Binding Mounting', 'Professional binding installation and adjustment. All brands and models.', 65.00),
(7, 'Base Grinding', 'Stone grinding for serious base damage repair. Factory-quality results.', 90.00),

-- User 8's services
(8, 'Powder Clinics', 'Learn to ski deep snow like a pro. Small groups, big improvements.', 225.00),
(8, 'Terrain Park Lessons', 'Master jumps, rails, and boxes with a freestyle specialist.', 180.00),

-- User 9's services
(9, 'Gear Consignment', 'Sell your used gear hassle-free. We handle everything for a small commission.', 50.00),
(9, 'Ski Swaps', 'Try different skis before you buy. Rental credits toward purchase.', 60.00),

-- User 10's services
(10, 'Nordic Ski Lessons', 'Cross-country and skate skiing instruction. Great cardio workout!', 120.00),
(10, 'Telemark Clinics', 'Learn the elegant art of free-heel skiing. Beginner to advanced.', 190.00),

-- User 11's services
(11, 'Snowboard Tuning', 'Professional base repair and edge tuning for snowboards.', 40.00),
(11, 'Snowboard Lessons', 'Certified snowboard instructor. All ability levels welcome.', 180.00),

-- User 12's services
(12, 'Equipment Repair', 'Expert repair service for skis, snowboards, and bindings.', 55.00),
(12, 'Waxing Service', 'Hot wax service for skis and snowboards. Quick turnaround.', 30.00),

-- User 13's services
(13, 'Mountain Photography', 'Professional photography services on the slopes. Action shots and portraits.', 200.00),
(13, 'Video Editing', 'Edit your ski and snowboard footage into professional videos.', 150.00),

-- User 14's services
(14, 'Backcountry Tours', 'Guided backcountry tours. Experience untouched powder.', 300.00),
(14, 'Splitboard Guiding', 'Specialized splitboard tours. Explore remote terrain.', 350.00),

-- User 15's services
(15, 'Race Training', 'Intensive race training program. Improve your times.', 250.00),
(15, 'Fitness Coaching', 'Ski-specific fitness training. Get stronger for the slopes.', 120.00),

-- User 16's services
(16, 'Helmet Fitting', 'Expert helmet fitting service. Find the perfect fit.', 25.00),
(16, 'Goggle Lens Replacement', 'Replace scratched or damaged goggle lenses.', 60.00),

-- User 17's services
(17, 'Gear Cleaning', 'Deep cleaning service for all ski and snowboard gear.', 45.00),
(17, 'Storage Organization', 'Organize your gear storage. Maximize space efficiency.', 80.00),

-- User 18's services
(18, 'Custom Ski Building', 'Build your own custom skis. Choose graphics and specs.', 1200.00),
(18, 'Ski Design Consultation', 'Consultation for custom ski graphics and design.', 100.00),

-- User 19's services
(19, 'Equipment Appraisal', 'Get your gear appraised for insurance or resale.', 50.00),
(19, 'Gear Maintenance Workshop', 'Learn to maintain your own gear. Hands-on workshop.', 75.00),

-- User 20's services
(20, 'Mountain Guide Service', 'Certified mountain guide. Explore new terrain safely.', 400.00),
(20, 'Adventure Photography', 'Capture your mountain adventures. Action and landscape photography.', 280.00);


-- =====================================================
-- Insert Some Sample Connections
-- =====================================================

INSERT INTO connections (requester_id, receiver_id, status) VALUES
(1, 2, 'accepted'),
(1, 3, 'accepted'),
(2, 3, 'accepted'),
(2, 4, 'pending'),
(3, 5, 'accepted'),
(4, 5, 'accepted'),
(5, 6, 'accepted'),
(6, 7, 'pending'),
(7, 8, 'accepted'),
(8, 9, 'declined'),
(9, 10, 'accepted'),
(11, 12, 'accepted'),
(12, 13, 'accepted'),
(13, 14, 'pending'),
(14, 15, 'accepted'),
(15, 16, 'accepted'),
(16, 17, 'pending'),
(17, 18, 'accepted'),
(18, 19, 'declined'),
(19, 20, 'accepted'),
(21, 22, 'accepted'),
(22, 23, 'accepted'),
(23, 24, 'pending'),
(24, 25, 'accepted'),
(25, 26, 'accepted'),
(26, 27, 'pending'),
(27, 28, 'accepted'),
(28, 29, 'declined'),
(29, 30, 'accepted'),
(1, 11, 'accepted'),
(2, 15, 'accepted'),
(5, 20, 'pending'),
(10, 25, 'accepted'),
(15, 30, 'accepted');


-- =====================================================
-- Insert Sample Service Reviews
-- =====================================================

INSERT INTO reviewsServices (reviewer_id, service_id, rating, comment) VALUES
(2, 1, 5, 'Best ski tune I''ve ever had! My edges are razor sharp and my bases are glassy smooth.'),
(3, 2, 5, 'The boot fitting made such a huge difference. No more foot pain after a long day!'),
(1, 4, 4, 'Great video analysis. Helped me improve my technique significantly.'),
(4, 5, 5, 'Amazing backcountry guide! Felt safe the entire time and saw incredible terrain.'),
(5, 7, 4, 'Good rental service. Skis were high quality and delivery was on time.'),
(6, 10, 5, 'Race coaching was intense but worth every penny. Shaved seconds off my times!'),
(7, 13, 4, 'Binding mount was perfect. Very professional service.'),
(8, 15, 5, 'Powder clinic changed my skiing! Now I love deep snow days.'),
(9, 17, 3, 'Consignment service was okay. Took a while to sell my gear but they eventually did.'),
(10, 2, 5, 'Custom boot fitting was a game changer. Highly recommend!'),
(11, 22, 5, 'Snowboard tuning was excellent. Board rides like new!'),
(12, 24, 4, 'Equipment repair saved my skis. Great service and fair price.'),
(13, 26, 5, 'Mountain photography was amazing. Got some incredible shots!'),
(14, 28, 5, 'Backcountry tour was unforgettable. Best powder of the season!'),
(15, 30, 4, 'Race training helped me improve significantly. Good instruction.'),
(16, 32, 5, 'Helmet fitting was quick and professional. Perfect fit!'),
(17, 34, 4, 'Gear cleaning service was thorough. Everything looks like new.'),
(18, 36, 5, 'Custom ski building was expensive but worth it. Unique skis!'),
(19, 38, 4, 'Equipment appraisal was helpful. Got good value estimate.'),
(20, 40, 5, 'Mountain guide service was excellent. Felt safe and had fun!');


-- =====================================================
-- Insert Sample Seller Reviews
-- =====================================================

INSERT INTO reviewsSellers (reviewer_id, reviewee_id, rating, comment) VALUES
(2, 1, 5, 'Excellent seller! Skis were exactly as described. Fast shipping too.'),
(3, 2, 4, 'Good communication and fair pricing. Would buy from again.'),
(4, 3, 5, 'Very knowledgeable about the equipment. Helped me pick the right skis.'),
(5, 4, 5, 'Honest and trustworthy. Skis arrived in perfect condition.'),
(6, 5, 4, 'Quick transaction, reasonable price. Skis work great!'),
(7, 6, 5, 'Great experience! Seller was flexible with meetup and very friendly.'),
(8, 7, 5, 'Top-notch seller. Equipment was even better than advertised!'),
(9, 8, 4, 'Smooth transaction. Skis are perfect for my skill level.'),
(10, 9, 5, 'Excellent service and great quality gear. Very satisfied!'),
(1, 10, 4, 'Good seller, fair price. Minor wear but expected for used gear.'),
(12, 11, 5, 'Snowboard was in perfect condition. Great seller!'),
(13, 12, 4, 'Helmet fit perfectly. Fast shipping and good communication.'),
(14, 13, 5, 'Boots were exactly what I needed. Excellent condition!'),
(15, 14, 5, 'Poles are lightweight and perfect. Great seller!'),
(16, 15, 4, 'Goggles work great. Good value for the price.'),
(17, 16, 5, 'Gloves are warm and waterproof. Exactly as described!'),
(18, 17, 4, 'Jacket fits perfectly. Good quality and fair price.'),
(19, 18, 5, 'Pants are excellent. Great condition and fast shipping!'),
(20, 19, 4, 'Backpack is perfect for backcountry. Good seller!'),
(21, 20, 5, 'Avalanche beacon works perfectly. Professional seller!'),
(22, 21, 4, 'Ski rack installed easily. Good product and service.'),
(23, 22, 5, 'Boot bag is perfect for travel. Highly recommend!'),
(24, 23, 4, 'Goggle lens replacement was quick. Good service!'),
(25, 24, 5, 'Ski socks are comfortable and warm. Great purchase!'),
(26, 25, 4, 'Base layer is high quality. Good value!'),
(27, 26, 5, 'Ski lock works great. Peace of mind on the slopes!'),
(28, 27, 4, 'Camera mount is sturdy. Good product!'),
(29, 28, 5, 'Wax kit is complete and high quality. Excellent!'),
(30, 29, 4, 'Edge sharpener works well. Good tool for the price!');


-- Insert data into product_images table
INSERT INTO product_images (id, product_id, image_path, is_primary, created_at) VALUES
(1, 10, 'https://pub-a8456622b43541f3a13144fc0d1dedcd.r2.dev/products/product-22-0-1763500034106.jpg', true, '2025-11-18 21:07:15.261304'),
(2, 10, 'https://pub-a8456622b43541f3a13144fc0d1dedcd.r2.dev/products/product-22-1-1763500035284.jpg', false, '2025-11-18 21:07:15.766795'),
(3, 8, 'https://pub-a8456622b43541f3a13144fc0d1dedcd.r2.dev/products/product-23-0-1763500771694.jpg', true, '2025-11-18 21:19:32.632302'),
(4, 8, 'https://pub-a8456622b43541f3a13144fc0d1dedcd.r2.dev/products/product-23-1-1763500772653.jpg', false, '2025-11-18 21:19:33.20403'),
(5, 8, 'https://pub-a8456622b43541f3a13144fc0d1dedcd.r2.dev/products/product-23-2-1763500773208.jpg', false, '2025-11-18 21:19:33.662444');

-- Insert data into service_images table
INSERT INTO service_images (id, service_id, image_path, is_primary, created_at) VALUES
(1, 1, 'https://pub-a8456622b43541f3a13144fc0d1dedcd.r2.dev/services/service-24-0-1763500215065.jpg', true, '2025-11-18 21:10:15.729285');

-- =====================================================
-- Verification Queries
-- =====================================================

-- Check user count
-- SELECT COUNT(*) as user_count FROM users;

-- Check product count
-- SELECT COUNT(*) as product_count FROM Products;

-- Check service count
-- SELECT COUNT(*) as service_count FROM Services;

-- Sample search query (like what your app will do)
-- SELECT p.*, u.username as seller_name, u.location as seller_location 
-- FROM Products p 
-- JOIN users u ON p.user_id = u.id 
-- WHERE p.brand ILIKE '%rossignol%' OR p.model ILIKE '%powder%';

-- =====================================================
-- NOTES:
-- =====================================================
-- 1. All users have password: "1234" (hashed)
-- 2. Created 30 users with ski-themed usernames
-- 3. Created products across ALL product types:
--    - Skis (30 products)
--    - Snowboards (20 products)
--    - Helmets (20 products)
--    - Boots (20 products - ski and snowboard)
--    - Poles (20 products)
--    - Goggles (20 products)
--    - Gloves (20 products)
--    - Jackets (20 products)
--    - Pants (20 products)
--    - Other (30 products - accessories, gear, etc.)
--    Total: 220 products
-- 4. Created 40 services (lessons, tuning, guiding, etc.)
-- 5. Added sample connections between users
-- 6. Added sample reviews for services and sellers
-- 
-- To reset and repopulate, uncomment the TRUNCATE line at the top
-- =====================================================

SELECT 'Database populated successfully!' as status;
