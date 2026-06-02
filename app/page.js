import React from 'react';
import { supabase, supabaseConfigured } from '@/lib/supabase';
import ClientDashboard from './ClientDashboard';

// MOCK FALLBACK DATA (matching seed SQL)
const MOCK_LOCATIONS = [
  { id: 1, name_en: 'Registan Square', name_ru: 'Площадь Регистан', description_en: 'The heart of ancient Samarkand, featuring three magnificent madrasahs.', description_ru: 'Сердце древнего Самарканда, украшенное тремя величественными медресе.', latitude: 39.6548, longitude: 66.9757, category: 'historical', is_out_of_city: false },
  { id: 2, name_en: 'Gur-e-Amir Mausoleum', name_ru: 'Мавзолей Гур-Эмир', description_en: 'The final resting place of Amir Temur (Tamerlane).', description_ru: 'Усыпальница Амира Темура (Тамерлана), шедевр архитектуры.', latitude: 39.6483, longitude: 66.9692, category: 'historical', is_out_of_city: false },
  { id: 3, name_en: 'Shah-i-Zinda', name_ru: 'Шахи Зинда', description_en: 'A breathtaking avenue of blue-domed mausoleums.', description_ru: 'Улица лазурных мавзолеев XI–XV веков.', latitude: 39.6625, longitude: 66.9878, category: 'historical', is_out_of_city: false },
  { id: 4, name_en: 'Bibi-Khanym Mosque', name_ru: 'Мечеть Биби-Ханым', description_en: 'One of the largest mosques of the 15th century.', description_ru: 'Одна из крупнейших мечетей XV века, построенная в честь любимой жены.', latitude: 39.6593, longitude: 66.9791, category: 'historical', is_out_of_city: false },
  { id: 5, name_en: 'Ulugh Beg Observatory', name_ru: 'Обсерватория Улугбека', description_en: 'Built in 1420, this observatory was a marvel of the Islamic world.', description_ru: 'Историческая обсерватория, бывшая одной из лучших в исламском мире.', latitude: 39.6744, longitude: 67.0062, category: 'historical', is_out_of_city: false },
  { id: 6, name_en: 'Urgut Mountain Bazaar & Hills', name_ru: 'Ургутский горный базар и горы', description_en: 'Explore traditional crafts at the market and hike through scenic Urgut mountain ranges.', description_ru: 'Посетите традиционный базар и прогуляйтесь по живописным горам Ургута.', latitude: 39.4045, longitude: 67.2435, category: 'alternative', is_out_of_city: true },
  { id: 7, name_en: 'Omonqo\'ton Pass & Pines', name_ru: 'Перевал Омонкотон', description_en: 'A majestic pine forest and mountain pass with ancient caves.', description_ru: 'Величественный сосновый лес и горный перевал с древними пещерами.', latitude: 39.3082, longitude: 66.9038, category: 'alternative', is_out_of_city: true },
  { id: 8, name_en: 'Konigil Paper Mill', name_ru: 'Бумажная фабрика Конигиль', description_en: 'A peaceful eco-village showcasing the ancient art of Samarkand mulberry paper.', description_ru: 'Эко-деревня, демонстрирующая искусство изготовления шелковой бумаги.', latitude: 39.6800, longitude: 67.0180, category: 'alternative', is_out_of_city: true },
  { id: 9, name_en: 'National Osh House', name_ru: 'Национальный центр плова', description_en: 'Authentic Samarkand Osh prepared in giant cauldrons.', description_ru: 'Настоящий самаркандский плов, приготовленный в огромных казанах.', latitude: 39.6500, longitude: 66.9800, category: 'food', is_out_of_city: false },
  { id: 10, name_en: 'Samarkand Bread Bakery', name_ru: 'Пекарня самаркандских лепешек', description_en: 'Watch bakers prepare the famous, shiny Samarkand bread in tandyr ovens.', description_ru: 'Наблюдайте за приготовлением знаменитых самаркандских лепешек в тандырах.', latitude: 39.6600, longitude: 66.9780, category: 'food', is_out_of_city: false },
  { id: 11, name_en: 'Karimbek Restaurant', name_ru: 'Ресторан Каримбек', description_en: 'Elegant dining featuring traditional shashlik, manti, and music.', description_ru: 'Ресторан с традиционными шашлыками, мантами и музыкой.', latitude: 39.6521, longitude: 66.9587, category: 'food', is_out_of_city: false }
];

