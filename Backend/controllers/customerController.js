import Customer from '../models/customerModel.js';
import Shipment from '../models/shipmentModel.js';

// Create new customer
export const createCustomer = async (req, res) => {
  try {
    const {
      name,
      address,
      phone,
      bilties = []
    } = req.body;

    // Validate required fields
    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Name is required'
      });
    }

    // Check if customer with same name and phone already exists
    const existingCustomer = await Customer.findOne({ 
      name: name.trim(),
      phone: phone?.trim()
    });
    
    if (existingCustomer) {
      return res.status(400).json({
        success: false,
        message: 'Customer with this name and phone already exists'
      });
    }

    // Create customer data
    const customerData = {
      name: name.trim(),
      address: address?.trim(),
      phone: phone?.trim(),
      bilties: bilties,
      createdBy: req.user._id
    };

    const customer = new Customer(customerData);
    await customer.save();

    res.status(201).json({
      success: true,
      message: 'Customer created successfully',
      data: customer
    });

  } catch (error) {
    console.error('Error creating customer:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating customer',
      error: error.message
    });
  }
};

// Get all customers with filtering and pagination
export const getCustomers = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      status,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build filter object
    const filter = {};

    // Search in name, phone, bilty numbers
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { 'bilties.biltyNumber': { $regex: search, $options: 'i' } }
      ];
    }

    // Filter by status
    if (status && status !== 'all') {
      filter.status = status;
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Execute query
    const customers = await Customer.find(filter)
      .populate('createdBy', 'name email')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count for pagination
    const totalCustomers = await Customer.countDocuments(filter);
    const totalPages = Math.ceil(totalCustomers / parseInt(limit));

    // Calculate summary statistics
    const totalAmountDue = await Customer.aggregate([
      { $match: filter },
      { $group: { _id: null, total: { $sum: '$totalAmountDue' } } }
    ]);

    const totalBilties = await Customer.aggregate([
      { $match: filter },
      { $group: { _id: null, total: { $sum: { $size: '$bilties' } } } }
    ]);

    res.status(200).json({
      success: true,
      data: customers,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalCustomers,
        hasNext: parseInt(page) < totalPages,
        hasPrev: parseInt(page) > 1
      },
      summary: {
        totalAmountDue: totalAmountDue[0]?.total || 0,
        totalBilties: totalBilties[0]?.total || 0
      }
    });

  } catch (error) {
    console.error('Error fetching customers:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching customers',
      error: error.message
    });
  }
};

// Get single customer by ID
export const getCustomerById = async (req, res) => {
  try {
    const { id } = req.params;

    const customer = await Customer.findById(id)
      .populate('createdBy', 'name email');

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    res.status(200).json({
      success: true,
      data: customer
    });

  } catch (error) {
    console.error('Error fetching customer:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching customer',
      error: error.message
    });
  }
};

// Update customer
export const updateCustomer = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Check if customer exists
    const customer = await Customer.findById(id);
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    // Clean and validate update data
    const cleanUpdateData = {};
    
    if (updateData.name) cleanUpdateData.name = updateData.name.trim();
    if (updateData.address !== undefined) cleanUpdateData.address = updateData.address?.trim();
    if (updateData.phone !== undefined) cleanUpdateData.phone = updateData.phone?.trim();
    if (updateData.status) cleanUpdateData.status = updateData.status;

    // Update customer
    const updatedCustomer = await Customer.findByIdAndUpdate(
      id,
      cleanUpdateData,
      { new: true, runValidators: true }
    ).populate('createdBy', 'name email');

    res.status(200).json({
      success: true,
      message: 'Customer updated successfully',
      data: updatedCustomer
    });

  } catch (error) {
    console.error('Error updating customer:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating customer',
      error: error.message
    });
  }
};

// Delete customer
export const deleteCustomer = async (req, res) => {
  try {
    const { id } = req.params;

    const customer = await Customer.findByIdAndDelete(id);

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Customer deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting customer:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting customer',
      error: error.message
    });
  }
};

