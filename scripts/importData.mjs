import axios from 'axios';
import * as cheerio from 'cheerio';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/bhajan-db';
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

const Bhajan = mongoose.models.Bhajan || mongoose.model('Bhajan', BhajanSchema);

async function fetchLyrics(fileName) {
  try {
    const url = `${LYRICS_BASE_URL}${fileName}`;
    console.log(`Fetching lyrics from: ${url}`);
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);
    
    // Extract content from .main or body
    // Based on the sample, it's in <div class="main">
    const lyricsHtml = $('.main').html() || $('body').html() || '';
    return lyricsHtml.trim();
  } catch (error) {
    console.error(`Error fetching lyrics for ${fileName}:`, error.message);
    return '';
  }
}

async function importData() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    const { data } = await axios.get(BHAJAN_DATA_URL);
    const bhajans = data.Prasang;

    console.log(`Found ${bhajans.length} bhajans in JSON`);

    for (const item of bhajans) {
      const existing = await Bhajan.findOne({ lyricsFile: item.lyrics });
      if (existing) {
        console.log(`Skipping ${item.title} (already exists)`);
        continue;
      }

      const lyrics = await fetchLyrics(item.lyrics);
      if (!lyrics) {
        console.log(`Skipping ${item.title} (no lyrics found)`);
        continue;
      }

      const bhajan = new Bhajan({
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

      await bhajan.save();
      console.log(`Imported: ${item.title}`);
      
      // Add a small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    console.log('Import completed!');
  } catch (error) {
    console.error('Import failed:', error);
  } finally {
    await mongoose.disconnect();
  }
}

importData();
