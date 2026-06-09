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
DROP TYPE IF EXISTS partner_response_status CASCADE;

-- 1. Lokatsiyalar jadvali (Ko'p tilli)
CREATE TABLE locations (
    id SERIAL PRIMARY KEY,
    name_en VARCHAR(255) NOT NULL,
    name_ru VARCHAR(255) NOT NULL,
    name_uz VARCHAR(255) NOT NULL DEFAULT '',
    description_en TEXT,
    description_ru TEXT,
    description_uz TEXT,
    latitude DECIMAL(9, 6) NOT NULL,
    longitude DECIMAL(9, 6) NOT NULL,
    category VARCHAR(50) NOT NULL, -- 'historical', 'alternative', 'food'
    is_out_of_city BOOLEAN DEFAULT FALSE, -- TRUE for mountain or out of town spots
    image_url TEXT, -- Custom image URL for thumbnail
    estimated_duration INT DEFAULT 90, -- Estimated visit duration in minutes
    region VARCHAR(50) DEFAULT 'samarqand'
);

-- 2. Gidlar asosi
CREATE TABLE guides (
    id SERIAL PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    phone_number VARCHAR(50) NOT NULL,
    telegram_chat_id BIGINT UNIQUE,
    bot_active BOOLEAN DEFAULT FALSE,
    region VARCHAR(50) DEFAULT 'samarqand'
);

-- 3. Gidlar tillari va tariflari
CREATE TABLE guide_language_tariffs (
    id SERIAL PRIMARY KEY,
    guide_id INT REFERENCES guides(id) ON DELETE CASCADE,
    language_code VARCHAR(10) NOT NULL, -- 'EN', 'RU', 'FR', 'ES', 'UZ'
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
    capacity INT DEFAULT 5,
    telegram_chat_id BIGINT UNIQUE,
    bot_active BOOLEAN DEFAULT FALSE,
    region VARCHAR(50) DEFAULT 'samarqand'
);

-- 5. Buyurtmalar bosh jadvali
CREATE TYPE booking_status AS ENUM ('pending', 'confirmed', 'completed', 'cancelled');
CREATE TYPE partner_response_status AS ENUM ('pending', 'confirmed', 'rejected');

CREATE TABLE bookings (
    id SERIAL PRIMARY KEY,
    tourist_name VARCHAR(255) NOT NULL,
    tourist_email VARCHAR(255) NOT NULL,
    tourist_phone VARCHAR(50),
    guide_id INT REFERENCES guides(id),
    vehicle_id INT REFERENCES vehicles(id),
    total_price DECIMAL(10, 2) NOT NULL,
    booking_date DATE NOT NULL,
    customer_language VARCHAR(5) DEFAULT 'EN', -- 'EN', 'RU', 'UZ'
    status booking_status DEFAULT 'pending',
    passenger_count INT DEFAULT 1,
    booking_type VARCHAR(10) NOT NULL DEFAULT 'private' CHECK (booking_type IN ('private', 'shared')),
    guide_response partner_response_status DEFAULT 'pending',
    vehicle_response partner_response_status DEFAULT 'pending',
    notification_sent BOOLEAN DEFAULT FALSE,
    verified_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ⬆️ MAVJUD BAZAGA MIGRATSIYA (Supabase SQL Editor da ishga tushiring):
-- ALTER TABLE bookings ADD COLUMN IF NOT EXISTS booking_type VARCHAR(10) NOT NULL DEFAULT 'private'
--   CHECK (booking_type IN ('private', 'shared'));

-- 6. Buyurtma marshrut elementlari
CREATE TABLE booking_items (
    booking_id INT REFERENCES bookings(id) ON DELETE CASCADE,
    location_id INT REFERENCES locations(id) ON DELETE CASCADE,
    visit_order INT NOT NULL,
    PRIMARY KEY (booking_id, location_id)
);


-- ==========================================
-- 🛠 SEED DATA INSERTS
-- =======================================-- Seed Locations
INSERT INTO locations (name_en, name_ru, name_uz, description_en, description_ru, description_uz, latitude, longitude, category, is_out_of_city, estimated_duration, image_url, region) VALUES
('Registan Square', 'Площадь Регистан', 'Registon maydoni', 'The heart of ancient Samarkand, featuring three magnificent madrasahs.', 'Сердце древнего Самарканда, украшенное тремя величественными медресе.', 'Uchta muhtasham madrasadan iborat qadimiy Samarqandning yuragi.', 39.6548, 66.9757, 'historical', FALSE, 120, 'https://images.unsplash.com/photo-1618218168350-6e7c8137558d?auto=format&fit=crop&w=600&q=80', 'samarqand'),
('Gur-e-Amir Mausoleum', 'Мавзолей Гур-Эмир', 'Go''ri Amir maqbarasi', 'The final resting place of Amir Temur (Tamerlane), a masterpiece of Persian-Mongolian architecture.', 'Усыпальница Амира Темура (Тамерлана), шедевр персидско-монгольской архитектуры.', 'Amir Temur (Tamerlan) ning so''nggi qo''nim topgan joyi, me''moriy durdona.', 39.6483, 66.9692, 'historical', FALSE, 90, 'https://images.unsplash.com/photo-1541432901042-2d8bd64b4a9b?auto=format&fit=crop&w=600&q=80', 'samarqand'),
('Shah-i-Zinda', 'Шахи Зинда', 'Shohi Zinda', 'A breathtaking avenue of blue-domed mausoleums dating back to the 11th-15th centuries.', 'Улица лазурных мавзолеев XI–XV веков, поражающая своей красотой.', 'Moviy gumbazli maqbaralardan iborat hayratlanarli xiyobon.', 39.6625, 66.9878, 'historical', FALSE, 90, 'https://images.unsplash.com/photo-1623940179976-b9952ecbc412?auto=format&fit=crop&w=600&q=80', 'samarqand'),
('Bibi-Khanym Mosque', 'Мечеть Биби-Ханым', 'Bibi Xonim masjidi', 'One of the largest mosques of the 15th century, built by Tamerlane in honor of his favorite wife.', 'Одна из крупнейших мечетей XV века, построенная Тамерланом в честь любимой жены.', 'Amir Temurning sevimli rafiqasi sharafiga qurilgan XV asrning eng yirik masjidlaridan biri.', 39.6593, 66.9791, 'historical', FALSE, 60, 'https://images.unsplash.com/photo-1605371924599-2c03d64d0dd3?auto=format&fit=crop&w=600&q=80', 'samarqand'),
('Ulugh Beg Observatory', 'Обсерватория Улугбека', 'Ulug''bek rasadxonasi', 'Built in 1420, this observatory was one of the finest in the Islamic world.', 'Обсерватория, построенная in 1420 году, бывшая одной из лучших в исламском мире.', '1420-yilda qurilgan ushbu rasadxona islom dunyosining ajoyib mo''jizalaridan biri bo''lgan.', 39.6744, 67.0062, 'historical', FALSE, 60, 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=600&q=80', 'samarqand'),
('Urgut Mountain Bazaar & Hills', 'Ургутский горный базар и горы', 'Urgut tog'' bozori va adirlari', 'Explore traditional crafts at the market and hike through scenic Urgut mountain ranges.', 'Посетите традиционный ремесленный базар и прогуляйтесь по живописным горам Ургута.', 'Bozorda an''anaviy hunarmandchilik bilan tanishing va Urgutning go''zal tog'' tizmalari bo''ylab sayr qiling.', 39.4045, 67.2435, 'alternative', TRUE, 240, 'https://images.unsplash.com/photo-1501555088652-021faa106b9b?auto=format&fit=crop&w=600&q=80', 'samarqand'),
('Omonqo''ton Pass & Pines', 'Перевал Омонкотон', 'Omonqo''ton dovoni va qarag''aylari', 'A majestic pine forest and mountain pass with ancient caves and fresh springs.', 'Величественный сосновый лес и горный перевал с древними пещерами и источниками.', 'Qadimiy g''orlar va toza buloqlarga ega muhtasham qarag''ayzor hamda tog'' dovoni.', 39.3082, 66.9038, 'alternative', TRUE, 180, 'https://images.unsplash.com/photo-1473448912268-2022ce9509d8?auto=format&fit=crop&w=600&q=80', 'samarqand'),
('Konigil Paper Mill', 'Бумажная фабрика Конигиль', 'Konigil qog''oz fabrikasi', 'A peaceful eco-village showcasing the ancient art of Samarkand mulberry paper making.', 'Тихая эко-деревня, демонстрирующая древнее искусство изготовления самаркандской шелковой бумаги.', 'Samarqand tut qog''ozini tayyorlashning qadimiy san''atini namoyish etuvchi tinch eko-qishloq.', 39.6800, 67.0180, 'alternative', TRUE, 120, 'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?auto=format&fit=crop&w=600&q=80', 'samarqand'),
('National Osh House', 'Национальный центр плова', 'Milliy palov markazi', 'Authentic Samarkand Osh prepared in giant cauldrons using traditional recipes.', 'Настоящий самаркандский плов, приготовленный в огромных казанах по старинным рецептам.', 'Katta qozonlarda an''anaviy retseptlar bo''yicha tayyorlangan haqiqiy Samarqand palovi.', 39.6500, 66.9800, 'food', FALSE, 60, 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=600&q=80', 'samarqand'),
('Samarkand Bread Bakery', 'Пекарня самаркандских лепешек', 'Samarqand nonvoyxonasi', 'Watch bakers prepare the famous, shiny Samarkand bread in traditional clay ovens.', 'Наблюдайте за приготовлением знаменитых блестящих самаркандских лепешек в тандырах.', 'Nonvoylar tandirda mashhur, yaltiroq Samarqand nonlarini yopishini kuzating.', 39.6600, 66.9780, 'food', FALSE, 45, 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=600&q=80', 'samarqand'),
('Karimbek Restaurant', 'Ресторан Каримбек', 'Karimbek restorani', 'Elegant dining featuring traditional shashlik, manti, and vibrant Uzbek music.', 'Элегантный ресторан с традиционными шашлыками, мантами и живой узбекской музыкой.', 'An''anaviy kabob, manti va jonli milliy musiqa taklif etuvchi ajoyib restoran.', 39.6521, 66.9587, 'food', FALSE, 90, 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80', 'samarqand'),

-- Seed Bukhara Locations
('Po-i-Kalyan Complex', 'Комплекс Пои-Калян', 'Poyi Kalon majmuasi', 'A magnificent Islamic religious complex at the heart of old Bukhara, featuring the towering Kalyan Minaret.', 'Величественный религиозный комплекс в центре старой Бухары с возвышающимся минаретом Калян.', 'Eski Buxoroning markazida joylashgan muhtasham diniy majmua, mashhur Minorai Kalon bilan ajralib turadi.', 39.7769, 64.4149, 'historical', FALSE, 100, 'https://images.unsplash.com/photo-1584646098025-97cfbe6cae0d?auto=format&fit=crop&w=600&q=80', 'buxoro'),
('Ark of Bukhara', 'Цитадель Арк', 'Buxoro Arki', 'A massive 5th-century fortress that once served as a city within a city for the Emirs of Bukhara.', 'Массивная крепость V века, которая когда-то служила городом в городе для эмиров Бухары.', 'Buxoro amirlari yashagan, V asrga oid ulkan qal''a va shahar ichidagi shahar.', 39.7779, 64.4111, 'historical', FALSE, 90, 'https://images.unsplash.com/photo-1540959733332-eab4deceeaf7?auto=format&fit=crop&w=600&q=80', 'buxoro'),
('Lyabi-Khauz Complex', 'Ансамбль Ляби-Хауз', 'Labi Hovuz ansambli', 'A peaceful public square built around a historic pond, shaded by centuries-old mulberry trees.', 'Мирная общественная площадь вокруг исторического пруда, окруженная многовековыми тутовыми деревьями.', 'Ko''hna chinorlar va asriy tut daraxtlari bilan o''ralgan, hovuz bo''yidagi tinch tarixiy maydon.', 39.7731, 64.4203, 'historical', FALSE, 60, 'https://images.unsplash.com/photo-1605649487212-47bdab064df7?auto=format&fit=crop&w=600&q=80', 'buxoro'),
('Chor Minor', 'Чор-Минор', 'Chor Minor', 'A unique, charming historic gatehouse with four decorated turquoise towers.', 'Уникальные исторические ворота медресе с четырьмя бирюзовыми башнями.', 'To''rtta moviy gumbazli minoraga ega bo''lgan betakror va go''zal tarixiy darvozaxona.', 39.7749, 64.4277, 'historical', FALSE, 45, 'https://images.unsplash.com/photo-1627856013091-fed6e4e30025?auto=format&fit=crop&w=600&q=80', 'buxoro'),
('Samanid Mausoleum', 'Мавзолей Саманидов', 'Somoniylar maqbarasi', 'A 10th-century masterpiece of early Islamic architecture, built entirely from baked brickwork patterns.', 'Шедевр ранней исламской архитектуры X века, полностью построенный из фигурной кирпичной кладки.', 'Pishgan g''isht naqshlaridan bunyod etilgan, X asrga oid ilk islom me''morchiligining tengsiz durdonasi.', 39.7772, 64.4022, 'historical', FALSE, 60, 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=600&q=80', 'buxoro'),
('Sitorai Mokhi-Khosa Palace', 'Дворец Ситораи Мохи-Хоса', 'Sitorai Mohi Xosa saroyi', 'The summer residence of the last Emirs of Bukhara, combining Russian imperial and traditional oriental styles.', 'Летняя резиденция последних эмиров Бухары, сочетающая русский имперский и восточный стили.', 'Rossiya imperatorlik me''morchiligi va an''anaviy sharqona uslubni birlashtirgan so''nggi Buxoro amirlarining yozgi saroyi.', 39.8124, 64.4372, 'alternative', TRUE, 120, 'https://images.unsplash.com/photo-1608958416790-27ff290c3ce2?auto=format&fit=crop&w=600&q=80', 'buxoro'),
('Chor-Bakr Necropolis', 'Некрополь Чор-Бакр', 'Chor Bakr xotira majmuasi', 'The "City of the Dead", a massive, atmospheric memorial complex located outside Bukhara.', '«Город мертвых» — огромный, атмосферный мемориальный комплекс за пределами Бухары.', 'Buxorodan tashqarida joylashgan, o''ziga xos sirli muhitga ega ulkan tarixiy memorial majmua ("O''liklar shahri").', 39.7745, 64.3392, 'alternative', TRUE, 120, 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=600&q=80', 'buxoro'),
('Bukhara Desert Oasis & Dunes', 'Пустынный оазис Бухары', 'Buxoro sahro vohasi va qum barxanlari', 'Experience the vastness of the Kyzylkum Desert with a safari, traditional yurt camps, and camel riding.', 'Почувствуйте просторы пустыни Кызылкум с сафари, юртами и катанием на верблюдах.', 'Qizilqum sahrosida tuya minish, milliy o''tovlarda dam olish va qum barxanlari bo''ylab ajoyib sayohat.', 39.9000, 64.3000, 'alternative', TRUE, 240, 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=600&q=80', 'buxoro'),
('Bukhara Spice Market', 'Рынок специй Бухары', 'Buxoro ziravorlar bozori', 'A sensory journey through ancient trading domes, offering exotic spices, dried fruits, and herbal teas.', 'Сенсорное путешествие по древним торговым куполам со специями, сухофруктами и травяными чаями.', 'Qadimgi savdo gumbazlari ostida joylashgan, xushbo''y ziravorlar, quruq mevalar va shifobaxsh choylar bozori.', 39.7745, 64.4172, 'food', FALSE, 60, 'https://images.unsplash.com/photo-1596797038530-2c107229654b?auto=format&fit=crop&w=600&q=80', 'buxoro'),
('Labi Hovuz Tea House', 'Чайхана Ляби-Хауз', 'Labi Hovuz choyxonasi', 'Dine by the waters of the historic pond, enjoying Bukhara pilaf and green tea under ancient mulberry trees.', 'Обед у воды исторического пруда, наслаждаясь бухарским пловом и зеленым чаем.', 'Labi Hovuz bo''yidagi asriy chinorlar soyasida milliy buxorocha palov va ko''k choydan bahramand bo''ling.', 39.7733, 64.4206, 'food', FALSE, 90, 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=600&q=80', 'buxoro'),
('Minzifa Restaurant', 'Ресторан Минзифа', 'Minzifa restorani', 'A fine dining restaurant with a rooftop terrace overlooking the historic domes of Bukhara.', 'Ресторан изысканной кухни с террасой на крыше и видом на исторические купола Бухары.', 'Buxoroning ko''hna gumbazlariga qaragan tom qismidagi ayvonga ega bo''lgan milliy va yevropa taomlari restorani.', 39.7740, 64.4185, 'food', FALSE, 90, 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80', 'buxoro');

-- Seed Guides
INSERT INTO guides (full_name, phone_number, region) VALUES
('Sherzod Alimov', '+998901234567', 'samarqand'),
('Elena Petrova', '+998937654321', 'samarqand'),
('Jahongir Rustamov', '+998971112233', 'samarqand'),
('Mukhammadkhon Bakhronov', '+998939991122', 'buxoro'),
('Malika Davlatova', '+998904445566', 'buxoro'),
('Abdurakhmon Karimov', '+998998887766', 'buxoro');

-- Seed Guide Tariffs
-- Sherzod speaks English, Russian, and Uzbek
INSERT INTO guide_language_tariffs (guide_id, language_code, daily_rate) VALUES
(1, 'EN', 50.00),
(1, 'RU', 40.00),
(1, 'UZ', 35.00);

-- Elena speaks Russian and French
INSERT INTO guide_language_tariffs (guide_id, language_code, daily_rate) VALUES
(2, 'RU', 45.00),
(2, 'FR', 65.00);

-- Jahongir speaks English, Russian, Spanish, and Uzbek
INSERT INTO guide_language_tariffs (guide_id, language_code, daily_rate) VALUES
(3, 'EN', 60.00),
(3, 'RU', 50.00),
(3, 'ES', 70.00),
(3, 'UZ', 45.00);

-- Mukhammadkhon speaks English, Russian, Uzbek
INSERT INTO guide_language_tariffs (guide_id, language_code, daily_rate) VALUES
(4, 'EN', 45.00),
(4, 'RU', 40.00),
(4, 'UZ', 30.00);

-- Malika speaks English, French
INSERT INTO guide_language_tariffs (guide_id, language_code, daily_rate) VALUES
(5, 'EN', 50.00),
(5, 'FR', 60.00);

-- Abdurakhmon speaks German, Russian, Uzbek
INSERT INTO guide_language_tariffs (guide_id, language_code, daily_rate) VALUES
(6, 'DE', 55.00),
(6, 'RU', 45.00),
(6, 'UZ', 35.00);

-- Seed Vehicles
INSERT INTO vehicles (driver_name, driver_phone, car_model, car_number, city_rate, out_of_city_rate, capacity, region) VALUES
('Alisher aka', '+998909998877', 'Chevrolet Cobalt (White)', '01 A 777 BA', 30.00, 45.00, 5, 'samarqand'),
('Doston aka', '+998935554433', 'Chevrolet Gentra (Black)', '01 Z 888 ZZ', 35.00, 50.00, 5, 'samarqand'),
('Sarvar aka', '+998993332211', 'Chevrolet Gentra (Silver)', '01 Y 555 YY', 35.00, 50.00, 5, 'samarqand'),
('Odil aka', '+998901234567', 'Hyundai H1 Minivan (Silver)', '01 X 777 XX', 50.00, 75.00, 8, 'samarqand'),
('Jahongir aka', '+998909876543', 'Isuzu Bus (Turquoise)', '01 B 999 BB', 120.00, 180.00, 20, 'samarqand'),
('Jafar aka', '+998903334455', 'Chevrolet Lacetti (White)', '80 A 123 BZ', 25.00, 40.00, 5, 'buxoro'),
('Rustam aka', '+998936667788', 'Chevrolet Cobalt (Grey)', '80 B 555 YY', 25.00, 40.00, 5, 'buxoro'),
('Bekzod aka', '+998972223344', 'Toyota Hiace Minivan (White)', '80 C 777 XX', 55.00, 80.00, 10, 'buxoro');
