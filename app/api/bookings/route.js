import { NextResponse } from 'next/server';
import { supabase, supabaseConfigured } from '@/lib/supabase';
import nodemailer from 'nodemailer';
import { generateMagicToken } from '@/lib/token';


// In-memory OTP store (global to survive Next.js dev hot-reloads in local environment)
global.otpStore = global.otpStore || new Map();

// Local Development Cron Poller (polls every 30 seconds in local environment)
if (process.env.NODE_ENV === 'development' && !global.localCronPoller) {
  setTimeout(() => {
    global.localCronPoller = setInterval(async () => {
      try {
        console.log('🔄 [Local Poller] Triggering notification processor...');
        const bypassSupabase = !supabaseConfigured;
        const headers = bypassSupabase ? { 'x-bypass-supabase': 'true' } : {};
        
        const res = await fetch('http://localhost:3000/api/cron/process-notifications', {
          headers
        });
        if (res.ok) {
          const data = await res.json();
          console.log('🔄 [Local Poller] Notification processor run completed:', data);
        } else {
          console.warn('🔄 [Local Poller] Notification processor returned error status:', res.status);
        }
      } catch (err) {
        console.error('🔄 [Local Poller] Failed to poll notification processor:', err.message);
      }
    }, 30000);
    
    if (global.localCronPoller.unref) {
      global.localCronPoller.unref();
    }
    console.log('🔄 [Local Poller] Initialized background polling (30s interval).');
  }, 5000);
}

