import { NextResponse } from 'next/server';
import { supabase, supabaseConfigured } from '@/lib/supabase';

// Predefined list of animal emojis and pastel background colors
const EMOJI_AVATARS = [
  { emoji: '🦁', name: 'Sher (Sayohat yetakchisi)', bg: '#FFEAA7' },
  { emoji: '🦊', name: 'Tulki (Aql bilan sayohat)', bg: '#FAB1A0' },
  { emoji: '🐼', name: 'Panda (Ekologik turist)', bg: '#DFE6E9' },
  { emoji: '🐬', name: 'Delfin (Dengiz sayyohi)', bg: '#74B9FF' },
  { emoji: '🐨', name: 'Koala (Kompakt dam olish)', bg: '#A29BFE' },
  { emoji: '🦅', name: 'Burgut (Tog‘ va sarguzasht)', bg: '#E1BEE7' },
  { emoji: '🦘', name: 'Kenguru (Aktiv sayohatchi)', bg: '#FFE0B2' },
];

export async function POST(req) {
  try {
    const { email } = await req.json();
    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // Select a random animal emoji and background color
    const randomIndex = Math.floor(Math.random() * EMOJI_AVATARS.length);
    const chosen = EMOJI_AVATARS[randomIndex];
    const avatarType = 'emoji';
    const avatarValue = chosen.emoji;
    const avatarBgColor = chosen.bg;

    let user = null;

    if (supabaseConfigured) {
      const { data, error } = await supabase
        .from('users')
        .update({
          avatar_type: avatarType,
          avatar_value: avatarValue,
          avatar_bg_color: avatarBgColor
        })
        .eq('email', email)
        .select()
        .single();

      if (error) throw error;
      user = data;
    } else {
      // Mock Mode fallback
      console.warn('⚠️ Supabase is not configured. Running delete-avatar in Mock Mode.');
      user = {
        email,
        avatar_type: avatarType,
        avatar_value: avatarValue,
        avatar_bg_color: avatarBgColor
      };
    }

    return NextResponse.json({ success: true, user });
  } catch (err) {
    console.error('Error resetting avatar:', err);
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}
