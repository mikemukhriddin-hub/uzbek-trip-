'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Languages, 
  Sun, 
  Cloud, 
  CloudRain, 
  ChevronLeft, 
  ChevronRight, 
  Calendar, 
  Compass, 
  Info, 
  TrendingUp, 
  DollarSign, 
  PhoneCall, 
  AlertTriangle,
  Award,
  BookOpen
} from 'lucide-react';
import BackgroundGraphics from '@/components/BackgroundGraphics';

const SAMARQAND_SLIDES = [
  {
    image: '/images/discover/uzb_nature_slide1.webp',
    title_en: 'Majestic Urgut Mountains',
    title_ru: 'Величественные горы Ургута',
    title_uz: 'Muhtasham Urgut tog\'lari',
    desc_en: 'Explore the stunning high-altitude pine forests, ancient caves, and refreshing cold springs of the Samarkand region hills.',
    desc_ru: 'Исследуйте потрясающие высокогорные сосновые леса, древние пещеры и освежающие прохлодные родники Самаркандской области.',
    desc_uz: 'Samarqand viloyati adirlarining go\'zal baland tog\'li qarag\'ayzorlari, qadimiy g\'orlari va shifobaxsh sovuq buloqlarini kashf eting.'
  },
  {
    image: '/images/discover/uzb_culture_slide2.webp',
    title_en: 'Traditional Crafts & Ceramics',
    title_ru: 'Традиционные ремесла и керамика',
    title_uz: 'An\'anaviy hunarmandchilik va kulolchilik',
    desc_en: 'The rich heritage of Uzbek craftsmanship: stunning blue Rishtan pottery and gold embroidery woven with ancient patterns.',
    desc_ru: 'Богатое наследие узбекского мастерства: изысканная синяя риштанская керамика и золотая вышивка, вытканная древними узорами.',
    desc_uz: 'O\'zbek hunarmandchiligining boy merosi: nafis ko\'k Rishton kulolchiligi va qadimiy naqshlar bilan to\'qilgan zardo\'zlik namunalari.'
  },
  {
    image: '/images/discover/uzb_registan_slide3.webp',
    title_en: 'Golden Sunset at Registan',
    title_ru: 'Золотой закат на Регистане',
    title_uz: 'Registonda oltin shafaq',
    desc_en: 'Stand before the three grand madrasahs, glowingly illuminated in golden hues as the sun sets over the ancient Silk Road hub.',
    desc_ru: 'Встаньте перед тремя грандиозными медресе, светящимися золотыми оттенками во время заката над древним центром Шелкового пути.',
    desc_uz: 'Qadimiy Buyuk Ipak yo\'li chorrahasida quyosh botayotganda oltin tusda yorishgan uchta ulug\'vor madrasa ro\'parasida turing.'
  }
];

const BUXORO_SLIDES = [
  {
    image: 'https://images.unsplash.com/photo-1584646098025-97cfbe6cae0d?auto=format&fit=crop&w=800&q=80',
    title_en: 'Ancient Kalyan Minaret',
    title_ru: 'Древний минарет Калян',
    title_uz: 'Ko\'hna Minorai Kalon',
    desc_en: 'Standing tall since 1127, this brick tower survived Genghis Khan and stands as a beacon of Bukhara\'s spiritual heart.',
    desc_ru: 'Этот кирпичный минарет, возвышающийся с 1127 года, пережил Чингисхана и является символом Бухары.',
    desc_uz: '1127-yildan buyon qad ko\'tarib turgan ushbu g\'ishtin minora Chingizxon bosqinidan omon qolgan Buxoro ramzidir.'
  },
  {
    image: 'https://images.unsplash.com/photo-1540959733332-eab4deceeaf7?auto=format&fit=crop&w=800&q=80',
    title_en: 'The Ark Citadel',
    title_ru: 'Цитадель Арк',
    title_uz: 'Buxoro Arki',
    desc_en: 'Walk inside the massive brick walls of the Emir\'s fortified city-fortress, dating back over 1500 years.',
    desc_ru: 'Прогуляйтесь по массивным кирпичным стенам укрепленной крепости эмира, история которой насчитывает более 1500 лет.',
    desc_uz: 'Buxoro amirlari yashagan, V asrga oid ulkan qal\'a va shahar ichidagi shahar devorlari bo\'ylab sayr qiling.'
  },
  {
    image: 'https://images.unsplash.com/photo-1605649487212-47bdab064df7?auto=format&fit=crop&w=800&q=80',
    title_en: 'Sunset over Lyabi-Khauz',
    title_ru: 'Закат над Ляби-Хауз',
    title_uz: 'Labi Hovuzda shafaq vaqti',
    desc_en: 'Relax by the historic pond surrounded by 16th-century madrasahs and ancient mulberry trees as the evening lights turn on.',
    desc_ru: 'Отдохните у исторического пруда, окруженного медресе XVI века и старыми тутовыми деревьями, при свете вечерних огней.',
    desc_uz: 'Kechki chiroqlar yonganda, XVI asr madrasalari va qadimgi tut daraxtlari bilan o\'ralgan tarixiy hovuz bo\'yida dam oling.'
  }
];

const XORAZM_SLIDES = [
  {
    image: 'https://images.unsplash.com/photo-1540959733332-eab4deceeaf7?auto=format&fit=crop&w=800&q=80',
    title_en: 'Kalta-Minor Minaret',
    title_ru: 'Минарет Кальта-Минор',
    title_uz: 'Kalta Minor minorasi',
    desc_en: 'Covered in vibrant turquoise glazed tiles, this iconic minaret is the visual heart of ancient Khiva.',
    desc_ru: 'Этот культовый минарет, полностью покрытый яркой бирюзовой глазурью, является сердцем древней Хивы.',
    desc_uz: 'Firuza sirlangan nafis koshinlar va geometrik naqshlar bilan bezatilgan Kalta Minor minorasi qadimiy Xiva shahrining ramzidir.'
  },
  {
    image: 'https://images.unsplash.com/photo-1627856013091-fed6e4e30025?auto=format&fit=crop&w=800&q=80',
    title_en: 'Kunya-Ark Citadel',
    title_ru: 'Крепость Куня-Арк',
    title_uz: 'Ko\'hna Ark qal\'asi',
    desc_en: 'Explore the fortified palace of the Khans, containing the mint, mosques, and the panoramic watchtower.',
    desc_ru: 'Исследуйте укрепленную резиденцию хивинских ханов с монетным двором, мечетями и смотровой башней.',
    desc_uz: 'Zarbxona, masjidlar va shahar manzarasini ko\'rsatuvchi baland kuzatuv minorasiga ega bo\'lgan xonlar qal\'asi.'
  },
  {
    image: 'https://images.unsplash.com/photo-1608958416790-27ff290c3ce2?auto=format&fit=crop&w=800&q=80',
    title_en: 'Islam Khodja Complex',
    title_ru: 'Комплекс Ислам-Ходжа',
    title_uz: 'Islomxo\'ja majmuasi',
    desc_en: 'The tallest minaret in Khiva, with its distinctive horizontal bands of turquoise tiles and madrasah.',
    desc_ru: 'Самый высокий минарет в Хиве с чередующимися полосами бирюзовой плитки и соседнее медресе.',
    desc_uz: 'Xivadagi eng baland minora bo\'lib, firuza rangli gorizontal koshin chiziqlari va madrasasi bilan ajralib turadi.'
  }
];

