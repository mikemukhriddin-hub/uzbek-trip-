'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Languages, 
  Sun, 
  Cloud, 
  CloudRain, 
  ChevronLeft, 
  ChevronRight, 
  Calendar, 
  Compass, 
  Info, 
  TrendingUp, 
  DollarSign, 
  PhoneCall, 
  AlertTriangle,
  Award,
  BookOpen
} from 'lucide-react';
import BackgroundGraphics from '@/components/BackgroundGraphics';

const SLIDES = [
  {
    image: '/images/discover/uzb_nature_slide1.png',
    title_en: 'Majestic Urgut Mountains',
    title_ru: 'Величественные горы Ургута',
    desc_en: 'Explore the stunning high-altitude pine forests, ancient caves, and refreshing cold springs of the Samarkand region hills.',
    desc_ru: 'Исследуйте потрясающие высокогорные сосновые леса, древние пещеры и освежающие прохладные родники Самаркандской области.'
  },
  {
    image: '/images/discover/uzb_culture_slide2.png',
    title_en: 'Traditional Crafts & Ceramics',
    title_ru: 'Традиционные ремесла и керамика',
    desc_en: 'The rich heritage of Uzbek craftsmanship: stunning blue Rishtan pottery and gold embroidery woven with ancient patterns.',
    desc_ru: 'Богатое наследие узбекского мастерства: изысканная синяя риштанская керамика и золотая вышивка, вытканная древними узорами.'
  },
  {
    image: '/images/discover/uzb_registan_slide3.png',
    title_en: 'Golden Sunset at Registan',
    title_ru: 'Золотой закат на Регистане',
    desc_en: 'Stand before the three grand madrasahs, glowingly illuminated in golden hues as the sun sets over the ancient Silk Road hub.',
    desc_ru: 'Встаньте перед тремя грандиозными медресе, светящимися золотыми оттенками во время заката над древним центром Шелкового пути.'
  }
];

const EVENTS = [
  {
    id: 1,
    title_en: 'Navruz Spring Festival',
    title_ru: 'Весенний фестиваль Навруз',
    date_en: 'March 21',
    date_ru: '21 Марта',
    desc_en: 'The Persian New Year welcoming spring. Celebrate with sumalak (sweet wheat paste), traditional folk music, and tightrope walkers.',
    desc_ru: 'Восточный Новый год, встречающий весну. Празднование с сумаляком, традиционной народной музыкой и канатоходцами.'
  },
  {
    id: 2,
    title_en: 'Silk and Spices Festival',
    title_ru: 'Фестиваль Шёлка и Специй',
    date_en: 'Late May / June',
    date_ru: 'Конец Мая / Июнь',
    desc_en: 'An annual celebration showcasing traditional silk-weaving, handmade carpets, spice bazaars, and national folklore bands.',
    desc_ru: 'Ежегодное празднование, демонстрирующее традиционное шелкоткачество, ковры ручной работы, базары специй и фольклор.'
  },
  {
    id: 3,
    title_en: 'Sharq Taronalari Music Festival',
    title_ru: 'Музыкальный фестиваль Шарк Тароналари',
    date_en: 'Late August (Biennial)',
    date_ru: 'Конец Августа (Раз в два года)',
    desc_en: 'One of Central Asia\'s largest international music festivals, hosted right on the majestic Registan Square stage in Samarkand.',
    desc_ru: 'Один из крупнейших международных музыкальных фестивалей в Центральной Азии, проходящий на величественной площади Регистан.'
  },
  {
    id: 4,
    title_en: 'Samarkand Marathon',
    title_ru: 'Самаркандский марафон',
    date_en: 'Early November',
    date_ru: 'Начало Ноября',
    desc_en: 'A charitable sporting event where participants run scenic routes through historical monuments and ancient city gates.',
    desc_ru: 'Благотворительное спортивное мероприятие, участники которого пробегают по живописным маршрутам мимо исторических памятников.'
  }
];

