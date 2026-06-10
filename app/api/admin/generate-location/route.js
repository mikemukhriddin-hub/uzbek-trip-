import { NextResponse } from 'next/server';

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
    const body = await req.json();
    const { query } = body;

    if (!query || query.trim() === '') {
      return NextResponse.json({ message: 'Query parameter is required' }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      console.warn('GEMINI_API_KEY is missing in environment variables. Falling back to mock generation.');
      // Return structured mock data when API key is not set
      const normalizedQuery = query.trim();
      return NextResponse.json({
        message: 'GEMINI_API_KEY not configured. Using mock data.',
        isMock: true,
        data: {
          name_en: `${normalizedQuery}`,
          name_ru: `${normalizedQuery}`,
          name_uz: `${normalizedQuery}`,
          description_en: `This is a mock description for ${normalizedQuery}. Set GEMINI_API_KEY in .env.local to enable real AI generation with coordinates and translations.`,
          description_ru: `Это заглушка описания для ${normalizedQuery}. Установите GEMINI_API_KEY в .env.local для генерации реального контента с координатами и переводами.`,
          description_uz: `Bu ${normalizedQuery} uchun mock tavsif. Koordinatalar va tarjimalar bilan haqiqiy AI yaratishni faollashtirish uchun .env.local faylida GEMINI_API_KEY ni sozlang.`,
          latitude: 39.6548,
          longitude: 66.9757,
          category: 'historical',
          is_out_of_city: false,
          estimated_duration: 90,
          image_url: 'https://images.unsplash.com/photo-1618218168350-6e7c8137558d?auto=format&fit=crop&w=600&q=80',
          ticket_price: 0.00
        }
      });
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

    const prompt = `Generate detailed tourist/dining location information about "${query}" in Samarkand, Uzbekistan. 
Make sure descriptions are detailed and written professionally in English, Russian, and Uzbek languages.
Determine the correct latitude and longitude of the place as accurately as possible. 
For category, choose exactly one of: 'historical', 'alternative', or 'food'.
Decide if it's out of city (is_out_of_city = true) or in the city (is_out_of_city = false).
Provide estimated duration in minutes (estimated_duration).
Determine an estimated entrance ticket price in USD (ticket_price). Use 0.00 for restaurants, parks, or free sites, and realistic prices (e.g. 2.00, 4.50) for museums, mausoleums, and historical monuments.
For image_url, you MUST choose exactly one of the following verified working Unsplash URLs that matches the location category and aesthetic best (do NOT generate new Unsplash IDs as they return 404):
- Registan or premium mosaic tiles: 'https://images.unsplash.com/photo-1618218168350-6e7c8137558d?auto=format&fit=crop&w=600&q=80'
- Gur-e-Amir or ancient dome: 'https://images.unsplash.com/photo-1541432901042-2d8bd64b4a9b?auto=format&fit=crop&w=600&q=80'
- Shah-i-Zinda or mosaic street: 'https://images.unsplash.com/photo-1623940179976-b9952ecbc412?auto=format&fit=crop&w=600&q=80'
- Bibi-Khanym or large mosque: 'https://images.unsplash.com/photo-1605371924599-2c03d64d0dd3?auto=format&fit=crop&w=600&q=80'
- General Uzbek ornament/tiles: 'https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=600&q=80'
- Urgut or generic scenic mountains/nature: 'https://images.unsplash.com/photo-1501555088652-021faa106b9b?auto=format&fit=crop&w=600&q=80'
- Omonqoton or pine forest/hiking: 'https://images.unsplash.com/photo-1473448912268-2022ce9509d8?auto=format&fit=crop&w=600&q=80'
- Konigil Paper Mill or traditional eco-village: 'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?auto=format&fit=crop&w=600&q=80'
- National Osh Center or pilaf/food: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=600&q=80'
- Bread Bakery or bread making: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=600&q=80'
- Karimbek or restaurant dining table/kebabs: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80'
- Teahouse or teacup/drinks: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=600&q=80'`;

    const schema = {
      type: 'OBJECT',
      properties: {
        name_en: { type: 'STRING' },
        name_ru: { type: 'STRING' },
        name_uz: { type: 'STRING' },
        description_en: { type: 'STRING' },
        description_ru: { type: 'STRING' },
        description_uz: { type: 'STRING' },
        latitude: { type: 'NUMBER' },
        longitude: { type: 'NUMBER' },
        category: { type: 'STRING', enum: ['historical', 'alternative', 'food'] },
        is_out_of_city: { type: 'BOOLEAN' },
        estimated_duration: { type: 'INTEGER' },
        image_url: { type: 'STRING' },
        ticket_price: { type: 'NUMBER' }
      },
      required: [
        'name_en', 'name_ru', 'name_uz', 
        'description_en', 'description_ru', 'description_uz', 
        'latitude', 'longitude', 'category', 'is_out_of_city', 
        'estimated_duration', 'image_url', 'ticket_price'
      ]
    };

    const modelsToTry = [
      'gemini-2.5-flash',
      'gemini-2.0-flash',
      'gemini-flash-latest'
    ];

    let response = null;
    let lastError = null;

    for (const model of modelsToTry) {
      try {
        console.log(`Attempting generation with model: ${model}`);
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
        const res = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: prompt
                  }
                ]
              }
            ],
            generationConfig: {
              responseMimeType: 'application/json',
              responseSchema: schema
            }
          })
        });

        if (res.ok) {
          response = res;
          console.log(`Success with model: ${model}`);
          break;
        } else {
          const errText = await res.text();
          console.warn(`Model ${model} returned status ${res.status}: ${errText}`);
          lastError = new Error(`Model ${model} failed: ${res.status} - ${errText}`);
        }
      } catch (err) {
        console.warn(`Error connecting to model ${model}:`, err.message);
        lastError = err;
      }
    }

    if (!response) {
      throw lastError || new Error('All models failed to generate content');
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API Error details:', errorText);
      throw new Error(`Gemini API responded with status ${response.status}: ${errorText}`);
    }

    const resJson = await response.json();
    
    // Extract candidate text from response structure
    const candidateText = resJson.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!candidateText) {
      throw new Error('Invalid response structure from Gemini API');
    }

    const data = JSON.parse(candidateText);

    return NextResponse.json({
      message: 'Location details generated successfully',
      isMock: false,
      data
    });

  } catch (err) {
    console.error('Error in generate-location API:', err);
    return NextResponse.json({ message: 'Internal server error', error: err.message }, { status: 500 });
  }
}
