import { NextResponse } from 'next/server';
import { supabase, supabaseConfigured } from '@/lib/supabase';
import nodemailer from 'nodemailer';
import { createRequire } from 'module';
const myRequire = createRequire(import.meta.url);
const PDFDocument = eval('myRequire')('pdfkit');

// Global cache for Roboto font buffers to avoid redownloading on every request
global.robotoRegular = global.robotoRegular || null;
global.robotoBold = global.robotoBold || null;

// Mock data lookup dictionaries for offline / mock testing mode
const mockGuides = {
  1: { id: 1, full_name: 'Sherzod Alimov', phone_number: '+998901234567' },
  2: { id: 2, full_name: 'Elena Petrova', phone_number: '+998937654321' },
  3: { id: 3, full_name: 'Jahongir Rustamov', phone_number: '+998971112233' }
};

const mockVehicles = {
  1: { id: 1, driver_name: 'Alisher aka', driver_phone: '+998909998877', car_model: 'Chevrolet Cobalt (White)', car_number: '01 A 777 BA', capacity: 5 },
  2: { id: 2, driver_name: 'Doston aka', driver_phone: '+998935554433', car_model: 'Chevrolet Gentra (Black)', car_number: '01 Z 888 ZZ', capacity: 5 },
  3: { id: 3, driver_name: 'Sarvar aka', driver_phone: '+998993332211', car_model: 'Chevrolet Gentra (Silver)', car_number: '01 Y 555 YY', capacity: 5 },
  4: { id: 4, driver_name: 'Odil aka', driver_phone: '+998901234567', car_model: 'Hyundai H1 Minivan (Silver)', car_number: '01 X 777 XX', capacity: 8 },
  5: { id: 5, driver_name: 'Jahongir aka', driver_phone: '+998909876543', car_model: 'Isuzu Bus (Turquoise)', car_number: '01 B 999 BB', capacity: 20 }
};

const mockLocations = {
  1: { id: 1, name_en: 'Registan Square', name_ru: 'Площадь Регистан', description_en: 'The heart of ancient Samarkand, featuring three magnificent madrasahs.', description_ru: 'Сердце древнего Самарканда, украшенное тремя величественными медресе.' },
  2: { id: 2, name_en: 'Gur-e-Amir Mausoleum', name_ru: 'Мавзолей Гур-Эмир', description_en: 'The final resting place of Amir Temur (Tamerlane), a masterpiece of Persian-Mongolian architecture.', description_ru: 'Усыпальница Амира Темура (Тамерлана), шедевр персидско-монгольской архитектуры.' },
  3: { id: 3, name_en: 'Shah-i-Zinda', name_ru: 'Шахи Зинда', description_en: 'A breathtaking avenue of blue-domed mausoleums dating back to the 11th-15th centuries.', description_ru: 'Улица лазурных мавзолеев XI–XV веков, поражающая своей красотой.' },
  4: { id: 4, name_en: 'Bibi-Khanym Mosque', name_ru: 'Мечеть Биби-Ханым', description_en: 'One of the largest mosques of the 15th century, built by Tamerlane in honor of his favorite wife.', description_ru: 'Одна из крупнейших мечетей XV века, построенная Тамерланом в честь любимой жены.' },
  5: { id: 5, name_en: 'Ulugh Beg Observatory', name_ru: 'Обсерватория Улугбека', description_en: 'Built in 1420, this observatory was one of the finest in the Islamic world.', description_ru: 'Обсерватория, построенная в 1420 году, бывшая одной из лучших в исламском мире.' },
  6: { id: 6, name_en: 'Urgut Mountain Bazaar & Hills', name_ru: 'Ургутский горный базар и горы', description_en: 'Explore traditional crafts at the market and hike through scenic Urgut mountain ranges.', description_ru: 'Посетите традиционный ремесленный базар и прогуляйтесь по живописным горам Ургута.' },
  7: { id: 7, name_en: 'Omonqo\'ton Pass & Pines', name_ru: 'Перевал Омонкоoton', description_en: 'A majestic pine forest and mountain pass with ancient caves and fresh springs.', description_ru: 'Величественный сосновый лес и горный перевал с древними пещерами и источниками.' },
  8: { id: 8, name_en: 'Konigil Paper Mill', name_ru: 'Бумажная фабрика Конигиль', description_en: 'A peaceful eco-village showcasing the ancient art of Samarkand mulberry paper making.', description_ru: 'Тихая эко-деревня, демонстрирующая древнее искусство изготовления самаркандской шелковой бумаги.' },
  9: { id: 9, name_en: 'National Osh House', name_ru: 'Национальный центр плова', description_en: 'Authentic Samarkand Osh prepared in giant cauldrons using traditional recipes.', description_ru: 'Настоящий самаркандский плов, приготовленный в огромных казанах по старинным рецептам.' },
  10: { id: 10, name_en: 'Samarkand Bread Bakery', name_ru: 'Пекарня самаркандских лепешек', description_en: 'Watch bakers prepare the famous, shiny Samarkand bread in traditional clay ovens.', description_ru: 'Наблюдайте за приготовлением знаменитых блестящих самаркандских лепешек в тандырах.' },
  11: { id: 11, name_en: 'Karimbek Restaurant', name_ru: 'Ресторан Каримбек', description_en: 'Elegant dining featuring traditional shashlik, manti, and vibrant Uzbek music.', description_ru: 'Элегантный ресторан с традиционными шашлыками, мантами и живой узбекской музыкой.' }
};

