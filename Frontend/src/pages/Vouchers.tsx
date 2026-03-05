import { useState, useEffect } from "react";
import { Plus, Search, Filter, Download, Eye, Edit, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useLanguage } from "@/contexts/LanguageContext";
import { shipmentService } from "@/services/shipmentService";
import { voucherService } from "@/services/voucherService";
import { generatePDFReceipt } from "@/components/ui/pdf-receipt";
import { useToast } from "@/hooks/use-toast";

interface BiltyForVoucher {
  id: string;
  biltyNumber: string;
  senderName: string;
  receiverName: string;
  totalFare: number;
  remainingFare: number;
  receivedFare: number;
  totalCharges: number;
  paymentStatus: string;
  voucher_made: boolean;
  selected?: boolean;
}

interface SelectedBilty {
  biltyId: string;
  biltyNumber: string;
  amount: number;
}

interface Voucher {
  _id: string;
  voucherNumber: string;
  bilties: Array<{
    biltyId: {
      _id: string;
      biltyNumber: string;
      senderName: string;
      receiverName: string;
    };
    biltyNumber: string;
    amount: number;
  }>;
  subtotal: number;
  companyTax: number;
  taxPercentage: number;
  totalAmount: number;
  paymentMethod: string;
  paymentStatus: string;
  paidAmount: number;
  remainingAmount: number;
  notes?: string;
  createdAt: string;
}

