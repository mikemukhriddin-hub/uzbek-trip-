'use client';

import React, { useState, useEffect } from 'react';
import { 
  Lock, 
  Unlock, 
  Calendar, 
  DollarSign, 
  CheckCircle, 
  XCircle, 
  RefreshCw, 
  LogOut, 
  MapPin, 
  Compass, 
  User, 
  Phone, 
  Mail, 
  Clock,
  ExternalLink,
  Loader2,
  Plus,
  Trash2,
  Edit3,
  Car,
  Languages,
  Download
} from 'lucide-react';

const VEHICLE_IMAGES = {
  1: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=400&q=80',
  2: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=400&q=80',
  3: 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&w=400&q=80',
  4: 'https://images.unsplash.com/photo-1508974239320-0a029497e820?auto=format&fit=crop&w=400&q=80',
  5: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=400&q=80'
};

const DEFAULT_VEHICLE_IMAGES = {
  sedan: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=600&q=80',
  gentra: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=600&q=80',
  cobalt: 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&w=600&q=80',
  minivan: 'https://images.unsplash.com/photo-1508974239320-0a029497e820?auto=format&fit=crop&w=600&q=80',
  bus: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=600&q=80'
};

function getFallbackVehicleImage(carModel = '') {
  const model = (carModel || '').toLowerCase();
  if (model.includes('bus') || model.includes('sprinter') || model.includes('microbus') || model.includes('yutong') || model.includes('van')) {
    return DEFAULT_VEHICLE_IMAGES.bus;
  }
  if (model.includes('minivan') || model.includes('carnival') || model.includes('h1') || model.includes('hyundai') || model.includes('staria')) {
    return DEFAULT_VEHICLE_IMAGES.minivan;
  }
  if (model.includes('gentra') || model.includes('lacetti')) {
    return DEFAULT_VEHICLE_IMAGES.gentra;
  }
  if (model.includes('cobalt')) {
    return DEFAULT_VEHICLE_IMAGES.cobalt;
  }
  return DEFAULT_VEHICLE_IMAGES.sedan;
}

const GUIDE_IMAGES = {
  1: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=256&q=80', // Sherzod Alimov
  2: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=256&q=80', // Elena Petrova
  3: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=256&q=80'  // Jahongir Rustamov
};

const DEFAULT_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=256&q=80',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=256&q=80',
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=256&q=80'
];

