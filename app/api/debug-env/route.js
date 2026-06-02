import { NextResponse } from 'next/server';

export async function GET(req) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'NOT_SET';
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'NOT_SET';
    
    // Obfuscate anon key
    const maskedKey = anonKey !== 'NOT_SET' 
      ? `${anonKey.substring(0, 10)}...${anonKey.substring(anonKey.length - 5)}`
      : 'NOT_SET';

    return NextResponse.json({
      supabaseUrl,
      supabaseAnonKey: maskedKey,
      envKeysPresent: Object.keys(process.env).filter(k => k.includes('SUPABASE') || k.includes('SMTP') || k.includes('TELEGRAM')),
      nodeEnv: process.env.NODE_ENV,
    });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