export default function Vouchers() {
  const { language } = useLanguage();
  const { toast } = useToast();
  
  // States
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [availableBilties, setAvailableBilties] = useState<BiltyForVoucher[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [selectedVoucher, setSelectedVoucher] = useState<Voucher | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [showOnlyUnpaid, setShowOnlyUnpaid] = useState(true); // Filter to show only unpaid bilties
  const [filterPayment, setFilterPayment] = useState("all");

  // Form states
  const [selectedBilties, setSelectedBilties] = useState<SelectedBilty[]>([]);
  const [formData, setFormData] = useState({

    taxPercentage: 0,
    paymentMethod: "cash",
    paymentStatus: "unpaid",
    paidAmount: 0,
    notes: ""
  });

  // Load data on component mount
  useEffect(() => {
    loadVouchers();
  }, [searchTerm, filterStatus, filterPayment]);

  // Load available bilties when showOnlyUnpaid changes
  useEffect(() => {
    loadAvailableBilties();
  }, [showOnlyUnpaid]);

  const loadVouchers = async () => {
    try {
      setLoading(true);
      const response = await voucherService.getVouchers({
        search: searchTerm,
        status: filterStatus,
        paymentMethod: filterPayment
      });
      setVouchers(response.data || []);
    } catch (error) {
      console.error('Error loading vouchers:', error);
      toast({
        title: language === 'ur' ? 'خرابی' : 'Error',
        description: language === 'ur' ? 'واؤچرز لوڈ کرنے میں خرابی' : 'Failed to load vouchers',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const loadAvailableBilties = async () => {
    try {
      // Use the new endpoint that filters by voucher_made and payment status
      const response = await fetch(`${import.meta.env.VITE_API_URL}/shipments/available-for-vouchers?showOnlyUnpaid=${showOnlyUnpaid}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch available bilties');
      }
      
      const result = await response.json();
      console.log('Available bilties for vouchers:', result.data); // Debug log
      
      const bilties = (result.data || []).map((shipment: any) => {
        console.log('Processing available bilty:', shipment.biltyNumber, 'paymentStatus:', shipment.paymentStatus, 'remainingFare:', shipment.remainingFare, 'voucher_made:', shipment.voucher_made); // Debug log
        return {
          id: shipment.id || shipment._id,
          biltyNumber: shipment.biltyNumber,
          senderName: shipment.senderName,
          receiverName: shipment.receiverName,
          totalFare: shipment.totalFare || 0,
          remainingFare: shipment.remainingFare || 0, // Unpaid amount
          receivedFare: shipment.receivedFare || 0,
          totalCharges: shipment.totalCharges || 0,
          paymentStatus: shipment.paymentStatus || 'unpaid',
          voucher_made: shipment.voucher_made || false
        };
      });
      console.log('Processed available bilties:', bilties); // Debug log
      setAvailableBilties(bilties);
    } catch (error) {
      console.error('Error loading available bilties:', error);
    }
  };

  const fixBiltyAmounts = async () => {
    try {
      console.log('🔧 Fixing bilty amounts...');
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${import.meta.env.VITE_API_URL}/shipments/recalculate-totals`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const result = await response.json();
        console.log('✅ Fix result:', result);
        toast({
          title: language === 'ur' ? 'کامیابی' : 'Success',
          description: result.message,
        });
        // Reload bilties to see updated amounts
        loadAvailableBilties();
      } else {
        const error = await response.text();
        console.error('❌ Fix error:', error);
        toast({
          title: language === 'ur' ? 'خرابی' : 'Error',
          description: 'Failed to fix bilty amounts',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('❌ Network error:', error);
      toast({
        title: language === 'ur' ? 'خرابی' : 'Error',
        description: 'Network error. Make sure backend is running.',
        variant: 'destructive',
      });
    }
  };

  const addBiltyToVoucher = (bilty: BiltyForVoucher) => {
    if (!selectedBilties.find(b => b.biltyId === bilty.id)) {
      // Use the unpaid amount (remainingFare) for the voucher
      setSelectedBilties([...selectedBilties, {
        biltyId: bilty.id,
        biltyNumber: bilty.biltyNumber,
        amount: bilty.remainingFare // Use unpaid amount instead of total fare
      }]);
    }
  };

  const removeBiltyFromVoucher = (biltyId: string) => {
    setSelectedBilties(selectedBilties.filter(b => b.biltyId !== biltyId));
  };

  const calculateSubtotal = () => {
    return selectedBilties.reduce((sum, bilty) => sum + bilty.amount, 0);
  };

  const calculateTax = () => {
    return (calculateSubtotal() * formData.taxPercentage) / 100;
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateTax();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (selectedBilties.length === 0) {
      toast({
        title: language === 'ur' ? 'خرابی' : 'Error',
        description: language === 'ur' ? 'کم از کم ایک بلٹی منتخب کریں' : 'Please select at least one bilty',
        variant: 'destructive',
      });
      return;
    }

    try {
      setLoading(true);
      
      const voucherData = {
        ...formData,
        bilties: selectedBilties,
        subtotal: calculateSubtotal(),
        companyTax: calculateTax(),
        totalAmount: calculateTotal(),
        remainingAmount: calculateTotal() - formData.paidAmount
      };

      await voucherService.createVoucher(voucherData);
      
      toast({
        title: language === 'ur' ? 'کامیاب' : 'Success',
        description: language === 'ur' ? 'واؤچر کامیابی سے بنایا گیا' : 'Voucher created successfully',
      });
    
    // Reset form
      setFormData({

        taxPercentage: 0,
        paymentMethod: "cash",
        paymentStatus: "unpaid",
        paidAmount: 0,
        notes: ""
      });
      setSelectedBilties([]);
      setIsFormOpen(false);
      loadVouchers();
      
    } catch (error) {
      console.error('Error creating voucher:', error);
      toast({
        title: language === 'ur' ? 'خرابی' : 'Error',
        description: language === 'ur' ? 'واؤچر بنانے میں خرابی' : 'Failed to create voucher',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleViewVoucher = (voucher: Voucher) => {
    setSelectedVoucher(voucher);
    setIsViewOpen(true);
  };

  const handleDownloadVoucherReceipt = async (voucher: Voucher) => {
    try {
    const receiptData = {
      documentNumber: voucher.voucherNumber,
      voucherNumber: voucher.voucherNumber,
        date: new Date(voucher.createdAt).toLocaleDateString(),
    
        
        // Financial details
        amount: voucher.subtotal,
        subtotal: voucher.subtotal,
        companyTax: voucher.companyTax,
        taxPercentage: voucher.taxPercentage,
        totalAmount: voucher.totalAmount,
        paidAmount: voucher.paidAmount,
        remainingAmount: voucher.remainingAmount,
        
        // Payment details
      paymentMethod: voucher.paymentMethod,
        paymentStatus: voucher.paymentStatus,
        
        // Document type and bilties
        type: 'voucher' as const,
        bilties: voucher.bilties.map(bilty => ({
          biltyNumber: bilty.biltyNumber,
          date: bilty.biltyId?.dateTime ? new Date(bilty.biltyId.dateTime).toLocaleDateString() : '-',
          addaName: bilty.biltyId?.addaName || '-',
          senderName: bilty.biltyId?.senderName || '-',
          receiverName: bilty.biltyId?.receiverName || '-',
          quantity: bilty.biltyId?.items ? bilty.biltyId.items.reduce((sum, item) => sum + (item.quantity || 0), 0) : '-',
          totalCharges: bilty.biltyId?.totalCharges ?? '-',
          receivedFare: bilty.biltyId?.receivedFare ?? '-',
          remainingFare: bilty.biltyId?.remainingFare ?? '-',
        })),
        
        // Additional details
        notes: voucher.notes || '',
        
        // Required dummy values for the interface
  
        receiverName: '',
        receiverPhone: '',
        receiverAddress: '',
        quantity: voucher.bilties.length,
      weight: 0,
        details: voucher.bilties.map(b => b.biltyNumber).join(', '),
        fare: voucher.subtotal,
      localCharges: 0,
      mazdoori: 0,
      biltyCharges: 0,
        deliveryStatus: voucher.paymentStatus,
        vehicleNumber: '',
        driverName: '',
        pickupType: 'delivery'
      };
      
      await generatePDFReceipt(receiptData, language);
      
      toast({
        title: language === 'ur' ? 'رسید ڈاؤن لوڈ ہو گئی' : 'Receipt Downloaded',
        description: language === 'ur' 
          ? `${voucher.voucherNumber} کی رسید کامیابی سے ڈاؤن لوڈ ہو گئی` 
          : `Receipt for ${voucher.voucherNumber} has been downloaded successfully`,
      });
      
    } catch (error) {
      console.error('Error generating voucher receipt:', error);
      toast({
        title: language === 'ur' ? 'خرابی' : 'Error',
        description: language === 'ur' ? 'رسید ڈاؤن لوڈ کرنے میں خرابی' : 'Failed to download receipt',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteVoucher = async (id: string) => {
    try {
      await voucherService.deleteVoucher(id);
      toast({ title: 'Voucher deleted!' });
      loadVouchers();
    } catch {
      toast({ title: 'Failed to delete voucher', variant: 'destructive' });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'partial': return 'bg-yellow-100 text-yellow-800';
      case 'unpaid': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {language === 'ur' ? 'واؤچر مینجمنٹ' : 'Voucher Management'}
          </h1>
          <p className="text-gray-600 mt-1">
            {language === 'ur' ? 'ملٹیپل بلٹی واؤچرز کا انتظام' : 'Manage multi-bilty vouchers with tax calculation'}
          </p>
        </div>
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-primary  text-white" disabled={loading}>
              <Plus className="w-4 h-4 mr-2" />
              {language === 'ur' ? 'نیا واؤچر' : 'New Voucher'}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {language === 'ur' ? 'نیا واؤچر بنائیں' : 'Create New Voucher'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Bilty Selection */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">
                    {language === 'ur' ? 'بلٹی کا انتخاب' : 'Select Bilties'}
                  </h3>
        <Button 
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={fixBiltyAmounts}
                    className="text-blue-600 border-blue-600 hover:bg-blue-50"
                  >
                    🔧 {language === 'ur' ? 'رقم ٹھیک کریں' : 'Fix Amounts'}
                  </Button>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <Label>{language === 'ur' ? 'دستیاب بلٹیز' : 'Available Bilties'}</Label>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="showOnlyUnpaid"
                      checked={showOnlyUnpaid}
                      onChange={(e) => setShowOnlyUnpaid(e.target.checked)}
                      className="w-4 h-4 text-blue-600 rounded"
                    />
                    <label htmlFor="showOnlyUnpaid" className="text-sm text-gray-600">
                      {language === 'ur' ? 'صرف غیر ادا شدہ' : 'Only Unpaid'}
                    </label>
                  </div>
                </div>
                <div className="text-xs text-gray-500 mb-2">
                  {language === 'ur' ? 'صرف وہ بلٹیز دکھائی جاتی ہیں جو پہلے سے واؤچر میں استعمال نہیں ہوئے' : 'Only bilties that have not been used in vouchers are shown'}
                </div>
                {/* Bilty Checkboxes */}
                <div className="space-y-2 max-h-64 overflow-y-auto border rounded p-2 bg-gray-50">
                  {availableBilties.filter(bilty => {
                    if (showOnlyUnpaid) {
                      // Show only bilties that are unpaid (paymentStatus !== 'paid' AND remainingFare > 0)
                      return bilty.paymentStatus !== 'paid' && bilty.remainingFare > 0;
                    }
                    return true; // Show all bilties if filter is off
                  }).length === 0 ? (
                    <div className="p-2 text-center text-gray-500">
                      {language === 'ur' ? 'کوئی بلٹی دستیاب نہیں' : showOnlyUnpaid ? 'No unpaid bilties available' : 'No bilties available'}
                    </div>
                  ) : (
                    availableBilties.filter(bilty => {
                      if (showOnlyUnpaid) {
                        // Show only bilties that are unpaid (paymentStatus !== 'paid' AND remainingFare > 0)
                        return bilty.paymentStatus !== 'paid' && bilty.remainingFare > 0;
                      }
                      return true; // Show all bilties if filter is off
                    }).map((bilty) => (
                      <div key={bilty.id} className="flex items-center gap-2 border-b last:border-b-0 py-1">
                        <input
                          type="checkbox"
                          id={`bilty-${bilty.id}`}
                          checked={selectedBilties.some(b => b.biltyId === bilty.id)}
                          onChange={e => {
                            if (e.target.checked) addBiltyToVoucher(bilty);
                            else removeBiltyFromVoucher(bilty.id);
                          }}
                          className="w-4 h-4 text-blue-600 rounded"
                        />
                        <label htmlFor={`bilty-${bilty.id}`} className="flex-1 cursor-pointer">
                          <div className="flex flex-col">
                            <span className="font-medium">{bilty.biltyNumber} - {bilty.senderName} → {bilty.receiverName}</span>
                            <span className="text-xs text-gray-500">
                              Total: PKR {bilty.totalCharges.toLocaleString()} | Paid: PKR {bilty.receivedFare.toLocaleString()} | 
                              <span className="font-bold text-red-600">{language === 'ur' ? 'باقی:' : 'Remaining:'} PKR {bilty.remainingFare.toLocaleString()}</span>
                            </span>
                          </div>
                          <div className="flex flex-col items-end">
                            <span className={`font-bold ${bilty.paymentStatus === 'paid' ? 'text-green-600' : 'text-red-600'}`}>
                              {bilty.paymentStatus === 'paid' ? 'PAID' : 'UNPAID'}: PKR {bilty.remainingFare.toLocaleString()}
                            </span>
                            {bilty.paymentStatus === 'paid' && <span className="text-xs text-green-500">(Fully Paid)</span>}
                            {bilty.paymentStatus !== 'paid' && bilty.remainingFare === 0 && <span className="text-xs text-blue-500">(No Balance)</span>}
                            {bilty.voucher_made && <span className="text-xs text-orange-500">(Voucher Made)</span>}
                          </div>
                        </label>
                      </div>
                    ))
                  )}
                </div>
              </div>
              {/* Tax, Payment, and Notes Section (unchanged) */}

              {/* Tax and Payment */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">
                  {language === 'ur' ? 'ٹیکس اور ادائیگی' : 'Tax & Payment'}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                    <Label htmlFor="taxPercentage">
                      {language === 'ur' ? 'کمپنی ٹیکس (%)' : 'Company Tax (%)'}
                    </Label>
                    <Input
                      id="taxPercentage"
                      type="number"
                      min="0"
                      max="100"
                      step="0.1"
                      value={formData.taxPercentage}
                      onChange={(e) => setFormData({...formData, taxPercentage: parseFloat(e.target.value) || 0})}
                      placeholder="0"
                    />
              </div>
              <div>
                    <Label htmlFor="paymentMethod">
                      {language === 'ur' ? 'ادائیگی کا طریقہ' : 'Payment Method'}
                    </Label>
                    <Select
                      value={formData.paymentMethod}
                      onValueChange={(value) => setFormData({...formData, paymentMethod: value})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cash">{language === 'ur' ? 'نقد' : 'Cash'}</SelectItem>
                        <SelectItem value="card">{language === 'ur' ? 'کارڈ' : 'Card'}</SelectItem>
                        <SelectItem value="bank_transfer">{language === 'ur' ? 'بینک ٹرانسفر' : 'Bank Transfer'}</SelectItem>
                        <SelectItem value="check">{language === 'ur' ? 'چیک' : 'Check'}</SelectItem>
                      </SelectContent>
                    </Select>
            </div>
              <div>
                    <Label htmlFor="paidAmount">
                      {language === 'ur' ? 'ادا شدہ رقم' : 'Paid Amount'}
                    </Label>
                    <Input
                      id="paidAmount"
                      type="number"
                      min="0"
                      value={formData.paidAmount}
                      onChange={(e) => setFormData({...formData, paidAmount: parseFloat(e.target.value) || 0})}
                      placeholder="0"
                    />
              </div>
              <div>
                    <Label htmlFor="paymentStatus">
                      {language === 'ur' ? 'ادائیگی کی حالت' : 'Payment Status'}
                    </Label>
                    <Select
                      value={formData.paymentStatus}
                      onValueChange={(value) => setFormData({...formData, paymentStatus: value})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="paid">{language === 'ur' ? 'ادا شدہ' : 'Paid'}</SelectItem>
                        <SelectItem value="unpaid">{language === 'ur' ? 'غیر ادا شدہ' : 'Unpaid'}</SelectItem>
                        <SelectItem value="partial">{language === 'ur' ? 'جزوی' : 'Partial'}</SelectItem>
                      </SelectContent>
                    </Select>
            </div>
            </div>

              <div>
                  <Label htmlFor="notes">
                    {language === 'ur' ? 'نوٹس (اختیاری)' : 'Notes (Optional)'}
                  </Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData({...formData, notes: e.target.value})}
                    placeholder={language === 'ur' ? 'اضافی نوٹس' : 'Additional notes'}
                    rows={3}
                  />
              </div>
            </div>

              {/* Summary */}
              {selectedBilties.length > 0 && (
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg space-y-3 border border-blue-200">
                  <h4 className="font-semibold text-lg text-blue-900">
                    {language === 'ur' ? 'مالی خلاصہ' : 'Financial Summary'}
                    <span className="text-xs font-normal text-blue-600 ml-2">
                      ({language === 'ur' ? 'غیر ادا شدہ رقم کی بنیاد پر' : 'Based on unpaid amounts'})
                    </span>
                  </h4>
                  <div className="space-y-2 text-sm">
                    {/* Bilties Count */}
                    <div className="flex justify-between text-gray-600">
                      <span>{language === 'ur' ? 'منتخب بلٹیز:' : 'Selected Bilties:'}</span>
                      <span className="font-medium">{selectedBilties.length}</span>
      </div>

                    {/* Subtotal */}
                    <div className="flex justify-between">
                      <span className="font-medium">{language === 'ur' ? 'کل غیر ادا شدہ:' : 'Total Unpaid:'}</span>
                      <span className="font-semibold text-red-600">PKR {calculateSubtotal().toLocaleString()}</span>
                    </div>
                    
                    {/* Tax Rate and Amount */}
                    <div className="flex justify-between">
                      <span className="font-medium">
                        {language === 'ur' ? 'کمپنی ٹیکس' : 'Company Tax'} ({formData.taxPercentage}%):
                      </span>
                      <span className="font-semibold text-orange-600">PKR {calculateTax().toLocaleString()}</span>
                    </div>
                    
                    {/* Total Amount */}
                    <div className="flex justify-between font-bold text-lg border-t pt-2 border-blue-300">
                      <span className="text-blue-900">{language === 'ur' ? 'کل واؤچر رقم:' : 'Total Voucher Amount:'}</span>
                      <span className="text-green-700">PKR {calculateTotal().toLocaleString()}</span>
                    </div>
                    
                    {/* Remaining Amount if partially paid */}
                    {formData.paidAmount > 0 && (
                      <>
                        <div className="flex justify-between text-green-600">
                          <span>{language === 'ur' ? 'ادا شدہ رقم:' : 'Paid Amount:'}</span>
                          <span className="font-semibold">PKR {formData.paidAmount.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-red-600">
                          <span>{language === 'ur' ? 'باقی رقم:' : 'Remaining Amount:'}</span>
                          <span className="font-semibold">PKR {(calculateTotal() - formData.paidAmount).toLocaleString()}</span>
              </div>
                      </>
                    )}
            </div>
              </div>
              )}

              <div className="flex justify-end space-x-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)}>
                  {language === 'ur' ? 'منسوخ' : 'Cancel'}
                </Button>
                <Button type="submit" disabled={loading || selectedBilties.length === 0}>
                  {loading ? 'Creating...' : (language === 'ur' ? 'واؤچر بنائیں' : 'Create Voucher')}
                </Button>
            </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="w-5 h-5" />
            {language === 'ur' ? 'تلاش اور فلٹر' : 'Search & Filter'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="search">
                {language === 'ur' ? 'تلاش' : 'Search'}
              </Label>
              <Input
                id="search"
                placeholder={language === 'ur' ? 'واؤچر نمبر، کسٹمر تلاش کریں' : 'Search by voucher number, customer'}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="statusFilter">
                {language === 'ur' ? 'ادائیگی کی حالت' : 'Payment Status'}
              </Label>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger>
                  <SelectValue />
              </SelectTrigger>
              <SelectContent>
                  <SelectItem value="all">{language === 'ur' ? 'تمام' : 'All'}</SelectItem>
                <SelectItem value="paid">{language === 'ur' ? 'ادا شدہ' : 'Paid'}</SelectItem>
                  <SelectItem value="unpaid">{language === 'ur' ? 'غیر ادا شدہ' : 'Unpaid'}</SelectItem>
                  <SelectItem value="partial">{language === 'ur' ? 'جزوی' : 'Partial'}</SelectItem>
              </SelectContent>
            </Select>
            </div>
            <div>
              <Label htmlFor="paymentFilter">
                {language === 'ur' ? 'ادائیگی کا طریقہ' : 'Payment Method'}
              </Label>
              <Select value={filterPayment} onValueChange={setFilterPayment}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{language === 'ur' ? 'تمام' : 'All'}</SelectItem>
                  <SelectItem value="cash">{language === 'ur' ? 'نقد' : 'Cash'}</SelectItem>
                  <SelectItem value="card">{language === 'ur' ? 'کارڈ' : 'Card'}</SelectItem>
                  <SelectItem value="bank_transfer">{language === 'ur' ? 'بینک ٹرانسفر' : 'Bank Transfer'}</SelectItem>
                  <SelectItem value="check">{language === 'ur' ? 'چیک' : 'Check'}</SelectItem>
              </SelectContent>
            </Select>
            </div>
            <div className="flex items-end">
              <Button onClick={loadVouchers} className="w-full" disabled={loading}>
                <Filter className="w-4 h-4 mr-2" />
                {loading ? 'Loading...' : (language === 'ur' ? 'تازہ کریں' : 'Refresh')}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Vouchers List */}
      <Card>
        <CardHeader>
          <CardTitle>
            {language === 'ur' ? 'واؤچرز کی فہرست' : 'Vouchers List'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              {language === 'ur' ? 'لوڈ ہو رہا ہے...' : 'Loading...'}
            </div>
          ) : vouchers.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {language === 'ur' ? 'کوئی واؤچر نہیں ملا' : 'No vouchers found'}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{language === 'ur' ? 'واؤچر نمبر' : 'Voucher Number'}</TableHead>
                  {/* <TableHead>{language === 'ur' ? 'کسٹمر' : 'Customer'}</TableHead> */}
                  <TableHead>{language === 'ur' ? 'بلٹیز' : 'Bilties'}</TableHead>
                  <TableHead>{language === 'ur' ? 'کل رقم' : 'Total Amount'}</TableHead>
                  <TableHead>{language === 'ur' ? 'ادائیگی' : 'Payment'}</TableHead>
                  <TableHead>{language === 'ur' ? 'تاریخ' : 'Date'}</TableHead>
                  <TableHead>{language === 'ur' ? 'عمل' : 'Actions'}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {vouchers.map((voucher) => (
                  <TableRow key={voucher._id}>
                    <TableCell className="font-medium">{voucher.voucherNumber}</TableCell>
                    {/* <TableCell>
                      <div>
                        <div className="font-medium">{voucher.customerName}</div>
                        <div className="text-sm text-gray-500">{voucher.customerPhone}</div>
                      </div>
                    </TableCell> */}
                    <TableCell>
                      <Badge variant="outline">
                        {voucher.bilties.length} {language === 'ur' ? 'بلٹیز' : 'Bilties'}
                      </Badge>
                    </TableCell>
                    <TableCell>PKR {voucher.totalAmount.toLocaleString()}</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(voucher.paymentStatus)}>
                        {voucher.paymentStatus === 'paid' 
                          ? (language === 'ur' ? 'ادا شدہ' : 'Paid')
                          : voucher.paymentStatus === 'partial'
                          ? (language === 'ur' ? 'جزوی' : 'Partial')
                          : (language === 'ur' ? 'غیر ادا شدہ' : 'Unpaid')
                        }
                      </Badge>
                    </TableCell>
                    <TableCell>{new Date(voucher.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleViewVoucher(voucher)}
                        >
                          <Eye className="w-4 h-4" />
                          </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDownloadVoucherReceipt(voucher)}
                        >
                          <Download className="w-4 h-4" />
                          </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeleteVoucher(voucher._id)}
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </Button>
                                </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* View Voucher Dialog */}
      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>
              {language === 'ur' ? 'واؤچر کی تفصیلات' : 'Voucher Details'}
            </DialogTitle>
          </DialogHeader>
          {selectedVoucher && (
            <div className="space-y-6">
              {/* Voucher Header */}
              <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                <div>
                  <strong>{language === 'ur' ? 'واؤچر نمبر:' : 'Voucher Number:'}</strong> {selectedVoucher.voucherNumber}
              </div>
                <div>
                  <strong>{language === 'ur' ? 'تاریخ:' : 'Date:'}</strong> {new Date(selectedVoucher.createdAt).toLocaleDateString()}
              </div>
            </div>

              {/* Bilties */}
              <div>
                <h4 className="font-semibold text-lg mb-3">{language === 'ur' ? 'شامل بلٹیز' : 'Included Bilties'}</h4>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{language === 'ur' ? 'بلٹی نمبر' : 'Bilty Number'}</TableHead>
                      <TableHead>{language === 'ur' ? 'تاریخ' : 'Date'}</TableHead>
                      <TableHead>{language === 'ur' ? 'ادا کا نام' : 'Adda Name'}</TableHead>
                      <TableHead>{language === 'ur' ? 'بھیجنے والا' : 'Sender'}</TableHead>
                      <TableHead>{language === 'ur' ? 'وصول کنندہ' : 'Receiver'}</TableHead>
                      <TableHead>{language === 'ur' ? 'مقدار' : 'Quantity'}</TableHead>
                      <TableHead>{language === 'ur' ? 'کل چارجز' : 'Total Charges'}</TableHead>
                      <TableHead>{language === 'ur' ? 'وصول شدہ' : 'Received'}</TableHead>
                      <TableHead>{language === 'ur' ? 'باقی' : 'Remaining'}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedVoucher.bilties.map((bilty, index) => (
                      <TableRow key={index}>
                        <TableCell>{bilty.biltyNumber}</TableCell>
                        <TableCell>{bilty.biltyId?.dateTime ? new Date(bilty.biltyId.dateTime).toLocaleDateString() : '-'}</TableCell>
                        <TableCell>{bilty.biltyId?.addaName || '-'}</TableCell>
                        <TableCell>{bilty.biltyId?.senderName || '-'}</TableCell>
                        <TableCell>{bilty.biltyId?.receiverName || '-'}</TableCell>
                        <TableCell>{bilty.biltyId?.items ? bilty.biltyId.items.reduce((sum, item) => sum + (item.quantity || 0), 0) : '-'}</TableCell>
                        <TableCell>PKR {bilty.biltyId?.totalCharges?.toLocaleString() ?? '-'}</TableCell>
                        <TableCell>PKR {bilty.biltyId?.receivedFare?.toLocaleString() ?? '-'}</TableCell>
                        <TableCell>PKR {bilty.biltyId?.remainingFare?.toLocaleString() ?? '-'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
          </div>

              {/* Financial Summary */}
              <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                <div><strong>{language === 'ur' ? 'ذیلی کل:' : 'Subtotal:'}</strong> PKR {selectedVoucher.subtotal.toLocaleString()}</div>
                <div><strong>{language === 'ur' ? 'کمپنی ٹیکس:' : 'Company Tax:'}</strong> PKR {selectedVoucher.companyTax.toLocaleString()}</div>
                <div><strong>{language === 'ur' ? 'کل رقم:' : 'Total Amount:'}</strong> PKR {selectedVoucher.totalAmount.toLocaleString()}</div>
                <div><strong>{language === 'ur' ? 'ادا شدہ:' : 'Paid Amount:'}</strong> PKR {selectedVoucher.paidAmount.toLocaleString()}</div>
                <div><strong>{language === 'ur' ? 'باقی:' : 'Remaining:'}</strong> PKR {selectedVoucher.remainingAmount.toLocaleString()}</div>
                <div>
                  <strong>{language === 'ur' ? 'ادائیگی:' : 'Payment:'}</strong>
                  <Badge className={`ml-2 ${getStatusColor(selectedVoucher.paymentStatus)}`}>
                    {selectedVoucher.paymentStatus === 'paid' 
                      ? (language === 'ur' ? 'ادا شدہ' : 'Paid')
                      : selectedVoucher.paymentStatus === 'partial'
                      ? (language === 'ur' ? 'جزوی' : 'Partial')
                      : (language === 'ur' ? 'غیر ادا شدہ' : 'Unpaid')
                    }
                  </Badge>
              </div>
            </div>

              {/* Download Actions */}
              <div className="flex justify-end pt-4 border-t">
            <Button 
                  onClick={() => handleDownloadVoucherReceipt(selectedVoucher)}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                    <Download className="w-4 h-4 mr-2" />
                  {language === 'ur' ? 'واؤچر ڈاؤن لوڈ کریں' : 'Download Voucher'}
                  </Button>
              </div>
            </div>
            )}
        </DialogContent>
      </Dialog>
    </div>
  );
}