const getStatusColor = (status) => {
  switch (status) {
    case 'confirmed':
      return { text: '#10b981', bg: 'rgba(16, 185, 129, 0.1)', border: 'rgba(16, 185, 129, 0.2)' };
    case 'completed':
      return { text: '#3b82f6', bg: 'rgba(59, 130, 246, 0.1)', border: 'rgba(59, 130, 246, 0.2)' };
    case 'cancelled':
      return { text: '#ef4444', bg: 'rgba(239, 68, 68, 0.1)', border: 'rgba(239, 68, 68, 0.2)' };
    case 'pending':
    default:
      return { text: '#f59e0b', bg: 'rgba(245, 158, 11, 0.1)', border: 'rgba(245, 158, 11, 0.2)' };
  }
};

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  
  // Language state
  const [language, setLanguage] = useState('EN');
  const [showLangDropdown, setShowLangDropdown] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('site_lang');
    if (saved) {
      Promise.resolve().then(() => {
        setLanguage(saved);
      });
    }
  }, []);

  const t = {
    EN: {
      adminTitle: "SAMARQAND CRAFTOUR",
      adminSubtitle: "Admin Panel Access Control",
      enterPassword: "Enter Admin Password",
      unlockButton: "Unlock Admin Panel",
      logoutButton: "Log Out",
      refreshButton: "Refresh",
      adminRole: "ADMIN PANEL",
      guideRole: "GUIDE PORTAL",
      loadingData: "Loading dashboard data...",
      incorrectPassword: "Incorrect password. Please try again.",
      serverError: "Server error: ",
      loadingBookings: "Loading bookings...",
      noBookings: "No bookings found.",
      
      bookings: "Bookings",
      locations: "Locations",
      vehicles: "Vehicles/Drivers",
      guides: "Guides",
      guide: "Guide",
      myProfile: "My Profile",

      all: "All",
      pending: "Pending",
      confirmed: "Confirmed",
      completed: "Completed",
      cancelled: "Cancelled",
      clearHistory: "Clear All History",
      region: "Region",
      samarqand: "Samarkand",
      buxoro: "Bukhara",
      xorazm: "Khorezm",
      shahrisabz: "Shahrisabz",
      toshkent: "Tashkent",
      qoraqalpoq: "Karakalpakstan",
      allRegions: "All Regions",

      bookingId: "Booking ID",
      touristDetails: "Tourist Details",
      tourDate: "Tour Date",
      routeSights: "Route Sights",
      guideDriver: "Guide & Driver",
      totalPrice: "Total Price",
      status: "Status",
      actions: "Actions",
      archived: "Archived",
      confirmDelete: "Are you sure you want to permanently delete this booking? This will remove all associated route details and cannot be undone.",
      confirmClear: "WARNING: Are you sure you want to permanently delete ALL bookings and clear your history? This will delete all booking files, customer records, and cannot be undone.",

      addLocation: "Add New Sight/Dining Spot",
      nameEn: "Name (English)*",
      nameRu: "Name (Russian)*",
      nameUz: "Name (Uzbek)*",
      lat: "Latitude (e.g. 39.6548)",
      lng: "Longitude (e.g. 66.9757)",
      historical: "Historical Sight",
      alternative: "Alternative Spot",
      food: "Dining / Food Place",
      outOfCity: "Is Out of City (Triggers Mountain Rate)",
      imageUrl: "Image URL (e.g. /images/locations/new.png)",
      descEn: "Description (English)",
      descRu: "Description (Russian)",
      descUz: "Description (Uzbek)",
      saveLocation: "Save Location",
      existingLocations: "Existing Locations",
      photo: "Photo",
      category: "Category",
      nameEnRuUz: "Name (EN / RU / UZ)",
      coordinates: "Coordinates",
      outOfCityCol: "Out of City",
      yes: "Yes",
      no: "No",
      confirmDeleteLoc: "Are you sure you want to delete this location?",
      durationCol: "Duration (min)",
      estDurationPlaceholder: "Estimated Duration (minutes)*",

      addVehicle: "Add New Driver / Transport",
      driverName: "Driver Name*",
      driverPhone: "Driver Phone*",
      carModel: "Car Model*",
      carNumber: "Car Number*",
      cityRate: "City Rate ($)*",
      outOfCityRate: "Out of City Rate ($)*",
      saveDriver: "Save Driver/Vehicle",
      driversRates: "Drivers & Rates",
      driver: "Driver",
      phone: "Phone",
      carDetails: "Car Details",
      cityRateCol: "City Rate",
      outOfCityRateCol: "Out of City Rate",
      confirmDeleteVeh: "Are you sure you want to delete this vehicle?",

      addGuide: "Add New Expert Guide",
      fullName: "Full Name*",
      phoneNumber: "Phone Number*",
      enRate: "English Daily Rate ($)",
      ruRate: "Russian Daily Rate ($)",
      uzRate: "Uzbek Daily Rate ($)",
      esRate: "Spanish Daily Rate ($)",
      frRate: "French Daily Rate ($)",
      saveGuide: "Save Guide",
      expertGuides: "Expert Guides",
      myProfileRates: "My Profile & Daily Rates",
      name: "Name",
      rateSuffix: "Rate",
      confirmDeleteGuide: "Are you sure you want to delete this guide?",
      telegramChatIdCol: "Telegram Chat ID",
      botStatusCol: "Bot Status",
      active: "Active",
      inactive: "Inactive",
      guideResponse: "Guide Response",
      driverResponse: "Driver Response",
      rejected: "Rejected",

      save: "Save",
      cancel: "Cancel",

      aiAssistantTitle: "AI Auto-fill Assistant",
      aiQueryPlaceholder: "Enter place name (e.g. Registan Square)...",
      aiFillButton: "Fill with AI",
      aiGenerating: "Generating...",
      aiSuccess: "Form filled successfully!",
      aiError: "Failed to generate details. Please check your credentials."
    },
    RU: {
      adminTitle: "SAMARQAND CRAFTOUR",
      adminSubtitle: "Контроль доступа к панели администратора",
      enterPassword: "Введите пароль администратора",
      unlockButton: "Разблокировать панель",
      logoutButton: "Выйти",
      refreshButton: "Обновить",
      adminRole: "ПАНЕЛЬ АДМИНИСТРАТОРА",
      guideRole: "ПОРТАЛ ГИДА",
      loadingData: "Загрузка данных...",
      incorrectPassword: "Неверный пароль. Пожалуйста, попробуйте снова.",
      serverError: "Ошибка сервера: ",
      loadingBookings: "Загрузка бронирований...",
      noBookings: "Бронирования не найдены.",

      bookings: "Бронирования",
      locations: "Локации",
      vehicles: "Транспорт/Водители",
      guides: "Гиды",
      guide: "Гид",
      myProfile: "Мой профиль",

      all: "Все",
      pending: "В ожидании",
      confirmed: "Подтверждено",
      completed: "Завершено",
      cancelled: "Отменено",
      clearHistory: "Очистить всю историю",
      region: "Регион",
      samarqand: "Самарканд",
      buxoro: "Бухара",
      xorazm: "Хорезм",
      shahrisabz: "Шахрисабз",
      toshkent: "Ташкент",
      qoraqalpoq: "Каракалпакстан",
      allRegions: "Все регионы",

      bookingId: "ID Бронирования",
      touristDetails: "Данные туриста",
      tourDate: "Дата тура",
      routeSights: "Достопримечательности",
      guideDriver: "Гид и Водитель",
      totalPrice: "Итоговая цена",
      status: "Статус",
      actions: "Действия",
      archived: "Архивировано",
      confirmDelete: "Вы уверены, что хотите навсегда удалить это бронирование? Это удалит все связанные детали маршрута и действие нельзя будет отменить.",
      confirmClear: "ВНИМАНИЕ: Вы уверены, что хотите навсегда удалить ВСЕ бронирования и очистить историю? Это удалит все файлы бронирования, записи клиентов и действие нельзя будет отменить.",

      addLocation: "Добавить новое место/ресторан",
      nameEn: "Название (Английский)*",
      nameRu: "Название (Русский)*",
      nameUz: "Название (Узбекский)*",
      lat: "Широта (например, 39.6548)",
      lng: "Долгота (например, 66.9757)",
      historical: "Историческое место",
      alternative: "Альтернативное место",
      food: "Где поесть / Ресторан",
      outOfCity: "За городом (тариф в горы)",
      imageUrl: "Ссылка на фото (например, /images/locations/new.png)",
      descEn: "Описание (Английский)",
      descRu: "Описание (Русский)",
      descUz: "Описание (Узбекский)",
      saveLocation: "Сохранить локацию",
      existingLocations: "Существующие локации",
      photo: "Фото",
      category: "Категория",
      nameEnRuUz: "Название (EN / RU / UZ)",
      coordinates: "Координаты",
      outOfCityCol: "За городом",
      yes: "Да",
      no: "Нет",
      confirmDeleteLoc: "Вы уверены, что хотите удалить эту локацию?",
      durationCol: "Время (мин)",
      estDurationPlaceholder: "Расчетное время (минуты)*",

      addVehicle: "Добавить нового водителя / транспорт",
      driverName: "Имя водителя*",
      driverPhone: "Телефон водителя*",
      carModel: "Модель машины*",
      carNumber: "Номер машины*",
      cityRate: "Тариф по городу ($)*",
      outOfCityRate: "Тариф за городом ($)*",
      saveDriver: "Сохранить водителя",
      driversRates: "Водители и Тарифы",
      driver: "Водитель",
      phone: "Телефон",
      carDetails: "Данные машины",
      cityRateCol: "Тариф по городу",
      outOfCityRateCol: "Тариф за городом",
      confirmDeleteVeh: "Вы уверены, что хотите удалить этого водителя?",

      addGuide: "Добавить нового гида",
      fullName: "ФИО*",
      phoneNumber: "Номер телефона*",
      enRate: "Дневной тариф (Английский) ($)",
      ruRate: "Дневной тариф (Русский) ($)",
      uzRate: "Дневной тариф (Узбекский) ($)",
      esRate: "Дневной тариф (Испанский) ($)",
      frRate: "Дневной тариф (Французский) ($)",
      saveGuide: "Сохранить гида",
      expertGuides: "Экспертные гиды",
      myProfileRates: "Мой профиль и дневные тарифы",
      name: "Имя",
      rateSuffix: "Тариф",
      confirmDeleteGuide: "Вы уверены, что хотите удалить этого гида?",
      telegramChatIdCol: "Telegram Chat ID",
      botStatusCol: "Статус бота",
      active: "Активен",
      inactive: "Неактивен",
      guideResponse: "Ответ гида",
      driverResponse: "Ответ водителя",
      rejected: "Отклонено",

      save: "Сохранить",
      cancel: "Отмена",

      aiAssistantTitle: "AI-помощник заполнения",
      aiQueryPlaceholder: "Введите название места (напр. Площадь Регистан)...",
      aiFillButton: "Заполнить с AI",
      aiGenerating: "Генерация...",
      aiSuccess: "Форма успешно заполнена!",
      aiError: "Не удалось сгенерировать данные. Проверьте настройки."
    },
    UZ: {
      adminTitle: "SAMARQAND CRAFTOUR",
      adminSubtitle: "Admin paneliga kirishni nazorat qilish",
      enterPassword: "Admin parolini kiriting",
      unlockButton: "Admin panelini ochish",
      logoutButton: "Chiqish",
      refreshButton: "Yangilash",
      adminRole: "ADMIN PANEL",
      guideRole: "GID PORTALI",
      loadingData: "Ma'lumotlar yuklanmoqda...",
      incorrectPassword: "Noto'g'ri parol. Qaytadan urinib ko'ring.",
      serverError: "Server xatoligi: ",
      loadingBookings: "Buyurtmalar yuklanmoqda...",
      noBookings: "Buyurtmalar topilmadi.",

      bookings: "Buyurtmalar",
      locations: "Joylar",
      vehicles: "Transport/Haydovchilar",
      guides: "Gidlar",
      guide: "Gid",
      myProfile: "Mening profilim",

      all: "Hammasi",
      pending: "Kutilmoqda",
      confirmed: "Tasdiqlandi",
      completed: "Tugatildi",
      cancelled: "Bekor qilindi",
      clearHistory: "Tarixni tozalash",
      region: "Viloyat / Hudud",
      samarqand: "Samarqand",
      buxoro: "Buxoro",
      xorazm: "Xorazm",
      shahrisabz: "Shahrisabz",
      toshkent: "Toshkent",
      qoraqalpoq: "Qoraqalpog'iston",
      allRegions: "Barcha hududlar",

      bookingId: "Buyurtma IDsi",
      touristDetails: "Turist ma'lumotlari",
      tourDate: "Sayohat sanasi",
      routeSights: "Marshrut joylari",
      guideDriver: "Gid va Haydovchi",
      totalPrice: "Jami narx",
      status: "Holat",
      actions: "Amallar",
      archived: "Arxivlandi",
      confirmDelete: "Ushbu buyurtmani butunlay o'chirib tashlamoqchimisiz? Bu bog'liq bo'lgan barcha marshrut tafsilotlarini o'chirib tashlaydi va buni ortga qaytarib bo'lmaydi.",
      confirmClear: "DIQQAT: BARCHA buyurtmalarni butunlay o'chirib tashlashni va tarixingizni tozalashni xohlaysizmi? Bu barcha buyurtma fayllarini va mijozlar yozuvlarini o'chirib tashlaydi hamda buni ortga qaytarib bo'lmaydi.",

      addLocation: "Yangi diqqatga sazovor joy/restoran qo'shish",
      nameEn: "Nomi (Inglizcha)*",
      nameRu: "Nomi (Ruscha)*",
      nameUz: "Nomi (O'zbekcha)*",
      lat: "Kenglik (masalan, 39.6548)",
      lng: "Uzunlik (masalan, 66.9757)",
      historical: "Tarixiy joy",
      alternative: "Muqobil joy",
      food: "Ovqatlanish joyi",
      outOfCity: "Shahardan tashqarida (Tog' tarifi qo'llaniladi)",
      imageUrl: "Rasm havolasi (masalan, /images/locations/new.png)",
      descEn: "Tavsif (Inglizcha)",
      descRu: "Tavsif (Ruscha)",
      descUz: "Tavsif (O'zbekcha)",
      saveLocation: "Joyni saqlash",
      existingLocations: "Mavjud joylar",
      photo: "Rasm",
      category: "Kategoriya",
      nameEnRuUz: "Nomi (EN / RU / UZ)",
      coordinates: "Koordinatalar",
      outOfCityCol: "Shahardan tashqari",
      yes: "Ha",
      no: "Yo'q",
      confirmDeleteLoc: "Ushbu joyni o'chirmoqchimisiz?",
      durationCol: "Vaqt (daq)",
      estDurationPlaceholder: "Taxminiy vaqt (daqiqalarda)*",

      addVehicle: "Yangi haydovchi / transport qo'shish",
      driverName: "Haydovchi ismi*",
      driverPhone: "Haydovchi telefoni*",
      carModel: "Mashina modeli*",
      carNumber: "Mashina raqami*",
      cityRate: "Shahar tarifi ($)*",
      outOfCityRate: "Shahardan tashqari tarifi ($)*",
      saveDriver: "Haydovchi/Transportni saqlash",
      driversRates: "Haydovchilar va Tariflar",
      driver: "Haydovchi",
      phone: "Telefon",
      carDetails: "Mashina tafsilotlari",
      cityRateCol: "Shahar tarifi",
      outOfCityRateCol: "Shahardan tashqari tarifi",
      confirmDeleteVeh: "Ushbu haydovchini o'chirmoqchimisiz?",

      addGuide: "Yangi ekspert gid qo'shish",
      fullName: "To'liq ismi*",
      phoneNumber: "Telefon raqami*",
      enRate: "Ingliz tili tarifi ($)",
      ruRate: "Rus tili tarifi ($)",
      uzRate: "O'zbek tili tarifi ($)",
      esRate: "Ispan tili tarifi ($)",
      frRate: "Fransuz tili tarifi ($)",
      saveGuide: "Gidni saqlash",
      expertGuides: "Ekspert gidlar",
      myProfileRates: "Mening profilim va kunlik tariflar",
      name: "Ism",
      rateSuffix: "Tarif",
      confirmDeleteGuide: "Ushbu gidni o'chirmoqchimisiz?",
      telegramChatIdCol: "Telegram Chat ID",
      botStatusCol: "Bot holati",
      active: "Faol",
      inactive: "Nofaol",
      guideResponse: "Gid javobi",
      driverResponse: "Haydovchi javobi",
      rejected: "Rad etildi",

      save: "Saqlash",
      cancel: "Bekor qilish",

      aiAssistantTitle: "AI To'ldirish Yordamchisi",
      aiQueryPlaceholder: "Joy nomini kiriting (masalan: Registon maydoni)...",
      aiFillButton: "AI orqali to'ldirish",
      aiGenerating: "Yaratilmoqda...",
      aiSuccess: "Forma muvaffaqiyatli to'ldirildi!",
      aiError: "Ma'lumotlarni yaratib bo'lmadi. Sozlamalarni tekshiring."
    }
  };

  // Role & Details state
  const [userRole, setUserRole] = useState('admin'); // 'admin' or 'guide'
  const [guideId, setGuideId] = useState(null);
  const [guideName, setGuideName] = useState('');

  // Tab control: 'bookings', 'locations', 'vehicles', 'guides'
  const [activeTab, setActiveTab] = useState('bookings');

  // Bookings state
  const [bookings, setBookings] = useState([]);
  const [bookingFilter, setBookingFilter] = useState('all');
  const [regionFilter, setRegionFilter] = useState('all');

  // Locations state
  const [locations, setLocations] = useState([]);
  const [locationForm, setLocationForm] = useState({
    name_en: '', name_ru: '', name_uz: '', description_en: '', description_ru: '', description_uz: '',
    latitude: '', longitude: '', category: 'historical', is_out_of_city: false,
    image_url: '', estimated_duration: 90, region: 'samarqand'
  });
  const [aiQuery, setAiQuery] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  // Vehicles state
  const [vehicles, setVehicles] = useState([]);
  const [vehicleForm, setVehicleForm] = useState({
    driver_name: '', driver_phone: '', car_model: '', car_number: '',
    city_rate: '', out_of_city_rate: '', telegram_chat_id: '', bot_active: false, image_url: '', region: 'samarqand'
  });

  // Guides state
  const [guides, setGuides] = useState([]);
  const [tariffs, setTariffs] = useState([]);
  const [guideForm, setGuideForm] = useState({
    full_name: '',
    phone_number: '',
    en_rate: '',
    ru_rate: '',
    uz_rate: '',
    es_rate: '',
    fr_rate: '',
    telegram_chat_id: '',
    bot_active: false,
    image_url: '',
    region: 'samarqand'
  });

  // Editing state
  const [editingResource, setEditingResource] = useState(null); // { type: 'location'|'vehicle'|'guide', id, data }

  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(null); // stores ID being modified
  const [errorMsg, setErrorMsg] = useState('');

  const currT = t[language] || t.EN;

  const fetchAllData = (token = localStorage.getItem('admin_token')) => {
    if (!token) return;
    setLoading(true);
    setErrorMsg('');

    // Fetch bookings
    const p1 = fetch('/api/admin/bookings', { headers: { 'Authorization': token } }).then(r => r.json());
    // Fetch locations
    const p2 = fetch('/api/locations').then(r => r.json());
    // Fetch vehicles
    const p3 = fetch('/api/vehicles').then(r => r.json());
    // Fetch guides
    const p4 = fetch('/api/guides', { headers: { 'Authorization': token } }).then(r => r.json());

    Promise.all([p1, p2, p3, p4])
      .then(([bookingsData, locationsData, vehiclesData, guidesData]) => {
        if (Array.isArray(bookingsData)) setBookings(bookingsData);
        if (Array.isArray(locationsData)) setLocations(locationsData);
        if (Array.isArray(vehiclesData)) setVehicles(vehiclesData);
        if (guidesData && Array.isArray(guidesData.guides)) {
          setGuides(guidesData.guides);
          setTariffs(guidesData.tariffs || []);

          const foundGuide = guidesData.guides.find(g => g.access_token === token || g.phone_number === token);
          if (foundGuide) {
            setUserRole('guide');
            setGuideId(foundGuide.id);
            setGuideName(foundGuide.full_name);
            setActiveTab('bookings');
          } else {
            setUserRole('admin');
            setGuideId(null);
            setGuideName('');
          }
        }
      })
      .catch((err) => {
        setErrorMsg(currT.loadingData + ' ' + err.message);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  // Check auth status on mount
  useEffect(() => {
    const savedToken = localStorage.getItem('admin_token');
    if (savedToken) {
      Promise.resolve().then(() => {
        setIsAuthenticated(true);
        fetchAllData(savedToken);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLogin = (e) => {
    e.preventDefault();
    if (!password) return;

    setLoginError('');
    setLoading(true);
    fetch('/api/admin/bookings', {
      headers: { 'Authorization': password }
    })
      .then(async (res) => {
        if (res.ok) {
          localStorage.setItem('admin_token', password);
          setIsAuthenticated(true);
          fetchAllData(password);
        } else {
          setLoginError(currT.incorrectPassword);
        }
      })
      .catch((err) => {
        setLoginError(currT.serverError + err.message);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    setIsAuthenticated(false);
    setUserRole('admin');
    setGuideId(null);
    setGuideName('');
    setBookings([]);
    setLocations([]);
    setVehicles([]);
    setGuides([]);
    setTariffs([]);
    setPassword('');
  };


  // --- CRUD Actions ---

  const updateBookingStatus = (bookingId, newStatus) => {
    const token = localStorage.getItem('admin_token');
    setActionLoading(bookingId);
    fetch('/api/admin/bookings', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token
      },
      body: JSON.stringify({ bookingId, status: newStatus })
    })
      .then(async (res) => {
        if (res.ok) {
          setBookings((prev) => prev.map((b) => b.id === bookingId ? { ...b, status: newStatus } : b));
        } else {
          const d = await res.json();
          alert('Failed: ' + d.message);
        }
      })
      .catch(err => alert(err.message))
      .finally(() => setActionLoading(null));
  };

  const deleteBooking = (bookingId) => {
    const confirmMsg = currT.confirmDelete;
    if (!window.confirm(confirmMsg)) return;

    setActionLoading(bookingId);
    const token = localStorage.getItem('admin_token');
    fetch(`/api/admin/bookings?bookingId=${bookingId}`, {
      method: 'DELETE',
      headers: { 'Authorization': token }
    })
      .then(async (res) => {
        const data = await res.json();
        if (res.ok) {
          setBookings((prev) => prev.filter((b) => b.id !== bookingId));
        } else {
          alert(data.message || 'Failed to delete booking.');
        }
      })
      .catch((err) => {
        alert('Server error: ' + err.message);
      })
      .finally(() => {
        setActionLoading(null);
      });
  };

  const clearAllBookings = () => {
    const confirmMsg = currT.confirmClear;
    if (!window.confirm(confirmMsg)) return;

    setLoading(true);
    const token = localStorage.getItem('admin_token');
    fetch('/api/admin/bookings?clearAll=true', {
      method: 'DELETE',
      headers: { 'Authorization': token }
    })
      .then(async (res) => {
        const data = await res.json();
        if (res.ok) {
          setBookings([]);
        } else {
          alert(data.message || 'Failed to clear booking history.');
        }
      })
      .catch((err) => {
        alert('Server error: ' + err.message);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const exportBookingsToCSV = () => {
    if (bookings.length === 0) return;

    // CSV Headers
    const headers = [
      'Booking ID',
      'Tourist Name',
      'Tourist Email',
      'Tourist Phone',
      'Booking Date',
      'Total Price ($)',
      'Language',
      'Status',
      'Passenger Count',
      'Tour Type',
      'Guide',
      'Driver/Vehicle',
      'Route Sights'
    ];

    // Map bookings to CSV rows
    const rows = bookings.map(b => {
      const guideName = b.guide?.full_name || 'None';
      const vehicleName = b.vehicle ? `${b.vehicle.driver_name} (${b.vehicle.car_model})` : 'None';
      const sights = (b.booking_items || [])
        .sort((a, b) => a.visit_order - b.visit_order)
        .map(item => item.location?.name_en || '')
        .filter(Boolean)
        .join(' -> ');

      return [
        b.id,
        `"${(b.tourist_name || '').replace(/"/g, '""')}"`,
        `"${(b.tourist_email || '').replace(/"/g, '""')}"`,
        `"${b.tourist_phone || ''}"`,
        b.booking_date,
        b.total_price,
        b.customer_language,
        b.status,
        b.passenger_count || 1,
        b.booking_type || 'private',
        `"${guideName.replace(/"/g, '""')}"`,
        `"${vehicleName.replace(/"/g, '""')}"`,
        `"${sights.replace(/"/g, '""')}"`
      ];
    });

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    // Create a download link with UTF-8 BOM prefix so Excel opens it with correct encoding
    const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `samarkand_craftour_bookings_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Manage Locations CRUD
  const handleAddLocation = (e) => {
    e.preventDefault();
    const token = localStorage.getItem('admin_token');
    setLoading(true);

    fetch('/api/admin/locations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token
      },
      body: JSON.stringify(locationForm)
    })
      .then(async (res) => {
        const data = await res.json();
        if (res.ok) {
          setLocations(prev => [...prev, data.data || data.mockData]);
          setLocationForm({
            name_en: '', name_ru: '', name_uz: '', description_en: '', description_ru: '', description_uz: '',
            latitude: '', longitude: '', category: 'historical', is_out_of_city: false,
            image_url: '', estimated_duration: 90, region: 'samarqand'
          });
          setAiQuery('');
          alert('Location added successfully!');
        } else {
          alert('Error: ' + data.message);
        }
      })
      .catch(err => alert(err.message))
      .finally(() => setLoading(false));
  };

  const handleAiFill = (e) => {
    if (e) e.preventDefault();
    if (!aiQuery || aiQuery.trim() === '') {
      alert(currT.aiQueryPlaceholder || 'Enter place name');
      return;
    }

    const token = localStorage.getItem('admin_token');
    setAiLoading(true);

    fetch('/api/admin/generate-location', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token
      },
      body: JSON.stringify({ query: aiQuery })
    })
      .then(async (res) => {
        const data = await res.json();
        if (res.ok) {
          const loc = data.data;
          setLocationForm({
            name_en: loc.name_en || '',
            name_ru: loc.name_ru || '',
            name_uz: loc.name_uz || '',
            description_en: loc.description_en || '',
            description_ru: loc.description_ru || '',
            description_uz: loc.description_uz || '',
            latitude: loc.latitude !== undefined ? loc.latitude.toString() : '',
            longitude: loc.longitude !== undefined ? loc.longitude.toString() : '',
            category: loc.category || 'historical',
            is_out_of_city: !!loc.is_out_of_city,
            image_url: loc.image_url || '',
            estimated_duration: loc.estimated_duration !== undefined ? loc.estimated_duration.toString() : '90',
            region: locationForm.region || 'samarqand'
          });
          if (data.isMock) {
            alert(data.message || 'Filled with mock data. Configure GEMINI_API_KEY in .env.local for real AI details.');
          } else {
            alert(currT.aiSuccess || 'Form filled successfully!');
          }
        } else {
          alert('Error: ' + data.message);
        }
      })
      .catch(err => alert(err.message))
      .finally(() => setAiLoading(false));
  };

  const handleUpdateLocation = (locationId) => {
    const token = localStorage.getItem('admin_token');
    const updateData = editingResource.data;
    setActionLoading(locationId);

    fetch('/api/admin/locations', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token
      },
      body: JSON.stringify({ id: locationId, ...updateData })
    })
      .then(async (res) => {
        if (res.ok) {
          setLocations(prev => prev.map(loc => loc.id === locationId ? { ...loc, ...updateData } : loc));
          setEditingResource(null);
          alert('Location updated successfully!');
        } else {
          const d = await res.json();
          alert('Error: ' + d.message);
        }
      })
      .catch(err => alert(err.message))
      .finally(() => setActionLoading(null));
  };

  const handleDeleteLocation = (locationId) => {
    if (!confirm(currT.confirmDeleteLoc)) return;
    const token = localStorage.getItem('admin_token');
    setActionLoading(locationId);

    fetch(`/api/admin/locations?id=${locationId}`, {
      method: 'DELETE',
      headers: { 'Authorization': token }
    })
      .then(async (res) => {
        if (res.ok) {
          setLocations(prev => prev.filter(loc => loc.id !== locationId));
        } else {
          const d = await res.json();
          alert('Error: ' + d.message);
        }
      })
      .catch(err => alert(err.message))
      .finally(() => setActionLoading(null));
  };

  // Manage Vehicles CRUD
  const handleAddVehicle = (e) => {
    e.preventDefault();
    const token = localStorage.getItem('admin_token');
    setLoading(true);

    fetch('/api/admin/vehicles', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token
      },
      body: JSON.stringify(vehicleForm)
    })
      .then(async (res) => {
        const data = await res.json();
        if (res.ok) {
          setVehicles(prev => [...prev, data.data || data.mockData]);
          setVehicleForm({
            driver_name: '', driver_phone: '', car_model: '', car_number: '',
            city_rate: '', out_of_city_rate: '', telegram_chat_id: '', bot_active: false, image_url: '', region: 'samarqand'
          });
          alert('Vehicle added successfully!');
        } else {
          alert('Error: ' + data.message);
        }
      })
      .catch(err => alert(err.message))
      .finally(() => setLoading(false));
  };

  const handleUpdateVehicle = (vehicleId) => {
    const token = localStorage.getItem('admin_token');
    const updateData = editingResource.data;
    setActionLoading(vehicleId);

    fetch('/api/admin/vehicles', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token
      },
      body: JSON.stringify({ id: vehicleId, ...updateData })
    })
      .then(async (res) => {
        if (res.ok) {
          setVehicles(prev => prev.map(v => v.id === vehicleId ? { ...v, ...updateData } : v));
          setEditingResource(null);
          alert('Vehicle updated successfully!');
        } else {
          const d = await res.json();
          alert('Error: ' + d.message);
        }
      })
      .catch(err => alert(err.message))
      .finally(() => setActionLoading(null));
  };

  const handleDeleteVehicle = (vehicleId) => {
    if (!confirm(currT.confirmDeleteVeh)) return;
    const token = localStorage.getItem('admin_token');
    setActionLoading(vehicleId);

    fetch(`/api/admin/vehicles?id=${vehicleId}`, {
      method: 'DELETE',
      headers: { 'Authorization': token }
    })
      .then(async (res) => {
        if (res.ok) {
          setVehicles(prev => prev.filter(v => v.id !== vehicleId));
        } else {
          const d = await res.json();
          alert('Error: ' + d.message);
        }
      })
      .catch(err => alert(err.message))
      .finally(() => setActionLoading(null));
  };

  // Manage Guides CRUD
  const handleAddGuide = (e) => {
    e.preventDefault();
    const token = localStorage.getItem('admin_token');
    setLoading(true);

    const guideTariffs = [];
    if (guideForm.en_rate) guideTariffs.push({ language_code: 'EN', daily_rate: guideForm.en_rate });
    if (guideForm.ru_rate) guideTariffs.push({ language_code: 'RU', daily_rate: guideForm.ru_rate });
    if (guideForm.uz_rate) guideTariffs.push({ language_code: 'UZ', daily_rate: guideForm.uz_rate });
    if (guideForm.es_rate) guideTariffs.push({ language_code: 'ES', daily_rate: guideForm.es_rate });
    if (guideForm.fr_rate) guideTariffs.push({ language_code: 'FR', daily_rate: guideForm.fr_rate });

    fetch('/api/admin/guides', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token
      },
      body: JSON.stringify({
        full_name: guideForm.full_name,
        phone_number: guideForm.phone_number,
        tariffs: guideTariffs,
        telegram_chat_id: guideForm.telegram_chat_id,
        bot_active: guideForm.bot_active,
        image_url: guideForm.image_url,
        region: guideForm.region || 'samarqand'
      })
    })
      .then(async (res) => {
        const data = await res.json();
        if (res.ok) {
          const savedGuide = data.data;
          setGuides(prev => [...prev, savedGuide]);
          // Add newly created tariffs to local tariffs state
          if (guideTariffs.length > 0) {
            const tempTariffs = guideTariffs.map((t, idx) => ({
              id: Math.floor(Math.random() * 10000),
              guide_id: savedGuide.id,
              language_code: t.language_code,
              daily_rate: parseFloat(t.daily_rate)
            }));
            setTariffs(prev => [...prev, ...tempTariffs]);
          }
          setGuideForm({ full_name: '', phone_number: '', en_rate: '', ru_rate: '', uz_rate: '', es_rate: '', fr_rate: '', telegram_chat_id: '', bot_active: false, image_url: '', region: 'samarqand' });
          alert('Guide added successfully!');
        } else {
          alert('Error: ' + data.message);
        }
      })
      .catch(err => alert(err.message))
      .finally(() => setLoading(false));
  };

  const handleUpdateGuide = (guideId) => {
    const token = localStorage.getItem('admin_token');
    const updateData = editingResource.data;
    setActionLoading(guideId);

    const newTariffs = [];
    if (updateData.en_rate) newTariffs.push({ language_code: 'EN', daily_rate: updateData.en_rate });
    if (updateData.ru_rate) newTariffs.push({ language_code: 'RU', daily_rate: updateData.ru_rate });
    if (updateData.uz_rate) newTariffs.push({ language_code: 'UZ', daily_rate: updateData.uz_rate });
    if (updateData.es_rate) newTariffs.push({ language_code: 'ES', daily_rate: updateData.es_rate });
    if (updateData.fr_rate) newTariffs.push({ language_code: 'FR', daily_rate: updateData.fr_rate });

    fetch('/api/admin/guides', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token
      },
      body: JSON.stringify({
        id: guideId,
        full_name: updateData.full_name,
        phone_number: updateData.phone_number,
        tariffs: newTariffs,
        telegram_chat_id: updateData.telegram_chat_id,
        bot_active: updateData.bot_active,
        image_url: updateData.image_url,
        region: updateData.region
      })
    })
      .then(async (res) => {
        if (res.ok) {
          setGuides(prev => prev.map(g => g.id === guideId ? { id: g.id, full_name: updateData.full_name, phone_number: updateData.phone_number, telegram_chat_id: updateData.telegram_chat_id, bot_active: updateData.bot_active, image_url: updateData.image_url, region: updateData.region } : g));
          
          // Re-update local tariffs
          setTariffs(prev => {
            const filtered = prev.filter(t => t.guide_id !== guideId);
            const formatted = newTariffs.map(nt => ({
              id: Math.floor(Math.random() * 10000),
              guide_id: guideId,
              language_code: nt.language_code,
              daily_rate: parseFloat(nt.daily_rate)
            }));
            return [...filtered, ...formatted];
          });

          setEditingResource(null);
          alert('Guide updated successfully!');
        } else {
          const d = await res.json();
          alert('Error: ' + d.message);
        }
      })
      .catch(err => alert(err.message))
      .finally(() => setActionLoading(null));
  };

  const handleDeleteGuide = (guideId) => {
    if (!confirm(currT.confirmDeleteGuide)) return;
    const token = localStorage.getItem('admin_token');
    setActionLoading(guideId);

    fetch(`/api/admin/guides?id=${guideId}`, {
      method: 'DELETE',
      headers: { 'Authorization': token }
    })
      .then(async (res) => {
        if (res.ok) {
          setGuides(prev => prev.filter(g => g.id !== guideId));
          setTariffs(prev => prev.filter(t => t.guide_id !== guideId));
        } else {
          const d = await res.json();
          alert('Error: ' + d.message);
        }
      })
      .catch(err => alert(err.message))
      .finally(() => setActionLoading(null));
  };

  // Helper to resolve tariffs for guide row
  const getGuideRateForLang = (guideId, langCode) => {
    const found = tariffs.find(t => t.guide_id === guideId && t.language_code === langCode);
    return found ? found.daily_rate : '';
  };

  const getBookingRegion = (b) => {
    if (b.guide?.region) return b.guide.region;
    if (b.vehicle?.region) return b.vehicle.region;
    if (b.booking_items && b.booking_items.length > 0) {
      const firstLocRegion = b.booking_items[0].location?.region;
      if (firstLocRegion) return firstLocRegion;
    }
    return 'samarqand'; // default fallback
  };

  const filteredBookings = bookings.filter(b => {
    const matchesStatus = bookingFilter === 'all' || b.status === bookingFilter;
    const matchesRegion = regionFilter === 'all' || getBookingRegion(b) === regionFilter;
    return matchesStatus && matchesRegion;
  });

  const filteredLocations = locations.filter(loc => regionFilter === 'all' || (loc.region || 'samarqand') === regionFilter);
  const filteredVehicles = vehicles.filter(v => regionFilter === 'all' || (v.region || 'samarqand') === regionFilter);
  const filteredGuides = guides.filter(g => regionFilter === 'all' || (g.region || 'samarqand') === regionFilter);

  // --- Login Gate ---
  if (!isAuthenticated) {
    return (
      <main className="modern-dark-admin" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', position: 'relative' }}>
        
        {/* Floating Language Switcher */}
        <div style={{ position: 'absolute', top: '24px', right: '24px', zIndex: 100 }}>
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
            <Languages size={14} style={{ color: '#6366f1' }} />
            <span>{language === 'EN' ? '🇬🇧 EN' : language === 'RU' ? '🇷🇺 RU' : '🇺🇿 UZ'}</span>
          </button>
          {showLangDropdown && (
            <div style={{
              position: 'absolute',
              top: 'calc(100% + 8px)',
              right: 0,
              backgroundColor: '#0f172a',
              border: '1px solid rgba(99,102,241,0.25)',
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
                    background: language === langCode ? 'rgba(99,102,241,0.1)' : 'transparent',
                    color: language === langCode ? '#6366f1' : '#94a3b8',
                    textAlign: 'left',
                    fontSize: '13px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    borderRadius: '6px',
                    transition: 'all 0.2s ease',
                    width: '100%'
                  }}
                >
                  {langCode === 'EN' ? '🇬🇧 English' : langCode === 'RU' ? '🇷🇺 Русский' : '🇺🇿 O\'zbekcha'}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="glass-container indigo-glow animate-fade-in" style={{
          width: '100%', maxWidth: '420px', padding: '36px', display: 'flex', flexDirection: 'column', gap: '24px'
        }}>
          <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{
              width: '56px', height: '56px', borderRadius: '12px', backgroundColor: 'rgba(99, 102, 241, 0.15)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6366f1', margin: '0 auto'
            }}>
              <Lock size={26} />
            </div>
            <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#fff', letterSpacing: '0.05em' }}>
              SAMARQAND <span style={{ color: '#6366f1' }}>CRAFTOUR</span>
            </h2>
            <p style={{ fontSize: '13px', color: '#94a3b8' }}>{currT.adminSubtitle}</p>
          </div>

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '12px', fontWeight: '600', color: '#94a3b8' }}>{currT.enterPassword}</label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ width: '100%' }}
                disabled={loading}
              />
            </div>
            {loginError && (
              <div style={{ 
                fontSize: '13px', color: '#ef4444', backgroundColor: 'rgba(239, 68, 68, 0.1)', 
                padding: '8px 12px', borderRadius: '8px', border: '1px solid rgba(239, 68, 68, 0.2)' 
              }}>{loginError}</div>
            )}
            <button type="submit" className="btn-indigo" style={{ padding: '12px', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }} disabled={loading}>
              {loading ? <Loader2 size={16} className="animate-spin" /> : <Unlock size={16} />}
              <span>{currT.unlockButton}</span>
            </button>
          </form>
        </div>
      </main>
    );
  }

  // Analytics computations
  const totalRevenue = bookings
    .filter(b => b.status === 'confirmed' || b.status === 'completed')
    .reduce((sum, b) => sum + Number(b.total_price), 0);

  const stats = {
    all: bookings.length,
    pending: bookings.filter(b => b.status === 'pending').length,
    confirmed: bookings.filter(b => b.status === 'confirmed').length,
    completed: bookings.filter(b => b.status === 'completed').length,
    cancelled: bookings.filter(b => b.status === 'cancelled').length,
  };

  const getChartData = () => {
    const dailyData = {};
    bookings.forEach(b => {
      const date = b.booking_date;
      if (!dailyData[date]) {
        dailyData[date] = { count: 0, revenue: 0 };
      }
      dailyData[date].count += 1;
      if (b.status === 'confirmed' || b.status === 'completed') {
        dailyData[date].revenue += Number(b.total_price);
      }
    });

    return Object.keys(dailyData)
      .sort()
      .slice(-7)
      .map(date => ({
        date: date.substring(5), // MM-DD
        count: dailyData[date].count,
        revenue: dailyData[date].revenue
      }));
  };

  const renderAnalyticsPanel = () => {
    if (bookings.length === 0) return null;

    const data = getChartData();
    const maxRev = Math.max(...data.map(d => d.revenue), 100);

    return (
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '20px',
        marginBottom: '30px'
      }}>
        {/* STATS SUMMARY CARD */}
        <div className="glass-container indigo-glow" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h3 style={{ margin: 0, fontSize: '15px', color: '#6366f1', fontWeight: '800', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '8px', letterSpacing: '0.05em' }}>
            {language === 'UZ' ? '📊 UMUMIY STATISTIKA' : language === 'RU' ? '📊 ОБЩАЯ СТАТИСТИКА' : '📊 GENERAL ANALYTICS'}
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div style={{ padding: '12px', backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
              <span style={{ fontSize: '11px', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>
                {language === 'UZ' ? 'Jami tushum' : language === 'RU' ? 'Общая выручка' : 'Total Revenue'}
              </span>
              <strong style={{ fontSize: '20px', color: '#10b981' }}>${totalRevenue.toFixed(2)}</strong>
            </div>
            <div style={{ padding: '12px', backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
              <span style={{ fontSize: '11px', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>
                {language === 'UZ' ? 'Buyurtmalar soni' : language === 'RU' ? 'Всего заказов' : 'Total Bookings'}
              </span>
              <strong style={{ fontSize: '20px', color: '#fff' }}>{stats.all}</strong>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px', color: '#cbd5e1' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#f59e0b' }}></span>
                {language === 'UZ' ? 'Kutilayotgan:' : language === 'RU' ? 'В ожидании:' : 'Pending:'}
              </span>
              <strong>{stats.pending}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10b981' }}></span>
                {language === 'UZ' ? 'Tasdiqlangan:' : language === 'RU' ? 'Подтверждено:' : 'Confirmed:'}
              </span>
              <strong>{stats.confirmed}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#3b82f6' }}></span>
                {language === 'UZ' ? 'Tugatildi:' : language === 'RU' ? 'Завершено:' : 'Completed:'}
              </span>
              <strong>{stats.completed}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#ef4444' }}></span>
                {language === 'UZ' ? 'Bekor qilingan:' : language === 'RU' ? 'Отменено:' : 'Cancelled:'}
              </span>
              <strong>{stats.cancelled}</strong>
            </div>
          </div>
        </div>

        {/* REVENUE LINE CHART CARD */}
        <div className="glass-container indigo-glow" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <h3 style={{ margin: 0, fontSize: '15px', color: '#6366f1', fontWeight: '800', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '8px', letterSpacing: '0.05em' }}>
            {language === 'UZ' ? '📈 KUNLIK DAROMAD O\'SISHI' : language === 'RU' ? '📈 ДИНАМИКА ВЫРУЧКИ' : '📈 DAILY REVENUE TREND'}
          </h3>
          {data.length === 0 ? (
            <div style={{ height: '140px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontSize: '13px' }}>
              No chart data available
            </div>
          ) : (
            <div style={{ width: '100%', overflowX: 'auto' }}>
              <svg viewBox="0 0 400 150" width="100%" height="150" style={{ overflow: 'visible' }}>
                {[0, 0.5, 1].map((ratio, i) => (
                  <line 
                    key={i} 
                    x1="30" 
                    y1={15 + ratio * 95} 
                    x2="380" 
                    y2={15 + ratio * 95} 
                    stroke="rgba(255,255,255,0.08)" 
                    strokeDasharray="4 4" 
                  />
                ))}
                
                <line x1="30" y1="110" x2="380" y2="110" stroke="rgba(255,255,255,0.2)" />
                <text x="25" y="20" fill="#94a3b8" fontSize="8" textAnchor="end">${maxRev.toFixed(0)}</text>
                <text x="25" y="113" fill="#94a3b8" fontSize="8" textAnchor="end">$0</text>

                {(() => {
                  const points = data.map((d, index) => {
                    const x = 50 + index * 50;
                    const y = 110 - (d.revenue / maxRev) * 90;
                    return `${x},${y}`;
                  }).join(' ');

                  return (
                    <>
                      <polyline
                        fill="none"
                        stroke="#10b981"
                        strokeWidth="2.5"
                        points={points}
                      />
                      {data.map((d, index) => {
                        const x = 50 + index * 50;
                        const y = 110 - (d.revenue / maxRev) * 90;
                        return (
                          <g key={index}>
                            <circle
                              cx={x}
                              cy={y}
                              r="4.5"
                              fill="#10b981"
                              stroke="#0a0f1d"
                              strokeWidth="2"
                            />
                            <text
                              x={x}
                              y={y - 8}
                              fill="#fff"
                              fontSize="8"
                              fontWeight="bold"
                              textAnchor="middle"
                            >
                              ${d.revenue.toFixed(0)}
                            </text>
                            <text
                              x={x}
                              y="126"
                              fill="#94a3b8"
                              fontSize="8"
                              textAnchor="middle"
                            >
                              {d.date}
                            </text>
                          </g>
                        );
                      })}
                    </>
                  );
                })()}
              </svg>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <main className="modern-dark-admin" style={{ width: '100%', minHeight: '100vh', display: 'flex', flexDirection: 'column', padding: '24px' }}>
      
      {/* Header */}
      <header className="glass-container" style={{
        padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        border: '1px solid rgba(99,102,241,0.15)', borderRadius: '16px', marginBottom: '24px', width: '100%'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '36px', height: '36px', borderRadius: '8px', backgroundColor: 'rgba(99,102,241,0.15)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6366f1'
          }}>
            <Compass size={20} />
          </div>
          <span style={{ fontSize: '18px', fontWeight: 800, letterSpacing: '0.05em', color: '#fff' }}>
            SAMARQAND <span style={{ color: '#6366f1' }}>CRAFTOUR</span> <span style={{ fontSize: '12px', color: '#94a3b8', marginLeft: '8px', fontWeight: 'normal' }}>{userRole === 'guide' ? `${currT.guideRole}: ${guideName}` : currT.adminRole}</span>
          </span>
        </div>

        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
          {/* Region Filter Segmented Selector */}
          <div style={{ display: 'flex', gap: '4px', backgroundColor: 'rgba(255,255,255,0.03)', padding: '4px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.08)' }}>
            {['all', 'samarqand', 'buxoro', 'xorazm', 'shahrisabz', 'toshkent', 'qoraqalpoq'].map((reg) => (
              <button
                key={reg}
                onClick={() => setRegionFilter(reg)}
                style={{
                  padding: '6px 12px',
                  borderRadius: '7px',
                  backgroundColor: regionFilter === reg ? 'rgba(99,102,241,0.15)' : 'transparent',
                  color: regionFilter === reg ? '#818cf8' : '#64748b',
                  border: regionFilter === reg ? '1.5px solid rgba(99,102,241,0.3)' : '1.5px solid transparent',
                  fontSize: '12px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  whiteSpace: 'nowrap'
                }}
              >
                {reg === 'all' ? currT.allRegions : reg === 'samarqand' ? currT.samarqand : reg === 'buxoro' ? currT.buxoro : reg === 'xorazm' ? currT.xorazm : reg === 'shahrisabz' ? currT.shahrisabz : reg === 'toshkent' ? currT.toshkent : reg === 'qoraqalpoq' ? currT.qoraqalpoq : reg}
              </button>
            ))}
          </div>

          {/* Header Dropdown Language Switcher */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setShowLangDropdown(!showLangDropdown)}
              style={{
                padding: '8px 12px',
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
              <Languages size={14} style={{ color: '#6366f1' }} />
              <span>{language === 'EN' ? '🇬🇧 EN' : language === 'RU' ? '🇷🇺 RU' : '🇺🇿 UZ'}</span>
            </button>
            {showLangDropdown && (
              <div style={{
                position: 'absolute',
                top: 'calc(100% + 8px)',
                right: 0,
                backgroundColor: '#0f172a',
                border: '1px solid rgba(99,102,241,0.25)',
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
                      background: language === langCode ? 'rgba(99,102,241,0.1)' : 'transparent',
                      color: language === langCode ? '#6366f1' : '#94a3b8',
                      textAlign: 'left',
                      fontSize: '13px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      borderRadius: '6px',
                      transition: 'all 0.2s ease',
                      width: '100%'
                    }}
                  >
                    {langCode === 'EN' ? '🇬🇧 English' : langCode === 'RU' ? '🇷🇺 Русский' : '🇺🇿 O\'zbekcha'}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button onClick={() => fetchAllData()} style={{ padding: '8px 12px', borderRadius: '10px', backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }} disabled={loading}>
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> {currT.refreshButton}
          </button>
          <button onClick={handleLogout} style={{ padding: '8px 12px', borderRadius: '10px', backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', color: '#ef4444', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '600' }}>
            <LogOut size={14} /> {currT.logoutButton}
          </button>
        </div>
      </header>

      {/* Main Tab Controls */}
      <div style={{ display: 'flex', gap: '16px', marginBottom: '20px', borderBottom: '1px solid rgba(255,255,255,0.1)', overflowX: 'auto' }}>
        {['bookings', 'locations', 'vehicles', 'guides']
          .filter(tab => userRole === 'admin' || tab === 'bookings' || tab === 'guides')
          .map(tab => (
            <button
              key={tab}
              onClick={() => { setActiveTab(tab); setEditingResource(null); }}
              style={{
                padding: '12px 24px', backgroundColor: 'transparent', border: 'none',
                color: activeTab === tab ? '#6366f1' : '#94a3b8',
                borderBottom: activeTab === tab ? '2px solid #6366f1' : '2px solid transparent',
                fontWeight: '700', fontSize: '15px', cursor: 'pointer', textTransform: 'capitalize'
              }}
            >
              {tab === 'guides' && userRole === 'guide' ? currT.myProfile : currT[tab]}
            </button>
          ))}
      </div>

      {errorMsg && (
        <div style={{ marginBottom: '20px', color: '#ef4444', backgroundColor: 'rgba(239, 68, 68, 0.1)', padding: '12px', borderRadius: '10px', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
          {errorMsg}
        </div>
      )}

      {/* ======================================================== */}
      {/* 1. BOOKINGS TAB VIEW                                     */}
      {/* ======================================================== */}
      {activeTab === 'bookings' && (
        <>
          {renderAnalyticsPanel()}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
            <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
              {['all', 'pending', 'confirmed', 'completed', 'cancelled'].map((status) => (
                <button
                  key={status}
                  onClick={() => setBookingFilter(status)}
                  style={{
                    padding: '8px 16px', borderRadius: '20px',
                    backgroundColor: bookingFilter === status ? '#6366f1' : 'rgba(255,255,255,0.05)',
                    color: bookingFilter === status ? '#0a0f1d' : '#fff',
                    border: bookingFilter === status ? '1px solid #6366f1' : '1px solid rgba(255,255,255,0.1)',
                    fontWeight: '600', textTransform: 'capitalize', cursor: 'pointer'
                  }}
                >
                  {currT[status]} ({bookings.filter(b => status === 'all' || b.status === status).length})
                </button>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              {bookings.length > 0 && (
                <button
                  onClick={exportBookingsToCSV}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '20px',
                    backgroundColor: 'rgba(99, 102, 241, 0.1)',
                    color: '#6366f1',
                    border: '1px solid rgba(99, 102, 241, 0.3)',
                    fontWeight: '600',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(99, 102, 241, 0.2)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'rgba(99, 102, 241, 0.1)'; }}
                >
                  <Download size={14} />
                  <span>{language === 'UZ' ? 'CSV yuklash' : language === 'RU' ? 'Скачать CSV' : 'Export CSV'}</span>
                </button>
              )}

              {userRole === 'admin' && bookings.length > 0 && (
                <button
                  onClick={clearAllBookings}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '20px',
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    color: '#ef4444',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    fontWeight: '600',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.2)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)'; }}
                >
                  <Trash2 size={14} />
                  <span>{currT.clearHistory}</span>
                </button>
              )}
            </div>
          </div>

          <div className="glass-container" style={{ padding: '20px', overflowX: 'auto' }}>
            {loading && bookings.length === 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '200px', gap: '10px', color: '#94a3b8' }}>
                <Loader2 size={32} className="animate-spin" style={{ color: '#6366f1' }} />
                <span>{currT.loadingBookings}</span>
              </div>
            ) : filteredBookings.length === 0 ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '200px', color: '#94a3b8' }}>
                {currT.noBookings}
              </div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '900px' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', color: '#94a3b8', fontSize: '13px' }}>
                    <th style={{ padding: '12px 8px' }}>{currT.bookingId}</th>
                    <th style={{ padding: '12px 8px' }}>{currT.touristDetails}</th>
                    <th style={{ padding: '12px 8px' }}>{currT.tourDate}</th>
                    <th style={{ padding: '12px 8px' }}>{currT.routeSights}</th>
                    <th style={{ padding: '12px 8px' }}>{currT.guideDriver}</th>
                    <th style={{ padding: '12px 8px' }}>{currT.totalPrice}</th>
                    <th style={{ padding: '12px 8px' }}>{language === 'UZ' ? 'To\'lov' : language === 'RU' ? 'Оплата' : 'Payment'}</th>
                    <th style={{ padding: '12px 8px' }}>{currT.status}</th>
                    <th style={{ padding: '12px 8px', textAlign: 'center' }}>{currT.actions}</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBookings.map((booking) => {
                    const colors = getStatusColor(booking.status);
                    const waLink = booking.tourist_phone ? `https://wa.me/${booking.tourist_phone.replace(/\+/g, '').trim()}` : '#';
                    return (
                      <tr key={booking.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', fontSize: '14px' }}>
                        <td style={{ padding: '16px 8px' }}>
                          <div style={{ fontWeight: '700', color: '#6366f1' }}>#{booking.id}</div>
                          <span style={{ fontSize: '11px', color: '#64748b' }}>{new Date(booking.created_at).toLocaleDateString()}</span>
                        </td>
                        <td style={{ padding: '16px 8px' }}>
                          <div style={{ fontWeight: '600' }}>{booking.tourist_name}</div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', marginTop: '4px', fontSize: '12px' }}>
                            <a href={`mailto:${booking.tourist_email}`} style={{ color: '#94a3b8', textDecoration: 'none' }}>✉ {booking.tourist_email}</a>
                            <a href={waLink} target="_blank" rel="noopener noreferrer" style={{ color: '#009b9e', textDecoration: 'none', fontWeight: '700' }}>📞 {booking.tourist_phone} ↗</a>
                          </div>
                        </td>
                        <td style={{ padding: '16px 8px' }}>
                          <div>{booking.booking_date}</div>
                          <span style={{ fontSize: '10px', color: '#64748b' }}>Lang: {booking.customer_language}</span>
                          <div style={{ marginTop: '4px' }}>
                            <span style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              padding: '2px 8px',
                              borderRadius: '20px',
                              fontSize: '10px',
                              fontWeight: '700',
                              backgroundColor: booking.booking_type === 'shared' ? 'rgba(0,155,158,0.15)' : 'rgba(99,102,241,0.12)',
                              color: booking.booking_type === 'shared' ? '#009b9e' : '#6366f1',
                              border: booking.booking_type === 'shared' ? '1px solid rgba(0,155,158,0.3)' : '1px solid rgba(99,102,241,0.25)',
                            }}>
                              {booking.booking_type === 'shared' ? '🤝 Shared' : '🔒 Private'}
                            </span>
                          </div>
                        </td>
                        <td style={{ padding: '16px 8px', maxWidth: '280px' }}>
                          {booking.booking_items?.sort((x,y) => x.visit_order - y.visit_order).map((item, idx) => (
                            <div key={idx} style={{ fontSize: '12px', color: '#e2e8f0' }}>
                              {item.visit_order > 100 
                                ? (booking.customer_language === 'UZ' 
                                    ? `${Math.floor(item.visit_order / 100)}-kun, ${item.visit_order % 100}` 
                                    : booking.customer_language === 'RU' 
                                      ? `День ${Math.floor(item.visit_order / 100)}, ${item.visit_order % 100}` 
                                      : `Day ${Math.floor(item.visit_order / 100)}, ${item.visit_order % 100}`) 
                                : item.visit_order
                              }. {booking.customer_language === 'UZ' ? (item.location?.name_uz || item.location?.name_en) : booking.customer_language === 'RU' ? item.location?.name_ru : item.location?.name_en}
                            </div>
                          )) || <span style={{ color: '#64748b' }}>None</span>}
                        </td>
                        <td style={{ padding: '16px 8px', fontSize: '12px' }}>
                          <div>
                            <span style={{ color: '#64748b' }}>{currT.guide}: </span>
                            {booking.guide?.full_name || 'N/A'}
                            {booking.guide && (
                              <span style={{ marginLeft: '4px' }}>
                                {booking.guide_response === 'confirmed' ? '🟢' : booking.guide_response === 'rejected' ? '🔴' : '🟡'}
                                <span style={{ fontSize: '10px', color: booking.guide_response === 'confirmed' ? '#10b981' : booking.guide_response === 'rejected' ? '#ef4444' : '#f59e0b', marginLeft: '2px' }}>
                                  {currT[booking.guide_response] || booking.guide_response}
                                </span>
                              </span>
                            )}
                          </div>
                          <div>
                            <span style={{ color: '#64748b' }}>{currT.driver}: </span>
                            {booking.vehicle?.driver_name || 'N/A'}
                            {booking.vehicle && (
                              <span style={{ marginLeft: '4px' }}>
                                {booking.vehicle_response === 'confirmed' ? '🟢' : booking.vehicle_response === 'rejected' ? '🔴' : '🟡'}
                                <span style={{ fontSize: '10px', color: booking.vehicle_response === 'confirmed' ? '#10b981' : booking.vehicle_response === 'rejected' ? '#ef4444' : '#f59e0b', marginLeft: '2px' }}>
                                  {currT[booking.vehicle_response] || booking.vehicle_response}
                                </span>
                              </span>
                            )}
                          </div>
                        </td>
                        <td style={{ padding: '16px 8px', fontWeight: '800', color: '#6366f1' }}>${parseFloat(booking.total_price).toFixed(2)}</td>
                        <td style={{ padding: '16px 8px' }}>
                          {booking.payment_status === 'deposit_paid' ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                              <span style={{ color: '#10b981', fontWeight: '700', fontSize: '11px' }}>
                                {language === 'UZ' ? 'Depozit (20%)' : language === 'RU' ? 'Депозит 20%' : 'Paid 20%'}
                              </span>
                              <span style={{ fontSize: '10px', color: '#cbd5e1' }}>
                                ${parseFloat(booking.deposit_amount || 0).toFixed(2)} ({booking.payment_method?.toUpperCase()})
                              </span>
                            </div>
                          ) : (
                            <span style={{ color: '#ef4444', fontWeight: '600', fontSize: '11px' }}>
                              {language === 'UZ' ? 'To\'lanmagan' : language === 'RU' ? 'Не оплачено' : 'Unpaid'}
                            </span>
                          )}
                        </td>
                        <td style={{ padding: '16px 8px' }}>
                          <span style={{ padding: '4px 8px', borderRadius: '8px', fontSize: '11px', fontWeight: '700', color: colors.text, backgroundColor: colors.bg, border: `1px solid ${colors.border}` }}>
                            {currT[booking.status] || booking.status}
                          </span>
                        </td>
                        <td style={{ padding: '16px 8px', textAlign: 'center' }}>
                          {actionLoading === booking.id ? <Loader2 size={16} className="animate-spin" /> : (
                            <div style={{ display: 'flex', gap: '6px', justifyContent: 'center', alignItems: 'center' }}>
                              {booking.status === 'pending' && (
                                <button onClick={() => updateBookingStatus(booking.id, 'confirmed')} title={currT.confirmed} style={{ padding: '4px', background: 'rgba(99,102,241,0.1)', color: '#6366f1', border: '1px solid #6366f1', cursor: 'pointer', borderRadius: '4px' }}><CheckCircle size={14} /></button>
                              )}
                              {booking.status !== 'completed' && booking.status !== 'cancelled' && (
                                <>
                                  <button onClick={() => updateBookingStatus(booking.id, 'completed')} title={currT.completed} style={{ padding: '4px', background: 'rgba(16,185,129,0.1)', color: '#10b981', border: '1px solid #10b981', cursor: 'pointer', borderRadius: '4px' }}><CheckCircle size={14} /></button>
                                  <button onClick={() => updateBookingStatus(booking.id, 'cancelled')} title={currT.cancelled} style={{ padding: '4px', background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid #ef4444', cursor: 'pointer', borderRadius: '4px' }}><XCircle size={14} /></button>
                                </>
                              )}
                              {(booking.status === 'completed' || booking.status === 'cancelled') && <span style={{ color: '#64748b', fontSize: '11px' }}>{currT.archived}</span>}
                              
                              {userRole === 'admin' && (
                                <button 
                                  onClick={() => deleteBooking(booking.id)} 
                                  title="Delete booking" 
                                  style={{ padding: '4px', background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.3)', cursor: 'pointer', borderRadius: '4px' }}
                                >
                                  <Trash2 size={14} />
                                </button>
                              )}
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}

      {/* ======================================================== */}
      {/* 2. LOCATIONS TAB VIEW                                    */}
      {/* ======================================================== */}
      {activeTab === 'locations' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '24px' }}>
          <div className="glass-container" style={{ padding: '24px' }}>
            <h3 style={{ color: '#6366f1', marginBottom: '16px', fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}><Plus size={18} /> {currT.addLocation}</h3>
            
            {/* AI Auto-fill Assistant */}
            <div style={{
              marginBottom: '24px',
              padding: '16px',
              borderRadius: '12px',
              backgroundColor: 'rgba(99, 102, 241, 0.03)',
              border: '1px dashed rgba(99, 102, 241, 0.2)',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}>
              <span style={{ color: '#818cf8', fontSize: '14px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px' }}>
                ✨ {currT.aiAssistantTitle}
              </span>
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                <input 
                  type="text" 
                  placeholder={currT.aiQueryPlaceholder} 
                  value={aiQuery} 
                  onChange={e => setAiQuery(e.target.value)} 
                  style={{ flex: 1, minWidth: '200px', marginBottom: 0 }}
                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAiFill(); } }}
                />
                <button 
                  type="button" 
                  onClick={handleAiFill} 
                  className="btn-indigo" 
                  style={{
                    padding: '10px 20px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    backgroundColor: '#6366f1',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#fff',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '500',
                    transition: 'all 0.2s',
                    width: 'auto'
                  }}
                  disabled={aiLoading}
                >
                  {aiLoading ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      <span>{currT.aiGenerating}</span>
                    </>
                  ) : (
                    <span>{currT.aiFillButton}</span>
                  )}
                </button>
              </div>
            </div>

            <form onSubmit={handleAddLocation} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
              <input type="text" placeholder={currT.nameEn} value={locationForm.name_en} onChange={e => setLocationForm({...locationForm, name_en: e.target.value})} required />
              <input type="text" placeholder={currT.nameRu} value={locationForm.name_ru} onChange={e => setLocationForm({...locationForm, name_ru: e.target.value})} required />
              <input type="text" placeholder={currT.nameUz} value={locationForm.name_uz} onChange={e => setLocationForm({...locationForm, name_uz: e.target.value})} required />
              <input type="number" placeholder={currT.estDurationPlaceholder} value={locationForm.estimated_duration} onChange={e => setLocationForm({...locationForm, estimated_duration: e.target.value})} required />
              <input type="text" placeholder={currT.lat} value={locationForm.latitude} onChange={e => setLocationForm({...locationForm, latitude: e.target.value})} />
              <input type="text" placeholder={currT.lng} value={locationForm.longitude} onChange={e => setLocationForm({...locationForm, longitude: e.target.value})} />
              <select value={locationForm.category} onChange={e => setLocationForm({...locationForm, category: e.target.value})}>
                <option value="historical">{currT.historical}</option>
                <option value="alternative">{currT.alternative}</option>
                <option value="food">{currT.food}</option>
              </select>
              <select value={locationForm.region} onChange={e => setLocationForm({...locationForm, region: e.target.value})} required>
                <option value="samarqand">Samarqand (Samarkand)</option>
                <option value="buxoro">Buxoro (Bukhara)</option>
                <option value="xorazm">Xorazm (Khorezm)</option>
                <option value="shahrisabz">Shahrisabz (Shahrisabz)</option>
                <option value="toshkent">Toshkent (Tashkent)</option>
                <option value="qoraqalpoq">Qoraqalpog'iston (Karakalpakstan)</option>
              </select>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#94a3b8', fontSize: '14px', cursor: 'pointer' }}>
                <input type="checkbox" checked={locationForm.is_out_of_city} onChange={e => setLocationForm({...locationForm, is_out_of_city: e.target.checked})} style={{ width: 'auto' }} />
                {currT.outOfCity}
              </label>
              <input type="text" placeholder={currT.imageUrl} value={locationForm.image_url} onChange={e => setLocationForm({...locationForm, image_url: e.target.value})} style={{ gridColumn: '1 / -1' }} />
              <textarea placeholder={currT.descEn} value={locationForm.description_en} onChange={e => setLocationForm({...locationForm, description_en: e.target.value})} style={{ gridColumn: '1 / -1' }} />
              <textarea placeholder={currT.descRu} value={locationForm.description_ru} onChange={e => setLocationForm({...locationForm, description_ru: e.target.value})} style={{ gridColumn: '1 / -1' }} />
              <textarea placeholder={currT.descUz} value={locationForm.description_uz} onChange={e => setLocationForm({...locationForm, description_uz: e.target.value})} style={{ gridColumn: '1 / -1' }} />
              <button type="submit" className="btn-indigo" style={{ padding: '10px 24px', gridColumn: '1 / -1', alignSelf: 'start', justifySelf: 'start' }} disabled={loading}>
                {loading ? <Loader2 size={16} className="animate-spin" /> : currT.saveLocation}
              </button>
            </form>
          </div>

          <div className="glass-container" style={{ padding: '24px', overflowX: 'auto' }}>
            <h3 style={{ color: '#fff', marginBottom: '16px', fontSize: '18px' }}>{currT.existingLocations} ({filteredLocations.length})</h3>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '800px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', color: '#94a3b8', fontSize: '13px' }}>
                  <th style={{ padding: '12px 8px' }}>{currT.photo}</th>
                  <th style={{ padding: '12px 8px' }}>{currT.category}</th>
                  <th style={{ padding: '12px 8px' }}>{currT.nameEnRuUz}</th>
                  <th style={{ padding: '12px 8px' }}>{currT.durationCol}</th>
                  <th style={{ padding: '12px 8px' }}>{currT.coordinates}</th>
                  <th style={{ padding: '12px 8px' }}>{currT.outOfCityCol}</th>
                  <th style={{ padding: '12px 8px', textAlign: 'center' }}>{currT.actions}</th>
                </tr>
              </thead>
              <tbody>
                {filteredLocations.map((loc) => {
                  const isEditing = editingResource?.type === 'location' && editingResource?.id === loc.id;
                  const defaultImages = {
                    1: '/images/locations/registan.webp',
                    2: '/images/locations/gureamir.webp',
                    3: '/images/locations/shahizinda.webp',
                    4: '/images/locations/bibikhanym.webp',
                    5: '/images/locations/ulughbeg.webp',
                    6: '/images/locations/urgut_mountains.webp',
                    7: '/images/locations/omonqoton.webp',
                    8: '/images/locations/konigil.webp',
                    9: '/images/locations/osh_center.webp',
                    10: '/images/locations/bread_bakery.webp',
                    11: '/images/locations/karimbek_restaurant.webp'
                  };
                  const displayImg = loc.image_url || defaultImages[loc.id];
                  
                  return (
                    <tr key={loc.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', fontSize: '14px' }}>
                      <td style={{ padding: '14px 8px' }}>
                        {isEditing ? (
                          <input 
                            type="text" 
                            placeholder="Image URL" 
                            value={editingResource.data.image_url || ''} 
                            onChange={e => setEditingResource({...editingResource, data: {...editingResource.data, image_url: e.target.value}})} 
                            style={{ padding: '4px', fontSize: '12px', width: '120px' }} 
                          />
                        ) : (
                          <div style={{ width: '40px', height: '40px', borderRadius: '6px', overflow: 'hidden', backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
                            {displayImg ? (
                              <img src={displayImg} alt={loc.name_en} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                              <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', color: '#64748b' }}>None</div>
                            )}
                          </div>
                        )}
                      </td>
                      <td style={{ padding: '14px 8px' }}>
                        <span style={{
                          padding: '2px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold',
                          backgroundColor: loc.category === 'historical' ? 'rgba(0,112,192,0.15)' : loc.category === 'food' ? 'rgba(16,185,129,0.15)' : 'rgba(99,102,241,0.15)',
                          color: loc.category === 'historical' ? '#0070c0' : loc.category === 'food' ? '#10b981' : '#6366f1'
                        }}>{currT[loc.category] || loc.category}</span>
                      </td>
                      <td style={{ padding: '14px 8px' }}>
                        {isEditing ? (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <input type="text" value={editingResource.data.name_en} onChange={e => setEditingResource({...editingResource, data: {...editingResource.data, name_en: e.target.value}})} style={{ padding: '4px', fontSize: '12px' }} />
                            <input type="text" value={editingResource.data.name_ru} onChange={e => setEditingResource({...editingResource, data: {...editingResource.data, name_ru: e.target.value}})} style={{ padding: '4px', fontSize: '12px' }} />
                            <input type="text" value={editingResource.data.name_uz || ''} placeholder="Name (Uzbek)" onChange={e => setEditingResource({...editingResource, data: {...editingResource.data, name_uz: e.target.value}})} style={{ padding: '4px', fontSize: '12px' }} />
                            <select value={editingResource.data.region || 'samarqand'} onChange={e => setEditingResource({...editingResource, data: {...editingResource.data, region: e.target.value}})} style={{ padding: '4px', fontSize: '12px' }}>
                              <option value="samarqand">Samarqand</option>
                              <option value="buxoro">Buxoro</option>
                              <option value="xorazm">Xorazm</option>
                              <option value="shahrisabz">Shahrisabz</option>
                              <option value="toshkent">Toshkent</option>
                            </select>
                            <textarea value={editingResource.data.description_en || ''} placeholder="Description (English)" onChange={e => setEditingResource({...editingResource, data: {...editingResource.data, description_en: e.target.value}})} style={{ padding: '4px', fontSize: '12px', minHeight: '40px' }} />
                            <textarea value={editingResource.data.description_ru || ''} placeholder="Description (Russian)" onChange={e => setEditingResource({...editingResource, data: {...editingResource.data, description_ru: e.target.value}})} style={{ padding: '4px', fontSize: '12px', minHeight: '40px' }} />
                            <textarea value={editingResource.data.description_uz || ''} placeholder="Description (Uzbek)" onChange={e => setEditingResource({...editingResource, data: {...editingResource.data, description_uz: e.target.value}})} style={{ padding: '4px', fontSize: '12px', minHeight: '40px' }} />
                          </div>
                        ) : (
                          <div>
                            <div style={{ fontWeight: '600' }}>{loc.name_en}</div>
                            <div style={{ color: '#94a3b8', fontSize: '12px' }}>{loc.name_ru}</div>
                            <div style={{ color: '#6366f1', fontSize: '12px' }}>{loc.name_uz || ''}</div>
                            <div style={{ 
                              color: loc.region === 'qoraqalpoq' ? '#a78bfa' : loc.region === 'toshkent' ? '#60a5fa' : loc.region === 'shahrisabz' ? '#34d399' : loc.region === 'xorazm' ? '#00a896' : loc.region === 'buxoro' ? '#ffa066' : '#a5b4fc', 
                              fontSize: '11px', 
                              marginTop: '6px', 
                              display: 'inline-block', 
                              padding: '2px 8px', 
                              backgroundColor: loc.region === 'qoraqalpoq' ? 'rgba(124, 58, 237, 0.2)' : loc.region === 'toshkent' ? 'rgba(30, 64, 175, 0.2)' : loc.region === 'shahrisabz' ? 'rgba(0, 163, 108, 0.2)' : loc.region === 'xorazm' ? 'rgba(2, 128, 144, 0.2)' : loc.region === 'buxoro' ? 'rgba(192, 90, 26, 0.2)' : 'rgba(99, 102, 241, 0.15)', 
                              borderRadius: '4px', 
                              border: loc.region === 'qoraqalpoq' ? '1px solid rgba(124, 58, 237, 0.3)' : loc.region === 'toshkent' ? '1px solid rgba(30, 64, 175, 0.3)' : loc.region === 'shahrisabz' ? '1px solid rgba(0, 163, 108, 0.3)' : loc.region === 'xorazm' ? '1px solid rgba(2, 128, 144, 0.3)' : loc.region === 'buxoro' ? '1px solid rgba(192, 90, 26, 0.3)' : '1px solid rgba(99, 102, 241, 0.2)',
                              fontWeight: '600'
                            }}>
                              📍 {loc.region === 'qoraqalpoq' ? currT.qoraqalpoq : loc.region === 'toshkent' ? currT.toshkent : loc.region === 'shahrisabz' ? currT.shahrisabz : loc.region === 'xorazm' ? currT.xorazm : loc.region === 'buxoro' ? currT.buxoro : currT.samarqand}
                            </div>
                          </div>
                        )}
                      </td>
                      <td style={{ padding: '14px 8px' }}>
                        {isEditing ? (
                          <input type="number" value={editingResource.data.estimated_duration || 90} onChange={e => setEditingResource({...editingResource, data: {...editingResource.data, estimated_duration: parseInt(e.target.value, 10) || 0}})} style={{ width: '80px', padding: '4px', fontSize: '12px' }} required />
                        ) : (
                          <span>{loc.estimated_duration || 90} min</span>
                        )}
                      </td>
                      <td style={{ padding: '14px 8px', fontSize: '13px' }}>
                        {isEditing ? (
                          <div style={{ display: 'flex', gap: '4px' }}>
                            <input type="text" value={editingResource.data.latitude} onChange={e => setEditingResource({...editingResource, data: {...editingResource.data, latitude: e.target.value}})} style={{ width: '80px', padding: '4px', fontSize: '12px' }} />
                            <input type="text" value={editingResource.data.longitude} onChange={e => setEditingResource({...editingResource, data: {...editingResource.data, longitude: e.target.value}})} style={{ width: '80px', padding: '4px', fontSize: '12px' }} />
                          </div>
                        ) : (
                          <span style={{ color: '#94a3b8' }}>Lat: {loc.latitude} / Lng: {loc.longitude}</span>
                        )}
                      </td>
                      <td style={{ padding: '14px 8px' }}>
                        {isEditing ? (
                          <input type="checkbox" checked={editingResource.data.is_out_of_city} onChange={e => setEditingResource({...editingResource, data: {...editingResource.data, is_out_of_city: e.target.checked}})} />
                        ) : (
                          <span>{loc.is_out_of_city ? currT.yes : currT.no}</span>
                        )}
                      </td>
                      <td style={{ padding: '14px 8px', textAlign: 'center' }}>
                        {actionLoading === loc.id ? <Loader2 size={16} className="animate-spin" /> : (
                          <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                            {isEditing ? (
                              <>
                                <button onClick={() => handleUpdateLocation(loc.id)} style={{ padding: '4px 8px', background: '#10b981', color: '#000', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>{currT.save}</button>
                                <button onClick={() => setEditingResource(null)} style={{ padding: '4px 8px', background: '#64748b', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>{currT.cancel}</button>
                              </>
                            ) : (
                              <>
                                <button onClick={() => setEditingResource({ type: 'location', id: loc.id, data: { ...loc } })} style={{ padding: '4px', background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}><Edit3 size={16} /></button>
                                <button onClick={() => handleDeleteLocation(loc.id)} style={{ padding: '4px', background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer' }}><Trash2 size={16} /></button>
                              </>
                            )}
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 3. VEHICLES TAB VIEW                                     */}
      {/* ======================================================== */}
      {activeTab === 'vehicles' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '24px' }}>
          <div className="glass-container" style={{ padding: '24px' }}>
            <h3 style={{ color: '#6366f1', marginBottom: '16px', fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}><Car size={18} /> {currT.addVehicle}</h3>
            <form onSubmit={handleAddVehicle} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
              <input type="text" placeholder={currT.driverName} value={vehicleForm.driver_name} onChange={e => setVehicleForm({...vehicleForm, driver_name: e.target.value})} required />
              <input type="text" placeholder={currT.driverPhone} value={vehicleForm.driver_phone} onChange={e => setVehicleForm({...vehicleForm, driver_phone: e.target.value})} required />
              <input type="text" placeholder={currT.carModel} value={vehicleForm.car_model} onChange={e => setVehicleForm({...vehicleForm, car_model: e.target.value})} required />
              <input type="text" placeholder={currT.carNumber} value={vehicleForm.car_number} onChange={e => setVehicleForm({...vehicleForm, car_number: e.target.value})} required />
              <input type="number" placeholder={currT.cityRate} value={vehicleForm.city_rate} onChange={e => setVehicleForm({...vehicleForm, city_rate: e.target.value})} required />
              <input type="number" placeholder={currT.outOfCityRate} value={vehicleForm.out_of_city_rate} onChange={e => setVehicleForm({...vehicleForm, out_of_city_rate: e.target.value})} required />
              <input type="number" placeholder={currT.telegramChatIdCol} value={vehicleForm.telegram_chat_id || ''} onChange={e => setVehicleForm({...vehicleForm, telegram_chat_id: e.target.value})} />
              
              <select value={vehicleForm.region} onChange={e => setVehicleForm({...vehicleForm, region: e.target.value})} required>
                <option value="samarqand">Samarqand (Samarkand)</option>
                <option value="buxoro">Buxoro (Bukhara)</option>
                <option value="xorazm">Xorazm (Khorezm)</option>
                <option value="shahrisabz">Shahrisabz (Shahrisabz)</option>
                <option value="toshkent">Toshkent (Tashkent)</option>
                <option value="qoraqalpoq">Qoraqalpog'iston (Karakalpakstan)</option>
              </select>
              
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <input 
                  type="text" 
                  placeholder={currT.imageUrl} 
                  value={vehicleForm.image_url || ''} 
                  onChange={e => setVehicleForm({...vehicleForm, image_url: e.target.value})} 
                  style={{ flex: 1 }}
                />
                <button 
                  type="button" 
                  onClick={() => {
                    const suggestedUrl = getFallbackVehicleImage(vehicleForm.car_model);
                    setVehicleForm({...vehicleForm, image_url: suggestedUrl});
                  }}
                  style={{
                    padding: '8px 12px',
                    backgroundColor: 'rgba(99,102,241,0.2)',
                    border: '1.5px solid #6366f1',
                    borderRadius: '6px',
                    color: '#a5b4fc',
                    cursor: 'pointer',
                    fontSize: '12px',
                    fontWeight: '600',
                    transition: 'all 0.2s ease',
                    whiteSpace: 'nowrap'
                  }}
                >
                  📷 Rasm
                </button>
              </div>

              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#94a3b8', fontSize: '14px', cursor: 'pointer' }}>
                <input type="checkbox" checked={!!vehicleForm.bot_active} onChange={e => setVehicleForm({...vehicleForm, bot_active: e.target.checked})} style={{ width: 'auto' }} />
                {currT.botStatusCol} ({currT.active})
              </label>
              <button type="submit" className="btn-indigo" style={{ padding: '10px 24px', gridColumn: '1 / -1', alignSelf: 'start', justifySelf: 'start' }} disabled={loading}>
                {loading ? <Loader2 size={16} className="animate-spin" /> : currT.saveDriver}
              </button>
            </form>
          </div>

          <div className="glass-container" style={{ padding: '24px', overflowX: 'auto' }}>
            <h3 style={{ color: '#fff', marginBottom: '16px', fontSize: '18px' }}>{currT.driversRates} ({filteredVehicles.length})</h3>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '800px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', color: '#94a3b8', fontSize: '13px' }}>
                  <th style={{ padding: '12px 8px' }}>{currT.photo}</th>
                  <th style={{ padding: '12px 8px' }}>{currT.driver}</th>
                  <th style={{ padding: '12px 8px' }}>{currT.phone}</th>
                  <th style={{ padding: '12px 8px' }}>{currT.carDetails}</th>
                  <th style={{ padding: '12px 8px' }}>{currT.cityRateCol}</th>
                  <th style={{ padding: '12px 8px' }}>{currT.outOfCityRateCol}</th>
                  <th style={{ padding: '12px 8px' }}>{currT.telegramChatIdCol}</th>
                  <th style={{ padding: '12px 8px' }}>{currT.botStatusCol}</th>
                  <th style={{ padding: '12px 8px', textAlign: 'center' }}>{currT.actions}</th>
                </tr>
              </thead>
              <tbody>
                {filteredVehicles.map((v) => {
                  const isEditing = editingResource?.type === 'vehicle' && editingResource?.id === v.id;
                  return (
                    <tr key={v.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', fontSize: '14px' }}>
                      <td style={{ padding: '14px 8px' }}>
                        {isEditing ? (
                          <input 
                            type="text" 
                            placeholder="Image URL" 
                            value={editingResource.data.image_url || ''} 
                            onChange={e => setEditingResource({...editingResource, data: {...editingResource.data, image_url: e.target.value}})} 
                            style={{ padding: '4px', fontSize: '12px', width: '120px' }} 
                          />
                        ) : (
                          <div style={{ width: '60px', height: '40px', borderRadius: '4px', overflow: 'hidden', backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
                            <img src={v.image_url || VEHICLE_IMAGES[v.id] || 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=400&q=80'} alt={v.car_model} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          </div>
                        )}
                      </td>
                      <td style={{ padding: '14px 8px' }}>
                        {isEditing ? (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <input type="text" value={editingResource.data.driver_name} onChange={e => setEditingResource({...editingResource, data: {...editingResource.data, driver_name: e.target.value}})} style={{ padding: '4px', fontSize: '12px' }} />
                            <select value={editingResource.data.region || 'samarqand'} onChange={e => setEditingResource({...editingResource, data: {...editingResource.data, region: e.target.value}})} style={{ padding: '4px', fontSize: '12px' }}>
                              <option value="samarqand">Samarqand</option>
                              <option value="buxoro">Buxoro</option>
                              <option value="xorazm">Xorazm</option>
                              <option value="shahrisabz">Shahrisabz</option>
                              <option value="toshkent">Toshkent</option>
                              <option value="qoraqalpoq">Qoraqalpog'iston</option>
                            </select>
                          </div>
                        ) : (
                          <div>
                            <div style={{ fontWeight: '600' }}>{v.driver_name}</div>
                            <div style={{ 
                              color: v.region === 'qoraqalpoq' ? '#a78bfa' : v.region === 'toshkent' ? '#60a5fa' : v.region === 'shahrisabz' ? '#34d399' : v.region === 'xorazm' ? '#00a896' : v.region === 'buxoro' ? '#ffa066' : '#a5b4fc', 
                              fontSize: '11px', 
                              marginTop: '4px', 
                              display: 'inline-block', 
                              padding: '2px 6px', 
                              backgroundColor: v.region === 'qoraqalpoq' ? 'rgba(124, 58, 237, 0.2)' : v.region === 'toshkent' ? 'rgba(30, 64, 175, 0.2)' : v.region === 'shahrisabz' ? 'rgba(0, 163, 108, 0.2)' : v.region === 'xorazm' ? 'rgba(2, 128, 144, 0.2)' : v.region === 'buxoro' ? 'rgba(192, 90, 26, 0.2)' : 'rgba(99, 102, 241, 0.15)', 
                              borderRadius: '4px', 
                              border: v.region === 'qoraqalpoq' ? '1px solid rgba(124, 58, 237, 0.3)' : v.region === 'toshkent' ? '1px solid rgba(30, 64, 175, 0.3)' : v.region === 'shahrisabz' ? '1px solid rgba(0, 163, 108, 0.3)' : v.region === 'xorazm' ? '1px solid rgba(2, 128, 144, 0.3)' : v.region === 'buxoro' ? '1px solid rgba(192, 90, 26, 0.3)' : '1px solid rgba(99, 102, 241, 0.2)',
                              fontWeight: '600'
                            }}>
                              📍 {v.region === 'qoraqalpoq' ? currT.qoraqalpoq : v.region === 'toshkent' ? currT.toshkent : v.region === 'shahrisabz' ? currT.shahrisabz : v.region === 'xorazm' ? currT.xorazm : v.region === 'buxoro' ? currT.buxoro : currT.samarqand}
                            </div>
                          </div>
                        )}
                      </td>
                      <td style={{ padding: '14px 8px' }}>
                        {isEditing ? (
                          <input type="text" value={editingResource.data.driver_phone} onChange={e => setEditingResource({...editingResource, data: {...editingResource.data, driver_phone: e.target.value}})} style={{ padding: '4px', fontSize: '12px' }} />
                        ) : (
                          <span style={{ color: '#94a3b8' }}>{v.driver_phone}</span>
                        )}
                      </td>
                      <td style={{ padding: '14px 8px' }}>
                        {isEditing ? (
                          <div style={{ display: 'flex', gap: '4px' }}>
                            <input type="text" value={editingResource.data.car_model} onChange={e => setEditingResource({...editingResource, data: {...editingResource.data, car_model: e.target.value}})} style={{ padding: '4px', fontSize: '12px' }} />
                            <input type="text" value={editingResource.data.car_number} onChange={e => setEditingResource({...editingResource, data: {...editingResource.data, car_number: e.target.value}})} style={{ padding: '4px', fontSize: '12px', width: '90px' }} />
                          </div>
                        ) : (
                          <div>
                            <div>{v.car_model}</div>
                            <span style={{ fontSize: '11px', color: '#64748b' }}>{v.car_number}</span>
                          </div>
                        )}
                      </td>
                      <td style={{ padding: '14px 8px', fontWeight: '700', color: '#6366f1' }}>
                        {isEditing ? (
                          <input type="number" value={editingResource.data.city_rate} onChange={e => setEditingResource({...editingResource, data: {...editingResource.data, city_rate: e.target.value}})} style={{ width: '80px', padding: '4px', fontSize: '12px' }} />
                        ) : (
                          <span>${parseFloat(v.city_rate).toFixed(2)}</span>
                        )}
                      </td>
                      <td style={{ padding: '14px 8px', fontWeight: '700', color: '#009b9e' }}>
                        {isEditing ? (
                          <input type="number" value={editingResource.data.out_of_city_rate} onChange={e => setEditingResource({...editingResource, data: {...editingResource.data, out_of_city_rate: e.target.value}})} style={{ width: '80px', padding: '4px', fontSize: '12px' }} />
                        ) : (
                          <span>${parseFloat(v.out_of_city_rate).toFixed(2)}</span>
                        )}
                      </td>
                      <td style={{ padding: '14px 8px' }}>
                        {isEditing ? (
                          <input type="text" placeholder="Chat ID" value={editingResource.data.telegram_chat_id || ''} onChange={e => setEditingResource({...editingResource, data: {...editingResource.data, telegram_chat_id: e.target.value}})} style={{ width: '110px', padding: '4px', fontSize: '12px' }} />
                        ) : (
                          <span style={{ color: '#94a3b8' }}>{v.telegram_chat_id || '-'}</span>
                        )}
                      </td>
                      <td style={{ padding: '14px 8px' }}>
                        {isEditing ? (
                          <input type="checkbox" checked={!!editingResource.data.bot_active} onChange={e => setEditingResource({...editingResource, data: {...editingResource.data, bot_active: e.target.checked}})} style={{ width: 'auto' }} />
                        ) : (
                          <span style={{ 
                            padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: '700',
                            backgroundColor: v.bot_active ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)',
                            color: v.bot_active ? '#10b981' : '#ef4444'
                          }}>
                            {v.bot_active ? currT.active : currT.inactive}
                          </span>
                        )}
                      </td>
                      <td style={{ padding: '14px 8px', textAlign: 'center' }}>
                        {actionLoading === v.id ? <Loader2 size={16} className="animate-spin" /> : (
                          <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                            {isEditing ? (
                              <>
                                <button onClick={() => handleUpdateVehicle(v.id)} style={{ padding: '4px 8px', background: '#10b981', color: '#000', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>{currT.save}</button>
                                <button onClick={() => setEditingResource(null)} style={{ padding: '4px 8px', background: '#64748b', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>{currT.cancel}</button>
                              </>
                            ) : (
                              <>
                                <button onClick={() => setEditingResource({ type: 'vehicle', id: v.id, data: { ...v } })} style={{ padding: '4px', background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}><Edit3 size={16} /></button>
                                <button onClick={() => handleDeleteVehicle(v.id)} style={{ padding: '4px', background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer' }}><Trash2 size={16} /></button>
                              </>
                            )}
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 4. GUIDES TAB VIEW                                       */}
      {/* ======================================================== */}
      {activeTab === 'guides' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '24px' }}>
          
          {/* Add Guide Form */}
          {userRole === 'admin' && (
            <div className="glass-container" style={{ padding: '24px' }}>
              <h3 style={{ color: '#6366f1', marginBottom: '16px', fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}><Languages size={18} /> {currT.addGuide}</h3>
              <form onSubmit={handleAddGuide} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
                <input type="text" placeholder={currT.fullName} value={guideForm.full_name} onChange={e => setGuideForm({...guideForm, full_name: e.target.value})} required />
                <input type="text" placeholder={currT.phoneNumber} value={guideForm.phone_number} onChange={e => setGuideForm({...guideForm, phone_number: e.target.value})} required />
                
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <input 
                    type="text" 
                    placeholder={currT.imageUrl} 
                    value={guideForm.image_url || ''} 
                    onChange={e => setGuideForm({...guideForm, image_url: e.target.value})} 
                    style={{ flex: 1 }}
                  />
                  <button 
                    type="button" 
                    onClick={() => {
                      const randomAvatar = DEFAULT_AVATARS[Math.floor(Math.random() * DEFAULT_AVATARS.length)];
                      setGuideForm({...guideForm, image_url: randomAvatar});
                    }}
                    style={{
                      padding: '8px 12px',
                      backgroundColor: 'rgba(99,102,241,0.2)',
                      border: '1.5px solid #6366f1',
                      borderRadius: '6px',
                      color: '#a5b4fc',
                      cursor: 'pointer',
                      fontSize: '12px',
                      fontWeight: '600',
                      transition: 'all 0.2s ease',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    👤 Rasm
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <span style={{ fontSize: '12px', color: '#64748b' }}>{currT.enRate}</span>
                  <input type="number" placeholder="e.g. 50" value={guideForm.en_rate} onChange={e => setGuideForm({...guideForm, en_rate: e.target.value})} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <span style={{ fontSize: '12px', color: '#64748b' }}>{currT.ruRate}</span>
                  <input type="number" placeholder="e.g. 40" value={guideForm.ru_rate} onChange={e => setGuideForm({...guideForm, ru_rate: e.target.value})} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <span style={{ fontSize: '12px', color: '#64748b' }}>{currT.uzRate}</span>
                  <input type="number" placeholder="e.g. 35" value={guideForm.uz_rate} onChange={e => setGuideForm({...guideForm, uz_rate: e.target.value})} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <span style={{ fontSize: '12px', color: '#64748b' }}>{currT.esRate}</span>
                  <input type="number" placeholder="e.g. 70" value={guideForm.es_rate} onChange={e => setGuideForm({...guideForm, es_rate: e.target.value})} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <span style={{ fontSize: '12px', color: '#64748b' }}>{currT.frRate}</span>
                  <input type="number" placeholder="e.g. 65" value={guideForm.fr_rate} onChange={e => setGuideForm({...guideForm, fr_rate: e.target.value})} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <span style={{ fontSize: '12px', color: '#64748b' }}>{currT.telegramChatIdCol}</span>
                  <input type="number" placeholder="e.g. 123456789" value={guideForm.telegram_chat_id || ''} onChange={e => setGuideForm({...guideForm, telegram_chat_id: e.target.value})} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <span style={{ fontSize: '12px', color: '#64748b' }}>{currT.region}</span>
                  <select value={guideForm.region} onChange={e => setGuideForm({...guideForm, region: e.target.value})} required>
                    <option value="samarqand">Samarqand (Samarkand)</option>
                    <option value="buxoro">Buxoro (Bukhara)</option>
                    <option value="xorazm">Xorazm (Khorezm)</option>
                    <option value="shahrisabz">Shahrisabz (Shahrisabz)</option>
                    <option value="toshkent">Toshkent (Tashkent)</option>
                    <option value="qoraqalpoq">Qoraqalpog'iston (Karakalpakstan)</option>
                  </select>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', justifyContent: 'center' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#94a3b8', fontSize: '14px', cursor: 'pointer', marginTop: '16px' }}>
                    <input type="checkbox" checked={!!guideForm.bot_active} onChange={e => setGuideForm({...guideForm, bot_active: e.target.checked})} style={{ width: 'auto' }} />
                    {currT.botStatusCol} ({currT.active})
                  </label>
                </div>

                <button type="submit" className="btn-indigo" style={{ padding: '10px 24px', gridColumn: '1 / -1', alignSelf: 'start', justifySelf: 'start' }} disabled={loading}>
                  {loading ? <Loader2 size={16} className="animate-spin" /> : currT.saveGuide}
                </button>
              </form>
            </div>
          )}

          {/* Guides List */}
          <div className="glass-container" style={{ padding: '24px', overflowX: 'auto' }}>
            <h3 style={{ color: '#fff', marginBottom: '16px', fontSize: '18px' }}>
              {userRole === 'guide' ? currT.myProfileRates : `${currT.expertGuides} (${filteredGuides.length})`}
            </h3>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '800px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', color: '#94a3b8', fontSize: '13px' }}>
                  <th style={{ padding: '12px 8px' }}>{currT.photo}</th>
                  <th style={{ padding: '12px 8px' }}>{currT.name}</th>
                  <th style={{ padding: '12px 8px' }}>{currT.phoneNumber}</th>
                  {userRole === 'admin' && <th style={{ padding: '12px 8px' }}>Portal Token</th>}
                  <th style={{ padding: '12px 8px' }}>{`EN ${currT.rateSuffix}`}</th>
                  <th style={{ padding: '12px 8px' }}>{`RU ${currT.rateSuffix}`}</th>
                  <th style={{ padding: '12px 8px' }}>{`UZ ${currT.rateSuffix}`}</th>
                  <th style={{ padding: '12px 8px' }}>{`ES ${currT.rateSuffix}`}</th>
                  <th style={{ padding: '12px 8px' }}>{`FR ${currT.rateSuffix}`}</th>
                  <th style={{ padding: '12px 8px' }}>{currT.telegramChatIdCol}</th>
                  <th style={{ padding: '12px 8px' }}>{currT.botStatusCol}</th>
                  <th style={{ padding: '12px 8px', textAlign: 'center' }}>{currT.actions}</th>
                </tr>
              </thead>
              <tbody>
                {filteredGuides
                  .filter(g => userRole === 'admin' || g.id === guideId)
                  .map((g) => {
                    const isEditing = editingResource?.type === 'guide' && editingResource?.id === g.id;
                    
                    return (
                      <tr key={g.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', fontSize: '14px' }}>
                        <td style={{ padding: '14px 8px' }}>
                          {isEditing ? (
                            <input 
                              type="text" 
                              placeholder="Image URL" 
                              value={editingResource.data.image_url || ''} 
                              onChange={e => setEditingResource({...editingResource, data: {...editingResource.data, image_url: e.target.value}})} 
                              style={{ padding: '4px', fontSize: '12px', width: '120px' }} 
                            />
                          ) : (
                            <div style={{ width: '40px', height: '40px', borderRadius: '50%', overflow: 'hidden', backgroundColor: 'rgba(255,255,255,0.05)', border: '1.5px solid var(--text-gold, #d4af37)', boxShadow: '0 2px 6px rgba(0,0,0,0.2)' }}>
                              <img src={g.image_url || GUIDE_IMAGES[g.id] || DEFAULT_AVATARS[0]} alt={g.full_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            </div>
                          )}
                        </td>
                        <td style={{ padding: '14px 8px' }}>
                          {isEditing ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                              <input type="text" value={editingResource.data.full_name} onChange={e => setEditingResource({...editingResource, data: {...editingResource.data, full_name: e.target.value}})} style={{ padding: '4px', fontSize: '12px' }} />
                              <select value={editingResource.data.region || 'samarqand'} onChange={e => setEditingResource({...editingResource, data: {...editingResource.data, region: e.target.value}})} style={{ padding: '4px', fontSize: '12px' }}>
                                <option value="samarqand">Samarqand</option>
                                <option value="buxoro">Buxoro</option>
                                <option value="xorazm">Xorazm</option>
                                <option value="shahrisabz">Shahrisabz</option>
                                <option value="toshkent">Toshkent</option>
                                <option value="qoraqalpoq">Qoraqalpog'iston</option>
                              </select>
                            </div>
                          ) : (
                            <div>
                              <div style={{ fontWeight: '600' }}>{g.full_name}</div>
                               <div style={{ 
                                 color: g.region === 'qoraqalpoq' ? '#a78bfa' : g.region === 'toshkent' ? '#60a5fa' : g.region === 'shahrisabz' ? '#34d399' : g.region === 'xorazm' ? '#00a896' : g.region === 'buxoro' ? '#ffa066' : '#a5b4fc', 
                                 fontSize: '11px', 
                                 marginTop: '4px', 
                                 display: 'inline-block', 
                                 padding: '2px 6px', 
                                 backgroundColor: g.region === 'qoraqalpoq' ? 'rgba(124, 58, 237, 0.2)' : g.region === 'toshkent' ? 'rgba(30, 64, 175, 0.2)' : g.region === 'shahrisabz' ? 'rgba(0, 163, 108, 0.2)' : g.region === 'xorazm' ? 'rgba(2, 128, 144, 0.2)' : g.region === 'buxoro' ? 'rgba(192, 90, 26, 0.2)' : 'rgba(99, 102, 241, 0.15)', 
                                 borderRadius: '4px', 
                                 border: g.region === 'qoraqalpoq' ? '1px solid rgba(124, 58, 237, 0.3)' : g.region === 'toshkent' ? '1px solid rgba(30, 64, 175, 0.3)' : g.region === 'shahrisabz' ? '1px solid rgba(0, 163, 108, 0.3)' : g.region === 'xorazm' ? '1px solid rgba(2, 128, 144, 0.3)' : g.region === 'buxoro' ? '1px solid rgba(192, 90, 26, 0.3)' : '1px solid rgba(99, 102, 241, 0.2)',
                                 fontWeight: '600'
                               }}>
                                 📍 {g.region === 'qoraqalpoq' ? currT.qoraqalpoq : g.region === 'toshkent' ? currT.toshkent : g.region === 'shahrisabz' ? currT.shahrisabz : g.region === 'xorazm' ? currT.xorazm : g.region === 'buxoro' ? currT.buxoro : currT.samarqand}
                               </div>
                            </div>
                          )}
                        </td>
                        <td style={{ padding: '14px 8px' }}>
                          {isEditing ? (
                            <input type="text" value={editingResource.data.phone_number} onChange={e => setEditingResource({...editingResource, data: {...editingResource.data, phone_number: e.target.value}})} style={{ padding: '4px', fontSize: '12px' }} />
                          ) : (
                            <span style={{ color: '#94a3b8' }}>{g.phone_number}</span>
                          )}
                        </td>
                        {userRole === 'admin' && (
                          <td style={{ padding: '14px 8px' }}>
                            <code style={{ 
                              padding: '2px 6px', 
                              backgroundColor: 'rgba(99,102,241,0.1)', 
                              color: '#6366f1', 
                              borderRadius: '4px',
                              fontFamily: 'monospace',
                              fontSize: '12px',
                              userSelect: 'all'
                            }} title="Buni nusxalab, gidga yuboring">{g.access_token || 'N/A'}</code>
                          </td>
                        )}
                        
                        {/* English Rate */}
                        <td style={{ padding: '14px 8px', fontWeight: '600', color: '#6366f1' }}>
                          {isEditing ? (
                            <input type="number" value={editingResource.data.en_rate} onChange={e => setEditingResource({...editingResource, data: {...editingResource.data, en_rate: e.target.value}})} style={{ width: '70px', padding: '4px', fontSize: '12px' }} />
                          ) : (
                            <span>{getGuideRateForLang(g.id, 'EN') ? `$${getGuideRateForLang(g.id, 'EN')}` : '-'}</span>
                          )}
                        </td>

                        {/* Russian Rate */}
                        <td style={{ padding: '14px 8px', fontWeight: '600', color: '#6366f1' }}>
                          {isEditing ? (
                            <input type="number" value={editingResource.data.ru_rate} onChange={e => setEditingResource({...editingResource, data: {...editingResource.data, ru_rate: e.target.value}})} style={{ width: '70px', padding: '4px', fontSize: '12px' }} />
                          ) : (
                            <span>{getGuideRateForLang(g.id, 'RU') ? `$${getGuideRateForLang(g.id, 'RU')}` : '-'}</span>
                          )}
                        </td>

                        {/* Uzbek Rate */}
                        <td style={{ padding: '14px 8px', fontWeight: '600', color: '#6366f1' }}>
                          {isEditing ? (
                            <input type="number" value={editingResource.data.uz_rate} onChange={e => setEditingResource({...editingResource, data: {...editingResource.data, uz_rate: e.target.value}})} style={{ width: '70px', padding: '4px', fontSize: '12px' }} />
                          ) : (
                            <span>{getGuideRateForLang(g.id, 'UZ') ? `$${getGuideRateForLang(g.id, 'UZ')}` : '-'}</span>
                          )}
                        </td>

                        {/* Spanish Rate */}
                        <td style={{ padding: '14px 8px', fontWeight: '600', color: '#6366f1' }}>
                          {isEditing ? (
                            <input type="number" value={editingResource.data.es_rate} onChange={e => setEditingResource({...editingResource, data: {...editingResource.data, es_rate: e.target.value}})} style={{ width: '70px', padding: '4px', fontSize: '12px' }} />
                          ) : (
                            <span>{getGuideRateForLang(g.id, 'ES') ? `$${getGuideRateForLang(g.id, 'ES')}` : '-'}</span>
                          )}
                        </td>

                        {/* French Rate */}
                        <td style={{ padding: '14px 8px', fontWeight: '600', color: '#6366f1' }}>
                          {isEditing ? (
                            <input type="number" value={editingResource.data.fr_rate} onChange={e => setEditingResource({...editingResource, data: {...editingResource.data, fr_rate: e.target.value}})} style={{ width: '70px', padding: '4px', fontSize: '12px' }} />
                          ) : (
                            <span>{getGuideRateForLang(g.id, 'FR') ? `$${getGuideRateForLang(g.id, 'FR')}` : '-'}</span>
                          )}
                        </td>

                        {/* Telegram Chat ID */}
                        <td style={{ padding: '14px 8px' }}>
                          {isEditing ? (
                            <input type="text" placeholder="Chat ID" value={editingResource.data.telegram_chat_id || ''} onChange={e => setEditingResource({...editingResource, data: {...editingResource.data, telegram_chat_id: e.target.value}})} style={{ width: '110px', padding: '4px', fontSize: '12px' }} />
                          ) : (
                            <span style={{ color: '#94a3b8' }}>{g.telegram_chat_id || '-'}</span>
                          )}
                        </td>

                        {/* Bot Status */}
                        <td style={{ padding: '14px 8px' }}>
                          {isEditing ? (
                            <input type="checkbox" checked={!!editingResource.data.bot_active} onChange={e => setEditingResource({...editingResource, data: {...editingResource.data, bot_active: e.target.checked}})} style={{ width: 'auto' }} />
                          ) : (
                            <span style={{ 
                              padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: '700',
                              backgroundColor: g.bot_active ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)',
                              color: g.bot_active ? '#10b981' : '#ef4444'
                            }}>
                              {g.bot_active ? currT.active : currT.inactive}
                            </span>
                          )}
                        </td>

                        <td style={{ padding: '14px 8px', textAlign: 'center' }}>
                          {actionLoading === g.id ? <Loader2 size={16} className="animate-spin" /> : (
                            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                              {isEditing ? (
                                <>
                                  <button onClick={() => handleUpdateGuide(g.id)} style={{ padding: '4px 8px', background: '#10b981', color: '#000', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>{currT.save}</button>
                                  <button onClick={() => setEditingResource(null)} style={{ padding: '4px 8px', background: '#64748b', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>{currT.cancel}</button>
                                </>
                              ) : (
                                <>
                                  <button onClick={() => setEditingResource({ 
                                    type: 'guide', 
                                    id: g.id, 
                                    data: { 
                                      full_name: g.full_name, 
                                      phone_number: g.phone_number,
                                      en_rate: getGuideRateForLang(g.id, 'EN'),
                                      ru_rate: getGuideRateForLang(g.id, 'RU'),
                                      uz_rate: getGuideRateForLang(g.id, 'UZ'),
                                      es_rate: getGuideRateForLang(g.id, 'ES'),
                                      fr_rate: getGuideRateForLang(g.id, 'FR'),
                                      telegram_chat_id: g.telegram_chat_id || '',
                                      bot_active: !!g.bot_active,
                                      image_url: g.image_url || '',
                                      region: g.region || 'samarqand'
                                    } 
                                  })} style={{ padding: '4px', background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}><Edit3 size={16} /></button>
                                  {userRole === 'admin' && (
                                    <button onClick={() => handleDeleteGuide(g.id)} style={{ padding: '4px', background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer' }}><Trash2 size={16} /></button>
                                  )}
                                </>
                              )}
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </main>
  );
}
