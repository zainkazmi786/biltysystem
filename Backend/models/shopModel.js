import mongoose from 'mongoose';

const shopSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true 
  },
  location: { 
    type: String, 
    required: true 
  },
  size: { 
    type: String, 
    required: true 
  },
  rent: { 
    type: Number, 
    default: 0 
  },
  tenant: { 
    type: String, 
    default: '' 
  },
  status: { 
    type: String, 
    enum: ['occupied', 'vacant', 'under-renovation'], 
    default: 'vacant' 
  },
  startDate: { 
    type: String, 
    default: '' 
  },
  endDate: { 
    type: String, 
    default: '' 
  },
  monthlyRent: { 
    type: Number, 
    required: true 
  },
  securityDeposit: { 
    type: Number, 
    default: 0 
  },
  utilities: { 
    type: Number, 
    default: 0 
  },
  maintenance: { 
    type: Number, 
    default: 0 
  }
}, { timestamps: true });

export default mongoose.model('Shop', shopSchema); 