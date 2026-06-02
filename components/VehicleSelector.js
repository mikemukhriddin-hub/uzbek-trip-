'use client';

import React from 'react';
import { User, Smartphone, Star, Check } from 'lucide-react';
import { ThreeDCar } from './icons/ThreeDIcons';

export default function VehicleSelector({ 
  vehicles = [], 
  selectedVehicleId = null, 
  onSelectVehicle, 
  isOutOfCityRoute = false, 
  language = 'EN' 
}) {

  const t = {
    title: language === 'UZ' ? 'Transport va haydovchini tanlang' : language === 'RU' ? 'Выберите транспорт и водителя' : 'Select Transport & Driver',
    model: language === 'UZ' ? 'Model:' : language === 'RU' ? 'Модель:' : 'Model:',
    plate: language === 'UZ' ? 'Davlat raqami:' : language === 'RU' ? 'Гос. номер:' : 'License Plate:',
    driver: language === 'UZ' ? 'Haydovchi:' : language === 'RU' ? 'Водитель:' : 'Driver:',
    phone: language === 'UZ' ? 'Telefon:' : language === 'RU' ? 'Телефон:' : 'Phone:',
    rateType: language === 'UZ' ? 'Qo\'llanilgan tarif turi' : language === 'RU' ? 'Применяемый тариф' : 'Applied Rate Type',
    cityRate: language === 'UZ' ? '🏙 Shahar tarifi' : language === 'RU' ? '🏙 Городской тариф' : '🏙 City Tariff',
    mountainRate: language === 'UZ' ? '🏔 Tog\' / Shahardan tashqari tarif' : language === 'RU' ? '🏔 Горный / Загородный тариф' : '🏔 Mountain / Out-of-city Tariff',
    rateReason: language === 'UZ' 
      ? 'Marshrutda shahardan tashqari hududlar bor (Urgut/Omonqo\'ton). Tog\' tarifi faollashtirildi.'
      : language === 'RU' 
      ? 'В маршруте есть загородные зоны (Ургут/Омонкотон). Применен горный тариф.'
      : 'Your route includes mountain/out-of-town areas (Urgut/Omonqoton). Mountain rate is active.',
    selectCar: language === 'UZ' ? 'Tanlash' : language === 'RU' ? 'Выбрать' : 'Select Vehicle',
    selectedCar: language === 'UZ' ? 'Tanlandi' : language === 'RU' ? 'Выбран' : 'Selected',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#d4af37' }}>{t.title}</h3>
        <div style={{
          fontSize: '12px',
          padding: '6px 12px',
          borderRadius: '6px',
          backgroundColor: isOutOfCityRoute ? 'rgba(212, 175, 55, 0.1)' : 'rgba(0, 112, 192, 0.1)',
          border: `1px solid ${isOutOfCityRoute ? 'rgba(212, 175, 55, 0.2)' : 'rgba(0, 112, 192, 0.2)'}`,
          color: isOutOfCityRoute ? '#d4af37' : '#009b9e',
          display: 'inline-block',
          width: 'fit-content'
        }}>
          <strong>{t.rateType}: </strong>
          <span>{isOutOfCityRoute ? t.mountainRate : t.cityRate}</span>
        </div>
        {isOutOfCityRoute && (
          <p style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px' }}>
            {t.rateReason}
          </p>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '14px' }}>
        {vehicles.map((car) => {
          const isSelected = selectedVehicleId === car.id;
          const currentPrice = isOutOfCityRoute ? car.out_of_city_rate : car.city_rate;

          return (
            <div
              key={car.id}
              className={`glass-container animate-fade-in ${isSelected ? 'gold-glow' : ''}`}
              onClick={() => onSelectVehicle(car)}
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
                {/* Interactive 3D Icon */}
                <div className={`icon-3d-container ${isSelected ? 'icon-3d-container-selected' : ''}`}>
                  <div className={`icon-3d-card ${isSelected ? 'icon-3d-card-selected' : ''}`}>
                    <ThreeDCar size={28} className="icon-3d-svg" />
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  <span style={{ fontWeight: 600, fontSize: '15px', color: '#fff' }}>
                    {car.car_model}
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', fontSize: '11px', color: '#94a3b8' }}>
                    <span>{t.plate} <code style={{ color: '#fff', backgroundColor: 'rgba(255,255,255,0.08)', padding: '1px 4px', borderRadius: '3px' }}>{car.car_number}</code></span>
                    <span>•</span>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                      <User size={11} /> {car.driver_name}
                    </span>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' }}>
                <span style={{ fontSize: '20px', fontWeight: '700', color: isSelected ? '#d4af37' : '#f1f5f9' }}>
                  ${Number(currentPrice).toFixed(0)}
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
                  <span>{isSelected ? t.selectedCar : t.selectCar}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
