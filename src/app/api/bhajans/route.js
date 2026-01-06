import { NextResponse } from 'next/server';
import dbConnect from '../../../lib/mongodb';
import Bhajan from '../../../models/Bhajan';

export async function GET(request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const category = searchParams.get('category');

    let filter = {};
    if (query) {
      filter.$or = [
        { title: { $regex: query, $options: 'i' } },
        { title_guj: { $regex: query, $options: 'i' } },
        { lyrics: { $regex: query, $options: 'i' } },
        { keywords: { $in: [new RegExp(query, 'i')] } },
      ];
    }
    if (category && category !== 'all') {
      filter.catId = category;
    }

    const isFull = searchParams.get('full') === 'true';

    let queryBuilder = Bhajan.find(filter).sort({ title: 1 });
    
    if (!isFull) {
      // We still exclude lyrics to keep payload light, but we MUST return all titles for the directory
      // The user explicitly asked for 'All' to show 'all the bhajans'
      queryBuilder = queryBuilder.select('-lyrics'); 
    }

    const bhajans = await queryBuilder;
    return NextResponse.json(bhajans);
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    await dbConnect();
    const body = await request.json();
    
    // Clean lyrics to remove any HTML tags
    if (body.lyrics) {
      body.lyrics = body.lyrics
        .replace(/<br\s*\/?>/gi, '\n')
        .replace(/<[^>]+>/g, '')
        .replace(/&nbsp;/g, ' ')
        .trim();
    }
    
    if (!body.title || !body.title_guj || !body.lyrics) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (!body.lyricsFile) {
      body.lyricsFile = `user_${Date.now()}.html`;
    }

    const bhajan = await Bhajan.create(body);
    return NextResponse.json(bhajan, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
