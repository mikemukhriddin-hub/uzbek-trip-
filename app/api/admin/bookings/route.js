import { NextResponse } from 'next/server';
import { supabase, supabaseConfigured } from '@/lib/supabase';
import { generateGuideToken } from '@/lib/token';

// Mock Bookings for offline testing fallback
const MOCK_BOOKINGS = [
  {
    id: 101,
    tourist_name: 'John Doe',
    tourist_email: 'john@example.com',
    tourist_phone: '+15550199',
    booking_date: '2026-06-01',
    total_price: 135.00,
    customer_language: 'EN',
    status: 'confirmed',
    created_at: new Date(Date.now() - 3600000).toISOString(),
    guide: { full_name: 'Sherzod Alimov', phone_number: '+998901234567', region: 'samarqand' },
    vehicle: { driver_name: 'Alisher aka', driver_phone: '+998909998877', car_model: 'Chevrolet Cobalt (White)', car_number: '01 A 777 BA', region: 'samarqand' },
    booking_items: [
      { visit_order: 1, location: { name_en: 'Registan Square', name_ru: 'Площадь Регистан', name_uz: 'Registon maydoni', region: 'samarqand' } },
      { visit_order: 2, location: { name_en: 'Gur-e-Amir Mausoleum', name_ru: 'Мавзолей Гур-Эмир', name_uz: "Go'ri Amir maqbarasi", region: 'samarqand' } }
    ]
  },
  {
    id: 102,
    tourist_name: 'Mikhail Volkov',
    tourist_email: 'mikhail@example.ru',
    tourist_phone: '+79998887766',
    booking_date: '2026-06-02',
    total_price: 155.00,
    customer_language: 'RU',
    status: 'pending',
    created_at: new Date().toISOString(),
    guide: { full_name: 'Elena Petrova', phone_number: '+998937654321', region: 'samarqand' },
    vehicle: { driver_name: 'Doston aka', driver_phone: '+998935554433', car_model: 'Chevrolet Gentra (Black)', car_number: '01 Z 888 ZZ', region: 'samarqand' },
    booking_items: [
      { visit_order: 1, location: { name_en: 'Shah-i-Zinda', name_ru: 'Шахи Зинда', name_uz: 'Shohi Zinda', region: 'samarqand' } },
      { visit_order: 2, location: { name_en: 'Urgut Mountain Bazaar & Hills', name_ru: 'Ургутский горный базар и горы', name_uz: "Urgut tog' bozori va adirlari", region: 'samarqand' } }
    ]
  }
];

async function checkAuth(req) {
  const authHeader = req.headers.get('Authorization');
  const adminPass = process.env.ADMIN_PASSWORD || 'admin123';
  if (authHeader === adminPass) {
    return { authorized: true, role: 'admin' };
  }
  if (!authHeader) {
    return { authorized: false };
  }

  // Check if it's a guide's secure token
  if (supabaseConfigured) {
    try {
      const { data: allGuides, error } = await supabase
        .from('guides')
        .select('id, full_name, phone_number');

      if (allGuides && !error) {
        const found = allGuides.find(g => generateGuideToken(g.phone_number) === authHeader);
        if (found) {
          return { authorized: true, role: 'guide', guideId: found.id, guide: found };
        }
      }
    } catch (e) {
      console.error('Auth error in bookings:', e);
    }
  } else {
    // Offline/Mock Fallback
    const mockGuides = [
      { id: 1, full_name: 'Sherzod Alimov', phone_number: '+998901234567' },
      { id: 2, full_name: 'Elena Petrova', phone_number: '+998937654321' },
      { id: 3, full_name: 'Jahongir Rustamov', phone_number: '+998971112233' }
    ];
    const found = mockGuides.find(g => generateGuideToken(g.phone_number) === authHeader);
    if (found) {
      return { authorized: true, role: 'guide', guideId: found.id, guide: found };
    }
  }
  return { authorized: false };
}


