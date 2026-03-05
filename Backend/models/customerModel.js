import mongoose from 'mongoose';

const biltySchema = new mongoose.Schema({
  biltyNumber: {
    type: String,
    required: true,
    trim: true,
  },
  amount_to_be_paid: {
    type: Number,
    required: true,
    default: 0,
  },
  payment_status: {
    type: String,
    enum: ['paid', 'unpaid'],
    default: 'unpaid',
  },
  paid_by_customer: {
    type: Number,
    default: 0,
  }
}, { _id: false });

const customerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  bilties: {
    type: [biltySchema],
    default: [],
  },
  address: {
    type: String,
    trim: true,
  },
  phone: {
    type: String,
    trim: true,
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active',
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for total amount due (calculated from bilties)
customerSchema.virtual('totalAmountDue').get(function() {
  return this.bilties.reduce((total, bilty) => {
    return total + (bilty.payment_status === 'unpaid' ? bilty.amount_to_be_paid : 0);
  }, 0);
});

// Virtual for payment completion status
customerSchema.virtual('isFullyPaid').get(function() {
  return this.totalAmountDue <= 0;
});

// Virtual for payment completion percentage
customerSchema.virtual('paymentPercentage').get(function() {
  const totalAmount = this.bilties.reduce((total, bilty) => total + bilty.amount_to_be_paid, 0);
  if (totalAmount === 0) return 100;
  const paidAmount = totalAmount - this.totalAmountDue;
  return Math.round((paidAmount / totalAmount) * 100);
});

// Pre-save middleware to ensure data consistency
customerSchema.pre('save', function(next) {
  // We're allowing duplicate bilty numbers within a customer
  // The uniqueness check is removed to allow customers to have multiple bilties with the same number
  next();
});

// Index for faster queries
customerSchema.index({ name: 1 });
customerSchema.index({ phone: 1 });
customerSchema.index({ status: 1 });
customerSchema.index({ createdBy: 1 });
customerSchema.index({ 'bilties.biltyNumber': 1 });

export default mongoose.model('Customer', customerSchema);