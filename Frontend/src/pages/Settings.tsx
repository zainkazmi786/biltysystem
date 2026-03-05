import { useState } from "react";
import { Save, User, Bell, Shield, Globe, Palette, Database, Key, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/hooks/use-toast";

const Settings = () => {
  const { t, language, setLanguage } = useLanguage();
  const { toast } = useToast();
  const [settings, setSettings] = useState({
    // Company Profile
    companyName: "Cargo Pro Logistics",
    companyEmail: "admin@cargopro.com",
    companyPhone: "+92 300 1234567",
    companyAddress: "123 Business District, Karachi, Pakistan",
    
    // User Profile
    userName: "Ahmad Ali Khan",
    userEmail: "ahmad@cargopro.com",
    userPhone: "+92 301 9876543",
    
    // Notifications
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    weeklyReports: true,
    
    // Security
    twoFactorAuth: false,
    sessionTimeout: "30",
    passwordExpiry: "90",
    
    // System
    defaultLanguage: language,
    currency: "PKR",
    timezone: "Asia/Karachi",
    dateFormat: "DD/MM/YYYY",
    
    // Backup
    autoBackup: true,
    backupFrequency: "daily",
    backupRetention: "30"
  });

  const handleSave = () => {
    // Here you would typically save to backend
    toast({
      title: language === 'ur' ? "سیٹنگز محفوظ ہو گئیں" : "Settings Saved",
      description: language === 'ur' ? "آپ کی تبدیلیاں کامیابی سے محفوظ ہو گئی ہیں۔" : "Your changes have been saved successfully.",
    });
  };

  const updateSetting = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            {language === 'ur' ? 'سیٹنگز' : 'Settings'}
          </h1>
          <p className="text-muted-foreground mt-2">
            {language === 'ur' ? 'اپلیکیشن اور اکاؤنٹ کی سیٹنگز کا انتظام' : 'Manage your application and account settings'}
          </p>
        </div>
        <Button onClick={handleSave} className="bg-gradient-primary  text-white">
          <Save className="w-4 h-4 mr-2" />
          {language === 'ur' ? 'تبدیلیاں محفوظ کریں' : 'Save Changes'}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Company Profile */}
        <Card className="bg-card-light border-border">
          <CardHeader>
            <CardTitle className="text-card-light-foreground flex items-center">
              <User className="w-5 h-5 mr-2 text-primary" />
              {language === 'ur' ? 'کمپنی پروفائل' : 'Company Profile'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-card-light-foreground">
                {language === 'ur' ? 'کمپنی کا نام' : 'Company Name'}
              </Label>
              <Input 
                value={settings.companyName}
                onChange={(e) => updateSetting('companyName', e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label className="text-card-light-foreground">
                {language === 'ur' ? 'ای میل' : 'Email'}
              </Label>
              <Input 
                type="email"
                value={settings.companyEmail}
                onChange={(e) => updateSetting('companyEmail', e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label className="text-card-light-foreground">
                {language === 'ur' ? 'فون نمبر' : 'Phone Number'}
              </Label>
              <Input 
                value={settings.companyPhone}
                onChange={(e) => updateSetting('companyPhone', e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label className="text-card-light-foreground">
                {language === 'ur' ? 'پتہ' : 'Address'}
              </Label>
              <Textarea 
                value={settings.companyAddress}
                onChange={(e) => updateSetting('companyAddress', e.target.value)}
                className="mt-1"
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* User Profile */}
        <Card className="bg-card-light border-border">
          <CardHeader>
            <CardTitle className="text-card-light-foreground flex items-center">
              <User className="w-5 h-5 mr-2 text-primary" />
              {language === 'ur' ? 'صارف پروفائل' : 'User Profile'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-card-light-foreground">
                {language === 'ur' ? 'نام' : 'Full Name'}
              </Label>
              <Input 
                value={settings.userName}
                onChange={(e) => updateSetting('userName', e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label className="text-card-light-foreground">
                {language === 'ur' ? 'ای میل' : 'Email'}
              </Label>
              <Input 
                type="email"
                value={settings.userEmail}
                onChange={(e) => updateSetting('userEmail', e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label className="text-card-light-foreground">
                {language === 'ur' ? 'فون نمبر' : 'Phone Number'}
              </Label>
              <Input 
                value={settings.userPhone}
                onChange={(e) => updateSetting('userPhone', e.target.value)}
                className="mt-1"
              />
            </div>
            <Separator />
            <div>
              <Label className="text-card-light-foreground">
                {language === 'ur' ? 'صارف کا کردار' : 'User Role'}
              </Label>
              <div className="mt-2">
                <Badge className="bg-primary/10 text-primary border-primary/20">
                  {language === 'ur' ? 'ایڈمن' : 'Administrator'}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Security */}
        <Card className="bg-card-light border-border">
          <CardHeader>
            <CardTitle className="text-card-light-foreground flex items-center">
              <Shield className="w-5 h-5 mr-2 text-primary" />
              {language === 'ur' ? 'سیکیورٹی' : 'Security'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-card-light-foreground">
                  {language === 'ur' ? 'دو مرحلہ تصدیق' : 'Two-Factor Authentication'}
                </Label>
                <p className="text-xs text-muted-foreground">
                  {language === 'ur' ? 'اضافی سیکیورٹی کے لیے' : 'Extra security layer'}
                </p>
              </div>
              <Switch 
                checked={settings.twoFactorAuth}
                onCheckedChange={(checked) => updateSetting('twoFactorAuth', checked)}
              />
            </div>
            <Separator />
            <div>
              <Label className="text-card-light-foreground">
                {language === 'ur' ? 'سیشن ٹائم آؤٹ (منٹ)' : 'Session Timeout (minutes)'}
              </Label>
              <Select value={settings.sessionTimeout} onValueChange={(value) => updateSetting('sessionTimeout', value)}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="15">15 {language === 'ur' ? 'منٹ' : 'minutes'}</SelectItem>
                  <SelectItem value="30">30 {language === 'ur' ? 'منٹ' : 'minutes'}</SelectItem>
                  <SelectItem value="60">60 {language === 'ur' ? 'منٹ' : 'minutes'}</SelectItem>
                  <SelectItem value="120">120 {language === 'ur' ? 'منٹ' : 'minutes'}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-card-light-foreground">
                {language === 'ur' ? 'پاس ورڈ کی مدت (دن)' : 'Password Expiry (days)'}
              </Label>
              <Select value={settings.passwordExpiry} onValueChange={(value) => updateSetting('passwordExpiry', value)}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="30">30 {language === 'ur' ? 'دن' : 'days'}</SelectItem>
                  <SelectItem value="60">60 {language === 'ur' ? 'دن' : 'days'}</SelectItem>
                  <SelectItem value="90">90 {language === 'ur' ? 'دن' : 'days'}</SelectItem>
                  <SelectItem value="365">365 {language === 'ur' ? 'دن' : 'days'}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card className="bg-card-light border-border">
          <CardHeader>
            <CardTitle className="text-card-light-foreground flex items-center">
              <Bell className="w-5 h-5 mr-2 text-primary" />
              {language === 'ur' ? 'اطلاعات' : 'Notifications'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-card-light-foreground">
                  {language === 'ur' ? 'ای میل اطلاعات' : 'Email Notifications'}
                </Label>
                <p className="text-xs text-muted-foreground">
                  {language === 'ur' ? 'اہم واقعات کے لیے' : 'For important events'}
                </p>
              </div>
              <Switch 
                checked={settings.emailNotifications}
                onCheckedChange={(checked) => updateSetting('emailNotifications', checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-card-light-foreground">
                  {language === 'ur' ? 'SMS اطلاعات' : 'SMS Notifications'}
                </Label>
                <p className="text-xs text-muted-foreground">
                  {language === 'ur' ? 'فوری اطلاعات کے لیے' : 'For urgent alerts'}
                </p>
              </div>
              <Switch 
                checked={settings.smsNotifications}
                onCheckedChange={(checked) => updateSetting('smsNotifications', checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-card-light-foreground">
                  {language === 'ur' ? 'پش اطلاعات' : 'Push Notifications'}
                </Label>
                <p className="text-xs text-muted-foreground">
                  {language === 'ur' ? 'براؤزر میں' : 'In browser'}
                </p>
              </div>
              <Switch 
                checked={settings.pushNotifications}
                onCheckedChange={(checked) => updateSetting('pushNotifications', checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-card-light-foreground">
                  {language === 'ur' ? 'ہفتہ وار رپورٹس' : 'Weekly Reports'}
                </Label>
                <p className="text-xs text-muted-foreground">
                  {language === 'ur' ? 'کارکردگی کا خلاصہ' : 'Performance summary'}
                </p>
              </div>
              <Switch 
                checked={settings.weeklyReports}
                onCheckedChange={(checked) => updateSetting('weeklyReports', checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* System Preferences */}
        <Card className="bg-card-light border-border">
          <CardHeader>
            <CardTitle className="text-card-light-foreground flex items-center">
              <Globe className="w-5 h-5 mr-2 text-primary" />
              {language === 'ur' ? 'سسٹم ترجیحات' : 'System Preferences'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-card-light-foreground">
                {language === 'ur' ? 'ڈیفالٹ زبان' : 'Default Language'}
              </Label>
              <Select value={settings.defaultLanguage} onValueChange={(value) => {
                updateSetting('defaultLanguage', value);
                setLanguage(value as 'en' | 'ur');
              }}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="ur">اردو</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-card-light-foreground">
                {language === 'ur' ? 'کرنسی' : 'Currency'}
              </Label>
              <Select value={settings.currency} onValueChange={(value) => updateSetting('currency', value)}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PKR">PKR (₨)</SelectItem>
                  <SelectItem value="USD">USD ($)</SelectItem>
                  <SelectItem value="EUR">EUR (€)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-card-light-foreground">
                {language === 'ur' ? 'وقت کا علاقہ' : 'Timezone'}
              </Label>
              <Select value={settings.timezone} onValueChange={(value) => updateSetting('timezone', value)}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Asia/Karachi">Pakistan (GMT+5)</SelectItem>
                  <SelectItem value="UTC">UTC (GMT+0)</SelectItem>
                  <SelectItem value="America/New_York">Eastern Time (GMT-5)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-card-light-foreground">
                {language === 'ur' ? 'تاریخ کا فارمیٹ' : 'Date Format'}
              </Label>
              <Select value={settings.dateFormat} onValueChange={(value) => updateSetting('dateFormat', value)}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                  <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                  <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Backup Settings */}
        <Card className="bg-card-light border-border">
          <CardHeader>
            <CardTitle className="text-card-light-foreground flex items-center">
              <Database className="w-5 h-5 mr-2 text-primary" />
              {language === 'ur' ? 'بیک اپ سیٹنگز' : 'Backup Settings'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-card-light-foreground">
                  {language === 'ur' ? 'خودکار بیک اپ' : 'Automatic Backup'}
                </Label>
                <p className="text-xs text-muted-foreground">
                  {language === 'ur' ? 'ڈیٹا کی حفاظت کے لیے' : 'For data protection'}
                </p>
              </div>
              <Switch 
                checked={settings.autoBackup}
                onCheckedChange={(checked) => updateSetting('autoBackup', checked)}
              />
            </div>
            <div>
              <Label className="text-card-light-foreground">
                {language === 'ur' ? 'بیک اپ کی تعدد' : 'Backup Frequency'}
              </Label>
              <Select value={settings.backupFrequency} onValueChange={(value) => updateSetting('backupFrequency', value)}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">{language === 'ur' ? 'روزانہ' : 'Daily'}</SelectItem>
                  <SelectItem value="weekly">{language === 'ur' ? 'ہفتہ وار' : 'Weekly'}</SelectItem>
                  <SelectItem value="monthly">{language === 'ur' ? 'ماہانہ' : 'Monthly'}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-card-light-foreground">
                {language === 'ur' ? 'بیک اپ محفوظ رکھنے کی مدت (دن)' : 'Backup Retention (days)'}
              </Label>
              <Select value={settings.backupRetention} onValueChange={(value) => updateSetting('backupRetention', value)}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">7 {language === 'ur' ? 'دن' : 'days'}</SelectItem>
                  <SelectItem value="30">30 {language === 'ur' ? 'دن' : 'days'}</SelectItem>
                  <SelectItem value="90">90 {language === 'ur' ? 'دن' : 'days'}</SelectItem>
                  <SelectItem value="365">365 {language === 'ur' ? 'دن' : 'days'}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Separator />
            <Button variant="outline" className="w-full">
              <Database className="w-4 h-4 mr-2" />
              {language === 'ur' ? 'اب بیک اپ بنائیں' : 'Create Backup Now'}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Settings;