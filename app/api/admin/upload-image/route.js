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
    const formData = await req.formData();
    const file = formData.get('file');

    if (!file) {
      return NextResponse.json({ message: 'No file uploaded' }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ message: 'Invalid file type. Only JPEG, PNG, WebP, GIF, AVIF allowed.' }, { status: 400 });
    }

    // Validate file size (max 5MB)
    const MAX_SIZE = 5 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ message: 'File too large. Maximum size is 5MB.' }, { status: 400 });
    }

    const ext = file.type.split('/')[1].replace('jpeg', 'jpg');
    const fileName = `locations/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;

    if (!supabaseConfigured) {
      // Mock mode: return a placeholder image URL
      return NextResponse.json({
        message: 'Mock mode: Image upload simulated',
        url: `https://images.unsplash.com/photo-1618218168350-6e7c8137558d?auto=format&fit=crop&w=600&q=80`
      });
    }

    // Upload to Supabase Storage
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const { data, error } = await supabase.storage
      .from('location-images')
      .upload(fileName, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (error) {
      // If bucket doesn't exist, try creating it
      if (error.message?.includes('Bucket not found') || error.statusCode === 404) {
        // Create bucket and retry
        await supabase.storage.createBucket('location-images', {
          public: true,
          allowedMimeTypes: allowedTypes,
          fileSizeLimit: MAX_SIZE,
        });

        const { data: retryData, error: retryError } = await supabase.storage
          .from('location-images')
          .upload(fileName, buffer, { contentType: file.type, upsert: false });

        if (retryError) throw retryError;

        const { data: urlData } = supabase.storage
          .from('location-images')
          .getPublicUrl(retryData.path);

        return NextResponse.json({ message: 'Image uploaded successfully', url: urlData.publicUrl });
      }
      throw error;
    }

    const { data: urlData } = supabase.storage
      .from('location-images')
      .getPublicUrl(data.path);

    return NextResponse.json({ message: 'Image uploaded successfully', url: urlData.publicUrl });
  } catch (err) {
    console.error('Error uploading image:', err);
    return NextResponse.json({ message: 'Upload failed: ' + err.message }, { status: 500 });
  }
}
