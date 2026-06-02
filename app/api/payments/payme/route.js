import { NextResponse } from 'next/server';
import { supabase, supabaseConfigured } from '@/lib/supabase';

// FIXED EXCHANGE RATE: 1 USD = 13,000 UZS
const USD_TO_UZS = 13000;

export async function POST(req) {
  let rpcId = null;
  try {
    // 1. Authenticate Request (Basic Authentication)
    const authHeader = req.headers.get('Authorization') || '';
    if (!authHeader.startsWith('Basic ')) {
      return NextResponse.json({
        error: { code: -32504, message: 'Missing Authorization header' },
        id: null
      });
    }

    const base64Credentials = authHeader.substring(6);
    const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii');
    const [username, password] = credentials.split(':');

    const paymeMerchantKey = process.env.PAYME_MERCHANT_KEY || 'payme_merchant_key_mock';
    if (username !== 'Paycom' || password !== paymeMerchantKey) {
      console.warn('❌ Payme Auth Failure: invalid credentials');
      return NextResponse.json({
        error: { code: -32504, message: 'Invalid merchant key' },
        id: null
      });
    }

    // 2. Parse RPC Body
    const body = await req.json();
    rpcId = body.id;
    const { method, params } = body;

    console.log(`📥 Payme JSON-RPC Request: Method=${method}`, params);

    const isDbActive = supabaseConfigured;

    // Helper to fetch transaction by ID
    const getTransaction = async (txId) => {
      if (isDbActive) {
        const { data } = await supabase
          .from('payment_transactions')
          .select('*')
          .eq('id', txId)
          .maybeSingle();
        return data;
      }
      return null;
    };

    // Helper to fetch booking by ID
    const getBooking = async (bId) => {
      const parsedId = parseInt(bId, 10);
      if (isNaN(parsedId)) return null;

      if (isDbActive) {
        const { data } = await supabase
          .from('bookings')
          .select('*')
          .eq('id', parsedId)
          .maybeSingle();
        return data;
      } else if (global.mockBookingsStore) {
        return global.mockBookingsStore.get(parsedId.toString());
      }
      return null;
    };

    // RPC Methods Handler
    switch (method) {
      case 'CheckPerformTransaction': {
        const bookingId = params.account?.booking_id;
        const amountInTiyins = params.amount;

        if (!bookingId) {
          return NextResponse.json({
            error: {
              code: -31008,
              message: { en: 'Missing booking ID', ru: 'Отсутствует ID бронирования', uz: 'Buyurtma ID si kiritilmagan' },
              data: 'booking_id'
            },
            id: rpcId
          });
        }

        const booking = await getBooking(bookingId);
        if (!booking) {
          return NextResponse.json({
            error: {
              code: -31008,
              message: { en: 'Booking not found', ru: 'Бронирование не найдено', uz: 'Buyurtma topilmadi' },
              data: 'booking_id'
            },
            id: rpcId
          });
        }

        if (booking.status === 'cancelled') {
          return NextResponse.json({
            error: {
              code: -31008,
              message: { en: 'Booking has been cancelled', ru: 'Бронирование отменено', uz: 'Buyurtma bekor qilingan' },
              data: 'booking_id'
            },
            id: rpcId
          });
        }

        // Validate Amount: UZS tiyins = USD price * 0.20 * 13000 * 100
        const usdTotalPrice = parseFloat(booking.total_price || booking.totalPrice || 0);
        const requiredDepositUsd = parseFloat((usdTotalPrice * 0.20).toFixed(2));
        const requiredDepositTiyins = Math.round(requiredDepositUsd * USD_TO_UZS * 100);

        if (Math.abs(amountInTiyins - requiredDepositTiyins) > 1000) {
          return NextResponse.json({
            error: {
              code: -31001,
              message: { en: 'Incorrect payment amount', ru: 'Неверная сумма платежа', uz: 'Noto\'g\'ri to\'lov summasi' }
            },
            id: rpcId
          });
        }

        return NextResponse.json({
          result: { allow: true },
          id: rpcId
        });
      }

      case 'CreateTransaction': {
        const txId = params.id;
        const time = params.time;
        const bookingId = params.account?.booking_id;
        const amountInTiyins = params.amount;

        const existingTx = await getTransaction(txId);
        if (existingTx) {
          if (existingTx.state !== 1) {
            return NextResponse.json({
              error: { code: -31008, message: { en: 'Transaction state mismatch', ru: 'Неверное состояние транзакции', uz: 'Tranzaksiya holati mos kelmadi' } },
              id: rpcId
            });
          }
          return NextResponse.json({
            result: {
              create_time: parseInt(existingTx.payme_time, 10),
              transaction: existingTx.id,
              state: 1
            },
            id: rpcId
          });
        }

        // Perform CheckPerformTransaction validations
        const booking = await getBooking(bookingId);
        if (!booking) {
          return NextResponse.json({
            error: { code: -31008, message: { en: 'Booking not found', ru: 'Бронирование не найдено', uz: 'Buyurtma topilmadi' }, data: 'booking_id' },
            id: rpcId
          });
        }

        const usdTotalPrice = parseFloat(booking.total_price || booking.totalPrice || 0);
        const requiredDepositUsd = parseFloat((usdTotalPrice * 0.20).toFixed(2));
        const requiredDepositTiyins = Math.round(requiredDepositUsd * USD_TO_UZS * 100);

        if (Math.abs(amountInTiyins - requiredDepositTiyins) > 1000) {
          return NextResponse.json({
            error: { code: -31001, message: { en: 'Incorrect payment amount', ru: 'Неверная сумма', uz: 'Noto\'g\'ri summa' } },
            id: rpcId
          });
        }

        // Insert new transaction
        if (isDbActive) {
          try {
            await supabase.from('payment_transactions').insert({
              id: txId,
              booking_id: parseInt(bookingId, 10),
              state: 1,
              amount: requiredDepositUsd,
              payment_method: 'payme',
              payme_time: time
            });
          } catch (dbErr) {
            console.error('Failed to insert Payme transaction in DB:', dbErr.message);
          }
        }

        return NextResponse.json({
          result: {
            create_time: time,
            transaction: txId,
            state: 1
          },
          id: rpcId
        });
      }

      case 'PerformTransaction': {
        const txId = params.id;
        const existingTx = await getTransaction(txId);

        if (isDbActive && !existingTx) {
          return NextResponse.json({
            error: { code: -31003, message: { en: 'Transaction not found', ru: 'Транзакция не найдена', uz: 'Tranzaksiya topilmadi' } },
            id: rpcId
          });
        }

        const state = isDbActive ? existingTx.state : 1;

        if (state === 1) {
          const performTime = Date.now();
          const bookingId = isDbActive ? existingTx.booking_id : 101; // Mock fallback
          
          if (isDbActive) {
            try {
              // Update state to 2
              await supabase
                .from('payment_transactions')
                .update({ state: 2, perform_time: performTime })
                .eq('id', txId);
            } catch(e) {}
          }

          // Fetch booking total to confirm deposit
          const booking = await getBooking(bookingId);
          const usdTotalPrice = parseFloat(booking?.total_price || booking?.totalPrice || 100);
          const depositUsd = parseFloat((usdTotalPrice * 0.20).toFixed(2));

          // Trigger unified payment confirmation logic
          const confirmPayload = {
            bookingId,
            paymentMethod: 'payme',
            paymentTxId: txId,
            depositAmount: depositUsd
          };

          const bypassHeaderVal = req.headers.get('x-bypass-supabase') === 'true';
          const headers = { 'Content-Type': 'application/json' };
          if (bypassHeaderVal) {
            headers['x-bypass-supabase'] = 'true';
          }

          try {
            await fetch(confirmUrl, {
              method: 'POST',
              headers,
              body: JSON.stringify(confirmPayload)
            });
          } catch (confirmErr) {
            console.error('Failed calling confirm endpoint from Payme:', confirmErr.message);
          }

          return NextResponse.json({
            result: {
              perform_time: performTime,
              transaction: txId,
              state: 2
            },
            id: rpcId
          });
        } else if (state === 2) {
          return NextResponse.json({
            result: {
              perform_time: parseInt(existingTx.perform_time, 10),
              transaction: existingTx.id,
              state: 2
            },
            id: rpcId
          });
        }

        return NextResponse.json({
          error: { code: -31008, message: { en: 'Cannot perform transaction', ru: 'Невозможно выполнить транзакцию', uz: 'Tranzaksiyani bajarib bo\'lmaydi' } },
          id: rpcId
        });
      }

      case 'CancelTransaction': {
        const txId = params.id;
        const reason = params.reason;
        const existingTx = await getTransaction(txId);

        if (isDbActive && !existingTx) {
          return NextResponse.json({
            error: { code: -31003, message: { en: 'Transaction not found', ru: 'Транзакция не найдена', uz: 'Tranzaksiya topilmadi' } },
            id: rpcId
          });
        }

        const state = isDbActive ? existingTx.state : 1;
        const cancelTime = Date.now();

        if (state === 1) {
          if (isDbActive) {
            await supabase
              .from('payment_transactions')
              .update({ state: -1, cancel_time: cancelTime, reason })
              .eq('id', txId);
          }
          return NextResponse.json({
            result: {
              cancel_time: cancelTime,
              transaction: txId,
              state: -1
            },
            id: rpcId
          });
        } else if (state === 2) {
          // Cancelled after performance
          if (isDbActive) {
            await supabase
              .from('payment_transactions')
              .update({ state: -2, cancel_time: cancelTime, reason })
              .eq('id', txId);

            // Set booking payment back to unpaid and status pending
            await supabase
              .from('bookings')
              .update({ status: 'pending', payment_status: 'unpaid' })
              .eq('id', existingTx.booking_id);
          }
          return NextResponse.json({
            result: {
              cancel_time: cancelTime,
              transaction: txId,
              state: -2
            },
            id: rpcId
          });
        }

        // State is already negative (cancelled)
        return NextResponse.json({
          result: {
            cancel_time: parseInt(existingTx.cancel_time, 10),
            transaction: existingTx.id,
            state: existingTx.state
          },
          id: rpcId
        });
      }

      case 'CheckTransaction': {
        const txId = params.id;
        const existingTx = await getTransaction(txId);

        if (isDbActive && !existingTx) {
          return NextResponse.json({
            error: { code: -31003, message: { en: 'Transaction not found', ru: 'Транзакция не найдена', uz: 'Tranzaksiya topilmadi' } },
            id: rpcId
          });
        }

        if (!isDbActive) {
          // Mock mode
          return NextResponse.json({
            result: {
              create_time: Date.now() - 60000,
              perform_time: Date.now() - 30000,
              cancel_time: 0,
              transaction: txId,
              state: 2,
              reason: null
            },
            id: rpcId
          });
        }

        return NextResponse.json({
          result: {
            create_time: parseInt(existingTx.payme_time || 0, 10),
            perform_time: parseInt(existingTx.perform_time || 0, 10),
            cancel_time: parseInt(existingTx.cancel_time || 0, 10),
            transaction: existingTx.id,
            state: existingTx.state,
            reason: existingTx.reason || null
          },
          id: rpcId
        });
      }

      case 'GetStatement': {
        return NextResponse.json({
          result: { transactions: [] },
          id: rpcId
        });
      }

      default:
        return NextResponse.json({
          error: { code: -32601, message: 'Method not found' },
          id: rpcId
        });
    }
  } catch (err) {
    console.error('Error in Payme RPC server:', err);
    return NextResponse.json({
      error: { code: -32603, message: 'Internal Server Error' },
      id: rpcId
    });
  }
}
