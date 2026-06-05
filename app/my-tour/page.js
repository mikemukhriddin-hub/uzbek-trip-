'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  CheckCircle, 
  XCircle, 
  Compass, 
  Loader2, 
  Languages, 
  Calendar, 
  User, 
  Car, 
  MapPin, 
  DollarSign, 
  Phone,
  HelpCircle,
  Coins
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

function MyTourContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get('id');
  const token = searchParams.get('token');

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [language, setLanguage] = useState('UZ'); // Default to UZ
  const [showLangDropdown, setShowLangDropdown] = useState(false);

  // Cancel flow states
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [bookingCancelled, setBookingCancelled] = useState(false);

  useEffect(() => {
    // Sync state loaded from localStorage if user has a preference saved
    const savedLang = localStorage.getItem('site_lang');
    setTimeout(() => {
      if (savedLang) {
        setLanguage(savedLang);
      } else {
        // Auto-detect browser language
        const browserLang = typeof navigator !== 'undefined' ? (navigator.language || navigator.userLanguage || '') : '';
        let defaultLang = 'UZ';
        if (browserLang.toLowerCase().startsWith('ru')) {
          defaultLang = 'RU';
        } else if (browserLang.toLowerCase().startsWith('en')) {
          defaultLang = 'EN';
        }
        setLanguage(defaultLang);
      }
    }, 0);
  }, []);

  useEffect(() => {
    if (!id || !token) {
      Promise.resolve().then(() => {
        const msg = language === 'UZ' 
          ? 'Yaroqsiz yoki yetishmayotgan tur parametrlari.' 
          : language === 'RU' 
            ? 'Неверные или отсутствующие параметры тура.' 
            : 'Invalid or missing tour parameters.';
        setErrorMsg(msg);
        setLoading(false);
      });
      return;
    }

    fetch(`/api/bookings/my-tour?id=${id}&token=${token}`)
      .then(async (res) => {
        const data = await res.json();
        if (res.ok) {
          setBooking(data);
          const savedLang = localStorage.getItem('site_lang');
          if (!savedLang && data.customer_language) {
            setLanguage(data.customer_language);
          }
        } else {
          let msg = data.message;
          if (data.message === 'Missing booking ID or token.') {
            msg = language === 'UZ' 
              ? 'Buyurtma ID si yoki tokeni kiritilmagan.' 
              : language === 'RU' 
                ? 'Отсутствует ID бронирования или токен.' 
                : 'Missing booking ID or token.';
          } else if (data.message === 'Booking not found.') {
            msg = language === 'UZ' 
              ? 'Buyurtma topilmadi.' 
              : language === 'RU' 
                ? 'Бронирование не найдено.' 
                : 'Booking not found.';
          } else if (data.message === 'Invalid or expired token.') {
            msg = language === 'UZ' 
              ? 'Yaroqsiz yoki muddati o\'tgan token.' 
              : language === 'RU' 
                ? 'Недействительный или истекший токен.' 
                : 'Invalid or expired token.';
          }
          setErrorMsg(msg || (language === 'UZ' ? 'Buyurtma ma\'lumotlarini yuklab bo\'lmadi.' : language === 'RU' ? 'Не удалось загрузить детали бронирования.' : 'Failed to load booking details.'));
        }
      })
      .catch((err) => {
        setErrorMsg(language === 'UZ' ? 'Aloqa xatosi: ' + err.message : language === 'RU' ? 'Ошибка соединения: ' + err.message : 'Connection error: ' + err.message);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [id, token, language]);

  const handleCancelBooking = async () => {
    setIsCancelling(true);
    try {
      const res = await fetch('/api/bookings/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId: id, token }),
      });
      if (res.ok) {
        setBookingCancelled(true);
        setBooking(prev => ({ ...prev, status: 'cancelled' }));
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
    title: language === 'UZ' ? 'Sayohatim tafsilotlari' : language === 'RU' ? 'Детали моей поездки' : 'My Custom Tour Details',
    notFound: language === 'UZ' ? 'Buyurtma topilmadi yoki havola muddati tugagan.' : language === 'RU' ? 'Заказ не найден или срок действия ссылки истек.' : 'Booking not found or magic link has expired.',
    status: language === 'UZ' ? 'Holat:' : language === 'RU' ? 'Статус:' : 'Status:',
    touristName: language === 'UZ' ? 'Sayyoh ismi:' : language === 'RU' ? 'Имя туриста:' : 'Tourist Name:',
    travelDate: language === 'UZ' ? 'Sayohat sanasi:' : language === 'RU' ? 'Дата поездки:' : 'Travel Date:',
    routeSights: language === 'UZ' ? 'Marshrut:' : language === 'RU' ? 'Маршрут:' : 'Route Sights:',
    guideTitle: language === 'UZ' ? 'Sizning gidingiz:' : language === 'RU' ? 'Ваш гид:' : 'Your Guide:',
    driverTitle: language === 'UZ' ? 'Sizning haydovchingiz:' : language === 'RU' ? 'Ваш водитель:' : 'Your Driver:',
    carModel: language === 'UZ' ? 'Transport:' : language === 'RU' ? 'Автомобиль:' : 'Vehicle:',
    estimatedCost: language === 'UZ' ? 'Umumiy qiymat:' : language === 'RU' ? 'Итоговая стоимость:' : 'Estimated Cost:',
    cancelBtn: language === 'UZ' ? 'Ushbu buyurtmani bekor qilish' : language === 'RU' ? 'Отменить это бронирование' : 'Cancel My Booking',
    backBtn: language === 'UZ' ? 'Bosh sahifaga' : language === 'RU' ? 'На главную' : 'Back to Home',
    cancelConfirmTitle: language === 'UZ' ? 'Orzungizdagi sayohatni bekor qilasizmi?' : language === 'RU' ? 'Отменить поездку вашей мечты?' : 'Cancel Your Dream Trip?',
    cancelConfirmDesc: language === 'UZ'
      ? (booking?.guide && booking?.vehicle)
        ? `Sizning gidingiz (${booking.guide.full_name}) va haydovchingiz (${booking.vehicle.driver_name}) ushbu kunni aynan siz uchun band qilishgan. Agar bekor qilsangiz, ular ish kunini yo'qotishadi. Ishonchingiz komilmi?`
        : booking?.guide
          ? `Sizning gidingiz (${booking.guide.full_name}) ushbu kunni aynan siz uchun band qilgan. Agar bekor qilsangiz, u ish kunini yo'qotadi. Ishonchingiz komilmi?`
          : booking?.vehicle
            ? `Sizning haydovchingiz (${booking.vehicle.driver_name}) ushbu kunni aynan siz uchun band qilgan. Agar bekor qilsangiz, u ish kunini yo'qotadi. Ishonchingiz komilmi?`
            : `Ushbu sayohat buyurtmasini bekor qilishga ishonchingiz komilmi?`
      : language === 'RU' 
      ? (booking?.guide && booking?.vehicle)
        ? `Ваш гид (${booking.guide.full_name}) и водитель (${booking.vehicle.driver_name}) забронировали этот день специально для вас. Если вы отмените, они останутся без работы. Вы уверены?`
        : booking?.guide
          ? `Ваш гид (${booking.guide.full_name}) забронировал этот день специально для вас. Если вы отмените, он останется без работы. Вы уверены?`
          : booking?.vehicle
            ? `Ваш водитель (${booking.vehicle.driver_name}) забронировал этот день специально для вас. Если вы отмените, он останется без работы. Вы уверены?`
            : `Вы уверены, что хотите отменить это бронирование?`
      : (booking?.guide && booking?.vehicle)
        ? `Your guide (${booking.guide.full_name}) and driver (${booking.vehicle.driver_name}) have reserved their day for you. If you cancel, they will lose their schedule. Are you sure you want to cancel?`
        : booking?.guide
          ? `Your guide (${booking.guide.full_name}) has reserved their day for you. If you cancel, they will lose their schedule. Are you sure you want to cancel?`
          : booking?.vehicle
            ? `Your driver (${booking.vehicle.driver_name}) has reserved their day for you. If you cancel, they will lose their schedule. Are you sure you want to cancel?`
            : `Are you sure you want to cancel this booking?`,
    cancelKeep: language === 'UZ' ? 'Yo\'q, bandlikni saqlash' : language === 'RU' ? 'Нет, сохранить бронь' : 'No, Keep My Booking',
    cancelConfirmYes: language === 'UZ' ? 'Ha, buyurtmani bekor qilish' : language === 'RU' ? 'Да, отменить бронирование' : 'Yes, Cancel Booking',
    cancelSuccess: language === 'UZ' ? 'Buyurtma muvaffaqiyatli bekor qilindi.' : language === 'RU' ? 'Бронирование успешно отменено.' : 'Booking successfully cancelled.',
  };

  if (loading) {
    return (
      <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#0a0f1d', color: '#fff' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
          <Loader2 size={32} className="animate-spin" style={{ color: '#d4af37' }} />
          <span style={{ fontSize: '14px', color: '#94a3b8' }}>Loading tour details...</span>
        </div>
      </main>
    );
  }

  if (errorMsg || !booking) {
    return (
      <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', backgroundColor: '#0a0f1d' }}>
        <div className="glass-container gold-glow" style={{ width: '100%', maxWidth: '480px', padding: '36px', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <XCircle size={44} style={{ color: '#ef4444', margin: '0 auto' }} />
          <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#fff' }}>Error</h3>
          <p style={{ fontSize: '14px', color: '#94a3b8', lineHeight: 1.5 }}>
            {errorMsg || t.notFound}
          </p>
          <Link href="/" className="btn-gold" style={{ padding: '10px 20px', display: 'inline-block', textDecoration: 'none', alignSelf: 'center', fontSize: '13px' }}>
            {t.backBtn}
          </Link>
        </div>
      </main>
    );
  }

  const colors = getStatusColor(booking.status);
  const showCancelOption = booking.status === 'confirmed' || booking.status === 'pending';

  return (
    <main style={{ minHeight: '100vh', padding: '40px 24px', backgroundColor: '#0a0f1d', color: '#fff', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      
      {/* Header */}
      <header style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        width: '100%', 
        maxWidth: '600px', 
        marginBottom: '32px' 
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Compass size={28} style={{ color: '#d4af37' }} />
          <span style={{ fontSize: '20px', fontWeight: 800, letterSpacing: '0.05em' }}>
            SAMARQAND <span style={{ color: '#d4af37' }}>CRAFTOUR</span>
          </span>
        </div>

        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setShowLangDropdown(!showLangDropdown)}
            style={{
              padding: '6px 12px',
              borderRadius: '8px',
              backgroundColor: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              color: '#fff',
              fontSize: '12px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.2s ease'
            }}
          >
            <Languages size={12} style={{ color: '#d4af37' }} />
            <span>{language === 'EN' ? '🇬🇧 EN' : language === 'RU' ? '🇷🇺 RU' : '🇺🇿 UZ'}</span>
          </button>
          {showLangDropdown && (
            <div style={{
              position: 'absolute',
              top: 'calc(100% + 6px)',
              right: 0,
              backgroundColor: '#0f172a',
              border: '1px solid rgba(212,175,55,0.25)',
              borderRadius: '8px',
              padding: '4px',
              zIndex: 1000,
              boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
              display: 'flex',
              flexDirection: 'column',
              gap: '2px',
              minWidth: '120px'
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
                    padding: '6px 10px',
                    border: 'none',
                    background: language === langCode ? 'rgba(212,175,55,0.1)' : 'transparent',
                    color: language === langCode ? '#d4af37' : '#94a3b8',
                    textAlign: 'left',
                    fontSize: '12px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    borderRadius: '4px',
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
      </header>

      {/* Main Container */}
      <div className="glass-container gold-glow" style={{ width: '100%', maxWidth: '600px', padding: '32px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '16px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#fff' }}>{t.title}</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '13px', color: '#94a3b8' }}>{t.status}</span>
            <span style={{ 
              padding: '4px 10px', 
              borderRadius: '8px', 
              fontSize: '12px', 
              fontWeight: '700', 
              color: colors.text, 
              backgroundColor: colors.bg, 
              border: `1px solid ${colors.border}`,
              textTransform: 'uppercase'
            }}>
              {booking.status}
            </span>
          </div>
        </div>

        {bookingCancelled && (
          <div style={{ 
            padding: '12px 16px', 
            borderRadius: '8px', 
            backgroundColor: 'rgba(239, 68, 68, 0.1)', 
            border: '1px solid rgba(239, 68, 68, 0.2)', 
            color: '#ef4444', 
            fontSize: '13px',
            textAlign: 'center'
          }}>
            {t.cancelSuccess}
          </div>
        )}

        {/* Tourist details */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '14px' }}>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <User size={16} style={{ color: '#d4af37' }} />
            <span style={{ color: '#94a3b8', width: '110px' }}>{t.touristName}</span>
            <strong style={{ color: '#fff' }}>{booking.tourist_name}</strong>
          </div>
          
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <Calendar size={16} style={{ color: '#d4af37' }} />
            <span style={{ color: '#94a3b8', width: '110px' }}>{t.travelDate}</span>
            <strong style={{ color: '#fff' }}>{booking.booking_date} ({booking.customer_language})</strong>
          </div>
        </div>

        {/* Route Sights */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '14px' }}>
          <span style={{ color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <MapPin size={16} style={{ color: '#d4af37' }} />
            {t.routeSights}
          </span>
          <div style={{ paddingLeft: '24px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {booking.booking_items?.sort((a,b) => a.visit_order - b.visit_order).map((item, idx) => (
              <div key={idx} style={{ color: '#e2e8f0' }}>
                {item.visit_order}. {language === 'UZ' ? (item.location?.name_uz || item.location?.name_en) : language === 'RU' ? item.location?.name_ru : item.location?.name_en}
              </div>
            )) || <span style={{ color: '#64748b' }}>None</span>}
          </div>
        </div>

        {/* Guide & Driver card */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', backgroundColor: 'rgba(10,15,29,0.5)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.04)' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <span style={{ fontSize: '12px', color: '#94a3b8' }}>{t.guideTitle}</span>
            <strong style={{ fontSize: '14px', color: '#fff' }}>
              {booking.guide ? booking.guide.full_name : (language === 'UZ' ? 'Gidsiz sayohat' : language === 'RU' ? 'Без гида' : 'No Guide')}
            </strong>
            {booking.guide?.phone_number && (
              <span style={{ fontSize: '12px', color: '#009b9e' }}>📞 {booking.guide.phone_number}</span>
            )}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', borderLeft: '1px solid rgba(255,255,255,0.08)', paddingLeft: '16px' }}>
            <span style={{ fontSize: '12px', color: '#94a3b8' }}>{t.driverTitle}</span>
            <strong style={{ fontSize: '14px', color: '#fff' }}>
              {booking.vehicle ? booking.vehicle.driver_name : (language === 'UZ' ? 'Transportsiz sayohat' : language === 'RU' ? 'Без транспорта' : 'No Vehicle')}
            </strong>
            {booking.vehicle ? (
              <>
                <span style={{ fontSize: '11px', color: '#cbd5e1' }}>{t.carModel} {booking.vehicle.car_model}</span>
                {booking.vehicle.driver_phone && (
                  <span style={{ fontSize: '12px', color: '#009b9e' }}>📞 {booking.vehicle.driver_phone}</span>
                )}
              </>
            ) : null}
          </div>
        </div>

        {/* Payment Summary */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          backgroundColor: 'rgba(255, 255, 255, 0.02)',
          padding: '16px',
          borderRadius: '12px',
          border: '1px solid rgba(255, 255, 255, 0.05)',
          fontSize: '13px'
        }}>
          <h4 style={{ margin: '0 0 6px 0', fontSize: '14px', color: '#d4af37', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Coins size={15} />
            {language === 'UZ' ? 'To\'lov hisoboti' : language === 'RU' ? 'Платежный баланс' : 'Payment Summary'}
          </h4>
          
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: '#94a3b8' }}>
              {language === 'UZ' ? 'To\'lov holati:' : language === 'RU' ? 'Статус оплаты:' : 'Payment Status:'}
            </span>
            <span style={{
              padding: '2px 8px',
              borderRadius: '6px',
              fontWeight: '700',
              fontSize: '11px',
              backgroundColor: booking.payment_status === 'deposit_paid' ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)',
              color: booking.payment_status === 'deposit_paid' ? '#10b981' : '#ef4444',
              border: booking.payment_status === 'deposit_paid' ? '1px solid rgba(16, 185, 129, 0.2)' : '1px solid rgba(239, 68, 68, 0.2)',
              textTransform: 'uppercase'
            }}>
              {booking.payment_status === 'deposit_paid' 
                ? (language === 'UZ' ? 'Depozit to\'langan (20%)' : language === 'RU' ? 'Депозит оплачен (20%)' : 'Deposit Paid (20%)')
                : (language === 'UZ' ? 'To\'lanmagan' : language === 'RU' ? 'Не оплачено' : 'Unpaid')
              }
            </span>
          </div>

          {booking.payment_status === 'deposit_paid' && (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#94a3b8' }}>
                  {language === 'UZ' ? 'To\'langan depozit:' : language === 'RU' ? 'Оплаченный депозит:' : 'Deposit Paid:'}
                </span>
                <strong style={{ color: '#10b981' }}>
                  ${parseFloat(booking.deposit_amount || 0).toFixed(2)} 
                  <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '500', marginLeft: '4px' }}>
                    ({booking.payment_method?.toUpperCase()})
                  </span>
                </strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#94a3b8' }}>
                  {language === 'UZ' ? 'Qoldiq (joyida to\'lanadi):' : language === 'RU' ? 'Остаток (оплата наличными):' : 'Remaining Balance (to guide/driver):'}
                </span>
                <strong style={{ color: '#fbbf24' }}>
                  ${(parseFloat(booking.total_price) - parseFloat(booking.deposit_amount || 0)).toFixed(2)}
                </strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#64748b' }}>
                <span>Tx ID:</span>
                <span>{booking.payment_tx_id || 'N/A'}</span>
              </div>
            </>
          )}
        </div>

        {/* Cost and Actions */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '16px' }}>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '12px', color: '#94a3b8' }}>{t.estimatedCost}</span>
            <strong style={{ fontSize: '20px', color: '#d4af37', textShadow: '0 0 10px rgba(212,175,55,0.3)' }}>${parseFloat(booking.total_price).toFixed(2)}</strong>
          </div>
          
          <Link href="/" style={{ padding: '10px 20px', border: '1px solid rgba(255,255,255,0.08)', backgroundColor: 'rgba(255,255,255,0.02)', color: '#fff', borderRadius: '10px', textDecoration: 'none', fontSize: '13px', fontWeight: '500' }}>
            {t.backBtn}
          </Link>
        </div>

        {/* Cancel trigger */}
        {showCancelOption && !bookingCancelled && (
          <div style={{ textAlign: 'center', borderTop: '1px solid rgba(255,255,255,0.04)', paddingTop: '16px' }}>
            <button
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
              {t.cancelBtn}
            </button>
          </div>
        )}

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
                {t.cancelConfirmTitle}
              </h3>
              <p style={{ fontSize: '13px', color: '#cbd5e1', lineHeight: 1.6 }}>
                {t.cancelConfirmDesc}
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
                {t.cancelKeep}
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
                {isCancelling ? (language === 'UZ' ? 'Bekor qilinmoqda...' : language === 'RU' ? 'Отмена...' : 'Cancelling...') : t.cancelConfirmYes}
              </button>
            </div>
          </div>
        </div>
      )}

    </main>
  );
}

export default function MyTourPage() {
  return (
    <Suspense fallback={
      <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#0a0f1d' }}>
        <Loader2 size={32} className="animate-spin" style={{ color: '#d4af37' }} />
      </main>
    }>
      <MyTourContent />
    </Suspense>
  );
}