export async function GET(req) {
  const auth = await checkAuth(req);
  if (!auth.authorized) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  if (!supabaseConfigured) {
    if (auth.role === 'guide') {
      return NextResponse.json(MOCK_BOOKINGS.filter(b => b.guide?.phone_number === auth.guide.phone_number));
    }
    return NextResponse.json(MOCK_BOOKINGS);
  }

  try {
    let query = supabase
      .from('bookings')
      .select(`
        *,
        guide:guides(full_name, phone_number, region),
        vehicle:vehicles(driver_name, driver_phone, car_model, car_number, region),
        booking_items(
          visit_order,
          location:locations(id, name_en, name_ru, name_uz, region)
        )
      `);

    if (auth.role === 'guide') {
      query = query.eq('guide_id', auth.guideId);
    }

    let { data: bookings, error } = await query.order('created_at', { ascending: false });

    if (error) {
      if (error.message && error.message.includes('name_uz')) {
        console.warn('⚠️ name_uz column not found in locations table, retrying admin bookings query without it...');
        let fallbackQuery = supabase
          .from('bookings')
          .select(`
            *,
            guide:guides(full_name, phone_number, region),
            vehicle:vehicles(driver_name, driver_phone, car_model, car_number, region),
            booking_items(
              visit_order,
              location:locations(id, name_en, name_ru, region)
            )
          `);

        if (auth.role === 'guide') {
          fallbackQuery = fallbackQuery.eq('guide_id', auth.guideId);
        }

        const { data: fallbackBookings, error: fallbackError } = await fallbackQuery.order('created_at', { ascending: false });
        if (fallbackError) throw fallbackError;
        
        bookings = fallbackBookings || [];
        bookings.forEach(b => {
          if (b.booking_items) {
            b.booking_items.forEach(item => {
              if (item.location) {
                item.location.name_uz = item.location.name_en; // fallback
              }
            });
          }
        });
      } else {
        throw error;
      }
    }

    return NextResponse.json(bookings);
  } catch (err) {
    console.error('Error fetching bookings for admin:', err);
    return NextResponse.json({ message: 'Database error', error: err.message }, { status: 500 });
  }
}

export async function PATCH(req) {
  const auth = await checkAuth(req);
  if (!auth.authorized) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { bookingId, status } = await req.json();

    if (!bookingId || !status) {
      return NextResponse.json({ message: 'Missing bookingId or status' }, { status: 400 });
    }

    const validStatuses = ['pending', 'confirmed', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ message: 'Invalid status' }, { status: 400 });
    }

    if (auth.role === 'guide') {
      // Check if this booking is assigned to the guide
      if (supabaseConfigured) {
        const { data: booking, error } = await supabase
          .from('bookings')
          .select('guide_id')
          .eq('id', bookingId)
          .maybeSingle();

        if (error || !booking || booking.guide_id !== auth.guideId) {
          return NextResponse.json({ message: 'Forbidden: This booking is not assigned to you' }, { status: 403 });
        }
      } else {
        const found = MOCK_BOOKINGS.find(b => b.id === bookingId);
        if (!found || found.guide?.phone_number !== auth.guide.phone_number) {
          return NextResponse.json({ message: 'Forbidden: This booking is not assigned to you' }, { status: 403 });
        }
      }
    }

    if (!supabaseConfigured) {
      // Return success mock update
      return NextResponse.json({ message: 'Mock update successful', bookingId, status });
    }

    const { error } = await supabase
      .from('bookings')
      .update({ status })
      .eq('id', bookingId);

    if (error) throw error;

    return NextResponse.json({ message: 'Booking status updated successfully', bookingId, status });
  } catch (err) {
    console.error('Error updating booking status:', err);
    return NextResponse.json({ message: 'Internal server error', error: err.message }, { status: 500 });
  }
}

export async function DELETE(req) {
  const auth = await checkAuth(req);
  if (!auth.authorized || auth.role !== 'admin') {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const bookingId = searchParams.get('bookingId');
  const clearAll = searchParams.get('clearAll') === 'true';

  if (!bookingId && !clearAll) {
    return NextResponse.json({ message: 'Missing bookingId or clearAll parameter' }, { status: 400 });
  }

  if (!supabaseConfigured) {
    return NextResponse.json({ message: 'Mock delete successful', bookingId, clearAll });
  }

  try {
    if (clearAll) {
      const { error } = await supabase
        .from('bookings')
        .delete()
        .neq('id', 0); // deletes all rows

      if (error) throw error;
      return NextResponse.json({ message: 'All bookings cleared successfully' });
    } else {
      const { error } = await supabase
        .from('bookings')
        .delete()
        .eq('id', bookingId);

      if (error) throw error;
      return NextResponse.json({ message: 'Booking deleted successfully', bookingId });
    }
  } catch (err) {
    console.error('Error deleting booking:', err);
    return NextResponse.json({ message: 'Internal server error', error: err.message }, { status: 500 });
  }
}
