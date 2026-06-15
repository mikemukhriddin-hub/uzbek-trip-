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

async function fetchOSRMRoute(points) {
  if (points.length < 2) return null;
  try {
    const coordsStr = points.map(p => `${p[1]},${p[0]}`).join(';');
    const res = await fetch(`https://router.project-osrm.org/route/v1/driving/${coordsStr}?overview=full&geometries=geojson`);
    if (!res.ok) throw new Error('OSRM API error');
    const data = await res.json();
    if (data.code !== 'Ok' || !data.routes || data.routes.length === 0) {
      throw new Error('No route found');
    }
    const route = data.routes[0];
    const coords = route.geometry.coordinates.map(c => [c[1], c[0]]);
    return {
      coordinates: coords,
      distance: route.distance, // in meters
      duration: route.duration, // in seconds
    };
  } catch (err) {
    console.warn('Failed to fetch OSRM route, using straight lines fallback:', err);
    return null;
  }
}

function getHaversineDistance(p1, p2) {
  const R = 6371e3; // Earth radius in meters
  const phi1 = p1[0] * Math.PI / 180;
  const phi2 = p2[0] * Math.PI / 180;
  const deltaPhi = (p2[0] - p1[0]) * Math.PI / 180;
  const deltaLambda = (p2[1] - p1[1]) * Math.PI / 180;

  const a = Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
            Math.cos(phi1) * Math.cos(phi2) *
            Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // in meters
}

