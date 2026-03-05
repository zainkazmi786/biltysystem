import mongoose from 'mongoose';

const financialReportSchema = new mongoose.Schema({
  reportDate: {
    type: Date,
    required: true,
    unique: true, // Only one report per day
    default: () => new Date().setHours(0, 0, 0, 0)
  },
  trips: [{
    tripId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Trip',
      required: true
    },
    expenses: {
      mazdoori: {
        amount: { type: Number, default: 0 },
        description: String
      },
      driverExpenses: {
        amount: { type: Number, default: 0 },
        description: String
      },
      roadExpenses: {
        amount: { type: Number, default: 0 },
        description: String
      },
      loadingUnloadingExpenses: {
        amount: { type: Number, default: 0 },
        description: String
      }
    }
  }],
  staffExpenses: [{
    staffId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Staff',
      required: true
    },
    amount: {
      type: Number,
      required: true
    },
    description: String
  }],
  otherExpenses: [{
    amount: {
      type: Number,
      required: true
    },
    description: {
      type: String,
      required: true
    }
  }],
  notes: String,
  totalTripExpenses: {
    type: Number,
    default: 0
  },
  totalStaffExpenses: {
    type: Number,
    default: 0
  },
  totalOtherExpenses: {
    type: Number,
    default: 0
  },
  grandTotalExpenses: {
    type: Number,
    default: 0
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Pre-save middleware to calculate totals
financialReportSchema.pre('save', function(next) {
  // Calculate total trip expenses
  this.totalTripExpenses = this.trips.reduce((total, trip) => {
    return total + 
      (trip.expenses.mazdoori?.amount || 0) +
      (trip.expenses.driverExpenses?.amount || 0) +
      (trip.expenses.roadExpenses?.amount || 0) +
      (trip.expenses.loadingUnloadingExpenses?.amount || 0);
  }, 0);

  // Calculate total staff expenses
  this.totalStaffExpenses = this.staffExpenses.reduce((total, expense) => {
    return total + (expense.amount || 0);
  }, 0);

  // Calculate total other expenses
  this.totalOtherExpenses = this.otherExpenses.reduce((total, expense) => {
    return total + (expense.amount || 0);
  }, 0);

  // Calculate grand total
  this.grandTotalExpenses = this.totalTripExpenses + this.totalStaffExpenses + this.totalOtherExpenses;

  this.updatedAt = new Date();
  next();
});

const FinancialReport = mongoose.model('FinancialReport', financialReportSchema);

export default FinancialReport;