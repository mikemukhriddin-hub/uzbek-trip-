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
import CheckoutForm from '@/components/CheckoutForm';
import VerificationModal from '@/components/VerificationModal';
import BackgroundGraphics from '@/components/BackgroundGraphics';
import PaymentPortal from '@/components/PaymentPortal';

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

const UZ_LOCATIONS = {
  1: { name: 'Registon maydoni', desc: 'Uchta muhtasham madrasadan iborat qadimiy Samarqandning yuragi.' },
  2: { name: 'Go\'ri Amir maqbarasi', desc: 'Amir Temur (Tamerlan) ning so\'nggi qo\'nim topgan joyi, me\'moriy durdona.' },
  3: { name: 'Shohi Zinda', desc: 'Moviy gumbazli maqbaralardan iborat hayratlanarli xiyobon.' },
  4: { name: 'Bibi Xonim masjidi', desc: 'Amir Temurning sevimli rafiqasi sharafiga qurilgan XV asrning eng yirik masjidlaridan biri.' },
  5: { name: 'Ulug\'bek rasadxonasi', desc: '1420-yilda qurilgan ushbu rasadxona islom dunyosining ajoyib mo\'jizalaridan biri bo\'lgan.' },
  6: { name: 'Urgut tog\' bozori va adirlari', desc: 'Bozorda an\'anaviy hunarmandchilik bilan tanishing va Urgutning go\'zal tog\' tizmalari bo\'ylab sayr qiling.' },
  7: { name: 'Omonqo\'ton dovoni va qarag\'aylari', desc: 'Qadimiy g\'orlar va toza buloqlarga ega muhtasham qarag\'ayzor hamda tog\' dovoni.' },
  8: { name: 'Konigil qog\'oz fabrikasi', desc: 'Samarqand tut qog\'ozini tayyorlashning qadimiy san\'atini namoyish etuvchi tinch eko-qishloq.' },
  9: { name: 'Milliy palov markazi', desc: 'Katta qozonlarda an\'anaviy retseptlar bo\'yicha tayyorlangan haqiqiy Samarqand palovi.' },
  10: { name: 'Samarqand nonvoyxonasi', desc: 'Nonvoylar tandirda mashhur, yaltiroq Samarqand nonlarini yopishini kuzating.' },
  11: { name: 'Karimbek restorani', desc: 'An\'anaviy kabob, manti va jonli milliy musiqa taklif etuvchi ajoyib restoran.' }
};

