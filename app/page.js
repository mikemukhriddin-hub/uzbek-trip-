import React from 'react';
import { supabase, supabaseConfigured } from '@/lib/supabase';
import ClientDashboard from './ClientDashboard';
import { MOCK_LOCATIONS, MOCK_GUIDES, MOCK_TARIFFS, MOCK_VEHICLES } from '@/lib/mockData';


export const revalidate = 60; // Revalidate page every 60 seconds (ISR)

async function getLocations() {
  if (!supabaseConfigured) return MOCK_LOCATIONS;
  try {
    const { data, error } = await supabase
      .from('locations')
      .select('*')
      .order('id', { ascending: true });
    if (error) throw error;

    let result = (data || []).map(loc => ({ ...loc, region: loc.region || 'samarqand' }));
    if (result.length === 0) return MOCK_LOCATIONS;

    // Merge missing regions from mock data
    ['buxoro', 'xorazm', 'shahrisabz'].forEach(region => {
      if (!result.some(loc => loc.region === region)) {
        result = [...result, ...MOCK_LOCATIONS.filter(loc => loc.region === region)];
      }
    });

    return result;
  } catch (err) {
    console.error('Error fetching locations from Supabase:', err);
    return MOCK_LOCATIONS;
  }
}

async function getGuidesData() {
  const fallback = { guides: MOCK_GUIDES, tariffs: MOCK_TARIFFS };
  if (!supabaseConfigured) return fallback;
  try {
    const { data: guides, error: gError } = await supabase
      .from('guides')
      .select('*')
      .order('id', { ascending: true });
    if (gError) throw gError;

    const { data: tariffs, error: tError } = await supabase
      .from('guide_language_tariffs')
      .select('*');
    if (tError) throw tError;

    let guidesList = (guides || []).map(g => ({ ...g, region: g.region || 'samarqand' }));
    let tariffsList = tariffs || [];

    if (guidesList.length === 0) return fallback;

    // Merge missing regions from mock data
    ['buxoro', 'xorazm', 'shahrisabz'].forEach(region => {
      if (!guidesList.some(g => g.region === region)) {
        const mockG = MOCK_GUIDES.filter(g => g.region === region);
        guidesList = [...guidesList, ...mockG];
        const mockT = MOCK_TARIFFS.filter(t => mockG.some(mg => mg.id === t.guide_id));
        tariffsList = [...tariffsList, ...mockT];
      }
    });

    return { guides: guidesList, tariffs: tariffsList };
  } catch (err) {
    console.error('Error fetching guides from Supabase:', err);
    return fallback;
  }
}

async function getVehicles() {
  if (!supabaseConfigured) return MOCK_VEHICLES;
  try {
    const { data, error } = await supabase
      .from('vehicles')
      .select('*')
      .order('id', { ascending: true });
    if (error) throw error;

    let result = (data || []).map(v => ({ ...v, region: v.region || 'samarqand' }));
    if (result.length === 0) return MOCK_VEHICLES;

    // Merge missing regions from mock data
    ['buxoro', 'xorazm', 'shahrisabz'].forEach(region => {
      if (!result.some(v => v.region === region)) {
        result = [...result, ...MOCK_VEHICLES.filter(v => v.region === region)];
      }
    });

    return result;
  } catch (err) {
    console.error('Error fetching vehicles from Supabase:', err);
    return MOCK_VEHICLES;
  }
}

export default async function Page() {
  // Fetch database records in parallel on the server
  const [locations, guidesData, vehicles] = await Promise.all([
    getLocations(),
    getGuidesData(),
    getVehicles()
  ]);

  return (
    <ClientDashboard 
      initialLocations={locations} 
      initialGuides={guidesData.guides} 
      initialTariffs={guidesData.tariffs} 
      initialVehicles={vehicles} 
    />
  );
}
