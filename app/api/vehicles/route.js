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

    const dbVehicles = (data || []).map(v => ({ ...v, region: v.region || 'samarqand' }));
    let result = dbVehicles;

    const hasBuxoro = result.some(v => v.region === 'buxoro');
    if (!hasBuxoro) {
      const buxoroMocks = MOCK_VEHICLES.filter(v => v.region === 'buxoro');
      result = [...result, ...buxoroMocks];
    }

    const hasXorazm = result.some(v => v.region === 'xorazm');
    if (!hasXorazm) {
      const xorazmMocks = MOCK_VEHICLES.filter(v => v.region === 'xorazm');
      result = [...result, ...xorazmMocks];
    }

    return NextResponse.json(result);
  } catch (err) {
    console.error('Error fetching vehicles from Supabase:', err);
    return NextResponse.json(MOCK_VEHICLES);
  }
}
