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

      // Ensure every DB guide has a region default
      guidesList = guidesList.map(g => ({ ...g, region: g.region || 'samarqand' }));

      const hasBuxoro = guidesList.some(g => g.region === 'buxoro');
      if (!hasBuxoro) {
        const buxoroGuides = MOCK_GUIDES.filter(g => g.region === 'buxoro');
        guidesList = [...guidesList, ...buxoroGuides];

        const buxoroTariffs = MOCK_TARIFFS.filter(t => buxoroGuides.some(bg => bg.id === t.guide_id));
        tariffsList = [...tariffsList, ...buxoroTariffs];
      }

      const hasXorazm = guidesList.some(g => g.region === 'xorazm');
      if (!hasXorazm) {
        const xorazmGuides = MOCK_GUIDES.filter(g => g.region === 'xorazm');
        guidesList = [...guidesList, ...xorazmGuides];

        const xorazmTariffs = MOCK_TARIFFS.filter(t => xorazmGuides.some(xg => xg.id === t.guide_id));
        tariffsList = [...tariffsList, ...xorazmTariffs];
      }

      const hasShahrisabz = guidesList.some(g => g.region === 'shahrisabz');
      if (!hasShahrisabz) {
        const shahrisabzGuides = MOCK_GUIDES.filter(g => g.region === 'shahrisabz');
        guidesList = [...guidesList, ...shahrisabzGuides];

        const shahrisabzTariffs = MOCK_TARIFFS.filter(t => shahrisabzGuides.some(sg => sg.id === t.guide_id));
        tariffsList = [...tariffsList, ...shahrisabzTariffs];
      }

      const hasToshkent = guidesList.some(g => g.region === 'toshkent');
      if (!hasToshkent) {
        const toshkentGuides = MOCK_GUIDES.filter(g => g.region === 'toshkent');
        guidesList = [...guidesList, ...toshkentGuides];

        const toshkentTariffs = MOCK_TARIFFS.filter(t => toshkentGuides.some(tg => tg.id === t.guide_id));
        tariffsList = [...tariffsList, ...toshkentTariffs];
      }

      const hasQoraqalpoq = guidesList.some(g => g.region === 'qoraqalpoq');
      if (!hasQoraqalpoq) {
        const qoraqalpoqGuides = MOCK_GUIDES.filter(g => g.region === 'qoraqalpoq');
        guidesList = [...guidesList, ...qoraqalpoqGuides];

        const qoraqalpoqTariffs = MOCK_TARIFFS.filter(t => qoraqalpoqGuides.some(qg => qg.id === t.guide_id));
        tariffsList = [...tariffsList, ...qoraqalpoqTariffs];
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

