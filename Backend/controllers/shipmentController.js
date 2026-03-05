import Shipment from '../models/shipmentModel.js';
import Customer from '../models/customerModel.js';

// Helper function to generate bilty number
const generateBiltyNumber = async () => {
  // Get current date in YYYYMMDD format
  const today = new Date();
  const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');
  
  // Find the highest serial number for today
  const latestShipment = await Shipment.findOne({
    biltyNumber: { $regex: `BLT-${dateStr}-` }
  }).sort({ biltyNumber: -1 });
  
  let serialNumber = 1;
  if (latestShipment) {
    // Extract the serial number from the latest bilty number
    const parts = latestShipment.biltyNumber.split('-');
    if (parts.length === 3) {
      const lastSerialNumber = parseInt(parts[2]);
      if (!isNaN(lastSerialNumber)) {
        serialNumber = lastSerialNumber + 1;
      }
    }
  }
  
  // Format: BLT-YYYYMMDD-SerialNumber
  return `BLT-${dateStr}-${serialNumber}`;
};

// Create new shipment
export const createShipment = async (req, res) => {
  try {
    const shipmentData = req.body;
    console.log(shipmentData);
    
    // Validate required fields (except biltyNumber which will be auto-generated)
    if (!shipmentData.senderName || !shipmentData.receiverName) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    // Auto-generate bilty number
    shipmentData.biltyNumber = await generateBiltyNumber();

    // Add createdBy field
    shipmentData.createdBy = req.user._id;

    const shipment = new Shipment(shipmentData);
    await shipment.save();

    // Transform _id to id for frontend compatibility
    const shipmentObj = shipment.toObject();
    shipmentObj.id = shipmentObj._id;
    delete shipmentObj._id;

    // --- Auto-create/update Customer from receiver info ---
    try {
      // Check if customer exists with same name and phone
      let customer = await Customer.findOne({ 
        name: shipment.receiverName,
        phone: shipment.receiverPhone 
      });

      if (!customer) {
        // Create new customer
        const customerData = {
          name: shipment.receiverName,
          phone: shipment.receiverPhone,
          address: shipment.receiverAddress,
          bilties: [{
            biltyNumber: shipment.biltyNumber,
            amount_to_be_paid: shipment.remainingFare || 0,
            payment_status: shipment.paymentStatus === 'paid' ? 'paid' : 'unpaid',
            paid_by_customer: shipment.paymentStatus === 'paid' ? (shipment.remainingFare || 0) : 0
          }],
          createdBy: req.user._id
        };
        customer = new Customer(customerData);
        await customer.save();
      } else {
        // Check if bilty already exists for this customer
        const existingBilty = customer.bilties.find(b => b.biltyNumber === shipment.biltyNumber);
        if (!existingBilty) {
          // Add bilty to existing customer
          customer.bilties.push({
            biltyNumber: shipment.biltyNumber,
            amount_to_be_paid: shipment.remainingFare || 0,
            payment_status: shipment.paymentStatus === 'paid' ? 'paid' : 'unpaid',
            paid_by_customer: shipment.paymentStatus === 'paid' ? (shipment.remainingFare || 0) : 0
          });
          await customer.save();
        }
      }
    } catch (err) {
      console.error('Error auto-creating/updating customer:', err.message);
    }
    // --- End auto-create/update customer ---

    res.status(201).json({
      success: true,
      message: 'Shipment created successfully',
      data: shipmentObj
    });

  } catch (error) {
    console.error('Error creating shipment:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating shipment',
      error: error.message
    });
  }
};

