import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Download, Eye } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  getClaims,
  createClaim,
  deleteClaim,
  downloadDocument,
  Claim as ApiClaim
} from "@/services/claimsApi";

interface ClaimData extends ApiClaim {
  id: string;
}

const claimsTranslations = {
  en: {
    title: "Claims Management",
    description: "Manage and track all claims and disputes",
    addClaim: "Add New Claim",
    searchPlaceholder: "Search claims...",
    biltyNumber: "Bilty Number",
    claimDate: "Claim Date",
    solvingDate: "Solving Date",
    solvingDuration: "Solving Duration (days)",
    amount: "Amount",
    numberOfInstallments: "Number of Installments",
    relatedDocument: "Related Document",
    description: "Description",
    status: "Status",
    actions: "Actions",
    submit: "Submit",
    cancel: "Cancel",
    view: "View",
    download: "Download",
    pending: "Pending",
    inProgress: "In Progress",
    resolved: "Resolved",
    rejected: "Rejected",
    noClaims: "No claims found",
    addClaimDialog: "Add New Claim",
    addClaimDescription: "Enter the details for the new claim",
    fileUpload: "Upload Document",
    selectFile: "Select a file",
    noFileSelected: "No file selected",
  },
  ur: {
    title: "دعووں کا انتظام",
    description: "تمام دعووں اور تنازعات کا انتظام اور ٹریکنگ",
    addClaim: "نیا دعویٰ شامل کریں",
    searchPlaceholder: "دعوے تلاش کریں...",
    biltyNumber: "بلٹی نمبر",
    claimDate: "دعویٰ کی تاریخ",
    solvingDate: "حل کی تاریخ",
    solvingDuration: "حل کی مدت (دن)",
    amount: "رقم",
    numberOfInstallments: "قسطوں کی تعداد",
    relatedDocument: "متعلقہ دستاویز",
    description: "تفصیل",
    status: "حیثیت",
    actions: "اعمال",
    submit: "جمع کریں",
    cancel: "منسوخ کریں",
    view: "دیکھیں",
    download: "ڈاؤن لوڈ کریں",
    pending: "زیر التوا",
    inProgress: "جاری ہے",
    resolved: "حل شدہ",
    rejected: "مسترد",
    noClaims: "کوئی دعویٰ نہیں ملا",
    addClaimDialog: "نیا دعویٰ شامل کریں",
    addClaimDescription: "نئے دعویٰ کی تفصیلات درج کریں",
    fileUpload: "دستاویز اپ لوڈ کریں",
    selectFile: "فائل منتخب کریں",
    noFileSelected: "کوئی فائل منتخب نہیں",
  },
};

