import { NextResponse } from 'next/server';
import { supabase, supabaseConfigured } from '@/lib/supabase';
import { generateGuideToken } from '@/lib/token';

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
      console.error('Auth error in guides:', e);
    }
  } else {
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


export async function POST(req) {
  const auth = await checkAuth(req);
  if (!auth.authorized) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }
  if (auth.role !== 'admin') {
    return NextResponse.json({ message: 'Forbidden: Admin only' }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { full_name, phone_number, tariffs, telegram_chat_id, bot_active } = body;

    if (!full_name || !phone_number) {
      return NextResponse.json({ message: 'Missing guide name or phone' }, { status: 400 });
    }

    if (!supabaseConfigured) {
      return NextResponse.json({ 
        message: 'Mock mode: Guide created successfully', 
        data: { id: Math.floor(100 + Math.random() * 900), full_name, phone_number, tariffs, telegram_chat_id, bot_active } 
      });
    }

    const { data: guide, error: guideErr } = await supabase
      .from('guides')
      .insert({
        full_name,
        phone_number,
        telegram_chat_id: telegram_chat_id ? parseInt(telegram_chat_id, 10) : null,
        bot_active: !!bot_active
      })
      .select()
      .single();

    if (guideErr) throw guideErr;
    const guideId = guide.id;

    if (tariffs && tariffs.length > 0) {
      const rows = tariffs
        .filter(t => t.language_code && t.daily_rate)
        .map(t => ({
          guide_id: guideId,
          language_code: t.language_code,
          daily_rate: parseFloat(t.daily_rate)
        }));

      if (rows.length > 0) {
        const { error: tariffErr } = await supabase
          .from('guide_language_tariffs')
          .insert(rows);

        if (tariffErr) throw tariffErr;
      }
    }

    return NextResponse.json({ message: 'Guide created successfully', data: { ...guide, tariffs } });
  } catch (err) {
    console.error('Error creating guide:', err);
    return NextResponse.json({ message: 'Internal server error', error: err.message }, { status: 500 });
  }
}

export async function PATCH(req) {
  const auth = await checkAuth(req);
  if (!auth.authorized) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { id, full_name, phone_number, tariffs, telegram_chat_id, bot_active } = body;

    if (!id) {
      return NextResponse.json({ message: 'Missing guide ID' }, { status: 400 });
    }

    // A guide can only edit their own profile
    if (auth.role === 'guide' && Number(id) !== Number(auth.guideId)) {
      return NextResponse.json({ message: 'Forbidden: You can only edit your own profile' }, { status: 403 });
    }

    if (!supabaseConfigured) {
      return NextResponse.json({ message: 'Mock mode: Guide updated successfully', data: body });
    }

    const { data: guide, error: guideErr } = await supabase
      .from('guides')
      .update({
        full_name,
        phone_number,
        telegram_chat_id: telegram_chat_id !== undefined ? (telegram_chat_id ? parseInt(telegram_chat_id, 10) : null) : undefined,
        bot_active: bot_active !== undefined ? !!bot_active : undefined
      })
      .eq('id', id)
      .select()
      .single();

    if (guideErr) throw guideErr;

    if (tariffs) {
      const { error: delErr } = await supabase
        .from('guide_language_tariffs')
        .delete()
        .eq('guide_id', id);

      if (delErr) throw delErr;

      const rows = tariffs
        .filter(t => t.language_code && t.daily_rate)
        .map(t => ({
          guide_id: id,
          language_code: t.language_code,
          daily_rate: parseFloat(t.daily_rate)
        }));

      if (rows.length > 0) {
        const { error: insErr } = await supabase
          .from('guide_language_tariffs')
          .insert(rows);

        if (insErr) throw insErr;
      }
    }

    return NextResponse.json({ message: 'Guide updated successfully', data: { ...guide, tariffs } });
  } catch (err) {
    console.error('Error updating guide:', err);
    return NextResponse.json({ message: 'Internal server error', error: err.message }, { status: 500 });
  }
}

export async function DELETE(req) {
  const auth = await checkAuth(req);
  if (!auth.authorized) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }
  if (auth.role !== 'admin') {
    return NextResponse.json({ message: 'Forbidden: Admin only' }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ message: 'Missing guide ID' }, { status: 400 });
    }

    if (!supabaseConfigured) {
      return NextResponse.json({ message: 'Mock mode: Guide deleted successfully', id });
    }

    const { error } = await supabase
      .from('guides')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ message: 'Guide deleted successfully', id });
  } catch (err) {
    console.error('Error deleting guide:', err);
    return NextResponse.json({ message: 'Internal server error', error: err.message }, { status: 500 });
  }
}