const SHAHRISABZ_SLIDES = [
  {
    image: 'https://images.unsplash.com/photo-1584646098025-97cfbe6cae0d?auto=format&fit=crop&w=800&q=80',
    title_en: 'Colossal Ak-Saray Palace',
    title_ru: 'Колоссальный дворец Ак-Сарай',
    title_uz: 'Muhtasham Oqsaroy saroyi',
    desc_en: 'The legendary summer palace of Tamerlane. Although mostly in ruins, its giant portal stands as a testament to Timurid architecture.',
    desc_ru: 'Легендарная летняя резиденция Амира Темура. Уцелевшие фрагменты гигантского портала поражают величием мозаики.',
    desc_uz: 'Amir Temur tomonidan bunyod etilgan afsonaviy yozgi qarorgoh. Uning ulkan peshtoq qoldiqlari me\'morchilik mo\'jizasidir.'
  },
  {
    image: 'https://images.unsplash.com/photo-1540959733332-eab4deceeaf7?auto=format&fit=crop&w=800&q=80',
    title_en: 'Kok Gumbaz Dome',
    title_ru: 'Купол Кок-Гумбаз',
    title_uz: 'Ko\'k Gumbaz masjidi',
    desc_en: 'Built by Ulugh Beg, the Friday Mosque of Shahrisabz is famous for its massive turquoise dome reflecting the blue sky.',
    desc_ru: 'Построенная Улугбеком пятничная мечеть знаменита своим массивным бирюзовым куполом, сливающимся с небом.',
    desc_uz: 'Ulug\'bek buyrug\'iga binoan qurilgan ushbu jome masjid firuza rangli ulkan gumbazi bilan dunyoga mashhurdir.'
  },
  {
    image: 'https://images.unsplash.com/photo-1605649487212-47bdab064df7?auto=format&fit=crop&w=800&q=80',
    title_en: 'Dorus Saodat Complex',
    title_ru: 'Комплекс Дорус-Саодат',
    title_uz: 'Dorus Saodat majmuasi',
    desc_en: 'The family crypt of the Temurid dynasty, housing Tamerlane\'s empty marble sarcophagus and his oldest son\'s vault.',
    desc_ru: 'Семейная усыпальница династии Темуридов, хранящая пустой мраморный саркофаг Амира Темура и склепы его сыновей.',
    desc_uz: 'Temuriylar sulolasining oilaviy maqbarasi bo\'lib, u yerda Amir Temur uchun tayyorlangan bo\'sh marmar tobut saqlanadi.'
  }
];

const SAMARQAND_EVENTS = [
  {
    id: 1,
    title_en: 'Navruz Spring Festival',
    title_ru: 'Весенний фестиваль Навруз',
    title_uz: 'Navro\'z bahor bayrami',
    date_en: 'March 21',
    date_ru: '21 Марта',
    date_uz: '21 Mart',
    desc_en: 'The Persian New Year welcoming spring. Celebrate with sumalak (sweet wheat paste), traditional folk music, and tightrope walkers.',
    desc_ru: 'Восточный Новый год, встречающий весну. Празднование с сумаляком, традиционной народной музыкой и канатоходцами.',
    desc_uz: 'Bahorni kutib oluvchi sharqona yangi yil. Sumalak, an\'anaviy xalq musiqasi va dorbozlar shoulari bilan nishonlanadi.'
  },
  {
    id: 3,
    title_en: 'Sharq Taronalari Music Festival',
    title_ru: 'Музыкальный фестиваль Шарк Тароналари',
    title_uz: 'Sharq Taronalari musiqa festivali',
    date_en: 'Late August (Biennial)',
    date_ru: 'Конец Августа (Раз в два года)',
    date_uz: 'Avgust oxiri (Ikki yilda bir marta)',
    desc_en: 'One of Central Asia\'s largest international music festivals, hosted right on the majestic Registan Square stage in Samarkand.',
    desc_ru: 'Один из крупнейших международных музыкальных фестивалей в Центральной Азии, проходящий на величественной площади Регистан.',
    desc_uz: 'Markaziy Osiyodagi eng yirik xalqaro musiqa festivallaridan biri bo\'lib, Samarqandning muhtasham Registon maydonida bo\'lib o\'tadi.'
  },
  {
    id: 4,
    title_en: 'Samarkand Marathon',
    title_ru: 'Самаркандский марафон',
    title_uz: 'Samarqand marafoni',
    date_en: 'Early November',
    date_ru: 'Начало Ноября',
    date_uz: 'Noyabr boshida',
    desc_en: 'A charitable sporting event where participants run scenic routes through historical monuments and ancient city gates.',
    desc_ru: 'Благотворительное спортивное мероприятие, участники которого пробегают по живописным маршрутам мимо исторических памятников.',
    desc_uz: 'Ishtirokchilar tarixiy yodgorliklar va qadimiy shahar darvozalari bo\'ylab yuguradigan xayriya sport tadbiri.'
  }
];

const BUXORO_EVENTS = [
  {
    id: 1,
    title_en: 'Navruz Spring Festival',
    title_ru: 'Весенний фестиваль Навруз',
    title_uz: 'Navro\'z bahor bayrami',
    date_en: 'March 21',
    date_ru: '21 Марта',
    date_uz: '21 Mart',
    desc_en: 'The Persian New Year welcoming spring. Celebrate with sumalak (sweet wheat paste), traditional folk music, and tightrope walkers.',
    desc_ru: 'Восточный Новый год, встречающий весну. Празднование с сумаляком, традиционной народной музыкой и канатоходцами.',
    desc_uz: 'Bahorni kutib oluvchi sharqona yangi yil. Sumalak, an\'anaviy xalq musiqasi va dorbozlar shoulari bilan nishonlanadi.'
  },
  {
    id: 2,
    title_en: 'Silk and Spices Festival',
    title_ru: 'Фестиваль Шёлка и Специй',
    title_uz: 'Ipak va ziravorlar festivali',
    date_en: 'Late May / June',
    date_ru: 'Конец Мая / Июнь',
    date_uz: 'May oxiri / Iyun',
    desc_en: 'An annual celebration showcasing traditional silk-weaving, handmade carpets, spice bazaars, and national folklore bands in Bukhara.',
    desc_ru: 'Ежегодное празднование в Бухаре, демонстрирующее традиционное шелкоткачество, ковры ручной работы, базары специй и фольклор.',
    desc_uz: 'Buxoroda an\'anaviy ipak to\'qish, qo\'lda to\'qilgan gilamlar, ziravorlar bozorlari va milliy folklor guruhlarini namoyish etuvchi har yillik bayram.'
  },
  {
    id: 5,
    title_en: 'Bukhara Melon & Honey Festival',
    title_ru: 'Фестиваль дыни и меда в Бухаре',
    title_uz: 'Qovun sayli va asal bayrami',
    date_en: 'Mid August',
    date_ru: 'Середина Августа',
    date_uz: 'Avgust o\'rtalari',
    desc_en: 'Taste the sweetest melons and honey varieties of the region, accompanied by traditional dances and folk concerts.',
    desc_ru: 'Попробуйте самые сладкие сорта дынь и меда в регионе под звуки традиционных танцев и народных концертов.',
    desc_uz: 'Buxoro vohasining eng shirin qovunlari va tabiiy asallaridan tatib ko\'ring. Milliy raqslar va folklor konsertlar taqdim etiladi.'
  }
];

