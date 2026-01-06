import mongoose, { Schema, model, models } from 'mongoose';

const BhajanSchema = new Schema(
  {
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
    keywords: { type: [String], default: [] },
  },
  { 
    timestamps: true, 
    collection: 'bhajans' // Explicitly set collection name
  }
);

// Add text index for search
BhajanSchema.index({ title: 'text', title_guj: 'text', lyrics: 'text', catId: 'text', keywords: 'text' });

// In Next.js, models can be cached. In development, we might want to force re-initialization
// to ensure schema changes are applied.
if (process.env.NODE_ENV === 'development') {
  delete models.Bhajan;
}
const Bhajan = models.Bhajan || model('Bhajan', BhajanSchema);

export default Bhajan;
