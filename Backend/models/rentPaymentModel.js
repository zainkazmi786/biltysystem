import mongoose from 'mongoose';

const rentPaymentSchema = new mongoose.Schema({
  shop: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Shop', 
    required: true 
  },
  month: { 
    type: String, 
    required: true 
  },
  year: { 
    type: Number, 
    required: true 
  },
  amount: { 
    type: Number, 
    required: true 
  },
  paid: { 
    type: Boolean, 
    default: false 
  }
}, { timestamps: true });

export default mongoose.model('RentPayment', rentPaymentSchema); 