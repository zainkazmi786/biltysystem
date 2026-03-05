import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { useState } from 'react';
import { Button } from './button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './dialog';
import { useLanguage } from '@/contexts/LanguageContext';

interface ReceiptData {
  documentNumber: string;
  date: string;
  senderName: string;
  senderPhone: string;
  senderAddress: string;
  receiverName: string;
  receiverPhone: string;
  receiverAddress: string;
  quantity: number;
  weight: number;
  details: string;
  fare: number;
  localCharges: number;
  mazdoori: number;
  biltyCharges: number;
  totalAmount: number;
  paymentStatus: string;
  deliveryStatus: string;
  vehicleNumber?: string;
  driverName?: string;
  pickupType: string;
  addaName?: string;
  cityName?: string;
  biltyNumber?: string;
  voucherNumber?: string;
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
  purpose?: string;
  paymentMethod?: string;
  reference?: string;
  dueDate?: string;
  type: 'bilty' | 'voucher' | 'delivery';
  subtotal?: number;
  companyTax?: number;
  taxPercentage?: number;
  bilties?: Array<{
    biltyId?: any;
    biltyNumber: string;
    amount: number;
  }>;
  items?: Array<{
    description: string;
    quantity: number;
    unitFare: number;
    totalFare: number;
  }>;
  reriCharges?: number;
  extraCharges?: number;
  receivedFare?: number;
  remainingFare?: number;
}

// Receipt translations
const receiptTranslations = {
  en: {
    biltySlip: "BILTY SLIP",
    paymentVoucher: "PAYMENT VOUCHER",
    deliveryReceipt: "DELIVERY RECEIPT",
    cargoProLogistics: "Cargo Pro Logistics",
    professionalCargo: "Professional Cargo & Logistics Solutions",
    biltyNo: "Bilty No:",
    voucherNo: "Voucher No:",
    date: "Date:",
    status: "Status:",
    vehicle: "Vehicle:",
    sender: "Sender",
    receiver: "Receiver",
    name: "Name:",
    phone: "Phone:",
    adda: "Adda:",
    city: "City:",
    pickup: "Pickup:",
    payment: "Payment:",
    shipmentItems: "Shipment Items",
    description: "Description",
    qty: "Qty",
    unitFare: "Unit Fare",
    total: "Total",
    charges: "Charges",
    itemsFare: "Items Fare:",
    mazdoori: "Mazdoori:",
    biltyCharges: "Bilty Charges:",
    reriCharges: "Reri Charges:",
    extraCharges: "Extra Charges:",
    paymentSummary: "Payment Summary",
    totalFare: "Total Fare:",
    received: "Received:",
    remaining: "Remaining:",
    customerInfo: "Customer Information",
    amount: "Amount:",
    method: "Method:",
    customer: "Customer",
    driver: "Driver",
    cargoPro: "Cargo Pro",
    signature: "Signature",
    stamp: "Stamp",
    computerGenerated: "This is a computer generated document. No signature required.",
    generatedOn: "Generated on",
    downloadReceipt: "Download Receipt",
    receiptReady: "Receipt Ready",
    receiptDescription: "Your receipt has been generated successfully. Click the button below to download it.",
    download: "Download",
    cancel: "Cancel",
    generating: "Generating...",
    error: "Error generating PDF. Please try again.",
    subtotal: "Subtotal:",
    companyTax: "Company Tax:",
    taxRate: "Tax Rate:",
    includedBilties: "Included Bilties",
    biltyNumber: "Bilty Number",
    amount: "Amount"
  },
  ur: {
    biltySlip: "بلٹی سلپ",
    paymentVoucher: "ادائیگی کا واؤچر",
    deliveryReceipt: "ترسیل کی رسید",
    cargoProLogistics: "کارگو پرو لاجسٹکس",
    professionalCargo: "پیشہ ورانہ کارگو اور لاجسٹکس حل",
    biltyNo: "بلٹی نمبر:",
    voucherNo: "واؤچر نمبر:",
    date: "تاریخ:",
    status: "حیثیت:",
    vehicle: "گاڑی:",
    sender: "مرسل",
    receiver: "وصول کنندہ",
    name: "نام:",
    phone: "فون:",
    adda: "اڈہ:",
    city: "شہر:",
    pickup: "پک اپ:",
    payment: "ادائیگی:",
    shipmentItems: "شپمنٹ کی اشیاء",
    description: "تفصیل",
    qty: "مقدار",
    unitFare: "فی یونٹ کرایہ",
    total: "کل",
    charges: "چارجز",
    itemsFare: "اشیاء کا کرایہ:",
    mazdoori: "مزدوری:",
    biltyCharges: "بلٹی چارجز:",
    reriCharges: "ریڑی چارجز:",
    extraCharges: "اضافی چارجز:",
    paymentSummary: "ادائیگی کا خلاصہ",
    totalFare: "کل کرایہ:",
    received: "وصول شدہ:",
    remaining: "باقی:",
    customerInfo: "گاہک کی معلومات",
    amount: "رقم:",
    method: "طریقہ:",
    customer: "گاہک",
    driver: "ڈرائیور",
    cargoPro: "کارگو پرو",
    signature: "دستخط",
    stamp: "مہر",
    computerGenerated: "یہ کمپیوٹر سے تیار کردہ دستاویز ہے۔ دستخط کی ضرورت نہیں۔",
    generatedOn: "تیار کیا گیا",
    downloadReceipt: "رسید ڈاؤن لوڈ کریں",
    receiptReady: "رسید تیار ہے",
    receiptDescription: "آپ کی رسید کامیابی سے تیار ہو گئی ہے۔ اسے ڈاؤن لوڈ کرنے کے لیے نیچے دیے گئے بٹن پر کلک کریں۔",
    download: "ڈاؤن لوڈ",
    cancel: "منسوخ",
    generating: "تیار ہو رہا ہے...",
    error: "پی ڈی ایف تیار کرنے میں خرابی۔ براہ کرم دوبارہ کوشش کریں۔",
    subtotal: "ذیلی کل:",
    companyTax: "کمپنی ٹیکس:",
    taxRate: "ٹیکس ریٹ:",
    includedBilties: "شامل بلٹیز",
    biltyNumber: "بلٹی نمبر",
    amount: "رقم"
  }
};

