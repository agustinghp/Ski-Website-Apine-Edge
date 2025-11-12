-- sample_data.sql
-- Insert test users
INSERT INTO users (username, email, password_hash, location) VALUES
('powderhound', 'powderhound@example.com', 'hash1', 'Denver, CO'),
('ski_bum_22', 'skibum22@example.com', 'hash2', 'Boulder, CO'),
('carvequeen', 'carvequeen@example.com', 'hash3', 'Vail, CO'),
('boardbro', 'boardbro@example.com', 'hash4', 'Aspen, CO'),
('mountainman', 'mountainman@example.com', 'hash5', 'Breckenridge, CO'),
('glidergirl', 'glidergirl@example.com', 'hash6', 'Telluride, CO'),
('iceedge', 'iceedge@example.com', 'hash7', 'Steamboat Springs, CO'),
('snowjunkie', 'snowjunkie@example.com', 'hash8', 'Crested Butte, CO'),
('waxwizard', 'waxwizard@example.com', 'hash9', 'Golden, CO'),
('freeridefred', 'freeridefred@example.com', 'hash10', 'Durango, CO');

-- Insert test products (Skis, Snowboards, etc.)
INSERT INTO products (user_id, productName, productDescription, brand, model, skiLength, skiWidth, price) VALUES
(1, 'Atomic Bent Chetler 120', 'Freestyle powder ski perfect for deep snow.', 'Atomic', 'Bent Chetler 120', 184.0, 120.0, 650.00),
(2, 'Rossignol Experience 88 Ti', 'All-mountain ski with excellent edge control.', 'Rossignol', 'Experience 88 Ti', 180.0, 88.0, 500.00),
(3, 'Salomon QST 106', 'Versatile freeride ski for all terrain types.', 'Salomon', 'QST 106', 188.0, 106.0, 550.00),
(4, 'Burton Custom X', 'High-performance snowboard for aggressive riders.', 'Burton', 'Custom X', 158.0, 0.0, 480.00),
(5, 'Head Kore 93', 'Lightweight ski that performs on groomers and off-piste.', 'Head', 'Kore 93', 177.0, 93.0, 525.00),
(6, 'Volkl Mantra M6', 'Powerful all-mountain ski with precise handling.', 'Volkl', 'Mantra M6', 184.0, 96.0, 600.00),
(7, 'K2 Mindbender 108Ti', 'Stable freeride ski ideal for big mountain lines.', 'K2', 'Mindbender 108Ti', 186.0, 108.0, 575.00),
(8, 'Nordica Enforcer 104 Free', 'Smooth and stable ride across all conditions.', 'Nordica', 'Enforcer 104 Free', 186.0, 104.0, 560.00),
(9, 'Fischer Ranger 102 FR', 'Playful freeride ski with responsive flex.', 'Fischer', 'Ranger 102 FR', 184.0, 102.0, 520.00),
(10, 'Burton Process Flying V', 'Lightweight freestyle snowboard for park laps.', 'Burton', 'Process Flying V', 155.0, 0.0, 450.00),
(1, 'Blizzard Bonafide 97', 'Versatile ski for advanced riders.', 'Blizzard', 'Bonafide 97', 180.0, 97.0, 570.00),
(2, 'Atomic Redster S9', 'High-speed carving ski with race DNA.', 'Atomic', 'Redster S9', 165.0, 68.0, 650.00),
(3, 'Jones Mountain Twin', 'Freestyle snowboard with all-mountain capability.', 'Jones', 'Mountain Twin', 159.0, 0.0, 500.00),
(4, 'Salomon Huck Knife', 'Park board that pops hard and lands soft.', 'Salomon', 'Huck Knife', 155.0, 0.0, 400.00),
(5, 'Line Blade Optic 96', 'Fun carving ski for all conditions.', 'Line', 'Blade Optic 96', 181.0, 96.0, 510.00),
(6, 'Faction Dictator 3.0', 'Freeride ski with serious stability.', 'Faction', 'Dictator 3.0', 186.0, 105.0, 580.00),
(7, 'K2 Poacher', 'Durable park ski built for performance.', 'K2', 'Poacher', 177.0, 96.0, 430.00),
(8, 'Rossignol Black Ops 98', 'Do-it-all freeride ski for progressive skiers.', 'Rossignol', 'Black Ops 98', 180.0, 98.0, 540.00),
(9, 'Burton Deep Thinker', 'Directional board designed for carving powder.', 'Burton', 'Deep Thinker', 160.0, 0.0, 480.00),
(10, 'Head Supershape e-Titan', 'Carving ski with advanced technology.', 'Head', 'Supershape e-Titan', 177.0, 84.0, 620.00);

-- Insert test services (Lessons, Tuning, Waxing, etc.)
INSERT INTO services (user_id, serviceName, serviceDescription, price) VALUES
(1, 'Ski Waxing & Tuning', 'Professional waxing and edge tuning for all skis.', 40.00),
(2, 'Private Ski Lesson', 'One-on-one ski coaching session for all levels.', 120.00),
(3, 'Snowboard Repair', 'Fixing base damage, edge tuning, and waxing.', 50.00),
(4, 'Backcountry Guiding', 'Guided ski tour in Vail Pass backcountry.', 200.00),
(5, 'Group Ski Lesson', '2-hour session for up to 4 people.', 90.00),
(6, 'Boot Fitting Service', 'Custom fit ski boots for performance and comfort.', 75.00),
(7, 'Ski Mountaineering Instruction', 'Learn ski touring techniques and avalanche safety.', 150.00),
(8, 'Snowboard Tuning', 'Full tune-up and wax service.', 45.00),
(9, 'Ski Equipment Rental', 'Daily rental for skis, boots, and poles.', 60.00),
(10, 'Avalanche Safety Course', 'Full-day avalanche awareness and rescue training.', 180.00),
(1, 'Junior Ski Lesson', 'Beginner lessons for kids aged 8–12.', 80.00),
(2, 'Performance Waxing', 'High-fluoro race wax for competitive skiers.', 65.00),
(3, 'Edge Sharpening', 'Precision edge sharpening service.', 25.00),
(4, 'Snowboard Setup Consultation', 'Help setting up bindings and stance for new riders.', 30.00),
(5, 'Custom Ski Build Workshop', 'Learn to build your own skis.', 250.00),
(6, 'Park & Freestyle Coaching', 'Learn tricks safely with pro coaching.', 100.00),
(7, 'Ski Transport Service', 'Van transport to nearby resorts.', 35.00),
(8, 'Waxing Subscription', 'Monthly ski waxing subscription.', 90.00),
(9, 'Beginner Snowboard Lesson', 'Learn basics of snowboarding in a 1.5-hour session.', 75.00),
(10, 'Heli-Ski Experience', 'Full-day heli-ski adventure for experienced riders.', 800.00);
