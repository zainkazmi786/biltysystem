import mongoose from 'mongoose';

const driverSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true },
  address: { type: String, required: true }
}, { timestamps: true });

export default mongoose.model('Driver', driverSchema);