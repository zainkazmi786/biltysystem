import Driver from '../models/driverModel.js';
import Trip from '../models/tripModel.js';

export const getAllDrivers = async (req, res) => {
  try {
    const drivers = await Driver.find();
    // For each driver, get their trips
    const driversWithTrips = await Promise.all(drivers.map(async (driver) => {
      const trips = await Trip.find({ driver: driver._id }).populate('vehicle');
      return { ...driver.toObject(), trips };
    }));
    res.json({ success: true, data: driversWithTrips });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const createDriver = async (req, res) => {
  try {
    const { name, phone, address } = req.body;
    const driver = new Driver({ name, phone, address });
    await driver.save();
    res.status(201).json({ success: true, data: driver });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const getDriverById = async (req, res) => {
  try {
    const driver = await Driver.findById(req.params.id);
    if (!driver) return res.status(404).json({ success: false, message: 'Driver not found' });
    const trips = await Trip.find({ driver: driver._id }).populate('vehicle');
    res.json({ success: true, data: { ...driver.toObject(), trips } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const updateDriver = async (req, res) => {
  try {
    const driver = await Driver.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!driver) return res.status(404).json({ success: false, message: 'Driver not found' });
    res.json({ success: true, data: driver });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const deleteDriver = async (req, res) => {
  try {
    const driver = await Driver.findByIdAndDelete(req.params.id);
    if (!driver) return res.status(404).json({ success: false, message: 'Driver not found' });
    res.json({ success: true, message: 'Driver deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};