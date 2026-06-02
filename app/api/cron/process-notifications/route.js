import { NextResponse } from 'next/server';
import { supabase, supabaseConfigured } from '@/lib/supabase';
import nodemailer from 'nodemailer';

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
  1: { id: 1, name_en: 'Registan Square', name_ru: 'Площадь Регистан', name_uz: 'Registon maydoni', description_en: 'The heart of ancient Samarkand, featuring three magnificent madrasahs.', description_ru: 'Сердце древнего Самарканда, украшенное тремя величественными медресе.', description_uz: 'Uchta muhtasham madrasadan iborat qadimiy Samarqandning yuragi.' },
  2: { id: 2, name_en: 'Gur-e-Amir Mausoleum', name_ru: 'Мавзолей Гур-Эмир', name_uz: 'Go\'ri Amir maqbarasi', description_en: 'The final resting place of Amir Temur (Tamerlane), a masterpiece of Persian-Mongolian architecture.', description_ru: 'Усыпальница Амира Темура (Тамерлана), шедевр персидско-монгольской архитектуры.', description_uz: 'Amir Temur (Tamerlan) ning so\'nggi qo\'nim topgan joyi, me\'moriy durdona.' },
  3: { id: 3, name_en: 'Shah-i-Zinda', name_ru: 'Шахи Зинда', name_uz: 'Shohi Zinda', description_en: 'A breathtaking avenue of blue-domed mausoleums dating back to the 11th-15th centuries.', description_ru: 'Улица лазурных мавзолеев XI–XV веков, поражающая своей красотой.', description_uz: 'Moviy gumbazli maqbaralardan iborat hayratlanarli xiyobon.' },
  4: { id: 4, name_en: 'Bibi-Khanym Mosque', name_ru: 'Мечеть Биби-Ханым', name_uz: 'Bibi Xonim masjidi', description_en: 'One of the largest mosques of the 15th century, built by Tamerlane in honor of his favorite wife.', description_ru: 'Одна из крупнейших мечетей XV века, построенная Тамерланом в честь любимой жены.', description_uz: 'Amir Temurning sevimli rafiqasi sharafiga qurilgan XV asrning eng yirik masjidlaridan biri.' },
  5: { id: 5, name_en: 'Ulugh Beg Observatory', name_ru: 'Обсерватория Улугбека', name_uz: 'Ulug\'bek rasadxonasi', description_en: 'Built in 1420, this observatory was one of the finest in the Islamic world.', description_ru: 'Обсерватория, построенная в 1420 году, бывшая одной из лучших в исламском мире.', description_uz: '1420-yilda qurilgan ushbu rasadxona islom dunyosining ajoyib mo\'jizalaridan biri bo\'lgan.' },
  6: { id: 6, name_en: 'Urgut Mountain Bazaar & Hills', name_ru: 'Ургутский горный базар и горы', name_uz: 'Urgut tog\' bozori va adirlari', description_en: 'Explore traditional crafts at the market and hike through scenic Urgut mountain ranges.', description_ru: 'Посетите традиционный ремесленный базар и прогуляйтесь по живописным горам Ургута.', description_uz: 'Bozorda an\'anaviy hunarmandchilik bilan tanishing va Urgutning go\'zal tog\' tizmalari bo\'ylab sayr qiling.' },
  7: { id: 7, name_en: 'Omonqo\'ton Pass & Pines', name_ru: 'Перевал Омонкоoton', name_uz: 'Omonqo\'ton dovoni va qarag\'aylari', description_en: 'A majestic pine forest and mountain pass with ancient caves and fresh springs.', description_ru: 'Величественный сосновый лес и горный перевал с древними пещерами и источниками.', description_uz: 'Qadimiy g\'orlar va toza buloqlarga ega muhtasham qarag\'ayzor hamda tog\' dovoni.' },
  8: { id: 8, name_en: 'Konigil Paper Mill', name_ru: 'Бумажная фабрика Конигиль', name_uz: 'Konigil qog\'oz fabrikasi', description_en: 'A peaceful eco-village showcasing the ancient art of Samarkand mulberry paper making.', description_ru: 'Тихая эко-деревня, демонстрирующая древнее искусство изготовления самаркандской шелковой бумаги.', description_uz: 'Samarqand tut qog\'ozini tayyorlashning qadimiy san\'atini namoyish etuvchi tinch eko-qishloq.' },
  9: { id: 9, name_en: 'National Osh House', name_ru: 'Национальный центр плова', name_uz: 'Milliy palov markazi', description_en: 'Authentic Samarkand Osh prepared in giant cauldrons using traditional recipes.', description_ru: 'Настоящий самаркандский плов, приготовленный в огромных казанах по старинным рецептам.', description_uz: 'Katta qozonlarda an\'anaviy retseptlar bo\'yicha tayyorlangan haqiqiy Samarqand palovi.' },
  10: { id: 10, name_en: 'Samarkand Bread Bakery', name_ru: 'Пекарня самаркандских лепешек', name_uz: 'Samarqand nonvoyxonasi', description_en: 'Watch bakers prepare the famous, shiny Samarkand bread in traditional clay ovens.', description_ru: 'Наблюдайте за приготовлением знаменитых блестящих самаркандских лепешек в тандырах.', description_uz: 'Nonvoylar tandirda mashhur, yaltiroq Samarqand nonlarini yopishini kuzating.' },
  11: { id: 11, name_en: 'Karimbek Restaurant', name_ru: 'Ресторан Каримбек', name_uz: 'Karimbek restorani', description_en: 'Elegant dining featuring traditional shashlik, manti, and vibrant Uzbek music.', description_ru: 'Элегантный ресторан с традиционными шашлыками, мантами и живой узбекской музыкой.', description_uz: 'An\'anaviy kabob, manti va jonli milliy musiqa taklif etuvchi ajoyib restoran.' }
};

