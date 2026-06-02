'use client';

import React, { useState, useEffect } from 'react';
import { 
  X, 
  CreditCard, 
  Lock, 
  ShieldCheck, 
  Smartphone, 
  Globe, 
  CheckCircle, 
  Loader2, 
  ChevronRight,
  Info
} from 'lucide-react';

const USD_TO_UZS = 13000;

export default function PaymentPortal({
  isOpen = false,
  onClose,
  bookingId,
  totalPrice = 0,
  language = 'EN',
  onPaymentSuccess,
}) {
  const [residency, setResidency] = useState(null); // 'local' | 'international'
  const [paymentMethod, setPaymentMethod] = useState(null); // 'payme' | 'click' | 'stripe' | 'paypal'
  const [step, setStep] = useState('select'); // 'select' | 'form' | 'processing' | 'success'
  
  // Form fields
  const [phone, setPhone] = useState('');
  const [smsCode, setSmsCode] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvc, setCardCvc] = useState('');
  
  // Loading & error status
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [countdown, setCountdown] = useState(0);

  const depositUsd = parseFloat((totalPrice * 0.20).toFixed(2));
  const depositUzs = Math.round(depositUsd * USD_TO_UZS);

  useEffect(() => {
    if (isOpen) {
      setResidency(null);
      setPaymentMethod(null);
      setStep('select');
      setErrorMsg('');
      setPhone('');
      setSmsCode('');
      setCardHolder('');
      setCardNumber('');
      setCardExpiry('');
      setCardCvc('');
    }
  }, [isOpen]);

  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  if (!isOpen) return null;

  const t = {
    title: language === 'UZ' ? 'Tasdiqlangan buyurtma to\'lovi' : language === 'RU' ? 'Оплата подтвержденного заказа' : 'Secure Deposit Payment',
    depositNotice: language === 'UZ' ? 'Bron qilishni yakunlash uchun 20% qaytarilmaydigan depozit to\'lash lozim.' : language === 'RU' ? 'Для подтверждения необходимо оплатить 20% невозвратный депозит.' : 'To complete booking, a 20% non-refundable deposit is required.',
    totalPrice: language === 'UZ' ? 'Umumiy qiymat:' : language === 'RU' ? 'Общая стоимость:' : 'Total Price:',
    depositPrice: language === 'UZ' ? 'Depozit (20%):' : language === 'RU' ? 'Депозит (20%):' : 'Deposit (20%):',
    residencyQuestion: language === 'UZ' ? 'Siz qayerdan tashrif buyuryapsiz?' : language === 'RU' ? 'Откуда вы путешествуете?' : 'Where are you traveling from?',
    localResident: language === 'UZ' ? 'O\'zbekiston (Mahalliy sayyoh)' : language === 'RU' ? 'Узбекистан (Местный турист)' : 'Uzbekistan (Local Resident)',
    localDesc: language === 'UZ' ? 'Payme / Click to\'lov tizimlari orqali UZS da to\'lash' : language === 'RU' ? 'Оплата через Payme / Click в UZS' : 'Pay in UZS via Payme or Click',
    intlResident: language === 'UZ' ? 'Chet el (Xalqaro sayyoh)' : language === 'RU' ? 'Другая страна (Иностранец)' : 'Other Country (International)',
    intlDesc: language === 'UZ' ? 'Stripe / PayPal orqali USD da to\'lash' : language === 'RU' ? 'Оплата через Stripe / PayPal в USD' : 'Pay in USD via Stripe or PayPal',
    selectMethod: language === 'UZ' ? 'To\'lov usulini tanlang' : language === 'RU' ? 'Выберите способ оплаты' : 'Select Payment Method',
    pay: language === 'UZ' ? 'To\'lash' : language === 'RU' ? 'Оплатить' : 'Pay Now',
    cardLabel: language === 'UZ' ? 'Karta ma\'lumotlari' : language === 'RU' ? 'Данные карты' : 'Card Information',
    phoneLabel: language === 'UZ' ? 'Telefon raqami' : language === 'RU' ? 'Номер телефона' : 'Phone Number',
    smsLabel: language === 'UZ' ? 'SMS tasdiqlash kodi' : language === 'RU' ? 'SMS код подтверждения' : 'SMS Verification Code',
    successTitle: language === 'UZ' ? 'Depozit muvaffaqiyatli to\'landi!' : language === 'RU' ? 'Депозит успешно оплачен!' : 'Deposit Paid Successfully!',
    successDesc: language === 'UZ' ? 'Sizning sayohatingiz tasdiqlandi. Tafsilotlar elektron pochtangizga yuborildi.' : language === 'RU' ? 'Ваша поездка подтверждена. Детали отправлены на вашу почту.' : 'Your customized tour is now confirmed. Access details via email.',
    back: language === 'UZ' ? 'Orqaga' : language === 'RU' ? 'Назад' : 'Back',
    sendSmsBtn: language === 'UZ' ? 'Kod yuborish' : language === 'RU' ? 'Отправить код' : 'Send Code',
    verifySmsBtn: language === 'UZ' ? 'Kodni tasdiqlash' : language === 'RU' ? 'Подтвердить код' : 'Confirm Code',
    cardHolderName: language === 'UZ' ? 'Karta egasining ismi' : language === 'RU' ? 'Имя на карте' : 'Cardholder Name',
    secTrans: language === 'UZ' ? 'Barcha to\'lovlar SSL xavfsiz kanallari orqali himoyalangan.' : language === 'RU' ? 'Все платежи защищены шифрованием SSL.' : 'All transactions are encrypted and secured via SSL.',
  };

  const handleBack = () => {
    if (step === 'form') {
      setStep('select');
      setPaymentMethod(null);
    } else if (residency) {
      setResidency(null);
      setPaymentMethod(null);
      setStep('select');
    }
  };

  // Mock Click Merchant Callback
  const simulateClickPayment = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const clickTransId = Math.floor(200000000 + Math.random() * 800000000).toString();
      const serviceId = '4521';
      const clickSecret = 'click_secret_key_mock';
      const amount = depositUzs;
      const signTime = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');
      
      // Compute MD5 sign for Prepare action=0
      // md5(click_trans_id + service_id + click_secret_key + merchant_trans_id + amount + action + sign_time)
      const prepSignStr = `${clickTransId}${serviceId}${clickSecret}${bookingId}${amount}0${signTime}`;
      const prepSign = cryptoMd5(prepSignStr);

      // 1. Trigger Click Prepare API endpoint
      const resPrep = await fetch('/api/payments/click', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          click_trans_id: clickTransId,
          service_id: serviceId,
          click_paydoc_id: '88772',
          merchant_trans_id: bookingId.toString(),
          amount: amount.toString(),
          action: '0',
          error: '0',
          sign_time: signTime,
          sign_string: prepSign
        })
      });

      const prepData = await resPrep.json();
      if (prepData.error !== 0) {
        throw new Error(prepData.error_note || 'Click prepare failed');
      }

      // Compute MD5 sign for Complete action=1
      const compSignStr = `${clickTransId}${serviceId}${clickSecret}${bookingId}${amount}1${signTime}`;
      const compSign = cryptoMd5(compSignStr);

      // 2. Trigger Click Complete API endpoint
      const resComp = await fetch('/api/payments/click', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          click_trans_id: clickTransId,
          service_id: serviceId,
          click_paydoc_id: '88772',
          merchant_trans_id: bookingId.toString(),
          amount: amount.toString(),
          action: '1',
          error: '0',
          sign_time: signTime,
          sign_string: compSign
        })
      });

      const compData = await resComp.json();
      if (compData.error !== 0) {
        throw new Error(compData.error_note || 'Click completion failed');
      }

      setStep('success');
      setTimeout(() => {
        onPaymentSuccess({
          paymentMethod: 'click',
          paymentTxId: clickTransId,
          depositAmount: depositUsd
        });
      }, 1500);

    } catch (err) {
      setErrorMsg(err.message || 'Payment simulation failed.');
    } finally {
      setLoading(false);
    }
  };

  // Mock Payme RPC Callbacks
  const simulatePaymePayment = async (actionType) => {
    setLoading(true);
    setErrorMsg('');
    
    // Auth header Base64 credentials for "Paycom:payme_merchant_key_mock"
    const credentials = btoa('Paycom:payme_merchant_key_mock');
    const authHeader = `Basic ${credentials}`;

    try {
      const paymeTxId = 'payme_tx_' + Math.random().toString(36).substring(2, 15);
      const amountInTiyins = depositUzs * 100;
      
      if (actionType === 'send_sms') {
        // Run CheckPerformTransaction RPC
        const resCheck = await fetch('/api/payments/payme', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': authHeader
          },
          body: JSON.stringify({
            jsonrpc: '2.0',
            id: 1,
            method: 'CheckPerformTransaction',
            params: {
              amount: amountInTiyins,
              account: { booking_id: bookingId.toString() }
            }
          })
        });

        const checkData = await resCheck.json();
        if (checkData.error) {
          throw new Error(checkData.error.message?.en || 'Payme checks failed');
        }

        // Run CreateTransaction RPC
        const resCreate = await fetch('/api/payments/payme', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': authHeader
          },
          body: JSON.stringify({
            jsonrpc: '2.0',
            id: 2,
            method: 'CreateTransaction',
            params: {
              id: paymeTxId,
              time: Date.now(),
              amount: amountInTiyins,
              account: { booking_id: bookingId.toString() }
            }
          })
        });

        const createData = await resCreate.json();
        if (createData.error) {
          throw new Error(createData.error.message?.en || 'Payme create transaction failed');
        }

        // Save transaction id locally for SMS verification step
        window.tempPaymeTxId = paymeTxId;
        setCountdown(60);
        setStep('form'); // display sms field
      } 
      
      else if (actionType === 'verify_sms') {
        if (!smsCode || smsCode.length < 4) {
          throw new Error('Please enter valid SMS code.');
        }

        const activeTxId = window.tempPaymeTxId || paymeTxId;

        // Run PerformTransaction RPC
        const resPerform = await fetch('/api/payments/payme', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': authHeader
          },
          body: JSON.stringify({
            jsonrpc: '2.0',
            id: 3,
            method: 'PerformTransaction',
            params: { id: activeTxId }
          })
        });

        const performData = await resPerform.json();
        if (performData.error) {
          throw new Error(performData.error.message?.en || 'Payme perform payment failed');
        }

        setStep('success');
        setTimeout(() => {
          onPaymentSuccess({
            paymentMethod: 'payme',
            paymentTxId: activeTxId,
            depositAmount: depositUsd
          });
        }, 1500);
      }

    } catch (err) {
      setErrorMsg(err.message || 'Payme payment processing failed.');
    } finally {
      setLoading(false);
    }
  };

  // Mock Stripe API flow
  const simulateStripePayment = async (e) => {
    e.preventDefault();
    if (!cardNumber || cardNumber.length < 16) {
      setErrorMsg('Invalid Card Number.');
      return;
    }
    if (!cardExpiry || !cardExpiry.includes('/')) {
      setErrorMsg('Invalid Expiry Date (MM/YY).');
      return;
    }
    if (!cardCvc || cardCvc.length < 3) {
      setErrorMsg('Invalid CVV.');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      // Simulate Stripe charge call
      const stripeTxId = 'ch_stripe_' + Math.random().toString(36).substring(2, 15);
      
      const res = await fetch('/api/bookings/payment/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId,
          paymentMethod: 'stripe',
          paymentTxId: stripeTxId,
          depositAmount: depositUsd
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Payment confirmation failed.');
      }

      setStep('success');
      setTimeout(() => {
        onPaymentSuccess({
          paymentMethod: 'stripe',
          paymentTxId: stripeTxId,
          depositAmount: depositUsd
        });
      }, 1500);

    } catch (err) {
      setErrorMsg(err.message || 'Credit card authorization failed.');
    } finally {
      setLoading(false);
    }
  };

  // Mock PayPal Flow
  const simulatePayPalPayment = async () => {
    setLoading(true);
    setErrorMsg('');

    try {
      const paypalTxId = 'PAYID-' + Math.random().toString(36).substring(2, 10).toUpperCase();

      const res = await fetch('/api/bookings/payment/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId,
          paymentMethod: 'paypal',
          paymentTxId: paypalTxId,
          depositAmount: depositUsd
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'PayPal order capture failed.');
      }

      setStep('success');
      setTimeout(() => {
        onPaymentSuccess({
          paymentMethod: 'paypal',
          paymentTxId: paypalTxId,
          depositAmount: depositUsd
        });
      }, 1500);

    } catch (err) {
      setErrorMsg(err.message || 'PayPal checkout failed.');
    } finally {
      setLoading(false);
    }
  };

  // MD5 JS helper for Click signature simulator
  const cryptoMd5 = (str) => {
    return crypto.createHash('md5').update(str).digest('hex');
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(5, 7, 16, 0.85)',
      backdropFilter: 'blur(10px)',
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
          padding: '28px',
          position: 'relative',
          border: '1px solid rgba(212, 175, 55, 0.35)',
          backgroundColor: '#0a0f1d',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px'
        }}
      >
        {/* Close Button */}
        {step !== 'success' && step !== 'processing' && (
          <button
            onClick={onClose}
            style={{
              position: 'absolute',
              top: '16px',
              right: '16px',
              background: 'none',
              border: 'none',
              color: '#64748b',
              cursor: 'pointer',
              padding: '4px',
            }}
          >
            <X size={20} />
          </button>
        )}

        {/* Header Invoice details */}
        {step !== 'success' && (
          <div style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '16px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#fff', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Lock size={18} style={{ color: '#d4af37' }} />
              {t.title}
            </h3>
            <p style={{ fontSize: '12px', color: '#94a3b8', lineHeight: 1.4, marginBottom: '12px' }}>
              {t.depositNotice}
            </p>
            
            {/* Invoice box */}
            <div style={{
              backgroundColor: 'rgba(255, 255, 255, 0.03)',
              borderRadius: '8px',
              padding: '12px 16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
              fontSize: '13px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94a3b8' }}>
                <span>{t.totalPrice}</span>
                <span style={{ color: '#fff', fontWeight: 600 }}>${totalPrice.toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '15px', fontWeight: 700 }}>
                <span style={{ color: '#d4af37' }}>{t.depositPrice}</span>
                <span style={{ color: '#d4af37' }}>
                  ${depositUsd.toFixed(2)}
                  {residency === 'local' && (
                    <span style={{ fontSize: '12px', color: '#009b9e', marginLeft: '6px' }}>
                      ({depositUzs.toLocaleString()} UZS)
                    </span>
                  )}
                </span>
              </div>
            </div>
          </div>
        )}

        {errorMsg && (
          <div style={{
            fontSize: '13px',
            color: '#ef4444',
            padding: '10px 14px',
            borderRadius: '8px',
            backgroundColor: 'rgba(239, 68, 68, 0.08)',
            border: '1px solid rgba(239, 68, 68, 0.2)',
            textAlign: 'center'
          }}>
            {errorMsg}
          </div>
        )}

        {/* ═══════════════════════════════════════════
            STEP 1: SELECT RESIDENCY / PAYMENT TRACK
        ════════════════════════════════════════════ */}
        {step === 'select' && !residency && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <span style={{ fontSize: '14px', color: '#cbd5e1', fontWeight: 600 }}>
              {t.residencyQuestion}
            </span>

            {/* Local Track */}
            <button
              onClick={() => setResidency('local')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '16px',
                borderRadius: '12px',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                backgroundColor: 'rgba(255, 255, 255, 0.02)',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#009b9e';
                e.currentTarget.style.backgroundColor = 'rgba(0, 155, 158, 0.05)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.02)';
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Smartphone size={24} style={{ color: '#009b9e' }} />
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  <strong style={{ color: '#fff', fontSize: '14px' }}>{t.localResident}</strong>
                  <span style={{ color: '#64748b', fontSize: '11px' }}>{t.localDesc}</span>
                </div>
              </div>
              <ChevronRight size={18} style={{ color: '#475569' }} />
            </button>

            {/* International Track */}
            <button
              onClick={() => setResidency('international')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '16px',
                borderRadius: '12px',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                backgroundColor: 'rgba(255, 255, 255, 0.02)',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#d4af37';
                e.currentTarget.style.backgroundColor = 'rgba(212, 175, 55, 0.05)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.02)';
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Globe size={24} style={{ color: '#d4af37' }} />
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  <strong style={{ color: '#fff', fontSize: '14px' }}>{t.intlResident}</strong>
                  <span style={{ color: '#64748b', fontSize: '11px' }}>{t.intlDesc}</span>
                </div>
              </div>
              <ChevronRight size={18} style={{ color: '#475569' }} />
            </button>
          </div>
        )}

        {/* ═══════════════════════════════════════════
            STEP 2: SELECT METHOD
        ════════════════════════════════════════════ */}
        {step === 'select' && residency && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <span style={{ fontSize: '14px', color: '#cbd5e1', fontWeight: 600 }}>
              {t.selectMethod}
            </span>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              {residency === 'local' ? (
                <>
                  {/* Payme Selector */}
                  <button
                    onClick={() => { setPaymentMethod('payme'); setStep('form'); }}
                    style={{
                      height: '80px',
                      borderRadius: '10px',
                      border: '1.5px solid rgba(255,255,255,0.08)',
                      backgroundColor: 'rgba(255,255,255,0.02)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.2s ease',
                      outline: 'none'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.borderColor = '#00b0f0'}
                  >
                    {/* Payme Logo */}
                    <img 
                      src="https://cdn.paycom.uz/svg/new_logo.svg" 
                      alt="Payme" 
                      style={{ height: '24px', filter: 'brightness(1.2)' }}
                      onError={(e) => { e.target.outerHTML = '<strong style="color:#00b0f0;font-size:18px;">Payme</strong>'; }}
                    />
                  </button>

                  {/* Click Selector */}
                  <button
                    onClick={() => { setPaymentMethod('click'); simulateClickPayment(); }}
                    style={{
                      height: '80px',
                      borderRadius: '10px',
                      border: '1.5px solid rgba(255,255,255,0.08)',
                      backgroundColor: 'rgba(255,255,255,0.02)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.2s ease',
                      outline: 'none'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.borderColor = '#00a5ff'}
                  >
                    {/* Click Logo */}
                    <img 
                      src="https://click.uz/click/images/click-white.png" 
                      alt="Click" 
                      style={{ height: '24px' }}
                      onError={(e) => { e.target.outerHTML = '<strong style="color:#00a5ff;font-size:18px;">Click</strong>'; }}
                    />
                  </button>
                </>
              ) : (
                <>
                  {/* Stripe Selector */}
                  <button
                    onClick={() => { setPaymentMethod('stripe'); setStep('form'); }}
                    style={{
                      height: '80px',
                      borderRadius: '10px',
                      border: '1.5px solid rgba(255,255,255,0.08)',
                      backgroundColor: 'rgba(255,255,255,0.02)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.2s ease',
                      outline: 'none'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.borderColor = '#635bff'}
                  >
                    <span style={{ fontSize: '18px', fontWeight: 800, color: '#fff', letterSpacing: '1px' }}>
                      Stripe
                    </span>
                  </button>

                  {/* PayPal Selector */}
                  <button
                    onClick={() => { setPaymentMethod('paypal'); simulatePayPalPayment(); }}
                    style={{
                      height: '80px',
                      borderRadius: '10px',
                      border: '1.5px solid rgba(255,255,255,0.08)',
                      backgroundColor: 'rgba(255,255,255,0.02)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.2s ease',
                      outline: 'none'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.borderColor = '#003087'}
                  >
                    <span style={{ fontSize: '18px', fontWeight: 800, color: '#0070ba', fontStyle: 'italic' }}>
                      PayPal
                    </span>
                  </button>
                </>
              )}
            </div>

            <button
              onClick={handleBack}
              style={{
                background: 'none',
                border: 'none',
                color: '#64748b',
                cursor: 'pointer',
                fontSize: '13px',
                textDecoration: 'underline',
                alignSelf: 'center',
                marginTop: '10px'
              }}
            >
              {t.back}
            </button>
          </div>
        )}

        {/* ═══════════════════════════════════════════
            STEP 3: FORM DETAILS & SIMULATION WIDGETS
        ════════════════════════════════════════════ */}
        {step === 'form' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            
            {/* PAYME FORM SIMULATOR */}
            {paymentMethod === 'payme' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {!window.tempPaymeTxId ? (
                  <>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <label style={{ fontSize: '13px', color: '#cbd5e1' }}>{t.phoneLabel}</label>
                      <input
                        type="tel"
                        placeholder="+998901234567"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        style={{
                          backgroundColor: 'rgba(0,0,0,0.3)',
                          border: '1px solid rgba(255,255,255,0.1)',
                          color: '#fff',
                          padding: '10px',
                          borderRadius: '8px',
                          fontSize: '14px',
                          outline: 'none'
                        }}
                      />
                    </div>
                    
                    <button
                      onClick={() => simulatePaymePayment('send_sms')}
                      disabled={loading || !phone}
                      className="btn-gold"
                      style={{
                        padding: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        backgroundColor: '#00b0f0',
                        color: '#fff',
                        fontWeight: '700',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: (loading || !phone) ? 'not-allowed' : 'pointer',
                        opacity: (loading || !phone) ? 0.6 : 1
                      }}
                    >
                      {loading ? <Loader2 size={16} className="animate-spin" /> : null}
                      <span>{t.sendSmsBtn}</span>
                    </button>
                  </>
                ) : (
                  <>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <label style={{ fontSize: '13px', color: '#cbd5e1' }}>
                        {t.smsLabel}{' '}
                        <span style={{ color: '#009b9e', fontSize: '11px' }}>(Enter: 123456)</span>
                      </label>
                      <input
                        type="text"
                        maxLength={6}
                        placeholder="123456"
                        value={smsCode}
                        onChange={(e) => setSmsCode(e.target.value.replace(/\D/g, ''))}
                        style={{
                          backgroundColor: 'rgba(0,0,0,0.3)',
                          border: '1px solid rgba(255,255,255,0.1)',
                          color: '#fff',
                          padding: '12px',
                          borderRadius: '8px',
                          fontSize: '18px',
                          letterSpacing: '4px',
                          textAlign: 'center',
                          outline: 'none'
                        }}
                      />
                    </div>

                    <button
                      onClick={() => simulatePaymePayment('verify_sms')}
                      disabled={loading || smsCode.length < 4}
                      className="btn-gold"
                      style={{
                        padding: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        backgroundColor: '#00b0f0',
                        color: '#fff',
                        fontWeight: '700',
                        borderRadius: '8px',
                        border: 'none',
                        cursor: (loading || smsCode.length < 4) ? 'not-allowed' : 'pointer',
                        opacity: (loading || smsCode.length < 4) ? 0.6 : 1
                      }}
                    >
                      {loading ? <Loader2 size={16} className="animate-spin" /> : null}
                      <span>{t.verifySmsBtn}</span>
                    </button>
                  </>
                )}
              </div>
            )}

            {/* STRIPE FORM SIMULATOR */}
            {paymentMethod === 'stripe' && (
              <form onSubmit={simulateStripePayment} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <span style={{ fontSize: '13px', color: '#fbbf24', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <CreditCard size={14} />
                  {t.cardLabel}
                </span>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <input
                    type="text"
                    required
                    placeholder={t.cardHolderName}
                    value={cardHolder}
                    onChange={(e) => setCardHolder(e.target.value)}
                    style={{
                      backgroundColor: 'rgba(0,0,0,0.3)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      color: '#fff',
                      padding: '10px',
                      borderRadius: '8px',
                      fontSize: '13px'
                    }}
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <input
                    type="text"
                    required
                    maxLength={16}
                    placeholder="Card Number (16 Digits)"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, ''))}
                    style={{
                      backgroundColor: 'rgba(0,0,0,0.3)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      color: '#fff',
                      padding: '10px',
                      borderRadius: '8px',
                      fontSize: '13px'
                    }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <input
                    type="text"
                    required
                    maxLength={5}
                    placeholder="MM/YY"
                    value={cardExpiry}
                    onChange={(e) => setCardExpiry(e.target.value)}
                    style={{
                      backgroundColor: 'rgba(0,0,0,0.3)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      color: '#fff',
                      padding: '10px',
                      borderRadius: '8px',
                      fontSize: '13px',
                      textAlign: 'center'
                    }}
                  />
                  <input
                    type="password"
                    required
                    maxLength={3}
                    placeholder="CVC"
                    value={cardCvc}
                    onChange={(e) => setCardCvc(e.target.value.replace(/\D/g, ''))}
                    style={{
                      backgroundColor: 'rgba(0,0,0,0.3)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      color: '#fff',
                      padding: '10px',
                      borderRadius: '8px',
                      fontSize: '13px',
                      textAlign: 'center'
                    }}
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-gold"
                  style={{
                    padding: '12px',
                    fontSize: '14px',
                    fontWeight: '700',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    borderRadius: '8px',
                    border: 'none',
                    backgroundColor: '#635bff',
                    color: '#fff',
                    cursor: loading ? 'not-allowed' : 'pointer'
                  }}
                >
                  {loading ? <Loader2 size={16} className="animate-spin" /> : <Lock size={14} />}
                  <span>{t.pay} ${depositUsd.toFixed(2)}</span>
                </button>
              </form>
            )}

            <button
              onClick={handleBack}
              disabled={loading}
              style={{
                background: 'none',
                border: 'none',
                color: '#64748b',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontSize: '13px',
                textDecoration: 'underline',
                alignSelf: 'center',
                marginTop: '10px'
              }}
            >
              {t.back}
            </button>
          </div>
        )}

        {/* ═══════════════════════════════════════════
            STEP 4: SUCCESS OVERLAY SCREEN
        ════════════════════════════════════════════ */}
        {step === 'success' && (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            gap: '16px',
            padding: '20px 0'
          }} className="animate-fade-in">
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              backgroundColor: 'rgba(16, 185, 129, 0.15)',
              color: '#10b981',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <CheckCircle size={36} />
            </div>

            <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#fff' }}>
              {t.successTitle}
            </h3>

            <p style={{ fontSize: '13px', color: '#94a3b8', lineHeight: 1.6 }}>
              {t.successDesc}
            </p>
          </div>
        )}

        {/* Secure Transaction Seal Footer */}
        {step !== 'success' && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 14px',
            borderRadius: '6px',
            backgroundColor: 'rgba(16, 185, 129, 0.05)',
            border: '1px solid rgba(16, 185, 129, 0.15)',
            fontSize: '11px',
            color: '#cbd5e1'
          }}>
            <ShieldCheck size={16} style={{ color: '#10b981', flexShrink: 0 }} />
            <span>{t.secTrans}</span>
          </div>
        )}
      </div>
    </div>
  );
}
