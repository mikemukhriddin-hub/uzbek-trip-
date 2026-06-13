'use client';

import React from 'react';
import { MapPin, Check, Plus, Info } from 'lucide-react';
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

const REGION_BADGES = {
  toshkent: { UZ: 'Toshkent', RU: 'Ташкент', EN: 'Tashkent', color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.1)', border: 'rgba(59, 130, 246, 0.2)', emoji: '🏢' },
  samarqand: { UZ: 'Samarqand', RU: 'Самарканд', EN: 'Samarkand', color: '#009b9e', bg: 'rgba(0, 155, 158, 0.1)', border: 'rgba(0, 155, 158, 0.2)', emoji: '🕌' },
  buxoro: { UZ: 'Buxoro', RU: 'Бухара', EN: 'Bukhara', color: '#b25329', bg: 'rgba(178, 83, 41, 0.1)', border: 'rgba(178, 83, 41, 0.2)', emoji: '🧱' },
  xorazm: { UZ: 'Xorazm', RU: 'Хорезм', EN: 'Khorezm', color: '#00a896', bg: 'rgba(0, 168, 150, 0.1)', border: 'rgba(0, 168, 150, 0.2)', emoji: '🏰' },
  qoraqalpoq: { UZ: 'Qoraqalpog\'iston', RU: 'Каракалпакстан', EN: 'Karakalpakstan', color: '#a78bfa', bg: 'rgba(167, 139, 250, 0.1)', border: 'rgba(167, 139, 250, 0.2)', emoji: '🐫' },
  shahrisabz: { UZ: 'Shahrisabz', RU: 'Шахрисабз', EN: 'Shahrisabz', color: '#00a36c', bg: 'rgba(0, 163, 108, 0.1)', border: 'rgba(0, 163, 108, 0.2)', emoji: '🏔' }
};