// Add bilty to customer
export const addBiltyToCustomer = async (req, res) => {
  try {
    const { customerId } = req.params;
    const { biltyNumber, amount_to_be_paid } = req.body;

    if (!biltyNumber || amount_to_be_paid === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Bilty number and amount are required'
      });
    }

    const customer = await Customer.findById(customerId);
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    // We're allowing multiple bilties with the same number for a customer
    // This check is removed to allow customers to have multiple bilties with the same number

    // Add bilty to customer
    customer.bilties.push({
      biltyNumber,
      amount_to_be_paid: parseFloat(amount_to_be_paid),
      payment_status: 'unpaid'
    });

    await customer.save();

    res.status(200).json({
      success: true,
      message: 'Bilty added to customer successfully',
      data: customer
    });

  } catch (error) {
    console.error('Error adding bilty to customer:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding bilty to customer',
      error: error.message
    });
  }
};

// Update bilty payment status
export const updateBiltyPaymentStatus = async (req, res) => {
  try {
    const { customerId, biltyNumber } = req.params;
    const { payment_status } = req.body;

    if (!payment_status || !['paid', 'unpaid'].includes(payment_status)) {
      return res.status(400).json({
        success: false,
        message: 'Valid payment status is required'
      });
    }

    const customer = await Customer.findById(customerId);
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    // Find and update the bilty
    const biltyIndex = customer.bilties.findIndex(b => b.biltyNumber === biltyNumber);
    if (biltyIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Bilty not found for this customer'
      });
    }

    const bilty = customer.bilties[biltyIndex];

    // Validation: Cannot mark as paid if amount_to_be_paid is 0
    if (payment_status === 'paid' && bilty.amount_to_be_paid <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot mark as paid when amount to be paid is 0 or less'
      });
    }

    bilty.payment_status = payment_status;
    
    // If marking as paid, set amount_to_be_paid to 0 and record paid_by_customer
    if (payment_status === 'paid') {
      bilty.paid_by_customer = bilty.amount_to_be_paid;
      bilty.amount_to_be_paid = 0;
    } else {
      // If marking as unpaid, reset paid_by_customer to 0
      bilty.paid_by_customer = 0;
    }

    await customer.save();

    res.status(200).json({
      success: true,
      message: 'Bilty payment status updated successfully',
      data: customer
    });

  } catch (error) {
    console.error('Error updating bilty payment status:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating bilty payment status',
      error: error.message
    });
  }
};

// Remove bilty from customer
export const removeBiltyFromCustomer = async (req, res) => {
  try {
    const { customerId, biltyNumber } = req.params;

    const customer = await Customer.findById(customerId);
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    // Remove the first occurrence of the bilty with the given number
    const biltyIndex = customer.bilties.findIndex(b => b.biltyNumber === biltyNumber);
    
    if (biltyIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Bilty not found for this customer'
      });
    }
    
    // Remove the bilty at the found index
    customer.bilties.splice(biltyIndex, 1);
    await customer.save();

    res.status(200).json({
      success: true,
      message: 'Bilty removed from customer successfully',
      data: customer
    });

  } catch (error) {
    console.error('Error removing bilty from customer:', error);
    res.status(500).json({
      success: false,
      message: 'Error removing bilty from customer',
      error: error.message
    });
  }
};

// Get customer statistics
export const getCustomerStats = async (req, res) => {
  try {
    // Total customers
    const totalCustomers = await Customer.countDocuments();

    // Customers by status
    const statusStats = await Customer.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Total bilties
    const totalBilties = await Customer.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: { $size: '$bilties' } }
        }
      }
    ]);

    // Total amount due
    const totalAmountDue = await Customer.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: '$totalAmountDue' }
        }
      }
    ]);

    // Recent customers (last 7 days)
    const recentCustomers = await Customer.countDocuments({
      createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
    });

    res.status(200).json({
      success: true,
      data: {
        totalCustomers,
        recentCustomers,
        statusStats,
        totalBilties: totalBilties[0]?.total || 0,
        totalAmountDue: totalAmountDue[0]?.total || 0
      }
    });

  } catch (error) {
    console.error('Error fetching customer statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching customer statistics',
      error: error.message
    });
  }
};

// Search customer by bilty number
export const searchCustomerByBilty = async (req, res) => {
  try {
    const { biltyNumber } = req.params;

    // This query will find any customer that has at least one bilty with the given number
    const customers = await Customer.find({ 
      'bilties.biltyNumber': biltyNumber 
    }).populate('createdBy', 'name email');

    if (!customers || customers.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No customers found with this bilty number'
      });
    }

    // Return all matching customers
    res.status(200).json({
      success: true,
      data: customers.length === 1 ? customers[0] : customers
    });

  } catch (error) {
    console.error('Error searching customer:', error);
    res.status(500).json({
      success: false,
      message: 'Error searching customer',
      error: error.message
    });
  }
};