import mongoose from 'mongoose';

const vehicleSchema = new mongoose.Schema({
  number: { type: String, required: true },
  type: { type: String, required: true },
  model: { type: String, required: true }
}, { timestamps: true });

export default mongoose.model('Vehicle', vehicleSchema);