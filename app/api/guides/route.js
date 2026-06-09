import { NextResponse } from 'next/server';
import { supabase, supabaseConfigured } from '@/lib/supabase';
import { generateGuideToken } from '@/lib/token';

import { MOCK_GUIDES, MOCK_TARIFFS } from '@/lib/mockData';

export async function GET(req) {
  const authHeader = req.headers.get('Authorization');
  const expectedPassword = process.env.ADMIN_PASSWORD || 'admin123';
  const isAdmin = authHeader === expectedPassword;

  let guidesList = [];
  let tariffsList = [];

  if (!supabaseConfigured) {
    guidesList = MOCK_GUIDES;
    tariffsList = MOCK_TARIFFS;
  } else {
    try {
      const { data: guides, error: guidesError } = await supabase
        .from('guides')
        .select('*');

      const { data: tariffs, error: tariffsError } = await supabase
        .from('guide_language_tariffs')
        .select('*');

      if (guidesError) throw guidesError;
      if (tariffsError) throw tariffsError;

      guidesList = guides || [];
      tariffsList = tariffs || [];

      const hasBuxoro = guidesList.some(g => g.region === 'buxoro');
      if (!hasBuxoro) {
        guidesList = guidesList.map(g => ({ ...g, region: g.region || 'samarqand' }));
        const buxoroGuides = MOCK_GUIDES.filter(g => g.region === 'buxoro');
        guidesList = [...guidesList, ...buxoroGuides];

        const buxoroTariffs = MOCK_TARIFFS.filter(t => buxoroGuides.some(bg => bg.id === t.guide_id));
        tariffsList = [...tariffsList, ...buxoroTariffs];
      }
    } catch (err) {
      console.error('Error fetching guides from Supabase:', err);
      guidesList = MOCK_GUIDES;
      tariffsList = MOCK_TARIFFS;
    }
  }

  // Include access token only if admin is authenticated or if it's the guide themselves
  const processedGuides = guidesList.map(g => {
    const computedToken = generateGuideToken(g.phone_number);
    if (isAdmin || authHeader === computedToken) {
      return {
        ...g,
        access_token: computedToken
      };
    }
    return g;
  });

  return NextResponse.json({ guides: processedGuides, tariffs: tariffsList });
}

