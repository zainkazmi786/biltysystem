import mongoose from 'mongoose';

const voucherBiltySchema = new mongoose.Schema({
  biltyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Shipment',
    required: true,
  },
  biltyNumber: {
    type: String,
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  }
}, { timestamps: true });

const voucherSchema = new mongoose.Schema({
  voucherNumber: {
    type: String,
    required: true,
    unique: true,
  },

  bilties: [voucherBiltySchema],
  subtotal: {
    type: Number,
    required: true,
    default: 0,
  },
  companyTax: {
    type: Number,
    default: 0,
  },
  taxPercentage: {
    type: Number,
    default: 0,
  },
  totalAmount: {
    type: Number,
    required: true,
    default: 0,
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'card', 'bank_transfer', 'check'],
    default: 'cash',
  },
  paymentStatus: {
    type: String,
    enum: ['paid', 'unpaid', 'partial'],
    default: 'unpaid',
  },
  paidAmount: {
    type: Number,
    default: 0,
  },
  remainingAmount: {
    type: Number,
    default: 0,
  },
  trip_made: {
    type: Boolean,
    default: false,
  },
  notes: {
    type: String,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  }
}, { timestamps: true });

// Pre-save hook to calculate totals
voucherSchema.pre('save', function(next) {
  // Calculate subtotal from bilties
  this.subtotal = this.bilties.reduce((sum, bilty) => sum + bilty.amount, 0);
  
  // Calculate company tax
  if (this.taxPercentage > 0) {
    this.companyTax = (this.subtotal * this.taxPercentage) / 100;
  }
  
  // Calculate total amount
  this.totalAmount = this.subtotal + this.companyTax;
  
  // Calculate remaining amount
  this.remainingAmount = this.totalAmount - this.paidAmount;
  
  next();
});

export default mongoose.model('Voucher', voucherSchema);