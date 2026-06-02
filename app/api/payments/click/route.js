import { NextResponse } from 'next/server';
import { supabase, supabaseConfigured } from '@/lib/supabase';
import crypto from 'crypto';

// FIXED EXCHANGE RATE: 1 USD = 13,000 UZS
const USD_TO_UZS = 13000;

export async function POST(req) {
  try {
    let body = {};
    const contentType = req.headers.get('content-type') || '';
    
    if (contentType.includes('application/x-www-form-urlencoded')) {
      const text = await req.text();
      const params = new URLSearchParams(text);
      for (const [key, value] of params.entries()) {
        body[key] = value;
      }
    } else {
      body = await req.json();
    }

    const clickTransId = body.click_trans_id;
    const serviceId = body.service_id;
    const clickPaydocId = body.click_paydoc_id;
    const merchantTransId = body.merchant_trans_id; // Booking ID
    const amount = parseFloat(body.amount); // Converted deposit amount in UZS
    const action = parseInt(body.action, 10);
    const error = parseInt(body.error, 10);
    const signTime = body.sign_time;
    const signString = body.sign_string;

    console.log(`📥 Click Webhook Request: Action=${action}, BookingID=${merchantTransId}, UZS Amount=${amount}`);

    if (
      clickTransId === undefined ||
      serviceId === undefined ||
      merchantTransId === undefined ||
      amount === undefined ||
      action === undefined ||
      error === undefined ||
      signTime === undefined ||
      !signString
    ) {
      return NextResponse.json({ error: -8, error_note: 'Missing required parameters' });
    }

    // 1. Signature Verification
    const clickSecretKey = process.env.CLICK_SECRET_KEY || 'click_secret_key_mock';
    const computedString = `${clickTransId}${serviceId}${clickSecretKey}${merchantTransId}${amount}${action}${signTime}`;
    const computedSign = crypto.createHash('md5').update(computedString).digest('hex');

    if (computedSign !== signString) {
      console.warn('❌ Click Signature Mismatch!', { computedSign, signString });
      return NextResponse.json({ error: -1, error_note: 'Signature verification failed' });
    }

    const bookingId = parseInt(merchantTransId, 10);
    const key = bookingId.toString();

    // 2. Retrieve Booking
    let booking = null;
    const isDbActive = supabaseConfigured;
    if (isDbActive) {
      try {
        const { data } = await supabase
          .from('bookings')
          .select('*')
          .eq('id', bookingId)
          .single();
        booking = data;
      } catch (err) {
        console.warn('⚠️ Supabase fetch error in Click handler, fallback to mock store:', err.message);
      }
    }

    if (!booking && global.mockBookingsStore) {
      booking = global.mockBookingsStore.get(key);
    }

    if (!booking) {
      return NextResponse.json({ error: -5, error_note: 'Booking not found' });
    }

    // 3. Amount and status checks
    const usdTotalPrice = parseFloat(booking.total_price || booking.totalPrice || 0);
    const requiredDepositUsd = parseFloat((usdTotalPrice * 0.20).toFixed(2));
    const requiredDepositUzs = Math.round(requiredDepositUsd * USD_TO_UZS);

    // Allow slight rounding differences (e.g. 50 UZS difference max)
    if (Math.abs(amount - requiredDepositUzs) > 100) {
      console.warn(`❌ Click Amount Mismatch: Received UZS ${amount}, required UZS ${requiredDepositUzs}`);
      return NextResponse.json({ error: -2, error_note: 'Incorrect payment amount' });
    }

    if (booking.status === 'cancelled') {
      return NextResponse.json({ error: -9, error_note: 'Booking was already cancelled' });
    }

    // Prepare Action (Check and create transaction)
    if (action === 0) {
      // Create record in database
      if (isDbActive) {
        try {
          // Check if transaction already exists
          const { data: existingTx } = await supabase
            .from('payment_transactions')
            .select('id')
            .eq('id', clickTransId.toString())
            .maybeSingle();

          if (!existingTx) {
            await supabase.from('payment_transactions').insert({
              id: clickTransId.toString(),
              booking_id: bookingId,
              state: 1, // Active
              amount: requiredDepositUsd, // Save USD equivalent
              payment_method: 'click'
            });
          }
        } catch (dbErr) {
          console.error('Database write in Click Prepare failed:', dbErr.message);
        }
      }

      return NextResponse.json({
        click_trans_id: clickTransId,
        merchant_trans_id: merchantTransId,
        merchant_prepare_id: bookingId,
        error: 0,
        error_note: 'Success'
      });
    }

    // Complete Action (Capture/finalize transaction)
    if (action === 1) {
      if (error < 0) {
        // Transaction failed on Click's side
        if (isDbActive) {
          try {
            await supabase
              .from('payment_transactions')
              .update({ state: -1, cancel_time: Date.now() })
              .eq('id', clickTransId.toString());
          } catch(e) {}
        }
        return NextResponse.json({ error: -9, error_note: 'Transaction failed on Click side' });
      }

      // Perform transaction
      if (isDbActive) {
        try {
          // Update transaction state
          await supabase
            .from('payment_transactions')
            .update({ state: 2, perform_time: Date.now() })
            .eq('id', clickTransId.toString());
        } catch(e) {}
      }

      // Unified Payment Confirm trigger (sends emails, triggers webhooks/notifications, sets status)
      // Call direct backend confirm trigger using confirm API function logic
      const confirmPayload = {
        bookingId,
        paymentMethod: 'click',
        paymentTxId: clickTransId.toString(),
        depositAmount: requiredDepositUsd
      };

      const requestUrl = new URL(req.url);
      const confirmUrl = `${requestUrl.protocol}//${requestUrl.host}/api/bookings/payment/confirm`;

      try {
        await fetch(confirmUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(confirmPayload)
        });
      } catch (confirmErr) {
        console.error('Failed calling confirm endpoint from Click:', confirmErr.message);
      }

      return NextResponse.json({
        click_trans_id: clickTransId,
        merchant_trans_id: merchantTransId,
        merchant_confirm_id: bookingId,
        error: 0,
        error_note: 'Success'
      });
    }

    return NextResponse.json({ error: -3, error_note: 'Action not found' });
  } catch (err) {
    console.error('Error in Click Merchant API:', err);
    return NextResponse.json({ error: -4, error_note: 'Internal server error' });
  }
}
