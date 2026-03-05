import { useState, useEffect } from "react";
import { Save, User, Key, Mail, Phone, MapPin, Edit2, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/hooks/use-toast";

const Profile = () => {
  const { language } = useLanguage();
  const { toast } = useToast();
  
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    role: "",
    _id: ""
});

const [isProfileLoading, setIsProfileLoading] = useState(true);

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  const [forgotPasswordData, setForgotPasswordData] = useState({
    email: "",
    answer: "",
    newPassword: ""
  });

  // Simulate API call to get user profile
  useEffect(() => {
    // This would typically fetch from your backend
    fetchUserProfile();
  }, []);


  const fetchUserProfile = async () => {
    setIsProfileLoading(true);
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            toast({
                title: language === 'ur' ? "خرابی" : "Error",
                description: language === 'ur' ? "براہ کرم دوبارہ لاگ ان کریں۔" : "Please login again.",
                variant: "destructive"
            });
            return;
        }

        const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/profile`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        const data = await response.json();
        
        if (data.success) {
            setProfile({
                name: data.user.name || "",
                email: data.user.email || "",
                phone: data.user.phone || "",
                address: data.user.address || "",
                role: data.user.role || "User",
                _id: data.user._id || ""
            });
        } else {
            throw new Error(data.message || 'Failed to fetch profile');
        }
    } catch (error) {
        console.error('Profile fetch error:', error);
        toast({
            title: language === 'ur' ? "خرابی" : "Error",
            description: language === 'ur' ? "پروفائل لوڈ نہیں ہو سکا۔" : "Failed to load profile.",
            variant: "destructive"
        });
    } finally {
        setIsProfileLoading(false);
    }
};

const handleUpdateProfile = async () => {
    setIsLoading(true);
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            toast({
                title: language === 'ur' ? "خرابی" : "Error",
                description: language === 'ur' ? "براہ کرم دوبارہ لاگ ان کریں۔" : "Please login again.",
                variant: "destructive"
            });
            return;
        }

        const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/profile`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                name: profile.name,
                email: profile.email,
                phone: profile.phone,
                address: profile.address
            })
        });

        const data = await response.json();

        if (data.success) {
            // Update local profile state with response data
            setProfile(prev => ({
                ...prev,
                ...data.updatedUser
            }));
            
            toast({
                title: language === 'ur' ? "پروفائل اپڈیٹ ہو گیا" : "Profile Updated",
                description: language === 'ur' ? "آپ کی معلومات کامیابی سے اپڈیٹ ہو گئی ہیں۔" : "Your profile information has been updated successfully.",
            });
            setIsEditing(false);
        } else {
            throw new Error(data.message || 'Update failed');
        }
    } catch (error) {
        console.error('Profile update error:', error);
        toast({
            title: language === 'ur' ? "خرابی" : "Error",
            description: language === 'ur' ? "پروفائل اپڈیٹ نہیں ہو سکا۔" : "Failed to update profile.",
            variant: "destructive"
        });
    } finally {
        setIsLoading(false);
    }
};

  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: language === 'ur' ? "خرابی" : "Error",
        description: language === 'ur' ? "نیا پاس ورڈ میچ نہیں کر رہا۔" : "New passwords don't match.",
        variant: "destructive"
      });
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast({
        title: language === 'ur' ? "خرابی" : "Error",
        description: language === 'ur' ? "پاس ورڈ کم از کم 6 حروف کا ہونا چاہیے۔" : "Password must be at least 6 characters long.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      // This would use the updateProfileController with password
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          password: passwordData.newPassword
        })
      });

      if (response.ok) {
        toast({
          title: language === 'ur' ? "پاس ورڈ تبدیل ہو گیا" : "Password Changed",
          description: language === 'ur' ? "آپ کا پاس ورڈ کامیابی سے تبدیل ہو گیا۔" : "Your password has been changed successfully.",
        });
        setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
        setShowPasswordForm(false);
      } else {
        throw new Error('Password change failed');
      }
    } catch (error) {
      toast({
        title: language === 'ur' ? "خرابی" : "Error",
        description: language === 'ur' ? "پاس ورڈ تبدیل نہیں ہو سکا۔" : "Failed to change password.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!forgotPasswordData.email || !forgotPasswordData.answer || !forgotPasswordData.newPassword) {
      toast({
        title: language === 'ur' ? "خرابی" : "Error",
        description: language === 'ur' ? "تمام فیلڈز بھریں۔" : "Please fill all fields.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/ForgetPassword`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(forgotPasswordData)
      });

      if (response.ok) {
        toast({
          title: language === 'ur' ? "پاس ورڈ ری سیٹ ہو گیا" : "Password Reset",
          description: language === 'ur' ? "آپ کا پاس ورڈ کامیابی سے ری سیٹ ہو گیا۔" : "Your password has been reset successfully.",
        });
        setForgotPasswordData({ email: "", answer: "", newPassword: "" });
      } else {
        throw new Error('Password reset failed');
      }
    } catch (error) {
      toast({
        title: language === 'ur' ? "خرابی" : "Error",
        description: language === 'ur' ? "پاس ورڈ ری سیٹ نہیں ہو سکا۔" : "Failed to reset password.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = (key: string, value: string) => {
    setProfile(prev => ({ ...prev, [key]: value }));
  };

  const updatePasswordData = (key: string, value: string) => {
    setPasswordData(prev => ({ ...prev, [key]: value }));
  };

  const updateForgotPasswordData = (key: string, value: string) => {
    setForgotPasswordData(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            {language === 'ur' ? 'پروفائل' : 'Profile'}
          </h1>
          <p className="text-muted-foreground mt-2">
            {language === 'ur' ? 'اپنی پروفائل کی معلومات کا انتظام کریں' : 'Manage your profile information and security settings'}
          </p>
        </div>
        <div className="flex gap-2">
          {!isEditing ? (
            <Button onClick={() => setIsEditing(true)} variant="outline">
              <Edit2 className="w-4 h-4 mr-2" />
              {language === 'ur' ? 'ترمیم کریں' : 'Edit Profile'}
            </Button>
          ) : (
            <>
              <Button onClick={() => setIsEditing(false)} variant="outline">
                {language === 'ur' ? 'منسوخ کریں' : 'Cancel'}
              </Button>
              <Button onClick={handleUpdateProfile} disabled={isLoading} className="bg-gradient-primary text-white">
                <Save className="w-4 h-4 mr-2" />
                {isLoading ? (language === 'ur' ? 'محفوظ ہو رہا...' : 'Saving...') : (language === 'ur' ? 'محفوظ کریں' : 'Save Changes')}
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Profile Information */}
        <Card className="bg-card-light border-border">
          <CardHeader>
            <CardTitle className="text-card-light-foreground flex items-center">
              <User className="w-5 h-5 mr-2 text-primary" />
              {language === 'ur' ? 'بنیادی معلومات' : 'Basic Information'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
          {isProfileLoading ? (
        <div className="space-y-4">
            <div className="animate-pulse">
                <div className="h-4 bg-gray-300 rounded w-1/4 mb-2"></div>
                <div className="h-10 bg-gray-200 rounded"></div>
            </div>
            <div className="animate-pulse">
                <div className="h-4 bg-gray-300 rounded w-1/4 mb-2"></div>
                <div className="h-10 bg-gray-200 rounded"></div>
            </div>
            <div className="animate-pulse">
                <div className="h-4 bg-gray-300 rounded w-1/4 mb-2"></div>
                <div className="h-10 bg-gray-200 rounded"></div>
            </div>
            <div className="animate-pulse">
                <div className="h-4 bg-gray-300 rounded w-1/4 mb-2"></div>
                <div className="h-20 bg-gray-200 rounded"></div>
            </div>
        </div>
    ) : ( <>
           
            <div>
              <Label className="text-card-light-foreground">
                {language === 'ur' ? 'مکمل نام' : 'Full Name'}
              </Label>
              <Input 
                value={profile.name}
                onChange={(e) => updateProfile('name', e.target.value)}
                disabled={!isEditing}
                className="mt-1"
              />
            </div>
            
            <div>
              <Label className="text-card-light-foreground flex items-center">
                <Mail className="w-4 h-4 mr-2" />
                {language === 'ur' ? 'ای میل' : 'Email Address'}
              </Label>
              <Input 
                type="email"
                value={profile.email}
                onChange={(e) => updateProfile('email', e.target.value)}
                disabled={!isEditing}
                className="mt-1"
              />
            </div>
            
            <div>
              <Label className="text-card-light-foreground flex items-center">
                <Phone className="w-4 h-4 mr-2" />
                {language === 'ur' ? 'فون نمبر' : 'Phone Number'}
              </Label>
              <Input 
                value={profile.phone}
                onChange={(e) => updateProfile('phone', e.target.value)}
                disabled={!isEditing}
                className="mt-1"
              />
            </div>
            
            <div>
              <Label className="text-card-light-foreground flex items-center">
                <MapPin className="w-4 h-4 mr-2" />
                {language === 'ur' ? 'پتہ' : 'Address'}
              </Label>
              <Textarea 
                value={profile.address}
                onChange={(e) => updateProfile('address', e.target.value)}
                disabled={!isEditing}
                className="mt-1"
                rows={3}
              />
            </div>
            
            <Separator />
            
            <div>
              <Label className="text-card-light-foreground">
                {language === 'ur' ? 'کردار' : 'Role'}
              </Label>
              <div className="mt-2">
                <Badge className="bg-primary/10 text-primary border-primary/20">
                  {language === 'ur' ? 'ایڈمنسٹریٹر' : profile.role}
                </Badge>
              </div>
            </div>
            </>
            )}
          </CardContent>
        </Card>

        {/* Security Settings */}
        <Card className="bg-card-light border-border">
          <CardHeader>
            <CardTitle className="text-card-light-foreground flex items-center">
              <Shield className="w-5 h-5 mr-2 text-primary" />
              {language === 'ur' ? 'سیکیورٹی سیٹنگز' : 'Security Settings'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Button 
                onClick={() => setShowPasswordForm(!showPasswordForm)} 
                variant="outline" 
                className="w-full"
              >
                <Key className="w-4 h-4 mr-2" />
                {language === 'ur' ? 'پاس ورڈ تبدیل کریں' : 'Change Password'}
              </Button>
            </div>

            {showPasswordForm && (
              <div className="space-y-3 p-4 bg-background rounded-lg border">
                <div>
                  <Label className="text-card-light-foreground text-sm">
                    {language === 'ur' ? 'موجودہ پاس ورڈ' : 'Current Password'}
                  </Label>
                  <Input 
                    type="password"
                    value={passwordData.currentPassword}
                    onChange={(e) => updatePasswordData('currentPassword', e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-card-light-foreground text-sm">
                    {language === 'ur' ? 'نیا پاس ورڈ' : 'New Password'}
                  </Label>
                  <Input 
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(e) => updatePasswordData('newPassword', e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-card-light-foreground text-sm">
                    {language === 'ur' ? 'نیا پاس ورڈ تصدیق' : 'Confirm New Password'}
                  </Label>
                  <Input 
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) => updatePasswordData('confirmPassword', e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div className="flex gap-2">
                  <Button 
                    onClick={handleChangePassword} 
                    disabled={isLoading}
                    size="sm"
                    className="bg-primary text-primary-foreground"
                  >
                    {isLoading ? (language === 'ur' ? 'تبدیل ہو رہا...' : 'Changing...') : (language === 'ur' ? 'تبدیل کریں' : 'Update Password')}
                  </Button>
                  <Button 
                    onClick={() => setShowPasswordForm(false)} 
                    variant="outline" 
                    size="sm"
                  >
                    {language === 'ur' ? 'منسوخ' : 'Cancel'}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Forgot Password */}
        <Card className="bg-card-light border-border lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-card-light-foreground flex items-center">
              <Key className="w-5 h-5 mr-2 text-primary" />
              {language === 'ur' ? 'پاس ورڈ ری سیٹ کریں' : 'Reset Password'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label className="text-card-light-foreground">
                  {language === 'ur' ? 'ای میل' : 'Email'}
                </Label>
                <Input 
                  type="email"
                  placeholder={language === 'ur' ? 'اپنا ای میل درج کریں' : 'Enter your email'}
                  value={forgotPasswordData.email}
                  onChange={(e) => updateForgotPasswordData('email', e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-card-light-foreground">
                  {language === 'ur' ? 'سیکیورٹی جواب' : 'Security Answer'}
                </Label>
                <Input 
                  placeholder={language === 'ur' ? 'سیکیورٹی سوال کا جواب' : 'Security question answer'}
                  value={forgotPasswordData.answer}
                  onChange={(e) => updateForgotPasswordData('answer', e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-card-light-foreground">
                  {language === 'ur' ? 'نیا پاس ورڈ' : 'New Password'}
                </Label>
                <Input 
                  type="password"
                  placeholder={language === 'ur' ? 'نیا پاس ورڈ درج کریں' : 'Enter new password'}
                  value={forgotPasswordData.newPassword}
                  onChange={(e) => updateForgotPasswordData('newPassword', e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>
            <div className="mt-4">
              <Button 
                onClick={handleForgotPassword} 
                disabled={isLoading}
                className="bg-gradient-primary text-white"
              >
                <Key className="w-4 h-4 mr-2" />
                {isLoading ? (language === 'ur' ? 'ری سیٹ ہو رہا...' : 'Resetting...') : (language === 'ur' ? 'پاس ورڈ ری سیٹ کریں' : 'Reset Password')}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Profile;