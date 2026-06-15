'use client';

import React from 'react';
import { Check, MessageSquare, Languages } from 'lucide-react';
import { ThreeDGuide } from './icons/ThreeDIcons';

const LANGUAGES = [
  { code: 'EN', label: { EN: '🇬🇧 English', RU: '🇬🇧 Английский', UZ: '🇬🇧 Ingliz tili' } },
  { code: 'RU', label: { EN: '🇷🇺 Russian', RU: '🇷🇺 Русский', UZ: '🇷🇺 Rus tili' } },
  { code: 'FR', label: { EN: '🇫🇷 French', RU: '🇫🇷 Французский', UZ: '🇫🇷 Fransuz tili' } },
  { code: 'ES', label: { EN: '🇪🇸 Spanish', RU: '🇪🇸 Испанский', UZ: '🇪🇸 Ispan tili' } },
  { code: 'UZ', label: { EN: '🇺🇿 Uzbek', RU: '🇺🇿 Узбекский', UZ: '🇺🇿 O\'zbek tili' } },
];

const GUIDE_IMAGES = {
  1: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=256&q=80', // Sherzod Alimov
  2: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=256&q=80', // Elena Petrova
  3: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=256&q=80'  // Jahongir Rustamov
};

export default function GuideSelector({
  guides = [],
  tariffs = [],
  selectedGuideId = null,
  selectedGuideLanguage = 'EN',
  onSelectGuide,
  onSelectGuideLanguage,
  language = 'EN',
}) {

  const t = {
    title: language === 'UZ' ? 'Gid va ekskursiya tilini tanlang' : language === 'RU' ? 'Выберите гида и язык ведения экскурсии' : 'Select Guide & Speaking Language',
    langSelect: language === 'UZ' ? 'Ekskursiya tili:' : language === 'RU' ? 'Язык экскурсии:' : 'Tour language:',
    dailyRate: language === 'UZ' ? 'kuniga' : language === 'RU' ? 'в день' : 'per day',
    noGuides: language === 'UZ' ? 'Ushbu til bo\'yicha gidlar topilmadi' : language === 'RU' ? 'Нет доступных гидов для этого языка' : 'No guides available for this language',
    selectGuide: language === 'UZ' ? 'Tanlash' : language === 'RU' ? 'Выбрать' : 'Select Guide',
    selectedGuide: language === 'UZ' ? 'Tanlandi' : language === 'RU' ? 'Выбран' : 'Selected',
    speaks: language === 'UZ' ? 'Gapirish tillari:' : language === 'RU' ? 'Говорит на:' : 'Speaks:',
  };

  // Filter tariffs by selected guide language code
  const activeTariffs = tariffs.filter(
    (t) => t.language_code.toUpperCase() === selectedGuideLanguage.toUpperCase()
  );

  // Filter guides who have an active tariff for the selected language
  const filteredGuides = guides
    .map((guide) => {
      const tariff = activeTariffs.find((t) => t.guide_id === guide.id);
      if (!tariff) return null;
      return {
        ...guide,
        daily_rate: tariff.daily_rate,
      };
    })
    .filter(Boolean);

  // Helper to find all languages a guide speaks
  const getGuideLanguages = (guideId) => {
    return tariffs
      .filter((t) => t.guide_id === guideId)
      .map((t) => {
        const langInfo = LANGUAGES.find((l) => l.code === t.language_code);
        return langInfo ? langInfo.code : t.language_code;
      });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>{t.title}</h3>
        
        {/* Language Selection Pills */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {LANGUAGES.map((lang) => {
            const isSelected = selectedGuideLanguage === lang.code;
            return (
              <button
                key={lang.code}
                onClick={() => onSelectGuideLanguage(lang.code)}
                style={{
                  padding: '8px 12px',
                  borderRadius: '8px',
                  border: isSelected ? '1px solid var(--text-gold)' : '1px solid var(--border-card)',
                  backgroundColor: isSelected ? 'rgba(255, 91, 0, 0.06)' : 'var(--bg-card)',
                  color: isSelected ? 'var(--text-gold)' : 'var(--text-secondary)',
                  fontSize: '13px',
                  fontWeight: isSelected ? '700' : '500',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'all 0.2s ease',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
                }}
              >
                <Languages size={14} />
                <span>{lang.label[language] || lang.label.EN}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '14px' }}>

        {filteredGuides.length === 0 ? (
          <div style={{
            padding: '24px',
            textAlign: 'center',
            color: 'var(--text-secondary)',
            border: '1px dashed var(--border-card)',
            borderRadius: '12px',
            backgroundColor: 'var(--bg-card)',
            gridColumn: '1 / -1'
          }}>
            {t.noGuides}
          </div>
        ) : (
          filteredGuides.map((guide) => {
            const isSelected = selectedGuideId === guide.id;
            const spokeLangs = getGuideLanguages(guide.id);

            return (
              <div
                key={guide.id}
                className="glass-container animate-fade-in"
                onClick={() => onSelectGuide(guide)}
                style={{
                  padding: '16px',
                  cursor: 'pointer',
                  border: isSelected ? '1px solid var(--text-gold)' : '1px solid var(--border-card)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '16px',
                  backgroundColor: isSelected ? 'rgba(255, 91, 0, 0.04)' : 'var(--bg-card)',
                  boxShadow: isSelected ? '0 4px 12px rgba(var(--primary-blue-rgb), 0.08)' : '0 4px 12px rgba(0,0,0,0.02)'
                }}
              >
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  {/* Visual Guide Avatar Image */}
                  <div style={{ 
                    width: '48px', 
                    height: '48px', 
                    borderRadius: '50%', 
                    overflow: 'hidden',
                    flexShrink: 0,
                    border: '1.5px solid var(--text-gold)',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                  }}>
                    <img 
                      src={guide.image_url || GUIDE_IMAGES[guide.id] || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80'} 
                      alt={guide.full_name} 
                      style={{ 
                        width: '100%', 
                        height: '100%', 
                        objectFit: 'cover',
                        transition: 'transform 0.4s ease'
                      }} 
                      className="guide-avatar"
                    />
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    <span style={{ fontWeight: 700, fontSize: '15px', color: 'var(--text-primary)' }}>
                      {guide.full_name}
                    </span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: 'var(--text-secondary)' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                        <MessageSquare size={11} /> {t.speaks} {spokeLangs.join(', ')}
                      </span>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' }}>
                  <span style={{ fontSize: '20px', fontWeight: '700', color: isSelected ? 'var(--text-gold)' : 'var(--text-primary)' }}>
                    ${Number(guide.daily_rate).toFixed(0)}
                    <span style={{ fontSize: '11px', fontWeight: '400', color: 'var(--text-secondary)', marginLeft: '4px' }}>
                      {t.dailyRate}
                    </span>
                  </span>
                  
                  <div style={{
                    padding: '6px 12px',
                    borderRadius: '6px',
                    fontSize: '11.5px',
                    fontWeight: '700',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    background: isSelected ? 'var(--btn-gold-bg)' : 'var(--bg-dark)',
                    color: isSelected ? 'var(--btn-gold-text)' : 'var(--text-secondary)',
                    border: isSelected ? 'none' : '1px solid var(--border-card)',
                    transition: 'all 0.2s ease'
                  }}>
                    {isSelected ? <Check size={12} /> : null}
                    <span>{isSelected ? t.selectedGuide : t.selectGuide}</span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
