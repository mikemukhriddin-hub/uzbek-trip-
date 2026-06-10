'use client';

import { useState, useEffect, useRef } from 'react';

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

export default function Map({ locations = [], selectedLocations = [], language = 'EN', activeRegion = 'samarqand' }) {
  const [isInteractive, setIsInteractive] = useState(true);
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const markersRef = useRef({});
  const polylineRef = useRef(null);
  const prevSelectedIdsRef = useRef([]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setTimeout(() => {
        setIsInteractive(window.innerWidth >= 768);
      }, 0);
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

      const defaultCenter = activeRegion === 'qoraqalpoq'
        ? [42.4646, 59.6019]
        : activeRegion === 'toshkent'
        ? [41.2995, 69.2401]
        : activeRegion === 'shahrisabz'
        ? [39.0606, 66.8294]
        : activeRegion === 'xorazm'
        ? [41.3783, 60.3639]
        : activeRegion === 'buxoro'
        ? [39.7747, 64.4286]
        : [39.6548, 66.9757];
      const defaultZoom = activeRegion === 'qoraqalpoq'
        ? 8
        : activeRegion === 'toshkent'
        ? 13
        : activeRegion === 'shahrisabz'
        ? 14
        : activeRegion === 'xorazm'
        ? 14
        : activeRegion === 'buxoro'
        ? 13.5
        : 13;

      // Initialize Map if not already initialized
      if (!mapInstance.current && mapRef.current) {
        mapInstance.current = L.map(mapRef.current, {
          zoomControl: true,
          scrollWheelZoom: true,
        }).setView(defaultCenter, defaultZoom);

        // Use a beautiful dark tile layer to match the premium theme
        L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
          subdomains: 'abcd',
          maxZoom: 20,
        }).addTo(mapInstance.current);
      }

      const map = mapInstance.current;

      // Smooth fly/pan to region center if no locations are selected
      if (selectedLocations.length === 0) {
        map.flyTo(defaultCenter, defaultZoom, { duration: 1.2 });
      }

      // Clean existing markers
      Object.keys(markersRef.current).forEach((key) => {
        map.removeLayer(markersRef.current[key]);
      });
      markersRef.current = {};

      // Determine if a new location was just added to center/pan to it
      const prevSelectedIds = prevSelectedIdsRef.current || [];
      const currentSelectedIds = selectedLocations.map(s => s.id);
      const newlyAddedId = currentSelectedIds.find(id => !prevSelectedIds.includes(id));
      prevSelectedIdsRef.current = currentSelectedIds;

      // Add markers for all locations
      locations.forEach((loc) => {
        const name = language === 'RU' ? loc.name_ru : language === 'UZ' ? (loc.name_uz || loc.name_en) : loc.name_en;
        const desc = language === 'RU' ? loc.description_ru : language === 'UZ' ? (loc.description_uz || loc.description_en) : loc.description_en;
        
        const selectedIndex = selectedLocations.findIndex((sel) => sel.id === loc.id);
        const isSelected = selectedIndex !== -1;

        // Marker color code: Historical (Blue/Orange/Teal), Alternative (Teal/Turquoise/Clay), Food (Gold)
        let color = activeRegion === 'qoraqalpoq'
          ? '#7c3aed'
          : activeRegion === 'toshkent'
          ? '#1e40af'
          : activeRegion === 'shahrisabz'
          ? '#008060'
          : activeRegion === 'xorazm'
          ? '#028090'
          : activeRegion === 'buxoro'
          ? '#c05a1a'
          : '#0070c0';

        if (loc.category === 'alternative') {
          color = activeRegion === 'qoraqalpoq'
            ? '#a78bfa'
            : activeRegion === 'toshkent'
            ? '#3b82f6'
            : activeRegion === 'shahrisabz'
            ? '#00a36c'
            : activeRegion === 'xorazm'
            ? '#00a896'
            : activeRegion === 'buxoro'
            ? '#b25329'
            : '#009b9e';
        }
        if (loc.category === 'food') color = '#d4af37';

        // Select specific category icon/emoji for unselected markers
        let categoryEmoji = '🕌'; // Historical
        if (loc.category === 'alternative') categoryEmoji = '🌲';
        if (loc.category === 'food') categoryEmoji = '🍲';

        // Styling for custom divIcon markers
        const iconHtml = isSelected
          ? `<div class="custom-route-marker" style="
              background-color: ${color};
              border: 2px solid #ffffff;
              box-shadow: 0 0 14px ${color};
              width: 24px;
              height: 24px;
              display: flex;
              align-items: center;
              justify-content: center;
              color: #0a0f1d;
              font-size: 11px;
              font-weight: 900;
            ">${selectedIndex + 1}</div>`
          : `<div style="
              background-color: ${color};
              border-radius: 50%;
              border: 1.5px solid #ffffff;
              box-shadow: 0 0 6px rgba(0,0,0,0.5);
              width: 20px;
              height: 20px;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 10px;
              transition: all 0.2s ease-in-out;
            ">${categoryEmoji}</div>`;

        const icon = L.divIcon({
          className: `custom-marker-${loc.id}`,
          html: iconHtml,
          iconSize: isSelected ? [24, 24] : [20, 20],
          iconAnchor: isSelected ? [12, 12] : [10, 10],
        });

        // Fallback for location image using local assets lookup
        const imgUrl = loc.image_url || LOCATION_IMAGES[loc.id] || '/images/locations/registan.webp';

        const popupText = `
          <div style="width: 220px; font-family: sans-serif; color: #f1f5f9; display: flex; flex-direction: column; overflow: hidden; border-radius: 12px;">
            <div style="width: 100%; height: 110px; position: relative; overflow: hidden; background-color: #1e293b;">
              <img src="${imgUrl}" alt="${name}" style="width: 100%; height: 100%; object-fit: cover;" />
              <div style="position: absolute; bottom: 0; left: 0; right: 0; background: linear-gradient(to top, rgba(18,26,47,0.95), transparent); height: 40px;"></div>
            </div>
            <div style="padding: 12px; display: flex; flex-direction: column; gap: 6px; background-color: #121a2f;">
              <strong style="font-size: 13.5px; color: #d4af37; line-height: 1.3;">${name}</strong>
              <p style="margin: 0; font-size: 11px; line-height: 1.4; color: #cbd5e1;">${desc}</p>
              <div style="margin-top: 6px; display: flex; justify-content: space-between; align-items: center; font-size: 10.5px;">
                <span style="color: #94a3b8; font-weight: 500;">⏱️ ${loc.estimated_duration ? (language === 'UZ' ? `${loc.estimated_duration} daq` : language === 'RU' ? `${loc.estimated_duration} мин` : `${loc.estimated_duration}m`) : ''}</span>
                <span style="font-weight: 700; color: ${isSelected ? '#10b981' : '#64748b'};">
                  ${isSelected 
                    ? (language === 'UZ' ? '✓ Marshrutda' : language === 'RU' ? '✓ В маршруте' : '✓ In Route') 
                    : (language === 'UZ' ? 'Tanlanmagan' : language === 'RU' ? 'Не выбрано' : 'Not Selected')}
                </span>
              </div>
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
          className: 'animated-route-line', // Flowing animated class
          lineJoin: 'round',
        }).addTo(map);

        // Dynamic viewport fitting
        if (selectedLocations.length > 1) {
          map.fitBounds(polylineRef.current.getBounds(), { padding: [60, 60] });
        } else {
          map.setView(points[0], 13); // Centered and zoomed out slightly for single location
        }

        // Auto-open popup for the newly added location
        if (newlyAddedId && markersRef.current[newlyAddedId]) {
          const marker = markersRef.current[newlyAddedId];
          setTimeout(() => {
            marker.openPopup();
          }, 150);
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
  }, [locations, selectedLocations, language, activeRegion]);

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

