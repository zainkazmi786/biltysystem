import Claim from '../models/claimModel.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper function to handle file upload
const uploadFile = (file) => {
  if (!file || !file.buffer) {
    throw new Error('No file or file buffer provided');
  }
  
  const uploadDir = path.join(__dirname, '../uploads');
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const fileName = `${Date.now()}-${file.originalname}`;
  const filePath = path.join(uploadDir, fileName);
  
  fs.writeFileSync(filePath, file.buffer);
  return fileName;
};

// Create a new claim
export const createClaim = async (req, res) => {
  try {
    const { body, file } = req;
    
    // Validate required fields
    if (!body.biltyNumber || !body.claimDate || !body.amount) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const claimData = {
      biltyNumber: body.biltyNumber,
      claimDate: new Date(body.claimDate),
      amount: parseFloat(body.amount),
      status: body.status || 'pending',
      description: body.description || '',
      numberOfInstallments: parseInt(body.numberOfInstallments) || 1,
      solvingDuration: parseInt(body.solvingDuration) || 0,
      solvingDate: body.solvingDate ? new Date(body.solvingDate) : null
    };

    if (file) {
      try {
        claimData.relatedDocument = uploadFile(file);
      } catch (fileError) {
        return res.status(400).json({ error: fileError.message });
      }
    }

    const claim = await Claim.create(claimData);
    res.status(201).json(claim);
    
  } catch (error) {
    res.status(400).json({ 
      error: error.message,
      ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
    });
  }
};

// Get all claims
export const getAllClaims = async (req, res) => {
  try {
    const { search, status } = req.query;
    let query = {};

    if (search) {
      query.$or = [
        { biltyNumber: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    if (status) {
      query.status = status;
    }

    const claims = await Claim.find(query).sort({ createdAt: -1 });
    res.json(claims);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get claim by ID
export const getClaimById = async (req, res) => {
  try {
    const claim = await Claim.findById(req.params.id);
    if (!claim) {
      return res.status(404).json({ error: 'Claim not found' });
    }
    res.json(claim);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update claim
export const updateClaim = async (req, res) => {
  try {
    const { body, file } = req;
    
    const updateData = {
      ...body,
      amount: parseFloat(body.amount),
      numberOfInstallments: parseInt(body.numberOfInstallments) || 1,
      solvingDuration: parseInt(body.solvingDuration) || 0,
      claimDate: new Date(body.claimDate),
      solvingDate: body.solvingDate ? new Date(body.solvingDate) : null
    };

    if (file) {
      updateData.relatedDocument = uploadFile(file);
    }

    const claim = await Claim.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!claim) {
      return res.status(404).json({ error: 'Claim not found' });
    }

    res.json(claim);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Delete claim
export const deleteClaim = async (req, res) => {
  try {
    const claim = await Claim.findByIdAndDelete(req.params.id);
    if (!claim) {
      return res.status(404).json({ error: 'Claim not found' });
    }
    res.json({ message: 'Claim deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Download document
export const downloadDocument = async (req, res) => {
  try {
    const claim = await Claim.findById(req.params.id);
    if (!claim || !claim.relatedDocument) {
      return res.status(404).json({ error: 'Document not found' });
    }

    const filePath = path.join(__dirname, '../uploads', claim.relatedDocument);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'File not found' });
    }

    res.download(filePath);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get claims statistics
export const getStats = async (req, res) => {
  try {
    const totalClaims = await Claim.countDocuments();
    const pendingClaims = await Claim.countDocuments({ status: 'pending' });
    const resolvedClaims = await Claim.countDocuments({ status: 'resolved' });
    const totalAmount = await Claim.aggregate([
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    res.json({
      totalClaims,
      pendingClaims,
      resolvedClaims,
      totalAmount: totalAmount[0]?.total || 0
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};