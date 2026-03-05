import { useState, useEffect } from "react";
import { Plus, Search, Edit, Trash2, Download, Eye, Calendar, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLanguage } from "@/contexts/LanguageContext";
import { toast } from "sonner";
import axios from "axios";

// Interfaces
interface Trip {
  _id: string;
  tripNumber: string;
  origin: string;
  destination: string;
  driverId: { name: string };
  vehicleId: { number: string };
  createdAt: string;
}

interface Staff {
  _id: string;
  name: string;
  designation: string;
}

interface TripExpense {
  tripId: string;
  expenses: {
    mazdoori: { amount: number; description: string };
    driverExpenses: { amount: number; description: string };
    roadExpenses: { amount: number; description: string };
    loadingUnloadingExpenses: { amount: number; description: string };
  };
}

interface StaffExpense {
  staffId: string;
  amount: number;
  description: string;
}

interface OtherExpense {
  amount: number;
  description: string;
}

interface FinancialReport {
  _id: string;
  reportDate: Date;
  trips: TripExpense[];
  staffExpenses: StaffExpense[];
  otherExpenses: OtherExpense[];
  notes: string;
  totalTripExpenses: number;
  totalStaffExpenses: number;
  totalOtherExpenses: number;
  grandTotalExpenses: number;
  createdAt: Date;
  updatedAt: Date;
}

interface MonthlyReport {
  totalDays: number;
  totalExpenses: number;
  totalTripExpenses: number;
  totalStaffExpenses: number;
  totalOtherExpenses: number;
  dailyData: Array<{
    date: Date;
    totalExpenses: number;
    tripExpenses: number;
    staffExpenses: number;
    otherExpenses: number;
  }>;
}

interface YearlyReport {
  year: number;
  totalExpenses: number;
  totalTripExpenses: number;
  totalStaffExpenses: number;
  totalOtherExpenses: number;
  totalReports: number;
  monthlyData: Array<{
    month: string;
    monthNumber: number;
    totalExpenses: number;
    tripExpenses: number;
    staffExpenses: number;
    otherExpenses: number;
    reportCount: number;
  }>;
}