// Get all shipments
export const getShipments = async (req, res) => {
  try {
    const { search, status, paymentStatus } = req.query;
    
    const filter = {};
    
    if (search) {
      filter.$or = [
        { biltyNumber: { $regex: search, $options: 'i' } },
        { senderName: { $regex: search, $options: 'i' } },
        { receiverName: { $regex: search, $options: 'i' } }
      ];
    }

    if (status && status !== 'all') {
      filter.deliveryStatus = status;
    }

    if (paymentStatus && paymentStatus !== 'all') {
      filter.paymentStatus = paymentStatus;
    }

    const shipments = await Shipment.find(filter)
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    // Transform _id to id for frontend compatibility
    const transformedShipments = shipments.map(shipment => {
      const shipmentObj = shipment.toObject();
      shipmentObj.id = shipmentObj._id;
      delete shipmentObj._id;
      return shipmentObj;
    });

    res.status(200).json({
      success: true,
      data: transformedShipments
    });

  } catch (error) {
    console.error('Error fetching shipments:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching shipments',
      error: error.message
    });
  }
};

// Get single shipment
export const getShipmentById = async (req, res) => {
  try {
    const { id } = req.params;
    const shipment = await Shipment.findById(id).populate('createdBy', 'name email');

    if (!shipment) {
      return res.status(404).json({
        success: false,
        message: 'Shipment not found'
      });
    }

    // Transform _id to id for frontend compatibility
    const shipmentObj = shipment.toObject();
    shipmentObj.id = shipmentObj._id;
    delete shipmentObj._id;

    res.status(200).json({
      success: true,
      data: shipmentObj
    });

  } catch (error) {
    console.error('Error fetching shipment:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching shipment',
      error: error.message
    });
  }
};

// Update shipment
export const updateShipment = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };

    // If payment status is being updated to paid, set paid_by_customer
    if (updateData.paymentStatus === 'paid') {
      const shipment = await Shipment.findById(id);
      if (shipment) {
        // Calculate the amount that was remaining before marking as paid
        const remainingAmount = shipment.totalCharges - (shipment.receivedFare || 0);
        updateData.paid_by_customer = remainingAmount;
        updateData.remainingFare = 0; // Ensure remainingFare is set to 0
      }
    }

    const updatedShipment = await Shipment.findByIdAndUpdate(id, updateData, { new: true });

    if (!updatedShipment) {
      return res.status(404).json({
        success: false,
        message: 'Shipment not found'
      });
    }

    // Transform _id to id for frontend compatibility
    const shipmentObj = updatedShipment.toObject();
    shipmentObj.id = shipmentObj._id;
    delete shipmentObj._id;

    res.status(200).json({
      success: true,
      message: 'Shipment updated successfully',
      data: shipmentObj
    });

  } catch (error) {
    console.error('Error updating shipment:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating shipment',
      error: error.message
    });
  }
};

// Delete shipment
export const deleteShipment = async (req, res) => {
  try {
    const { id } = req.params;
    const shipment = await Shipment.findByIdAndDelete(id);

    if (!shipment) {
      return res.status(404).json({
        success: false,
        message: 'Shipment not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Shipment deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting shipment:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting shipment',
      error: error.message
    });
  }
};

// Get shipment statistics
export const getShipmentStats = async (req, res) => {
  try {
    const stats = await Shipment.aggregate([
      {
        $group: {
          _id: null,
          totalShipments: { $sum: 1 },
          totalFare: { $sum: '$totalFare' },
          totalReceived: { $sum: '$receivedFare' },
          totalRemaining: { $sum: '$remainingFare' },
          avgFare: { $avg: '$totalFare' }
        }
      }
    ]);

    const statusStats = await Shipment.aggregate([
      {
        $group: {
          _id: '$deliveryStatus',
          count: { $sum: 1 }
        }
      }
    ]);

    const paymentStats = await Shipment.aggregate([
      {
        $group: {
          _id: '$paymentStatus',
          count: { $sum: 1 }
        }
      }
    ]);

    const monthlyStats = await Shipment.aggregate([
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 },
          totalFare: { $sum: '$totalFare' }
        }
      },
      { $sort: { '_id.year': -1, '_id.month': -1 } },
      { $limit: 12 }
    ]);

    res.status(200).json({
      success: true,
      data: {
        overview: stats[0] || {
          totalShipments: 0,
          totalFare: 0,
          totalReceived: 0,
          totalRemaining: 0,
          avgFare: 0
        },
        statusBreakdown: statusStats,
        paymentBreakdown: paymentStats,
        monthlyTrends: monthlyStats
      }
    });

  } catch (error) {
    console.error('Error fetching shipment stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching shipment statistics',
      error: error.message
    });
  }
};

