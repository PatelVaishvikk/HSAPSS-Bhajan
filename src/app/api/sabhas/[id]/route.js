import { NextResponse } from 'next/server';
import dbConnect from '../../../../lib/mongodb';
import Sabha from '../../../../models/Sabha';
import SabhaSession from '../../../../models/SabhaSession';

export async function GET(request, { params }) {
  try {
    await dbConnect();
    const { id } = await params;
    const sabha = await Sabha.findById(id);
    
    if (!sabha) {
      return NextResponse.json({ error: 'Sabha not found' }, { status: 404 });
    }
    
    return NextResponse.json(sabha);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    await dbConnect();
    const { id } = await params;
    const body = await request.json();
    
    const sabha = await Sabha.findByIdAndUpdate(
      id,
      { name: body.name, description: body.description },
      { new: true }
    );
    
    return NextResponse.json(sabha);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    await dbConnect();
    const { id } = await params;
    
    // Delete the sabha
    await Sabha.findByIdAndDelete(id);
    
    // Also delete all sessions associated with this sabha
    await SabhaSession.deleteMany({ sabhaId: id });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
