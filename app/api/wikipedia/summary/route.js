import { NextResponse } from 'next/server';

// Server-side in-memory cache to store Wikipedia summaries
// Key: `${lang}:${title}`
const wikiCache = new Map();
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const title = searchParams.get('title');
  const lang = searchParams.get('lang') || 'en';

  if (!title) {
    return NextResponse.json({ error: 'Title parameter is required' }, { status: 400 });
  }

  const cacheKey = `${lang.toLowerCase()}:${title.toLowerCase()}`;
  const now = Date.now();

  // Check if cached copy exists and is not expired
  if (wikiCache.has(cacheKey)) {
    const cached = wikiCache.get(cacheKey);
    if (now - cached.timestamp < CACHE_TTL) {
      return NextResponse.json(cached.data);
    } else {
      wikiCache.delete(cacheKey); // Expired
    }
  }

  try {
    // MediaWiki REST API summary endpoint
    const url = `https://${lang}.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`;
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      },
      next: { revalidate: 86400 } // Next.js level caching (1 day)
    });

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json({ error: 'Wikipedia article not found' }, { status: 404 });
      }
      throw new Error(`Wikipedia API responded with status ${response.status}`);
    }

    const data = await response.json();

    const result = {
      title: data.title || '',
      displaytitle: data.displaytitle || '',
      extract: data.extract || '',
      extract_html: data.extract_html || '',
      description: data.description || '',
      image: data.originalimage?.source || data.thumbnail?.source || null,
      desktopUrl: data.content_urls?.desktop?.page || `https://${lang}.wikipedia.org/wiki/${encodeURIComponent(title)}`,
      lang: lang
    };

    // Cache the result
    wikiCache.set(cacheKey, {
      timestamp: now,
      data: result
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching Wikipedia summary:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch data from Wikipedia', 
      message: error.message 
    }, { status: 500 });
  }
}
