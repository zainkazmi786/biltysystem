import { useState, useEffect } from "react";
import { Plus, Search, Edit, Trash2, User, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useLanguage } from "@/contexts/LanguageContext";
import { toast } from "sonner";
import axios from "axios";

interface StaffData {
  _id: string;
  name: string;
  designation: string;
  wage: number;
  phone: string;
  address: string;
  image?: string;
  status: 'active' | 'inactive';
  joinDate: string;
}

export default function StaffManagement() {
  const { t, language } = useLanguage();
  const [staffMembers, setStaffMembers] = useState<StaffData[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentStaff, setCurrentStaff] = useState<StaffData | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Form state
  const [formData, setFormData] = useState<Omit<StaffData, '_id' | 'joinDate'>>({
    name: "",
    designation: "",
    wage: 0,
    phone: "",
    address: "",
    status: "active"
  });

  // API configuration
  const API_URL = `${import.meta.env.VITE_API_URL}/staff`;
  const axiosInstance = axios.create({
    baseURL: API_URL,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token")}`
    }
  });

  // Fetch staff data
  const fetchStaff = async () => {
    try {
      setIsLoading(true);
      const response = await axiosInstance.get("/");
      setStaffMembers(response.data);
    } catch (error) {
      toast.error(language === 'ur' ? 'ڈیٹا لوڈ کرنے میں ناکام' : 'Failed to load data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  const handleOpenDialog = (staff: StaffData | null = null) => {
    if (staff) {
      setCurrentStaff(staff);
      setFormData({
        name: staff.name,
        designation: staff.designation,
        wage: staff.wage,
        phone: staff.phone,
        address: staff.address,
        status: staff.status
      });
    } else {
      setCurrentStaff(null);
      setFormData({
        name: "",
        designation: "",
        wage: 0,
        phone: "",
        address: "",
        status: "active"
      });
    }
    setIsDialogOpen(true);
    setImageFile(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsLoading(true);
      const formDataToSend = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        formDataToSend.append(key, value.toString());
      });
      
      if (imageFile) {
        formDataToSend.append('image', imageFile);
      }

      let response;
      if (currentStaff) {
        // Update staff
        response = await axiosInstance.put(`/${currentStaff._id}`, formDataToSend, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        toast.success(language === 'ur' ? 'عملہ کامیابی سے اپ ڈیٹ ہو گیا' : 'Staff updated successfully');
      } else {
        // Create new staff
        response = await axiosInstance.post("/", formDataToSend, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        toast.success(language === 'ur' ? 'عملہ کامیابی سے شامل ہو گیا' : 'Staff added successfully');
      }

      fetchStaff(); // Refresh the list
      setIsDialogOpen(false);
    } catch (error) {
      toast.error(language === 'ur' ? 'خرابی پیدا ہوئی' : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      setIsLoading(true);
      await axiosInstance.delete(`/${id}`);
      toast.success(language === 'ur' ? 'عملہ کامیابی سے حذف ہو گیا' : 'Staff deleted successfully');
      fetchStaff(); // Refresh the list
    } catch (error) {
      toast.error(language === 'ur' ? 'خرابی پیدا ہوئی' : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredStaff = staffMembers.filter(staff =>
    staff.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    staff.designation.toLowerCase().includes(searchTerm.toLowerCase()) ||
    staff.phone.includes(searchTerm)
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {language === 'ur' ? 'عملہ انتظام' : 'Staff Management'}
          </h1>
          <p className="text-gray-600 mt-1">
            {language === 'ur' ? 'اپنے عملہ کا انتظام کریں' : 'Manage your staff members'}
          </p>
        </div>
        <Button 
          onClick={() => handleOpenDialog()}
          className="bg-gradient-primary  text-white"
          disabled={isLoading}
        >
          <Plus className="w-4 h-4 mr-2" />
          {language === 'ur' ? 'نیا عملہ' : 'New Staff'}
        </Button>
      </div>

      {/* Search */}
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

      {/* Staff Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            {language === 'ur' ? 'عملہ کی فہرست' : 'Staff List'}
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
                  <TableHead>{language === 'ur' ? 'نام' : 'Name'}</TableHead>
                  <TableHead>{language === 'ur' ? 'عہدہ' : 'Designation'}</TableHead>
                  <TableHead>{language === 'ur' ? 'تنخواہ' : 'Wage'}</TableHead>
                  <TableHead>{language === 'ur' ? 'فون' : 'Phone'}</TableHead>
                  <TableHead>{language === 'ur' ? 'حیثیت' : 'Status'}</TableHead>
                  <TableHead>{language === 'ur' ? 'عمل' : 'Actions'}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStaff.map((staff) => (
                  <TableRow key={staff._id}>
                    <TableCell className="font-medium flex items-center">
                      {staff.image && (
                        <img 
                          src={`${import.meta.env.VITE_API_URL}${staff.image}`} 
                          alt={staff.name}
                          className="w-10 h-10 rounded-full mr-3 object-cover"
                        />
                      )}
                      {staff.name}
                    </TableCell>
                    <TableCell>{staff.designation}</TableCell>
                    <TableCell>₨{staff.wage.toLocaleString()}</TableCell>
                    <TableCell>{staff.phone}</TableCell>
                    <TableCell>
                      <Badge className={staff.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                        {language === 'ur' 
                          ? (staff.status === 'active' ? 'فعال' : 'غیر فعال')
                          : staff.status
                        }
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button 
                          size="sm" 
                          variant="ghost"
                          onClick={() => handleOpenDialog(staff)}
                          disabled={isLoading}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="ghost"
                          onClick={() => handleDelete(staff._id)}
                          disabled={isLoading}
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

      {/* Add/Edit Staff Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {currentStaff 
                ? (language === 'ur' ? 'عملہ کو اپ ڈیٹ کریں' : 'Update Staff')
                : (language === 'ur' ? 'نیا عملہ شامل کریں' : 'Add New Staff')
              }
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">
                  {language === 'ur' ? 'نام' : 'Name'} *
                </Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  disabled={isLoading}
                />
              </div>
              <div>
                <Label htmlFor="designation">
                  {language === 'ur' ? 'عہدہ' : 'Designation'} *
                </Label>
                <Input
                  id="designation"
                  name="designation"
                  value={formData.designation}
                  onChange={handleInputChange}
                  required
                  disabled={isLoading}
                />
              </div>
              <div>
                <Label htmlFor="wage">
                  {language === 'ur' ? 'تنخواہ' : 'Wage'} *
                </Label>
                <Input
                  id="wage"
                  name="wage"
                  type="number"
                  value={formData.wage}
                  onChange={handleInputChange}
                  required
                  disabled={isLoading}
                />
              </div>
              <div>
                <Label htmlFor="phone">
                  {language === 'ur' ? 'فون نمبر' : 'Phone Number'} *
                </Label>
                <Input
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                  disabled={isLoading}
                />
              </div>
              <div>
                <Label htmlFor="status">
                  {language === 'ur' ? 'حیثیت' : 'Status'} *
                </Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => handleSelectChange('status', value)}
                  disabled={isLoading}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">{language === 'ur' ? 'فعال' : 'Active'}</SelectItem>
                    <SelectItem value="inactive">{language === 'ur' ? 'غیر فعال' : 'Inactive'}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="image">
                  {language === 'ur' ? 'تصویر' : 'Image'}
                </Label>
                <div className="flex items-center gap-4">
                  <Label
                    htmlFor="image-upload"
                    className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
                  >
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Upload className="w-8 h-8 mb-3 text-gray-400" />
                      <p className="mb-2 text-sm text-gray-500">
                        <span className="font-semibold">{language === 'ur' ? 'تصویر اپ لوڈ کریں' : 'Upload image'}</span>
                      </p>
                      <p className="text-xs text-gray-500">
                        {language === 'ur' ? 'PNG, JPG, JPEG' : 'PNG, JPG, JPEG'}
                      </p>
                    </div>
                    <Input
                      id="image-upload"
                      type="file"
                      className="hidden"
                      onChange={handleFileChange}
                      accept="image/*"
                      disabled={isLoading}
                    />
                  </Label>
                </div>
              </div>
            </div>
            <div>
              <Label htmlFor="address">
                {language === 'ur' ? 'پتہ' : 'Address'} *
              </Label>
              <Textarea
                id="address"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                required
                disabled={isLoading}
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                disabled={isLoading}
              >
                {language === 'ur' ? 'منسوخ کریں' : 'Cancel'}
              </Button>
              <Button
                type="submit"
                className="bg-gradient-primary  text-white"
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {currentStaff 
                      ? (language === 'ur' ? 'اپ ڈیٹ ہو رہا ہے...' : 'Updating...')
                      : (language === 'ur' ? 'شامل ہو رہا ہے...' : 'Adding...')
                    }
                  </span>
                ) : (
                  currentStaff 
                    ? (language === 'ur' ? 'اپ ڈیٹ کریں' : 'Update')
                    : (language === 'ur' ? 'شامل کریں' : 'Add')
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}