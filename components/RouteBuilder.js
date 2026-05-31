'use client';

import React from 'react';
import { MapPin, Check, Plus } from 'lucide-react';
import { ThreeDHistorical, ThreeDNature, ThreeDDining } from './icons/ThreeDIcons';

const CATEGORIES = {
  historical: {
    EN: 'Historical Sights',
    RU: 'Исторические достопримечательности',
    icon: ThreeDHistorical,
    color: '#0070c0',
  },
  alternative: {
    EN: 'Alternative & Nature',
    RU: 'Альтернативные места и Природа',
    icon: ThreeDNature,
    color: '#009b9e',
  },
  food: {
    EN: 'Local Food & Dining',
    RU: 'Национальная кухня',
    icon: ThreeDDining,
    color: '#d4af37',
  },
};

const LOCATION_IMAGES = {
  1: '/images/locations/registan.png',
  2: '/images/locations/gureamir.png',
  3: '/images/locations/shahizinda.png',
  4: '/images/locations/bibikhanym.png',
  5: '/images/locations/ulughbeg.png',
  6: '/images/locations/urgut_mountains.png',
  7: '/images/locations/omonqoton.png',
  8: '/images/locations/konigil.png',
  9: '/images/locations/osh_center.png',
  10: '/images/locations/bread_bakery.png',
  11: '/images/locations/karimbek_restaurant.png'
};

function getLocationImage(id, imageUrl) {
  return imageUrl || LOCATION_IMAGES[id] || '/images/locations/registan.png';
}

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
    addToRoute: language === 'RU' ? 'Добавить в маршрут' : 'Add to Route',
    inRoute: language === 'RU' ? 'В маршруте' : 'In Route',
    mountainArea: language === 'RU' ? '🏔 Горный тариф' : '🏔 Mountain Rate',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {Object.entries(CATEGORIES).map(([catKey, catInfo]) => {
        const catLocations = groupedLocations[catKey] || [];
        if (catLocations.length === 0) return null;

        const IconComponent = catInfo.icon;
        const categoryTitle = language === 'RU' ? catInfo.RU : catInfo.EN;

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

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {catLocations.map((loc) => {
                const isSelected = selectedLocations.some((sel) => sel.id === loc.id);
                const name = language === 'RU' ? loc.name_ru : language === 'UZ' ? loc.name_uz : loc.name_en;
                const desc = language === 'RU' ? loc.description_ru : language === 'UZ' ? loc.description_uz : loc.description_en;

                return (
                  <div 
                    key={loc.id} 
                    className={`glass-container animate-fade-in ${isSelected ? 'selected-card-glow' : ''}`}
                    style={{
                      padding: '12px 16px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '12px',
                      border: isSelected 
                        ? `1.5px solid ${catInfo.color}` 
                        : '1px solid var(--border-card)',
                      boxShadow: isSelected ? `0 0 12px rgba(${catKey === 'food' ? '212,175,55' : catKey === 'alternative' ? '0,155,158' : '0,112,192'}, 0.15)` : 'none'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
                      {/* Location Thumbnail */}
                      <div style={{ 
                        width: '64px', 
                        height: '64px', 
                        borderRadius: '8px', 
                        overflow: 'hidden', 
                        flexShrink: 0,
                        border: '1.5px solid var(--border-card)',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.25)'
                      }}>
                        <img 
                          src={getLocationImage(loc.id, loc.image_url)} 
                          alt={name} 
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            transition: 'transform 0.3s ease',
                          }}
                          className="location-card-img"
                        />
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                          <span style={{ fontWeight: 600, fontSize: '15px', color: 'var(--text-primary)' }}>
                            {name}
                          </span>
                          
                          {loc.is_out_of_city && (
                            <span style={{
                              backgroundColor: 'rgba(212, 175, 55, 0.12)',
                              color: 'var(--text-gold)',
                              fontSize: '11px',
                              fontWeight: '600',
                              padding: '2px 6px',
                              borderRadius: '4px',
                              border: '1px solid rgba(212, 175, 55, 0.2)'
                            }}>
                              {t.mountainArea}
                            </span>
                          )}
                        </div>
                        <span style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
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
                        padding: '6px 12px',
                        borderRadius: '8px',
                        fontSize: '12px',
                        fontWeight: '500',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                      }}
                    >
                      {isSelected ? (
                        <>
                          <Check size={14} />
                          <span>{t.inRoute}</span>
                        </>
                      ) : (
                        <>
                          <Plus size={14} />
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
