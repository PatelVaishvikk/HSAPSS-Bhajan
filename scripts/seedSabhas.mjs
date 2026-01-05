import mongoose from 'mongoose';

const { Schema, model, models } = mongoose;

const MONGODB_URI = 'mongodb://127.0.0.1:27017/bhajan-db';

const SabhaSchema = new Schema(
  {
    name: { type: String, required: true },
    location: { type: String, required: true },
    type: { 
      type: String, 
      enum: ['YOUTH', 'PARIVAAR', 'USER_EVENT'], 
      required: true 
    },
    description: { type: String }
  },
  { 
    timestamps: true,
    collection: 'sabhas'
  }
);

const Sabha = models.Sabha || model('Sabha', SabhaSchema);

const INITIAL_SABHAS = [
  { name: 'Windsor Youth Sabha', location: 'Windsor', type: 'YOUTH' },
  { name: 'Brampton Youth Sabha', location: 'Brampton', type: 'YOUTH' },
  { name: 'Etobicoke Youth Sabha', location: 'Etobicoke', type: 'YOUTH' },
  { name: 'Sunday Parivaar Sabha', location: 'Global', type: 'PARIVAAR' },
];

async function seedSabhas() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing sabhas
    await Sabha.deleteMany({});
    console.log('Cleared existing sabhas');

    const result = await Sabha.insertMany(INITIAL_SABHAS);
    console.log(`Seeded ${result.length} sabhas successfully`);

    await mongoose.disconnect();
    console.log('Disconnected');
  } catch (error) {
    console.error('Error seeding sabhas:', error);
    process.exit(1);
  }
}

seedSabhas();
