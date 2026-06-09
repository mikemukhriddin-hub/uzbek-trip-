import { NextResponse } from 'next/server';
import { supabase, supabaseConfigured } from '@/lib/supabase';

import { MOCK_VEHICLES } from '@/lib/mockData';

export async function GET() {
  if (!supabaseConfigured) {
    return NextResponse.json(MOCK_VEHICLES);
  }

  try {
    const { data, error } = await supabase
      .from('vehicles')
      .select('*');

    if (error) throw error;

    const hasBuxoro = data && data.some(v => v.region === 'buxoro');
    if (!hasBuxoro) {
      const dbVehicles = (data || []).map(v => ({ ...v, region: v.region || 'samarqand' }));
      const buxoroMocks = MOCK_VEHICLES.filter(v => v.region === 'buxoro');
      return NextResponse.json([...dbVehicles, ...buxoroMocks]);
    }

    return NextResponse.json(data);
  } catch (err) {
    console.error('Error fetching vehicles from Supabase:', err);
    return NextResponse.json(MOCK_VEHICLES);
  }
}
