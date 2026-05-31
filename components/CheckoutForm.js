'use client';

import React, { useState } from 'react';
import { Calendar, User, Mail, Phone, Info, Loader2, Sparkles } from 'lucide-react';

export default function CheckoutForm({
  selectedLocations = [],
  selectedVehicle = null,
  selectedGuide = null,
  selectedGuideLanguage = 'EN',
  isOutOfCityRoute = false,
  language = 'EN',
  onSubmitBooking,
  isSubmitting = false,
}) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    date: '',
  });
  const [errors, setErrors] = useState({});

  const t = {
    title: language === 'RU' ? 'Детали бронирования и оплата' : 'Booking Details & Invoice',
    nameLabel: language === 'RU' ? 'Имя и фамилия' : 'Full Name',
    emailLabel: language === 'RU' ? 'Электронная почта' : 'Email Address',
    phoneLabel: language === 'RU' ? 'Телефон / WhatsApp' : 'Phone / WhatsApp Number',
    dateLabel: language === 'RU' ? 'Дата поездки' : 'Travel Date',
    
    // Invoice Breakdown
    invoiceTitle: language === 'RU' ? 'Детализация счета' : 'Invoice Breakdown',
    guideCost: language === 'RU' ? 'Услуги гида' : 'Guide Service',
    guideLang: language === 'RU' ? 'язык:' : 'language:',
    transportCost: language === 'RU' ? 'Транспорт и водитель' : 'Transport & Driver',
    platformFee: language === 'RU' ? 'Сбор платформы' : 'Platform Fee',
    totalPrice: language === 'RU' ? 'Итого к оплате' : 'Total Price',
    
    // Disclaimer
    disclaimerTitle: language === 'RU' ? '📜 Условия оплаты (Без предоплаты)' : '📜 Payment Policy (No Pre-payment)',
    disclaimerDesc: language === 'RU'
      ? 'Предоплата не требуется. Вы платите наличными (USD или UZS) непосредственно гиду и водителю в конце тура.'
      : 'No pre-payment required. Pay in cash (USD or UZS) directly to your guide and driver at the end of the tour.',
      
    // Button
    bookBtn: language === 'RU' ? 'Подтвердить и заказать' : 'Book Now & Verify',
    fillRequired: language === 'RU' ? 'Пожалуйста, заполните все обязательные поля' : 'Please fill all required fields',
    selectGuideAndCar: language === 'RU' ? 'Пожалуйста, выберите гида и автомобиль' : 'Please select a guide and a vehicle first',
    selectLocations: language === 'RU' ? 'Пожалуйста, добавьте хотя бы одну локацию в маршрут' : 'Please add at least one location to your route',
    datePlaceholder: language === 'RU' ? 'Выберите дату' : 'Select date',
  };

  // Pricing calculations
  const guideRate = selectedGuide ? Number(selectedGuide.daily_rate) : 0;
  const transportRate = selectedVehicle 
    ? (isOutOfCityRoute ? Number(selectedVehicle.out_of_city_rate) : Number(selectedVehicle.city_rate))
    : 0;
  const fixedFee = selectedGuide || selectedVehicle ? 10.00 : 0; // Fixed platform fee
  const total = guideRate + transportRate + fixedFee;

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
    if (!formData.name.trim()) newErrors.name = language === 'RU' ? 'Обязательное поле' : 'Required field';
    if (!formData.email.trim()) newErrors.email = language === 'RU' ? 'Обязательное поле' : 'Required field';
    if (!formData.phone.trim()) newErrors.phone = language === 'RU' ? 'Обязательное pole' : 'Required field';
    if (!formData.date) newErrors.date = language === 'RU' ? 'Укажите дату' : 'Select date';

    if (selectedLocations.length === 0) {
      newErrors.general = t.selectLocations;
    } else if (!selectedGuide || !selectedVehicle) {
      newErrors.general = t.selectGuideAndCar;
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSubmitBooking({
      ...formData,
      guideCost: guideRate,
      transportCost: transportRate,
      platformFee: fixedFee,
      totalPrice: total,
    });
  };

  // Disable past dates for booking calendar
  const getTodayDateString = () => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  return (
    <form onSubmit={handleFormSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Date and Details Input */}
      <div className="glass-container" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-gold)', marginBottom: '4px' }}>{t.title}</h3>

        {errors.general && (
          <div style={{
            fontSize: '13px',
            color: '#ef4444',
            padding: '8px 12px',
            borderRadius: '6px',
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
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

      {/* Invoice Breakdown */}
      <div className="glass-container" style={{ padding: '20px', border: '1.5px solid var(--border-card)' }}>
        <h4 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', borderBottom: '1px solid var(--border-card)', paddingBottom: '8px', marginBottom: '12px' }}>
          {t.invoiceTitle}
        </h4>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px' }}>
          
          {/* Guide service line */}
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
            <span>
              {t.guideCost}{' '}
              {selectedGuide && (
                <span style={{ fontSize: '11px', color: 'var(--text-gold)', backgroundColor: 'rgba(212,175,55,0.1)', padding: '1px 5px', borderRadius: '3px', marginLeft: '4px' }}>
                  {selectedGuide.full_name} ({t.guideLang} {selectedGuideLanguage})
                </span>
              )}
            </span>
            <span style={{ color: 'var(--text-primary)', fontWeight: '500' }}>${guideRate.toFixed(2)}</span>
          </div>

          {/* Transport service line */}
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
            <span>
              {t.transportCost}{' '}
              {selectedVehicle && (
                <span style={{ fontSize: '11px', color: '#009b9e', backgroundColor: 'rgba(0,155,158,0.1)', padding: '1px 5px', borderRadius: '3px', marginLeft: '4px' }}>
                  {selectedVehicle.car_model} ({isOutOfCityRoute ? '🏔 Mountain' : '🏙 City'})
                </span>
              )}
            </span>
            <span style={{ color: 'var(--text-primary)', fontWeight: '500' }}>${transportRate.toFixed(2)}</span>
          </div>

          {/* Platform fee */}
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
            <span>{t.platformFee}</span>
            <span style={{ color: 'var(--text-primary)', fontWeight: '500' }}>${fixedFee.toFixed(2)}</span>
          </div>

          {/* Divider */}
          <div style={{ height: '1px', backgroundColor: 'var(--border-card)', margin: '4px 0' }} />

          {/* Total Price */}
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '16px', fontWeight: '700' }}>
            <span style={{ color: 'var(--text-gold)' }}>{t.totalPrice}</span>
            <span style={{ color: 'var(--text-gold)', textShadow: '0 0 10px rgba(212,175,55,0.15)' }}>${total.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Payment Policy Alert */}
      <div style={{
        padding: '14px',
        borderRadius: '10px',
        backgroundColor: 'rgba(212, 175, 55, 0.08)',
        border: '1px solid rgba(212, 175, 55, 0.25)',
        display: 'flex',
        flexDirection: 'column',
        gap: '6px'
      }}>
        <strong style={{ fontSize: '13px', color: 'var(--text-gold)', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Info size={14} />
          {t.disclaimerTitle}
        </strong>
        <p style={{ fontSize: '12px', color: 'var(--text-primary)', lineHeight: 1.4 }}>
          {t.disclaimerDesc}
        </p>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isSubmitting || selectedLocations.length === 0 || !selectedGuide || !selectedVehicle}
        className="btn-gold"
        style={{
          width: '100%',
          padding: '14px',
          fontSize: '15px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          opacity: (selectedLocations.length === 0 || !selectedGuide || !selectedVehicle || isSubmitting) ? 0.5 : 1,
          cursor: (selectedLocations.length === 0 || !selectedGuide || !selectedVehicle || isSubmitting) ? 'not-allowed' : 'pointer'
        }}
      >
        {isSubmitting ? (
          <>
            <Loader2 size={16} className="animate-spin" />
            <span>Processing...</span>
          </>
        ) : (
          <>
            <Sparkles size={16} />
            <span>{t.bookBtn}</span>
          </>
        )}
      </button>
    </form>
  );
}
