import { Schema, model } from 'mongoose';

const claimSchema = new Schema({
  biltyNumber: {
    type: String,
    required: true,
    unique: true
  },
  claimDate: {
    type: Date,
    required: true
  },
  solvingDate: {
    type: Date
  },
  solvingDuration: {
    type: Number,
    default: 0
  },
  amount: {
    type: Number,
    required: true
  },
  numberOfInstallments: {
    type: Number,
    default: 1
  },
  relatedDocument: {
    type: String
  },
  status: {
    type: String,
    enum: ['pending', 'in-progress', 'resolved', 'rejected'],
    default: 'pending'
  },
  description: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

export default model('Claim', claimSchema);