export default function FinancialReportPage() {
  const { t, language } = useLanguage();
  
  // State variables
  const [reports, setReports] = useState<FinancialReport[]>([]);
  const [todaysTrips, setTodaysTrips] = useState<Trip[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [selectedTrips, setSelectedTrips] = useState<string[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [currentReport, setCurrentReport] = useState<FinancialReport | null>(null);
  const [viewReport, setViewReport] = useState<FinancialReport | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [todayReportExists, setTodayReportExists] = useState(false);
  const [activeTab, setActiveTab] = useState("daily");
  const [monthlyReport, setMonthlyReport] = useState<MonthlyReport | null>(null);
  const [yearlyReport, setYearlyReport] = useState<YearlyReport | null>(null);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  // Form data state
  const [formData, setFormData] = useState({
    trips: [] as TripExpense[],
    staffExpenses: [] as StaffExpense[],
    otherExpenses: [] as OtherExpense[],
    notes: ""
  });

  const API_URL = "http://localhost:8000/api/financial-reports";
  const axiosInstance = axios.create({
    baseURL: API_URL,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token")}`
    }
  });

  // Fetch all data
  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [reportsRes, todayCheckRes, tripsRes, staffRes] = await Promise.all([
        axiosInstance.get("/"),
        axiosInstance.get("/check/today"),
        axiosInstance.get("/trips/today"),
        axiosInstance.get("/staff/all")
      ]);

      setReports(reportsRes.data);
      setTodayReportExists(todayCheckRes.data.exists);
      setTodaysTrips(tripsRes.data);
      setStaff(staffRes.data);

      // If editing today's report, populate form
      if (todayCheckRes.data.exists && todayCheckRes.data.report) {
        const report = todayCheckRes.data.report;
        setCurrentReport(report);
        populateFormWithReport(report);
      }

    } catch (error) {
      console.error("Fetch Error:", error);
      toast.error(language === 'ur' ? 'ڈیٹا لوڈ کرنے میں ناکام' : 'Failed to load data');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch monthly report
  const fetchMonthlyReport = async (year: number, month: number) => {
    try {
      setIsLoading(true);
      const response = await axiosInstance.get(`/monthly/${year}/${month}`);
      setMonthlyReport(response.data);
    } catch (error) {
      toast.error(language === 'ur' ? 'ماہانہ رپورٹ لوڈ کرنے میں ناکام' : 'Failed to load monthly report');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch yearly report
  const fetchYearlyReport = async (year: number) => {
    try {
      setIsLoading(true);
      const response = await axiosInstance.get(`/yearly/${year}`);
      setYearlyReport(response.data);
    } catch (error) {
      toast.error(language === 'ur' ? 'سالانہ رپورٹ لوڈ کرنے میں ناکام' : 'Failed to load yearly report');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (activeTab === "monthly") {
      fetchMonthlyReport(selectedYear, selectedMonth);
    } else if (activeTab === "yearly") {
      fetchYearlyReport(selectedYear);
    }
  }, [activeTab, selectedMonth, selectedYear]);

  // Initialize form with today's trips checked by default
  useEffect(() => {
    if (todaysTrips.length > 0 && !todayReportExists) {
      const tripIds = todaysTrips.map(trip => trip._id);
      setSelectedTrips(tripIds);
      
      const initialTrips = todaysTrips.map(trip => ({
        tripId: trip._id,
        expenses: {
          mazdoori: { amount: 0, description: "" },
          driverExpenses: { amount: 0, description: "" },
          roadExpenses: { amount: 0, description: "" },
          loadingUnloadingExpenses: { amount: 0, description: "" }
        }
      }));

      setFormData(prev => ({
        ...prev,
        trips: initialTrips
      }));
    }
  }, [todaysTrips, todayReportExists]);

  const populateFormWithReport = (report: FinancialReport) => {
    setFormData({
      trips: report.trips,
      staffExpenses: report.staffExpenses,
      otherExpenses: report.otherExpenses,
      notes: report.notes
    });
    setSelectedTrips(report.trips.map(t => t.tripId));
  };

  const handleTripSelection = (tripId: string, checked: boolean) => {
    if (checked) {
      setSelectedTrips(prev => [...prev, tripId]);
      setFormData(prev => ({
        ...prev,
        trips: [
          ...prev.trips,
          {
            tripId,
            expenses: {
              mazdoori: { amount: 0, description: "" },
              driverExpenses: { amount: 0, description: "" },
              roadExpenses: { amount: 0, description: "" },
              loadingUnloadingExpenses: { amount: 0, description: "" }
            }
          }
        ]
      }));
    } else {
      setSelectedTrips(prev => prev.filter(id => id !== tripId));
      setFormData(prev => ({
        ...prev,
        trips: prev.trips.filter(t => t.tripId !== tripId)
      }));
    }
  };

  const handleTripExpenseChange = (tripId: string, expenseType: string, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      trips: prev.trips.map(trip => 
        trip.tripId === tripId
          ? {
              ...trip,
              expenses: {
                ...trip.expenses,
                [expenseType]: {
                  ...trip.expenses[expenseType as keyof typeof trip.expenses],
                  [field]: value
                }
              }
            }
          : trip
      )
    }));
  };

  const handleStaffExpenseChange = (index: number, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      staffExpenses: prev.staffExpenses.map((expense, i) =>
        i === index ? { ...expense, [field]: value } : expense
      )
    }));
  };

  const handleOtherExpenseChange = (index: number, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      otherExpenses: prev.otherExpenses.map((expense, i) =>
        i === index ? { ...expense, [field]: value } : expense
      )
    }));
  };

  const addStaffExpense = () => {
    setFormData(prev => ({
      ...prev,
      staffExpenses: [...prev.staffExpenses, { staffId: "", amount: 0, description: "" }]
    }));
  };

  const removeStaffExpense = (index: number) => {
    setFormData(prev => ({
      ...prev,
      staffExpenses: prev.staffExpenses.filter((_, i) => i !== index)
    }));
  };

  const addOtherExpense = () => {
    setFormData(prev => ({
      ...prev,
      otherExpenses: [...prev.otherExpenses, { amount: 0, description: "" }]
    }));
  };

  const removeOtherExpense = (index: number) => {
    setFormData(prev => ({
      ...prev,
      otherExpenses: prev.otherExpenses.filter((_, i) => i !== index)
    }));
  };

  const handleOpenDialog = (report: FinancialReport | null = null) => {
    if (todayReportExists && !report) {
      toast.error(language === 'ur' ? 'آج کی رپورٹ پہلے سے موجود ہے۔ نئی رپورٹ بنانے کے لیے پہلے پرانی رپورٹ کو ڈیلیٹ کریں۔' : 'Report already exists for today. Delete the existing report to create a new one.');
      return;
    }

    if (report) {
      setCurrentReport(report);
      populateFormWithReport(report);
    } else {
      setCurrentReport(null);
      // Reset form but keep today's trips selected
      const initialTrips = todaysTrips.map(trip => ({
        tripId: trip._id,
        expenses: {
          mazdoori: { amount: 0, description: "" },
          driverExpenses: { amount: 0, description: "" },
          roadExpenses: { amount: 0, description: "" },
          loadingUnloadingExpenses: { amount: 0, description: "" }
        }
      }));
      
      setFormData({
        trips: initialTrips,
        staffExpenses: [],
        otherExpenses: [],
        notes: ""
      });
      setSelectedTrips(todaysTrips.map(trip => trip._id));
    }
    setIsDialogOpen(true);
  };

  const handleViewReport = (report: FinancialReport) => {
    setViewReport(report);
    setIsViewDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsLoading(true);
      
      if (selectedTrips.length === 0) {
        toast.error(language === 'ur' ? 'کم از کم ایک ٹرپ منتخب کریں' : 'Please select at least one trip');
        return;
      }

      const submitData = {
        ...formData,
        trips: formData.trips.filter(trip => selectedTrips.includes(trip.tripId))
      };

      if (currentReport) {
        await axiosInstance.put(`/${currentReport._id}`, submitData);
        toast.success(language === 'ur' ? 'رپورٹ کامیابی سے اپ ڈیٹ ہو گئی' : 'Report updated successfully');
      } else {
        await axiosInstance.post("/", submitData);
        toast.success(language === 'ur' ? 'رپورٹ کامیابی سے شامل ہو گئی' : 'Report added successfully');
      }
      
      fetchData();
      setIsDialogOpen(false);
    } catch (error: any) {
      toast.error(error.response?.data?.message || (language === 'ur' ? 'خرابی پیدا ہوئی' : 'An error occurred'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm(language === 'ur' ? 'کیا آپ واقعی اس رپورٹ کو حذف کرنا چاہتے ہیں؟' : 'Are you sure you want to delete this report?')) {
      return;
    }

    try {
      setIsLoading(true);
      await axiosInstance.delete(`/${id}`);
      toast.success(language === 'ur' ? 'رپورٹ کامیابی سے حذف ہو گئی' : 'Report deleted successfully');
      fetchData();
    } catch (error) {
      toast.error(language === 'ur' ? 'خرابی پیدا ہوئی' : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadPDF = (reportId: string, type: 'daily' | 'monthly' | 'yearly') => {
    let url = '';
    if (type === 'daily') {
      url = `${API_URL}/pdf/daily/${reportId}`;
    } else if (type === 'monthly') {
      url = `${API_URL}/pdf/monthly/${selectedYear}/${selectedMonth}`;
    } else if (type === 'yearly') {
      url = `${API_URL}/pdf/yearly/${selectedYear}`;
    }
    
    window.open(url, '_blank');
  };

  const filteredReports = reports.filter(report => {
    const reportDate = new Date(report.reportDate).toLocaleDateString();
    return reportDate.toLowerCase().includes(searchTerm.toLowerCase()) ||
           report.notes.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const getTripById = (tripId: string) => {
    return todaysTrips.find(trip => trip._id === tripId);
  };

  const getStaffById = (staffId: string) => {
    return staff.find(s => s._id === staffId);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {language === 'ur' ? 'مالی رپورٹس' : 'Financial Reports'}
          </h1>
          <p className="text-gray-600 mt-1">
            {language === 'ur' ? 'روزانہ، ماہانہ اور سالانہ مالی رپورٹس کا انتظام کریں' : 'Manage daily, monthly and yearly financial reports'}
          </p>
        </div>
        <Button 
          onClick={() => handleOpenDialog()}
          className="bg-gradient-primary text-white"
          disabled={isLoading}
        >
          <Plus className="w-4 h-4 mr-2" />
          {language === 'ur' ? 'نیا رپورٹ' : 'New Report'}
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="daily">{language === 'ur' ? 'روزانہ' : 'Daily'}</TabsTrigger>
          <TabsTrigger value="monthly">{language === 'ur' ? 'ماہانہ' : 'Monthly'}</TabsTrigger>
          <TabsTrigger value="yearly">{language === 'ur' ? 'سالانہ' : 'Yearly'}</TabsTrigger>
        </TabsList>

        {/* Daily Reports Tab */}
        <TabsContent value="daily" className="space-y-4">
          <Card>
            <CardContent className="p-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder={language === 'ur' ? 'تلاش کریں...' : 'Search...'}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                  disabled={isLoading}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>
                {language === 'ur' ? 'روزانہ رپورٹس کی فہرست' : 'Daily Reports List'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{language === 'ur' ? 'تاریخ' : 'Date'}</TableHead>
                      <TableHead>{language === 'ur' ? 'ٹرپ اخراجات' : 'Trip Expenses'}</TableHead>
                      <TableHead>{language === 'ur' ? 'عملہ اخراجات' : 'Staff Expenses'}</TableHead>
                      <TableHead>{language === 'ur' ? 'دیگر اخراجات' : 'Other Expenses'}</TableHead>
                      <TableHead>{language === 'ur' ? 'کل اخراجات' : 'Total Expenses'}</TableHead>
                      <TableHead>{language === 'ur' ? 'عمل' : 'Actions'}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredReports.length > 0 ? (
                      filteredReports.map(report => (
                        <TableRow key={report._id}>
                          <TableCell>{new Date(report.reportDate).toLocaleDateString()}</TableCell>
                          <TableCell>Rs. {report.totalTripExpenses.toLocaleString()}</TableCell>
                          <TableCell>Rs. {report.totalStaffExpenses.toLocaleString()}</TableCell>
                          <TableCell>Rs. {report.totalOtherExpenses.toLocaleString()}</TableCell>
                          <TableCell>
                            <Badge className="bg-blue-100 text-blue-800">
                              Rs. {report.grandTotalExpenses.toLocaleString()}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button 
                                size="sm" 
                                variant="ghost"
                                onClick={() => handleViewReport(report)}
                                disabled={isLoading}
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button 
                                size="sm" 
                                variant="ghost"
                                onClick={() => handleOpenDialog(report)}
                                disabled={isLoading}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button 
                                size="sm" 
                                variant="ghost"
                                onClick={() => handleDelete(report._id)}
                                disabled={isLoading}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                              <Button 
                                size="sm" 
                                variant="ghost"
                                onClick={() => handleDownloadPDF(report._id, 'daily')}
                                disabled={isLoading}
                              >
                                <Download className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-4">
                          {language === 'ur' ? 'کوئی رپورٹ دستیاب نہیں' : 'No reports available'}
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Monthly Reports Tab */}
        <TabsContent value="monthly" className="space-y-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex space-x-4">
                <div>
                  <Label>{language === 'ur' ? 'سال' : 'Year'}</Label>
                  <Select
                    value={selectedYear.toString()}
                    onValueChange={(value) => setSelectedYear(parseInt(value))}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 5 }, (_, i) => {
                        const year = new Date().getFullYear() - i;
                        return (
                          <SelectItem key={year} value={year.toString()}>
                            {year}
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>{language === 'ur' ? 'مہینہ' : 'Month'}</Label>
                  <Select
                    value={selectedMonth.toString()}
                    onValueChange={(value) => setSelectedMonth(parseInt(value))}
                  >
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 12 }, (_, i) => {
                        const month = i + 1;
                        const monthNames = language === 'ur' 
                          ? ['جنوری', 'فروری', 'مارچ', 'اپریل', 'مئی', 'جون', 'جولائی', 'اگست', 'ستمبر', 'اکتوبر', 'نومبر', 'دسمبر']
                          : ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
                        return (
                          <SelectItem key={month} value={month.toString()}>
                            {monthNames[i]}
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>
                <Button 
                  onClick={() => handleDownloadPDF('', 'monthly')}
                  disabled={isLoading || !monthlyReport}
                  className="mt-6"
                >
                  <Download className="w-4 h-4 mr-2" />
                  {language === 'ur' ? 'PDF ڈاؤن لوڈ' : 'Download PDF'}
                </Button>
              </div>
            </CardContent>
          </Card>

          {monthlyReport && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">
                    {language === 'ur' ? 'کل دن' : 'Total Days'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{monthlyReport.totalDays}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">
                    {language === 'ur' ? 'ٹرپ اخراجات' : 'Trip Expenses'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">Rs. {monthlyReport.totalTripExpenses.toLocaleString()}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">
                    {language === 'ur' ? 'عملہ اخراجات' : 'Staff Expenses'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">Rs. {monthlyReport.totalStaffExpenses.toLocaleString()}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">
                    {language === 'ur' ? 'کل اخراجات' : 'Total Expenses'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">Rs. {monthlyReport.totalExpenses.toLocaleString()}</div>
                </CardContent>
              </Card>
            </div>
          )}

          {monthlyReport && (
            <Card>
              <CardHeader>
                <CardTitle>{language === 'ur' ? 'روزانہ تفصیلات' : 'Daily Details'}</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{language === 'ur' ? 'تاریخ' : 'Date'}</TableHead>
                      <TableHead>{language === 'ur' ? 'کل اخراجات' : 'Total Expenses'}</TableHead>
                      <TableHead>{language === 'ur' ? 'ٹرپ' : 'Trip'}</TableHead>
                      <TableHead>{language === 'ur' ? 'عملہ' : 'Staff'}</TableHead>
                      <TableHead>{language === 'ur' ? 'دیگر' : 'Other'}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {monthlyReport.dailyData.map((day, index) => (
                      <TableRow key={index}>
                        <TableCell>{new Date(day.date).toLocaleDateString()}</TableCell>
                        <TableCell className="font-medium">Rs. {day.totalExpenses.toLocaleString()}</TableCell>
                        <TableCell>Rs. {day.tripExpenses.toLocaleString()}</TableCell>
                        <TableCell>Rs. {day.staffExpenses.toLocaleString()}</TableCell>
                        <TableCell>Rs. {day.otherExpenses.toLocaleString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Yearly Reports Tab */}
        <TabsContent value="yearly" activeValue={activeTab}>
          <div className="space-y-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex space-x-4">
                  <div>
                    <Label>{language === 'ur' ? 'سال' : 'Year'}</Label>
                    <Select
                      value={selectedYear.toString()}
                      onValueChange={(value) => setSelectedYear(parseInt(value))}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 5 }, (_, i) => {
                          const year = new Date().getFullYear() - i;
                          return (
                            <SelectItem key={year} value={year.toString()}>
                              {year}
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button 
                    onClick={() => handleDownloadPDF('', 'yearly')}
                    disabled={isLoading || !yearlyReport}
                    className="mt-6"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    {language === 'ur' ? 'PDF ڈاؤن لوڈ' : 'Download PDF'}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {yearlyReport && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">
                      {language === 'ur' ? 'کل رپورٹس' : 'Total Reports'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{yearlyReport.totalReports}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">
                      {language === 'ur' ? 'ٹرپ اخراجات' : 'Trip Expenses'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">Rs. {yearlyReport.totalTripExpenses.toLocaleString()}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">
                      {language === 'ur' ? 'عملہ اخراجات' : 'Staff Expenses'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">Rs. {yearlyReport.totalStaffExpenses.toLocaleString()}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">
                      {language === 'ur' ? 'کل اخراجات' : 'Total Expenses'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-blue-600">Rs. {yearlyReport.totalExpenses.toLocaleString()}</div>
                  </CardContent>
                </Card>
              </div>
            )}

            {yearlyReport && (
              <Card>
                <CardHeader>
                  <CardTitle>{language === 'ur' ? 'ماہانہ تفصیلات' : 'Monthly Details'}</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{language === 'ur' ? 'مہینہ' : 'Month'}</TableHead>
                        <TableHead>{language === 'ur' ? 'رپورٹس' : 'Reports'}</TableHead>
                        <TableHead>{language === 'ur' ? 'کل اخراجات' : 'Total Expenses'}</TableHead>
                        <TableHead>{language === 'ur' ? 'ٹرپ' : 'Trip'}</TableHead>
                        <TableHead>{language === 'ur' ? 'عملہ' : 'Staff'}</TableHead>
                        <TableHead>{language === 'ur' ? 'دیگر' : 'Other'}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {yearlyReport.monthlyData.map((month, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">{month.month}</TableCell>
                          <TableCell>{month.reportCount}</TableCell>
                          <TableCell className="font-medium">Rs. {month.totalExpenses.toLocaleString()}</TableCell>
                          <TableCell>Rs. {month.tripExpenses.toLocaleString()}</TableCell>
                          <TableCell>Rs. {month.staffExpenses.toLocaleString()}</TableCell>
                          <TableCell>Rs. {month.otherExpenses.toLocaleString()}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>

      
      {/* Add/Edit Report Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>
              {currentReport 
                ? (language === 'ur' ? 'رپورٹ میں ترمیم' : 'Edit Report')
                : (language === 'ur' ? 'نئی رپورٹ شامل کریں' : 'Add New Report')
              }
            </DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Trip Expenses Section */}
            <div>
              <h3 className="text-lg font-medium mb-4">
                {language === 'ur' ? 'ٹرپ اخراجات' : 'Trip Expenses'}
              </h3>
              <div className="space-y-4 max-h-60 overflow-y-auto">
                {todaysTrips.map(trip => {
                  const isSelected = selectedTrips.includes(trip._id);
                  const tripExpense = formData.trips.find(t => t.tripId === trip._id);
                  
                  return (
                    <div key={trip._id} className="border rounded-lg p-4">
                      <div className="flex items-center space-x-2 mb-3">
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={(checked) => handleTripSelection(trip._id, checked)}
                          disabled={isLoading}
                        />
                        <span className="font-medium">
                          {trip.tripNumber} - {trip.origin} to {trip.destination}
                        </span>
                      </div>
                      
                      {isSelected && tripExpense && (
                        <div className="grid grid-cols-2 gap-4 ml-6">
                          <div>
                            <Label>{language === 'ur' ? 'مزدوری' : 'Mazdoori'}</Label>
                            <Input
                              type="number"
                              value={tripExpense.expenses.mazdoori.amount}
                              onChange={(e) => handleTripExpenseChange(trip._id, 'mazdoori', 'amount', parseFloat(e.target.value) || 0)}
                              placeholder="Amount"
                            />
                            <Input
                              value={tripExpense.expenses.mazdoori.description}
                              onChange={(e) => handleTripExpenseChange(trip._id, 'mazdoori', 'description', e.target.value)}
                              placeholder="Description"
                              className="mt-1"
                            />
                          </div>
                          
                          <div>
                            <Label>{language === 'ur' ? 'ڈرائیور اخراجات' : 'Driver Expenses'}</Label>
                            <Input
                              type="number"
                              value={tripExpense.expenses.driverExpenses.amount}
                              onChange={(e) => handleTripExpenseChange(trip._id, 'driverExpenses', 'amount', parseFloat(e.target.value) || 0)}
                              placeholder="Amount"
                            />
                            <Input
                              value={tripExpense.expenses.driverExpenses.description}
                              onChange={(e) => handleTripExpenseChange(trip._id, 'driverExpenses', 'description', e.target.value)}
                              placeholder="Description"
                              className="mt-1"
                            />
                          </div>
                          
                          <div>
                            <Label>{language === 'ur' ? 'سڑک اخراجات' : 'Road Expenses'}</Label>
                            <Input
                              type="number"
                              value={tripExpense.expenses.roadExpenses.amount}
                              onChange={(e) => handleTripExpenseChange(trip._id, 'roadExpenses', 'amount', parseFloat(e.target.value) || 0)}
                              placeholder="Amount"
                            />
                            <Input
                              value={tripExpense.expenses.roadExpenses.description}
                              onChange={(e) => handleTripExpenseChange(trip._id, 'roadExpenses', 'description', e.target.value)}
                              placeholder="Description"
                              className="mt-1"
                            />
                          </div>
                          
                          <div>
                            <Label>{language === 'ur' ? 'لوڈنگ/انلوڈنگ' : 'Loading/Unloading'}</Label>
                            <Input
                              type="number"
                              value={tripExpense.expenses.loadingUnloadingExpenses.amount}
                              onChange={(e) => handleTripExpenseChange(trip._id, 'loadingUnloadingExpenses', 'amount', parseFloat(e.target.value) || 0)}
                              placeholder="Amount"
                            />
                            <Input
                              value={tripExpense.expenses.loadingUnloadingExpenses.description}
                              onChange={(e) => handleTripExpenseChange(trip._id, 'loadingUnloadingExpenses', 'description', e.target.value)}
                              placeholder="Description"
                              className="mt-1"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Staff Expenses Section */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">
                  {language === 'ur' ? 'عملہ اخراجات' : 'Staff Expenses'}
                </h3>
                <Button type="button" onClick={addStaffExpense} variant="ghost">
                  <Plus className="w-4 h-4 mr-1" />
                  {language === 'ur' ? 'شامل کریں' : 'Add'}
                </Button>
              </div>
              
              <div className="space-y-3">
                {formData.staffExpenses.map((expense, index) => (
                  <div key={index} className="grid grid-cols-4 gap-3 items-end">
                    <div>
                      <Label>{language === 'ur' ? 'عملہ' : 'Staff'}</Label>
                      <Select
                        value={expense.staffId}
                        onValueChange={(value) => handleStaffExpenseChange(index, 'staffId', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select staff" />
                        </SelectTrigger>
                        <SelectContent>
                          {staff.map(member => (
                            <SelectItem key={member._id} value={member._id}>
                              {member.name} - {member.designation}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label>{language === 'ur' ? 'رقم' : 'Amount'}</Label>
                      <Input
                        type="number"
                        value={expense.amount}
                        onChange={(e) => handleStaffExpenseChange(index, 'amount', parseFloat(e.target.value) || 0)}
                        placeholder="Amount"
                      />
                    </div>
                    
                    <div>
                      <Label>{language === 'ur' ? 'تفصیل' : 'Description'}</Label>
                      <Input
                        value={expense.description}
                        onChange={(e) => handleStaffExpenseChange(index, 'description', e.target.value)}
                        placeholder="Description"
                      />
                    </div>
                    
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => removeStaffExpense(index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            {/* Other Expenses Section */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">
                  {language === 'ur' ? 'دیگر اخراجات' : 'Other Expenses'}
                </h3>
                <Button type="button" onClick={addOtherExpense} variant="ghost">
                  <Plus className="w-4 h-4 mr-1" />
                  {language === 'ur' ? 'شامل کریں' : 'Add'}
                </Button>
              </div>
              
              <div className="space-y-3">
                {formData.otherExpenses.map((expense, index) => (
                  <div key={index} className="grid grid-cols-3 gap-3 items-end">
                    <div>
                      <Label>{language === 'ur' ? 'رقم' : 'Amount'}</Label>
                      <Input
                        type="number"
                        value={expense.amount}
                        onChange={(e) => handleOtherExpenseChange(index, 'amount', parseFloat(e.target.value) || 0)}
                        placeholder="Amount"
                      />
                    </div>
                    
                    <div>
                      <Label>{language === 'ur' ? 'تفصیل' : 'Description'}</Label>
                      <Input
                        value={expense.description}
                        onChange={(e) => handleOtherExpenseChange(index, 'description', e.target.value)}
                        placeholder="Description"
                      />
                    </div>
                    
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => removeOtherExpense(index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            {/* Notes Section */}
            <div>
              <Label>{language === 'ur' ? 'نوٹس' : 'Notes'}</Label>
              <Textarea
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder={language === 'ur' ? 'اضافی نوٹس...' : 'Additional notes...'}
                rows={3}
              />
            </div>

            {/* Form Actions */}
            <div className="flex justify-end space-x-3 pt-4 border-t">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setIsDialogOpen(false)}
                disabled={isLoading}
              >
                {language === 'ur' ? 'منسوخ' : 'Cancel'}
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                ) : null}
                {currentReport 
                  ? (language === 'ur' ? 'اپ ڈیٹ' : 'Update')
                  : (language === 'ur' ? 'شامل کریں' : 'Add')
                }
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* View Report Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>
              {language === 'ur' ? 'رپورٹ کی تفصیلات' : 'Report Details'}
            </DialogTitle>
          </DialogHeader>
          
          {viewReport && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>{language === 'ur' ? 'تاریخ' : 'Date'}</Label>
                  <p className="text-lg font-medium">{new Date(viewReport.reportDate).toLocaleDateString()}</p>
                </div>
                <div>
                  <Label>{language === 'ur' ? 'کل اخراجات' : 'Total Expenses'}</Label>
                  <p className="text-lg font-bold text-blue-600">Rs. {viewReport.grandTotalExpenses.toLocaleString()}</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <Label>{language === 'ur' ? 'ٹرپ اخراجات' : 'Trip Expenses'}</Label>
                    <p className="text-xl font-bold">Rs. {viewReport.totalTripExpenses.toLocaleString()}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <Label>{language === 'ur' ? 'عملہ اخراجات' : 'Staff Expenses'}</Label>
                    <p className="text-xl font-bold">Rs. {viewReport.totalStaffExpenses.toLocaleString()}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <Label>{language === 'ur' ? 'دیگر اخراجات' : 'Other Expenses'}</Label>
                    <p className="text-xl font-bold">Rs. {viewReport.totalOtherExpenses.toLocaleString()}</p>
                  </CardContent>
                </Card>
              </div>

              {viewReport.notes && (
                <div>
                  <Label>{language === 'ur' ? 'نوٹس' : 'Notes'}</Label>
                  <p className="mt-1 p-3 bg-gray-50 rounded">{viewReport.notes}</p>
                </div>
              )}

              <div className="flex justify-end">
                <Button onClick={() => setIsViewDialogOpen(false)}>
                  {language === 'ur' ? 'بند کریں' : 'Close'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}