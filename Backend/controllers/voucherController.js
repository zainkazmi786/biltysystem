import Voucher from '../models/voucherModel.js';
import Shipment from '../models/shipmentModel.js';

// Create new voucher
export const createVoucher = async (req, res) => {
  try {
    const voucherData = req.body;
    

    // Validate bilties exist
    if (!Array.isArray(voucherData.bilties) || voucherData.bilties.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'At least one bilty must be selected'
      });
    }

    // Generate voucher number if not provided
    if (!voucherData.voucherNumber) {
      const date = new Date();
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
      voucherData.voucherNumber = `VCH-${year}-${month}${day}-${random}`;
    }

    // Check if voucher number already exists
    const existingVoucher = await Voucher.findOne({ voucherNumber: voucherData.voucherNumber });
    if (existingVoucher) {
      return res.status(400).json({
        success: false,
        message: 'Voucher number already exists'
      });
    }

    // Verify bilties exist and get their data
    const biltyIds = voucherData.bilties.map(b => b.biltyId);
    const shipments = await Shipment.find({ _id: { $in: biltyIds } });
    
    if (shipments.length !== biltyIds.length) {
      return res.status(400).json({
        success: false,
        message: 'Some bilties not found'
      });
    }

    // Check if any bilty is already used in a voucher
    const usedBilties = shipments.filter(shipment => shipment.voucher_made);
    if (usedBilties.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Bilties ${usedBilties.map(b => b.biltyNumber).join(', ')} are already used in vouchers`
      });
    }

    // Add createdBy field
    voucherData.createdBy = req.user._id;

    const voucher = new Voucher(voucherData);
    await voucher.save();

    // Mark bilties as used in voucher
    await Shipment.updateMany(
      { _id: { $in: biltyIds } },
      { voucher_made: true }
    );

    // Populate the voucher with all shipment details needed by the frontend
    await voucher.populate({
      path: 'bilties.biltyId',
      select: 'biltyNumber senderName addaName cityName receiverName dateTime items totalFare totalCharges receivedFare remainingFare',
    });

    res.status(201).json({
      success: true,
      message: 'Voucher created successfully',
      data: voucher
    });

  } catch (error) {
    console.error('Error creating voucher:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating voucher',
      error: error.message
    });
  }
};

// Get all vouchers
export const getVouchers = async (req, res) => {
  try {
    const { search, status, paymentMethod } = req.query;
    
    let filter = {};
    
    // Search filter
    if (search) {
      filter.$or = [
        { voucherNumber: { $regex: search, $options: 'i' } },
        { customerName: { $regex: search, $options: 'i' } },
        { customerPhone: { $regex: search, $options: 'i' } },
        { customerEmail: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Status filter
    if (status && status !== 'all') {
      filter.paymentStatus = status;
    }
    
    // Payment method filter
    if (paymentMethod && paymentMethod !== 'all') {
      filter.paymentMethod = paymentMethod;
    }

    const vouchers = await Voucher.find(filter)
      .populate('bilties.biltyId', 'biltyNumber senderName addaName cityName receiverName dateTime items totalFare totalCharges receivedFare remainingFare')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: vouchers
    });

  } catch (error) {
    console.error('Error fetching vouchers:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching vouchers',
      error: error.message
    });
  }
};

// Get single voucher by ID
export const getVoucherById = async (req, res) => {
  try {
    const { id } = req.params;

    const voucher = await Voucher.findById(id)
      .populate('bilties.biltyId')
      .populate('createdBy', 'name email');

    if (!voucher) {
      return res.status(404).json({
        success: false,
        message: 'Voucher not found'
      });
    }

    res.status(200).json({
      success: true,
      data: voucher
    });

  } catch (error) {
    console.error('Error fetching voucher:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching voucher',
      error: error.message
    });
  }
};

// Update voucher
export const updateVoucher = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const voucher = await Voucher.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('bilties.biltyId').populate('createdBy', 'name email');

    if (!voucher) {
      return res.status(404).json({
        success: false,
        message: 'Voucher not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Voucher updated successfully',
      data: voucher
    });

  } catch (error) {
    console.error('Error updating voucher:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating voucher',
      error: error.message
    });
  }
};

// Delete voucher
export const deleteVoucher = async (req, res) => {
  try {
    const { id } = req.params;

    const voucher = await Voucher.findByIdAndDelete(id);

    if (!voucher) {
      return res.status(404).json({
        success: false,
        message: 'Voucher not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Voucher deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting voucher:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting voucher',
      error: error.message
    });
  }
};

// Get available vouchers for trips (not yet added to a trip)
export const getAvailableVouchersForTrip = async (req, res) => {
  try {
    const vouchers = await Voucher.find({ trip_made: false })
      .sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      data: vouchers
    });
  } catch (error) {
    console.error('Error fetching available vouchers for trip:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching available vouchers for trip',
      error: error.message
    });
  }
};