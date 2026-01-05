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
