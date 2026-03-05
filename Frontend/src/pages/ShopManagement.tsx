import { useState, useEffect, useRef } from "react";
import { Plus, Search, Filter, Edit, Trash2, Building, DollarSign, FileText, Calendar, MapPin, Users, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { useLanguage } from "@/contexts/LanguageContext";
import { getAllShops, createShop, updateShop, deleteShop, getShopWithRentPayments } from "@/services/shopService";
import { createRentPayment, updateRentPayment, deleteRentPayment, getAllRentPayments } from "@/services/rentPaymentService";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";


// Declare jsPDF types for TypeScript
declare global {
  interface Window {
    jsPDF: any;
    jspdfAutoTable: any;
  }
}

interface ShopData {
  _id: string;
  name: string;
  location: string;
  size: string;
  rent: number;
  tenant: string;
  status: 'occupied' | 'vacant' | 'under-renovation';
  startDate: string;
  endDate: string;
  monthlyRent: number;
  securityDeposit: number;
  utilities: number;
  maintenance: number;
  createdAt: string;
}

interface RentPayment {
  _id: string;
  shop: string | { _id: string };
  month: string;
  year: number;
  amount: number;
  paid: boolean;
  createdAt: string;
}

interface FinancialReport {
  _id: string;
  month: string;
  year: number;
  totalRent: number;
  totalExpenses: number;
  netIncome: number;
  occupancyRate: number;
  outstandingPayments: number;
  collectedPayments: number;
}

export default function ShopManagement() {
  const { language } = useLanguage();
  const [activeTab, setActiveTab] = useState<'shops' | 'rental' | 'financial'>('shops');
  const [shops, setShops] = useState<ShopData[]>([]);
  const [financialReports, setFinancialReports] = useState<FinancialReport[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isShopFormOpen, setIsShopFormOpen] = useState(false);
  const [selectedShop, setSelectedShop] = useState<ShopData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Shop form state
  const [shopForm, setShopForm] = useState<Partial<ShopData>>({
    name: "",
    location: "",
    size: "",
    rent: 0,
    tenant: "",
    status: 'vacant',
    startDate: "",
    endDate: "",
    monthlyRent: 0,
    securityDeposit: 0,
    utilities: 0,
    maintenance: 0
  });

  // State for shop detail modal
  const [selectedShopForDetail, setSelectedShopForDetail] = useState<ShopData | null>(null);
  const [isShopDetailOpen, setIsShopDetailOpen] = useState(false);
  const [rentPayments, setRentPayments] = useState<RentPayment[]>([]);

  // State for rent payment editing
  const [isRentPaymentFormOpen, setIsRentPaymentFormOpen] = useState(false);
  const [editingPayment, setEditingPayment] = useState<RentPayment | null>(null);
  const [rentPaymentForm, setRentPaymentForm] = useState({
    month: '',
    year: new Date().getFullYear(),
    amount: 0,
    paid: false
  });

  // State to hold all rent payments
  const [allRentPayments, setAllRentPayments] = useState<RentPayment[]>([]);

  // State for report modals
  const [reportModal, setReportModal] = useState<{ type: 'monthly' | 'yearly' | null, shop: ShopData | null }>({ type: null, shop: null });
  const [selectedMonth, setSelectedMonth] = useState<string>("January");
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const reportRef = useRef<HTMLDivElement>(null);

  // Months array for reports
  const months = ["January", "February", "March", "April", "May", "June", 
                 "July", "August", "September", "October", "November", "December"];

  // Fetch shops on component mount
  useEffect(() => {
    fetchShops();
    fetchAllRentPayments();
  }, []);

  // Fetch shops from backend
  const fetchShops = async () => {
    try {
      setLoading(true);
      setError(null);
      const shopsData = await getAllShops();
      setShops(shopsData);
    } catch (err) {
      setError('Failed to fetch shops');
      console.error('Error fetching shops:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch all rent payments
  const fetchAllRentPayments = async () => {
    try {
      const payments = await getAllRentPayments();
      setAllRentPayments(payments);
    } catch (err) {
      console.error('Error fetching allRentPayments:', err);
    }
  };

  // Helper to check if shop is an object
  function isShopObject(shop: unknown): shop is { _id: string } {
    return typeof shop === 'object' && shop !== null && '_id' in shop;
  }

  // Get total paid amount for a shop
  const getTotalPaidForShop = (shopId: string) => {
    return allRentPayments
      .filter(p => {
        const shopMatch = isShopObject(p.shop) ? p.shop._id === shopId : p.shop === shopId;
        return shopMatch && p.paid;
      })
      .reduce((sum, p) => sum + p.amount, 0);
  };

  // Get payments for a shop, month, year
  const getPaymentsForShopMonthYear = (shopId: string, month: string, year: number) => {
    return allRentPayments.filter(p => {
      const shopMatch = isShopObject(p.shop) ? p.shop._id === shopId : p.shop === shopId;
      return shopMatch && p.month === month && p.year === year;
    });
  };

  // Get payments for a shop, year
  const getPaymentsForShopYear = (shopId: string, year: number) => {
    return allRentPayments.filter(p => {
      const shopMatch = isShopObject(p.shop) ? p.shop._id === shopId : p.shop === shopId;
      return shopMatch && p.year === year;
    });
  };

  // Get current month name
  const getCurrentMonthName = () => {
    return months[new Date().getMonth()];
  };

  // Handle PDF export
 
const handleDownloadPDF = () => {
  if (!reportModal.shop) return;

  const doc = new jsPDF();

  let title = `${reportModal.shop.name} - `;
  let tableData: any[][] = [];
  let headers: string[] = [];

  if (reportModal.type === 'monthly') {
    title += `${selectedMonth} ${selectedYear} Report`;
    headers = ['Month', 'Year', 'Amount', 'Paid'];
    const payments = getPaymentsForShopMonthYear(reportModal.shop._id, selectedMonth, selectedYear);
    tableData = payments.map(p => [
      p.month,
      p.year,
      `Rs ${p.amount.toLocaleString()}`,
      p.paid ? 'Paid' : 'Unpaid'
    ]);
  } else if (reportModal.type === 'yearly') {
    title += `${selectedYear} Yearly Report`;
    headers = ['Month', 'Total Paid', 'Total Unpaid'];

    let totalPaid = 0;
    let totalUnpaid = 0;

    tableData = months.map(m => {
      const payments = getPaymentsForShopYear(reportModal.shop._id, selectedYear).filter(p => p.month === m);
      const paid = payments.filter(p => p.paid).reduce((sum, p) => sum + p.amount, 0);
      const unpaid = payments.filter(p => !p.paid).reduce((sum, p) => sum + p.amount, 0);

      totalPaid += paid;
      totalUnpaid += unpaid;

      return [
        m,
        `Rs ${paid.toLocaleString()}`,
        `Rs ${unpaid.toLocaleString()}`
      ];
    });

    // Add total row at the bottom
    tableData.push([
      'Total',
      `Rs ${totalPaid.toLocaleString()}`,
      `Rs ${totalUnpaid.toLocaleString()}`
    ]);
  }

  doc.text(title, 10, 10);

  autoTable(doc, {
    head: [headers],
    body: tableData,
    startY: 20,
    styles: {
      font: 'helvetica',
    },
    headStyles: {
      fillColor: [33, 150, 243], // blue
      textColor: 255,
      halign: 'center',
    },
    bodyStyles: {
      halign: 'center',
    },
    didParseCell: function (data) {
      // If it's the last row (Total), color it blue
      const isTotalRow = data.row.index === tableData.length - 1;
      if (isTotalRow && data.section === 'body') {
        data.cell.styles.fillColor = [33, 150, 243]; // blue background
        data.cell.styles.textColor = 255; // white text
        data.cell.styles.fontStyle = 'bold';
      }
    }
  });

  doc.save(`${reportModal.shop.name}-${reportModal.type === 'monthly' ? selectedMonth + '-' : ''}${selectedYear}-report.pdf`);
};

  // Handle shop form submission
  const handleShopSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      
      if (selectedShop) {
        // Update existing shop
        const updatedShop = await updateShop(selectedShop._id, shopForm);
        setShops(shops.map(shop => shop._id === selectedShop._id ? updatedShop : shop));
        setSelectedShop(null);
      } else {
        // Create new shop
        const newShop = await createShop(shopForm);
        setShops([newShop, ...shops]);
      }
      
      // Reset form
      setShopForm({
        name: "",
        location: "",
        size: "",
        rent: 0,
        tenant: "",
        status: 'vacant',
        startDate: "",
        endDate: "",
        monthlyRent: 0,
        securityDeposit: 0,
        utilities: 0,
        maintenance: 0
      });
      setIsShopFormOpen(false);
    } catch (err) {
      setError('Failed to save shop');
      console.error('Error saving shop:', err);
    } finally {
      setLoading(false);
    }
  };

  // Handle shop deletion
  const handleDeleteShop = async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      await deleteShop(id);
      setShops(shops.filter(shop => shop._id !== id));
    } catch (err) {
      setError('Failed to delete shop');
      console.error('Error deleting shop:', err);
    } finally {
      setLoading(false);
    }
  };

  // Handle shop detail view
  const handleShopDetail = async (shop: ShopData) => {
    try {
      setSelectedShopForDetail(shop);
      const shopWithPayments = await getShopWithRentPayments(shop._id);
      setRentPayments(shopWithPayments.rentPayments || []);
      setIsShopDetailOpen(true);
    } catch (err) {
      setError('Failed to fetch shop details');
      console.error('Error fetching shop details:', err);
    }
  };

  // Handle rent payment submission
  const handleAddRentPayment = async () => {
    if (selectedShopForDetail) {
      try {
        setLoading(true);
        setError(null);
        
        const newPayment = await createRentPayment({
          shop: selectedShopForDetail._id,
          ...rentPaymentForm
        });
        
        setRentPayments([...rentPayments, newPayment]);
        setRentPaymentForm({ month: '', year: new Date().getFullYear(), amount: 0, paid: false });
        setIsRentPaymentFormOpen(false);
      } catch (err) {
        setError('Failed to add rent payment');
        console.error('Error adding rent payment:', err);
      } finally {
        setLoading(false);
      }
    }
  };

  // Handle rent payment update
  const handleUpdateRentPayment = async () => {
    if (editingPayment) {
      try {
        setLoading(true);
        setError(null);
        
        const updatedPayment = await updateRentPayment(editingPayment._id, rentPaymentForm);
        setRentPayments(rentPayments.map(payment => 
          payment._id === editingPayment._id ? updatedPayment : payment
        ));
        setEditingPayment(null);
        setRentPaymentForm({ month: '', year: new Date().getFullYear(), amount: 0, paid: false });
        setIsRentPaymentFormOpen(false);
      } catch (err) {
        setError('Failed to update rent payment');
        console.error('Error updating rent payment:', err);
      } finally {
        setLoading(false);
      }
    }
  };

  // Handle rent payment deletion
  const handleDeleteRentPayment = async (paymentId: string) => {
    try {
      setLoading(true);
      setError(null);
      await deleteRentPayment(paymentId);
      setRentPayments(rentPayments.filter(payment => payment._id !== paymentId));
    } catch (err) {
      setError('Failed to delete rent payment');
      console.error('Error deleting rent payment:', err);
    } finally {
      setLoading(false);
    }
  };

  // Handle edit rent payment
  const handleEditRentPayment = (payment: RentPayment) => {
    setEditingPayment(payment);
    setRentPaymentForm({
      month: payment.month,
      year: payment.year,
      amount: payment.amount,
      paid: payment.paid
    });
    setIsRentPaymentFormOpen(true);
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'occupied':
        return "bg-green-100 text-green-800";
      case 'vacant':
        return "bg-red-100 text-red-800";
      case 'under-renovation':
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Get status text
  const getStatusText = (status: string) => {
    switch (status) {
      case 'occupied':
        return language === 'ur' ? 'آباد' : 'Occupied';
      case 'vacant':
        return language === 'ur' ? 'خالی' : 'Vacant';
      case 'under-renovation':
        return language === 'ur' ? 'ترمیم جاری' : 'Under Renovation';
      default:
        return status;
    }
  };

  // Filter shops based on search term
  const filteredShops = shops.filter(shop =>
    shop.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    shop.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
    shop.tenant.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {language === 'ur' ? 'شاپ مینجمنٹ' : 'Shop Management'}
          </h1>
          <p className="text-gray-600 mt-1">
            {language === 'ur' ? 'شاپوں کا انتظام' : 'Manage shops'}
          </p>
        </div>
        <div className="flex space-x-2">
          <Dialog open={isShopFormOpen} onOpenChange={setIsShopFormOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-primary  text-white">
                <Plus className="w-4 h-4 mr-2" />
                {language === 'ur' ? 'نیا شاپ' : 'New Shop'}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  {selectedShop ? (language === 'ur' ? 'شاپ میں ترمیم کریں' : 'Edit Shop') : (language === 'ur' ? 'نیا شاپ شامل کریں' : 'Add New Shop')}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleShopSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="shopName">
                      {language === 'ur' ? 'شاپ کا نام' : 'Shop Name'}
                    </Label>
                    <Input
                      id="shopName"
                      value={shopForm.name}
                      onChange={(e) => setShopForm({...shopForm, name: e.target.value})}
                      placeholder={language === 'ur' ? 'شاپ کا نام درج کریں' : 'Enter shop name'}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="shopLocation">
                      {language === 'ur' ? 'مقام' : 'Location'}
                    </Label>
                    <Input
                      id="shopLocation"
                      value={shopForm.location}
                      onChange={(e) => setShopForm({...shopForm, location: e.target.value})}
                      placeholder={language === 'ur' ? 'مقام درج کریں' : 'Enter location'}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="shopSize">
                      {language === 'ur' ? 'سائز' : 'Size'}
                    </Label>
                    <Input
                      id="shopSize"
                      value={shopForm.size}
                      onChange={(e) => setShopForm({...shopForm, size: e.target.value})}
                      placeholder={language === 'ur' ? 'سائز درج کریں' : 'Enter size'}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="monthlyRent">
                      {language === 'ur' ? 'ماہانہ کرایہ' : 'Monthly Rent'}
                    </Label>
                    <Input
                      id="monthlyRent"
                      type="number"
                      value={shopForm.monthlyRent}
                      onChange={(e) => setShopForm({...shopForm, monthlyRent: Number(e.target.value)})}
                      placeholder={language === 'ur' ? 'ماہانہ کرایہ درج کریں' : 'Enter monthly rent'}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="tenant">
                      {language === 'ur' ? 'کرایہ دار' : 'Tenant'}
                    </Label>
                    <Input
                      id="tenant"
                      value={shopForm.tenant}
                      onChange={(e) => setShopForm({...shopForm, tenant: e.target.value})}
                      placeholder={language === 'ur' ? 'کرایہ دار کا نام' : 'Enter tenant name'}
                    />
                  </div>
                  <div>
                    <Label>
                      {language === 'ur' ? 'حیثیت' : 'Status'}
                    </Label>
                    <Select
                      value={shopForm.status}
                      onValueChange={(value) => setShopForm({...shopForm, status: value as any})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={language === 'ur' ? 'حیثیت منتخب کریں' : 'Select status'} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="occupied">{language === 'ur' ? 'آباد' : 'Occupied'}</SelectItem>
                        <SelectItem value="vacant">{language === 'ur' ? 'خالی' : 'Vacant'}</SelectItem>
                        <SelectItem value="under-renovation">{language === 'ur' ? 'ترمیم جاری' : 'Under Renovation'}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button type="button" onClick={() => setIsShopFormOpen(false)}>
                    {language === 'ur' ? 'منسوخ کریں' : 'Cancel'}
                  </Button>
                  <Button type="submit" className="bg-gradient-primary  text-white" disabled={loading}>
                    {loading ? (language === 'ur' ? 'محفوظ کر رہا ہے...' : 'Saving...') : (selectedShop ? (language === 'ur' ? 'اپڈیٹ کریں' : 'Update') : (language === 'ur' ? 'شاپ شامل کریں' : 'Add Shop'))}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Search */}
      <Card>
        <CardContent className="p-6">
          <div className="flex space-x-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder={language === 'ur' ? 'تلاش کریں...' : 'Search...'}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button>
              <Filter className="w-4 h-4 mr-2" />
              {language === 'ur' ? 'فلٹر' : 'Filter'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <div className="flex space-x-2 mb-4">
        <Button 
          variant={activeTab === 'shops' ? 'default' : 'outline'} 
          onClick={() => setActiveTab('shops')}
        >
          <Building className="w-4 h-4 mr-2" />
          {language === 'ur' ? 'شاپس' : 'Shops'}
        </Button>
        <Button 
          variant={activeTab === 'rental' ? 'default' : 'outline'} 
          onClick={() => setActiveTab('rental')}
        >
          <Calendar className="w-4 h-4 mr-2" />
          {language === 'ur' ? 'کرایہ' : 'Rental'}
        </Button>
        <Button 
          variant={activeTab === 'financial' ? 'default' : 'outline'} 
          onClick={() => setActiveTab('financial')}
        >
          <DollarSign className="w-4 h-4 mr-2" />
          {language === 'ur' ? 'مالی رپورٹ' : 'Financial Report'}
        </Button>
      </div>

      {/* Shops Tab */}
      {activeTab === 'shops' && (
        <Card>
          <CardHeader>
            <CardTitle>
              {language === 'ur' ? 'شاپوں کی فہرست' : 'Shop List'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-4">{language === 'ur' ? 'لوڈ ہو رہا ہے...' : 'Loading...'}</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{language === 'ur' ? 'شاپ کا نام' : 'Shop Name'}</TableHead>
                    <TableHead>{language === 'ur' ? 'مقام' : 'Location'}</TableHead>
                    <TableHead>{language === 'ur' ? 'سائز' : 'Size'}</TableHead>
                    <TableHead>{language === 'ur' ? 'کرایہ دار' : 'Tenant'}</TableHead>
                    <TableHead>{language === 'ur' ? 'ماہانہ کرایہ' : 'Monthly Rent'}</TableHead>
                    <TableHead>{language === 'ur' ? 'حیثیت' : 'Status'}</TableHead>
                    <TableHead>{language === 'ur' ? 'عمل' : 'Actions'}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredShops.map((shop) => (
                    <TableRow key={shop._id}>
                      <TableCell className="font-medium">{shop.name}</TableCell>
                      <TableCell>{shop.location}</TableCell>
                      <TableCell>{shop.size}</TableCell>
                      <TableCell>{shop.tenant || '-'}</TableCell>
                      <TableCell>Rs{shop.monthlyRent.toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(shop.status)}>
                          {getStatusText(shop.status)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button size="sm" variant="ghost" onClick={() => { setSelectedShop(shop); setShopForm(shop); setIsShopFormOpen(true); }}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            onClick={() => handleDeleteShop(shop._id)}
                            disabled={loading}
                          >
                            <Trash2 className="w-4 h-4" />
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
      )}

      {/* Rental Tab */}
      {activeTab === 'rental' && (
        <Card>
          <CardHeader>
            <CardTitle>
              {language === 'ur' ? 'کرایہ کی تفصیلات' : 'Rental Details'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">{language === 'ur' ? 'کل کرایہ' : 'Total Rent'}</p>
                      <p className="text-2xl font-bold text-green-600">
                        Rs{shops.reduce((sum, shop) => sum + shop.monthlyRent, 0).toLocaleString()}
                      </p>
                    </div>
                    <DollarSign className="w-8 h-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">{language === 'ur' ? 'آباد شاپس' : 'Occupied Shops'}</p>
                      <p className="text-2xl font-bold text-blue-600">
                        {shops.filter(shop => shop.status === 'occupied').length}
                      </p>
                    </div>
                    <Building className="w-8 h-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">{language === 'ur' ? 'خالی شاپس' : 'Vacant Shops'}</p>
                      <p className="text-2xl font-bold text-red-600">
                        {shops.filter(shop => shop.status === 'vacant').length}
                      </p>
                    </div>
                    <Building className="w-8 h-8 text-red-600" />
                  </div>
                </CardContent>
              </Card>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{language === 'ur' ? 'شاپ' : 'Shop'}</TableHead>
                  <TableHead>{language === 'ur' ? 'کرایہ دار' : 'Tenant'}</TableHead>
                  <TableHead>{language === 'ur' ? 'ماہانہ کرایہ' : 'Monthly Rent'}</TableHead>
                  <TableHead>{language === 'ur' ? 'کل ادا شدہ رقم' : 'Total Paid Amount'}</TableHead>
                  <TableHead>{language === 'ur' ? 'عمل' : 'Actions'}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {shops.filter(shop => shop.status === 'occupied').map((shop) => {
                  const totalPaid = getTotalPaidForShop(shop._id);
                  return (
                    <TableRow key={shop._id}>
                      <TableCell className="font-medium">{shop.name}</TableCell>
                      <TableCell>{shop.tenant}</TableCell>
                      <TableCell>Rs{shop.monthlyRent.toLocaleString()}</TableCell>
                      <TableCell>Rs{totalPaid.toLocaleString()}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button size="sm" variant="ghost" onClick={() => handleShopDetail(shop)}>
                            <Info className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Financial Report Tab */}
      {activeTab === 'financial' && (
        <Card>
          <CardHeader>
            <CardTitle>
              {language === 'ur' ? 'مالی رپورٹ' : 'Financial Report'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">{language === 'ur' ? 'کل آمدنی' : 'Total Income'}</p>
                      <p className="text-2xl font-bold text-green-600">
                        Rs{shops.reduce((sum, shop) => sum + shop.monthlyRent, 0).toLocaleString()}
                      </p>
                    </div>
                    <DollarSign className="w-8 h-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">{language === 'ur' ? 'کل اخراجات' : 'Total Expenses'}</p>
                      <p className="text-2xl font-bold text-red-600">
                        Rs{shops.reduce((sum, shop) => sum + shop.maintenance + shop.utilities, 0).toLocaleString()}
                      </p>
                    </div>
                    <FileText className="w-8 h-8 text-red-600" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">{language === 'ur' ? 'خالص آمدنی' : 'Net Income'}</p>
                      <p className="text-2xl font-bold text-blue-600">
                        Rs{(shops.reduce((sum, shop) => sum + shop.monthlyRent, 0) - shops.reduce((sum, shop) => sum + shop.maintenance + shop.utilities, 0)).toLocaleString()}
                      </p>
                    </div>
                    <DollarSign className="w-8 h-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">{language === 'ur' ? 'اوسط آکپنسی' : 'Avg Occupancy'}</p>
                      <p className="text-2xl font-bold text-purple-600">
                        {shops.length > 0 ? Math.round((shops.filter(shop => shop.status === 'occupied').length / shops.length) * 100) : 0}%
                      </p>
                    </div>
                    <Users className="w-8 h-8 text-purple-600" />
                  </div>
                </CardContent>
              </Card>
            </div>
            {/* Shop Reports Table */}
            <Table className="mb-6">
              <TableHeader>
                <TableRow>
                  <TableHead>{language === 'ur' ? 'شاپ' : 'Shop'}</TableHead>
                  <TableHead>{language === 'ur' ? 'کرایہ دار' : 'Tenant'}</TableHead>
                  <TableHead>{language === 'ur' ? 'ماہانہ کرایہ' : 'Monthly Rent'}</TableHead>
                  <TableHead>{language === 'ur' ? 'رپورٹس' : 'Reports'}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {shops.map(shop => (
                  <TableRow key={shop._id}>
                    <TableCell>{shop.name}</TableCell>
                    <TableCell>{shop.tenant}</TableCell>
                    <TableCell>Rs{shop.monthlyRent.toLocaleString()}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button size="sm" onClick={() => {
                          setSelectedMonth(getCurrentMonthName());
                          setSelectedYear(new Date().getFullYear());
                          setReportModal({ type: 'monthly', shop });
                        }}>
                          {language === 'ur' ? 'ماہانہ رپورٹ' : 'Monthly Report'}
                        </Button>
                        <Button size="sm" onClick={() => {
                          setSelectedYear(new Date().getFullYear());
                          setReportModal({ type: 'yearly', shop });
                        }}>
                          {language === 'ur' ? 'سالانہ رپورٹ' : 'Yearly Report'}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {/* Monthly/Yearly Report Modal */}
            <Dialog open={!!reportModal.type} onOpenChange={() => setReportModal({ type: null, shop: null })}>
              <DialogContent className="max-w-lg w-full sm:w-[90vw] p-4">
                <DialogHeader>
                  <div className="flex justify-between items-center">
                    <DialogTitle>
                      {reportModal.type === 'monthly'
                        ? `${reportModal.shop?.name} - ${language === 'ur' ? 'ماہانہ رپورٹ' : 'Monthly Report'}`
                        : reportModal.type === 'yearly'
                          ? `${reportModal.shop?.name} - ${language === 'ur' ? 'سالانہ رپورٹ' : 'Yearly Report'}`
                          : ''}
                    </DialogTitle>
                    <Button variant="ghost" size="icon" onClick={() => setReportModal({ type: null, shop: null })} aria-label="Close">
                      ×
                    </Button>
                  </div>
                  {reportModal.type === 'yearly' && (
                    <p className="text-gray-500 text-sm mt-1 mb-2">{language === 'ur' ? 'منتخب سال کے لیے مکمل رپورٹ' : 'Full report for the selected year.'}</p>
                  )}
                </DialogHeader>
                {reportModal.type === 'monthly' && (
                  <div className="flex space-x-4 mb-4 items-end">
                    <div>
                      <Label htmlFor="month-select">{language === 'ur' ? 'مہینہ' : 'Month'}</Label>
                      <Select id="month-select" value={selectedMonth} onValueChange={setSelectedMonth}>
                        <SelectTrigger className="w-32">
                          <SelectValue placeholder={language === 'ur' ? 'مہینہ منتخب کریں' : 'Select Month'} />
                        </SelectTrigger>
                        <SelectContent>
                          {["January","February","March","April","May","June","July","August","September","October","November","December"].map(m => (
                            <SelectItem key={m} value={m}>{m}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="year-input">{language === 'ur' ? 'سال' : 'Year'}</Label>
                      <Input
                        id="year-input"
                        type="number"
                        className="w-24"
                        value={selectedYear}
                        onChange={e => setSelectedYear(Number(e.target.value))}
                        placeholder={language === 'ur' ? 'سال' : 'Year'}
                      />
                    </div>
                  </div>
                )}
                {reportModal.type === 'yearly' && (
                  <div className="flex space-x-4 mb-4 items-end">
                    <div>
                      <Label htmlFor="year-input">{language === 'ur' ? 'سال' : 'Year'}</Label>
                      <Input
                        id="year-input"
                        type="number"
                        className="w-24"
                        value={selectedYear}
                        onChange={e => setSelectedYear(Number(e.target.value))}
                        placeholder={language === 'ur' ? 'سال' : 'Year'}
                      />
                    </div>
                  </div>
                )}
                <div ref={reportRef} className="bg-gray-50 p-4 rounded border min-h-[200px] max-h-[60vh] overflow-y-auto">
                  {reportModal.type === 'monthly' && reportModal.shop && (
                    (() => {
                      const payments = getPaymentsForShopMonthYear(reportModal.shop._id, selectedMonth, selectedYear);
                      const totalPaid = payments.filter(p => p.paid).reduce((sum, p) => sum + p.amount, 0);
                      const totalUnpaid = payments.filter(p => !p.paid).reduce((sum, p) => sum + p.amount, 0);
                      return payments.length === 0 ? (
                        <p className="text-gray-500 text-center">No payments found for this month.</p>
                      ) : (
                        <>
                          <div className="mb-2 flex justify-end space-x-4">
                            <span className="font-semibold">Total Paid: <span className="text-green-600">Rs{totalPaid.toLocaleString()}</span></span>
                            <span className="font-semibold">Total Unpaid: <span className="text-red-600">Rs{totalUnpaid.toLocaleString()}</span></span>
                          </div>
                          <hr className="mb-2" />
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Month</TableHead>
                                <TableHead>Year</TableHead>
                                <TableHead>Amount</TableHead>
                                <TableHead>Paid</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {payments.map(p => (
                                <TableRow key={p._id}>
                                  <TableCell>{p.month}</TableCell>
                                  <TableCell>{p.year}</TableCell>
                                  <TableCell>Rs{p.amount.toLocaleString()}</TableCell>
                                  <TableCell>{p.paid ? <span className="text-green-600 font-semibold">Paid</span> : <span className="text-red-600 font-semibold">Unpaid</span>}</TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </>
                      );
                    })()
                  )}
                  {reportModal.type === 'yearly' && reportModal.shop && (
                    (() => {
                      const payments = getPaymentsForShopYear(reportModal.shop._id, selectedYear);
                      let yearlyPaid = 0, yearlyUnpaid = 0;
                      const monthRows = months.map(m => {
                        const monthPayments = payments.filter(p => p.month === m);
                        const paid = monthPayments.filter(p => p.paid).reduce((sum, p) => sum + p.amount, 0);
                        const unpaid = monthPayments.filter(p => !p.paid).reduce((sum, p) => sum + p.amount, 0);
                        yearlyPaid += paid;
                        yearlyUnpaid += unpaid;
                        return (
                          <TableRow key={m}>
                            <TableCell>{m}</TableCell>
                            <TableCell>Rs{paid.toLocaleString()}</TableCell>
                            <TableCell>Rs{unpaid.toLocaleString()}</TableCell>
                          </TableRow>
                        );
                      });
                      return (
                        <>
                          <div className="mb-2 flex justify-end space-x-4">
                            <span className="font-semibold">Yearly Paid: <span className="text-green-600">Rs{yearlyPaid.toLocaleString()}</span></span>
                            <span className="font-semibold">Yearly Unpaid: <span className="text-red-600">Rs{yearlyUnpaid.toLocaleString()}</span></span>
                          </div>
                          <hr className="mb-2" />
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Month</TableHead>
                                <TableHead>Total Paid</TableHead>
                                <TableHead>Total Unpaid</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>{monthRows}</TableBody>
                          </Table>
                        </>
                      );
                    })()
                  )}
                </div>
                <div className="flex justify-end space-x-2 mt-4">
                  <Button variant="outline" onClick={() => window.print()}>{language === 'ur' ? 'پرنٹ کریں' : 'Print'}</Button>
                  <Button variant="outline" onClick={handleDownloadPDF}>{language === 'ur' ? 'پی ڈی ایف ڈاؤن لوڈ' : 'Download PDF'}</Button>
                </div>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
      )}

      {/* Shop Detail Dialog */}
      <Dialog open={isShopDetailOpen} onOpenChange={setIsShopDetailOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {selectedShopForDetail?.name} {language === 'ur' ? 'کی تفصیل' : 'Details'}
            </DialogTitle>
          </DialogHeader>
          {selectedShopForDetail && (
            <div className="space-y-4">
              <div>
                <div className="font-semibold">{language === 'ur' ? 'شاپ کا نام:' : 'Shop Name:'} <span className="font-normal">{selectedShopForDetail.name}</span></div>
                <div className="font-semibold">{language === 'ur' ? 'کرایہ دار:' : 'Tenant:'} <span className="font-normal">{selectedShopForDetail.tenant || '-'}</span></div>
                <div className="font-semibold">{language === 'ur' ? 'مقام:' : 'Location:'} <span className="font-normal">{selectedShopForDetail.location}</span></div>
                <div className="font-semibold">{language === 'ur' ? 'سائز:' : 'Size:'} <span className="font-normal">{selectedShopForDetail.size}</span></div>
                <div className="font-semibold">{language === 'ur' ? 'ماہانہ کرایہ:' : 'Monthly Rent:'} <span className="font-normal">Rs{selectedShopForDetail.monthlyRent.toLocaleString()}</span></div>
                <div className="font-semibold">{language === 'ur' ? 'حیثیت:' : 'Status:'} <span className="font-normal">{getStatusText(selectedShopForDetail.status)}</span></div>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">{language === 'ur' ? 'کرایہ کی ادائیگیاں' : 'Rent Payments'}</h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{language === 'ur' ? 'مہینہ' : 'Month'}</TableHead>
                      <TableHead>{language === 'ur' ? 'سال' : 'Year'}</TableHead>
                      <TableHead>{language === 'ur' ? 'رقم' : 'Amount'}</TableHead>
                      <TableHead>{language === 'ur' ? 'ادائیگی' : 'Paid'}</TableHead>
                      <TableHead>{language === 'ur' ? 'عمل' : 'Actions'}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rentPayments.map(payment => (
                      <TableRow key={payment._id}>
                        <TableCell>{payment.month}</TableCell>
                        <TableCell>{payment.year}</TableCell>
                        <TableCell>Rs{payment.amount.toLocaleString()}</TableCell>
                        <TableCell>
                          {payment.paid ? (
                            <span className="text-green-600 font-semibold">{language === 'ur' ? 'ادا شدہ' : 'Paid'}</span>
                          ) : (
                            <span className="text-red-600 font-semibold">{language === 'ur' ? 'غیر ادا شدہ' : 'Not Paid'}</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button size="sm" variant="ghost" onClick={() => handleEditRentPayment(payment)}>
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => handleDeleteRentPayment(payment._id)}>
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <Button className="mt-4" onClick={() => { setEditingPayment(null); setRentPaymentForm({ month: '', year: new Date().getFullYear(), amount: selectedShopForDetail.monthlyRent, paid: false }); setIsRentPaymentFormOpen(true); }}>
                  {language === 'ur' ? 'نیا مہینہ شامل کریں' : 'Add New Month'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Rent Payment Form Dialog */}
      <Dialog open={isRentPaymentFormOpen} onOpenChange={setIsRentPaymentFormOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingPayment ? (language === 'ur' ? 'ادائیگی میں ترمیم کریں' : 'Edit Payment') : (language === 'ur' ? 'نیا مہینہ شامل کریں' : 'Add New Month')}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={(e) => { e.preventDefault(); editingPayment ? handleUpdateRentPayment() : handleAddRentPayment(); }} className="space-y-4">
            <div>
              <Label htmlFor="month">{language === 'ur' ? 'مہینہ' : 'Month'}</Label>
              <Select value={rentPaymentForm.month} onValueChange={(value) => setRentPaymentForm({...rentPaymentForm, month: value})}>
                <SelectTrigger>
                  <SelectValue placeholder={language === 'ur' ? 'مہینہ منتخب کریں' : 'Select month'} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="January">{language === 'ur' ? 'جنوری' : 'January'}</SelectItem>
                  <SelectItem value="February">{language === 'ur' ? 'فروری' : 'February'}</SelectItem>
                  <SelectItem value="March">{language === 'ur' ? 'مارچ' : 'March'}</SelectItem>
                  <SelectItem value="April">{language === 'ur' ? 'اپریل' : 'April'}</SelectItem>
                  <SelectItem value="May">{language === 'ur' ? 'مئی' : 'May'}</SelectItem>
                  <SelectItem value="June">{language === 'ur' ? 'جون' : 'June'}</SelectItem>
                  <SelectItem value="July">{language === 'ur' ? 'جولائی' : 'July'}</SelectItem>
                  <SelectItem value="August">{language === 'ur' ? 'اگست' : 'August'}</SelectItem>
                  <SelectItem value="September">{language === 'ur' ? 'ستمبر' : 'September'}</SelectItem>
                  <SelectItem value="October">{language === 'ur' ? 'اکتوبر' : 'October'}</SelectItem>
                  <SelectItem value="November">{language === 'ur' ? 'نومبر' : 'November'}</SelectItem>
                  <SelectItem value="December">{language === 'ur' ? 'دسمبر' : 'December'}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="year">{language === 'ur' ? 'سال' : 'Year'}</Label>
              <Input
                id="year"
                type="number"
                value={rentPaymentForm.year}
                onChange={(e) => setRentPaymentForm({...rentPaymentForm, year: Number(e.target.value)})}
                placeholder={language === 'ur' ? 'سال درج کریں' : 'Enter year'}
                required
              />
            </div>
            <div>
              <Label htmlFor="amount">{language === 'ur' ? 'رقم' : 'Amount'}</Label>
              <Input
                id="amount"
                type="number"
                value={rentPaymentForm.amount}
                onChange={(e) => setRentPaymentForm({...rentPaymentForm, amount: Number(e.target.value)})}
                placeholder={language === 'ur' ? 'رقم درج کریں' : 'Enter amount'}
                required
              />
            </div>
            <div>
              <Label htmlFor="paid">{language === 'ur' ? 'ادائیگی کی حیثیت' : 'Payment Status'}</Label>
              <Select value={rentPaymentForm.paid.toString()} onValueChange={(value) => setRentPaymentForm({...rentPaymentForm, paid: value === 'true'})}>
                <SelectTrigger>
                  <SelectValue placeholder={language === 'ur' ? 'حیثیت منتخب کریں' : 'Select status'} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">{language === 'ur' ? 'ادا شدہ' : 'Paid'}</SelectItem>
                  <SelectItem value="false">{language === 'ur' ? 'غیر ادا شدہ' : 'Not Paid'}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => setIsRentPaymentFormOpen(false)}>
                {language === 'ur' ? 'منسوخ کریں' : 'Cancel'}
              </Button>
              <Button type="submit" className="bg-gradient-primary  text-white" disabled={loading}>
                {loading ? (language === 'ur' ? 'محفوظ کر رہا ہے...' : 'Saving...') : (editingPayment ? (language === 'ur' ? 'اپڈیٹ کریں' : 'Update') : (language === 'ur' ? 'شامل کریں' : 'Add'))}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
} 