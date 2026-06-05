'use client';

import { useState, useEffect, useRef } from 'react';

export default function Map({ locations = [], selectedLocations = [], language = 'EN' }) {
  const [isInteractive, setIsInteractive] = useState(true);
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const markersRef = useRef({});
  const polylineRef = useRef(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsInteractive(window.innerWidth >= 768);
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const initMap = async () => {
      const L = await import('leaflet');

      // Setup Leaflet standard marker asset paths
      delete L.Icon.Default.prototype._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });

      // Initialize Map if not already initialized
      if (!mapInstance.current && mapRef.current) {
        mapInstance.current = L.map(mapRef.current, {
          zoomControl: true,
          scrollWheelZoom: true,
        }).setView([39.6548, 66.9757], 13); // Centered in Samarkand

        // Use a beautiful dark tile layer to match the premium theme
        L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
          subdomains: 'abcd',
          maxZoom: 20,
        }).addTo(mapInstance.current);
      }

      const map = mapInstance.current;

      // Clean existing markers
      Object.keys(markersRef.current).forEach((key) => {
        map.removeLayer(markersRef.current[key]);
      });
      markersRef.current = {};

      // Add markers for all locations
      locations.forEach((loc) => {
        const name = language === 'RU' ? loc.name_ru : language === 'UZ' ? (loc.name_uz || loc.name_en) : loc.name_en;
        const desc = language === 'RU' ? loc.description_ru : language === 'UZ' ? (loc.description_uz || loc.description_en) : loc.description_en;
        const isSelected = selectedLocations.some((sel) => sel.id === loc.id);

        // Marker color code: Historical (Blue), Alternative (Teal/Turquoise), Food (Gold)
        let color = '#0070c0'; // Historical
        if (loc.category === 'alternative') color = '#009b9e';
        if (loc.category === 'food') color = '#d4af37';

        const borderStyle = isSelected 
          ? `border: 3px solid #ffffff; box-shadow: 0 0 12px ${color}; width: 18px; height: 18px;` 
          : `border: 2px solid #ffffff; box-shadow: 0 0 6px rgba(0,0,0,0.6); width: 14px; height: 14px;`;

        const icon = L.divIcon({
          className: `custom-marker-${loc.id}`,
          html: `<div style="
            background-color: ${color};
            border-radius: 50%;
            transition: all 0.2s ease-in-out;
            ${borderStyle}
          "></div>`,
          iconSize: isSelected ? [18, 18] : [14, 14],
          iconAnchor: isSelected ? [9, 9] : [7, 7],
        });

        const popupText = `
          <div style="font-family: sans-serif; color: #f1f5f9; padding: 4px;">
            <strong style="font-size: 14px; color: #d4af37;">${name}</strong>
            <p style="margin: 6px 0 0 0; font-size: 12px; line-height: 1.4; color: #94a3b8;">${desc}</p>
            <div style="margin-top: 8px; font-weight: bold; font-size: 11px; color: ${isSelected ? '#10b981' : '#64748b'};">
              ${isSelected 
                ? (language === 'UZ' ? '✓ Marshrutda' : language === 'RU' ? '✓ В маршруте' : '✓ In Route') 
                : (language === 'UZ' ? 'Tanlanmagan' : language === 'RU' ? 'Не выбрано' : 'Not Selected')}
            </div>
          </div>
        `;

        const marker = L.marker([loc.latitude, loc.longitude], { icon })
          .addTo(map)
          .bindPopup(popupText);

        markersRef.current[loc.id] = marker;
      });

      // Draw polyline connecting selected locations in order
      if (polylineRef.current) {
        map.removeLayer(polylineRef.current);
        polylineRef.current = null;
      }

      if (selectedLocations.length > 0) {
        const points = selectedLocations.map((loc) => [loc.latitude, loc.longitude]);
        
        polylineRef.current = L.polyline(points, {
          color: '#d4af37', // Gold route line
          weight: 4,
          opacity: 0.85,
          dashArray: '8, 8', // Dotted dashes
          lineJoin: 'round',
        }).addTo(map);

        // Dynamic viewport fitting
        if (selectedLocations.length > 1) {
          map.fitBounds(polylineRef.current.getBounds(), { padding: [50, 50] });
        } else {
          map.setView(points[0], 14);
        }
      }
    };

    initMap();

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, [locations, selectedLocations, language]);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', minHeight: '400px' }}>
      {!isInteractive && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(10, 15, 29, 0.75)',
          backdropFilter: 'blur(3px)',
          zIndex: 1000,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '12px',
          borderRadius: '16px',
          padding: '24px',
          textAlign: 'center'
        }}>
          <span style={{ color: '#fff', fontSize: '13px', fontWeight: '500' }}>
            {language === 'UZ' ? 'Xaritani aylantirish uchun faollashtiring' : language === 'RU' ? 'Активируйте карту для перемещения' : 'Activate map to explore'}
          </span>
          <button 
            onClick={() => setIsInteractive(true)}
            style={{
              padding: '8px 16px',
              backgroundColor: '#d4af37',
              color: '#0a0f1d',
              border: 'none',
              borderRadius: '8px',
              fontWeight: '700',
              cursor: 'pointer',
              fontSize: '12px',
              boxShadow: '0 4px 12px rgba(212, 175, 55, 0.3)'
            }}
          >
            {language === 'UZ' ? 'Faollashtirish' : language === 'RU' ? 'Активировать' : 'Activate'}
          </button>
        </div>
      )}
      <div 
        ref={mapRef} 
        style={{ 
          width: '100%', 
          height: '100%', 
          minHeight: '400px', 
          borderRadius: '16px', 
          border: '1px solid rgba(212,175,55,0.2)',
          pointerEvents: isInteractive ? 'auto' : 'none'
        }} 
      />
    </div>
  );
}

