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
    const { name_en, name_ru, name_uz, description_en, description_ru, description_uz, latitude, longitude, category, is_out_of_city, image_url } = body;

    if (!name_en || !name_ru || !name_uz || !category) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    if (!supabaseConfigured) {
      return NextResponse.json({ message: 'Mock mode: Location created successfully', data: { id: Math.floor(100 + Math.random() * 900), ...body } });
    }

    const { data, error } = await supabase
      .from('locations')
      .insert({
        name_en,
        name_ru,
        name_uz: name_uz || null,
        description_en,
        description_ru,
        description_uz: description_uz || null,
        latitude: parseFloat(latitude) || 39.6548,
        longitude: parseFloat(longitude) || 66.9757,
        category,
        is_out_of_city: !!is_out_of_city,
        image_url: image_url || null
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ message: 'Location created successfully', data });
  } catch (err) {
    console.error('Error creating location:', err);
    return NextResponse.json({ message: 'Internal server error', error: err.message }, { status: 500 });
  }
}

export async function PATCH(req) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { id, name_en, name_ru, name_uz, description_en, description_ru, description_uz, latitude, longitude, category, is_out_of_city, image_url } = body;

    if (!id) {
      return NextResponse.json({ message: 'Missing location ID' }, { status: 400 });
    }

    if (!supabaseConfigured) {
      return NextResponse.json({ message: 'Mock mode: Location updated successfully', data: body });
    }

    const { data, error } = await supabase
      .from('locations')
      .update({
        name_en,
        name_ru,
        name_uz,
        description_en,
        description_ru,
        description_uz,
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        category,
        is_out_of_city: !!is_out_of_city,
        image_url: image_url
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ message: 'Location updated successfully', data });
  } catch (err) {
    console.error('Error updating location:', err);
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
      return NextResponse.json({ message: 'Missing location ID' }, { status: 400 });
    }

    if (!supabaseConfigured) {
      return NextResponse.json({ message: 'Mock mode: Location deleted successfully', id });
    }

    const { error } = await supabase
      .from('locations')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ message: 'Location deleted successfully', id });
  } catch (err) {
    console.error('Error deleting location:', err);
    return NextResponse.json({ message: 'Internal server error', error: err.message }, { status: 500 });
  }
}
