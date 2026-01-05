import mongoose, { Schema, model, models } from 'mongoose';

const SessionBhajanSchema = new Schema({
  bhajanId: { type: Schema.Types.ObjectId, ref: 'Bhajan', required: true },
  order: { type: Number, required: true },
  note: { type: String } // Optional note for the singer/musicians
});

const SabhaSessionSchema = new Schema(
  {
    sabhaId: { type: Schema.Types.ObjectId, ref: 'Sabha', required: true },
    date: { type: Date, required: true },
    bhajans: [SessionBhajanSchema],
    status: { 
      type: String, 
      enum: ['UPCOMING', 'COMPLETED', 'CANCELLED'], 
      default: 'UPCOMING' 
    },
    notes: { type: String }
  },
  { 
    timestamps: true,
    collection: 'sabha_sessions'
  }
);

// Prevent model recompilation error in development
if (process.env.NODE_ENV === 'development') {
  delete models.SabhaSession;
}

const SabhaSession = models.SabhaSession || model('SabhaSession', SabhaSessionSchema);

export default SabhaSession;
