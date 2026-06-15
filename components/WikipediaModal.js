'use client';

import React, { useState, useEffect } from 'react';
import { X, BookOpen, Clock, Ticket, MapPin, Check, Plus, ExternalLink, Loader2 } from 'lucide-react';

export default function WikipediaModal({ 
  location, 
  isOpen, 
  onClose, 
  language = 'EN', 
  onToggleLocation, 
  selectedLocations = [] 
}) {
  const [activeLang, setActiveLang] = useState(language.toLowerCase());
  const [loading, setLoading] = useState(false);
  const [wikiData, setWikiData] = useState(null);
  const [error, setError] = useState(null);

  // Set default active language when modal opens or location changes
  useEffect(() => {
    if (location) {
      setActiveLang(language.toLowerCase());
      setWikiData(null);
      setError(null);
    }
  }, [location, language, isOpen]);

  // Fetch Wikipedia summary dynamically
  useEffect(() => {
    if (!location || !isOpen) return;

    let titleKey = '';
    if (activeLang === 'uz') {
      titleKey = location.wikipedia_title_uz || location.name_uz || location.name_en;
    } else if (activeLang === 'ru') {
      titleKey = location.wikipedia_title_ru || location.name_ru || location.name_en;
    } else {
      titleKey = location.wikipedia_title_en || location.name_en;
    }

    // Replace spaces with underscores just in case
    const formattedTitle = titleKey.trim().replace(/\s+/g, '_');

    const fetchWiki = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/wikipedia/summary?title=${encodeURIComponent(formattedTitle)}&lang=${activeLang}`);
        if (!res.ok) {
          throw new Error('Maʼlumotni yuklab boʻlmadi');
        }
        const data = await res.json();
        setWikiData(data);
      } catch (err) {
        console.error('Wiki fetch error:', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchWiki();
  }, [location, activeLang, isOpen]);

  if (!isOpen || !location) return null;

  const isSelected = selectedLocations.some((sel) => sel.id === location.id);

  // Localized texts inside modal
  const text = {
    title: { uz: 'Wikipedia maʼlumotlari', ru: 'Информация из Википедии', en: 'Wikipedia Information' },
    back: { uz: 'Yopish', ru: 'Закрыть', en: 'Close' },
    readMore: { uz: 'Toʻliq maqolani oʻqish', ru: 'Читать полную статью', en: 'Read full article' },
    addToRoute: { uz: 'Marshrutga qoʻshish', ru: 'Добавить в маршрут', en: 'Add to Route' },
    inRoute: { uz: 'Marshrutda', ru: 'В маршруте', en: 'In Route' },
    duration: { uz: 'Taxminiy vaqt', ru: 'Время посещения', en: 'Est. duration' },
    ticket: { uz: 'Kirish chiptasi', ru: 'Входной билет', en: 'Entrance ticket' },
    free: { uz: 'bepul', ru: 'бесплатно', en: 'free' },
    errorText: { 
      uz: 'Wikipedia ensiklopediyasida ushbu joy haqida alohida sahifa topilmadi.', 
      ru: 'В Википедии не найдено отдельной статьи об этом месте.', 
      en: 'No separate Wikipedia article found for this location.' 
    },
    localDesc: { uz: 'Zaxira maʼlumoti:', ru: 'Резервное описание:', en: 'Fallback description:' }
  };

  const getLocalizedValue = (obj) => {
    return obj[activeLang] || obj['en'] || '';
  };

  const name = activeLang === 'ru' ? location.name_ru : activeLang === 'uz' ? location.name_uz : location.name_en;
  const desc = activeLang === 'ru' ? location.description_ru : activeLang === 'uz' ? location.description_uz : location.description_en;
  const imgUrl = wikiData?.image || location.image_url || '/images/locations/registan.webp';

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(5, 7, 16, 0.85)',
      backdropFilter: 'blur(12px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1100,
      padding: '16px',
    }} className="animate-fade-in">
      <div 
        className="glass-container gold-glow"
        style={{
          width: '100%',
          maxWidth: '640px',
          borderRadius: '24px',
          border: '1px solid rgba(var(--primary-blue-rgb), 0.25)',
          backgroundColor: 'var(--bg-card)',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '90vh',
          overflow: 'hidden',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.6)'
        }}
      >
        {/* Header Section */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexShrink: 0
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <BookOpen size={20} style={{ color: 'var(--primary-blue)' }} />
            <span style={{ fontSize: '16px', fontWeight: '800', color: 'var(--primary-blue)', letterSpacing: '0.5px' }}>
              {getLocalizedValue(text.title)}
            </span>
          </div>
          <button 
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              padding: '6px',
              borderRadius: '50%',
              backgroundColor: 'rgba(255,255,255,0.03)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.color = '#fff'}
            onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
          >
            <X size={18} />
          </button>
        </div>

        {/* Banner / Tab selector */}
        <div style={{
          padding: '12px 24px',
          backgroundColor: 'rgba(10, 15, 29, 0.4)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
          display: 'flex',
          justifyContent: 'center',
          gap: '10px',
          flexShrink: 0
        }}>
          {['uz', 'ru', 'en'].map((lng) => {
            const isActive = activeLang === lng;
            return (
              <button
                key={lng}
                onClick={() => setActiveLang(lng)}
                style={{
                  padding: '6px 16px',
                  borderRadius: '10px',
                  border: isActive ? '1px solid rgba(255, 91, 0, 0.4)' : '1px solid transparent',
                  background: isActive ? 'rgba(255, 91, 0, 0.12)' : 'rgba(255, 255, 255, 0.03)',
                  color: isActive ? 'var(--primary-blue)' : 'var(--text-secondary)',
                  fontSize: '12.5px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  textTransform: 'uppercase',
                  transition: 'all 0.2s'
                }}
              >
                {lng}
              </button>
            );
          })}
        </div>

        {/* Main Content Area */}
        <div 
          className="no-scrollbar"
          style={{
            padding: '24px',
            overflowY: 'auto',
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            gap: '20px'
          }}
        >
          {/* Cover Image */}
          <div style={{
            width: '100%',
            height: '240px',
            borderRadius: '16px',
            overflow: 'hidden',
            position: 'relative',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
            flexShrink: 0
          }}>
            <img 
              src={imgUrl} 
              alt={name} 
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover'
              }}
            />
            <div style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              background: 'linear-gradient(to top, rgba(0, 0, 0, 0.75), transparent)',
              padding: '16px 20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '4px'
            }}>
              <h3 style={{ margin: 0, fontSize: '20px', fontWeight: '800', color: '#fff', textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
                {wikiData?.title || name}
              </h3>
              {wikiData?.description && (
                <span style={{ fontSize: '12.5px', color: 'var(--primary-blue)', fontWeight: '600' }}>
                  {wikiData.description}
                </span>
              )}
            </div>
          </div>

          {/* Quick Info Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
            gap: '10px',
            backgroundColor: 'rgba(255, 255, 255, 0.02)',
            padding: '14px 18px',
            borderRadius: '14px',
            border: '1px solid rgba(255, 255, 255, 0.04)'
          }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <span style={{ fontSize: '10.5px', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>
                {getLocalizedValue(text.duration)}
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#fff', fontSize: '13px', fontWeight: '600' }}>
                <Clock size={14} style={{ color: 'var(--primary-blue)' }} />
                <span>
                  {location.estimated_duration 
                    ? (activeLang === 'uz' ? `${location.estimated_duration} daqiqa` : activeLang === 'ru' ? `${location.estimated_duration} мин` : `${location.estimated_duration} mins`) 
                    : '—'}
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <span style={{ fontSize: '10.5px', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>
                {getLocalizedValue(text.ticket)}
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#fff', fontSize: '13px', fontWeight: '600' }}>
                <Ticket size={14} style={{ color: 'var(--primary-blue)' }} />
                <span>
                  {parseFloat(location.ticket_price) > 0 
                    ? `$${parseFloat(location.ticket_price).toFixed(2)}` 
                    : getLocalizedValue(text.free)}
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <span style={{ fontSize: '10.5px', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>
                📍 Hudud
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#fff', fontSize: '13px', fontWeight: '600' }}>
                <MapPin size={14} style={{ color: 'var(--primary-blue)' }} />
                <span style={{ textTransform: 'capitalize' }}>
                  {location.region || 'samarqand'}
                </span>
              </div>
            </div>
          </div>

          {/* Description Section */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {loading ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 0', gap: '12px' }}>
                <Loader2 size={32} className="animate-spin" style={{ color: 'var(--primary-blue)' }} />
                <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                  {activeLang === 'uz' ? 'Wikipediaʼdan maʼlumot yuklanmoqda...' : activeLang === 'ru' ? 'Загрузка данных из Википедии...' : 'Loading Wikipedia summary...'}
                </span>
              </div>
            ) : error ? (
              // Fallback to local db description if wiki fails
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{
                  padding: '12px 16px',
                  backgroundColor: 'rgba(239, 68, 68, 0.05)',
                  border: '1px solid rgba(239, 68, 68, 0.2)',
                  borderRadius: '10px',
                  fontSize: '12px',
                  color: '#f87171',
                  textAlign: 'center'
                }}>
                  {getLocalizedValue(text.errorText)}
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <span style={{ fontSize: '11px', color: 'var(--primary-blue)', fontWeight: '700', textTransform: 'uppercase' }}>
                    {getLocalizedValue(text.localDesc)}
                  </span>
                  <p style={{ margin: 0, fontSize: '13.5px', color: '#cbd5e1', lineHeight: '1.6', fontWeight: '400' }}>
                    {desc}
                  </p>
                </div>
              </div>
            ) : (
              // Wikipedia text content
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <p 
                  style={{
                    margin: 0,
                    fontSize: '14px',
                    color: '#cbd5e1',
                    lineHeight: '1.65',
                    fontWeight: '400',
                    textAlign: 'justify'
                  }}
                  dangerouslySetInnerHTML={{ __html: wikiData?.extract_html || wikiData?.extract || desc }}
                />

                {/* Read more external link button */}
                {wikiData?.desktopUrl && (
                  <a 
                    href={wikiData.desktopUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      alignSelf: 'flex-start',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      color: 'var(--primary-blue)',
                      fontSize: '13px',
                      fontWeight: '700',
                      textDecoration: 'none',
                      padding: '4px 0',
                      borderBottom: '1.5px solid transparent',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.borderBottomColor = 'var(--primary-blue)'}
                    onMouseLeave={(e) => e.currentTarget.style.borderBottomColor = 'transparent'}
                  >
                    <span>{getLocalizedValue(text.readMore)}</span>
                    <ExternalLink size={13} />
                  </a>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div style={{
          padding: '20px 24px',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          gap: '12px',
          flexShrink: 0
        }}>
          <button
            onClick={onClose}
            style={{
              padding: '12px 20px',
              borderRadius: '12px',
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              color: '#cbd5e1',
              fontSize: '13.5px',
              fontWeight: '700',
              cursor: 'pointer',
              flex: 1,
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.08)';
              e.currentTarget.style.color = '#fff';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
              e.currentTarget.style.color = '#cbd5e1';
            }}
          >
            {getLocalizedValue(text.back)}
          </button>

          <button
            onClick={() => onToggleLocation(location)}
            style={{
              padding: '12px 20px',
              borderRadius: '12px',
              backgroundColor: isSelected ? 'rgba(239, 68, 68, 0.15)' : 'var(--primary-blue)',
              border: isSelected ? '1px solid #ef4444' : '1px solid var(--primary-blue)',
              color: isSelected ? '#ef4444' : 'var(--bg-card)',
              fontSize: '13.5px',
              fontWeight: '800',
              cursor: 'pointer',
              flex: 1.5,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              transition: 'all 0.2s',
              boxShadow: isSelected ? 'none' : '0 4px 14px rgba(255, 91, 0, 0.3)'
            }}
            onMouseEnter={(e) => {
              if (isSelected) {
                e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.25)';
              } else {
                e.currentTarget.style.backgroundColor = 'var(--deep-turquoise)';
                e.currentTarget.style.boxShadow = '0 6px 20px rgba(255, 91, 0, 0.45)';
              }
            }}
            onMouseLeave={(e) => {
              if (isSelected) {
                e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.15)';
              } else {
                e.currentTarget.style.backgroundColor = 'var(--primary-blue)';
                e.currentTarget.style.boxShadow = '0 4px 14px rgba(255, 91, 0, 0.3)';
              }
            }}
          >
            {isSelected ? (
              <>
                <Check size={16} />
                <span>{getLocalizedValue(text.inRoute)}</span>
              </>
            ) : (
              <>
                <Plus size={16} />
                <span>{getLocalizedValue(text.addToRoute)}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