function generateEmailHtml(booking, groupBookings, finalGuide, finalVehicle, isGrouped) {
  const isUz = booking.customer_language === 'UZ';
  const isRu = booking.customer_language === 'RU';
  const totalPassengers = groupBookings.reduce((sum, b) => sum + (b.passenger_count || 1), 0);
  
  // Styling constants
  const primaryColor = '#0f172a'; // Deep Slate Navy
  const accentColor = '#d4af37';  // Gold Accent
  const textColor = '#334155';    // Charcoal Text
  const lightBg = '#f8fafc';      // Light Gray Background
  const borderColor = '#e2e8f0';
 
  // Tour type badge
  const badgeText = isUz
    ? (isGrouped ? 'GURUH TUR' : 'SHAXSIY TUR')
    : isRu 
      ? (isGrouped ? 'ГРУППОВОЙ ТУР' : 'ИНДИВИДУАЛЬНЫЙ ТУР') 
      : (isGrouped ? 'GROUP TOUR' : 'PRIVATE TOUR');
  const badgeBg = isGrouped ? '#0284c7' : '#059669';
 
  const headerSubtitle = isUz
    ? 'RASMIY SAYOHAT VAUCHERI VA MARSHRUT'
    : isRu 
      ? 'ОФИЦИАЛЬНЫЙ ТУРИСТИЧЕСКИЙ ВАУЧЕР И МАРШРУТ'
      : 'OFFICIAL TRAVEL VOUCHER & ITINERARY';
 
  // Tourist rows
  const touristRows = groupBookings.map((b, idx) => {
    const priceLabel = isUz
      ? `Narxi: $${parseFloat(b.total_price).toFixed(2)} (Buyurtma #${b.id})`
      : isRu 
        ? `Стоимость: $${parseFloat(b.total_price).toFixed(2)} (Заказ #${b.id})` 
        : `Price: $${parseFloat(b.total_price).toFixed(2)} (Booking #${b.id})`;
    return `
      <div style="margin-bottom: 12px; padding-bottom: 12px; border-bottom: 1px dashed ${borderColor};">
        <strong style="color: ${primaryColor}; font-size: 14px;">${idx + 1}. ${b.tourist_name}</strong><br/>
        <span style="font-size: 12px; color: #64748b;">Email: ${b.tourist_email} | ${isUz ? 'Telefon' : isRu ? 'Тел.' : 'Phone'}: ${b.tourist_phone || 'N/A'}</span><br/>
        <span style="font-size: 13px; color: ${accentColor}; font-weight: bold;">${priceLabel}</span>
      </div>
    `;
  }).join('');
 
  // Itinerary list
  const itineraryList = (groupBookings[0].locations || []).map((loc, idx) => {
    const locName = isUz ? (loc.name_uz || loc.name_en) : isRu ? (loc.name_ru || loc.name_en) : loc.name_en;
    const locDesc = isUz ? (loc.description_uz || loc.description_en || '') : isRu ? (loc.description_ru || loc.description_en || '') : (loc.description_en || '');
    return `
      <div style="margin-bottom: 15px; padding-left: 15px; border-left: 2px solid ${accentColor};">
        <strong style="color: ${primaryColor}; font-size: 14px;">${idx + 1}. ${locName}</strong>
        ${locDesc ? `<p style="margin: 4px 0 0 0; font-size: 12px; color: #64748b; line-height: 1.4;">${locDesc}</p>` : ''}
      </div>
    `;
  }).join('');
 
  const guideLabel = isUz ? 'TAYINLANGAN GID' : isRu ? 'ГИД / ЭКСКУРСОВОД' : 'ASSIGNED GUIDE';
  const driverLabel = isUz ? 'HAYDOVCHI VA TRANSPORT' : isRu ? 'ВОДИТЕЛЬ И ТРАНСПОРТ' : 'DRIVER & VEHICLE';
  
  const introText = isGrouped
    ? (isUz
        ? `Sizning <strong>${booking.booking_date}</strong> sanasidagi sayohatingiz muvaffaqiyatli tasdiqlandi va guruh turiga birlashtirildi! Quyida sayohat tafsilotlari keltirilgan.`
        : isRu 
          ? `Мы рады сообщить, что ваша совместная поездка на <strong>${booking.booking_date}</strong> успешно подтверждена и объединена в групповой тур! Ниже приведены детали вашего тура.`
          : `We are pleased to inform you that your tour on <strong>${booking.booking_date}</strong> is confirmed and has been grouped into a shared tour! Below are your tour details.`)
    : (isUz
        ? `Sizning <strong>${booking.booking_date}</strong> sanasidagi shaxsiy sayohatingiz muvaffaqiyatli tasdiqlandi. Quyida sayohat tafsilotlari keltirilgan.`
        : isRu
          ? `Ваша индивидуальная поездка на <strong>${booking.booking_date}</strong> успешно подтверждена. Ниже приведены детали вашего тура.`
          : `Your private tour on <strong>${booking.booking_date}</strong> is confirmed. Below are your tour details.`);
 
  const updateNotice = isGrouped
    ? (isUz
        ? `<p style="font-size: 12px; color: #64748b; margin-top: 15px; font-style: italic;">*Eslatma: Agar guruhingizga yangi sayyohlar qo'shilsa, sizga yangilangan marshrut yuboriladi.</p>`
        : isRu 
          ? `<p style="font-size: 12px; color: #64748b; margin-top: 15px; font-style: italic;">*Примечание: Если к вашей группе присоединятся новые участники, вам будет выслано обновленное расписание.</p>`
          : `<p style="font-size: 12px; color: #64748b; margin-top: 15px; font-style: italic;">*Note: If new partners join your travel group, an updated itinerary will be sent to you.</p>`)
    : (isUz
        ? `<p style="font-size: 12px; color: #64748b; margin-top: 15px; font-style: italic;">*Eslatma: Agar xuddi shu marshrut bo'yicha boshqa sayyohlar qo'shilsa, siz guruh turiga birlashtirilasiz va sizga yangilangan vaucher yuboriladi.</p>`
        : isRu
          ? `<p style="font-size: 12px; color: #64748b; margin-top: 15px; font-style: italic;">*Примечание: Если к вашему туру присоединятся другие участники на аналогичный маршрут, вы будете объединены в группу и вам вышлют обновленный ваучер.</p>`
          : `<p style="font-size: 12px; color: #64748b; margin-top: 15px; font-style: italic;">*Note: If other travellers join your tour for a matching route, you will be pooled into a shared group and an updated voucher will be sent to you.</p>`);
 
  const footerText = isUz
    ? 'Samarqand CrafTour xizmatini tanlaganingiz uchun rahmat. Iltimos, belgilangan vaqtdan 10 daqiqa oldin mehmonxona foyesida tayyor turing.<br/>Savollar yuzasidan qo\'llab-quvvatlash xizmati yoki gid bilan bevosita bog\'lanishingiz mumkin.'
    : isRu 
      ? 'Спасибо, что выбрали Samarqand CrafTour. Пожалуйста, будьте в лобби вашего отеля за 10 минут до назначенного времени.<br/>Для любых вопросов обращайтесь по номеру службы поддержки или напрямую к вашему гиду.'
      : 'Thank you for choosing Samarqand CrafTour. Please be ready at your hotel lobby 10 minutes prior to departure.<br/>For support or questions, contact customer service or your assigned guide directly.';
 
  return `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; padding: 0; margin: 0; background-color: #f1f5f9;">
      <table cellpadding="0" cellspacing="0" width="100%" style="background-color: #f1f5f9; padding: 20px 0;">
        <tr>
          <td align="center">
            <table cellpadding="0" cellspacing="0" width="600" style="background-color: #ffffff; border: 1px solid ${borderColor}; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);">
              
              <!-- Header Banner -->
              <tr>
                <td style="background-color: ${primaryColor}; padding: 30px; text-align: center;">
                  <h1 style="color: ${accentColor}; font-size: 24px; margin: 0; letter-spacing: 2px; font-weight: 800;">SAMARQAND CRAFTOUR</h1>
                  <p style="color: #94a3b8; font-size: 11px; margin: 8px 0 0 0; letter-spacing: 1px; font-weight: 600;">${headerSubtitle}</p>
                </td>
              </tr>
 
              <!-- Main Content -->
              <tr>
                <td style="padding: 30px; color: ${textColor}; line-height: 1.6;">
                  <h3 style="color: ${primaryColor}; margin-top: 0; font-size: 18px;">
                    ${isUz ? 'Buyurtma tasdiqlanishi' : isRu ? 'Подтверждение бронирования' : 'Booking Confirmation'}
                  </h3>
                  <p>
                    ${isUz ? 'Assalomu alaykum' : isRu ? 'Здравствуйте' : 'Hello'} <strong>${booking.tourist_name}</strong>,
                  </p>
                  <p>${introText}</p>
 
                  <!-- Summary Badges -->
                  <table cellpadding="0" cellspacing="0" width="100%" style="background-color: ${lightBg}; border: 1px solid ${borderColor}; border-radius: 8px; margin: 20px 0; padding: 15px;">
                    <tr>
                      <td width="50%" style="padding: 5px;">
                        <span style="font-size: 11px; color: #64748b; font-weight: bold; text-transform: uppercase;">
                          ${isUz ? 'SAYOHAT SANASI' : isRu ? 'ДАТА ПОЕЗДКИ' : 'TRAVEL DATE'}
                        </span><br/>
                        <strong style="color: ${primaryColor}; font-size: 15px;">${booking.booking_date}</strong>
                      </td>
                      <td width="50%" style="padding: 5px; text-align: right;">
                        <span style="display: inline-block; background-color: ${badgeBg}; color: #ffffff; font-size: 11px; font-weight: bold; padding: 4px 10px; border-radius: 4px;">
                          ${badgeText}
                        </span>
                      </td>
                    </tr>
                    <tr>
                      <td width="50%" style="padding: 5px; border-top: 1px solid ${borderColor}; margin-top: 10px;">
                        <span style="font-size: 11px; color: #64748b; font-weight: bold; text-transform: uppercase;">
                          ${isUz ? 'SAYOHAT TILI' : isRu ? 'ЯЗЫК ТУРА' : 'TOUR LANGUAGE'}
                        </span><br/>
                        <strong style="color: ${primaryColor}; font-size: 15px;">${booking.customer_language}</strong>
                      </td>
                      <td width="50%" style="padding: 5px; text-align: right; border-top: 1px solid ${borderColor}; margin-top: 10px;">
                        <span style="font-size: 11px; color: #64748b; font-weight: bold; text-transform: uppercase;">
                          ${isUz ? 'JAMI YO\'LOVCHILAR' : isRu ? 'КОЛИЧЕСТВО УЧАСТНИКОВ' : 'TOTAL PASSENGERS'}
                        </span><br/>
                        <strong style="color: ${primaryColor}; font-size: 15px;">${totalPassengers} ${isUz ? 'ta' : isRu ? 'чел' : 'Pax'}</strong>
                      </td>
                    </tr>
                  </table>
 
                  <!-- Tourist Details -->
                  <h4 style="color: ${primaryColor}; font-size: 15px; margin: 25px 0 10px 0; border-bottom: 2px solid ${primaryColor}; padding-bottom: 5px;">
                    ${isUz ? 'Sayyohlar ma\'lumotlari' : isRu ? 'Информация о туристах' : 'Tourist Details'}
                  </h4>
                  ${touristRows}
 
                  <!-- Guide & Driver Section -->
                  <h4 style="color: ${primaryColor}; font-size: 15px; margin: 25px 0 10px 0; border-bottom: 2px solid ${primaryColor}; padding-bottom: 5px;">
                    ${isUz ? 'Xizmat ko\'rsatuvchi xodimlar' : isRu ? 'Назначенный персонал' : 'Assigned Staff'}
                  </h4>
                  <table cellpadding="0" cellspacing="0" width="100%" style="margin-bottom: 20px;">
                    <tr>
                      <td width="48%" valign="top" style="background-color: ${lightBg}; border: 1px solid ${borderColor}; border-radius: 8px; padding: 12px;">
                        <span style="color: ${accentColor}; font-size: 10px; font-weight: bold; display: block; margin-bottom: 4px;">${guideLabel}</span>
                        <strong style="color: ${primaryColor}; font-size: 14px; display: block;">${finalGuide.full_name}</strong>
                        <span style="font-size: 12px; color: ${textColor}; display: block; margin-top: 4px;">${finalGuide.phone_number}</span>
                      </td>
                      <td width="4%">&nbsp;</td>
                      <td width="48%" valign="top" style="background-color: ${lightBg}; border: 1px solid ${borderColor}; border-radius: 8px; padding: 12px;">
                        <span style="color: ${accentColor}; font-size: 10px; font-weight: bold; display: block; margin-bottom: 4px;">${driverLabel}</span>
                        <strong style="color: ${primaryColor}; font-size: 14px; display: block;">${finalVehicle.driver_name}</strong>
                        <span style="font-size: 11px; color: ${textColor}; display: block; margin-top: 4px; line-height: 1.3;">
                          ${finalVehicle.car_model}<br/>
                          No: ${finalVehicle.car_number}<br/>
                          Tel: ${finalVehicle.driver_phone}
                        </span>
                      </td>
                    </tr>
                  </table>
 
                  <!-- Route Details -->
                  <h4 style="color: ${primaryColor}; font-size: 15px; margin: 25px 0 10px 0; border-bottom: 2px solid ${primaryColor}; padding-bottom: 5px;">
                    ${isUz ? 'Sayohat marshruti' : isRu ? 'Маршрут поездки' : 'Tour Itinerary'}
                  </h4>
                  ${itineraryList}
 
                  ${updateNotice}
                </td>
              </tr>
 
              <!-- Footer -->
              <tr>
                <td style="background-color: ${primaryColor}; padding: 30px; text-align: center; color: #94a3b8; font-size: 12px; line-height: 1.5;">
                  ${footerText}
                  <div style="margin-top: 20px; border-top: 1px solid #334155; padding-top: 15px; font-size: 10px; color: #64748b;">
                    © 2026 Samarqand CrafTour. All rights reserved.
                  </div>
                </td>
              </tr>
 
            </table>
          </td>
        </tr>
      </table>
    </div>
  `;
}