// Font loading helper
async function loadFonts() {
  if (global.robotoRegular && global.robotoBold) {
    return { robotoRegular: global.robotoRegular, robotoBold: global.robotoBold };
  }
  try {
    const [regRes, boldRes] = await Promise.all([
      fetch('https://raw.githubusercontent.com/google/fonts/main/ofl/roboto/Roboto-Regular.ttf'),
      fetch('https://raw.githubusercontent.com/google/fonts/main/ofl/roboto/Roboto-Bold.ttf')
    ]);
    if (regRes.ok && boldRes.ok) {
      global.robotoRegular = Buffer.from(await regRes.arrayBuffer());
      global.robotoBold = Buffer.from(await boldRes.arrayBuffer());
      console.log('Fonts loaded successfully and cached globally.');
    }
  } catch (err) {
    console.error('Failed to load Google Fonts, falling back to system fonts:', err.message);
  }
  return { robotoRegular: global.robotoRegular, robotoBold: global.robotoBold };
}

// PDF Generation function
function generateVoucherPdf(groupBookings, finalGuide, finalVehicle, language, { robotoRegular, robotoBold }) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: 'A4', margin: 50 });
      const chunks = [];
      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', (err) => reject(err));

      const hasRoboto = !!(robotoRegular && robotoBold);
      if (hasRoboto) {
        doc.registerFont('Roboto', robotoRegular);
        doc.registerFont('Roboto-Bold', robotoBold);
        doc.font('Roboto');
      } else {
        doc.font('Helvetica');
      }

      // Colors
      const primaryColor = '#0f172a'; // Deep Slate Navy
      const accentColor = '#d4af37';  // Gold Accent
      const textColor = '#334155';    // Charcoal Text
      const lightBg = '#f8fafc';      // Light Gray Background
      const white = '#ffffff';

      // --- HEADER BACKGROUND ---
      doc.rect(0, 0, 595, 120).fill(primaryColor);

      // --- HEADER TEXT ---
      doc.fillColor(accentColor);
      if (hasRoboto) {
        doc.font('Roboto-Bold').fontSize(22).text('SAMARQAND CRAFTOUR', 50, 35, { letterSpacing: 2 });
      } else {
        doc.font('Helvetica-Bold').fontSize(22).text('SAMARQAND CRAFTOUR', 50, 35);
      }

      doc.fillColor('#94a3b8');
      const isRu = language === 'RU';
      const headerSubtitle = isRu 
        ? 'ОФИЦИАЛЬНЫЙ ТУРИСТИЧЕСКИЙ ВАУЧЕР И МАРШРУТ'
        : 'OFFICIAL TRAVEL VOUCHER & ITINERARY';
      doc.font(hasRoboto ? 'Roboto' : 'Helvetica').fontSize(10).text(headerSubtitle, 50, 65, { letterSpacing: 1 });

      // Badge: Group or Private
      const isGroup = groupBookings.length > 1;
      const badgeText = isGroup 
        ? (isRu ? 'ГРУППОВОЙ ТУР' : 'GROUP TOUR') 
        : (isRu ? 'ИНДИВИДУАЛЬНЫЙ ТУР' : 'PRIVATE TOUR');
      
      doc.rect(430, 42, 115, 24).fill(isGroup ? '#0284c7' : '#059669');
      doc.fillColor(white).font(hasRoboto ? 'Roboto-Bold' : 'Helvetica-Bold').fontSize(9).text(badgeText, 430, 50, { width: 115, align: 'center' });

      // Reset Font
      doc.font(hasRoboto ? 'Roboto' : 'Helvetica');

      // --- TOUR BASIC DETAILS BLOCK ---
      doc.rect(50, 140, 495, 65).fill(lightBg);
      doc.rect(50, 140, 495, 65).stroke('#e2e8f0');

      // Col 1: Travel Date
      doc.fillColor('#64748b').fontSize(8).text(isRu ? 'ДАТА ПОЕЗДКИ' : 'TRAVEL DATE', 70, 152);
      doc.fillColor(primaryColor).font(hasRoboto ? 'Roboto-Bold' : 'Helvetica-Bold').fontSize(12).text(groupBookings[0].booking_date, 70, 168);

      // Col 2: Language
      doc.font(hasRoboto ? 'Roboto' : 'Helvetica').fillColor('#64748b').fontSize(8).text(isRu ? 'ЯЗЫК ТУРА' : 'TOUR LANGUAGE', 220, 152);
      doc.fillColor(primaryColor).font(hasRoboto ? 'Roboto-Bold' : 'Helvetica-Bold').fontSize(12).text(language, 220, 168);

      // Col 3: Group Size
      const totalPassengers = groupBookings.reduce((sum, b) => sum + (b.passenger_count || 1), 0);
      doc.font(hasRoboto ? 'Roboto' : 'Helvetica').fillColor('#64748b').fontSize(8).text(isRu ? 'КОЛИЧЕСТВО УЧАСТНИКОВ' : 'TOTAL PASSENGERS', 360, 152);
      doc.fillColor(primaryColor).font(hasRoboto ? 'Roboto-Bold' : 'Helvetica-Bold').fontSize(12).text(`${totalPassengers} ${isRu ? 'чел' : 'Pax'}`, 360, 168);

      // Reset font to regular
      doc.font(hasRoboto ? 'Roboto' : 'Helvetica').fillColor(textColor);

      let currentY = 225;

      // --- SECTION: TOURIST DETAILS ---
      doc.font(hasRoboto ? 'Roboto-Bold' : 'Helvetica-Bold').fontSize(12).fillColor(primaryColor).text(isRu ? 'Информация о туристах' : 'Tourist Details', 50, currentY);
      doc.moveTo(50, currentY + 16).lineTo(545, currentY + 16).strokeColor('#e2e8f0').stroke();
      currentY += 25;

      groupBookings.forEach((b, idx) => {
        doc.font(hasRoboto ? 'Roboto-Bold' : 'Helvetica-Bold').fontSize(10).fillColor(textColor).text(`${idx + 1}. ${b.tourist_name}`, 55, currentY);
        doc.font(hasRoboto ? 'Roboto' : 'Helvetica').fontSize(9).fillColor('#64748b').text(`Email: ${b.tourist_email}  |  Phone: ${b.tourist_phone || 'N/A'}`, 70, currentY + 14);
        
        const priceLabel = isRu 
          ? `Стоимость: $${parseFloat(b.total_price).toFixed(2)} (Заказ #${b.id})` 
          : `Price: $${parseFloat(b.total_price).toFixed(2)} (Booking #${b.id})`;
        doc.font(hasRoboto ? 'Roboto-Bold' : 'Helvetica-Bold').fontSize(9).fillColor(accentColor).text(priceLabel, 370, currentY + 3);
        
        currentY += 38;
      });

      currentY += 10;

      // --- SECTION: ASSIGNED SERVICES (GUIDE & DRIVER) ---
      doc.font(hasRoboto ? 'Roboto-Bold' : 'Helvetica-Bold').fontSize(12).fillColor(primaryColor).text(isRu ? 'Назначенный персонал' : 'Assigned Guide & Driver', 50, currentY);
      doc.moveTo(50, currentY + 16).lineTo(545, currentY + 16).strokeColor('#e2e8f0').stroke();
      currentY += 25;

      // Guide Card
      doc.rect(50, currentY, 235, 75).fill(lightBg).stroke('#e2e8f0');
      doc.fillColor(accentColor).font(hasRoboto ? 'Roboto-Bold' : 'Helvetica-Bold').fontSize(9).text(isRu ? 'ГИД / ЭКСКУРСОВОД' : 'ASSIGNED GUIDE', 65, currentY + 12);
      doc.fillColor(primaryColor).font(hasRoboto ? 'Roboto-Bold' : 'Helvetica-Bold').fontSize(11).text(finalGuide.full_name, 65, currentY + 28);
      doc.fillColor(textColor).font(hasRoboto ? 'Roboto' : 'Helvetica').fontSize(9).text(finalGuide.phone_number, 65, currentY + 46);

      // Driver/Vehicle Card
      doc.rect(310, currentY, 235, 75).fill(lightBg).stroke('#e2e8f0');
      doc.fillColor(accentColor).font(hasRoboto ? 'Roboto-Bold' : 'Helvetica-Bold').fontSize(9).text(isRu ? 'ВОДИТЕЛЬ И ТРАНСПОРТ' : 'DRIVER & VEHICLE', 325, currentY + 12);
      doc.fillColor(primaryColor).font(hasRoboto ? 'Roboto-Bold' : 'Helvetica-Bold').fontSize(11).text(finalVehicle.driver_name, 325, currentY + 28);
      doc.fillColor(textColor).font(hasRoboto ? 'Roboto' : 'Helvetica').fontSize(8.5).text(`${finalVehicle.car_model}\nNo: ${finalVehicle.car_number} | Tel: ${finalVehicle.driver_phone}`, 325, currentY + 44);

      currentY += 95;

      // --- SECTION: ROUTE & ITINERARY ---
      doc.font(hasRoboto ? 'Roboto-Bold' : 'Helvetica-Bold').fontSize(12).fillColor(primaryColor).text(isRu ? 'Маршрут поездки' : 'Tour Itinerary', 50, currentY);
      doc.moveTo(50, currentY + 16).lineTo(545, currentY + 16).strokeColor('#e2e8f0').stroke();
      currentY += 30;

      const locations = groupBookings[0].locations || [];
      locations.forEach((loc, idx) => {
        // Draw timeline circle
        doc.circle(65, currentY + 6, 4).fill(accentColor);
        if (idx < locations.length - 1) {
          doc.moveTo(65, currentY + 10).lineTo(65, currentY + 36).strokeColor('#cbd5e1').stroke();
        }

        const locName = isRu ? (loc.name_ru || loc.name_en) : loc.name_en;
        doc.fillColor(primaryColor).font(hasRoboto ? 'Roboto-Bold' : 'Helvetica-Bold').fontSize(10).text(locName, 80, currentY);
        
        const locDesc = isRu ? (loc.description_ru || loc.description_en || '') : (loc.description_en || '');
        if (locDesc) {
          doc.fillColor('#64748b').font(hasRoboto ? 'Roboto' : 'Helvetica').fontSize(8.5).text(locDesc.substring(0, 110) + (locDesc.length > 110 ? '...' : ''), 80, currentY + 14, { width: 440 });
        }
        currentY += 38;
      });

      // --- FOOTER BLOCK ---
      doc.rect(0, 770, 595, 72).fill(primaryColor);
      doc.fillColor('#94a3b8').fontSize(7.5);
      const footerText = isRu 
        ? 'Спасибо, что выбрали Samarqand CrafTour. Пожалуйста, будьте в лобби вашего отеля за 10 минут до назначенного времени.\nДля любых вопросов обращайтесь по номеру службы поддержки или напрямую к вашему гиду.'
        : 'Thank you for choosing Samarqand CrafTour. Please be ready at your hotel lobby 10 minutes prior to departure.\nFor support or questions, contact customer service or your assigned guide directly.';
      doc.text(footerText, 50, 785, { width: 495, align: 'center', lineGap: 3 });

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}

