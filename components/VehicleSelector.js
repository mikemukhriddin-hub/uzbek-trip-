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
  language = 'EN',
  activeRegion = 'samarqand'
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
    crossRegionRate: language === 'UZ' ? '🇺🇿 Viloyatlararo tarif (1.5x)' : language === 'RU' ? '🇺🇿 Межрегиональный тариф (1.5x)' : '🇺🇿 Inter-province Tariff (1.5x)',
    rateReason: language === 'UZ' 
      ? 'Marshrutda shahardan tashqari hududlar bor (Urgut/Omonqo\'ton). Tog\' tarifi faollashtirildi.'
      : language === 'RU' 
      ? 'В маршруте есть загородные зоны (Ургут/Омонкотон). Применен горный тариф.'
      : 'Your route includes mountain/out-of-town areas (Urgut/Omonqoton). Mountain rate is active.',
    crossRegionRateReason: language === 'UZ'
      ? 'Sayohat boshqa viloyatlararo safarni o\'z ichiga oladi. Viloyatlararo premium tarif faol (tog\' tarifi * 1.5).'
      : language === 'RU'
      ? 'Маршрут включает поездку между областями. Активен межрегиональный премиум-тариф (загородный тариф * 1.5).'
      : 'The route includes inter-province travel. Inter-province premium rate is active (out-of-city rate * 1.5).',
    selectCar: language === 'UZ' ? 'Tanlash' : language === 'RU' ? 'Выбрать' : 'Select Vehicle',
    selectedCar: language === 'UZ' ? 'Tanlandi' : language === 'RU' ? 'Выбран' : 'Selected',
    
    // Breakdown translations
    breakdownTitle: language === 'UZ' ? 'Tariflar farqi:' : language === 'RU' ? 'Разница тарифов:' : 'Rates structure:',
    breakdownCity: language === 'UZ' ? 'Shahar ichi' : language === 'RU' ? 'По городу' : 'City',
    breakdownMountain: language === 'UZ' ? 'Sh.tashqari/Tog\'' : language === 'RU' ? 'Загород/Горы' : 'Out-of-city/Mt',
    breakdownCross: language === 'UZ' ? 'Viloyatlararo' : language === 'RU' ? 'Межобластной' : 'Inter-province',
    activeBadge: language === 'UZ' ? 'faol' : language === 'RU' ? 'активен' : 'active',
  };

  const isCrossRegion = activeRegion === 'cross_region';
  
  let badgeBg = 'rgba(0, 112, 192, 0.06)';
  let badgeBorder = '1px solid rgba(0, 112, 192, 0.15)';
  let badgeColor = '#0070c0';
  let badgeText = t.cityRate;
  let badgeDesc = null;

  if (isCrossRegion) {
    badgeBg = 'rgba(124, 58, 237, 0.08)'; // Light violet
    badgeBorder = '1px solid rgba(124, 58, 237, 0.25)';
    badgeColor = '#7c3aed'; // Violet
    badgeText = t.crossRegionRate;
    badgeDesc = t.crossRegionRateReason;
  } else if (isOutOfCityRoute) {
    badgeBg = 'rgba(255, 91, 0, 0.06)'; // Klook Orange background 6%
    badgeBorder = '1px solid rgba(255, 91, 0, 0.15)';
    badgeColor = 'var(--primary-blue, #ff5b00)';
    badgeText = t.mountainRate;
    badgeDesc = t.rateReason;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>{t.title}</h3>
        <div style={{
          fontSize: '12px',
          padding: '8px 12px',
          borderRadius: '8px',
          backgroundColor: badgeBg,
          border: badgeBorder,
          color: badgeColor,
          display: 'inline-block',
          width: 'fit-content',
          fontWeight: '600'
        }}>
          <strong>{t.rateType}: </strong>
          <span>{badgeText}</span>
        </div>
        {badgeDesc && (
          <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px' }}>
            {badgeDesc}
          </p>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '14px' }}>
        {vehicles.map((car) => {
          const isSelected = selectedVehicleId === car.id;
          const currentPrice = isCrossRegion 
            ? Number(car.out_of_city_rate) * 1.5 
            : (isOutOfCityRoute ? Number(car.out_of_city_rate) : Number(car.city_rate));

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
                flexDirection: 'column',
                gap: '4px',
                backgroundColor: isSelected ? 'rgba(255, 91, 0, 0.04)' : 'var(--bg-card)',
                boxShadow: isSelected ? '0 4px 12px rgba(var(--primary-blue-rgb), 0.08)' : '0 4px 12px rgba(0,0,0,0.02)',
                transition: 'all 0.2s ease',
              }}
            >
              {/* Upper row containing the core vehicle details and the active price */}
              <div style={{ display: 'flex', width: '100%', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
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
                      referrerPolicy="no-referrer"
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

              {/* Lower row containing the Pricing Structure comparison breakdown */}
              <div style={{ 
                height: '1px', 
                borderTop: '1px dashed var(--border-card)', 
                margin: '12px 0 8px 0', 
                width: '100%' 
              }} />

              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                width: '100%', 
                gap: '8px',
                flexWrap: 'wrap'
              }}>
                <span style={{ fontSize: '11px', fontWeight: '600', color: 'var(--text-secondary)' }}>
                  {t.breakdownTitle}
                </span>
                
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {/* City Rate */}
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '4px',
                    fontSize: '11px',
                    padding: '3px 8px',
                    borderRadius: '6px',
                    backgroundColor: (!isCrossRegion && !isOutOfCityRoute) ? 'rgba(0, 112, 192, 0.08)' : 'var(--bg-dark)',
                    border: (!isCrossRegion && !isOutOfCityRoute) ? '1px solid rgba(0, 112, 192, 0.25)' : '1px solid var(--border-card)',
                    color: (!isCrossRegion && !isOutOfCityRoute) ? '#0070c0' : 'var(--text-secondary)',
                    transition: 'all 0.2s ease'
                  }}>
                    <span style={{ fontSize: '10px' }}>{t.breakdownCity}:</span>
                    <span style={{ fontWeight: '700' }}>${Number(car.city_rate).toFixed(0)}</span>
                    {(!isCrossRegion && !isOutOfCityRoute) && (
                      <span style={{ fontSize: '8px', textTransform: 'uppercase', fontWeight: '900', backgroundColor: '#0070c0', color: '#fff', padding: '0px 4px', borderRadius: '3px', marginLeft: '2px' }}>
                        {t.activeBadge}
                      </span>
                    )}
                  </div>

                  {/* Mountain Rate */}
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '4px',
                    fontSize: '11px',
                    padding: '3px 8px',
                    borderRadius: '6px',
                    backgroundColor: (!isCrossRegion && isOutOfCityRoute) ? 'rgba(255, 91, 0, 0.08)' : 'var(--bg-dark)',
                    border: (!isCrossRegion && isOutOfCityRoute) ? '1px solid rgba(255, 91, 0, 0.25)' : '1px solid var(--border-card)',
                    color: (!isCrossRegion && isOutOfCityRoute) ? 'var(--primary-blue, #ff5b00)' : 'var(--text-secondary)',
                    transition: 'all 0.2s ease'
                  }}>
                    <span style={{ fontSize: '10px' }}>{t.breakdownMountain}:</span>
                    <span style={{ fontWeight: '700' }}>${Number(car.out_of_city_rate).toFixed(0)}</span>
                    {(!isCrossRegion && isOutOfCityRoute) && (
                      <span style={{ fontSize: '8px', textTransform: 'uppercase', fontWeight: '900', backgroundColor: 'var(--primary-blue, #ff5b00)', color: '#fff', padding: '0px 4px', borderRadius: '3px', marginLeft: '2px' }}>
                        {t.activeBadge}
                      </span>
                    )}
                  </div>

                  {/* Cross Region Rate */}
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '4px',
                    fontSize: '11px',
                    padding: '3px 8px',
                    borderRadius: '6px',
                    backgroundColor: isCrossRegion ? 'rgba(124, 58, 237, 0.1)' : 'var(--bg-dark)',
                    border: isCrossRegion ? '1px solid rgba(124, 58, 237, 0.25)' : '1px solid var(--border-card)',
                    color: isCrossRegion ? '#7c3aed' : 'var(--text-secondary)',
                    transition: 'all 0.2s ease'
                  }}>
                    <span style={{ fontSize: '10px' }}>{t.breakdownCross}:</span>
                    <span style={{ fontWeight: '700' }}>${(Number(car.out_of_city_rate) * 1.5).toFixed(0)}</span>
                    {isCrossRegion && (
                      <span style={{ fontSize: '8px', textTransform: 'uppercase', fontWeight: '900', backgroundColor: '#7c3aed', color: '#fff', padding: '0px 4px', borderRadius: '3px', marginLeft: '2px' }}>
                        {t.activeBadge}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
