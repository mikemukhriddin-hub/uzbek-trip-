'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { Compass, Sparkles, MapPin, CheckCircle, XCircle, Languages, AlertCircle, Lock, Info, Sun } from 'lucide-react';

// Dynamically import the Map component with no SSR to bypass Leaflet window errors
const Map = dynamic(() => import('@/components/Map'), { 
  ssr: false,
  loading: () => (
    <div style={{
      width: '100%',
      height: '400px',
      borderRadius: '16px',
      backgroundColor: 'rgba(18, 26, 47, 0.6)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      border: '1px dashed rgba(212,175,55,0.2)',
      color: '#94a3b8'
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

import { MOCK_LOCATIONS, MOCK_GUIDES, MOCK_TARIFFS, MOCK_VEHICLES, UZ_LOCATIONS } from '@/lib/mockData';


const WEATHER_DATA = {
  samarqand: { temp: '28°C', uz: '☀️ Havo ochiq va quyoshli', ru: '☀️ Ясно, солнечно', en: '☀️ Clear skies & sunny forecast', nameUz: 'Samarqand', nameRu: 'Самарканде', nameEn: 'Samarkand' },
  buxoro: { temp: '31°C', uz: '☀️ Issiq va quyoshli', ru: '☀️ Ясно, солнечно и жарко', en: '☀️ Warm, sunny & clear', nameUz: 'Buxoro', nameRu: 'Бухаре', nameEn: 'Bukhara' },
  xorazm: { temp: '33°C', uz: '☀️ Quyoshli va cho\'l shamoli', ru: '☀️ Ясно, пустынный бриз', en: '☀️ Sunny, desert breeze', nameUz: 'Xorazm', nameRu: 'Хорезме', nameEn: 'Khorezm' },
  shahrisabz: { temp: '27°C', uz: '☀️ Quyoshli va tog\' havosi', ru: '☀️ Ясно, свежий горный воздух', en: '☀️ Sunny, fresh mountain breeze', nameUz: 'Shahrisabz', nameRu: 'Шахрисабзе', nameEn: 'Shahrisabz' },
  toshkent: { temp: '29°C', uz: '☀️ Muloqot va shahar tarovati', ru: '☀️ Ясно, городской ритм', en: '☀️ Sunny city life', nameUz: 'Toshkent', nameRu: 'Ташкенте', nameEn: 'Tashkent' },
  qoraqalpoq: { temp: '32°C', uz: '☀️ Issiq va quruq sahro havosi', ru: '☀️ Ясно, сухой пустынный воздух', en: '☀️ Hot & dry desert air', nameUz: 'Nukus', nameRu: 'Нукусе', nameEn: 'Nukus' }
};

export default function ClientDashboard({ initialLocations = [], initialGuides = [], initialTariffs = [], initialVehicles = [] }) {
  const [language, setLanguage] = useState('UZ'); // Site UI Language - default to UZ
  const [showLangDropdown, setShowLangDropdown] = useState(false);
  const [locations, setLocations] = useState(() => {
    const base = initialLocations && initialLocations.length > 0 ? initialLocations : MOCK_LOCATIONS;
    return base.map(loc => ({
      ...loc,
      name_uz: loc.name_uz || UZ_LOCATIONS[loc.id]?.name || loc.name_en,
      description_uz: loc.description_uz || UZ_LOCATIONS[loc.id]?.desc || loc.description_en
    }));
  });
  const [guides, setGuides] = useState(initialGuides && initialGuides.length > 0 ? initialGuides : MOCK_GUIDES);
  const [tariffs, setTariffs] = useState(initialTariffs && initialTariffs.length > 0 ? initialTariffs : MOCK_TARIFFS);
  const [vehicles, setVehicles] = useState(initialVehicles && initialVehicles.length > 0 ? initialVehicles : MOCK_VEHICLES);

  const [activeRegion, setActiveRegion] = useState('samarqand'); // 'samarqand', 'buxoro', 'xorazm', 'shahrisabz', 'toshkent', 'qoraqalpoq', or 'cross_region'
  const [crossRegionStart, setCrossRegionStart] = useState('samarqand'); // starting point for cross-region tours
  const [crossRegionLocationFilter, setCrossRegionLocationFilter] = useState('all'); // sub-region browsing filter

  // Constructor States
  const [selectedLocations, setSelectedLocations] = useState([]);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [selectedGuide, setSelectedGuide] = useState(null);

  // Sync region switches, reset selections and apply theme data-attribute
  useEffect(() => {
    setSelectedLocations([]);
    setSelectedVehicle(null);
    setSelectedGuide(null);
    setCrossRegionLocationFilter('all');
    if (typeof document !== 'undefined') {
      document.body.setAttribute('data-region', activeRegion);
      localStorage.setItem('active_region', activeRegion);
    }
  }, [activeRegion]);

  // Reset selected guide & driver when starting region changes in cross-region mode
  useEffect(() => {
    setSelectedVehicle(null);
    setSelectedGuide(null);
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
  }, []);

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
        return [...prev, loc];
      }
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
      locations: selectedLocations.map((loc, idx) => ({
        locationId: loc.id,
        visitOrder: idx + 1,
      })),
      region: activeRegion,
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
              
              <p style={{ fontSize: '15px', color: '#94a3b8', lineHeight: 1.6 }}>
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
              
              <p style={{ fontSize: '15px', color: '#94a3b8', lineHeight: 1.6 }}>
                {t.successSub}
              </p>

              <div style={{
                textAlign: 'left',
                padding: '20px',
                backgroundColor: 'rgba(10, 15, 29, 0.6)',
                borderRadius: '12px',
                border: '1px solid rgba(212, 175, 55, 0.2)',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
                fontSize: '14px'
              }}>
                <h4 style={{ fontWeight: '700', color: '#d4af37', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '6px' }}>
                  {t.successDetailTitle}
                </h4>
                 <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#94a3b8' }}>{t.successGuide}</span>
                  <strong style={{ color: '#fff' }}>
                    {selectedGuide 
                      ? `${selectedGuide.full_name} (${selectedGuideLanguage})` 
                      : (language === 'UZ' ? 'Gidsiz' : language === 'RU' ? 'Без гида' : 'No guide')}
                  </strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#94a3b8' }}>{t.successDriver}</span>
                  <strong style={{ color: '#fff' }}>
                    {selectedVehicle 
                      ? `${selectedVehicle.driver_name} (${selectedVehicle.car_model})` 
                      : (language === 'UZ' ? 'Transportsiz (Faqat marshrut)' : language === 'RU' ? 'Без транспорта' : 'No driver (Itinerary only)')}
                  </strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#94a3b8' }}>{t.successTotal}</span>
                  <strong style={{ color: '#fff' }}>${bookingData?.totalPrice?.toFixed(2)}</strong>
                </div>
                {bookingData?.depositAmount !== undefined && (
                  <>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#94a3b8' }}>
                        {language === 'UZ' ? 'To\'langan depozit (20%):' : language === 'RU' ? 'Оплаченный депозит (20%):' : 'Paid Deposit (20%):'}
                      </span>
                      <strong style={{ color: '#10b981' }}>
                        ${bookingData.depositAmount.toFixed(2)} ({bookingData.paymentMethod?.toUpperCase()})
                      </strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#94a3b8' }}>
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
                  {language === 'UZ' ? 'Orzungizdagi sayohatni bekor qilasizmi?' : language === 'RU' ? 'Отменить поездку вашей мечты?' : 'Cancel Your Dream Trip?'}
                </h3>
                <p style={{ fontSize: '13px', color: '#cbd5e1', lineHeight: 1.6 }}>
                  {language === 'UZ'
                    ? (selectedGuide && selectedVehicle)
                      ? `Sizning tajribali gidingiz (${selectedGuide.full_name}) va haydovchingiz (${selectedVehicle.driver_name}) ushbu kunni aynan siz uchun band qilishgan. Agar bekor qilsangiz, ular kunlik ishidan mahrum bo'lishadi. Ishonchingiz komilmi?`
                      : selectedGuide
                        ? `Sizning tajribali gidingiz (${selectedGuide.full_name}) ushbu kunni aynan siz uchun band qilgan. Agar bekor qilsangiz, u kunlik ishidan mahrum bo'ladi. Ishonchingiz komilmi?`
                        : selectedVehicle
                          ? `Sizning haydovchingiz (${selectedVehicle.driver_name}) ushbu kunni aynan siz uchun band qilgan. Agar bekor qilsangiz, u kunlik ishidan mahrum bo'ladi. Ishonchingiz komilmi?`
                          : `Ushbu sayohat buyurtmasini bekor qilishga ishonchingiz komilmi?`
                    : language === 'RU'
                    ? (selectedGuide && selectedVehicle)
                      ? `Ваш опытный гид (${selectedGuide.full_name}) и водитель (${selectedVehicle.driver_name}) уже забронировали свой день для вас. Если вы отмените, они потеряют этот рабочий день. Вы уверены?`
                      : selectedGuide
                        ? `Ваш опытный гид (${selectedGuide.full_name}) уже забронировал свой день для вас. Если вы отмените, он потеряет этот рабочий день. Вы уверены?`
                        : selectedVehicle
                          ? `Ваш водитель (${selectedVehicle.driver_name}) уже забронировал свой день для вас. Если вы отмените, он потеряет этот рабочий день. Вы уверены?`
                          : `Вы уверены, что хотите отменить это бронирование?`
                    : (selectedGuide && selectedVehicle)
                      ? `Your guide (${selectedGuide.full_name}) and driver (${selectedVehicle.driver_name}) have reserved their day for you. If you cancel, they will lose their schedule. Are you sure you want to cancel?`
                      : selectedGuide
                        ? `Your guide (${selectedGuide.full_name}) has reserved their day for you. If you cancel, they will lose their schedule. Are you sure you want to cancel?`
                        : selectedVehicle
                          ? `Your driver (${selectedVehicle.driver_name}) has reserved their day for you. If you cancel, they will lose their schedule. Are you sure you want to cancel?`
                          : `Are you sure you want to cancel this booking?`}
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
                    backgroundColor: '#d4af37',
                    color: '#0a0f1d'
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

  return (
    <main style={{ width: '100%', minHeight: '100vh', display: 'flex', flexDirection: 'column', position: 'relative' }}>
      <BackgroundGraphics />
      
      {/* 🎬 Ambient Video Background Loop */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: -5,
        overflow: 'hidden',
        pointerEvents: 'none',
        backgroundColor: '#0a0f1d'
      }}>
        <video
          autoPlay
          muted
          loop
          playsInline
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            minWidth: '100%',
            minHeight: '100%',
            width: 'auto',
            height: 'auto',
            transform: 'translate(-50%, -50%)',
            objectFit: 'cover',
            opacity: 0.5,
          }}
        >
          <source src="/videos/bg-loop.mp4" type="video/mp4" />
        </video>
        {/* Subtle vignette overlay for text readability */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'linear-gradient(to bottom, rgba(10,15,29,0.8) 0%, rgba(10,15,29,0.5) 35%, rgba(10,15,29,0.5) 65%, rgba(10,15,29,0.85) 100%)',
          zIndex: 1,
          pointerEvents: 'none',
        }} />
      </div>
      
      {/* 🕌 Premium Header */}
      <header className="glass-container" style={{
        margin: '16px',
        padding: '16px 24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        border: '1px solid rgba(212,175,55,0.15)',
        borderRadius: '16px',
        position: 'sticky',
        top: '16px',
        zIndex: 100
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '8px',
            backgroundColor: 'rgba(212,175,55,0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#d4af37'
          }}>
            <Compass size={20} className="animate-spin" style={{ animationDuration: '20s' }} />
          </div>
          <span style={{ fontSize: '18px', fontWeight: 800, letterSpacing: '0.05em', color: '#fff', display: 'flex', alignItems: 'center', gap: '6px' }}>
            {activeRegion === 'cross_region' ? 'O\'ZBEKISTON' : activeRegion === 'qoraqalpoq' ? 'QORAQALPOQ' : activeRegion === 'toshkent' ? 'TOSHKENT' : activeRegion === 'shahrisabz' ? 'SHAHRISABZ' : activeRegion === 'xorazm' ? 'XORAZM' : activeRegion === 'buxoro' ? 'BUXORO' : 'SAMARQAND'} <span style={{ color: '#d4af37' }}>CRAFTOUR</span>
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* Region Switcher */}
          <div 
            className="no-scrollbar"
            style={{
              display: 'flex',
              backgroundColor: 'rgba(5, 7, 16, 0.4)',
              border: '1px solid rgba(212, 175, 55, 0.25)',
              borderRadius: '12px',
              padding: '3px',
              gap: '2px',
              marginRight: '4px',
              overflowX: 'auto',
              maxWidth: '380px',
              whiteSpace: 'nowrap'
            }}
          >
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
            <button
              onClick={() => setActiveRegion('cross_region')}
              style={{
                padding: '6px 12px',
                borderRadius: '8px',
                border: 'none',
                background: activeRegion === 'cross_region' 
                  ? 'linear-gradient(135deg, #d4af37 0%, #b8860b 100%)' 
                  : 'transparent',
                color: activeRegion === 'cross_region' ? '#0a0f1d' : '#94a3b8',
                fontSize: '12px',
                fontWeight: '700',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: activeRegion === 'cross_region' ? '0 2px 8px rgba(212, 175, 55, 0.4)' : 'none'
              }}
            >
              {language === 'UZ' ? '🇺🇿 Viloyatlararo' : language === 'RU' ? '🇺🇿 Межрегиональный' : '🇺🇿 Cross-Region'}
            </button>
          </div>

          {/* Discover Info Button */}
          <Link
            href={`/discover?region=${activeRegion}`}
            style={{
              padding: '8px 16px',
              borderRadius: '10px',
              backgroundColor: 'rgba(212, 175, 55, 0.1)',
              border: '1px solid rgba(212, 175, 55, 0.25)',
              color: '#d4af37',
              fontSize: '13px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              textDecoration: 'none',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(212, 175, 55, 0.2)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'rgba(212, 175, 55, 0.1)'; }}
          >
            <Info size={14} />
            <span>{language === 'UZ' ? 'Ma\'lumot' : language === 'RU' ? 'Инфо' : 'Discover'}</span>
          </Link>

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
        </div>
      </header>

      {/* 🚀 Main Interface Grid */}
      <div style={{
        flex: 1,
        padding: '0 16px 32px 16px',
        display: 'grid',
        gridTemplateColumns: '1fr',
        gap: '24px',
        maxWidth: '1280px',
        margin: '0 auto',
        width: '100%'
      }}>
        {/* Responsive Grid Setup for Desktop vs Mobile */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '24px',
        }}>
          
          {/* Left Column: Constructor Sidebar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            
            {/* Intro Header - Elevated Hero Section Banner */}
            <div 
              className="glass-container gold-glow"
              style={{ 
                padding: '24px 28px', 
                display: 'flex', 
                flexDirection: 'column', 
                gap: '12px',
                border: '1px solid rgba(212, 175, 55, 0.2)',
                background: 'linear-gradient(135deg, rgba(10, 15, 29, 0.3) 0%, rgba(212, 175, 55, 0.04) 100%)',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              <div style={{
                position: 'absolute',
                top: '-50px',
                right: '-50px',
                width: '150px',
                height: '150px',
                borderRadius: '50%',
                background: 'rgba(212, 175, 55, 0.08)',
                filter: 'blur(30px)',
                pointerEvents: 'none'
              }} />
              
              <h1 style={{ 
                fontSize: '28px', 
                fontWeight: 900, 
                color: '#fff', 
                display: 'flex', 
                alignItems: 'center', 
                gap: '10px',
                margin: 0,
                background: 'linear-gradient(to right, #fff 40%, #fef08a 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                letterSpacing: '-0.02em'
              }}>
                {t.heroTitle} <Sparkles size={22} style={{ color: '#d4af37', flexShrink: 0 }} />
              </h1>
              
              <p style={{ 
                fontSize: '14px', 
                color: '#cbd5e1', 
                lineHeight: 1.6,
                margin: 0,
                fontWeight: '500'
              }}>
                {t.heroSubtitle}
              </p>
            </div>

            {/* 🌤 Live Traveler Info & Weather Banner */}
            {activeRegion === 'cross_region' && (
              <div 
                className="glass-container gold-glow animate-fade-in" 
                style={{
                  padding: '16px 20px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                  border: '1px solid rgba(212, 175, 55, 0.3)',
                  background: 'linear-gradient(135deg, rgba(10, 15, 29, 0.4) 0%, rgba(212, 175, 55, 0.06) 100%)',
                }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '13px', fontWeight: '700', color: '#d4af37', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <MapPin size={14} />
                    <span>{language === 'UZ' ? 'Sayohatni boshlash viloyati (Gid va Transport keladigan shahar):' : language === 'RU' ? 'Регион начала поездки (город отправления гида и транспорта):' : 'Starting Region (Where your guide & transport will start):'}</span>
                  </label>
                  <select
                    value={crossRegionStart}
                    onChange={(e) => setCrossRegionStart(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      backgroundColor: 'rgba(10, 15, 29, 0.8)',
                      border: '1px solid rgba(212, 175, 55, 0.3)',
                      color: '#fff',
                      fontSize: '14px',
                      outline: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    <option value="samarqand" style={{ backgroundColor: '#0f172a' }}>{language === 'UZ' ? 'Samarqand' : language === 'RU' ? 'Самарканд' : 'Samarkand'}</option>
                    <option value="buxoro" style={{ backgroundColor: '#0f172a' }}>{language === 'UZ' ? 'Buxoro' : language === 'RU' ? 'Бухара' : 'Bukhara'}</option>
                    <option value="xorazm" style={{ backgroundColor: '#0f172a' }}>{language === 'UZ' ? 'Xorazm' : language === 'RU' ? 'Хорезм' : 'Khorezm'}</option>
                    <option value="shahrisabz" style={{ backgroundColor: '#0f172a' }}>{language === 'UZ' ? 'Shahrisabz' : language === 'RU' ? 'Шахрисабз' : 'Shahrisabz'}</option>
                    <option value="toshkent" style={{ backgroundColor: '#0f172a' }}>{language === 'UZ' ? 'Toshkent' : language === 'RU' ? 'Ташкент' : 'Tashkent'}</option>
                    <option value="qoraqalpoq" style={{ backgroundColor: '#0f172a' }}>{language === 'UZ' ? 'Qoraqalpog\'iston' : language === 'RU' ? 'Каракалпакстан' : 'Karakalpakstan'}</option>
                  </select>
                </div>
              </div>
            )}

            <div 
              className="glass-container gold-glow" 
              style={{
                padding: '16px 20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '16px',
                border: '1px solid rgba(212, 175, 55, 0.25)',
                borderRadius: '16px'
              }}
            >
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
                  <span style={{ fontSize: '15px', fontWeight: '800', color: '#fff' }}>
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
                  backgroundColor: '#d4af37',
                  color: '#0a0f1d',
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
              <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#fff' }}>{t.step1}</h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#94a3b8' }}>
                <AlertCircle size={12} style={{ color: '#009b9e' }} />
                <span>{t.disclaimer}</span>
              </div>
              <div style={{ display: 'flex', gap: '16px', alignItems: 'center', fontSize: '13px', fontWeight: '600', color: '#fff', flexWrap: 'wrap' }}>
                <div>
                  {t.selectedCount} <span style={{ color: '#d4af37', backgroundColor: 'rgba(212,175,55,0.1)', padding: '2px 8px', borderRadius: '10px' }}>{selectedLocations.length}</span>
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
                    borderBottom: '1px solid rgba(255,255,255,0.08)',
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
                          border: isSelected ? '1px solid #d4af37' : '1px solid rgba(255,255,255,0.08)',
                          background: isSelected 
                            ? 'linear-gradient(135deg, #d4af37 0%, #b8860b 100%)' 
                            : 'rgba(255, 255, 255, 0.05)',
                          color: isSelected ? '#0a0f1d' : '#94a3b8',
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
              <RouteBuilder
                locations={filteredLocations}
                selectedLocations={selectedLocations}
                onToggleLocation={handleToggleLocation}
                language={language}
              />
            </section>

            {/* Step 2: Vehicle Selection */}
            <section style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#fff' }}>{t.step2}</h2>
              <VehicleSelector
                vehicles={filteredVehicles}
                selectedVehicleId={selectedVehicle?.id}
                onSelectVehicle={handleSelectVehicle}
                isOutOfCityRoute={isOutOfCityRoute}
                language={language}
              />
            </section>

            {/* Step 3: Guide Selection */}
            <section style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#fff' }}>{t.step3}</h2>
              <GuideSelector
                guides={filteredGuides}
                tariffs={tariffs}
                selectedGuideId={selectedGuide?.id}
                selectedGuideLanguage={selectedGuideLanguage}
                onSelectGuide={handleSelectGuide}
                onSelectGuideLanguage={handleSelectGuideLanguage}
                language={language}
              />
            </section>

            {/* Step 4: Checkout & invoice */}
            <section style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#fff' }}>{t.step4}</h2>
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
              />
            </section>

          </div>

          {/* Right Column: Sticky Interactive Map */}
          <div style={{
            position: 'relative',
          }}>
            <div style={{
              position: 'sticky',
              top: '110px',
              height: 'calc(100vh - 150px)',
              minHeight: '450px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#d4af37', fontWeight: '600', fontSize: '14px' }}>
                <MapPin size={16} />
                <span>Interactive Route Visualizer</span>
              </div>
              <Map
                locations={activeRegion === 'cross_region' ? locations : filteredLocations}
                selectedLocations={selectedLocations}
                language={language}
                activeRegion={activeRegion}
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

      <footer style={{
        marginTop: 'auto',
        padding: '24px 16px',
        borderTop: '1px solid rgba(212, 175, 55, 0.1)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        maxWidth: '1280px',
        width: '100%',
        margin: '40px auto 0 auto',
        fontSize: '13px',
        color: '#64748b'
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
            color: '#64748b',
            textDecoration: 'none',
            opacity: 0.5,
            transition: 'opacity 0.2s, color 0.2s',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.opacity = 1; e.currentTarget.style.color = '#d4af37'; }}
          onMouseLeave={(e) => { e.currentTarget.style.opacity = 0.5; e.currentTarget.style.color = '#64748b'; }}
        >
          <Lock size={12} />
          <span>{language === 'RU' ? 'Панель администратора' : 'Admin Portal'}</span>
        </a>
      </footer>
    </main>
  );
}