const XORAZM_EVENTS = [
  {
    id: 1,
    title_en: 'Navruz Spring Festival',
    title_ru: 'Весенний фестиваль Навруз',
    title_uz: 'Navro\'z bahor bayrami',
    date_en: 'March 21',
    date_ru: '21 Марта',
    date_uz: '21 Mart',
    desc_en: 'The Persian New Year welcoming spring. Celebrate with sumalak (sweet wheat paste), traditional folk music, and tightrope walkers.',
    desc_ru: 'Восточный Новый год, встречающий весну. Празднование с сумаляком, традиционной народной музыкой и канатоходцами.',
    desc_uz: 'Bahorni kutib oluvchi sharqona yangi yil. Sumalak, an\'anaviy xalq musiqasi va dorbozlar shoulari bilan nishonlanadi.'
  },
  {
    id: 6,
    title_en: 'Lazgi Dance International Festival',
    title_ru: 'Международный фестиваль танца Лазги',
    title_uz: 'Xalqaro Lazgi raqs festivali',
    date_en: 'Late April',
    date_ru: 'Конец Апреля',
    date_uz: 'Aprel oxiri',
    desc_en: 'A vibrant festival celebrating the fiery, energetic dance of Khorezm (Lazgi), bringing dancers from all over the world to Khiva.',
    desc_ru: 'Яркий международный праздник в Хиве, посвященный энергичному и страстному хорезмскому танцу Лазги.',
    desc_uz: 'Xorazmning jo\'shqin va olovli Lazgi raqsiga bag\'ishlangan, butun dunyodan raqqosalarni jamlovchi xalqaro festival.'
  },
  {
    id: 7,
    title_en: 'Gurvak Melon Festival',
    title_ru: 'Фестиваль дыни Гурвак',
    title_uz: 'Gurvak qovun sayli',
    date_en: 'Mid August',
    date_ru: 'Середина Августа',
    date_uz: 'Avgust o\'rtalari',
    desc_en: 'Taste Khorezm\'s famous Gurvak melons, known for their unique sweetness, along with artisan craft fairs and folk concerts.',
    desc_ru: 'Попробуйте знаменитые хорезмские дыни сорта Гурвак, славящиеся своей сладостью, наряду с ярмаркой ремесел.',
    desc_uz: 'O\'ziga xos shirinligi bilan mashhur bo\'lgan Xorazmning Gurvak qovunlarini tatib ko\'ring, hunarmandlar ko\'rgazmasidan bahramand bo\'ling.'
  }
];

const SHAHRISABZ_EVENTS = [
  {
    id: 1,
    title_en: 'Navruz Spring Festival',
    title_ru: 'Весенний фестиваль Навруз',
    title_uz: 'Navro\'z bahor bayrami',
    date_en: 'March 21',
    date_ru: '21 Марта',
    date_uz: '21 Mart',
    desc_en: 'The Persian New Year welcoming spring. Celebrate with sumalak (sweet wheat paste), traditional folk music, and tightrope walkers.',
    desc_ru: 'Восточный Новый год, встречающий весну. Празднование с сумаляком, традиционной народной музыкой и канатоходцами.',
    desc_uz: 'Bahorni kutib oluvchi sharqona yangi yil. Sumalak, an\'anaviy xalq musiqasi va dorbozlar shoulari bilan nishonlanadi.'
  },
  {
    id: 8,
    title_en: 'National Folklore Festival',
    title_ru: 'Национальный фольклорный фестиваль',
    title_uz: 'Milliy folklor va doston festivali',
    date_en: 'Mid May',
    date_ru: 'Середина Мая',
    date_uz: 'May o\'rtalarida',
    desc_en: 'A colorful gathering in the hills of Shahrisabz showing traditional folklore dance, local crafts, and nomadic music.',
    desc_ru: 'Яркий фестиваль в предгорьях Шахрисабза, демонстрирующий народные танцы, ремесла и традиционные песнопения бахши.',
    desc_uz: 'Shahrisabz adirlarida o\'tkaziladigan, milliy folklor raqslari, hunarmandchilik va baxshilar dostonlarini namoyish etuvchi festival.'
  },
  {
    id: 9,
    title_en: 'Katta-Langar Mountain Picnic',
    title_ru: 'Горный пикник в Катта-Лангаре',
    title_uz: 'Katta Langar tog\' sayli',
    date_en: 'Late Summer',
    date_ru: 'Конец Лета',
    date_uz: 'Yoz oxirida',
    desc_en: 'Experience traditional mountain tandoor meat cooked in clay ovens, local hikes, and stargazing in the clear mountain sky.',
    desc_ru: 'Насладитесь традиционным горным тандыр-кабобом, пешими прогулками и наблюдением за звездами в горах Лангара.',
    desc_uz: 'Tog\' bag\'rida tuproq tandirda pishirilgan tandir kabobdan bahramand bo\'lish, piyoda sayrlar va musaffo tog\' osmonini kuzatish tadbiri.'
  }
];

const TOSHKENT_SLIDES = [
  {
    image: 'https://images.unsplash.com/photo-1541432901042-2d8bd64b4a9b?auto=format&fit=crop&w=800&q=80',
    title_en: 'Amir Temur Square',
    title_ru: 'Площадь Амира Темура',
    title_uz: 'Amir Temur maydoni',
    desc_en: 'The grand central square of Tashkent, featuring an equestrian statue of Amir Temur surrounded by lush parks, fountains and modern city life.',
    desc_ru: 'Главная площадь Ташкента с конной статуей Амира Темура, парками и фонтанами.',
    desc_uz: 'Toshkentning markaziy maydonida Amir Temurning otliq haykali, yashil parklar, favvoralar va zamonaviy shahar hayoti.'
  },
  {
    image: 'https://images.unsplash.com/photo-1618218168350-6e7c8137558d?auto=format&fit=crop&w=800&q=80',
    title_en: 'Khast Imam — Spiritual Heart',
    title_ru: 'Хаст-Имам — духовный центр',
    title_uz: 'Hazrat Imom — ma\'naviy markaz',
    desc_en: 'Home to one of the world\'s oldest Quran manuscripts and stunning 16th-century Islamic architecture in the heart of old Tashkent.',
    desc_ru: 'Здесь хранится одна из старейших рукописей Корана и великолепная исламская архитектура XVI века.',
    desc_uz: 'Bu yerda dunyodagi eng qadimiy Qur\'on qo\'lyozmasi va Toshkent qalbidagi XVI asr islom me\'morchiligi joylashgan.'
  },
  {
    image: 'https://images.unsplash.com/photo-1596797038530-2c107229654b?auto=format&fit=crop&w=800&q=80',
    title_en: 'Chorsu Bazaar — City\'s Soul',
    title_ru: 'Базар Чорсу — душа города',
    title_uz: 'Chorsu bozori — shahar qalbi',
    desc_en: 'Tashkent\'s iconic ancient bazaar under a massive turquoise dome, overflowing with spices, fresh produce, textiles and local crafts.',
    desc_ru: 'Легендарный базар под огромным бирюзовым куполом со специями, овощами и народными промыслами.',
    desc_uz: 'Ulkan firuza gumbaz ostidagi Toshkentning mashhur Chorsu bozori — ziravorlar, mahsulotlar va milliy hunarmandchilik.'
  }
];

