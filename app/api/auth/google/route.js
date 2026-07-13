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
    const { idToken } = await req.json();
    if (!idToken) {
      return NextResponse.json({ error: 'ID Token is required' }, { status: 400 });
    }

    // 1. Verify Google token via Google OAuth2 tokeninfo endpoint
    const verifyRes = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${idToken}`);
    if (!verifyRes.ok) {
      return NextResponse.json({ error: 'Invalid Google token' }, { status: 401 });
    }

    const payload = await verifyRes.json();
    const { email, name, picture, sub: googleId, aud } = payload;

    // Security Check: Verify Client ID if configured
    const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    if (googleClientId && aud !== googleClientId) {
      return NextResponse.json({ error: 'Audience mismatch (Client ID invalid)' }, { status: 401 });
    }

    if (!email) {
      return NextResponse.json({ error: 'Email field is missing in Google Token' }, { status: 400 });
    }

    let user = null;

    if (supabaseConfigured) {
      // 2. Query Supabase users table
      // Try to find user by google_id
      const { data: existingUserByGoogle, error: errG } = await supabase
        .from('users')
        .select('*')
        .eq('google_id', googleId)
        .maybeSingle();

      if (existingUserByGoogle) {
        user = existingUserByGoogle;
      } else {
        // Try to find user by email for account merging
        const { data: existingUserByEmail, error: errE } = await supabase
          .from('users')
          .select('*')
          .eq('email', email)
          .maybeSingle();

        if (existingUserByEmail) {
          // Merge account by linking the google_id
          const { data: updatedUser, error: errU } = await supabase
            .from('users')
            .update({ google_id: googleId })
            .eq('id', existingUserByEmail.id)
            .select()
            .single();

          if (errU) throw errU;
          user = updatedUser;
        } else {
          // Create new user with Tourist role and avatar setup
          let avatarType = 'url';
          let avatarValue = picture || null;
          let avatarBgColor = null;

          if (!picture) {
            // Generate a random animal emoji avatar if Google profile picture is missing
            const randomIndex = Math.floor(Math.random() * EMOJI_AVATARS.length);
            const chosen = EMOJI_AVATARS[randomIndex];
            avatarType = 'emoji';
            avatarValue = chosen.emoji;
            avatarBgColor = chosen.bg;
          }

          const { data: newUser, error: errN } = await supabase
            .from('users')
            .insert({
              email,
              name: name || email.split('@')[0],
              google_id: googleId,
              role: 'Tourist',
              avatar_type: avatarType,
              avatar_value: avatarValue,
              avatar_bg_color: avatarBgColor
            })
            .select()
            .single();

          if (errN) throw errN;
          user = newUser;
        }
      }
    } else {
      // Supabase is not configured yet, run in Mock Mode for development
      console.warn('⚠️ Supabase is not configured. Running in Mock Auth mode.');
      let avatarType = 'url';
      let avatarValue = picture || null;
      let avatarBgColor = null;

      if (!picture) {
        const randomIndex = Math.floor(Math.random() * EMOJI_AVATARS.length);
        const chosen = EMOJI_AVATARS[randomIndex];
        avatarType = 'emoji';
        avatarValue = chosen.emoji;
        avatarBgColor = chosen.bg;
      }

      user = {
        id: 'mock-id-' + googleId,
        email,
        name: name || email.split('@')[0],
        google_id: googleId,
        role: 'Tourist',
        avatar_type: avatarType,
        avatar_value: avatarValue,
        avatar_bg_color: avatarBgColor
      };
    }

    return NextResponse.json({ success: true, user });
  } catch (err) {
    console.error('Error verifying Google Token:', err);
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}