export default function Map({ 
  locations = [], 
  selectedLocations = [], 
  language = 'EN', 
  activeRegion = 'samarqand', 
  tourDurationType = 'single',
  onOpenWikipedia,
  theme = 'light'
}) {
  const [isInteractive, setIsInteractive] = useState(true);
  const [isNavigating, setIsNavigating] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const [navStats, setNavStats] = useState(null);

  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const markersRef = useRef({});
  const polylineRef = useRef(null);
  const prevSelectedIdsRef = useRef([]);
  const tileLayerRef = useRef(null);
  
  const LRef = useRef(null);
  const routeCoordsRef = useRef([]);
  const userMarkerRef = useRef(null);
  const simIntervalRef = useRef(null);
  const watchIdRef = useRef(null);
  const simulatedIndexRef = useRef(0);

  const stopNavigation = () => {
    setIsNavigating(false);
    setIsSimulating(false);
    setNavStats(null);
    if (simIntervalRef.current) {
      clearInterval(simIntervalRef.current);
      simIntervalRef.current = null;
    }
    if (watchIdRef.current) {
      if (typeof window !== 'undefined' && navigator.geolocation) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
      watchIdRef.current = null;
    }
    if (userMarkerRef.current && mapInstance.current) {
      try {
        mapInstance.current.removeLayer(userMarkerRef.current);
      } catch (e) {
        console.warn('Error removing user marker:', e);
      }
      userMarkerRef.current = null;
    }
  };

  const startNavigation = async (simulate = false) => {
    if (selectedLocations.length === 0) return;
    stopNavigation();
    
    setIsNavigating(true);
    const coords = routeCoordsRef.current;
    if (!coords || coords.length === 0) {
      alert(language === 'UZ' ? 'Marshrut hali hisoblanmadi. Iltimos kuting...' : 'Route not calculated yet. Please wait...');
      setIsNavigating(false);
      return;
    }

    const L = LRef.current;
    const map = mapInstance.current;
    if (!L || !map) return;

    const userIcon = L.divIcon({
      className: 'pulsing-user-dot-container',
      html: '<div class="pulsing-user-dot"></div>',
      iconSize: [16, 16],
      iconAnchor: [8, 8],
    });

    const startPos = coords[0];
    userMarkerRef.current = L.marker(startPos, { icon: userIcon }).addTo(map);
    map.setView(startPos, 17);

    if (simulate) {
      setIsSimulating(true);
      simulatedIndexRef.current = 0;
      
      const interval = setInterval(() => {
        const nextIdx = simulatedIndexRef.current + 2;
        if (nextIdx >= coords.length) {
          clearInterval(interval);
          setIsSimulating(false);
          setIsNavigating(false);
          setNavStats(null);
          if (userMarkerRef.current) {
            map.removeLayer(userMarkerRef.current);
            userMarkerRef.current = null;
          }
          alert(language === 'UZ' ? 'Sayohat yakunlandi!' : language === 'RU' ? 'Путешествие завершено!' : 'Journey finished!');
          return;
        }

        simulatedIndexRef.current = nextIdx;
        const currentPos = coords[nextIdx];
        if (userMarkerRef.current) {
          userMarkerRef.current.setLatLng(currentPos);
        }
        map.setView(currentPos, 17);

        // Calculate stats along route
        let distanceLeft = 0;
        for (let i = nextIdx; i < coords.length - 1; i++) {
          distanceLeft += getHaversineDistance(coords[i], coords[i+1]);
        }

        const speed = 45; // Simulated driving speed
        const timeLeftMin = Math.round((distanceLeft / ((speed * 1000) / 3600)) / 60);

        let nextDestinationName = '';
        const remainingTarget = selectedLocations.find(loc => {
          const dist = getHaversineDistance(currentPos, [loc.latitude, loc.longitude]);
          return dist > 60; // Has not reached yet
        });

        if (remainingTarget) {
          nextDestinationName = language === 'RU' ? remainingTarget.name_ru : language === 'UZ' ? (remainingTarget.name_uz || remainingTarget.name_en) : remainingTarget.name_en;
        } else {
          const lastLoc = selectedLocations[selectedLocations.length - 1];
          nextDestinationName = language === 'RU' ? lastLoc.name_ru : language === 'UZ' ? (lastLoc.name_uz || lastLoc.name_en) : lastLoc.name_en;
        }

        setNavStats({
          distanceLeft: (distanceLeft / 1000).toFixed(1),
          timeLeft: timeLeftMin > 0 ? timeLeftMin : 1,
          speed: speed,
          nextInstruction: language === 'UZ' 
            ? `${nextDestinationName} tomonga harakatlanmoqdasiz` 
            : language === 'RU'
            ? `Движение в сторону: ${nextDestinationName}`
            : `Heading towards: ${nextDestinationName}`
        });

      }, 800);

      simIntervalRef.current = interval;
    } else {
      setIsSimulating(false);
      if (!navigator.geolocation) {
        alert(language === 'UZ' ? 'GPS brauzeringiz tomonidan qo\'llab-quvvatlanmaydi.' : 'GPS not supported by your browser.');
        setIsNavigating(false);
        return;
      }

      const success = (pos) => {
        const { latitude, longitude, speed } = pos.coords;
        const currentPos = [latitude, longitude];

        if (userMarkerRef.current) {
          userMarkerRef.current.setLatLng(currentPos);
        }
        map.setView(currentPos, 17);

        // Find closest index on active route
        let closestIndex = 0;
        let minDist = Infinity;
        for (let i = 0; i < coords.length; i++) {
          const d = getHaversineDistance(currentPos, coords[i]);
          if (d < minDist) {
            minDist = d;
            closestIndex = i;
          }
        }

        let distanceLeft = 0;
        for (let i = closestIndex; i < coords.length - 1; i++) {
          distanceLeft += getHaversineDistance(coords[i], coords[i+1]);
        }

        const currentSpeed = speed ? Math.round(speed * 3.6) : 0;
        const speedMS = speed || 1.4; // fallback to walking speed 5km/h
        const timeLeftMin = Math.round((distanceLeft / speedMS) / 60);

        let nextDestinationName = '';
        const remainingTarget = selectedLocations.find(loc => {
          const dist = getHaversineDistance(currentPos, [loc.latitude, loc.longitude]);
          return dist > 60;
        });

        if (remainingTarget) {
          nextDestinationName = language === 'RU' ? remainingTarget.name_ru : language === 'UZ' ? (remainingTarget.name_uz || remainingTarget.name_en) : remainingTarget.name_en;
        } else {
          const lastLoc = selectedLocations[selectedLocations.length - 1];
          nextDestinationName = language === 'RU' ? lastLoc.name_ru : language === 'UZ' ? (lastLoc.name_uz || lastLoc.name_en) : lastLoc.name_en;
        }

        setNavStats({
          distanceLeft: (distanceLeft / 1000).toFixed(1),
          timeLeft: timeLeftMin > 0 ? timeLeftMin : 1,
          speed: currentSpeed,
          nextInstruction: language === 'UZ' 
            ? `${nextDestinationName} tomonga harakatlanmoqdasiz` 
            : language === 'RU'
            ? `Движение в сторону: ${nextDestinationName}`
            : `Heading towards: ${nextDestinationName}`
        });
      };

      const error = (err) => {
        console.warn('GPS error:', err);
      };

      const options = {
        enableHighAccuracy: true,
        maximumAge: 1000,
        timeout: 10000,
      };

      watchIdRef.current = navigator.geolocation.watchPosition(success, error, options);
    }
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.showWikipediaDetails = (id) => {
        const loc = locations.find(l => l.id === id);
        if (loc && onOpenWikipedia) {
          onOpenWikipedia(loc);
        }
      };
    }
    return () => {
      if (typeof window !== 'undefined') {
        delete window.showWikipediaDetails;
      }
    };
  }, [locations, onOpenWikipedia]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setTimeout(() => {
        setIsInteractive(window.innerWidth >= 768);
      }, 0);
    }
  }, []);

  useEffect(() => {
    if (mapInstance.current && tileLayerRef.current) {
      const tileUrl = theme === 'dark'
        ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
        : 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';
      tileLayerRef.current.setUrl(tileUrl);
    }
  }, [theme]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const initMap = async () => {
      const L = await import('leaflet');
      LRef.current = L;

      // Setup Leaflet standard marker asset paths
      delete L.Icon.Default.prototype._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });

      const defaultCenter = activeRegion === 'cross_region'
        ? [40.5, 65.0] // Geographic center of Uzbekistan
        : activeRegion === 'qoraqalpoq'
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
      const defaultZoom = activeRegion === 'cross_region'
        ? 6.2
        : activeRegion === 'qoraqalpoq'
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

        const tileUrl = theme === 'dark'
          ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
          : 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';

        tileLayerRef.current = L.tileLayer(tileUrl, {
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
        const markerRegion = activeRegion === 'cross_region' ? (loc.region || 'samarqand') : activeRegion;
        let color = markerRegion === 'qoraqalpoq'
          ? '#7c3aed'
          : markerRegion === 'toshkent'
          ? '#1e40af'
          : markerRegion === 'shahrisabz'
          ? '#008060'
          : markerRegion === 'xorazm'
          ? '#028090'
          : markerRegion === 'buxoro'
          ? '#c05a1a'
          : '#0070c0';

        if (loc.category === 'alternative') {
          color = markerRegion === 'qoraqalpoq'
            ? '#a78bfa'
            : markerRegion === 'toshkent'
            ? '#3b82f6'
            : markerRegion === 'shahrisabz'
            ? '#00a36c'
            : markerRegion === 'xorazm'
            ? '#00a896'
            : markerRegion === 'buxoro'
            ? '#b25329'
            : '#009b9e';
        }
        if (loc.category === 'food') color = 'var(--primary-blue)';

        let categoryEmoji = '🕌'; // Historical
        if (loc.category === 'alternative') categoryEmoji = '🌲';
        if (loc.category === 'food') categoryEmoji = '🍲';

        const iconHtml = isSelected
          ? `<div class="custom-route-marker" style="
              background-color: ${color};
              border: 2px solid var(--bg-card);
              box-shadow: 0 0 14px ${color};
              width: 24px;
              height: 24px;
              display: flex;
              align-items: center;
              justify-content: center;
              color: var(--text-primary);
              font-size: 11px;
              font-weight: 900;
            ">${selectedIndex + 1}</div>`
          : `<div style="
              background-color: ${color};
              border-radius: 50%;
              border: 1.5px solid var(--bg-card);
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

        const imgUrl = loc.image_url || LOCATION_IMAGES[loc.id] || '/images/locations/registan.webp';

        const popupText = `
          <div style="width: 220px; font-family: sans-serif; color: #f1f5f9; display: flex; flex-direction: column; overflow: hidden; border-radius: 12px;">
            <div style="width: 100%; height: 110px; position: relative; overflow: hidden; background-color: #1e293b;">
              <img src="${imgUrl}" alt="${name}" style="width: 100%; height: 100%; object-fit: cover;" />
              <div style="position: absolute; bottom: 0; left: 0; right: 0; background: linear-gradient(to top, rgba(18,26,47,0.95), transparent); height: 40px;"></div>
            </div>
            <div style="padding: 12px; display: flex; flex-direction: column; gap: 6px; background-color: var(--bg-card);">
              <strong style="font-size: 13.5px; color: var(--primary-blue); line-height: 1.3;">${name}</strong>
              <p style="margin: 0; font-size: 11px; line-height: 1.4; color: #cbd5e1;">${desc}</p>
              <div style="margin-top: 6px; display: flex; justify-content: space-between; align-items: center; font-size: 10.5px;">
                <span style="color: #94a3b8; font-weight: 500;">⏱️ ${loc.estimated_duration ? (language === 'UZ' ? `${loc.estimated_duration} daq` : language === 'RU' ? `${loc.estimated_duration} мин` : `${loc.estimated_duration}m`) : ''}</span>
                <span style="font-weight: 700; color: ${isSelected ? '#10b981' : '#64748b'};">
                  ${isSelected 
                    ? (language === 'UZ' ? '✓ Marshrutda' : language === 'RU' ? '✓ В маршруте' : '✓ In Route') 
                    : (language === 'UZ' ? 'Tanlanmagan' : language === 'RU' ? 'Не выбрано' : 'Not Selected')}
                </span>
              </div>
              <button 
                onclick="if(window.showWikipediaDetails) window.showWikipediaDetails(${loc.id})"
                style="
                  margin-top: 8px;
                  width: 100%;
                  padding: 6px 12px;
                  background-color: rgba(var(--primary-blue-rgb), 0.15);
                  border: 1.5px solid rgba(255,91,0,0.4);
                  border-radius: 6px;
                  color: var(--primary-blue);
                  font-size: 11px;
                  font-weight: 700;
                  cursor: pointer;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  gap: 4px;
                  transition: all 0.2s;
                "
                onmouseover="this.style.backgroundColor='rgba(var(--primary-blue-rgb), 0.25)'"
                onmouseout="this.style.backgroundColor='rgba(var(--primary-blue-rgb), 0.15)'"
              >
                📖 Wikipedia
              </button>
            </div>
          </div>
        `;

        const marker = L.marker([loc.latitude, loc.longitude], { icon })
          .addTo(map)
          .bindPopup(popupText);

        markersRef.current[loc.id] = marker;
      });

      // Clean existing polyline routes
      if (polylineRef.current) {
        if (Array.isArray(polylineRef.current)) {
          polylineRef.current.forEach(p => map.removeLayer(p));
        } else {
          map.removeLayer(polylineRef.current);
        }
        polylineRef.current = null;
      }

      if (selectedLocations.length > 0) {
        if (tourDurationType === 'multi') {
          const dayColors = {
            1: 'var(--primary-blue)',
            2: '#009b9e',
            3: '#c05a1a',
            4: '#7c3aed',
            5: '#008060',
          };
          
          const polylines = [];
          const maxDay = Math.max(...selectedLocations.map(l => l.selectedDay || 1));
          let allRouteCoords = [];
          
          for (let d = 1; d <= maxDay; d++) {
            const dayLocs = selectedLocations.filter(l => (l.selectedDay || 1) === d);
            if (dayLocs.length > 0) {
              const points = dayLocs.map(l => [l.latitude, l.longitude]);
              const color = dayColors[d] || 'var(--primary-blue)';
              
              let routePoints = points;
              let routeData = null;
              if (points.length >= 2) {
                routeData = await fetchOSRMRoute(points);
                if (routeData) {
                  routePoints = routeData.coordinates;
                }
              }
              
              allRouteCoords = allRouteCoords.concat(routePoints);
              
              const pLine = L.polyline(routePoints, {
                color: color,
                weight: 4,
                opacity: 0.85,
                className: 'animated-route-line',
                lineJoin: 'round',
              }).addTo(map);
              
              polylines.push(pLine);
            }
          }
          polylineRef.current = polylines;
          routeCoordsRef.current = allRouteCoords;

          const allPoints = selectedLocations.map(l => [l.latitude, l.longitude]);
          if (allPoints.length > 1) {
            const bounds = L.latLngBounds(allPoints);
            map.fitBounds(bounds, { padding: [60, 60] });
          } else if (allPoints.length === 1) {
            map.setView(allPoints[0], 13);
          }
        } else {
          const points = selectedLocations.map((loc) => [loc.latitude, loc.longitude]);
          let routePoints = points;
          let routeData = null;

          if (points.length >= 2) {
            routeData = await fetchOSRMRoute(points);
            if (routeData) {
              routePoints = routeData.coordinates;
            }
          }

          routeCoordsRef.current = routePoints;
          
          polylineRef.current = L.polyline(routePoints, {
            color: 'var(--primary-blue)',
            weight: 4,
            opacity: 0.85,
            className: 'animated-route-line',
            lineJoin: 'round',
          }).addTo(map);

          if (selectedLocations.length > 1) {
            map.fitBounds(polylineRef.current.getBounds(), { padding: [60, 60] });
          } else {
            map.setView(points[0], 13);
          }
        }

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
      stopNavigation();
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, [locations, selectedLocations, language, activeRegion, tourDurationType]);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', minHeight: '400px' }}>
      <style>{`
        @keyframes pulse-blue {
          0% { box-shadow: 0 0 0 0 rgba(37, 99, 235, 0.7); }
          70% { box-shadow: 0 0 0 10px rgba(37, 99, 235, 0); }
          100% { box-shadow: 0 0 0 0 rgba(37, 99, 235, 0); }
        }
        .pulsing-user-dot {
          width: 16px;
          height: 16px;
          background-color: #2563eb;
          border-radius: 50%;
          border: 2.5px solid #ffffff;
          animation: pulse-blue 1.8s infinite;
        }
        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>

      {/* Floating Navigate Button */}
      {!isNavigating && selectedLocations.length > 0 && (
        <button
          onClick={() => startNavigation(false)}
          onDoubleClick={() => startNavigation(true)}
          title={language === 'UZ' ? "Yo'nalishni boshlash (Simulyatsiya qilish uchun 2 marta bosing)" : "Start navigation (Double click to simulate)"}
          style={{
            position: 'absolute',
            bottom: '24px',
            right: '24px',
            zIndex: 1000,
            padding: '12px 20px',
            backgroundColor: 'var(--primary-blue)',
            color: '#fff',
            border: 'none',
            borderRadius: '50px',
            fontWeight: '700',
            fontSize: '13px',
            boxShadow: '0 6px 20px rgba(255, 91, 0, 0.4)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'all 0.2s ease-in-out',
            fontFamily: 'sans-serif'
          }}
        >
          <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"></polygon>
          </svg>
          <span>{language === 'UZ' ? 'Navigatsiya' : language === 'RU' ? 'Навигация' : 'Navigate'}</span>
        </button>
      )}

      {/* HUD Navigation Panel Overlay */}
      {isNavigating && (
        <div style={{
          position: 'absolute',
          bottom: '16px',
          left: '16px',
          right: '16px',
          zIndex: 1000,
          backgroundColor: 'rgba(15, 23, 42, 0.88)',
          backdropFilter: 'blur(12px)',
          border: '1.5px solid rgba(255, 91, 0, 0.3)',
          borderRadius: '16px',
          padding: '16px',
          color: '#f1f5f9',
          boxShadow: '0 10px 30px rgba(0,0,0,0.6)',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          fontFamily: 'sans-serif',
          animation: 'slideUp 0.3s ease-out'
        }}>
          {/* Header Line */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
              <span style={{ fontSize: '20px' }}>🧭</span>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '10px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: '700' }}>
                  {isSimulating 
                    ? (language === 'UZ' ? 'Simulyatsiya rejimi (Demo)' : language === 'RU' ? 'Режим симуляции' : 'Simulation Mode')
                    : (language === 'UZ' ? 'Jonli GPS yo\'nalishi' : language === 'RU' ? 'Живая GPS навигация' : 'Live GPS Navigation')}
                </span>
                <span style={{ fontSize: '13.5px', fontWeight: '700', color: '#fff' }}>
                  {navStats?.nextInstruction || (language === 'UZ' ? 'Joylashuv aniqlanmoqda...' : 'Locating...')}
                </span>
              </div>
            </div>
            
            {/* Speed HUD indicator */}
            <div style={{
              backgroundColor: 'rgba(255, 91, 0, 0.15)',
              border: '1px solid rgba(255, 91, 0, 0.3)',
              padding: '6px 12px',
              borderRadius: '12px',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              minWidth: '65px'
            }}>
              <span style={{ fontSize: '16px', fontWeight: '900', color: 'var(--primary-blue)' }}>
                {navStats ? navStats.speed : 0}
              </span>
              <span style={{ fontSize: '8px', color: '#cbd5e1' }}>km/h</span>
            </div>
          </div>

          {/* Progress bar */}
          {isSimulating && routeCoordsRef.current.length > 0 && (
            <div style={{ width: '100%', height: '4px', backgroundColor: '#334155', borderRadius: '2px', overflow: 'hidden' }}>
              <div style={{
                width: `${(simulatedIndexRef.current / routeCoordsRef.current.length) * 100}%`,
                height: '100%',
                backgroundColor: 'var(--primary-blue)',
                transition: 'width 0.3s ease'
              }} />
            </div>
          )}

          {/* Stats grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div style={{ backgroundColor: 'rgba(30, 41, 59, 0.5)', padding: '10px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.05)' }}>
              <div style={{ fontSize: '10px', color: '#94a3b8' }}>
                {language === 'UZ' ? 'Qolgan masofa' : language === 'RU' ? 'Осталось' : 'Distance left'}
              </div>
              <div style={{ fontSize: '15px', fontWeight: '700', color: '#10b981', marginTop: '2px' }}>
                {navStats ? `${navStats.distanceLeft} km` : '--'}
              </div>
            </div>
            <div style={{ backgroundColor: 'rgba(30, 41, 59, 0.5)', padding: '10px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.05)' }}>
              <div style={{ fontSize: '10px', color: '#94a3b8' }}>
                {language === 'UZ' ? 'Yetib borish vaqti' : language === 'RU' ? 'Время' : 'Time left'}
              </div>
              <div style={{ fontSize: '15px', fontWeight: '700', color: '#3b82f6', marginTop: '2px' }}>
                {navStats ? `${navStats.timeLeft} daq` : '--'}
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
            <button
              onClick={() => {
                if (isSimulating) {
                  startNavigation(false);
                } else {
                  startNavigation(true);
                }
              }}
              style={{
                flex: 1,
                padding: '8px 12px',
                backgroundColor: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                color: '#fff',
                borderRadius: '8px',
                fontWeight: '600',
                fontSize: '11px',
                cursor: 'pointer',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px'
              }}
            >
              {isSimulating ? (
                <>
                  <svg viewBox="0 0 24 24" width="12" height="12" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect>
                    <line x1="12" y1="18" x2="12.01" y2="18"></line>
                  </svg>
                  <span>📱 Real GPS</span>
                </>
              ) : (
                <>
                  <svg viewBox="0 0 24 24" width="12" height="12" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                    <path d="M12 2v2M12 4a5 5 0 0 1 5 5v2H7V9a5 5 0 0 1 5-5z"></path>
                  </svg>
                  <span>🤖 Demo Simulyatsiya</span>
                </>
              )}
            </button>
            
            <button
              onClick={stopNavigation}
              style={{
                padding: '8px 16px',
                backgroundColor: '#ef4444',
                border: 'none',
                color: '#fff',
                borderRadius: '8px',
                fontWeight: '700',
                fontSize: '11px',
                cursor: 'pointer',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <svg viewBox="0 0 24 24" width="12" height="12" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
              </svg>
              <span>{language === 'UZ' ? 'To\'xtatish' : language === 'RU' ? 'Стоп' : 'Stop'}</span>
            </button>
          </div>
        </div>
      )}

      {!isInteractive && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(0, 0, 0, 0.55)',
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
              backgroundColor: 'var(--primary-blue)',
              color: 'var(--bg-card)',
              border: 'none',
              borderRadius: '8px',
              fontWeight: '700',
              cursor: 'pointer',
              fontSize: '12px',
              boxShadow: '0 4px 12px rgba(255, 91, 0, 0.3)'
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
          border: '1px solid rgba(255,91,0,0.2)',
          pointerEvents: isInteractive ? 'auto' : 'none'
        }} 
      />
    </div>
  );
}

