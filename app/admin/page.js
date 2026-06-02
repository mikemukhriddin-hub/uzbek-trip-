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
  Languages
} from 'lucide-react';

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
    if (saved) setLanguage(saved);
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

      save: "Save",
      cancel: "Cancel"
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

      save: "Сохранить",
      cancel: "Отмена"
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

      save: "Saqlash",
      cancel: "Bekor qilish"
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

  // Locations state
  const [locations, setLocations] = useState([]);
  const [locationForm, setLocationForm] = useState({
    name_en: '', name_ru: '', name_uz: '', description_en: '', description_ru: '', description_uz: '',
    latitude: '', longitude: '', category: 'historical', is_out_of_city: false,
    image_url: ''
  });

  // Vehicles state
  const [vehicles, setVehicles] = useState([]);
  const [vehicleForm, setVehicleForm] = useState({
    driver_name: '', driver_phone: '', car_model: '', car_number: '',
    city_rate: '', out_of_city_rate: ''
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
    fr_rate: ''
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
    const p4 = fetch('/api/guides').then(r => r.json());

    Promise.all([p1, p2, p3, p4])
      .then(([bookingsData, locationsData, vehiclesData, guidesData]) => {
        if (Array.isArray(bookingsData)) setBookings(bookingsData);
        if (Array.isArray(locationsData)) setLocations(locationsData);
        if (Array.isArray(vehiclesData)) setVehicles(vehiclesData);
        if (guidesData && Array.isArray(guidesData.guides)) {
          setGuides(guidesData.guides);
          setTariffs(guidesData.tariffs || []);

          const foundGuide = guidesData.guides.find(g => g.phone_number === token);
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
            name_en: '', name_ru: '', description_en: '', description_ru: '',
            latitude: '', longitude: '', category: 'historical', is_out_of_city: false,
            image_url: ''
          });
          alert('Location added successfully!');
        } else {
          alert('Error: ' + data.message);
        }
      })
      .catch(err => alert(err.message))
      .finally(() => setLoading(false));
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
            city_rate: '', out_of_city_rate: ''
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
        tariffs: guideTariffs
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
          setGuideForm({ full_name: '', phone_number: '', en_rate: '', ru_rate: '', uz_rate: '', es_rate: '', fr_rate: '' });
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
        tariffs: newTariffs
      })
    })
      .then(async (res) => {
        if (res.ok) {
          setGuides(prev => prev.map(g => g.id === guideId ? { id: g.id, full_name: updateData.full_name, phone_number: updateData.phone_number } : g));
          
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

  const filteredBookings = bookings.filter(b => bookingFilter === 'all' || b.status === bookingFilter);

  // --- Login Gate ---
  if (!isAuthenticated) {
    return (
      <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', position: 'relative' }}>
        
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
                >
                  {langCode === 'EN' ? '🇬🇧 English' : langCode === 'RU' ? '🇷🇺 Русский' : '🇺🇿 O\'zbekcha'}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="glass-container gold-glow animate-fade-in" style={{
          width: '100%', maxWidth: '420px', padding: '36px', display: 'flex', flexDirection: 'column', gap: '24px'
        }}>
          <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{
              width: '56px', height: '56px', borderRadius: '12px', backgroundColor: 'rgba(212, 175, 55, 0.15)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#d4af37', margin: '0 auto'
            }}>
              <Lock size={26} />
            </div>
            <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#fff', letterSpacing: '0.05em' }}>
              SAMARQAND <span style={{ color: '#d4af37' }}>CRAFTOUR</span>
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
            <button type="submit" className="btn-gold" style={{ padding: '12px', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }} disabled={loading}>
              {loading ? <Loader2 size={16} className="animate-spin" /> : <Unlock size={16} />}
              <span>{currT.unlockButton}</span>
            </button>
          </form>
        </div>
      </main>
    );
  }

  return (
    <main style={{ width: '100%', minHeight: '100vh', display: 'flex', flexDirection: 'column', padding: '24px' }}>
      
      {/* Header */}
      <header className="glass-container" style={{
        padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        border: '1px solid rgba(212,175,55,0.15)', borderRadius: '16px', marginBottom: '24px', width: '100%'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '36px', height: '36px', borderRadius: '8px', backgroundColor: 'rgba(212,175,55,0.15)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#d4af37'
          }}>
            <Compass size={20} />
          </div>
          <span style={{ fontSize: '18px', fontWeight: 800, letterSpacing: '0.05em', color: '#fff' }}>
            SAMARQAND <span style={{ color: '#d4af37' }}>CRAFTOUR</span> <span style={{ fontSize: '12px', color: '#94a3b8', marginLeft: '8px', fontWeight: 'normal' }}>{userRole === 'guide' ? `${currT.guideRole}: ${guideName}` : currT.adminRole}</span>
          </span>
        </div>

        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
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
                color: activeTab === tab ? '#d4af37' : '#94a3b8',
                borderBottom: activeTab === tab ? '2px solid #d4af37' : '2px solid transparent',
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
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
            <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
              {['all', 'pending', 'confirmed', 'completed', 'cancelled'].map((status) => (
                <button
                  key={status}
                  onClick={() => setBookingFilter(status)}
                  style={{
                    padding: '8px 16px', borderRadius: '20px',
                    backgroundColor: bookingFilter === status ? '#d4af37' : 'rgba(255,255,255,0.05)',
                    color: bookingFilter === status ? '#0a0f1d' : '#fff',
                    border: bookingFilter === status ? '1px solid #d4af37' : '1px solid rgba(255,255,255,0.1)',
                    fontWeight: '600', textTransform: 'capitalize', cursor: 'pointer'
                  }}
                >
                  {currT[status]} ({bookings.filter(b => status === 'all' || b.status === status).length})
                </button>
              ))}
            </div>

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

          <div className="glass-container" style={{ padding: '20px', overflowX: 'auto' }}>
            {loading && bookings.length === 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '200px', gap: '10px', color: '#94a3b8' }}>
                <Loader2 size={32} className="animate-spin" style={{ color: '#d4af37' }} />
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
                          <div style={{ fontWeight: '700', color: '#d4af37' }}>#{booking.id}</div>
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
                              backgroundColor: booking.booking_type === 'shared' ? 'rgba(0,155,158,0.15)' : 'rgba(212,175,55,0.12)',
                              color: booking.booking_type === 'shared' ? '#009b9e' : '#d4af37',
                              border: booking.booking_type === 'shared' ? '1px solid rgba(0,155,158,0.3)' : '1px solid rgba(212,175,55,0.25)',
                            }}>
                              {booking.booking_type === 'shared' ? '🤝 Shared' : '🔒 Private'}
                            </span>
                          </div>
                        </td>
                        <td style={{ padding: '16px 8px', maxWidth: '280px' }}>
                          {booking.booking_items?.sort((x,y) => x.visit_order - y.visit_order).map((item, idx) => (
                            <div key={idx} style={{ fontSize: '12px', color: '#e2e8f0' }}>{item.visit_order}. {booking.customer_language === 'UZ' ? (item.location?.name_uz || item.location?.name_en) : booking.customer_language === 'RU' ? item.location?.name_ru : item.location?.name_en}</div>
                          )) || <span style={{ color: '#64748b' }}>None</span>}
                        </td>
                        <td style={{ padding: '16px 8px', fontSize: '12px' }}>
                          <div><span style={{ color: '#64748b' }}>{currT.guide}: </span>{booking.guide?.full_name || 'N/A'}</div>
                          <div><span style={{ color: '#64748b' }}>{currT.driver}: </span>{booking.vehicle?.driver_name || 'N/A'}</div>
                        </td>
                        <td style={{ padding: '16px 8px', fontWeight: '800', color: '#d4af37' }}>${parseFloat(booking.total_price).toFixed(2)}</td>
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
                                <button onClick={() => updateBookingStatus(booking.id, 'confirmed')} title={currT.confirmed} style={{ padding: '4px', background: 'rgba(212,175,55,0.1)', color: '#d4af37', border: '1px solid #d4af37', cursor: 'pointer', borderRadius: '4px' }}><CheckCircle size={14} /></button>
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
            <h3 style={{ color: '#d4af37', marginBottom: '16px', fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}><Plus size={18} /> {currT.addLocation}</h3>
            <form onSubmit={handleAddLocation} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
              <input type="text" placeholder={currT.nameEn} value={locationForm.name_en} onChange={e => setLocationForm({...locationForm, name_en: e.target.value})} required />
              <input type="text" placeholder={currT.nameRu} value={locationForm.name_ru} onChange={e => setLocationForm({...locationForm, name_ru: e.target.value})} required />
              <input type="text" placeholder={currT.nameUz} value={locationForm.name_uz} onChange={e => setLocationForm({...locationForm, name_uz: e.target.value})} required />
              <input type="text" placeholder={currT.lat} value={locationForm.latitude} onChange={e => setLocationForm({...locationForm, latitude: e.target.value})} />
              <input type="text" placeholder={currT.lng} value={locationForm.longitude} onChange={e => setLocationForm({...locationForm, longitude: e.target.value})} />
              <select value={locationForm.category} onChange={e => setLocationForm({...locationForm, category: e.target.value})}>
                <option value="historical">{currT.historical}</option>
                <option value="alternative">{currT.alternative}</option>
                <option value="food">{currT.food}</option>
              </select>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#94a3b8', fontSize: '14px', cursor: 'pointer' }}>
                <input type="checkbox" checked={locationForm.is_out_of_city} onChange={e => setLocationForm({...locationForm, is_out_of_city: e.target.checked})} style={{ width: 'auto' }} />
                {currT.outOfCity}
              </label>
              <input type="text" placeholder={currT.imageUrl} value={locationForm.image_url} onChange={e => setLocationForm({...locationForm, image_url: e.target.value})} style={{ gridColumn: '1 / -1' }} />
              <textarea placeholder={currT.descEn} value={locationForm.description_en} onChange={e => setLocationForm({...locationForm, description_en: e.target.value})} style={{ gridColumn: '1 / -1' }} />
              <textarea placeholder={currT.descRu} value={locationForm.description_ru} onChange={e => setLocationForm({...locationForm, description_ru: e.target.value})} style={{ gridColumn: '1 / -1' }} />
              <textarea placeholder={currT.descUz} value={locationForm.description_uz} onChange={e => setLocationForm({...locationForm, description_uz: e.target.value})} style={{ gridColumn: '1 / -1' }} />
              <button type="submit" className="btn-gold" style={{ padding: '10px 24px', gridColumn: '1 / -1', alignSelf: 'start', justifySelf: 'start' }} disabled={loading}>
                {loading ? <Loader2 size={16} className="animate-spin" /> : currT.saveLocation}
              </button>
            </form>
          </div>

          <div className="glass-container" style={{ padding: '24px', overflowX: 'auto' }}>
            <h3 style={{ color: '#fff', marginBottom: '16px', fontSize: '18px' }}>{currT.existingLocations} ({locations.length})</h3>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '800px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', color: '#94a3b8', fontSize: '13px' }}>
                  <th style={{ padding: '12px 8px' }}>{currT.photo}</th>
                  <th style={{ padding: '12px 8px' }}>{currT.category}</th>
                  <th style={{ padding: '12px 8px' }}>{currT.nameEnRuUz}</th>
                  <th style={{ padding: '12px 8px' }}>{currT.coordinates}</th>
                  <th style={{ padding: '12px 8px' }}>{currT.outOfCityCol}</th>
                  <th style={{ padding: '12px 8px', textAlign: 'center' }}>{currT.actions}</th>
                </tr>
              </thead>
              <tbody>
                {locations.map((loc) => {
                  const isEditing = editingResource?.type === 'location' && editingResource?.id === loc.id;
                  const defaultImages = {
                    1: '/images/locations/registan.png',
                    2: '/images/locations/gureamir.png',
                    3: '/images/locations/shahizinda.png',
                    4: '/images/locations/bibikhanym.png',
                    5: '/images/locations/ulughbeg.png',
                    6: '/images/locations/urgut_mountains.png',
                    7: '/images/locations/omonqoton.png',
                    8: '/images/locations/konigil.png',
                    9: '/images/locations/osh_center.png',
                    10: '/images/locations/bread_bakery.png',
                    11: '/images/locations/karimbek_restaurant.png'
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
                          backgroundColor: loc.category === 'historical' ? 'rgba(0,112,192,0.15)' : loc.category === 'food' ? 'rgba(16,185,129,0.15)' : 'rgba(212,175,55,0.15)',
                          color: loc.category === 'historical' ? '#0070c0' : loc.category === 'food' ? '#10b981' : '#d4af37'
                        }}>{currT[loc.category] || loc.category}</span>
                      </td>
                      <td style={{ padding: '14px 8px' }}>
                        {isEditing ? (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <input type="text" value={editingResource.data.name_en} onChange={e => setEditingResource({...editingResource, data: {...editingResource.data, name_en: e.target.value}})} style={{ padding: '4px', fontSize: '12px' }} />
                            <input type="text" value={editingResource.data.name_ru} onChange={e => setEditingResource({...editingResource, data: {...editingResource.data, name_ru: e.target.value}})} style={{ padding: '4px', fontSize: '12px' }} />
                            <input type="text" value={editingResource.data.name_uz || ''} placeholder="Name (Uzbek)" onChange={e => setEditingResource({...editingResource, data: {...editingResource.data, name_uz: e.target.value}})} style={{ padding: '4px', fontSize: '12px' }} />
                            <textarea value={editingResource.data.description_en || ''} placeholder="Description (English)" onChange={e => setEditingResource({...editingResource, data: {...editingResource.data, description_en: e.target.value}})} style={{ padding: '4px', fontSize: '12px', minHeight: '40px' }} />
                            <textarea value={editingResource.data.description_ru || ''} placeholder="Description (Russian)" onChange={e => setEditingResource({...editingResource, data: {...editingResource.data, description_ru: e.target.value}})} style={{ padding: '4px', fontSize: '12px', minHeight: '40px' }} />
                            <textarea value={editingResource.data.description_uz || ''} placeholder="Description (Uzbek)" onChange={e => setEditingResource({...editingResource, data: {...editingResource.data, description_uz: e.target.value}})} style={{ padding: '4px', fontSize: '12px', minHeight: '40px' }} />
                          </div>
                        ) : (
                          <div>
                            <div style={{ fontWeight: '600' }}>{loc.name_en}</div>
                            <div style={{ color: '#94a3b8', fontSize: '12px' }}>{loc.name_ru}</div>
                            <div style={{ color: '#d4af37', fontSize: '12px' }}>{loc.name_uz || ''}</div>
                          </div>
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
            <h3 style={{ color: '#d4af37', marginBottom: '16px', fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}><Car size={18} /> {currT.addVehicle}</h3>
            <form onSubmit={handleAddVehicle} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
              <input type="text" placeholder={currT.driverName} value={vehicleForm.driver_name} onChange={e => setVehicleForm({...vehicleForm, driver_name: e.target.value})} required />
              <input type="text" placeholder={currT.driverPhone} value={vehicleForm.driver_phone} onChange={e => setVehicleForm({...vehicleForm, driver_phone: e.target.value})} required />
              <input type="text" placeholder={currT.carModel} value={vehicleForm.car_model} onChange={e => setVehicleForm({...vehicleForm, car_model: e.target.value})} required />
              <input type="text" placeholder={currT.carNumber} value={vehicleForm.car_number} onChange={e => setVehicleForm({...vehicleForm, car_number: e.target.value})} required />
              <input type="number" placeholder={currT.cityRate} value={vehicleForm.city_rate} onChange={e => setVehicleForm({...vehicleForm, city_rate: e.target.value})} required />
              <input type="number" placeholder={currT.outOfCityRate} value={vehicleForm.out_of_city_rate} onChange={e => setVehicleForm({...vehicleForm, out_of_city_rate: e.target.value})} required />
              <button type="submit" className="btn-gold" style={{ padding: '10px 24px', gridColumn: '1 / -1', alignSelf: 'start', justifySelf: 'start' }} disabled={loading}>
                {loading ? <Loader2 size={16} className="animate-spin" /> : currT.saveDriver}
              </button>
            </form>
          </div>

          <div className="glass-container" style={{ padding: '24px', overflowX: 'auto' }}>
            <h3 style={{ color: '#fff', marginBottom: '16px', fontSize: '18px' }}>{currT.driversRates} ({vehicles.length})</h3>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '800px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', color: '#94a3b8', fontSize: '13px' }}>
                  <th style={{ padding: '12px 8px' }}>{currT.driver}</th>
                  <th style={{ padding: '12px 8px' }}>{currT.phone}</th>
                  <th style={{ padding: '12px 8px' }}>{currT.carDetails}</th>
                  <th style={{ padding: '12px 8px' }}>{currT.cityRateCol}</th>
                  <th style={{ padding: '12px 8px' }}>{currT.outOfCityRateCol}</th>
                  <th style={{ padding: '12px 8px', textAlign: 'center' }}>{currT.actions}</th>
                </tr>
              </thead>
              <tbody>
                {vehicles.map((v) => {
                  const isEditing = editingResource?.type === 'vehicle' && editingResource?.id === v.id;
                  return (
                    <tr key={v.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', fontSize: '14px' }}>
                      <td style={{ padding: '14px 8px' }}>
                        {isEditing ? (
                          <input type="text" value={editingResource.data.driver_name} onChange={e => setEditingResource({...editingResource, data: {...editingResource.data, driver_name: e.target.value}})} style={{ padding: '4px', fontSize: '12px' }} />
                        ) : (
                          <div style={{ fontWeight: '600' }}>{v.driver_name}</div>
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
                      <td style={{ padding: '14px 8px', fontWeight: '700', color: '#d4af37' }}>
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
              <h3 style={{ color: '#d4af37', marginBottom: '16px', fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}><Languages size={18} /> {currT.addGuide}</h3>
              <form onSubmit={handleAddGuide} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
                <input type="text" placeholder={currT.fullName} value={guideForm.full_name} onChange={e => setGuideForm({...guideForm, full_name: e.target.value})} required />
                <input type="text" placeholder={currT.phoneNumber} value={guideForm.phone_number} onChange={e => setGuideForm({...guideForm, phone_number: e.target.value})} required />
                
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

                <button type="submit" className="btn-gold" style={{ padding: '10px 24px', gridColumn: '1 / -1', alignSelf: 'start', justifySelf: 'start' }} disabled={loading}>
                  {loading ? <Loader2 size={16} className="animate-spin" /> : currT.saveGuide}
                </button>
              </form>
            </div>
          )}

          {/* Guides List */}
          <div className="glass-container" style={{ padding: '24px', overflowX: 'auto' }}>
            <h3 style={{ color: '#fff', marginBottom: '16px', fontSize: '18px' }}>
              {userRole === 'guide' ? currT.myProfileRates : `${currT.expertGuides} (${guides.length})`}
            </h3>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '800px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', color: '#94a3b8', fontSize: '13px' }}>
                  <th style={{ padding: '12px 8px' }}>{currT.name}</th>
                  <th style={{ padding: '12px 8px' }}>{currT.phoneNumber}</th>
                  <th style={{ padding: '12px 8px' }}>{`EN ${currT.rateSuffix}`}</th>
                  <th style={{ padding: '12px 8px' }}>{`RU ${currT.rateSuffix}`}</th>
                  <th style={{ padding: '12px 8px' }}>{`UZ ${currT.rateSuffix}`}</th>
                  <th style={{ padding: '12px 8px' }}>{`ES ${currT.rateSuffix}`}</th>
                  <th style={{ padding: '12px 8px' }}>{`FR ${currT.rateSuffix}`}</th>
                  <th style={{ padding: '12px 8px', textAlign: 'center' }}>{currT.actions}</th>
                </tr>
              </thead>
              <tbody>
                {guides
                  .filter(g => userRole === 'admin' || g.id === guideId)
                  .map((g) => {
                    const isEditing = editingResource?.type === 'guide' && editingResource?.id === g.id;
                    
                    return (
                      <tr key={g.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', fontSize: '14px' }}>
                        <td style={{ padding: '14px 8px' }}>
                          {isEditing ? (
                            <input type="text" value={editingResource.data.full_name} onChange={e => setEditingResource({...editingResource, data: {...editingResource.data, full_name: e.target.value}})} style={{ padding: '4px', fontSize: '12px' }} />
                          ) : (
                            <div style={{ fontWeight: '600' }}>{g.full_name}</div>
                          )}
                        </td>
                        <td style={{ padding: '14px 8px' }}>
                          {isEditing ? (
                            <input type="text" value={editingResource.data.phone_number} onChange={e => setEditingResource({...editingResource, data: {...editingResource.data, phone_number: e.target.value}})} style={{ padding: '4px', fontSize: '12px' }} />
                          ) : (
                            <span style={{ color: '#94a3b8' }}>{g.phone_number}</span>
                          )}
                        </td>
                        
                        {/* English Rate */}
                        <td style={{ padding: '14px 8px', fontWeight: '600', color: '#d4af37' }}>
                          {isEditing ? (
                            <input type="number" value={editingResource.data.en_rate} onChange={e => setEditingResource({...editingResource, data: {...editingResource.data, en_rate: e.target.value}})} style={{ width: '70px', padding: '4px', fontSize: '12px' }} />
                          ) : (
                            <span>{getGuideRateForLang(g.id, 'EN') ? `$${getGuideRateForLang(g.id, 'EN')}` : '-'}</span>
                          )}
                        </td>

                        {/* Russian Rate */}
                        <td style={{ padding: '14px 8px', fontWeight: '600', color: '#d4af37' }}>
                          {isEditing ? (
                            <input type="number" value={editingResource.data.ru_rate} onChange={e => setEditingResource({...editingResource, data: {...editingResource.data, ru_rate: e.target.value}})} style={{ width: '70px', padding: '4px', fontSize: '12px' }} />
                          ) : (
                            <span>{getGuideRateForLang(g.id, 'RU') ? `$${getGuideRateForLang(g.id, 'RU')}` : '-'}</span>
                          )}
                        </td>

                        {/* Uzbek Rate */}
                        <td style={{ padding: '14px 8px', fontWeight: '600', color: '#d4af37' }}>
                          {isEditing ? (
                            <input type="number" value={editingResource.data.uz_rate} onChange={e => setEditingResource({...editingResource, data: {...editingResource.data, uz_rate: e.target.value}})} style={{ width: '70px', padding: '4px', fontSize: '12px' }} />
                          ) : (
                            <span>{getGuideRateForLang(g.id, 'UZ') ? `$${getGuideRateForLang(g.id, 'UZ')}` : '-'}</span>
                          )}
                        </td>

                        {/* Spanish Rate */}
                        <td style={{ padding: '14px 8px', fontWeight: '600', color: '#d4af37' }}>
                          {isEditing ? (
                            <input type="number" value={editingResource.data.es_rate} onChange={e => setEditingResource({...editingResource, data: {...editingResource.data, es_rate: e.target.value}})} style={{ width: '70px', padding: '4px', fontSize: '12px' }} />
                          ) : (
                            <span>{getGuideRateForLang(g.id, 'ES') ? `$${getGuideRateForLang(g.id, 'ES')}` : '-'}</span>
                          )}
                        </td>

                        {/* French Rate */}
                        <td style={{ padding: '14px 8px', fontWeight: '600', color: '#d4af37' }}>
                          {isEditing ? (
                            <input type="number" value={editingResource.data.fr_rate} onChange={e => setEditingResource({...editingResource, data: {...editingResource.data, fr_rate: e.target.value}})} style={{ width: '70px', padding: '4px', fontSize: '12px' }} />
                          ) : (
                            <span>{getGuideRateForLang(g.id, 'FR') ? `$${getGuideRateForLang(g.id, 'FR')}` : '-'}</span>
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
                                      fr_rate: getGuideRateForLang(g.id, 'FR')
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
