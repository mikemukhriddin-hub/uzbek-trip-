import { NextResponse } from 'next/server';
import { supabase, supabaseConfigured } from '@/lib/supabase';

const DEFAULT_VEHICLE_IMAGES = {
  sedan: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=600&q=80',
  gentra: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=600&q=80',
  cobalt: 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&w=600&q=80',
  minivan: 'https://images.unsplash.com/photo-1508974239320-0a029497e820?auto=format&fit=crop&w=600&q=80',
  bus: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=600&q=80'
};

function getFallbackVehicleImage(carModel = '') {
  const model = (carModel || '').toLowerCase();
  if (model.includes('bus') || model.includes('sprinter') || model.includes('microbus') || model.includes('yutong') || model.includes('van')) {
    return DEFAULT_VEHICLE_IMAGES.bus;
  }
  if (model.includes('minivan') || model.includes('carnival') || model.includes('h1') || model.includes('hyundai') || model.includes('staria')) {
    return DEFAULT_VEHICLE_IMAGES.minivan;
  }
  if (model.includes('gentra') || model.includes('lacetti')) {
    return DEFAULT_VEHICLE_IMAGES.gentra;
  }
  if (model.includes('cobalt')) {
    return DEFAULT_VEHICLE_IMAGES.cobalt;
  }
  return DEFAULT_VEHICLE_IMAGES.sedan;
}

function isAuthorized(req) {
  const authHeader = req.headers.get('Authorization');
  const expectedPassword = process.env.ADMIN_PASSWORD || 'admin123';
  return authHeader === expectedPassword;
}

export async function POST(req) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { driver_name, driver_phone, car_model, car_number, city_rate, out_of_city_rate, telegram_chat_id, bot_active, image_url, region } = body;

    if (!driver_name || !driver_phone || !car_model || !car_number || city_rate === undefined || out_of_city_rate === undefined) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    const finalImageUrl = image_url || getFallbackVehicleImage(car_model);

    if (!supabaseConfigured) {
      return NextResponse.json({ message: 'Mock mode: Vehicle created successfully', data: { id: Math.floor(100 + Math.random() * 900), ...body, image_url: finalImageUrl } });
    }

    const { data, error } = await supabase
      .from('vehicles')
      .insert({
        driver_name,
        driver_phone,
        car_model,
        car_number,
        city_rate: parseFloat(city_rate),
        out_of_city_rate: parseFloat(out_of_city_rate),
        telegram_chat_id: telegram_chat_id ? parseInt(telegram_chat_id, 10) : null,
        bot_active: !!bot_active,
        image_url: finalImageUrl,
        region: region || 'samarqand'
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ message: 'Vehicle created successfully', data });
  } catch (err) {
    console.error('Error creating vehicle:', err);
    return NextResponse.json({ message: 'Internal server error', error: err.message }, { status: 500 });
  }
}

export async function PATCH(req) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { id, driver_name, driver_phone, car_model, car_number, city_rate, out_of_city_rate, telegram_chat_id, bot_active, image_url, region } = body;

    if (!id) {
      return NextResponse.json({ message: 'Missing vehicle ID' }, { status: 400 });
    }

    if (!supabaseConfigured) {
      return NextResponse.json({ message: 'Mock mode: Vehicle updated successfully', data: body });
    }

    const { data, error } = await supabase
      .from('vehicles')
      .upsert({
        id,
        driver_name,
        driver_phone,
        car_model,
        car_number,
        city_rate: city_rate !== undefined ? parseFloat(city_rate) : undefined,
        out_of_city_rate: out_of_city_rate !== undefined ? parseFloat(out_of_city_rate) : undefined,
        telegram_chat_id: telegram_chat_id !== undefined ? (telegram_chat_id ? parseInt(telegram_chat_id, 10) : null) : undefined,
        bot_active: bot_active !== undefined ? !!bot_active : undefined,
        image_url: image_url !== undefined ? (image_url || null) : undefined,
        region: region
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ message: 'Vehicle updated successfully', data });
  } catch (err) {
    console.error('Error updating vehicle:', err);
    return NextResponse.json({ message: 'Internal server error', error: err.message }, { status: 500 });
  }
}

export async function DELETE(req) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ message: 'Missing vehicle ID' }, { status: 400 });
    }

    if (!supabaseConfigured) {
      return NextResponse.json({ message: 'Mock mode: Vehicle deleted successfully', id });
    }

    const { error } = await supabase
      .from('vehicles')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ message: 'Vehicle deleted successfully', id });
  } catch (err) {
    console.error('Error deleting vehicle:', err);
    return NextResponse.json({ message: 'Internal server error', error: err.message }, { status: 500 });
  }
}
