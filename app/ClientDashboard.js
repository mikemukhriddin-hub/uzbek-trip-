'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { Compass, Sparkles, MapPin, CheckCircle, XCircle, Languages, AlertCircle, Lock, Info, Sun, Moon } from 'lucide-react';

// Dynamically import the Map component with no SSR to bypass Leaflet window errors
const Map = dynamic(() => import('@/components/Map'), { 
  ssr: false,
  loading: () => (
    <div style={{
      width: '100%',
      height: '400px',
      borderRadius: '16px',
      backgroundColor: 'var(--bg-dark)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      border: '1px dashed var(--border-card)',
      color: '#9e9e9e'
    }}>
      Loading interactive map...
    </div>
  )
});

import RouteBuilder from '@/components/RouteBuilder';
import VehicleSelector from '@/components/VehicleSelector';
import GuideSelector from '@/components/GuideSelector';
import BackgroundGraphics from '@/components/BackgroundGraphics';
import CheckoutForm from '@/components/CheckoutForm';

const VerificationModal = dynamic(() => import('@/components/VerificationModal'), { ssr: false });
const PaymentPortal = dynamic(() => import('@/components/PaymentPortal'), { ssr: false });
const WikipediaModal = dynamic(() => import('@/components/WikipediaModal'), { ssr: false });
import { MOCK_LOCATIONS, MOCK_GUIDES, MOCK_TARIFFS, MOCK_VEHICLES, UZ_LOCATIONS, TICKET_PRICES, RECOMMENDED_PACKAGES } from '@/lib/mockData';
const WEATHER_DATA = {
  samarqand: { temp: '28°C', uz: '☀️ Havo ochiq va quyoshli', ru: '☀️ Ясно, солнечно', en: '☀️ Clear skies & sunny forecast', nameUz: 'Samarqand', nameRu: 'Самарканде', nameEn: 'Samarkand' },
  buxoro: { temp: '31°C', uz: '☀️ Issiq va quyoshli', ru: '☀️ Ясно, солнечно и жарко', en: '☀️ Warm, sunny & clear', nameUz: 'Buxoro', nameRu: 'Бухаре', nameEn: 'Bukhara' },
  xorazm: { temp: '33°C', uz: '☀️ Quyoshli va cho\'l shamoli', ru: '☀️ Ясно, пустынный бриз', en: '☀️ Sunny, desert breeze', nameUz: 'Xorazm', nameRu: 'Хорезме', nameEn: 'Khorezm' },
  shahrisabz: { temp: '27°C', uz: '☀️ Quyoshli va tog\' havosi', ru: '☀️ Ясно, свежий горный воздух', en: '☀️ Sunny, fresh mountain breeze', nameUz: 'Shahrisabz', nameRu: 'Шахрисабзе', nameEn: 'Shahrisabz' },
  toshkent: { temp: '29°C', uz: '☀️ Muloqot va shahar tarovati', ru: '☀️ Ясно, городской ритm', en: '☀️ Sunny city life', nameUz: 'Toshkent', nameRu: 'Ташкенте', nameEn: 'Tashkent' },
  qoraqalpoq: { temp: '32°C', uz: '☀️ Issiq va quruq sahro havosi', ru: '☀️ Ясно, сухой пустынный воздух', en: '☀️ Hot & dry desert air', nameUz: 'Nukus', nameRu: 'Нукусе', nameEn: 'Nukus' }
};

const ACCOMMODATIONS_DATA = {
  samarqand: [
    { name: 'Registan Plaza Hotel', rating: '⭐️ 4.7', price: '$80-120', descUz: 'Registon maydoniga yaqin, qulay va hashamatli mehmonxona.', descRu: 'Комфортабельный отель рядом с площадью Регистан.', descEn: 'Comfortable hotel close to Registan Square.' },
    { name: 'Konigil Eco Guest House', rating: '⭐️ 4.9', price: '$40-60', descUz: 'Konigil qog\'oz fabrikasi yaqinidagi tabiiy eco guest house.', descRu: 'Эко-гостевой дом в живописной ремесленной деревне.', descEn: 'Scenic eco-guest house in the heart of Konigil village.' }
  ],
  buxoro: [
    { name: 'Lyabi-House Hotel', rating: '⭐️ 4.8', price: '$70-100', descUz: 'Labi Hovuz ansamblining qadimiy qismida joylashgan an\'anaviy mehmonxona.', descRu: 'Традиционный отель в самом сердце старой Бухары.', descEn: 'Traditional hotel located in old Bukhara, close to Lyabi-Khauz.' },
    { name: 'Sufi Oasis Yurt Camp', rating: '⭐️ 4.9', price: '$50-80', descUz: 'Buxoro sahrosidagi qum barxanlari va tuya minish xizmatiga ega o\'tovlar lageri.', descRu: 'Юртовый лагерь в пустыне для любителей экзотики.', descEn: 'Desert yurt camp with camel riding and starry night stays.' }
  ],
  xorazm: [
    { name: 'Hotel Khiva Kala', rating: '⭐️ 4.7', price: '$60-90', descUz: 'Ichan Qal\'aning ichida joylashgan, tomidan panorama ko\'rinadigan mehmonxona.', descRu: 'Отель внутри крепости Ичан-Кала с прекрасной террасой.', descEn: 'Hotel inside the Ichan-Kala fortress with a rooftop view.' }
  ],
  shahrisabz: [
    { name: 'Katta-Langar Guest House', rating: '⭐️ 4.8', price: '$30-50', descUz: 'Shahrisabz tog\'lari va qadimiy Langar ziyoratgohi yaqinidagi shinam mehmon uyi.', descRu: 'Уютный гостевой дом в живописном горном поселке.', descEn: 'Cozy guest house in the scenic Langar mountain village.' }
  ],
  toshkent: [
    { name: 'Lotte City Hotel Tashkent Palace', rating: '⭐️ 4.8', price: '$120-180', descUz: 'Toshkent markazida, Navoiy teatri ro\'parasida joylashgan hashamatli klassik mehmonxona.', descRu: 'Исторический отель в центре Ташкента напротив театра Навои.', descEn: 'Historic hotel in Tashkent center, opposite Navoi Theatre.' }
  ],
  qoraqalpoq: [
    { name: 'Aral Oasis Yurt Camp (Muynaq)', rating: '⭐️ 4.8', price: '$45-75', descUz: 'Mo\'ynoqda sobiq dengiz tubi va kemalar qabristoniga yaqin o\'tovlar lageri.', descRu: 'Юртовый лагерь в Муйнаке у бывшего дна Аральского моря.', descEn: 'Yurt camp in Muynaq near the ship graveyard.' }
  ]
};

const REGIONS_CONFIG = [
  {
    id: 'cross_region',
    emoji: '🇺🇿',
    gradient: 'linear-gradient(135deg, var(--primary-blue) 0%, var(--deep-turquoise) 100%)',
    shadow: 'rgba(255, 91, 0, 0.4)',
    color: 'var(--text-primary)',
    label: { UZ: 'Viloyatlararo', RU: 'Межрегиональный', EN: 'Cross-Region' }
  },
  {
    id: 'toshkent',
    emoji: '🏢',
    gradient: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)',
    shadow: 'rgba(30, 64, 175, 0.35)',
    color: '#fff',
    label: { UZ: 'Toshkent', RU: 'Ташкент', EN: 'Tashkent' }
  },
  {
    id: 'samarqand',
    emoji: '🕌',
    gradient: 'linear-gradient(135deg, #0070c0 0%, #009b9e 100%)',
    shadow: 'rgba(0, 112, 192, 0.35)',
    color: '#fff',
    label: { UZ: 'Samarqand', RU: 'Самарканд', EN: 'Samarkand' }
  },
  {
    id: 'buxoro',
    emoji: '🧱',
    gradient: 'linear-gradient(135deg, #c05a1a 0%, #b25329 100%)',
    shadow: 'rgba(192, 90, 26, 0.35)',
    color: '#fff',
    label: { UZ: 'Buxoro', RU: 'Бухара', EN: 'Bukhara' }
  },
  {
    id: 'xorazm',
    emoji: '🏰',
    gradient: 'linear-gradient(135deg, #028090 0%, #00a896 100%)',
    shadow: 'rgba(2, 128, 144, 0.35)',
    color: '#fff',
    label: { UZ: 'Xorazm', RU: 'Хорезм', EN: 'Khorezm' }
  },
  {
    id: 'qoraqalpoq',
    emoji: '🐫',
    gradient: 'linear-gradient(135deg, #7c3aed 0%, #a78bfa 100%)',
    shadow: 'rgba(124, 58, 237, 0.35)',
    color: '#fff',
    label: { UZ: 'Qoraqalpog\'iston', RU: 'Каракалпакстан', EN: 'Karakalpakstan' }
  },
  {
    id: 'shahrisabz',
    emoji: '🏔',
    gradient: 'linear-gradient(135deg, #008060 0%, #00a36c 100%)',
    shadow: 'rgba(0, 128, 96, 0.35)',
    color: '#fff',
    label: { UZ: 'Shahrisabz', RU: 'Шахрисабз', EN: 'Shahrisabz' }
  }
];

const REGIONAL_COVERS = {
  samarqand: {
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/00/Registan_square_Samarkand.jpg/960px-Registan_square_Samarkand.jpg',
    descUz: 'Samarqand — dunyoning eng qadimiy shaharlaridan biri, Buyuk Ipak yoʻlining chorrahasi va Temuriylar imperiyasining poytaxti. Bu yerda afsonaviy Registon maydoni, Amir Temur maqbarasi (Go\'ri Amir), Shohi Zinda me\'moriy majmuasi va dunyoga mashhur tarixiy obidalar joylashgan. Registonning muhtasham madrasalari o\'zining feruza gumbazlari va koshin bezaklari bilan butun dunyo sayohatchilarini hayratga soladi. Samarqand nonlari va milliy taomlari o\'ziga xos ta\'mga ega.',
    descRu: 'Самарканд — один из старейших городов мира, перекресток Великого шелкового пути и столица империи Темуридов. Здесь находятся легендарная площадь Регистан, мавзолей Амира Темура (Гур-Эмир), архитектурный ансамбль Шахи-Зинда и всемирно известные исторические памятники. Величественные медресе Регистана с бирюзовыми куполами и изразцовым декором поражают воображение путешественников со всего мира.',
    descEn: 'Samarkand is one of the oldest cities in the world, the crossroads of the Silk Road, and the capital of the Timurid Empire. It is home to the legendary Registan Square, the Mausoleum of Amir Timur (Gur-i Amir), the Shah-i-Zinda architectural complex, and world-renowned monuments. The majestic madrasahs of Registan, with their turquoise domes and intricate mosaic tilework, continue to awe travelers worldwide.'
  },
  buxoro: {
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/92/Poi_Kalon.jpg/960px-Poi_Kalon.jpg',
    descUz: 'Buxoro — sharq durdonasi, islom olamining muqaddas shaharlaridan biri va ochiq osmon ostidagi muzey. 2500 yildan ortiq tarixga ega bu shaharda Poi Kalon minorasi, qadimiy Ark qal\'asi, Labi Hovuz ansambli va Chor Minor madrasasi qad rostlab turibdi. Buxoroning tor va qadimiy ko\'chalari, tarixiy savdo toqlari sizni o\'tmishga olib boradi. Buxoro zargarlik, gilamdo\'zlik va misgarlik san\'ati bilan mashhur.',
    descRu: 'Бухара — жемчужина Востока, один из священных городов ислама и настоящий музей под открытым небом. В этом городе с более чем 2500-летней историей возвышаются минарет Пои-Калян, древняя крепость Арк, ансамбль Ляби-Хауз и медресе Чор-Минор. Узкие старинные улочки и торговые купола переносят в атмосферу восточной сказки.',
    descEn: 'Bukhara is the pearl of the East, one of the holy cities of Islam, and a living open-air museum. With a history spanning over 2,500 years, it features the Poi Kalyan Minaret, the ancient Ark of Bukhara fortress, the Lyabi-Khauz ensemble, and Chor Minor. The narrow streets and historical trading domes immerse you in the atmosphere of the ancient Silk Road bazaar.'
  },
  xorazm: {
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7d/Ichan_Kala_Khiva.jpg/960px-Ichan_Kala_Khiva.jpg',
    descUz: 'Xiva — ertaklar shahri, sahro bag\'ridagi tirik obida. Uning markaziy qismi — Ichan Qal\'a to\'liqligicha saqlanib qolgan yagona o\'rta asr shachar-qal\'asidir. Kalta Minor, Islom Xo\'ja minorasi va Tosh Hovli saroyi o\'zining betakror xorazmcha ko\'k koshinlari bilan mashhur. Xiva ko\'chalarida yurganda o\'zingizni ming bir kecha ertaklarida yurgandek his qilasiz.',
    descRu: 'Хива — город-сказка, живой памятник посреди пустыни. Ее исторический центр — Ичан-Кала — единственный полностью сохранившийся средневековый город-крепость в Центральной Азии. Кальта-Минор, минарет Ислам-Ходжа и дворец Таш-Хаули славятся уникальной хорезмской майоликой.',
    descEn: 'Khiva is a fairytale city, a living monument preserved in the heart of the desert. Its inner fortress, Ichan-Kala, is the only completely intact medieval walled city in Central Asia. The Kalta-Minor Minaret, Islam-Khodja Minaret, and Tosh Khauli Palace showcase stunning, unique Khorezmian blue tiles.'
  },
  shahrisabz: {
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ef/Aq_Saroy_Palace_Ruins.jpg/960px-Aq_Saroy_Palace_Ruins.jpg',
    descUz: 'Shahrisabz — Amir Temurning tug\'ilgan va voyaga yetgan shahri, qadimiy Kesh. Bu yerda Temurning eng ulug\'vor loyihasi bo\'lmish Oqsaroy saroyi xarobalari, Dorut Tilovat va Dorus Siyodat majmualari joylashgan. Shahrisabz tog\' etaklarida joylashgan bo\'lib, toza tog\' havosi va boy uzumzorlari bilan azralib turadi.',
    descRu: 'Шахрисабз — родина Амира Темура, древний Кеш. Здесь находятся руины грандиозного дворца Ак-Сарай, крупнейшего проекта Темура, а также мемориальные комплексы Дорут-Тиловат и Дорус-Сиядат. Город расположен у подножия гор и славится свежим горным воздухом и виноградниками.',
    descEn: 'Shakhrisabz is the birthplace of Amir Timur, historically known as Kesh. It houses the ruins of the colossal Ak-Saray Palace—Timur’s grandest building project—as well as the Dorut Tilovat and Dorus Siyodat complexes. Nestled at the foot of the mountains, it offers scenic mountain views and rich vineyards.'
  },
  toshkent: {
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d1/Amir_Timur_Square_Tashkent.jpg/960px-Amir_Timur_Square_Tashkent.jpg',
    descUz: 'Toshkent — O\'zbekistonning poytaxti, Markaziy Osiyodagi eng yirik megapolis. Zamonaviy osmono\'par binolar qadimiy Chorsu bozori, Hazrati Imom (Xast Imom) majmuasi va dunyoning eng qadimiy Usmon Qur\'oni saqlanayotgan kutubxona bilan uyg\'unlashgan. Chiroyli metro bekatlari va yashil bog\'lari bilan tanilgan.',
    descRu: 'Ташкент — столица Узбекистана, крупнейший мегаполис Центральной Азии. Современные небоскребы гармонично сочетаются с древним базаром Чорсу, комплексом Хазрет Имам (Хаст Имам) и библиотекой, где хранится древнейший Коран Усмана. Город славится красивым метро и зелеными парками.',
    descEn: 'Tashkent is the capital of Uzbekistan and the largest metropolis in Central Asia. Modern skyscrapers stand alongside the historic Chorsu Bazaar and Hazrati Imam (Khast Imam) complex, which houses the world\'s oldest Uthman Quran. Tashkent is famous for its uniquely themed metro stations and lush green parks.'
  },
  qoraqalpoq: {
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fd/Nukus_Museum_of_Art.jpg/960px-Nukus_Museum_of_Art.jpg',
    descUz: 'Qoraqalpog\'iston — sirli o\'lka, Nukus shahridagi mashhur Savitskiy muzeyi (sahrodagi Luvr) va ekologik fojia timsoli bo\'lgan Orol dengizi hamda kemalar qabristoni bilan tanilgan. Bu yerda Ustyurt platosi va ko\'plab qadimiy qal\'alar (Chilpiq daxmasi) joylashgan bo\'lib, sarguzasht izlovchilar uchun ajoyib maskandir.',
    descRu: 'Каракалпакстан — загадочный край, известный всемирно популярным музеем Савицкого в Нукусе (Лувр в пустыне), Аральским морем и кладбищем кораблей в Муйнаке. Здесь также находятся плато Устюрт и множество древних крепостей (например, дахма Чилпык).',
    descEn: 'Karakalpakstan is a land of mystery, home to the famous Savitsky Art Museum in Nukus (often called the "Louvre in the Desert"), the Aral Sea ship graveyard in Muynaq, and the vast Ustyurt Plateau. It features ancient fortresses like Chilpyk Dahma, making it a dream destination for adventurers.'
  },
  cross_region: {
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/00/Registan_square_Samarkand.jpg/960px-Registan_square_Samarkand.jpg',
    descUz: 'Viloyatlararo Kombinatsiyalangan tur — butun O\'zbekiston bo\'ylab unutilmas sayohat. Toshkent poytaxtining zamonaviyligi, Samarqand va Buxoroning ko\'hna madrasalari, Xivaning ertaknamo qal\'alari hamda Mo\'ynoqdagi Orol dengizi bo\'ylab yaxlit sayohat dasturini tuzing. Afrosiyob tezyurar poyezdi yordamida shaharlararo silliq sayohat qiling.',
    descRu: 'Межрегиональный комбинированный тур — незабываемое путешествие по всему Узбекистану. Объедините в один маршрут современность Ташкента, древность Самарканда и Бухары, сказочность Хивы и тайны Аральского моря в Муйнаке. Пользуйтесь высокоскоростными поездами.',
    descEn: 'Cross-Region Custom Tour — the ultimate adventure across Uzbekistan. Combine the modern capital of Tashkent, the historic marvels of Samarkand and Bukhara, the fairytale walls of Khiva, and the desert landscapes of Karakalpakstan into one single seamless itinerary.'
  }
};

