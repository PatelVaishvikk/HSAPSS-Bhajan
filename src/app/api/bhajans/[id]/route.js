import { NextResponse } from 'next/server';
import dbConnect from '../../../../lib/mongodb';
import Bhajan from '../../../../models/Bhajan';

export async function GET(request, { params }) {
  try {
    await dbConnect();
    const { id } = await params;
    const bhajan = await Bhajan.findById(id);
    if (!bhajan) {
      return NextResponse.json({ error: 'Bhajan not found' }, { status: 404 });
    }
    return NextResponse.json(bhajan);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    await dbConnect();
    const { id } = await params;
    const body = await request.json();

    const bhajan = await Bhajan.findById(id);
    if (!bhajan) {
      return NextResponse.json({ error: 'Bhajan not found' }, { status: 404 });
    }

    if (bhajan.catId !== 'user-added') {
      return NextResponse.json({ error: 'Only community bhajans can be edited' }, { status: 403 });
    }

    // Clean lyrics if provided
    if (body.lyrics) {
      body.lyrics = body.lyrics
        .replace(/<br\s*\/?>/gi, '\n')
        .replace(/<[^>]+>/g, '')
        .replace(/&nbsp;/g, ' ')
        .trim();
    }

    // Update fields
    bhajan.title = body.title || bhajan.title;
    bhajan.title_guj = body.title_guj || bhajan.title_guj;
    bhajan.lyrics = body.lyrics || bhajan.lyrics;
    // Allow updating audio status if needed, though usually handled via file upload which is not yet implemented for edit
    if (typeof body.isAudio !== 'undefined') bhajan.isAudio = body.isAudio;
    
    await bhajan.save();

    return NextResponse.json(bhajan);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    await dbConnect();
    const { id } = await params;
    
    const bhajan = await Bhajan.findById(id);
    if (!bhajan) {
      return NextResponse.json({ error: 'Bhajan not found' }, { status: 404 });
    }

    if (bhajan.catId !== 'user-added') {
      return NextResponse.json({ error: 'Only community bhajans can be deleted' }, { status: 403 });
    }

    await Bhajan.findByIdAndDelete(id);

    return NextResponse.json({ message: 'Bhajan deleted successfully' });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
