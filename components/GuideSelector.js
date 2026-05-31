'use client';

import React from 'react';
import { UserCheck, Check, MessageSquare, Languages } from 'lucide-react';

const LANGUAGES = [
  { code: 'EN', label: { EN: '🇬🇧 English', RU: '🇬🇧 Английский' } },
  { code: 'RU', label: { EN: '🇷🇺 Russian', RU: '🇷🇺 Русский' } },
  { code: 'FR', label: { EN: '🇫🇷 French', RU: '🇫🇷 Французский' } },
  { code: 'ES', label: { EN: '🇪🇸 Spanish', RU: '🇪🇸 Испанский' } },
];

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
    title: language === 'RU' ? 'Выберите гида и язык ведения экскурсии' : 'Select Guide & Speaking Language',
    langSelect: language === 'RU' ? 'Язык экскурсии:' : 'Tour language:',
    dailyRate: language === 'RU' ? 'в день' : 'per day',
    noGuides: language === 'RU' ? 'Нет доступных гидов для этого языка' : 'No guides available for this language',
    selectGuide: language === 'RU' ? 'Выбрать' : 'Select Guide',
    selectedGuide: language === 'RU' ? 'Выбран' : 'Selected',
    speaks: language === 'RU' ? 'Говорит на:' : 'Speaks:',
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
        <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#d4af37' }}>{t.title}</h3>
        
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
                  border: isSelected ? '1px solid #d4af37' : '1px solid rgba(255,255,255,0.08)',
                  backgroundColor: isSelected ? 'rgba(212,175,55,0.12)' : 'rgba(255,255,255,0.03)',
                  color: isSelected ? '#d4af37' : '#94a3b8',
                  fontSize: '13px',
                  fontWeight: isSelected ? '600' : '400',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'all 0.2s ease',
                }}
              >
                <Languages size={14} />
                <span>{language === 'RU' ? lang.label.RU : lang.label.EN}</span>
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
            color: '#94a3b8',
            border: '1px dashed rgba(255,255,255,0.1)',
            borderRadius: '12px'
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
                className={`glass-container animate-fade-in ${isSelected ? 'gold-glow' : ''}`}
                onClick={() => onSelectGuide(guide)}
                style={{
                  padding: '16px',
                  cursor: 'pointer',
                  border: isSelected ? '1px solid #d4af37' : '1px solid rgba(255, 255, 255, 0.05)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '16px',
                  backgroundColor: isSelected ? 'rgba(212, 175, 55, 0.05)' : 'rgba(18, 26, 47, 0.7)'
                }}
              >
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <div style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '10px',
                    backgroundColor: isSelected ? 'rgba(212, 175, 55, 0.15)' : 'rgba(255,255,255,0.05)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: isSelected ? '#d4af37' : '#94a3b8'
                  }}>
                    <UserCheck size={22} />
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    <span style={{ fontWeight: 600, fontSize: '15px', color: '#fff' }}>
                      {guide.full_name}
                    </span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#94a3b8' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                        <MessageSquare size={11} /> {t.speaks} {spokeLangs.join(', ')}
                      </span>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' }}>
                  <span style={{ fontSize: '20px', fontWeight: '700', color: isSelected ? '#d4af37' : '#f1f5f9' }}>
                    ${Number(guide.daily_rate).toFixed(0)}
                    <span style={{ fontSize: '11px', fontWeight: '400', color: '#94a3b8', marginLeft: '4px' }}>
                      {t.dailyRate}
                    </span>
                  </span>
                  
                  <div style={{
                    padding: '4px 8px',
                    borderRadius: '6px',
                    fontSize: '11px',
                    fontWeight: '600',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    backgroundColor: isSelected ? '#d4af37' : 'rgba(255,255,255,0.05)',
                    color: isSelected ? '#0a0f1d' : '#e2e8f0',
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
