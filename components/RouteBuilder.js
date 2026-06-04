'use client';

import React from 'react';
import { MapPin, Check, Plus } from 'lucide-react';
import { ThreeDHistorical, ThreeDNature, ThreeDDining } from './icons/ThreeDIcons';

const CATEGORIES = {
  historical: {
    EN: 'Historical Sights',
    RU: 'Исторические достопримечательности',
    UZ: 'Tarixiy obidalar',
    icon: ThreeDHistorical,
    color: '#0070c0',
  },
  alternative: {
    EN: 'Alternative & Nature',
    RU: 'Альтернативные места и Природа',
    UZ: 'Tabiat va madaniyat',
    icon: ThreeDNature,
    color: '#009b9e',
  },
  food: {
    EN: 'Local Food & Dining',
    RU: 'Национальная кухня',
    UZ: 'Milliy taomlar',
    icon: ThreeDDining,
    color: '#d4af37',
  },
};

const LOCATION_IMAGES = {
  1: '/images/locations/registan.webp',
  2: '/images/locations/gureamir.webp',
  3: '/images/locations/shahizinda.webp',
  4: '/images/locations/bibikhanym.webp',
  5: '/images/locations/ulughbeg.webp',
  6: '/images/locations/urgut_mountains.webp',
  7: '/images/locations/omonqoton.webp',
  8: '/images/locations/konigil.webp',
  9: '/images/locations/osh_center.webp',
  10: '/images/locations/bread_bakery.webp',
  11: '/images/locations/karimbek_restaurant.webp'
};

function getLocationImage(id, imageUrl) {
  return imageUrl || LOCATION_IMAGES[id] || '/images/locations/registan.webp';
}

const formatDuration = (mins, lang) => {
  if (!mins) return '';
  const hours = mins / 60;
  if (lang === 'UZ') {
    return hours >= 1 
      ? `${Number(hours.toFixed(1))} soat` 
      : `${mins} daqiqa`;
  } else if (lang === 'RU') {
    return hours >= 1 
      ? `${Number(hours.toFixed(1))} ч.` 
      : `${mins} мин.`;
  } else {
    return hours >= 1 
      ? `${Number(hours.toFixed(1))} hrs` 
      : `${mins} mins`;
  }
};

export default function RouteBuilder({ 
  locations = [], 
  selectedLocations = [], 
  onToggleLocation, 
  language = 'EN' 
}) {
  
  // Group locations by category
  const groupedLocations = locations.reduce((acc, loc) => {
    if (!acc[loc.category]) acc[loc.category] = [];
    acc[loc.category].push(loc);
    return acc;
  }, {});

  const t = {
    addToRoute: language === 'UZ' ? 'Marshrutga qo\'shish' : language === 'RU' ? 'Добавить в маршрут' : 'Add to Route',
    inRoute: language === 'UZ' ? 'Marshrutda' : language === 'RU' ? 'В маршруте' : 'In Route',
    mountainArea: language === 'UZ' ? '🏔 Tog\' tarifi' : language === 'RU' ? '🏔 Горный тариф' : '🏔 Mountain Rate',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {Object.entries(CATEGORIES).map(([catKey, catInfo]) => {
        const catLocations = groupedLocations[catKey] || [];
        if (catLocations.length === 0) return null;

        const IconComponent = catInfo.icon;
        const categoryTitle = catInfo[language] || catInfo.EN;

        return (
          <div key={catKey} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '12px',
              color: catInfo.color, 
              fontWeight: 600,
              fontSize: '15px',
              borderBottom: `1.5px solid var(--border-card)`,
              paddingBottom: '10px'
            }}>
              {/* Interactive 3D Icon */}
              <div className="icon-3d-container" style={{ '--hover-accent': catInfo.color }}>
                <div className="icon-3d-card" style={{ width: '36px', height: '36px', borderRadius: '8px' }}>
                  <IconComponent size={24} className="icon-3d-svg" />
                </div>
              </div>
              <span>{categoryTitle}</span>
            </div>

            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', 
              gap: '14px' 
            }}>
              {catLocations.map((loc) => {
                const isSelected = selectedLocations.some((sel) => sel.id === loc.id);
                const name = language === 'RU' ? loc.name_ru : language === 'UZ' ? loc.name_uz : loc.name_en;
                const desc = language === 'RU' ? loc.description_ru : language === 'UZ' ? loc.description_uz : loc.description_en;
                
                // Get custom selection class based on location category
                const selectionClass = isSelected ? `selected-card-${catKey}` : '';

                return (
                  <div 
                    key={loc.id} 
                    className={`glass-container animate-fade-in ${selectionClass}`}
                    style={{
                      padding: '14px',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      gap: '12px',
                      borderRadius: '16px',
                      height: '100%'
                    }}
                  >
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', flex: 1 }}>
                      {/* Location Thumbnail Card Header */}
                      <div style={{ 
                        width: '100%', 
                        height: '140px', 
                        borderRadius: '10px', 
                        overflow: 'hidden', 
                        flexShrink: 0,
                        position: 'relative',
                        border: '1px solid rgba(255, 255, 255, 0.05)',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
                      }}>
                        {loc.is_out_of_city && (
                          <span style={{
                            position: 'absolute',
                            top: '8px',
                            left: '8px',
                            zIndex: 2,
                            backgroundColor: 'rgba(212, 175, 55, 0.92)',
                            color: '#0a0f1d',
                            fontSize: '10px',
                            fontWeight: '700',
                            padding: '3px 8px',
                            borderRadius: '6px',
                            border: '1px solid rgba(255, 255, 255, 0.25)',
                            boxShadow: '0 2px 6px rgba(0,0,0,0.3)'
                          }}>
                            {t.mountainArea}
                          </span>
                        )}

                        {loc.estimated_duration && (
                          <span style={{
                            position: 'absolute',
                            top: '8px',
                            right: '8px',
                            zIndex: 2,
                            backgroundColor: 'rgba(10, 15, 29, 0.82)',
                            backdropFilter: 'blur(4px)',
                            color: '#fff',
                            fontSize: '10px',
                            fontWeight: '600',
                            padding: '3px 8px',
                            borderRadius: '6px',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}>
                            ⏱️ {formatDuration(loc.estimated_duration, language)}
                          </span>
                        )}

                        <img 
                          src={getLocationImage(loc.id, loc.image_url)} 
                          alt={name} 
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            transition: 'transform 0.4s ease',
                          }}
                          className="location-card-img"
                        />
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 }}>
                        <span style={{ fontWeight: 700, fontSize: '15px', color: 'var(--text-primary)' }}>
                          {name}
                        </span>
                        <span style={{ 
                          fontSize: '12px', 
                          color: 'var(--text-secondary)', 
                          lineHeight: 1.45,
                          display: '-webkit-box',
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden'
                        }}>
                          {desc}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => onToggleLocation(loc)}
                      style={{
                        backgroundColor: isSelected ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                        border: isSelected ? '1px solid #10b981' : '1px solid var(--border-card)',
                        color: isSelected ? '#10b981' : 'var(--text-primary)',
                        padding: '8px 12px',
                        borderRadius: '8px',
                        fontSize: '12.5px',
                        fontWeight: '600',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        width: '100%'
                      }}
                    >
                      {isSelected ? (
                        <>
                          <Check size={15} />
                          <span>{t.inRoute}</span>
                        </>
                      ) : (
                        <>
                          <Plus size={15} />
                          <span>{t.addToRoute}</span>
                        </>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
