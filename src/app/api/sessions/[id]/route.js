import { NextResponse } from 'next/server';
import dbConnect from '../../../../lib/mongodb';
import SabhaSession from '../../../../models/SabhaSession';
import Bhajan from '../../../../models/Bhajan'; // Ensure Bhajan model is registered

export async function GET(request, { params }) {
  try {
    await dbConnect();
    const { id } = await params;
    
    const session = await SabhaSession.findById(id)
      .populate('bhajans.bhajanId', 'title title_guj lyrics');
      
    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }
    
    return NextResponse.json(session);
  } catch (error) {
    console.error('Error fetching session:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    await dbConnect();
    const { id } = await params;
    const body = await request.json();
    
    const session = await SabhaSession.findByIdAndUpdate(
      id,
      { $set: body },
      { new: true }
    ).populate('bhajans.bhajanId', 'title title_guj');
    
    return NextResponse.json(session);
  } catch (error) {
    console.error('Error updating session:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    await dbConnect();
    const { id } = await params;
    await SabhaSession.findByIdAndDelete(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
