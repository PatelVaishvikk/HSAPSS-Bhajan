import mongoose from 'mongoose';

const { Schema, model, models } = mongoose;

const MONGODB_URI = 'mongodb://127.0.0.1:27017/bhajan-db';

const SabhaSchema = new Schema({}, { strict: false, collection: 'sabhas' });
const Sabha = models.Sabha || model('Sabha', SabhaSchema);

async function renameSabha() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    const result = await Sabha.updateOne(
      { type: 'PARIVAAR' },
      { $set: { name: 'Sunday Parivaar Sabha' } }
    );

    if (result.modifiedCount > 0) {
      console.log('Successfully renamed Parivaar Sabha.');
    } else {
      console.log('No Parivaar Sabha found or name already updated.');
    }

    await mongoose.disconnect();
    console.log('Disconnected');
  } catch (error) {
    console.error('Error renaming sabha:', error);
    process.exit(1);
  }
}

renameSabha();