export const generatePDFReceipt = async (data: ReceiptData, language: 'en' | 'ur' = 'en') => {
  const t = receiptTranslations[language];
  const isBilty = data.type === 'bilty';
  const isDelivery = data.type === 'delivery';
  const documentType = isBilty ? t.biltySlip : isDelivery ? t.deliveryReceipt : t.paymentVoucher;
  const documentNumber = isBilty ? data.biltyNumber : isDelivery ? data.documentNumber : data.voucherNumber;

  const receiptDiv = document.createElement('div');
  receiptDiv.style.position = 'absolute';
  receiptDiv.style.left = '-9999px';
  receiptDiv.style.top = '0';
  receiptDiv.style.width = '800px';
  receiptDiv.style.backgroundColor = 'white';
  receiptDiv.style.padding = '20px';
  receiptDiv.style.fontFamily = language === 'ur' ? 'Jameel Noori Nastaleeq, Arial, sans-serif' : 'Arial, sans-serif';
  receiptDiv.style.color = '#333';
  receiptDiv.style.lineHeight = '1.4';
  receiptDiv.style.direction = language === 'ur' ? 'rtl' : 'ltr';

  receiptDiv.innerHTML = `
    <div style="
      border: 2px solid #039bb4;
      border-radius: 8px;
      padding: 20px;
      background: white;
      max-width: 760px;
      margin: 0 auto;
      font-size: 12px;
      direction: ${language === 'ur' ? 'rtl' : 'ltr'};
    ">
      <!-- Header -->
      <div style="
        text-align: center;
        margin-bottom: 15px;
        padding-bottom: 10px;
        border-bottom: 2px solid #e2e8f0;
      ">
        <div style="
          width: 50px;
          height: 50px;
          background: linear-gradient(135deg, #039bb4, #0284a8);
          border-radius: 50%;
          margin: 0 auto 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 16px;
          font-weight: bold;
        ">
          CP
        </div>
        <h1 style="
          color: #039bb4;
          font-size: 20px;
          font-weight: bold;
          margin: 0;
          text-transform: uppercase;
          letter-spacing: 1px;
        ">
          ${t.cargoProLogistics}
        </h1>
        <p style="
          color: #64748b;
          font-size: 10px;
          margin: 2px 0 0 0;
          font-style: italic;
        ">
          ${t.professionalCargo}
        </p>
        <h2 style="
          color: #1e293b;
          font-size: 14px;
          font-weight: 600;
          margin: 8px 0 0 0;
          text-transform: uppercase;
          letter-spacing: 1px;
        ">
          ${documentType}
        </h2>
      </div>

      <!-- Document Info Row -->
      <div style="
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 15px;
        margin-bottom: 15px;
        padding: 10px;
        background: #f8fafc;
        border-radius: 6px;
        border-left: 3px solid #039bb4;
      ">
        <div>
          <div style="margin-bottom: 4px;">
            <span style="font-weight: 600; color: #475569; font-size: 10px;">${isBilty ? t.biltyNo : t.voucherNo}</span>
            <span style="color: #1e293b; font-weight: bold; font-size: 12px;"> ${documentNumber}</span>
          </div>
          <div style="margin-bottom: 4px;">
            <span style="font-weight: 600; color: #475569; font-size: 10px;">${t.date}</span>
            <span style="color: #1e293b; font-size: 10px;"> ${data.date}</span>
          </div>
        </div>
        <div>
          <div style="margin-bottom: 4px;">
            <span style="font-weight: 600; color: #475569; font-size: 10px;">${t.status}</span>
            <span style="
              color: ${data.paymentStatus === 'paid' || data.deliveryStatus === 'delivered' ? '#059669' : 
                       data.paymentStatus === 'pending' || data.deliveryStatus === 'pending' ? '#d97706' : 
                       data.paymentStatus === 'unpaid' || data.deliveryStatus === 'returned' ? '#dc2626' : '#64748b'};
              font-weight: 600;
              font-size: 10px;
            "> ${isBilty ? data.deliveryStatus : data.paymentStatus}</span>
          </div>
          ${data.vehicleNumber ? `
            <div style="margin-bottom: 4px;">
              <span style="font-weight: 600; color: #475569; font-size: 10px;">${t.vehicle}</span>
              <span style="color: #1e293b; font-size: 10px;"> ${data.vehicleNumber}</span>
            </div>
          ` : ''}
        </div>
      </div>

      ${isBilty ? `
        <!-- Sender & Receiver Row -->
        <div style="
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 15px;
          margin-bottom: 15px;
        ">
          <!-- Sender -->
          <div style="
            padding: 10px;
            background: white;
            border-radius: 6px;
            border: 1px solid #e2e8f0;
          ">
            <h3 style="
              color: #039bb4;
              font-size: 11px;
              font-weight: 600;
              margin: 0 0 6px 0;
              text-transform: uppercase;
              border-bottom: 1px solid #e2e8f0;
              padding-bottom: 4px;
            ">
              ${t.sender}
            </h3>
            <div style="margin-bottom: 3px;">
              <span style="font-weight: 600; color: #475569; font-size: 9px;">${t.name}</span>
              <span style="color: #1e293b; font-weight: 600; font-size: 10px;"> ${data.senderName}</span>
            </div>
            <div style="margin-bottom: 3px;">
              <span style="font-weight: 600; color: #475569; font-size: 9px;">${t.phone}</span>
              <span style="color: #1e293b; font-size: 10px;"> ${data.senderPhone}</span>
            </div>
            <div style="margin-bottom: 3px;">
              <span style="font-weight: 600; color: #475569; font-size: 9px;">${t.adda}</span>
              <span style="color: #1e293b; font-size: 10px;"> ${data.addaName || 'N/A'}</span>
            </div>
            <div style="margin-bottom: 3px;">
              <span style="font-weight: 600; color: #475569; font-size: 9px;">${t.city}</span>
              <span style="color: #1e293b; font-size: 10px;"> ${data.cityName || 'N/A'}</span>
            </div>
          </div>

          <!-- Receiver -->
          <div style="
            padding: 10px;
            background: white;
            border-radius: 6px;
            border: 1px solid #e2e8f0;
          ">
            <h3 style="
              color: #039bb4;
              font-size: 11px;
              font-weight: 600;
              margin: 0 0 6px 0;
              text-transform: uppercase;
              border-bottom: 1px solid #e2e8f0;
              padding-bottom: 4px;
            ">
              ${t.receiver}
            </h3>
            <div style="margin-bottom: 3px;">
              <span style="font-weight: 600; color: #475569; font-size: 9px;">${t.name}</span>
              <span style="color: #1e293b; font-weight: 600; font-size: 10px;"> ${data.receiverName}</span>
            </div>
            <div style="margin-bottom: 3px;">
              <span style="font-weight: 600; color: #475569; font-size: 9px;">${t.phone}</span>
              <span style="color: #1e293b; font-size: 10px;"> ${data.receiverPhone}</span>
            </div>
            <div style="margin-bottom: 3px;">
              <span style="font-weight: 600; color: #475569; font-size: 9px;">${t.pickup}</span>
              <span style="color: #1e293b; font-size: 10px;"> ${data.pickupType}</span>
            </div>
            <div style="margin-bottom: 3px;">
              <span style="font-weight: 600; color: #475569; font-size: 9px;">${t.payment}</span>
              <span style="
                color: ${data.paymentStatus === 'paid' ? '#059669' : '#dc2626'};
                font-weight: 600;
                font-size: 10px;
              "> ${data.paymentStatus}</span>
            </div>
          </div>
        </div>

        ${data.items && data.items.length > 0 ? `
          <!-- Items Table -->
          <div style="margin-bottom: 15px;">
            <h3 style="
              color: #039bb4;
              font-size: 11px;
              font-weight: 600;
              margin: 0 0 6px 0;
              text-transform: uppercase;
              border-bottom: 1px solid #e2e8f0;
              padding-bottom: 4px;
            ">
              ${t.shipmentItems}
            </h3>
            <div style="
              border: 1px solid #e2e8f0;
              border-radius: 4px;
              overflow: hidden;
            ">
              <div style="
                display: grid;
                grid-template-columns: 2fr 1fr 1fr 1fr;
                background: #f8fafc;
                border-bottom: 1px solid #e2e8f0;
                font-weight: 600;
                font-size: 9px;
                color: #475569;
              ">
                <div style="padding: 6px 8px;">${t.description}</div>
                <div style="padding: 6px 8px;">${t.qty}</div>
                <div style="padding: 6px 8px;">${t.unitFare}</div>
                <div style="padding: 6px 8px;">${t.total}</div>
              </div>
              ${data.items.map(item => `
                <div style="
                  display: grid;
                  grid-template-columns: 2fr 1fr 1fr 1fr;
                  border-bottom: 1px solid #f1f5f9;
                  font-size: 9px;
                ">
                  <div style="padding: 4px 8px;">${item.description}</div>
                  <div style="padding: 4px 8px;">${item.quantity}</div>
                  <div style="padding: 4px 8px;">₨${item.unitFare.toLocaleString()}</div>
                  <div style="padding: 4px 8px; font-weight: 600;">₨${item.totalFare.toLocaleString()}</div>
                </div>
              `).join('')}
            </div>
          </div>
        ` : ''}

        <!-- Financial Summary -->
        <div style="
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 15px;
          margin-bottom: 15px;
        ">
          <!-- Charges -->
          <div style="
            padding: 10px;
            background: #f8fafc;
            border-radius: 6px;
            border: 1px solid #e2e8f0;
          ">
            <h3 style="
              color: #039bb4;
              font-size: 11px;
              font-weight: 600;
              margin: 0 0 6px 0;
              text-transform: uppercase;
              border-bottom: 1px solid #e2e8f0;
              padding-bottom: 4px;
            ">
              ${t.charges}
            </h3>
            <div style="margin-bottom: 3px;">
              <span style="font-weight: 600; color: #475569; font-size: 9px;">${t.itemsFare}</span>
              <span style="color: #1e293b; font-size: 10px;"> ₨${data.fare.toLocaleString()}</span>
            </div>
            <div style="margin-bottom: 3px;">
              <span style="font-weight: 600; color: #475569; font-size: 9px;">${t.mazdoori}</span>
              <span style="color: #1e293b; font-size: 10px;"> ₨${data.mazdoori.toLocaleString()}</span>
            </div>
            <div style="margin-bottom: 3px;">
              <span style="font-weight: 600; color: #475569; font-size: 9px;">${t.biltyCharges}</span>
              <span style="color: #1e293b; font-size: 10px;"> ₨${data.biltyCharges.toLocaleString()}</span>
            </div>
            ${data.reriCharges ? `
              <div style="margin-bottom: 3px;">
                <span style="font-weight: 600; color: #475569; font-size: 9px;">${t.reriCharges}</span>
                <span style="color: #1e293b; font-size: 10px;"> ₨${data.reriCharges.toLocaleString()}</span>
              </div>
            ` : ''}
            ${data.extraCharges ? `
              <div style="margin-bottom: 3px;">
                <span style="font-weight: 600; color: #475569; font-size: 9px;">${t.extraCharges}</span>
                <span style="color: #1e293b; font-size: 10px;"> ₨${data.extraCharges.toLocaleString()}</span>
              </div>
            ` : ''}
          </div>

          <!-- Payment Summary -->
          <div style="
            padding: 10px;
            background: #f8fafc;
            border-radius: 6px;
            border: 1px solid #e2e8f0;
          ">
            <h3 style="
              color: #039bb4;
              font-size: 11px;
              font-weight: 600;
              margin: 0 0 6px 0;
              text-transform: uppercase;
              border-bottom: 1px solid #e2e8f0;
              padding-bottom: 4px;
            ">
              ${t.paymentSummary}
            </h3>
            <div style="margin-bottom: 3px;">
              <span style="font-weight: 600; color: #475569; font-size: 9px;">${t.totalFare}</span>
              <span style="color: #1e293b; font-weight: bold; font-size: 12px;"> ₨${data.totalAmount.toLocaleString()}</span>
            </div>
            ${data.receivedFare !== undefined ? `
              <div style="margin-bottom: 3px;">
                <span style="font-weight: 600; color: #475569; font-size: 9px;">${t.received}</span>
                <span style="color: #059669; font-weight: bold; font-size: 10px;"> ₨${data.receivedFare.toLocaleString()}</span>
              </div>
            ` : ''}
            ${data.remainingFare !== undefined ? `
              <div style="margin-bottom: 3px;">
                <span style="font-weight: 600; color: #475569; font-size: 9px;">${t.remaining}</span>
                <span style="color: #dc2626; font-weight: bold; font-size: 10px;"> ₨${data.remainingFare.toLocaleString()}</span>
              </div>
            ` : ''}
          </div>
        </div>
      ` : `
        ${data.bilties && data.bilties.length > 0 ? `
          <!-- Included Bilties Table -->
          <div style="margin-bottom: 15px;">
            <h3 style="
              color: #039bb4;
              font-size: 11px;
              font-weight: 600;
              margin: 0 0 6px 0;
              text-transform: uppercase;
              border-bottom: 1px solid #e2e8f0;
              padding-bottom: 4px;
            ">
              ${t.includedBilties}
            </h3>
            <div style="
              border: 1px solid #e2e8f0;
              border-radius: 4px;
              overflow: hidden;
            ">
              <div style="
                display: grid;
                grid-template-columns: 1.2fr 1fr 1fr 1fr 1fr 0.7fr 1fr 1fr 1fr;
                background: #f8fafc;
                border-bottom: 1px solid #e2e8f0;
                font-weight: 600;
                font-size: 9px;
                color: #475569;
              ">
                <div style="padding: 6px 8px;">${t.biltyNumber}</div>
                <div style="padding: 6px 8px;">${t.date}</div>
                <div style="padding: 6px 8px;">${t.adda}</div>
                <div style="padding: 6px 8px;">${t.sender}</div>
                <div style="padding: 6px 8px;">${t.receiver}</div>
                <div style="padding: 6px 8px;">${t.qty}</div>
                <div style="padding: 6px 8px;">${t.charges}</div>
                <div style="padding: 6px 8px;">${t.received}</div>
                <div style="padding: 6px 8px;">${t.remaining}</div>
              </div>
              ${data.bilties.map(bilty => `
                <div style="
                  display: grid;
                  grid-template-columns: 1.2fr 1fr 1fr 1fr 1fr 0.7fr 1fr 1fr 1fr;
                  border-bottom: 1px solid #f1f5f9;
                  font-size: 9px;
                ">
                  <div style="padding: 4px 8px;">${bilty.biltyNumber}</div>
                  <div style="padding: 4px 8px;">${bilty.date || '-'}</div>
                  <div style="padding: 4px 8px;">${bilty.addaName || '-'}</div>
                  <div style="padding: 4px 8px;">${bilty.senderName || '-'}</div>
                  <div style="padding: 4px 8px;">${bilty.receiverName || '-'}</div>
                  <div style="padding: 4px 8px;">${bilty.quantity ?? '-'}</div>
                  <div style="padding: 4px 8px;">${bilty.totalCharges !== undefined ? 'PKR ' + bilty.totalCharges.toLocaleString() : '-'}</div>
                  <div style="padding: 4px 8px;">${bilty.receivedFare !== undefined ? 'PKR ' + bilty.receivedFare.toLocaleString() : '-'}</div>
                  <div style="padding: 4px 8px;">${bilty.remainingFare !== undefined ? 'PKR ' + bilty.remainingFare.toLocaleString() : '-'}</div>
                </div>
              `).join('')}
            </div>
          </div>
        ` : ''}

        <!-- Financial Summary for Voucher -->
        <div style="
          margin-bottom: 15px;
          padding: 10px;
          background: #f8fafc;
          border-radius: 6px;
          border: 1px solid #e2e8f0;
        ">
          <h3 style="
            color: #039bb4;
            font-size: 11px;
            font-weight: 600;
            margin: 0 0 6px 0;
            text-transform: uppercase;
            border-bottom: 1px solid #e2e8f0;
            padding-bottom: 4px;
          ">
            ${t.paymentSummary}
          </h3>
          <div style="margin-bottom: 3px;">
            <span style="font-weight: 600; color: #475569; font-size: 9px;">${t.subtotal}</span>
            <span style="color: #1e293b; font-size: 10px;"> ₨${(data.subtotal || data.amount || 0).toLocaleString()}</span>
          </div>
          ${data.companyTax ? `
            <div style="margin-bottom: 3px;">
              <span style="font-weight: 600; color: #475569; font-size: 9px;">${t.companyTax}</span>
              <span style="color: #1e293b; font-size: 10px;"> ₨${data.companyTax.toLocaleString()}</span>
            </div>
          ` : ''}
          <div style="margin-bottom: 3px; border-top: 1px solid #e2e8f0; padding-top: 3px;">
            <span style="font-weight: 600; color: #475569; font-size: 9px;">${t.totalFare}</span>
            <span style="color: #1e293b; font-weight: bold; font-size: 12px;"> ₨${data.totalAmount.toLocaleString()}</span>
          </div>
          ${data.paidAmount !== undefined ? `
            <div style="margin-bottom: 3px;">
              <span style="font-weight: 600; color: #475569; font-size: 9px;">${t.received}</span>
              <span style="color: #059669; font-weight: bold; font-size: 10px;"> ₨${data.paidAmount.toLocaleString()}</span>
            </div>
          ` : ''}
          ${data.remainingAmount !== undefined ? `
            <div style="margin-bottom: 3px;">
              <span style="font-weight: 600; color: #475569; font-size: 9px;">${t.remaining}</span>
              <span style="color: #dc2626; font-weight: bold; font-size: 10px;"> ₨${data.remainingAmount.toLocaleString()}</span>
            </div>
          ` : ''}
        </div>
      `}

      <!-- Footer -->
      <div style="
        margin-top: 15px;
        padding-top: 10px;
        border-top: 2px solid #e2e8f0;
        text-align: center;
      ">
        <div style="
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          gap: 15px;
          margin-bottom: 10px;
        ">
          <div style="text-align: center;">
            <div style="
              width: 60px;
              height: 30px;
              border: 1px solid #cbd5e1;
              margin: 0 auto 4px;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 8px;
              color: #64748b;
            ">
              ${t.customer}
            </div>
            <p style="font-size: 8px; color: #64748b; margin: 0;">${t.signature}</p>
          </div>
          <div style="text-align: center;">
            <div style="
              width: 60px;
              height: 30px;
              border: 1px solid #cbd5e1;
              margin: 0 auto 4px;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 8px;
              color: #64748b;
            ">
              ${t.driver}
            </div>
            <p style="font-size: 8px; color: #64748b; margin: 0;">${t.signature}</p>
          </div>
          <div style="text-align: center;">
            <div style="
              width: 60px;
              height: 30px;
              border: 1px solid #cbd5e1;
              margin: 0 auto 4px;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 8px;
              color: #64748b;
            ">
              ${t.cargoPro}
            </div>
            <p style="font-size: 8px; color: #64748b; margin: 0;">${t.stamp}</p>
          </div>
        </div>
        <p style="
          font-size: 8px;
          color: #64748b;
          margin: 0;
          font-style: italic;
        ">
          ${t.computerGenerated}
        </p>
        <p style="
          font-size: 8px;
          color: #64748b;
          margin: 3px 0 0 0;
        ">
          ${t.generatedOn} ${new Date().toLocaleDateString()} ${language === 'ur' ? 'کو' : 'at'} ${new Date().toLocaleTimeString()}
        </p>
      </div>
    </div>
  `;

  document.body.appendChild(receiptDiv);

  try {
    const canvas = await html2canvas(receiptDiv, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      width: 800,
      height: 800,
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    
    const imgWidth = 210;
    const pageHeight = 295;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    const maxHeight = pageHeight - 20;
    const finalHeight = Math.min(imgHeight, maxHeight);
    
    pdf.addImage(imgData, 'PNG', 10, 10, imgWidth - 20, finalHeight);

    const fileName = `${isBilty ? 'bilty-slip' : 'voucher'}-${documentNumber}-${data.date}.pdf`;
    pdf.save(fileName);

    return fileName;
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw new Error(t.error);
  } finally {
    document.body.removeChild(receiptDiv);
  }
};

// Download Receipt Popup Component
export const DownloadReceiptPopup = ({ 
  data, 
  trigger, 
  onDownload 
}: { 
  data: ReceiptData; 
  trigger: React.ReactNode; 
  onDownload?: (fileName: string) => void;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const { language } = useLanguage();
  const t = receiptTranslations[language];

  const handleDownload = async () => {
    setIsGenerating(true);
    try {
      const fileName = await generatePDFReceipt(data, language);
      setIsOpen(false);
      if (onDownload) {
        onDownload(fileName);
      }
    } catch (error) {
      console.error('Download error:', error);
      alert(t.error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t.downloadReceipt}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            {t.receiptDescription}
          </p>
          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={isGenerating}
            >
              {t.cancel}
            </Button>
            <Button
              onClick={handleDownload}
              disabled={isGenerating}
            >
              {isGenerating ? t.generating : t.download}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}; 