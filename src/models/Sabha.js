import mongoose, { Schema, model, models } from 'mongoose';

const SabhaSchema = new Schema(
  {
    name: { type: String, required: true }, // e.g., "Youth Sabha", "Parivaar Sabha"
    location: { type: String, required: true }, // e.g., "Windsor", "Brampton"
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

// Prevent model recompilation error in development
if (process.env.NODE_ENV === 'development') {
  delete models.Sabha;
}

const Sabha = models.Sabha || model('Sabha', SabhaSchema);

export default Sabha;
