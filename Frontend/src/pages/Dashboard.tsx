import { 
  Package, 
  Receipt, 
  DollarSign, 
  Users, 
  TrendingUp, 
  TrendingDown,
  Plus,
  FileText,
  Truck,
  UserPlus,
  PieChart,
  BarChart
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { QuickActionCard } from "@/components/dashboard/QuickActionCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/contexts/LanguageContext";
import { dashboardService } from "@/services/dashboardService";
import { ChartContainer } from "@/components/ui/chart";
import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart as RechartsPieChart, Pie, Cell } from "recharts";

const Dashboard = () => {
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const [statsData, setStatsData] = useState([]);
  const [recentShipments, setRecentShipments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [paymentStats, setPaymentStats] = useState(null);
  const [monthlyRevenue, setMonthlyRevenue] = useState([]);
  const [topCustomers, setTopCustomers] = useState([]);

  // Colors for charts
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsResponse, shipmentsResponse, paymentStatsResponse, monthlyRevenueResponse, topCustomersResponse] = await Promise.all([
        dashboardService.getDashboardStats(),
        dashboardService.getRecentShipments(),
        dashboardService.getPaymentStats(),
        dashboardService.getMonthlyRevenue(),
        dashboardService.getTopCustomers()
      ]);

      const stats = statsResponse.data;
      const shipments = shipmentsResponse.data;
      const paymentStatsData = paymentStatsResponse.data;
      const monthlyRevenueData = monthlyRevenueResponse.data;
      const topCustomersData = topCustomersResponse.data;

      // Transform stats data for the StatsCard component
      const transformedStats = [
        {
          title: t("totalShipments"),
          value: stats.totalShipments?.value?.toLocaleString() || "0",
          change: stats.totalShipments?.change || "+0%",
          changeType: stats.totalShipments?.changeType || "positive",
          icon: Package,
          description: "Total shipments"
        },
        {
          title: t("totalStaff"),
          value: stats.totalStaff?.value?.toLocaleString() || "0",
          change: stats.totalStaff?.change || "+0%",
          changeType: stats.totalStaff?.changeType || "positive",
          icon: Users,
          description: "Total staff"
        },
        {
          title: t("totalTrips"),
          value: stats.totalTrips?.value?.toLocaleString() || "0",
          change: stats.totalTrips?.change || "+0%",
          changeType: stats.totalTrips?.changeType || "positive",
          icon: Truck,
          description: "Total trips"
        },
        {
          title: t("totalShops"),
          value: stats.totalShops?.value?.toLocaleString() || "0",
          change: stats.totalShops?.change || "+0%",
          changeType: stats.totalShops?.changeType || "positive",
          icon: DollarSign,
          description: "Total shops"
        }
      ];

      // Transform payment stats for pie chart
      const transformedPaymentStats = [
        { name: 'Paid', value: paymentStatsData?.paid?.count || 0 },
        { name: 'Unpaid', value: paymentStatsData?.unpaid?.count || 0 }
      ];

      // Transform monthly revenue for bar chart
      const transformedMonthlyRevenue = monthlyRevenueData.map(item => ({
        date: item._id,
        revenue: item.dailyRevenue
      }));

      setStatsData(transformedStats);
      setRecentShipments(shipments);
      setPaymentStats(transformedPaymentStats);
      setMonthlyRevenue(transformedMonthlyRevenue);
      setTopCustomers(topCustomersData || []);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  // Format currency
  const formatCurrency = (value) => {
    return `₨ ${value?.toLocaleString() || '0'}`;
  };

  const quickActions = [
    {
      title: t("newShipment"),
      description: "Create a new shipment entry",
      icon: Plus,
      variant: "primary" as const,
      onClick: () => navigate("/shipments")
    },
    {
      title: t("addStaff"),
      description: "Add new staff member",
      icon: UserPlus,
      variant: "default" as const,
      onClick: () => navigate("/staff")
    },
    {
      title: t("viewReports"),
      description: "View business reports",
      icon: FileText,
      variant: "secondary" as const,
      onClick: () => navigate("/reports")
    },
    {
      title: t("manageClients"),
      description: "Manage client database",
      icon: Users,
      variant: "default" as const,
      onClick: () => navigate("/customers")
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "text-green-600 bg-green-100";
      case "unpaid":
        return "text-red-600 bg-red-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "paid":
        return language === 'ur' ? 'ادا شدہ' : 'Paid';
      case "unpaid":
        return language === 'ur' ? 'ادا نہیں ہوا' : 'Unpaid';
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            {t("dashboard")}
          </h1>
          <p className="text-muted-foreground">
            {t("welcomeMessage")}
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 animate-pulse rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            {t("dashboard")}
          </h1>
          <p className="text-red-600">Error loading dashboard: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="mb-10 bg-gradient-to-r from-white to-gray-50 p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 animate-fade-in">
        <div className="flex items-center mb-3">
          <div className="w-1.5 h-8 bg-primary rounded-full mr-3 animate-pulse"></div>
          <h1 className="text-3xl font-bold text-foreground relative">
            {t("dashboard")}
            <div className="absolute -bottom-1 left-0 w-1/3 h-1 bg-primary/20 rounded-full"></div>
          </h1>
        </div>
        <p className="text-muted-foreground pl-5 border-l-2 border-primary/20 ml-1">
          {t("welcomeMessage")}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsData.map((stat, index) => (
          <StatsCard
            key={index}
            title={stat.title}
            value={stat.value}
            change={stat.change}
            changeType={stat.changeType}
            icon={stat.icon}
            description={stat.description}
          />
        ))}
      </div>

      {/* Quick Actions */}
      <div className="mt-10">
        <div className="flex items-center mb-6">
          <div className="w-1 h-6 bg-primary rounded-full mr-3"></div>
          <h2 className="text-2xl font-semibold text-foreground relative group">
            {t("quickActions")}
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full"></span>
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-scale-in">
          {quickActions.map((action, index) => (
            <QuickActionCard
              key={index}
              title={action.title}
              description={action.description}
              icon={action.icon}
              variant={action.variant}
              onClick={action.onClick}
            />
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        {/* Recent Shipments */}
        <Card className="bg-card-light border-border">
          <CardHeader>
            <CardTitle className="text-card-light-foreground flex items-center">
              <Package className="w-5 h-5 mr-2 text-primary" />
              {language === 'ur' ? 'حالیہ شپمنٹس' : 'Recent Shipments'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentShipments.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">
                  {language === 'ur' ? 'کوئی حالیہ شپمنٹ نہیں' : 'No recent shipments'}
                </p>
              ) : (
                recentShipments.map((shipment) => (
                  <div key={shipment.id} className="flex items-center justify-between p-3 bg-card rounded-lg border border-border">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-foreground">{shipment.biltyNumber}</span>
                        <Badge className={getStatusColor(shipment.paymentStatus)}>
                          {getStatusText(shipment.paymentStatus)}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {shipment.senderName} → {shipment.receiverName}
                      </p>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-sm font-medium text-foreground">
                          ₨ {shipment.totalCharges?.toLocaleString() || '0'}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {shipment.createdAt ? new Date(shipment.createdAt).toLocaleDateString() : ''}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Monthly Revenue Chart */}
        <Card className="bg-card-light border-border">
          <CardHeader>
            <CardTitle className="text-card-light-foreground flex items-center">
              <BarChart className="w-5 h-5 mr-2 text-primary" />
              {t("monthlyRevenue")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 w-full rounded-lg border border-border bg-white p-4">
              {monthlyRevenue.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsBarChart
                    data={monthlyRevenue}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis tickFormatter={(value) => `₨${value / 1000}k`} />
                    <Tooltip 
                      formatter={(value) => [`₨${value.toLocaleString()}`, 'Revenue']}
                      labelFormatter={(label) => `Date: ${label}`}
                    />
                    <Legend />
                    <Bar dataKey="revenue" name="Revenue" fill="#8884d8" />
                  </RechartsBarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center">
                  <div className="text-center text-muted-foreground">
                    <BarChart className="mx-auto mb-2 h-12 w-12 opacity-50" />
                    <p>{language === 'ur' ? 'کوئی ڈیٹا دستیاب نہیں' : 'No data available'}</p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Section Split */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        {/* Payment Statistics Pie Chart */}
        <Card className="bg-card-light border-border">
          <CardHeader>
            <CardTitle className="text-card-light-foreground flex items-center">
              <PieChart className="w-5 h-5 mr-2 text-primary" />
              {language === 'ur' ? 'ادائیگی کے اعدادوشمار' : 'Payment Statistics'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 w-full rounded-lg border border-border bg-white p-4">
              {paymentStats && paymentStats.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPieChart>
                    <Pie
                      data={paymentStats}
                      cx="50%"
                      cy="50%"
                      labelLine={true}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      nameKey="name"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {paymentStats.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [value, 'Count']} />
                    <Legend />
                  </RechartsPieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center">
                  <div className="text-center text-muted-foreground">
                    <PieChart className="mx-auto mb-2 h-12 w-12 opacity-50" />
                    <p>{language === 'ur' ? 'کوئی ڈیٹا دستیاب نہیں' : 'No data available'}</p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        {/* Top Customers Chart */}
        <Card className="bg-card-light border-border">
          <CardHeader>
            <CardTitle className="text-card-light-foreground flex items-center">
              <Users className="w-5 h-5 mr-2 text-primary" />
              {language === 'ur' ? 'اہم گاہک' : 'Top Customers'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 w-full rounded-lg border border-border bg-white p-4">
              <div className="flex flex-col h-full">
                <div className="text-sm font-medium mb-2">
                  {language === 'ur' ? 'بقایا رقم کے لحاظ سے اہم گاہک' : 'Top Customers by Outstanding Amount'}
                </div>
                <div className="flex-1 overflow-auto">
                  <div className="grid grid-cols-3 gap-2 text-xs font-medium text-muted-foreground mb-2">
                    <div>{language === 'ur' ? 'نام' : 'Name'}</div>
                    <div>{language === 'ur' ? 'بلٹیاں' : 'Bilties'}</div>
                    <div className="text-right">{language === 'ur' ? 'بقایا رقم' : 'Amount Due'}</div>
                  </div>
                  {topCustomers.length > 0 ? (
                    <div className="space-y-2">
                      {topCustomers.map((customer, index) => (
                        <div key={index} className="grid grid-cols-3 gap-2 p-2 rounded-md bg-gray-50">
                          <div className="font-medium truncate">{customer.name}</div>
                          <div>{customer.biltyCount || 0}</div>
                          <div className="text-right font-medium">
                            {formatCurrency(customer.totalAmountDue)}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex h-32 items-center justify-center text-muted-foreground">
                      {language === 'ur' ? 'کوئی ڈیٹا دستیاب نہیں' : 'No customer data available'}
                    </div>
                  )}
                </div>
                <div className="mt-2 pt-2 border-t text-xs text-center text-muted-foreground">
                  <Button 
                    variant="link" 
                    className="text-xs p-0 h-auto" 
                    onClick={() => navigate('/customers')}
                  >
                    {language === 'ur' ? 'تمام گاہکوں کو دیکھیں' : 'View All Customers'}
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;