const REGION_FILTER_CONFIG = [
  { id: 'all', emoji: '🗺️', label: { UZ: 'Barcha viloyatlar', RU: 'Все регионы', EN: 'All Regions' } },
  { id: 'toshkent', emoji: '🏢', label: { UZ: 'Toshkent', RU: 'Ташкент', EN: 'Tashkent' } },
  { id: 'samarqand', emoji: '🕌', label: { UZ: 'Samarqand', RU: 'Самарканд', EN: 'Samarkand' } },
  { id: 'buxoro', emoji: '🧱', label: { UZ: 'Buxoro', RU: 'Бухара', EN: 'Bukhara' } },
  { id: 'xorazm', emoji: '🏰', label: { UZ: 'Xorazm', RU: 'Хорезм', EN: 'Khorezm' } },
  { id: 'qoraqalpoq', emoji: '🐫', label: { UZ: 'Qoraqalpog\'iston', RU: 'Каракалпакстан', EN: 'Karakalpakstan' } },
  { id: 'shahrisabz', emoji: '🏔', label: { UZ: 'Shahrisabz', RU: 'Шахрисабз', EN: 'Shahrisabz' } }
];

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
  language = 'EN',
  tourDurationType = 'single',
  numDays = 2,
  onUpdateLocationDay,
  activeRegion = 'samarqand',
  onOpenWikipedia
}) {
  const [regionFilter, setRegionFilter] = React.useState('all');

  React.useEffect(() => {
    setRegionFilter('all');
  }, [activeRegion]);

  // Filter locations by region when in cross-region view
  const visibleLocations = activeRegion === 'cross_region' && regionFilter !== 'all'
    ? locations.filter(loc => (loc.region || 'samarqand') === regionFilter)
    : locations;
  
  // Group locations by category
  const groupedLocations = visibleLocations.reduce((acc, loc) => {
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
      
      {/* 📍 Region Sub-Filter for Cross-Region Planner */}
      {activeRegion === 'cross_region' && (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          padding: '14px 16px',
          backgroundColor: 'rgba(212, 175, 55, 0.04)',
          border: '1px solid rgba(212, 175, 55, 0.15)',
          borderRadius: '16px',
          marginBottom: '4px'
        }} className="animate-fade-in">
          <span style={{ fontSize: '13px', fontWeight: '700', color: '#d4af37', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <MapPin size={14} />
            <span>
              {language === 'UZ' ? 'Viloyat bo\'yicha saralash:' : language === 'RU' ? 'Фильтр по регионам:' : 'Filter attractions by region:'}
            </span>
          </span>
          <div 
            className="no-scrollbar"
            style={{
              display: 'flex',
              gap: '6px',
              overflowX: 'auto',
              whiteSpace: 'nowrap',
              paddingBottom: '2px'
            }}
          >
            {REGION_FILTER_CONFIG.map((filter) => {
              const isSelected = regionFilter === filter.id;
              return (
                <button
                  key={filter.id}
                  type="button"
                  onClick={() => setRegionFilter(filter.id)}
                  style={{
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: 'none',
                    background: isSelected ? 'rgba(212, 175, 55, 0.12)' : 'rgba(255, 255, 255, 0.03)',
                    border: isSelected ? '1px solid rgba(212, 175, 55, 0.4)' : '1px solid rgba(255, 255, 255, 0.05)',
                    color: isSelected ? '#d4af37' : '#94a3b8',
                    fontSize: '12px',
                    fontWeight: '700',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.color = '#fff';
                      e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.08)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.color = '#94a3b8';
                      e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.03)';
                    }
                  }}
                >
                  <span>{filter.emoji}</span>
                  <span>{filter.label[language] || filter.label['UZ']}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
      
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

                        <span style={{
                          position: 'absolute',
                          bottom: '8px',
                          left: '8px',
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
                          🎟️ {language === 'UZ' ? 'Kirish bileti' : language === 'RU' ? 'Входной билет' : 'Entrance ticket'}: {
                            parseFloat(loc.ticket_price) > 0 
                              ? `$${parseFloat(loc.ticket_price).toFixed(2)}` 
                              : (language === 'UZ' ? 'bepul' : language === 'RU' ? 'бесплатно' : 'free')
                          }
                        </span>

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
                          onError={(e) => {
                            // If Wikimedia image fails, try Wikipedia thumbnail API
                            const wikiTitle = loc.wikipedia_title_en || loc.name_en?.replace(/ /g, '_');
                            if (wikiTitle && !e.target.dataset.wikiTried) {
                              e.target.dataset.wikiTried = '1';
                              e.target.src = `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(wikiTitle)}&prop=pageimages&format=json&pithumbsize=600&redirects=1`;
                            } else if (!e.target.dataset.fallbackUsed) {
                              e.target.dataset.fallbackUsed = '1';
                              e.target.src = LOCATION_IMAGES[loc.id] || '/images/locations/registan.webp';
                            }
                          }}
                        />
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', flexWrap: 'wrap' }}>
                          <span style={{ fontWeight: 700, fontSize: '14px', color: 'var(--text-primary)' }}>
                            {name}
                          </span>
                          {(() => {
                            const badge = REGION_BADGES[loc.region || 'samarqand'];
                            if (!badge) return null;
                            return (
                              <div style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                padding: '2px 6px',
                                borderRadius: '6px',
                                fontSize: '10px',
                                fontWeight: '700',
                                backgroundColor: badge.bg,
                                color: badge.color,
                                border: `1px solid ${badge.border}`,
                                whiteSpace: 'nowrap'
                              }}>
                                <span>{badge.emoji}</span>
                                <span>{badge[language] || badge['UZ']}</span>
                              </div>
                            );
                          })()}
                        </div>
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
                        <div style={{
                          marginTop: '4px',
                          fontSize: '12px',
                          fontWeight: '600',
                          color: 'var(--text-primary)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}>
                          <span style={{ color: 'var(--text-secondary)' }}>
                            🎟️ {language === 'UZ' ? 'Kirish bileti' : language === 'RU' ? 'Входной билет' : 'Entrance ticket'}:
                          </span>
                          <span style={{ 
                            color: parseFloat(loc.ticket_price) > 0 ? '#10b981' : '#94a3b8',
                            fontWeight: '800'
                          }}>
                            {parseFloat(loc.ticket_price) > 0 
                              ? `$${parseFloat(loc.ticket_price).toFixed(2)}` 
                              : (language === 'UZ' ? 'bepul' : language === 'RU' ? 'бесплатно' : 'free')}
                          </span>
                        </div>
                      </div>
                    </div>

                    {isSelected && tourDurationType === 'multi' && (
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', width: '100%', marginBottom: '8px' }}>
                        <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '600' }}>
                          {language === 'UZ' ? 'Sayohat kuni:' : language === 'RU' ? 'День поездки:' : 'Visit Day:'}
                        </span>
                        <select
                          value={selectedLocations.find(sel => sel.id === loc.id)?.selectedDay || 1}
                          onChange={(e) => onUpdateLocationDay(loc.id, parseInt(e.target.value, 10))}
                          onClick={(e) => e.stopPropagation()}
                          style={{
                            padding: '4px 8px',
                            borderRadius: '6px',
                            backgroundColor: 'rgba(16, 185, 129, 0.1)',
                            border: '1px solid #10b981',
                            color: '#10b981',
                            fontSize: '11px',
                            fontWeight: '700',
                            outline: 'none',
                            cursor: 'pointer'
                          }}
                        >
                          {Array.from({ length: numDays }, (_, i) => i + 1).map((d) => (
                            <option key={d} value={d} style={{ backgroundColor: '#0f172a', color: '#fff' }}>
                              {language === 'UZ' ? `${d}-kun` : language === 'RU' ? `День ${d}` : `Day ${d}`}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    <div style={{ display: 'flex', gap: '8px', width: '100%' }}>
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
                          flex: 1
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

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (onOpenWikipedia) {
                            onOpenWikipedia(loc);
                          }
                        }}
                        title={language === 'UZ' ? "Wikipedia ma'lumotlari" : language === 'RU' ? "Информация из Википедии" : "Wikipedia Info"}
                        style={{
                          backgroundColor: 'rgba(212, 175, 55, 0.08)',
                          border: '1px solid rgba(212, 175, 55, 0.25)',
                          color: '#d4af37',
                          padding: '8px',
                          borderRadius: '8px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                          width: '38px',
                          height: '38px',
                          flexShrink: 0
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = 'rgba(212, 175, 55, 0.18)';
                          e.currentTarget.style.borderColor = 'rgba(212, 175, 55, 0.5)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'rgba(212, 175, 55, 0.08)';
                          e.currentTarget.style.borderColor = 'rgba(212, 175, 55, 0.25)';
                        }}
                      >
                        <Info size={16} />
                      </button>
                    </div>
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
