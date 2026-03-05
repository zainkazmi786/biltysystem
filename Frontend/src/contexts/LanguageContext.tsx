import React, { createContext, useContext, useState, ReactNode } from 'react';

type Language = 'en' | 'ur';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const translations = {
  en: {
    // App Info
    appName: "Cargo Pro",
    appTagline: "Logistics Management",
    
    // Navigation
    dashboard: "Dashboard",
    shipments: "Shipments",
    staff: "Staff",
    trips: "Trips",
    shopManagement: "Shop Management",
    reports: "Reports",
    settings: "Settings",
    
    // Top Bar
    searchPlaceholder: "Search shipments, clients...",
    myAccount: "My Account",
    profile: "Profile",
    logout: "Logout",
    notifications: "Notifications",
    language: "Language",
    
    // Dashboard
    welcomeMessage: "Welcome back! Here's your business overview",
    totalShipments: "Total Shipments",
    pendingShipments: "Pending",
    inTransitShipments: "In Transit", 
    deliveredShipments: "Delivered",
    totalReceipts: "Total Receipts",
    outstandingPayments: "Outstanding Payments",
    monthlyRevenue: "Monthly Revenue",
    quickActions: "Quick Actions",
    
    // Quick Actions
    newShipment: "New Shipment",
    addStaff: "Add Staff",
    viewReports: "View Reports",
    manageClients: "Manage Clients",
    
    // Shipment Status
    statusPending: "Pending",
    statusInTransit: "In Transit",
    statusDelivered: "Delivered",
    statusCancelled: "Cancelled",
    statusReturned: "Returned",
    
    // Form Labels
    trackingNumber: "Tracking Number",
    customerName: "Customer Name",
    destination: "Destination",
    origin: "Origin",
    weight: "Weight",
    dimensions: "Dimensions",
    shippingDate: "Shipping Date",
    deliveryDate: "Delivery Date",
    cost: "Cost",
    description: "Description",
    
    // Actions
    create: "Create",
    update: "Update",
    view: "View",
    edit: "Edit",
    delete: "Delete",
    save: "Save",
    cancel: "Cancel",
    confirm: "Confirm",
    close: "Close",
    submit: "Submit",
    reset: "Reset",
    
    // Messages
    loading: "Loading...",
    noData: "No data available",
    error: "An error occurred",
    success: "Operation completed successfully",
    warning: "Warning",
    info: "Information",
    
    // Time
    today: "Today",
    yesterday: "Yesterday",
    thisWeek: "This Week",
    thisMonth: "This Month",
    lastMonth: "Last Month",
    thisYear: "This Year",
    
    // Units
    kg: "kg",
    lbs: "lbs",
    cm: "cm",
    inches: "inches",
    km: "km",
    miles: "miles",
    
    // Currency
    currency: "USD",
    amount: "Amount",
    total: "Total",
    subtotal: "Subtotal",
    tax: "Tax",
    discount: "Discount",
    
    // Common
    yes: "Yes",
    no: "No",
    ok: "OK",
    back: "Back",
    next: "Next",
    previous: "Previous",
    first: "First",
    last: "Last",
    search: "Search",
    filter: "Filter",
    sort: "Sort",
    export: "Export",
    import: "Import",
    download: "Download",
    upload: "Upload",
    print: "Print",
    share: "Share",
    copy: "Copy",
    paste: "Paste",
    select: "Select",
    selectAll: "Select All",
    clear: "Clear",
    refresh: "Refresh",
    reload: "Reload",
  },
  ur: {
    // App Info
    appName: "کارگو پرو",
    appTagline: "لاجسٹکس منیجمنٹ",
    
    // Navigation
    dashboard: "ڈیش بورڈ",
    shipments: "بلٹیاں",
    staff: "سٹاف",
    trips: "ٹرپ",
    shopManagement: "شاپ مینجمنٹ",
    reports: "رپورٹس",
    settings: "سیٹنگز",
    
    // Top Bar
    searchPlaceholder: "بلٹیاں، کلائنٹس تلاش کریں...",
    myAccount: "میرا اکاؤنٹ",
    profile: "پروفائل",
    logout: "لاگ آؤٹ",
    notifications: "نوٹیفیکیشنز",
    language: "زبان",
    
    // Dashboard
    welcomeMessage: "خوش آمدید! یہ آپ کے کاروبار کا جائزہ ہے",
    totalShipments: "کل بلٹیاں",
    pendingShipments: "زیر التواء",
    inTransitShipments: "راستے میں",
    deliveredShipments: "ڈلیور شدہ",
    totalReceipts: "کل واؤچرز",
    outstandingPayments: "باقی ادائیگیاں",
    monthlyRevenue: "ماہانہ آمدن",
    quickActions: "فوری اعمال",
    
    // Quick Actions
    newShipment: "نئی بلٹی بنائیں",
    addStaff: "سٹاف شامل کریں",
    viewReports: "رپورٹس دیکھیں",
    manageClients: "کلائنٹس کا انتظام",
    
    // Shipment Status
    statusPending: "زیر التواء",
    statusInTransit: "راستے میں",
    statusDelivered: "ڈلیور شدہ",
    statusCancelled: "منسوخ",
    statusReturned: "واپس",
    
    // Form Labels
    trackingNumber: "ٹریکنگ نمبر",
    customerName: "گاہک کا نام",
    destination: "منزل",
    origin: "مقام شروع",
    weight: "وزن",
    dimensions: "پیمائش",
    shippingDate: "شپنگ کی تاریخ",
    deliveryDate: "ڈلیوری کی تاریخ",
    cost: "لاگت",
    description: "تفصیل",
    
    // Actions
    create: "بنائیں",
    update: "اپڈیٹ کریں",
    view: "دیکھیں",
    edit: "تبدیل کریں",
    delete: "حذف کریں",
    save: "محفوظ کریں",
    cancel: "منسوخ کریں",
    confirm: "تصدیق کریں",
    close: "بند کریں",
    submit: "جمع کریں",
    reset: "ری سیٹ کریں",
    
    // Messages
    loading: "لوڈ ہو رہا ہے...",
    noData: "کوئی ڈیٹا دستیاب نہیں",
    error: "ایک خرابی پیش آئی",
    success: "آپریشن کامیابی سے مکمل ہوا",
    warning: "انتباہ",
    info: "معلومات",
    
    // Time
    today: "آج",
    yesterday: "کل",
    thisWeek: "اس ہفتے",
    thisMonth: "اس مہینے",
    lastMonth: "پچھلے مہینے",
    thisYear: "اس سال",
    
    // Units
    kg: "کلوگرام",
    lbs: "پاؤنڈ",
    cm: "سینٹی میٹر",
    inches: "انچ",
    km: "کلومیٹر",
    miles: "میل",
    
    // Currency
    currency: "روپے",
    amount: "رقم",
    total: "کل",
    subtotal: "ذیلی کل",
    tax: "ٹیکس",
    discount: "رعایت",
    
    // Common
    yes: "ہاں",
    no: "نہیں",
    ok: "ٹھیک ہے",
    back: "واپس",
    next: "اگلا",
    previous: "پچھلا",
    first: "پہلا",
    last: "آخری",
    search: "تلاش",
    filter: "فلٹر",
    sort: "ترتیب",
    export: "برآمد",
    import: "درآمد",
    download: "ڈاؤن لوڈ",
    upload: "اپ لوڈ",
    print: "پرنٹ",
    share: "شیئر",
    copy: "کاپی",
    paste: "پیسٹ",
    select: "منتخب کریں",
    selectAll: "سب منتخب کریں",
    clear: "صاف کریں",
    refresh: "ریفریش",
    reload: "دوبارہ لوڈ",
  }
};

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>('en');

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations['en']] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      <div className={language === 'ur' ? 'rtl' : 'ltr'} dir={language === 'ur' ? 'rtl' : 'ltr'}>
        {children}
      </div>
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}