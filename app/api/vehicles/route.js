import { NextResponse } from 'next/server';
import { supabase, supabaseConfigured } from '@/lib/supabase';

const MOCK_VEHICLES = [
  { id: 1, driver_name: 'Alisher aka', driver_phone: '+998909998877', car_model: 'Chevrolet Cobalt (White)', car_number: '01 A 777 BA', city_rate: 30.00, out_of_city_rate: 45.00, capacity: 5 },
  { id: 2, driver_name: 'Doston aka', driver_phone: '+998935554433', car_model: 'Chevrolet Gentra (Black)', car_number: '01 Z 888 ZZ', city_rate: 35.00, out_of_city_rate: 50.00, capacity: 5 },
  { id: 3, driver_name: 'Sarvar aka', driver_phone: '+998993332211', car_model: 'Chevrolet Gentra (Silver)', car_number: '01 Y 555 YY', city_rate: 35.00, out_of_city_rate: 50.00, capacity: 5 },
  { id: 4, driver_name: 'Odil aka', driver_phone: '+998901234567', car_model: 'Hyundai H1 Minivan (Silver)', car_number: '01 X 777 XX', city_rate: 50.00, out_of_city_rate: 75.00, capacity: 8 },
  { id: 5, driver_name: 'Jahongir aka', driver_phone: '+998909876543', car_model: 'Isuzu Bus (Turquoise)', car_number: '01 B 999 BB', city_rate: 120.00, out_of_city_rate: 180.00, capacity: 20 }
];

export async function GET() {
  if (!supabaseConfigured) {
    return NextResponse.json(MOCK_VEHICLES);
  }

  try {
    const { data, error } = await supabase
      .from('vehicles')
      .select('*');

    if (error) throw error;
    return NextResponse.json(data);
  } catch (err) {
    console.error('Error fetching vehicles from Supabase:', err);
    return NextResponse.json(MOCK_VEHICLES);
  }
}
