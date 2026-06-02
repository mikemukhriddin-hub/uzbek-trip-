import { NextResponse } from 'next/server';
import { supabase, supabaseConfigured } from '@/lib/supabase';
import { generateMagicToken } from '@/lib/token';
import nodemailer from 'nodemailer';

export async function POST(req) {
  try {
    const bypassSupabase = req.headers.get('x-bypass-supabase') === 'true';
    const isDbActive = supabaseConfigured && !bypassSupabase;

    const { bookingId, code } = await req.json();

    if (!bookingId || !code) {
      return NextResponse.json(
        { message: 'Missing booking ID or verification code.' },
        { status: 400 }
      );
    }

    const key = bookingId.toString();
    let storedCode = null;
    let expiry = null;
    let cleanTouristName = null;

    // Try global.otpStore first (useful for memory-based / local mock dev flow)
    const stored = global.otpStore ? global.otpStore.get(key) : null;
    if (stored) {
      storedCode = stored.code;
      expiry = stored.expiry;
    }

    let bookingDetails = null;

    // 1. Fetch booking details to get emails and verify OTP (from tourist_name suffix if stateless)
    if (isDbActive) {
      try {
        const { data: booking, error: fetchErr } = await supabase
          .from('bookings')
          .select(`
            *,
            guide:guides(full_name, phone_number),
            vehicle:vehicles(driver_name, driver_phone, car_model, car_number, capacity),
            booking_items(location_id)
          `)
          .eq('id', bookingId)
          .single();

        if (fetchErr) throw fetchErr;
        bookingDetails = booking;

        // If not found in memory store, try extracting OTP from tourist_name
        if (!storedCode && bookingDetails && bookingDetails.tourist_name) {
          const match = bookingDetails.tourist_name.match(/(.*?)\|\|OTP:(\d{6})/);
          if (match) {
            cleanTouristName = match[1];
            storedCode = match[2];
            // Expiry is 2 minutes from created_at
            const createdAtTime = new Date(bookingDetails.created_at || Date.now()).getTime();
            expiry = createdAtTime + 2 * 60 * 1000;
          }
        }
      } catch (err) {
        console.warn('⚠️ Supabase schema mismatch or fetch error. Falling back to Mock store data:', err.message);
      }
    }

    // Fallback to Mock Store if no details yet
    if (!bookingDetails && global.mockBookingsStore) {
      bookingDetails = global.mockBookingsStore.get(key);
    }

    // Check if OTP was found at all
    if (!storedCode) {
      return NextResponse.json(
        { message: 'Verification code not found or has expired.' },
        { status: 400 }
      );
    }

    // Check if expired
    if (Date.now() > expiry) {
      if (global.otpStore) {
        global.otpStore.delete(key);
      }
      return NextResponse.json(
        { message: 'Verification code has expired. Please request a new one.' },
        { status: 400 }
      );
    }

    // Check if incorrect
    if (storedCode !== code) {
      return NextResponse.json(
        { message: 'Incorrect verification code. Please try again.' },
        { status: 400 }
      );
    }

    // OTP is valid! Clean up memory store
    if (global.otpStore) {
      global.otpStore.delete(key);
    }

    // 0. Update booking verified_at and clear the OTP suffix in database
    if (isDbActive) {
      try {
        const updateData = {
          status: 'pending',
          verified_at: new Date().toISOString(),
          payment_status: 'unpaid'
        };

        let nameToUpdate = cleanTouristName;
        if (!nameToUpdate && bookingDetails && bookingDetails.tourist_name) {
          nameToUpdate = bookingDetails.tourist_name.replace(/\|\|OTP:\d{6}/, '');
        }

        if (nameToUpdate) {
          updateData.tourist_name = nameToUpdate;
          if (bookingDetails) {
            bookingDetails.tourist_name = nameToUpdate;
          }
        }

        let { error: updateErr } = await supabase
          .from('bookings')
          .update(updateData)
          .eq('id', bookingId);
        
        // Handle migration columns fallback
        if (updateErr && updateErr.message && (updateErr.message.includes('payment_status') || updateErr.code === 'PGS00' || updateErr.code === '42703')) {
          console.warn('⚠️ payment_status column not found in database. Retrying update without it.');
          delete updateData.payment_status;
          const { error: retryErr } = await supabase
            .from('bookings')
            .update(updateData)
            .eq('id', bookingId);
          updateErr = retryErr;
        }

        if (updateErr) {
          console.error('Error updating booking verification status:', updateErr);
        } else {
          console.log(`Booking ID #${bookingId} email verified.`);
        }
      } catch (updateErr) {
        console.error('Failed updating status in database:', updateErr.message);
      }
    } else {
      // Mock mode fallback / offline verify
      if (global.mockBookingsStore) {
        const rawMock = global.mockBookingsStore.get(bookingId.toString());
        if (rawMock) {
          rawMock.status = 'pending';
          rawMock.payment_status = 'unpaid';
          rawMock.verified_at = new Date().toISOString();
          rawMock.notification_sent = false;
        }
      }
    }

    const touristName = bookingDetails?.tourist_name || 'Valued Guest';
    const touristEmail = bookingDetails?.tourist_email || 'guest@example.com';
    const lang = bookingDetails?.customer_language || 'EN';
    const totalPrice = bookingDetails?.total_price || 0;

    return NextResponse.json({
      message: 'Email successfully verified. Deposit payment required to confirm.',
      bookingId,
      totalPrice,
      customerLanguage: lang,
      touristEmail,
      touristName
    });

  } catch (err) {
    console.error('Error in POST /api/bookings/verify:', err);
    return NextResponse.json(
      { message: 'An internal server error occurred.' },
      { status: 500 }
    );
  }
}
