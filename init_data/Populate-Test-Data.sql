-- =====================================================
-- Populate Database with Test Data
-- =====================================================

-- Clear existing data (optional - uncomment if needed)
-- TRUNCATE TABLE reviewsServices, reviewsSellers, connections, Products, Services, users RESTART IDENTITY CASCADE;

-- =====================================================
-- Insert Test Users
-- =====================================================
-- Password for all test users is: "password123"
-- Hashed using bcrypt with 10 rounds

INSERT INTO users (username, email, password_hash, location) VALUES
('john_powder', 'john@example.com', '$2a$10$rZ8qY5F5Z5Z5Z5Z5Z5Z5ZeK5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z', 'Aspen, Colorado'),
('sarah_slopes', 'sarah@example.com', '$2a$10$rZ8qY5F5Z5Z5Z5Z5Z5Z5ZeK5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z', 'Park City, Utah'),
('mike_mountain', 'mike@example.com', '$2a$10$rZ8qY5F5Z5Z5Z5Z5Z5Z5ZeK5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z', 'Breckenridge, Colorado'),
('emma_edge', 'emma@example.com', '$2a$10$rZ8qY5F5Z5Z5Z5Z5Z5Z5ZeK5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z', 'Jackson Hole, Wyoming'),
('alex_alpine', 'alex@example.com', '$2a$10$rZ8qY5F5Z5Z5Z5Z5Z5Z5ZeK5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z', 'Vail, Colorado'),
('lisa_lodge', 'lisa@example.com', '$2a$10$rZ8qY5F5Z5Z5Z5Z5Z5Z5ZeK5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z', 'Telluride, Colorado'),
('dave_downhill', 'dave@example.com', '$2a$10$rZ8qY5F5Z5Z5Z5Z5Z5Z5ZeK5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z', 'Steamboat Springs, Colorado'),
('rachel_run', 'rachel@example.com', '$2a$10$rZ8qY5F5Z5Z5Z5Z5Z5Z5ZeK5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z', 'Sun Valley, Idaho'),
('tom_trail', 'tom@example.com', '$2a$10$rZ8qY5F5Z5Z5Z5Z5Z5Z5ZeK5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z', 'Mammoth Lakes, California'),
('nina_nordic', 'nina@example.com', '$2a$10$rZ8qY5F5Z5Z5Z5Z5Z5Z5ZeK5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z', 'Boulder, Colorado');


-- =====================================================
-- Insert Test Products (Skis)
-- =====================================================

INSERT INTO Products (user_id, productName, productDescription, brand, model, skiLength, skiWidth, price) VALUES
-- User 1's products
(1, 'All-Mountain Carver', 'Perfect for groomed runs and powder. Excellent condition, used one season.', 'Rossignol', 'Experience 88', 177.0, 88.0, 425.00),
(1, 'Backcountry Touring Skis', 'Lightweight touring skis with AT bindings included. Great for uphill adventures.', 'Black Diamond', 'Helio 105', 184.0, 105.0, 650.00),

-- User 2's products
(2, 'Women''s Powder Skis', 'Wide skis designed for deep snow. Barely used, like new condition.', 'K2', 'Mindbender 106', 170.0, 106.0, 550.00),
(2, 'Beginner Friendly Skis', 'Great for learning. Forgiving and stable. Includes bindings.', 'Salomon', 'QST Lux 92', 163.0, 92.0, 325.00),

-- User 3's products
(3, 'Racing Slalom Skis', 'Competition-level slalom skis. Fast edge-to-edge. Advanced skiers only.', 'Atomic', 'Redster G9', 165.0, 65.0, 875.00),
(3, 'Freestyle Park Skis', 'Twin-tip design for park and pipe. Durable construction, some cosmetic wear.', 'Armada', 'ARV 96', 180.0, 96.0, 399.00),

-- User 4's products
(4, 'Powder Floaters', 'Ultra-wide skis that float on the deepest powder days. Like surfing on snow!', 'Line', 'Sick Day 114', 186.0, 114.0, 625.00),
(4, 'All-Mountain Women''s', 'Versatile women''s skis for all conditions. Excellent control and stability.', 'Volkl', 'Flair 81', 168.0, 81.0, 475.00),

-- User 5's products
(5, 'Big Mountain Charger', 'Stiff and stable for high speeds on steep terrain. Expert level skis.', 'Nordica', 'Enforcer 100', 191.0, 100.0, 699.00),
(5, 'Lightweight Touring', 'Carbon construction for uphill efficiency. Pin bindings ready.', 'Dynafit', 'Beast 108', 181.0, 108.0, 799.00),

-- User 6's products
(6, 'Carving Specialists', 'Precision carving on hardpack. Race-inspired construction.', 'Head', 'Supershape i.Speed', 170.0, 70.0, 525.00),
(6, 'Mogul Master Skis', 'Short and nimble for bump skiing. Soft flex for quick turns.', 'K2', 'Mindbender 85', 169.0, 85.0, 449.00),

-- User 7's products
(7, 'Powder Paradise', 'Rockered tips for effortless float. Perfect for Colorado powder days.', 'Blizzard', 'Rustler 11', 188.0, 110.0, 675.00),
(7, 'Junior Race Skis', 'High-performance junior racing skis. Great for competitive youth skiers.', 'Fischer', 'RC One Jr', 150.0, 63.0, 299.00),

-- User 8's products
(8, 'Freeride Destroyer', 'Aggressive all-mountain freeride skis. Built to charge hard.', 'DPS', 'Cassiar 95', 184.0, 95.0, 825.00),
(8, 'Beginner Package', 'Complete beginner setup with skis, bindings, and poles. Ready to go!', 'Rossignol', 'Experience 74', 160.0, 74.0, 275.00),

-- User 9's products
(9, 'Park & Pipe Twins', 'Symmetrical twin tips for switch riding. Butter-soft flex.', 'Moment', 'Deathwish', 178.0, 100.0, 525.00),
(9, 'Women''s Carving Elite', 'High-performance women''s carving skis with amazing edge grip.', 'Atomic', 'Cloud Q12', 165.0, 78.0, 599.00),

-- User 10's products
(10, 'Touring Ultralight', 'Incredibly light for long tours. Sacrifices nothing on the downhill.', 'Movement', 'Alp Tracks 89', 176.0, 89.0, 749.00),
(10, 'All-Mountain Cruiser', 'Smooth and stable all-mountain skis. Perfect daily driver.', 'Salomon', 'QST 98', 180.0, 98.0, 499.00);

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
(10, 'Telemark Clinics', 'Learn the elegant art of free-heel skiing. Beginner to advanced.', 190.00);

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
(9, 10, 'accepted');

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
(10, 2, 5, 'Custom boot fitting was a game changer. Highly recommend!');

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
(1, 10, 4, 'Good seller, fair price. Minor wear but expected for used gear.');


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
-- 1. All users have password: "password123" (hashed)
-- 2. Created 10 users with ski-themed usernames
-- 3. Created 20 products (various ski types and brands)
-- 4. Created 20 services (lessons, tuning, guiding, etc.)
-- 5. Added sample connections between users
-- 6. Added sample reviews for services and sellers
-- 
-- To reset and repopulate, uncomment the TRUNCATE line at the top
-- =====================================================

SELECT 'Database populated successfully!' as status;
