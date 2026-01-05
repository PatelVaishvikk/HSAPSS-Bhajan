import mongoose from 'mongoose';

const { Schema, model, models } = mongoose;

const MONGODB_URI = 'mongodb://127.0.0.1:27017/bhajan-db';

const BhajanSchema = new Schema({
  title: { type: String, required: true },
  title_guj: { type: String, required: true },
  lyrics: { type: String, required: true },
  // ... other fields
}, { strict: false });

const Bhajan = models.Bhajan || model('Bhajan', BhajanSchema);

async function cleanLyrics() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    const bhajans = await Bhajan.find({});
    console.log(`Found ${bhajans.length} bhajans to check.`);

    let updatedCount = 0;

    for (const bhajan of bhajans) {
      let cleanLyrics = bhajan.lyrics;

      // 1. Replace <br> variants with newlines
      cleanLyrics = cleanLyrics.replace(/<br\s*\/?>/gi, '\n');

      // 2. Remove specific div tags but keep content if needed (usually title is repeated)
      // The user showed <div class="gtitlev3">...</div> and <div class="gparabhajan3">...</div>
      // We often want to just strip the tags and keep the text, 
      // BUT the title div often duplicates the title. 
      // Let's try to strip all tags first.
      
      // Remove the title div entirely if it duplicates the title field? 
      // The user's example shows the title inside `gtitlev3`.
      // Let's just strip all HTML tags.
      cleanLyrics = cleanLyrics.replace(/<[^>]+>/g, '');

      // 3. Decode HTML entities
      cleanLyrics = cleanLyrics
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"');

      // 4. Clean up multiple newlines and whitespace
      cleanLyrics = cleanLyrics
        .replace(/\n\s*\n/g, '\n\n') // Max 2 newlines
        .replace(/[ \t]+/g, ' ')     // Collapse spaces
        .trim();

      // 5. Remove the "*****" at the end if present (from user example)
      cleanLyrics = cleanLyrics.replace(/\*+\s*$/, '');

      if (cleanLyrics !== bhajan.lyrics) {
        await Bhajan.updateOne({ _id: bhajan._id }, { lyrics: cleanLyrics });
        updatedCount++;
        // console.log(`Cleaned: ${bhajan.title}`);
      }
    }

    console.log(`Successfully cleaned ${updatedCount} bhajans.`);

    await mongoose.disconnect();
    console.log('Disconnected');
  } catch (error) {
    console.error('Error cleaning lyrics:', error);
    process.exit(1);
  }
}

cleanLyrics();
