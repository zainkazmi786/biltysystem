import Vehicle from '../models/vehicleModel.js';
import Trip from '../models/tripModel.js';

export const getAllVehicles = async (req, res) => {
  try {
    const vehicles = await Vehicle.find();
    // For each vehicle, get their trips
    const vehiclesWithTrips = await Promise.all(vehicles.map(async (vehicle) => {
      const trips = await Trip.find({ vehicle: vehicle._id }).populate('driver');
      return { ...vehicle.toObject(), trips };
    }));
    res.json({ success: true, data: vehiclesWithTrips });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const createVehicle = async (req, res) => {
  try {
    const { number, type, model } = req.body;
    const vehicle = new Vehicle({ number, type, model });
    await vehicle.save();
    res.status(201).json({ success: true, data: vehicle });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const getVehicleById = async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);
    if (!vehicle) return res.status(404).json({ success: false, message: 'Vehicle not found' });
    const trips = await Trip.find({ vehicle: vehicle._id }).populate('driver');
    res.json({ success: true, data: { ...vehicle.toObject(), trips } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const updateVehicle = async (req, res) => {
  try {
    const vehicle = await Vehicle.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!vehicle) return res.status(404).json({ success: false, message: 'Vehicle not found' });
    res.json({ success: true, data: vehicle });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const deleteVehicle = async (req, res) => {
  try {
    const vehicle = await Vehicle.findByIdAndDelete(req.params.id);
    if (!vehicle) return res.status(404).json({ success: false, message: 'Vehicle not found' });
    res.json({ success: true, message: 'Vehicle deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};