export async function GET(req) {
  try {
    const bypassSupabase = req.headers.get('x-bypass-supabase') === 'true';
    let isDbActive = supabaseConfigured && !bypassSupabase;

    console.log(`[Cron Processor] Fetching verified, unsent bookings. DB Active = ${isDbActive}`);

    let bookings = [];

    // 1. Fetch confirmed bookings
    if (isDbActive) {
      try {
        // Step 1.1: Fetch pending confirmed bookings with notification_sent = false
        const { data: unsentBookings, error: dbErr } = await supabase
          .from('bookings')
          .select('booking_date')
          .eq('status', 'confirmed')
          .eq('notification_sent', false);

        if (dbErr) throw dbErr;

        if (unsentBookings && unsentBookings.length > 0) {
          const uniqueDates = Array.from(new Set(unsentBookings.map(b => b.booking_date)));

          // Step 1.2: Fetch all confirmed bookings for these dates (to see if they are part of a pool)
          const { data: dbBookings, error: fetchAllErr } = await supabase
            .from('bookings')
            .select(`
              *,
              guide:guides(*),
              vehicle:vehicles(*)
            `)
            .eq('status', 'confirmed')
            .in('booking_date', uniqueDates);

          if (fetchAllErr) throw fetchAllErr;

          if (dbBookings && dbBookings.length > 0) {
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
          .filter(b => b.status === 'confirmed');

        const unsentMockDates = new Set(
          mockList.filter(b => b.notification_sent !== true).map(b => b.booking_date)
        );

        if (unsentMockDates.size > 0) {
          // Keep all mock bookings on those dates
          const filteredMock = mockList.filter(b => unsentMockDates.has(b.booking_date));

          // Populate guide, vehicle, and locations for mock bookings
          filteredMock.forEach(b => {
            b.guide = b.guide_id ? (mockGuides[b.guide_id] || null) : null;
            b.vehicle = mockVehicles[b.vehicle_id] || mockVehicles[1];
            
            if (b.locations && Array.isArray(b.locations)) {
              b.locations = b.locations
                .sort((a, b) => (a.visitOrder || a.visit_order || 0) - (b.visitOrder || b.visit_order || 0))
                .map(item => mockLocations[item.locationId || item.location_id] || mockLocations[1]);
            } else {
              b.locations = [mockLocations[1]];
            }
          });
          bookings = filteredMock;
        }
      }
    }

    if (bookings.length === 0) {
      return NextResponse.json({ message: 'No pending bookings to process.' });
    }

    console.log(`[Cron Processor] Found ${bookings.length} confirmed bookings on active dates to process.`);

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

    // 3. Process each group
    for (const groupKey in groups) {
      const groupBookings = groups[groupKey];

      // Check if this group has at least one booking that has NOT been notified yet
      const newBookingsInGroup = groupBookings.filter(b => b.notification_sent !== true);
      if (newBookingsInGroup.length === 0) {
        // Skip this group because all bookings in it have already been processed
        continue;
      }

      // Check if any booking in this group was ALREADY notified (meaning this is a group update!)
      const previouslyNotifiedBookings = groupBookings.filter(b => b.notification_sent === true);
      const isGroupUpdate = previouslyNotifiedBookings.length > 0;
      
      const isGrouped = groupBookings.length > 1;

      console.log(`[Cron Processor] Processing group key "${groupKey}" containing Booking IDs: ${groupBookings.map(b => b.id).join(', ')}. Is Group Update: ${isGroupUpdate}`);

      // Determine consolidated details for the group
      const totalPassengers = groupBookings.reduce((sum, b) => sum + (b.passenger_count || 1), 0);
      const language = groupBookings[0].customer_language || 'EN';
      const isRu = language === 'RU';

      // Pick Guide from first booking in the group that has a guide assigned
      let finalGuide = null;
      for (const b of groupBookings) {
        if (b.guide_id) {
          finalGuide = b.guide || mockGuides[b.guide_id] || null;
          if (finalGuide) break;
        }
      }

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

      // Assemble Telegram text caption (Rich Text message alert)
      let tgText = '';
      if (isGrouped) {
        if (isGroupUpdate) {
          tgText = `🔄 *SAMARQAND CRAFTOUR - GURUH YANGILANISHI (POOLING)* 🔄\n\n` +
            `👥 *Guruhingizga yangi sayyoh qo'shildi!*\n\n` +
            `📅 *Sana:* ${groupBookings[0].booking_date}\n` +
            `🌐 *Mijoz tili:* ${language}\n` +
            `👥 *Jami yo'lovchilar:* ${totalPassengers} ta (${groupBookings.map(b => `${b.tourist_name} (${b.passenger_count || 1} ta)`).join(', ')})\n\n` +
            `🛣 *Marshrut:* \n${groupBookings[0].locations.map((loc, idx) => `${idx + 1}. ${loc.name_uz || loc.name_en}`).join('\n')}\n\n` +
            `👤 *Gid:* ${finalGuide ? `${finalGuide.full_name} (${finalGuide.phone_number})` : "Gid belgilanmagan"}\n` +
            `🚗 *Haydovchi:* ${finalVehicle.driver_name} (${finalVehicle.driver_phone})\n` +
            `🚘 *Avtomobil:* ${finalVehicle.car_model} (${finalVehicle.car_number})\n\n` +
            `💵 *Buyurtmalar to'lovi:* \n${groupBookings.map(b => `- Buyurtma #${b.id} (${b.tourist_name}): $${parseFloat(b.total_price).toFixed(2)}`).join('\n')}\n\n` +
            `📄 *Tafsilotlar yangilandi. Barcha mijozlarga elektron pochta orqali xabar yuborildi.*`;
        } else {
          tgText = `🌟 *SAMARQAND CRAFTOUR - GURUH TUR (POOLING)* 🌟\n\n` +
            `👥 *Birgalikda sayohat qilish uchun guruh shakllantirildi!*\n\n` +
            `📅 *Sana:* ${groupBookings[0].booking_date}\n` +
            `🌐 *Mijoz tili:* ${language}\n` +
            `👥 *Jami yo'lovchilar:* ${totalPassengers} ta (${groupBookings.map(b => `${b.tourist_name} (${b.passenger_count || 1} ta)`).join(', ')})\n\n` +
            `🛣 *Marshrut:* \n${groupBookings[0].locations.map((loc, idx) => `${idx + 1}. ${loc.name_uz || loc.name_en}`).join('\n')}\n\n` +
            `👤 *Gid:* ${finalGuide ? `${finalGuide.full_name} (${finalGuide.phone_number})` : "Gid belgilanmagan"}\n` +
            `🚗 *Haydovchi:* ${finalVehicle.driver_name} (${finalVehicle.driver_phone})\n` +
            `🚘 *Avtomobil:* ${finalVehicle.car_model} (${finalVehicle.car_number})\n\n` +
            `💵 *Buyurtmalar to'lovi:* \n${groupBookings.map(b => `- Buyurtma #${b.id} (${b.tourist_name}): $${parseFloat(b.total_price).toFixed(2)}`).join('\n')}\n\n` +
            `📄 *Buyurtma tasdiqlandi. Barcha mijozlarga elektron pochta orqali xabar yuborildi.*`;
        }
      } else {
        const b = groupBookings[0];
        tgText = `✨ *SAMARQAND CRAFTOUR - SHAXSIY SAYOHAT* ✨\n\n` +
          `📅 *Sana:* ${b.booking_date}\n` +
          `🌐 *Mijoz tili:* ${language}\n` +
          `👥 *Yo'lovchilar:* ${totalPassengers} ta (${b.tourist_name})\n\n` +
          `🛣 *Marshrut:* \n${b.locations.map((loc, idx) => `${idx + 1}. ${loc.name_uz || loc.name_en}`).join('\n')}\n\n` +
          `👤 *Gid:* ${finalGuide ? `${finalGuide.full_name} (${finalGuide.phone_number})` : "Gid belgilanmagan"}\n` +
          `🚗 *Haydovchi:* ${finalVehicle.driver_name} (${finalVehicle.driver_phone})\n` +
          `🚘 *Avtomobil:* ${finalVehicle.car_model} (${finalVehicle.car_number})\n\n` +
          `💵 *Buyurtma #${b.id} narxi:* $${parseFloat(b.total_price).toFixed(2)}\n\n` +
          `📄 *Buyurtma tasdiqlandi. Mijozga elektron pochta orqali xabar yuborildi.*`;
      }

      // Always print text output to console logs for verification and auditing
      console.log('==========================================');
      console.log('🕌 TELEGRAM NOTIFICATION ALERTS BROADCAST:');
      console.log(tgText);
      console.log('==========================================');

      // Send text message to Telegram bot
      if (botToken && chatId) {
        try {
          const tgRes = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              chat_id: chatId,
              text: tgText,
              parse_mode: 'Markdown'
            })
          });

          if (!tgRes.ok) {
            const errText = await tgRes.text();
            console.error('[Cron Processor] Telegram notification failed:', errText);
          } else {
            console.log(`[Cron Processor] Telegram message successfully sent to chat: ${chatId}`);
          }
        } catch (tgErr) {
          console.error('[Cron Processor] Failed to notify Telegram:', tgErr.message);
        }
      }

      // Send email notifications via Nodemailer SMTP with premium HTML template
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
            const isBookingUz = booking.customer_language === 'UZ';
            const isBookingRu = booking.customer_language === 'RU';
            const emailSubject = isBookingUz
              ? 'Sizning sayohat vaucheringiz - Samarqand CrafTour'
              : isBookingRu
                ? 'Ваш туристический ваучер - Samarqand CrafTour'
                : 'Your Travel Voucher - Samarqand CrafTour';

            const emailHtml = generateEmailHtml(booking, groupBookings, finalGuide, finalVehicle, isGrouped);

            await transporter.sendMail({
              from: `"Samarqand CrafTour" <${smtpUser}>`,
              to: booking.tourist_email,
              subject: emailSubject,
              html: emailHtml
            });
            console.log(`[Cron Processor] Confirmation email successfully sent to: ${booking.tourist_email}`);
          }
        } catch (emailErr) {
          console.error('[Cron Processor] Failed to send email confirmation:', emailErr.message);
        }
      }

      // Synchronize guide and vehicle assignments for all bookings in this pooled group
      const allGroupBookingIds = groupBookings.map(b => b.id);
      if (isDbActive) {
        try {
          const { error: syncErr } = await supabase
            .from('bookings')
            .update({
              guide_id: finalGuide ? finalGuide.id : null,
              vehicle_id: finalVehicle.id
            })
            .in('id', allGroupBookingIds);

          if (syncErr) {
            console.error('[Cron Processor] Failed to sync group guide/vehicle in DB:', syncErr.message);
          } else {
            console.log(`[Cron Processor] Synced Booking IDs [${allGroupBookingIds.join(', ')}] to Guide ID ${finalGuide ? finalGuide.id : null} and Vehicle ID ${finalVehicle.id} in database.`);
          }
        } catch (syncExc) {
          console.error('[Cron Processor] Exception syncing group guide/vehicle:', syncExc.message);
        }
      } else {
        if (global.mockBookingsStore) {
          allGroupBookingIds.forEach(id => {
            const rawMock = global.mockBookingsStore.get(id.toString());
            if (rawMock) {
              rawMock.guide_id = finalGuide ? finalGuide.id : null;
              rawMock.vehicle_id = finalVehicle.id;
              rawMock.guide = finalGuide || null;
              rawMock.vehicle = finalVehicle;
            }
          });
        }
      }

      // Mark processed bookings as notification_sent = true in DB/Memory
      const bookingIdsToMark = newBookingsInGroup.map(b => b.id);
      if (isDbActive) {
        const { error: markErr } = await supabase
          .from('bookings')
          .update({ notification_sent: true })
          .in('id', bookingIdsToMark);

        if (markErr) {
          console.error('[Cron Processor] Failed to update bookings state in DB:', markErr.message);
        } else {
          console.log(`[Cron Processor] Marked Booking IDs [${bookingIdsToMark.join(', ')}] as notification_sent = true in database.`);
        }
      } else {
        if (global.mockBookingsStore) {
          bookingIdsToMark.forEach(id => {
            const rawMock = global.mockBookingsStore.get(id.toString());
            if (rawMock) {
              rawMock.notification_sent = true;
            }
          });
        }
        console.log(`[Cron Processor] Offline Mock mode: Marked Booking IDs [${bookingIdsToMark.join(', ')}] as notification_sent = true in memory.`);
      }

      processedGroupIds.push(...bookingIdsToMark);
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