const TOSHKENT_EVENTS = [
  {
    id: 10,
    title_en: 'Tashkent City Day',
    title_ru: 'День города Ташкента',
    title_uz: 'Toshkent shahri kuni',
    date_en: 'Late September',
    date_ru: 'Конец сентября',
    date_uz: 'Sentabr oxirida',
    desc_en: 'Tashkent celebrates its founding with grand concerts, fireworks, art exhibitions, and a colorful parade along the central avenues.',
    desc_ru: 'Ташкент отмечает своё основание грандиозными концертами, фейерверками и выставками.',
    desc_uz: 'Toshkent o\'zining ta\'sis kuni sharafiga yirik konsertlar, ot\'in shou, san\'at ko\'rgazmalari va rang-barang paradlar uyushtiradi.'
  },
  {
    id: 11,
    title_en: 'Tashkent International Film Festival',
    title_ru: 'Ташкентский международный кинофестиваль',
    title_uz: 'Toshkent xalqaro kinofestivali',
    date_en: 'October',
    date_ru: 'Октябрь',
    date_uz: 'Oktabr',
    desc_en: 'One of Central Asia\'s premier film festivals, showcasing international and Uzbek cinema at the Navoi Theatre and city venues.',
    desc_ru: 'Один из ведущих кинофестивалей Центральной Азии в Театре Навои.',
    desc_uz: 'Navoiy teatri va shahar sahnaларida xalqaro va o\'zbek kino asarlarini namoyish etuvchi Markaziy Osiyoning yetakchi kinofestivali.'
  },
  {
    id: 12,
    title_en: 'Navruz in Tashkent',
    title_ru: 'Навруз в Ташкенте',
    title_uz: 'Toshkentda Navro\'z',
    date_en: 'March 21',
    date_ru: '21 Марта',
    date_uz: '21 Mart',
    desc_en: 'Tashkent comes alive with massive Navruz celebrations — sumalak cooking, folk dance shows, national food fairs and free concerts.',
    desc_ru: 'Ташкент оживает масштабными праздниками Навруза: сумаляк, народные танцы, еда и бесплатные концерты.',
    desc_uz: 'Toshkent ulkan Navro\'z bayramlari bilan jonlanadi — sumalak pishirish, xalq raqslari, milliy taomlar yarmarkasi va bepul konsertlar.'
  }
];

const QORAQALPOQ_SLIDES = [
  {
    image: 'https://images.unsplash.com/photo-1618218168350-6e7c8137558d?auto=format&fit=crop&w=800&q=80',
    title_en: 'Savitsky Museum',
    title_ru: 'Музей Савицкого',
    title_uz: 'Savitskiy muzeyi',
    desc_en: 'The world-famous Nukus Museum of Art, hosting a legendary collection of forbidden Soviet avant-garde art.',
    desc_ru: 'Всемирно известный Нукусский художественный музей с легендарной коллекцией запрещенного советского авангарда.',
    desc_uz: 'Taqqiqlangan sovet avant-garde san\'atining afsonaviy to\'plamiga ega bo\'lgan jahonga mashhur Nukus tasviriy san\'at muzeyi.'
  },
  {
    image: 'https://images.unsplash.com/photo-1540959733332-eab4deceeaf7?auto=format&fit=crop&w=800&q=80',
    title_en: 'Mizdakhkhan Necropolis',
    title_ru: 'Некрополь Миздахкан',
    title_uz: 'Mizdaxqon majmuasi',
    desc_en: 'An ancient, mystical cemetery dating back to the 4th century BC, containing the mythical World Clock monument.',
    desc_ru: 'Древний мистический некрополь IV века до н.э. с легендарными «Мировыми часами».',
    desc_uz: 'Miloddan avvalgi IV asrga oid, sirli "Dunyo soati" inshootini o\'z ichiga olgan qadimiy va muqaddas maqbaralar majmuasi.'
  },
  {
    image: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=800&q=80',
    title_en: 'Aral Sea & Muynaq Ship Graveyard',
    title_ru: 'Кладбище кораблей в Муйнаке',
    title_uz: 'Mo\'ynoq kemalar qabristoni',
    desc_en: 'Explore the hauntingly beautiful ship graveyard on the former bed of the dried-up Aral Sea.',
    desc_ru: 'Исследуйте драматическое кладбище кораблей на бывшем дне некогда великого Аральского моря.',
    desc_uz: 'Qurib qolgan Orol dengizining sobiq tubida joylashgan, ulkan tarixiy fojea va go\'zallik timsoli bo\'lgan kemalar qabristoni.'
  }
];

const QORAQALPOQ_EVENTS = [
  {
    id: 13,
    title_en: 'Stixia Festival',
    title_ru: 'Фестиваль Стихия',
    title_uz: 'Stixiya festivali',
    date_en: 'Late May / June',
    date_ru: 'Конец мая / Июнь',
    date_uz: 'May oxiri / Iyun',
    desc_en: 'A unique electronic music, science, and art festival held in the desert landscape of Muynaq, raising awareness for the Aral Sea.',
    desc_ru: 'Уникальный фестиваль электронной музыки, науки и искусства в Муйнаке, посвященный теме Аральского моря.',
    desc_uz: 'Orol dengizi ekologiyasiga e\'tibor qaratish maqsadida Mo\'ynoq sahrosida o\'tkaziladigan o\'ziga xos elektron musiqa, ilm-fan va san\'at festivali.'
  },
  {
    id: 14,
    title_en: 'Karakalpak Epic & Folk Art Festival',
    title_ru: 'Фестиваль каракалпакского эпоса',
    title_uz: 'Qoraqalpoq dostonchilik festivali',
    date_en: 'September',
    date_ru: 'Сентябрь',
    date_uz: 'Sentabr',
    desc_en: 'A celebration of Karakalpak throat singing (jirau), epic poetry, traditional yurt decoration, and local crafts in Nukus.',
    desc_ru: 'Праздник каракалпакского горлового пения (жирау), эпоса и народных ремесел в Нукусе.',
    desc_uz: 'Nukus shahrida o\'tkaziladigan qoraqalpoq baxshi-dostonchilari (jirau), milliy o\'tovlar bezaklari va xalq hunarmandchiligi bayrami.'
  },
  {
    id: 15,
    title_en: 'Aral Sea Eco-Marathon',
    title_ru: 'Эко-марафон Аральского моря',
    title_uz: 'Orol dengizi eko-marafoni',
    date_en: 'October',
    date_ru: 'Октябрь',
    date_uz: 'Oktabr',
    desc_en: 'An extreme endurance run along the dry seabed and canyons of Muynaq to promote environmental tourism and ecology.',
    desc_ru: 'Экстремальный забег по дну Аральского моря и каньонам Муйнака для поддержки экологии.',
    desc_uz: 'Ekologik turizmni rivojlantirish va Orol ekologiyasini qo\'llab-quvvatlash maqsadida Mo\'ynoq sahrosi va kanyonlari bo\'ylab ekstremal marafon.'
  }
];