export default function Home() {
  const [language, setLanguage] = useState('EN'); // Site UI Language
  const [showLangDropdown, setShowLangDropdown] = useState(false);
  const [locations, setLocations] = useState(() => {
    return MOCK_LOCATIONS.map(loc => ({
      ...loc,
      name_uz: loc.name_uz || UZ_LOCATIONS[loc.id]?.name || loc.name_en,
      description_uz: loc.description_uz || UZ_LOCATIONS[loc.id]?.desc || loc.description_en
    }));
  });
  const [guides, setGuides] = useState(MOCK_GUIDES);
  const [tariffs, setTariffs] = useState(MOCK_TARIFFS);
  const [vehicles, setVehicles] = useState(MOCK_VEHICLES);
  
  // Constructor States
  const [selectedLocations, setSelectedLocations] = useState([]);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [selectedGuide, setSelectedGuide] = useState(null);
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
    }
  }, []);

  // Fetch initial data from database on mount (falls back to mock if not configured)
  useEffect(() => {
    const fetchData = async () => {
      try {
        const resL = await fetch('/api/locations');
        if (resL.ok) {
          const data = await resL.json();
          if (data && data.length > 0) {
            const enriched = data.map(loc => ({
              ...loc,
              name_uz: loc.name_uz || UZ_LOCATIONS[loc.id]?.name || loc.name_en,
              description_uz: loc.description_uz || UZ_LOCATIONS[loc.id]?.desc || loc.description_en
            }));
            setLocations(enriched);
          }
        }
        const resG = await fetch('/api/guides');
        if (resG.ok) {
          const data = await resG.json();
          if (data && data.guides) {
            setGuides(data.guides);
            setTariffs(data.tariffs);
          }
        }
        const resV = await fetch('/api/vehicles');
        if (resV.ok) {
          const data = await resV.json();
          if (data && data.length > 0) setVehicles(data);
        }
      } catch (err) {
        console.warn("Failed fetching from Supabase API, using offline mock datasets.", err);
      }
    };
    fetchData();
  }, []);

  // Update selected guide language automatically if guide list resets
  useEffect(() => {
    Promise.resolve().then(() => {
      setSelectedGuide(null);
    });
  }, [selectedGuideLanguage]);

  // Determine if route includes any mountain/out-of-city zones
  const isOutOfCityRoute = selectedLocations.some((loc) => loc.is_out_of_city);

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
      guideId: selectedGuide?.id,
      vehicleId: selectedVehicle?.id,
      totalPrice: formData.totalPrice,
      customerLanguage: language,
      passengerCount: formData.passengerCount || 1,
      bookingType: formData.bookingType || 'private',
      locations: selectedLocations.map((loc, idx) => ({
        locationId: loc.id,
        visitOrder: idx + 1,
      })),
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
        otpCode: data.otpCode
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
      setPaymentOpen(true);
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
        body: JSON.stringify({ bookingId: createdBookingId }),
      });
      if (res.ok) {
        setBookingCancelled(true);
        setShowCancelConfirm(false);
      } else {
        const d = await res.json();
        alert(d.message || 'Failed to cancel booking.');
      }
    } catch (err) {
      alert(`Error: ${err.message}`);
    } finally {
      setIsCancelling(false);
    }
  };

  const t = {
    heroTitle: language === 'RU' ? 'Самарканд CrafTour' : 'Samarqand CrafTour',
    heroSubtitle: language === 'UZ'
      ? 'Afsonaviy Samarqand bo\'ylab shaxsiy sayohatingizni o\'zingiz yarating'
      : language === 'RU' 
      ? 'Сконструируйте собственное идеальное путешествие в легендарный Самарканд'
      : 'Craft your own tailor-made adventure in legendary Samarkand',
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
                  ? selectedGuide
                    ? `Sayohat bekor qilindi. Gidingiz ${selectedGuide.full_name} va haydovchingiz ${selectedVehicle?.driver_name} bu haqda ogohlantirildi.`
                    : `Sayohat bekor qilindi. Haydovchingiz ${selectedVehicle?.driver_name} bu haqda ogohlantirildi.`
                  : language === 'RU'
                  ? selectedGuide
                    ? `Поездка отменена. Ваш гид ${selectedGuide.full_name} и водитель ${selectedVehicle?.driver_name} были оповещены и освобождены.`
                    : `Поездка отменена. Ваш водитель ${selectedVehicle?.driver_name} был оповещен и освобожден.`
                  : selectedGuide
                    ? `Your trip has been cancelled. Your guide ${selectedGuide.full_name} and driver ${selectedVehicle?.driver_name} have been notified.`
                    : `Your trip has been cancelled. Your driver ${selectedVehicle?.driver_name} has been notified.`}
              </p>
            </>
          ) : (
            <>
              <div style={{
                width: '72px',
                height: '72px',
                borderRadius: '50%',
                backgroundColor: 'rgba(16, 185, 129, 0.15)',
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
                  <strong style={{ color: '#fff' }}>{selectedVehicle?.driver_name} ({selectedVehicle?.car_model})</strong>
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
                    ? selectedGuide
                      ? `Sizning tajribali gidingiz (${selectedGuide.full_name}) va haydovchingiz (${selectedVehicle?.driver_name}) ushbu kunni aynan siz uchun band qilishgan. Agar bekor qilsangiz, ular kunlik ishidan mahrum bo'lishadi. Ishonchingiz komilmi?`
                      : `Sizning haydovchingiz (${selectedVehicle?.driver_name}) ushbu kunni aynan siz uchun band qilgan. Agar bekor qilsangiz, u kunlik ishidan mahrum bo'ladi. Ishonchingiz komilmi?`
                    : language === 'RU'
                    ? selectedGuide
                      ? `Ваш опытный гид (${selectedGuide.full_name}) и водитель (${selectedVehicle?.driver_name}) уже забронировали свой день для вас. Если вы отмените, они потеряют этот рабочий день. Вы уверены?`
                      : `Ваш водитель (${selectedVehicle?.driver_name}) уже забронировал свой день для вас. Если вы отмените, он потеряет этот рабочий день. Вы уверены?`
                    : selectedGuide
                      ? `Your guide (${selectedGuide.full_name}) and driver (${selectedVehicle?.driver_name}) have reserved their day for you. If you cancel, they will lose their schedule. Are you sure you want to cancel?`
                      : `Your driver (${selectedVehicle?.driver_name}) has reserved their day for you. If you cancel, they will lose their schedule. Are you sure you want to cancel?`}
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
    <main style={{ width: '100%', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <BackgroundGraphics />
      
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
            SAMARQAND <span style={{ color: '#d4af37' }}>CRAFTOUR</span>
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* Discover Info Button */}
          <Link
            href="/discover"
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
            
            {/* Intro Header */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                {t.heroTitle} <Sparkles size={20} style={{ color: '#d4af37' }} />
              </h1>
              <p style={{ fontSize: '14px', color: '#94a3b8', lineHeight: 1.5 }}>
                {t.heroSubtitle}
              </p>
            </div>

            {/* 🌤 Live Traveler Info & Weather Banner */}
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
                backgroundColor: 'rgba(18, 26, 47, 0.45)',
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
                    {language === 'UZ' ? 'Bugun Samarqandda: 28°C' : language === 'RU' ? 'Самарканд сегодня: 28°C' : 'Samarkand Today: 28°C'}
                  </span>
                  <span style={{ fontSize: '12px', color: '#009b9e', fontWeight: '500' }}>
                    {language === 'UZ' ? '☀️ Havo ochiq va quyoshli' : language === 'RU' ? '☀️ Ясно, солнечно и тепло' : '☀️ Clear skies & sunny forecast'}
                  </span>
                </div>
              </div>
              
              <Link
                href="/discover"
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
              <div style={{ fontSize: '13px', fontWeight: '600', color: '#fff' }}>
                {t.selectedCount} <span style={{ color: '#d4af37', backgroundColor: 'rgba(212,175,55,0.1)', padding: '2px 8px', borderRadius: '10px' }}>{selectedLocations.length}</span>
              </div>
              <RouteBuilder
                locations={locations}
                selectedLocations={selectedLocations}
                onToggleLocation={handleToggleLocation}
                language={language}
              />
            </section>

            {/* Step 2: Vehicle Selection */}
            <section style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#fff' }}>{t.step2}</h2>
              <VehicleSelector
                vehicles={vehicles}
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
                guides={guides}
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
                locations={locations}
                selectedLocations={selectedLocations}
                language={language}
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
          © {new Date().getFullYear()} Samarqand CrafTour. {language === 'RU' ? 'Все права защищены.' : 'All rights reserved.'}
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
