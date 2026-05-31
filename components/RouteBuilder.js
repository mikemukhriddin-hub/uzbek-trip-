'use client';

import React from 'react';
import { MapPin, Check, Plus, Landmark, TreePine, Utensils } from 'lucide-react';

const CATEGORIES = {
  historical: {
    EN: 'Historical Sights',
    RU: 'Исторические достопримечательности',
    icon: Landmark,
    color: '#0070c0',
  },
  alternative: {
    EN: 'Alternative & Nature',
    RU: 'Альтернативные места и Природа',
    icon: TreePine,
    color: '#009b9e',
  },
  food: {
    EN: 'Local Food & Dining',
    RU: 'Национальная кухня',
    icon: Utensils,
    color: '#d4af37',
  },
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
              gap: '8px', 
              color: catInfo.color, 
              fontWeight: 600,
              fontSize: '15px',
              borderBottom: `1px solid rgba(255,255,255,0.08)`,
              paddingBottom: '6px'
            }}>
              <IconComponent size={18} />
              <span>{categoryTitle}</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {catLocations.map((loc) => {
                const isSelected = selectedLocations.some((sel) => sel.id === loc.id);
                const name = language === 'RU' ? loc.name_ru : loc.name_en;
                const desc = language === 'RU' ? loc.description_ru : loc.description_en;

                return (
                  <div 
                    key={loc.id} 
                    className="glass-container animate-fade-in"
                    style={{
                      padding: '12px 16px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '12px',
                      border: isSelected 
                        ? `1px solid ${catInfo.color}` 
                        : '1px solid rgba(255, 255, 255, 0.05)',
                      boxShadow: isSelected ? `0 0 12px rgba(${catKey === 'food' ? '212,175,55' : catKey === 'alternative' ? '0,155,158' : '0,112,192'}, 0.15)` : 'none'
                    }}
                  >
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        <span style={{ fontWeight: 600, fontSize: '15px', color: isSelected ? '#fff' : '#e2e8f0' }}>
                          {name}
                        </span>
                        
                        {loc.is_out_of_city && (
                          <span style={{
                            backgroundColor: 'rgba(212, 175, 55, 0.12)',
                            color: '#d4af37',
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
                      <span style={{ fontSize: '12px', color: '#94a3b8', lineHeight: 1.4 }}>
                        {desc}
                      </span>
                    </div>

                    <button
                      onClick={() => onToggleLocation(loc)}
                      style={{
                        backgroundColor: isSelected ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                        border: isSelected ? '1px solid #10b981' : '1px solid rgba(255, 255, 255, 0.1)',
                        color: isSelected ? '#10b981' : '#f1f5f9',
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
