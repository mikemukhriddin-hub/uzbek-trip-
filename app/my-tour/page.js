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
  HelpCircle
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
  const [language, setLanguage] = useState('EN');

  // Cancel flow states
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [bookingCancelled, setBookingCancelled] = useState(false);

  useEffect(() => {
    if (!id || !token) {
      Promise.resolve().then(() => {
        setErrorMsg('Invalid or missing tour parameters.');
        setLoading(false);
      });
      return;
    }

    fetch(`/api/bookings/my-tour?id=${id}&token=${token}`)
      .then(async (res) => {
        const data = await res.json();
        if (res.ok) {
          setBooking(data);
          setLanguage(data.customer_language || 'EN');
        } else {
          setErrorMsg(data.message || 'Failed to load booking details.');
        }
      })
      .catch((err) => {
        setErrorMsg('Connection error: ' + err.message);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [id, token]);

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
        alert(d.message || 'Failed to cancel booking.');
      }
    } catch (err) {
      alert(`Error: ${err.message}`);
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
      ? `Sizning gidingiz (${booking?.guide?.full_name || 'N/A'}) va haydovchingiz (${booking?.vehicle?.driver_name || 'N/A'}) ushbu kunni aynan siz uchun band qilishgan. Agar bekor qilsangiz, ular ish kunini yo'qotishadi. Ishonchingiz komilmi?`
      : language === 'RU' 
      ? `Ваш гид (${booking?.guide?.full_name || 'N/A'}) и водитель (${booking?.vehicle?.driver_name || 'N/A'}) забронировали этот день специально для вас. Если вы отмените, они останутся без работы. Вы уверены?`
      : `Your guide (${booking?.guide?.full_name || 'N/A'}) and driver (${booking?.vehicle?.driver_name || 'N/A'}) have reserved their day for you. If you cancel, they will lose their schedule. Are you sure you want to cancel?`,
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
      <header style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '32px' }}>
        <Compass size={28} style={{ color: '#d4af37' }} />
        <span style={{ fontSize: '20px', fontWeight: 800, letterSpacing: '0.05em' }}>
          SAMARQAND <span style={{ color: '#d4af37' }}>CRAFTOUR</span>
        </span>
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
            <strong style={{ fontSize: '14px', color: '#fff' }}>{booking.guide?.full_name || 'N/A'}</strong>
            {booking.guide?.phone_number && (
              <span style={{ fontSize: '12px', color: '#009b9e' }}>📞 {booking.guide.phone_number}</span>
            )}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', borderLeft: '1px solid rgba(255,255,255,0.08)', paddingLeft: '16px' }}>
            <span style={{ fontSize: '12px', color: '#94a3b8' }}>{t.driverTitle}</span>
            <strong style={{ fontSize: '14px', color: '#fff' }}>{booking.vehicle?.driver_name || 'N/A'}</strong>
            <span style={{ fontSize: '11px', color: '#cbd5e1' }}>{t.carModel} {booking.vehicle?.car_model || 'N/A'}</span>
            {booking.vehicle?.driver_phone && (
              <span style={{ fontSize: '12px', color: '#009b9e' }}>📞 {booking.vehicle.driver_phone}</span>
            )}
          </div>
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
