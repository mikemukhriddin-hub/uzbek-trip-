import { NextResponse } from 'next/server';
import { supabase, supabaseConfigured } from '@/lib/supabase';

import { MOCK_LOCATIONS } from '@/lib/mockData';

export async function GET() {
  if (!supabaseConfigured) {
    return NextResponse.json(MOCK_LOCATIONS);
  }

  try {
    const { data, error } = await supabase
      .from('locations')
      .select('*')
      .order('id', { ascending: true });

    if (error) throw error;

    const hasBuxoro = data && data.some(loc => loc.region === 'buxoro');
    if (!hasBuxoro) {
      const dbLocations = (data || []).map(loc => ({ ...loc, region: loc.region || 'samarqand' }));
      const buxoroMocks = MOCK_LOCATIONS.filter(loc => loc.region === 'buxoro');
      return NextResponse.json([...dbLocations, ...buxoroMocks]);
    }

    return NextResponse.json(data);
  } catch (err) {
    console.error('Error fetching locations from Supabase:', err);
    return NextResponse.json(MOCK_LOCATIONS);
  }
}