export async function POST(req) {
  try {
    const body = await req.json();
    const {
      touristName,
      touristEmail,
      touristPhone,
      bookingDate,
      guideId,
      vehicleId,
      totalPrice,
      customerLanguage,
      passengerCount,
      bookingType,
      locations,
    } = body;

    // Bron turi: 'private' yoki 'shared' (default: 'private')
    const resolvedBookingType = (bookingType === 'shared') ? 'shared' : 'private';

    // Basic Validation
    if (!touristName || !touristEmail || !bookingDate) {
      return NextResponse.json(
        { message: 'Missing required booking fields.' },
        { status: 400 }
      );
    }

    const lang = customerLanguage || 'EN';

    const bypassSupabase = req.headers.get('x-bypass-supabase') === 'true';
    let isDbActive = supabaseConfigured && !bypassSupabase;

    // 1. Double-booking prevention check (Availability & Capacity Check)
    let conflicts = [];
    let capacity = 5;

    if (isDbActive) {
      try {
        let query = supabase
          .from('bookings')
          .select(`
            id,
            guide_id,
            vehicle_id,
            customer_language,
            passenger_count,
            status,
            created_at
          `)
          .eq('booking_date', bookingDate)
          .neq('status', 'cancelled');

        if (guideId && vehicleId) {
          query = query.or(`guide_id.eq.${guideId},vehicle_id.eq.${vehicleId}`);
        } else if (guideId) {
          query = query.eq('guide_id', guideId);
        } else if (vehicleId) {
          query = query.eq('vehicle_id', vehicleId);
        } else {
          query = query.eq('id', 0); // won't match anything
        }

        const { data: dbConflicts, error: conflictErr } = await query;

        if (conflictErr) throw conflictErr;
        conflicts = dbConflicts || [];

        // Fetch vehicle capacity
        if (vehicleId) {
          const { data: vehicleData } = await supabase
            .from('vehicles')
            .select('capacity')
            .eq('id', vehicleId)
            .single();

          if (vehicleData) {
            capacity = vehicleData.capacity;
          }
        }
      } catch (err) {
        console.warn('⚠️ Exception querying Supabase, falling back to mock store:', err.message);
        isDbActive = false;
      }
    }

    if (!isDbActive) {
      // Mock storage fallback
      if (global.mockBookingsStore) {
        const mockList = Array.from(global.mockBookingsStore.values())
          .filter(b => b.booking_date === bookingDate && b.status !== 'cancelled' && ((vehicleId && b.vehicle_id === vehicleId) || (guideId && b.guide_id === guideId)));
        conflicts = mockList;
      }
      
      if (vehicleId) {
        const mockVehicles = {
          1: { capacity: 5 },
          2: { capacity: 5 },
          3: { capacity: 5 },
          4: { capacity: 8 },
          5: { capacity: 20 }
        };
        const mockVeh = mockVehicles[vehicleId] || mockVehicles[1];
        capacity = mockVeh.capacity;
      }
    }

    // Filter out expired pending bookings (older than 2 minutes) so they do not block guide/vehicle availability
    const activeConflicts = conflicts.filter(c => {
      if (c.status === 'pending') {
        const createdAtTime = new Date(c.created_at || Date.now()).getTime();
        const isExpired = Date.now() - createdAtTime > 2 * 60 * 1000;
        return !isExpired;
      }
      return true;
    });

    if (activeConflicts.length > 0) {
      // A. Vehicle Capacity Check for the Selected Vehicle
      if (vehicleId) {
        const sameVehicleBookings = activeConflicts.filter(c => c.vehicle_id === vehicleId);
        const bookedSeats = sameVehicleBookings.reduce((sum, c) => sum + (c.passenger_count || 1), 0);
        const availableSeats = capacity - bookedSeats;

        if (passengerCount > availableSeats) {
          const errorMsg = lang === 'RU'
            ? `У этого водителя недостаточно свободных мест (Осталось свободных мест: ${availableSeats}). Пожалуйста, выберите другого водителя или закажите более крупный транспорт (Минивен).`
            : lang === 'UZ'
              ? `Ushbu haydovchida joy yetarli emas (Mavjud bo'sh joy: ${availableSeats} ta). Iltimos, boshqa haydovchi tanlang yoki kattaroq transport (Miniven) buyurtma qiling.`
              : `This driver does not have enough seats (Available seats: ${availableSeats}). Please choose another driver or order a larger transport (Minivan).`;
          
          return NextResponse.json({ message: errorMsg }, { status: 409 });
        }
      }

      // B. Guide availability / Pooling check
      const guideConflicts = activeConflicts.filter(c => c.guide_id === guideId);
      if (guideConflicts.length > 0) {

        // 🔒 PRIVATE bron: gid allaqachon band bo'lsa — qat'iyan rad etish
        if (resolvedBookingType === 'private') {
          const errorMsg = lang === 'RU'
            ? 'Выбранный гид уже занят на эту дату. Для приватного тура выберите другого гида или другую дату.'
            : lang === 'UZ'
              ? 'Tanlangan gid ushbu sanada band. Shaxsiy tur uchun boshqa gid yoki sana tanlang.'
              : 'The selected guide is already booked on this date. For a private tour, please choose another guide or date.';
          return NextResponse.json({ message: errorMsg }, { status: 409 });
        }

        // 🤝 SHARED bron: faqat boshqa "shared" bronlar bilan birlashtirish mumkin
        let hasPoolableMatch = false;

        let conflictItems = [];
        if (isDbActive) {
          try {
            const conflictIds = guideConflicts.map(c => c.id);
            const { data: dbItems } = await supabase
              .from('booking_items')
              .select('booking_id, location_id')
              .in('booking_id', conflictIds);
            conflictItems = dbItems || [];
          } catch (err) {
            console.error('Error fetching conflict items:', err.message);
          }
        } else {
          // Mock locations
          guideConflicts.forEach(c => {
            if (c.locations) {
              c.locations.forEach(loc => {
                conflictItems.push({ booking_id: c.id, location_id: loc.locationId || loc.id });
              });
            }
          });
        }

        const newLocIdsStr = (locations || [])
          .map(l => l.locationId || l.location_id)
          .sort((a, b) => a - b)
          .join(',');

        for (const conflict of guideConflicts) {
          // Faqat 'shared' bronlar bilan birlashtiriladi
          if (conflict.booking_type === 'private') continue;

          const conflictLocs = conflictItems
            .filter(item => item.booking_id === conflict.id)
            .map(item => item.location_id)
            .sort((a, b) => a - b)
            .join(',');

          const isSameRoute = conflictLocs === newLocIdsStr;
          const isSameLanguage = conflict.customer_language === lang;
          const combinedPassengers = (conflict.passenger_count || 1) + (passengerCount || 1);

          if (isSameRoute && isSameLanguage && combinedPassengers <= 20) {
            hasPoolableMatch = true;
            break;
          }
        }

        if (!hasPoolableMatch) {
          const errorMsg = lang === 'RU'
            ? 'Выбранный гид уже занят на эту дату на другой маршрут, язык или приватный тур. Пожалуйста, выберите другого гида.'
            : lang === 'UZ'
              ? 'Tanlangan gid ushbu sanada boshqa yo\'nalish, til yoki shaxsiy tur uchun band. Iltimos, boshqa gid tanlang.'
              : 'The selected guide is already booked on this date for a different route, language, or private tour. Please choose another guide.';
          return NextResponse.json({ message: errorMsg }, { status: 409 });
        }
      }
    }

    // 2. Generate a 6-digit OTP code
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

    let bookingId;

    if (isDbActive) {
      try {
        // Create main booking row
        const { data: booking, error: bookingErr } = await supabase
          .from('bookings')
          .insert({
            tourist_name: `${touristName}||OTP:${otpCode}`,
            tourist_email: touristEmail,
            tourist_phone: touristPhone,
            guide_id: guideId || null,
            vehicle_id: vehicleId,
            total_price: totalPrice,
            booking_date: bookingDate,
            customer_language: lang,
            status: 'pending',
            passenger_count: passengerCount || 1,
            booking_type: resolvedBookingType,
          })
          .select('id')
          .single();

        if (bookingErr) throw bookingErr;
        bookingId = booking.id;

        // Insert locations into booking_items
        if (locations && locations.length > 0) {
          const items = locations.map((loc) => ({
            booking_id: bookingId,
            location_id: loc.locationId,
            visit_order: loc.visitOrder,
          }));

          const { error: itemsErr } = await supabase
            .from('booking_items')
            .insert(items);

          if (itemsErr) throw itemsErr;
        }
      } catch (dbErr) {
        console.warn('⚠️ Supabase schema mismatch or database error. Falling back to Mock Mode:', dbErr.message);
        // Fall back to Mock Mode in-memory storage
        bookingId = Math.floor(10000 + Math.random() * 90000);
        global.mockBookingsStore = global.mockBookingsStore || new Map();
        global.mockBookingsStore.set(bookingId.toString(), {
          id: bookingId,
          tourist_name: touristName,
          tourist_email: touristEmail,
          tourist_phone: touristPhone,
          guide_id: guideId || null,
          vehicle_id: vehicleId,
          total_price: totalPrice,
          booking_date: bookingDate,
          customer_language: lang,
          passenger_count: passengerCount || 1,
          booking_type: resolvedBookingType,
          locations: locations || []
        });
      }
    } else {
      // Mock Booking ID for testing without Supabase
      bookingId = Math.floor(10000 + Math.random() * 90000);
      console.log('--- Offline Mock Mode Activated ---');
      console.log(`Mock Booking created: ID=${bookingId}, Date=${bookingDate}, Passengers=${passengerCount || 1}`);
    }

    // 3. Store OTP in global memory with 2 minutes lifespan
    const expiry = Date.now() + 2 * 60 * 1000;
    global.otpStore.set(bookingId.toString(), { code: otpCode, expiry });
    
    // Store mock booking details for offline verification & pooling testing
    global.mockBookingsStore = global.mockBookingsStore || new Map();
    global.mockBookingsStore.set(bookingId.toString(), {
      id: bookingId,
      tourist_name: touristName,
      tourist_email: touristEmail,
      tourist_phone: touristPhone,
      guide_id: guideId || null,
      vehicle_id: vehicleId,
      total_price: totalPrice,
      booking_date: bookingDate,
      customer_language: lang,
      passenger_count: passengerCount || 1,
      booking_type: resolvedBookingType,
      locations: locations || []
    });

    // Output OTP directly to terminal logs for easy developer access
    console.log('==========================================');
    console.log(`🔑 Verification OTP for Booking ID #${bookingId}: ${otpCode}`);
    console.log('==========================================');

    // 3.5 Send OTP email directly via Gmail SMTP (Nodemailer)
    let emailSent = false;
    let emailError = null;
    const smtpUser = process.env.SMTP_USER;
    const smtpPassword = process.env.SMTP_PASSWORD;
    if (smtpUser && smtpPassword) {
      try {
        const emailSubject = lang === 'UZ'
          ? 'Samarqand CrafTour - Elektron pochtani tasdiqlash'
          : lang === 'RU'
            ? 'Samarqand CrafTour - Подтверждение заказа'
            : 'Samarqand CrafTour - Booking Verification';
          
        const emailHtml = lang === 'UZ'
          ? `<div style="font-family: sans-serif; padding: 20px; color: #1e293b;">
              <h2 style="color: #d4af37;">Samarqand CrafTour</h2>
              <p>Assalomu alaykum, <strong>${touristName}</strong>!</p>
              <p>Samarqand bo'ylab shaxsiy sayohatingizni shakllantirganingiz uchun tashakkur bildiramiz.</p>
              <p>Elektron pochta manzilingizni tasdiqlash uchun quyidagi tasdiqlash kodidan foydalaning:</p>
              <div style="background-color: #f1f5f9; padding: 15px; border-radius: 8px; font-size: 24px; font-weight: bold; letter-spacing: 5px; text-align: center; margin: 20px 0; border: 1px solid #e2e8f0;">
                ${otpCode}
              </div>
              <p>Ushbu kod 2 daqiqa davomida amal qiladi.</p>
              <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
              <p style="font-size: 12px; color: #64748b;">Agar siz ushbu kodni so'ramagan bo'lsangiz, xabarni shunchaki e'tiborsiz qoldiring.</p>
            </div>`
          : lang === 'RU'
            ? `<div style="font-family: sans-serif; padding: 20px; color: #1e293b;">
                <h2 style="color: #d4af37;">Samarqand CrafTour</h2>
                <p>Здравствуйте, <strong>${touristName}</strong>!</p>
                <p>Спасибо за создание маршрута для вашего путешествия в Самарканд.</p>
                <p>Пожалуйста, используйте следующий код для подтверждения вашего адреса электронной почты:</p>
                <div style="background-color: #f1f5f9; padding: 15px; border-radius: 8px; font-size: 24px; font-weight: bold; letter-spacing: 5px; text-align: center; margin: 20px 0; border: 1px solid #e2e8f0;">
                  ${otpCode}
                </div>
                <p>Этот код действителен в течение 2 минут.</p>
                <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
                <p style="font-size: 12px; color: #64748b;">Если вы не запрашивали этот код, просто проигнорируйте это письмо.</p>
              </div>`
            : `<div style="font-family: sans-serif; padding: 20px; color: #1e293b;">
                <h2 style="color: #d4af37;">Samarqand CrafTour</h2>
                <p>Hello <strong>${touristName}</strong>,</p>
                <p>Thank you for crafting your custom tour of Samarkand.</p>
                <p>Please use the following verification code to confirm your email address:</p>
                <div style="background-color: #f1f5f9; padding: 15px; border-radius: 8px; font-size: 24px; font-weight: bold; letter-spacing: 5px; text-align: center; margin: 20px 0; border: 1px solid #e2e8f0;">
                  ${otpCode}
                </div>
                <p>This code is valid for 2 minutes.</p>
                <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
                <p style="font-size: 12px; color: #64748b;">If you did not request this code, please ignore this email.</p>
              </div>`;

        const transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user: smtpUser,
            pass: smtpPassword
          }
        });

        await transporter.sendMail({
          from: `"Samarqand CrafTour" <${smtpUser}>`,
          to: touristEmail,
          subject: emailSubject,
          html: emailHtml
        });

        emailSent = true;
        console.log(`OTP Email successfully sent to ${touristEmail} via Gmail SMTP.`);
      } catch (emailErr) {
        console.error('Error sending email via Gmail SMTP:', emailErr.message);
        emailError = emailErr.message;
      }
    } else {
      console.log('SMTP credentials not configured. Skipping direct email sending.');
      emailError = 'SMTP credentials not configured';
    }

    // 4. Trigger n8n Webhook Node
    const n8nWebhookUrl = process.env.N8N_WEBHOOK_URL;
    if (n8nWebhookUrl && n8nWebhookUrl !== 'https://your-n8n-instance.com/webhook/craf-tour') {
      try {
        // Send details to n8n Webhook
        await fetch(n8nWebhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            event: 'booking_created',
            bookingId,
            touristName,
            touristEmail,
            touristPhone,
            bookingDate,
            totalPrice,
            customerLanguage: lang,
            passengerCount: passengerCount || 1,
            otpCode,
          }),
        });
        console.log(`n8n webhook triggered for Booking ID #${bookingId}`);
      } catch (webhookErr) {
        console.error('Failed triggering n8n webhook:', webhookErr.message);
      }
    } else {
      console.log('N8N_WEBHOOK_URL not configured. Skipping webhook trigger.');
    }

    const token = generateMagicToken(bookingId, touristEmail);

    return NextResponse.json({
      message: emailSent ? 'Booking created, verification code sent.' : 'Booking created, email sending failed.',
      bookingId,
      emailSent,
      emailError,
      otpCode,
      token,
    });

  } catch (err) {
    console.error('Error in POST /api/bookings:', err);
    return NextResponse.json(
      { message: 'An internal server error occurred.' },
      { status: 500 }
    );
  }
}
