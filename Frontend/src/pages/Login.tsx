import { useState } from "react";
import { Eye, EyeOff, Mail, Lock, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { authService } from "@/services/shipmentService";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const { language } = useLanguage();
  const { login } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password) {
      setError(language === 'ur' ? 'تمام فیلڈز درج کریں' : 'Please fill all fields');
      return;
    }

    try {
      setLoading(true);
      setError("");
      const response = await authService.login(formData);
      
      if (response.success) {
        // Fix: token and user are directly in response, not in response.data
        console.log('Login successful, response:', response);
        login(response.token, response.user);
        console.log('Navigating to dashboard...');
        navigate('/dashboard');
      }
    } catch (error: any) {
      setError(error.message || (language === 'ur' ? 'لاگ ان میں خرابی' : 'Login failed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-gray-900">
            {language === 'ur' ? 'لاگ ان' : 'Login'}
          </CardTitle>
          <p className="text-gray-600 mt-2">
            {language === 'ur' ? 'اپنے اکاؤنٹ میں لاگ ان کریں' : 'Sign in to your account'}
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
                {error}
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="email">
                {language === 'ur' ? 'ای میل' : 'Email'}
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  placeholder={language === 'ur' ? 'ای میل درج کریں' : 'Enter your email'}
                  className="pl-10"
                  disabled={loading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">
                {language === 'ur' ? 'پاس ورڈ' : 'Password'}
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  placeholder={language === 'ur' ? 'پاس ورڈ درج کریں' : 'Enter your password'}
                  className="pl-10 pr-10"
                  disabled={loading}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loading}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4 text-gray-400" />
                  ) : (
                    <Eye className="w-4 h-4 text-gray-400" />
                  )}
                </Button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-primary  text-white"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {language === 'ur' ? 'لاگ ان ہو رہا ہے...' : 'Signing in...'}
                </>
              ) : (
                language === 'ur' ? 'لاگ ان کریں' : 'Sign In'
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              {language === 'ur' ? 'کارجو لنگو ڈیش بورڈ' : 'Cargo Lingo Dashboard'}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 