export default function Claims() {
  const { language } = useLanguage();
  const [claims, setClaims] = useState<ClaimData[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedClaim, setSelectedClaim] = useState<ClaimData | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    biltyNumber: "",
    claimDate: "",
    solvingDate: "",
    solvingDuration: "",
    amount: "",
    numberOfInstallments: "",
    relatedDocument: "",
    description: "",
  });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Fetch claims
  useEffect(() => {
    const fetchClaims = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const claimsData = await getClaims(searchTerm);
        setClaims(claimsData.map(claim => ({ ...claim, id: claim._id })));
      } catch (err) {
        setError('Failed to load claims. Please try again later.');
        console.error('Error fetching claims:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchClaims();
  }, [searchTerm]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setFormData(prev => ({ ...prev, relatedDocument: file.name }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsLoading(true);
      const formDataObj = new FormData();
      formDataObj.append('biltyNumber', formData.biltyNumber);
      formDataObj.append('claimDate', formData.claimDate);
      formDataObj.append('amount', formData.amount);
      formDataObj.append('numberOfInstallments', formData.numberOfInstallments);
      if (formData.solvingDate) formDataObj.append('solvingDate', formData.solvingDate);
      if (formData.solvingDuration) formDataObj.append('solvingDuration', formData.solvingDuration);
      if (formData.description) formDataObj.append('description', formData.description);
      if (selectedFile) formDataObj.append('document', selectedFile);

      const newClaim = await createClaim(formDataObj);
      
      setClaims(prev => [{
        ...newClaim,
        id: newClaim._id
      }, ...prev]);
      
      // Reset form
      setFormData({
        biltyNumber: "",
        claimDate: "",
        solvingDate: "",
        solvingDuration: "",
        amount: "",
        numberOfInstallments: "",
        relatedDocument: "",
        description: "",
      });
      setSelectedFile(null);
      setIsAddDialogOpen(false);
    } catch (err) {
      setError('Failed to create claim. Please check your input and try again.');
      console.error('Error creating claim:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      setIsLoading(true);
      await deleteClaim(id);
      setClaims(prev => prev.filter(claim => claim.id !== id));
    } catch (err) {
      setError('Failed to delete claim. Please try again.');
      console.error('Error deleting claim:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = async (documentName: string, claimId: string) => {
    try {
      const blob = await downloadDocument(claimId);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', documentName);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      setError('Failed to download document. It may have been deleted.');
      console.error('Error downloading document:', err);
    }
  };

  const filteredClaims = claims.filter(claim =>
    claim.biltyNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    claim.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-yellow-100 text-yellow-800";
      case "in-progress": return "bg-blue-100 text-blue-800";
      case "resolved": return "bg-green-100 text-green-800";
      case "rejected": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const translations = claimsTranslations[language];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {translations.title}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {translations.description}
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              {translations.addClaim}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{translations.addClaimDialog}</DialogTitle>
              <DialogDescription>{translations.addClaimDescription}</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="biltyNumber">{translations.biltyNumber}</Label>
                  <Input
                    id="biltyNumber"
                    value={formData.biltyNumber}
                    onChange={(e) => handleInputChange("biltyNumber", e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="claimDate">{translations.claimDate}</Label>
                  <Input
                    id="claimDate"
                    type="date"
                    value={formData.claimDate}
                    onChange={(e) => handleInputChange("claimDate", e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="solvingDate">{translations.solvingDate}</Label>
                  <Input
                    id="solvingDate"
                    type="date"
                    value={formData.solvingDate}
                    onChange={(e) => handleInputChange("solvingDate", e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="solvingDuration">{translations.solvingDuration}</Label>
                  <Input
                    id="solvingDuration"
                    type="number"
                    value={formData.solvingDuration}
                    onChange={(e) => handleInputChange("solvingDuration", e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="amount">{translations.amount}</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    value={formData.amount}
                    onChange={(e) => handleInputChange("amount", e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="numberOfInstallments">{translations.numberOfInstallments}</Label>
                  <Input
                    id="numberOfInstallments"
                    type="number"
                    min="1"
                    value={formData.numberOfInstallments}
                    onChange={(e) => handleInputChange("numberOfInstallments", e.target.value)}
                    required
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="relatedDocument">{translations.relatedDocument}</Label>
                <Input
                  id="relatedDocument"
                  type="file"
                  onChange={handleFileChange}
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                />
                {selectedFile && (
                  <p className="text-sm text-gray-600 mt-1">
                    {translations.selectFile}: {selectedFile.name}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="description">{translations.description}</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  rows={3}
                />
              </div>
              {error && (
                <div className="text-red-500 text-sm">{error}</div>
              )}
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsAddDialogOpen(false)}
                  disabled={isLoading}
                >
                  {translations.cancel}
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Processing..." : translations.submit}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search and Claims Table */}
      <Card>
        <CardHeader>
          <CardTitle>{translations.title}</CardTitle>
          <CardDescription>{translations.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder={translations.searchPlaceholder}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          ) : error ? (
            <div className="text-center py-8 text-red-500">
              {error}
            </div>
          ) : filteredClaims.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {translations.noClaims}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{translations.biltyNumber}</TableHead>
                  <TableHead>{translations.claimDate}</TableHead>
                  <TableHead>{translations.amount}</TableHead>
                  <TableHead>{translations.status}</TableHead>
                  <TableHead>{translations.actions}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredClaims.map((claim) => (
                  <TableRow key={claim.id}>
                    <TableCell className="font-medium">{claim.biltyNumber}</TableCell>
                    <TableCell>{new Date(claim.claimDate).toLocaleDateString()}</TableCell>
                    <TableCell>${claim.amount.toLocaleString()}</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(claim.status)}>
                        {translations[claim.status as keyof typeof translations]}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedClaim(claim);
                            setIsViewDialogOpen(true);
                          }}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        {claim.relatedDocument && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleDownload(claim.relatedDocument, claim.id)}
                          >
                            <Download className="w-4 h-4" />
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(claim.id)}
                          disabled={isLoading}
                        >
                          Delete
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

      {/* View Claim Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{translations.title}</DialogTitle>
            <DialogDescription>{translations.description}</DialogDescription>
          </DialogHeader>
          {selectedClaim && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="font-medium">{translations.biltyNumber}</Label>
                  <p className="text-sm text-gray-600">{selectedClaim.biltyNumber}</p>
                </div>
                <div>
                  <Label className="font-medium">{translations.claimDate}</Label>
                  <p className="text-sm text-gray-600">
                    {new Date(selectedClaim.claimDate).toLocaleDateString()}
                  </p>
                </div>
                {selectedClaim.solvingDate && (
                  <div>
                    <Label className="font-medium">{translations.solvingDate}</Label>
                    <p className="text-sm text-gray-600">
                      {new Date(selectedClaim.solvingDate).toLocaleDateString()}
                    </p>
                  </div>
                )}
                {selectedClaim.solvingDuration && (
                  <div>
                    <Label className="font-medium">{translations.solvingDuration}</Label>
                    <p className="text-sm text-gray-600">{selectedClaim.solvingDuration} days</p>
                  </div>
                )}
                <div>
                  <Label className="font-medium">{translations.amount}</Label>
                  <p className="text-sm text-gray-600">${selectedClaim.amount.toLocaleString()}</p>
                </div>
                <div>
                  <Label className="font-medium">{translations.numberOfInstallments}</Label>
                  <p className="text-sm text-gray-600">{selectedClaim.numberOfInstallments}</p>
                </div>
                <div>
                  <Label className="font-medium">{translations.status}</Label>
                  <Badge className={getStatusColor(selectedClaim.status)}>
                    {translations[selectedClaim.status as keyof typeof translations]}
                  </Badge>
                </div>
                {selectedClaim.relatedDocument && (
                  <div>
                    <Label className="font-medium">{translations.relatedDocument}</Label>
                    <p className="text-sm text-gray-600">{selectedClaim.relatedDocument}</p>
                  </div>
                )}
              </div>
              {selectedClaim.description && (
                <div>
                  <Label className="font-medium">{translations.description}</Label>
                  <p className="text-sm text-gray-600">{selectedClaim.description}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}