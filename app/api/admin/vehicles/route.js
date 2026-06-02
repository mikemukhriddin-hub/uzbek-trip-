import { NextResponse } from 'next/server';
import { supabase, supabaseConfigured } from '@/lib/supabase';

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
    const { driver_name, driver_phone, car_model, car_number, city_rate, out_of_city_rate, telegram_chat_id, bot_active } = body;

    if (!driver_name || !driver_phone || !car_model || !car_number || city_rate === undefined || out_of_city_rate === undefined) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    if (!supabaseConfigured) {
      return NextResponse.json({ message: 'Mock mode: Vehicle created successfully', data: { id: Math.floor(100 + Math.random() * 900), ...body } });
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
        bot_active: !!bot_active
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
    const { id, driver_name, driver_phone, car_model, car_number, city_rate, out_of_city_rate, telegram_chat_id, bot_active } = body;

    if (!id) {
      return NextResponse.json({ message: 'Missing vehicle ID' }, { status: 400 });
    }

    if (!supabaseConfigured) {
      return NextResponse.json({ message: 'Mock mode: Vehicle updated successfully', data: body });
    }

    const { data, error } = await supabase
      .from('vehicles')
      .update({
        driver_name,
        driver_phone,
        car_model,
        car_number,
        city_rate: city_rate !== undefined ? parseFloat(city_rate) : undefined,
        out_of_city_rate: out_of_city_rate !== undefined ? parseFloat(out_of_city_rate) : undefined,
        telegram_chat_id: telegram_chat_id !== undefined ? (telegram_chat_id ? parseInt(telegram_chat_id, 10) : null) : undefined,
        bot_active: bot_active !== undefined ? !!bot_active : undefined
      })
      .eq('id', id)
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
