import FinancialReport from '../models/financialReportModel.js';
import Trip from '../models/tripModel.js';
import Staff from '../models/staffModel.js';
import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';

// Get all financial reports
export const getAllFinancialReports = async (req, res) => {
  try {
    const reports = await FinancialReport.find()
      .populate({
        path: 'trips.tripId',
        select: 'tripNumber origin destination createdAt'
      })
      .populate({
        path: 'staffExpenses.staffId',
        select: 'name designation'
      })
      .sort({ reportDate: -1 });
    
    res.status(200).json(reports);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Check if report exists for today
export const checkTodayReport = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const report = await FinancialReport.findOne({ reportDate: today });
    
    res.status(200).json({ 
      exists: !!report,
      report: report || null
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get today's available trips (created today)
export const getTodaysTrips = async (req, res) => {
  console.log("🔍 Getting today's trips");
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const trips = await Trip.find({
      createdAt: {
        $gte: today,
        $lt: tomorrow
      }
    }).populate('driver vehicle').sort({ createdAt: -1 });

    res.status(200).json(trips);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all staff
export const getAllStaff = async (req, res) => {
  try {
    const staff = await Staff.find().select('name designation');
    res.status(200).json(staff);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create a new financial report
export const createFinancialReport = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Check if report already exists for today
    const existingReport = await FinancialReport.findOne({ reportDate: today });
    if (existingReport) {
      return res.status(400).json({ 
        message: 'Financial report already exists for today. Please delete the existing report to create a new one.' 
      });
    }

    const reportData = {
      ...req.body,
      reportDate: today
    };

    const report = new FinancialReport(reportData);
    const savedReport = await report.save();
    
    await savedReport.populate([
      {
        path: 'trips.tripId',
        select: 'tripNumber origin destination createdAt'
      },
      {
        path: 'staffExpenses.staffId',
        select: 'name designation'
      }
    ]);

    res.status(201).json(savedReport);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get a single financial report by ID
export const getFinancialReportById = async (req, res) => {
  try {
    const report = await FinancialReport.findById(req.params.id)
      .populate({
        path: 'trips.tripId',
        select: 'tripNumber origin destination createdAt'
      })
      .populate({
        path: 'staffExpenses.staffId',
        select: 'name designation'
      });

    if (!report) {
      return res.status(404).json({ message: 'Financial report not found' });
    }

    res.status(200).json(report);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update a financial report
export const updateFinancialReport = async (req, res) => {
  try {
    const report = await FinancialReport.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate([
      {
        path: 'trips.tripId',
        select: 'tripNumber origin destination createdAt'
      },
      {
        path: 'staffExpenses.staffId',
        select: 'name designation'
      }
    ]);

    if (!report) {
      return res.status(404).json({ message: 'Financial report not found' });
    }

    res.status(200).json(report);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete a financial report
export const deleteFinancialReport = async (req, res) => {
  try {
    const report = await FinancialReport.findByIdAndDelete(req.params.id);

    if (!report) {
      return res.status(404).json({ message: 'Financial report not found' });
    }

    res.status(200).json({ message: 'Financial report deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get monthly report summary
export const getMonthlyReport = async (req, res) => {
  try {
    const { year, month } = req.params;
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    const reports = await FinancialReport.find({
      reportDate: {
        $gte: startDate,
        $lte: endDate
      }
    }).sort({ reportDate: 1 });

    const monthlyData = reports.map(report => ({
      date: report.reportDate,
      totalExpenses: report.grandTotalExpenses,
      tripExpenses: report.totalTripExpenses,
      staffExpenses: report.totalStaffExpenses,
      otherExpenses: report.totalOtherExpenses
    }));

    const summary = {
      totalDays: reports.length,
      totalExpenses: reports.reduce((sum, report) => sum + report.grandTotalExpenses, 0),
      totalTripExpenses: reports.reduce((sum, report) => sum + report.totalTripExpenses, 0),
      totalStaffExpenses: reports.reduce((sum, report) => sum + report.totalStaffExpenses, 0),
      totalOtherExpenses: reports.reduce((sum, report) => sum + report.totalOtherExpenses, 0),
      dailyData: monthlyData
    };

    res.status(200).json(summary);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get yearly report summary
export const getYearlyReport = async (req, res) => {
  try {
    const { year } = req.params;
    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year, 11, 31);

    const reports = await FinancialReport.aggregate([
      {
        $match: {
          reportDate: {
            $gte: startDate,
            $lte: endDate
          }
        }
      },
      {
        $group: {
          _id: { $month: '$reportDate' },
          totalExpenses: { $sum: '$grandTotalExpenses' },
          tripExpenses: { $sum: '$totalTripExpenses' },
          staffExpenses: { $sum: '$totalStaffExpenses' },
          otherExpenses: { $sum: '$totalOtherExpenses' },
          reportCount: { $sum: 1 }
        }
      },
      {
        $sort: { '_id': 1 }
      }
    ]);

    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];

    const monthlyData = reports.map(item => ({
      month: monthNames[item._id - 1],
      monthNumber: item._id,
      totalExpenses: item.totalExpenses,
      tripExpenses: item.tripExpenses,
      staffExpenses: item.staffExpenses,
      otherExpenses: item.otherExpenses,
      reportCount: item.reportCount
    }));

    const summary = {
      year: parseInt(year),
      totalExpenses: reports.reduce((sum, item) => sum + item.totalExpenses, 0),
      totalTripExpenses: reports.reduce((sum, item) => sum + item.tripExpenses, 0),
      totalStaffExpenses: reports.reduce((sum, item) => sum + item.staffExpenses, 0),
      totalOtherExpenses: reports.reduce((sum, item) => sum + item.otherExpenses, 0),
      totalReports: reports.reduce((sum, item) => sum + item.reportCount, 0),
      monthlyData: monthlyData
    };

    res.status(200).json(summary);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Generate PDF for daily report
// Enhanced table drawing function with centered headers
const drawTable = (doc, headers, rows, startX, startY, columnWidths) => {
  const rowHeight = 20;
  const headerHeight = 25; // Slightly taller for headers

  // Draw header background
  doc.save();
  doc.fillColor('#007BFF').rect(startX, startY, columnWidths.reduce((a, b) => a + b, 0), headerHeight).fill();
  doc.restore();

  // Draw centered headers (white text on blue)
  doc.fillColor('#FFFFFF').font('Helvetica-Bold').fontSize(10);
  headers.forEach((header, i) => {
    const x = startX + columnWidths.slice(0, i).reduce((a, b) => a + b, 0);
    doc.text(header, x, startY + 8, { 
      width: columnWidths[i],
      align: 'center'
    });
  });

  // Reset fill color for rows
  doc.fillColor('#000000').font('Helvetica').fontSize(9);

  // Draw rows
  rows.forEach((row, rowIndex) => {
    const y = startY + headerHeight + rowIndex * rowHeight;
    // Alternating row background
    if (rowIndex % 2 === 0) {
      doc.save();
      doc.fillColor('#F8F9FA').rect(startX, y, columnWidths.reduce((a, b) => a + b, 0), rowHeight).fill();
      doc.restore();
    }
    row.forEach((cell, cellIndex) => {
      const x = startX + columnWidths.slice(0, cellIndex).reduce((a, b) => a + b, 0) + 4;
      doc.text(cell, x, y + 5, { 
        width: columnWidths[cellIndex] - 8, 
        align: 'left' 
      });
    });
  });

  // Draw table borders
  const totalWidth = columnWidths.reduce((a, b) => a + b, 0);
  const totalHeight = headerHeight + (rowHeight * rows.length);
  doc.rect(startX, startY, totalWidth, totalHeight).stroke();
  
  // Vertical lines
  let xLine = startX;
  columnWidths.forEach(width => {
    doc.moveTo(xLine, startY).lineTo(xLine, startY + totalHeight).stroke();
    xLine += width;
  });
};

// Helper function for centered section headings with improved styling
function drawSectionHeading(doc, heading) {
  const pageWidth = doc.page.width;
  const margin = 40;
  const textWidth = pageWidth - margin * 2;

  // Add a subtle background for section headings
  doc.save();
  doc.fillColor('#f0f7ff');
  doc.roundedRect(margin, doc.y, textWidth, 24, 3).fill();
  doc.restore();
  
  // Add heading text with improved styling
  doc.font('Helvetica-Bold')
      .fillColor('#0056b3')
      .fontSize(14)
      .text(heading, margin, doc.y + 5, { 
        align: 'center', 
        width: textWidth 
      });
  
  doc.moveDown(1);
}

// Daily PDF
export const generateDailyPDF = async (req, res) => {
  try {
    const report = await FinancialReport.findById(req.params.id)
      .populate({ path: 'trips.tripId', select: 'tripNumber origin destination createdAt' })
      .populate({ path: 'staffExpenses.staffId', select: 'name designation' });

    if (!report) return res.status(404).json({ message: 'Financial report not found' });

    const doc = new PDFDocument({ margin: 40 });
    const filename = `daily-report-${report.reportDate.toISOString().split('T')[0]}.pdf`;

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    doc.pipe(res);

    // Enhanced header with logo and proper styling
    const pageWidth = doc.page.width;
    const margin = 40;
    const contentWidth = pageWidth - (margin * 2);
    
    // Draw header background
    doc.save();
    doc.fillColor('#007BFF');
    doc.roundedRect(margin, 40, contentWidth, 80, 5).fill();
    doc.restore();
    
    // Add company name/logo placeholder
    doc.save();
    doc.font('Helvetica-Bold')
       .fillColor('#FFFFFF')
       .fontSize(22)
       .text('CARGO LINGO', margin, 55, { align: 'center', width: contentWidth });
    doc.restore();
    
    // Add report title
    doc.font('Helvetica-Bold')
       .fillColor('#FFFFFF')
       .fontSize(18)
       .text('Daily Financial Report', margin, 85, { align: 'center', width: contentWidth });
    
    // Add date below header box
    doc.font('Helvetica')
       .fillColor('#000000')
       .fontSize(12)
       .text(`Date: ${report.reportDate.toDateString()}`, margin, 130, { align: 'center', width: contentWidth });
    
    doc.moveDown(2);

    // Trip Expenses
    drawSectionHeading(doc, 'Trip Expenses');
    drawTable(doc,
      ['#', 'Trip No', 'Route', 'Mazdoori', 'Driver Exp', 'Road Exp', 'Loading/Unloading'],
      report.trips.map((trip, i) => [
        (i + 1).toString(),
        trip.tripId?.tripNumber || 'N/A',
        `${trip.tripId?.origin || 'N/A'} → ${trip.tripId?.destination || 'N/A'}`,
        `Rs. ${trip.expenses.mazdoori?.amount || 0}`,
        `Rs. ${trip.expenses.driverExpenses?.amount || 0}`,
        `Rs. ${trip.expenses.roadExpenses?.amount || 0}`,
        `Rs. ${trip.expenses.loadingUnloadingExpenses?.amount || 0}`
      ]),
      40, doc.y, [25, 50, 110, 65, 65, 65, 90]
    );

    doc.moveDown(1);

    // Staff Expenses
    drawSectionHeading(doc, 'Staff Expenses');
    drawTable(doc,
      ['#', 'Staff Name', 'Designation', 'Amount', 'Description'],
      report.staffExpenses.map((exp, i) => [
        (i + 1).toString(),
        exp.staffId?.name || 'N/A',
        exp.staffId?.designation || 'N/A',
        `Rs. ${exp.amount}`,
        exp.description || 'N/A'
      ]),
      40, doc.y, [25, 90, 90, 60, 140]
    );

    doc.moveDown(1);

    // Other Expenses
    drawSectionHeading(doc, 'Other Expenses');
    drawTable(doc,
      ['#', 'Description', 'Amount'],
      report.otherExpenses.map((exp, i) => [
        (i + 1).toString(),
        exp.description,
        `Rs. ${exp.amount}`
      ]),
      40, doc.y, [25, 250, 80]
    );
    doc.moveDown(1);


    // Summary
    drawSectionHeading(doc, 'Summary');
    drawTable(doc,
      ['Category', 'Amount'],
      [
        ['Total Trip Expenses', `Rs. ${report.totalTripExpenses}`],
        ['Total Staff Expenses', `Rs. ${report.totalStaffExpenses}`],
        ['Total Other Expenses', `Rs. ${report.totalOtherExpenses}`],
        ['GRAND TOTAL', `Rs. ${report.grandTotalExpenses}`]
      ],
      40, doc.y, [180, 90]
    );
    doc.moveDown(1);


    // Notes
    if (report.notes) {
      drawSectionHeading(doc, 'Notes');
      doc.font('Helvetica').fontSize(10)
        .text(report.notes, { 
          width: 400,
          align: 'center'
        });
    }

    doc.end();
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Monthly PDF
export const generateMonthlyPDF = async (req, res) => {
  try {
    const { year, month } = req.params;
    const monthlyData = await getMonthlyReportData(year, month);

    const doc = new PDFDocument({ margin: 40 });
    const filename = `monthly-report-${year}-${month.padStart(2, '0')}.pdf`;

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    doc.pipe(res);

    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'];

    // Enhanced header with logo and proper styling
    const pageWidth = doc.page.width;
    const margin = 40;
    const contentWidth = pageWidth - (margin * 2);
    
    // Draw header background
    doc.save();
    doc.fillColor('#007BFF');
    doc.roundedRect(margin, 40, contentWidth, 80, 5).fill();
    doc.restore();
    
    // Add company name/logo placeholder
    doc.save();
    doc.font('Helvetica-Bold')
       .fillColor('#FFFFFF')
       .fontSize(22)
       .text('CARGO LINGO', margin, 55, { align: 'center', width: contentWidth });
    doc.restore();
    
    // Add report title with month and year
    doc.font('Helvetica-Bold')
       .fillColor('#FFFFFF')
       .fontSize(18)
       .text(`Monthly Financial Report`, margin, 85, { align: 'center', width: contentWidth });
    
    // Add month/year below header box
    doc.font('Helvetica')
       .fillColor('#000000')
       .fontSize(12)
       .text(`${monthNames[month - 1]} ${year}`, margin, 130, { align: 'center', width: contentWidth });
    
    doc.moveDown(2);

    // Daily Breakdown
    drawSectionHeading(doc, 'Daily Breakdown');
    drawTable(doc,
      ['Date', 'Trip Expenses', 'Staff Expenses', 'Other Expenses', 'Total'],
      monthlyData.dailyData.map(d => [
        d.date.toDateString(),
        `Rs. ${d.tripExpenses}`,
        `Rs. ${d.staffExpenses}`,
        `Rs. ${d.otherExpenses}`,
        `Rs. ${d.totalExpenses}`
      ]),
      40, doc.y, [110, 80, 80, 80, 70]
    );
    doc.moveDown(1);

    // Summary
    drawSectionHeading(doc, 'Monthly Summary');
    drawTable(doc,
      ['Category', 'Amount'],
      [
        ['Total Days with Reports', monthlyData.totalDays.toString()],
        ['Total Trip Expenses', `Rs. ${monthlyData.totalTripExpenses}`],
        ['Total Staff Expenses', `Rs. ${monthlyData.totalStaffExpenses}`],
        ['Total Other Expenses', `Rs. ${monthlyData.totalOtherExpenses}`],
        ['GRAND TOTAL', `Rs. ${monthlyData.totalExpenses}`]
      ],
      40, doc.y, [180, 90]
    );

    doc.end();
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Yearly PDF
export const generateYearlyPDF = async (req, res) => {
  try {
    const { year } = req.params;
    const yearlyData = await getYearlyReportData(year);

    const doc = new PDFDocument({ margin: 40 });
    const filename = `yearly-report-${year}.pdf`;

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    doc.pipe(res);

    // Enhanced header with logo and proper styling
    const pageWidth = doc.page.width;
    const margin = 40;
    const contentWidth = pageWidth - (margin * 2);
    
    // Draw header background
    doc.save();
    doc.fillColor('#007BFF');
    doc.roundedRect(margin, 40, contentWidth, 80, 5).fill();
    doc.restore();
    
    // Add company name/logo placeholder
    doc.save();
    doc.font('Helvetica-Bold')
       .fillColor('#FFFFFF')
       .fontSize(22)
       .text('CARGO LINGO', margin, 55, { align: 'center', width: contentWidth });
    doc.restore();
    
    // Add report title
    doc.font('Helvetica-Bold')
       .fillColor('#FFFFFF')
       .fontSize(18)
       .text(`Yearly Financial Report`, margin, 85, { align: 'center', width: contentWidth });
    
    // Add year below header box
    doc.font('Helvetica')
       .fillColor('#000000')
       .fontSize(12)
       .text(`Year: ${year}`, margin, 130, { align: 'center', width: contentWidth });
    
    doc.moveDown(2);

    // Monthly Breakdown
    drawSectionHeading(doc, 'Monthly Breakdown');
    drawTable(doc,
      ['Month', 'Reports', 'Trip Expenses', 'Staff Expenses', 'Other Expenses', 'Total'],
      yearlyData.monthlyData.map(m => [
        m.month,
        m.reportCount.toString(),
        `Rs. ${m.tripExpenses}`,
        `Rs. ${m.staffExpenses}`,
        `Rs. ${m.otherExpenses}`,
        `Rs. ${m.totalExpenses}`
      ]),
      40, doc.y, [90, 60, 80, 80, 80, 70]
    );

    // Summary
    drawSectionHeading(doc, 'Yearly Summary');
    drawTable(doc,
      ['Category', 'Amount'],
      [
        ['Total Reports', yearlyData.totalReports.toString()],
        ['Total Trip Expenses', `Rs. ${yearlyData.totalTripExpenses}`],
        ['Total Staff Expenses', `Rs. ${yearlyData.totalStaffExpenses}`],
        ['Total Other Expenses', `Rs. ${yearlyData.totalOtherExpenses}`],
        ['GRAND TOTAL', `Rs. ${yearlyData.totalExpenses}`]
      ],
      40, doc.y, [180, 90]
    );

    doc.end();
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Helper functions for PDF generation
async function getMonthlyReportData(year, month) {
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0);

  const reports = await FinancialReport.find({
    reportDate: {
      $gte: startDate,
      $lte: endDate
    }
  }).sort({ reportDate: 1 });

  const monthlyData = reports.map(report => ({
    date: report.reportDate,
    totalExpenses: report.grandTotalExpenses,
    tripExpenses: report.totalTripExpenses,
    staffExpenses: report.totalStaffExpenses,
    otherExpenses: report.totalOtherExpenses
  }));

  return {
    totalDays: reports.length,
    totalExpenses: reports.reduce((sum, report) => sum + report.grandTotalExpenses, 0),
    totalTripExpenses: reports.reduce((sum, report) => sum + report.totalTripExpenses, 0),
    totalStaffExpenses: reports.reduce((sum, report) => sum + report.totalStaffExpenses, 0),
    totalOtherExpenses: reports.reduce((sum, report) => sum + report.totalOtherExpenses, 0),
    dailyData: monthlyData
  };
}

async function getYearlyReportData(year) {
  const startDate = new Date(year, 0, 1);
  const endDate = new Date(year, 11, 31);

  const reports = await FinancialReport.aggregate([
    {
      $match: {
        reportDate: {
          $gte: startDate,
          $lte: endDate
        }
      }
    },
    {
      $group: {
        _id: { $month: '$reportDate' },
        totalExpenses: { $sum: '$grandTotalExpenses' },
        tripExpenses: { $sum: '$totalTripExpenses' },
        staffExpenses: { $sum: '$totalStaffExpenses' },
        otherExpenses: { $sum: '$totalOtherExpenses' },
        reportCount: { $sum: 1 }
      }
    },
    {
      $sort: { '_id': 1 }
    }
  ]);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const monthlyData = reports.map(item => ({
    month: monthNames[item._id - 1],
    monthNumber: item._id,
    totalExpenses: item.totalExpenses,
    tripExpenses: item.tripExpenses,
    staffExpenses: item.staffExpenses,
    otherExpenses: item.otherExpenses,
    reportCount: item.reportCount
  }));

  return {
    year: parseInt(year),
    totalExpenses: reports.reduce((sum, item) => sum + item.totalExpenses, 0),
    totalTripExpenses: reports.reduce((sum, item) => sum + item.tripExpenses, 0),
    totalStaffExpenses: reports.reduce((sum, item) => sum + item.staffExpenses, 0),
    totalOtherExpenses: reports.reduce((sum, item) => sum + item.otherExpenses, 0),
    totalReports: reports.reduce((sum, item) => sum + item.reportCount, 0),
    monthlyData: monthlyData
  };
}