const MOCK_GUIDES = [
  { id: 1, full_name: 'Sherzod Alimov', phone_number: '+998901234567' },
  { id: 2, full_name: 'Elena Petrova', phone_number: '+998937654321' },
  { id: 3, full_name: 'Jahongir Rustamov', phone_number: '+998971112233' }
];

const MOCK_TARIFFS = [
  { id: 1, guide_id: 1, language_code: 'EN', daily_rate: 50.00 },
  { id: 2, guide_id: 1, language_code: 'RU', daily_rate: 40.00 },
  { id: 3, guide_id: 2, language_code: 'RU', daily_rate: 45.00 },
  { id: 4, guide_id: 2, language_code: 'FR', daily_rate: 65.00 },
  { id: 5, guide_id: 3, language_code: 'EN', daily_rate: 60.00 },
  { id: 6, guide_id: 3, language_code: 'RU', daily_rate: 50.00 },
  { id: 7, guide_id: 3, language_code: 'ES', daily_rate: 70.00 }
];

const MOCK_VEHICLES = [
  { id: 1, driver_name: 'Alisher aka', driver_phone: '+998909998877', car_model: 'Chevrolet Cobalt (White)', car_number: '01 A 777 BA', city_rate: 30.00, out_of_city_rate: 45.00, capacity: 5 },
  { id: 2, driver_name: 'Doston aka', driver_phone: '+998935554433', car_model: 'Chevrolet Gentra (Black)', car_number: '01 Z 888 ZZ', city_rate: 35.00, out_of_city_rate: 50.00, capacity: 5 },
  { id: 3, driver_name: 'Sarvar aka', driver_phone: '+998993332211', car_model: 'Chevrolet Gentra (Silver)', car_number: '01 Y 555 YY', city_rate: 35.00, out_of_city_rate: 50.00, capacity: 5 },
  { id: 4, driver_name: 'Odil aka', driver_phone: '+998901234567', car_model: 'Hyundai H1 Minivan (Silver)', car_number: '01 X 777 XX', city_rate: 50.00, out_of_city_rate: 75.00, capacity: 8 },
  { id: 5, driver_name: 'Jahongir aka', driver_phone: '+998909876543', car_model: 'Isuzu Bus (Turquoise)', car_number: '01 B 999 BB', city_rate: 120.00, out_of_city_rate: 180.00, capacity: 20 }
];

export const revalidate = 60; // Revalidate page every 60 seconds (ISR)

async function getLocations() {
  if (!supabaseConfigured) return MOCK_LOCATIONS;
  try {
    const { data, error } = await supabase
      .from('locations')
      .select('*')
      .order('id', { ascending: true });
    if (error) throw error;
    return data && data.length > 0 ? data : MOCK_LOCATIONS;
  } catch (err) {
    console.error('Error fetching locations from Supabase:', err);
    return MOCK_LOCATIONS;
  }
}

async function getGuidesData() {
  const fallback = { guides: MOCK_GUIDES, tariffs: MOCK_TARIFFS };
  if (!supabaseConfigured) return fallback;
  try {
    const { data: guides, error: gError } = await supabase
      .from('guides')
      .select('*')
      .order('id', { ascending: true });
    if (gError) throw gError;

    const { data: tariffs, error: tError } = await supabase
      .from('guide_language_tariffs')
      .select('*');
    if (tError) throw tError;

    return {
      guides: guides && guides.length > 0 ? guides : MOCK_GUIDES,
      tariffs: tariffs && tariffs.length > 0 ? tariffs : MOCK_TARIFFS
    };
  } catch (err) {
    console.error('Error fetching guides from Supabase:', err);
    return fallback;
  }
}

async function getVehicles() {
  if (!supabaseConfigured) return MOCK_VEHICLES;
  try {
    const { data, error } = await supabase
      .from('vehicles')
      .select('*')
      .order('id', { ascending: true });
    if (error) throw error;
    return data && data.length > 0 ? data : MOCK_VEHICLES;
  } catch (err) {
    console.error('Error fetching vehicles from Supabase:', err);
    return MOCK_VEHICLES;
  }
}

export default async function Page() {
  // Fetch database records in parallel on the server
  const [locations, guidesData, vehicles] = await Promise.all([
    getLocations(),
    getGuidesData(),
    getVehicles()
  ]);

  return (
    <ClientDashboard 
      initialLocations={locations} 
      initialGuides={guidesData.guides} 
      initialTariffs={guidesData.tariffs} 
      initialVehicles={vehicles} 
    />
  );
}
