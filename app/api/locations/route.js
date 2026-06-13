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

    const dbLocations = (data || []).map(loc => {
      const mockLoc = MOCK_LOCATIONS.find(m => m.name_en === loc.name_en);
      return { 
        ...loc, 
        region: loc.region || 'samarqand',
        wikipedia_title_en: loc.wikipedia_title_en || mockLoc?.wikipedia_title_en || '',
        wikipedia_title_ru: loc.wikipedia_title_ru || mockLoc?.wikipedia_title_ru || '',
        wikipedia_title_uz: loc.wikipedia_title_uz || mockLoc?.wikipedia_title_uz || '',
      };
    });
    let result = dbLocations;

    const hasBuxoro = result.some(loc => loc.region === 'buxoro');
    if (!hasBuxoro) {
      const buxoroMocks = MOCK_LOCATIONS.filter(loc => loc.region === 'buxoro');
      result = [...result, ...buxoroMocks];
    }

    const hasXorazm = result.some(loc => loc.region === 'xorazm');
    if (!hasXorazm) {
      const xorazmMocks = MOCK_LOCATIONS.filter(loc => loc.region === 'xorazm');
      result = [...result, ...xorazmMocks];
    }

    const hasShahrisabz = result.some(loc => loc.region === 'shahrisabz');
    if (!hasShahrisabz) {
      const shahrisabzMocks = MOCK_LOCATIONS.filter(loc => loc.region === 'shahrisabz');
      result = [...result, ...shahrisabzMocks];
    }

    const hasToshkent = result.some(loc => loc.region === 'toshkent');
    if (!hasToshkent) {
      const toshkentMocks = MOCK_LOCATIONS.filter(loc => loc.region === 'toshkent');
      result = [...result, ...toshkentMocks];
    }

    const hasQoraqalpoq = result.some(loc => loc.region === 'qoraqalpoq');
    if (!hasQoraqalpoq) {
      const qoraqalpoqMocks = MOCK_LOCATIONS.filter(loc => loc.region === 'qoraqalpoq');
      result = [...result, ...qoraqalpoqMocks];
    }

    return NextResponse.json(result);
  } catch (err) {
    console.error('Error fetching locations from Supabase:', err);
    return NextResponse.json(MOCK_LOCATIONS);
  }
}
