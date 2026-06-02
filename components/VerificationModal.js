'use client';

import React, { useState } from 'react';
import { MailCheck, X, ShieldCheck, Loader2 } from 'lucide-react';

export default function VerificationModal({
  email = '',
  isOpen = false,
  onClose,
  onVerifyOtp,
  isVerifying = false,
  error = '',
  language = 'EN',
}) {
  const [otpCode, setOtpCode] = useState('');

  if (!isOpen) return null;

  const t = {
    title: language === 'UZ' ? 'Pochtaning tasdiqlanishi (OTP)' : language === 'RU' ? 'Подтверждение почты (OTP)' : 'Email Verification (OTP)',
    intro: language === 'UZ'
      ? `Biz tasdiqlash kodini (6 xonali) quyidagi manzilga yubordik:`
      : language === 'RU' 
      ? `Мы отправили 6-значный код подтверждения на адрес` 
      : `We have sent a 6-digit verification code to`,
    enterCode: language === 'UZ' ? 'Tasdiqlash kodini kiriting:' : language === 'RU' ? 'Введите код подтверждения:' : 'Enter Verification Code:',
    verifyBtn: language === 'UZ' ? 'Tekshirish va tasdiqlash' : language === 'RU' ? 'Проверить и подтвердить' : 'Verify & Confirm',
    placeholder: '123456',
    cancel: language === 'UZ' ? 'Bekor qilish' : language === 'RU' ? 'Отмена' : 'Cancel',
    safetyNotice: language === 'UZ'
      ? 'Bu tizimni soxta buyurtmalardan himoya qiladi. Buyurtma faqat to\'g\'ri kod kiritilgandan so\'ng faollashadi.'
      : language === 'RU'
      ? 'Это защищает систему от ложных бронирований. Заявка будет активна после ввода правильного кода.'
      : 'This protects our guides/drivers from fake bookings. The booking is activated once verified.',
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (otpCode.length === 6) {
      onVerifyOtp(otpCode);
    }
  };

  return (
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
          maxWidth: '440px',
          padding: '24px',
          position: 'relative',
          border: '1px solid rgba(212, 175, 55, 0.4)',
          backgroundColor: '#0f172a'
        }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            background: 'none',
            border: 'none',
            color: '#94a3b8',
            cursor: 'pointer',
            padding: '4px',
          }}
        >
          <X size={20} />
        </button>

        {/* Modal Header */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '12px', marginBottom: '20px' }}>
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            backgroundColor: 'rgba(212, 175, 55, 0.12)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#d4af37',
          }}>
            <MailCheck size={28} />
          </div>
          
          <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#fff' }}>{t.title}</h3>
          
          <p style={{ fontSize: '13px', color: '#94a3b8', lineHeight: 1.5 }}>
            {t.intro} <strong style={{ color: '#fff' }}>{email}</strong>
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {error && (
            <div style={{
              fontSize: '13px',
              color: '#ef4444',
              padding: '8px 12px',
              borderRadius: '6px',
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.2)',
              textAlign: 'center'
            }}>
              {error}
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
            <label style={{ fontSize: '13px', color: '#94a3b8', fontWeight: '500' }}>
              {t.enterCode}
            </label>
            <input
              type="text"
              maxLength={6}
              value={otpCode}
              onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
              placeholder={t.placeholder}
              style={{
                fontSize: '24px',
                letterSpacing: '8px',
                textAlign: 'center',
                width: '180px',
                padding: '10px',
                fontWeight: '700',
                border: '2px solid rgba(212, 175, 55, 0.3)',
                color: '#d4af37',
                backgroundColor: 'rgba(10, 15, 29, 0.8)',
              }}
            />
          </div>

          {/* Verification Shield Alert */}
          <div style={{
            padding: '10px 12px',
            borderRadius: '6px',
            backgroundColor: 'rgba(0, 155, 158, 0.08)',
            border: '1px solid rgba(0, 155, 158, 0.2)',
            display: 'flex',
            gap: '8px',
            alignItems: 'flex-start'
          }}>
            <ShieldCheck size={16} style={{ color: '#009b9e', marginTop: '2px', flexShrink: 0 }} />
            <p style={{ fontSize: '11px', color: '#e2e8f0', lineHeight: 1.4 }}>
              {t.safetyNotice}
            </p>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                flex: 1,
                padding: '12px',
                borderRadius: '8px',
                border: '1px solid rgba(255,255,255,0.08)',
                backgroundColor: 'rgba(255,255,255,0.02)',
                color: '#94a3b8',
                fontSize: '13px',
                fontWeight: '500',
                cursor: 'pointer',
              }}
            >
              {t.cancel}
            </button>
            
            <button
              type="submit"
              disabled={otpCode.length !== 6 || isVerifying}
              className="btn-gold"
              style={{
                flex: 2,
                padding: '12px',
                fontSize: '13px',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                opacity: (otpCode.length !== 6 || isVerifying) ? 0.5 : 1,
                cursor: (otpCode.length !== 6 || isVerifying) ? 'not-allowed' : 'pointer'
              }}
            >
              {isVerifying ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  <span>Verifying...</span>
                </>
              ) : (
                <span>{t.verifyBtn}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
