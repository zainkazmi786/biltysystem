import Staff from '../models/staffModel.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Get all staff
export const list = async (req, res) => {
  try {
    const staff = await Staff.find().sort({ createdAt: -1 });
    res.json(staff);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get single staff member
export const get = async (req, res) => {
  try {
    const staff = await Staff.findById(req.params.id);
    if (!staff) {
      return res.status(404).json({ error: 'Staff not found' });
    }
    res.json(staff);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create new staff
export const create = async (req, res) => {
    console.log('Received files:', req.file); // Debug file upload
    console.log('Received body:', req.body); // Debug form data
    
    try {
      if (!req.file) {
        console.log('No file uploaded');
        return res.status(400).json({ error: 'Image is required' });
      }
  
      const staff = await Staff.create({
        ...req.body,
        image: `/uploads/${req.file.filename}`
      });
  
      console.log('Created staff:', staff); // Debug creation
      res.status(201).json(staff);
    } catch (error) {
      console.error('Creation error:', error); // Debug errors
      res.status(500).json({ error: error.message });
    }
  };

// Update staff
export const update = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    if (req.file) {
      updates.image = req.file.filename;
      
      const oldStaff = await Staff.findById(id);
      if (oldStaff?.image) {
        const oldImagePath = path.join(__dirname, '../uploads', oldStaff.image);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
    }

    const staff = await Staff.findByIdAndUpdate(id, updates, { 
      new: true,
      runValidators: true
    });

    if (!staff) {
      return res.status(404).json({ error: 'Staff not found' });
    }

    res.json(staff);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Delete staff
export const deleteStaff = async (req, res) => {
  try {
    const staff = await Staff.findByIdAndDelete(req.params.id);
    
    if (!staff) {
      return res.status(404).json({ error: 'Staff not found' });
    }

    if (staff.image) {
      const imagePath = path.join(__dirname, '../uploads', staff.image);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    res.json({ message: 'Staff deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};