-- ==========================================
-- 📑 SAMARQAND CRAFTOUR DATABASE SCHEMA & SEED
-- Run this script in your Supabase SQL Editor.
-- ==========================================

-- Drop tables if they exist to avoid duplication issues
DROP TABLE IF EXISTS booking_items CASCADE;
DROP TABLE IF EXISTS bookings CASCADE;
DROP TABLE IF EXISTS vehicles CASCADE;
DROP TABLE IF EXISTS guide_language_tariffs CASCADE;
DROP TABLE IF EXISTS guides CASCADE;
DROP TABLE IF EXISTS locations CASCADE;
DROP TYPE IF EXISTS booking_status CASCADE;

-- 1. Lokatsiyalar jadvali (Ko'p tilli)
CREATE TABLE locations (
    id SERIAL PRIMARY KEY,
    name_en VARCHAR(255) NOT NULL,
    name_ru VARCHAR(255) NOT NULL,
    description_en TEXT,
    description_ru TEXT,
    latitude DECIMAL(9, 6) NOT NULL,
    longitude DECIMAL(9, 6) NOT NULL,
    category VARCHAR(50) NOT NULL, -- 'historical', 'alternative', 'food'
    is_out_of_city BOOLEAN DEFAULT FALSE, -- TRUE for mountain or out of town spots
    image_url TEXT -- Custom image URL for thumbnail
);

-- 2. Gidlar asosi
CREATE TABLE guides (
    id SERIAL PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    phone_number VARCHAR(50) NOT NULL
);

-- 3. Gidlar tillari va tariflari
CREATE TABLE guide_language_tariffs (
    id SERIAL PRIMARY KEY,
    guide_id INT REFERENCES guides(id) ON DELETE CASCADE,
    language_code VARCHAR(10) NOT NULL, -- 'EN', 'RU', 'FR', 'ES'
    daily_rate DECIMAL(10, 2) NOT NULL,
    UNIQUE(guide_id, language_code)
);

-- 4. Transport va Haydovchilar
CREATE TABLE vehicles (
    id SERIAL PRIMARY KEY,
    driver_name VARCHAR(255) NOT NULL,
    driver_phone VARCHAR(50) NOT NULL,
    car_model VARCHAR(100) NOT NULL,
    car_number VARCHAR(20) NOT NULL,
    city_rate DECIMAL(10, 2) NOT NULL,
    out_of_city_rate DECIMAL(10, 2) NOT NULL,
    capacity INT DEFAULT 5
);

-- 5. Buyurtmalar bosh jadvali
CREATE TYPE booking_status AS ENUM ('pending', 'confirmed', 'completed', 'cancelled');
CREATE TABLE bookings (
    id SERIAL PRIMARY KEY,
    tourist_name VARCHAR(255) NOT NULL,
    tourist_email VARCHAR(255) NOT NULL,
    tourist_phone VARCHAR(50),
    guide_id INT REFERENCES guides(id),
    vehicle_id INT REFERENCES vehicles(id),
    total_price DECIMAL(10, 2) NOT NULL,
    booking_date DATE NOT NULL,
    customer_language VARCHAR(5) DEFAULT 'EN', -- 'EN' or 'RU'
    status booking_status DEFAULT 'pending',
    passenger_count INT DEFAULT 1,
    notification_sent BOOLEAN DEFAULT FALSE,
    verified_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. Buyurtma marshrut elementlari
CREATE TABLE booking_items (
    booking_id INT REFERENCES bookings(id) ON DELETE CASCADE,
    location_id INT REFERENCES locations(id) ON DELETE CASCADE,
    visit_order INT NOT NULL,
    PRIMARY KEY (booking_id, location_id)
);


-- ==========================================
-- 🛠 SEED DATA INSERTS
-- ==========================================

-- Seed Locations
INSERT INTO locations (name_en, name_ru, description_en, description_ru, latitude, longitude, category, is_out_of_city) VALUES
('Registan Square', 'Площадь Регистан', 'The heart of ancient Samarkand, featuring three magnificent madrasahs.', 'Сердце древнего Самарканда, украшенное тремя величественными медресе.', 39.6548, 66.9757, 'historical', FALSE),
('Gur-e-Amir Mausoleum', 'Мавзолей Гур-Эмир', 'The final resting place of Amir Temur (Tamerlane), a masterpiece of Persian-Mongolian architecture.', 'Усыпальница Амира Темура (Тамерлана), шедевр персидско-монгольской архитектуры.', 39.6483, 66.9692, 'historical', FALSE),
('Shah-i-Zinda', 'Шахи Зинда', 'A breathtaking avenue of blue-domed mausoleums dating back to the 11th-15th centuries.', 'Улица лазурных мавзолеев XI–XV веков, поражающая своей красотой.', 39.6625, 66.9878, 'historical', FALSE),
('Bibi-Khanym Mosque', 'Мечеть Биби-Ханым', 'One of the largest mosques of the 15th century, built by Tamerlane in honor of his favorite wife.', 'Одна из крупнейших мечетей XV века, построенная Тамерланом в честь любимой жены.', 39.6593, 66.9791, 'historical', FALSE),
('Ulugh Beg Observatory', 'Обсерватория Улугбека', 'Built in 1420, this observatory was one of the finest in the Islamic world.', 'Обсерватория, построенная в 1420 году, бывшая одной из лучших в исламском мире.', 39.6744, 67.0062, 'historical', FALSE),
('Urgut Mountain Bazaar & Hills', 'Ургутский горный базар и горы', 'Explore traditional crafts at the market and hike through scenic Urgut mountain ranges.', 'Посетите традиционный ремесленный базар и прогуляйтесь по живописным горам Ургута.', 39.4045, 67.2435, 'alternative', TRUE),
('Omonqo''ton Pass & Pines', 'Перевал Омонкотон', 'A majestic pine forest and mountain pass with ancient caves and fresh springs.', 'Величественный сосновый лес и горный перевал с древними пещерами и источниками.', 39.3082, 66.9038, 'alternative', TRUE),
('Konigil Paper Mill', 'Бумажная фабрика Конигиль', 'A peaceful eco-village showcasing the ancient art of Samarkand mulberry paper making.', 'Тихая эко-деревня, демонстрирующая древнее искусство изготовления самаркандской шелковой бумаги.', 39.6800, 67.0180, 'alternative', TRUE),
('National Osh House', 'Национальный центр плова', 'Authentic Samarkand Osh prepared in giant cauldrons using traditional recipes.', 'Настоящий самаркандский плов, приготовленный в огромных казанах по старинным рецептам.', 39.6500, 66.9800, 'food', FALSE),
('Samarkand Bread Bakery', 'Пекарня самаркандских лепешек', 'Watch bakers prepare the famous, shiny Samarkand bread in traditional clay ovens.', 'Наблюдайте за приготовлением знаменитых блестящих самаркандских лепешек в тандырах.', 39.6600, 66.9780, 'food', FALSE),
('Karimbek Restaurant', 'Ресторан Каримбек', 'Elegant dining featuring traditional shashlik, manti, and vibrant Uzbek music.', 'Элегантный ресторан с традиционными шашлыками, мантами и живой узбекской музыкой.', 39.6521, 66.9587, 'food', FALSE);

-- Seed Guides
INSERT INTO guides (full_name, phone_number) VALUES
('Sherzod Alimov', '+998901234567'),
('Elena Petrova', '+998937654321'),
('Jahongir Rustamov', '+998971112233');

-- Seed Guide Tariffs
-- Sherzod speaks English and Russian
INSERT INTO guide_language_tariffs (guide_id, language_code, daily_rate) VALUES
(1, 'EN', 50.00),
(1, 'RU', 40.00);

-- Elena speaks Russian and French
INSERT INTO guide_language_tariffs (guide_id, language_code, daily_rate) VALUES
(2, 'RU', 45.00),
(2, 'FR', 65.00);

-- Jahongir speaks English, Russian, and Spanish
INSERT INTO guide_language_tariffs (guide_id, language_code, daily_rate) VALUES
(3, 'EN', 60.00),
(3, 'RU', 50.00),
(3, 'ES', 70.00);

-- Seed Vehicles
INSERT INTO vehicles (driver_name, driver_phone, car_model, car_number, city_rate, out_of_city_rate, capacity) VALUES
('Alisher aka', '+998909998877', 'Chevrolet Cobalt (White)', '01 A 777 BA', 30.00, 45.00, 5),
('Doston aka', '+998935554433', 'Chevrolet Gentra (Black)', '01 Z 888 ZZ', 35.00, 50.00, 5),
('Sarvar aka', '+998993332211', 'Chevrolet Gentra (Silver)', '01 Y 555 YY', 35.00, 50.00, 5),
('Odil aka', '+998901234567', 'Hyundai H1 Minivan (Silver)', '01 X 777 XX', 50.00, 75.00, 8),
('Jahongir aka', '+998909876543', 'Isuzu Bus (Turquoise)', '01 B 999 BB', 120.00, 180.00, 20);
