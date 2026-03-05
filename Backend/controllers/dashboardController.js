import Shipment from '../models/shipmentModel.js';
import Customer from '../models/customerModel.js';
import Voucher from '../models/voucherModel.js';
import Trip from '../models/tripModel.js';
import Staff from '../models/staffModel.js';
import Shop from '../models/shopModel.js';

export const getDashboardStats = async (req, res) => {
  try {
    // Get total shipments
    const totalShipments = await Shipment.countDocuments();
    // Get total staff
    const totalStaff = await Staff.countDocuments();
    // Get total shops
    const totalShops = await Shop.countDocuments();
    // Get total trips
    const totalTrips = await Trip.countDocuments();
    // Get total customers
    const totalCustomers = await Customer.countDocuments();
    // Get total vouchers
    const totalVouchers = await Voucher.countDocuments();

    // Calculate percentage changes (mock data for now)
    const stats = {
      totalShipments: {
        value: totalShipments,
        change: '+12.5%',
        changeType: 'positive'
      },
      totalStaff: {
        value: totalStaff,
        change: '+5.1%',
        changeType: 'positive'
      },
      totalTrips: {
        value: totalTrips,
        change: '+9.8%',
        changeType: 'positive'
      },
      totalShops: {
        value: totalShops,
        change: '+3.2%',
        changeType: 'positive'
      },
      totalCustomers: {
        value: totalCustomers,
        change: '+15.2%',
        changeType: 'positive'
      },
      totalVouchers: {
        value: totalVouchers,
        change: '+22.1%',
        changeType: 'positive'
      }
    };
    res.status(200).json({ success: true, data: stats });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ success: false, message: 'Error fetching dashboard stats', error: error.message });
  }
};

export const getRecentShipments = async (req, res) => {
  try {
    const recentShipments = await Shipment.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('biltyNumber senderName receiverName totalCharges receivedFare remainingFare paymentStatus createdAt');
    
    const transformedShipments = recentShipments.map(shipment => {
      const shipmentObj = shipment.toObject();
      shipmentObj.id = shipmentObj._id;
      delete shipmentObj._id;
      return shipmentObj;
    });
    
    res.status(200).json({ success: true, data: transformedShipments });
  } catch (error) {
    console.error('Error fetching recent shipments:', error);
    res.status(500).json({ success: false, message: 'Error fetching recent shipments', error: error.message });
  }
};

export const getMonthlyRevenue = async (req, res) => {
  try {
    const currentDate = new Date();
    const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    
    const monthlyRevenue = await Shipment.aggregate([
      {
        $match: {
          createdAt: { $gte: startOfMonth, $lte: endOfMonth }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          dailyRevenue: { $sum: { $ifNull: ['$receivedFare', 0] } }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);
    
    res.status(200).json({ success: true, data: monthlyRevenue });
  } catch (error) {
    console.error('Error fetching monthly revenue:', error);
    res.status(500).json({ success: false, message: 'Error fetching monthly revenue', error: error.message });
  }
};

export const getTopCustomers = async (req, res) => {
  try {
    const topCustomers = await Customer.find()
      .sort({ totalAmountDue: -1 })
      .limit(5)
      .select('name totalAmountDue bilties');
    
    const transformedCustomers = topCustomers.map(customer => {
      const customerObj = customer.toObject();
      customerObj.id = customerObj._id;
      customerObj.biltyCount = customerObj.bilties ? customerObj.bilties.length : 0;
      delete customerObj._id;
      // Remove the bilties array to reduce payload size
      delete customerObj.bilties;
      return customerObj;
    });
    
    res.status(200).json({ success: true, data: transformedCustomers });
  } catch (error) {
    console.error('Error fetching top customers:', error);
    res.status(500).json({ success: false, message: 'Error fetching top customers', error: error.message });
  }
};

export const getPaymentStats = async (req, res) => {
  try {
    const paidShipments = await Shipment.countDocuments({ paymentStatus: 'paid' });
    const unpaidShipments = await Shipment.countDocuments({ paymentStatus: 'unpaid' });
    const totalShipments = paidShipments + unpaidShipments;
    
    const paymentStats = {
      paid: {
        count: paidShipments,
        percentage: totalShipments > 0 ? Math.round((paidShipments / totalShipments) * 100) : 0
      },
      unpaid: {
        count: unpaidShipments,
        percentage: totalShipments > 0 ? Math.round((unpaidShipments / totalShipments) * 100) : 0
      },
      total: totalShipments
    };
    
    res.status(200).json({ success: true, data: paymentStats });
  } catch (error) {
    console.error('Error fetching payment stats:', error);
    res.status(500).json({ success: false, message: 'Error fetching payment stats', error: error.message });
  }
};