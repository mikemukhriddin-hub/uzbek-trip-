import { NextResponse } from 'next/server';
import { supabase, supabaseConfigured } from '@/lib/supabase';
import { validateMagicToken } from '@/lib/token';

const MOCK_BOOKING = {
  id: 101,
  tourist_name: 'John Doe',
  tourist_email: 'john@example.com',
  tourist_phone: '+15550199',
  booking_date: '2026-06-01',
  total_price: 135.00,
  customer_language: 'EN',
  status: 'confirmed',
  created_at: new Date(Date.now() - 3600000).toISOString(),
  guide: { full_name: 'Sherzod Alimov', phone_number: '+998901234567' },
  vehicle: { driver_name: 'Alisher aka', driver_phone: '+998909998877', car_model: 'Chevrolet Cobalt (White)', car_number: '01 A 777 BA' },
  booking_items: [
    { visit_order: 1, location: { name_en: 'Registan Square', name_ru: 'Площадь Регистан', name_uz: 'Registon maydoni' } },
    { visit_order: 2, location: { name_en: 'Gur-e-Amir Mausoleum', name_ru: 'Мавзолей Гур-Эмир', name_uz: 'Go\'ri Amir maqbarasi' } }
  ]
};

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const bookingId = searchParams.get('id');
    const token = searchParams.get('token');

    if (!bookingId || !token) {
      return NextResponse.json({ message: 'Missing booking ID or token.' }, { status: 400 });
    }

    const bypassSupabase = req.headers.get('x-bypass-supabase') === 'true';
    console.log('🔍 [my-tour API] x-bypass-supabase header:', req.headers.get('x-bypass-supabase'), 'Raw Headers:', JSON.stringify(Object.fromEntries(req.headers.entries())));
    const isDbActive = supabaseConfigured && !bypassSupabase;

    if (!isDbActive) {
      // Mock mode validation
      let mockBooking = MOCK_BOOKING;
      if (global.mockBookingsStore) {
        const stored = global.mockBookingsStore.get(bookingId);
        if (stored) mockBooking = stored;
      }

      const email = mockBooking.tourist_email || mockBooking.touristEmail || 'john@example.com';
      const isValid = validateMagicToken(bookingId, email, token);
      if (!isValid) {
        return NextResponse.json({ message: 'Invalid or expired token.' }, { status: 403 });
      }
      return NextResponse.json(mockBooking);
    }

    // 1. Fetch booking details to get the email for token validation
    const { data: booking, error } = await supabase
      .from('bookings')
      .select(`
        *,
        guide:guides(full_name, phone_number),
        vehicle:vehicles(driver_name, driver_phone, car_model, car_number),
        booking_items(
          visit_order,
          location:locations(id, name_en, name_ru, name_uz)
        )
      `)
      .eq('id', bookingId)
      .single();

    if (error || !booking) {
      console.error('Error fetching booking for magic token validation:', error);
      return NextResponse.json({ message: 'Booking not found.' }, { status: 404 });
    }

    // 2. Validate token
    const isValid = validateMagicToken(bookingId, booking.tourist_email, token);
    if (!isValid) {
      return NextResponse.json({ message: 'Invalid or expired token.' }, { status: 403 });
    }

    return NextResponse.json(booking);
  } catch (err) {
    console.error('Error in GET /api/bookings/my-tour:', err);
    return NextResponse.json({ message: 'Internal server error.' }, { status: 500 });
  }
}
