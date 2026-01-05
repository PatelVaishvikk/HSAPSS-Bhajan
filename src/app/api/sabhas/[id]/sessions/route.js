import { NextResponse } from 'next/server';
import dbConnect from '../../../../../lib/mongodb';
import SabhaSession from '../../../../../models/SabhaSession';

export async function GET(request, { params }) {
  try {
    await dbConnect();
    const { id } = await params;
    
    // Get upcoming sessions by default, or all if specified
    const sessions = await SabhaSession.find({ sabhaId: id })
      .sort({ date: 1 })
      .populate('bhajans.bhajanId', 'title title_guj');
      
    return NextResponse.json(sessions);
  } catch (error) {
    console.error('Error fetching sessions:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request, { params }) {
  try {
    await dbConnect();
    const { id } = await params;
    const body = await request.json();
    
    const session = await SabhaSession.create({
      sabhaId: id,
      date: new Date(body.date),
      status: 'UPCOMING',
      bhajans: []
    });
    
    return NextResponse.json(session);
  } catch (error) {
    console.error('Error creating session:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
