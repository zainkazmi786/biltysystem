import mongoose from 'mongoose';

const tripSchema = new mongoose.Schema({
  tripNumber: { 
    type: String, 
    required: true,
    unique: true,
    default: function() {
      // You can customize the trip number generation as needed
      return 'TRP-' + Math.random().toString(36).substr(2, 9).toUpperCase();
    }
  },
  driver: { type: mongoose.Schema.Types.ObjectId, ref: 'Driver', required: true },
  vehicle: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle', required: true },
  departureLocation: { type: String, required: true },
  destinationLocation: { type: String, required: true },
  vouchers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Voucher' }],
  // Add more fields as needed (date, fare, etc.)
}, { timestamps: true });
export default mongoose.model('Trip', tripSchema);