// Generate bilty number API endpoint (renamed to avoid conflict with helper function)
export const getBiltyNumber = async (req, res) => {
  try {
    // Use the helper function to generate the bilty number
    const biltyNumber = await generateBiltyNumber();

    res.status(200).json({
      success: true,
      data: { biltyNumber }
    });

  } catch (error) {
    console.error('Error generating bilty number:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating bilty number',
      error: error.message
    });
  }
};

// Recalculate totals for existing shipments (utility function)
export const recalculateShipmentTotals = async (req, res) => {
  try {
    const shipments = await Shipment.find({});
    let updatedCount = 0;
    let itemsFixed = 0;

    for (const shipment of shipments) {
      let shipmentChanged = false;
      
      // First, fix individual item totals
      shipment.items.forEach(item => {
        const correctItemTotal = (item.quantity || 0) * (item.unitFare || 0);
        if (item.totalFare !== correctItemTotal) {
          console.log(`Fixing item in ${shipment.biltyNumber}: ${item.totalFare} → ${correctItemTotal}`);
          item.totalFare = correctItemTotal;
          shipmentChanged = true;
          itemsFixed++;
        }
      });
      
      // Calculate total fare from items
      const calculatedTotalFare = shipment.items.reduce((sum, item) => sum + (item.totalFare || 0), 0);
      
      // Check if shipment total needs updating
      if (shipment.totalFare !== calculatedTotalFare) {
        console.log(`Fixing shipment ${shipment.biltyNumber}: totalFare ${shipment.totalFare} → ${calculatedTotalFare}`);
        shipment.totalFare = calculatedTotalFare;
        shipmentChanged = true;
      }
      
      // Recalculate remaining fare
      const totalCharges = shipment.totalFare + (shipment.mazdoori || 0) + (shipment.biltyCharges || 0) + (shipment.reriCharges || 0) + (shipment.extraCharges || 0);
      const correctRemainingFare = totalCharges - (shipment.receivedFare || 0);
      
      if (shipment.remainingFare !== correctRemainingFare) {
        shipment.remainingFare = correctRemainingFare;
        shipmentChanged = true;
      }
      
      // Save if anything changed
      if (shipmentChanged) {
        await shipment.save();
        updatedCount++;
      }
    }

    res.status(200).json({
      success: true,
      message: `Recalculated totals for ${updatedCount} shipments and fixed ${itemsFixed} items`,
      totalShipments: shipments.length,
      updatedShipments: updatedCount,
      itemsFixed: itemsFixed
    });

  } catch (error) {
    console.error('Error recalculating shipment totals:', error);
    res.status(500).json({
      success: false,
      message: 'Error recalculating shipment totals',
      error: error.message
    });
  }
};

// Get available bilties for vouchers (not used in vouchers yet)
export const getAvailableBiltiesForVouchers = async (req, res) => {
  try {
    const { showOnlyUnpaid = 'true' } = req.query;
    
    let filter = { voucher_made: false };
    
    // If showOnlyUnpaid is true, only show unpaid bilties
    if (showOnlyUnpaid === 'true') {
      filter.paymentStatus = 'unpaid';
      filter.remainingFare = { $gt: 0 };
    }

    const shipments = await Shipment.find(filter)
      .select('biltyNumber senderName receiverName totalFare remainingFare receivedFare totalCharges paymentStatus voucher_made')
      .sort({ createdAt: -1 });

    // Transform _id to id for frontend compatibility
    const transformedShipments = shipments.map(shipment => {
      const shipmentObj = shipment.toObject();
      shipmentObj.id = shipmentObj._id;
      delete shipmentObj._id;
      return shipmentObj;
    });

    res.status(200).json({
      success: true,
      data: transformedShipments
    });
  } catch (error) {
    console.error('Error fetching available bilties for vouchers:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching available bilties for vouchers',
      error: error.message
    });
  }
};