export default function DiscoverPage() {
  const [language, setLanguage] = useState('EN');
  const [activeSlide, setActiveSlide] = useState(0);
  const [usdAmount, setUsdAmount] = useState('100');
  const [uzsAmount, setUzsAmount] = useState('1280000');
  
  const EXCHANGE_RATE = 12800; // 1 USD = 12,800 UZS

  // Sync state loaded from localStorage if user was previously reading in RU
  useEffect(() => {
    // Basic local language check
    const savedLang = localStorage.getItem('site_lang');
    if (savedLang) setLanguage(savedLang);
  }, []);

  const handleLanguageToggle = () => {
    const nextLang = language === 'EN' ? 'RU' : 'EN';
    setLanguage(nextLang);
    localStorage.setItem('site_lang', nextLang);
  };

  // Slideshow Auto-play
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % SLIDES.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const prevSlide = () => {
    setActiveSlide((prev) => (prev === 0 ? SLIDES.length - 1 : prev - 1));
  };

  const nextSlide = () => {
    setActiveSlide((prev) => (prev + 1) % SLIDES.length);
  };

  const handleUsdChange = (val) => {
    setUsdAmount(val);
    if (!isNaN(val) && val !== '') {
      setUzsAmount((parseFloat(val) * EXCHANGE_RATE).toFixed(0));
    } else {
      setUzsAmount('');
    }
  };

  const handleUzsChange = (val) => {
    setUzsAmount(val);
    if (!isNaN(val) && val !== '') {
      setUsdAmount((parseFloat(val) / EXCHANGE_RATE).toFixed(2));
    } else {
      setUsdAmount('');
    }
  };

  const t = {
    backBtn: language === 'RU' ? 'Вернуться назад' : 'Back to route builder',
    pageTitle: language === 'RU' ? 'Гид для Путешественников' : 'Traveler Discover Hub',
    pageSubtitle: language === 'RU' 
      ? 'Актуальная информация, погода, праздники и культурное наследие Самарканда'
      : 'Real-time weather, cultural festivals, slideshows, and local travel advice',
    
    // Weather
    weatherTitle: language === 'RU' ? '🌤 Погода в Самарканде' : '🌤 Samarkand Weather',
    weatherDesc: language === 'RU' ? 'Ясно, солнечный день' : 'Clear & sunny sky',
    weatherTipTitle: language === 'RU' ? 'Совет по одежде:' : 'Attire Suggestion:',
    weatherTipDesc: language === 'RU' 
      ? 'Идеальная погода для экскурсий. Рекомендуем легкую хлопковую одежду, солнцезащитные очки и крем от солнца. Головной убор обязателен!'
      : 'Perfect weather for walking. Light cotton clothes, sunglasses, and sunblock are recommended. A hat is highly advised!',
    weatherForecast: language === 'RU' ? 'Прогноз на 3 дня:' : '3-Day Forecast:',
    tomorrow: language === 'RU' ? 'Завтра' : 'Tomorrow',
    dayAfter: language === 'RU' ? 'Послезавтра' : 'Day After',
    dayThree: language === 'RU' ? '3-й День' : '3rd Day',

    // Events
    eventsTitle: language === 'RU' ? '🎉 Предстоящие Фестивали' : '🎉 Upcoming Festivals',
    eventsSub: language === 'RU' 
      ? 'Планируйте свое путешествие под крупные культурные события'
      : 'Plan your custom itinerary around major events',

    // Slideshow
    slideshowTitle: language === 'RU' ? '📸 Галерея Узбекистана' : '📸 Uzbekistan Showcase',

    // Useful Tips
    tipsTitle: language === 'RU' ? '💡 Советы путешественнику' : '💡 Travel Tips & Info',
    etiquetteTitle: language === 'RU' ? '🕌 Культурный этикет' : '🕌 Local Etiquette',
    etiquetteDesc: language === 'RU'
      ? 'При посещении действующих мечетей и мавзолеев закрывайте плечи и колени. Женщинам рекомендуется взять легкий платок на голову.'
      : 'Cover shoulders and knees when visiting active mosques and shrines. Women are advised to bring a light headscarf.',
    
    currencyTitle: language === 'RU' ? '💵 Конвертер валют (UZS)' : '💵 UZS Currency Exchange',
    currencySub: language === 'RU' 
      ? 'Курс обмена: $1 ≈ 12,800 сум (оценочно)'
      : 'Exchange rate: $1 ≈ 12,800 UZS (estimated)',
    
    contactsTitle: language === 'RU' ? '📞 Экстренные контакты' : '📞 Emergency Contacts',
    contactsDesc: language === 'RU'
      ? 'Туристическая полиция: 1173\nЕдиная экстренная служба: 112\nКод страны: +998'
      : 'Tourist Police: 1173\nUniversal Emergency: 112\nCountry Code: +998'
  };

  return (
    <main style={{ width: '100%', minHeight: '100vh', padding: '16px', display: 'flex', flexDirection: 'column', backgroundColor: '#0a0f1d', color: '#fff', position: 'relative', overflowX: 'hidden' }}>
      <BackgroundGraphics />

      {/* 🕌 Premium Sticky Header */}
      <header className="glass-container" style={{
        padding: '16px 24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        border: '1px solid rgba(212,175,55,0.15)',
        borderRadius: '16px',
        position: 'sticky',
        top: '16px',
        zIndex: 100,
        maxWidth: '1280px',
        width: '100%',
        margin: '0 auto 24px auto'
      }}>
        <Link href="/" style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          color: '#cbd5e1',
          textDecoration: 'none',
          fontSize: '13px',
          fontWeight: '600',
          transition: 'color 0.2s'
        }}
        onMouseEnter={(e) => e.currentTarget.style.color = '#d4af37'}
        onMouseLeave={(e) => e.currentTarget.style.color = '#cbd5e1'}
        >
          <ArrowLeft size={16} />
          <span>{t.backBtn}</span>
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Compass size={20} className="animate-spin" style={{ color: '#d4af37', animationDuration: '20s' }} />
          <span style={{ fontSize: '16px', fontWeight: 800, letterSpacing: '0.05em', color: '#fff' }}>
            SAMARQAND <span style={{ color: '#d4af37' }}>DISCOVER</span>
          </span>
        </div>

        <button
          onClick={handleLanguageToggle}
          style={{
            padding: '8px 16px',
            borderRadius: '10px',
            backgroundColor: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.1)',
            color: '#fff',
            fontSize: '12px',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'all 0.2s ease'
          }}
        >
          <Languages size={14} style={{ color: '#d4af37' }} />
          <span>{language === 'EN' ? 'Русский (RU)' : 'English (EN)'}</span>
        </button>
      </header>

      {/* Main Grid Content */}
      <div style={{
        maxWidth: '1280px',
        width: '100%',
        margin: '0 auto',
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        gap: '32px'
      }}>
        
        {/* Title Section */}
        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '12px' }}>
          <h1 style={{ fontSize: '32px', fontWeight: 800, color: '#fff', letterSpacing: '0.02em' }}>
            {t.pageTitle}
          </h1>
          <p style={{ fontSize: '15px', color: '#94a3b8', maxWidth: '600px', margin: '0 auto', lineHeight: 1.5 }}>
            {t.pageSubtitle}
          </p>
        </div>

        {/* Top Split Layout: Slideshow (Left) & Weather (Right) */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '24px'
        }}>
          
          {/* 📸 Cultural / Nature Slideshow */}
          <section className="glass-container gold-glow" style={{
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            minHeight: '400px'
          }}>
            <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Award size={18} style={{ color: '#d4af37' }} />
              {t.slideshowTitle}
            </h2>

            {/* Slider Viewport */}
            <div style={{
              position: 'relative',
              width: '100%',
              height: '240px',
              borderRadius: '12px',
              overflow: 'hidden',
              border: '1px solid rgba(255,255,255,0.06)'
            }}>
              {/* Slide Image */}
              <img 
                src={SLIDES[activeSlide].image} 
                alt={SLIDES[activeSlide].title_en}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  transition: 'opacity 0.5s ease-in-out'
                }}
              />

              {/* Navigation overlays */}
              <button 
                onClick={prevSlide}
                style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(5, 7, 16, 0.65)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  zIndex: 10
                }}
              >
                <ChevronLeft size={16} />
              </button>

              <button 
                onClick={nextSlide}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(5, 7, 16, 0.65)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  zIndex: 10
                }}
              >
                <ChevronRight size={16} />
              </button>

              {/* Page dots indicators */}
              <div style={{
                position: 'absolute',
                bottom: '12px',
                left: '50%',
                transform: 'translateX(-50%)',
                display: 'flex',
                gap: '8px',
                zIndex: 10
              }}>
                {SLIDES.map((_, idx) => (
                  <div 
                    key={idx}
                    onClick={() => setActiveSlide(idx)}
                    style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      backgroundColor: idx === activeSlide ? '#d4af37' : 'rgba(255,255,255,0.3)',
                      cursor: 'pointer',
                      transition: 'background-color 0.2s'
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Slide Information */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }} className="animate-fade-in">
              <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#d4af37' }}>
                {language === 'RU' ? SLIDES[activeSlide].title_ru : SLIDES[activeSlide].title_en}
              </h3>
              <p style={{ fontSize: '13px', color: '#94a3b8', lineHeight: 1.5 }}>
                {language === 'RU' ? SLIDES[activeSlide].desc_ru : SLIDES[activeSlide].desc_en}
              </p>
            </div>
          </section>

          {/* 🌤 Interactive Weather Widget */}
          <section className="glass-container gold-glow" style={{
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            justifyContent: 'space-between'
          }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Sun size={18} style={{ color: '#fbbf24' }} />
                {t.weatherTitle}
              </h2>

              {/* Main Weather Display */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '20px', backgroundColor: 'rgba(10, 15, 29, 0.4)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.03)' }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '10px',
                  backgroundColor: 'rgba(251, 191, 36, 0.12)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fbbf24'
                }}>
                  <Sun size={28} className="animate-spin" style={{ animationDuration: '30s' }} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '28px', fontWeight: '800', color: '#fff', lineHeight: 1 }}>
                    28°C <span style={{ fontSize: '14px', fontWeight: '400', color: '#94a3b8' }}>/ 82°F</span>
                  </span>
                  <span style={{ fontSize: '13px', color: '#009b9e', fontWeight: '600', marginTop: '4px' }}>
                    {t.weatherDesc}
                  </span>
                </div>
              </div>

              {/* Advice */}
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '4px',
                fontSize: '13px',
                lineHeight: 1.5,
                backgroundColor: 'rgba(212, 175, 55, 0.05)',
                borderLeft: '3px solid #d4af37',
                padding: '12px',
                borderRadius: '0 8px 8px 0'
              }}>
                <strong style={{ color: '#d4af37' }}>{t.weatherTipTitle}</strong>
                <span style={{ color: '#e2e8f0' }}>{t.weatherTipDesc}</span>
              </div>
            </div>

            {/* 3-day forecast */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <span style={{ fontSize: '12px', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {t.weatherForecast}
              </span>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', padding: '10px', backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.04)' }}>
                  <span style={{ fontSize: '11px', color: '#94a3b8' }}>{t.tomorrow}</span>
                  <Sun size={16} style={{ color: '#fbbf24' }} />
                  <strong style={{ fontSize: '13px', color: '#fff' }}>29°C</strong>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', padding: '10px', backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.04)' }}>
                  <span style={{ fontSize: '11px', color: '#94a3b8' }}>{t.dayAfter}</span>
                  <Cloud size={16} style={{ color: '#94a3b8' }} />
                  <strong style={{ fontSize: '13px', color: '#fff' }}>27°C</strong>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', padding: '10px', backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.04)' }}>
                  <span style={{ fontSize: '11px', color: '#94a3b8' }}>{t.dayThree}</span>
                  <Sun size={16} style={{ color: '#fbbf24' }} />
                  <strong style={{ fontSize: '13px', color: '#fff' }}>30°C</strong>
                </div>
              </div>
            </div>

          </section>

        </div>

        {/* Middle Section: Festival & Events Calendar */}
        <section className="glass-container gold-glow" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Calendar size={18} style={{ color: '#d4af37' }} />
              {t.eventsTitle}
            </h2>
            <p style={{ fontSize: '12px', color: '#94a3b8' }}>{t.eventsSub}</p>
          </div>

          {/* Events Grid layout */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '16px'
          }}>
            {EVENTS.map((evt) => (
              <div 
                key={evt.id}
                style={{
                  padding: '16px',
                  backgroundColor: 'rgba(10, 15, 29, 0.4)',
                  borderRadius: '12px',
                  border: '1px solid rgba(212, 175, 55, 0.1)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                  transition: 'transform 0.2s, border-color 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.borderColor = 'rgba(212, 175, 55, 0.3)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.borderColor = 'rgba(212, 175, 55, 0.1)';
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '6px' }}>
                  <span style={{ fontSize: '11px', fontWeight: '700', color: '#009b9e', backgroundColor: 'rgba(0, 155, 158, 0.1)', padding: '2px 8px', borderRadius: '6px' }}>
                    {language === 'RU' ? evt.date_ru : evt.date_en}
                  </span>
                </div>
                <h4 style={{ fontSize: '14px', fontWeight: '700', color: '#fff' }}>
                  {language === 'RU' ? evt.title_ru : evt.title_en}
                </h4>
                <p style={{ fontSize: '12px', color: '#94a3b8', lineHeight: 1.5 }}>
                  {language === 'RU' ? evt.desc_ru : evt.desc_en}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Bottom Section: Info Grid (Etiquette, Currency Converter, Contacts) */}
        <section style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <BookOpen size={18} style={{ color: '#d4af37' }} />
            {t.tipsTitle}
          </h2>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '24px'
          }}>
            
            {/* 🕌 Cultural Etiquette Card */}
            <div className="glass-container gold-glow" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#d4af37', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Info size={16} />
                {t.etiquetteTitle}
              </h3>
              <p style={{ fontSize: '13px', color: '#cbd5e1', lineHeight: 1.6 }}>
                {t.etiquetteDesc}
              </p>
              <div style={{ display: 'flex', gap: '8px', fontSize: '12px', color: '#94a3b8', backgroundColor: 'rgba(255,255,255,0.02)', padding: '10px', borderRadius: '8px', border: '1px dashed rgba(255,255,255,0.06)' }}>
                <AlertTriangle size={14} style={{ color: '#ef4444', flexShrink: 0 }} />
                <span>
                  {language === 'RU' 
                    ? 'Снимайте обувь при входе в священные склепы и мечети.' 
                    : 'Remove shoes when entering sacred crypts or active prayer halls.'}
                </span>
              </div>
            </div>

            {/* 💵 Currency Converter */}
            <div className="glass-container gold-glow" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#d4af37', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <TrendingUp size={16} />
                {t.currencyTitle}
              </h3>
              <span style={{ fontSize: '11px', color: '#94a3b8' }}>
                {t.currencySub}
              </span>

              {/* Conversion Inputs */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: 'rgba(10,15,29,0.5)', padding: '6px 12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <DollarSign size={14} style={{ color: '#94a3b8' }} />
                  <input 
                    type="number" 
                    value={usdAmount}
                    onChange={(e) => handleUsdChange(e.target.value)}
                    placeholder="USD"
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#fff',
                      fontSize: '14px',
                      width: '100%',
                      outline: 'none'
                    }}
                  />
                  <span style={{ fontSize: '12px', color: '#94a3b8', fontWeight: '700' }}>USD</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: 'rgba(10,15,29,0.5)', padding: '6px 12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <span style={{ fontSize: '14px', color: '#94a3b8', paddingLeft: '4px' }}>сум</span>
                  <input 
                    type="number" 
                    value={uzsAmount}
                    onChange={(e) => handleUzsChange(e.target.value)}
                    placeholder="UZS"
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#fff',
                      fontSize: '14px',
                      width: '100%',
                      outline: 'none'
                    }}
                  />
                  <span style={{ fontSize: '12px', color: '#94a3b8', fontWeight: '700' }}>UZS</span>
                </div>
              </div>
            </div>

            {/* 📞 Contacts Card */}
            <div className="glass-container gold-glow" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#d4af37', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <PhoneCall size={16} />
                {t.contactsTitle}
              </h3>
              <p style={{ fontSize: '13px', color: '#cbd5e1', lineHeight: 1.6, whiteSpace: 'pre-line' }}>
                {t.contactsDesc}
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: 'rgba(0,155,158,0.06)', border: '1px solid rgba(0,155,158,0.2)', padding: '10px', borderRadius: '8px', color: '#009b9e', fontSize: '12px', fontWeight: '600' }}>
                <Compass size={14} />
                <span>
                  {language === 'RU' 
                    ? 'Служба поддержки туриста работает 24/7' 
                    : 'Tourist Helpline is active 24/7'}
                </span>
              </div>
            </div>

          </div>
        </section>

      </div>
    </main>
  );
}