export async function GET(req) {
  try {
    const bypassSupabase = req.headers.get('x-bypass-supabase') === 'true';
    let isDbActive = supabaseConfigured && !bypassSupabase;

    console.log(`[Cron Processor] Fetching verified, unsent bookings. DB Active = ${isDbActive}`);

    let bookings = [];

    // 1. Fetch confirmed bookings with unsent notifications
    if (isDbActive) {
      try {
        const { data: dbBookings, error: dbErr } = await supabase
          .from('bookings')
          .select(`
            *,
            guide:guides(*),
            vehicle:vehicles(*)
          `)
          .eq('status', 'confirmed')
          .eq('notification_sent', false);

        if (dbErr) {
          console.warn('⚠️ Supabase error fetching bookings, falling back to mock store:', dbErr.message);
          isDbActive = false;
        } else if (dbBookings && dbBookings.length > 0) {
          // Fetch locations for these bookings
          const bookingIds = dbBookings.map(b => b.id);
          const { data: items, error: itemsErr } = await supabase
            .from('booking_items')
            .select(`
              booking_id,
              location_id,
              visit_order,
              location:locations(*)
            `)
            .in('booking_id', bookingIds);

          if (itemsErr) {
            console.error('Error fetching booking items:', itemsErr.message);
          } else {
            // Attach sorted locations to bookings
            dbBookings.forEach(b => {
              const locItems = items.filter(item => item.booking_id === b.id);
              b.locations = locItems
                .sort((a, b) => a.visit_order - b.visit_order)
                .map(item => item.location);
            });
          }
          bookings = dbBookings;
        }
      } catch (err) {
        console.warn('⚠️ Exception querying Supabase, falling back to mock store:', err.message);
        isDbActive = false;
      }
    }

    if (!isDbActive) {
      // Offline mock storage fallback
      if (global.mockBookingsStore) {
        const mockList = Array.from(global.mockBookingsStore.values())
          .filter(b => b.status === 'confirmed' && b.notification_sent !== true);

        // Populate guide, vehicle, and locations for mock bookings
        mockList.forEach(b => {
          b.guide = mockGuides[b.guide_id] || mockGuides[1];
          b.vehicle = mockVehicles[b.vehicle_id] || mockVehicles[1];
          
          if (b.locations && Array.isArray(b.locations)) {
            b.locations = b.locations
              .sort((a, b) => (a.visitOrder || a.visit_order || 0) - (b.visitOrder || b.visit_order || 0))
              .map(item => mockLocations[item.locationId || item.location_id] || mockLocations[1]);
          } else {
            b.locations = [mockLocations[1]];
          }
        });
        bookings = mockList;
      }
    }

    if (bookings.length === 0) {
      return NextResponse.json({ message: 'No pending bookings to process.' });
    }

    console.log(`[Cron Processor] Found ${bookings.length} verified bookings to process.`);

    // 2. Group bookings by travel date + customer language + exact locations (sorted IDs)
    const groups = {};
    bookings.forEach(b => {
      if (!b.locations || b.locations.length === 0) {
        b.locations = [mockLocations[1]];
      }
      const sortedLocIds = b.locations.map(loc => loc.id).sort((a, b) => a - b).join(',');
      const groupKey = `${b.booking_date}_${b.customer_language}_${sortedLocIds}`;
      
      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      groups[groupKey].push(b);
    });

    const now = new Date();
    const processedGroupIds = [];
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;
    const smtpUser = process.env.SMTP_USER;
    const smtpPassword = process.env.SMTP_PASSWORD;

    // Load custom Cyrillic-supporting fonts from Google Fonts raw repository CDN
    const fonts = await loadFonts();

    // 3. Process each group
    for (const groupKey in groups) {
      const groupBookings = groups[groupKey];
      const isGrouped = groupBookings.length > 1;

      // Group wait validation: If it is a single booking, check if it has waited for at least 3 minutes
      if (!isGrouped) {
        const single = groupBookings[0];
        const verifiedTime = new Date(single.verified_at || single.created_at || now);
        const waitingMinutes = (now - verifiedTime) / (1000 * 60);

        if (waitingMinutes < 3.0) {
          console.log(`[Cron Processor] Skipping Single Booking ID #${single.id} (waited ${waitingMinutes.toFixed(1)} mins, requires 3.0).`);
          continue;
        }
      }

      console.log(`[Cron Processor] Processing group key "${groupKey}" containing Booking IDs: ${groupBookings.map(b => b.id).join(', ')}`);

      // Determine consolidated details for the group
      const totalPassengers = groupBookings.reduce((sum, b) => sum + (b.passenger_count || 1), 0);
      const language = groupBookings[0].customer_language || 'EN';
      const isRu = language === 'RU';

      // Pick Guide from first booking in the group
      const finalGuide = groupBookings[0].guide || mockGuides[groupBookings[0].guide_id] || mockGuides[1];

      // Assign dynamic vehicle based on capacity
      let finalVehicle = null;
      if (isDbActive) {
        const { data: dbVehicles, error: vehErr } = await supabase
          .from('vehicles')
          .select('*')
          .gte('capacity', totalPassengers)
          .order('capacity', { ascending: true })
          .order('city_rate', { ascending: true })
          .limit(1);

        if (dbVehicles && dbVehicles.length > 0) {
          finalVehicle = dbVehicles[0];
        }
      }

      if (!finalVehicle) {
        if (totalPassengers <= 5) {
          finalVehicle = mockVehicles[2]; // Gentra (capacity 5)
        } else if (totalPassengers <= 8) {
          finalVehicle = mockVehicles[4]; // Minivan (capacity 8)
        } else {
          finalVehicle = mockVehicles[5]; // Bus (capacity 20)
        }
      }

      // Generate Voucher PDF
      console.log(`[Cron Processor] Generating travel voucher PDF for ${totalPassengers} passengers.`);
      const pdfBuffer = await generateVoucherPdf(groupBookings, finalGuide, finalVehicle, language, fonts);

      // Assemble Telegram text caption
      let tgText = '';
      if (isGrouped) {
        tgText = isRu
          ? `🌟 *SAMARQAND CRAFTOUR - ГРУППОВАЯ ПОЕЗДКА (POOLING)* 🌟\n\n` +
            `👥 *Создана объединенная группа для совместной поездки!*\n\n` +
            `📅 *Дата:* ${groupBookings[0].booking_date}\n` +
            `🌐 *Язык обслуживания:* ${language}\n` +
            `👥 *Пассажиров:* ${totalPassengers} чел (${groupBookings.map(b => `${b.tourist_name} (${b.passenger_count || 1} чел)`).join(', ')})\n\n` +
            `🛣 *Маршрут:* \n${groupBookings[0].locations.map((loc, idx) => `${idx + 1}. ${loc.name_ru || loc.name_en}`).join('\n')}\n\n` +
            `👤 *Гид:* ${finalGuide.full_name} (${finalGuide.phone_number})\n` +
            `🚗 *Водитель:* ${finalVehicle.driver_name} (${finalVehicle.driver_phone})\n` +
            `🚘 *Автомобиль:* ${finalVehicle.car_model} (${finalVehicle.car_number})\n\n` +
            `💵 *Стоимость броней:* \n${groupBookings.map(b => `- Заказ #${b.id} (${b.tourist_name}): $${parseFloat(b.total_price).toFixed(2)}`).join('\n')}\n\n` +
            `📄 *Официальный PDF-ваучер прикреплен к этому сообщению.*`
          : `🌟 *SAMARQAND CRAFTOUR - GROUP RIDE POOLING* 🌟\n\n` +
            `👥 *New pooled ride sharing group has been formed!*\n\n` +
            `📅 *Date:* ${groupBookings[0].booking_date}\n` +
            `🌐 *Language:* ${language}\n` +
            `👥 *Total Passengers:* ${totalPassengers} Pax (${groupBookings.map(b => `${b.tourist_name} (${b.passenger_count || 1} Pax)`).join(', ')})\n\n` +
            `🛣 *Itinerary:* \n${groupBookings[0].locations.map((loc, idx) => `${idx + 1}. ${loc.name_en}`).join('\n')}\n\n` +
            `👤 *Guide:* ${finalGuide.full_name} (${finalGuide.phone_number})\n` +
            `🚗 *Driver:* ${finalVehicle.driver_name} (${finalVehicle.driver_phone})\n` +
            `🚘 *Vehicle:* ${finalVehicle.car_model} (${finalVehicle.car_number})\n\n` +
            `💵 *Payments summary:* \n${groupBookings.map(b => `- Booking #${b.id} (${b.tourist_name}): $${parseFloat(b.total_price).toFixed(2)}`).join('\n')}\n\n` +
            `📄 *Official travel voucher PDF is attached below.*`;
      } else {
        const b = groupBookings[0];
        tgText = isRu
          ? `✨ *SAMARQAND CRAFTOUR - ИНДИВИДУАЛЬНАЯ ПОЕЗДКА* ✨\n\n` +
            `📅 *Дата:* ${b.booking_date}\n` +
            `🌐 *Язык обслуживания:* ${language}\n` +
            `👥 *Пассажиров:* ${totalPassengers} чел (${b.tourist_name})\n\n` +
            `🛣 *Маршрут:* \n${b.locations.map((loc, idx) => `${idx + 1}. ${loc.name_ru || loc.name_en}`).join('\n')}\n\n` +
            `👤 *Гид:* ${finalGuide.full_name} (${finalGuide.phone_number})\n` +
            `🚗 *Водитель:* ${finalVehicle.driver_name} (${finalVehicle.driver_phone})\n` +
            `🚘 *Автомобиль:* ${finalVehicle.car_model} (${finalVehicle.car_number})\n\n` +
            `💵 *Стоимость заказа #${b.id}:* $${parseFloat(b.total_price).toFixed(2)}\n\n` +
            `📄 *Официальный PDF-ваучер прикреплен к этому сообщению.*`
          : `✨ *SAMARQAND CRAFTOUR - INDIVIDUAL PRIVATE TOUR* ✨\n\n` +
            `📅 *Date:* ${b.booking_date}\n` +
            `🌐 *Language:* ${language}\n` +
            `👥 *Passengers:* ${totalPassengers} Pax (${b.tourist_name})\n\n` +
            `🛣 *Itinerary:* \n${b.locations.map((loc, idx) => `${idx + 1}. ${loc.name_en}`).join('\n')}\n\n` +
            `👤 *Guide:* ${finalGuide.full_name} (${finalGuide.phone_number})\n` +
            `🚗 *Driver:* ${finalVehicle.driver_name} (${finalVehicle.driver_phone})\n` +
            `🚘 *Vehicle:* ${finalVehicle.car_model} (${finalVehicle.car_number})\n\n` +
            `💵 *Payment for Booking #${b.id}:* $${parseFloat(b.total_price).toFixed(2)}\n\n` +
            `📄 *Official travel voucher PDF is attached below.*`;
      }

      // Always print text output to console logs for verification and auditing
      console.log('==========================================');
      console.log('🕌 TELEGRAM NOTIFICATION ALERTS BROADCAST:');
      console.log(tgText);
      console.log('==========================================');

      // Send document to Telegram bot
      if (botToken && chatId) {
        try {
          const formData = new FormData();
          formData.append('chat_id', chatId);
          formData.append('caption', tgText.slice(0, 1020)); // Keep within caption limits
          formData.append('parse_mode', 'Markdown');

          const blob = new Blob([pdfBuffer], { type: 'application/pdf' });
          const fileName = `CrafTour_Voucher_${groupBookings[0].booking_date}_${language}.pdf`;
          formData.append('document', blob, fileName);

          const tgRes = await fetch(`https://api.telegram.org/bot${botToken}/sendDocument`, {
            method: 'POST',
            body: formData
          });

          if (!tgRes.ok) {
            const errText = await tgRes.text();
            console.error('[Cron Processor] Telegram file upload failed:', errText);
          } else {
            console.log(`[Cron Processor] PDF Document successfully sent to Telegram chat: ${chatId}`);
          }
        } catch (tgErr) {
          console.error('[Cron Processor] Failed to notify Telegram:', tgErr.message);
        }
      }

      // Send email notifications via Nodemailer SMTP with PDF attachment
      if (smtpUser && smtpPassword) {
        try {
          const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
              user: smtpUser,
              pass: smtpPassword
            }
          });

          for (const booking of groupBookings) {
            const isBookingRu = booking.customer_language === 'RU';
            const emailSubject = isBookingRu
              ? 'Ваш туристический ваучер - Samarqand CrafTour'
              : 'Your Travel Voucher - Samarqand CrafTour';

            const emailHtml = isGrouped
              ? (isBookingRu 
                  ? `<div style="font-family: sans-serif; padding: 20px; color: #1e293b; max-width: 600px; border: 1px solid #e2e8f0; border-radius: 8px;">
                      <h2 style="color: #0f172a;">Samarqand CrafTour</h2>
                      <p>Здравствуйте, <strong>${booking.tourist_name}</strong>!</p>
                      <p>Мы рады сообщить, что ваша поездка на <strong>${booking.booking_date}</strong> успешно подтверждена и объединена в групповой тур!</p>
                      <p>Мы прикрепили к этому письму ваш официальный туристический ваучер (PDF) с подробным расписанием, а также контактами гида и водителя.</p>
                      <p>Приятного вам путешествия по Самарканду!</p>
                    </div>`
                  : `<div style="font-family: sans-serif; padding: 20px; color: #1e293b; max-width: 600px; border: 1px solid #e2e8f0; border-radius: 8px;">
                      <h2 style="color: #0f172a;">Samarqand CrafTour</h2>
                      <p>Hello <strong>${booking.tourist_name}</strong>,</p>
                      <p>We are pleased to inform you that your tour on <strong>${booking.booking_date}</strong> is confirmed and has been grouped into a shared tour!</p>
                      <p>Your official travel voucher (PDF) is attached to this email, complete with the detailed itinerary, guide, and driver contact details.</p>
                      <p>Have a wonderful trip to Samarkand!</p>
                    </div>`
                )
              : (isBookingRu
                  ? `<div style="font-family: sans-serif; padding: 20px; color: #1e293b; max-width: 600px; border: 1px solid #e2e8f0; border-radius: 8px;">
                      <h2 style="color: #0f172a;">Samarqand CrafTour</h2>
                      <p>Здравствуйте, <strong>${booking.tourist_name}</strong>!</p>
                      <p>Ваша индивидуальная поездка на <strong>${booking.booking_date}</strong> успешно подтверждена.</p>
                      <p>Ваш официальный туристический ваучер (PDF) с подробным расписанием и деталями прикреплен к этому письму.</p>
                      <p>Приятного вам путешествия по Самарканду!</p>
                    </div>`
                  : `<div style="font-family: sans-serif; padding: 20px; color: #1e293b; max-width: 600px; border: 1px solid #e2e8f0; border-radius: 8px;">
                      <h2 style="color: #0f172a;">Samarqand CrafTour</h2>
                      <p>Hello <strong>${booking.tourist_name}</strong>,</p>
                      <p>Your private tour on <strong>${booking.booking_date}</strong> is confirmed.</p>
                      <p>Your official travel voucher (PDF) with the detailed itinerary and guide/driver details is attached to this email.</p>
                      <p>Have a wonderful trip to Samarkand!</p>
                    </div>`
                );

            await transporter.sendMail({
              from: `"Samarqand CrafTour" <${smtpUser}>`,
              to: booking.tourist_email,
              subject: emailSubject,
              html: emailHtml,
              attachments: [
                {
                  filename: `CrafTour_Voucher_${booking.id}.pdf`,
                  content: pdfBuffer,
                  contentType: 'application/pdf'
                }
              ]
            });
            console.log(`[Cron Processor] Confirmation email with PDF successfully sent to: ${booking.tourist_email}`);
          }
        } catch (emailErr) {
          console.error('[Cron Processor] Failed to send email confirmation:', emailErr.message);
        }
      }

      // Mark processed bookings as notification_sent = true in DB/Memory
      if (isDbActive) {
        const { error: markErr } = await supabase
          .from('bookings')
          .update({ notification_sent: true })
          .in('id', groupBookings.map(b => b.id));

        if (markErr) {
          console.error('[Cron Processor] Failed to update bookings state in DB:', markErr.message);
        } else {
          console.log(`[Cron Processor] Marked Booking IDs [${groupBookings.map(b => b.id).join(', ')}] as notification_sent = true in database.`);
        }
      } else {
        if (global.mockBookingsStore) {
          groupBookings.forEach(b => {
            const rawMock = global.mockBookingsStore.get(b.id.toString());
            if (rawMock) {
              rawMock.notification_sent = true;
            }
          });
        }
        console.log(`[Cron Processor] Offline Mock mode: Marked Booking IDs [${groupBookings.map(b => b.id).join(', ')}] as notification_sent = true in memory.`);
      }

      processedGroupIds.push(...groupBookings.map(b => b.id));
    }

    return NextResponse.json({
      message: `Processed ${processedGroupIds.length} bookings.`,
      processedIds: processedGroupIds
    });

  } catch (err) {
    console.error('Unhandled error in Cron Notification API:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
