import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { OnboardingService } from "../services/onboardingService";
import type { CompanyFormData, UploadedDoc, NpwpVerifiedData } from "../types";

export const useOnboardingViewModel = () => {
  const navigate = useNavigate();
  const [slide, setSlide] = useState(1);
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [companies, setCompanies] = useState<any[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<any>(null);

  const [formData, setFormData] = useState<CompanyFormData>({
    company_name: "",
    tax_id: "",
    email: "",
    phone: "",
    type: "buyer",
    industry_type: "",
    about: "",
    region: "",
    provincy_country: "Indonesia",
    regency: "",
    city: "",
    zip_code: "",
    address: "",
    bank_name: "",
    bank_account: "",
    bank_account_name: "",
  });

  const [isVerifyingNpwp, setIsVerifyingNpwp] = useState(false);
  const [npwpVerifiedData, setNpwpVerifiedData] = useState<NpwpVerifiedData | null>(null);
  const [uploadedDocs, setUploadedDocs] = useState<UploadedDoc[]>([]);
  const [isUploadingDoc, setIsUploadingDoc] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  useEffect(() => {
    const session = localStorage.getItem("user_session");
    if (!session) { navigate("/login"); return; }
    const u = JSON.parse(session);
    setUser(u);
    setFormData(prev => ({ ...prev, email: u.email || "", phone: u.whatsapp || "" }));
  }, [navigate]);

  const updateField = (k: keyof CompanyFormData, v: string) => 
    setFormData(prev => ({ ...prev, [k]: v }));

  const handleVerifyNpwp = async () => {
    const rawNpwp = formData.tax_id.replace(/[^\d]/g, "");
    if (rawNpwp.length !== 15 && rawNpwp.length !== 16) {
      setError("Please enter a valid 15 or 16 digit NPWP number.");
      return;
    }

    const formattedNpwp = rawNpwp.length === 15 ? "0" + rawNpwp : rawNpwp;
    setIsVerifyingNpwp(true);
    setError(null);

    try {
      const res = await OnboardingService.verifyNpwp(formattedNpwp);
      if (res.status === 1 && res.data) {
        setNpwpVerifiedData(res.data);
        setFormData(prev => ({
          ...prev,
          company_name: prev.company_name || res.data.nama,
          address: prev.address || res.data.alamat,
          region: prev.region || res.data.region || "",
          provincy_country: prev.provincy_country || res.data.provincy_country || "",
          city: prev.city || res.data.city || "",
          regency: prev.regency || res.data.regency || "",
          zip_code: prev.zip_code || res.data.zip_code || "",
          bank_name: prev.bank_name || res.data.bank_name || "",
          bank_account: prev.bank_account || res.data.bank_account || "",
          bank_account_name: prev.bank_account_name || res.data.bank_account_name || "",
          industry_type: prev.industry_type || res.data.industry_type || "",
          phone: prev.phone || res.data.phone || "",
          email: prev.email || res.data.email || "",
        }));
      } else {
        setError(res.message || "NPWP verification failed.");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsVerifyingNpwp(false);
    }
  };

  const handleDocUpload = async (file: File, docType: string) => {
    setIsUploadingDoc(true);
    try {
      const fd = new FormData();
      fd.append("document", file);
      const res = await OnboardingService.uploadDocument(fd);
      setUploadedDocs(prev => [...prev, {
        name: file.name,
        type: docType,
        file_path: res.file_path,
        url: res.url,
        localName: file.name,
      }]);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsUploadingDoc(false);
    }
  };

  const handleCompanySubmit = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const payload = {
        ...formData,
        name: formData.company_name,
        user_id: user?.id,
        documents: uploadedDocs.map(d => ({
          name: d.type,
          type: d.type,
          file_path: d.file_path,
        })),
      };

      const res = await OnboardingService.registerCompany(payload);
      const company = res.company || res;

      if (selectedFile && company.id) {
        const fd = new FormData();
        fd.append("company_id", String(company.id));
        fd.append("csv", selectedFile);
        if (formData.type === "buyer") {
          await OnboardingService.importHistoricalPo(fd);
        } else {
          await OnboardingService.importCatalogue(fd);
        }
      }

      const data = await OnboardingService.getMyCompanies(user.id);
      setCompanies(data.companies || [company]);
      setSelectedCompany(data.companies?.[0] || company);
      setSlide(6);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    slide, setSlide,
    formData, updateField,
    isLoading, error, setError,
    isVerifyingNpwp, npwpVerifiedData, handleVerifyNpwp,
    uploadedDocs, setUploadedDocs, isUploadingDoc, handleDocUpload,
    selectedFile, setSelectedFile,
    companies, selectedCompany, setSelectedCompany,
    handleCompanySubmit,
    user
  };
};
