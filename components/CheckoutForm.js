'use client';

import React, { useState } from 'react';
import { Calendar, User, Mail, Phone, Info, Loader2, Sparkles, Lock, Users } from 'lucide-react';

export default function CheckoutForm({
  selectedLocations = [],
  selectedVehicle = null,
  selectedGuide = null,
  selectedGuideLanguage = 'EN',
  isOutOfCityRoute = false,
  language = 'EN',
  onSubmitBooking,
  isSubmitting = false,
  activeRegion = 'samarqand',
  tourDurationType = 'single',
  numDays = 2,
}) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    date: '',
    passengerCount: 1,
    localPartners: false,
  });
  const [errors, setErrors] = useState({});
  const [bookingType, setBookingType] = useState('private');

  const t = {
    title: language === 'UZ' ? 'Buyurtma tafsilotlari va hisob-kitob' : language === 'RU' ? 'Детали бронирования и оплата' : 'Booking Details & Invoice',
    nameLabel: language === 'UZ' ? 'Ism va familiyangiz' : language === 'RU' ? 'Имя и фамилия' : 'Full Name',
    emailLabel: language === 'UZ' ? 'Elektron pochta manzili' : language === 'RU' ? 'Электронная почта' : 'Email Address',
    phoneLabel: language === 'UZ' ? 'Telefon raqami / WhatsApp' : language === 'RU' ? 'Телефон / WhatsApp' : 'Phone / WhatsApp Number',
    dateLabel: language === 'UZ' ? 'Sayohat sanasi' : language === 'RU' ? 'Дата поездки' : 'Travel Date',
    passengerCountLabel: language === 'UZ' ? 'Sayohatchilar soni' : language === 'RU' ? 'Количество путешественников' : 'Number of Travelers',

    // Booking type
    bookingTypeTitle: language === 'UZ' ? '🏷️ Bron turini tanlang' : language === 'RU' ? '🏷️ Выберите тип бронирования' : '🏷️ Choose Booking Type',
    privateTitle: language === 'UZ' ? 'Shaxsiy (Private)' : language === 'RU' ? 'Приватный' : 'Private',
    privateDesc: language === 'UZ'
      ? 'Tur faqat siz va guruhingiz uchun. Hech kim boshqa qo\'shilmaydi. Maksimal maxfiylik va qulaylik.'
      : language === 'RU'
      ? 'Тур только для вас. Никто другой не присоединится. Максимальная приватность.'
      : 'Tour is exclusively for you. No strangers will join. Maximum privacy & comfort.',
    privatePrice: language === 'UZ' ? 'Asosiy narx' : language === 'RU' ? 'Базовая цена' : 'Standard price',
    sharedTitle: language === 'UZ' ? 'Birgalikda (Shared Pool)' : language === 'RU' ? 'Совместный (Shared Pool)' : 'Shared Pool',
    sharedDesc: language === 'UZ'
      ? 'Xuddi shu yo\'nalishga boshqa sayyohlar ham qo\'shilishi mumkin. Narx arzonlashadi!'
      : language === 'RU'
      ? 'К вашему туру могут присоединиться другие туристы с тем же маршрутом.'
      : 'Others with the same route may join your tour. Save money together!',
    sharedDiscount: language === 'UZ' ? '25% CHEGIRMA' : language === 'RU' ? '25% СКИДКА' : '25% DISCOUNT',

    // Invoice Breakdown
    invoiceTitle: language === 'UZ' ? 'Hisob tafsilotlari' : language === 'RU' ? 'Детализация счета' : 'Invoice Breakdown',
    guideCost: language === 'UZ' ? 'Gid xizmati' : language === 'RU' ? 'Услуги гида' : 'Guide Service',
    guideLang: language === 'UZ' ? 'tili:' : language === 'RU' ? 'язык:' : 'language:',
    transportCost: language === 'UZ' ? 'Transport va haydovchi' : language === 'RU' ? 'Транспорт и водитель' : 'Transport & Driver',
    platformFee: language === 'UZ' ? 'Platforma to\'lovi' : language === 'RU' ? 'Сбор платформы' : 'Platform Fee',
    subtotal: language === 'UZ' ? 'Jami (asosiy)' : language === 'RU' ? 'Итого (базово)' : 'Subtotal',
    discountLabel: language === 'UZ' ? '🤝 Shared chegirma (-25%)' : language === 'RU' ? '🤝 Скидка Shared (-25%)' : '🤝 Shared Discount (-25%)',
    totalPrice: language === 'UZ' ? 'Jami to\'lov' : language === 'RU' ? 'Итого к оплате' : 'Total Price',

    // Disclaimer
    disclaimerTitle: language === 'UZ' ? '📜 To\'lov shartlari (Oldindan to\'lovsiz)' : language === 'RU' ? '📜 Условия оплаты (Без предоплаты)' : '📜 Payment Policy (No Pre-payment)',
    disclaimerDesc: language === 'UZ'
      ? 'Oldindan to\'lov talab qilinmaydi. Sayohat yakunida to\'lovni naqd pulda (USD yoki UZS) to\'g\'ridan-to\'g\'ri gid va haydovchiga to\'laysiz.'
      : language === 'RU'
      ? 'Предоплата не требуется. Вы платите наличными (USD или UZS) непосредственно гиду и водителю в конце тура.'
      : 'No pre-payment required. Pay in cash (USD or UZS) directly to your guide and driver at the end of the tour.',

    // Button
    bookBtn: language === 'UZ' ? 'Tasdiqlash va buyurtma qilish' : language === 'RU' ? 'Подтвердить и заказать' : 'Book Now & Verify',
    fillRequired: language === 'UZ' ? 'Iltimos, barcha majburiy maydonlarni to\'ldiring' : language === 'RU' ? 'Пожалуйста, заполните все обязательные поля' : 'Please fill all required fields',
    selectGuideAndCar: language === 'UZ' ? 'Iltimos, avval gid va transportni tanlang' : language === 'RU' ? 'Пожалуйста, выберите гида и автомобиль' : 'Please select a guide and a vehicle first',
    selectLocations: language === 'UZ' ? 'Iltimos, marshrutga kamida bitta joyni qo\'shing' : language === 'RU' ? 'Пожалуйста, добавьте хотя бы одну локацию в маршрут' : 'Please add at least one location to your route',
    datePlaceholder: language === 'UZ' ? 'Sanani tanlang' : language === 'RU' ? 'Выберите дату' : 'Select date',
  };

  // Pricing calculations
  const daysCount = tourDurationType === 'multi' ? numDays : 1;
  const guideRate = selectedGuide ? Number(selectedGuide.daily_rate) : 0;
  const transportRate = selectedVehicle
    ? (isOutOfCityRoute ? Number(selectedVehicle.out_of_city_rate) : Number(selectedVehicle.city_rate))
    : 0;
  const guideTotalRate = guideRate * daysCount;
  const transportTotalRate = transportRate * daysCount;
  const fixedFee = selectedGuide || selectedVehicle ? 10.00 : 0;
  const subtotal = guideTotalRate + transportTotalRate + fixedFee;
  const discountRate = bookingType === 'shared' ? 0.25 : 0;
  const discountAmount = subtotal * discountRate;
  const total = subtotal - discountAmount;

  const passengerCount = formData.passengerCount || 1;
  const totalTicketsCost = selectedLocations.reduce((sum, loc) => sum + (loc.ticket_price || 0), 0) * passengerCount;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = language === 'UZ' ? 'Majburiy maydon' : language === 'RU' ? 'Обязательное поле' : 'Required field';
    if (!formData.email.trim()) newErrors.email = language === 'UZ' ? 'Majburiy maydon' : language === 'RU' ? 'Обязательное поле' : 'Required field';
    if (!formData.phone.trim()) newErrors.phone = language === 'UZ' ? 'Majburiy maydon' : language === 'RU' ? 'Обязательное поле' : 'Required field';
    if (!formData.date) newErrors.date = language === 'UZ' ? 'Sanani ko\'rsating' : language === 'RU' ? 'Укажите дату' : 'Select date';

    if (selectedLocations.length === 0) {
      newErrors.general = t.selectLocations;
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSubmitBooking({
      ...formData,
      bookingType,
      guideCost: guideTotalRate,
      transportCost: transportTotalRate,
      platformFee: fixedFee,
      subtotalPrice: subtotal,
      discountAmount,
      totalPrice: total,
      tourDurationType,
      numDays,
    });
  };

  const getTodayDateString = () => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  return (
    <form onSubmit={handleFormSubmit}>
      <div className="checkout-grid">
        
        {/* Left Column: Booking details & traveler details */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* 🏷️ Bron turi tanlash — Pool and Save */}
          <div className="glass-container" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px', backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-card)' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-gold)', marginBottom: '2px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              {t.bookingTypeTitle}
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>

              {/* PRIVATE karta */}
              <button
                key="private"
                type="button"
                onClick={() => setBookingType('private')}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                  padding: '16px',
                  borderRadius: '12px',
                  border: bookingType === 'private'
                    ? '2px solid var(--primary-blue, var(--primary-blue))'
                    : '1px solid var(--border-card)',
                  backgroundColor: bookingType === 'private'
                    ? 'rgba(255, 91, 0, 0.05)'
                    : 'var(--bg-card)',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.2s ease',
                  outline: 'none',
                  position: 'relative',
                }}
              >
                {/* Tanlangan belgisi */}
                {bookingType === 'private' && (
                  <div style={{
                    position: 'absolute',
                    top: '10px',
                    right: '10px',
                    width: '18px',
                    height: '18px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--primary-blue, var(--primary-blue))',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                      <path d="M1 4L3.5 6.5L9 1" stroke="var(--bg-card)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                )}
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  backgroundColor: bookingType === 'private' ? 'rgba(255, 91, 0, 0.1)' : 'var(--bg-dark)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: bookingType === 'private' ? 'var(--primary-blue, var(--primary-blue))' : 'var(--text-secondary)',
                  transition: 'all 0.2s ease',
                }}>
                  <Lock size={18} />
                </div>
                <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>
                  {t.privateTitle}
                </span>
                <span style={{ fontSize: '11px', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                  {t.privateDesc}
                </span>
                <span style={{
                  fontSize: '11px',
                  color: 'var(--text-gold, var(--primary-blue))',
                  fontWeight: '600',
                  marginTop: 'auto',
                  paddingTop: '6px'
                }}>
                  {t.privatePrice}
                </span>
              </button>

              {/* SHARED karta */}
              <button
                key="shared"
                type="button"
                onClick={() => setBookingType('shared')}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                  padding: '16px',
                  borderRadius: '12px',
                  border: bookingType === 'shared'
                    ? '2px solid #009b9e'
                    : '1px solid var(--border-card)',
                  backgroundColor: bookingType === 'shared'
                    ? 'rgba(0, 155, 158, 0.05)'
                    : 'var(--bg-card)',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.2s ease',
                  outline: 'none',
                  position: 'relative',
                }}
              >
                {/* Tanlangan belgisi */}
                {bookingType === 'shared' && (
                  <div style={{
                    position: 'absolute',
                    top: '10px',
                    right: '10px',
                    width: '18px',
                    height: '18px',
                    borderRadius: '50%',
                    backgroundColor: '#009b9e',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                      <path d="M1 4L3.5 6.5L9 1" stroke="var(--bg-card)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                )}
                {/* 25% chegirma badge */}
                <div style={{
                  position: 'absolute',
                  top: '-10px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  backgroundColor: '#009b9e',
                  color: 'var(--bg-card)',
                  fontSize: '10px',
                  fontWeight: 800,
                  padding: '2px 10px',
                  borderRadius: '20px',
                  letterSpacing: '0.05em',
                  whiteSpace: 'nowrap',
                }}>
                  {t.sharedDiscount}
                </div>
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  backgroundColor: bookingType === 'shared' ? 'rgba(0, 155, 158, 0.1)' : 'var(--bg-dark)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: bookingType === 'shared' ? '#009b9e' : 'var(--text-secondary)',
                  transition: 'all 0.2s ease',
                }}>
                  <Users size={18} />
                </div>
                <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>
                  {t.sharedTitle}
                </span>
                <span style={{ fontSize: '11px', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                  {t.sharedDesc}
                </span>
                <span style={{
                  fontSize: '12px',
                  color: '#009b9e',
                  fontWeight: '700',
                  marginTop: 'auto',
                  paddingTop: '6px'
                }}>
                  {subtotal > 0 ? `$${subtotal.toFixed(2)} → $${(subtotal * 0.75).toFixed(2)}` : '–25%'}
                </span>
              </button>

            </div>
          </div>

          {/* 📝 Sana va Shaxsiy Ma'lumotlar */}
          <div className="glass-container" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px', backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-card)' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-gold)', marginBottom: '4px' }}>{t.title}</h3>

            {errors.general && (
              <div style={{
                fontSize: '13px',
                color: '#ef4444',
                padding: '8px 12px',
                borderRadius: '6px',
                backgroundColor: 'rgba(239, 68, 68, 0.05)',
                border: '1px solid rgba(239, 68, 68, 0.2)',
              }}>
                {errors.general}
              </div>
            )}

            {/* Date Selector */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '13px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Calendar size={14} style={{ color: 'var(--text-gold)' }} />
                <span>{t.dateLabel} *</span>
              </label>
              <input
                type="date"
                name="date"
                value={formData.date}
                min={getTodayDateString()}
                onChange={handleInputChange}
                style={{
                  borderColor: errors.date ? '#ef4444' : 'var(--input-border)',
                }}
              />
              {errors.date && <span style={{ fontSize: '11px', color: '#ef4444' }}>{errors.date}</span>}
            </div>

            {/* Number of Travelers Selector */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '13px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <User size={14} style={{ color: 'var(--text-gold)' }} />
                <span>{t.passengerCountLabel} *</span>
              </label>
              <select
                name="passengerCount"
                value={formData.passengerCount}
                onChange={(e) => setFormData(prev => ({ ...prev, passengerCount: parseInt(e.target.value, 10) }))}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  backgroundColor: 'var(--bg-card)',
                  border: '1px solid var(--input-border)',
                  color: 'var(--text-primary)',
                  fontSize: '14px',
                  outline: 'none',
                  cursor: 'pointer',
                  height: '44px'
                }}
              >
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 15, 20, 25, 30, 40, 50].map(num => (
                  <option key={num} value={num} style={{ backgroundColor: 'var(--bg-card)', color: 'var(--text-primary)' }}>
                    {num} {num === 1 ? (language === 'UZ' ? 'kishi' : language === 'RU' ? 'человек' : 'person') : (language === 'UZ' ? 'kishi' : language === 'RU' ? 'человек' : 'people')}
                  </option>
                ))}
              </select>
            </div>

            {/* Local Partners Option for Cross-Region */}
            {activeRegion === 'cross_region' && (
              <div 
                className="glass-container"
                style={{
                  padding: '14px',
                  borderRadius: '10px',
                  backgroundColor: 'rgba(0, 155, 158, 0.05)',
                  border: '1.5px solid rgba(0, 155, 158, 0.25)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                  marginTop: '4px'
                }}
              >
                <label style={{ 
                  display: 'flex', 
                  alignItems: 'flex-start', 
                  gap: '10px', 
                  cursor: 'pointer',
                  fontSize: '13px',
                  color: 'var(--text-primary)',
                  fontWeight: '600'
                }}>
                  <input 
                    type="checkbox" 
                    name="localPartners"
                    checked={formData.localPartners || false}
                    onChange={(e) => setFormData(prev => ({ ...prev, localPartners: e.target.checked }))}
                    style={{ marginTop: '3px', cursor: 'pointer', accentColor: '#009b9e' }}
                  />
                  <span>
                    {language === 'UZ' 
                      ? 'Har bir shaharda alohida mahalliy gid/transport xizmati (tavsiya etiladi)' 
                      : language === 'RU' 
                        ? 'Отдельные местные гиды/водители в каждом городе (рекомендуется)' 
                        : 'Arrange local guides/drivers in each city (recommended)'}
                  </span>
                </label>
                <p style={{ fontSize: '11px', color: 'var(--text-secondary)', margin: 0, paddingLeft: '24px', lineHeight: 1.45 }}>
                  {language === 'UZ'
                    ? 'Toshkentdan butun yo\'l davomida bitta mashinada yurish o\'rniga, shahar oralarida poyezdda borib, har bir shaharda mahalliy transport yollash orqali mablag\'ingizni tejaysiz. Menejerimiz sizga moslashtirishda yordam beradi.'
                    : language === 'RU'
                      ? 'Сэкономит ваш бюджет и время. Вместо одной машины на весь путь из Ташкента, вы поедете на поезде, а в городах вас встретят местные гиды.'
                      : 'Saves budget and travel time. Instead of driving in one car the whole way, travel by train between cities and get picked up by local guides/drivers.'}
                </p>
              </div>
            )}

            {/* Full Name */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '13px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <User size={14} style={{ color: 'var(--text-gold)' }} />
                <span>{t.nameLabel} *</span>
              </label>
              <input
                type="text"
                name="name"
                placeholder="John Doe"
                value={formData.name}
                onChange={handleInputChange}
                style={{
                  borderColor: errors.name ? '#ef4444' : 'var(--input-border)',
                }}
              />
              {errors.name && <span style={{ fontSize: '11px', color: '#ef4444' }}>{errors.name}</span>}
            </div>

            {/* Email */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '13px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Mail size={14} style={{ color: 'var(--text-gold)' }} />
                <span>{t.emailLabel} *</span>
              </label>
              <input
                type="email"
                name="email"
                placeholder="john@example.com"
                value={formData.email}
                onChange={handleInputChange}
                style={{
                  borderColor: errors.email ? '#ef4444' : 'var(--input-border)',
                }}
              />
              {errors.email && <span style={{ fontSize: '11px', color: '#ef4444' }}>{errors.email}</span>}
            </div>

            {/* Phone / WhatsApp */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '13px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Phone size={14} style={{ color: 'var(--text-gold)' }} />
                <span>{t.phoneLabel} *</span>
              </label>
              <input
                type="tel"
                name="phone"
                placeholder="+1234567890"
                value={formData.phone}
                onChange={handleInputChange}
                style={{
                  borderColor: errors.phone ? '#ef4444' : 'var(--input-border)',
                }}
              />
              {errors.phone && <span style={{ fontSize: '11px', color: '#ef4444' }}>{errors.phone}</span>}
            </div>
          </div>
        </div>

        {/* Right Column: Sticky Summary */}
        <div className="checkout-sticky-summary" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* 🧾 Hisob Tafsilotlari (Invoice) */}
          <div className="glass-container" style={{
            padding: '20px',
            border: bookingType === 'shared'
              ? '1.5px solid rgba(0,155,158,0.4)'
              : '1.5px solid var(--border-card)',
            borderRadius: '16px',
            transition: 'border-color 0.3s ease',
            background: 'var(--bg-card)',
            color: 'var(--text-primary)',
          }}>
            <h4 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-gold)', borderBottom: '1px solid var(--border-card)', paddingBottom: '10px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              📄 {t.invoiceTitle}
            </h4>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13px' }}>

              {/* Guide Service Card */}
              <div style={{ 
                padding: '12px', 
                borderRadius: '10px', 
                backgroundColor: 'var(--bg-dark)', 
                border: '1px solid var(--border-card)',
                display: 'flex',
                flexDirection: 'column',
                gap: '6px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: '600', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    👤 {t.guideCost}
                  </span>
                  <span style={{ color: 'var(--text-primary)', fontWeight: '700' }}>
                    ${guideTotalRate.toFixed(2)}
                  </span>
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', color: 'var(--text-secondary)' }}>
                  <span>
                    {selectedGuide ? (
                      <span style={{ color: 'var(--text-gold)', backgroundColor: 'rgba(255,91,0,0.06)', padding: '2px 6px', borderRadius: '4px', border: '1px solid rgba(var(--primary-blue-rgb), 0.15)' }}>
                        {selectedGuide.full_name} ({selectedGuideLanguage})
                      </span>
                    ) : (
                      <span style={{ color: 'var(--text-secondary)' }}>
                        {language === 'UZ' ? 'Gidsiz sayohat' : language === 'RU' ? 'Без гида' : 'No guide selected'}
                      </span>
                    )}
                  </span>
                  {tourDurationType === 'multi' && selectedGuide && (
                    <span>
                      ${guideRate.toFixed(2)} × {numDays} {language === 'UZ' ? 'kun' : language === 'RU' ? 'дн' : 'days'}
                    </span>
                  )}
                </div>
              </div>

              {/* Transport Service Card */}
              <div style={{ 
                padding: '12px', 
                borderRadius: '10px', 
                backgroundColor: 'var(--bg-dark)', 
                border: '1px solid var(--border-card)',
                display: 'flex',
                flexDirection: 'column',
                gap: '6px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: '600', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    🚗 {t.transportCost}
                  </span>
                  <span style={{ color: 'var(--text-primary)', fontWeight: '700' }}>
                    ${transportTotalRate.toFixed(2)}
                  </span>
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', color: 'var(--text-secondary)' }}>
                  <span>
                    {selectedVehicle ? (
                      <span style={{ color: '#009b9e', backgroundColor: 'rgba(0,155,158,0.06)', padding: '2px 6px', borderRadius: '4px', border: '1px solid rgba(0,155,158,0.15)' }}>
                        {selectedVehicle.car_model} ({
                          activeRegion === 'cross_region'
                            ? (language === 'UZ' ? '🇺🇿 Viloyatlararo' : language === 'RU' ? '🇺🇿 Межрегиональный' : '🇺🇿 Inter-Province')
                            : isOutOfCityRoute
                              ? (language === 'UZ' ? '🏔 Tog\'' : language === 'RU' ? '🏔 Горы' : 'Out of City')
                              : (language === 'UZ' ? '🏙 Shahar ichi' : language === 'RU' ? '🏙 Город' : 'City rate')
                        })
                      </span>
                    ) : (
                      <span style={{ color: 'var(--text-secondary)' }}>
                        {language === 'UZ' ? 'Transportsiz sayohat' : language === 'RU' ? 'Без транспорта' : 'No transport selected'}
                      </span>
                    )}
                  </span>
                  {tourDurationType === 'multi' && selectedVehicle && (
                    <span>
                      ${transportRate.toFixed(2)} × {numDays} {language === 'UZ' ? 'kun' : language === 'RU' ? 'дн' : 'days'}
                    </span>
                  )}
                </div>
              </div>

              {/* Ticket Costs - Klook Excluded Cost Style */}
              {totalTicketsCost > 0 && (
                <div style={{ 
                  padding: '12px', 
                  borderRadius: '10px', 
                  backgroundColor: 'rgba(251, 191, 36, 0.05)', 
                  border: '1px dashed rgba(251, 191, 36, 0.3)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: '600', color: '#b8860b', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      🎟️ {language === 'UZ' ? 'Kirish chiptalari (Joyida to\'lanadi)' : language === 'RU' ? 'Входные билеты (На месте)' : 'Entrance Tickets (Pay on site)'}
                    </span>
                    <span style={{ color: '#b8860b', fontWeight: '700' }}>
                      ${totalTicketsCost.toFixed(2)}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-secondary)' }}>
                    <span>
                      {language === 'UZ' ? '* Tur narxidan alohida to\'lanadi' : language === 'RU' ? '* Оплачивается отдельно от тура' : '* Paid separately at attractions'}
                    </span>
                    <span>
                      ${selectedLocations.reduce((sum, loc) => sum + (loc.ticket_price || 0), 0).toFixed(2)} × {passengerCount} {language === 'UZ' ? 'kishi' : language === 'RU' ? 'чел' : 'pax'}
                    </span>
                  </div>
                </div>
              )}

              {/* Platform fee */}
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)', padding: '0 4px', fontSize: '12.5px' }}>
                <span>🛠️ {t.platformFee}</span>
                <span style={{ color: 'var(--text-primary)', fontWeight: '600' }}>${fixedFee.toFixed(2)}</span>
              </div>

              {/* Divider */}
              <div style={{ height: '1.5px', backgroundColor: 'var(--border-card)', margin: '4px 0' }} />

              {/* Subtotal (only shown in shared) */}
              {bookingType === 'shared' && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)', fontSize: '12px', padding: '0 4px' }}>
                  <span>{t.subtotal}</span>
                  <span style={{ textDecoration: 'line-through' }}>${subtotal.toFixed(2)}</span>
                </div>
              )}

              {/* Discount Line (only shown in shared) */}
              {bookingType === 'shared' && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#009b9e', fontSize: '13px', fontWeight: '700', padding: '0 4px' }}>
                  <span>{t.discountLabel}</span>
                  <span>-${discountAmount.toFixed(2)}</span>
                </div>
              )}

              {/* Total Price Section */}
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                fontSize: '16px', 
                fontWeight: '800',
                padding: '8px 4px 0 4px',
                borderTop: bookingType === 'shared' ? '1px dashed rgba(0, 155, 158, 0.25)' : 'none'
              }}>
                <span style={{ color: bookingType === 'shared' ? '#009b9e' : 'var(--text-gold)' }}>
                  {t.totalPrice}
                </span>
                <span style={{
                  fontSize: '22px',
                  fontWeight: '900',
                  color: bookingType === 'shared' ? '#009b9e' : 'var(--text-gold)',
                }}>
                  ${total.toFixed(2)}
                </span>
              </div>

            </div>
          </div>

          {/* Payment Policy Alert */}
          <div style={{
            padding: '14px',
            borderRadius: '10px',
            backgroundColor: 'rgba(255, 91, 0, 0.05)',
            border: '1px solid rgba(255, 91, 0, 0.2)',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px'
          }}>
            <strong style={{ fontSize: '13px', color: 'var(--text-gold)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Info size={14} />
              {t.disclaimerTitle}
            </strong>
            <p style={{ fontSize: '12px', color: 'var(--text-primary)', lineHeight: 1.4, margin: 0 }}>
              {t.disclaimerDesc}
            </p>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting || selectedLocations.length === 0}
            className="btn-gold"
            style={{
              width: '100%',
              padding: '14px',
              fontSize: '15px',
              fontWeight: '800',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              borderRadius: '12px',
              opacity: (selectedLocations.length === 0 || isSubmitting) ? 0.5 : 1,
              cursor: (selectedLocations.length === 0 || isSubmitting) ? 'not-allowed' : 'pointer',
              backgroundColor: bookingType === 'shared' ? '#009b9e' : 'var(--primary-blue, var(--primary-blue))',
              backgroundImage: bookingType === 'shared' ? 'none' : 'var(--btn-gold-bg)',
              color: 'var(--bg-card)',
              border: 'none',
              boxShadow: bookingType === 'shared' ? '0 4px 14px rgba(0,155,158,0.25)' : '0 4px 14px rgba(var(--primary-blue-rgb), 0.25)',
              transition: 'all 0.3s ease',
            }}
          >
            {isSubmitting ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>Processing...</span>
              </>
            ) : (
              <>
                {bookingType === 'shared' ? <Users size={16} /> : <Sparkles size={16} />}
                <span>{t.bookBtn}</span>
              </>
            )}
          </button>
        </div>

      </div>
    </form>
  );
}
