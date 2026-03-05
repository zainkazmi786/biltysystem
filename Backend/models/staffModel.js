// models/staffModel.js
import mongoose from 'mongoose';

const staffSchema = new mongoose.Schema({
  name: { type: String, required: true },
  designation: { type: String, required: true },
  wage: { type: Number, required: true },
  phone: { type: String, required: true },
  address: { type: String, required: true },
  image: { type: String }
}, { timestamps: true });

const Staff = mongoose.model('Staff', staffSchema);

export default Staff;