import mongoose from 'mongoose';
import axios from 'axios';
import * as cheerio from 'cheerio';
import readline from 'readline';

const BHAJAN_DATA_URL = 'https://huggingface.co/spaces/thejagstudio/connect/resolve/main/extra/bhajanData.json';
const LYRICS_BASE_URL = 'https://huggingface.co/spaces/thejagstudio/MusicStore/raw/main/HTML%20Files/';

const BhajanSchema = new mongoose.Schema({
  title: { type: String, required: true },
  title_guj: { type: String, required: true },
  catId: { type: String, required: true },
  lyricsFile: { type: String, required: true, unique: true },
  lyrics: { type: String, required: true },
  isEng: { type: Boolean, default: false },
  isHnd: { type: Boolean, default: false },
  isGer: { type: Boolean, default: false },
  isAudio: { type: Boolean, default: false },
  audioUrl: { type: String },
}, { timestamps: true });

const SabhaSchema = new mongoose.Schema({
  name: { type: String, required: true },
  location: { type: String, required: true },
  type: { type: String, enum: ['YOUTH', 'PARIVAAR', 'USER_EVENT'], required: true },
  description: { type: String }
}, { timestamps: true, collection: 'sabhas' });

const Bhajan = mongoose.models.Bhajan || mongoose.model('Bhajan', BhajanSchema);
const Sabha = mongoose.models.Sabha || mongoose.model('Sabha', SabhaSchema);

const INITIAL_SABHAS = [
  { name: 'Windsor Youth Sabha', location: 'Windsor', type: 'YOUTH' },
  { name: 'Brampton Youth Sabha', location: 'Brampton', type: 'YOUTH' },
  { name: 'Etobicoke Youth Sabha', location: 'Etobicoke', type: 'YOUTH' },
  { name: 'Sunday Parivaar Sabha', location: 'Global', type: 'PARIVAAR' },
];

async function fetchLyrics(fileName) {
  try {
    const url = `${LYRICS_BASE_URL}${fileName}`;
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);
    const lyricsHtml = $('.main').html() || $('body').html() || '';
    
    // Clean lyrics immediately
    return lyricsHtml
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<[^>]+>/g, '')
      .replace(/&nbsp;/g, ' ')
      .trim();
  } catch (error) {
    return '';
  }
}

const runSeed = async (uri) => {
  if (!uri) {
    console.error('URI is required!');
    process.exit(1);
  }

  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(uri.trim());
    console.log('Connected!');

    // 1. Seed Sabhas
    console.log('Seeding Sabhas...');
    await Sabha.deleteMany({ type: { $in: ['YOUTH', 'PARIVAAR'] } }); // Only delete default ones
    await Sabha.insertMany(INITIAL_SABHAS);
    console.log('Sabhas seeded.');

    // 2. Seed Bhajans
    console.log('Fetching Bhajan Data...');
    const { data } = await axios.get(BHAJAN_DATA_URL);
    const bhajans = data.Prasang;
    console.log(`Found ${bhajans.length} bhajans.`);

    let count = 0;
    for (const item of bhajans) {
      const existing = await Bhajan.findOne({ lyricsFile: item.lyrics });
      if (existing) {
        process.stdout.write('.');
        continue;
      }

      const lyrics = await fetchLyrics(item.lyrics);
      if (!lyrics) continue;

      await Bhajan.create({
        title: item.title,
        title_guj: item.title_guj,
        catId: item.CatId,
        lyricsFile: item.lyrics,
        lyrics: lyrics,
        isEng: item.isEng,
        isHnd: item.isHnd,
        isGer: item.isGer,
        isAudio: item.isAudio,
        audioUrl: item.audio_url,
      });
      process.stdout.write('+');
      count++;
      await new Promise(r => setTimeout(r, 50)); // Rate limit
    }

    console.log(`\nSuccessfully imported ${count} new bhajans.`);
    console.log('Done! Your production database is ready.');

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
};

if (process.argv[2]) {
  runSeed(process.argv[2]);
} else {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  rl.question('Please paste your MongoDB Atlas connection string (e.g., mongodb+srv://...): ', (uri) => {
    rl.close();
    runSeed(uri);
  });
}
