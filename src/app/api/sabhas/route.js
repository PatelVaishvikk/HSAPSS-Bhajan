import { NextResponse } from 'next/server';
import dbConnect from '../../../lib/mongodb';
import Sabha from '../../../models/Sabha';

export async function GET() {
  try {
    await dbConnect();
    const sabhas = await Sabha.find({}).sort({ type: 1, location: 1 });
    return NextResponse.json(sabhas);
  } catch (error) {
    console.error('Error fetching sabhas:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    await dbConnect();
    const body = await request.json();
    
    const sabha = await Sabha.create({
      name: body.name,
      location: 'User Event',
      type: 'USER_EVENT',
      description: body.description
    });
    
    return NextResponse.json(sabha);
  } catch (error) {
    console.error('Error creating sabha:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
