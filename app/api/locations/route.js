import { NextResponse } from 'next/server';
import { supabase, supabaseConfigured } from '@/lib/supabase';

const MOCK_LOCATIONS = [
  { id: 1, name_en: 'Registan Square', name_ru: 'Площадь Регистан', name_uz: 'Registon maydoni', description_en: 'The heart of ancient Samarkand, featuring three magnificent madrasahs.', description_ru: 'Сердце древнего Самарканда, украшенное тремя величественными медресе.', description_uz: 'Uchta muhtasham madrasadan iborat qadimiy Samarqandning yuragi.', latitude: 39.6548, longitude: 66.9757, category: 'historical', is_out_of_city: false, estimated_duration: 120 },
  { id: 2, name_en: 'Gur-e-Amir Mausoleum', name_ru: 'Мавзолей Гур-Эмир', name_uz: 'Go\'ri Amir maqbarasi', description_en: 'The final resting place of Amir Temur (Tamerlane), a masterpiece of Persian-Mongolian architecture.', description_ru: 'Усыпальница Амира Темура (Тамерлана), шедевр персидско-монгольской архитектуры.', description_uz: 'Amir Temur (Tamerlan) ning so\'nggi qo\'nim topgan joyi, me\'moriy durdona.', latitude: 39.6483, longitude: 66.9692, category: 'historical', is_out_of_city: false, estimated_duration: 90 },
  { id: 3, name_en: 'Shah-i-Zinda', name_ru: 'Шахи Зинда', name_uz: 'Shohi Zinda', description_en: 'A breathtaking avenue of blue-domed mausoleums dating back to the 11th-15th centuries.', description_ru: 'Улица лазурных мавзолеев XI–XV веков, поражающая своей красотой.', description_uz: 'Moviy gumbazli maqbaralardan iborat hayratlanarli xiyobon.', latitude: 39.6625, longitude: 66.9878, category: 'historical', is_out_of_city: false, estimated_duration: 90 },
  { id: 4, name_en: 'Bibi-Khanym Mosque', name_ru: 'Мечеть Биби-Ханым', name_uz: 'Bibi Xonim masjidi', description_en: 'One of the largest mosques of the 15th century, built by Tamerlane in honor of his favorite wife.', description_ru: 'Одна из крупнейших мечетей XV века, построенная Тамерланом в честь любимой жены.', description_uz: 'Amir Temurning sevimli rafiqasi sharafiga qurilgan XV asrning eng yirik masjidlaridan biri.', latitude: 39.6593, longitude: 66.9791, category: 'historical', is_out_of_city: false, estimated_duration: 60 },
  { id: 5, name_en: 'Ulugh Beg Observatory', name_ru: 'Обсерватория Улугбека', name_uz: 'Ulug\'bek rasadxonasi', description_en: 'Built in 1420, this observatory was one of the finest in the Islamic world.', description_ru: 'Обсерватория, построенная в 1420 году, бывшая одной из лучших в исламском мире.', description_uz: '1420-yilda qurilgan ushbu rasadxona islom dunyosining ajoyib mo\'jizalaridan biri bo\'lgan.', latitude: 39.6744, longitude: 67.0062, category: 'historical', is_out_of_city: false, estimated_duration: 60 },
  { id: 6, name_en: 'Urgut Mountain Bazaar & Hills', name_ru: 'Ургутский горный базар и горы', name_uz: 'Urgut tog\' bozori va adirlari', description_en: 'Explore traditional crafts at the market and hike through scenic Urgut mountain ranges.', description_ru: 'Посетите традиционный ремесленный базар и прогуляйтесь по живописным горам Ургута.', description_uz: 'Bozorda an\'anaviy hunarmandchilik bilan tanishing va Urgutning go\'zal tog\' tizmalari bo\'ylab sayr qiling.', latitude: 39.4045, longitude: 67.2435, category: 'alternative', is_out_of_city: true, estimated_duration: 240 },
  { id: 7, name_en: 'Omonqo\'ton Pass & Pines', name_ru: 'Перевал Омонкотон', name_uz: 'Omonqo\'ton dovoni va qarag\'aylari', description_en: 'A majestic pine forest and mountain pass with ancient caves and fresh springs.', description_ru: 'Величественный сосновый лес и горный перевал с древними пещерами и источниками.', description_uz: 'Qadimiy g\'orlar va toza buloqlarga ega muhtasham qarag\'ayzor hamda tog\' dovoni.', latitude: 39.3082, longitude: 66.9038, category: 'alternative', is_out_of_city: true, estimated_duration: 180 },
  { id: 8, name_en: 'Konigil Paper Mill', name_ru: 'Бумажная фабрика Конигиль', name_uz: 'Konigil qog\'oz fabrikasi', description_en: 'A peaceful eco-village showcasing the ancient art of Samarkand mulberry paper making.', description_ru: 'Тихая эко-деревня, демонстрирующая древнее искусство изготовления самаркандской шелковой бумаги.', description_uz: 'Samarqand tut qog\'ozini tayyorlashning qadimiy san\'atini namoyish etuvchi tinch eko-qishloq.', latitude: 39.6800, longitude: 67.0180, category: 'alternative', is_out_of_city: true, estimated_duration: 120 },
  { id: 9, name_en: 'National Osh House', name_ru: 'Национальный центр плова', name_uz: 'Milliy palov markazi', description_en: 'Authentic Samarkand Osh prepared in giant cauldrons using traditional recipes.', description_ru: 'Настоящий самаркандский плов, приготовленный в огромных казанах по старинным рецептам.', description_uz: 'Katta qozonlarda an\'anaviy retseptlar bo\'yicha tayyorlangan haqiqiy Samarqand palovi.', latitude: 39.6500, longitude: 66.9800, category: 'food', is_out_of_city: false, estimated_duration: 60 },
  { id: 10, name_en: 'Samarkand Bread Bakery', name_ru: 'Пекарня самаркандских лепешек', name_uz: 'Samarqand nonvoyxonasi', description_en: 'Watch bakers prepare the famous, shiny Samarkand bread in traditional clay ovens.', description_ru: 'Наблюдайте за приготовлением знаменитых блестящих самаркандских лепешек в тандырах.', description_uz: 'Nonvoylar tandirda mashhur, yaltiroq Samarqand nonlarini yopishini kuzating.', latitude: 39.6600, longitude: 66.9780, category: 'food', is_out_of_city: false, estimated_duration: 45 },
  { id: 11, name_en: 'Karimbek Restaurant', name_ru: 'Ресторан Каримбек', name_uz: 'Karimbek restorani', description_en: 'Elegant dining featuring traditional shashlik, manti, and vibrant Uzbek music.', description_ru: 'Элегантный ресторан с традиционными шашлыками, мантами и живой узбекской музыкой.', description_uz: 'An\'anaviy kabob, manti va jonli milliy musiqa taklif etuvchi ajoyib restoran.', latitude: 39.6521, longitude: 66.9587, category: 'food', is_out_of_city: false, estimated_duration: 90 }
];

export async function GET() {
  if (!supabaseConfigured) {
    return NextResponse.json(MOCK_LOCATIONS);
  }

  try {
    const { data, error } = await supabase
      .from('locations')
      .select('*')
      .order('id', { ascending: true });

    if (error) throw error;
    return NextResponse.json(data);
  } catch (err) {
    console.error('Error fetching locations from Supabase:', err);
    return NextResponse.json(MOCK_LOCATIONS);
  }
}
