import Shop from '../models/shopModel.js';
import RentPayment from '../models/rentPaymentModel.js';

// Get all shops
export const getAllShops = async (req, res) => {
  try {
    const shops = await Shop.find().sort({ createdAt: -1 });
    res.json({ success: true, data: shops });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Create a new shop
export const createShop = async (req, res) => {
  try {
    const {
      name,
      location,
      size,
      rent,
      tenant,
      status,
      startDate,
      endDate,
      monthlyRent,
      securityDeposit,
      utilities,
      maintenance
    } = req.body;

    const shop = new Shop({
      name,
      location,
      size,
      rent: rent || 0,
      tenant: tenant || '',
      status: status || 'vacant',
      startDate: startDate || '',
      endDate: endDate || '',
      monthlyRent,
      securityDeposit: securityDeposit || 0,
      utilities: utilities || 0,
      maintenance: maintenance || 0
    });

    await shop.save();
    res.status(201).json({ success: true, data: shop });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// Get shop by ID
export const getShopById = async (req, res) => {
  try {
    const shop = await Shop.findById(req.params.id);
    if (!shop) {
      return res.status(404).json({ success: false, message: 'Shop not found' });
    }
    res.json({ success: true, data: shop });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Update shop
export const updateShop = async (req, res) => {
  try {
    const shop = await Shop.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!shop) {
      return res.status(404).json({ success: false, message: 'Shop not found' });
    }
    res.json({ success: true, data: shop });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// Delete shop
export const deleteShop = async (req, res) => {
  try {
    const shop = await Shop.findByIdAndDelete(req.params.id);
    if (!shop) {
      return res.status(404).json({ success: false, message: 'Shop not found' });
    }
    
    // Also delete associated rent payments
    await RentPayment.deleteMany({ shop: req.params.id });
    
    res.json({ success: true, message: 'Shop and associated rent payments deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get shop with rent payments
export const getShopWithRentPayments = async (req, res) => {
  try {
    const shop = await Shop.findById(req.params.id);
    if (!shop) {
      return res.status(404).json({ success: false, message: 'Shop not found' });
    }

    const rentPayments = await RentPayment.find({ shop: req.params.id }).sort({ year: -1, month: 1 });
    
    res.json({ 
      success: true, 
      data: { 
        ...shop.toObject(), 
        rentPayments 
      } 
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}; 