export default function ClientDashboard({ initialLocations = [], initialGuides = [], initialTariffs = [], initialVehicles = [] }) {
  const [language, setLanguage] = useState('UZ'); // Site UI Language - default to UZ
  const [showLangDropdown, setShowLangDropdown] = useState(false);
  const [theme, setTheme] = useState('light');
  const [locations, setLocations] = useState(() => {
    const base = initialLocations && initialLocations.length > 0 ? initialLocations : MOCK_LOCATIONS;
    return base.map(loc => {
      const dbPrice = loc.ticket_price !== undefined && loc.ticket_price !== null ? parseFloat(loc.ticket_price) : 0;
      const fallbackPrice = TICKET_PRICES[loc.id] !== undefined ? TICKET_PRICES[loc.id] : 0;
      const finalPrice = dbPrice > 0 ? dbPrice : (fallbackPrice > 0 ? fallbackPrice : dbPrice);
      
      const mockLoc = MOCK_LOCATIONS.find(m => m.name_en === loc.name_en);
      return {
        ...loc,
        name_uz: loc.name_uz || UZ_LOCATIONS[loc.id]?.name || loc.name_en,
        description_uz: loc.description_uz || UZ_LOCATIONS[loc.id]?.desc || loc.description_en,
        ticket_price: finalPrice,
        wikipedia_title_en: loc.wikipedia_title_en || mockLoc?.wikipedia_title_en || '',
        wikipedia_title_ru: loc.wikipedia_title_ru || mockLoc?.wikipedia_title_ru || '',
        wikipedia_title_uz: loc.wikipedia_title_uz || mockLoc?.wikipedia_title_uz || ''
      };
    });
  });
  const [guides, setGuides] = useState(initialGuides && initialGuides.length > 0 ? initialGuides : MOCK_GUIDES);
  const [tariffs, setTariffs] = useState(initialTariffs && initialTariffs.length > 0 ? initialTariffs : MOCK_TARIFFS);
  const [vehicles, setVehicles] = useState(initialVehicles && initialVehicles.length > 0 ? initialVehicles : MOCK_VEHICLES);

  const [activeRegion, setActiveRegion] = useState('samarqand'); // 'samarqand', 'buxoro', 'xorazm', 'shahrisabz', 'toshkent', 'qoraqalpoq', or 'cross_region'
  const [activeTab, setActiveTab] = useState('explore');
  const [isScrolled, setIsScrolled] = useState(false);
  const [isDescExpanded, setIsDescExpanded] = useState(false);
  const isLoadedRef = useRef(false);
  const [crossRegionStart, setCrossRegionStart] = useState('samarqand'); // starting point for cross-region tours
  const [crossRegionLocationFilter, setCrossRegionLocationFilter] = useState('all'); // sub-region browsing filter

  // Constructor States
  const [selectedLocations, setSelectedLocations] = useState([]);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [selectedGuide, setSelectedGuide] = useState(null);
  const [tourDurationType, setTourDurationType] = useState('single'); // 'single' or 'multi'
  const [numDays, setNumDays] = useState(2); // 2 to 5 days
  const [activePlanningDay, setActivePlanningDay] = useState(1); // active day for planning (1 to numDays)

  // Drag and Drop States
  const [draggedLocationId, setDraggedLocationId] = useState(null);
  const [dragOverLocationId, setDragOverLocationId] = useState(null);
  const [dragOverDay, setDragOverDay] = useState(null);
  const [wikiLocation, setWikiLocation] = useState(null);

  // Sync region switches, reset selections and apply theme data-attribute
  useEffect(() => {
    setSelectedLocations([]);
    setSelectedVehicle(null);
    setSelectedGuide(null);
    setCrossRegionLocationFilter(activeRegion === 'cross_region' ? crossRegionStart : 'all');
    setTourDurationType('single');
    setNumDays(2);
    setActivePlanningDay(1);
    setDraggedLocationId(null);
    setDragOverLocationId(null);
    setDragOverDay(null);
    setIsDescExpanded(false);
    if (typeof document !== 'undefined') {
      document.body.setAttribute('data-region', activeRegion);
    }
  }, [activeRegion]);

  // Scroll listener for fixed navbar transparent-to-solid transitions
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Reset selected locations and other components when changing between single-day and multi-day tours
  useEffect(() => {
    setSelectedLocations([]);
    setSelectedVehicle(null);
    setSelectedGuide(null);
    setActivePlanningDay(1);
  }, [tourDurationType]);

  // Reset selected guide & driver when starting region changes in cross-region mode
  useEffect(() => {
    setSelectedVehicle(null);
    setSelectedGuide(null);
    setCrossRegionLocationFilter(crossRegionStart);
  }, [crossRegionStart]);

  const filteredLocations = activeRegion === 'cross_region'
    ? (crossRegionLocationFilter === 'all'
      ? locations
      : locations.filter(loc => (loc.region || 'samarqand') === crossRegionLocationFilter))
    : locations.filter(loc => (loc.region || 'samarqand') === activeRegion);

  const filteredGuides = activeRegion === 'cross_region'
    ? guides.filter(g => (g.region || 'samarqand') === crossRegionStart)
    : guides.filter(g => (g.region || 'samarqand') === activeRegion);

  const filteredVehicles = activeRegion === 'cross_region'
    ? vehicles.filter(v => (v.region || 'samarqand') === crossRegionStart)
    : vehicles.filter(v => (v.region || 'samarqand') === activeRegion);
  const [selectedGuideLanguage, setSelectedGuideLanguage] = useState('EN');

  // Checkout & OTP verification states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [otpModalOpen, setOtpModalOpen] = useState(false);
  const [bookingData, setBookingData] = useState(null);
  const [createdBookingId, setCreatedBookingId] = useState(null);
  const [verificationError, setVerificationError] = useState('');
  const [successPage, setSuccessPage] = useState(false);
  const [paymentOpen, setPaymentOpen] = useState(false);
  
  // Cancellation states
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [bookingCancelled, setBookingCancelled] = useState(false);

  // Sync state loaded from localStorage if user has a preference saved
  useEffect(() => {
    const savedTheme = localStorage.getItem('site_theme') || 'light';
    setTheme(savedTheme);
    document.body.setAttribute('data-theme', savedTheme);

    const savedLang = localStorage.getItem('site_lang');
    if (savedLang) {
      Promise.resolve().then(() => {
        setLanguage(savedLang);
      });
    } else {
      // Auto-detect browser language
      const browserLang = typeof navigator !== 'undefined' ? (navigator.language || navigator.userLanguage || '') : '';
      let defaultLang = 'UZ';
      if (browserLang.toLowerCase().startsWith('ru')) {
        defaultLang = 'RU';
      } else if (browserLang.toLowerCase().startsWith('en')) {
        defaultLang = 'EN';
      }
      Promise.resolve().then(() => {
        setLanguage(defaultLang);
        localStorage.setItem('site_lang', defaultLang);
      });
    }

    const savedRegion = localStorage.getItem('active_region');
    if (savedRegion) {
      Promise.resolve().then(() => {
        setActiveRegion(savedRegion);
        isLoadedRef.current = true;
      });
    } else {
      isLoadedRef.current = true;
    }
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
    document.body.setAttribute('data-theme', nextTheme);
    localStorage.setItem('site_theme', nextTheme);
  };

  // Save activeRegion to localStorage when it changes to persist it on refresh
  useEffect(() => {
    if (isLoadedRef.current && activeRegion) {
      localStorage.setItem('active_region', activeRegion);
    }
  }, [activeRegion]);

  // Update selected guide language automatically if guide list resets
  useEffect(() => {
    Promise.resolve().then(() => {
      setSelectedGuide(null);
    });
  }, [selectedGuideLanguage]);

  // Determine if route includes any mountain/out-of-city zones
  const isOutOfCityRoute = activeRegion === 'cross_region' || selectedLocations.some((loc) => loc.is_out_of_city);

  const totalDuration = selectedLocations.reduce((sum, loc) => sum + (loc.estimated_duration || 0), 0);

  const formatTotalDuration = (mins, lang) => {
    if (!mins) return '';
    const hours = mins / 60;
    const wholeHours = Math.floor(hours);
    const remMins = mins % 60;
    if (wholeHours === 0) {
      if (lang === 'UZ') return `${remMins} daqiqa`;
      if (lang === 'RU') return `${remMins} мин.`;
      return `${remMins} mins`;
    }
    if (lang === 'UZ') {
      return remMins > 0 
        ? `${wholeHours} soat ${remMins} daqiqa`
        : `${wholeHours} soat`;
    } else if (lang === 'RU') {
      return remMins > 0 
        ? `${wholeHours} ч. ${remMins} мин.`
        : `${wholeHours} ч.`;
    } else {
      return remMins > 0 
        ? `${wholeHours} hrs ${remMins} mins`
        : `${wholeHours} hrs`;
    }
  };

  const toggleLanguage = () => {
    setLanguage((prev) => (prev === 'EN' ? 'RU' : 'EN'));
  };

  const handleToggleLocation = (loc) => {
    setSelectedLocations((prev) => {
      const exists = prev.some((item) => item.id === loc.id);
      if (exists) {
        return prev.filter((item) => item.id !== loc.id);
      } else {
        if (tourDurationType === 'multi') {
          return [...prev, { ...loc, selectedDay: activePlanningDay }];
        } else {
          return [...prev, loc];
        }
      }
    });
  };

  const handleSelectPackage = (pkg) => {
    const isAlreadySelected = pkg.locationNames.every(name => 
      selectedLocations.some(loc => loc.name_en.toLowerCase() === name.toLowerCase())
    ) && selectedLocations.length === pkg.locationNames.length;

    if (isAlreadySelected) {
      setSelectedLocations([]);
      return;
    }

    const pkgLocs = pkg.locationNames.map(name => {
      return locations.find(loc => loc.name_en.toLowerCase() === name.toLowerCase());
    }).filter(Boolean);

    setSelectedLocations(pkgLocs.map((loc, idx) => {
      if (tourDurationType === 'multi') {
        const day = (idx % numDays) + 1;
        return { ...loc, selectedDay: day };
      }
      return loc;
    }));
  };

  const handleUpdateLocationDay = (locId, newDay) => {
    setSelectedLocations((prev) =>
      prev.map((item) =>
        item.id === locId ? { ...item, selectedDay: newDay } : item
      )
    );
  };

  // --- DRAG & DROP HANDLERS FOR ROUTE REORDERING ---
  const handleDragStart = (e, locId) => {
    setDraggedLocationId(locId);
    e.dataTransfer.setData('text/plain', locId.toString());
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragEnd = () => {
    setDraggedLocationId(null);
    setDragOverLocationId(null);
    setDragOverDay(null);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDropOnLocation = (e, targetLoc) => {
    e.preventDefault();
    const draggedIdStr = e.dataTransfer.getData('text/plain');
    const draggedId = parseInt(draggedIdStr, 10);
    if (!draggedId || draggedId === targetLoc.id) {
      handleDragEnd();
      return;
    }

    setSelectedLocations((prev) => {
      const draggedLoc = prev.find(item => item.id === draggedId);
      if (!draggedLoc) return prev;

      // Filter out the dragged location from its original position
      const remaining = prev.filter(item => item.id !== draggedId);

      // Find the index of target location in remaining array
      const targetIdx = remaining.findIndex(item => item.id === targetLoc.id);
      if (targetIdx === -1) return prev;

      // Update the day of the dragged item to target's day
      const updatedDraggedLoc = {
        ...draggedLoc,
        selectedDay: targetLoc.selectedDay || 1
      };

      // Insert dragged item at the target position
      const newList = [...remaining];
      newList.splice(targetIdx, 0, updatedDraggedLoc);
      return newList;
    });

    handleDragEnd();
  };

  const handleDropOnDay = (e, targetDay) => {
    e.preventDefault();
    const draggedIdStr = e.dataTransfer.getData('text/plain');
    const draggedId = parseInt(draggedIdStr, 10);
    if (!draggedId) {
      handleDragEnd();
      return;
    }

    setSelectedLocations((prev) => {
      const draggedLoc = prev.find(item => item.id === draggedId);
      if (!draggedLoc) return prev;

      // Update day
      const updatedDraggedLoc = {
        ...draggedLoc,
        selectedDay: targetDay
      };

      // Filter out original
      const remaining = prev.filter(item => item.id !== draggedId);

      // Append to the end of the day or just push it
      return [...remaining, updatedDraggedLoc];
    });

    handleDragEnd();
  };

  const handleMoveLocationUp = (locId) => {
    setSelectedLocations((prev) => {
      const idx = prev.findIndex(item => item.id === locId);
      if (idx === -1) return prev;
      const currentDay = prev[idx].selectedDay || 1;
      let prevSameDayIdx = -1;
      for (let i = idx - 1; i >= 0; i--) {
        if ((prev[i].selectedDay || 1) === currentDay) {
          prevSameDayIdx = i;
          break;
        }
      }
      if (prevSameDayIdx === -1) return prev;
      const newLocs = [...prev];
      const temp = newLocs[idx];
      newLocs[idx] = newLocs[prevSameDayIdx];
      newLocs[prevSameDayIdx] = temp;
      return newLocs;
    });
  };

  const handleMoveLocationDown = (locId) => {
    setSelectedLocations((prev) => {
      const idx = prev.findIndex(item => item.id === locId);
      if (idx === -1) return prev;
      const currentDay = prev[idx].selectedDay || 1;
      let nextSameDayIdx = -1;
      for (let i = idx + 1; i < prev.length; i++) {
        if ((prev[i].selectedDay || 1) === currentDay) {
          nextSameDayIdx = i;
          break;
        }
      }
      if (nextSameDayIdx === -1) return prev;
      const newLocs = [...prev];
      const temp = newLocs[idx];
      newLocs[idx] = newLocs[nextSameDayIdx];
      newLocs[nextSameDayIdx] = temp;
      return newLocs;
    });
  };


  const handleSelectVehicle = (vehicle) => {
    setSelectedVehicle(vehicle);
  };

  const handleSelectGuide = (guide) => {
    setSelectedGuide((prev) => (prev && prev.id === guide?.id) ? null : guide);
  };

  const handleSelectGuideLanguage = (langCode) => {
    setSelectedGuideLanguage(langCode);
  };

  // Submit checkout form -> Generates OTP and opens OTP dialog
  const handleSubmitBooking = async (formData) => {
    setIsSubmitting(true);
    setVerificationError('');

    const payload = {
      touristName: formData.name,
      touristEmail: formData.email,
      touristPhone: formData.phone,
      bookingDate: formData.date,
      guideId: selectedGuide?.id || null,
      vehicleId: selectedVehicle?.id || null,
      totalPrice: formData.totalPrice,
      customerLanguage: language,
      passengerCount: formData.passengerCount || 1,
      bookingType: formData.bookingType || 'private',
      locations: selectedLocations.map((loc, idx) => {
        if (tourDurationType === 'multi') {
          const day = loc.selectedDay || 1;
          const dayIndex = selectedLocations.slice(0, idx).filter(l => (l.selectedDay || 1) === day).length;
          return {
            locationId: loc.id,
            visitOrder: day * 100 + (dayIndex + 1),
          };
        } else {
          return {
            locationId: loc.id,
            visitOrder: idx + 1,
          };
        }
      }),
      region: activeRegion,
      tourDurationType,
      numDays: tourDurationType === 'multi' ? numDays : 1,
    };

    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.message || 'Booking creation failed.');
      }

      setCreatedBookingId(data.bookingId);
      setBookingData({
        ...payload,
        emailSent: data.emailSent,
        otpCode: data.otpCode,
        token: data.token
      });
      setOtpModalOpen(true);
    } catch (err) {
      alert(`Error: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Verify OTP code submitted in modal
  const handleVerifyOtp = async (code) => {
    setIsVerifying(true);
    setVerificationError('');

    try {
      const res = await fetch('/api/bookings/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId: createdBookingId,
          code,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Invalid verification code.');
      }

      setOtpModalOpen(false);

      // 🧪 TEST MODE: Auto-confirm booking on the backend to trigger emails/Telegram alerts
      const testTxId = 'TEST_' + Date.now();
      try {
        await fetch('/api/bookings/payment/confirm', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            bookingId: createdBookingId,
            paymentMethod: 'test_skip',
            paymentTxId: testTxId,
            depositAmount: 0,
          }),
        });
      } catch (confirmErr) {
        console.error('Failed to confirm booking on backend:', confirmErr.message);
      }

      setBookingData((prev) => ({
        ...prev,
        paymentMethod: 'test_skip',
        paymentTxId: testTxId,
        depositAmount: 0,
      }));
      setSuccessPage(true);
      // To re-enable payment, comment the lines above and uncomment below:
      // setPaymentOpen(true);
    } catch (err) {
      setVerificationError(err.message);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendOtp = async (bookingId) => {
    const res = await fetch('/api/bookings/resend', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bookingId }),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || 'Failed to resend code.');
    }
    setBookingData((prev) => ({
      ...prev,
      otpCode: data.otpCode
    }));
  };

  const handleCancelBooking = async () => {
    if (!createdBookingId) return;
    setIsCancelling(true);
    try {
      const res = await fetch('/api/bookings/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId: createdBookingId, token: bookingData?.token }),
      });
      if (res.ok) {
        setBookingCancelled(true);
        setShowCancelConfirm(false);
      } else {
        const d = await res.json();
        let errorMsg = d.message;
        if (d.message === 'Missing booking ID or token.') {
          errorMsg = language === 'UZ' 
            ? 'Buyurtma ID si yoki tokeni kiritilmagan.' 
            : language === 'RU' 
              ? 'Отсутствует ID бронирования или токен.' 
              : 'Missing booking ID or token.';
        } else if (d.message === 'Forbidden: Invalid token.') {
          errorMsg = language === 'UZ' 
            ? 'Ruxsat berilmadi: Yaroqsiz token.' 
            : language === 'RU' 
              ? 'Доступ запрещен: Неверный токен.' 
              : 'Forbidden: Invalid token.';
        }
        alert(errorMsg || (language === 'UZ' ? 'Buyurtmani bekor qilib bo\'lmadi.' : language === 'RU' ? 'Не удалось отменить бронирование.' : 'Failed to cancel booking.'));
      }
    } catch (err) {
      alert(language === 'UZ' ? `Xatolik: ${err.message}` : language === 'RU' ? `Ошибка: ${err.message}` : `Error: ${err.message}`);
    } finally {
      setIsCancelling(false);
    }
  };

  const t = {
    heroTitle: activeRegion === 'cross_region'
      ? (language === 'RU' ? 'Комбинированный тур по Узбекистану' : language === 'UZ' ? 'O\'zbekiston Kombinatsiyalangan CrafTour' : 'Uzbekistan Cross-Region CrafTour')
      : activeRegion === 'qoraqalpoq'
      ? (language === 'RU' ? 'Каракалпакстан CrafTour' : language === 'UZ' ? 'Qoraqalpog\'iston CrafTour' : 'Karakalpakstan CrafTour')
      : activeRegion === 'toshkent'
      ? (language === 'RU' ? 'Ташкент CrafTour' : 'Toshkent CrafTour')
      : activeRegion === 'shahrisabz'
      ? (language === 'RU' ? 'Шахрисабз CrafTour' : 'Shahrisabz CrafTour')
      : activeRegion === 'xorazm'
      ? (language === 'RU' ? 'Хорезм CrafTour' : 'Xorazm CrafTour')
      : activeRegion === 'buxoro'
      ? (language === 'RU' ? 'Бухара CrafTour' : 'Buxoro CrafTour')
      : (language === 'RU' ? 'Самарканд CrafTour' : 'Samarqand CrafTour'),
    heroSubtitle: activeRegion === 'cross_region'
      ? (language === 'UZ'
        ? 'O\'zbekistonning bir nechta viloyatlari bo\'ylab o\'zingizning shaxsiy sayohatingizni yarating. Gid va transportni istalgan shahardan boshlang!'
        : language === 'RU'
        ? 'Создайте свой собственный уникальный маршрут по нескольким регионам Узбекистана. Выберите гида и транспорт из города старта.'
        : 'Craft your custom itinerary across multiple provinces of Uzbekistan. Hire guides and drivers starting from your pickup city.')
      : activeRegion === 'qoraqalpoq'
      ? (language === 'UZ'
        ? 'Orol dengizi, Ustyurt platosi va Savitskiy muzeyi bo\'ylab o\'zingizning shaxsiy sayohatingizni yarating'
        : language === 'RU'
        ? 'Создайте своё идеальное путешествие по Каракалпакстану — к Аральскому морю, плато Устюрт и музею Савицкого'
        : 'Craft your own tailor-made adventure in Karakalpakstan — to the Aral Sea, Ustyurt Plateau, and Savitsky Museum')
      : activeRegion === 'toshkent'
      ? (language === 'UZ'
        ? 'Zamonaviy va qadimiy Toshkentning diqqatga zobor joylari bo\'ylab o\'zingizning shaxsiy sayohatingizni yarating'
        : language === 'RU'
        ? 'Создайте своё идеальное путешествие по великолепному Ташкенту — столице Узбекистана'
        : 'Craft your own tailor-made adventure in magnificent Tashkent — the capital of Uzbekistan')
      : activeRegion === 'shahrisabz'
      ? (language === 'UZ'
        ? 'Amir Temur vatani - Shahrisabzning ko\'hna saroy va maqbaralari bo\'ylab sayohatingizni o\'zingiz yarating'
        : language === 'RU'
        ? 'Сконструируйте собственное идеальное путешествие на родину Амира Темура в Шахрисабз'
        : 'Craft your own tailor-made adventure in Amir Temur\'s home city of Shahrisabz')
      : activeRegion === 'xorazm'
      ? (language === 'UZ'
        ? 'Ko\'hna Xivaning devorlari, gumbaz va minoralari bo\'ylab sayohatingizni o\'zingiz yarating'
        : language === 'RU' 
        ? 'Сконструируйте собственное идеальное путешествие в древнюю Хиву'
        : 'Craft your own tailor-made adventure in ancient Khiva')
      : activeRegion === 'buxoro'
      ? (language === 'UZ'
        ? 'Ko\'hna Buxoroning ko\'cha va obidalari bo\'ylab sayohatingizni o\'zingiz yarating'
        : language === 'RU' 
        ? 'Сконструируйте собственное идеальное путешествие в благородную Бухару'
        : 'Craft your own tailor-made adventure in noble Bukhara')
      : (language === 'UZ'
        ? 'Afsonaviy Samarqand bo\'ylab shaxsiy sayohatingizni o\'zingiz yarating'
        : language === 'RU' 
        ? 'Сконструируйте собственное идеальное путешествие в легендарный Самарканд'
        : 'Craft your own tailor-made adventure in legendary Samarkand'),
    step1: language === 'UZ' ? '🗺 1-qadam: Marshrutni shakllantiring' : language === 'RU' ? '🗺 Шаг 1: Спланируйте маршрут' : '🗺 Step 1: Craft Your Route',
    step2: language === 'UZ' ? '🚗 2-qadam: Transportni tanlang' : language === 'RU' ? '🚗 Шаг 2: Выберите транспорт' : '🚗 Step 2: Choose Transport',
    step3: language === 'UZ' ? '🗣 3-qadam: Gidni tanlang' : language === 'RU' ? '🗣 Шаг 3: Выберите гида' : '🗣 Step 3: Choose Expert Guide',
    step4: language === 'UZ' ? '👤 4-qadam: Buyurtmani rasmiylashtiring' : language === 'RU' ? '👤 Шаг 4: Подтвердите заказ' : '👤 Step 4: Checkout',
    successTitle: language === 'UZ' ? '🎉 Buyurtma yuborildi!' : language === 'RU' ? '🎉 Заявка отправлена!' : '🎉 Booking Submitted!',
    successSub: language === 'UZ'
      ? 'Elektron pochtangiz tasdiqlandi. Batafsil ma\'lumotlarni kelishib olish uchun menejerimiz tez orada siz bilan WhatsApp orqali bog\'lanadi.'
      : language === 'RU' 
      ? 'Ваша почта подтверждена. Наш менеджер скоро свяжется с вами по WhatsApp для окончательного подтверждения.' 
      : 'Your email has been verified. Our manager will contact you shortly on WhatsApp to finalize details.',
    successDetailTitle: language === 'UZ' ? 'Tur tafsilotlari:' : language === 'RU' ? 'Детали тура:' : 'Tour Details:',
    successGuide: language === 'UZ' ? 'Gid:' : language === 'RU' ? 'Гид:' : 'Guide:',
    successDriver: language === 'UZ' ? 'Haydovchi:' : language === 'RU' ? 'Водитель:' : 'Driver:',
    successTotal: language === 'UZ' ? 'Taxminiy qiymat:' : language === 'RU' ? 'Стоимость:' : 'Estimated Cost:',
    successBack: language === 'UZ' ? 'Yangi tur yaratish' : language === 'RU' ? 'Создать новый тур' : 'Create Another Tour',
    disclaimer: language === 'UZ' ? 'Lokatsiya tafsilotlarini o\'qish uchun xaritadagi belgilarni bosing.' : language === 'RU' ? 'Нажмите на маркеры карты, чтобы прочитать детали локаций.' : 'Click map markers to read location details.',
    selectedCount: language === 'UZ' ? 'Tanlangan joylar soni:' : language === 'RU' ? 'Выбрано мест:' : 'Selected locations:',
    totalDurationLabel: language === 'UZ' ? 'Umumiy sayohat vaqti:' : language === 'RU' ? 'Общее время:' : 'Total duration:',
  };

  if (successPage) {
    return (
      <main style={{
        maxWidth: '600px',
        margin: '60px auto',
        padding: '24px',
      }} className="animate-fade-in">
        <div className="glass-container gold-glow" style={{ padding: '36px', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {bookingCancelled ? (
            <>
              <div style={{
                width: '72px',
                height: '72px',
                borderRadius: '50%',
                backgroundColor: 'rgba(239, 68, 68, 0.15)',
                color: '#ef4444',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto',
              }}>
                <XCircle size={38} />
              </div>

              <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#fff' }}>
                {language === 'UZ' ? '❌ Buyurtma bekor qilindi' : language === 'RU' ? '❌ Бронирование отменено' : '❌ Booking Cancelled'}
              </h2>
              
              <p style={{ fontSize: '15px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                {language === 'UZ'
                  ? (selectedGuide && selectedVehicle)
                    ? `Sayohat bekor qilindi. Gidingiz ${selectedGuide.full_name} va haydovchingiz ${selectedVehicle.driver_name} bu haqda ogohlantirildi.`
                    : selectedGuide
                      ? `Sayohat bekor qilindi. Gidingiz ${selectedGuide.full_name} bu haqda ogohlantirildi.`
                      : selectedVehicle
                        ? `Sayohat bekor qilindi. Haydovchingiz ${selectedVehicle.driver_name} bu haqda ogohlantirildi.`
                        : `Sayohat bekor qilindi.`
                  : language === 'RU'
                  ? (selectedGuide && selectedVehicle)
                    ? `Поездка отменена. Ваш гид ${selectedGuide.full_name} и водитель ${selectedVehicle.driver_name} были оповещены и освобождены.`
                    : selectedGuide
                      ? `Поездка отменена. Ваш гид ${selectedGuide.full_name} был оповещен.`
                      : selectedVehicle
                        ? `Поездка отменена. Ваш водитель ${selectedVehicle.driver_name} был оповещен.`
                        : `Поездка отменена.`
                  : (selectedGuide && selectedVehicle)
                    ? `Your trip has been cancelled. Your guide ${selectedGuide.full_name} and driver ${selectedVehicle.driver_name} have been notified.`
                    : selectedGuide
                      ? `Your trip has been cancelled. Your guide ${selectedGuide.full_name} has been notified.`
                      : selectedVehicle
                        ? `Your trip has been cancelled. Your driver ${selectedVehicle.driver_name} has been notified.`
                        : `Your trip has been cancelled.`}
              </p>
            </>
          ) : (
            <>
              <div style={{
                width: '72px',
                height: '72px',
                borderRadius: '50%',
                backgroundColor: 'rgba(10, 185, 129, 0.15)',
                color: '#10b981',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto',
              }}>
                <CheckCircle size={38} />
              </div>

              <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#fff' }}>{t.successTitle}</h2>
              
              <p style={{ fontSize: '15px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                {t.successSub}
              </p>

              <div style={{
                textAlign: 'left',
                padding: '20px',
                backgroundColor: 'var(--bg-card)',
                borderRadius: '12px',
                border: '1px solid rgba(212, 175, 55, 0.2)',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
                fontSize: '14px'
              }}>
                <h4 style={{ fontWeight: '700', color: 'var(--primary-blue)', borderBottom: '1px solid var(--border-card)', paddingBottom: '6px' }}>
                  {t.successDetailTitle}
                </h4>
                 <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>{t.successGuide}</span>
                  <strong style={{ color: 'var(--text-primary)' }}>
                    {selectedGuide 
                      ? `${selectedGuide.full_name} (${selectedGuideLanguage})` 
                      : (language === 'UZ' ? 'Gidsiz' : language === 'RU' ? 'Без гида' : 'No guide')}
                  </strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>{t.successDriver}</span>
                  <strong style={{ color: 'var(--text-primary)' }}>
                    {selectedVehicle 
                      ? `${selectedVehicle.driver_name} (${selectedVehicle.car_model})` 
                      : (language === 'UZ' ? 'Transportsiz (Faqat marshrut)' : language === 'RU' ? 'Без транспорта' : 'No driver (Itinerary only)')}
                  </strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>{t.successTotal}</span>
                  <strong style={{ color: 'var(--text-primary)' }}>${bookingData?.totalPrice?.toFixed(2)}</strong>
                </div>
                {bookingData?.depositAmount !== undefined && (
                  <>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>
                        {language === 'UZ' ? 'To\'langan depozit (20%):' : language === 'RU' ? 'Оплаченный депозит (20%):' : 'Paid Deposit (20%):'}
                      </span>
                      <strong style={{ color: '#10b981' }}>
                        ${bookingData.depositAmount.toFixed(2)} ({bookingData.paymentMethod?.toUpperCase()})
                      </strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>
                        {language === 'UZ' ? 'Qoldiq (joyida to\'lanadi):' : language === 'RU' ? 'Остаток к оплате (на месте):' : 'Remaining Balance (to pay in cash):'}
                      </span>
                      <strong style={{ color: '#fbbf24' }}>
                        ${(bookingData.totalPrice - bookingData.depositAmount).toFixed(2)}
                      </strong>
                    </div>
                  </>
                )}
              </div>

              <div style={{ marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setShowCancelConfirm(true)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#64748b',
                    textDecoration: 'underline',
                    fontSize: '12px',
                    cursor: 'pointer',
                    transition: 'color 0.2s',
                  }}
                  onMouseEnter={(e) => e.target.style.color = '#ef4444'}
                  onMouseLeave={(e) => e.target.style.color = '#64748b'}
                >
                  {language === 'UZ' ? 'Ushbu buyurtmani bekor qilish?' : language === 'RU' ? 'Отменить это бронирование?' : 'Need to cancel this booking?'}
                </button>
              </div>
            </>
          )}

          <button
            onClick={() => {
              setSelectedLocations([]);
              setSelectedVehicle(null);
              setSelectedGuide(null);
              setSuccessPage(false);
              setBookingCancelled(false);
            }}
            className="btn-gold"
            style={{ padding: '12px 24px', alignSelf: 'center', marginTop: '10px' }}
          >
            {t.successBack}
          </button>
        </div>

        {/* Cancellation Warning Modal */}
        {showCancelConfirm && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(5, 7, 16, 0.85)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '16px',
          }}>
            <div 
              className="glass-container gold-glow animate-fade-in" 
              style={{
                width: '100%',
                maxWidth: '460px',
                padding: '30px',
                border: '1px solid rgba(239, 68, 68, 0.4)',
                backgroundColor: '#0f172a',
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                gap: '20px'
              }}
            >
              <div style={{
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                backgroundColor: 'rgba(239, 68, 68, 0.12)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ef4444',
                margin: '0 auto'
              }}>
                <XCircle size={32} />
              </div>

              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#fff', marginBottom: '8px' }}>
                  {language === 'UZ' ? 'Buyurtmani bekor qilishni tasdiqlaysizmi?' : language === 'RU' ? 'Подтверждаете отмену бронирования?' : 'Confirm Booking Cancellation?'}
                </h3>
                <p style={{ fontSize: '13px', color: '#cbd5e1', lineHeight: 1.6 }}>
                  {language === 'UZ'
                    ? (selectedGuide && selectedVehicle)
                      ? `Tajribali gidingiz (${selectedGuide.full_name}) va haydovchingiz (${selectedVehicle.driver_name}) siz uchun ushbu kunni band qilib qo'yishgan. Buyurtmani bekor qilsangiz, ularning kunlik jadvali bo'shatiladi. Bekor qilish bepul.`
                      : selectedGuide
                        ? `Tajribali gidingiz (${selectedGuide.full_name}) siz uchun ushbu kunni band qilib qo'ygan. Buyurtmani bekor qilsangiz, uning kunlik jadvali bo'shatiladi. Bekor qilish bepul.`
                        : selectedVehicle
                          ? `Haydovchingiz (${selectedVehicle.driver_name}) siz uchun ushbu kunni band qilib qo'ygan. Buyurtmani bekor qilsangiz, uning kunlik jadvali bo'shatiladi. Bekor qilish bepul.`
                          : `Ushbu sayohat buyurtmasini bekor qilishga ishonchingiz komilmi? Bekor qilish bepul.`
                    : language === 'RU'
                    ? (selectedGuide && selectedVehicle)
                      ? `Ваш гид (${selectedGuide.full_name}) и водитель (${selectedVehicle.driver_name}) забронировали этот день для вас. Если вы отмените заказ, их график будет освобожден. Отмена бесплатная.`
                      : selectedGuide
                        ? `Ваш гид (${selectedGuide.full_name}) забронировал этот день для вас. Если вы отмените заказ, его график будет освобожден. Отмена бесплатная.`
                        : selectedVehicle
                          ? `Ваш водитель (${selectedVehicle.driver_name}) забронировал этот день для вас. Если вы отмените заказ, его график будет освобожден. Отмена бесплатная.`
                          : `Вы уверены, что хотите отменить это бронирование? Отмена бесплатная.`
                    : (selectedGuide && selectedVehicle)
                      ? `Your guide (${selectedGuide.full_name}) and driver (${selectedVehicle.driver_name}) have reserved this day for you. If you cancel, their schedule will be released. Cancellation is free of charge.`
                      : selectedGuide
                        ? `Your guide (${selectedGuide.full_name}) has reserved this day for you. If you cancel, their schedule will be released. Cancellation is free of charge.`
                        : selectedVehicle
                          ? `Your driver (${selectedVehicle.driver_name}) has reserved this day for you. If you cancel, their schedule will be released. Cancellation is free of charge.`
                          : `Are you sure you want to cancel this booking? Cancellation is free of charge.`}
                </p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setShowCancelConfirm(false)}
                  className="btn-gold"
                  style={{
                    padding: '12px',
                    fontSize: '14px',
                    fontWeight: '700',
                    cursor: 'pointer',
                    width: '100%',
                    backgroundColor: 'var(--primary-blue)',
                    color: 'var(--text-primary)'
                  }}
                >
                  {language === 'UZ' ? 'Yo\'q, bandlikni saqlash' : language === 'RU' ? 'Нет, сохранить бронь' : 'No, Keep My Booking'}
                </button>
                
                <button
                  type="button"
                  onClick={handleCancelBooking}
                  disabled={isCancelling}
                  style={{
                    padding: '10px',
                    fontSize: '12px',
                    color: '#ef4444',
                    background: 'none',
                    border: 'none',
                    textDecoration: 'underline',
                    cursor: isCancelling ? 'not-allowed' : 'pointer',
                    opacity: isCancelling ? 0.6 : 1
                  }}
                >
                  {isCancelling 
                    ? (language === 'UZ' ? 'Bekor qilinmoqda...' : language === 'RU' ? 'Отмена...' : 'Cancelling...') 
                    : (language === 'UZ' ? 'Ha, buyurtmani bekor qilish' : language === 'RU' ? 'Да, отменить бронирование' : 'Yes, Cancel Booking')}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    );
  }

  const calculateTotal = () => {
    const daysCount = tourDurationType === 'multi' ? numDays : 1;
    const tariff = tariffs.find(
      t => t.guide_id === selectedGuide?.id && t.language_code.toUpperCase() === selectedGuideLanguage.toUpperCase()
    );
    const guideRate = tariff ? Number(tariff.daily_rate) : 0;
    const transportRate = selectedVehicle
      ? (isOutOfCityRoute ? Number(selectedVehicle.out_of_city_rate) : Number(selectedVehicle.city_rate))
      : 0;
    
    const guideTotalRate = guideRate * daysCount;
    const transportTotalRate = transportRate * daysCount;
    const fixedFee = selectedGuide || selectedVehicle ? 10.00 : 0;
    const subtotal = guideTotalRate + transportTotalRate + fixedFee;
    return subtotal;
  };

  return (
    <main style={{ width: '100%', minHeight: '100vh', display: 'flex', flexDirection: 'column', position: 'relative', backgroundColor: 'var(--bg-dark)' }}>

      {/* ☁ Klook Light-Mode Navbar — transparent to solid white on scroll */}
      <header className="klook-navbar" style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        padding: '12px 24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: isScrolled ? (theme === 'dark' ? 'rgba(18, 26, 47, 0.95)' : 'rgba(255, 255, 255, 0.97)') : 'transparent',
        backdropFilter: isScrolled ? 'blur(12px)' : 'none',
        borderBottom: isScrolled ? '1px solid var(--border-card)' : '1px solid transparent',
        boxShadow: isScrolled ? '0 2px 16px rgba(0,0,0,0.06)' : 'none',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, var(--primary-blue) 0%, var(--deep-turquoise) 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            boxShadow: '0 2px 8px rgba(var(--primary-blue-rgb), 0.25)'
          }}>
            <Compass size={20} />
          </div>
          <span style={{ fontSize: '18px', fontWeight: 800, letterSpacing: '0.02em', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            {activeRegion === 'cross_region' ? 'O\'ZBEKISTON' : activeRegion === 'qoraqalpoq' ? 'QORAQALPOQ' : activeRegion === 'toshkent' ? 'TOSHKENT' : activeRegion === 'shahrisabz' ? 'SHAHRISABZ' : activeRegion === 'xorazm' ? 'XORAZM' : activeRegion === 'buxoro' ? 'BUXORO' : 'SAMARQAND'} <span style={{ color: 'var(--primary-blue)' }}>CRAFTOUR</span>
          </span>
        </div>

        {/* Center: Inline Header Region Switcher (visible on desktop) */}
        <div 
          className="header-switcher no-scrollbar"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            padding: '3px',
            backgroundColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.05)' : '#f0f0f0',
            border: '1px solid var(--border-card)',
            borderRadius: '12px',
            overflowX: 'auto',
            whiteSpace: 'nowrap',
            maxWidth: 'calc(100% - 400px)',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
            margin: '0 12px'
          }}
        >
          {REGIONS_CONFIG.map((reg) => {
            const isActive = activeRegion === reg.id;
            return (
              <button
                key={reg.id}
                onClick={() => setActiveRegion(reg.id)}
                style={{
                  padding: '7px 14px',
                  borderRadius: '9px',
                  border: 'none',
                  background: isActive ? reg.gradient : 'transparent',
                  color: isActive ? reg.color : 'var(--text-secondary)',
                  fontSize: '12.5px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                  boxShadow: isActive ? `0 3px 10px ${reg.shadow}` : 'none',
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.color = 'var(--text-primary)';
                    e.currentTarget.style.background = theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : '#e8e8e8';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.color = 'var(--text-secondary)';
                    e.currentTarget.style.background = 'transparent';
                  }
                }}
              >
                <span style={{ fontSize: '13px' }}>{reg.emoji}</span>
                <span>{reg.label[language] || reg.label['UZ']}</span>
              </button>
            );
          })}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* Discover Info Button */}
          <Link
            href={`/discover?region=${activeRegion}`}
            style={{
              padding: '8px 14px',
              borderRadius: '10px',
              backgroundColor: 'rgba(var(--primary-blue-rgb), 0.08)',
              border: '1px solid rgba(255,91,0,0.2)',
              color: 'var(--primary-blue)',
              fontSize: '13px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              textDecoration: 'none',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(255,91,0,0.14)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'rgba(var(--primary-blue-rgb), 0.08)'; }}
          >
            <Info size={14} />
            <span>{language === 'UZ' ? 'Ma\'lumot' : language === 'RU' ? 'Инфо' : 'Discover'}</span>
          </Link>

          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            style={{
              padding: '8px 14px',
              borderRadius: '10px',
              backgroundColor: theme === 'dark' ? 'rgba(212,175,55,0.12)' : '#f0f0f0',
              border: theme === 'dark' ? '1px solid rgba(212,175,55,0.3)' : '1px solid var(--border-card)',
              color: 'var(--text-primary)',
              fontSize: '13px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.2s ease'
            }}
            title={language === 'UZ' ? 'Mavzuni o\'zgartirish' : language === 'RU' ? 'Сменить тему' : 'Toggle theme'}
          >
            {theme === 'dark' ? (
              <>
                <Moon size={14} style={{ color: 'var(--primary-blue)' }} />
                <span>{language === 'UZ' ? 'Tun' : language === 'RU' ? 'Ночь' : 'Night'}</span>
              </>
            ) : (
              <>
                <Sun size={14} style={{ color: 'var(--primary-blue)' }} />
                <span>{language === 'UZ' ? 'Kun' : language === 'RU' ? 'День' : 'Day'}</span>
              </>
            )}
          </button>

          {/* Klook-style Language Switcher */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setShowLangDropdown(!showLangDropdown)}
              style={{
                padding: '8px 14px',
                borderRadius: '10px',
                backgroundColor: '#f0f0f0',
                border: '1px solid var(--border-card)',
                color: 'var(--text-primary)',
                fontSize: '13px',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.2s ease'
              }}
            >
              <Languages size={14} style={{ color: 'var(--primary-blue)' }} />
              <span>{language === 'EN' ? '🇬🇧 EN' : language === 'RU' ? '🇷🇺 RU' : '🇺🇿 UZ'}</span>
            </button>
            {showLangDropdown && (
              <div style={{
                position: 'absolute',
                top: 'calc(100% + 6px)',
                right: 0,
                backgroundColor: 'var(--bg-card)',
                border: '1px solid var(--border-card)',
                borderRadius: '12px',
                padding: '4px',
                zIndex: 1000,
                boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
                display: 'flex',
                flexDirection: 'column',
                gap: '2px',
                minWidth: '140px'
              }}>
                {['EN', 'RU', 'UZ'].map((langCode) => (
                  <button
                    key={langCode}
                    onClick={() => {
                      setLanguage(langCode);
                      setShowLangDropdown(false);
                      localStorage.setItem('site_lang', langCode);
                    }}
                    style={{
                      padding: '10px 12px',
                      border: 'none',
                      background: language === langCode ? 'rgba(var(--primary-blue-rgb), 0.08)' : 'transparent',
                      color: language === langCode ? 'var(--primary-blue)' : 'var(--text-secondary)',
                      textAlign: 'left',
                      fontSize: '13px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      borderRadius: '8px',
                      transition: 'all 0.2s ease',
                      width: '100%'
                    }}
                    onMouseEnter={(e) => {
                      if (language !== langCode) {
                        e.currentTarget.style.color = 'var(--text-primary)';
                        e.currentTarget.style.backgroundColor = 'var(--bg-dark)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (language !== langCode) {
                        e.currentTarget.style.color = 'var(--text-secondary)';
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }
                    }}
                  >
                    {langCode === 'EN' ? '🇬🇧 English' : langCode === 'RU' ? '🇷🇺 Русский' : '🇺🇿 O\'zbekcha'}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* 🧭 Region Ribbon (Mobile/Tablet Only) */}
      <div 
        className="ribbon-switcher"
        style={{
          display: 'flex',
          justifyContent: 'center',
          padding: '0 16px',
          marginBottom: '8px',
          width: '100%',
          zIndex: 90
        }}
      >
        <div 
          className="no-scrollbar"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '4px',
            background: 'var(--bg-card)',
            border: '1px solid var(--border-card)',
            borderRadius: '14px',
            overflowX: 'auto',
            whiteSpace: 'nowrap',
            maxWidth: '100%',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
          }}
        >
          {REGIONS_CONFIG.map((reg) => {
            const isActive = activeRegion === reg.id;
            return (
              <button
                key={reg.id}
                onClick={() => setActiveRegion(reg.id)}
                style={{
                  padding: '8px 16px',
                  borderRadius: '10px',
                  border: 'none',
                  background: isActive ? reg.gradient : 'transparent',
                  color: isActive ? reg.color : 'var(--text-secondary)',
                  fontSize: '13px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                  boxShadow: isActive ? `0 3px 10px ${reg.shadow}` : 'none',
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.color = 'var(--text-primary)';
                    e.currentTarget.style.background = theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : '#f0f0f0';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.color = 'var(--text-secondary)';
                    e.currentTarget.style.background = 'transparent';
                  }
                }}
              >
                <span style={{ fontSize: '15px' }}>{reg.emoji}</span>
                <span>{reg.label[language] || reg.label['UZ']}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 🏞 Klook Hero Banner with Regional Cover Image */}
      {(() => {
        const coverData = REGIONAL_COVERS[activeRegion] || REGIONAL_COVERS.samarqand;
        const coverDesc = language === 'UZ' ? coverData.descUz : language === 'RU' ? coverData.descRu : coverData.descEn;
        return (
          <div style={{
            position: 'relative',
            width: '100%',
            height: '340px',
            overflow: 'hidden',
            marginBottom: '0',
          }}>
            <img
              src={coverData.image}
              alt={t.heroTitle}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                display: 'block',
              }}
            />
            {/* Dark gradient overlay for text readability */}
            <div style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.15) 50%, rgba(0,0,0,0.05) 100%)',
            }} />
            {/* Hero Text */}
            <div style={{
              position: 'absolute',
              bottom: '28px',
              left: '24px',
              right: '24px',
              maxWidth: '1280px',
              margin: '0 auto',
            }}>
              <h1 style={{
                fontSize: '32px',
                fontWeight: 900,
                color: '#fff',
                margin: 0,
                letterSpacing: '-0.02em',
                textShadow: '0 2px 8px rgba(0,0,0,0.3)',
                lineHeight: 1.2,
              }}>
                {t.heroTitle}
              </h1>
              <p style={{
                fontSize: '15px',
                color: 'rgba(255,255,255,0.9)',
                margin: '8px 0 0 0',
                lineHeight: 1.5,
                fontWeight: '500',
                maxWidth: '700px',
              }}>
                {t.heroSubtitle}
              </p>
            </div>
          </div>
        );
      })()}

      {/* 📖 Description Expander Card */}
      {(() => {
        const coverData = REGIONAL_COVERS[activeRegion] || REGIONAL_COVERS.samarqand;
        const coverDesc = language === 'UZ' ? coverData.descUz : language === 'RU' ? coverData.descRu : coverData.descEn;
        return (
          <div style={{
            maxWidth: '1280px',
            margin: '0 auto',
            width: '100%',
            padding: '16px 24px 0 24px',
          }}>
            <div style={{
              backgroundColor: 'var(--bg-card)',
              borderRadius: '16px',
              padding: '20px 24px',
              boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
              border: '1px solid var(--border-card)',
              marginTop: '-30px',
              position: 'relative',
              zIndex: 10,
            }}>
              <p style={{
                fontSize: '14px',
                color: 'var(--text-primary)',
                lineHeight: 1.7,
                margin: 0,
                overflow: 'hidden',
                maxHeight: isDescExpanded ? '500px' : '66px',
                transition: 'max-height 0.4s ease',
              }}>
                {coverDesc}
              </p>
              <button
                onClick={() => setIsDescExpanded(!isDescExpanded)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--primary-blue)',
                  fontSize: '13px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  padding: '6px 0 0 0',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                {isDescExpanded
                  ? (language === 'UZ' ? 'Kamroq ko\'rsatish ▲' : language === 'RU' ? 'Показать меньше ▲' : 'Show less ▲')
                  : (language === 'UZ' ? 'Batafsil ko\'rsatish ▼' : language === 'RU' ? 'Показать больше ▼' : 'See more ▼')}
              </button>
            </div>
          </div>
        );
      })()}

      {/* 🗂 Category Tabs (Klook-style) */}
      <div style={{
        maxWidth: '1280px',
        margin: '0 auto',
        width: '100%',
        padding: '20px 24px 0 24px',
      }}>
        <div className="no-scrollbar" style={{
          display: 'flex',
          gap: '4px',
          borderBottom: '2px solid var(--border-card)',
          overflowX: 'auto',
          whiteSpace: 'nowrap',
          paddingBottom: '0',
        }}>
          {[
            { id: 'explore', labelUz: '🧭 Tur rejasi', labelRu: '🧭 Маршрут', labelEn: '🧭 Explore' },
            { id: 'sights', labelUz: '🕌 Diqqatga sazovor joylar', labelRu: '🕌 Достопримечательности', labelEn: '🕌 Attractions' },
            { id: 'transport', labelUz: '🚗 Transport', labelRu: '🚗 Транспорт', labelEn: '🚗 Transport' },
            { id: 'guides', labelUz: '🗣 Gidlar', labelRu: '🗣 Гиды', labelEn: '🗣 Guides' },
          ].map(tab => {
            const isActiveTab = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  padding: '12px 20px',
                  border: 'none',
                  background: 'transparent',
                  color: isActiveTab ? 'var(--primary-blue)' : 'var(--text-secondary)',
                  fontSize: '14px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  borderBottom: isActiveTab ? '3px solid var(--primary-blue)' : '3px solid transparent',
                  transition: 'all 0.2s ease',
                  marginBottom: '-2px',
                }}
                onMouseEnter={(e) => {
                  if (!isActiveTab) e.currentTarget.style.color = 'var(--text-primary)';
                }}
                onMouseLeave={(e) => {
                  if (!isActiveTab) e.currentTarget.style.color = 'var(--text-secondary)';
                }}
              >
                {language === 'UZ' ? tab.labelUz : language === 'RU' ? tab.labelRu : tab.labelEn}
              </button>
            );
          })}
        </div>
      </div>

      {/* 🚀 Main Content Area */}
      <div style={{
        flex: 1,
        padding: '20px 24px 32px 24px',
        maxWidth: '1280px',
        margin: '0 auto',
        width: '100%'
      }}>
        {/* Responsive Grid Setup for Desktop vs Mobile */}
        <div className="main-interface-grid" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '24px',
        }}>
          
          {/* Left Column: Constructor Content */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

            {/* 🌤 Cross-Region Start Selector (only visible when cross_region is active) */}
            {activeRegion === 'cross_region' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }} className="animate-fade-in">
                <div style={{
                  padding: '18px 22px',
                  backgroundColor: 'var(--bg-card)',
                  borderRadius: '16px',
                  border: '1px solid var(--border-card)',
                  boxShadow: '0 2px 10px rgba(0,0,0,0.04)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '13px', fontWeight: '700', color: 'var(--primary-blue)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <MapPin size={14} />
                      <span>{language === 'UZ' ? 'Sayohatni boshlash viloyati:' : language === 'RU' ? 'Регион начала поездки:' : 'Starting Region:'}</span>
                    </label>
                    <select
                      value={crossRegionStart}
                      onChange={(e) => setCrossRegionStart(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        borderRadius: '10px',
                        backgroundColor: 'var(--input-bg)',
                        border: '1px solid var(--input-border)',
                        color: 'var(--text-primary)',
                        fontSize: '14px',
                        outline: 'none',
                        cursor: 'pointer'
                      }}
                    >
                      <option value="samarqand">{language === 'UZ' ? 'Samarqand' : language === 'RU' ? 'Самарканд' : 'Samarkand'}</option>
                      <option value="buxoro">{language === 'UZ' ? 'Buxoro' : language === 'RU' ? 'Бухара' : 'Bukhara'}</option>
                      <option value="xorazm">{language === 'UZ' ? 'Xorazm' : language === 'RU' ? 'Хорезм' : 'Khorezm'}</option>
                      <option value="shahrisabz">{language === 'UZ' ? 'Shahrisabz' : language === 'RU' ? 'Шахрисабз' : 'Shahrisabz'}</option>
                      <option value="toshkent">{language === 'UZ' ? 'Toshkent' : language === 'RU' ? 'Ташкент' : 'Tashkent'}</option>
                      <option value="qoraqalpoq">{language === 'UZ' ? 'Qoraqalpog\'iston' : language === 'RU' ? 'Каракалпакстан' : 'Karakalpakstan'}</option>
                    </select>
                  </div>
                </div>

                {/* 🚄 Train / Flight Recommendation Card */}
                <div style={{
                  padding: '16px 20px',
                  backgroundColor: 'var(--bg-card)',
                  border: '1.5px solid rgba(0, 155, 158, 0.25)',
                  borderRadius: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                  boxShadow: '0 2px 10px rgba(0,0,0,0.04)',
                }}>
                  <strong style={{ fontSize: '13px', color: '#009b9e', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span>🚄</span>
                    {language === 'UZ' ? 'Tezyurar poezdlar tavsiyasi (Afrosiyob):' : language === 'RU' ? 'Рекомендация по поездам (Афросиаб):' : 'High-Speed Train Advice (Afrosiyob):'}
                  </strong>
                  <p style={{ fontSize: '12px', color: '#616161', margin: 0, lineHeight: 1.5 }}>
                    {language === 'UZ'
                      ? 'Toshkent, Samarqand va Buxoro o\'rtasida mashinadan ko\'ra Afrosiyob tezyurar poyezdida sayohat qilish ancha tez, xavfsiz va qulay.'
                      : language === 'RU'
                        ? 'Поездка на высокоскоростном поезде «Афросиаб» между Ташкентом, Самаркандом и Бухарой гораздо быстрее и комфортнее.'
                        : 'Traveling via the Afrosiyob high-speed train between Tashkent, Samarkand, and Bukhara is much faster and more comfortable than driving.'}
                  </p>
                </div>
              </div>
            )}

            {/* ========= TAB: EXPLORE (Route planning + Packages) ========= */}
            {(activeTab === 'explore') && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                
                {/* 🌤 Weather Banner */}
                <div style={{
                  padding: '16px 20px',
                  backgroundColor: 'var(--bg-card)',
                  borderRadius: '16px',
                  border: '1px solid var(--border-card)',
                  boxShadow: '0 2px 10px rgba(0,0,0,0.04)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '16px',
                }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '10px',
                  backgroundColor: 'rgba(251, 191, 36, 0.12)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fbbf24',
                  flexShrink: 0
                }}>
                  <Sun size={22} className="animate-spin" style={{ animationDuration: '30s' }} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  <span style={{ fontSize: '15px', fontWeight: '800', color: 'var(--text-primary)' }}>
                    {(() => {
                      const weatherReg = activeRegion === 'cross_region' ? crossRegionStart : activeRegion;
                      const weather = WEATHER_DATA[weatherReg] || WEATHER_DATA.samarqand;
                      return (
                        <>
                           {language === 'UZ' 
                             ? `Bugun ${weather.nameUz}da: ${weather.temp}` 
                             : language === 'RU' 
                               ? `${weather.nameRu} сегодня: ${weather.temp}` 
                               : `${weather.nameEn} Today: ${weather.temp}`}
                           {activeRegion === 'cross_region' && (language === 'UZ' ? ' (boshlanish)' : language === 'RU' ? ' (старт)' : ' (start)')}
                        </>
                      );
                    })()}
                  </span>
                  <span style={{
                    fontSize: '12px',
                    color: (activeRegion === 'cross_region' ? crossRegionStart : activeRegion) === 'qoraqalpoq' ? '#a78bfa' : (activeRegion === 'cross_region' ? crossRegionStart : activeRegion) === 'toshkent' ? '#3b82f6' : (activeRegion === 'cross_region' ? crossRegionStart : activeRegion) === 'shahrisabz' ? '#00a36c' : (activeRegion === 'cross_region' ? crossRegionStart : activeRegion) === 'xorazm' ? '#00a896' : (activeRegion === 'cross_region' ? crossRegionStart : activeRegion) === 'buxoro' ? '#b25329' : '#009b9e',
                    fontWeight: '500'
                  }}>
                    {(() => {
                      const weatherReg = activeRegion === 'cross_region' ? crossRegionStart : activeRegion;
                      const weather = WEATHER_DATA[weatherReg] || WEATHER_DATA.samarqand;
                      return language === 'UZ' ? weather.uz : language === 'RU' ? weather.ru : weather.en;
                    })()}
                  </span>
                </div>
              </div>
              
              <Link
                href={`/discover?region=${activeRegion}`}
                className="btn-gold"
                style={{
                  padding: '10px 18px',
                  fontSize: '13px',
                  fontWeight: '700',
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  borderRadius: '10px',
                  backgroundColor: 'var(--primary-blue)',
                  color: 'var(--bg-card)',
                  transition: 'all 0.2s ease',
                  boxShadow: '0 0 15px rgba(212, 175, 55, 0.15)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.03)';
                  e.currentTarget.style.boxShadow = '0 0 20px rgba(212, 175, 55, 0.35)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.boxShadow = '0 0 15px rgba(212, 175, 55, 0.15)';
                }}
              >
                <span>{language === 'UZ' ? 'Yo\'l ko\'rsatkichni ochish ➔' : language === 'RU' ? 'Открыть путеводитель ➔' : 'Discover Guide ➔'}</span>
              </Link>
            </div>

            {/* Step 1: Route Builder */}
            <section style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)' }}>{t.step1}</h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--text-secondary)' }}>
                <AlertCircle size={12} style={{ color: '#009b9e' }} />
                <span>{t.disclaimer}</span>
              </div>
              
              {/* Tour Duration Type Toggle & Day Selector (Premium Gold/Teal Design) */}
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                padding: '16px',
                backgroundColor: 'var(--bg-card)',
                borderRadius: '12px',
                border: '1px solid var(--border-card)',
                marginTop: '4px',
                marginBottom: '8px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-primary)' }}>
                    {language === 'UZ' ? 'Sayohat turi:' : language === 'RU' ? 'Тип поездки:' : 'Tour Type:'}
                  </span>
                  
                  {/* Toggle Selector */}
                  <div style={{
                    display: 'flex',
                    backgroundColor: '#f0f0f0',
                    padding: '2px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-card)'
                  }}>
                    <button
                      type="button"
                      onClick={() => setTourDurationType('single')}
                      style={{
                        padding: '6px 12px',
                        borderRadius: '6px',
                        border: 'none',
                        background: tourDurationType === 'single' ? 'linear-gradient(135deg, #0070c0 0%, #009b9e 100%)' : 'transparent',
                        color: tourDurationType === 'single' ? '#fff' : 'var(--text-secondary)',
                        fontSize: '12px',
                        fontWeight: '700',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      {language === 'UZ' ? 'Bir kunlik' : language === 'RU' ? 'Однодневный' : '1-Day Tour'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setTourDurationType('multi')}
                      style={{
                        padding: '6px 12px',
                        borderRadius: '6px',
                        border: 'none',
                        background: tourDurationType === 'multi' ? 'linear-gradient(135deg, var(--primary-blue) 0%, var(--deep-turquoise) 100%)' : 'transparent',
                        color: tourDurationType === 'multi' ? 'var(--text-primary)' : 'var(--text-secondary)',
                        fontSize: '12px',
                        fontWeight: '700',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      {language === 'UZ' ? 'Ko\'p kunlik' : language === 'RU' ? 'Многодневный' : 'Multi-Day'}
                    </button>
                  </div>
                </div>

                {tourDurationType === 'multi' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', borderTop: '1px solid #eee', paddingTop: '10px' }} className="animate-fade-in">
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
                      <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--primary-blue)' }}>
                        {language === 'UZ' ? 'Kunlar soni:' : language === 'RU' ? 'Количество дней:' : 'Number of Days:'}
                      </span>
                      <select
                        value={numDays}
                        onChange={(e) => {
                          const val = parseInt(e.target.value, 10);
                          setNumDays(val);
                          if (activePlanningDay > val) {
                            setActivePlanningDay(val);
                          }
                        }}
                        style={{
                          padding: '6px 12px',
                          borderRadius: '6px',
                          backgroundColor: 'rgba(255, 91, 0, 0.06)',
                          border: '1px solid rgba(212, 175, 55, 0.3)',
                          color: 'var(--text-primary)',
                          fontSize: '13px',
                          outline: 'none',
                          cursor: 'pointer',
                          fontWeight: '600'
                        }}
                      >
                        <option value={2}>2 {language === 'UZ' ? 'kun' : language === 'RU' ? 'дня' : 'Days'}</option>
                        <option value={3}>3 {language === 'UZ' ? 'kun' : language === 'RU' ? 'дня' : 'Days'}</option>
                        <option value={4}>4 {language === 'UZ' ? 'kun' : language === 'RU' ? 'дня' : 'Days'}</option>
                        <option value={5}>5 {language === 'UZ' ? 'kun' : language === 'RU' ? 'дней' : 'Days'}</option>
                      </select>
                    </div>

                    {/* Day Selection Tabs with selected count badge */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '4px' }}>
                      <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: '600' }}>
                        {language === 'UZ' ? 'Hozirgi rejalashtirilayotgan kun (joylar shu kunga qo\'shiladi):' : language === 'RU' ? 'Планируемый день (места будут добавлены на этот день):' : 'Active Planning Day (added places go here):'}
                      </span>
                      <div className="no-scrollbar" style={{ display: 'flex', gap: '6px', overflowX: 'auto', padding: '2px 0' }}>
                        {Array.from({ length: numDays }, (_, i) => i + 1).map((d) => {
                          const isDayActive = activePlanningDay === d;
                          const dayLocationsCount = selectedLocations.filter(loc => (loc.selectedDay || 1) === d).length;
                          const dayColors = {
                            1: 'var(--primary-blue)', // Orange
                            2: '#009b9e', // Teal
                            3: '#c05a1a', // Terracotta
                            4: '#7c3aed', // Purple
                            5: '#008060', // Green
                          };
                          const activeColor = dayColors[d] || 'var(--primary-blue)';
                          return (
                            <button
                              key={d}
                              type="button"
                              onClick={() => setActivePlanningDay(d)}
                              style={{
                                padding: '6px 12px',
                                borderRadius: '8px',
                                border: isDayActive ? `1px solid ${activeColor}` : '1px solid var(--border-card)',
                                backgroundColor: isDayActive ? activeColor : (theme === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'var(--bg-card)'),
                                color: isDayActive ? (d === 1 || d === 2 ? 'var(--text-primary)' : '#fff') : 'var(--text-secondary)',
                                fontSize: '12px',
                                fontWeight: '700',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                whiteSpace: 'nowrap'
                              }}
                            >
                              <span>{language === 'UZ' ? `${d}-kun` : language === 'RU' ? `День ${d}` : `Day ${d}`}</span>
                              <span style={{
                                fontSize: '10px',
                                padding: '1px 6px',
                                borderRadius: '10px',
                                backgroundColor: isDayActive ? 'rgba(0,0,0,0.15)' : 'var(--border-card)',
                                color: isDayActive ? (d === 1 || d === 2 ? '#000' : '#fff') : 'var(--text-primary)',
                                fontWeight: '800'
                              }}>
                                {dayLocationsCount}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </div>
              {/* 🎁 Recommended Tour Packages Selector (Klook-style) */}
              {(() => {
                const regionPkgs = activeRegion === 'cross_region'
                  ? (RECOMMENDED_PACKAGES[`cross_region_${crossRegionStart}`] || RECOMMENDED_PACKAGES['cross_region'] || [])
                  : (RECOMMENDED_PACKAGES[activeRegion] || []);
                if (regionPkgs.length === 0) return null;
                
                return (
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px',
                    padding: '16px',
                    backgroundColor: 'var(--bg-card)',
                    border: '1px solid var(--border-card)',
                    borderRadius: '12px',
                    marginBottom: '8px'
                  }} className="animate-fade-in">
                    <span style={{ fontSize: '13px', fontWeight: '800', color: 'var(--primary-blue)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      ✨ {language === 'UZ' ? 'Tayyor Sayohat Paketlari' : language === 'RU' ? 'Готовые туристические пакеты' : 'Recommended Tour Packages'}
                    </span>
                    <p style={{ fontSize: '11px', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.4 }}>
                      {language === 'UZ' 
                        ? 'Obidalarni tanlashga qiynalayotgan bo\'lsangiz, tayyor marshrutlarimizdan birini tanlang. Yuklangan joylarni keyinchalik o\'zgartirishingiz mumkin.'
                        : language === 'RU'
                          ? 'Если вам сложно выбрать места, выберите один из готовых маршрутов. Загруженные места можно изменять.'
                          : 'If you find it difficult to choose sights, pick a pre-planned route. You can customize loaded places later.'}
                    </p>
                    
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                      gap: '10px',
                      marginTop: '6px'
                    }}>
                      {regionPkgs.map((pkg) => {
                        const isSelected = pkg.locationNames.every(name => 
                          selectedLocations.some(loc => loc.name_en.toLowerCase() === name.toLowerCase())
                        ) && selectedLocations.length === pkg.locationNames.length;
                        
                        return (
                          <div
                            key={pkg.id}
                            onClick={() => handleSelectPackage(pkg)}
                            style={{
                              padding: '12px',
                              borderRadius: '10px',
                              backgroundColor: isSelected ? 'rgba(255, 91, 0, 0.06)' : 'var(--bg-card)',
                              border: isSelected ? '1.5px solid var(--primary-blue)' : '1px solid var(--border-card)',
                              cursor: 'pointer',
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '6px',
                              transition: 'all 0.2s ease',
                              position: 'relative',
                              overflow: 'hidden'
                            }}
                            onMouseEnter={(e) => {
                              if (!isSelected) {
                                e.currentTarget.style.borderColor = 'rgba(255, 91, 0, 0.3)';
                                e.currentTarget.style.backgroundColor = theme === 'dark' ? 'rgba(255, 255, 255, 0.05)' : '#f9f9f9';
                              }
                            }}
                            onMouseLeave={(e) => {
                              if (!isSelected) {
                                e.currentTarget.style.borderColor = 'var(--border-card)';
                                e.currentTarget.style.backgroundColor = 'var(--bg-card)';
                              }
                            }}
                          >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <strong style={{ fontSize: '13px', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <span>{pkg.emoji}</span>
                                <span>{pkg.name[language] || pkg.name.EN}</span>
                              </strong>
                              {isSelected && (
                                <span style={{ 
                                  fontSize: '9px', 
                                  backgroundColor: 'rgba(16, 185, 129, 0.15)', 
                                  color: '#10b981', 
                                  padding: '1px 5px', 
                                  borderRadius: '4px',
                                  fontWeight: '800',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '2px'
                                }}>
                                  ✓ {language === 'UZ' ? 'Faol' : language === 'RU' ? 'Актив' : 'Active'}
                                </span>
                              )}
                            </div>
                            <p style={{ fontSize: '11px', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.4 }}>
                              {pkg.description[language] || pkg.description.EN}
                            </p>
                            <div style={{
                              fontSize: '9.5px',
                              color: 'var(--text-gold)',
                              fontWeight: '600',
                              borderTop: '1px solid rgba(255,255,255,0.04)',
                              paddingTop: '6px',
                              marginTop: '2px',
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden',
                              lineHeight: 1.3
                            }}>
                              📌 {pkg.locationNames.join(', ')}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })()}

              <div style={{ display: 'flex', gap: '16px', alignItems: 'center', fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)', flexWrap: 'wrap' }}>
                <div>
                  {t.selectedCount} <span style={{ color: 'var(--primary-blue)', backgroundColor: 'rgba(var(--primary-blue-rgb), 0.08)', padding: '2px 8px', borderRadius: '10px' }}>{selectedLocations.length}</span>
                </div>
                {selectedLocations.length > 0 && (
                  <div>
                    {t.totalDurationLabel} <span style={{ color: '#009b9e', backgroundColor: 'rgba(0,155,158,0.1)', padding: '2px 8px', borderRadius: '10px' }}>⏱️ {formatTotalDuration(totalDuration, language)}</span>
                  </div>
                )}
              </div>
              {activeRegion === 'cross_region' && (
                <div 
                  className="no-scrollbar"
                  style={{
                    display: 'flex',
                    gap: '6px',
                    overflowX: 'auto',
                    padding: '4px 0',
                    margin: '4px 0 10px 0',
                    borderBottom: '1px solid var(--border-card)',
                    whiteSpace: 'nowrap'
                  }} 
                  
                >
                  {[
                    { id: 'all', labelUz: 'Barchasi', labelRu: 'Все', labelEn: 'All' },
                    { id: 'samarqand', labelUz: 'Samarqand', labelRu: 'Самарканд', labelEn: 'Samarkand' },
                    { id: 'buxoro', labelUz: 'Buxoro', labelRu: 'Бухара', labelEn: 'Bukhara' },
                    { id: 'xorazm', labelUz: 'Xorazm', labelRu: 'Хорезм', labelEn: 'Khorezm' },
                    { id: 'shahrisabz', labelUz: 'Shahrisabz', labelRu: 'Шахрисабз', labelEn: 'Shahrisabz' },
                    { id: 'toshkent', labelUz: 'Toshkent', labelRu: 'Ташкент', labelEn: 'Tashkent' },
                    { id: 'qoraqalpoq', labelUz: 'Qoraqalpog\'iston', labelRu: 'Каракалпакстан', labelEn: 'Karakalpakstan' }
                  ].map((tab) => {
                    const isSelected = crossRegionLocationFilter === tab.id;
                    return (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setCrossRegionLocationFilter(tab.id)}
                        style={{
                          padding: '6px 12px',
                          borderRadius: '8px',
                          border: isSelected ? '1px solid var(--primary-blue)' : '1px solid var(--border-card)',
                          background: isSelected 
                            ? 'linear-gradient(135deg, var(--primary-blue) 0%, var(--deep-turquoise) 100%)' 
                            : 'rgba(255, 255, 255, 0.05)',
                          color: isSelected ? 'var(--text-primary)' : 'var(--text-secondary)',
                          fontSize: '12px',
                          fontWeight: '700',
                          cursor: 'pointer',
                          whiteSpace: 'nowrap',
                          transition: 'all 0.2s ease',
                        }}
                      >
                        {language === 'UZ' ? tab.labelUz : language === 'RU' ? tab.labelRu : tab.labelEn}
                      </button>
                    );
                  })}
                </div>
              )}
              {/* Selected Route Summary & Reordering Section */}
              {selectedLocations.length > 0 && (
                <div 
                  className="glass-container gold-glow animate-fade-in" 
                  style={{
                    padding: '18px 20px',
                    border: '1.5px solid rgba(var(--primary-blue-rgb), 0.35)',
                    background: 'linear-gradient(135deg, rgba(255, 91, 0, 0.06) 0%, rgba(255, 115, 0, 0.02) 100%)',
                    borderRadius: '16px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                    marginBottom: '16px'
                  }}
                >
                  <h3 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--primary-blue)', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Compass size={16} className="animate-spin" style={{ animationDuration: '20s' }} />
                    <span>
                      {language === 'UZ' ? 'Siz tanlagan sayohat tartibi (O\'zgartirish mumkin):' : language === 'RU' ? 'Ваш порядок посещения (можно менять):' : 'Your Selected Itinerary (Reorderable):'}
                    </span>
                  </h3>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {/* If single-day tour, just list them. If multi-day, group by day first */}
                    {tourDurationType === 'multi' ? (
                      Array.from({ length: numDays }, (_, i) => i + 1).map(dayNum => {
                        const dayLocs = selectedLocations.filter(loc => (loc.selectedDay || 1) === dayNum);
                        
                        const dayColors = {
                          1: 'var(--primary-blue)', // Orange
                          2: '#009b9e', // Teal
                          3: '#c05a1a', // Terracotta
                          4: '#7c3aed', // Purple
                          5: '#008060', // Green
                        };
                        const dayColor = dayColors[dayNum] || 'var(--primary-blue)';
                        const isDragOverThisDay = dragOverDay === dayNum;
                        
                        return (
                          <div 
                            key={dayNum} 
                            onDragOver={handleDragOver}
                            onDragEnter={() => setDragOverDay(dayNum)}
                            onDragLeave={() => setDragOverDay(null)}
                            onDrop={(e) => handleDropOnDay(e, dayNum)}
                            style={{ 
                              display: 'flex', 
                              flexDirection: 'column', 
                              gap: '8px', 
                              marginTop: '8px',
                              padding: '12px',
                              borderRadius: '12px',
                              border: isDragOverThisDay ? '1px dashed #10b981' : '1.5px dashed rgba(255, 255, 255, 0.05)',
                              backgroundColor: isDragOverThisDay ? 'rgba(16, 185, 129, 0.04)' : 'rgba(255, 255, 255, 0.01)',
                              transition: 'all 0.2s'
                            }}
                          >
                            <div style={{ fontSize: '13px', fontWeight: '800', color: dayColor, borderBottom: '1.5px solid rgba(255,255,255,0.06)', paddingBottom: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                📅 {language === 'UZ' ? `${dayNum}-KUN` : language === 'RU' ? `ДЕНЬ ${dayNum}` : `DAY ${dayNum}`}
                              </span>
                              <span style={{ fontSize: '11px', color: 'var(--text-secondary)', backgroundColor: '#f0f0f0', padding: '2px 6px', borderRadius: '6px' }}>
                                ⏱️ {formatTotalDuration(dayLocs.reduce((sum, l) => sum + (l.estimated_duration || 0), 0), language)}
                              </span>
                            </div>
                            {dayLocs.length === 0 ? (
                              <div style={{ padding: '16px', textAlign: 'center', color: '#9e9e9e', fontSize: '12px', fontStyle: 'italic', border: '1px dashed var(--border-card)', borderRadius: '10px', marginTop: '4px' }}>
                                {language === 'UZ' ? 'Bu kunga obidalar qo\'shilmagan' : language === 'RU' ? 'Нет мест на этот день' : 'No places added for this day'}
                              </div>
                            ) : (
                              <div style={{
                                position: 'relative',
                                paddingLeft: '24px',
                                marginTop: '10px',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '14px'
                              }}>
                                {/* Timeline vertical track line */}
                                {dayLocs.length > 1 && (
                                  <div style={{
                                    position: 'absolute',
                                    left: '8px',
                                    top: '14px',
                                    bottom: '14px',
                                    width: '2px',
                                    background: `linear-gradient(to bottom, ${dayColor} 0%, rgba(255,255,255,0.05) 100%)`,
                                    opacity: 0.35,
                                    zIndex: 0
                                  }} />
                                )}
                                
                                {dayLocs.map((loc, dayIdx) => {
                                  const isFirstInDay = dayIdx === 0;
                                  const isLastInDay = dayIdx === dayLocs.length - 1;
                                  
                                  let emoji = '🕌';
                                  let iconColor = '#0070c0'; // historical blue
                                  if (loc.category === 'alternative') {
                                    emoji = '🌲';
                                    iconColor = '#009b9e'; // nature teal
                                  }
                                  if (loc.category === 'food') {
                                    emoji = '🍲';
                                    iconColor = 'var(--primary-blue)'; // dining orange
                                  }
                                  
                                  const isDragged = draggedLocationId === loc.id;
                                  const isDragOverThisLoc = dragOverLocationId === loc.id;
                                  
                                  return (
                                    <div 
                                      key={loc.id}
                                      draggable={true}
                                      onDragStart={(e) => handleDragStart(e, loc.id)}
                                      onDragEnd={handleDragEnd}
                                      onDragOver={handleDragOver}
                                      onDragEnter={() => setDragOverLocationId(loc.id)}
                                      onDragLeave={() => setDragOverLocationId(null)}
                                      onDrop={(e) => handleDropOnLocation(e, loc)}
                                      style={{
                                        display: 'flex',
                                        alignItems: 'flex-start',
                                        gap: '14px',
                                        position: 'relative',
                                        opacity: isDragged ? 0.4 : 1,
                                        cursor: 'grab',
                                        transition: 'all 0.2s',
                                        zIndex: 1
                                      }}
                                    >
                                      {/* Timeline Node Badge */}
                                      <div style={{
                                        width: '18px',
                                        height: '18px',
                                        borderRadius: '50%',
                                        backgroundColor: isDragOverThisLoc ? '#10b981' : 'var(--primary-blue)',
                                        border: `2px solid ${isDragOverThisLoc ? '#10b981' : iconColor}`,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '9px',
                                        fontWeight: '800',
                                        color: 'var(--text-primary)',
                                        flexShrink: 0,
                                        marginTop: '11px',
                                        marginLeft: '-32px', // centers it perfectly on the vertical line
                                        boxShadow: `0 0 8px ${iconColor}40`,
                                        zIndex: 2,
                                        transition: 'all 0.2s'
                                      }}>
                                        {dayIdx + 1}
                                      </div>

                                      {/* Timeline Card */}
                                      <div style={{
                                        flex: 1,
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: '6px',
                                        padding: '10px 14px',
                                        backgroundColor: isDragOverThisLoc ? 'rgba(16, 185, 129, 0.08)' : 'rgba(18, 26, 47, 0.45)',
                                        borderRadius: '12px',
                                        border: isDragOverThisLoc 
                                          ? '1px dashed #10b981' 
                                          : '1px solid rgba(255,255,255,0.06)',
                                        transition: 'all 0.2s',
                                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                                      }}>
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            <span style={{ color: '#9e9e9e', cursor: 'grab', fontSize: '13px', userSelect: 'none', marginRight: '2px' }}>☰</span>
                                            <span style={{ fontSize: '13px' }}>{emoji}</span>
                                            <span style={{ fontWeight: '700', color: 'var(--text-primary)', fontSize: '13px' }}>
                                              {language === 'RU' ? loc.name_ru : language === 'UZ' ? loc.name_uz : loc.name_en}
                                            </span>
                                            {loc.is_out_of_city && (
                                              <span style={{ 
                                                fontSize: '8.5px', 
                                                backgroundColor: 'rgba(var(--primary-blue-rgb), 0.08)', 
                                                color: 'var(--primary-blue)', 
                                                padding: '1px 4px', 
                                                borderRadius: '4px',
                                                fontWeight: '800'
                                              }}>
                                                🏔 {language === 'UZ' ? 'Tog\'' : language === 'RU' ? 'Горы' : 'Out'}
                                              </span>
                                            )}
                                          </div>
                                          <button
                                            type="button"
                                            onClick={() => handleToggleLocation(loc)}
                                            style={{
                                              border: 'none',
                                              background: 'none',
                                              color: '#ef4444',
                                              cursor: 'pointer',
                                              padding: '2px',
                                              fontWeight: '700',
                                              fontSize: '13px',
                                              opacity: 0.6,
                                              transition: 'opacity 0.2s'
                                            }}
                                            onMouseEnter={(e) => e.currentTarget.style.opacity = 1}
                                            onMouseLeave={(e) => e.currentTarget.style.opacity = 0.6}
                                          >
                                            ✕
                                          </button>
                                        </div>
                                        
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px', paddingTop: '4px', borderTop: '1px solid rgba(255,255,255,0.03)' }}>
                                          <div style={{ display: 'flex', gap: '6px' }}>
                                            <span style={{ fontSize: '10.5px', color: 'var(--text-secondary)', backgroundColor: '#f0f0f0', padding: '2px 5px', borderRadius: '5px' }}>
                                              ⏱️ {loc.estimated_duration}m
                                            </span>
                                            <span style={{ 
                                              fontSize: '10.5px', 
                                              color: parseFloat(loc.ticket_price) > 0 ? '#10b981' : 'var(--text-secondary)', 
                                              backgroundColor: parseFloat(loc.ticket_price) > 0 ? 'rgba(16, 185, 129, 0.1)' : 'rgba(255,255,255,0.04)', 
                                              padding: '2px 5px', 
                                              borderRadius: '5px',
                                              fontWeight: parseFloat(loc.ticket_price) > 0 ? '700' : 'normal'
                                            }}>
                                              🎟️ {parseFloat(loc.ticket_price) > 0 ? `$${parseFloat(loc.ticket_price).toFixed(2)}` : (language === 'UZ' ? 'bepul' : language === 'RU' ? 'бесплатно' : 'free')}
                                            </span>
                                          </div>
                                          
                                          <div style={{ display: 'flex', gap: '2px' }}>
                                            <button
                                              type="button"
                                              disabled={isFirstInDay}
                                              onClick={() => handleMoveLocationUp(loc.id)}
                                              style={{
                                                padding: '2px 6px',
                                                backgroundColor: isFirstInDay ? 'rgba(255,255,255,0.01)' : 'rgba(255,255,255,0.04)',
                                                border: '1px solid #eee',
                                                color: isFirstInDay ? '#475569' : 'var(--text-secondary)',
                                                borderRadius: '5px',
                                                cursor: isFirstInDay ? 'not-allowed' : 'pointer',
                                                fontSize: '9px',
                                                transition: 'all 0.2s'
                                              }}
                                            >
                                              ▲
                                            </button>
                                            <button
                                              type="button"
                                              disabled={isLastInDay}
                                              onClick={() => handleMoveLocationDown(loc.id)}
                                              style={{
                                                padding: '2px 6px',
                                                backgroundColor: isLastInDay ? 'rgba(255,255,255,0.01)' : 'rgba(255,255,255,0.04)',
                                                border: '1px solid #eee',
                                                color: isLastInDay ? '#475569' : 'var(--text-secondary)',
                                                borderRadius: '5px',
                                                cursor: isLastInDay ? 'not-allowed' : 'pointer',
                                                fontSize: '9px',
                                                transition: 'all 0.2s'
                                              }}
                                            >
                                              ▼
                                            </button>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        );
                      })
                    ) : (
                      <div style={{
                        position: 'relative',
                        paddingLeft: '24px',
                        marginTop: '10px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '14px'
                      }}>
                        {/* Timeline vertical track line */}
                        {selectedLocations.length > 1 && (
                          <div style={{
                            position: 'absolute',
                            left: '8px',
                            top: '14px',
                            bottom: '14px',
                            width: '2px',
                            background: 'linear-gradient(to bottom, #009b9e 0%, rgba(255,255,255,0.05) 100%)',
                            opacity: 0.35,
                            zIndex: 0
                          }} />
                        )}
                        
                        {selectedLocations.map((loc, idx) => {
                          const isFirst = idx === 0;
                          const isLast = idx === selectedLocations.length - 1;
                          
                          let emoji = '🕌';
                          let iconColor = '#0070c0'; // historical blue
                          if (loc.category === 'alternative') {
                            emoji = '🌲';
                            iconColor = '#009b9e'; // nature teal
                          }
                          if (loc.category === 'food') {
                            emoji = '🍲';
                            iconColor = 'var(--primary-blue)'; // dining orange
                          }
                          
                          const isDragged = draggedLocationId === loc.id;
                          const isDragOverThisLoc = dragOverLocationId === loc.id;

                          return (
                            <div 
                              key={loc.id}
                              draggable={true}
                              onDragStart={(e) => handleDragStart(e, loc.id)}
                              onDragEnd={handleDragEnd}
                              onDragOver={handleDragOver}
                              onDragEnter={() => setDragOverLocationId(loc.id)}
                              onDragLeave={() => setDragOverLocationId(null)}
                              onDrop={(e) => handleDropOnLocation(e, loc)}
                              style={{
                                display: 'flex',
                                alignItems: 'flex-start',
                                gap: '14px',
                                position: 'relative',
                                opacity: isDragged ? 0.4 : 1,
                                cursor: 'grab',
                                transition: 'all 0.2s',
                                zIndex: 1
                              }}
                            >
                              {/* Timeline Node Badge */}
                              <div style={{
                                width: '18px',
                                height: '18px',
                                borderRadius: '50%',
                                backgroundColor: isDragOverThisLoc ? '#10b981' : 'var(--primary-blue)',
                                border: `2px solid ${isDragOverThisLoc ? '#10b981' : iconColor}`,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '9px',
                                fontWeight: '800',
                                color: 'var(--text-primary)',
                                flexShrink: 0,
                                marginTop: '11px',
                                marginLeft: '-32px', // centers it perfectly on the vertical line
                                boxShadow: `0 0 8px ${iconColor}40`,
                                zIndex: 2,
                                transition: 'all 0.2s'
                              }}>
                                {idx + 1}
                              </div>

                              {/* Timeline Card */}
                              <div style={{
                                flex: 1,
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '6px',
                                padding: '10px 14px',
                                backgroundColor: isDragOverThisLoc ? 'rgba(16, 185, 129, 0.08)' : 'rgba(18, 26, 47, 0.45)',
                                borderRadius: '12px',
                                border: isDragOverThisLoc 
                                  ? '1px dashed #10b981' 
                                  : '1px solid rgba(255,255,255,0.06)',
                                transition: 'all 0.2s',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                              }}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <span style={{ color: '#9e9e9e', cursor: 'grab', fontSize: '13px', userSelect: 'none', marginRight: '2px' }}>☰</span>
                                    <span style={{ fontSize: '13px' }}>{emoji}</span>
                                    <span style={{ fontWeight: '700', color: 'var(--text-primary)', fontSize: '13px' }}>
                                      {language === 'RU' ? loc.name_ru : language === 'UZ' ? loc.name_uz : loc.name_en}
                                    </span>
                                    {loc.is_out_of_city && (
                                      <span style={{ 
                                        fontSize: '8.5px', 
                                        backgroundColor: 'rgba(var(--primary-blue-rgb), 0.08)', 
                                        color: 'var(--primary-blue)', 
                                        padding: '1px 4px', 
                                        borderRadius: '4px',
                                        fontWeight: '800'
                                      }}>
                                        🏔 {language === 'UZ' ? 'Tog\'' : language === 'RU' ? 'Горы' : 'Out'}
                                      </span>
                                    )}
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => handleToggleLocation(loc)}
                                    style={{
                                      border: 'none',
                                      background: 'none',
                                      color: '#ef4444',
                                      cursor: 'pointer',
                                      padding: '2px',
                                      fontWeight: '700',
                                      fontSize: '13px',
                                      opacity: 0.6,
                                      transition: 'opacity 0.2s'
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.opacity = 1}
                                    onMouseLeave={(e) => e.currentTarget.style.opacity = 0.6}
                                  >
                                    ✕
                                  </button>
                                </div>
                                
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px', paddingTop: '4px', borderTop: '1px solid rgba(255,255,255,0.03)' }}>
                                  <div style={{ display: 'flex', gap: '6px' }}>
                                    <span style={{ fontSize: '10.5px', color: 'var(--text-secondary)', backgroundColor: '#f0f0f0', padding: '2px 5px', borderRadius: '5px' }}>
                                      ⏱️ {loc.estimated_duration}m
                                    </span>
                                    <span style={{ 
                                      fontSize: '10.5px', 
                                      color: parseFloat(loc.ticket_price) > 0 ? '#10b981' : 'var(--text-secondary)', 
                                      backgroundColor: parseFloat(loc.ticket_price) > 0 ? 'rgba(16, 185, 129, 0.1)' : 'rgba(255,255,255,0.04)', 
                                      padding: '2px 5px', 
                                      borderRadius: '5px',
                                      fontWeight: parseFloat(loc.ticket_price) > 0 ? '700' : 'normal'
                                    }}>
                                      🎟️ {parseFloat(loc.ticket_price) > 0 ? `$${parseFloat(loc.ticket_price).toFixed(2)}` : (language === 'UZ' ? 'bepul' : language === 'RU' ? 'бесплатно' : 'free')}
                                    </span>
                                  </div>
                                  
                                  <div style={{ display: 'flex', gap: '2px' }}>
                                    <button
                                      type="button"
                                      disabled={isFirst}
                                      onClick={() => handleMoveLocationUp(loc.id)}
                                      style={{
                                        padding: '2px 6px',
                                        backgroundColor: isFirst ? 'rgba(255,255,255,0.01)' : 'rgba(255,255,255,0.04)',
                                        border: '1px solid #eee',
                                        color: isFirst ? '#475569' : 'var(--text-secondary)',
                                        borderRadius: '5px',
                                        cursor: isFirst ? 'not-allowed' : 'pointer',
                                        fontSize: '9px',
                                        transition: 'all 0.2s'
                                      }}
                                    >
                                      ▲
                                    </button>
                                    <button
                                      type="button"
                                      disabled={isLast}
                                      onClick={() => handleMoveLocationDown(loc.id)}
                                      style={{
                                        padding: '2px 6px',
                                        backgroundColor: isLast ? 'rgba(255,255,255,0.01)' : 'rgba(255,255,255,0.04)',
                                        border: '1px solid #eee',
                                        color: isLast ? '#475569' : 'var(--text-secondary)',
                                        borderRadius: '5px',
                                        cursor: isLast ? 'not-allowed' : 'pointer',
                                        fontSize: '9px',
                                        transition: 'all 0.2s'
                                      }}
                                    >
                                      ▼
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              )}
              <RouteBuilder
                locations={filteredLocations}
                selectedLocations={selectedLocations}
                onToggleLocation={handleToggleLocation}
                language={language}
                tourDurationType={tourDurationType}
                numDays={numDays}
                onUpdateLocationDay={handleUpdateLocationDay}
                activeRegion={activeRegion}
                onOpenWikipedia={setWikiLocation}
              />

              {/* 🏨 Accommodation Suggestions for Multi-Day Tours */}
              {tourDurationType === 'multi' && selectedLocations.length > 0 && (() => {
                const selectedRegions = Array.from(new Set(selectedLocations.map(loc => loc.region || 'samarqand')));
                return (
                  <div 
                    className="glass-container animate-fade-in" 
                    style={{
                      padding: '18px 20px',
                      border: '1.5px solid rgba(var(--primary-blue-rgb), 0.25)',
                      background: 'linear-gradient(135deg, rgba(255, 91, 0, 0.06) 0%, rgba(255, 115, 0, 0.02) 100%)',
                      borderRadius: '16px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '12px',
                      marginTop: '16px'
                    }}
                  >
                    <h3 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--primary-blue)', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span>🏨</span>
                      <span>
                        {language === 'UZ' ? 'Tavsiya etiladigan mehmonxonalar:' : language === 'RU' ? 'Рекомендуемое проживание:' : 'Recommended Accommodations:'}
                      </span>
                    </h3>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                      {selectedRegions.map(reg => {
                        const hotels = ACCOMMODATIONS_DATA[reg] || [];
                        if (hotels.length === 0) return null;
                        
                        const regionNames = {
                          samarqand: { UZ: 'Samarqand', RU: 'Самарканд', EN: 'Samarkand' },
                          buxoro: { UZ: 'Buxoro', RU: 'Бухара', EN: 'Bukhara' },
                          xorazm: { UZ: 'Xorazm', RU: 'Хорезм', EN: 'Khorezm' },
                          shahrisabz: { UZ: 'Shahrisabz', RU: 'Шахрисабз', EN: 'Shahrisabz' },
                          toshkent: { UZ: 'Toshkent', RU: 'Ташкент', EN: 'Tashkent' },
                          qoraqalpoq: { UZ: 'Qoraqalpog\'iston', RU: 'Каракалпакстан', EN: 'Karakalpakstan' }
                        };
                        const regName = regionNames[reg]?.[language] || reg;
                        
                        return (
                          <div key={reg} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <span style={{ fontSize: '12px', fontWeight: '800', color: '#616161', borderBottom: '1px solid #eee', paddingBottom: '3px' }}>
                              📍 {regName}
                            </span>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '10px' }}>
                              {hotels.map((hotel, hIdx) => (
                                <div 
                                  key={hIdx}
                                  style={{
                                    padding: '10px 14px',
                                    backgroundColor: 'var(--bg-card-hover)',
                                    borderRadius: '10px',
                                    border: '1px solid #eee',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '4px'
                                  }}
                                >
                                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <strong style={{ fontSize: '13.5px', color: 'var(--text-primary)' }}>{hotel.name}</strong>
                                    <span style={{ fontSize: '11px', color: '#fbbf24', fontWeight: '700' }}>{hotel.rating}</span>
                                  </div>
                                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11.5px', color: '#616161' }}>
                                    <span>{language === 'UZ' ? hotel.descUz : language === 'RU' ? hotel.descRu : hotel.descEn}</span>
                                    <strong style={{ color: '#009b9e', marginLeft: '10px', whiteSpace: 'nowrap' }}>{hotel.price}</strong>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    
                    <p style={{ fontSize: '11px', color: '#64748b', margin: '4px 0 0 0', lineHeight: 1.4, borderTop: '1px solid #eee', paddingTop: '8px' }}>
                      💡 {language === 'UZ'
                        ? 'Menejerimiz sayohat buyurtmangizni tasdiqlaganidan so\'ng, ushbu mehmonxonalarni band qilishda sizga bepul yordam beradi.'
                        : language === 'RU'
                          ? 'Наш менеджер бесплатно поможет вам забронировать это жилье после подтверждения вашей заявки.'
                          : 'Our manager will assist you in booking these accommodations free of charge after your booking is confirmed.'}
                    </p>
                  </div>
                );
              })()}
            </section>
              </div>
            )}

            {/* ========= TAB: SIGHTS (Attractions grid) ========= */}
            {(activeTab === 'sights') && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)' }}>
                  {language === 'UZ' ? '🕌 Diqqatga sazovor joylar' : language === 'RU' ? '🕌 Достопримечательности' : '🕌 Attractions'}
                </h2>
                <RouteBuilder
                  locations={filteredLocations}
                  selectedLocations={selectedLocations}
                  onToggleLocation={handleToggleLocation}
                  language={language}
                  tourDurationType={tourDurationType}
                  numDays={numDays}
                  onUpdateLocationDay={handleUpdateLocationDay}
                  activeRegion={activeRegion}
                  onOpenWikipedia={setWikiLocation}
                />
              </div>
            )}

            {/* ========= TAB: TRANSPORT ========= */}
            {(activeTab === 'transport') && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)' }}>
                  {language === 'UZ' ? '🚗 Transportni tanlang' : language === 'RU' ? '🚗 Выберите транспорт' : '🚗 Choose Transport'}
                </h2>
                <VehicleSelector
                  vehicles={filteredVehicles}
                  selectedVehicleId={selectedVehicle?.id}
                  onSelectVehicle={handleSelectVehicle}
                  isOutOfCityRoute={isOutOfCityRoute}
                  language={language}
                />
              </div>
            )}

            {/* ========= TAB: GUIDES ========= */}
            {(activeTab === 'guides') && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)' }}>
                  {language === 'UZ' ? '🗣 Gidni tanlang' : language === 'RU' ? '🗣 Выберите гида' : '🗣 Choose Your Guide'}
                </h2>
                <GuideSelector
                  guides={filteredGuides}
                  tariffs={tariffs}
                  selectedGuideId={selectedGuide?.id}
                  selectedGuideLanguage={selectedGuideLanguage}
                  onSelectGuide={handleSelectGuide}
                  onSelectGuideLanguage={handleSelectGuideLanguage}
                  language={language}
                />
              </div>
            )}

            {/* 👤 Checkout (Always visible) */}
            <section id="checkout-step" style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '16px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)' }}>{t.step4}</h2>
              <CheckoutForm
                selectedLocations={selectedLocations}
                selectedVehicle={selectedVehicle}
                selectedGuide={selectedGuide}
                selectedGuideLanguage={selectedGuideLanguage}
                isOutOfCityRoute={isOutOfCityRoute}
                language={language}
                onSubmitBooking={handleSubmitBooking}
                isSubmitting={isSubmitting}
                activeRegion={activeRegion}
                tourDurationType={tourDurationType}
                numDays={numDays}
              />
            </section>
          </div>

          {/* Right Column: Sticky Interactive Map */}
          <div className="map-column" style={{
            position: 'relative',
          }}>
            <div className="map-sticky-container" style={{
              position: 'sticky',
              top: '110px',
              height: 'calc(100vh - 150px)',
              minHeight: '450px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary-blue)', fontWeight: '600', fontSize: '14px' }}>
                <MapPin size={16} />
                <span>Interactive Route Visualizer</span>
              </div>
              <Map
                locations={activeRegion === 'cross_region' ? locations : filteredLocations}
                selectedLocations={selectedLocations}
                language={language}
                activeRegion={activeRegion}
                tourDurationType={tourDurationType}
                onOpenWikipedia={setWikiLocation}
                theme={theme}
              />
            </div>
          </div>

        </div>
      </div>

      {/* Verification OTP Modal Dialog Overlay */}
      <VerificationModal
        email={bookingData?.touristEmail}
        isOpen={otpModalOpen}
        onClose={() => setOtpModalOpen(false)}
        onVerifyOtp={handleVerifyOtp}
        isVerifying={isVerifying}
        error={verificationError}
        language={language}
        emailSent={bookingData?.emailSent}
        otpCode={bookingData?.otpCode}
        bookingId={createdBookingId}
        onResendOtp={handleResendOtp}
      />

      {/* Payment Portal Modal Overlay */}
      <PaymentPortal
        isOpen={paymentOpen}
        onClose={() => setPaymentOpen(false)}
        bookingId={createdBookingId}
        totalPrice={bookingData?.totalPrice || 0}
        language={language}
        onPaymentSuccess={(paymentInfo) => {
          setBookingData((prev) => ({
            ...prev,
            paymentMethod: paymentInfo.paymentMethod,
            paymentTxId: paymentInfo.paymentTxId,
            depositAmount: paymentInfo.depositAmount,
          }));
          setPaymentOpen(false);
          setSuccessPage(true);
        }}
      />

      {/* Wikipedia Details Modal Overlay */}
      {wikiLocation && (
        <WikipediaModal
          location={wikiLocation}
          isOpen={!!wikiLocation}
          onClose={() => setWikiLocation(null)}
          language={language}
          onToggleLocation={handleToggleLocation}
          selectedLocations={selectedLocations}
        />
      )}

      {/* 📱 Mobile Sticky Floating Bar (Klook-style) */}
      {selectedLocations.length > 0 && !successPage && !otpModalOpen && !paymentOpen && (
        <div className="mobile-sticky-bar animate-fade-in">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: '600' }}>
              {language === 'UZ' 
                ? `${selectedLocations.length} ta joy tanlandi` 
                : language === 'RU' 
                  ? `Выбрано: ${selectedLocations.length} мест` 
                  : `${selectedLocations.length} attractions`}
            </span>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '3px' }}>
              <span style={{ fontSize: '12px', color: 'var(--primary-blue)', fontWeight: '700' }}>$</span>
              <span style={{ fontSize: '19px', fontWeight: '800', color: 'var(--primary-blue)', letterSpacing: '-0.5px' }}>
                {calculateTotal().toFixed(2)}
              </span>
            </div>
          </div>
          
          <button
            type="button"
            onClick={() => {
              document.getElementById('checkout-step')?.scrollIntoView({ behavior: 'smooth' });
            }}
            style={{
              padding: '10px 18px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, var(--primary-blue) 0%, var(--deep-turquoise) 100%)',
              color: '#fff',
              fontSize: '13px',
              fontWeight: '800',
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(255,91,0,0.3)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'transform 0.15s ease'
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1.0)'}
          >
            <span>✨</span>
            <span>
              {language === 'UZ' ? 'Bron qilish' : language === 'RU' ? 'Забронировать' : 'Book Now'}
            </span>
          </button>
        </div>
      )}

      <footer style={{
        marginTop: 'auto',
        padding: '24px 16px',
        borderTop: '1px solid var(--border-card)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        maxWidth: '1280px',
        width: '100%',
        margin: '40px auto 0 auto',
        fontSize: '13px',
        color: '#9e9e9e',
        backgroundColor: 'var(--bg-card)',
      }}>
        <div>
          © {new Date().getFullYear()} {activeRegion === 'qoraqalpoq' ? 'Qoraqalpog\'iston' : activeRegion === 'toshkent' ? 'Toshkent' : activeRegion === 'shahrisabz' ? 'Shahrisabz' : activeRegion === 'xorazm' ? 'Xorazm' : activeRegion === 'buxoro' ? 'Buxoro' : 'Samarqand'} CrafTour. {language === 'RU' ? 'Все права защищены.' : 'All rights reserved.'}
        </div>
        <a
          href="/admin"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            color: '#9e9e9e',
            textDecoration: 'none',
            opacity: 0.5,
            transition: 'opacity 0.2s, color 0.2s',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.opacity = 1; e.currentTarget.style.color = 'var(--primary-blue)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.opacity = 0.5; e.currentTarget.style.color = '#9e9e9e'; }}
        >
          <Lock size={12} />
          <span>{language === 'RU' ? 'Панель администратора' : 'Admin Portal'}</span>
        </a>
      </footer>
    </main>
  );
}
