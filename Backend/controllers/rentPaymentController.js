import RentPayment from '../models/rentPaymentModel.js';
import Shop from '../models/shopModel.js';

// Get all rent payments
export const getAllRentPayments = async (req, res) => {
  try {
    const rentPayments = await RentPayment.find()
      .populate('shop', 'name location')
      .sort({ year: -1, month: 1 });
    res.json({ success: true, data: rentPayments });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get rent payments by shop ID
export const getRentPaymentsByShop = async (req, res) => {
  try {
    const rentPayments = await RentPayment.find({ shop: req.params.shopId })
      .populate('shop', 'name location')
      .sort({ year: -1, month: 1 });
    res.json({ success: true, data: rentPayments });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Create a new rent payment
export const createRentPayment = async (req, res) => {
  try {
    const { shop, month, year, amount, paid } = req.body;

    // Check if shop exists
    const shopExists = await Shop.findById(shop);
    if (!shopExists) {
      return res.status(404).json({ success: false, message: 'Shop not found' });
    }

    // Check if payment for this month and year already exists
    const existingPayment = await RentPayment.findOne({ 
      shop, 
      month, 
      year 
    });

    if (existingPayment) {
      return res.status(400).json({ 
        success: false, 
        message: 'Payment for this month and year already exists' 
      });
    }

    const rentPayment = new RentPayment({
      shop,
      month,
      year,
      amount,
      paid: paid || false
    });

    await rentPayment.save();
    
    // Populate shop details before sending response
    await rentPayment.populate('shop', 'name location');
    
    res.status(201).json({ success: true, data: rentPayment });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// Get rent payment by ID
export const getRentPaymentById = async (req, res) => {
  try {
    const rentPayment = await RentPayment.findById(req.params.id)
      .populate('shop', 'name location');
    
    if (!rentPayment) {
      return res.status(404).json({ success: false, message: 'Rent payment not found' });
    }
    res.json({ success: true, data: rentPayment });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Update rent payment
export const updateRentPayment = async (req, res) => {
  try {
    const { month, year, amount, paid } = req.body;
    
    const rentPayment = await RentPayment.findById(req.params.id);
    if (!rentPayment) {
      return res.status(404).json({ success: false, message: 'Rent payment not found' });
    }

    // Check if updating month/year would create a duplicate
    if (month && year) {
      const existingPayment = await RentPayment.findOne({ 
        shop: rentPayment.shop, 
        month, 
        year,
        _id: { $ne: req.params.id } // Exclude current payment
      });

      if (existingPayment) {
        return res.status(400).json({ 
          success: false, 
          message: 'Payment for this month and year already exists' 
        });
      }
    }

    const updatedPayment = await RentPayment.findByIdAndUpdate(
      req.params.id, 
      req.body, 
      { new: true }
    ).populate('shop', 'name location');

    res.json({ success: true, data: updatedPayment });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// Delete rent payment
export const deleteRentPayment = async (req, res) => {
  try {
    const rentPayment = await RentPayment.findByIdAndDelete(req.params.id);
    if (!rentPayment) {
      return res.status(404).json({ success: false, message: 'Rent payment not found' });
    }
    res.json({ success: true, message: 'Rent payment deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}; 