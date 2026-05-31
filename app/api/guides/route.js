import { NextResponse } from 'next/server';
import { supabase, supabaseConfigured } from '@/lib/supabase';

const MOCK_GUIDES = [
  { id: 1, full_name: 'Sherzod Alimov', phone_number: '+998901234567' },
  { id: 2, full_name: 'Elena Petrova', phone_number: '+998937654321' },
  { id: 3, full_name: 'Jahongir Rustamov', phone_number: '+998971112233' }
];

const MOCK_TARIFFS = [
  { id: 1, guide_id: 1, language_code: 'EN', daily_rate: 50.00 },
  { id: 2, guide_id: 1, language_code: 'RU', daily_rate: 40.00 },
  { id: 3, guide_id: 2, language_code: 'RU', daily_rate: 45.00 },
  { id: 4, guide_id: 2, language_code: 'FR', daily_rate: 65.00 },
  { id: 5, guide_id: 3, language_code: 'EN', daily_rate: 60.00 },
  { id: 6, guide_id: 3, language_code: 'RU', daily_rate: 50.00 },
  { id: 7, guide_id: 3, language_code: 'ES', daily_rate: 70.00 }
];

export async function GET() {
  if (!supabaseConfigured) {
    return NextResponse.json({ guides: MOCK_GUIDES, tariffs: MOCK_TARIFFS });
  }

  try {
    const { data: guides, error: guidesError } = await supabase
      .from('guides')
      .select('*');

    const { data: tariffs, error: tariffsError } = await supabase
      .from('guide_language_tariffs')
      .select('*');

    if (guidesError) throw guidesError;
    if (tariffsError) throw tariffsError;

    return NextResponse.json({ guides, tariffs });
  } catch (err) {
    console.error('Error fetching guides from Supabase:', err);
    return NextResponse.json({ guides: MOCK_GUIDES, tariffs: MOCK_TARIFFS });
  }
}
