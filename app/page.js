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
    return data && data.length > 0 ? data : MOCK_LOCATIONS;
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

    return {
      guides: guides && guides.length > 0 ? guides : MOCK_GUIDES,
      tariffs: tariffs && tariffs.length > 0 ? tariffs : MOCK_TARIFFS
    };
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
    return data && data.length > 0 ? data : MOCK_VEHICLES;
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