export default function DiscoverPage({ searchParams }) {
  const resolvedSearchParams = searchParams ? use(searchParams) : {};
  const regionParam = resolvedSearchParams?.region;
  const initialRegion = (regionParam === 'buxoro' || regionParam === 'samarqand' || regionParam === 'xorazm' || regionParam === 'shahrisabz' || regionParam === 'toshkent' || regionParam === 'qoraqalpoq') ? regionParam : 'samarqand';

  const [activeRegion, setActiveRegion] = useState(initialRegion);
  const [language, setLanguage] = useState('EN');
  const [showLangDropdown, setShowLangDropdown] = useState(false);
  const [activeSlide, setActiveSlide] = useState(0);
  const [usdAmount, setUsdAmount] = useState('100');
  const [uzsAmount, setUzsAmount] = useState('1280000');
  
  const EXCHANGE_RATE = 12800; // 1 USD = 12,800 UZS
  const slides = activeRegion === 'qoraqalpoq' ? QORAQALPOQ_SLIDES : activeRegion === 'toshkent' ? TOSHKENT_SLIDES : activeRegion === 'shahrisabz' ? SHAHRISABZ_SLIDES : activeRegion === 'xorazm' ? XORAZM_SLIDES : activeRegion === 'buxoro' ? BUXORO_SLIDES : SAMARQAND_SLIDES;
  const events = activeRegion === 'qoraqalpoq' ? QORAQALPOQ_EVENTS : activeRegion === 'toshkent' ? TOSHKENT_EVENTS : activeRegion === 'shahrisabz' ? SHAHRISABZ_EVENTS : activeRegion === 'xorazm' ? XORAZM_EVENTS : activeRegion === 'buxoro' ? BUXORO_EVENTS : SAMARQAND_EVENTS;

  // Sync query parameters changes to state
  useEffect(() => {
    if (regionParam && (regionParam === 'samarqand' || regionParam === 'buxoro' || regionParam === 'xorazm' || regionParam === 'shahrisabz' || regionParam === 'toshkent' || regionParam === 'qoraqalpoq')) {
      setActiveRegion(regionParam);
    }
  }, [regionParam]);

  // Sync state loaded from localStorage if user was previously reading in RU/UZ
  useEffect(() => {
    // Basic local language check
    const savedLang = localStorage.getItem('site_lang');
    if (savedLang) {
      Promise.resolve().then(() => {
        setLanguage(savedLang);
      });
    }

    // Load active region from localStorage only if no query param was provided
    if (!regionParam) {
      const savedRegion = localStorage.getItem('active_region');
      if (savedRegion && (savedRegion === 'samarqand' || savedRegion === 'buxoro' || savedRegion === 'xorazm' || savedRegion === 'shahrisabz')) {
        Promise.resolve().then(() => {
          setActiveRegion(savedRegion);
        });
      }
    }
  }, [regionParam]);

  // Sync activeRegion changes to document.body and localStorage
  useEffect(() => {
    setActiveSlide(0);
    if (typeof document !== 'undefined') {
      document.body.setAttribute('data-region', activeRegion);
      localStorage.setItem('active_region', activeRegion);
    }
  }, [activeRegion]);

  const handleLanguageToggle = () => {
    const nextLang = language === 'EN' ? 'RU' : language === 'RU' ? 'UZ' : 'EN';
    setLanguage(nextLang);
    localStorage.setItem('site_lang', nextLang);
  };

  // Slideshow Auto-play
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [slides]);

  const prevSlide = () => {
    setActiveSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  const nextSlide = () => {
    setActiveSlide((prev) => (prev + 1) % slides.length);
  };

  const handleUsdChange = (val) => {
    setUsdAmount(val);
    if (!isNaN(val) && val !== '') {
      setUzsAmount((parseFloat(val) * EXCHANGE_RATE).toFixed(0));
    } else {
      setUzsAmount('');
    }
  };

  const handleUzsChange = (val) => {
    setUzsAmount(val);
    if (!isNaN(val) && val !== '') {
      setUsdAmount((parseFloat(val) / EXCHANGE_RATE).toFixed(2));
    } else {
      setUsdAmount('');
    }
  };

  const t = {
    backBtn: language === 'UZ' ? 'Orqaga qaytish' : language === 'RU' ? 'Вернуться назад' : 'Back to route builder',
    pageTitle: language === 'UZ' ? 'Sayohatchilar uchun qo\'llanma' : language === 'RU' ? 'Гид для Путешественников' : 'Traveler Discover Hub',
    pageSubtitle: activeRegion === 'shahrisabz'
      ? (language === 'UZ' 
        ? 'Shahrisabzning (Amir Temur vatanining) madaniy merosi, festivallari, ob-havosi va muhim ma\'lumotlari'
        : language === 'RU' 
        ? 'Актуальная информация, погода, праздники и культурное наследие родины Амира Темура — Шахрисабза'
        : 'Real-time weather, cultural festivals, slideshows, and local travel advice for Shahrisabz')
      : activeRegion === 'xorazm'
      ? (language === 'UZ' 
        ? 'Xorazmning (Xivaning) madaniy merosi, festivallari, ob-havosi va muhim ma\'lumotlari'
        : language === 'RU' 
        ? 'Актуальная информация, погода, праздники и культурное наследие Хорезма'
        : 'Real-time weather, cultural festivals, slideshows, and local travel advice for Khorezm')
      : activeRegion === 'buxoro'
      ? (language === 'UZ' 
        ? 'Buxoroning madaniy merosi, festivallari, ob-havosi va muhim ma\'lumotlari'
        : language === 'RU' 
        ? 'Актуальная информация, погода, праздники и культурное наследие Бухары'
        : 'Real-time weather, cultural festivals, slideshows, and local travel advice for Bukhara')
      : (language === 'UZ' 
        ? 'Samarqandning madaniy merosi, bayramlari, ob-havosi va muhim ma\'lumotlari'
        : language === 'RU' 
        ? 'Актуальная информация, погода, праздники и культурное наследие Самарканда'
        : 'Real-time weather, cultural festivals, slideshows, and local travel advice for Samarkand'),
    
    // Weather
    weatherTitle: activeRegion === 'shahrisabz'
      ? (language === 'UZ' ? '🌤 Shahrisabz ob-havosi' : language === 'RU' ? '🌤 Погода в Шахрисабзе' : '🌤 Shahrisabz Weather')
      : activeRegion === 'xorazm'
      ? (language === 'UZ' ? '🌤 Xorazm ob-havosi' : language === 'RU' ? '🌤 Погода в Хорезме' : '🌤 Khorezm Weather')
      : activeRegion === 'buxoro'
      ? (language === 'UZ' ? '🌤 Buxoro ob-havosi' : language === 'RU' ? '🌤 Погода в Бухаре' : '🌤 Bukhara Weather')
      : (language === 'UZ' ? '🌤 Samarqand ob-havosi' : language === 'RU' ? '🌤 Погода в Самарканде' : '🌤 Samarkand Weather'),
    weatherDesc: language === 'UZ' ? 'Ochiq va quyoshli kun' : language === 'RU' ? 'Ясно, солнечный день' : 'Clear & sunny sky',
    weatherTipTitle: language === 'UZ' ? 'Kiyim bo\'yicha tavsiya:' : language === 'RU' ? 'Совет по одежде:' : 'Attire Suggestion:',
    weatherTipDesc: language === 'UZ' 
      ? 'Sayr qilish uchun ajoyib ob-havo. Yengil paxtali kiyimlar, quyoshdan himoyalovchi ko\'zoynak va krem tavsiya etiladi. Bosh kiyim kiyish maslahat beriladi!'
      : language === 'RU' 
      ? 'Идеальная погода для экскурсий. Рекомендуем легкую хлопковую одежду, солнцезащитные очки и крем от солнца. Головной убор обязателен!'
      : 'Perfect weather for walking. Light cotton clothes, sunglasses, and sunblock are recommended. A hat is highly advised!',
    weatherForecast: language === 'UZ' ? '3 kunlik prognoz:' : language === 'RU' ? 'Прогноз на 3 дня:' : '3-Day Forecast:',
    tomorrow: language === 'UZ' ? 'Ertaga' : language === 'RU' ? 'Завтра' : 'Tomorrow',
    dayAfter: language === 'UZ' ? 'Indinga' : language === 'RU' ? 'Послезавтра' : 'Day After',
    dayThree: language === 'UZ' ? 'Uchinchi kun' : language === 'RU' ? '3-й День' : '3rd Day',

    // Events
    eventsTitle: language === 'UZ' ? '🎉 Kutilayotgan Festivallar' : language === 'RU' ? '🎉 Предстоящие Фестивали' : '🎉 Upcoming Festivals',
    eventsSub: language === 'UZ' 
      ? 'Sayohat rejangizni yirik madaniy tadbirlarga moslab tuzing'
      : language === 'RU' 
      ? 'Планируйте свое путешествие под крупные культурные события'
      : 'Plan your custom itinerary around major events',

    // Slideshow
    slideshowTitle: language === 'UZ' ? '📸 O\'zbekiston galereyasi' : language === 'RU' ? '📸 Галерея Узбекистана' : '📸 Uzbekistan Showcase',

    // Useful Tips
    tipsTitle: language === 'UZ' ? '💡 Foydali maslahatlar' : language === 'RU' ? '💡 Советы путешественнику' : '💡 Travel Tips & Info',
    etiquetteTitle: language === 'UZ' ? '🕌 Ziyorat odobi' : language === 'RU' ? '🕌 Культурный этикет' : '🕌 Local Etiquette',
    etiquetteDesc: language === 'UZ'
      ? 'Faol masjidlar va maqbaralarga tashrif buyurganda yelka va tizzalarni yopiq tuting. Ayollarga yengil ro\'mol kiyish tavsiya etiladi.'
      : language === 'RU'
      ? 'При посещении действующих мечетей и мавзолеев закрывайте плечи и колени. Женщинам рекомендуется взять легкий платок на голову.'
      : 'Cover shoulders and knees when visiting active mosques and shrines. Women are advised to bring a light headscarf.',
    
    currencyTitle: language === 'UZ' ? '💵 Valyuta konverteri (UZS)' : language === 'RU' ? '💵 Конвертер валют (UZS)' : '💵 UZS Currency Exchange',
    currencySub: language === 'UZ' 
      ? 'Ayirboshlash kursi: $1 ≈ 12,800 so\'m (taxminan)'
      : language === 'RU' 
      ? 'Курс обмена: $1 ≈ 12,800 сум (оценочно)'
      : 'Exchange rate: $1 ≈ 12,800 UZS (estimated)',
    
    contactsTitle: language === 'UZ' ? '📞 Favqulodda kontaktlar' : language === 'RU' ? '📞 Экстренные контакты' : '📞 Emergency Contacts',
    contactsDesc: language === 'UZ'
      ? 'Turistik politsiya: 1173\nYagona qutqaruv xizmati: 112\nMamlakat kodi: +998'
      : language === 'RU'
      ? 'Туристическая полиция: 1173\nЕдиная экстренная служба: 112\nКод страны: +998'
      : 'Tourist Police: 1173\nUniversal Emergency: 112\nCountry Code: +998'
  };

  return (
    <main style={{ width: '100%', minHeight: '100vh', padding: '16px', display: 'flex', flexDirection: 'column', backgroundColor: '#0a0f1d', color: '#fff', position: 'relative', overflowX: 'hidden' }}>
      <BackgroundGraphics />

      {/* 🕌 Premium Sticky Header */}
      <header className="glass-container" style={{
        padding: '16px 24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        border: '1px solid rgba(212,175,55,0.15)',
        borderRadius: '16px',
        position: 'sticky',
        top: '16px',
        zIndex: 100,
        maxWidth: '1280px',
        width: '100%',
        margin: '0 auto 24px auto'
      }}>
        <Link href="/" style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          color: '#cbd5e1',
          textDecoration: 'none',
          fontSize: '13px',
          fontWeight: '600',
          transition: 'color 0.2s'
        }}
        onMouseEnter={(e) => e.currentTarget.style.color = '#d4af37'}
        onMouseLeave={(e) => e.currentTarget.style.color = '#cbd5e1'}
        >
          <ArrowLeft size={16} />
          <span>{t.backBtn}</span>
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Compass size={20} className="animate-spin" style={{ color: '#d4af37', animationDuration: '20s' }} />
          <span style={{ fontSize: '16px', fontWeight: 800, letterSpacing: '0.05em', color: '#fff' }}>
            {activeRegion === 'xorazm' ? 'XORAZM' : activeRegion === 'buxoro' ? 'BUXORO' : 'SAMARQAND'} <span style={{ color: '#d4af37' }}>DISCOVER</span>
          </span>
        </div>

        {/* Region Switcher */}
        <div style={{
          display: 'flex',
          backgroundColor: 'rgba(5, 7, 16, 0.4)',
          border: '1px solid rgba(212, 175, 55, 0.25)',
          borderRadius: '12px',
          padding: '3px',
          gap: '2px',
          marginRight: '4px'
        }}>
          <button
            onClick={() => setActiveRegion('samarqand')}
            style={{
              padding: '6px 12px',
              borderRadius: '8px',
              border: 'none',
              background: activeRegion === 'samarqand' 
                ? 'linear-gradient(135deg, #0070c0 0%, #009b9e 100%)' 
                : 'transparent',
              color: activeRegion === 'samarqand' ? '#fff' : '#94a3b8',
              fontSize: '12px',
              fontWeight: '700',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: activeRegion === 'samarqand' ? '0 2px 8px rgba(0, 112, 192, 0.4)' : 'none'
            }}
          >
            {language === 'UZ' ? 'Samarqand' : language === 'RU' ? 'Самарканд' : 'Samarkand'}
          </button>
          <button
            onClick={() => setActiveRegion('buxoro')}
            style={{
              padding: '6px 12px',
              borderRadius: '8px',
              border: 'none',
              background: activeRegion === 'buxoro' 
                ? 'linear-gradient(135deg, #c05a1a 0%, #b25329 100%)' 
                : 'transparent',
              color: activeRegion === 'buxoro' ? '#fff' : '#94a3b8',
              fontSize: '12px',
              fontWeight: '700',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: activeRegion === 'buxoro' ? '0 2px 8px rgba(192, 90, 26, 0.4)' : 'none'
            }}
          >
            {language === 'UZ' ? 'Buxoro' : language === 'RU' ? 'Бухара' : 'Bukhara'}
          </button>
          <button
            onClick={() => setActiveRegion('xorazm')}
            style={{
              padding: '6px 12px',
              borderRadius: '8px',
              border: 'none',
              background: activeRegion === 'xorazm' 
                ? 'linear-gradient(135deg, #028090 0%, #00a896 100%)' 
                : 'transparent',
              color: activeRegion === 'xorazm' ? '#fff' : '#94a3b8',
              fontSize: '12px',
              fontWeight: '700',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: activeRegion === 'xorazm' ? '0 2px 8px rgba(2, 128, 144, 0.4)' : 'none'
            }}
          >
            {language === 'UZ' ? 'Xorazm' : language === 'RU' ? 'Хорезм' : 'Khorezm'}
          </button>
          <button
            onClick={() => setActiveRegion('shahrisabz')}
            style={{
              padding: '6px 12px',
              borderRadius: '8px',
              border: 'none',
              background: activeRegion === 'shahrisabz' 
                ? 'linear-gradient(135deg, #008060 0%, #00a36c 100%)' 
                : 'transparent',
              color: activeRegion === 'shahrisabz' ? '#fff' : '#94a3b8',
              fontSize: '12px',
              fontWeight: '700',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: activeRegion === 'shahrisabz' ? '0 2px 8px rgba(0, 128, 96, 0.4)' : 'none'
            }}
          >
            {language === 'UZ' ? 'Shahrisabz' : language === 'RU' ? 'Шахрисабз' : 'Shahrisabz'}
          </button>
          <button
            onClick={() => setActiveRegion('toshkent')}
            style={{
              padding: '6px 12px',
              borderRadius: '8px',
              border: 'none',
              background: activeRegion === 'toshkent' 
                ? 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)' 
                : 'transparent',
              color: activeRegion === 'toshkent' ? '#fff' : '#94a3b8',
              fontSize: '12px',
              fontWeight: '700',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: activeRegion === 'toshkent' ? '0 2px 8px rgba(30, 64, 175, 0.4)' : 'none'
            }}
          >
            {language === 'UZ' ? 'Toshkent' : language === 'RU' ? 'Ташкент' : 'Tashkent'}
          </button>
          <button
            onClick={() => setActiveRegion('qoraqalpoq')}
            style={{
              padding: '6px 12px',
              borderRadius: '8px',
              border: 'none',
              background: activeRegion === 'qoraqalpoq' 
                ? 'linear-gradient(135deg, #7c3aed 0%, #a78bfa 100%)' 
                : 'transparent',
              color: activeRegion === 'qoraqalpoq' ? '#fff' : '#94a3b8',
              fontSize: '12px',
              fontWeight: '700',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: activeRegion === 'qoraqalpoq' ? '0 2px 8px rgba(124, 58, 237, 0.4)' : 'none'
            }}
          >
            {language === 'UZ' ? 'Qoraqalpoq' : language === 'RU' ? 'Каракалпак' : 'Karakalpak'}
          </button>
        </div>

        {/* Premium Dropdown Language Switcher */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setShowLangDropdown(!showLangDropdown)}
            style={{
              padding: '8px 16px',
              borderRadius: '10px',
              backgroundColor: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              color: '#fff',
              fontSize: '13px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.2s ease'
            }}
          >
            <Languages size={14} style={{ color: '#d4af37' }} />
            <span>{language === 'EN' ? '🇬🇧 EN' : language === 'RU' ? '🇷🇺 RU' : '🇺🇿 UZ'}</span>
          </button>
          {showLangDropdown && (
            <div style={{
              position: 'absolute',
              top: 'calc(100% + 8px)',
              right: 0,
              backgroundColor: '#0f172a',
              border: '1px solid rgba(212,175,55,0.25)',
              borderRadius: '10px',
              padding: '4px',
              zIndex: 1000,
              boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
              display: 'flex',
              flexDirection: 'column',
              gap: '2px',
              minWidth: '130px'
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
                    padding: '8px 12px',
                    border: 'none',
                    background: language === langCode ? 'rgba(212,175,55,0.1)' : 'transparent',
                    color: language === langCode ? '#d4af37' : '#94a3b8',
                    textAlign: 'left',
                    fontSize: '13px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    borderRadius: '6px',
                    transition: 'all 0.2s ease',
                    width: '100%'
                  }}
                  onMouseEnter={(e) => {
                    if (language !== langCode) {
                      e.currentTarget.style.color = '#fff';
                      e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (language !== langCode) {
                      e.currentTarget.style.color = '#94a3b8';
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
      </header>

      {/* Main Grid Content */}
      <div style={{
        maxWidth: '1280px',
        width: '100%',
        margin: '0 auto',
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        gap: '32px'
      }}>
        
        {/* Title Section */}
        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '12px' }}>
          <h1 style={{ fontSize: '32px', fontWeight: 800, color: '#fff', letterSpacing: '0.02em' }}>
            {t.pageTitle}
          </h1>
          <p style={{ fontSize: '15px', color: '#94a3b8', maxWidth: '600px', margin: '0 auto', lineHeight: 1.5 }}>
            {t.pageSubtitle}
          </p>
        </div>

        {/* Top Split Layout: Slideshow (Left) & Weather (Right) */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '24px'
        }}>
          
          {/* 📸 Cultural / Nature Slideshow */}
          <section className="glass-container gold-glow" style={{
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            minHeight: '400px'
          }}>
            <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Award size={18} style={{ color: '#d4af37' }} />
              {t.slideshowTitle}
            </h2>

            {/* Slider Viewport */}
            <div style={{
              position: 'relative',
              width: '100%',
              height: '240px',
              borderRadius: '12px',
              overflow: 'hidden',
              border: '1px solid rgba(255,255,255,0.06)'
            }}>
              {/* Slide Image */}
              <img 
                src={slides[activeSlide]?.image} 
                alt={slides[activeSlide]?.title_en}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  transition: 'opacity 0.5s ease-in-out'
                }}
              />

              {/* Navigation overlays */}
              <button 
                onClick={prevSlide}
                style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(5, 7, 16, 0.65)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  zIndex: 10
                }}
              >
                <ChevronLeft size={16} />
              </button>

              <button 
                onClick={nextSlide}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(5, 7, 16, 0.65)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  zIndex: 10
                }}
              >
                <ChevronRight size={16} />
              </button>

              {/* Page dots indicators */}
              <div style={{
                position: 'absolute',
                bottom: '12px',
                left: '50%',
                transform: 'translateX(-50%)',
                display: 'flex',
                gap: '8px',
                zIndex: 10
              }}>
                {slides.map((_, idx) => (
                  <div 
                    key={idx}
                    onClick={() => setActiveSlide(idx)}
                    style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      backgroundColor: idx === activeSlide ? '#d4af37' : 'rgba(255,255,255,0.3)',
                      cursor: 'pointer',
                      transition: 'background-color 0.2s'
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Slide Information */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }} className="animate-fade-in">
              <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#d4af37' }}>
                {language === 'UZ' ? slides[activeSlide]?.title_uz : language === 'RU' ? slides[activeSlide]?.title_ru : slides[activeSlide]?.title_en}
              </h3>
              <p style={{ fontSize: '13px', color: '#94a3b8', lineHeight: 1.5 }}>
                {language === 'UZ' ? slides[activeSlide]?.desc_uz : language === 'RU' ? slides[activeSlide]?.desc_ru : slides[activeSlide]?.desc_en}
              </p>
            </div>
          </section>

          {/* 🌤 Interactive Weather Widget */}
          <section className="glass-container gold-glow" style={{
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            justifyContent: 'space-between'
          }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Sun size={18} style={{ color: '#fbbf24' }} />
                {t.weatherTitle}
              </h2>

              {/* Main Weather Display */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '20px', backgroundColor: 'rgba(10, 15, 29, 0.4)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.03)' }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '10px',
                  backgroundColor: 'rgba(251, 191, 36, 0.12)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fbbf24'
                }}>
                  <Sun size={28} className="animate-spin" style={{ animationDuration: '30s' }} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '28px', fontWeight: '800', color: '#fff', lineHeight: 1 }}>
                    {activeRegion === 'xorazm' ? '33°C' : activeRegion === 'buxoro' ? '31°C' : '28°C'} <span style={{ fontSize: '14px', fontWeight: '400', color: '#94a3b8' }}>/ {activeRegion === 'xorazm' ? '91°F' : activeRegion === 'buxoro' ? '88°F' : '82°F'}</span>
                  </span>
                  <span style={{
                    fontSize: '13px',
                    color: activeRegion === 'xorazm' ? '#00a896' : activeRegion === 'buxoro' ? '#b25329' : '#009b9e',
                    fontWeight: '600',
                    marginTop: '4px'
                  }}>
                    {t.weatherDesc}
                  </span>
                </div>
              </div>

              {/* Advice */}
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '4px',
                fontSize: '13px',
                lineHeight: 1.5,
                backgroundColor: 'rgba(212, 175, 55, 0.05)',
                borderLeft: '3px solid #d4af37',
                padding: '12px',
                borderRadius: '0 8px 8px 0'
              }}>
                <strong style={{ color: '#d4af37' }}>{t.weatherTipTitle}</strong>
                <span style={{ color: '#e2e8f0' }}>{t.weatherTipDesc}</span>
              </div>
            </div>

            {/* 3-day forecast */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <span style={{ fontSize: '12px', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {t.weatherForecast}
              </span>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', padding: '10px', backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.04)' }}>
                  <span style={{ fontSize: '11px', color: '#94a3b8' }}>{t.tomorrow}</span>
                  <Sun size={16} style={{ color: '#fbbf24' }} />
                  <strong style={{ fontSize: '13px', color: '#fff' }}>{activeRegion === 'xorazm' ? '34°C' : activeRegion === 'buxoro' ? '32°C' : '29°C'}</strong>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', padding: '10px', backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.04)' }}>
                  <span style={{ fontSize: '11px', color: '#94a3b8' }}>{t.dayAfter}</span>
                  {activeRegion === 'xorazm' ? <Sun size={16} style={{ color: '#fbbf24' }} /> : activeRegion === 'buxoro' ? <Sun size={16} style={{ color: '#fbbf24' }} /> : <Cloud size={16} style={{ color: '#94a3b8' }} />}
                  <strong style={{ fontSize: '13px', color: '#fff' }}>{activeRegion === 'xorazm' ? '33°C' : activeRegion === 'buxoro' ? '31°C' : '27°C'}</strong>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', padding: '10px', backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.04)' }}>
                  <span style={{ fontSize: '11px', color: '#94a3b8' }}>{t.dayThree}</span>
                  <Sun size={16} style={{ color: '#fbbf24' }} />
                  <strong style={{ fontSize: '13px', color: '#fff' }}>{activeRegion === 'xorazm' ? '35°C' : activeRegion === 'buxoro' ? '33°C' : '30°C'}</strong>
                </div>
              </div>
            </div>

          </section>

        </div>

        {/* Middle Section: Festival & Events Calendar */}
        <section className="glass-container gold-glow" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Calendar size={18} style={{ color: '#d4af37' }} />
              {t.eventsTitle}
            </h2>
            <p style={{ fontSize: '12px', color: '#94a3b8' }}>{t.eventsSub}</p>
          </div>

          {/* Events Grid layout */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '16px'
          }}>
            {events.map((evt) => (
              <div 
                key={evt.id}
                style={{
                  padding: '16px',
                  backgroundColor: 'rgba(10, 15, 29, 0.4)',
                  borderRadius: '12px',
                  border: '1px solid rgba(212, 175, 55, 0.1)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                  transition: 'transform 0.2s, border-color 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.borderColor = 'rgba(212, 175, 55, 0.3)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.borderColor = 'rgba(212, 175, 55, 0.1)';
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '6px' }}>
                  <span style={{ fontSize: '11px', fontWeight: '700', color: '#009b9e', backgroundColor: 'rgba(0, 155, 158, 0.1)', padding: '2px 8px', borderRadius: '6px' }}>
                    {language === 'UZ' ? evt.date_uz : language === 'RU' ? evt.date_ru : evt.date_en}
                  </span>
                </div>
                <h4 style={{ fontSize: '14px', fontWeight: '700', color: '#fff' }}>
                  {language === 'UZ' ? evt.title_uz : language === 'RU' ? evt.title_ru : evt.title_en}
                </h4>
                <p style={{ fontSize: '12px', color: '#94a3b8', lineHeight: 1.5 }}>
                  {language === 'UZ' ? evt.desc_uz : language === 'RU' ? evt.desc_ru : evt.desc_en}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Bottom Section: Info Grid (Etiquette, Currency Converter, Contacts) */}
        <section style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <BookOpen size={18} style={{ color: '#d4af37' }} />
            {t.tipsTitle}
          </h2>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '24px'
          }}>
            
            {/* 🕌 Cultural Etiquette Card */}
            <div className="glass-container gold-glow" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#d4af37', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Info size={16} />
                {t.etiquetteTitle}
              </h3>
              <p style={{ fontSize: '13px', color: '#cbd5e1', lineHeight: 1.6 }}>
                {t.etiquetteDesc}
              </p>
              <div style={{ display: 'flex', gap: '8px', fontSize: '12px', color: '#94a3b8', backgroundColor: 'rgba(255,255,255,0.02)', padding: '10px', borderRadius: '8px', border: '1px dashed rgba(255,255,255,0.06)' }}>
                <AlertTriangle size={14} style={{ color: '#ef4444', flexShrink: 0 }} />
                <span>
                  {language === 'UZ'
                    ? 'Muqaddas maqbaralar va masjidlarga kirishda poyabzalingizni yeching.'
                    : language === 'RU' 
                    ? 'Снимайте обувь при входе в священные склепы и мечети.' 
                    : 'Remove shoes when entering sacred crypts or active prayer halls.'}
                </span>
              </div>
            </div>

            {/* 💵 Currency Converter */}
            <div className="glass-container gold-glow" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#d4af37', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <TrendingUp size={16} />
                {t.currencyTitle}
              </h3>
              <span style={{ fontSize: '11px', color: '#94a3b8' }}>
                {t.currencySub}
              </span>

              {/* Conversion Inputs */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: 'rgba(10,15,29,0.5)', padding: '6px 12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <DollarSign size={14} style={{ color: '#94a3b8' }} />
                  <input 
                    type="number" 
                    value={usdAmount}
                    onChange={(e) => handleUsdChange(e.target.value)}
                    placeholder="USD"
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#fff',
                      fontSize: '14px',
                      width: '100%',
                      outline: 'none'
                    }}
                  />
                  <span style={{ fontSize: '12px', color: '#94a3b8', fontWeight: '700' }}>USD</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: 'rgba(10,15,29,0.5)', padding: '6px 12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <span style={{ fontSize: '14px', color: '#94a3b8', paddingLeft: '4px' }}>сум</span>
                  <input 
                    type="number" 
                    value={uzsAmount}
                    onChange={(e) => handleUzsChange(e.target.value)}
                    placeholder="UZS"
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#fff',
                      fontSize: '14px',
                      width: '100%',
                      outline: 'none'
                    }}
                  />
                  <span style={{ fontSize: '12px', color: '#94a3b8', fontWeight: '700' }}>UZS</span>
                </div>
              </div>
            </div>

            {/* 📞 Contacts Card */}
            <div className="glass-container gold-glow" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#d4af37', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <PhoneCall size={16} />
                {t.contactsTitle}
              </h3>
              <p style={{ fontSize: '13px', color: '#cbd5e1', lineHeight: 1.6, whiteSpace: 'pre-line' }}>
                {t.contactsDesc}
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: 'rgba(0,155,158,0.06)', border: '1px solid rgba(0,155,158,0.2)', padding: '10px', borderRadius: '8px', color: '#009b9e', fontSize: '12px', fontWeight: '600' }}>
                <Compass size={14} />
                <span>
                  {language === 'UZ'
                    ? 'Sayyohlarni qo\'llab-quvvatlash xizmati 24/7 ishlaydi'
                    : language === 'RU' 
                    ? 'Служба поддержки туриста работает 24/7' 
                    : 'Tourist Helpline is active 24/7'}
                </span>
              </div>
            </div>

          </div>
        </section>

      </div>
    </main>
  );
}
