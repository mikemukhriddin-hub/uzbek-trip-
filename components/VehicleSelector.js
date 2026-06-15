'use client';

import React from 'react';
import { User, Smartphone, Star, Check } from 'lucide-react';
import { ThreeDCar } from './icons/ThreeDIcons';

const VEHICLE_IMAGES = {
  1: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=400&q=80', // White sedan (Cobalt)
  2: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=400&q=80', // Black sedan (Gentra)
  3: 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&w=400&q=80', // Silver sedan (Gentra)
  4: 'https://images.unsplash.com/photo-1508974239320-0a029497e820?auto=format&fit=crop&w=400&q=80', // Minivan (Hyundai H1)
  5: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=400&q=80'  // Bus (Isuzu)
};

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
        <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>{t.title}</h3>
        <div style={{
          fontSize: '12px',
          padding: '8px 12px',
          borderRadius: '8px',
          backgroundColor: isOutOfCityRoute ? 'rgba(255, 91, 0, 0.06)' : 'rgba(0, 112, 192, 0.06)',
          border: `1px solid ${isOutOfCityRoute ? 'rgba(var(--primary-blue-rgb), 0.15)' : 'rgba(0, 112, 192, 0.15)'}`,
          color: isOutOfCityRoute ? 'var(--primary-blue, var(--primary-blue))' : '#0070c0',
          display: 'inline-block',
          width: 'fit-content',
          fontWeight: '600'
        }}>
          <strong>{t.rateType}: </strong>
          <span>{isOutOfCityRoute ? t.mountainRate : t.cityRate}</span>
        </div>
        {isOutOfCityRoute && (
          <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px' }}>
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
              className="glass-container animate-fade-in"
              onClick={() => onSelectVehicle(car)}
              style={{
                padding: '16px',
                cursor: 'pointer',
                border: isSelected ? '1px solid var(--primary-blue, var(--primary-blue))' : '1px solid var(--border-card, var(--border-card))',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '16px',
                backgroundColor: isSelected ? 'rgba(255, 91, 0, 0.04)' : 'var(--bg-card)',
                boxShadow: isSelected ? '0 4px 12px rgba(var(--primary-blue-rgb), 0.08)' : '0 4px 12px rgba(0,0,0,0.02)'
              }}
            >
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                {/* Visual Vehicle Image Preview */}
                <div style={{ 
                  width: '90px', 
                  height: '60px', 
                  borderRadius: '8px', 
                  overflow: 'hidden',
                  flexShrink: 0,
                  border: '1px solid var(--border-card)',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
                }}>
                  <img 
                    src={car.image_url || VEHICLE_IMAGES[car.id] || 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=400&q=80'} 
                    alt={car.car_model} 
                    style={{ 
                      width: '100%', 
                      height: '100%', 
                      objectFit: 'cover',
                      transition: 'transform 0.4s ease'
                    }} 
                    className="vehicle-img"
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  <span style={{ fontWeight: 700, fontSize: '15px', color: 'var(--text-primary)' }}>
                    {car.car_model}
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', fontSize: '11px', color: 'var(--text-secondary)' }}>
                    <span>{t.plate} <code style={{ color: 'var(--text-primary)', backgroundColor: 'var(--bg-dark)', padding: '2px 4px', borderRadius: '3px', fontWeight: 'bold' }}>{car.car_number}</code></span>
                    <span>•</span>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                      <User size={11} /> {car.driver_name}
                    </span>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' }}>
                <span style={{ fontSize: '20px', fontWeight: '700', color: isSelected ? 'var(--primary-blue, var(--primary-blue))' : 'var(--text-primary)' }}>
                  ${Number(currentPrice).toFixed(0)}
                </span>
                
                <div style={{
                  padding: '6px 12px',
                  borderRadius: '6px',
                  fontSize: '11.5px',
                  fontWeight: '700',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  backgroundColor: isSelected ? 'var(--primary-blue, var(--primary-blue))' : 'var(--bg-dark)',
                  border: isSelected ? 'none' : '1px solid var(--border-card)',
                  color: isSelected ? 'var(--bg-card)' : 'var(--text-secondary)',
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
